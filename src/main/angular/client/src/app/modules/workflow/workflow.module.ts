import { NgModule } from '@angular/core';
import {TypeComponent, WorkflowComponent} from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';

@NgModule({
  imports: [
    SharedModule,
    WorkflowRoutingModule
  ],
  declarations: [WorkflowComponent, TypeComponent]
})
export class WorkflowModule { }
