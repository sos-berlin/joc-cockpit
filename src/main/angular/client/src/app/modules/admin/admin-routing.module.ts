import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from './admin.component';
import {AccountsComponent} from './accounts/accounts.component';
import {RolesComponent} from './roles/roles.component';
import {MainSectionComponent} from './main-section/main-section.component';
import {ProfilesComponent} from './profiles/profiles.component';
import {PermissionsComponent} from './permissions/permissions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'account'},
      {path: 'account', component: AccountsComponent, data: {breadcrumb: 'breadcrumb.label.manageUser'}},
      {path: 'role', component: RolesComponent, data: {breadcrumb: 'breadcrumb.label.manageRoles'}},
      {path: 'main_section', component: MainSectionComponent, data: {breadcrumb: 'breadcrumb.label.mainSetting'}},
      {path: 'profiles', component: ProfilesComponent, data: {breadcrumb: 'breadcrumb.label.profiles'}},
      {path: 'permissions/:master.master/:role.role', component: PermissionsComponent, data: {breadcrumb: 'breadcrumb.label.permissions'}}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
