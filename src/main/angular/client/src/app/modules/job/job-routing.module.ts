import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {JobComponent} from './job.component';

const routes: Routes = [
  {
    path: '', component: JobComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobRoutingModule {
}
