import {NgModule} from '@angular/core';
import {ImportKeyModalComponent, UpdateKeyModalComponent, UserComponent, GenerateKeyComponent} from './user.component';
import { SharedModule } from '../shared/shared.module';
import {UserRoutingModule} from './user-routing.module';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  declarations: [
    UserComponent,
    ImportKeyModalComponent,
    UpdateKeyModalComponent,
    GenerateKeyComponent
  ],
  imports: [
    SharedModule,
    UserRoutingModule,
    FileUploadModule
  ],
  entryComponents: [ImportKeyModalComponent, UpdateKeyModalComponent, GenerateKeyComponent]
})
export class UserModule {

}
