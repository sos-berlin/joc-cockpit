import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';

import { SelectModule } from 'ng2-select';
import { SharedModule } from '../shared/shared.module';
import { AccountsComponent ,AccountModal } from './accounts/accounts.component';
import { RolesComponent, RoleModal, MasterModal } from './roles/roles.component';
import { MainSectionComponent, MainSectionModal, LdapSectionModal, EditMainSectionModal } from './main-section/main-section.component';
import { PermissionsComponent, FolderModal,  PermissionModal} from './permissions/permissions.component';
import { DataService } from './data.service';

@NgModule({
    imports: [
       AdminRoutingModule,
        SelectModule,
        SharedModule
    ],
    declarations: [
        AccountsComponent,
        AdminComponent,
        RolesComponent,
        MainSectionComponent,
        PermissionsComponent,
        FolderModal,
        RoleModal,
        MasterModal,
        MainSectionModal,
        LdapSectionModal,
        EditMainSectionModal,
        PermissionModal,
        AccountModal
    ],
    entryComponents: [
        MainSectionModal,
        LdapSectionModal,
        EditMainSectionModal,
        FolderModal,
        PermissionModal,
        AccountModal,
        MasterModal,
        RoleModal
    ], providers:[
        DataService
    ]
})
export class AdminModule { }
