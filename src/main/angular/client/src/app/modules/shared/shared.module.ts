import {NgModule} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzTreeModule} from 'ng-zorro-antd/tree';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {NzMessageModule} from 'ng-zorro-antd/message';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTreeSelectModule} from 'ng-zorro-antd/tree-select';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzNoAnimationModule} from 'ng-zorro-antd/core/no-animation';
import {NzAutocompleteModule} from "ng-zorro-antd/auto-complete";
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzTimePickerModule} from 'ng-zorro-antd/time-picker';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {Shared2Module} from './shared2.module';
import {ToggleComponent} from '../../components/toggle/toggle.component';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {
  DurationPipe,
  ByteToSizePipe,
  DurationFromCurrentPipe,
  ConvertTimePipe,
  StringDateFormatePipe,
  GroupByPipe
} from '../../pipes/core.pipe';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {
  NumberArrayRegexValidator,
  DurationRegexValidator,
  RegexValidator,
  IdentifierValidator,
  ResizableDirective,
  MaximumDirective,
  AutofocusDirective,
  TimeValidatorDirective, TimeRegexValidator, RelativeDateValidator, RelativeDateRegexValidator, FacetValidator
} from '../../directives/core.directive';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {CalendarModalComponent} from '../../components/calendar-modal/calendar.component';
import {ResumeOrderModalComponent} from '../../components/resume-modal/resume.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../components/modify-modal/modify.component';
import {OrderVariableComponent} from '../../components/order-variable/order-variable.component';
import {ValueEditorComponent} from '../../components/value-editor/value.component';
import {FileTransferSearchComponent} from '../file-transfer/file-transfer.component';
import {AuditLogInputComponent} from '../../components/audit-log-input/audit-log-input.component';
import {WorkflowTreeStructureComponent} from '../../components/workflow-tree-structure/workflow-tree-structure.component';
import {SearchComponent} from '../../components/search/search.component';
import {PermissionViewComponent} from "../../components/permission-view/permission-view.component";
import {SelectDocumentComponent} from "../../components/select-document/select-document.component";
import {AgentSelectionComponent} from "../configuration/inventory/agent-selection/agent-selection.component";

const MODULES = [Shared2Module, NzTableModule, DragDropModule, NzCollapseModule,
  NzIconModule, NzInputNumberModule, NzTreeModule, NzSpinModule, NzAutocompleteModule,
  NzSelectModule, NzInputModule, NzMessageModule, NzCheckboxModule, NzRadioModule,
  NzTreeSelectModule, NzDatePickerModule, NzNoAnimationModule, NzTimePickerModule];
const COMPONENTS = [CommentModalComponent, EditFilterModalComponent, ConfirmModalComponent,
  CalendarModalComponent, TreeModalComponent, ResumeOrderModalComponent, ChangeParameterModalComponent,
  ModifyStartTimeModalComponent];
const PIPES = [DurationPipe, StringDateFormatePipe, ByteToSizePipe, DurationFromCurrentPipe, ConvertTimePipe, GroupByPipe];
const DIRECTIVES = [TimeValidatorDirective, TimeRegexValidator, RegexValidator, RelativeDateValidator, RelativeDateRegexValidator,
  ResizableDirective, MaximumDirective, NumberArrayRegexValidator, DurationRegexValidator, IdentifierValidator, FacetValidator, AutofocusDirective];
const EXPORTS = [...PIPES, ...DIRECTIVES, ToggleComponent, OrderVariableComponent, FileTransferSearchComponent, AuditLogInputComponent,
  StartUpModalComponent, TreeComponent, AgentSelectionComponent, ValueEditorComponent, WorkflowTreeStructureComponent, SearchComponent,
  SelectDocumentComponent, PermissionViewComponent];

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
