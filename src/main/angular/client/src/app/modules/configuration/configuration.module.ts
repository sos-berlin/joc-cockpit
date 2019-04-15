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
  FrequencyModalComponent,
  ExpressionModalComponent
} from './joe/joe.component';
import {CalendarService} from '../../services/calendar.service';
import {DatePipe} from '@angular/common';
import {WorkflowService} from '../../services/workflow.service';

@NgModule({
  imports: [
    ConfigurationRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule
  ],
  providers: [DatePipe, CalendarService, WorkflowService],
  declarations: [
    ConfigurationComponent,
    XmlEditorComponent,
    JoeComponent,
    ImportModalComponent,
    FrequencyModalComponent,
    ExpressionModalComponent,
    ShowModalComponent,
    ShowChildModalComponent,
    ConfirmationModalComponent,
    WorkFlowTemplateComponent,
    OrderTemplateComponent,
    ProcessClassTemplateComponent,
    LockTemplateComponent,
    PeriodEditorComponent,
    PreviewCalendarComponent,
    CalendarTemplateComponent
  ],
  entryComponents: [ImportModalComponent, FrequencyModalComponent, ExpressionModalComponent, ShowModalComponent, ShowChildModalComponent, ConfirmationModalComponent, PeriodEditorComponent, PreviewCalendarComponent, CalendarTemplateComponent]
})
export class ConfigurationModule {
}

