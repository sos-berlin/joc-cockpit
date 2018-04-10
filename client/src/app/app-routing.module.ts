import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { AuthGuard } from './components/guard';

const routes: Routes = [
    {
        path: '',
        loadChildren: './modules/layout/layout.module#LayoutModule',
        canActivate: [AuthGuard]
    },
    { path: 'login', loadChildren: './modules/login/login.module#LoginModule' }
];
const config: ExtraOptions = {
  useHash: true,
};


@NgModule({
    imports: [RouterModule.forRoot(routes,config)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
