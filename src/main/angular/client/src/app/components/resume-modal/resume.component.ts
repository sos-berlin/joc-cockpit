import {Component, Input, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-resume-order',
  templateUrl: './resume-order-dialog.html',
})

export class ResumeOrderModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() permission: any;
  @Input() preferences: any;
  @Input() order: any;
  display: any;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  positions: any = [];

  constructor(public coreService: CoreService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    this.order.timeZone = this.preferences.zone;
    this.order.fromTime = new Date();

    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
    this.order.position = JSON.stringify(this.order.position);
    this.positions.push(this.order.position);
  }

  onSubmit() {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId, orderIds: [this.order.orderId]
    };
    if (this.order.position) {
      obj.position = JSON.parse(this.order.position);
    }
    obj.auditLog = {};
    if (this.comments.comment) {
      obj.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      obj.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      obj.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.coreService.post('orders/resume', obj).subscribe((res: any) => {
      this.submitted = false;
      this.activeModal.close('Done');
    }, err => {
      this.submitted = false;
    });
  }

  cancel() {
    this.activeModal.dismiss('');
  }

}
