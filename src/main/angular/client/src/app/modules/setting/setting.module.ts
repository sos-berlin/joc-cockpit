import {NgModule} from '@angular/core';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {SettingComponent} from './setting.component';
import {SharedModule} from '../shared/shared.module';
import {SettingRoutingModule} from './setting-routing.module';

@NgModule({
  declarations: [
    SettingComponent
  ],
  imports: [
    SharedModule,
    SettingRoutingModule,
    NzPopoverModule
  ]
})
export class SettingModule {

}
