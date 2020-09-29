import {Component, OnInit, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../../services/core.service';

@Component({
  selector: 'app-order-action',
  templateUrl: './order-action.component.html'
})
export class OrderActionComponent implements OnInit {

  @Input() order: any;
  @Input() permission: any;
  @Input() schedulerId: any;

  constructor(public modalService: NgbModal, public coreService: CoreService) {
  }

  ngOnInit() {

  }

  startOrder(order) {

  }

  startOrderAt() {

  }

  suspendOrder() {
    this.coreService.post('orders/suspend', {
      jobschedulerId: this.schedulerId, orders: {orderId: this.order.orderId}
    }).subscribe(() => {
    });
  }

  resumeOrder() {
    this.coreService.post('orders/resume', {
      jobschedulerId: this.schedulerId, orders: {orderId: this.order.orderId}
    }).subscribe(() => {
    });
  }

  cancelOrder() {
    this.coreService.post('orders/cancel', {
      jobschedulerId: this.schedulerId, orders: {orderId: this.order.orderId}
    }).subscribe(() => {
    });
  }

}
