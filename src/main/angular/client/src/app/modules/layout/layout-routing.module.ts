import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {LogComponent} from '../log/log.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {UserComponent} from '../user/user.component';
import {ErrorComponent} from '../error/error.component';
import {AuthGuard} from '../../components/guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {path: 'dashboard', component: DashboardComponent, data: {breadcrumb: 'breadcrumb.label.dashboard'}},
      {
        path: 'start-up',
        loadChildren: () => import('./../start-up/start-up.module').then(m => m.StartUpModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'daily_plan',
        loadChildren: () => import('./../daily-plan/daily-plan.module').then(m => m.DailyPlanModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.dailyPlan'}
      },
      {
        path: 'configuration',
        loadChildren: () => import('./../configuration/configuration.module').then(m => m.ConfigurationModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'job',
        loadChildren: () => import('./../job/job.module').then(m => m.JobModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.jobs'}
      },
      {
        path: 'workflow',
        loadChildren: () => import('./../workflow/workflow.module').then(m => m.WorkflowModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.workflows'}
      },
      {
        path: 'workflow_detail',
        loadChildren: () => import('./../workflow-detail/workflow-detail.module').then(m => m.WorkflowDetailModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'history',
        loadChildren: () => import('./../history/history.module').then(m => m.HistoryModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.history'}
      },
      {
        path: 'file_transfer',
        loadChildren: () => import('./../file-transfer/file-transfer.module').then(m => m.FileTransferModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.fileTransfers'}
      },
      {
        path: 'audit_log',
        loadChildren: () => import('./../audit-log/audit-log.module').then(m => m.AuditLogModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.auditLog'}
      },
      {
        path: 'resources',
        canActivate: [AuthGuard],
        loadChildren: () => import('./../resource/resource.module').then(m => m.ResourceModule)
      },
      {
        path: 'controllers',
        loadChildren: () => import('./../controllers/controllers.module').then(m => m.ControllersModule),
        data: {breadcrumb: 'breadcrumb.label.manageControllers'}
      },
      {path: 'user', component: UserComponent, data: {breadcrumb: 'breadcrumb.label.userProfile'}},
      {path: 'error', component: ErrorComponent},
      {path: 'log', component: LogComponent, data: {breadcrumb: 'breadcrumb.label.log'}},
      {
        path: 'users',
        loadChildren: () => import('./../admin/admin.module').then(m => m.AdminModule),
        canActivate: [AuthGuard]
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

