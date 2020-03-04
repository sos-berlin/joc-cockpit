import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {LogComponent} from '../log/log.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {UserComponent} from '../user/user.component';
import {ErrorComponent} from '../error/error.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {path: 'dashboard', component: DashboardComponent, data: {breadcrumb: 'label.dashboard'}},
      {
        path: 'daily_plan',
        loadChildren: () => import('./../daily-plan/daily-plan.module').then(m => m.DailyPlanModule),
        data: {breadcrumb: 'label.dailyPlan'}
      },
      {
        path: 'configuration',
        loadChildren: () => import('./../configuration/configuration.module').then(m => m.ConfigurationModule),
        data: {breadcrumb: 'label.configuration'}
      },
      {
        path: 'job',
        loadChildren: () => import('./../job/job.module').then(m => m.JobModule),
        data: {breadcrumb: 'label.job'}
      },
      {
        path: 'workflow',
        loadChildren: () => import('./../workflow/workflow.module').then(m => m.WorkflowModule),
        data: {breadcrumb: 'label.workflow'}
      },
      {
        path: 'history',
        loadChildren: () => import('./../history/history.module').then(m => m.HistoryModule),
        data: {breadcrumb: 'label.history'}
      },
      {
        path: 'file_transfer',
        loadChildren: () => import('./../file-transfer/file-transfer.module').then(m => m.FileTransferModule),
        data: {breadcrumb: 'label.fileTransfers'}
      },
      {
        path: 'audit_log',
        loadChildren: () => import('./../audit-log/audit-log.module').then(m => m.AuditLogModule),
        data: {breadcrumb: 'label.auditLog'}
      },
      {
        path: 'resources',
        loadChildren: () => import('./../resource/resource.module').then(m => m.ResourceModule)
      },
      {
        path: 'masters',
        loadChildren: () => import('./../masters/masters.module').then(m => m.MastersModule),
        data: {breadcrumb: 'label.manageMasters'}
      },
      {path: 'user', component: UserComponent, data: {breadcrumb: 'label.userProfile'}},
      {path: 'error', component: ErrorComponent},
      {path: 'log', component: LogComponent, data: {breadcrumb: 'label.log'}},
      {
        path: 'users',
        loadChildren: () => import('./../admin/admin.module').then(m => m.AdminModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {
}

