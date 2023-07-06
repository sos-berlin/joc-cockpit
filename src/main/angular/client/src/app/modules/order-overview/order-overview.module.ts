import {NgModule} from '@angular/core';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {OrderOverviewComponent, OrderPieChartComponent, RelativeDateValidator} from './order-overview.component';
import {SharedModule} from '../shared/shared.module';
import {OrderOverviewRoutingModule} from './order-overview-routing.module';

@NgModule({
  declarations: [OrderOverviewComponent, OrderPieChartComponent, RelativeDateValidator],
  imports: [
    SharedModule,
    NzTabsModule,
    OrderOverviewRoutingModule
  ]
})
export class OrderOverviewModule {
}
