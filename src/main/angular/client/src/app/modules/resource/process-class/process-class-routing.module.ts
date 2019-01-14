import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ProcessClassComponent} from './process-class.component';

const routes: Routes = [
  {
    path: '', component: ProcessClassComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessClassRoutingModule {
}
