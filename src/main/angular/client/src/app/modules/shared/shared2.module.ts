import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {EmptyDataComponent} from '../../components/empty-data/empty-data.component';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {CommonModule} from '@angular/common';
import {NzResultModule} from 'ng-zorro-antd/result';
import {FormsModule} from '@angular/forms';
import {
  DecodeSpacePipe,
  SafeHtmlPipe, SearchPipe,
  StringDatePipe,
  StringTimePipe
} from '../../filters/filter.pipe';
import {SubLinkComponent} from '../resource/sub-link/sub-link.component';
import {BreadcrumbsComponent} from '../../components/breadcrumbs/breadcrumbs.component';
import {TypeComponent} from '../../components/workflow-type/type.component';

const MODULES = [CommonModule, FormsModule, NgbModalModule, NzDropDownModule, NzResultModule, TranslateModule, NzEmptyModule];
const PIPES = [StringDatePipe, StringTimePipe, DecodeSpacePipe, SafeHtmlPipe, SearchPipe];
const EXPORTS = [...PIPES,  EmptyDataComponent, SubLinkComponent, BreadcrumbsComponent, TypeComponent];

@NgModule({
  imports: [
    ...MODULES,
    RouterModule
  ],
  declarations: [
    ...EXPORTS
  ],
  exports: [...MODULES, ...EXPORTS]
})
export class Shared2Module {
}
