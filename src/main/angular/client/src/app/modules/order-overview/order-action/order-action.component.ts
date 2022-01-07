import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isArray} from 'underscore';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";
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

  @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
  isVisible: boolean;

  constructor(public coreService: CoreService, private modal: NzModalService,
              private toasterService: ToastrService, private translate: TranslateService) {
  }

  change(value: boolean): void {
    this.isVisible = value;
  }

  resumeOrder(isParametrized = false): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ResumeOrderModalComponent,
      nzClassName: 'x-lg',
      nzComponentParams: {
        preferences: this.preferences,
        schedulerId: this.schedulerId,
        isParametrized,
        order: this.coreService.clone(this.order)
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isChanged.emit(true);
        this.resetAction();
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

  showLog(): void {
    if (this.order.state && (this.order.state._text !== 'SCHEDULED' && this.order.state._text !== 'PENDING')) {
      this.coreService.post('orders/history', {
        orderId: this.order.orderId
      }).subscribe((res) => {
        if (res.history && res.history.length > 0) {
          this.coreService.showLogWindow(res.history[0], null, null, res.history[0].controllerId, null);
        } else {
          let msg = '';
          this.translate.get('order.message.noLogHistoryFound').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.info(msg)
        }
      })
    }
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
          this.resetAction();
        }
      });
    } else {
      this.isChanged.emit(true);
      this.coreService.post('orders/' + url, obj).subscribe({
        next: () => {
          this.resetAction();
        }, error: () => this.isChanged.emit(false)
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
        this.resetAction();
      }
    });
  }

  private getRequirements(order, cb): void {
    if (order.requirements && order.requirements.parameters) {
      cb();
    } else {
      this.coreService.post('workflow', {
        controllerId: this.schedulerId,
        workflowId: {path: order.workflowId.path}
      }).subscribe({
        next: (res: any) => {
          order.requirements = res.workflow.orderPreparation;
          cb();
        }, error: () => cb()
      });
    }
  }

  changeParameter(order): void {
    if (order.arguments && !isArray(order.arguments)) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }

    this.getRequirements(order, () => {
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
    })
  }

  private resetAction(): void {
    setTimeout(() => {
      this.isChanged.emit(false);
    }, 5000);
  }
}
