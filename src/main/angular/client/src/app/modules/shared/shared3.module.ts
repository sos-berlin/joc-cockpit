import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {AboutModalComponent, InfoMenuComponent, StepGuideComponent} from '../../components/info-menu/info-menu.component';

const MODULES = [CommonModule, FormsModule, TranslateModule, NzToolTipModule,
  NzIconModule, NzModalModule, NzDropDownModule];
const EXPORTS = [InfoMenuComponent];

@NgModule({
  imports: [
    ...MODULES,
  ],
  declarations: [
    ...EXPORTS,
    AboutModalComponent,
    StepGuideComponent
  ],
  exports: [...MODULES, ...EXPORTS]
})
export class Shared3Module {
}
