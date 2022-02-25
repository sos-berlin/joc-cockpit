import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-audit-log-input',
  templateUrl: './audit-log-input-component.html'
})
export class AuditLogInputComponent implements OnInit {
  @Input() comments: any;
  @Input() sizeX: any;
  @Input() sizeY: any;
  messageList: any = [];
  required: boolean;
  oldValue = '';

  constructor(public activeModal: NzModalRef, public router: Router) {
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
  }

  ngOnInit(): void {
    this.comments.isChecked =  false;
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
