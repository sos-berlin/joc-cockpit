import {NgModule} from '@angular/core';
import {ConfigurationComponent} from './configuration.component';
import {ConfigurationRoutingModule} from './configuration-routing.module';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent,
  DiffPatchModalComponent
} from './xml-editor/xml-editor.component';
import {SharedModule} from '../shared/shared.module';
import {FileUploadModule} from 'ng2-file-upload';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {JoeComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent, ExportComponent, ImportWorkflowModalComponent,} from './joe/joe.component';
import {CalendarService} from '../../services/calendar.service';
import {DatePipe} from '@angular/common';
import {WorkflowService} from '../../services/workflow.service';
import {CalendarComponent, FrequencyModalComponent} from './joe/calendar/calendar.component';
import {OrderComponent, PeriodEditorComponent} from './joe/order/order.component';
import { LockComponent } from './joe/lock/lock.component';
import {
  AddWorkflowComponent,
  ExpressionComponent,
  ImportComponent,
  JobComponent,
  WorkflowComponent
} from './joe/workflow/workflow.component';
import { ProcessClassComponent } from './joe/process-class/process-class.component';
import { JunctionComponent } from './joe/junction/junction.component';
import { JobClassComponent } from './joe/job-class/job-class.component';

@NgModule({
  imports: [
    ConfigurationRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule,
    CodemirrorModule
  ],
  providers: [DatePipe, CalendarService, WorkflowService],
  declarations: [
    ConfigurationComponent,
    XmlEditorComponent,
    JoeComponent,
    ImportModalComponent,
    FrequencyModalComponent,
    JobComponent,
    ExpressionComponent,
    ShowModalComponent,
    ImportComponent,
    AddWorkflowComponent,
    ShowChildModalComponent,
    ConfirmationModalComponent,
    DiffPatchModalComponent,
    PeriodEditorComponent,
    PreviewCalendarComponent,
    CalendarComponent,
    OrderComponent,
    LockComponent,
    WorkflowComponent,
    ProcessClassComponent,
    JunctionComponent,
    JobClassComponent,
    DeployComponent,
    SetVersionComponent,
    ExportComponent,
    ImportWorkflowModalComponent
  ],
  entryComponents: [ImportModalComponent, DiffPatchModalComponent, FrequencyModalComponent, ShowModalComponent, ImportComponent, AddWorkflowComponent, ShowChildModalComponent, ConfirmationModalComponent, PeriodEditorComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent, ExportComponent, ImportWorkflowModalComponent]
})
export class ConfigurationModule {
}

