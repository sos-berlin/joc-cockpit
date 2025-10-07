import {NgModule} from '@angular/core';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {OrderOverviewComponent, OrderPieChartComponent, RelativeDateValidator, AllOrderResumeModelComponent } from './order-overview.component';
import {SharedModule} from '../shared/shared.module';
import {OrderOverviewRoutingModule} from './order-overview-routing.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
  declarations: [OrderOverviewComponent, OrderPieChartComponent, RelativeDateValidator, AllOrderResumeModelComponent],
    imports: [
        SharedModule,
        NzTabsModule,
        OrderOverviewRoutingModule,
        NzTooltipDirective
    ]
})
export class OrderOverviewModule {
}
