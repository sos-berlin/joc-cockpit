import {NgModule} from '@angular/core';
import {ConfigurationComponent} from './configuration.component';
import {ConfigurationRoutingModule} from './configuration-routing.module';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent
} from './xml-editor/xml-editor.component';
import {SharedModule} from '../shared/shared.module';
import {FileUploadModule} from 'ng2-file-upload';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
  CalendarTemplateComponent,
  JoeComponent,
  LockTemplateComponent,
  OrderTemplateComponent,
  PeriodEditorComponent,
  PreviewCalendarComponent,
  ProcessClassTemplateComponent,
  WorkFlowTemplateComponent,
  TypeComponent,
  FrequencyModalComponent
} from './joe/joe.component';
import {CalendarService} from '../../services/calendar.service';
import {DatePipe} from '@angular/common';

@NgModule({
  imports: [
    ConfigurationRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule
  ],
  providers: [DatePipe, CalendarService],
  declarations: [
    ConfigurationComponent,
    XmlEditorComponent,
    JoeComponent,
    ImportModalComponent,
    FrequencyModalComponent,
    ShowModalComponent,
    ShowChildModalComponent,
    ConfirmationModalComponent,
    WorkFlowTemplateComponent,
    TypeComponent,
    OrderTemplateComponent,
    ProcessClassTemplateComponent,
    LockTemplateComponent,
    PeriodEditorComponent,
    PreviewCalendarComponent,
    CalendarTemplateComponent
  ],
  entryComponents: [ImportModalComponent, FrequencyModalComponent, ShowModalComponent, ShowChildModalComponent, ConfirmationModalComponent, PeriodEditorComponent, PreviewCalendarComponent, CalendarTemplateComponent]
})
export class ConfigurationModule {
}

