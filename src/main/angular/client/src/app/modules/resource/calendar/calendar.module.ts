import {NgModule} from '@angular/core';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {
  CalendarComponent,
  SingleCalendarComponent
} from './calendar.component';
import {ResourceSharedModule} from '../resource-shared.module';
import {CalendarRoutingModule} from './calendar-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    NzDrawerModule,
    CalendarRoutingModule
  ],
  declarations: [CalendarComponent, SingleCalendarComponent]
})
export class CalendarModule {
}
