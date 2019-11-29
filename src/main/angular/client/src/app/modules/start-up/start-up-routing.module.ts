import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {StartUpComponent} from './start-up.component';


const routes: Routes = [
    { path: '', component: StartUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartUpRoutingModule { }
