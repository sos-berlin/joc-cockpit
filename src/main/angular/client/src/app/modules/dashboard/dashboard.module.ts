import {NgModule} from '@angular/core';
import { DashboardComponent } from './dashboard.component';

import { TaskOverviewComponent } from './task-overview/task-overview.component';
import { TaskSummaryComponent } from './task-summary/task-summary.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { FileSummaryComponent } from './file-summary/file-summary.component';
import { OrderOverviewComponent } from './order-overview/order-overview.component';
import { FileOverviewComponent } from './file-overview/file-overview.component';
import { DailyPlanComponent } from './daily-plan/daily-plan.component';
import { AgentStatusComponent } from './agent-status/agent-status.component';
import { AgentRunningTaskComponent } from './agent-running-task/agent-running-task.component';
import { MasterClusterComponent, AdDirective,AdComponent  } from './master-cluster/master-cluster.component';

import { GridsterModule } from 'angular-gridster2';
import { SchedulerInstanceComponent } from './scheduler-instance/scheduler-instance.component';
import { ActionComponent, CommentModal } from './action/action.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {SharedModule} from "../shared/shared.module";
@NgModule({
  imports: [
        NgxChartsModule,
        GridsterModule,
       SharedModule
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
        CommentModal,
         AdDirective,
      AdComponent
    ],
    entryComponents: [
        CommentModal,
      AdComponent
    ],
})
export class DashboardModule {

}
