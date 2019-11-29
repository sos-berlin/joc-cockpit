import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './components/guard';
import {LoginComponent} from './modules/login/login.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: './modules/login/login.module#LoginModule'
  },
  {
    path: '',
    loadChildren: './modules/layout/layout.module#LayoutModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'start-up',
    loadChildren: './modules/start-up/start-up.module#StartUpModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'log2',
    loadChildren: './modules/log2/log2.module#Log2Module',
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
