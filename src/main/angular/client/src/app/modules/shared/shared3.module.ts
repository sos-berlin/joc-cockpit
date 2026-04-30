import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzTooltipDirective, NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzPopoverModule} from "ng-zorro-antd/popover";
import {OverlayModule} from '@angular/cdk/overlay';
import {
  AboutModalComponent,
  InfoMenuComponent,
  StepGuideComponent
} from '../../components/info-menu/info-menu.component';
import {RichTooltipDirective} from '../../directives/rich-tooltip.directive';
import {RichTooltipContentComponent} from '../../components/rich-tooltip/rich-tooltip-content.component';

const MODULES = [CommonModule, FormsModule, TranslateModule, NzToolTipModule, NzPopoverModule,
  NzModalModule, NzDropDownModule, OverlayModule];
const EXPORTS = [InfoMenuComponent];

@NgModule({
    imports: [
        ...MODULES,
        NzTooltipDirective,
    ],
  declarations: [
    ...EXPORTS,
    AboutModalComponent,
    StepGuideComponent,
    RichTooltipDirective,
    RichTooltipContentComponent,
  ],
  exports: [...MODULES, ...EXPORTS, RichTooltipDirective, RichTooltipContentComponent]
})
export class Shared3Module {
}
