import {NgModule} from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {ReportingRoutingModule} from "./reporting-routing.module";
import {SharedModule} from "../shared/shared.module";
import {ReportingComponent} from "./reporting.component";
import {GroupByPipe, SecondsToTimePipe} from "../../pipes/core.pipe";
import {GaugeModule} from "../gauge/gauge.module";

@NgModule({
  declarations: [
    ReportingComponent,
    SecondsToTimePipe
  ],
  imports: [
    ReportingRoutingModule,
    NgChartsModule,
    SharedModule,
    GaugeModule.forRoot(),
  ],
  providers: [GroupByPipe]
})
export class ReportingModule {
}
