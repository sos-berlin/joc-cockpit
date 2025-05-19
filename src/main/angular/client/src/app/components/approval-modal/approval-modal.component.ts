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
  approvers: any;
  edit: false;
  approvalData = {
    title: '',
    approver: '',
    reason: ''
  };
  filterApprover = (input: string, option: { nzLabel: string; nzValue: string }) =>
    option.nzLabel.toLowerCase().includes(input.toLowerCase());

  constructor(public activeModal: NzModalRef, public coreService: CoreService, public authService: AuthService) {
  }

  ngOnInit(): void{
    this.approvers = this.modalData.approvers
    this.edit = this.modalData.edit
    if(this.edit){
      console.log(this.modalData.approvalData,"this.modalData.approvalData")
      this.approvalData = this.modalData.approvalData
    }
  }

  onSubmit(): void {
    if(this.edit){
      this.submitted = true
      const obj = this.approvalData
      this.coreService.post('approval/edit', obj).subscribe({
        next: () => {
          this.submitted = false
          this.activeModal.close(true)
        }, error: () => this.submitted = false
      });
    }else {
      this.submitted = true
      const obj = {
        title: this.approvalData.title,
        reason: this.approvalData.reason || '',
        approver: this.approvalData.approver,
        requestor: this.authService.currentUserData || '',
        requestUrl: this.modalData.requestUrl,
        requestBody: this.modalData.requestBody,
        category: this.modalData.category
      };
      this.coreService.post('approval/request', obj).subscribe({
        next: () => {
          this.submitted = false
          this.activeModal.close()
        }, error: () => this.submitted = false
      });
    }
  }
}
