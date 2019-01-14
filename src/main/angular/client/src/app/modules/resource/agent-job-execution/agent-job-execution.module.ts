import {NgModule} from '@angular/core';
import {AgentJobExecutionComponent} from './agent-job-execution.component';
import {SharedModule} from '../../shared/shared.module';
import {AgentJobExecutionRoutingModule} from './agent-job-execution-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AgentJobExecutionRoutingModule
  ],
  declarations: [AgentJobExecutionComponent]
})
export class AgentJobExecutionModule {
}
