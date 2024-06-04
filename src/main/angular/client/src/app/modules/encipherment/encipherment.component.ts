import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/components/guard';
import { CoreService } from 'src/app/services/core.service';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { isArray } from 'underscore';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ToastrService } from 'ngx-toastr';
import { ByteToSizePipe } from 'src/app/pipes/core.pipe';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-encipherment-modal',
  templateUrl: './add-encipherment-dialog.html'
})
export class AddEnciphermentModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  certificateObj: any = {};
  submitted = false;

  objectType: any;
  isTreeShow: boolean;
  extraInfo: any = {};
  isChange = false;
  jobResourcesTree = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService){}

  ngOnInit(): void {
    this.getJobResourceTree(this.certificateObj)
  }

  private getJobResourceTree(certificateObj): void {
    if (this.jobResourcesTree.length === 0) {
      this.coreService.post('tree', {
        types: ['JOBRESOURCE'],
        forInventory: true
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, true);
        this.matchJobResourceList(certificateObj);
      });
    } else {
      this.matchJobResourceList(certificateObj);
    }
  }

  private matchJobResourceList(certificateObj): void {
    if (certificateObj) {
      if (this.objectType === 'NOTIFICATION') {
        if (typeof certificateObj.jobResourceFolder === 'string') {
          let val = certificateObj.jobResourceFolder;
          certificateObj.jobResourceFolder = [val];
        } else if (!certificateObj.jobResourceFolder || !isArray(certificateObj.jobResourceFolder)) {
          certificateObj.jobResourceFolder = [];
        }
      }
      if (certificateObj.jobResourceFolder) {
        if (typeof certificateObj.jobResourceFolder == 'string') {
          this.checkJobResource(certificateObj.jobResourceFolder);
        }
      }
    }
  }

  onChangeJobResource($event, certificateObj): void {
    this.isTreeShow = false;
    certificateObj.jobResourceFolder = $event;
    if (this.objectType === 'NOTIFICATION') {
      this.extraInfo.released = false;
    } else {
      this.checkJobResource($event);
      this.extraInfo.sync = false;
      // this.autoValidate();
    }
    this.isChange = true;
  }

  onBlur(): void {
    this.isTreeShow = false;
  }

  private checkJobResource(name): void {
    this.extraInfo.isExist = false;
    const obj: any = {
      path: name,
      objectType: 'JOBRESOURCE',
    };
    this.coreService.post('inventory/read/configuration', obj).subscribe((res: any) => {
      this.extraInfo.isExist = true;
      this.extraInfo.deployed = res.deployed;
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.coreService.post('encipherment/certificate/store', this.certificateObj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-import-encipherment-modal',
  templateUrl: './import-encipherment-dialog.html'
})
export class ImportEnciphermentModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  display: any;
  securityLevel: string;
  type: string;

  fileList: NzUploadFile[] = [];
  submitted = false;
  required = false;
  uploading = false;
  showProgressBar = false;
  uploadError = false;
  comments: any = {};
  key = {keyAlg: 'RSA'};

  certificateObj: any = {};
  isTreeShow: boolean;
  objectType: any;
  extraInfo: any = {};
  isChange = false;
  jobResourcesTree = [];
  isEnciphermentForm: boolean = false;

  constructor(public activeModal: NzModalRef, private authService: AuthService, private coreService: CoreService,
              public translate: TranslateService, public toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.display = this.modalData.display;
    this.securityLevel = this.modalData.securityLevel;
    this.type = this.modalData.type;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }

    if (this.type === 'encipherment') {
      this.getJobResourceTree(this.certificateObj)
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.uploadError = false;
    this.fileList.push(file);
    if (this.coreService.sanitizeFileName(file.name)) {
      let msg = '';
      this.translate.get('error.message.invalidFileName').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(msg);
      this.fileList = [];
      return false;
    }
    this.onFileSelected(this.fileList);
    setTimeout(() => {
      const uploadSpan = document.querySelector('.ant-upload-span');
      if (uploadSpan) {
        const spanElement = document.createElement('span');
        // Apply the ByteToSizePipe to format file.size
        const byteToSizePipe = new ByteToSizePipe();
        const fileSizeFormatted = byteToSizePipe.transform(file.size);
        spanElement.classList.add("file-size")
        spanElement.textContent = `Size: ${fileSizeFormatted}`;
        const listItemCardActions = uploadSpan.querySelector('.ant-upload-list-item-card-actions');
        uploadSpan.insertBefore(spanElement, listItemCardActions);
      }
    }, 20);
    return false;
  };

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    for (let i = 0; i < event.length; i++) {
      const item = event[i];
      const reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
      function onLoadFile(_event) {

        try {
          const data = _event.target.result;
          if (typeof data === 'string') {
            if (data.match(/private/i)) {
              self.fileList[i]['index'] = 1;
            } else if (data.match(/public/i)) {
              self.fileList[i]['index'] = 2;
            } else if (data.match(/certificate/i)) {
              self.fileList[i]['index'] = 3;
            } else {
              let msg;
              self.translate.get('profile.keyManagement.message.invalidKeyFileSelected').subscribe(translatedValue => {
                msg = translatedValue;
              });
              self.toasterService.error(msg);
              self.fileList = [];
            }
          }
        } catch (e) {
          self.uploadError = true;
        }
      }
    }
  }

  import(): void {
    this.submitted = true;
    this.fileList = this.fileList.sort((a, b) => {
      return a['index'] - b['index'];
    });
    for (let i = 0; i < this.fileList.length; i++) {
      setTimeout(() => {
        this.upload(this.fileList[i]);
        if (i == this.fileList.length - 1) {
          setTimeout(() => {
            this.submitted = false;
          }, 100);
        }
      }, 10 * i);
    }
  }

  private upload(file: any) {
    let URL: string;
    if(this.type === 'encipherment') {
      URL = 'encipherment/certificate/import';
    }
    const formData = new FormData();
    formData.append('file', file);
    if (this.comments.comment) {
      formData.append('comment', this.comments.comment);
    }
    if (this.comments.timeSpent) {
      formData.append('timeSpent', this.comments.timeSpent);
    }
    if (this.comments.ticketLink) {
      formData.append('ticketLink', this.comments.ticketLink);
    }
    if (this.type === 'encipherment') {
      formData.append('certAlias', this.certificateObj.certAlias);
      if(this.certificateObj.privateKeyPath){
        formData.append('privateKeyPath', this.certificateObj.privateKeyPath);
      }
      formData.append('jobResourceFolder', this.certificateObj.jobResourceFolder);
    }
    this.uploading = true;
    const headers = new HttpHeaders().set('X-Access-Token', this.authService.accessTokenId);
    headers.set('Content-Type', 'multipart/form-data');
    this.coreService.request('api/' + URL, formData, headers).subscribe({
      next: () => {
        if (this.fileList.length === 1 || this.fileList[this.fileList.length - 1].name === file.name) {
          this.activeModal.close('success');
        }
      }, error: () => {
        this.uploading = false;
        this.uploadError = true;
        this.submitted = false
      }
    });
  }

  cancel(): void {
    this.activeModal.close('');
  }

  private getJobResourceTree(certificateObj): void {
    if (this.jobResourcesTree.length === 0) {
      this.coreService.post('tree', {
        types: ['JOBRESOURCE'],
        forInventory: true
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, true);
        this.matchJobResourceList(certificateObj);
      });
    } else {
      this.matchJobResourceList(certificateObj);
    }
  }

  private matchJobResourceList(certificateObj): void {
    if (certificateObj) {
      if (this.objectType === 'NOTIFICATION') {
        if (typeof certificateObj.jobResourceFolder === 'string') {
          let val = certificateObj.jobResourceFolder;
          certificateObj.jobResourceFolder = [val];
        } else if (!certificateObj.jobResourceFolder || !isArray(certificateObj.jobResourceFolder)) {
          certificateObj.jobResourceFolder = [];
        }
      }
      if (certificateObj.jobResourceFolder) {
        if (typeof certificateObj.jobResourceFolder == 'string') {
          this.checkJobResource(certificateObj.jobResourceFolder);
        }
      }
    }
  }

  onChangeJobResource($event, certificateObj): void {
    this.isTreeShow = false;
    certificateObj.jobResourceFolder = $event;
    if (this.objectType === 'NOTIFICATION') {
      this.extraInfo.released = false;
    } else {
      this.checkJobResource($event);
      this.extraInfo.sync = false;
      this.onFieldBlur();
      // this.autoValidate();
    }
    this.isChange = true;
  }

  onBlur(): void {
    this.isTreeShow = false;
  }

  private checkJobResource(name): void {
    this.extraInfo.isExist = false;
    const obj: any = {
      path: name,
      objectType: 'JOBRESOURCE',
    };
    this.coreService.post('inventory/read/configuration', obj).subscribe((res: any) => {
      this.extraInfo.isExist = true;
      this.extraInfo.deployed = res.deployed;
    });
  }

  onFieldBlur(){
    if(this.certificateObj.certAlias && this.certificateObj.jobResourceFolder){
      this.isEnciphermentForm = false;
    }else{
      this.isEnciphermentForm = true;
    }
  }
}

@Component({
  selector: 'app-encipherment',
  templateUrl: './encipherment.component.html',
})
export class EnciphermentComponent {

  permission: any = {};
  isJOCActive = false;

  username = '';
  securityLevel: string;
  preferences: any = {};
  enciphermentCertificate: any = [];

  constructor(private authService: AuthService, public coreService: CoreService,
    private modal: NzModalService, private translate: TranslateService, private i18n: NzI18nService) {
    this.isJOCActive = sessionStorage['$SOS$ISJOCACTIVE'] == 'YES';
    this.permission = JSON.parse(this.authService.permission) || {};
  }

  ngOnInit() {
    this.setPreferences();
    this.getEnciphermentCertificate();
  }

  setPreferences(): void {
    this.username = this.authService.currentUserData;
    this.securityLevel = sessionStorage['securityLevel'];
    if (this.securityLevel === 'LOW' && sessionStorage['defaultProfile'] && sessionStorage['defaultProfile'] === this.username) {
      this.securityLevel = 'MEDIUM';
    }
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
  }

  /* ----------------------Encipherment Certificates--------------------- */

  getEnciphermentCertificate(){
    let certAliases = {
      certAliases: ["Test"]
    };
    this.coreService.post('encipherment/certificate', certAliases).subscribe({
      next: (res: any) => {
        this.enciphermentCertificate = res;
      }, error: () => {
        this.enciphermentCertificate = [];
      }
    });
  }

  addEnciphermentCertificate() {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddEnciphermentModalComponent,
      nzClassName: 'lg',
      nzData: {},
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getEnciphermentCertificate();
      }
    });
  }

  importKey(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportEnciphermentModalComponent,
      nzClassName: 'lg',
      nzData: {
        securityLevel: this.securityLevel,
        display: this.preferences.auditLog,
        type
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getEnciphermentCertificate();
      }
    });
  }

}
