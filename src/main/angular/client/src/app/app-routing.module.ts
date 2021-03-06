import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './modules/login/login.component';
import {AuthGuard} from './components/guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    loadChildren: () => import('./modules/layout/layout.module').then(m => m.LayoutModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'log2',
    loadChildren: () => import('./modules/log2/log2.module').then(m => m.Log2Module),
    canActivate: [AuthGuard]
  },
  {path: '404', loadChildren: () => import('./modules/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)},
  {path: '**', redirectTo: '/404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
