import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute, RouterEvent, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {DataService} from './data.service';
import {filter} from 'rxjs/operators';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {

  schedulerIds: any;
  permission: any;
  isButtonShow = false;
  isLdapRealmEnable = true;
  isJOCClusterEnable = true;
  selectedUser: string;
  route: any;
  userObj: any;
  users: any;
  pageView: string;
  searchKey: string;
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, private router: Router, private activeRoute: ActivatedRoute, public coreService: CoreService, private dataService: DataService) {
    this.subscription1 = router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd)).subscribe((e: any) => {
      this.checkUrl(e);
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'IS_RESET_PROFILES_TRUE') {
        this.isButtonShow = true;
      } else if (res === 'IS_RESET_PROFILES_FALSE') {
        this.isButtonShow = false;
      }
    });
  }

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if(localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).permission;
    }
    this.getUsersData();
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  selectUser(user) {
    if (user) {
      this.router.navigate(['/users/role'], {queryParams: {user: user}});
    } else {
      this.selectedUser = null;
      this.router.navigate(['/users/role']);
    }
  }

  addAccount() {
    this.dataService.announceFunction('ADD');
  }

  addMaster() {
    this.dataService.announceFunction('ADD_MASTER');
  }

  addFolder() {
    this.dataService.announceFunction('ADD_FOLDER');
  }

  addPermission() {
    this.dataService.announceFunction('ADD_PERMISSION');
  }

  addRole() {
    this.dataService.announceFunction('ADD_ROLE');
  }

  addMainSection() {
    this.dataService.announceFunction('ADD_MAIN_SECTION');
  }

  editMainSection() {
    this.dataService.announceFunction('EDIT_MAIN_SECTION');
  }

  addLdapRealm() {
    this.dataService.announceFunction('ADD_ALAD');
  }

  enableJOCCluster() {
    this.dataService.announceFunction('ENABLE_JOC');
  }

  searchBar(searchKey) {
    this.dataService.announceSearchKey(searchKey);
  }

  resetProfiles() {
    this.dataService.announceFunction('RESET_PROFILES');
  }

  receiveMessage($event) {
    this.pageView = $event;
    this.dataService.announceFunction('CHANGE_VIEW');
  }

  private checkUrl(val) {
    if (val.url) {
      this.route = val.url;
      if (this.route.match('/users')) {
        this.dataService.announceData(this.userObj);
        this.activeRoute.queryParams
          .subscribe(params => {
            this.selectedUser = params.user;
          });
      }
    }
  }

  private getUsersData() {
    this.coreService.post('authentication/shiro', {}).subscribe(res => {
      this.userObj = res;
      this.users = this.userObj.users;
      this.dataService.announceData(this.userObj);
      this.checkLdapConf();
    }, () => {

    });
  }

  private checkLdapConf() {
    if (this.userObj.main && this.userObj.main.length > 1) {
      for (let i = 0; i < this.userObj.main.length; i++) {
        if ((this.userObj.main[i].entryName === 'sessionDAO' && this.userObj.main[i].entryValue === 'com.sos.auth.shiro.SOSDistributedSessionDAO') ||
          (this.userObj.main[i].entryName === 'securityManager.sessionManager.sessionDAO' && this.userObj.main[i].entryValue === '$sessionDAO')) {
          this.isJOCClusterEnable = false;
        }
        if ((this.userObj.main[i].entryName === 'ldapRealm' && this.userObj.main[i].entryValue === 'com.sos.auth.shiro.SOSLdapAuthorizingRealm') ||
          (this.userObj.main[i].entryName === 'securityManager.sessionManager.sessionDAO' && this.userObj.main[i].entryValue === '$sessionDAO')) {
          this.isLdapRealmEnable = false;
        }
      }
    }
  }
}
