import {Component, ElementRef, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {CoreService} from "../../services/core.service";
import {WorkflowService} from "../../services/workflow.service";
import {isArray} from "underscore";

@Component({
  selector: 'app-priority-modal',
  templateUrl: './priority-modal.component.html'
})
export class PriorityModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  preferences: any;
  orders: any;
  order: any;
  submitted = false;
  comments: any = {};
  display: any;
  obj: any = {
    priority: 0
  }
  priorities = [
    {label: 'inventory.label.high', value: 20000},
    {label: 'inventory.label.aboveNormal', value: 10000},
    {label: 'inventory.label.normal', value: 0},
    {label: 'inventory.label.belowNormal', value: -10000},
    {label: 'inventory.label.Low', value: -20000},
  ];

  constructor(public coreService: CoreService, private activeModal: NzModalRef,
              private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.preferences = this.modalData.preferences;
    this.orders = this.modalData.orders;
    this.order = this.modalData.order;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.display = true;
    }
    if(this.order){
      this.obj.priority = this.order.priority
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId, orderIds: [], priority: this.obj.priority
    };
    if (this.orders) {
      obj.orderIds = [...this.orders.keys()];
    } else {
      obj.orderIds.push(this.order.orderId);
    }
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    this.coreService.post('orders/change', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}
