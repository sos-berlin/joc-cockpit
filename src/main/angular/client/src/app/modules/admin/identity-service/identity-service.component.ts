import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {clone, isEmpty} from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NzMessageService} from 'ng-zorro-antd/message';
import {TranslateService} from "@ngx-translate/core";
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {SaveService} from '../../../services/save.service';
import {OrderPipe} from '../../../pipes/core.pipe';

@Component({
  selector: 'app-setting-modal-content',
  templateUrl: './setting-dialog.html'
})
export class SettingModalComponent implements OnInit {
  @Input() data: any;

  keyStoreTypes = ['JKS', 'PKCS12'];
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
  isEnable = false;
  isLengthMatch = true;
  submitted = false;
  currentObj: any = {};
  userObj: any = {
  };
  allRoles = [];
  passwordFields: any = {
    first: false,
    second: false,
    third: false
  };
  oldPassword : string;
  actualData:any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private modal: NzModalService,
              private message: NzMessageService, private saveService: SaveService, private translate: TranslateService) {
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
    if (this.saveService.copiedSetting && this.saveService.copiedSetting.type &&
      (this.saveService.copiedSetting.name !== this.data.identityServiceName || (this.saveService.copiedSetting.name === this.data.identityServiceName &&
        this.saveService.copiedSetting.type !== this.data.identityServiceType)) &&
      (this.saveService.copiedSetting.type.indexOf(this.data.identityServiceType) > -1 ||
        this.data.identityServiceType.indexOf(this.saveService.copiedSetting.type) > -1)) {
      this.isEnable = true;
    }

    this.coreService.post('configuration', {
      id: 0,
      objectType: this.data ? this.data.identityServiceType : 'GENERAL',
      configurationType: 'IAM',
      name: this.data ? this.data.identityServiceName : undefined
    }).subscribe((res) => {
      if (res.configuration.configurationItem) {
        const data = JSON.parse(res.configuration.configurationItem);
        if (this.data) {
          if (data) {
            this.currentObj = data.vault || {};
            if (data.ldap) {
              this.getUsersData();
              this.actualData = this.coreService.clone(data.ldap);
              if (data.ldap.simple) {
                this.userObj = data.ldap.simple;
              } else {
                this.userObj.iamLdapProtocol = 'PLAIN';
                this.userObj.iamLdapPort = 389;
              }
              if (data.ldap.expert) {
                this.currentObj = data.ldap.expert;
              }
            }
          }
        } else {
          this.currentObj = data;
          if (this.currentObj.initialPassword) {
            this.oldPassword = this.currentObj.initialPassword;
            this.currentObj.initialPassword1 = '********';
          }

          if (data.sessionTimeout) {
            this.currentObj.sessionTimeout = SettingModalComponent.convertDurationToString(data.sessionTimeout);
          }
        }
      }
    });
  }

  changePswd(type): void {
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

  private getUsersData(): void {
    this.allRoles = [];
    this.coreService.post('authentication/auth', {
      identityServiceName: this.data.identityServiceName
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

  changeConfiguration($event): void {
    if ($event === 'SSL' && (!this.userObj.iamLdapPort || this.userObj.iamLdapPort == 389)) {
      this.userObj.iamLdapPort = 636;
    } else if ((!this.userObj.iamLdapPort || this.userObj.iamLdapPort == 636)) {
      this.userObj.iamLdapPort = 389;
    }
    const url = (this.userObj.iamLdapProtocol === 'SSL' ? 'ldaps://' : 'ldap://') + this.userObj.iamLdapHost + ':' + this.userObj.iamLdapPort;
    if (this.actualData.expert && this.actualData.expert.iamLdapServerUrl) {
      if (this.actualData.expert.iamLdapServerUrl !== url) {
        this.showConfirm((res) => {
          if (res === 'OK') {
            this.actualData.expert.iamLdapServerUrl = '';
            this.currentObj.iamLdapServerUrl = url;
            this.currentObj.iamLdapUseStartTls = this.userObj.iamLdapProtocol === 'STARTTLS';
          } else {
            this.userObj.iamLdapProtocol = this.actualData.simple.iamLdapProtocol;
            this.userObj.iamLdapPort = this.actualData.simple.iamLdapPort;
          }
        });
      }
    } else {
      this.currentObj.iamLdapServerUrl = url;
      this.currentObj.iamLdapUseStartTls = this.userObj.iamLdapProtocol === 'STARTTLS';
    }
  }

  changeField(type): void {
    const url = (this.userObj.iamLdapProtocol === 'SSL' ? 'ldaps://' : 'ldap://') + this.userObj.iamLdapHost + ':' + this.userObj.iamLdapPort;
    if (this.actualData.expert && this.actualData.expert.iamLdapServerUrl) {
      if (this.actualData.expert.iamLdapServerUrl !== url) {
        this.showConfirm((res) => {
          if (res === 'OK') {
            this.actualData.expert.iamLdapServerUrl = '';
            this.currentObj.iamLdapServerUrl = url;
          } else {
            if (type === 'Host') {
              this.userObj.iamLdapHost = this.actualData.simple.iamLdapHost;
            } else if (type === 'Port') {
              this.userObj.iamLdapPort = this.actualData.simple.iamLdapPort;
            }
          }
        });
      }
    } else {
      this.currentObj.iamLdapServerUrl = url;
    }
  }

  checkConfirmation(isChecked, type): void {
    if (type === 'AD' && !isChecked) {
      this.userObj.iamLdapADwithSamAccount = false;
    }
    if (this.userObj.iamLdapWithMemberOf) {
      if (this.userObj.iamLdapAD) {
        if (!this.currentObj.iamLdapUserSearchFilter || this.currentObj.iamLdapUserSearchFilter === '(uid=%s' || this.currentObj.iamLdapUserSearchFilter === '%s') {
          this.currentObj.iamLdapUserSearchFilter = '%s';
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
          if (this.actualData.expert && this.actualData.expert.iamLdapGroupNameAttribute) {
            this.showConfirm((res) => {
              if (res === 'OK') {
                this.currentObj.iamLdapGroupNameAttribute = 'memberOf';
              } else {
                this.userObj.iamLdapWithMemberOf = this.actualData.simple.iamLdapWithMemberOf;
              }
            });
          } else {
            this.currentObj.iamLdapGroupNameAttribute = 'memberOf';
          }
        }
      }
    } else if (type === 'samAccount') {
      if (this.userObj.iamLdapADwithSamAccount) {
        if (this.actualData.expert && this.actualData.expert.iamLdapUserDnTemplate) {
          if (this.actualData.expert.iamLdapUserDnTemplate !== '{0}') {
            this.showConfirm((res) => {
              if (res === 'OK') {
                this.currentObj.iamLdapUserDnTemplate = '{0}';
              } else {
                this.userObj.iamLdapADwithSamAccount = this.actualData.simple.iamLdapADwithSamAccount;
              }
            });
          }
        } else{
          this.currentObj.iamLdapUserDnTemplate = '{0}';
        }
      }
    }
  }

  changeInput(type): void {
    if (type === 'GroupName') {

    } else if (type === 'URL') {
      if (this.actualData.simple && this.actualData.simple.iamLdapHost) {
        this.showConfirm((res) => {
          if (res === 'OK') {
            this.actualData.simple.iamLdapHost = '';
            this.actualData.expert.iamLdapServerUrl = '';
            this.updateUserMode();
          } else {
            this.currentObj.iamLdapServerUrl = this.actualData.expert.iamLdapServerUrl;
          }
        });
      } else {
        this.updateUserMode();
      }
    } else {
      if (this.currentObj.iamLdapUserDnTemplate && this.currentObj.iamLdapUserDnTemplate !== '{0}' && this.userObj.iamLdapADwithSamAccount) {
        if (this.actualData.simple && this.actualData.simple.iamLdapADwithSamAccount) {
          this.showConfirm((res) => {
            if (res === 'OK') {
               this.userObj.iamLdapADwithSamAccount = false;
            } else {
              this.currentObj.iamLdapUserDnTemplate = this.actualData.expert.iamLdapUserDnTemplate;
            }
          });
        } else {
          this.userObj.iamLdapADwithSamAccount = false;
        }
      }
    }
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

  private showConfirm(cb): void {
    let msg = '';
    this.translate.get('user.usermode.message.overwriteChanges').subscribe(translatedValue => {
      msg = translatedValue;
    });
    let confirmBtn = '';
    let cancelBtn = '';
    this.translate.get('common.button.confirm').subscribe(translatedValue => {
      confirmBtn = translatedValue;
    });
    this.translate.get('common.button.cancel').subscribe(translatedValue => {
      cancelBtn = translatedValue;
    });
    this.modal.confirm({
      nzTitle: msg,
      nzContent: '',
      nzOkText: confirmBtn,
      nzCancelText: cancelBtn,
      nzOnCancel: () => {
        cb('CANCEL')
      },
      nzOnOk: () => {
        cb('OK')
      }
    });
  }

  addGroupRoles(): void {
    const param = {
      ldapGroupDn: '',
      roles: []
    };
    if (!this.currentObj.iamLdapGroupRolesMap) {
      this.currentObj.iamLdapGroupRolesMap = {items: []};
    }
    if (!this.coreService.isLastEntryEmpty(this.currentObj.iamLdapGroupRolesMap.items, 'ldapGroupDn', '')) {
      this.currentObj.iamLdapGroupRolesMap.items.push(param);
    }
  }

  removeGroupRoles(index): void {
    this.currentObj.iamLdapGroupRolesMap.items.splice(index, 1);
  }

  onSubmit(): void {
    if(!this.data) {
      this.isLengthMatch = true;
      if (this.currentObj.initialPassword && this.currentObj.minPasswordLength > this.currentObj.initialPassword.length) {
        this.isLengthMatch = false;
        return;
      }
    }
    this.submitted = true;
    let obj: any = {};
    if (this.data && this.data.identityServiceType) {
      if (this.data.identityServiceType.match('VAULT')) {
        obj.vault = this.currentObj;
      } else if (this.data.identityServiceType.match('LDAP')) {
        obj.ldap = {expert: this.coreService.clone(this.currentObj), simple: this.userObj};
      }
    } else {
      obj = this.coreService.clone(this.currentObj);
      delete obj.initialPassword1;
      if (obj.sessionTimeout) {
        obj.sessionTimeout = SettingModalComponent.convertStringToDuration(obj.sessionTimeout);
      }
    }
    this.coreService.post('configuration/save', {
      id: 0,
      objectType: this.data ? this.data.identityServiceType : 'GENERAL',
      configurationType: 'IAM',
      name: this.data ? this.data.identityServiceName : undefined,
      configurationItem: JSON.stringify(obj)
    }).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => this.submitted = false
    });
  }

  copySetting(): void {
    if (this.currentObj && !isEmpty(this.currentObj)) {
      this.saveService.copiedSetting = {
        type: this.data ? this.data.identityServiceType : 'GENERAL',
        name: this.data ? this.data.identityServiceName : undefined,
        data: this.currentObj
      };
      this.coreService.showCopyMessage(this.message);
    }
  }

  pasteSetting(): void {
    this.currentObj = clone(this.saveService.copiedSetting.data);
  }

}

@Component({
  selector: 'app-identity-service-modal-content',
  templateUrl: './identity-service-dialog.html'
})
export class IdentityServiceModalComponent implements OnInit {
  @Input() identityServices: any[];
  @Input() identityService: any;
  @Input() identityServiceTypes: any[];

  submitted = false;
  isUnique = true;
  types = [];
  serviceAuthenticationSchemes = ['SINGLE-FACTOR', 'TWO-FACTOR'];
  currentObj: any = {};
  settingObj: any = {};
  removeSettingId = -1;

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.currentObj.ordering = this.identityServices.length + 1 || 1;
    if (this.identityService) {
      this.currentObj = clone(this.identityService);
    }
    let flag = true;
    for (const i in this.identityServices) {
      if (this.identityServices[i].identityServiceType === 'SHIRO' && (!this.identityService || 'SHIRO' !== this.identityService.identityServiceType)) {
        flag = false;
        break;
      }
    }
    this.types = this.identityServiceTypes.filter((item) => {
      return !flag ? item !== 'SHIRO' : true;
    });
  }

  checkService(): void {
    this.isUnique = true;
    for (const i in this.identityServices) {
      if (this.identityServices[i].identityServiceName === this.currentObj.identityServiceName && (!this.identityService || this.currentObj.identityServiceName !== this.identityService.identityServiceName)) {
        this.isUnique = false;
        break;
      }
    }
  }

  changeType($event): void {
    if (this.identityService) {
      this.getSettings($event);
    }
  }

  changeScheme($event): void {
    if ($event === 'TWO-FACTOR') {
      this.currentObj.singleFactorPwd = true;
      this.currentObj.singleFactorCert = true;
    } else {
      if (!this.currentObj.singleFactorPwd && !this.currentObj.singleFactorCert) {
        this.currentObj.singleFactorPwd = true;
      } else if (this.currentObj.singleFactorPwd && this.currentObj.singleFactorCert){
        this.currentObj.singleFactorCert = false;
      }
    }
  }

  checkCheckbox(type): void {
    if (type === 'pwd') {
      this.currentObj.singleFactorCert = !this.currentObj.singleFactorPwd;
    } else {
      this.currentObj.singleFactorPwd = !this.currentObj.singleFactorCert;
    }
  }

  private getSettings(type): void {
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
          if (data.vault || data.ldap) {
            this.removeSettingId = res.configuration.id;
            this.settingObj = res.configuration.configurationItem;
          }
        }
      }
    });
  }

  private saveSettings(): void {
    this.coreService.post('configuration/delete', {
      controllerId: '.',
      id: this.removeSettingId
    }).subscribe();
    this.coreService.post('configuration/save', {
      id: 0,
      objectType: this.currentObj.identityServiceType,
      configurationType: 'IAM',
      name: this.currentObj.identityServiceName,
      configurationItem: this.settingObj
    }).subscribe({
      next: () => {
        this.removeSettingId = -1;
        this.store();
      }, error: () => {
        this.removeSettingId = -1;
        this.store();
      }
    });
  }

  rename(identityServiceOldName: string, identityServiceNewName: string, cb: any): void {
    this.coreService.post('iam/identityservice/rename', {
      identityServiceOldName,
      identityServiceNewName
    }).subscribe({
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
        this.rename(this.identityService.identityServiceName, this.currentObj.identityServiceName, (res) => {
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

  private store(): void {
    if (this.removeSettingId > -1) {
      this.submitted = false;
      this.saveSettings();
      return;
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
export class IdentityServiceComponent implements OnInit, OnDestroy {

  loading = true;
  preferences: any = {};
  identityServiceTypes: any = [];
  identityServices: any = [];
  roles: any = [];
  reverse = false;
  usr: any = {};
  userDetail: any = {};
  temp: any = 0;
  searchKey = '';
  showMessage = false;
  showMessage2 = false;
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private router: Router, private authService: AuthService, private coreService: CoreService,
              private modal: NzModalService, private dataService: DataService, private orderPipe: OrderPipe) {
    this.subscription1 = this.dataService.searchKeyAnnounced$.subscribe(res => {
      this.searchKey = res;
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD') {
        this.add();
      } else if (res === 'MANAGE_SETTING') {
        this.manageSetting(null);
      }
    });
  }

  ngOnInit(): void {
    this.usr = {currentPage: 1, sortBy: 'ordering', reverse: false};
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.getIAMList();
  }

  private getIAMList(): void {
    this.coreService.post('iam/identityservices', {}).subscribe({
      next: (res: any) => {
        this.identityServiceTypes = res.identityServiceTypes;
        this.identityServices = res.identityServiceItems;
        this.loading = false;
        this.checkTypes();
      }, error: () => this.loading = false
    });
  }

  private checkTypes(): void {
    const arr = [];
    const arr2 = [];
    for (const i in this.identityServices) {
      if (!this.identityServices[i].disabled) {
        if (this.identityServices[i].identityServiceType.match(/vault/i)) {
          if (arr.indexOf(this.identityServices[i].identityServiceType) === -1) {
            arr.push(this.identityServices[i].identityServiceType);
          }
        } else if (this.identityServices[i].identityServiceType.match(/ldap/i)) {
          if (arr2.indexOf(this.identityServices[i].identityServiceType) === -1) {
            arr2.push(this.identityServices[i].identityServiceType);
          }
        }
      }
    }
    this.showMessage = arr.length > 1;
    this.showMessage2 = arr2.length > 1;
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  showUser(account): void {
    sessionStorage.identityServiceName = account.identityServiceName;
    sessionStorage.identityServiceType = account.identityServiceType;
    this.router.navigate(['/users/identity_service/role']);
  }

  add(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: IdentityServiceModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
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

  edit(identityService): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: IdentityServiceModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
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

  disable(identityService): void {
    this.enableDisable(identityService, true);
  }

  enable(identityService): void {
    this.enableDisable(identityService, false);
  }

  manageSetting(data): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: SettingModalComponent,
      nzClassName: data ? 'lg' : '',
      nzAutofocus: null,
      nzComponentParams: {
        data
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    const list = this.orderPipe.transform(this.identityServices, this.usr.sortBy, this.usr.reverse);
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    if (this.usr.reverse) {
      let j = 1;
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].ordering = j;
        j++;
      }
    } else {
      for (let i = 0; i < list.length; i++) {
        list[i].ordering = i + 1;
      }
    }
    this.identityServices = list;
    this.identityServices.forEach((identityService) => {
      this.enableDisable(identityService, identityService.disabled);
    });
  }

  private enableDisable(identityService, flag): void {
    identityService.disabled = flag;
    this.coreService.post('iam/identityservice/store', identityService).subscribe({
      next: () => this.checkTypes(), error: () => this.getIAMList()
    });
  }

  delete(identityService): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
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
        this.coreService.post('iam/identityservice/delete', {identityServiceName: identityService.identityServiceName}).subscribe(() => {
          this.getIAMList();
        });
      }
    });
  }

  sort(key): void {
    this.usr.reverse = !this.usr.reverse;
    this.usr.sortBy = key;
  }
}
