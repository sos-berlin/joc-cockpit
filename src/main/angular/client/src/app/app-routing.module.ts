import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './components/guard';
import {LoginComponent} from './modules/login/login.component';

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
    path: 'start-up',
    loadChildren: () => import('./modules/start-up/start-up.module').then(m => m.StartUpModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'log2',
    loadChildren: () => import('./modules/log2/log2.module').then(m => m.Log2Module),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
