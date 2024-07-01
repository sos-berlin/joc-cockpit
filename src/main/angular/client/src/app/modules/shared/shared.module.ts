import {NgModule} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {NzMessageModule} from 'ng-zorro-antd/message';
import {NzTreeSelectModule} from 'ng-zorro-antd/tree-select';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzNoAnimationModule} from 'ng-zorro-antd/core/no-animation';
import {NzAutocompleteModule} from "ng-zorro-antd/auto-complete";
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzTimePickerModule} from 'ng-zorro-antd/time-picker';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {Shared2Module} from './shared2.module';
import {ChartsModule} from "../charts/charts.module";
import {
  DurationPipe,
  DurationFromCurrentPipe,
  ConvertTimePipe,
  StringDateFormatePipe,
  GroupByPipe
} from '../../pipes/core.pipe';
import {
  NumberArrayRegexValidator,
  DurationRegexValidator,
  RegexValidator,
  IdentifierValidator,
  ResizableDirective,
  MaximumDirective,
  AutofocusDirective,
  TimeValidatorDirective,
  TimeValidatorReqexDirective,
  TimeRegexValidator,
  RelativeDateValidator,
  RelativeDateRegexValidator,
  FacetValidator,
  UrlValidator, NegativeTimeRegexValidator
} from '../../directives/core.directive';
import {ToggleComponent} from '../../components/toggle/toggle.component';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {CalendarModalComponent} from '../../components/calendar-modal/calendar.component';
import {ResumeOrderModalComponent} from '../../components/resume-modal/resume.component';
import {
  ChangeParameterModalComponent,
  ModifyStartTimeModalComponent
} from '../../components/modify-modal/modify.component';
import {OrderVariableComponent} from '../../components/order-variable/order-variable.component';
import {ValueEditorComponent} from '../../components/value-editor/value.component';
import {FileTransferSearchComponent} from '../file-transfer/file-transfer.component';
import {AuditLogInputComponent} from '../../components/audit-log-input/audit-log-input.component';
import {
  WorkflowTreeStructureComponent
} from '../../components/workflow-tree-structure/workflow-tree-structure.component';
import {SearchComponent} from '../../components/search/search.component';
import {PermissionViewComponent} from "../../components/permission-view/permission-view.component";
import {SelectDocumentComponent} from "../../components/select-document/select-document.component";
import {AgentSelectionComponent} from "../../components/agent-selection/agent-selection.component";
import {NodePositionComponent} from "../../components/node-position/node-position.component";
import {GraphicalViewModalComponent} from '../../components/graphical-view-modal/graphical-view-modal.component';
import {MultiSelectComponent} from "../../components/multi-select/multi-select.component";
import {SearchInputComponent} from "../../components/search-input/search-input.component";
import {SelectInputComponent} from "../../components/select-input/select-input.component";
import {FileUploaderComponent} from '../../components/file-uploader/file-uploader.component';
import {DateInputComponent} from "../../components/date-input/date-input.component";
import {NzProgressModule} from "ng-zorro-antd/progress";

const MODULES = [Shared2Module, NzTableModule, DragDropModule, NzCollapseModule,
  NzInputNumberModule, NzSpinModule, NzAutocompleteModule, NzTagModule, NzSelectModule,
  NzInputModule, NzMessageModule, NzRadioModule, ChartsModule, NzTreeSelectModule,
  NzDatePickerModule, NzNoAnimationModule, NzTimePickerModule, NzUploadModule, NzProgressModule];
const COMPONENTS = [CommentModalComponent, EditFilterModalComponent, ConfirmModalComponent,
  CalendarModalComponent, ResumeOrderModalComponent, GraphicalViewModalComponent, ChangeParameterModalComponent,
  ModifyStartTimeModalComponent];
const PIPES = [DurationPipe, StringDateFormatePipe, DurationFromCurrentPipe, ConvertTimePipe, GroupByPipe];
const DIRECTIVES = [TimeValidatorDirective,TimeValidatorReqexDirective, TimeRegexValidator, NegativeTimeRegexValidator, RegexValidator, RelativeDateValidator,
  RelativeDateRegexValidator, UrlValidator, ResizableDirective, MaximumDirective, NumberArrayRegexValidator, DurationRegexValidator, IdentifierValidator,
  FacetValidator, AutofocusDirective];
const EXPORTS = [...PIPES, ...DIRECTIVES, ToggleComponent, OrderVariableComponent, FileTransferSearchComponent, AuditLogInputComponent,
  StartUpModalComponent, TreeComponent, AgentSelectionComponent, ValueEditorComponent, WorkflowTreeStructureComponent, NodePositionComponent, SearchComponent,
  SelectDocumentComponent, PermissionViewComponent, MultiSelectComponent, SearchInputComponent, SelectInputComponent, FileUploaderComponent, DateInputComponent];

@NgModule({
  imports: [
    ...MODULES
  ],
  declarations: [
    ...COMPONENTS,
    ...EXPORTS
  ],
  exports: [...MODULES, ...EXPORTS]
})
export class SharedModule {
}
