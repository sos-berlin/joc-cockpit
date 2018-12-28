import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SelectModule } from 'ng2-select';
import { SharedModule } from '../shared/shared.module';
import { AccountsComponent, AccountModalComponent } from './accounts/accounts.component';
import { RolesComponent, RoleModal, MasterModal } from './roles/roles.component';
import { MainSectionComponent, MainSectionModalComponent, LdapSectionModalComponent, EditMainSectionModalComponent } from './main-section/main-section.component';
import { PermissionsComponent, FolderModalComponent,  PermissionModalComponent} from './permissions/permissions.component';
import { DataService } from './data.service';
import { ProfilesComponent} from './profiles/profiles.component';

@NgModule({
    imports: [
        AdminRoutingModule,
        SelectModule,
        SharedModule,
    ],
    declarations: [
        AccountsComponent,
        AdminComponent,
        RolesComponent,
        MainSectionComponent,
        ProfilesComponent,
        PermissionsComponent,
        FolderModalComponent,
        RoleModal,
        MasterModal,
        MainSectionModalComponent,
        LdapSectionModalComponent,
        EditMainSectionModalComponent,
        PermissionModalComponent,
        AccountModalComponent,
    ],
    entryComponents: [
        MainSectionModalComponent,
        LdapSectionModalComponent,
        EditMainSectionModalComponent,
        FolderModalComponent,
        PermissionModalComponent,
        AccountModalComponent,
        MasterModal,
        RoleModal,
    ], providers: [
        DataService
    ]
})
export class AdminModule { }
