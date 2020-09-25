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

  startOrder(order){

  }

  startOrderAt(){

  }

  suspendOrder(order){

  }

  resumeOrder(){

  }

  cancelOrder(){

  }

  private postCall(url, obj) {
    this.coreService.post(url, obj).subscribe(() => {
    });
  }
}
