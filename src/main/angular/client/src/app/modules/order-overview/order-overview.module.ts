import { NgModule } from '@angular/core';
import {PieChartModule} from '@swimlane/ngx-charts';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {OrderOverviewComponent, OrderPieChartComponent} from './order-overview.component';
import {StartOrderModalComponent} from './order-action/order-action.component';
import {SharedModule} from '../shared/shared.module';
import {OrderOverviewRoutingModule} from './order-overview-routing.module';

@NgModule({
  declarations: [OrderOverviewComponent,  OrderPieChartComponent, StartOrderModalComponent],
  imports: [
    SharedModule,
    PieChartModule,
    NzTabsModule,
    OrderOverviewRoutingModule
  ]
})
export class OrderOverviewModule { }
