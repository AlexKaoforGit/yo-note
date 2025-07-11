import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../todo.service';
import { TagService, Tag } from '../tag.service';
import { Auth } from '@angular/fire/auth';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { inject, NgZone } from '@angular/core';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.scss',
  imports: [CommonModule, FormsModule],
})
export class TodoForm implements OnInit {
  @Input() todo: Todo | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  content = '';
  tagId: string = '';
  priority: '高' | '中' | '低' = '中';
  tags: Tag[] = [];
  newTagName = '';
  newTagColor = '#1976d2';
  userId = '';
  title = '';

  // 錄音相關屬性
  isRecording = false;
  audioUrl: string | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  constructor(
    private todoService: TodoService,
    private tagService: TagService,
    private auth: Auth,
    private storage: Storage, // 使用 AngularFire 的 Storage 服務
    private ngZone: NgZone, // 用於處理 Firebase API 的上下文問題
    private cdr: ChangeDetectorRef // 用於手動觸發變更檢測
  ) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      this.ngZone.run(() => {
        if (user) {
          this.userId = user.uid;
          this.loadTags();
        }
      });
    });
  }

  ngOnChanges() {
    if (this.todo) {
      this.title = this.todo.title || '';
      this.content = this.todo.content;
      this.tagId =
        this.todo.tagIds && this.todo.tagIds.length > 0
          ? this.todo.tagIds[0]
          : '';
      this.priority = this.todo.priority;
      this.audioUrl = this.todo.audioUrl || null;
    } else {
      this.title = '';
      this.content = '';
      this.tagId = '';
      this.priority = '中';
      this.audioUrl = null;
    }
  }

  loadTags() {
    this.tagService.getTags(this.userId).subscribe((tags) => {
      this.tags = tags;
    });
  }

  addTag() {
    if (!this.newTagName.trim()) return;
    const tag: Tag = {
      name: this.newTagName.trim(),
      userId: this.userId,
      color: this.newTagColor,
    };
    this.tagService.addTag(tag).then(() => {
      this.newTagName = '';
      this.newTagColor = '#1976d2';
      this.loadTags();
    });
  }

  toggleTag(tagId: string | undefined) {
    if (!tagId) return;
    if (this.tagId === tagId) {
      this.tagId = '';
    } else {
      this.tagId = tagId;
    }
  }

  deleteTag(tagId: string | undefined) {
    if (!tagId) return;
    this.tagService.deleteTag(tagId).then(() => {
      if (this.tagId === tagId) this.tagId = '';
      this.loadTags();
    });
  }

  // 錄音功能方法
  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        console.log('數據可用:', event.data.size); // 添加日誌
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        console.log('錄音停止，音檔片段數量:', this.audioChunks.length); // 添加日誌
        if (this.audioChunks.length > 0) {
          await this.uploadAudioToFirebase();
        } else {
          console.warn('錄音停止時音檔資料為空');
        }
      };

      // 每秒收集一次數據
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      console.log('開始錄音'); // 添加日誌
    } catch (error) {
      console.error('無法開始錄音:', error);
      alert('無法開始錄音，請確保允許麥克風權限');
    }
  }

  async stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      console.log('停止錄音'); // 添加日誌
      this.mediaRecorder.stop();
      this.isRecording = false;
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }
    }
  }

  private async uploadAudioToFirebase() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp4' });
    console.log('音檔 Blob:', audioBlob, '大小:', audioBlob.size); // 新增日誌

    // 使用用戶 ID 和時間戳記創建檔案路徑
    const fileName = `${this.userId}_${Date.now()}.webm`;
    const storageRef = ref(this.storage, `audio/${fileName}`);
    console.log('Storage 路徑:', storageRef); // 新增日誌

    try {
      // 確保在注入上下文中執行 Firebase API
      await this.ngZone.runOutsideAngular(async () => {
        const snapshot = await uploadBytes(storageRef, audioBlob);
        console.log('上傳成功:', snapshot); // 新增日誌

        this.ngZone.run(async () => {
          this.audioUrl = await getDownloadURL(snapshot.ref);
          console.log('下載 URL:', this.audioUrl); // 新增日誌
          this.cdr.detectChanges(); // 手動觸發變更檢測
        });
      });
    } catch (error) {
      console.error('上傳音檔失敗:', error);
      alert('上傳音檔失敗，請稍後再試');
    }
  }

  async deleteAudio() {
    if (!this.audioUrl) return;

    try {
      // 如果是 Firebase Storage 的 URL，從 Storage 中刪除檔案
      if (this.audioUrl.includes('firebase')) {
        // 從完整的 URL 中提取檔案路徑
        const url = new URL(this.audioUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        if (pathMatch) {
          const filePath = decodeURIComponent(pathMatch[1]);
          const storageRef = ref(this.storage, filePath);
          await deleteObject(storageRef);
          console.log('Storage 中的音檔已刪除');
        }
      }

      // 如果是編輯模式且有 todo.id，同時更新 Firestore
      if (this.todo?.id) {
        await this.todoService.updateTodo(this.todo.id, { audioUrl: null });
        console.log('Firestore 中的 audioUrl 已清除');
      }

      // 清除本地 audioUrl
      if (this.audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.audioUrl);
      }
      this.audioUrl = null;
      this.audioChunks = [];

      console.log('錄音已刪除');
    } catch (error) {
      console.error('刪除錄音失敗:', error);
      // 即使 Storage 刪除失敗，仍然清除本地引用
      if (this.audioUrl && this.audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.audioUrl);
      }
      this.audioUrl = null;
      this.audioChunks = [];
      alert('刪除錄音時發生錯誤，但本地引用已清除');
    }
  }

  save() {
    if (!window.confirm('確定要儲存這次編輯嗎？')) return;

    this.ngZone.run(() => {
      this.auth.onAuthStateChanged((user) => {
        if (!user) return;
        if (this.todo && this.todo.id) {
          // 準備更新資料
          const updateData: Partial<Todo> = {
            title: this.title,
            content: this.content,
            tagIds: this.tagId ? [this.tagId] : [],
            priority: this.priority,
            audioUrl: this.audioUrl || null, // 明確設定為 null 以清除欄位
          };

          this.todoService
            .updateTodo(this.todo.id, updateData)
            .then(() => this.saved.emit());
        } else {
          // 準備新增資料
          const newTodo: Partial<Todo> = {
            title: this.title,
            content: this.content,
            tagIds: this.tagId ? [this.tagId] : [],
            priority: this.priority,
            isDone: false,
            userId: user.uid,
            audioUrl: this.audioUrl || null, // 明確設定為 null
          };

          this.todoService
            .addTodo(newTodo as Todo)
            .then(() => this.saved.emit());
        }
      });
    });
  }

  cancel() {
    if (this.hasUnsavedChanges()) {
      if (window.confirm('您有未儲存的變更，確定要取消嗎？')) {
        this.resetForm();
        this.cancelled.emit();
      }
    } else {
      this.cancelled.emit();
    }
  }

  private hasUnsavedChanges(): boolean {
    if (this.todo) {
      // 編輯模式：檢查是否有變更
      return (
        this.title !== (this.todo.title || '') ||
        this.content !== this.todo.content ||
        this.tagId !==
          (this.todo.tagIds && this.todo.tagIds.length > 0
            ? this.todo.tagIds[0]
            : '') ||
        this.priority !== this.todo.priority ||
        this.audioUrl !== (this.todo.audioUrl || null)
      );
    } else {
      // 新增模式：檢查是否有任何內容
      return !!(this.title || this.content || this.tagId || this.audioUrl);
    }
  }

  private resetForm() {
    this.title = '';
    this.content = '';
    this.tagId = '';
    this.priority = '中';
    this.deleteAudio();
  }
}
