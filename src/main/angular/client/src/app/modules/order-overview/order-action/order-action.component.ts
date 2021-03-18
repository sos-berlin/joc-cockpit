import {Component, OnInit, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'underscore';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../../components/modify-modal/modify.component';

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
  zones = [];

  constructor(public coreService: CoreService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
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
    this.order.at = 'now';
  }

  onSubmit() {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId,
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
export class OrderActionComponent {

  @Input() order: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;

  constructor(public modalService: NgbModal, public coreService: CoreService) {
  }

  startOrder(order) {
    const obj: any = {
      controllerId: this.schedulerId,
      orders: []
    };
    let _order: any = {workflowPath: order.workflowId.path, orderId: order.orderId};
    _order.scheduledFor = 'now';
    obj.orders.push(_order);
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Order',
        operation: 'Start',
        name: order.orderId
      };
      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'orders/add';
      modalRef.result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log('close...', reason);
      });
    } else {
      this.coreService.post('orders/add', obj).subscribe((res: any) => {

      }, err => {

      });
    }
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


  resumeOrder() {
    const modalRef = this.modalService.open(ResumeOrderModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.order = this.coreService.clone(this.order);
    modalRef.result.then((result) => {
      console.log(result);
    }, () => {

    });

  }

  suspendOrder(order) {
    this.restCall(false, 'Suspend', order, 'suspend');
  }

  suspendOrderWithKill() {
    this.restCall(true, 'Suspend', this.order, 'suspend');
  }

  cancelOrder(order) {
    this.restCall(false, 'Cancel', this.order, 'cancel');
  }

  cancelOrderWithKill() {
    this.restCall(true, 'Cancel', this.order, 'cancel');
  }

  removeWhenTerminated() {
    this.restCall(true, 'Terminate', this.order, 'remove_when_terminated');
  }

  private restCall(isKill, type, order, url) {
    const obj: any = {
      controllerId: this.schedulerId, orderIds: [order.orderId], kill: isKill
    };
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Order',
        operation: type,
        name: order.orderId
      };
      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'orders/' + url;
      modalRef.result.then((result) => {
        console.log(result);
      }, (reason) => {
        console.log('close...', reason);
      });
    } else {
      this.coreService.post('orders/' + url, obj).subscribe(() => {
      });
    }
  }

  modifyOrder(order) {
    const modalRef = this.modalService.open(ModifyStartTimeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.order = order;
    modalRef.result.then((res) => {

    }, () => {

    });
  }

  changeParameter(order) {
    const modalRef = this.modalService.open(ChangeParameterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.order = this.coreService.clone(order);
    modalRef.componentInstance.orderRequirements = order.requirements;
    modalRef.result.then((result) => {
      if (order && order.show) {
        console.log(result);
      }
    }, () => {
    });
  }
}
