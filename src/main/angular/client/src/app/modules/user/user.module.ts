import {NgModule} from '@angular/core';
import {
  ImportKeyModalComponent,
  UpdateKeyModalComponent,
  UserComponent,
  GenerateKeyComponent,
  GitModalComponent,
  FavoriteListComponent,
  EditFavoriteModalComponent,
  RemoveKeyModalComponent
} from './user.component';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {SharedModule} from '../shared/shared.module';
import {UserRoutingModule} from './user-routing.module';

@NgModule({
  declarations: [
    UserComponent,
    ImportKeyModalComponent,
    UpdateKeyModalComponent,
    GitModalComponent,
    GenerateKeyComponent,
    FavoriteListComponent,
    EditFavoriteModalComponent,
    RemoveKeyModalComponent,
  ],
  imports: [
    SharedModule,
    NzTabsModule,
    UserRoutingModule
  ]
})
export class UserModule {

}
