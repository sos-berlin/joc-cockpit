import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-confirm-modal-content',
  templateUrl: './confirm.component.html'
})
export class ConfirmModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  title = '';
  title2 = '';
  message = '';
  message2 = '';
  countMessage = '';
  count: number | undefined;
  type = '';
  objectName: any;
  document: any;
  documentArr: any;
  resetProfiles: any;
  question = '';
  updateFromJobTemplate = '';
  lossNode = '';

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.title = this.modalData.title;
    this.title2 = this.modalData.title2;
    this.message = this.modalData.message;
    this.message2 = this.modalData.message2;
    this.countMessage = this.modalData.countMessage;
    this.count = this.modalData.count;
    this.type = this.modalData.type;
    this.objectName = this.modalData.objectName;
    this.document = this.modalData.document;
    this.documentArr = this.modalData.documentArr;
    this.resetProfiles = this.modalData.resetProfiles;
    this.question = this.modalData.question;
    this.updateFromJobTemplate = this.modalData.updateFromJobTemplate;
    this.lossNode = this.modalData.lossNode;
  }
}
