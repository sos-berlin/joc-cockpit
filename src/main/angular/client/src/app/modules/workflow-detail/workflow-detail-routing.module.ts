import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {WorkflowDetailComponent} from './workflow-detail.component';

const routes: Routes = [
  {
    path: '', component: WorkflowDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowDetailRoutingModule {
}
