import {NgModule} from '@angular/core';
import {
  CalendarComponent,
  ShowModalComponent
} from './calendar.component';
import {SharedModule} from '../../shared/shared.module';
import {CalendarRoutingModule} from './calendar-routing.module';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  imports: [
    SharedModule,
    CalendarRoutingModule,
    FileUploadModule
  ],
  declarations: [CalendarComponent, ShowModalComponent],
  entryComponents: [ShowModalComponent]
})
export class CalendarModule {
}
