import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import { ApprovalsComponent } from './approvals.component';
import {ApprovalRequestComponent} from "./approval-request/approval-request.component";
import {AddApproverModalComponent, ApproversComponent} from "./approvers/approvers.component";
import {EmailSettingComponent} from "./email-setting/email-setting.component";
import {NzTabComponent} from "ng-zorro-antd/tabs";

const routes: Routes = [
  {
    path: '',
    component: ApprovalsComponent
  }
];

@NgModule({
  declarations: [
    ApprovalsComponent, ApprovalRequestComponent, ApproversComponent, AddApproverModalComponent, EmailSettingComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    NzTabComponent,
  ]
})

export class approvalsModule {
}
