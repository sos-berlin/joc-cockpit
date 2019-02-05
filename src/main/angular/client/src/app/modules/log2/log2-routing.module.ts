import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Log2Component} from './log2.component';

const routes: Routes = [
  {
    path: '', component: Log2Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Log2RoutingModule {
}
