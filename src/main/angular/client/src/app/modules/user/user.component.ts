import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {registerLocaleData} from '@angular/common';
import {HttpHeaders} from "@angular/common/http";
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzI18nService} from 'ng-zorro-antd/i18n';
import {NzUploadFile} from "ng-zorro-antd/upload";
import {ChangePasswordComponent} from "../../components/change-password/change-password.component";
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from "../../components/comment-modal/comment.component";
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {ByteToSizePipe} from "../../pipes/core.pipe";
import { isArray } from 'underscore';

declare var $;

@Component({
  selector: 'app-edit-favorite-modal',
  templateUrl: './edit-favorite-dialog.html'
})
export class EditFavoriteModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  list = [];
  data: any;
  type: string;
  schedulerId: any;

  submitted = false;
  agents = [];
  object: any = {};

  constructor(private activeModal: NzModalRef, private coreService: CoreService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.list = this.modalData.list || [];
    this.data = this.modalData.data;
    this.type = this.modalData.type;
    this.schedulerId = this.modalData.schedulerId;
    if (this.type === 'AGENT') {
      this.agentList();
    }
    if (this.data) {
      this.object = this.coreService.clone(this.data);
    }
  }

  agentList() {
    let data = {agentList: []};
    let standaloneAgentText = '';
    let clusterAgentText = '';
    this.translate.get('agent.label.agents').subscribe(translatedValue => {
      standaloneAgentText = translatedValue;
    });
    this.translate.get('agent.label.agentGroups').subscribe(translatedValue => {
      clusterAgentText = translatedValue;
    });
    this.coreService.getAgents(data, this.schedulerId, () => {
      for (let j = 0; j < data.agentList.length; j++) {
        let obj = {
          title: data.agentList[j].title === 'agents' ? standaloneAgentText : clusterAgentText,
          key: data.agentList[j].title,
          disabled: true,
          children: []
        }
        for (let i = 0; i < data.agentList[j].children.length; i++) {
          if (data.agentList[j].children[i].title) {
            let _obj = {
              title: data.agentList[j].children[i].title,
              key: data.agentList[j].children[i].title,
              disabled: true,
              isLeaf: false,
              children: []
            };
            if (data.agentList[j].children[i].children) {
              data.agentList[j].children[i].children.forEach(element => {
                _obj.children.push({
                  title: element, key: element, isLeaf: true, cluster: true
                })
              })
            }
            obj.children.push(_obj)
          } else {
            let _obj = {title: data.agentList[j].children[i], key: data.agentList[j].children[i], isLeaf: true}
            obj.children.push(_obj)
          }
        }
        this.agents.push(obj);
        this.agents = [...this.agents]
      }
    })
  }

  checkRegularExp(data): void {
    data.invalid = false;
    try {
      new RegExp(data.facet);
    } catch (e) {
      console.error(e)
      data.invalid = true;
    }
  }

  onSelect(node): void {
    this.object.content = undefined;
    if (node.parentNode && node.parentNode.origin && node.origin.cluster) {
      this.object.content = (node.parentNode.origin.key);
    }
  }

  close() {
    this.activeModal.destroy();
  }

  private rename(): void {
    for (let i in this.list) {
      if (this.list[i].name == this.data.name) {
        this.coreService.post('inventory/favorites/rename', {
          favoriteIds: [{
            type: this.type,
            name: this.object.name,
            oldName: this.data.name
          }]
        }).subscribe({
          next: () => {
            if (this.list[i].content != this.object.content) {
              this.store()
            } else {
              this.activeModal.close('Done');
            }
          }, error: () => this.submitted = false
        });
        break;
      }
    }

  }

  private store(): void {
    this.coreService.post('inventory/favorites/store', {
      favorites: [{
        type: this.type,
        name: this.object.name,
        content: this.object.content
      }]
    }).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.data && this.data.name !== this.object.name) {
      this.rename();
    } else {
      this.store();
    }
  }
}

@Component({
  selector: 'app-manage-favorite-list',
  templateUrl: './favorite-list.component.html',
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 3px;
      list-style-type: none;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
      0 8px 10px 1px rgba(0, 0, 0, 0.14),
      0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
  `]
})
export class FavoriteListComponent {
  @Input() favList = [];
  @Input() sharedList = [];
  @Input() filter: any;
  @Input() schedulerId: any;
  @Input() type: string;
  @Input() account: string;

  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Map<string, string>()
  };
  list: any = [];

  @Output() reload: EventEmitter<any> = new EventEmitter();

  constructor(public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnChanges(): void {
    this.list = this.filter.sharedWithMe ? this.sharedList : this.favList;
  }

  sharedWithMe(): void {
    this.filter.sharedWithMe = !this.filter.sharedWithMe;
    this.list = this.filter.sharedWithMe ? this.sharedList : this.favList;
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex != event.currentIndex) {
      let index = (event.previousIndex < event.currentIndex) ? event.currentIndex : event.currentIndex - 1;
      this.coreService.post('inventory/favorites/ordering', {
        name: this.list[event.previousIndex].name,
        type: this.type,
        predecessorName: index > -1 ? this.list[index].name : undefined
      }).subscribe();
      moveItemInArray(this.list, event.previousIndex, event.currentIndex);
      for (let i = 0; i < this.list.length; i++) {
        this.list[i].ordering = i + 1;
      }
    }
  }

  add(): void {
    this.openEditFavoriteModal();
  }

  edit(data): void {
    this.openEditFavoriteModal(data);
  }

  private openEditFavoriteModal(data?): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: EditFavoriteModalComponent,
      nzData: {
        list: this.favList,
        data,
        type: this.type,
        schedulerId: this.schedulerId.selected
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.reload.emit(this.type);
      }
    });
  }

  makeShare(data): void {
    this.coreService.post('inventory/favorites/share', {
      favoriteIds: [{type: this.type, name: data.name}]
    }).subscribe({
      next: () => {
        data.shared = true;
      }
    });
  }

  makePrivate(data): void {
    this.coreService.post('inventory/favorites/make_private', {
      favoriteIds: [{type: this.type, name: data.name}]
    }).subscribe({
      next: () => {
        data.shared = false;
      }
    });
  }

  takeOver(data?): void {
    let sharedFavoriteIds = [];
    if (data) {
      sharedFavoriteIds.push({type: this.type, name: data.name, account: data.account});
    } else {
      this.object.mapOfCheckedId.forEach((v, k) => {
        sharedFavoriteIds.push({type: this.type, name: k, account: v});
      })
    }
    this.coreService.post('inventory/favorites/take_over', {
      sharedFavoriteIds
    }).subscribe({
      next: () => {
        this.object = {
          checked: false,
          indeterminate: false,
          mapOfCheckedId: new Map<string, string>()
        };
        this.reload.emit(this.type);
      }
    });
  }

  delete(data): void {
    this.coreService.post('inventory/favorites/delete', {
      favoriteIds: [
        {
          type: this.type,
          name: data.name
        }
      ]
    }).subscribe({
      next: () => {
        this.reload.emit(this.type);
      }
    });
  }

  checkAll(value: boolean): void {
    if (value && this.list.length > 0) {
      this.list.forEach(item => {
        this.object.mapOfCheckedId.set(item.name, item.account);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  checkMappedObject(isChecked: boolean, item): void {
    if (isChecked) {
      this.object.mapOfCheckedId.set(item.name, item.account);
    } else {
      this.object.mapOfCheckedId.delete(item.name);
    }
    this.object.checked = this.object.mapOfCheckedId.size === this.list.length;
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }
}

@Component({
  selector: 'app-git-modal-content',
  templateUrl: './git-dialog.html'
})
export class GitModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  display: any;
  data: any;
  required = false;
  submitted = false;
  isShow = false;
  comments: any = {};
  gitObject: any = {};
  object: any = {
    type: 'password'
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.display = this.modalData.display;
    this.data = this.modalData.data;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data) {
      this.gitObject = this.coreService.clone(this.data);
      if (this.data.password) {
        this.object.type = 'password';
      } else if (this.data.personalAccessToken) {
        this.object.type = 'accessToken';
      } else {
        this.object.type = 'key';
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    let obj: any = {
      credentials: [this.gitObject]
    };
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    if (this.object.type === 'password') {
      delete obj.credentials[0].keyfilePath;
      delete obj.credentials[0].personalAccessToken;
    } else if (this.object.type === 'accessToken') {
      delete obj.credentials[0].password;
      delete obj.credentials[0].keyfilePath;
    } else {
      delete obj.credentials[0].password;
      delete obj.credentials[0].personalAccessToken;
      if (!obj.credentials[0].keyfilePath) {
        obj.credentials[0].keyfilePath = '';
      }
    }
    if (this.data) {
      this.coreService.post('inventory/repository/git/credentials/remove', {
        auditLog: obj.auditLog,
        gitServers: [this.data.gitServer]
      }).subscribe(() => {
        this.store(obj);
      });
    } else {
      this.store(obj);
    }
  }

  private store(obj): void {
    this.coreService.post('inventory/repository/git/credentials/add', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-update-modal-content',
  templateUrl: './update-dialog.html'
})
export class UpdateKeyModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  paste: any;
  data: any;
  securityLevel: string;
  type: string;
  display: any;

  required = false;
  submitted = false;
  comments: any = {};
  algorithm: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.paste = this.modalData.paste;
    this.data = this.modalData.data;
    this.securityLevel = this.modalData.securityLevel;
    this.type = this.modalData.type;
    this.display = this.modalData.display;
    this.algorithm.keyAlg = this.securityLevel !== 'HIGH' ? 'ECDSA' : 'PGP';
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.type === 'ca' || this.type === 'certificate') {
      this.algorithm.keyAlg = 'ECDSA';
    }
  }

  onSubmit(): void {
    this.submitted = true;
    let obj;
    if (this.type !== 'certificate') {
      if (this.securityLevel !== 'HIGH') {
        if (this.algorithm.keyAlg === 'PGP') {
          obj = {privateKey: this.data.privateKey};
        } else if (this.algorithm.keyAlg === 'RSA' || this.algorithm.keyAlg === 'ECDSA') {
          obj = {privateKey: this.data.privateKey, certificate: this.data.certificate};
        }
      } else {
        if (this.type === 'ca') {
          obj = {privateKey: this.data.privateKey, certificate: this.data.certificate};
        } else {
          if (this.algorithm.keyAlg === 'PGP') {
            obj = {publicKey: this.data.publicKey};
          } else if (this.algorithm.keyAlg === 'RSA' || this.algorithm.keyAlg === 'ECDSA') {
            obj = {publicKey: this.data.publicKey, certificate: this.data.certificate};
          }
        }
      }
      if (this.type === 'key') {
        obj.keyAlgorithm = this.algorithm.keyAlg;
      }
    } else {
      obj = {certificate: this.data.certificate};
    }
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    const URL = this.type === 'key' ? 'profile/key/store' : this.type === 'certificate' ? 'profile/key/ca/store' : 'profile/ca/store';
    if (this.type === 'key') {
      let _obj = {keys: obj, auditLog: obj.auditLog};
      delete _obj.keys['auditLog'];
      obj = _obj;
    }
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-import-key-modal',
  templateUrl: './import-key-dialog.html'
})
export class ImportKeyModalComponent {
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
  key = {keyAlg: 'ECDSA'};

  certificateObj: any = {};
  isTreeShow: boolean;
  objectType: any;
  extraInfo: any = {};
  isChange = false;
  jobResourcesTree = [];

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

    if (this.type === 'ca') {
      this.key.keyAlg = 'ECDSA';
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
    URL = this.type === 'key' ? 'profile/key/import' : this.type === 'certificate' ? 'profile/key/ca/import' : 'profile/ca/import';
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
    if (this.type === 'key') {
      formData.append('importKeyFilter', JSON.stringify({keyAlgorithm: this.key.keyAlg}));
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
        this.uploadError = true;
        this.submitted = false
      }
    });
  }

  cancel(): void {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-generate-key-component',
  templateUrl: './generate-key-dialog.html'
})
export class GenerateKeyComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  type: string;
  display: any;
  submitted = false;
  expiry: any = {dateValue: 'date'};
  caObj: any = {};
  required = false;
  comments: any = {};
  useSSLcA = false;
  key: any = {
    keyAlg: 'ECDSA'
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private translate: TranslateService, private toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.type = this.modalData.type;
    this.display = this.modalData.display;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.type === 'ca') {
      this.key.keyAlg = 'ECDSA';
    }
  }

  cancel(): void {
    this.activeModal.close('');
  }

  onChange(date): void {
    this.key.date = date;
  }

  generateKey(): void {
    this.submitted = true;
    let obj: any = {
      keyAlgorithm: this.key.keyAlg
    };
    if (this.type === 'ca') {
      obj = this.caObj;
    } else if (this.type === 'key') {
      obj.dn = this.caObj.dn;
    }
    if (this.expiry.dateValue === 'date') {
      obj.validUntil = this.key.date;
    }
    obj.auditLog = {};
    if (this.comments.comment) {
      obj.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      obj.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      obj.auditLog.ticketLink = this.comments.ticketLink;
    }
    if (this.useSSLcA) {
      obj.useSslCa = this.useSSLcA;
    }
    const URL = this.type === 'key' ? 'profile/key/generate' : 'profile/ca/generate';
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        let msg;
        this.translate.get('profile.keyManagement.message.keyGeneratedSuccessfully').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.toasterService.success(msg);
        this.activeModal.close('ok');
      }, error: () => {
        this.submitted = false;
        this.activeModal.destroy();
      }
    });
  }
}

@Component({
  selector: 'app-remove-key-modal',
  templateUrl: './remove-key-dialog.html'
})
export class RemoveKeyModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  submitted: boolean;
  display: boolean;
  type: string;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private authService: AuthService, private coreService: CoreService,
              public translate: TranslateService, public toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.type = this.modalData.type;
    this.display = this.modalData.display;
    this.comments = this.modalData.comments;
    if (this.comments)
      this.comments.radio = 'predefined';

  }

  onSubmit(): void {
    this.submitted = true;
    let obj: any = {};
    if(this.display) {
      obj.auditLog = {};
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
    }
    this.coreService.post(this.type === 'certificate' ? 'profile/key/ca/delete' : 'profile/key/delete', obj).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      },
      error: () => {
        this.submitted = false;
        this.activeModal.destroy();
      }
    });
  }
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent {
  zones: any = {};
  preferences: any = {};
  username = '';
  permission: any = {};
  object: any = {};
  schedulerIds: any = {};
  keys: any;
  caCertificates: any;
  certificates: any;
  gitCredentials: any = {};
  configObj: any = {};
  timeZone: any = {};
  favFilter: any = {
    agent: {searchKey: ''},
    facet: {searchKey: ''}
  };

  maxEntryPerPage = [{value: '500', name: '500'},
    {value: '1000', name: '1000'},
    {value: '1500', name: '1500'},
    {value: '2000', name: '2000'},
    {value: '2500', name: '2500'},
    {value: '3000', name: '3000'},
    {value: '3500', name: '3500'},
    {value: '4000', name: '4000'},
    {value: '4500', name: '4500'},
    {value: '5000', name: '5000'}
  ];

  headerColor = [{value: '', name: 'Default'},
    {value: 'header-blackcurrant', name: 'Blackcurrant'},
    {value: 'header-Dodger-Blue', name: 'Dodger-Blue'},
    {value: 'header-eggplant', name: 'Eggplant'},
    {value: 'header-Pine-Green', name: 'Pine Green'},
    {value: 'header-light-sea-green', name: 'Light Sea Green'},
    {value: 'header-nordic', name: 'Nordic'},
    {value: 'header-prussian-blue', name: 'Prussian Blue'},
    {value: 'header-radical-red', name: 'Radical Red'},
    {value: 'header-toledo', name: 'Toledo'}];

  themeArray = [{value: 'lighter', name: 'profile.label.white'},
    {value: 'light', name: 'profile.label.light'},
    {value: 'blue-lt', name: 'profile.label.blueGrey'},
    {value: 'blue', name: 'profile.label.blue'},
    {value: 'cyan', name: 'profile.label.petrol'},
    {value: 'grey', name: 'profile.label.grey'},
    {value: 'dark', name: 'profile.label.dark'},];

  entryPerPage = [{value: '10', name: '10'},
    {value: '25', name: '25'},
    {value: '50', name: '50'},
    {value: '100', name: '100'}];


  orientation = [{value: 'north', name: 'profile.label.vertical'},
    {value: 'west', name: 'profile.label.horizontal'}];

  spacing = [{value: '50', name: '50%'},
    {value: '75', name: '75%'},
    {value: '100', name: '100%'},
    {value: '125', name: '125%'},
    {value: '150', name: '150%'},
    {value: '175', name: '175%'},
    {value: '200', name: '200%'},
    {value: '225', name: '225%'},
    {value: '250', name: '250%'}
  ];

  dateTimeFormat = [
    {index: 1, value: 'DD.MM.YYYY HH:mm:ss', name: 'Default (DD.MM.YYYY HH:mm:ss)'},
    {disable: true, value: '', name: '-----------------------------------------'},
    {index: 3, value: 'HH:mm | DD.MM.YYYY', name: 'HH:mm | DD.MM.YYYY'},
    {index: 4, value: 'hh:mm A | DD.MM.YYYY', name: 'hh:mm A | DD.MM.YYYY'},
    {index: 5, value: 'YYYY/DD/MM HH:mm', name: 'YYYY/DD/MM HH:mm'},
    {index: 6, value: 'YYYY/DD/MM hh:mm A', name: 'YYYY/DD/MM hh:mm A'},
    {index: 7, value: 'YYYY/DD/MM HH:mm:ss', name: 'YYYY/DD/MM HH:mm:ss'},
    {index: 8, value: 'YYYY/DD/MM hh:mm:ss A', name: 'YYYY/DD/MM hh:mm:ss A'},
    {index: 9, value: 'YYYY-MM-DD HH:mm', name: 'YYYY-MM-DD HH:mm'},
    {index: 10, value: 'YYYY-MM-DD hh:mm A', name: 'YYYY-MM-DD hh:mm A'},
    {index: 11, value: 'YYYY-MM-DD HH:mm:ss', name: 'YYYY-MM-DD HH:mm:ss'},
    {index: 12, value: 'YYYY-MM-DD hh:mm:ss A', name: 'YYYY-MM-DD hh:mm:ss A'},
    {index: 13, value: 'YYYY.MM.DD HH:mm', name: 'YYYY.MM.DD HH:mm'},
    {index: 14, value: 'YYYY.MM.DD hh:mm A', name: 'YYYY.MM.DD hh:mm A'},
    {index: 15, value: 'YYYY.MM.DD HH:mm:ss', name: 'YYYY.MM.DD HH:mm:ss'},
    {index: 16, value: 'YYYY.MM.DD hh:mm:ss A', name: 'YYYY.MM.DD hh:mm:ss A'},
    {index: 17, value: 'YYYY MM DD HH:mm', name: 'YYYY MM DD HH:mm'},
    {index: 18, value: 'YYYY MM DD hh:mm A', name: 'YYYY MM DD hh:mm A'},
    {index: 19, value: 'YYYY MM DD HH:mm:ss', name: 'YYYY MM DD HH:mm:ss'},
    {index: 20, value: 'YYYY MM DD hh:mm:ss A', name: 'YYYY MM DD hh:mm:ss A'},
    {index: 21, value: 'DD/MM/YYYY HH:mm', name: 'DD/MM/YYYY HH:mm'},
    {index: 22, value: 'DD/MM/YYYY hh:mm A', name: 'DD/MM/YYYY hh:mm A'},
    {index: 23, value: 'DD/MM/YYYY HH:mm:ss', name: 'DD/MM/YYYY HH:mm:ss'},
    {index: 24, value: 'DD/MM/YYYY hh:mm:ss A', name: 'DD/MM/YYYY hh:mm:ss A'},
    {index: 25, value: 'DD-MM-YYYY HH:mm', name: 'DD-MM-YYYY HH:mm'},
    {index: 26, value: 'DD-MM-YYYY hh:mm A', name: 'DD-MM-YYYY hh:mm A'},
    {index: 27, value: 'DD-MM-YYYY HH:mm:ss', name: 'DD-MM-YYYY HH:mm:ss'},
    {index: 28, value: 'DD-MM-YYYY hh:mm:ss A', name: 'DD-MM-YYYY hh:mm:ss A'},
    {index: 29, value: 'DD.MM.YYYY HH:mm', name: 'DD.MM.YYYY HH:mm'},
    {index: 30, value: 'DD.MM.YYYY hh:mm A', name: 'DD.MM.YYYY hh:mm A'},
    {index: 31, value: 'DD.MM.YYYY HH:mm:ss', name: 'DD.MM.YYYY HH:mm:ss'},
    {index: 32, value: 'DD.MM.YYYY hh:mm:ss A', name: 'DD.MM.YYYY hh:mm:ss A'},
    {index: 33, value: 'DD MM YYYY HH:mm', name: 'DD MM YYYY HH:mm'},
    {index: 34, value: 'DD MM YYYY hh:mm A', name: 'DD MM YYYY hh:mm A'},
    {index: 35, value: 'DD MM YYYY HH:mm:ss', name: 'DD MM YYYY HH:mm:ss'},
    {index: 36, value: 'DD MM YYYY hh:mm:ss A', name: 'DD MM YYYY hh:mm:ss A'},
    {index: 37, value: 'DD.MMM YYYY HH:mm', name: 'DD.MMM YYYY HH:mm'},
    {index: 38, value: 'DD.MMM YYYY hh:mm A', name: 'DD.MMM YYYY hh:mm A'},
    {index: 39, value: 'DD.MMM YYYY HH:mm:ss', name: 'DD.MMM YYYY HH:mm:ss'},
    {index: 40, value: 'DD.MMM YYYY hh:mm:ss A', name: 'DD.MMM YYYY hh:mm:ss A'},
    {index: 41, value: 'MM/DD/YYYY HH:mm', name: 'MM/DD/YYYY HH:mm'},
    {index: 42, value: 'MM/DD/YYYY hh:mm A', name: 'MM/DD/YYYY hh:mm A'},
    {index: 43, value: 'MM/DD/YYYY HH:mm:ss', name: 'MM/DD/YYYY HH:mm:ss'},
    {index: 44, value: 'MM/DD/YYYY hh:mm:ss A', name: 'MM/DD/YYYY hh:mm:ss A'},
    {index: 45, value: 'MMM/DD/YYYY HH:mm', name: 'MMM/DD/YYYY HH:mm'},
    {index: 46, value: 'MMM/DD/YYYY hh:mm A', name: 'MMM/DD/YYYY hh:mm A'},
    {index: 47, value: 'MMM/DD/YYYY HH:mm:ss', name: 'MMM/DD/YYYY HH:mm:ss'},
    {index: 48, value: 'MMM/DD/YYYY hh:mm:ss A', name: 'MMM/DD/YYYY hh:mm:ss A'},
    {index: 49, value: 'MM-DD-YYYY HH:mm', name: 'MM-DD-YYYY HH:mm'},
    {index: 50, value: 'MM-DD-YYYY hh:mm A', name: 'MM-DD-YYYY hh:mm A'},
    {index: 51, value: 'MM-DD-YYYY HH:mm:ss', name: 'MM-DD-YYYY HH:mm:ss'},
    {index: 52, value: 'MM-DD-YYYY hh:mm:ss A', name: 'MM-DD-YYYY hh:mm:ss A'},
    {index: 53, value: 'MM.DD.YYYY HH:mm', name: 'MM.DD.YYYY HH:mm'},
    {index: 54, value: 'MM.DD.YYYY hh:mm A', name: 'MM.DD.YYYY hh:mm A'},
    {index: 55, value: 'MM.DD.YYYY HH:mm:ss', name: 'MM.DD.YYYY HH:mm:ss'},
    {index: 56, value: 'MM.DD.YYYY hh:mm:ss A', name: 'MM.DD.YYYY hh:mm:ss A'},
    {index: 57, value: 'MM DD YYYY HH:mm', name: 'MM DD YYYY HH:mm'},
    {index: 58, value: 'MM DD YYYY hh:mm A', name: 'MM DD YYYY hh:mm A'},
    {index: 59, value: 'MM DD YYYY HH:mm:ss', name: 'MM DD YYYY HH:mm:ss'},
    {index: 60, value: 'MM DD YYYY hh:mm:ss A', name: 'MM DD YYYY hh:mm:ss A'},
    {index: 61, value: 'MMM.DD YYYY HH:mm', name: 'MMM.DD YYYY HH:mm'},
    {index: 62, value: 'MMM.DD YYYY hh:mm A', name: 'MMM.DD YYYY hh:mm A'},
    {index: 63, value: 'MMM.DD YYYY HH:mm:ss', name: 'MMM.DD YYYY HH:mm:ss'},
    {index: 64, value: 'MMM.DD YYYY hh:mm:ss A', name: 'MMM.DD YYYY hh:mm:ss A'},
    {index: 65, value: 'D.M.YYYY HH:mm', name: 'D.M.YYYY HH:mm'},
    {index: 66, value: 'D.M.YYYY hh:mm A', name: 'D.M.YYYY hh:mm A'},
    {index: 67, value: 'D.M.YYYY HH:mm:ss', name: 'D.M.YYYY HH:mm:ss'},
    {index: 68, value: 'D.M.YYYY hh:mm:ss A', name: 'D.M.YYYY hh:mm:ss A'},
    {index: 69, value: 'D.MMMM YYYY HH:mm', name: 'D.MMMM YYYY HH:mm'},
    {index: 70, value: 'D.MMMM YYYY hh:mm A', name: 'D.MMMM YYYY hh:mm A'},
    {index: 71, value: 'D.MMMM YYYY HH:mm:ss', name: 'D.MMMM YYYY HH:mm:ss'},
    {index: 72, value: 'D.MMMM YYYY hh:mm:ss A', name: 'D.MMMM YYYY hh:mm:ss A'},
    {index: 73, value: 'D/M/YY HH:mm', name: 'D/M/YY HH:mm'},
    {index: 74, value: 'D/M/YY hh:mm A', name: 'D/M/YY hh:mm A'},
    {index: 75, value: 'D/M/YY HH:mm:ss', name: 'D/M/YY HH:mm:ss'},
    {index: 76, value: 'D/M/YY hh:mm:ss A', name: 'D/M/YY hh:mm:ss A'},
    {index: 77, value: 'M/D/YYYY HH:mm', name: 'M/D/YYYY HH:mm'},
    {index: 78, value: 'M/D/YYYY hh:mm A', name: 'M/D/YYYY hh:mm A'},
    {index: 79, value: 'M/D/YYYY HH:mm:ss', name: 'M/D/YYYY HH:mm:ss'},
    {index: 80, value: 'M/D/YYYY hh:mm:ss A', name: 'M/D/YYYY hh:mm:ss A'},
    {index: 81, value: 'MMM DD, YYYY HH:mm', name: 'MMM DD, YYYY HH:mm'},
    {index: 82, value: 'MMM DD, YYYY hh:mm A', name: 'MMM DD, YYYY hh:mm A'},
    {index: 83, value: 'MMM DD, YYYY HH:mm:ss', name: 'MMM DD, YYYY HH:mm:ss'},
    {index: 84, value: 'MMM DD, YYYY hh:mm:ss A', name: 'MMM DD, YYYY hh:mm:ss A'},
    {index: 85, value: 'MMMM DD, YYYY HH:mm', name: 'MMMM DD, YYYY HH:mm'},
    {index: 86, value: 'MMMM DD, YYYY hh:mm A', name: 'MMMM DD, YYYY hh:mm A'},
    {index: 87, value: 'MMMM DD, YYYY HH:mm:ss', name: 'MMMM DD, YYYY HH:mm:ss'},
    {index: 88, value: 'MMMM DD, YYYY hh:mm:ss A', name: 'MMMM DD, YYYY hh:mm:ss A'}
  ];
  forceLoging = false;
  isGroupBtnActive = false;
  securityLevel: string;
  identityServiceType: string;
  identityServiceName: string;
  subscription1: Subscription;
  subscription2: Subscription;
  favList: any = [];
  sharedList: any = [];
  type = 'AGENT';

  constructor(public coreService: CoreService, private dataService: DataService, public authService: AuthService,
              private modal: NzModalService, private translate: TranslateService, private i18n: NzI18nService) {
    this.subscription1 = dataService.resetProfileSetting.subscribe(res => {
      if (res) {
        this.setPreferences();
      }
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.setPreferences();
    });
  }

  ngOnInit(): void {
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.forceLoging = true;
      this.preferences.auditLog = true;
    }
    this.identityServiceType = this.authService.currentUserIdentityService.substring(0, this.authService.currentUserIdentityService.lastIndexOf(':'));
    this.identityServiceName = this.authService.currentUserIdentityService.substring(this.authService.currentUserIdentityService.lastIndexOf(':') + 1);
    this.setPreferences();
    this.zones = this.coreService.getTimeZoneList();
    this.timeZone = this.coreService.getTimeZone();
    this.zones.unshift(this.timeZone, '-----------------------------');
    this.configObj.accountName = this.username;
    this.entryPerPage.push({value: this.preferences.maxEntryPerPage, name: this.preferences.maxEntryPerPage});
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  tabChange($event): void {
    if (this.permission.joc) {
      if ($event.index === 2) {
        if (this.permission.joc.administration.certificates.view) {
          if (this.securityLevel !== 'LOW') {
            this.getKeys();
          } else {
            this.getCA();
          }
        } else if (this.permission.joc.administration.certificates.view) {
          this.getGit();
        } else {
          this.getFavorite();
        }
      } else if ($event.index === 3) {
        if (this.securityLevel !== 'LOW') {
          if (this.permission.joc.administration.certificates.view) {
            this.getCA();
          } else if (this.permission.joc.inventory.view) {
            this.getGit();
          }
        } else {
          this.getFavorite();
        }
      } else if ($event.index === 4) {
        if (this.permission.joc.administration.certificates.view) {
          this.getGit();
        } else {
          this.getFavorite();
        }
      } else if ($event.index === 5) {
        this.getFavorite();
      }
    }
  }

  changePassword(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ChangePasswordComponent,
      nzData: {
        username: this.username,
        identityServiceName: this.identityServiceName
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  savePreferences(isThemeReload = false): void {
    if (this.schedulerIds.selected) {
      this.configObj.profileItem = JSON.stringify(this.preferences);
      sessionStorage['preferences'] = this.configObj.profileItem;
      if (isThemeReload) {
        this.dataService.isThemeReload.next(true);
      }
      this.coreService.post('profile/prefs/store', this.configObj).subscribe();
    }
  }

  groupLimit(): void {
    this.isGroupBtnActive = true;
  }


  setPreferences(): void {
    this.username = this.authService.currentUserData;
    this.securityLevel = sessionStorage['securityLevel'];
    if (this.securityLevel === 'LOW' && sessionStorage['defaultProfile'] && sessionStorage['defaultProfile'] === this.username) {
      this.securityLevel = 'MEDIUM';
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.configObj.controllerId = this.schedulerIds.selected;
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
  }

  changeConfiguration(isGroupBtnActive = false): void {
    if (this.preferences.entryPerPage > 100) {
      this.preferences.entryPerPage = this.preferences.maxEntryPerPage;
    }
    this.entryPerPage.pop();
    this.entryPerPage.push({value: this.preferences.maxEntryPerPage, name: this.preferences.maxEntryPerPage});
    if (isGroupBtnActive) {
      this.preferences.maxAuditLogRecords = this.preferences.maxRecords;
      this.preferences.maxNotificationRecords = this.preferences.maxRecords;
      this.preferences.maxOrderRecords = this.preferences.maxRecords;
      this.preferences.maxDailyPlanRecords = this.preferences.maxRecords;
      this.preferences.maxWorkflowRecords = this.preferences.maxRecords;
      this.preferences.maxFileTransferRecords = this.preferences.maxRecords;
      this.preferences.maxLockRecords = this.preferences.maxRecords;
      this.preferences.maxBoardRecords = this.preferences.maxRecords;
      this.isGroupBtnActive = false;
    }
    if (!this.preferences.licenseExpirationWarning) {
      delete this.preferences.licenseReminderDate;
    }
    sessionStorage['preferences'] = JSON.stringify(this.preferences);
    this.dataService.resetProfileSetting.next(true);
    this.savePreferences();
  }

  changeView(): void {
    const views = {
      dailyPlan: this.preferences.pageView,
      workflow: this.preferences.pageView,
      inventory: this.preferences.pageView,
      order: this.preferences.orderOverviewPageView,
      lock: this.preferences.pageView,
      board: this.preferences.pageView,
      documentation: this.preferences.pageView,
      agent: this.preferences.pageView,
      calendar: this.preferences.pageView,
      permission: this.preferences.pageView
    };
    localStorage['views'] = JSON.stringify(views);
  }

  setLocale(): void {
    localStorage['$SOS$LANG'] = this.preferences.locale;
    import(`../../../../node_modules/@angular/common/locales/${this.preferences.locale}.mjs`).then(locale => {
      registerLocaleData(locale.default);
    });
    this.translate.use(this.preferences.locale).subscribe((res) => {
      const data = res.extra;
      data.DatePicker.lang.monthBeforeYear = true;
      data.Calendar.lang.monthBeforeYear = true;
      data.locale = this.preferences.locale;
      for (const i in this.coreService.locales) {
        if (this.preferences.locale === this.coreService.locales[i].lang) {
          this.coreService.locales[i] = {
            ...this.coreService.locales[i],
            ...res.calendar
          };
          break;
        }
      }
      this.i18n.setLocale(data);
    });
    this.savePreferences();
  }

  changeTheme(theme): void {
    $('#style-color').attr('href', './styles/' + theme + '-style.css');
    localStorage['$SOS$THEME'] = theme;
    this.savePreferences();
  }

  changeMenuTheme(): void {
    this.savePreferences(true);
  }

  resetProfile(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzData: {
        title: 'resetProfile',
        message: 'resetProfilePreferences',
        type: 'Reset',
        objectName: this.username
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this._resetProfile();
      }
    });
  }

  private _resetProfile(): void {
    const obj = {accounts: [this.username], complete: false};
    this.coreService.post('profiles/delete', obj).subscribe(() => {
      sessionStorage.removeItem('preferences');
      if (sessionStorage['defaultProfile'] && sessionStorage['defaultProfile'] !== this.username) {
        this.getDefaultUserConfiguration()
      } else {
        this.dataService.isProfileReload.next(true);
      }
    });
  }

  private getDefaultUserConfiguration(): void {
    const configObj = {
      controllerId: this.schedulerIds.selected,
      accountName: sessionStorage['defaultProfile']
    };
    this.coreService.post('profile/prefs', configObj).subscribe({
      next: (res: any) => {
        const config = {
          controllerId: this.schedulerIds.selected,
          accountName: this.username,
          profileItem: res.profileItem
        };
        this.coreService.post('profile/prefs/store', config).subscribe((res: any) => {
          this.dataService.isProfileReload.next(true);
        });
      }
    });
  }

  getKeys(): void {
    this.keys = {};
    this.caCertificates = {};
    this.coreService.post('profile/key', {}).subscribe({
      next: (res: any) => {
        this.keys = res;
        if (this.keys.validUntil) {
          this.keys.isKeyExpired = this.coreService.getTimeDiff(this.preferences, this.keys.validUntil) < 0;
        }
      }, error: () => {
        this.keys = {};
      }
    });
    if (this.permission.joc && this.permission.joc.administration.certificates.view) {
      this.coreService.post('profile/key/ca', {}).subscribe({
        next: (res: any) => {
          this.caCertificates = res;
          if (this.caCertificates.validUntil) {
            this.caCertificates.isKeyExpired = this.coreService.getTimeDiff(this.preferences, this.caCertificates.validUntil) < 0;
          }
        }, error: () => {
          this.caCertificates = {};
        }
      });
    }
  }

  getCA(): void {
    this.certificates = {};
    this.coreService.post('profile/ca', {}).subscribe({
      next: (res: any) => {
        this.certificates = res;
        if (this.certificates.validUntil) {
          this.certificates.isKeyExpired = this.coreService.getTimeDiff(this.preferences, this.certificates.validUntil) < 0;
        }
      }, error: () => {
        this.certificates = {};
      }
    });
  }

  getGit(): void {
    this.coreService.post('inventory/repository/git/credentials', {}).subscribe({
      next: (res: any) => {
        this.gitCredentials = res;
      }, error: () => {
        this.gitCredentials = {};
      }
    });
  }

  pasteKey(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateKeyModalComponent,
      nzAutofocus: null,
      nzData: {
        securityLevel: this.securityLevel,
        display: this.preferences.auditLog,
        paste: true,
        type,
        data: {}
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        type === 'ca' ? this.getCA() : this.getKeys();
      }
    });
  }

  showGenerateKeyModal(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: GenerateKeyComponent,
      nzData: {
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
        type === 'ca' ? this.getCA() : this.getKeys();
      }
    });
  }

  importKey(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportKeyModalComponent,
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
        type === 'ca' ? this.getCA() : this.getKeys();
      }
    });
  }

  deleteCertificate(type: string): void {
    let comments = {
      radio: 'predefined',
      type: type,
      operation: 'Delete'
    };
    this.modal.create({
      nzTitle: undefined,
      nzContent: RemoveKeyModalComponent,
      nzClassName: 'lg',
      nzData: {
        display: this.preferences.auditLog,
        type,
        comments
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.getKeys();
      }
    });
  }

  showKey(type = 'key'): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateKeyModalComponent,
      nzData: {
        securityLevel: this.securityLevel,
        type,
        data: type === 'key' ? this.keys : type === 'certificate' ? this.caCertificates : this.certificates
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  /* ------------- Git Management-------------- */

  addGitCredential(): void {
    this.openCredentialModal(null);
  }

  editCredential(data): void {
    this.openCredentialModal(data);
  }

  private openCredentialModal(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: GitModalComponent,
      nzClassName: 'lg',
      nzData: {
        display: this.preferences.auditLog,
        data
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getGit();
      }
    });
  }

  deleteCredential(data): void {
    if (sessionStorage['$SOS$FORCELOGING'] === 'true' || this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Git Credential',
        operation: 'Delete',
        name: data.gitAccount
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteCredentials(data, result);
        }
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'delete',
          message: 'deleteGitCredentials',
          type: 'Delete',
          objectName: data.gitAccount,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this._deleteCredentials(data, {});
        }
      });
    }
  }

  private _deleteCredentials(data, comments): void {
    let obj: any = {
      gitServers: [data.gitServer]
    };
    obj.auditLog = {};
    if (comments.comment) {
      obj.auditLog.comment = comments.comment;
    }
    if (comments.timeSpent) {
      obj.auditLog.timeSpent = comments.timeSpent;
    }
    if (comments.ticketLink) {
      obj.auditLog.ticketLink = comments.ticketLink;
    }
    this.coreService.post('inventory/repository/git/credentials/remove', obj).subscribe({
      next: () => {
        this.getGit();
      }
    });
  }

  /* ------------- Favorite Management-------------- */

  innnerTabChange($event): void {
    this.type = $event.index == 0 ? 'AGENT' : 'FACET';
    this.getFavorite();
  }


  getFavorite(): void {
    this.coreService.post('inventory/favorites', {
      types: [this.type],
      withShared: true,
      limit: this.preferences.maxFavoriteEntries || 10
    }).subscribe({
      next: (res: any) => {
        this.sharedList = res.sharedFavorites;
        this.favList = res.favorites;
      }
    });
  }

  reload(type): void {
    if (type)
      this.getFavorite();
  }

  /* ----------------------FIDO--------------------- */
  addDevice(): void {
    if (this.coreService.checkConnection()) {
      this.coreService.post('iam/identity_fido_client', {
        identityServiceName: this.identityServiceName
      }).subscribe((res) => {
        this.createRequestObject(res);
      });
    }
  }

  private createRequestObject(fidoProperties): void {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    let publicKeyCredentialCreationOptions = this.authService.createPublicKeyCredentialRequest(challenge,
      fidoProperties, {accountName: this.username});
    navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    }).then((credential: any) => {
      const {jwk, publicKey} = this.authService.getPublicKey(credential.response.attestationObject);
      this.coreService.post('iam/fido/add_device', {
        identityServiceName: this.identityServiceName,
        accountName: this.username,
        publicKey: publicKey,
        origin: location.origin,
        jwk: jwk,
        credentialId: this.authService.bufferToBase64Url(credential.rawId)
      }).subscribe();
    });
  }

}

