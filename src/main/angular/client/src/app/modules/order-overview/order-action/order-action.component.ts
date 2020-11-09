import {Component, OnInit, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../../services/core.service';
import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
  selector: 'app-start-order',
  templateUrl: './start-order-dialog.html',
})

export class StartOrderModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() permission: any;
  @Input() preferences: any;
  @Input() order: any;
  display: any;
  arguments: any = [];
  messageList: any;
  dateFormat: any;
  required = false;
  submitted = false;
  comments: any = {};
  zones = moment.tz.names();

  constructor(public coreService: CoreService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    console.log(this.order)
    this.order.timeZone = this.preferences.zone;
    this.order.fromTime = new Date();

    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
    this.order.at = 'now';
  }

  onSubmit() {
    this.submitted = true;
    const obj: any = {
      jobschedulerId: this.schedulerId,
      orders: []
    };
    if (this.order.fromDate && this.order.fromTime) {
      this.order.fromDate.setHours(moment(this.order.fromTime).hours());
      this.order.fromDate.setMinutes(moment(this.order.fromTime).minutes());
      this.order.fromDate.setSeconds(moment(this.order.fromTime).seconds());
      this.order.fromDate.setMilliseconds(0);
    }
    let order: any = {workflowPath: this.order.workflowId.path, orderId: this.order.orderId};
    if (this.order.at === 'now') {
      order.scheduledFor = 'now';
    } else if (this.order.at === 'later') {
      order.scheduledFor = 'now + ' + this.order.atTime;
    } else {
      if (this.order.fromDate) {
        order.scheduledFor = moment(this.order.fromDate).format('YYYY-MM-DD HH:mm:ss');
        order.timeZone = this.order.timeZone;
      }
    }
    if (this.arguments.length > 0) {
      order.arguments = _.object(_.map(this.arguments, _.values));
    }
    obj.orders.push(order);
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

    this.coreService.post('orders/add', obj).subscribe((res: any) => {
      this.submitted = false;
      this.activeModal.close('Done');
    }, err => {
      this.submitted = false;
    });
  }

  addArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.arguments, 'name', '')) {
        this.arguments.push(param);
      }
    }
  }

  removeArgument(index): void {
    this.arguments.splice(index, 1);
  }

  onKeyPress($event) {
    if ($event.which === '13' || $event.which === 13) {
      this.addArgument();
    }
  }

  cancel() {
    this.activeModal.dismiss('');
  }

}

@Component({
  selector: 'app-order-action',
  templateUrl: './order-action.component.html'
})
export class OrderActionComponent implements OnInit {

  @Input() order: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;

  constructor(public modalService: NgbModal, public coreService: CoreService) {
  }

  ngOnInit() {

  }

  startOrder() {
    const obj: any = {
      jobschedulerId: this.schedulerId,
      orders: []
    };
    let _order: any = {workflowPath: this.order.workflowId.path, orderId: this.order.orderId};
    _order.scheduledFor = 'now';
    obj.orders.push(_order);
    this.coreService.post('orders/add', obj).subscribe((res: any) => {

    }, err => {

    });
  }

  startOrderAt() {
    const modalRef = this.modalService.open(StartOrderModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.order = this.order;
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  suspendOrder() {
    this.coreService.post('orders/suspend', {
      jobschedulerId: this.schedulerId, orderIds: [this.order.orderId]
    }).subscribe(() => {
    });
  }

  resumeOrder() {
    this.coreService.post('orders/resume', {
      jobschedulerId: this.schedulerId, orderIds: [this.order.orderId]
    }).subscribe(() => {
    });
  }

  cancelOrder() {
    this.coreService.post('orders/cancel', {
      jobschedulerId: this.schedulerId, orderIds: [this.order.orderId]
    }).subscribe(() => {
    });
  }

}
