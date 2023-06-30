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
    if (sessionStorage['$SOS$FORCELOGING'] == 'true') {
      this.required = true;
    }
  }

  onSubmit(): void {
    const auditLog = {
      isChecked: this.comments.isChecked
    };
    this.coreService.getAuditLogObj(this.comments, auditLog);
    if (this.url) {
      this.obj.auditLog = {};
      this.coreService.getAuditLogObj(this.comments, this.obj.auditLog);
      this.submitted = true;
      this.coreService.post(this.url, this.obj).subscribe({
        next: () => {
          this.activeModal.close(auditLog);
        }, error: () => this.submitted = false
      });
    } else {
      this.activeModal.close(auditLog);
    }
  }
}
