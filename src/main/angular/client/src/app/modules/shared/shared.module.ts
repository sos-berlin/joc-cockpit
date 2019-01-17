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
  GroupByPipe
} from '../../filters/filter.pipe';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {DeleteModalComponent} from '../../components/delete-modal/delete.component';
import {ConfigurationModalComponent} from '../../components/configuration-modal/configuration.component';
import {DropdownDirective, RegexValidator, ResizableDirective, TimeValidatorDirective} from '../../directives/core.directive';
import {SubLinkComponent} from '../resource/sub-link/sub-link.component';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ChecklistModule,
    Ng2SearchPipeModule,
    DpDatePickerModule,
    TreeModule.forRoot(),
    OrderModule,
    TranslateModule,
    NgbModule
  ],
  declarations: [
    DurationPipe,
    StringDatePipe,
    DecodeSpacePipe,
    ByteToSizePipe,
    DurationFromCurrentPipe,
    ConvertTimePipe,
    GroupByPipe,
    StringDateFormatePipe,
    ToggleComponent,
    CommentModalComponent,
    EditFilterModalComponent,
    DeleteModalComponent,
    TreeModalComponent,
    ConfigurationModalComponent,
    TreeComponent,
    SubLinkComponent,
    TimeValidatorDirective,
    RegexValidator,
    DropdownDirective,
    ResizableDirective
  ],
  exports: [CommonModule, FormsModule, DurationPipe, StringDatePipe, DecodeSpacePipe,
    ByteToSizePipe, DurationFromCurrentPipe, ConvertTimePipe, GroupByPipe, OrderModule,
    NgxPaginationModule, StringDateFormatePipe, Ng2SearchPipeModule, ChecklistModule, ToggleComponent,
    DpDatePickerModule, TreeModule, TranslateModule, NgbModule, TreeComponent, SubLinkComponent,
    TimeValidatorDirective, RegexValidator, DropdownDirective, ResizableDirective],
  entryComponents: [CommentModalComponent, EditFilterModalComponent, DeleteModalComponent, TreeModalComponent, ConfigurationModalComponent]
})
export class SharedModule {
}
