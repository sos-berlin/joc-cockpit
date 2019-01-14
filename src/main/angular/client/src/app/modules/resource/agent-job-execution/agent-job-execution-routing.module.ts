import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AgentJobExecutionComponent} from './agent-job-execution.component';

const routes: Routes = [
  {
    path: '', component: AgentJobExecutionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentJobExecutionRoutingModule {
}
