import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isEqual, clone } from 'underscore';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CoreService } from '../../../services/core.service';
import { AuthService } from '../../../components/guard';
import { DataService } from '../data.service';
import { ConfirmModalComponent } from '../../../components/comfirm-modal/confirm.component';
import { CommentModalComponent } from '../../../components/comment-modal/comment.component';
import { SearchPipe, OrderPipe } from '../../../pipes/core.pipe';

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
    const accounts = [];
    if (this.account) {
      accounts.push({ account: this.account.account })
    } else {
      this.accounts.forEach((value, key) => {
        accounts.push({ account: key })
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
    const URL = this.forceChange ? 'authentication/auth/forcepasswordchange' : 'authentication/auth/resetpassword';
    this.coreService.post(URL, {
      identityServiceName: sessionStorage.identityServiceName,
      accounts,
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
  @Input() oldUser: any;
  @Input() allRoles: any;
  @Input() selectedIdentityServiceType: string;

  submitted = false;
  isUnique = true;
  currentUser: any = {};
  isPasswordVisible = true;
  isPasswordMatch = true;
  minimumPasswordLength = true;
  settings: any = {};
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
    }
    if (this.dataService.comments && this.dataService.comments.comment) {
      this.comments = this.dataService.comments;
      this.display = false;
    }
    const type = sessionStorage.identityServiceType || '';
    this.getConfiguration();
    if (this.oldUser) {
      this.currentUser = clone(this.oldUser);
      this.currentUser.fakePassword = '********';
      this.currentUser.userName = this.currentUser.account;
      if (this.copy) {
        this.currentUser.account = '';
      }
    } else {
      this.currentUser = {
        account: '',
        fakePassword: '',
        roles: []
      };
    }
    if (this.copy || (type !== 'JOC' && type !== 'SHIRO' && type !== 'VAULT-JOC-ACTIVE')) {
      this.isPasswordVisible = false;
      delete this.currentUser.password;
    }
    if (this.copy && this.oldUser.hashedPassword) {
      this.currentUser.password = this.oldUser.hashedPassword;
    }
    if (this.newUser && (this.selectedIdentityServiceType === 'JOC' || this.selectedIdentityServiceType === 'VAULT-JOC-ACTIVE')) {
      this.currentUser.forcePasswordChange = true;
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
    for (let i = 0; i < this.userDetail.accounts.length; i++) {
      if (this.userDetail.accounts[i].account === newUser && newUser !== existingUser) {
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
    if (this.oldUser.account !== this.currentUser.account) {
      const obj: any = {
        identityServiceName: this.userDetail.identityServiceName,
        accountOldName: this.oldUser.account,
        accountNewName: this.currentUser.account,
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
      this.coreService.post('authentication/auth/account/rename', obj).subscribe({
        next: () => {
          cb('OK');
        }, error: () => {
          cb();
        }
      });
    } else {
      cb();
    }
  }

  private getUsersData(cb): void {
    this.coreService.post('authentication/auth', {
      identityServiceName: this.userDetail.identityServiceName
    }).subscribe({
      next: res => {
        this.userDetail.accounts = res.accounts;
        this.userDetail.main = res.main;
        this.userDetail.roles = res.roles;
        cb();
      }
    });
  }

  onSubmit(obj): void {
    this.submitted = true;
    this.getUsersData(() => {
      this.isUnique = true;
      if (obj.fakePassword !== '********') {
        obj.password = obj.fakePassword || '';
      }

      if (this.newUser || this.copy) {
        const data = {
          account: obj.account,
          password: obj.password,
          disabled: obj.disabled,
          forcePasswordChange: obj.forcePasswordChange,
          roles: obj.roles
        };
        this.userDetail.accounts.push(data);
        this.store(obj);
      } else {
        this.rename(() => {
          for (let i = 0; i < this.userDetail.accounts.length; i++) {
            if (this.userDetail.accounts[i] === this.oldUser || isEqual(this.userDetail.accounts[i], this.oldUser)) {
              this.userDetail.accounts[i].account = obj.account;
              this.userDetail.accounts[i].password = obj.password;
              this.userDetail.accounts[i].roles = obj.roles;
              this.userDetail.accounts[i].forcePasswordChange = obj.forcePasswordChange;
              this.userDetail.accounts[i].disabled = obj.disabled;
              break;
            }
          }
          this.store(obj);
        });
      }
    });
  }

  private store(obj) {
    const request: any = {
      identityServiceName: this.userDetail.identityServiceName,
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
    if (this.selectedIdentityServiceType === 'SHIRO') {
      request.accounts = this.userDetail.accounts;
      request.roles = this.userDetail.roles;
      request.main = this.userDetail.main;
    } else {
      request.accounts = [{
        account: obj.account,
        password: obj.password,
        disabled: obj.disabled,
        forcePasswordChange: obj.forcePasswordChange,
        roles: obj.roles
      }];
    }
    this.coreService.post('authentication/auth/store', request).subscribe({
      next: () => {
        this.activeModal.close(this.userDetail.accounts);
      }, error: () => {
        this.userDetail.accounts = this.userDetail.accounts.filter((account) => {
          return account.account !== obj.account;
        });
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
export class AccountsComponent implements OnInit, OnDestroy {

  loading = true;
  preferences: any = {};
  permission: any = {};
  accounts: any = [];
  data: any = [];
  roles: any = [];
  userDetail: any = {};
  temp: any = 0;
  searchKey: string;
  username: string;
  userIdentityService: string;
  selectedIdentityService: string;
  selectedIdentityServiceType: string;
  usr: any = {};
  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Map()
  };

  searchableProperties = ['account', 'roles'];

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
      } else if (res === 'DISABLE') {
        this.disableList();
      } else if (res === 'RESET_PASSWORD') {
        this.resetPassword(null);
      } else if (res === 'FORCE_PASSWORD_CHANGE') {
        this.forcePasswordChange(null);
      } else if (res === 'PASTE_ACCOUNT') {
        this.paste();
      }
    });
  }

  ngOnInit(): void {
    this.data = [];
    this.usr = { currentPage: 1, sortBy: 'account', reverse: false };
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.username = this.authService.currentUserData;
    this.selectedIdentityServiceType = sessionStorage.identityServiceType;
    this.selectedIdentityService = sessionStorage.identityServiceType + ':' + sessionStorage.identityServiceName;
    this.userIdentityService = this.authService.currentUserIdentityService;
  }

  setUserData(res): void {
    this.userDetail = res;
    this.data = [];
    this.accounts = res.accounts;
    setTimeout(() => {
      this.loading = false;
      this.searchInResult();
    }, 300);
    this.getRoles();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.dataService.announceFunction('IS_ACCOUNT_PROFILES_FALSE');
  }

  saveInfo(accounts, comments): void {
    const obj: any = {
      accounts: accounts,
      auditLog: {},
      identityServiceName: this.userDetail.identityServiceName,
    };
    if (this.selectedIdentityServiceType === 'SHIRO') {
      obj.accounts = this.accounts;
      obj.roles = this.userDetail.roles;
      obj.main = this.userDetail.main;
    }

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

    this.coreService.post('authentication/auth/store', obj).subscribe((res) => {
      this.reset();
      if (accounts) {
        this.accounts = this.accounts.concat(accounts)
      }
      this.userDetail.accounts = this.accounts;
      this.dataService.announceFunction('RELOAD');
      this.searchInResult();
    });
  }

  private getRoles(): void {
    this.roles = [];
    if (this.userDetail.roles) {
      for (const prop in this.userDetail.roles) {
        this.roles.push(prop);
      }
    }
  }

  showRole(account): void {
    this.router.navigate(['/users/identity_service/role'], { queryParams: { account } });
  }

  /* ---------------------------- Action ----------------------------------*/

  addUser(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AccountModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        userDetail: this.userDetail,
        allRoles: this.roles,
        selectedIdentityServiceType: this.selectedIdentityServiceType,
        newUser: true,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.accounts = result;
        this.searchInResult();
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
        allRoles: this.roles,
        selectedIdentityServiceType: this.selectedIdentityServiceType,
        oldUser: account,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.accounts = result;
        this.searchInResult();
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
        selectedIdentityServiceType: this.selectedIdentityServiceType,
        copy: true,
        oldUser: account,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.accounts = result;
        this.searchInResult();
      }
    });
  }

  disabledUser(account) {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Identity Service',
        operation: account ? (!account.disabled ? 'Disable' : 'Enable') : 'Disable',
        name: account ? account.account : ''
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
          this.storeUser(account, auditLog);
        } else if (account) {
          account.disabled = !account.disabled;
        }
      });
    } else {
      this.storeUser(account, this.dataService.comments);
    }
  }

  private storeUser(account, auditLog): void {
    let accounts = [];
    if (account) {
      account.disabled = !account.disabled;
    } else {
      accounts = this.accounts.filter((item) => {
        if (this.object.mapOfCheckedId.has(item.account)) {
          item.disabled = true;
          return true;
        } else {
          return false;
        }
      });
    }
    this.coreService.post('authentication/auth/store', {
      identityServiceName: this.userDetail.identityServiceName,
      accounts: account ? [account] : accounts,
      auditLog
    }).subscribe({
      next: () => {
        if (!account) {
          this.reset();
        }
        this.userDetail.accounts = this.accounts;
        this.dataService.announceFunction('RELOAD');
        this.searchInResult();
      }, error: () => {
        if (account) {
          account.disabled = !account.disabled;
        }
      }
    });
  }

  private disableList(): void {
    this.disabledUser(null);
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
          delete: true
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
    this.accounts = this.accounts.filter((item) => {
      if (account) {
        return item.account !== account;
      } else {
        return !this.object.mapOfCheckedId.has(item.account);
      }
    });
    if (this.selectedIdentityServiceType === 'SHIRO') {
      this.saveInfo([], comments);
    } else {
      const obj: any = {
        accounts: [],
        identityServiceName: this.userDetail.identityServiceName,
        auditLog: {}
      };
      if (account) {
        obj.accounts.push({ account });
      } else {
        this.object.mapOfCheckedId.forEach((value, key) => {
          obj.accounts.push({ account: key });
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
      this.coreService.post('authentication/auth/accounts/delete', obj).subscribe(() => {
        this.reset();
        this.userDetail.accounts = this.accounts;
        this.dataService.announceFunction('RELOAD');
        this.searchInResult();
      });
    }
  }

  resetPassword(account): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzComponentParams: {
        reset: true,
        account,
        accounts: this.object.mapOfCheckedId
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        if (account) {
          account.forcePasswordChange = true;
        } else {
          this.accounts.forEach((item) => {
            if (this.object.mapOfCheckedId.has(item.account)) {
              item.forcePasswordChange = true;
            }
          });
        }
        this.reset();
      }
    });
  }

  forcePasswordChange(account): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzComponentParams: {
        forceChange: true,
        account,
        accounts: this.object.mapOfCheckedId
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        if (account) {
          account.forcePasswordChange = true;
        } else {
          this.accounts.forEach((item) => {
            if (this.object.mapOfCheckedId.has(item.account)) {
              item.forcePasswordChange = true;
            }
          });
        }
        this.reset();
      }
    });
  }

  private paste(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      console.log(this.dataService.copiedObject.accounts)
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
          if (this.userDetail.accounts[i].account === key) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
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
        if (this.selectedIdentityServiceType === 'SHIRO') {
          this.userDetail.accounts.push(value);
        } else {
          arr.push(value);
        }
      }
    });
    this.saveInfo(arr, comments);
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
          this.object.mapOfCheckedId.set(item.account, item);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.set(account.account, account);
    } else {
      this.object.mapOfCheckedId.delete(account.account);
    }
    const users = this.getCurrentData(this.data, this.usr);
    this.object.checked = this.object.mapOfCheckedId.size === users.length;
    this.checkCheckBoxState();
  }

  checkAll(value: boolean): void {
    if (value && this.accounts.length > 0) {
      const users = this.getCurrentData(this.data, this.usr);
      users.forEach(item => {
        this.object.mapOfCheckedId.set(item.account, item);
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
