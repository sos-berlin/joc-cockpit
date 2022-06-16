import {NgModule} from '@angular/core';
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
    CalendarRoutingModule
  ],
  declarations: [CalendarComponent, SingleCalendarComponent]
})
export class CalendarModule {
}
