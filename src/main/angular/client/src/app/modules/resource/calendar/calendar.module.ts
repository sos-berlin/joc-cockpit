import {NgModule} from '@angular/core';
import {
  CalendarComponent,
  ShowModalComponent, SingleCalendarComponent
} from './calendar.component';
import {SharedModule} from '../../shared/shared.module';
import {CalendarRoutingModule} from './calendar-routing.module';

@NgModule({
  imports: [
    SharedModule,
    CalendarRoutingModule
  ],
  declarations: [CalendarComponent, SingleCalendarComponent, ShowModalComponent]
})
export class CalendarModule {
}
