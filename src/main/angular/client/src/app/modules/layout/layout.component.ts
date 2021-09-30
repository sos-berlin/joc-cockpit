import {Component, HostListener, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {isEmpty} from 'underscore';
import {NzConfigService} from 'ng-zorro-antd/core/config';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../components/guard';
import {HeaderComponent} from '../../components/header/header.component';
import {StepGuideComponent} from '../../components/info-menu/info-menu.component';

declare const $: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, OnDestroy {
  preferences: any = {};
  schedulerIds: any;
  permission: any;
  remainingSessionTime = '';
  interval: any;
  tabsMap = new Map();
  currentTime = '';
  subscription1: any = Subscription;
  subscription2: any = Subscription;
  subscription3: any = Subscription;
  subscription4: any = Subscription;
  subscription5: any = Subscription;
  isLogout = false;
  loading = false;
  sessionTimeout = 0;
  isTouch = false;
  isProfileLoaded = false;
  isPropertiesLoaded = false;
  isPopupOpen = false;
  count = 0;
  count2 = 0;

  @ViewChild(HeaderComponent, {static: false}) child: any;
  @ViewChild('customTpl', {static: true}) customTpl: any;

  constructor(private coreService: CoreService, private route: ActivatedRoute, private authService: AuthService, private router: Router,
              private dataService: DataService, public translate: TranslateService, private toasterService: ToasterService,
              private nzConfigService: NzConfigService, private modal: NzModalService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.switchSchedulerAnnounced$.subscribe(res => {
      this.changeScheduler(res);
    });
    this.subscription3 = dataService.isProfileReload.subscribe(res => {
      if (res) {
        this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        if (this.schedulerIds && this.schedulerIds.selected) {
          this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, true);
        }
      }
    });
    this.subscription4 = dataService.resetProfileSetting.subscribe(res => {
      if (res && sessionStorage.preferences) {
        this.preferences = JSON.parse(sessionStorage.preferences) || {};
      }
    });
    this.subscription5 = router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd)).subscribe((e: any) => {
        if (this.loading) {
          LayoutComponent.calculateHeight();
        }
      });
  }

  static calculateHeight(): void {
    const navBar = $('#navbar1');
    if (navBar.hasClass('in')) {
      navBar.removeClass('in');
      $('a.navbar-item').addClass('collapsed');
    }
    const headerHt = $('.fixed-top').height() || 70;
    $('.app-body').css('margin-top', headerHt + 'px');
  }

  static checkNavHeader(): void {
    const dom = $('#navbar1');
    if (dom && dom.hasClass('in')) {
      dom.removeClass('in');
      $('a.navbar-item').addClass('collapsed');
    }
  }

  static setControllerPermission(permissions: any, controllerIds: any): any {
    if (permissions.controllers && controllerIds.selected && permissions.controllers[controllerIds.selected]) {
      return permissions.controllers[controllerIds.selected];
    } else {
      return permissions.controllerDefaults;
    }
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if ((args.eventSnapshots[j].eventType === 'ProblemEvent' || args.eventSnapshots[j].eventType === 'ProblemAsHintEvent') && args.eventSnapshots[j].message) {
          if (args.eventSnapshots[j].accessToken === this.authService.accessTokenId) {
            this.toasterService.pop(args.eventSnapshots[j].eventType === 'ProblemEvent' ? 'error' : 'warning', '', args.eventSnapshots[j].message);
            break;
          }
        }
      }
    }
  }

  ngOnInit(): void {
    ++this.count2;
    if (this.count2 > 8) {
      this.schedulerIds = {};
      return;
    }
    if (this.authService.accessTokenId) {
      if (this.authService.scheduleIds) {
        this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
        if (!this.isProfileLoaded) {
          this.isProfileLoaded = true;
          this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, false);
        }
        if (!this.permission) {
          this.getPermissions();
        }
      } else if (!this.schedulerIds) {
        this.schedulerIds = {};
        this.getSchedulerIds();
      } else if (isEmpty(this.schedulerIds) && !this.loading) {
        this.getSchedulerIds();
      }
    } else {
      this.authenticate();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.subscription4.unsubscribe();
    this.subscription5.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    LayoutComponent.calculateHeight();
    LayoutComponent.checkNavHeader();
  }

  @HostListener('window:click', ['$event'])
  onClick(): void {
    if (!this.isLogout) {
      this.refreshSession();
    }
  }

  @HostListener('window:beforeunload')
  onUnload(): boolean {
    this.coreService.refreshParent();
    return true;
  }

  changeScheduler(controller: string): void {
    if (this.schedulerIds.selected === controller) {
      return;
    }
    this.child.switchScheduler = true;
    this.schedulerIds.selected = controller;
    const key = this.schedulerIds.selected;
    this.tabsMap.set(key, JSON.stringify(this.coreService.getTabs()));
    localStorage.setItem('$SOS$SELECTEDID', controller);
    this.coreService.post('controller/switch', {controllerId: this.schedulerIds.selected}).subscribe(() => {
      this.coreService.post('controller/ids', {}).subscribe((res) => {
        if (res) {
          document.title = 'JS7:' + this.schedulerIds.selected;
          let previousData = this.tabsMap.get(controller);
          if (previousData) {
            previousData = JSON.parse(previousData);
            this.coreService.setTabs(previousData);
          } else {
            this.coreService.setDefaultTab();
          }
          this.authService.setIds(res);
          const permission = JSON.parse(this.authService.permission);
          permission.currentController = LayoutComponent.setControllerPermission(permission, this.schedulerIds);
          this.authService.setPermission(permission);
          this.authService.save();
          this.reloadUI();
        } else {
          let title = '';
          let msg = '';
          this.translate.get('error.message.oops').subscribe(translatedValue => {
            title = translatedValue;
          });
          this.translate.get('error.message.errorInLoadingScheduleIds').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.pop('error', title, msg);
        }
      });
    });
  }

  logout(timeout: any): void {
    this.isLogout = true;
    this.child.isLogout = true;
    this.coreService.post('authentication/logout', {}).subscribe(() => {
      this._logout(timeout);
    }, () => {
      this._logout(timeout);
    });
  }

  reloadThemeAndLang(preferences: any): void {
    preferences = JSON.parse(sessionStorage.preferences);
    $('#style-color').attr('href', './styles/' + preferences.theme + '-style.css');
    localStorage.$SOS$THEME = preferences.theme;
    $('#headerColor').addClass(preferences.headerColor);
    localStorage.$SOS$MENUTHEME = preferences.headerColor;
    $('#avatarBg').addClass(preferences.avatarColor);
    localStorage.$SOS$AVATARTHEME = preferences.avatarColor;
    localStorage.$SOS$LANG = preferences.locale;
    this.translate.setDefaultLang(preferences.locale);
    this.translate.use(preferences.locale);
  }

  private getComments(): void {
    if (!this.permission) {
      this.getPermissions();
    }
    if (this.schedulerIds && this.schedulerIds.selected) {
      if (!this.isProfileLoaded) {
        this.isProfileLoaded = true;
        this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, false);
      }
      this.loadJocProperties();
    } else {
      this.schedulerIds = {};
      this.loadJocProperties();
    }
  }

  private loadJocProperties(): void {
    if (!this.isPropertiesLoaded) {
      this.isPropertiesLoaded = true;
      this.coreService.post('joc/properties', {}).subscribe((result: any) => {
        sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
        sessionStorage.comments = JSON.stringify(result.comments);
        sessionStorage.showViews = JSON.stringify(result.showViews);
        sessionStorage.securityLevel = result.securityLevel;
        sessionStorage.defaultProfile = result.defaultProfileAccount;
        sessionStorage.$SOS$COPY = JSON.stringify(result.copy);
        sessionStorage.$SOS$RESTORE = JSON.stringify(result.restore);
        sessionStorage.$SOS$IMPORT = JSON.stringify(result.import);
        sessionStorage.welcomeDoNotRemindMe = result.welcomeDoNotRemindMe;
        sessionStorage.welcomeGotIt = result.welcomeGotIt;
        if (!this.loading) {
          this.init();
        }
        this.isPropertiesLoaded = false;
      }, () => {
        this.ngOnInit();
      });
    }
  }

  private getPermissions(): void {
    this.coreService.post('authentication/joc_cockpit_permissions', {}).subscribe((permission: any) => {
      permission.currentController = LayoutComponent.setControllerPermission(permission, this.schedulerIds);
      this.authService.setPermission(permission);
      this.authService.save();
      this.permission = permission;
      if (!sessionStorage.preferenceId) {
        this.ngOnInit();
      }
      if (this.child) {
        this.child.reloadSettings();
      }
      setTimeout(() => {
        if (!this.loading) {
          this.loadInit(false);
        }
      }, 10);
    });
  }

  private getSchedulerIds(): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      if (res && res.controllerIds && res.controllerIds.length > 0) {
        const ID = localStorage.getItem('$SOS$SELECTEDID');
        if (ID && ID !== 'null' && ID !== res.selected) {
          if (res.controllerIds.length > 0 && res.controllerIds.indexOf(ID) > -1) {
            res.selected = ID;
            this.coreService.post('controller/switch', {controllerId: ID}).subscribe(() => {
            });
          } else {
            localStorage.removeItem('$SOS$SELECTEDID');
          }
        }
        this.authService.setIds(res);
        this.authService.save();
        this.schedulerIds = res;
        this.getComments();
      } else {
        this.coreService.post('controllers/security_level', {}).subscribe((result: any) => {
          this.checkSecurityControllers(result);
        }, () => {
          this.checkSecurityControllers(null);
        });
      }
    }, (err) => {
      if (err.error && err.error.message === 'Access denied') {
        this.loadInit(true);
      } else {
        this.getComments();
        this.router.navigate(['/start-up']);
        setTimeout(() => {
          this.loading = true;
        }, 10);
      }
    });
  }

  private checkSecurityControllers(res): void {
    this.getComments();
    if (res && res.controllers && res.controllers.length > 0) {
      this.router.navigate(['/controllers']);
    } else {
      this.router.navigate(['/start-up']);
    }
    setTimeout(() => {
      this.loading = true;
      this.loadInit(false, true);
    }, 10);
  }

  private authenticate(): any {
    this.coreService.post('authentication/login', {}).subscribe((data) => {
      this.authService.setUser(data);
      this.authService.save();
      this.getSchedulerIds();
    }, () => {
      let returnUrl = this.router.url.match(/login/) ? '/' : this.router.url;
      if (returnUrl === '/error' || returnUrl === 'error') {
        returnUrl = '/';
      }
      this.router.navigate(['login'], {queryParams: {returnUrl}});
    });
  }

  private init(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    } else {
      setTimeout(() => {
        this.init();
      }, 100);
      return;
    }
    if (!this.loading) {
      this.loadInit(false);
    }
  }

  private loadInit(isError: boolean, skip = false): void {
    this.sessionTimeout = parseInt(this.authService.sessionTimeout, 10);
    if (!skip) {
      if (this.permission && this.permission.joc && !this.authService.permissionCheck(this.router.url)) {
        this.router.navigate(['/error']);
      }
      if (sessionStorage.preferences || isError) {
        if (!this.permission) {
          this.permission = JSON.parse(this.authService.permission) || {};
        }
        this.loading = true;
      } else {
        return;
      }
      if (!this.permission) {
        this.permission = JSON.parse(this.authService.permission) || {};
      }
      this.loadSettingConfiguration();
    }
    this.count = this.sessionTimeout / 1000;
    this.calculateTime();
    if (this.schedulerIds && this.schedulerIds.selected) {
      document.title = 'JS7:' + this.schedulerIds.selected;
    }
    this.nzConfigService.set('empty', {nzDefaultEmptyContent: this.customTpl});
    setTimeout(() => {
      LayoutComponent.calculateHeight();
    }, 10);
  }

  private _logout(timeout: any): void {
    this.authService.clearUser();
    this.authService.clearStorage();
    if (timeout) {
      sessionStorage.removeItem('$SOS$CONTROLLER');
      const returnUrl = this.router.url;
      let queryParams = {queryParams: {returnUrl}};
      if (!returnUrl || returnUrl.match(/login/)) {
        queryParams = undefined;
      } else {
        if (returnUrl === '/error' || returnUrl === 'error') {
          queryParams = undefined;
        }
        queryParams.queryParams.returnUrl = returnUrl;
      }
      this.router.navigate(['login'], queryParams);
    } else {
      localStorage.removeItem('logging');
      this.coreService.setDefaultTab();
      sessionStorage.clear();
      this.router.navigate(['login']);
    }
  }

  private refreshSession(): void {
    if (!this.isTouch && this.sessionTimeout >= 0) {
      this.isTouch = true;
      this.coreService.post('touch', undefined).subscribe(res => {
        this.isTouch = false;
        if (res) {
          this.count = this.sessionTimeout / 1000 - 1;
        }
      }, () => {
        this.isTouch = false;
      });
    }
  }

  private calculateTime(): void {
    this.interval = setInterval(() => {
      if (!this.preferences.zone && sessionStorage.preferences) {
        this.preferences = JSON.parse(sessionStorage.preferences) || {};
      }
      this.currentTime = this.coreService.stringToDate(this.preferences, new Date());
      if (this.sessionTimeout > 0) {
        this.count = this.count - 3;
        const s = Math.floor((this.count) % 60);
        const m = Math.floor((this.count / (60)) % 60);
        const h = Math.floor((this.count / (60 * 60)) % 24);
        const d = Math.floor(this.count / (60 * 60 * 24));

        const x = m > 9 ? m : '0' + m;
        const y = s > 9 ? s : '0' + s;

        if (d === 0 && h !== 0) {
          this.remainingSessionTime = h + 'h ' + x + 'm ' + y + 's';
        } else if (d === 0 && h === 0 && m !== 0) {
          this.remainingSessionTime = x + 'm ' + y + 's';
        } else if (d === 0 && h === 0 && m === 0) {
          this.remainingSessionTime = s + 's';
        } else {
          this.remainingSessionTime = d + 'd ' + h + 'h';
        }
        if (this.count <= 0) {
          clearInterval(this.interval);
          this.isLogout = true;
          this.logout('timeout');
        }
      }
      this.openStepGuideModal();
    }, 3000);
  }

  private setUserPreferences(preferences: any, configObj: any, reload: boolean): void {
    if (sessionStorage.preferenceId === 0 || sessionStorage.preferenceId == '0') {
      const timezone = this.coreService.getTimeZone();
      if (timezone) {
        preferences.zone = timezone;
      }
      preferences.locale = 'en';
      preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
      preferences.maxRecords = 5000;
      preferences.maxAuditLogRecords = 5000;
      preferences.maxNotificationRecords = 5000;
      preferences.maxOrderRecords = 5000;
      preferences.maxDailyPlanRecords = 5000;
      preferences.maxWorkflowRecords = 5000;
      preferences.maxFileTransferRecords = 5000;
      preferences.maxHistoryPerOrder = 10;
      preferences.maxHistoryPerTask = 10;
      preferences.maxAuditLogPerObject = 10;
      preferences.maxEntryPerPage = '1000';
      preferences.entryPerPage = '25';
      preferences.isNewWindow = 'newWindow';
      preferences.isDocNewWindow = 'newWindow';
      preferences.isXSDNewWindow = 'newWindow';
      preferences.pageView = 'list';
      preferences.theme = 'light';
      preferences.headerColor = '';
      preferences.historyTab = 'order';
      preferences.expandOption = 'both';
      preferences.currentController = true;
      preferences.logTimezone = true;
      if (sessionStorage.$SOS$FORCELOGING === 'true' || sessionStorage.$SOS$FORCELOGING === true) {
        preferences.auditLog = true;
      }
      configObj.configurationItem = JSON.stringify(preferences);
      configObj.id = 0;
      sessionStorage.preferences = configObj.configurationItem;
      if (this.schedulerIds.selected) {
        this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
          sessionStorage.preferenceId = res.id;
          if (reload) {
            this.reloadThemeAndLang(preferences);
            this.dataService.resetProfileSetting.next(true);
          }
        });
      }
    }
    if (reload) {
      this.dataService.refreshUI('reload');
    }
    this.isProfileLoaded = false;
  }

  private setUserObject(preferences: any, conf: any, configObj: any): void {
    if (conf.configurationItem) {
      const data = JSON.parse(conf.configurationItem);
      if (sessionStorage.$SOS$FORCELOGING === 'true' || sessionStorage.$SOS$FORCELOGING === true) {
        data.auditLog = true;
      }
      if (!data.maxNotificationRecords){
        data.maxNotificationRecords = 5000;
      }
      if (!data.maxOrderRecords){
        data.maxOrderRecords = 5000;
      }
      if (!data.maxDailyPlanRecords){
        data.maxDailyPlanRecords = 5000;
      }
      if (!data.maxWorkflowRecords){
        data.maxWorkflowRecords = 5000;
      }
      if (!data.maxFileTransferRecords){
        data.maxFileTransferRecords = 5000;
      }
      sessionStorage.preferences = JSON.stringify(data);
      this.reloadThemeAndLang(preferences);
    } else {
      this.setUserPreferences(preferences, configObj, false);
    }
  }

  private getUserProfileConfiguration(id: string, user: string, reload: boolean): void {
    if (id) {
      const configObj = {
        controllerId: id,
        account: user,
        configurationType: 'PROFILE'
      };
      const preferences: any = {};
      this.coreService.post('configurations', configObj).subscribe((res: any) => {
        sessionStorage.preferenceId = 0;
        if (res.configurations && res.configurations.length > 0) {
          const conf = res.configurations[0];
          sessionStorage.preferenceId = conf.id;
          this.setUserObject(preferences, conf, configObj);
          if (reload) {
            this.dataService.refreshUI('reload');
          }
        } else {
          this.setUserPreferences(preferences, configObj, reload);
        }
      }, () => {
        this.setUserPreferences(preferences, configObj, reload);
      });
    }
  }

  private loadSettingConfiguration(): void {
    if (this.authService.currentUserData && this.schedulerIds.selected) {
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'SETTING'
      };
      if (!sessionStorage.settingId) {
        sessionStorage.settingId = 0;
      }
      this.coreService.post('configurations', configObj).subscribe((res1: any) => {
        if (res1.configurations && res1.configurations.length > 0) {
          sessionStorage.settingId = res1.configurations[0].id;
          sessionStorage.clientLogFilter = res1.configurations[0].configurationItem;
        } else {
          const clientLogFilter = {
            status: ['info', 'debug', 'error', 'warn'],
            isEnable: false
          };
          sessionStorage.clientLogFilter = JSON.stringify(clientLogFilter);
          this.saveSettingConf(true);
        }
      });
    }
  }

  private saveSettingConf(flag: boolean): void {
    if ((sessionStorage.settingId || flag) && this.authService.currentUserData) {
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'SETTING',
        id: flag ? 0 : parseInt(sessionStorage.settingId, 10),
        configurationItem: sessionStorage.clientLogFilter
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        sessionStorage.settingId = res.id;
      });
    }
  }

  private reloadUI(): void {
    this.child.reloadSettings();
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, true);
    this.loadSettingConfiguration();
  }

  private openStepGuideModal(): void {
    if (!this.isPopupOpen) {
      if (this.router.url && !(this.router.url.match(/dashboard/) || this.router.url.match(/configuration\/inventory/))) {
        return;
      }
      this.isPopupOpen = true;
      if ((sessionStorage.welcomeDoNotRemindMe && sessionStorage.welcomeDoNotRemindMe == 'true')
        || (sessionStorage.welcomeGotIt && sessionStorage.welcomeGotIt == 'true')) {
        return;
      }
      const date = localStorage.getItem('$SOS$REMINDMEAFTER');
      if (date) {
        if (parseInt(date, 10) > new Date().getTime()) {
          return;
        }
      }
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: StepGuideComponent,
        nzClassName: 'w-620',
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result === 'REMINDMELATER') {
          localStorage.setItem('$SOS$REMINDMEAFTER', (new Date().setDate(new Date().getDate() + 1)).toString());
        } else {
          localStorage.removeItem('$SOS$REMINDMEAFTER');
          if (this.permission.joc && this.permission.joc.administration.settings.manage) {
            this.storeGlobalConfig();
          }
        }
      });
    }
  }

  private storeGlobalConfig(): void {
    this.coreService.post('configurations', {configurationType: 'GLOBALS'}).subscribe((res) => {
      let configuration: any = {};
      if (res.configurations[0]) {
        configuration = res.configurations[0];
        configuration.configurationItem = JSON.parse(res.configurations[0].configurationItem);
      } else {
        configuration.configurationItem = JSON.parse(res.defaultGlobals);
      }
      if (!configuration.configurationItem.user) {
        configuration.configurationItem.user = {};
      }
      if (!configuration.configurationItem.user.welcome_got_it) {
        configuration.configurationItem.user.welcome_got_it = {type: 'BOOLEAN'};
        configuration.configurationItem.user.welcome_do_not_remind_me = {type: 'BOOLEAN'};
      }
      configuration.configurationItem.user.welcome_got_it.value = true;
      configuration.configurationItem.user.welcome_do_not_remind_me.value = true;
      this.coreService.post('configuration/save', {
        id: configuration.id || 0,
        configurationType: 'GLOBALS',
        configurationItem: JSON.stringify(configuration.configurationItem)
      }).subscribe(() => {
        sessionStorage.welcomeDoNotRemindMe = true;
        sessionStorage.welcomeGotIt = true;
      });
    });
  }
}
