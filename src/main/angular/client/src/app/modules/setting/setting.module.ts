import {NgModule} from '@angular/core';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {SettingComponent} from './setting.component';
import {SharedModule} from '../shared/shared.module';
import {SettingRoutingModule} from './setting-routing.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {ClipboardModule} from "ngx-clipboard";

@NgModule({
  declarations: [
    SettingComponent
  ],
  imports: [
    SharedModule,
    SettingRoutingModule,
    NzPopoverModule,
    NzTooltipDirective,
    ClipboardModule
  ]
})
export class SettingModule {

}
