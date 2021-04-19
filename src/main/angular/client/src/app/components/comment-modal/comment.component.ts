import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './comment.component.html'
})
export class CommentModalComponent implements OnInit {
  submitted = false;
  messageList: any = [];
  required = false;
  @Input() comments: any;
  @Input() obj: any;
  @Input() url: any;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.obj.auditLog = {
      comment: this.comments.comment,
      timeSpent: this.comments.timeSpent,
      ticketLink: this.comments.ticketLink
    };

    this.postCall(this.obj);
  }

  postCall(obj): void {
    this.coreService.post(this.url, obj).subscribe(res => {
      this.submitted = false;
      this.activeModal.close('Close');
    }, err => {
      this.submitted = false;
    });
  }
}
