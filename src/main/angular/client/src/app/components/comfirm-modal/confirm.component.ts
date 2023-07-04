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
  @Input() count: number | undefined;
  @Input() type: any;
  @Input() objectName: any;
  @Input() document: any;
  @Input() documentArr: any;
  @Input() resetProfiles: any;
  @Input() question = '';
  @Input() updateFromJobTemplate = '';
  @Input() lossNode = '';

  constructor(public activeModal: NzModalRef) {
  }
}
