import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ResourceComponent} from './resource.component';

const routes: Routes = [
  {
    path: '',
    component: ResourceComponent,
    children: [
      {path: 'agent_cluster', loadChildren: './agent-cluster/agent-cluster.module#AgentClusterModule'},
      {path: 'agent_job_execution', loadChildren: './agent-job-execution/agent-job-execution.module#AgentJobExecutionModule'},
      {path: 'lock', loadChildren: './lock/lock.module#LockModule'},
      {path: 'process_class', loadChildren: './process-class/process-class.module#ProcessClassModule'},
      {path: 'calendar', loadChildren: './calendar/calendar.module#CalendarModule'},
      {path: 'documentation', loadChildren: './documentation/documentation.module#DocumentationModule'},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceRoutingModule {
}
