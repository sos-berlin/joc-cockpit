import {Component, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-confirm-modal-content',
  templateUrl: './confirm.component.html'
})
export class ConfirmModalComponent {

  @Input() title: any;
  @Input() title2: any;
  @Input() message: any;
  @Input() message2: any;
  @Input() countMessage: any;
  @Input() count: number;
  @Input() type: any;
  @Input() objectName: any;
  @Input() document: any;
  @Input() documentArr: any;
  @Input() resetProfiles: any;
  @Input() question: string;
  @Input() updateFromJobTemplate: string;

  constructor(public activeModal: NzModalRef) {
  }
}
