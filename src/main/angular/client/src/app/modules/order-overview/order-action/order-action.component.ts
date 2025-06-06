import {Component, Input, Output, EventEmitter, ViewContainerRef} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isArray} from 'underscore';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {
  ChangeParameterModalComponent,
  ModifyStartTimeModalComponent
} from '../../../components/modify-modal/modify.component';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {NzMessageService} from "ng-zorro-antd/message";
import {AddOrderModalComponent} from "../../workflow/workflow-action/workflow-action.component";
import {PriorityModalComponent} from "../../../components/priority-modal/priority-modal.component";

@Component({
  selector: 'app-order-action',
  templateUrl: './order-action.component.html'
})
export class OrderActionComponent {
  @Input() order: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() viewContainerRef: any;
  @Input() schedulerId: any;
  @Input() isDisabled = false;

  @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() isDropdownOpen: EventEmitter<boolean> = new EventEmitter();

  constructor(public coreService: CoreService, private modal: NzModalService,
              public message: NzMessageService) {
  }

  change(value: boolean): void {
    this.isDropdownOpen.emit(value);
  }

  continueOrder(){
    this.restCall(false, 'Continue', this.order, 'continue');
  }

  resumeOrder(): void {
    if (this.order.positionIsImplicitEnd) {
      this.restCall(false, 'Resume', this.order, 'resume');
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ResumeOrderModalComponent,
        nzClassName: 'x-lg',
        nzData: {
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
          this.resetAction();
        }
      });
    }
  }

  normal(order): void {
    this.restCall(false, 'Suspend', order, 'suspend', null, false);
  }

  force(order): void {
    this.restCall(true, 'Suspend', order, 'suspend', null, false);
  }

  reset(order): void {
    this.restCall(false, 'Suspend', order, 'suspend', null, true);
  }

  forceReset(order): void {
    this.restCall(true, 'Suspend', order, 'suspend', false, true);
  }

  suspendOrder(order): void {
    this.restCall(false, 'Suspend', order, 'suspend');
  }

  deepSuspendNormal(isDeep = false): void {
    this.restCall(false, 'Suspend', this.order, 'suspend', isDeep);
  }

  deepSuspendReset(isDeep = false): void {
    this.restCall(false, 'Suspend', this.order, 'suspend', isDeep, true);
  }

  deepSuspendForce(isDeep = false): void {
    this.restCall(true, 'Suspend', this.order, 'suspend', true, false);
  }

  deepSuspendForceReset(isDeep = false): void {
    this.restCall(true, 'Suspend', this.order, 'suspend', true, true);
  }

  cancelOrder(order): void {
    this.restCall(false, 'Cancel', order, 'cancel');
  }

  cancelOrderWithKill(isDeep = false): void {
    this.restCall(true, 'Cancel', this.order, 'cancel', isDeep);
  }

  deepCancel(isDeep = false): void {
    this.restCall(false, 'Cancel', this.order, 'cancel', isDeep);
  }

  showLog(order): void {
    if (order.state && (order.state._text !== 'SCHEDULED' && order.state._text !== 'PENDING')) {
      this.coreService.showOrderLogWindow(order.orderId, this.schedulerId, order.workflowId.path, this.viewContainerRef);
    }
  }

  cloneOrder(order): void{
    this.getRequirements(order, (workflow) => {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: AddOrderModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          preferences: this.preferences,
          permission: this.permission,
          schedulerId: this.schedulerId,
          workflow,
          order
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {

        }
      });
    });
  }

  removeWhenTerminated(): void {
    this.restCall(true, 'Terminate', this.order, 'remove_when_terminated');
  }

  private restCall(isKill, type, order, url, deep = false, reset?): void {
    const obj: any = {
      controllerId: this.schedulerId, orderIds: [order.orderId], kill: isKill, reset: reset
    };
    if (deep) {
      obj.deep = true;
    }
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
        nzData: {
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
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzData: {
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
      nzData: {
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
    this.coreService.post('workflow', {
      controllerId: this.schedulerId,
      workflowId: {path: order.workflowId.path}
    }).subscribe({
      next: (res: any) => {
        order.requirements = res.workflow.orderPreparation;
        cb(res.workflow);
      }, error: () => cb()
    });
  }

  changeParameter(order): void {
    if (order.arguments && !isArray(order.arguments)) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }

    this.getRequirements(order, (workflow) => {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ChangeParameterModalComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerId: this.schedulerId,
          orderPreparation: order.requirements,
          order: this.coreService.clone(order),
          workflow
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    })
  }


  copyOrderId(orderId): void {
    this.coreService.copyToClipboard(orderId, this.message);
  }

  private resetAction(): void {
    setTimeout(() => {
      this.isChanged.emit(false);
    }, 5000);
  }

  modifyPriority(order): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: PriorityModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerId,
        order: order,
        preferences: this.preferences
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}
