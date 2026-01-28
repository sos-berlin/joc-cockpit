import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {AuthService} from "../guard";

@Component({
  standalone: false,
  selector: 'app-approval-modal',
  templateUrl: './approval-modal.component.html'
})
export class ApprovalModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  submitted = false;
  approvers: any;
  preferences: any = {};
  edit: false;
  approvalData = {
    title: '',
    approver: '',
    reason: ''
  };
  filterApprover = (input: string, option: { nzLabel: string; nzValue: string }) =>
    option.nzLabel.toLowerCase().includes(input.toLowerCase());

  constructor(public activeModal: NzModalRef,private modal: NzModalService,public coreService: CoreService, public authService: AuthService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.edit = this.modalData.edit;
    if (this.edit) {
      this.approvalData = this.modalData.approvalData;
      this.approvers =  this.modalData.approvers || [];
    } else {
      this.approvers = this.modalData.approvers || [];
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

  helpPage(key): void{
    this.coreService.openHelpPage(key);
  }
}
