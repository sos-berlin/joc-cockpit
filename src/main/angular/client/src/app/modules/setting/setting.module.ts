import {NgModule} from '@angular/core';
import {FileUploadModule} from 'ng2-file-upload';
import {AddSectionComponent, ImportSettingComponent, SettingComponent} from './setting.component';
import { SharedModule } from '../shared/shared.module';
import {SettingRoutingModule} from './setting-routing.module';

@NgModule({
  declarations: [
    SettingComponent,
    AddSectionComponent,
    ImportSettingComponent
  ],
  imports: [
    SharedModule,
    SettingRoutingModule,
    FileUploadModule
  ],
  entryComponents: [AddSectionComponent, ImportSettingComponent]
})
export class SettingModule {

}
