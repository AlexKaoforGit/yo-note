import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoList } from './todo-list/todo-list';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [{ path: '', component: TodoList }];

@NgModule({
  imports: [RouterModule.forChild(routes), TodoList, MatIconModule],
  exports: [RouterModule],
})
export class TodoModule {}
