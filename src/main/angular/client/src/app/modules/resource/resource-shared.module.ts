import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe, TranslateDirective} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {SubLinkComponent} from './sub-link/sub-link.component';

const EXPORTS = [SubLinkComponent];

@NgModule({
  imports: [
    CommonModule,
    TranslatePipe,
    TranslateDirective,
    RouterModule
  ],
  declarations: [
    ...EXPORTS
  ],
  exports: [...EXPORTS]
})
export class ResourceSharedModule {
}
