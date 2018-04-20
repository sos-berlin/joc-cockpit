import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './components/guard';

const routes: Routes = [
    {
        path: '',
        loadChildren: './modules/layout/layout.module#LayoutModule',
        canActivate: [AuthGuard]
    },
    { path: 'login', loadChildren: './modules/login/login.module#LoginModule' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
