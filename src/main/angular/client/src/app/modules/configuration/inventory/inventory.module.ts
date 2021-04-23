import {NgModule} from '@angular/core';
import {FileUploadModule} from 'ng2-file-upload';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NzMentionModule} from 'ng-zorro-antd/mention';
import {NzAutocompleteModule} from 'ng-zorro-antd/auto-complete';
import {NgJsonEditorModule} from 'ang-jsoneditor';
import {ChecklistModule} from 'angular-checklist';
import {DatePipe} from '@angular/common';
import {InventoryRoutingModule} from './inventory-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {WorkflowService} from '../../../services/workflow.service';
import {InventoryService} from './inventory.service';
import {CalendarService} from '../../../services/calendar.service';
import {
  CreateFolderModalComponent, CreateObjectModalComponent,
  DeployComponent,
  ExportComponent, ImportWorkflowModalComponent,
  InventoryComponent, JsonEditorModalComponent,
  SetVersionComponent,
  SingleDeployComponent, UploadModalComponent
} from './inventory.component';
import {TableComponent} from './table-data/table.component';
import {
  ExpressionComponent, ImportComponent, JobComponent, ScriptEditorComponent, UpdateWorkflowComponent,
  WorkflowComponent, ValueEditorComponent
} from './workflow/workflow.component';
import {ScheduleComponent} from './schedule/schedule.component';
import {LockComponent} from './lock/lock.component';
import {JunctionComponent} from './junction/junction.component';
import {JobClassComponent} from './job-class/job-class.component';
import {CalendarComponent, FrequencyModalComponent} from './calendar/calendar.component';
import {FileOrderComponent} from './file-order/file-order.component';

const COMPONENTS = [FrequencyModalComponent, ImportComponent, UpdateWorkflowComponent, SingleDeployComponent,
  DeployComponent, ExportComponent, SetVersionComponent, CreateFolderModalComponent, CreateObjectModalComponent,
  ImportWorkflowModalComponent, JsonEditorModalComponent, UploadModalComponent, ScriptEditorComponent, ValueEditorComponent];

@NgModule({
  imports: [
    InventoryRoutingModule,
    SharedModule,
    FileUploadModule,
    CodemirrorModule,
    NzMentionModule,
    NzAutocompleteModule,
    NgJsonEditorModule,
    ChecklistModule
  ],
  providers: [DatePipe, CalendarService, WorkflowService, InventoryService],
  declarations: [
    InventoryComponent,
    JobComponent,
    ExpressionComponent,
    CalendarComponent,
    ScheduleComponent,
    LockComponent,
    WorkflowComponent,
    JunctionComponent,
    JobClassComponent,
    FileOrderComponent,
    TableComponent,
    ...COMPONENTS
  ]
})
export class InventoryModule {
}

