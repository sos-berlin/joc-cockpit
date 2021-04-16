import {Component, OnInit, Input} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
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

  constructor(public coreService: CoreService, private modal: NzModalRef) {
  }

  ngOnInit(): void {
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

  onSubmit(): void {
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
      this.modal.close('Done');
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

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      this.addArgument();
    }
  }

  cancel(): void {
    this.modal.destroy('');
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

  constructor(public coreService: CoreService, private modal: NzModalService) {
  }

  startOrder(order): void {
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
      this.modal.create({
        nzTitle: null,
        nzContent: CommentModalComponent,
nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'orders/add'
        },
        nzFooter: null,
        nzClosable: false
      });
    } else {
      this.coreService.post('orders/add', obj).subscribe((res: any) => {

      }, () => {

      });
    }
  }

  startOrderAt(): void {
    this.modal.create({
      nzTitle: null,
      nzContent: StartOrderModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerId,
        order: this.order
      },
      nzFooter: null,
      nzClosable: false
    });
  }


  resumeOrder(): void {
    this.modal.create({
      nzTitle: null,
      nzContent: ResumeOrderModalComponent,
      nzComponentParams: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerId,
        order: this.coreService.clone(this.order)
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  suspendOrder(order): void {
    this.restCall(false, 'Suspend', order, 'suspend');
  }

  suspendOrderWithKill(): void {
    this.restCall(true, 'Suspend', this.order, 'suspend');
  }

  cancelOrder(order): void {
    this.restCall(false, 'Cancel', order, 'cancel');
  }

  cancelOrderWithKill(): void {
    this.restCall(true, 'Cancel', this.order, 'cancel');
  }

  removeWhenTerminated(): void {
    this.restCall(true, 'Terminate', this.order, 'remove_when_terminated');
  }

  private restCall(isKill, type, order, url): void {
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
      this.modal.create({
        nzTitle: null,
        nzContent: CommentModalComponent,
nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
        nzClosable: false
      });
    } else {
      this.coreService.post('orders/' + url, obj).subscribe(() => {
      });
    }
  }

  modifyOrder(order): void {
    this.modal.create({
      nzTitle: null,
      nzContent: ModifyStartTimeModalComponent,
      nzComponentParams: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        order
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  changeParameter(order): void {
    this.modal.create({
      nzTitle: null,
      nzContent: ChangeParameterModalComponent,
      nzComponentParams: {
        schedulerId: this.schedulerId,
        orderRequirements: order.requirements,
        order: this.coreService.clone(order)
      },
      nzFooter: null,
      nzClosable: false
    });
  }
}
