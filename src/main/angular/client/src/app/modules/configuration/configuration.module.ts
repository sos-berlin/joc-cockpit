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
import {InventoryComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent,
  ExportComponent, CreateFolderModalComponent, ImportWorkflowModalComponent} from './inventory/inventory.component';
import {CalendarService} from '../../services/calendar.service';
import {SharedModule} from '../shared/shared.module';
import {WorkflowService} from '../../services/workflow.service';
import {CalendarComponent, FrequencyModalComponent} from './inventory/calendar/calendar.component';
import {OrderComponent, PeriodEditorComponent} from './inventory/order/order.component';
import { LockComponent } from './inventory/lock/lock.component';
import {
  UpdateWorkflowComponent,
  ExpressionComponent,
  ImportComponent,
  JobComponent,
  WorkflowComponent
} from './inventory/workflow/workflow.component';
import { AgentClusterComponent } from './inventory/agent-cluster/agent-cluster.component';
import { JunctionComponent } from './inventory/junction/junction.component';
import { JobClassComponent } from './inventory/job-class/job-class.component';
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
    InventoryComponent,
    ImportModalComponent,
    FrequencyModalComponent,
    JobComponent,
    ExpressionComponent,
    ShowModalComponent,
    ImportComponent,
    UpdateWorkflowComponent,
    ShowChildModalComponent,
    ConfirmationModalComponent,
    DiffPatchModalComponent,
    PeriodEditorComponent,
    PreviewCalendarComponent,
    CalendarComponent,
    OrderComponent,
    LockComponent,
    WorkflowComponent,
    AgentClusterComponent,
    JunctionComponent,
    JobClassComponent,
    DeployComponent,
    SetVersionComponent,
    ExportComponent,
    CreateFolderModalComponent,
    ImportWorkflowModalComponent,
    XMLAutofocusDirective
  ],
  entryComponents: [ImportModalComponent, DiffPatchModalComponent, FrequencyModalComponent, ShowModalComponent, ImportComponent, UpdateWorkflowComponent, ShowChildModalComponent, ConfirmationModalComponent, PeriodEditorComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent, ExportComponent, CreateFolderModalComponent, ImportWorkflowModalComponent]
})
export class ConfigurationModule {
}

