import {NgModule} from '@angular/core';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {
  CalendarComponent,
  SingleCalendarComponent
} from './calendar.component';
import {ResourceSharedModule} from '../resource-shared.module';
import {CalendarRoutingModule} from './calendar-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
    imports: [
        SharedModule,
        ResourceSharedModule,
        NzDrawerModule,
        CalendarRoutingModule,
        NzTooltipDirective
    ],
  declarations: [CalendarComponent, SingleCalendarComponent]
})
export class CalendarModule {
}
