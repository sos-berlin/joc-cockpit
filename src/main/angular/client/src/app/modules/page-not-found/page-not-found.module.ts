import {NgModule} from '@angular/core';
import {PageNotFoundComponent} from './page-not-found.component';
import {NzResultModule} from 'ng-zorro-antd/result';
import {TranslateDirective, TranslatePipe} from '@ngx-translate/core';
import {PageNotFoundRoutingModule} from './page-not-found-routing.module';

@NgModule({
  imports: [
    NzResultModule,
    TranslatePipe,
    TranslateDirective,
    PageNotFoundRoutingModule
  ],
  declarations: [PageNotFoundComponent]
})
export class PageNotFoundModule {
}
