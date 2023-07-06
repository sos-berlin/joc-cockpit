import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-comment-modal-content',
  templateUrl: './comment.component.html'
})
export class CommentModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  comments: any;
  obj: any;
  url: string = '';
  submitted = false;
  required = false;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.comments = this.modalData.comments;
    this.obj = this.modalData.obj;
    this.url = this.modalData.url;
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
