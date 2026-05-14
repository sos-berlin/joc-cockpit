import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {SubLinkComponent} from './sub-link/sub-link.component';
import {SharedModule} from '../shared/shared.module';

const EXPORTS = [SubLinkComponent];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    ...EXPORTS
  ],
  exports: [...EXPORTS]
})
export class ResourceSharedModule {
}
