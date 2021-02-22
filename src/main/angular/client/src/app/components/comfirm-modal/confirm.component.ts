import {Component, OnInit, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './confirm.component.html'
})
export class ConfirmModalComponent {

  @Input() title: any;
  @Input() message: any;
  @Input() type: any;
  @Input() objectName: any;
  @Input() calendar: any;
  @Input() calendarArr: any;
  @Input() document: any;
  @Input() documentArr: any;
  @Input() resetProfiles: any;

  constructor(public activeModal: NgbActiveModal) {
  }

  showDocument(doc): void{

  }
}
