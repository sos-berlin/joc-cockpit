import {Component, Input} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../../components/modify-modal/modify.component';

@Component({
  selector: 'app-order-action',
  templateUrl: './order-action.component.html'
})
export class OrderActionComponent {
  @Input() order: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  isVisible: boolean;
  isProcessing = false;

  constructor(public coreService: CoreService, private modal: NzModalService) {
  }

  change(value: boolean): void {
    this.isVisible = value;
  }

  resumeOrder(): void {
    this.modal.create({
      nzTitle: undefined,
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
        nzTitle: undefined,
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
        this.isProcessing = true;
        this.resetAction();
      });
    }
  }

  modifyOrder(order): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ModifyStartTimeModalComponent,
      nzClassName: 'lg',
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
      nzTitle: undefined,
      nzContent: ChangeParameterModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerId,
        orderRequirements: order.requirements,
        order: this.coreService.clone(order)
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  private resetAction(): void{
    setTimeout(() => {
      this.isProcessing = false;
    }, 1000);
  }
}
