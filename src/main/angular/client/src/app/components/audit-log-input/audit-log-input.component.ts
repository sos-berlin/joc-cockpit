import {Component, Input, Optional} from '@angular/core';
import {Router} from '@angular/router';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {ControlContainer, NgForm} from "@angular/forms";

@Component({
  selector: 'app-audit-log-input',
  templateUrl: './audit-log-input-component.html',
  viewProviders: [{
    provide: ControlContainer,
    deps: [[Optional, NgForm]],
    useFactory: (ngForm: NgForm) => ngForm,
  }]
})
export class AuditLogInputComponent {
  @Input() comments: any;
  @Input() sizeX: any;
  @Input() sizeY: any;
  messageList: any = [];
  required = false;
  oldValue = '';

  constructor(public activeModal: NzModalRef, public router: Router) {
    if (sessionStorage['comments']) {
      this.messageList = JSON.parse(sessionStorage['comments']);
    }
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
    }
  }

  ngOnInit(): void {
    this.comments.isChecked = false;
  }

  onChange(value: string): void {
    if (value === 'new') {
      this.oldValue = this.comments.comment;
      this.comments.comment = '';
    } else {
      this.comments.comment = this.oldValue;
    }
  }
}
