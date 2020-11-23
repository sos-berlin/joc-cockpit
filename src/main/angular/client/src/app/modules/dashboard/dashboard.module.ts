import {NgModule} from '@angular/core';
import {GridsterModule} from 'angular-gridster2';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {DashboardComponent, AddWidgetModalComponent} from './dashboard.component';
import {TaskOverviewComponent} from './task-overview/task-overview.component';
import {TaskSummaryComponent} from './task-summary/task-summary.component';
import {OrderSummaryComponent} from './order-summary/order-summary.component';
import {OrderOverviewComponent} from './order-overview/order-overview.component';
import {AgentStatusComponent} from './agent-status/agent-status.component';
import {AgentRunningTaskComponent} from './agent-running-task/agent-running-task.component';
import {SchedulerInstanceComponent} from './scheduler-instance/scheduler-instance.component';
import {ActionComponent, CommentModalComponent} from './action/action.component';
import {SharedModule} from '../shared/shared.module';
import {ControllerClusterComponent} from './controller-cluster/controller-cluster.component';

const ENTRYCOMPONENTS = [CommentModalComponent, AddWidgetModalComponent];
@NgModule({
  imports: [
    NgxChartsModule,
    GridsterModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    ...ENTRYCOMPONENTS,
    DashboardComponent,
    TaskOverviewComponent,
    TaskSummaryComponent,
    OrderSummaryComponent,
    OrderOverviewComponent,
    AgentStatusComponent,
    AgentRunningTaskComponent,
    ControllerClusterComponent,
    SchedulerInstanceComponent,
    ActionComponent
  ],
  entryComponents: [...ENTRYCOMPONENTS],
})
export class DashboardModule {

}
