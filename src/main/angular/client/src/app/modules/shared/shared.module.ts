import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {OrderModule} from 'ngx-order-pipe';
import {NgxPaginationModule} from 'ngx-pagination';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {ChecklistModule} from 'angular-checklist';
import {DpDatePickerModule} from 'ng2-date-picker';
import {TreeModule} from 'angular-tree-component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {ToggleComponent} from '../../components/toggle/toggle.component';
import {CommentModal} from '../../components/comment-modal/comment.component';
import { TreeComponent } from '../../components/tree-navigation/tree.component';
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
import {EditFilterModal} from "../../components/filter-modal/filter.component";
import {TreeModal} from '../../components/tree-modal/tree.component';
import {DeleteModal} from "../../components/delete-modal/delete.component";
import {ConfigurationModal} from "../../components/configuration-modal/configuration.component";
import {DropdownDirective, RegexValidator, ResizableDirective, TimeValidator} from "../../directives/core.directive";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChecklistModule,
    Ng2SearchPipeModule,
    DpDatePickerModule,
    TreeModule,
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
    CommentModal,
    EditFilterModal,
    DeleteModal,
    TreeModal,
    ConfigurationModal,
    TreeComponent,
    TimeValidator,
    RegexValidator,
    DropdownDirective,
    ResizableDirective
  ],
  exports: [CommonModule, FormsModule,
    DurationPipe, StringDatePipe, DecodeSpacePipe, ByteToSizePipe, DurationFromCurrentPipe, ConvertTimePipe, GroupByPipe, OrderModule, NgxPaginationModule,
    StringDateFormatePipe, Ng2SearchPipeModule, ChecklistModule, ToggleComponent, DpDatePickerModule, TreeModule, TranslateModule, NgbModule, TreeComponent,
    TimeValidator, RegexValidator, DropdownDirective, ResizableDirective],
  entryComponents: [CommentModal, EditFilterModal, DeleteModal, TreeModal, ConfigurationModal]
})
export class SharedModule {
}
