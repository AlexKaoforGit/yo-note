import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../todo.service';
import { TagService, Tag } from '../tag.service';
import { Auth } from '@angular/fire/auth';
import { TodoForm } from '../todo-form/todo-form';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss',
  providers: [TodoService],
  imports: [CommonModule, FormsModule, TodoForm, MatIconModule],
})
export class TodoList implements OnInit {
  todos: Todo[] = [];
  tags: Tag[] = [];
  userId: string = '';
  editingTodo: Todo | null = null;
  openedTodoId: string | null = null;

  constructor(
    private todoService: TodoService,
    private tagService: TagService,
    private auth: Auth,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      this.ngZone.run(() => {
        if (user) {
          this.userId = user.uid;
          this.todoService.getTodos(this.userId).subscribe((todos) => {
            // 依優先度排序（高>中>低）
            this.todos = todos.sort(
              (a, b) =>
                this.priorityValue(b.priority) - this.priorityValue(a.priority)
            );
          });
          this.tagService.getTags(this.userId).subscribe((tags) => {
            this.tags = tags;
          });
        }
      });
    });
  }

  getTagName(tagId: string): string {
    return this.tags.find((t) => t.id === tagId)?.name || '';
  }

  getTagColor(tagId: string): string {
    return this.tags.find((t) => t.id === tagId)?.color || '#e0e7ff';
  }

  priorityValue(priority: string): number {
    if (priority === '高') return 3;
    if (priority === '中') return 2;
    return 1;
  }

  markDone(todo: Todo) {
    if (!window.confirm('確定要將此記事標記為完成嗎？')) return;
    this.todoService.updateTodo(todo.id!, { isDone: true }).then();
  }

  deleteTodo(todo: Todo) {
    if (!window.confirm('確定要刪除這個記事嗎？')) return;
    this.todoService.deleteTodo(todo.id!).then();
  }

  editTodo(todo: Todo) {
    this.editingTodo = { ...todo };
    // 等待 DOM 更新後滾動到表單
    setTimeout(() => {
      this.scrollToForm();
    }, 100);
  }

  addNewTodo() {
    this.editingTodo = {
      title: '',
      content: '',
      tagIds: [],
      priority: '中',
      isDone: false,
      userId: this.userId,
    };
    // 等待 DOM 更新後滾動到表單
    setTimeout(() => {
      this.scrollToForm();
    }, 100);
  }

  onEditSaved() {
    this.editingTodo = null;
  }

  onEditCancelled() {
    this.editingTodo = null;
  }

  private scrollToForm() {
    const formElement = document.getElementById('todo-form-section');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      // 額外向下滾動一些距離
      setTimeout(() => {
        window.scrollBy(0, 100);
      }, 300);
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['login']);
    });
  }

  getTags(tagIds: string[]) {
    if (!this.tags) return [];
    return this.tags.filter((tag) => tag.id && tagIds.includes(tag.id!));
  }

  toggleDetail(todo: Todo) {
    const id = todo.id ?? null;
    this.openedTodoId = this.openedTodoId === id ? null : id;
  }

  get openedTodo(): Todo | undefined {
    return this.todos.find((t) => t.id === this.openedTodoId);
  }
}
