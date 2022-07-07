import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterEvent, NavigationEnd} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {DataService} from './data.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  permission: any;
  isPaste = false;
  isButtonShow = false;
  isSelected = false;
  selectedUser: string;
  accounts: any = [];
  route: string;
  userObj: any = {};
  identityService: string;
  identityServiceType: string;
  pageView: string;
  isLoaded = false;
  showBlocklist = false;
  filter = {
    searchKey: ''
  };
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, private router: Router, public coreService: CoreService,
              private dataService: DataService, private message: NzMessageService) {
    this.subscription1 = router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd)).subscribe((e: any) => {
        this.checkUrl(e);
      });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'IS_RESET_PROFILES_TRUE') {
        this.isButtonShow = true;
      } else if (res === 'IS_RESET_PROFILES_FALSE') {
        this.isButtonShow = false;
      } else if (res === 'IS_ACCOUNT_PROFILES_TRUE' || res === 'IS_ROLE_PROFILES_TRUE') {
        this.isSelected = true;
      } else if (res === 'IS_ACCOUNT_PROFILES_FALSE' || res === 'IS_ROLE_PROFILES_FALSE') {
        this.isSelected = false;
      } else if (res === 'RELOAD') {
        this.getUsersData();
      }
    });
  }

  static getParameterByName(name, url = window.location.href): string {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }


  ngOnInit(): void {
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (!this.permission.joc) {
      setTimeout(() => {
        this.ngOnInit();
      }, 50);
      return;
    }
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).permission;
    }
    this.isLoaded = true;
    if (!this.route) {
      this.checkUrl(this.router);
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.dataService.comments = {};
  }

  selectUser(account): void {
    if (account) {
      this.selectedUser = account;
      this.router.navigate(['/users/identity_service/role'], {queryParams: {account}}).then();
    } else {
      this.selectedUser = null;
      this.router.navigate(['/users/identity_service/role']).then();
    }
  }

  manageSetting(): void {
    this.dataService.announceFunction('MANAGE_SETTING');
  }

  manageBlocklist(): void {
    this.showBlocklist = !this.showBlocklist;
    this.dataService.announceFunction('MANAGE_BLOCKLIST');
  }

  addAccount(): void {
    this.dataService.announceFunction('ADD');
  }

  deleteList(): void {
    this.dataService.announceFunction('DELETE');
  }

  disableList(flag = false): void {
    this.dataService.announceFunction(flag ? 'ENABLE' : 'DISABLE');
  }

  resetPassword(): void {
    this.dataService.announceFunction('RESET_PASSWORD');
  }

  forcePasswordChange(): void {
    this.dataService.announceFunction('FORCE_PASSWORD_CHANGE');
  }

  copyList(): void {
    if (this.route.match('/users/identity_service/account')) {
      this.dataService.announceFunction('COPY_ACCOUNT');
    } else {
      this.dataService.announceFunction('COPY_ROLE');
    }
    this.coreService.showCopyMessage(this.message);
    this.isPaste = true;
  }

  pasteList(): void {
    if (this.route.match('/users/identity_service/account')) {
      this.dataService.announceFunction('PASTE_ACCOUNT');
    } else {
      this.dataService.announceFunction('PASTE_ROLE');
    }
  }

  addController(): void {
    this.dataService.announceFunction('ADD_CONTROLLER');
  }

  addFolder(): void {
    this.dataService.announceFunction('ADD_FOLDER');
  }

  addPermission(): void {
    this.dataService.announceFunction('ADD_PERMISSION');
  }

  addRole(): void {
    this.dataService.announceFunction('ADD_ROLE');
  }

  searchBar(searchKey): void {
    this.dataService.announceSearchKey(searchKey);
  }

  resetProfiles(): void {
    this.dataService.announceFunction('RESET_PROFILES');
  }

  deleteProfiles(): void {
    this.dataService.announceFunction('DELETE_PROFILES');
  }

  exportObject(): void {
    if (this.route.match('/users/identity_service/account')) {
      this.dataService.announceFunction('EXPORT_USER');
    } else {
      this.dataService.announceFunction('EXPORT_ROLE');
    }
  }

  importObject(): void {
    if (this.route.match('/users/identity_service/account')) {
      this.dataService.announceFunction('IMPORT_USER');
    }  else {
      this.dataService.announceFunction('IMPORT_ROLE');
    }
  }

  receiveMessage($event): void {
    this.pageView = $event;
    this.dataService.announceFunction('CHANGE_VIEW');
  }

  private checkUrl(val): void {
    if (val.url) {
      this.route = val.url;
      this.isPaste = this.route && ((this.route.match('/users/identity_service/account') && this.dataService.copiedObject.accounts && this.dataService.copiedObject.accounts.size > 0) ||
        (this.route.match('/users/identity_service/role') && this.dataService.copiedObject.roles && this.dataService.copiedObject.roles.size > 0));
      if (this.route.match('/users')) {
        if (sessionStorage.identityServiceType) {
          if ((sessionStorage.identityServiceType === 'VAULT' || sessionStorage.identityServiceType === 'KEYCLOAK' || sessionStorage.identityServiceType === 'LDAP') && this.route.match('/users/identity_service/account')) {
            this.selectedUser = null;
            this.router.navigate(['/users/identity_service/role']).then();
          }
        }
        this.selectedUser = AdminComponent.getParameterByName('account');
        if (sessionStorage.identityServiceName && this.route.match('/users/identity_service/')) {
          this.userObj = {};
          this.identityService = sessionStorage.identityServiceName;
          this.identityServiceType = sessionStorage.identityServiceType;
          this.getUsersData();
        }
      }
    }
  }

  private getUsersData(): void {
   if (this.identityServiceType && this.identityService && this.route.match(/role/)) {
      this.coreService.post('iam/accounts', {identityServiceName: this.identityService}).subscribe((res: any) => {
        this.accounts = res.accountItems;
        this.dataService.announceData(this.accounts);
      })
    }
  }

}
