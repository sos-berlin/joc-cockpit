import {NgModule} from '@angular/core';
import {
  CalendarComponent,
  ShowModalComponent, SingleCalendarComponent
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
  declarations: [CalendarComponent, SingleCalendarComponent, ShowModalComponent]
})
export class CalendarModule {
}
