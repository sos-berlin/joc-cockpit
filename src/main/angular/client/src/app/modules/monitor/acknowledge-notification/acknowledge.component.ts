import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';

@Component({
  selector: 'app-acknowledge-modal',
  templateUrl: './acknowledge.dialog.html'
})
export class AcknowledgeModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  type: any;
  submitted = false;
  comment: string;
  display = false;
  required = false;
  comments: any = {};

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    this.type = this.modalData.type;

    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const auditLog: any = {};
    this.coreService.getAuditLogObj(this.comments, auditLog);
    this.coreService.post(this.type == 'SYSTEM' ? 'monitoring/sysnotification/acknowledge' : 'monitoring/notification/acknowledge', {
      ...this.data, ...{comment: this.comment, auditLog}
    }).subscribe({
      next: res => {
        this.activeModal.close(res);
      }, error: () => this.submitted = false
    });
  }
}
