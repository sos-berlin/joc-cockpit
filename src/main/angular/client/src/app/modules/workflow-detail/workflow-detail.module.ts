import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {WorkflowService} from '../../services/workflow.service';
import {WorkflowDetailRoutingModule} from './workflow-detail-routing.module';
import {WorkflowDetailComponent} from './workflow-detail.component';

@NgModule({
  imports: [
    SharedModule,
    WorkflowDetailRoutingModule
  ],
   providers: [WorkflowService],
  declarations: [WorkflowDetailComponent]
})
export class WorkflowDetailModule { }
