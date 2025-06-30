import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface Todo {
  id?: string;
  title: string;
  content: string;
  tagIds: string[];
  priority: '高' | '中' | '低';
  isDone: boolean;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  getTodos(userId: string): Observable<Todo[]> {
    const todosRef = collection(this.firestore, 'todos');
    const q = query(
      todosRef,
      where('userId', '==', userId),
      where('isDone', '==', false),
      orderBy('priority', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Todo[]>;
  }

  addTodo(todo: Todo) {
    const todosRef = collection(this.firestore, 'todos');
    return addDoc(todosRef, todo);
  }

  updateTodo(id: string, data: Partial<Todo>) {
    const todoDoc = doc(this.firestore, 'todos', id);
    return updateDoc(todoDoc, data);
  }

  deleteTodo(id: string) {
    const todoDoc = doc(this.firestore, 'todos', id);
    return deleteDoc(todoDoc);
  }
}
