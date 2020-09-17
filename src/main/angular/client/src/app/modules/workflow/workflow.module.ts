import { NgModule } from '@angular/core';
import {AddOrderModalComponent, FilterModalComponent, SearchComponent, WorkflowComponent} from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';
import {WorkflowService} from '../../services/workflow.service';

@NgModule({
    imports: [
        SharedModule,
        WorkflowRoutingModule
    ],
    providers: [WorkflowService],
    declarations: [WorkflowComponent, FilterModalComponent, AddOrderModalComponent, SearchComponent],
    entryComponents: [
        FilterModalComponent,
      AddOrderModalComponent
    ]
})
export class WorkflowModule { }
