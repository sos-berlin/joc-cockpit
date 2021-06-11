import {Component, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-audit-log-input',
  templateUrl: './audit-log-input-component.html'
})
export class AuditLogInputComponent {
  @Input() comments: any;
  @Input() sizeX: any;
  @Input() sizeY: any;
  messageList: any = [];
  required: boolean;
  oldValue = '';

  constructor(public activeModal: NzModalRef) {
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
  }

  onChange(value): void {
    if (value === 'new') {
      this.oldValue = this.comments.comment;
      this.comments.comment = '';
    } else {
      this.comments.comment = this.oldValue;
    }
  }
}
