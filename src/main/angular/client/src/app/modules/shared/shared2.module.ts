import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTreeModule} from 'ng-zorro-antd/tree';
import {BreadcrumbsComponent} from '../../components/breadcrumbs/breadcrumbs.component';
import {OrderActionComponent} from '../order-overview/order-action/order-action.component';
import {EmptyDataComponent} from '../../components/empty-data/empty-data.component';
import {PerfectScrollbarModule} from "../perfect-scrollbar/perfect-scrollbar.module";
import {
  DecodeSpacePipe,
  SafeHtmlPipe,
  SearchPipe,
  OrderPipe,
  HighlightSearch,
  StringDatePipe,
  StringTimePipe,
  TimeInStringFormatPipe,
  StringToLinkPipe
} from '../../pipes/core.pipe';
import {Shared3Module} from './shared3.module';

const MODULES = [Shared3Module, PerfectScrollbarModule, NzEmptyModule, NzCheckboxModule, NzTreeModule, NzIconModule];
const PIPES = [StringDatePipe, TimeInStringFormatPipe, StringTimePipe, DecodeSpacePipe, SafeHtmlPipe, SearchPipe, OrderPipe, HighlightSearch, StringToLinkPipe];
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
