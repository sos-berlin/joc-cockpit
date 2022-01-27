import {NgModule} from '@angular/core';
import {
  ImportKeyModalComponent,
  UpdateKeyModalComponent,
  UserComponent,
  GenerateKeyComponent,
  ChangePasswordComponent
} from './user.component';
import {FileUploadModule} from 'ng2-file-upload';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import { SharedModule } from '../shared/shared.module';
import {UserRoutingModule} from './user-routing.module';

@NgModule({
  declarations: [
    UserComponent,
    ImportKeyModalComponent,
    UpdateKeyModalComponent,
    GenerateKeyComponent,
    ChangePasswordComponent
  ],
  imports: [
    SharedModule,
    NzTabsModule,
    UserRoutingModule,
    FileUploadModule
  ]
})
export class UserModule {

}
