import {NgModule} from '@angular/core';
import {GridsterModule} from 'angular-gridster2';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ChartsModule} from 'ng2-charts';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {GaugeModule} from 'angular-gauge';
import {SharedModule} from '../shared/shared.module';
import {MonitorComponent} from './monitor.component';
import {MonitorRoutingModule} from './monitor-routing.module';
import {ControllerMonitorComponent} from './controller-monitor/controller-monitor.component';
import {AgentMonitorComponent} from './agent-monitor/agent-monitor.component';
import {GanttChartComponent} from './gantt-chart/gantt-chart.component';
import {NotificationMonitorComponent} from './notification-monitor/notification-monitor.component';

@NgModule({
  imports: [
    NgxChartsModule,
    ChartsModule,
    GridsterModule,
    SharedModule,
    NzTabsModule,
    GaugeModule.forRoot(),
    MonitorRoutingModule
  ],
  declarations: [
    MonitorComponent,
    ControllerMonitorComponent,
    GanttChartComponent,
    AgentMonitorComponent,
    NotificationMonitorComponent
  ]
})
export class MonitorModule {

}
