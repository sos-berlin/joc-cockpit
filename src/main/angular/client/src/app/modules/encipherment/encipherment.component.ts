import { Component, ViewChild, inject } from '@angular/core';
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
import { ConfirmModalComponent } from 'src/app/components/comfirm-modal/confirm.component';
import { CommentModalComponent } from 'src/app/components/comment-modal/comment.component';
import {ShowAgentsModalComponent} from "../configuration/inventory/inventory.component";
import {ClipboardService} from "ngx-clipboard";

declare const $: any;

@Component({
  selector: 'app-encipherment-modal',
  templateUrl: './add-encipherment-dialog.html'
})
export class AddEnciphermentModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  display: any;
  securityLevel: string;
  certificateObj: any = {};
  submitted = false;
  comments: any = {};
  required = false;
  encipherment: any;
  title: any;
  schedulerIds: any;
  showEncryptionSample = false;
  plainText = '';
  encryptedText = '';


  nodes = [];
  folderObj: any = {paths: []};

  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService,private modal: NzModalService, private clipboardService: ClipboardService,){}

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.display = this.modalData.display;
    this.securityLevel = this.modalData.securityLevel;
    this.title = this.modalData.title;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    this.encipherment = this.modalData.encipherment;
    if(this.encipherment){
      this.certificateObj.certAlias = this.encipherment.certAlias;
      this.certificateObj.certificate = this.encipherment.certificate;
      if(this.encipherment.privateKeyPath){
        this.certificateObj.privateKeyPath = this.encipherment.privateKeyPath;
      }
      this.loadDeployableInfo(); // Ensure it's called during initialization
    }
    this.getJobResourceFolderTree();
  }

  private loadDeployableInfo(): void {
    if (this.certificateObj.certAlias) {
      this.coreService.post('inventory/deployable', {
        path: this.certificateObj.certAlias,
        objectType: "JOBRESOURCE",
      }).subscribe(res => {
        const folderPath = res.deployable.folder;
        this.certificateObj.jobResourceFolder = folderPath;
      });
    }
  }


  private getJobResourceFolderTree(): void {
    this.coreService.post('tree', {
      types: ['FOLDER'],
      forInventory: true
    }).subscribe(res => {
      this.nodes = this.coreService.prepareTree(res, true);
      if (this.nodes.length > 0) {
        this.nodes[0].expanded = true;
      }
    });
  }

  displayWith(data): string {
    return data.key;
  }

  showAssignedAgents(selectedCert) {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ShowAgentsModalComponent,
      nzAutofocus: null,
      nzData: {
        controllerId: this.schedulerIds.selected,
        selectedCert
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
      }
    });
  }
  onSubmit() {
    this.submitted = true;
    let auditLog: any = {};
    if (this.comments.comment) {
      auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      auditLog.ticketLink = this.comments.ticketLink;
    }
    if (auditLog.comment) {
      this.certificateObj.auditLog = auditLog;
    }

    this.coreService.post('encipherment/certificate/store', this.certificateObj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      },
      error: () => this.submitted = false
    });
  }

  toggleEncryptionSample(): void {
    this.showEncryptionSample = !this.showEncryptionSample;
    this.plainText = ''
    this.encryptedText = ''
  }

  encryptText(selectedCert): void {
    const obj = {
      toEncrypt: this.plainText,
      certAlias: selectedCert
    }
    this.coreService.post('encipherment/encrypt', obj).subscribe({
      next: (res: any) => {
      this.encryptedText = res.encryptedValue;
      }
    });
  }

  copyToClipboard(): void {
    this.clipboardService.copy(this.encryptedText);
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

  nodes = [];
  folderObj: any = {paths: []};

  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

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
      this.getJobResourceFolderTree();
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
    if (this.type === 'encipherment') {
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
      if (this.certificateObj.privateKeyPath) {
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

  private getJobResourceFolderTree(): void {
    this.coreService.post('tree', {
      types: ['FOLDER'],
      forInventory: true
    }).subscribe(res => {
      this.nodes = this.coreService.prepareTree(res, true);
      if (this.nodes.length > 0) {
        this.nodes[0].expanded = true;
      }
    });
  }

  displayWith(data): string {
    return data.key;
  }
}

@Component({
  selector: 'app-encipherment-update-modal',
  templateUrl: './update-dialog.html',
})
export class EnciphermentUpdateKeyComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;

  constructor(public activeModal: NzModalRef, private coreService: CoreService){}

  ngOnInit(): void {
    this.data = this.modalData.encipherment;
  }

  onSubmit(){}
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

  data: any = [];
  isLoading = false;
  enciphermentFilters: any = {
    currentPage: 1,
    entryPerPage: 25,
  };

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

  getEnciphermentCertificate(){
    let certAliasesObj = {
      certAliases: []
    };
    this.coreService.post('encipherment/certificate', certAliasesObj).subscribe({
      next: (res: any) => {
        if (res.certificates && res.certificates.length === 0) {
          this.enciphermentFilters.currentPage = 1;
          this.enciphermentFilters.entryPerPage = 25;
        }
        this.isLoading = true;
        this.data = res.certificates;
      }, error: () => {
        this.isLoading = true;
        this.data = [];
      }
    });
  }

  addEnciphermentCertificate() {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddEnciphermentModalComponent,
      nzClassName: 'lg',
      nzData: {
        title: 'addCertificate',
        securityLevel: this.securityLevel,
        display: this.preferences.auditLog,
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

  updateCertificate(encipherment, title?) {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddEnciphermentModalComponent,
      nzClassName: 'lg',
      nzData: {
        title: title ? title : 'addCertificate',
        securityLevel: this.securityLevel,
        display: this.preferences.auditLog,
        encipherment: encipherment
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

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  pageIndexChange($event: number): void {
    this.enciphermentFilters.currentPage = $event;
  }

  pageSizeChange($event: number): void {
    this.enciphermentFilters.entryPerPage = $event;
  }

  deleteCertificate(certAlias){
    let obj: any = {
      certAlias: certAlias
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Certificate',
        operation: 'Delete',
        name: certAlias
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });

      modal.afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          };
          this._deleteCertificate(obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: 'delete',
          message: 'deleteCertificate',
          objectName: certAlias,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteCertificate(obj);
        }
      });
    }
  }

  private _deleteCertificate(certAliasesObj){
     this.coreService.post('encipherment/certificate/delete', certAliasesObj).subscribe({
      next: (res: any) => {
        this.getEnciphermentCertificate();
      }, error: () => {}
    });
  }

  showCertificate(encipherment): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EnciphermentUpdateKeyComponent,
      nzClassName: 'lg',
      nzData: {
        encipherment
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {}
    });
  }
}
