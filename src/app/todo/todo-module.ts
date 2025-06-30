import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoList } from './todo-list/todo-list';

const routes: Routes = [{ path: '', component: TodoList }];

@NgModule({
  imports: [RouterModule.forChild(routes), TodoList],
  exports: [RouterModule],
})
export class TodoModule {}
