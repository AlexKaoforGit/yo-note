import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';

const routes: Routes = [{ path: '', component: Login }];

@NgModule({
  imports: [RouterModule.forChild(routes), Login],
  exports: [RouterModule],
})
export class AuthModule {}
