import {NgModule} from '@angular/core';
import {GridsterModule} from 'angular-gridster2';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {DashboardComponent, AddWidgetModalComponent} from './dashboard.component';
import {TaskOverviewComponent} from './task-overview/task-overview.component';
import {TaskSummaryComponent} from './task-summary/task-summary.component';
import {OrderSummaryComponent} from './order-summary/order-summary.component';
import {FileSummaryComponent} from './file-summary/file-summary.component';
import {OrderOverviewComponent} from './order-overview/order-overview.component';
import {FileOverviewComponent} from './file-overview/file-overview.component';
import {DailyPlanComponent} from './daily-plan/daily-plan.component';
import {AgentStatusComponent} from './agent-status/agent-status.component';
import {AgentRunningTaskComponent} from './agent-running-task/agent-running-task.component';
import {MasterClusterComponent} from './master-cluster/master-cluster.component';
import {SchedulerInstanceComponent} from './scheduler-instance/scheduler-instance.component';
import {ActionComponent, CommentModalComponent} from './action/action.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    NgxChartsModule,
    GridsterModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    DashboardComponent,
    TaskOverviewComponent,
    TaskSummaryComponent,
    OrderSummaryComponent,
    FileSummaryComponent,
    OrderOverviewComponent,
    FileOverviewComponent,
    DailyPlanComponent,
    AgentStatusComponent,
    AgentRunningTaskComponent,
    MasterClusterComponent,
    SchedulerInstanceComponent,
    ActionComponent,
    CommentModalComponent,
    AddWidgetModalComponent
  ],
  entryComponents: [
    CommentModalComponent,
    AddWidgetModalComponent
  ],
})
export class DashboardModule {

}
