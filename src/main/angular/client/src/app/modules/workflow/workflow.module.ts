import { NgModule } from '@angular/core';
import { WorkflowComponent } from './workflow.component';
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [WorkflowComponent]
})
export class WorkflowModule { }
