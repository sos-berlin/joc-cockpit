import { NgModule } from '@angular/core';
import {PieChartModule} from '@swimlane/ngx-charts';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {OrderOverviewComponent, OrderPieChartComponent} from './order-overview.component';
import {SharedModule} from '../shared/shared.module';
import {OrderOverviewRoutingModule} from './order-overview-routing.module';

@NgModule({
  declarations: [OrderOverviewComponent,  OrderPieChartComponent],
  imports: [
    SharedModule,
    PieChartModule,
    NzTabsModule,
    OrderOverviewRoutingModule
  ]
})
export class OrderOverviewModule { }
