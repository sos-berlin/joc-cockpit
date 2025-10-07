import {NgModule} from '@angular/core';
import {AgentJobExecutionComponent, FilterModalComponent, SearchComponent} from './agent-job-execution.component';
import {SharedModule} from '../../shared/shared.module';
import {AgentJobExecutionRoutingModule} from './agent-job-execution-routing.module';
import {ResourceSharedModule} from '../resource-shared.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
    imports: [
        SharedModule,
        ResourceSharedModule,
        AgentJobExecutionRoutingModule,
        NzTooltipDirective
    ],
  declarations: [AgentJobExecutionComponent, FilterModalComponent, SearchComponent]
})
export class AgentJobExecutionModule {
}
