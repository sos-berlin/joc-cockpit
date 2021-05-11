import {NgModule} from '@angular/core';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminComponent} from './admin.component';
import {SharedModule} from '../shared/shared.module';
import {AccountsComponent, AccountModalComponent} from './accounts/accounts.component';
import {RolesComponent, RoleModalComponent, ControllerModalComponent} from './roles/roles.component';
import {
  MainSectionComponent, MainSectionModalComponent, LdapSectionModalComponent,
  EditMainSectionModalComponent
} from './main-section/main-section.component';
import {PermissionsComponent, FolderModalComponent, PermissionModalComponent} from './permissions/permissions.component';
import {DataService} from './data.service';
import {ProfilesComponent} from './profiles/profiles.component';

@NgModule({
  imports: [
    AdminRoutingModule,
    DragDropModule,
    SharedModule
  ],
  declarations: [
    MainSectionModalComponent,
    LdapSectionModalComponent,
    EditMainSectionModalComponent,
    FolderModalComponent,
    PermissionModalComponent,
    AccountModalComponent,
    ControllerModalComponent,
    RoleModalComponent,
    AccountsComponent,
    AdminComponent,
    RolesComponent,
    MainSectionComponent,
    ProfilesComponent,
    PermissionsComponent
  ],
  providers: [
    DataService
  ]
})
export class AdminModule {
}
