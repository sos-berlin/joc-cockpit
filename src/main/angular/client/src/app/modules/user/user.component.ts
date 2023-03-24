import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {ToastrService} from 'ngx-toastr';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzI18nService} from 'ng-zorro-antd/i18n';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {registerLocaleData} from '@angular/common';
import {ChangePasswordComponent} from "../../components/change-password/change-password.component";
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from "../../components/comment-modal/comment.component";
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

declare var $;

@Component({
  selector: 'app-edit-favorite-modal',
  templateUrl: './edit-favorite-dialog.html'
})
export class EditFavoriteModalComponent implements OnInit {
  @Input() list = [];
  @Input() data: any;
  @Input() type: string;
  @Input() schedulerId: any;

  submitted = false;
  agents = [];
  object: any = {};

  constructor(private activeModal: NzModalRef, private coreService: CoreService, private translate: TranslateService) {
  }

  ngOnInit(): void {
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
export class FavoriteListComponent implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
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
      nzComponentParams: {
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
export class GitModalComponent implements OnInit {
  @Input() display: any;
  @Input() data: any;
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
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
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
export class UpdateKeyModalComponent implements OnInit {
  @Input() paste: any;
  @Input() data: any;
  @Input() securityLevel: string;
  @Input() type: string;
  @Input() display: any;

  required = false;
  submitted = false;
  comments: any = {};
  algorithm: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.algorithm.keyAlg = this.securityLevel !== 'HIGH' ? 'RSA' : 'PGP';
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.type === 'ca') {
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
        if (this.algorithm.keyAlg === 'PGP') {
          obj = {publicKey: this.data.publicKey};
        } else if (this.algorithm.keyAlg === 'RSA' || this.algorithm.keyAlg === 'ECDSA') {
          obj = {publicKey: this.data.publicKey, certificate: this.data.certificate};
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
    this.coreService.post(URL, this.type === 'key' ? {keys: obj} : obj).subscribe({
      next: () => {
        this.activeModal.close();
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-import-key-modal',
  templateUrl: './import-key-dialog.html'
})
export class ImportKeyModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() display: any;
  @Input() securityLevel: string;
  @Input() type: string;

  uploader: FileUploader;
  submitted = false;
  required = false;
  hasBaseDropZoneOver: any;
  comments: any = {};
  key = {keyAlg: 'RSA'};

  constructor(public activeModal: NzModalRef, private authService: AuthService, private coreService: CoreService,
              public translate: TranslateService, public toasterService: ToastrService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 2
    });
    let uo: FileUploaderOptions = {};
    uo.headers = [{name: 'X-Access-Token', value: this.authService.accessTokenId}];
    this.uploader.setOptions(uo);
  }

  ngOnInit(): void {
    this.uploader.options.url = this.type === 'key' ? './api/profile/key/import' : this.type === 'certificate' ? './api/profile/key/ca/import' : './api/profile/ca/import';
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.type === 'ca') {
      this.key.keyAlg = 'ECDSA';
    }

    this.uploader.onBeforeUploadItem = (item: any) => {
      let obj: any = {
        name: item.file.name,
        importKeyFilter: JSON.stringify({keyAlgorithm: this.key.keyAlg})
      };
      if (this.type === 'certificate') {
        obj = {};
      }
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      //item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
    };

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        if (this.uploader.queue.length === 1 || this.uploader.queue[this.uploader.queue.length - 1].file.name === fileItem.file.name) {
          this.activeModal.close('success');
        }
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      this.submitted = false;
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
      }
    };
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

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
              self.uploader.queue[i].index = 1;
            } else if (data.match(/public/i)) {
              self.uploader.queue[i].index = 2;
            } else if (data.match(/certificate/i)) {
              self.uploader.queue[i].index = 3;
            } else {
              let msg;
              self.translate.get('profile.message.invalidKeyFileSelected').subscribe(translatedValue => {
                msg = translatedValue;
              });
              self.toasterService.error(msg);
              self.uploader.queue[i].remove();
            }
          }
        } catch (e) {

        }
      }
    }
  }

  import(): void {
    this.submitted = true;
    this.uploader.queue = this.uploader.queue.sort((a, b) => {
      return a.index - b.index;
    });
    for (let i = 0; i < this.uploader.queue.length; i++) {
      setTimeout(() => {
        this.uploader.queue[i].upload();
      }, 10 * i);
    }
  }

  cancel(): void {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-generate-key-component',
  templateUrl: './generate-key-dialog.html'
})
export class GenerateKeyComponent implements OnInit {
  @Input() type: string;
  @Input() display: any;
  submitted = false;
  expiry: any = {dateValue: 'date'};
  caObj: any = {};
  required = false;
  comments: any = {};
  key: any = {
    keyAlg: 'RSA'
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private translate: TranslateService, private toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
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
    const URL = this.type === 'key' ? 'profile/key/generate' : 'profile/ca/generate';
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        let msg;
        this.translate.get('profile.keyManagement.message.keyGeneratedSuccessfully').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.toasterService.success(msg);
        this.activeModal.close('ok');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
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
  forceLoging = false;
  isGroupBtnActive = false;
  selectedController = '';
  securityLevel: string;
  identityServiceType: string;
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
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.forceLoging = true;
      this.preferences.auditLog = true;
    }
    this.identityServiceType = this.authService.currentUserIdentityService.substring(0, this.authService.currentUserIdentityService.lastIndexOf(':'));
    this.setIds();
    this.setPreferences();
    this.zones = this.coreService.getTimeZoneList();
    this.timeZone = this.coreService.getTimeZone();
    this.configObj.controllerId = this.schedulerIds.selected;
    this.configObj.accountName = this.username;
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
      nzComponentParams: {
        username: this.username,
        identityServiceName: this.authService.currentUserIdentityService.substring(this.authService.currentUserIdentityService.lastIndexOf(':') + 1)
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  savePreferences(isThemeReload = false): void {
    if (this.schedulerIds.selected) {
      this.configObj.profileItem = JSON.stringify(this.preferences);
      sessionStorage.preferences = this.configObj.profileItem;
      if (isThemeReload) {
        this.dataService.isThemeReload.next(true);
      }
      this.coreService.post('profile/prefs/store', this.configObj).subscribe();
    }
  }

  groupLimit(): void {
    this.isGroupBtnActive = true;
  }

  setIds(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
  }

  setPreferences(): void {
    this.username = this.authService.currentUserData;
    this.securityLevel = sessionStorage.securityLevel;
    if (this.securityLevel === 'LOW' && sessionStorage.defaultProfile && sessionStorage.defaultProfile === this.username) {
      this.securityLevel = 'MEDIUM';
    }
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
  }

  changeConfiguration(isGroupBtnActive = false): void {
    if (this.preferences.entryPerPage > 100) {
      this.preferences.entryPerPage = this.preferences.maxEntryPerPage;
    }
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
    sessionStorage.preferences = JSON.stringify(this.preferences);
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
    localStorage.views = JSON.stringify(views);
  }

  setLocale(): void {
    localStorage.$SOS$LANG = this.preferences.locale;
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
    localStorage.$SOS$THEME = theme;
    this.savePreferences();
  }

  changeMenuTheme(): void {
    this.savePreferences(true);
  }

  resetProfile(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'resetProfile',
        message: 'resetProfilePreferences',
        type: 'Reset',
        objectName: this.username
      },
      nzFooter: null,
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
      if(sessionStorage.defaultProfile && sessionStorage.defaultProfile !== this.username){
        this.getDefaultUserConfiguration()
      } else {
        this.dataService.isProfileReload.next(true);
      }
    });
  }

  private getDefaultUserConfiguration(): void {

    const configObj = {
      controllerId: this.schedulerIds.selected,
      accountName: sessionStorage.defaultProfile
    };
    const preferences: any = {};
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
      nzComponentParams: {
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
      nzComponentParams: {
        display: this.preferences.auditLog,
        type
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

  importKey(type = 'key'): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportKeyModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        securityLevel: this.securityLevel,
        display: this.preferences.auditLog,
        type
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

  showKey(type = 'key'): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateKeyModalComponent,
      nzComponentParams: {
        securityLevel: this.securityLevel,
        type,
        data: type === 'key' ? this.keys : type === 'certificate' ? this.caCertificates : this.certificates
      },
      nzFooter: null,
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
      nzComponentParams: {
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
    if (sessionStorage.$SOS$FORCELOGING === 'true' || this.preferences.auditLog) {
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
        nzComponentParams: {
          comments
        },
        nzFooter: null,
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
        nzComponentParams: {
          title: 'delete',
          message: 'deleteGitCredentials',
          type: 'Delete',
          objectName: data.gitAccount,
        },
        nzFooter: null,
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
}

