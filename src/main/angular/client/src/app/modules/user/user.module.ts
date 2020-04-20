import {NgModule} from '@angular/core';
import {ImportKeyModalComponent, UpdateKeyModalComponent, UserComponent} from './user.component';
import { SharedModule } from '../shared/shared.module';
import {UserRoutingModule} from './user-routing.module';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  declarations: [
    UserComponent,
    ImportKeyModalComponent,
    UpdateKeyModalComponent
  ],
  imports: [
    SharedModule,
    UserRoutingModule,
    FileUploadModule
  ],
  entryComponents: [ImportKeyModalComponent, UpdateKeyModalComponent]
})
export class UserModule {

}
