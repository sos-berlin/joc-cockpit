import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {LogComponent} from '../log/log.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {path: 'dashboard', loadChildren: './../dashboard/dashboard.module#DashboardModule'},
      {path: 'daily_plan', loadChildren: './../daily-plan/daily-plan.module#DailyPlanModule'},
      {path: 'joe', loadChildren: './../joe/joe.module#JoeModule'},
      {path: 'job', loadChildren: './../job/job.module#JobModule'},
      {path: 'workflow', loadChildren: './../workflow/workflow.module#WorkflowModule'},
      {path: 'history', loadChildren: './../history/history.module#HistoryModule'},
      {path: 'file_transfer', loadChildren: './../file-transfer/file-transfer.module#FileTransferModule'},
      {path: 'audit_log', loadChildren: './../audit-log/audit-log.module#AuditLogModule'},
      {path: 'resources', loadChildren: './../resource/resource.module#ResourceModule'},
      {path: 'user', loadChildren: './../user/user.module#UserModule'},
      {path: 'error', loadChildren: './../error/error.module#ErrorModule'},
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

