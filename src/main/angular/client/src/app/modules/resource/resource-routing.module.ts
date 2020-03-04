import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ResourceComponent} from './resource.component';

const routes: Routes = [
  {
    path: '',
    component: ResourceComponent,
    children: [
      {
        path: 'agent_cluster', loadChildren: () => import('./agent-cluster/agent-cluster.module').then(m => m.AgentClusterModule),
        data: {breadcrumb: 'label.agentClusters'}
      },
      {
        path: 'agent_job_execution',
        loadChildren: () => import('./agent-job-execution/agent-job-execution.module').then(m => m.AgentJobExecutionModule),
        data: {breadcrumb: 'label.agentJobExecution'}
      },
      {path: 'lock', loadChildren: () => import('./lock/lock.module').then(m => m.LockModule), data: {breadcrumb: 'label.locks'}},
      {
        path: 'process_class',
        loadChildren: () => import('./process-class/process-class.module').then(m => m.ProcessClassModule),
        data: {breadcrumb: 'label.processClasses'}
      },
      {
        path: 'calendar',
        loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule),
        data: {breadcrumb: 'label.calendars'}
      },
      {
        path: 'documentation',
        loadChildren: () => import('./documentation/documentation.module').then(m => m.DocumentationModule),
        data: {breadcrumb: 'label.documentations'}
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceRoutingModule {
}
