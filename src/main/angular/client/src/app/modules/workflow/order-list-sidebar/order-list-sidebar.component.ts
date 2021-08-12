import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isArray} from 'underscore';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ChangeParameterModalComponent} from '../../../components/modify-modal/modify.component';
import {OrderActionComponent} from '../../order-overview/order-action/order-action.component';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';

@Component({
  selector: 'app-order-list-sidebar',
  templateUrl: './order-list-sidebar.component.html'
})
export class OrderListSidebarComponent implements OnChanges{
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() orderPreparation: any;
  data = [];
  checked = false;
  indeterminate = false;
  isProcessing = false;
  setOfCheckedId = new Set<string>();
  object = {
    isModify: false,
    isCancel: false,
    isCancelWithKill: false,
    isSuspend: false,
    isSuspendWithKill: false,
    isResume: false,
    isTerminate: false
  };

  @ViewChild(OrderActionComponent, {static: false}) actionChild;

  constructor(public coreService: CoreService, public modal: NzModalService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orders && changes.orders.currentValue) {
      this.refreshView();
      this.resetAction();
    }
  }

  private refreshView(): void {
    if (!this.actionChild || (!this.actionChild.isVisible && this.setOfCheckedId.size === 0)) {
      this.data = [...this.orders];
    } else {
      if (this.setOfCheckedId.size > 0) {
        let tempArr = [];
        for (let i in this.orders) {
          if (!this.setOfCheckedId.has(this.orders[i].orderId)) {
            for (let j in this.data) {
              if (this.setOfCheckedId.has(this.data[j].orderId)) {
                tempArr.push(this.data[j]);
                break;
              }
            }
          }
        }
        this.data = tempArr.concat(this.orders);
      }
      setTimeout(() => {
        this.refreshView();
      }, 800);
    }
  }

  changedHandler(flag: boolean): void {
    this.isProcessing = flag;
  }

  private resetAction(time= 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }

  updateCheckedSet(orderId: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(orderId);
    } else {
      this.setOfCheckedId.delete(orderId);
    }
  }

  onItemChecked(orderId: string, checked: boolean): void {
    this.updateCheckedSet(orderId, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.orders.forEach(item => this.updateCheckedSet(item.orderId, value));
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.isCancel = false;
    this.object.isCancelWithKill = false;
    this.object.isModify = true;
    this.object.isSuspend = true;
    this.object.isSuspendWithKill = true;
    this.object.isResume = true;
    this.object.isTerminate = true;
    this.orders.forEach(item => {
      if (this.setOfCheckedId.has(item.orderId)) {
        if (item.state) {
          if (item.state._text !== 'SUSPENDED' && item.state._text !== 'FAILED') {
            this.object.isResume = false;
          }
          if (item.state._text !== 'FINISHED' && item.state._text !== 'CANCELLED') {
            this.object.isTerminate = false;
          }
          if (item.state._text !== 'RUNNING' && item.state._text !== 'INPROGRESS' && item.state._text !== 'WAITING' && item.state._text !== 'PENDING' && item.state._text !== 'SCHEDULED') {
            this.object.isSuspend = false;
          }
          if (item.state._text !== 'RUNNING' && item.state._text !== 'INPROGRESS' && item.state._text !== 'WAITING') {
            this.object.isSuspendWithKill = false;
          }
          if (item.state._text === 'FINISHED' || item.state._text === 'CANCELLED') {
            this.object.isCancel = true;
            this.object.isCancelWithKill = true;
          }
          if (item.state._text === 'PENDING' || item.state._text === 'SCHEDULED') {
            this.object.isCancelWithKill = true;
          }
          if (item.state._text !== 'SCHEDULED' && item.state._text !== 'PENDING' && item.state._text !== 'BLOCKED') {
            this.object.isModify = false;
          }
        }
      }
    });
    this.checked = this.orders.every(item => {
      return this.setOfCheckedId.has(item.orderId);
    });
    this.indeterminate = this.setOfCheckedId.size > 0 && !this.checked;
  }

  showPanelFuc(order): void {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        if (v && isArray(v)) {
          v.forEach((list, index) => {
            v[index] = Object.entries(list).map(([k1, v1]) => {
              return {name: k1, value: v1};
            });
          });
        }
        return {name: k, value: v};
      });
    }
    order.show = true;
  }

  modifyAllOrder(): void {
    this.modal.create({
      nzTitle: null,
      nzContent: ChangeParameterModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerId,
        orderPreparation: this.coreService.clone(this.orderPreparation),
        orderIds: Array.from(this.setOfCheckedId)
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  terminateAllOrder(): void {
    this._bulkOperation('Terminate', 'remove_when_terminated');
  }

  suspendAllOrder(isKill = false): void {
    this._bulkOperation('Suspend', 'suspend', isKill);
  }

  resumeAllOrder(): void {
    const map = new Map();
    this.orders.forEach(item => {
      if (this.setOfCheckedId.has(item.orderId)) {
        map.set(item.orderId, item);
      }
    });
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ResumeOrderModalComponent,
      nzClassName: 'x-lg',
      nzComponentParams: {
        preferences: this.preferences,
        schedulerId: this.schedulerId,
        orders: map
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetAction(5000);
        this.resetCheckBox();
      }
    });
  }

  cancelAllOrder(isKill = false): void {
    this._bulkOperation('Cancel', 'cancel', isKill);
  }

  _bulkOperation(operation, url, isKill = false): void {
    const obj: any = {
      controllerId: this.schedulerId,
      orderIds: Array.from(this.setOfCheckedId)
    };
    if (isKill) {
      obj.kill = true;
    }
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Order',
        operation,
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: null,
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
          this.isProcessing = true;
          this.resetCheckBox();
          this.resetAction(5000);
        }
      });
    } else {
      this.isProcessing = true;
      this.coreService.post('orders/' + url, obj).subscribe(() => {
        this.resetCheckBox();
        this.resetAction(5000);
      }, () => {
        this.resetAction();
      });
    }
  }

  private resetCheckBox(): void {
    this.checked = false;
    this.indeterminate = false;
    this.setOfCheckedId.clear();
  }
}
