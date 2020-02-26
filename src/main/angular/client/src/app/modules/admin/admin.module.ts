import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SelectModule } from 'ng2-select';
import { SharedModule } from '../shared/shared.module';
import { AccountsComponent, AccountModalComponent } from './accounts/accounts.component';
import { RolesComponent, RoleModalComponent, MasterModalComponent } from './roles/roles.component';
import { MainSectionComponent, MainSectionModalComponent, LdapSectionModalComponent,
  EditMainSectionModalComponent } from './main-section/main-section.component';
import { PermissionsComponent, FolderModalComponent,  PermissionModalComponent} from './permissions/permissions.component';
import { DataService } from './data.service';
import { ProfilesComponent} from './profiles/profiles.component';

const ENTRYCOMPONENTS = [MainSectionModalComponent,
  LdapSectionModalComponent,
  EditMainSectionModalComponent,
  FolderModalComponent,
  PermissionModalComponent,
  AccountModalComponent,
  MasterModalComponent,
  RoleModalComponent];
@NgModule({
  imports: [
    AdminRoutingModule,
    SelectModule,
    SharedModule,
  ],
  declarations: [
    ...ENTRYCOMPONENTS,
    AccountsComponent,
    AdminComponent,
    RolesComponent,
    MainSectionComponent,
    ProfilesComponent,
    PermissionsComponent
  ],
  entryComponents: [
    ENTRYCOMPONENTS
  ], providers: [
    DataService
  ]
})
export class AdminModule { }
