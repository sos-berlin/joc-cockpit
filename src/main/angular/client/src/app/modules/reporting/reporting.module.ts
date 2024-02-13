import {NgModule} from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {ReportingRoutingModule} from "./reporting-routing.module";
import {SharedModule} from "../shared/shared.module";
import {RunModalComponent, ReportingComponent, ShareModalComponent} from "./reporting.component";
import {GroupByPipe, SecondsToTimePipe} from "../../pipes/core.pipe";
import {GaugeModule} from "../gauge/gauge.module";
import { MonthlyComponent } from './monthly/monthly.component';
import {RunningHistoryComponent} from "./running-history/running-history.component";
import {ManageReportComponent} from "./manage-report/manage-report.component";


@NgModule({
  declarations: [
    ReportingComponent,
    SecondsToTimePipe,
    RunModalComponent,
    ShareModalComponent,
    ManageReportComponent,
    RunningHistoryComponent,
    MonthlyComponent,
  ],
  imports: [
    ReportingRoutingModule,
    NgChartsModule,
    SharedModule,
    NzDrawerModule,
    NzTabsModule,
    GaugeModule.forRoot(),
  ],
  providers: [GroupByPipe]
})
export class ReportingModule {
}
