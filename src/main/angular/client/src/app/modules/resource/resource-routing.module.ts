import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ResourceComponent} from './resource.component';
import {AgentClusterComponent} from './agent-cluster/agent-cluster.component';
import {AgentJobExecutionComponent} from './agent-job-execution/agent-job-execution.component';
import {LockComponent} from './lock/lock.component';
import {ProcessClassComponent} from './process-class/process-class.component';
import {CalendarComponent} from './calendar/calendar.component';

const routes: Routes = [
  {
    path: '',
    component: ResourceComponent,
    children: [
      {path: 'agent_cluster', component: AgentClusterComponent},
      {path: 'agent_job_execution', component: AgentJobExecutionComponent},
      {path: 'lock', component: LockComponent},
      {path: 'process_class', component: ProcessClassComponent},
      {path: 'calendar', component: CalendarComponent},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceRoutingModule {
}
