import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {AuthService} from "../guard";

@Component({
  selector: 'app-approval-modal',
  templateUrl: './approval-modal.component.html'
})
export class ApprovalModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  submitted = false;
  approvalData = {
    title: '',
    approver: '',
    reason: ''
  };

  constructor(public activeModal: NzModalRef, public coreService: CoreService, public authService: AuthService) {
  }


  onSubmit(): void {
    this.submitted = true
    const obj = {
      title: this.approvalData.title,
      reason: this.approvalData.reason || '',
      approver: this.approvalData.approver,
      requestor: this.authService.currentUserData || '',
      requestUrl: this.modalData.requestUrl,
      requestBody: this.modalData.requestBody
    };
    this.coreService.post('approval/request', obj).subscribe({
      next: () => {
        this.submitted = false
        this.activeModal.close()
      }, error: () => this.submitted = false
    });
  }
}
