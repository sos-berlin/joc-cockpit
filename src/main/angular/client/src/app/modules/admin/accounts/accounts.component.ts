import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {isEqual, clone} from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {SearchPipe, OrderPipe} from '../../../pipes/core.pipe';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-dialog.html'
})
export class ConfirmationModalComponent {
  @Input() delete;
  @Input() reset;
  @Input() forceChange;
  @Input() accounts;
  @Input() account;
  submitted = false;

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  confirm(): void {
    if (this.delete) {
      this.activeModal.close('DONE');
      return;
    }
    const accounts = [];
    if (this.account) {
      accounts.push({account: this.account.account})
    } else {
      this.accounts.forEach((value, key) => {
        accounts.push({account: key})
      });
    }
    this.submitted = true;
    const URL = this.forceChange ? 'authentication/auth/forcepasswordchange' : 'authentication/auth/resetpassword';
    this.coreService.post(URL, {
      identityServiceName: sessionStorage.identityServiceName,
      accounts
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

  submitted = false;
  isUnique = true;
  currentUser: any = {};
  isPasswordVisible = true;

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    const type = sessionStorage.identityServiceType || '';

    if (this.oldUser) {
      this.currentUser = clone(this.oldUser);
      this.currentUser.fakePassword = '00000000';
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

  onSubmit(obj): void {
    this.submitted = true;
    this.isUnique = true;

    if (obj.fakePassword !== '00000000') {
      obj.password = obj.fakePassword || '';
    }

    if (this.newUser || this.copy) {
      const data = {
        account: obj.account,
        password: obj.password,
        roles: obj.roles
      };
      this.userDetail.accounts.push(data);
    } else {
      for (let i = 0; i < this.userDetail.accounts.length; i++) {
        if (this.userDetail.accounts[i] === this.oldUser || isEqual(this.userDetail.accounts[i], this.oldUser)) {
          this.userDetail.accounts[i].account = obj.account;
          this.userDetail.accounts[i].password = obj.password;
          this.userDetail.accounts[i].roles = obj.roles;
          break;
        }
      }
    }

    this.coreService.post('authentication/auth/store', this.userDetail).subscribe({
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
  accounts: any = [];
  data: any = [];
  roles: any = [];
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
    this.usr = {currentPage: 1, sortBy: 'account', reverse: false};
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.username = this.authService.currentUserData;
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
  }

  saveInfo(): void {
    const obj = {
      accounts: this.accounts,
      roles: this.userDetail.roles,
      identityServiceName: this.userDetail.identityServiceName,
      main: this.userDetail.main
    };

    this.coreService.post('authentication/auth/store', obj).subscribe(() => {
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
    this.router.navigate(['/users/identity_service/role'], {queryParams: {account}});
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

  deleteUser(account): void {
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
        this.accounts = this.accounts.filter((item) => {
          return item.account !== account;
        });
        this.saveInfo();
      }
    });
  }

  private deleteList(): void {
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
        this.accounts = this.accounts.filter((item) => {
          return !this.object.mapOfCheckedId.has(item.account);
        });
        this.saveInfo();
      }
    });
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
        this.userDetail.accounts.push(value);
      }
    });
    this.saveInfo();
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
