import {NgModule} from '@angular/core';
import {GridsterModule} from 'angular-gridster2';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {DashboardComponent, AddWidgetModalComponent} from './dashboard.component';
import {DailyPlanComponent} from './daily-plan/daily-plan.component';
import {HistorySummaryComponent} from './history-summary/history-summary.component';
import {OrderOverviewComponent} from './order-overview/order-overview.component';
import {AgentStatusComponent} from './agent-status/agent-status.component';
import {AgentRunningTaskComponent} from './agent-running-task/agent-running-task.component';
import {SchedulerInstanceComponent} from './scheduler-instance/scheduler-instance.component';
import {ActionComponent, CommentModalComponent} from './action/action.component';
import {ControllerClusterComponent} from './controller-cluster/controller-cluster.component';
import {InventoryStatisticsComponent} from './inventory-statistics/inventory-statistics.component';
import {SharedModule} from '../shared/shared.module';
import {ChartsModule, ThemeService} from 'ng2-charts';

@NgModule({
  imports: [
    NgxChartsModule,
    ChartsModule,
    GridsterModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    CommentModalComponent,
    AddWidgetModalComponent,
    DashboardComponent,
    InventoryStatisticsComponent,
    DailyPlanComponent,
    HistorySummaryComponent,
    OrderOverviewComponent,
    AgentStatusComponent,
    AgentRunningTaskComponent,
    ControllerClusterComponent,
    SchedulerInstanceComponent,
    ActionComponent
  ],
  providers: [ThemeService]
})
export class DashboardModule {

}
