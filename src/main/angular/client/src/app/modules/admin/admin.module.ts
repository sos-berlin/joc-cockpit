import {NgModule} from '@angular/core';
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {FileUploadModule} from 'ng2-file-upload';
import {NzAutocompleteModule} from "ng-zorro-antd/auto-complete";
import {AdminRoutingModule} from './admin-routing.module';
import {AdminComponent} from './admin.component';
import {SharedModule} from '../shared/shared.module';
import {AccountsComponent, AccountModalComponent, ConfirmationModalComponent} from './accounts/accounts.component';
import {RolesComponent, RoleModalComponent, ControllerModalComponent} from './roles/roles.component';
import {
  MainSectionComponent, MainSectionModalComponent, LdapSectionModalComponent,
  EditMainSectionModalComponent
} from './main-section/main-section.component';
import {PermissionsComponent, FolderModalComponent, PermissionModalComponent} from './permissions/permissions.component';
import {DataService} from './data.service';
import {ProfilesComponent} from './profiles/profiles.component';
import {
  IdentityServiceComponent,
  IdentityServiceModalComponent,
  SettingModalComponent
} from './identity-service/identity-service.component';
import {SessionTimeRegexValidator} from '../../directives/core.directive';
import {ShowPermissionComponent} from './show-permission/show-permission.component';
import {UploadModalComponent} from "./upload/upload.component";

@NgModule({
  imports: [
    AdminRoutingModule,
    FileUploadModule,
    SharedModule,
    NzTabsModule,
    NzAutocompleteModule
  ],
  declarations: [
    MainSectionModalComponent,
    LdapSectionModalComponent,
    EditMainSectionModalComponent,
    FolderModalComponent,
    PermissionModalComponent,
    AccountModalComponent,
    SettingModalComponent,
    IdentityServiceModalComponent,
    ControllerModalComponent,
    RoleModalComponent,
    AccountsComponent,
    IdentityServiceComponent,
    AdminComponent,
    RolesComponent,
    MainSectionComponent,
    ProfilesComponent,
    PermissionsComponent,
    SessionTimeRegexValidator,
    ConfirmationModalComponent,
    UploadModalComponent,
    ShowPermissionComponent
  ],
  providers: [
    DataService
  ]
})
export class AdminModule {
}
