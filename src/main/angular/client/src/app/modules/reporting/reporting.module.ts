import {NgModule} from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {ReportingRoutingModule} from "./reporting-routing.module";
import {SharedModule} from "../shared/shared.module";
import {DownloadModalComponent, ReportingComponent, ShareModalComponent} from "./reporting.component";
import {GroupByPipe, SecondsToTimePipe} from "../../pipes/core.pipe";
import {GaugeModule} from "../gauge/gauge.module";

@NgModule({
  declarations: [
    ReportingComponent,
    SecondsToTimePipe,
    DownloadModalComponent,
    ShareModalComponent
  ],
  imports: [
    ReportingRoutingModule,
    NgChartsModule,
    SharedModule,
    NzTabsModule,
    GaugeModule.forRoot(),
  ],
  providers: [GroupByPipe]
})
export class ReportingModule {
}
