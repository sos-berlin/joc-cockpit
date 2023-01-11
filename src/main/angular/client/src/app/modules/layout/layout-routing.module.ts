import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {AuthGuard} from '../../components/guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.dashboard'}
      },
      {
        path: 'monitor',
        loadChildren: () => import('./../monitor/monitor.module').then(m => m.MonitorModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.monitor'}
      },
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
        path: 'workflows',
        loadChildren: () => import('./../workflow/workflow.module').then(m => m.WorkflowModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.workflows'}
      },
      {
        path: 'orders_overview/:state',
        loadChildren: () => import('./../order-overview/order-overview.module').then(m => m.OrderOverviewModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.ordersOverview'}
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
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.manageControllersAndAgents'}
      },
      {
        path: 'user',
        loadChildren: () => import('./../user/user.module').then(m => m.UserModule),
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'breadcrumb.label.userProfile'
        }
      },
      {
        path: 'logging',
        loadChildren: () => import('./../logging/logging.module').then(m => m.LoggingModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.logging'}
      },
      {
        path: 'settings',
        loadChildren: () => import('./../setting/setting.module').then(m => m.SettingModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.setting'}
      },
      {
        path: 'deployment_service',
        loadChildren: () => import('./../deployment/deployment.module').then(m => m.DeploymentModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.manageDeployment'}
      },
      {
        path: 'log',
        loadChildren: () => import('./../log/log.module').then(m => m.LogModule),
        canActivate: [AuthGuard],
        data: {breadcrumb: 'breadcrumb.label.log'}},
      {
        path: 'users',
        loadChildren: () => import('./../admin/admin.module').then(m => m.AdminModule),
        canActivate: [AuthGuard]
      },
      {path: 'error', loadChildren: () => import('./../page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {
}

