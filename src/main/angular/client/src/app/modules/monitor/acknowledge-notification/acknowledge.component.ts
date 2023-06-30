import {Component, OnInit, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';

@Component({
  selector: 'app-acknowledge-modal',
  templateUrl: './acknowledge.dialog.html'
})
export class AcknowledgeModalComponent implements OnInit {
  @Input() data: any;
  @Input() type: any;
  submitted = false;
  comment: string;
  display = false;
  required = false;
  comments: any = {};

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
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
