import { NgModule } from '@angular/core';
import {OrderOverviewComponent, OrderPieChartComponent} from './order-overview.component';
import {SharedModule} from '../shared/shared.module';
import {OrderOverviewRoutingModule} from './order-overview-routing.module';
import {PieChartModule} from '@swimlane/ngx-charts';
import {OrderActionComponent} from './order-action/order-action.component';

@NgModule({
  declarations: [OrderOverviewComponent, OrderPieChartComponent, OrderActionComponent],
  imports: [
    SharedModule,
    PieChartModule,
    OrderOverviewRoutingModule
  ]
})
export class OrderOverviewModule { }
