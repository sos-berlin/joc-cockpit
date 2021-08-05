import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {
  DecodeSpacePipe,
  SafeHtmlPipe,
  SearchPipe,
  HighlightSearch,
  StringDatePipe,
  StringTimePipe,
  TimeInStringFormatPipe
} from '../../pipes/core.pipe';
import {BreadcrumbsComponent} from '../../components/breadcrumbs/breadcrumbs.component';
import {OrderActionComponent} from '../order-overview/order-action/order-action.component';
import {EmptyDataComponent} from '../../components/empty-data/empty-data.component';
import {Shared3Module} from './shared3.module';

const MODULES = [Shared3Module, PerfectScrollbarModule, NzEmptyModule];
const PIPES = [StringDatePipe, TimeInStringFormatPipe, StringTimePipe, DecodeSpacePipe, SafeHtmlPipe, SearchPipe, HighlightSearch];
const EXPORTS = [...PIPES, EmptyDataComponent, BreadcrumbsComponent, OrderActionComponent];

@NgModule({
  imports: [
    ...MODULES,
    RouterModule
  ],
  declarations: [
    ...EXPORTS
  ],
  providers: [TimeInStringFormatPipe, StringDatePipe],
  exports: [...MODULES, ...EXPORTS]
})
export class Shared2Module {
}
