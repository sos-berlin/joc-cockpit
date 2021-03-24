import {Component, Input} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ChangeParameterModalComponent} from '../../../components/modify-modal/modify.component';

@Component({
  selector: 'app-order-list-sidebar',
  templateUrl: './order-list-sidebar.component.html'
})
export class OrderListSidebarComponent {
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() orderRequirements: any;
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();
  object = {
    isModify: false,
    isCancel: false,
    isSuspend: false,
    isResume: false,
    isTerminate: false
  };

  constructor(public coreService: CoreService, public modalService: NgbModal) {
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
    this.object.isModify = true;
    this.object.isSuspend = true;
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
          if (item.state._text !== 'RUNNING' && item.state._text !== 'INPROGRESS' && item.state._text !== 'WAITING') {
            this.object.isSuspend = false;
          }
          if (item.state._text === 'FINISHED' || item.state._text === 'CANCELLED') {
            this.object.isCancel = true;
          }
          if (item.state._text !== 'PLANNED' && item.state._text !== 'PENDING') {
            this.object.isModify = false;
          }
        }
      }
    });
    this.checked = this.orders.every(item => {
      return this.setOfCheckedId.has(item.orderId);
    });
    this.indeterminate = this.orders.some(item => this.setOfCheckedId.has(item.orderId)) && !this.checked;
  }

  showPanelFuc(order): void {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    order.show = true;
  }

  modifyAllOrder(): void {
    const modalRef = this.modalService.open(ChangeParameterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.orderRequirements = this.coreService.clone(this.orderRequirements);
    modalRef.componentInstance.orderIds = Array.from(this.setOfCheckedId);
    modalRef.result.then((result) => {

    }, () => {
    });
  }

  terminateAllOrder(): void {
    this._bulkOperation('Terminate', 'remove_when_terminated');
  }

  suspendAllOrder(): void {
    this._bulkOperation('Suspend', 'suspend');
  }

  resumeAllOrder(): void {
    this._bulkOperation('Resume', 'resume');
  }

  cancelAllOrder(): void {
    this._bulkOperation('Cancel', 'cancel');
  }

  _bulkOperation(operation, url): void {
    const obj: any = {
      controllerId: this.schedulerId,
      orderIds: Array.from(this.setOfCheckedId)
    };

    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Order',
        operation: operation,
        name: ''
      };
      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'orders/' + url;
      modalRef.result.then((result) => {
        this.resetCheckBox();
      }, () => {
        this.resetCheckBox();
      });
    } else {
      this.coreService.post('orders/' + url, obj).subscribe(() => {
        this.resetCheckBox();
      });
    }
  }

  private resetCheckBox(): void {
    this.checked = false;
    this.indeterminate = false;
    this.setOfCheckedId.clear();
  }
}
