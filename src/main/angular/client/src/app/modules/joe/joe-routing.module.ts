import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {JoeComponent} from './joe.component';

const routes: Routes = [
  {
    path: '', component: JoeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JoeRoutingModule {
}
