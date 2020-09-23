import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SingleWorkflowComponent, WorkflowComponent} from './workflow.component';

const routes: Routes = [
  {
    path: '', component: WorkflowComponent
  }, {
    path: 'workflow',
    component: SingleWorkflowComponent,
    data: {breadcrumb: 'breadcrumb.label.workflow'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {
}
