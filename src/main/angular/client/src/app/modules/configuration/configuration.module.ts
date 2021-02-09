import {NgModule} from '@angular/core';
import {ConfigurationComponent} from './configuration.component';
import {ConfigurationRoutingModule} from './configuration-routing.module';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent,
  DiffPatchModalComponent
} from './xml-editor/xml-editor.component';
import {FileUploadModule} from 'ng2-file-upload';
import {DatePipe} from '@angular/common';
import {
  InventoryComponent,
  DeployComponent,
  SetVersionComponent,
  CreateFolderModalComponent,
  ImportWorkflowModalComponent,
  SingleDeployComponent,
  ExportComponent,
  JsonEditorModalComponent,
  UploadModalComponent, CreateObjectModalComponent
} from './inventory/inventory.component';
import {CalendarService} from '../../services/calendar.service';
import {SharedModule} from '../shared/shared.module';
import {WorkflowService} from '../../services/workflow.service';
import {CalendarComponent, FrequencyModalComponent} from './inventory/calendar/calendar.component';
import { LockComponent } from './inventory/lock/lock.component';
import {
  UpdateWorkflowComponent,
  ExpressionComponent,
  ImportComponent,
  JobComponent,
  WorkflowComponent
} from './inventory/workflow/workflow.component';
import { JunctionComponent } from './inventory/junction/junction.component';
import { JobClassComponent } from './inventory/job-class/job-class.component';
import { XMLAutofocusDirective } from 'src/app/directives/core.directive';
import {TableComponent} from './inventory/table-data/table.component';
import {ScheduleComponent} from './inventory/schedule/schedule.component';
import {InventoryService} from './inventory/inventory.service';
import {NzAutocompleteModule, NzMentionModule} from 'ng-zorro-antd';

const COMPONENTS = [ImportModalComponent, DiffPatchModalComponent, FrequencyModalComponent, ShowModalComponent,
  ImportComponent, UpdateWorkflowComponent, ShowChildModalComponent, ConfirmationModalComponent, SingleDeployComponent,
  DeployComponent, ExportComponent, SetVersionComponent, CreateFolderModalComponent, CreateObjectModalComponent,
  ImportWorkflowModalComponent, JsonEditorModalComponent, UploadModalComponent];

@NgModule({
  imports: [
    ConfigurationRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule,
    CodemirrorModule,
    NzMentionModule,
    NzAutocompleteModule,
    NgJsonEditorModule
  ],
  providers: [DatePipe, CalendarService, WorkflowService, InventoryService],
  declarations: [
    ConfigurationComponent,
    XmlEditorComponent,
    InventoryComponent,
    JobComponent,
    ExpressionComponent,
    CalendarComponent,
    ScheduleComponent,
    LockComponent,
    WorkflowComponent,
    JunctionComponent,
    JobClassComponent,
    XMLAutofocusDirective,
    TableComponent,
    ...COMPONENTS
  ],
  entryComponents: [...COMPONENTS]
})
export class ConfigurationModule {
}

