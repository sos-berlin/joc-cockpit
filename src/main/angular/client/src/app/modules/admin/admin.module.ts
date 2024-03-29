import {NgModule} from '@angular/core';
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {NzAutocompleteModule} from "ng-zorro-antd/auto-complete";
import {AdminRoutingModule} from './admin-routing.module';
import {AdminComponent} from './admin.component';
import {SharedModule} from '../shared/shared.module';
import {AccountsComponent, AccountModalComponent, ConfirmationModalComponent} from './accounts/accounts.component';
import {RolesComponent, RoleModalComponent, ControllerModalComponent} from './roles/roles.component';
import {
  PermissionsComponent,
  FolderModalComponent,
  PermissionModalComponent
} from './permissions/permissions.component';
import {DataService} from './data.service';
import {ProfilesComponent} from './profiles/profiles.component';
import {
  IdentityServiceComponent,
  IdentityServiceModalComponent,
  SettingModalComponent
} from './identity-service/identity-service.component';
import {SessionTimeRegexValidator} from '../../directives/core.directive';
import {ShowPermissionComponent} from './show-permission/show-permission.component';
import {AddBlocklistModalComponent, BlocklistComponent} from './blocklist/blocklist.component';
import {SessionManagementComponent} from './session-management/session-management.component';
import {PendingRequestsComponent} from './pending-requests/pending-requests.component';

@NgModule({
  imports: [
    AdminRoutingModule,
    SharedModule,
    NzTabsModule,
    NzAutocompleteModule
  ],
  declarations: [
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
    ProfilesComponent,
    PermissionsComponent,
    SessionTimeRegexValidator,
    ConfirmationModalComponent,
    ShowPermissionComponent,
    BlocklistComponent,
    AddBlocklistModalComponent,
    SessionManagementComponent,
    PendingRequestsComponent
  ],
  providers: [
    DataService
  ]
})
export class AdminModule {
}
