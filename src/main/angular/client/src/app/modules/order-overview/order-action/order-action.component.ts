import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../../components/modify-modal/modify.component';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';

@Component({
  selector: 'app-order-action',
  templateUrl: './order-action.component.html'
})
export class OrderActionComponent {
  @Input() order: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;

  @Output() isChanged: EventEmitter<boolean> =   new EventEmitter();
  isVisible: boolean;

  constructor(public coreService: CoreService, private modal: NzModalService) {
  }

  change(value: boolean): void {
    this.isVisible = value;
  }

  resumeOrder(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ResumeOrderModalComponent,
      nzClassName: 'x-lg',
      nzComponentParams: {
        preferences: this.preferences,
        schedulerId: this.schedulerId,
        order: this.coreService.clone(this.order)
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isChanged.emit(true);
        setTimeout(() => {
          this.isChanged.emit(false);
        }, 5000);
      }
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
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isChanged.emit(true);
          setTimeout(() => {
            this.isChanged.emit(false);
          }, 5000);
        }
      });
    } else {
      this.isChanged.emit(true);
      this.coreService.post('orders/' + url, obj).subscribe(() => {
        setTimeout(() => {
          this.isChanged.emit(false);
        }, 5000);
      }, () => {
        this.isChanged.emit(false);
      });
    }
  }

  confirmOrder(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'confirm',
        question: this.order.question
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.restCall(false, 'Confirm', this.order, 'confirm');
      }
    });
  }

  modifyOrder(order): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ModifyStartTimeModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        order
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isChanged.emit(true);
        setTimeout(() => {
          this.isChanged.emit(false);
        }, 5000);
      }
    });
  }

  changeParameter(order): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ChangeParameterModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerId,
        orderPreparation: order.requirements,
        order: this.coreService.clone(order)
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}
