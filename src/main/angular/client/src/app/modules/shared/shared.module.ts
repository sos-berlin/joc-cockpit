import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {OrderModule} from 'ngx-order-pipe';
import {NgxPaginationModule} from 'ngx-pagination';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {ChecklistModule} from 'angular-checklist';
import {DpDatePickerModule} from 'ng2-date-picker';
import {TreeModule} from 'angular-tree-component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {ToggleComponent} from '../../components/toggle/toggle.component';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {
  StringDatePipe,
  DurationPipe,
  DecodeSpacePipe,
  ByteToSizePipe,
  DurationFromCurrentPipe,
  ConvertTimePipe,
  StringDateFormatePipe,
  GroupByPipe, SafeHtmlPipe
} from '../../filters/filter.pipe';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {ConfigurationModalComponent} from '../../components/configuration-modal/configuration.component';
import {DropdownDirective, RegexValidator, ResizableDirective, TimeValidatorDirective} from '../../directives/core.directive';
import {SubLinkComponent} from '../resource/sub-link/sub-link.component';
import {RouterModule} from '@angular/router';

const MODULES = [CommonModule, FormsModule, NgxPaginationModule, ChecklistModule, Ng2SearchPipeModule, DpDatePickerModule,
  OrderModule, NgbModule, TranslateModule];
const COMPONENTS = [CommentModalComponent, EditFilterModalComponent, ConfirmModalComponent,
  TreeModalComponent, ConfigurationModalComponent];
const PIPES = [DurationPipe, StringDatePipe, DecodeSpacePipe, SafeHtmlPipe, StringDateFormatePipe,
  ByteToSizePipe, DurationFromCurrentPipe, ConvertTimePipe, GroupByPipe];
const DIRECTIVES = [TimeValidatorDirective, RegexValidator, DropdownDirective, ResizableDirective];

@NgModule({
  imports: [
    ...MODULES,
    RouterModule,
    TreeModule.forRoot()
  ],
  declarations: [
    ...COMPONENTS,
    ...PIPES,
    ...DIRECTIVES,
    ToggleComponent,
    TreeComponent,
    SubLinkComponent
  ],
  exports: [...MODULES, ...PIPES, ...DIRECTIVES,
    ToggleComponent, TreeModule, TreeComponent, SubLinkComponent],
  entryComponents: [...COMPONENTS]
})
export class SharedModule {
}
