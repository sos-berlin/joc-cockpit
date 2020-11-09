import { NgModule } from '@angular/core';
import {PieChartModule} from '@swimlane/ngx-charts';
import {OrderOverviewComponent, OrderPieChartComponent, SingleOrderComponent} from './order-overview.component';
import {StartOrderModalComponent, OrderActionComponent} from './order-action/order-action.component';
import {SharedModule} from '../shared/shared.module';
import {OrderOverviewRoutingModule} from './order-overview-routing.module';

@NgModule({
  declarations: [OrderOverviewComponent, SingleOrderComponent, OrderPieChartComponent, StartOrderModalComponent, OrderActionComponent],
  imports: [
    SharedModule,
    PieChartModule,
    OrderOverviewRoutingModule
  ],
  entryComponents: [
    StartOrderModalComponent
  ]
})
export class OrderOverviewModule { }
