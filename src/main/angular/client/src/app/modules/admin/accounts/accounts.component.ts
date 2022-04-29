import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {isEqual, clone} from 'underscore';
import {saveAs} from 'file-saver';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {SearchPipe, OrderPipe} from '../../../pipes/core.pipe';
import {ShowPermissionComponent} from "../show-permission/show-permission.component";
import {UploadModalComponent} from "../upload/upload.component";

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-dialog.html'
})
export class ConfirmationModalComponent implements OnInit {
  @Input() delete;
  @Input() reset;
  @Input() forceChange;
  @Input() accounts;
  @Input() account;
  @Input() isRole;
  @Input() identityServiceName: string;
  submitted = false;
  display: any;
  required = false;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit(): void {
    let preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
  }

  confirm(): void {
    if (this.delete) {
      this.activeModal.close('DONE');
      return;
    }
    const accountNames = [];
    if (this.account) {
      accountNames.push(this.account.accountName)
    } else {
      this.accounts.forEach((value, key) => {
        accountNames.push(key)
      });
    }
    const auditLog: any = {};
    if (this.comments.comment) {
      auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      auditLog.ticketLink = this.comments.ticketLink;
    }
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.submitted = true;
    const URL = this.forceChange ? 'iam/accounts/forcepasswordchange' : 'iam/accounts/resetpassword';
    this.coreService.post(URL, {
      identityServiceName: this.identityServiceName,
      accountNames,
      auditLog
    }).subscribe({
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
export class AccountModalComponent implements OnInit {
  @Input() newUser = false;
  @Input() copy = false;
  @Input() userDetail: any;
  @Input() accountList: any = [];
  @Input() oldUser: any;
  @Input() identityServiceType: string;
  @Input() identityServiceName: string;

  submitted = false;
  isUnique = true;
  currentUser: any = {};
  isPasswordVisible = true;
  isPasswordMatch = true;
  minimumPasswordLength = true;
  settings: any = {};
  allRoles = [];
  display: any;
  required = false;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    } else {
      let preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
      this.display = preferences.auditLog;
    }
    this.getRoles();
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
    const type = sessionStorage.identityServiceType || '';
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
    if (this.copy || (type !== 'JOC' && type !== 'SHIRO' && type !== 'VAULT-JOC-ACTIVE')) {
      this.isPasswordVisible = false;
      delete this.currentUser.password;
    }
    if (this.newUser && (this.identityServiceType === 'JOC' || this.identityServiceType === 'VAULT-JOC-ACTIVE')) {
      this.currentUser.forcePasswordChange = true;
    }
  }

  private getRoles(): void {
    if (this.identityServiceType !== 'SHIRO') {
      this.coreService.post('iam/roles', {identityServiceName: this.identityServiceName}).subscribe((res: any) => {
        for (const i in res.roles) {
          this.allRoles.push(res.roles[i].roleName);
        }
      })
    } else {
      if (this.userDetail.roles) {
        for (const prop in this.userDetail.roles) {
          this.allRoles.push(prop);
        }
      }
    }
  }

  private getConfiguration(): void {
    const obj: any = {
      id: 0,
      objectType: 'GENERAL',
      configurationType: 'IAM',
      auditLog: {}
    };
    if (this.comments.comment) {
      obj.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      obj.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      obj.auditLog.ticketLink = this.comments.ticketLink;
    }
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    this.coreService.post('configuration', obj).subscribe((res) => {
      if (res.configuration.configurationItem) {
        this.settings = JSON.parse(res.configuration.configurationItem);
      }
    });
  }

  checkUser(newUser, existingUser): void {
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

  private rename(cb): void {
    if (this.oldUser.accountName !== this.currentUser.accountName) {
      const obj: any = {
        identityServiceName: this.identityServiceName,
        accountOldName: this.oldUser.accountName,
        accountNewName: this.currentUser.accountName,
        auditLog: {}
      };
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
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

  onSubmit(obj): void {
    this.submitted = true;
    this.isUnique = true;
    if (obj.fakePassword !== '********') {
      obj.password = obj.fakePassword || '';
    }

    if (this.newUser || this.copy) {
      if (this.identityServiceType === 'SHIRO') {
        const data = {
          accountName: obj.accountName,
          password: obj.password,
          roles: obj.roles
        };
        this.userDetail.accounts.push(data);
      }
      this.store(obj);
    } else {
      if (this.identityServiceType === 'SHIRO') {
        for (let i = 0; i < this.userDetail.accounts.length; i++) {
          if (this.userDetail.accounts[i] === this.oldUser || isEqual(this.userDetail.accounts[i], this.oldUser)) {
            this.userDetail.accounts[i].accountName = obj.accountName;
            this.userDetail.accounts[i].password = obj.password;
            this.userDetail.accounts[i].roles = obj.roles;
            this.userDetail.accounts[i].forcePasswordChange = obj.forcePasswordChange;
            this.userDetail.accounts[i].disabled = obj.disabled;
            break;
          }
        }
        this.store(obj);
      } else {
        this.rename((result) => {
          if (result) {
            this.store(obj);
          }
        });
      }
    }
  }

  private store(obj) {
    const request: any = {
      identityServiceName: this.identityServiceName,
      auditLog: {}
    };
    if (this.comments.comment) {
      request.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      request.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      request.auditLog.ticketLink = this.comments.ticketLink;
    }
    if (this.comments.isChecked) {
      this.dataService.comments = this.comments;
    }
    if (this.identityServiceType === 'SHIRO') {
      request.accounts = this.userDetail.accounts;
      request.roles = this.userDetail.roles;
      request.main = this.userDetail.main;
      this.coreService.post('authentication/auth/store', request).subscribe({
        next: () => {
          this.activeModal.close(this.userDetail.accounts);
        }, error: () => {
          this.userDetail.accounts = this.userDetail.accounts.filter((account) => {
            return account.accountName !== obj.accountName;
          });
          this.submitted = false;
        }
      });
    } else {
      request.accountName = obj.accountName;
      request.password = obj.password;
      request.disabled = obj.disabled;
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
}

// Main Component
@Component({
  selector: 'app-accounts-all',
  templateUrl: 'accounts.component.html'
})
export class AccountsComponent implements OnInit, OnDestroy {
  loading = true;
  preferences: any = {};
  permission: any = {};
  accounts: any = [];
  data: any = [];
  userDetail: any = {};
  temp: any = 0;
  searchKey: string;
  username: string;
  userIdentityService: string;
  selectedIdentityService: string;
  usr: any = {};
  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Map()
  };

  searchableProperties = ['accountName', 'roles'];
  identityServiceName: string;
  identityServiceType: string;
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private router: Router, private authService: AuthService, private coreService: CoreService, private searchPipe: SearchPipe,
              private modal: NzModalService, private dataService: DataService, private orderPipe: OrderPipe) {
    this.subscription1 = this.dataService.searchKeyAnnounced$.subscribe(res => {
      this.searchKey = res;
      this.searchInResult();
    });
    this.subscription2 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res && res.accounts) {
        this.setUserData(res);
      }
    });
    this.subscription3 = this.dataService.functionAnnounced$.subscribe(res => {
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
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.username = this.authService.currentUserData;
    this.selectedIdentityService = sessionStorage.identityServiceType + ':' + sessionStorage.identityServiceName;
    this.userIdentityService = this.authService.currentUserIdentityService;
    this.identityServiceName = sessionStorage.identityServiceName;
    this.identityServiceType = sessionStorage.identityServiceType;
    if (this.identityServiceType !== 'SHIRO') {
      this.getList();
    }
  }

  private getList(): void {
    this.coreService.post('iam/accounts', {identityServiceName: this.identityServiceName}).subscribe((res: any) => {
      this.accounts = res.accountItems;
      this.loading = false;
      this.searchInResult();
    })
  }

  setUserData(res): void {
    this.userDetail = res;
    this.data = [];
    this.accounts = res.accounts;
    setTimeout(() => {
      this.loading = false;
      this.searchInResult();
    }, 300);
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.dataService.announceFunction('IS_ACCOUNT_PROFILES_FALSE');
  }

  saveInfo(accounts, comments): void {
    if (this.identityServiceType === 'SHIRO') {
      const obj: any = {
        accounts: this.accounts,
        roles: this.userDetail.roles,
        main: this.userDetail.main,
        auditLog: {},
        identityServiceName: this.userDetail.identityServiceName,
      };
      if (comments) {
        if (comments.comment) {
          obj.auditLog.comment = comments.comment;
        }
        if (comments.timeSpent) {
          obj.auditLog.timeSpent = comments.timeSpent;
        }
        if (comments.ticketLink) {
          obj.auditLog.ticketLink = comments.ticketLink;
        }
        if (comments.isChecked) {
          this.dataService.comments = comments;
        }
      }
      this.coreService.post('authentication/auth/store', obj).subscribe(() => {
        this.reset();
        if (accounts) {
          this.accounts = this.accounts.concat(accounts)
        }
        this.userDetail.accounts = this.accounts;
        this.dataService.announceFunction('RELOAD');
        this.searchInResult();
      });
    }
  }

  showRole(account): void {
    this.router.navigate(['/users/identity_service/role'], {queryParams: {account}});
  }

  /* ---------------------------- Action ----------------------------------*/

  showPermission(account): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowPermissionComponent,
      nzClassName: 'lg',
      nzComponentParams: {
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
      nzComponentParams: {
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
        if (this.identityServiceType === 'SHIRO') {
          this.accounts = result;
          this.searchInResult();
        } else {
          this.getList();
        }
      }
    });
  }

  editUser(account): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AccountModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
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
        if (this.identityServiceType === 'SHIRO') {
          this.accounts = result;
          this.searchInResult();
        } else {
          this.getList();
        }
      }
    });
  }

  copyUser(account): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AccountModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
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
        if (this.identityServiceType === 'SHIRO') {
          this.accounts = result;
          this.searchInResult();
        } else {
          this.getList();
        }
      }
    });
  }

  disabledUser(account, isEnable) {
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
        nzComponentParams: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          const auditLog: any = {};
          if (result.comment) {
            auditLog.comment = result.comment;
          }
          if (result.timeSpent) {
            auditLog.timeSpent = result.timeSpent;
          }
          if (result.ticketLink) {
            auditLog.ticketLink = result.ticketLink;
          }
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

  private storeUser(account, auditLog, isEnable): void {
    let accounts = [];
    if (!account && this.object.mapOfCheckedId.size > 0) {
      this.accounts.forEach((item) => {
        if (this.object.mapOfCheckedId.has(item.accountName)) {
          accounts.push(item.accountName);
          return true;
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

  private disableList(flag): void {
    this.disabledUser(null, flag);
  }

  deleteUser(account): void {
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
        nzComponentParams: {
          comments
        },
        nzFooter: null,
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
        nzComponentParams: {
          title: 'delete',
          message: 'deleteUser',
          type: 'Delete',
          objectName: account,
        },
        nzFooter: null,
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
        nzComponentParams: {
          comments
        },
        nzFooter: null,
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
        nzComponentParams: {
          delete: true,
          identityServiceName: this.identityServiceName
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.deleteAccount(null, this.dataService.comments);
        }
      });
    }
  }

  private deleteAccount(account, comments: any = {}) {
    if (this.identityServiceType === 'SHIRO') {
      this.accounts = this.accounts.filter((item) => {
        if (account) {
          return item.accountName !== account;
        } else {
          return !this.object.mapOfCheckedId.has(item.accountName);
        }
      });
      this.saveInfo([], comments);
    } else {
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
      if (comments.comment) {
        obj.auditLog.comment = comments.comment;
      }
      if (comments.timeSpent) {
        obj.auditLog.timeSpent = comments.timeSpent;
      }
      if (comments.ticketLink) {
        obj.auditLog.ticketLink = comments.ticketLink;
      }
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
      this.coreService.post('iam/accounts/delete', obj).subscribe(() => {
        this.reset();
        this.getList();
      });
    }
  }

  resetPassword(account): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzComponentParams: {
        identityServiceName: this.identityServiceName,
        reset: true,
        account,
        accounts: this.object.mapOfCheckedId
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        this.getList();
        this.reset();
      }
    });
  }

  forcePasswordChange(account): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzComponentParams: {
        identityServiceName: this.identityServiceName,
        forceChange: true,
        account,
        accounts: this.object.mapOfCheckedId
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        this.getList();
        this.reset();
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
      this.dataService.copiedObject.accounts.forEach((value, key) => {
        comments.name = comments.name + key + ', ';
      });
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
          this.pasteUser(result);
        }
      });
    } else {
      this.pasteUser(this.dataService.comments);
    }

  }

  private pasteUser(comments): void {
    const arr = [];
    this.dataService.copiedObject.accounts.forEach((value, key) => {
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
        if (this.identityServiceType === 'SHIRO') {
          const roles = [];
          for (const i in value.roles) {
            if (value.roles[i]) {
              if (this.userDetail.roles[value.roles[i]]) {
                roles.push(value.roles[i]);
              }
            }
          }
          value.roles = roles;
          value.identityServiceId = 0;
          delete value.password;
          this.userDetail.accounts.push(value);
        } else {
          value.forcePasswordChange = true;
          value.identityServiceName = this.identityServiceName;
          arr.push(value);
        }
      }
    });
    if (this.identityServiceType === 'SHIRO') {
      this.saveInfo(arr, comments);
    } else {
      this.pasteUsers(arr, comments);
    }
  }

  private pasteUsers(accounts, comments): void {
    accounts.forEach((account, index) => {
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
    const json = {
      accounts: []
    };
    this.object.mapOfCheckedId.forEach((value, key) => {
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
      nzContent: UploadModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        identityServiceType: this.identityServiceType,
        identityServiceName: this.identityServiceName,
        display: this.preferences.auditLog
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

  pageIndexChange($event): void {
    this.usr.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      } else {
        this.reset();
      }
    }
  }

  pageSizeChange($event): void {
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

  sort(key): void {
    this.usr.reverse = !this.usr.reverse;
    this.usr.sortBy = key;
    this.data = this.orderPipe.transform(this.data, this.usr.sortBy, this.usr.reverse);
    this.reset();
  }

  private getCurrentData(list, filter): Array<any> {
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
}
