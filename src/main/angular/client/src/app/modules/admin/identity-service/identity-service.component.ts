import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {clone, isEmpty} from 'underscore';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzUploadFile} from 'ng-zorro-antd/upload';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {saveAs} from 'file-saver';
import {HttpHeaders} from "@angular/common/http";
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../data.service';
import {SaveService} from '../../../services/save.service';
import {OrderPipe} from '../../../pipes/core.pipe';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';

@Component({
  selector: 'app-setting-modal-content',
  templateUrl: './setting-dialog.html'
})
export class SettingModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any = {};
  keyStoreTypes = ['JKS', 'PKCS12'];
  fileList: NzUploadFile[] = [];

  iamLdapProtocols = [{
    text: 'plainText',
    value: 'PLAIN'
  }, {
    text: 'startTls',
    value: 'STARTTLS'
  }, {
    text: 'ssl',
    value: 'SSL'
  }];
  iamFidoTransports = [{
    text: 'Ble',
    value: 'BLE'
  }, {
    text: 'Hybrid',
    value: 'HYBRID'
  }, {
    text: 'Internal',
    value: 'INTERNAL'
  },
    {
      text: 'Nfc',
      value: 'NFC'
    },
    {
      text: 'Usb',
      value: 'USB'
    }
  ];
  iamFidoUserVerification = [{
    text: 'Discouraged',
    value: 'DISCOURAGED'
  }, {
    text: 'Preferred',
    value: 'PREFERRED'
  }, {
    text: 'Required',
    value: 'REQUIRED'
  }
  ];

  isEnable = false;
  isLengthMatch = true;
  isTreeShow = false;
  submitted = false;
  jobResourcesTree: any = [];
  currentObj: any = {};
  userObj: any = {};
  allRoles: string[] = [];
  passwordFields: any = {
    first: false,
    second: false,
    third: false,
    fourth: false
  };
  oldPassword = '';
  display: any;
  required = false;
  comments: any = {};

  imageUrl = '';
  preview = false;
  loading = false;
  avatarUrl?: string;
  previewRegistration = false;
  fullScreen = false;
  fullScreen2 = false;
  fullScreen3 = false;

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private translate: TranslateService, private authService: AuthService,
              private message: NzMessageService, private saveService: SaveService, private toasterService: ToastrService, private dataService: DataService) {

  }

  static convertDurationToString(time: any): string {
    const seconds = Number(time);
    const d = Math.floor((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) / (3600 * 24));
    const h = Math.floor(((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
    const m = Math.floor((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
    const s = Math.floor(((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
    return (d != 0 ? d + 'd ' : '') + (h != 0 ? h + 'h ' : '') + (m != 0 ? m + 'm ' : '') + (s != 0 ? s + 's ' : '');
  }

  static convertStringToDuration(str: string): number {
    if (/^((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)m[ ]?)?((\d+)s[ ]?)?\s*$/.test(str)) {
      let seconds = 0;
      const a = str.split(' ');
      for (let i = 0; i < a.length; i++) {
        const frmt: string = a[i].charAt(a[i].length - 1);
        const val: number = Number(a[i].slice(0, a[i].length - 1));
        if (frmt && val) {
          if (frmt === 'd') {
            seconds += val * 24 * 3600;
          } else if (frmt === 'h') {
            seconds += val * 3600;
          } else if (frmt === 'm') {
            seconds += val * 60;
          } else if (frmt === 's') {
            seconds += Number(val);
          }
        }
      }
      return seconds;
    } else if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(str)) {
      const a = str.split(':');
      return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    } else {
      return parseInt(str, 10);
    }
  }

  ngOnInit(): void {
    this.data = this.modalData.data;

    const preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }

    if (this.data && this.saveService.copiedSetting && this.saveService.copiedSetting.type &&
      (this.saveService.copiedSetting.name !== this.data?.['identityServiceName'] || (this.saveService.copiedSetting.name === this.data?.['identityServiceName'] &&
        this.saveService.copiedSetting.type !== this.data?.['identityServiceType'])) &&
      (this.saveService.copiedSetting.type.indexOf(this.data?.['identityServiceType']) > -1 ||
        this.data?.['identityServiceType'].indexOf(this.saveService.copiedSetting.type) > -1)) {
      this.isEnable = true;
    }
    if (this.data && (this.data?.['identityServiceType'] === 'OIDC' || this.data?.['identityServiceType'] === 'OIDC-JOC')) {
      this.getImage();
    }

    this.coreService.post(this.data?.['identityServiceType'] == 'FIDO' ? 'iam/fido/configuration' : 'configuration', {
      id: 0,
      objectType: this.data ? this.data?.['identityServiceType'] : 'GENERAL',
      configurationType: 'IAM',
      name: this.data ? this.data?.['identityServiceName'] : undefined
    }).subscribe((res) => {
      if (res.configuration.objectType && this.data && (res.configuration.objectType.match('LDAP') || this.data['identityServiceType'] === 'OIDC')) {
        this.getUsersData();
      }
      if (res.configuration.configurationItem) {
        const data = JSON.parse(res.configuration.configurationItem);
        if (this.data) {
          if (data) {
            this.currentObj = data.vault || data.keycloak || data.oidc || data.fido || {};
            if (data.fido) {
              if (!this.currentObj.iamFidoProtocolType) {
                this.currentObj.iamFidoProtocolType = 'FIDO2';
              }
            } else if (this.data['identityServiceType'] === 'OIDC' || this.data['identityServiceType'] == 'OIDC-JOC') {
              if (this.currentObj.iamOidcClientId) {
                this.currentObj.iamOidcFlowType = this.currentObj.iamOidcClientSecret ? 'AUTHENTICATION' : 'IMPLICIT';
              } else {
                this.currentObj.iamOidcFlowType = 'AUTHENTICATION';
              }
            }
            if (this.data['identityServiceType'] == 'OIDC') {
              if (!this.currentObj.iamOidcGroupClaims || this.currentObj.iamOidcGroupClaims.length === 0) {
                this.currentObj.iamOidcGroupClaims = [{name: ''}];
              } else {
                this.currentObj.iamOidcGroupClaims = this.currentObj.iamOidcGroupClaims.map((item: string) => {
                  return {name: item};
                })
              }
            }
            if (data.ldap || (res.configuration.objectType && res.configuration.objectType.match(/LDAP/))) {
              if (data.ldap && data.ldap.simple) {
                this.userObj = data.ldap.simple;
                if (this.userObj.iamLdapHost && (!data.ldap.expert || !data.ldap.iamLdapServerUrl)) {
                  data.ldap.iamLdapServerUrl = (this.userObj.iamLdapProtocol === 'SSL' ? 'ldaps://' : 'ldap://') + this.userObj.iamLdapHost + ':' + this.userObj.iamLdapPort;
                }
              } else {
                this.userObj.iamLdapProtocol = 'PLAIN';
                this.userObj.iamLdapPort = 389;
              }
              if (data.ldap && data.ldap.expert) {
                this.currentObj = data.ldap.expert;
                if (!this.userObj.iamLdapHost && this.currentObj.iamLdapServerUrl) {
                  const from = this.currentObj.iamLdapServerUrl.indexOf('//') + 2;
                  const to = this.currentObj.iamLdapServerUrl.lastIndexOf(':');
                  this.userObj.iamLdapHost = from < to ? this.currentObj.iamLdapServerUrl.substring(from, to) : '';
                }
              }
              if(res.configuration.objectType === 'LDAP'){
                if (!this.currentObj.iamLdapGroupRolesMap) {
                  this.currentObj.iamLdapGroupRolesMap = {items: []};
                }
              }
            }
          }
        } else {
          this.currentObj = data;
          this.currentObj.initialPassword1 = '********';
          if (this.currentObj.initialPassword) {
            this.oldPassword = this.currentObj.initialPassword;
          } else {
            this.currentObj.initialPassword = 'initial';
          }

          if (data.sessionTimeout) {
            this.currentObj.sessionTimeout = SettingModalComponent.convertDurationToString(data.sessionTimeout);
          }
        }
        if (this.data?.['identityServiceType'] == 'FIDO') {
          if (!this.currentObj.iamFidoEmailSettings) {
            this.currentObj.iamFidoEmailSettings = {};
          }
          if (!this.currentObj.iamFidoEmailSettings.priority) {
            this.currentObj.iamFidoEmailSettings.priority = 'normal';
          }
          this.getJobResources();
        }
      }
    });
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    this.onImageSelected(file);
    return false;
  };

  beforeUpload2 = (file: NzUploadFile): boolean => {
    this.onFileSelected(file);
    return false;
  };

  handlePreview(file: NzUploadFile): void {
    this.getBase64(file, (img: string) => {
      this.loading = false;
      this.avatarUrl = img;
    });
  }

  onImageSelected(item: any): void {
    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1);
    if (!fileExt || fileExt.toUpperCase() != 'PNG') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(fileExt + ' ' + msg);
      this.fileList = [];
    } else if (item.size > (1000 * 1000)) {
      let msg = '';
      this.translate.get('error.message.fileSizeExceed').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(msg);
      this.fileList = [];
    } else {
      this.handlePreview(item);
    }
  }

  onSelect(name: string) {
    this.isTreeShow = false;
    this.currentObj.iamFidoEmailSettings.nameOfJobResource = name;
  }

  onBlur(): void {
    this.isTreeShow = false;
  }

  changeSettings(evt: string): void {
    if (evt === 'FIDO2') {
      this.currentObj.iamFidoUserVerification = 'REQUIRED';
      this.currentObj.iamFidoResidentKey = 'REQUIRED';
      this.currentObj.iamFidoAttachment = 'ROAMING';
    } else if (evt === 'PASSKEY') {
      this.currentObj.iamFidoResidentKey = 'REQUIRED';
      this.currentObj.iamFidoAttachment = 'PLATFORM';
    } else {
      this.currentObj.iamFidoAttachment = undefined;
      this.currentObj.iamFidoRequireAccount = true;
      if (this.currentObj.iamFidoUserVerification === 'REQUIRED') {
        this.currentObj.iamFidoUserVerification = 'PREFERRED';
      }
      if (this.currentObj.iamFidoResidentKey === 'REQUIRED') {
        this.currentObj.iamFidoResidentKey = 'PREFERRED';
      }
    }
  }

  changePswd(type: string): void {
    this.isLengthMatch = true;
    if (type == 'TEXT') {
      if (this.oldPassword !== this.currentObj.initialPassword) {
        this.currentObj.initialPassword1 = this.currentObj.initialPassword;
      }
    } else {
      if (this.currentObj.initialPassword1 !== '********') {
        this.currentObj.initialPassword = this.currentObj.initialPassword1;
      }
    }
  }

  changeConfiguration($event: string): void {
    if ($event === 'SSL' && (!this.userObj.iamLdapPort || this.userObj.iamLdapPort == 389)) {
      this.userObj.iamLdapPort = 636;
    } else if ((!this.userObj.iamLdapPort || this.userObj.iamLdapPort == 636)) {
      this.userObj.iamLdapPort = 389;
    }
    this.currentObj.iamLdapServerUrl = (this.userObj.iamLdapProtocol === 'SSL' ? 'ldaps://' : 'ldap://') + this.userObj.iamLdapHost + ':' + this.userObj.iamLdapPort;
    this.currentObj.iamLdapUseStartTls = this.userObj.iamLdapProtocol === 'STARTTLS';
  }

  changeField(): void {
    this.currentObj.iamLdapServerUrl = (this.userObj.iamLdapProtocol === 'SSL' ? 'ldaps://' : 'ldap://') + this.userObj.iamLdapHost + ':' + this.userObj.iamLdapPort;
  }

  checkConfirmation(isChecked: boolean, type: string): void {
    if (type === 'StartTls') {
      this.userObj.iamLdapProtocol = isChecked ? 'STARTTLS' : this.currentObj.iamLdapServerUrl.match('ldaps://') ? 'SSL' : 'PLAIN';
      return;
    }
    if (type === 'AD' && !isChecked) {
      this.userObj.iamLdapADwithSamAccount = false;
    }
    if (this.userObj.iamLdapWithMemberOf) {
      if (this.userObj.iamLdapAD) {
        if (!this.currentObj.iamLdapUserSearchFilter || this.currentObj.iamLdapUserSearchFilter === '(uid=%s' || this.currentObj.iamLdapUserSearchFilter === '%s') {
          this.currentObj.iamLdapUserSearchFilter = '';
        }
      } else {
        if (!this.currentObj.iamLdapUserSearchFilter || this.currentObj.iamLdapUserSearchFilter === '%s') {
          this.currentObj.iamLdapUserSearchFilter = '(uid=%s)';
        }
      }
    }
    if (type === 'MemberOf') {
      if (this.userObj.iamLdapWithMemberOf) {
        if (this.currentObj.iamLdapGroupNameAttribute) {
          this.currentObj.iamLdapGroupNameAttribute = 'memberOf';
        }
      }
    } else if (type === 'samAccount') {
      if (this.userObj.iamLdapADwithSamAccount) {
        this.currentObj.iamLdapUserDnTemplate = '{0}';
      }
    }
  }

  changeInput(type: string): void {
    if (type === 'URL') {
      this.updateUserMode();
    } else {
      if (this.currentObj.iamLdapUserDnTemplate && this.currentObj.iamLdapUserDnTemplate !== '{0}' && this.userObj.iamLdapADwithSamAccount) {
        this.userObj.iamLdapADwithSamAccount = false;
      }
    }
  }

  addGroupRoles(): void {
    const param = {
      ldapGroupDn: '',
      roles: []
    };
    if (!this.currentObj.iamLdapGroupRolesMap) {
      this.currentObj.iamLdapGroupRolesMap = {items: []};
    }
    if (!this.currentObj.iamLdapGroupRolesMap.items) {
      this.currentObj.iamLdapGroupRolesMap.items = [];
    }
    if (!this.coreService.isLastEntryEmpty(this.currentObj.iamLdapGroupRolesMap.items, 'ldapGroupDn', '')) {
      this.currentObj.iamLdapGroupRolesMap.items.push(param);
    }
  }

  addOidcGroupRoles(): void {
    const param = {
      oidcGroup: '',
      roles: []
    };
    if (!this.currentObj.iamOidcGroupRolesMap) {
      this.currentObj.iamOidcGroupRolesMap = {items: []};
    }
    if (!this.coreService.isLastEntryEmpty(this.currentObj.iamOidcGroupRolesMap.items, 'oidcGroup', '')) {
      this.currentObj.iamOidcGroupRolesMap.items.push(param);
    }
  }

  // CALLBACKS
  onFileSelected(file: any): void {
    const self = this;
    let item = file;

    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1);
    if (!fileExt || fileExt.toUpperCase() != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(fileExt + ' ' + msg);
      //  this.uploader.clearQueue();
    } else {
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event: any) {
      let data;
      try {
        data = JSON.parse(_event.target.result);
        if (self.data?.['identityServiceType'].match('VAULT')) {
          for (const prop in data) {
            if (prop && prop.match('iamVault')) {
              self.currentObj = data;
              break;
            }
          }
        } else if (self.data?.['identityServiceType'].match('KEYCLOAK')) {
          for (const prop in data) {
            if (prop && prop.match('iamKeycloak')) {
              self.currentObj = data;
              break;
            }
          }
        } else if (self.data?.['identityServiceType'].match('OIDC')) {
          for (const prop in data) {
            if (prop && prop.match('iamOidc')) {
              self.currentObj = data;
              break;
            }
          }
        } else if (self.data?.['identityServiceType'].match('FIDO')) {
          for (const prop in data) {
            if (prop && prop.match('iamFido')) {
              self.currentObj = data;
              break;
            }
          }
        } else if (self.data?.['identityServiceType'].match('LDAP')) {
          if (data.simple) {
            self.userObj = data.simple;
          } else if (data.expert) {
            self.sync(false);
          }
          if (data.expert) {
            self.currentObj = data.expert;
          } else if (data.simple) {
            self.sync(true);
          }
        }
      } catch (e) {
        self.translate.get('error.message.invalidJSON').subscribe(translatedValue => {
          self.toasterService.error(translatedValue);
        });
      }
      self.fileList = [];
    }
  }

  downloadSetting(): void {
    const name = this.data?.['identityServiceName'] + '.' + this.data?.['identityServiceType'].toLowerCase() + '.json';
    const fileType = 'application/octet-stream';
    let obj = this.currentObj;
    if (this.data?.['identityServiceType'].match('LDAP')) {
      obj = {simple: this.userObj, expert: this.currentObj};
    }
    const data = JSON.stringify(obj, undefined, 2);
    const blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
  }

  addGroup(list): void {
    list.push({name: ''});
  }

  removeGroup(list, index): void {
    list.splice(index, 1);
  }

  removeGroupRoles(index: number): void {
    this.currentObj.iamLdapGroupRolesMap.items.splice(index, 1);
  }

  removeOidcGroupRoles(index: number): void {
    this.currentObj.iamOidcGroupRolesMap.items.splice(index, 1);
  }

  deleteImage(): void {
    if (this.imageUrl) {
      this.coreService.post('documentations/delete', {
        documentations: ['/sos/.images/' + this.data?.['identityServiceName']]
      }).subscribe(() => {
        this.imageUrl = '';
      });
    } else {
      this.fileList = [];
    }
  }

  onSubmit(): void {
    if (!this.data) {
      this.isLengthMatch = true;
      if (this.currentObj.initialPassword && this.currentObj.minPasswordLength > this.currentObj.initialPassword.length) {
        this.isLengthMatch = false;
        return;
      }
    }
    this.submitted = true;
    this.iconUpload();
    let obj: any = {};
    if (this.data && this.data?.['identityServiceType']) {
      if (this.data?.['identityServiceType'].match('VAULT')) {
        obj.vault = this.currentObj;
      } else if (this.data?.['identityServiceType'].match('KEYCLOAK')) {
        obj.keycloak = this.currentObj;
      } else if (this.data?.['identityServiceType'].match('LDAP')) {
        obj.ldap = {expert: this.coreService.clone(this.currentObj), simple: this.userObj};
      } else if (this.data?.['identityServiceType'].match('OIDC')) {
        obj.oidc = this.currentObj;
        if (this.currentObj.iamOidcFlowType == 'IMPLICIT') {
          obj.oidc.iamOidcClientSecret = '';
        }
        if (this.data['identityServiceType'] == 'OIDC') {
          if (obj.oidc.iamOidcGroupClaims && obj.oidc.iamOidcGroupClaims.length > 0) {
            obj.oidc.iamOidcGroupClaims = obj.oidc.iamOidcGroupClaims.map((item: any) => {
              return item.name;
            });
          }
        }
      } else if (this.data?.['identityServiceType'] == 'FIDO') {
        obj.fido = this.currentObj;
      }
    } else {
      obj = this.coreService.clone(this.currentObj);
      delete obj.initialPassword1;
      if (obj.sessionTimeout) {
        obj.sessionTimeout = SettingModalComponent.convertStringToDuration(obj.sessionTimeout);
      }
    }
    const request: any = {
      id: 0,
      objectType: this.data ? this.data?.['identityServiceType'] : 'GENERAL',
      configurationType: 'IAM',
      name: this.data ? this.data?.['identityServiceName'] : undefined,
      configurationItem: JSON.stringify(obj),
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.coreService.post('configuration/save', request).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => this.submitted = false
    });
  }

  copySetting(): void {
    if (this.currentObj && !isEmpty(this.currentObj)) {
      this.saveService.copiedSetting = {
        type: this.data ? this.data?.['identityServiceType'] : 'GENERAL',
        name: this.data ? this.data?.['identityServiceName'] : undefined,
        data: this.currentObj
      };
      this.coreService.showCopyMessage(this.message);
    }
  }

  pasteSetting(): void {
    this.currentObj = clone(this.saveService.copiedSetting.data);
    if (this.saveService.copiedSetting.type.match('LDAP')) {
      this.updateUserMode();
    }
  }

  private getBase64(img: any, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  private getJobResources(): void {
    this.coreService.post('tree', {
      types: ['JOBRESOURCE'],
      forInventory: true
    }).subscribe((res) => {
      this.jobResourcesTree = this.coreService.prepareTree(res, true);
    });
  }

  private getUsersData(): void {
    this.allRoles = [];
    this.coreService.post('authentication/auth', {
      identityServiceName: this.data?.['identityServiceName']
    }).subscribe({
      next: res => {
        if (res.roles) {
          for (const prop in res.roles) {
            this.allRoles.push(prop);
          }
        }
      }
    });
  }

  private updateUserMode(): void {
    const PORT = this.currentObj.iamLdapServerUrl.substring(this.currentObj.iamLdapServerUrl.lastIndexOf(':') + 1);
    this.userObj.iamLdapPort = PORT.match(/\d+/g);
    if (this.userObj.iamLdapPort) {
      this.userObj.iamLdapPort = parseInt(this.userObj.iamLdapPort, 10);
    }
    const from = this.currentObj.iamLdapServerUrl.indexOf('//') + 2;
    const to = this.currentObj.iamLdapServerUrl.lastIndexOf(':');
    this.userObj.iamLdapHost = from < to ? this.currentObj.iamLdapServerUrl.substring(from, to) : '';
    if (this.currentObj.iamLdapUseStartTls) {
      this.userObj.iamLdapProtocol = 'STARTTLS';
    } else {
      this.userObj.iamLdapProtocol = this.currentObj.iamLdapServerUrl.match('ldaps') ? 'SSL' : 'PLAIN';
    }
  }

  private sync(isSimple: any): void {
    if (isSimple) {
      this.changeField();
      this.changeConfiguration(this.userObj.iamLdapProtocol);
      this.checkConfirmation(this.userObj.iamLdapAD, 'AD');
      this.checkConfirmation(this.userObj.iamLdapADwithSamAccount, 'samAccount');
      this.checkConfirmation(this.userObj.iamLdapWithMemberOf, 'MemberOf');
    } else {
      this.changeInput('URL');
      this.checkConfirmation(this.currentObj.iamLdapUseStartTls, 'StartTls');
    }
  }

  private getImage(): void {
    this.coreService.post('documentations', {
      documentations: ['/sos/.images/' + this.data?.['identityServiceName']]
    }).subscribe({
      next: (res: any) => {
        if (res.documentations && res.documentations.length > 0) {
          this.imageUrl = './api/iam/icon/' + this.data?.['identityServiceName'];
        }
      }
    });
  }

  private iconUpload(): void {
    if (this.fileList && this.fileList.length > 0) {
      const formData = new FormData();
      this.fileList.forEach((file: any) => {
        formData.append('file', file);
        formData.append('identityServiceName', this.data?.['identityServiceName']);
      });
      if (this.comments.comment) {
        formData.append('comment', this.comments.comment);
      }
      if (this.comments.timeSpent) {
        formData.append('timeSpent',this.comments.timeSpent);
      }
      if (this.comments.ticketLink) {
        formData.append('ticketLink', this.comments.ticketLink);
      }
      const headers = new HttpHeaders().set('X-Access-Token', this.authService.accessTokenId);
      headers.set('Content-Type', 'multipart/form-data');

      this.coreService.request('api/iam/import', formData, headers).subscribe();
    }
  }
}

@Component({
  selector: 'app-identity-service-modal-content',
  templateUrl: './identity-service-dialog.html'
})
export class IdentityServiceModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  identityServices?: any[] | undefined;
  identityService?: any;
  identityServiceTypes?: any[];

  submitted = false;
  isUnique = true;
  serviceAuthenticationSchemes = ['SINGLE-FACTOR', 'TWO-FACTOR'];
  currentObj: any = {};
  settingObj: any = {};
  removeSettingId = -1;
  display: boolean;
  required = false;
  comments: any = {};
  fidoList = [];
  certList = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.identityServices = this.modalData.identityServices;
    this.identityService = this.modalData.identityService;
    this.identityServiceTypes = this.modalData.identityServiceTypes;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    } else {
      const preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
      this.display = preferences.auditLog;
    }
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
    this.currentObj.ordering = this.identityServices ? (this.identityServices.length + 1) : 1;
    if (this.identityService) {
      this.currentObj = clone(this.identityService);
    } else {
      this.currentObj.serviceAuthenticationScheme = 'SINGLE-FACTOR';
    }
    this.getFidoList();
    this.getCertList();
  }

  checkService(): void {
    this.isUnique = true;
    if (this.identityServices) {
      for (let i = 0; i < this.identityServices.length; i++) {
        if (this.identityServices[i].identityServiceName === this.currentObj.identityServiceName && (!this.identityService || this.currentObj.identityServiceName !== this.identityService.identityServiceName)) {
          this.isUnique = false;
          break;
        }
      }
    }
  }

  changeType($event: any): void {
    if (this.identityService) {
      this.getSettings($event);
    }
  }

  checkTwoFactor($event: any): void {
    if ($event) {
      this.currentObj.serviceAuthenticationScheme = 'SINGLE-FACTOR';
    }
  }

  rename(identityServiceOldName: string, identityServiceNewName: string, cb: any): void {
    const request: any = {
      identityServiceOldName,
      identityServiceNewName
    };
    request.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.coreService.post('iam/identityservice/rename', request).subscribe({
      next: (res) => {
        cb(res);
      }, error: () => {
        cb(null);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.identityService) {
      if (this.identityService.identityServiceName !== this.currentObj.identityServiceName) {
        this.rename(this.identityService.identityServiceName, this.currentObj.identityServiceName, (res: any) => {
          if (res) {
            this.store();
          } else {
            this.submitted = false;
          }
        });
      } else {
        this.store();
      }
    } else {
      this.store();
    }
  }

  private getFidoList(): void {
    this.coreService.post('iam/identityservices', {"identityServiceType": "FIDO", "secondFactor": true}).subscribe({
      next: (res) => {
        this.fidoList = res.identityServiceItems;
      }
    })
  }

  private getCertList(): void {
    this.coreService.post('iam/identityservices', {
      identityServiceType: "CERTIFICATE",
      secondFactor: true
    }).subscribe({
      next: (res) => {
        this.certList = res.identityServiceItems;
      }
    })
  }

  private getSettings(type: string): void {
    if (this.identityService.identityServiceType === type || this.identityService.identityServiceType === 'JOC' ||
      type === 'JOC') {
      this.removeSettingId = -1;
      return;
    }
    this.coreService.post('configuration', {
      id: 0,
      objectType: this.identityService.identityServiceType,
      configurationType: 'IAM',
      name: this.identityService.identityServiceName
    }).subscribe((res) => {
      if (res.configuration.configurationItem) {
        const data = JSON.parse(res.configuration.configurationItem);
        if (data) {
          if (data.vault || data.ldap || data.keycloak || data.oidc || data.fido) {
            this.removeSettingId = res.configuration.id;
            this.settingObj = res.configuration.configurationItem;
          }
        }
      }
    });
  }

  private saveSettings(): void {
    const deleteRequest: any = {
      controllerId: '.',
      id: this.removeSettingId,
      auditLog: {}
    };
    const saveRequest: any = {
      id: 0,
      objectType: this.currentObj.identityServiceType,
      configurationType: 'IAM',
      name: this.currentObj.identityServiceName,
      configurationItem: this.settingObj,
      auditLog: {}
    };

    this.coreService.getAuditLogObj(this.comments, deleteRequest.auditLog);
    this.coreService.getAuditLogObj(this.comments, saveRequest.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.coreService.post('configuration/delete', deleteRequest).subscribe();
    this.coreService.post('configuration/save', saveRequest).subscribe({
      next: () => {
        this.removeSettingId = -1;
        this.store();
      }, error: () => {
        this.removeSettingId = -1;
        this.store();
      }
    });
  }

  private store(): void {
    if (this.removeSettingId > -1) {
      this.saveSettings();
      return;
    }
    this.currentObj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, this.currentObj.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.coreService.post('iam/identityservice/store', this.currentObj).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => this.submitted = false
    });
  }
}

// Main Component
@Component({
  selector: 'app-identity-service-all',
  templateUrl: 'identity-service.component.html'
})
export class IdentityServiceComponent {
  loading = true;
  preferences: any = {};
  permission: any = {};
  adminFilter: any = {};
  identityServiceTypes: any = [];
  identityServices: any = [];
  roles: any = [];
  filter: any = {};
  temp: any = 0;
  searchKey = '';
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private router: Router, private authService: AuthService, private coreService: CoreService,
              private modal: NzModalService, private dataService: DataService, private orderPipe: OrderPipe, private translate: TranslateService,) {
    this.subscription1 = this.dataService.searchKeyAnnounced$.subscribe(res => {
      this.searchKey = res;
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD') {
        this.add();
      } else if (res === 'MANAGE_SETTING') {
        this.manageSetting({data: null});
      }
    });
  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.adminFilter = this.coreService.getAdminTab();
    this.filter = this.adminFilter.identityService;
    this.getIAMList();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  showUser({identityService}: { identityService: any }): void {
    if (identityService.identityServiceType === 'UNKNOWN' || (identityService.identityServiceType == 'CERTIFICATE' && identityService.secondFactor)) {
      return;
    }
    sessionStorage['identityServiceName'] = identityService.identityServiceName;
    sessionStorage['identityServiceType'] = identityService.identityServiceType;
    if (identityService.secondFactor) {
      sessionStorage['secondFactor'] = identityService.secondFactor;
      this.router.navigate(['/users/identity_service/account']).then();
    } else {
      sessionStorage.removeItem('secondFactor');
      this.router.navigate(['/users/identity_service/role']).then();
    }
  }

  add(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: IdentityServiceModalComponent,
      nzAutofocus: null,
      nzData: {
        identityServices: this.identityServices,
        identityServiceTypes: this.identityServiceTypes
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getIAMList();
      }
    });
  }

  edit({identityService}: { identityService: any }): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: IdentityServiceModalComponent,
      nzAutofocus: null,
      nzData: {
        identityService,
        identityServices: this.identityServices,
        identityServiceTypes: this.identityServiceTypes
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getIAMList();
      }
    });
  }

  disable({identityService}: { identityService: any }): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Identity Service',
        operation: 'Disable',
        name: identityService.identityServiceName
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments
        },
        nzAutofocus: null,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.enableDisable(identityService, true, result);
        }
      });
    } else {
      this.enableDisable(identityService, true, this.dataService.comments);
    }
  }

  enable({identityService}: { identityService: any }): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Identity Service',
        operation: 'Enable',
        name: identityService.identityServiceName
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj: identityService,
          url: 'iam/identityservice/store'
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.enableDisable(identityService, false, result);
        }
      });
    } else {
      this.enableDisable(identityService, false, this.dataService.comments);
    }
  }

  manageSetting({data}: { data: any }): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: SettingModalComponent,
      nzClassName: data ? 'lg' : '',
      nzAutofocus: null,
      nzData: {
        data
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    const list = this.orderPipe.transform(this.identityServices, this.filter.filter.sortBy, this.filter.filter.reverse);
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    const changeArr = [];
    if (this.filter.filter.reverse) {
      let j = 1;
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].ordering = j;
        changeArr.push(list[i].identityServiceName)
        j++;
      }
    } else {
      for (let i = 0; i < list.length; i++) {
        list[i].ordering = i + 1;
        changeArr.push(list[i].identityServiceName)
      }
    }

    this.identityServices = list;
    let comments = {};
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        comments = {comment: translatedValue};
      });
    }
    this.coreService.post('iam/identityservices/reorder', {
      identityServiceNames: changeArr,
      auditLog: this.dataService.comments.comment ? this.dataService.comments : comments
    }).subscribe();
  }

  delete({identityService}: { identityService: any }): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Identity Service',
        operation: 'Delete',
        name: identityService.identityServiceName
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj: {identityServiceName: identityService.identityServiceName},
          url: 'iam/identityservice/delete'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (result.isChecked) {
            this.dataService.comments = result;
          }
          this.getIAMList();
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'delete',
          message: 'deleteIdentityService',
          type: 'Delete',
          objectName: identityService.identityServiceName,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          const auditLog: any = {};
          if (this.preferences.auditLog && this.dataService.comments.comment) {
            this.coreService.getAuditLogObj(this.dataService.comments, auditLog);
          }
          this.coreService.post('iam/identityservice/delete', {
            identityServiceName: identityService.identityServiceName,
            auditLog
          }).subscribe(() => {
            this.getIAMList();
          });
        }
      });
    }
  }

  sort(key: string): void {
    this.filter.filter.reverse = !this.filter.filter.reverse;
    this.filter.filter.sortBy = key;
  }

  private getIAMList(): void {
    this.coreService.post('iam/identityservices', {}).subscribe({
      next: (res: any) => {
        this.identityServiceTypes = res.identityServiceTypes;
        this.identityServices = res.identityServiceItems;
        this.loading = false;
      }, error: () => this.loading = false
    });
  }

  private enableDisable(identityService: any, flag: boolean, comments: any): void {
    identityService.disabled = flag;
    if (comments) {
      identityService.auditLog = {};
      this.coreService.getAuditLogObj(comments, identityService.auditLog);
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
    }
    this.coreService.post('iam/identityservice/store', identityService).subscribe({
      next: () => {

      }, error: () => this.getIAMList()
    });
  }
}
