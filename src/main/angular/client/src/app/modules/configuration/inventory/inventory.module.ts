import {NgModule} from '@angular/core';
import {FileUploadModule} from 'ng2-file-upload';
import {NzMentionModule} from 'ng-zorro-antd/mention';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzAutocompleteModule} from 'ng-zorro-antd/auto-complete';
import {NgJsonEditorModule} from 'ang-jsoneditor';
import {ChecklistModule} from 'angular-checklist';
import {DatePipe} from '@angular/common';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {DragDropModule} from '@angular/cdk/drag-drop';
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
  WorkflowComponent
} from './workflow/workflow.component';
import {ScheduleComponent} from './schedule/schedule.component';
import {LockComponent} from './lock/lock.component';
import {JunctionComponent} from './junction/junction.component';
import {CalendarComponent, FrequencyModalComponent} from './calendar/calendar.component';
import {FileOrderComponent} from './file-order/file-order.component';
import {JobResourceComponent} from './job-resource/job-resource.component';
import {AddRestrictionComponent, PeriodComponent, RunTimeComponent} from './runtime/runtime.component';
import {EnvVariableValidator, LabelValidator} from '../../../directives/core.directive';

const COMPONENTS = [FrequencyModalComponent, ImportComponent, UpdateWorkflowComponent, SingleDeployComponent,
  DeployComponent, ExportComponent, SetVersionComponent, CreateFolderModalComponent, CreateObjectModalComponent,
  ImportWorkflowModalComponent, JsonEditorModalComponent, UploadModalComponent, ScriptEditorComponent, PeriodComponent, AddRestrictionComponent, RunTimeComponent];

@NgModule({
  imports: [
    InventoryRoutingModule,
    SharedModule,
    FileUploadModule,
    CodemirrorModule,
    NzMentionModule,
    NzAutocompleteModule,
    NzTabsModule,
    NzDrawerModule,
    DragDropModule,
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
    JobResourceComponent,
    FileOrderComponent,
    TableComponent,
    LabelValidator,
    EnvVariableValidator,
    ...COMPONENTS
  ]
})
export class InventoryModule {
}

