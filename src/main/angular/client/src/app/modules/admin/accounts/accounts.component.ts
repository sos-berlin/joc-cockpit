import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {isEqual, clone} from 'underscore';
import {saveAs} from 'file-saver';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {SearchPipe, OrderPipe} from '../../../pipes/core.pipe';
import {ShowPermissionComponent} from "../show-permission/show-permission.component";
import {AddBlocklistModalComponent} from '../blocklist/blocklist.component';
import {FileUploaderComponent} from "../../../components/file-uploader/file-uploader.component";

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-dialog.html'
})
export class ConfirmationModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  delete: any;
  cancel = false;
  reset: any;
  forceChange: any;
  accounts: any;
  account: any;
  approve = false;
  reject = false;
  deleteRequest: any;
  isRole: any;
  blocklist: any;
  activeSession: any;
  identityServiceName = '';
  deleteDevices = false;
  submitted = false;
  display: any;
  required = false;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.delete = this.modalData.delete;
    this.cancel = this.modalData.cancel;
    this.reset = this.modalData.reset;
    this.forceChange = this.modalData.forceChange;
    this.accounts = this.modalData.accounts;
    this.account = this.modalData.account;
    this.approve = this.modalData.approve;
    this.reject = this.modalData.reject;
    this.deleteRequest = this.modalData.deleteRequest;
    this.isRole = this.modalData.isRole;
    this.blocklist = this.modalData.blocklist;
    this.activeSession = this.modalData.activeSession;
    this.identityServiceName = this.modalData.identityServiceName;
    this.deleteDevices = this.modalData.deleteDevices;
    let preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
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
  }

  confirm(): void {
    if (this.delete || this.cancel || this.deleteDevices) {
      this.activeModal.close('DONE');
      return;
    }
    const accountNames = [];
    if (this.account) {
      if (this.approve || this.reject || this.deleteRequest) {
        accountNames.push({
          accountName: this.account.accountName,
          origin: this.account.origin
        });
      } else {
        accountNames.push(this.account.accountName);
      }
    } else {
      this.accounts.forEach((value: any, key: any) => {
        if (this.approve || this.reject || this.deleteRequest) {
          accountNames.push({
            accountName: key,
            origin: value.origin
          });
        } else {
          accountNames.push(key);
        }
      });
    }
    const auditLog: any = {};
    this.coreService.getAuditLogObj(this.comments, auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.submitted = true;
    let URL = this.forceChange ? 'iam/accounts/forcepasswordchange' : 'iam/accounts/resetpassword';
    if (this.approve) {
      URL = 'iam/fidoregistration/approve';
    } else if (this.reject) {
      URL = 'iam/fidoregistration/deferr';
    } else if (this.deleteRequest) {
      URL = 'iam/fidoregistration/delete';
    }
    let obj: any = {
      identityServiceName: this.identityServiceName,
      auditLog
    };
    if (this.approve || this.reject || this.deleteRequest) {
      obj.accounts = accountNames;
    } else {
      obj.accountNames = accountNames;
    }
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => {
        this.submitted = false;
      }
    });
  }
}

@Component({
  selector: 'app-user-modal-content',
  templateUrl: './user-dialog.html'
})
export class AccountModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  newUser = false;
  copy = false;
  userDetail: any;
  accountList: any = [];
  oldUser: any;
  identityServiceType = '';
  identityServiceName = '';

  submitted = false;
  isUnique = true;
  currentUser: any = {};
  isPasswordVisible = true;
  isPasswordMatch = true;
  minimumPasswordLength = true;
  settings: any = {};
  allRoles: any = [];
  display: any;
  required = false;
  comments: any = {};
  secondFactor = false;

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.newUser = this.modalData.newUser;
    this.copy = this.modalData.copy;
    this.userDetail = this.modalData.userDetail;
    this.accountList = this.modalData.accountList || [];
    this.oldUser = this.modalData.oldUser;
    this.identityServiceType = this.modalData.identityServiceType;
    this.identityServiceName = this.modalData.identityServiceName;
    this.comments.radio = 'predefined';
    this.secondFactor = !!sessionStorage['secondFactor'];
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    } else {
      let preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
      this.display = preferences.auditLog;
    }
    this.getRoles();
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
    const type = sessionStorage['identityServiceType'] || '';
    this.getConfiguration();
    if (this.oldUser) {
      this.currentUser = clone(this.oldUser);
      this.currentUser.fakePassword = '********';
      this.currentUser.userName = this.currentUser.accountName;
      if (this.copy) {
        this.currentUser.accountName = '';
      }
    } else {
      this.currentUser = {
        accountName: '',
        fakePassword: '',
        roles: []
      };
    }
    if (this.copy || (type !== 'JOC')) {
      this.isPasswordVisible = false;
      delete this.currentUser.password;
    }
    if (this.newUser && (this.identityServiceType === 'JOC')) {
      this.currentUser.forcePasswordChange = true;
    }
  }

  private getRoles(): void {
    this.coreService.post('iam/roles', {identityServiceName: this.identityServiceName}).subscribe((res: any) => {
      for (const i in res.roles) {
        this.allRoles.push(res.roles[i].roleName);
      }
    })
  }

  private getConfiguration(): void {
    const obj: any = {
      id: 0,
      objectType: 'GENERAL',
      configurationType: 'IAM',
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.coreService.post('configuration', obj).subscribe((res) => {
      if (res.configuration.configurationItem) {
        this.settings = JSON.parse(res.configuration.configurationItem);
      }
    });
  }

  checkUser(newUser: string, existingUser: string): void {
    this.isUnique = true;
    for (let i = 0; i < this.accountList.length; i++) {
      if (this.accountList[i].accountName === newUser && newUser !== existingUser) {
        this.isUnique = false;
        break;
      }
    }
  }

  checkPwdLength(): void {
    if (this.settings) {
      if (this.settings.minPasswordLength) {
        if (this.currentUser.fakePassword && this.settings.minPasswordLength > this.currentUser.fakePassword.length) {
          this.minimumPasswordLength = false;
        }
      }
    }
    if (this.currentUser.repeatedPassword) {
      this.checkPassword();
    }
  }

  checkPassword(): void {
    this.isPasswordMatch = isEqual(this.currentUser.fakePassword, this.currentUser.repeatedPassword);
    if (!this.currentUser.repeatedPassword) {
      this.isPasswordMatch = true;
    }
    if (this.oldUser && this.currentUser.fakePassword !== '********') {
      this.currentUser.forcePasswordChange = true;
      this.currentUser.isDisabled = true;
    }
  }

  private rename(cb: any): void {
    if (this.oldUser.accountName !== this.currentUser.accountName) {
      const obj: any = {
        identityServiceName: this.identityServiceName,
        accountOldName: this.oldUser.accountName,
        accountNewName: this.currentUser.accountName,
        auditLog: {}
      };
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      if (this.comments.isChecked) {
        this.dataService.comments = this.comments;
      }
      this.coreService.post('iam/account/rename', obj).subscribe({
        next: () => {
          cb('OK');
        }, error: () => {
          cb();
        }
      });
    } else {
      cb('OK');
    }
  }

  onSubmit(obj: any): void {
    this.submitted = true;
    this.isUnique = true;
    if (obj.fakePassword !== '********') {
      obj.password = obj.fakePassword || '';
    }

    if (this.newUser || this.copy) {
      this.store(obj);
    } else {
      this.rename((result: any) => {
        if (result) {
          this.store(obj);
        }
      });
    }
  }

  private store(obj: any) {
    const request: any = {
      identityServiceName: this.identityServiceName,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    request.accountName = obj.accountName;
    request.password = obj.password;
    request.disabled = obj.disabled;
    request.blocked = obj.blocked;
    request.enabled = obj.enabled;
    request.forcePasswordChange = obj.forcePasswordChange;
    request.roles = obj.roles;
    this.coreService.post('iam/account/store', request).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => {
        this.submitted = false;
      }
    });
  }
}

// Main Component
@Component({
  selector: 'app-accounts-all',
  templateUrl: 'accounts.component.html'
})
export class AccountsComponent {
  loading = true;
  preferences: any = {};
  permission: any = {};
  accounts: any = [];
  data: any = [];
  userDetail: any = {};
  temp: any = 0;
  searchKey = '';
  username = '';
  userIdentityService = '';
  selectedIdentityService = '';
  usr: any = {};
  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Map()
  };

  searchableProperties = ['accountName', 'email', 'roles'];
  identityServiceName = '';
  identityServiceType = '';
  secondFactor = false;

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private router: Router, private authService: AuthService, private coreService: CoreService, private searchPipe: SearchPipe,
              private modal: NzModalService, private dataService: DataService, private orderPipe: OrderPipe) {
    this.subscription1 = this.dataService.searchKeyAnnounced$.subscribe(res => {
      this.searchKey = res;
      this.searchInResult();
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD') {
        this.addUser();
      } else if (res === 'COPY_ACCOUNT') {
        this.dataService.copiedObject.accounts = this.object.mapOfCheckedId;
        this.reset();
      } else if (res === 'DELETE') {
        this.deleteList();
      } else if (res === 'DISABLE' || res === 'ENABLE') {
        this.disableList(res === 'ENABLE');
      } else if (res === 'RESET_PASSWORD') {
        this.resetPassword(null);
      } else if (res === 'FORCE_PASSWORD_CHANGE') {
        this.forcePasswordChange(null);
      } else if (res === 'PASTE_ACCOUNT') {
        this.paste();
      } else if (res === 'EXPORT_USER') {
        this.exportAccount();
      } else if (res === 'IMPORT_USER') {
        this.importAccount();
      }
    });
  }

  ngOnInit(): void {
    this.data = [];
    this.usr = {currentPage: 1, sortBy: 'accountName', reverse: false};
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.username = this.authService.currentUserData;
    this.selectedIdentityService = sessionStorage['identityServiceType'] + ':' + sessionStorage['identityServiceName'];
    this.userIdentityService = this.authService.currentUserIdentityService;
    this.identityServiceName = sessionStorage['identityServiceName'];
    this.identityServiceType = sessionStorage['identityServiceType'];
    this.secondFactor = sessionStorage['secondFactor'];
    this.getList();
  }

  private getList(): void {
    this.coreService.post('iam/accounts', {identityServiceName: this.identityServiceName}).subscribe((res: any) => {
      this.accounts = res.accountItems;
      this.loading = false;
      this.searchInResult();
    })
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.dataService.announceFunction('IS_ACCOUNT_PROFILES_FALSE');
  }

  /* ---------------------------- Action ----------------------------------*/

  showPermission(account: any): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowPermissionComponent,
      nzClassName: 'lg',
      nzData: {
        identityServiceName: this.identityServiceName,
        account
      },
      nzAutofocus: null,
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }


  addUser(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AccountModalComponent,
      nzAutofocus: null,
      nzData: {
        userDetail: this.userDetail,
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        accountList: this.accounts,
        newUser: true,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getList();
      }
    });
  }

  editUser(account: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AccountModalComponent,
      nzAutofocus: null,
      nzData: {
        userDetail: this.userDetail,
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        accountList: this.accounts,
        oldUser: account,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getList();
      }
    });
  }

  copyUser(account: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AccountModalComponent,
      nzAutofocus: null,
      nzData: {
        userDetail: this.userDetail,
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        accountList: this.accounts,
        copy: true,
        oldUser: account,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getList();
      }
    });
  }

  disabledUser(account: any, isEnable: boolean) {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Account',
        operation: isEnable ? 'Enable' : 'Disable',
        name: account ? account.accountName : ''
      };
      this.object.mapOfCheckedId.forEach((value, key) => {
        comments.name = comments.name + key + ', ';
      });
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
          const auditLog: any = {};
          this.coreService.getAuditLogObj(result, auditLog);
          if (result.isChecked) {
            this.dataService.comments = result;
          }
          this.storeUser(account, auditLog, isEnable);
        }
      });
    } else {
      this.storeUser(account, this.dataService.comments, isEnable);
    }
  }

  private storeUser(account: any, auditLog: any, isEnable: boolean): void {
    let accounts: any = [];
    if (!account && this.object.mapOfCheckedId.size > 0) {
      this.accounts.forEach((item: any) => {
        if (this.object.mapOfCheckedId.has(item.accountName)) {
          accounts.push(item.accountName);
          return;
        }
      });
    }
    this.coreService.post(isEnable ? 'iam/accounts/enable' : 'iam/accounts/disable', {
      identityServiceName: this.identityServiceName,
      accountNames: account ? [account.accountName] : accounts,
      auditLog
    }).subscribe({
      next: () => {
        if (!account) {
          this.reset();
        }
        this.getList();
      }, error: () => {
        this.getList();
      }
    });
  }

  private disableList(flag: boolean): void {
    this.disabledUser(null, flag);
  }

  deleteUser(account: any): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Account',
        operation: 'Delete',
        name: account
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
          this.deleteAccount(account, result);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'delete',
          message: 'deleteUser',
          type: 'Delete',
          objectName: account,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteAccount(account);
        }
      });
    }
  }

  private deleteList(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Account',
        operation: 'Delete',
        name: ''
      };
      this.object.mapOfCheckedId.forEach((value, key) => {
        comments.name = comments.name + key + ', ';
      });
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
          this.deleteAccount(null, result);
        }
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmationModalComponent,
        nzData: {
          delete: true,
          identityServiceName: this.identityServiceName
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.deleteAccount(null, this.dataService.comments);
        }
      });
    }
  }

  private deleteAccount(account: any, comments: any = {}) {
    const obj: any = {
      accountNames: [],
      identityServiceName: this.identityServiceName,
      auditLog: {}
    };
    if (account) {
      obj.accountNames.push(account);
    } else {
      this.object.mapOfCheckedId.forEach((value, key) => {
        obj.accountNames.push(key);
      });
    }
    this.coreService.getAuditLogObj(comments, obj.auditLog);
    if (comments.isChecked) {
      this.dataService.comments = comments;
    }
    this.coreService.post('iam/accounts/delete', obj).subscribe(() => {
      this.reset();
      this.getList();
    });
  }

  resetPassword(account: any): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzData: {
        identityServiceName: this.identityServiceName,
        reset: true,
        account,
        accounts: this.object.mapOfCheckedId
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        this.getList();
        this.reset();
      }
    });
  }

  forcePasswordChange(account: any): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzData: {
        identityServiceName: this.identityServiceName,
        forceChange: true,
        account,
        accounts: this.object.mapOfCheckedId
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        this.getList();
        this.reset();
      }
    });
  }

  addToBlocklist(obj: any) {
    this.modal.create({
      nzTitle: undefined,
      nzAutofocus: null,
      nzContent: AddBlocklistModalComponent,
      nzData: {
        existingComments: this.dataService.comments,
        obj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.getList();
      }
    });
  }

  removeBlockAcc(acc?: any): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Blocklist',
        operation: 'Delete',
        name: acc ? acc.accountName : ''
      };
      this.object.mapOfCheckedId.forEach((value, key) => {
        comments.name = comments.name + key + ', ';
      });
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
          this.removeFromBlocklist(acc, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          });
        }
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmationModalComponent,
        nzData: {
          delete: true,
          account: acc,
          blocklist: true
        },
        nzFooter: null,
        nzAutofocus: undefined,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.removeFromBlocklist(acc);
        }
      });
    }
  }

  removeFromBlocklist(account: any, object?: any): void {
    const obj: any = {accountNames: [], auditLog: object};
    if (account) {
      obj.accountNames.push(account.accountName);
    } else {
      this.object.mapOfCheckedId.forEach((value, key) => {
        obj.accountNames.push(key);
      });
    }
    this.coreService.post('iam/blockedAccounts/delete', obj).subscribe({
      next: () => {
        this.getList();
      }
    });
  }

  private paste(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Accounts',
        operation: 'Paste',
        name: ''
      };
      this.dataService.copiedObject.accounts.forEach((value: any, key: string) => {
        comments.name = comments.name + key + ', ';
      });
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
          this.pasteUser(result);
        }
      });
    } else {
      this.pasteUser(this.dataService.comments);
    }
  }

  private pasteUser(comments: any): void {
    const arr: any = [];
    this.dataService.copiedObject.accounts.forEach((value: any, key: string) => {
      let flag = false;
      for (const i in this.userDetail.accounts) {
        if (this.userDetail.accounts[i]) {
          if (this.userDetail.accounts[i].accountName === key) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        value.forcePasswordChange = true;
        value.identityServiceName = this.identityServiceName;
        arr.push(value);
      }
    });
    this.pasteUsers(arr, comments);
  }

  private pasteUsers(accounts: any, comments: any): void {
    accounts.forEach((account: any, index: number) => {
      account.auditLog = comments;
      this.coreService.post('iam/account/store', account).subscribe({
        next: () => {
          if (index === accounts.length - 1) {
            this.getList();
          }
        }
      });
    })
  }

  private exportAccount(): void {
    const json: any = {
      accounts: []
    };
    this.object.mapOfCheckedId.forEach((value: any) => {
      delete value.identityServiceName;
      json.accounts.push(value);
    });

    const name = this.identityServiceName + '_accounts.json';
    const fileType = 'application/octet-stream';
    const data = JSON.stringify(json, undefined, 2);
    const blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
    this.reset();
  }

  private importAccount(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        type: 'USER',
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        display: this.preferences.auditLog,
        userDetail: this.userDetail
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getList();
      }
    });
  }

  private reset(): void {
    this.object = {
      mapOfCheckedId: new Map(),
      checked: false,
      indeterminate: false
    };
    this.dataService.announceFunction('IS_ACCOUNT_PROFILES_FALSE');
  }

  pageIndexChange($event: number): void {
    this.usr.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      } else {
        this.reset();
      }
    }
  }

  pageSizeChange($event: number): void {
    this.usr.entryPerPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      }
    }
  }

  searchInResult(): void {
    this.data = this.searchKey ? this.searchPipe.transform(this.accounts, this.searchKey, this.searchableProperties) : this.accounts;
    this.data = this.orderPipe.transform(this.data, this.usr.sortBy, this.usr.reverse);
    this.data = [...this.data];
  }

  sort(key: string): void {
    this.usr.reverse = !this.usr.reverse;
    this.usr.sortBy = key;
    this.data = this.orderPipe.transform(this.data, this.usr.sortBy, this.usr.reverse);
    this.reset();
  }

  private getCurrentData(list: any[], filter: any): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  onItemChecked(account: any, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.usr.entryPerPage || this.preferences.entryPerPage)) {
      const users = this.getCurrentData(this.data, this.usr);
      if (users.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        users.forEach(item => {
          this.object.mapOfCheckedId.set(item.accountName, item);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.set(account.accountName, account);
    } else {
      this.object.mapOfCheckedId.delete(account.accountName);
    }
    const users = this.getCurrentData(this.data, this.usr);
    this.object.checked = this.object.mapOfCheckedId.size === users.length;
    this.checkCheckBoxState();
  }

  checkAll(value: boolean): void {
    if (value && this.accounts.length > 0) {
      const users = this.getCurrentData(this.data, this.usr);
      users.forEach(item => {
        this.object.mapOfCheckedId.set(item.accountName, item);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.checkCheckBoxState();
  }

  checkCheckBoxState(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    if (this.object.mapOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_ACCOUNT_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_ACCOUNT_PROFILES_FALSE');
    }
  }

  /* ----------------------FIDO--------------------- */
  addDevice(account: any): void {
    if (this.coreService.checkConnection()) {
      this.coreService.post('iam/identity_fido_client', {
        identityServiceName: this.identityServiceName
      }).subscribe((res) => {
        this.createRequestObject(res, account);
      });
    }
  }

  private createRequestObject(fidoProperties: any, account: any): void {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    let publicKeyCredentialCreationOptions = this.authService.createPublicKeyCredentialRequest(challenge,
      fidoProperties, account);

    navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    }).then((credential: any) => {
      const {jwk, publicKey} = this.authService.getPublicKey(credential.response.attestationObject);
      this.coreService.post('iam/fido/add_device', {
        identityServiceName: this.identityServiceName,
        accountName: account.accountName,
        publicKey: publicKey,
        origin: location.origin,
        jwk: jwk,
        credentialId: this.authService.bufferToBase64Url(credential.rawId)
      }).subscribe();
    });
  }

  removeDevice(account: any): void {
    // Remove Authenticator Device
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Account',
        operation: 'Delete',
        name: ''
      };
      this.object.mapOfCheckedId.forEach((value, key) => {
        comments.name = comments.name + key + ', ';
      });
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
          this.deleteDevices(null, result);
        }
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmationModalComponent,
        nzData: {
          deleteDevices: true,
          account: account
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.deleteDevices(null, this.dataService.comments);
        }
      });
    }
  }

  private deleteDevices(account: any, comments: any = {}) {
    const obj: any = {
      accountName: account.accountName,
      identityServiceName: this.identityServiceName,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(comments, obj.auditLog);
    if (comments.isChecked) {
      this.dataService.comments = comments;
    }
    this.coreService.post('iam/fido/remove_devices', obj).subscribe(() => {

    });
  }
}
