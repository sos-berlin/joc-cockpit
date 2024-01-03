import {NgModule} from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {ReportingRoutingModule} from "./reporting-routing.module";
import {SharedModule} from "../shared/shared.module";
import {ReportingComponent, ShareModalComponent} from "./reporting.component";
import {GroupByPipe, SecondsToTimePipe} from "../../pipes/core.pipe";
import {GaugeModule} from "../gauge/gauge.module";
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {NzImageModule} from "ng-zorro-antd/image";

@NgModule({
  declarations: [
    ReportingComponent,
    SecondsToTimePipe,
    ShareModalComponent
  ],
    imports: [
        ReportingRoutingModule,
        NgChartsModule,
        SharedModule,
        GaugeModule.forRoot(),
        NzTabsModule,
        NzImageModule,
    ],
  providers: [GroupByPipe]
})
export class ReportingModule {
}
