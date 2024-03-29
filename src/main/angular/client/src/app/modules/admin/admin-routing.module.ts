import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from './admin.component';
import {AccountsComponent} from './accounts/accounts.component';
import {RolesComponent} from './roles/roles.component';
import {ProfilesComponent} from './profiles/profiles.component';
import {PermissionsComponent} from './permissions/permissions.component';
import {IdentityServiceComponent} from './identity-service/identity-service.component';
import {PendingRequestsComponent} from './pending-requests/pending-requests.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    data: {breadcrumb: 'breadcrumb.label.manageIdentityServices'},
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'identity_service'},
      {path: 'identity_service', component: IdentityServiceComponent},
      {
        path: 'identity_service/account',
        component: AccountsComponent,
        data: {breadcrumb: 'breadcrumb.label.manageUser'}
      },
      {path: 'identity_service/role', component: RolesComponent, data: {breadcrumb: 'breadcrumb.label.manageRoles'}},
      {
        path: 'identity_service/profiles',
        component: ProfilesComponent,
        data: {breadcrumb: 'breadcrumb.label.profiles'}
      },
      {
        path: 'identity_service/permissions/:controller.controller/:role.role',
        component: PermissionsComponent,
        data: {breadcrumb: 'breadcrumb.label.permissions'}
      },
      {
        path: 'identity_service/pending_requests',
        component: PendingRequestsComponent,
        data: {breadcrumb: 'breadcrumb.label.pendingRequests'}
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
