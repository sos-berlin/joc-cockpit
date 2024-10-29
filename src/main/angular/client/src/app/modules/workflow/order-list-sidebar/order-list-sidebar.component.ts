import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isArray} from 'underscore';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {
  ChangeParameterModalComponent,
  ModifyStartTimeModalComponent
} from '../../../components/modify-modal/modify.component';
import {OrderActionComponent} from '../../order-overview/order-action/order-action.component';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {OrderPipe} from "../../../pipes/core.pipe";
import {ConfirmModalComponent} from "../../../components/comfirm-modal/confirm.component";
import { AllOrderResumeModelComponent } from '../../order-overview/order-overview.component';

@Component({
  selector: 'app-order-list-sidebar',
  templateUrl: './order-list-sidebar.component.html'
})
export class OrderListSidebarComponent implements OnChanges {
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() orderPreparation: any;
  @Input() loading: boolean;
  @Input() isSingleWorkflow = true;
  filter = {
    sortBy: 'scheduledFor',
    entryPerPage: 25,
    currentPage: 1,
    reverse: true
  };
  data = [];
  checked = false;
  indeterminate = false;
  isProcessing = false;
  isDropdownOpen = false;
  setOfCheckedId = new Set<string>();
  object = {
    isModify: false,
    isCancel: false,
    isCancelWithKill: false,
    isSuspend: false,
    isSuspendWithKill: false,
    isResume: false,
    isPrompt: false,
    isContinue: false,
    isTerminate: false
  };

  @ViewChild(OrderActionComponent, {static: false}) actionChild;

  constructor(public coreService: CoreService, public modal: NzModalService, private orderPipe: OrderPipe, public viewContainerRef: ViewContainerRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders'] && changes['orders'].currentValue) {
      this.refreshView();
      this.resetAction();
    }
  }

  sort(key): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = key;
  }

  pageIndexChange($event: number): void {
    this.filter.currentPage = $event;
    if (this.setOfCheckedId.size !== this.data.length) {
      this.resetCheckBox();
    }
  }

  pageSizeChange($event: number): void {
    this.filter.entryPerPage = $event;
    if (this.setOfCheckedId.size !== this.data.length) {
      if (this.checked) {
        this.onAllChecked(true);
      }
    }
  }

  private refreshView(): void {
    if (!this.isDropdownOpen && this.setOfCheckedId.size === 0) {
      this.data = [...this.orders];
    } else {
      setTimeout(() => {
        this.refreshView();
      }, 800);
    }
  }


  changedHandler(flag: boolean): void {
    this.isProcessing = flag;
  }

  dropdownChangedHandler(isOpen: boolean): void {
    this.isDropdownOpen = isOpen;
  }

  private resetAction(time = 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }

  onItemChecked(orderId: string, checked: boolean): void {
    if (!checked && this.setOfCheckedId.size > (this.filter.entryPerPage || this.preferences.entryPerPage)) {
      const orders = this.getCurrentData(this.data, this.filter);
      if (orders.length < this.data.length) {
        this.setOfCheckedId.clear();
        orders.forEach(item => {
          this.setOfCheckedId.add(item.orderId);
        });
      }
    }
    if (checked) {
      this.setOfCheckedId.add(orderId);
    } else {
      this.setOfCheckedId.delete(orderId);
    }
    this.refreshCheckedStatus();
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    list = this.orderPipe.transform(list, filter.sortBy, filter.reverse);
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  selectAll(): void {
    this.data.forEach(item => {
      this.setOfCheckedId.add(item.orderId);
    });
    this.refreshCheckedStatus(true);
  }

  onAllChecked(value: boolean): void {
    if (value && this.data.length > 0) {
      const orders = this.getCurrentData(this.data, this.filter);
      orders.forEach(item => {
        this.setOfCheckedId.add(item.orderId);
      });
    } else {
      this.setOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(allOrder = false): void {
    const orders = allOrder ? this.data : this.getCurrentData(this.data, this.filter);
    this.object.isCancel = false;
    this.object.isCancelWithKill = false;
    this.object.isPrompt = false;
    this.object.isModify = true;
    this.object.isSuspend = true;
    this.object.isSuspendWithKill = false;
    this.object.isResume = true;
    this.object.isContinue = true;
    this.object.isTerminate = true;
    let count = 0;
    orders.forEach(item => {
      if (this.setOfCheckedId.has(item.orderId)) {
        if (!item.isContinuable) {
          this.object.isContinue = false;
        }
        if (item.state) {
          if (item.state._text !== 'SUSPENDED' && item.state._text !== 'FAILED') {
            this.object.isResume = false;
          } else {
            if (!((item.state._text == 'SUSPENDED' && this.permission.currentController.orders.suspendResume)
              || (item.state._text == 'FAILED' && this.permission.currentController.orders.resumeFailed))) {
              this.object.isResume = false;
            }
          }
          if ((item.state._text !== 'FINISHED' && item.state._text !== 'CANCELLED') || (item.positionString && item.positionString.match('/fork'))) {
            this.object.isTerminate = false;
          }
          if (item.state._text !== 'RUNNING' && item.state._text !== 'INPROGRESS' && item.state._text !== 'WAITING'
            && item.state._text !== 'PENDING' && item.state._text !== 'SCHEDULED' && item.state._text !== 'PROMPTING') {
            this.object.isSuspend = false;
          }
          if (item.state._text === 'FINISHED' || item.state._text === 'CANCELLED') {
            this.object.isCancel = true;
          }
          if (item.state._text === 'RUNNING') {
            this.object.isCancelWithKill = true;
            this.object.isSuspendWithKill = true;
          }
          if (item.state._text === 'PROMPTING') {
            ++count;
          }
          if (item.state._text !== 'SCHEDULED' && item.state._text !== 'PENDING' && item.state._text !== 'BLOCKED') {
            this.object.isModify = false;
          }
        }
      }
    });

    if(count == this.setOfCheckedId.size){
      this.object.isPrompt = true;
    }
    this.checked = this.setOfCheckedId.size === orders.length;
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
    this.coreService.post('workflow', {
      controllerId: this.schedulerId,
      workflowId: this.orders[0].workflowId
    }).subscribe((res: any) => {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ChangeParameterModalComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerId: this.schedulerId,
          orderPreparation: this.coreService.clone(this.orderPreparation),
          orderIds: Array.from(this.setOfCheckedId),
          workflow: res.workflow
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.isProcessing = true;
          this.resetAction(5000);
          this.resetCheckBox();
        }
      });
    });
  }

  modifyAllStartTime(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ModifyStartTimeModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        orders: this.setOfCheckedId,
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetAction(5000);
        this.resetCheckBox();
      }
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
    if (this.setOfCheckedId.has(item.orderId) && item.isResumable) {
      map.set(item.orderId, item);
    }
  });

  if (map.size === 1) {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ResumeOrderModalComponent,
      nzClassName: 'x-lg',
      nzData: {
        preferences: this.preferences,
        schedulerId: this.schedulerId,
        orders: map
      },
      nzFooter: null,
      nzAutofocus: null,
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
  } else {
    // const obj: any = {
    //   controllerId: this.schedulerId,
    //   orderIds: []
    // };
    // map.forEach((order) => {
    //   obj.orderIds.push(order.orderId);
    // });
    // if (this.preferences.auditLog) {
    //   let comments = {
    //     radio: 'predefined',
    //     type: 'Order',
    //     operation: 'Resume',
    //     name: ''
    //   };
    //   const modal = this.modal.create({
    //     nzTitle: undefined,
    //     nzContent: CommentModalComponent,
    //     nzClassName: 'lg',
    //     nzData: {
    //       comments,
    //       obj,
    //       url: 'orders/resume'
    //     },
    //     nzFooter: null,
    //     nzClosable: false,
    //     nzMaskClosable: false
    //   });
    //   modal.afterClose.subscribe(result => {
    //     if (result) {
    //       this.isProcessing = true;
    //       this.resetAction(5000);
    //       this.resetCheckBox();
    //     }
    //   });
    // } else {
    //   this.isProcessing = true;
    //   this.coreService.post('orders/resume', obj).subscribe({
    //     next: () => {
    //       this.resetCheckBox();
    //       this.resetAction(5000);
    //     },
    //     error: () => this.resetAction()
    //   });
    // }
    let orderIds = [];
      map.forEach((order) => {
        orderIds.push(order.orderId);
      });
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: AllOrderResumeModelComponent,
        nzClassName: 'lg',
        nzData: {
          preferences: this.preferences,
          controllerId: this.schedulerId,
          orderIds: orderIds,
          isFromWorkflow: true
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
}


  continueAllOrder(): void{
    this._bulkOperation('Continue', 'continue', false);
  }


  cancelAllOrder(isKill = false): void {
    this._bulkOperation('Cancel', 'cancel', isKill);
  }

  confirmAllOrder(): void {
    this._bulkOperation('Confirm', 'confirm', false);
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
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
        nzAutofocus: null,
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
      if (operation == 'Confirm') {
        this.confirmOrder(obj, url);
      } else {
        this.isProcessing = true;
        this.coreService.post('orders/' + url, obj).subscribe({
          next: () => {
            this.resetCheckBox();
            this.resetAction(5000);
          }, error: () => this.resetAction()
        });
      }
    }
  }

  private confirmOrder(obj, url): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzData: {
        title: 'confirm',
        question: 'order.message.confirmAllSelectedOrders'
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.isProcessing = true;
        this.coreService.post('orders/' + url, obj).subscribe({
          next: () => {
            this.resetCheckBox();
            this.resetAction(5000);
          }, error: () => this.resetAction()
        });
      }
    });
  }

  getObstacles(order): void {
    if (order.state._text === 'INPROGRESS' && !order.obstacles) {
      order.obstacles = [];
      this.coreService.post('order/obstacles', {
        controllerId: this.schedulerId,
        orderId: order.orderId
      }).subscribe((res: any) => {
        order.obstacles = res.obstacles;
      });
    }
  }

  showLog(order): void {
    this.coreService.showOrderLogWindow(order.orderId, this.schedulerId, order.workflowId.path, this.viewContainerRef);
  }

  resetCheckBox(): void {
    this.checked = false;
    this.indeterminate = false;
    this.setOfCheckedId.clear();
  }
}
