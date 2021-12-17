import {NgModule} from '@angular/core';
import {FileUploadModule} from 'ng2-file-upload';
import {NzMentionModule} from 'ng-zorro-antd/mention';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzAutocompleteModule} from 'ng-zorro-antd/auto-complete';
import {NgJsonEditorModule} from 'ang-jsoneditor';
import {ChecklistModule} from 'angular-checklist';
import {DatePipe} from '@angular/common';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {InventoryRoutingModule} from './inventory-routing.module';
import {InventoryService} from './inventory.service';
import {SharedModule} from '../../shared/shared.module';
import {WorkflowService} from '../../../services/workflow.service';
import {CalendarService} from '../../../services/calendar.service';
import {
  CreateFolderModalComponent, CreateObjectModalComponent, CronImportModalComponent,
  DeployComponent,
  ExportComponent, ImportWorkflowModalComponent,
  InventoryComponent, JsonEditorModalComponent,
  SetVersionComponent,
  SingleDeployComponent, UploadModalComponent
} from './inventory.component';
import {TableComponent} from './table-data/table.component';
import {
  ExpressionComponent,
  ImportComponent,
  JobComponent,
  ScriptEditorComponent,
  FindAndReplaceComponent,
  WorkflowComponent,
  AdmissionTimeComponent,
  TimeEditorComponent,
  DurationValidator,
  CycleInstructionComponent,
  RepeatEditorComponent, OffsetValidator
} from './workflow/workflow.component';
import {ScheduleComponent} from './schedule/schedule.component';
import {LockComponent} from './lock/lock.component';
import {BoardComponent} from './board/board.component';
import {CalendarComponent, FrequencyModalComponent} from './calendar/calendar.component';
import {FileOrderComponent} from './file-order/file-order.component';
import {JobResourceComponent} from './job-resource/job-resource.component';
import {AddRestrictionComponent, PeriodComponent, RunTimeComponent} from './runtime/runtime.component';
import {JobWizardComponent} from './job-wizard/job-wizard.component';
import {DurationWithPercentageRegexValidator, EnvVariableValidator, LabelValidator} from '../../../directives/core.directive';
import {UpdateJobComponent} from './update-job/update-job.component';
import {UpdateObjectComponent} from './update-object/update-object.component';
import {ScriptComponent} from './script/script.component';

const COMPONENTS = [FrequencyModalComponent, ImportComponent, SingleDeployComponent, DeployComponent, ExportComponent,
  SetVersionComponent, CreateFolderModalComponent, CreateObjectModalComponent, ImportWorkflowModalComponent, CronImportModalComponent,
  JsonEditorModalComponent, UploadModalComponent, ScriptEditorComponent, UpdateJobComponent, UpdateObjectComponent, FindAndReplaceComponent, CycleInstructionComponent,
  AdmissionTimeComponent, TimeEditorComponent, RepeatEditorComponent, PeriodComponent, AddRestrictionComponent, RunTimeComponent, JobWizardComponent];

@NgModule({
  imports: [
    InventoryRoutingModule,
    SharedModule,
    FileUploadModule,
    CodemirrorModule,
    NzMentionModule,
    NzAutocompleteModule,
    NzTabsModule,
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
    ScriptComponent,
    LockComponent,
    WorkflowComponent,
    BoardComponent,
    JobResourceComponent,
    FileOrderComponent,
    TableComponent,
    LabelValidator,
    EnvVariableValidator,
    DurationValidator,
    OffsetValidator,
    DurationWithPercentageRegexValidator,
    ...COMPONENTS
  ]
})
export class InventoryModule {
}

