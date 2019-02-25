import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {DataService} from './data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {

  schedulerIds: any;
  permission: any;
  showTabs = false;
  isButtonShow = false;
  isLdapRealmEnable = true;
  isJOCClusterEnable = true;
  selectedUser: string;
  route: any;
  userObj: any;
  users: any;
  pageView: string;
  searchKey: string;
  isLoaded = false;
  subscription: Subscription;

  constructor(private authService: AuthService, private router: Router, private activeRoute: ActivatedRoute, public coreService: CoreService, private dataService: DataService) {
    router.events.subscribe((val) => {
      this.checkUrl(val);
    });
    this.subscription = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'IS_DELETE_PROFILES_TRUE') {
        this.isButtonShow = true;
      } else if (res === 'IS_DELETE_PROFILES_FALSE') {
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
    this.subscription.unsubscribe();
  }

  selectUser(user) {
    if (user) {
      this.router.navigate(['/users/master'], {queryParams: {user: user}});
    } else {
      this.selectedUser = null;
      this.router.navigate(['/users/master']);
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

  deleteProfiles() {
    this.dataService.announceFunction('DELETE_PROFILES');
  }

  receiveMessage($event) {
    this.pageView = $event;
    this.dataService.announceFunction('CHANGE_VIEW');
  }

  private checkUrl(val) {
    if (val.url) {
      this.route = val.url;
      this.showTabs = !!(this.route === '/users/account' || this.route.search('/users/master') > -1 || this.route === '/users/main_section' || this.route === '/users/profiles');
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
    this.coreService.post('security_configuration/read', {}).subscribe(res => {
      this.userObj = res;
      this.users = this.userObj.users;
      this.dataService.announceData(this.userObj);
      this.checkLdapConf();
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
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
