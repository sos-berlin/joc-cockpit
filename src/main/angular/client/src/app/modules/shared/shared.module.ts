import {NgModule} from '@angular/core';
import {OrderModule} from 'ngx-order-pipe';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {ChecklistModule} from 'angular-checklist';
import {DpDatePickerModule} from 'ng2-date-picker';
import {TreeModule} from 'angular-tree-component';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
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
} from '../../filters/filter.pipe';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {
  DropdownDirective,
  NumberArrayRegexValidator,
  DurationRegexValidator,
  RegexValidator,
  ResizableDirective,
  TimeValidatorDirective
} from '../../directives/core.directive';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {Shared2Module} from './shared2.module';
import {NzDatePickerModule} from 'ng-zorro-antd';

const MODULES = [Shared2Module, NzTableModule, NzTabsModule,
  NzToolTipModule, NzIconModule, NzInputNumberModule,
  ChecklistModule, Ng2SearchPipeModule, NzSelectModule,
  NzDatePickerModule, DpDatePickerModule, OrderModule];
const COMPONENTS = [CommentModalComponent, EditFilterModalComponent, ConfirmModalComponent,
  TreeModalComponent];
const PIPES = [DurationPipe, StringDateFormatePipe,
  ByteToSizePipe, DurationFromCurrentPipe, ConvertTimePipe, GroupByPipe];
const DIRECTIVES = [TimeValidatorDirective, RegexValidator, DropdownDirective, ResizableDirective,
  NumberArrayRegexValidator, DurationRegexValidator];
const EXPORTS = [...PIPES, ...DIRECTIVES, ToggleComponent,
  StartUpModalComponent, TreeComponent];

@NgModule({
  imports: [
    ...MODULES,
    TreeModule.forRoot()
  ],
  declarations: [
    ...COMPONENTS,
    ...EXPORTS
  ],
  exports: [...MODULES, ...EXPORTS, TreeModule],
  entryComponents: [...COMPONENTS]
})
export class SharedModule {
}
