import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {isEqual, clone} from 'underscore';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';

@Component({
  selector: 'app-user-modal-content',
  templateUrl: './user-dialog.html'
})
export class AccountModalComponent implements OnInit {
  submitted = false;
  isUnique = true;
  currentUser: any = {};
  isPasswordVisible = true;

  @Input() newUser = false;
  @Input() copy = false;
  @Input() userDetail: any;
  @Input() oldUser: any;
  @Input() allRoles: any;

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
    if (this.copy || (type !== 'JOC' && type !== 'SHIRO' && !this.newUser) || type === 'VAULT-JOC') {
      this.isPasswordVisible = false;
      delete this.currentUser.password;
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

    this.coreService.post('authentication/auth/store', this.userDetail).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.accounts);
    }, err => {
      this.submitted = false;
      this.userDetail.accounts = this.userDetail.accounts.filter((account) => {
        return account.account !== obj.account;
      });
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
  roles: any = [];
  order = 'account';
  reverse = false;
  usr: any = {};
  userDetail: any = {};
  temp: any = 0;
  searchKey: string;
  username: string;
  userIdentityService: string;
  selectedIdentityService: string;
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private router: Router, private authService: AuthService, private coreService: CoreService,
              private modal: NzModalService, private dataService: DataService) {
    this.subscription1 = this.dataService.searchKeyAnnounced$.subscribe(res => {
      this.searchKey = res;
    });
    this.subscription2 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res && res.accounts) {
        this.setUserData(res);
      }
    });
    this.subscription3 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD') {
        this.addUser();
      }
    });
  }

  ngOnInit(): void {
    this.usr = {currentPage: 1};
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.username = this.authService.currentUserData;
    this.selectedIdentityService = sessionStorage.identityServiceType + ':' + sessionStorage.identityServiceName;
    this.userIdentityService = this.authService.currentUserIdentityService;
  }

  setUserData(res): void {
    this.userDetail = res;
    this.accounts = res.accounts;
    setTimeout(() => {
      this.loading = false;
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

    this.coreService.post('authentication/auth/store', obj).subscribe(res => {
      this.accounts = [...this.accounts];
      this.userDetail = res;
      this.dataService.announceFunction('RELOAD');
    });
  }

  getRoles(): void {
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
        this.accounts = [...this.accounts];
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
        this.accounts = [...this.accounts];
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
        this.accounts = [...this.accounts];
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

  sort(key): void {
    this.usr.reverse = !this.usr.reverse;
    this.usr.sortBy = key;
  }
}
