import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-comment-modal-content',
  templateUrl: './comment.component.html'
})
export class CommentModalComponent implements OnInit {
  @Input() comments: any;
  @Input() obj: any;
  @Input() url: any;

  submitted = false;
  required = false;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
  }

  onSubmit(): void {
    if (this.url) {
      this.obj.auditLog = {
        comment: this.comments.comment,
        timeSpent: this.comments.timeSpent,
        ticketLink: this.comments.ticketLink
      };
      this.submitted = true;
      this.coreService.post(this.url, this.obj).subscribe({
        next: () => {
          this.activeModal.close(this.comments);
        }, error: () => this.submitted = false
      });
    } else {
      const obj: any = {
        comment: this.comments.comment,
        timeSpent: this.comments.timeSpent,
        ticketLink: this.comments.ticketLink
      };
      if (this.comments.isChecked) {
        obj.reuse = true;
      }
      this.activeModal.close(obj);
    }
  }
}
