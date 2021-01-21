import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ChangeParameterModalComponent} from '../../../components/modify-modal/modify.component';

@Component({
  selector: 'app-order-list-sidebar',
  templateUrl: './order-list-sidebar.component.html'
})
export class OrderListSidebarComponent implements OnChanges {
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();
  object = {
    isSuspend : false,
    isResume : false
  };

  constructor(public coreService: CoreService, public modalService: NgbModal) {
  }

  ngOnChanges(changes: SimpleChanges): void {

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
    this.checked = this.orders.every(item => {
      if (item.state) {
        if (item.state._text === 'FAILED') {
          this.object.isResume = true;
        } else if (item.state._text === 'RUNNING' || item.state._text === 'INPROGRESS') {
          this.object.isSuspend = true;
        }
      }
      return this.setOfCheckedId.has(item.orderId);
    });
    this.indeterminate = this.orders.some(item => this.setOfCheckedId.has(item.orderId)) && !this.checked;
  }

  showPanelFuc(order) {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    order.show = true;
  }

  modifyAllOrder(){
    const modalRef = this.modalService.open(ChangeParameterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.orderIds = Array.from(this.setOfCheckedId);
    modalRef.result.then((result) => {

    }, () => {
    });
  }

  suspendAllOrder() {
    this._bulkOperation('suspend');
  }

  resumeAllOrder() {
    this._bulkOperation('resume');
  }

  cancelAllOrder() {
    this._bulkOperation('cancel');
  }

  _bulkOperation(operation) {
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
      modalRef.componentInstance.url = 'orders/' + operation;
      modalRef.result.then((result) => {
        this.resetCheckBox();
      }, () => {
        this.resetCheckBox();
      });
    } else {
      this.coreService.post('orders/' + operation, obj).subscribe(() => {
        this.resetCheckBox();
      });
    }
  }

  private resetCheckBox() {
    this.checked = false;
    this.indeterminate = false;
    this.setOfCheckedId.clear();
  }
}
