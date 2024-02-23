import {NgModule} from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {ReportingRoutingModule} from "./reporting-routing.module";
import {SharedModule} from "../shared/shared.module";
import {RunModalComponent, ReportingComponent, ShareModalComponent} from "./reporting.component";
import {GroupByPipe, SecondsToTimePipe} from "../../pipes/core.pipe";
import {GaugeModule} from "../gauge/gauge.module";
import {RunningHistoryComponent} from "./running-history/running-history.component";
import {ManageReportComponent} from "./manage-report/manage-report.component";
import {AllReportComponent} from "./all-report/all-report.component";
import {FrequencyReportComponent} from "./frequency-report/frequency-report.component";
import {SharingDataService} from "./sharing-data.service";
import {GenerateReportComponent} from "./generate-report/running-history.component";


@NgModule({
  declarations: [
    ReportingComponent,
    SecondsToTimePipe,
    RunModalComponent,
    ShareModalComponent,
    ManageReportComponent,
    RunningHistoryComponent,
    AllReportComponent,
    GenerateReportComponent,
    FrequencyReportComponent
  ],
  imports: [
    ReportingRoutingModule,
    NgChartsModule,
    SharedModule,
    NzDrawerModule,
    NzTabsModule,
    GaugeModule.forRoot(),
  ],
  providers: [GroupByPipe, SharingDataService]
})
export class ReportingModule {
}
