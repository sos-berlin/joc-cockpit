import {NgModule} from '@angular/core';
import {ConfigurationComponent} from './configuration.component';
import {ConfigurationRoutingModule} from './configuration-routing.module';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent,
  DiffPatchModalComponent
} from './xml-editor/xml-editor.component';
import {NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {FileUploadModule} from 'ng2-file-upload';
import {DatePipe} from '@angular/common';
import {JoeComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent,
  ExportComponent, CreateFolderModalComponent, ImportWorkflowModalComponent} from './joe/joe.component';
import {CalendarService} from '../../services/calendar.service';
import {SharedModule} from '../shared/shared.module';
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
import { XMLAutofocusDirective } from 'src/app/directives/core.directive';


@NgModule({
  imports: [
    ConfigurationRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule,
    NgbTypeaheadModule,
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
    CreateFolderModalComponent,
    ImportWorkflowModalComponent,
    XMLAutofocusDirective
  ],
  entryComponents: [ImportModalComponent, DiffPatchModalComponent, FrequencyModalComponent, ShowModalComponent, ImportComponent, AddWorkflowComponent, ShowChildModalComponent, ConfirmationModalComponent, PeriodEditorComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent, ExportComponent, ImportWorkflowModalComponent]
})
export class ConfigurationModule {
}

