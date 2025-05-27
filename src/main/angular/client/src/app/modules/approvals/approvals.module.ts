import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import { ApprovalsComponent } from './approvals.component';
import {ApprovalRequestComponent} from "./approval-request/approval-request.component";
import {AddApproverModalComponent, ApproversComponent} from "./approvers/approvers.component";

const routes: Routes = [
  {
    path: '',
    component: ApprovalsComponent
  }
];

@NgModule({
  declarations: [
    ApprovalsComponent, ApprovalRequestComponent, ApproversComponent, AddApproverModalComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
  ]
})

export class approvalsModule {
}
