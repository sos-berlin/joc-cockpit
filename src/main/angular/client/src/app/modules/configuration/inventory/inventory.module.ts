import {NgModule} from '@angular/core';
import {NzMentionModule} from 'ng-zorro-antd/mention';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {NgJsonEditorModule} from 'ang-jsoneditor';
import {DatePipe} from '@angular/common';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {InventoryRoutingModule} from './inventory-routing.module';
import {InventoryService} from './inventory.service';
import {SharedModule} from '../../shared/shared.module';
import {CalendarService} from '../../../services/calendar.service';
import {
  CreateFolderModalComponent,
  CreateObjectModalComponent,
  CreateTagModalComponent,
  DeployComponent,
  ExportComponent,
  GitComponent,
  InventoryComponent,
  JsonEditorModalComponent,
  NewDraftComponent,
  NotificationComponent,
  RepositoryComponent,
  ShowObjectsComponent,
  SingleDeployComponent,
  EncryptArgumentModalComponent,
  ShowAgentsModalComponent,
  ChangeModalComponent,
  PublishChangeModalComponent, ShowDependenciesModalComponent,
  GroupTagsComponent,
  AddGropusModalComponent,
  AddTagsToGropusModalComponent,
} from './inventory.component';
import {TableComponent} from './table-data/table.component';
import {
  ExpressionComponent,
  JobComponent,
  ScriptEditorComponent,
  FindAndReplaceComponent,
  WorkflowComponent,
  AdmissionTimeComponent,
  TimeEditorComponent,
  DurationValidator,
  CycleInstructionComponent,
  RepeatEditorComponent,
  OffsetValidator,
  FacetEditorComponent,
  ShowReferenceComponent,
  NoticeBoardEditorComponent, ChangeImpactDialogComponent, DurationValidatorChange
} from './workflow/workflow.component';
import {ScheduleComponent} from './schedule/schedule.component';
import {LockComponent} from './lock/lock.component';
import {BoardComponent} from './board/board.component';
import {CalendarComponent, FrequencyModalComponent} from './calendar/calendar.component';
import {FileOrderComponent} from './file-order/file-order.component';
import {JobResourceComponent, TestMailComponent} from './job-resource/job-resource.component';
import {AddRestrictionComponent, PeriodComponent, RunTimeComponent} from './runtime/runtime.component';
import {ApiRequestComponent, ApiRequestDialogComponent, JobWizardComponent} from './job-wizard/job-wizard.component';
import {
  DurationWithPercentageRegexValidator,
  EnvVariableValidator,
  LabelValidator,
  TimeRangeRegexValidator
} from '../../../directives/core.directive';
import {UpdateJobComponent} from './update-job/update-job.component';
import {UpdateObjectComponent} from './update-object/update-object.component';
import {ScriptComponent} from './script/script.component';
import {FavoriteListComponent} from "./favorite-list/favorite-list.component";
import {JobTemplateComponent, UpdateJobTemplatesComponent} from './job-template/job-template.component';
import {TreeModalComponent} from "./runtime/tree-modal/tree.component";
import {MonthValidator, RelativeMonthValidator, ReportComponent} from './report/report.component';
import {ReactiveFormsModule} from "@angular/forms";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzFormModule} from "ng-zorro-antd/form";
import {WorkflowModule} from "../../workflow/workflow.module";
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import {NzAlertModule} from "ng-zorro-antd/alert";

const COMPONENTS = [InventoryComponent, JobComponent, ExpressionComponent, CalendarComponent, ScheduleComponent, ScriptComponent, LockComponent,
  WorkflowComponent, BoardComponent, JobResourceComponent, JobTemplateComponent, FileOrderComponent, TableComponent, FrequencyModalComponent,
  JsonEditorModalComponent, SingleDeployComponent, DeployComponent, ExportComponent, CreateFolderModalComponent, CreateObjectModalComponent,
  NotificationComponent, RepositoryComponent, GitComponent, ScriptEditorComponent, UpdateJobTemplatesComponent, CreateTagModalComponent,
  UpdateObjectComponent, FindAndReplaceComponent, ShowObjectsComponent, CycleInstructionComponent, UpdateJobComponent, PeriodComponent,
  ShowReferenceComponent, AdmissionTimeComponent, TimeEditorComponent, RepeatEditorComponent, AddRestrictionComponent, TestMailComponent,
  RunTimeComponent, TreeModalComponent, JobWizardComponent, FacetEditorComponent, FavoriteListComponent, ChangeModalComponent, PublishChangeModalComponent, ShowDependenciesModalComponent, NewDraftComponent, NoticeBoardEditorComponent, ReportComponent, ChangeImpactDialogComponent, EncryptArgumentModalComponent, ShowAgentsModalComponent, GroupTagsComponent, AddGropusModalComponent, AddTagsToGropusModalComponent, ApiRequestComponent, ApiRequestDialogComponent];

@NgModule({
  imports: [
    InventoryRoutingModule,
    SharedModule,
    CodemirrorModule,
    NzMentionModule,
    NzTabsModule,
    NzDrawerModule,
    NzSwitchModule,
    NgJsonEditorModule,
    ReactiveFormsModule,
    NzDividerModule,
    NzCardModule,
    NzFormModule,
    WorkflowModule,
    NzAutocompleteModule,
    NzAlertModule
  ],
  providers: [DatePipe, CalendarService, InventoryService],
  exports: [
    JsonEditorModalComponent
  ],
  declarations: [
    LabelValidator,
    EnvVariableValidator,
    DurationValidator,
    DurationValidatorChange,
    OffsetValidator,
    MonthValidator,
    RelativeMonthValidator,
    TimeRangeRegexValidator,
    DurationWithPercentageRegexValidator,
    ...COMPONENTS
  ]
})
export class InventoryModule {
}

