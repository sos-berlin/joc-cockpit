import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-comment-modal-content',
  templateUrl: './comment.component.html'
})
export class CommentModalComponent implements OnInit {
  submitted = false;
  @Input() comments: any;
  @Input() obj: any;
  @Input() url: any;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
  }

  onSubmit(): void {
    if (this.url) {
      this.submitted = true;
      this.obj.auditLog = {
        comment: this.comments.comment,
        timeSpent: this.comments.timeSpent,
        ticketLink: this.comments.ticketLink
      };
      this.coreService.post(this.url, this.obj).subscribe({
        next: () => {
          this.activeModal.close('Close');
        }, error: () => this.submitted = false
      });
    } else {
      this.activeModal.close(this.comments);
    }
  }
}
