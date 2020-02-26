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
      {path: 'dashboard', component: DashboardComponent},
      {path: 'daily_plan', loadChildren: './../daily-plan/daily-plan.module#DailyPlanModule'},
      {path: 'configuration', loadChildren: './../configuration/configuration.module#ConfigurationModule'},
      {path: 'job', loadChildren: './../job/job.module#JobModule'},
      {path: 'workflow', loadChildren: './../workflow/workflow.module#WorkflowModule'},
      {path: 'history', loadChildren: './../history/history.module#HistoryModule'},
      {path: 'file_transfer', loadChildren: './../file-transfer/file-transfer.module#FileTransferModule'},
      {path: 'audit_log', loadChildren: './../audit-log/audit-log.module#AuditLogModule'},
      {path: 'resources', loadChildren: './../resource/resource.module#ResourceModule'},
      {path: 'user', component: UserComponent},
      {path: 'error', component: ErrorComponent},
      {path: 'log', component: LogComponent},
      {path: 'users', loadChildren: './../admin/admin.module#AdminModule'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {
}

