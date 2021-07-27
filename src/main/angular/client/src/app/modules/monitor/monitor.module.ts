import {NgModule} from '@angular/core';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ChartsModule} from 'ng2-charts';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {GaugeModule} from 'angular-gauge';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {SharedModule} from '../shared/shared.module';
import {MonitorComponent} from './monitor.component';
import {MonitorRoutingModule} from './monitor-routing.module';
import {ControllerMonitorComponent} from './controller-monitor/controller-monitor.component';
import {AgentMonitorComponent} from './agent-monitor/agent-monitor.component';
import {GanttChartComponent} from './gantt-chart/gantt-chart.component';
import {AcknowledgeModalComponent, NotificationMonitorComponent} from './notification-monitor/notification-monitor.component';
import {GroupByPipe} from '../../pipes/core.pipe';

@NgModule({
  imports: [
    NgxChartsModule,
    ChartsModule,
    SharedModule,
    NzTabsModule,
    NzPopoverModule,
    GaugeModule.forRoot(),
    MonitorRoutingModule
  ],
  declarations: [
    MonitorComponent,
    ControllerMonitorComponent,
    GanttChartComponent,
    AgentMonitorComponent,
    NotificationMonitorComponent,
    AcknowledgeModalComponent
  ],
  providers: [GroupByPipe]
})
export class MonitorModule {

}
