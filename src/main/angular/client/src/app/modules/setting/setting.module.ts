import {NgModule} from '@angular/core';
import {FileUploadModule} from 'ng2-file-upload';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {ImportSettingComponent, SettingComponent} from './setting.component';
import {SharedModule} from '../shared/shared.module';
import {SettingRoutingModule} from './setting-routing.module';

@NgModule({
  declarations: [
    SettingComponent,
    ImportSettingComponent
  ],
  imports: [
    SharedModule,
    SettingRoutingModule,
    FileUploadModule,
    NzPopoverModule
  ]
})
export class SettingModule {

}
