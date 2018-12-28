import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuditLogComponent} from './audit-log.component';

const routes: Routes = [
  {
    path: '',
    component: AuditLogComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditLogRoutingModule {
}
