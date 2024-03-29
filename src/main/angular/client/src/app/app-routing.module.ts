import {NgModule} from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {AuthGuard} from './components/guard';
import {LoginComponent} from './modules/login/login.component';
import {SignupCompleteComponent} from "./modules/signup-complete/signup-complete.component";

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'email_verify',
    component: SignupCompleteComponent
  },
  {
    path: '',
    loadChildren: () => import('./modules/layout/layout.module').then(m => m.LayoutModule),
    canActivate: [AuthGuard]
  },
  {
    path: '404',
    loadChildren: () => import('./modules/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
  },
  {path: '**', redirectTo: '/404'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
