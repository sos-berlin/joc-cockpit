import {NgModule} from '@angular/core';
import {OrderModule} from 'ngx-order-pipe';

import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzTreeModule} from 'ng-zorro-antd/tree';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzMessageModule} from 'ng-zorro-antd/message';
import {ClipboardModule} from 'ngx-clipboard';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTreeSelectModule} from 'ng-zorro-antd/tree-select';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzNoAnimationModule} from 'ng-zorro-antd/core/no-animation';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzTimePickerModule} from 'ng-zorro-antd/time-picker';
import {ChecklistModule} from 'angular-checklist';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
  AutofocusDirective,
  TimeValidatorDirective, TimeRegexValidator, LabelValidator, EnvVariableValidator
} from '../../directives/core.directive';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {Shared2Module} from './shared2.module';
import {CalendarModalComponent} from '../../components/calendar-modal/calendar.component';
import {AddRestrictionComponent, PeriodComponent, RunTimeComponent} from '../../components/runtime/runtime.component';
import {ResumeOrderModalComponent} from '../../components/resume-modal/resume.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../components/modify-modal/modify.component';
import {OrderVariableComponent} from '../../components/order-variable/order-variable.component';


const MODULES = [Shared2Module, NzTableModule, NzTabsModule, ChecklistModule, DragDropModule,
  NzToolTipModule, NzIconModule, NzInputNumberModule, NzTreeModule, NzSpinModule,
  NzSelectModule, NzInputModule, NzMessageModule, NzCheckboxModule, NzRadioModule,
  NzTreeSelectModule, ClipboardModule, NzDatePickerModule, NzNoAnimationModule, NzTimePickerModule, OrderModule];
const COMPONENTS = [CommentModalComponent, EditFilterModalComponent, ConfirmModalComponent,
  CalendarModalComponent, TreeModalComponent, PeriodComponent, AddRestrictionComponent,
  ResumeOrderModalComponent, ChangeParameterModalComponent, OrderVariableComponent, ModifyStartTimeModalComponent];
const PIPES = [DurationPipe, StringDateFormatePipe, ByteToSizePipe, DurationFromCurrentPipe, ConvertTimePipe, GroupByPipe];
const DIRECTIVES = [TimeValidatorDirective, TimeRegexValidator, RegexValidator, ResizableDirective, LabelValidator,
  NumberArrayRegexValidator, DurationRegexValidator, IdentifierValidator, EnvVariableValidator, AutofocusDirective];
const EXPORTS = [...PIPES, ...DIRECTIVES, ToggleComponent,
  StartUpModalComponent, TreeComponent, RunTimeComponent];

@NgModule({
  imports: [
    ...MODULES
  ],
  declarations: [
    ...COMPONENTS,
    ...EXPORTS
  ],
  exports: [...MODULES, ...EXPORTS, OrderVariableComponent]
})
export class SharedModule {
}
