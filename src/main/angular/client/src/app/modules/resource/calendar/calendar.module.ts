import {NgModule} from '@angular/core';
import {
  CalendarComponent, CalendarModalComponent,
  FrequencyModalComponent,
  ShowModalComponent,
  ImportModalComponent
} from './calendar.component';
import {SharedModule} from '../../shared/shared.module';
import {CalendarRoutingModule} from './calendar-routing.module';
import {DatePipe} from '@angular/common';
import {CalendarService} from './calendar.service';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  imports: [
    SharedModule,
    CalendarRoutingModule,
    FileUploadModule
  ],
  providers: [DatePipe, CalendarService],
  declarations: [CalendarComponent, CalendarModalComponent,
    FrequencyModalComponent,
    ShowModalComponent,
    ImportModalComponent],
  entryComponents: [CalendarModalComponent, FrequencyModalComponent, ShowModalComponent, ImportModalComponent]
})
export class CalendarModule {
}
