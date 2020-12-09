import {NgModule} from '@angular/core';
import {FilterModalComponent, SearchComponent, SingleWorkflowComponent, WorkflowComponent} from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';
import {WorkflowService} from '../../services/workflow.service';
import {AddOrderModalComponent, WorkflowActionComponent} from './workflow-action/workflow-action.component';
import {WorkflowDetailComponent} from './workflow-detail/workflow-detail.component';
import {WorkflowHistoryComponent, WorkflowTemplateComponent} from './workflow-history/workflow-history.component';

@NgModule({
  imports: [
    SharedModule,
    WorkflowRoutingModule
  ],
  providers: [WorkflowService],
  declarations: [WorkflowComponent, WorkflowDetailComponent, WorkflowHistoryComponent, WorkflowTemplateComponent, SingleWorkflowComponent, FilterModalComponent, AddOrderModalComponent, SearchComponent, WorkflowActionComponent],
  entryComponents: [
    FilterModalComponent,
    AddOrderModalComponent
  ]
})
export class WorkflowModule {
}
