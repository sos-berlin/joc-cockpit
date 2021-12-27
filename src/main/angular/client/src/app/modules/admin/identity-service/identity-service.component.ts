import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {clone, isEmpty} from 'underscore';
import {OrderPipe} from 'ngx-order-pipe';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {SaveService} from '../../../services/save.service';

@Component({
  selector: 'app-setting-modal-content',
  templateUrl: './setting-dialog.html'
})
export class SettingModalComponent implements OnInit {
  @Input() data: any;

  isEnable = false;
  submitted = false;
  currentObj: any = {};
  passwordFields: any = {
    first: false,
    second: false,
    third: false
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private message: NzMessageService, private saveService: SaveService) {
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
            this.currentObj = data.vault || data.ldap || {};
          }
        } else {
          this.currentObj = data;
          if (data.sessionTimeout) {
            this.currentObj.sessionTimeout = this.convertDurationToString(data.sessionTimeout);
          }
        }
      }
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

  private convertDurationToString(time: any): string {
    const seconds = Number(time);
    const d = Math.floor((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) / (3600 * 24));
    const h = Math.floor(((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
    const m = Math.floor((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
    const s = Math.floor(((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
    return (d != 0 ? d + 'd ' : '') + (h != 0 ? h + 'h ' : '') + (m != 0 ? m + 'm ' : '') + (s != 0 ? s + 's ' : '');
  }

  private convertStringToDuration(str: string): number {
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

  onSubmit(): void {
    this.submitted = true;
    let obj: any = {};
    if (this.data && this.data.identityServiceType) {
      if (this.data.identityServiceType.match('VAULT')) {
        obj.vault = this.currentObj;
      } else if (this.data.identityServiceType.match('LDAP')) {
        obj.ldap = this.currentObj;
      }
    } else {
      obj = this.currentObj;
      if (obj.sessionTimeout) {
        obj.sessionTimeout = this.convertStringToDuration(obj.sessionTimeout);
      }
    }
    this.coreService.post('configuration/save', {
      id: 0,
      objectType: this.data ? this.data.identityServiceType : 'GENERAL',
      configurationType: 'IAM',
      name: this.data ? this.data.identityServiceName : undefined,
      configurationItem: JSON.stringify(obj)
    }).subscribe((res) => {
      this.activeModal.close(res);
    }, () => {
      this.submitted = false;
    });
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
    }).subscribe(() => {

    });
    this.coreService.post('configuration/save', {
      id: 0,
      objectType: this.currentObj.identityServiceType,
      configurationType: 'IAM',
      name: this.currentObj.identityServiceName,
      configurationItem: this.settingObj
    }).subscribe(() => {
      this.removeSettingId = -1;
      this.store();
    }, () => {
      this.removeSettingId = -1;
      this.store();
    });
  }

  rename(identityServiceOldName: string, identityServiceNewName: string, cb: any): void {
    this.coreService.post('iam/identityservice/rename', {
      identityServiceOldName,
      identityServiceNewName
    }).subscribe((res) => {
      cb(res);
    }, () => {
      cb(null);
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
    this.coreService.post('iam/identityservice/store', this.currentObj).subscribe((res) => {
      this.activeModal.close(res);
    }, () => {
      this.submitted = false;
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
    this.coreService.post('iam/identityservices', {}).subscribe((res: any) => {
      this.identityServiceTypes = res.identityServiceTypes;
      this.identityServices = res.identityServiceItems;
      this.checkVaultTypes();
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private checkVaultTypes(): void {
    this.showMessage = false;
    const arr = [];
    for (const i in this.identityServices) {
      if (this.identityServices[i].identityServiceType.match(/vault/i) && !this.identityServices[i].disabled) {
        if (arr.indexOf(this.identityServices[i].identityServiceType) === -1) {
          arr.push(this.identityServices[i].identityServiceType);
        }
      }
    }
    this.showMessage = arr.length > 1;
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  showUser(account): void {
    sessionStorage.identityServiceName = account.identityServiceName;
    sessionStorage.identityServiceType = account.identityServiceType;
    this.router.navigate([account.identityServiceType === 'VAULT' ? '/users/identity_service/role' : '/users/identity_service/account']);
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
    this.coreService.post('iam/identityservice/store', identityService).subscribe(() => {
      this.checkVaultTypes();
    }, () => {
      this.getIAMList();
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
        this.coreService.post('iam/identityservice/delete', {identityServiceName: identityService.identityServiceName}).subscribe((res) => {
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
