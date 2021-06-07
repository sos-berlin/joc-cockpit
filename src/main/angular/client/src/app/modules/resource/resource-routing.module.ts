import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ResourceComponent} from './resource.component';

const routes: Routes = [
  {
    path: '',
    component: ResourceComponent,
    children: [
      {
        path: 'agents',
        loadChildren: () => import('./agent/agent.module').then(m => m.AgentModule),
        data: {breadcrumb: 'breadcrumb.label.agents'}
      },
      {
        path: 'agent_job_executions',
        loadChildren: () => import('./agent-job-execution/agent-job-execution.module').then(m => m.AgentJobExecutionModule),
        data: {breadcrumb: 'breadcrumb.label.agentJobExecutions'}
      },
      {
        path: 'locks',
        loadChildren: () => import('./lock/lock.module').then(m => m.LockModule),
        data: {breadcrumb: 'breadcrumb.label.locks'}},
      {
        path: 'calendars',
        loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule),
        data: {breadcrumb: 'breadcrumb.label.calendars'}
      },
      {
        path: 'documentations',
        loadChildren: () => import('./documentation/documentation.module').then(m => m.DocumentationModule),
        data: {breadcrumb: 'breadcrumb.label.documentations'}
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceRoutingModule {
}
