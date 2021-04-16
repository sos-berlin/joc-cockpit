import {Component, OnInit, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './confirm.component.html'
})
export class ConfirmModalComponent {

  @Input() title: any;
  @Input() message: any;
  @Input() countMessage: any;
  @Input() count: number;
  @Input() type: any;
  @Input() objectName: any;
  @Input() calendar: any;
  @Input() calendarArr: any;
  @Input() document: any;
  @Input() documentArr: any;
  @Input() resetProfiles: any;

  constructor(public activeModal: NzModalRef) {
  }

  showDocument(doc): void{

  }
}
