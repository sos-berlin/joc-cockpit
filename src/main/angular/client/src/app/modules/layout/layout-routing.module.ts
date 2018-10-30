import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {ErrorComponent} from '../error/error.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {DailyPlanComponent} from '../daily-plan/daily-plan.component';
import {EditorComponent} from '../editor/editor.component';
import {JobComponent} from '../job/job.component';
import {WorkflowComponent} from '../workflow/workflow.component';
import {HistoryComponent} from '../history/history.component';
import {FileTransferComponent} from '../file-transfer/file-transfer.component';
import {AuditLogComponent} from '../audit-log/audit-log.component';
import {ResourceComponent} from '../resource/resource.component';
import {AgentClusterComponent} from '../resource/agent-cluster/agent-cluster.component';
import {AgentJobExecutionComponent} from '../resource/agent-job-execution/agent-job-execution.component';
import {LockComponent} from '../resource/lock/lock.component';
import {ProcessClassComponent} from '../resource/process-class/process-class.component';
import {CalendarComponent} from '../resource/calendar/calendar.component';
import {UserComponent} from '../user/user.component';
import {AdminComponent} from '../admin/admin.component';
import {AccountsComponent} from '../admin/accounts/accounts.component';
import {RolesComponent} from '../admin/roles/roles.component';
import {MainSectionComponent} from '../admin/main-section/main-section.component';
import {PermissionsComponent} from '../admin/permissions/permissions.component';
import { ProfilesComponent } from '../admin/profiles/profiles.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: 'error', component: ErrorComponent},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'daily_plan', component: DailyPlanComponent},
      {path: 'joe', component: EditorComponent},
      {path: 'job', component: JobComponent},
      {path: 'workflow', component: WorkflowComponent},
      {path: 'history', component: HistoryComponent},
      {path: 'file_transfer', component: FileTransferComponent},
      {path: 'audit_log', component: AuditLogComponent},
      {
        path: 'resources', component: ResourceComponent, children: [
          {path: 'agent_cluster', component: AgentClusterComponent},
          {path: 'agent_job_execution', component: AgentJobExecutionComponent},
          {path: 'lock', component: LockComponent},
          {path: 'process_class', component: ProcessClassComponent},
          {path: 'calendar', component: CalendarComponent},
        ]
      },
      {path: 'user', component: UserComponent},
      {
        path: 'users', component: AdminComponent, children: [
          {path: 'account', component: AccountsComponent},
          {path: 'master', component: RolesComponent},
          {path: 'main_section', component: MainSectionComponent},
          {path: 'profiles', component: ProfilesComponent},
          {path: 'permissions/:master.master/:role.role', component: PermissionsComponent}
        ]
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
