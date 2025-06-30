import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../todo.service';
import { TagService, Tag } from '../tag.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.scss',
  imports: [CommonModule, FormsModule],
})
export class TodoForm implements OnInit {
  @Input() todo: Todo | null = null;
  @Output() saved = new EventEmitter<void>();

  content = '';
  tagId: string = '';
  priority: '高' | '中' | '低' = '中';
  tags: Tag[] = [];
  newTagName = '';
  newTagColor = '#1976d2';
  userId = '';
  title = '';

  constructor(
    private todoService: TodoService,
    private tagService: TagService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid;
        this.loadTags();
      }
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
    } else {
      this.title = '';
      this.content = '';
      this.tagId = '';
      this.priority = '中';
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

  save() {
    this.auth.onAuthStateChanged((user) => {
      if (!user) return;
      if (this.todo && this.todo.id) {
        this.todoService
          .updateTodo(this.todo.id, {
            title: this.title,
            content: this.content,
            tagIds: this.tagId ? [this.tagId] : [],
            priority: this.priority,
          })
          .then(() => this.saved.emit());
      } else {
        const newTodo: Todo = {
          title: this.title,
          content: this.content,
          tagIds: this.tagId ? [this.tagId] : [],
          priority: this.priority,
          isDone: false,
          userId: user.uid,
        };
        this.todoService.addTodo(newTodo).then(() => this.saved.emit());
      }
    });
  }
}
