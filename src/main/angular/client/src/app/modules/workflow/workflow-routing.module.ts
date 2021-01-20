import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SingleWorkflowComponent, WorkflowComponent} from './workflow.component';
import {WorkflowDetailComponent} from './workflow-detail/workflow-detail.component';

const routes: Routes = [
  {
    path: '', component: WorkflowComponent
  }, {
    path: 'workflow',
    component: SingleWorkflowComponent,
    data: {breadcrumb: 'breadcrumb.label.workflow'}
  }, {
    path: 'workflow_detail/:path/:versionId', component: WorkflowDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {
}
