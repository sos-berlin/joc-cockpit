import {NgModule} from '@angular/core';
import {SubLinkComponent} from './sub-link/sub-link.component';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';

const EXPORTS = [SubLinkComponent];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule
  ],
  declarations: [
    ...EXPORTS
  ],
  exports: [...EXPORTS]
})
export class ResourceSharedModule {
}
