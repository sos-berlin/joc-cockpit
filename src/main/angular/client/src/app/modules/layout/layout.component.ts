import {Component, HostListener, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import {NzConfigService} from 'ng-zorro-antd/core/config';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../components/guard';
import {HeaderComponent} from '../../components/header/header.component';

declare const $;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, OnDestroy {

  preferences: any = {};
  schedulerIds: any;
  permission: any;
  selectedScheduler: any = {};
  selectedController: any = {};
  remainingSessionTime: string;
  interval: any;
  tabsMap = new Map();
  currentTime: string;
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
  count = 0;
  count2 = 0;

  @ViewChild(HeaderComponent, {static: false}) child;
  @ViewChild('customTpl', {static: true}) customTpl;

  constructor(private coreService: CoreService, private route: ActivatedRoute, private authService: AuthService, private router: Router,
              private dataService: DataService, public translate: TranslateService, private toasterService: ToasterService,
              private nzConfigService: NzConfigService, private modalService: NgbModal) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.switchSchedulerAnnounced$.subscribe(res => {
      this.changeScheduler(res);
    });
    this.subscription3 = dataService.isProfileReload.subscribe(res => {
      if (res) {
        this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
        if (this.schedulerIds.selected) {
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
        // close all open modals
        this.modalService.dismissAll();
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

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ProblemEvent' && args.eventSnapshots[j].message) {
          if (args.eventSnapshots[j].accessToken === this.authService.accessTokenId) {
            this.toasterService.pop('error', '', args.eventSnapshots[j].message);
          }
        } else if (args.eventSnapshots[j].eventType === 'ControllerStateChanged') {
          this.loadScheduleDetail();
          break;
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
        this.init();
      } else if (!this.schedulerIds || !this.schedulerIds.selected) {
        this.schedulerIds = {};
        this.getSchedulerIds();
        this.getPermissions();
      }
    } else {
      let userName;
      if (localStorage.$SOS$REMEMBER === 'true' || localStorage.$SOS$REMEMBER === true) {
        userName = AES.decrypt(localStorage.$SOS$FOO, '$SOSJS7');
        userName = userName.toString(Utf8);
      }
      this.authenticate(userName);
    }
  }

  private getComments(): void {
    if (this.schedulerIds && this.schedulerIds.selected) {
      if (!this.isProfileLoaded) {
        this.isProfileLoaded = true;
        this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, false);
      }
      this.coreService.post('joc/properties', {}).subscribe((result: any) => {
        sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
        sessionStorage.comments = JSON.stringify(result.comments);
        sessionStorage.showViews = JSON.stringify(result.showViews);
        sessionStorage.securityLevel = result.securityLevel;
        sessionStorage.defaultProfile = result.defaultProfileAccount;
        sessionStorage.$SOS$COPY = JSON.stringify(result.copy);
        sessionStorage.$SOS$RESTORE = JSON.stringify(result.restore);
      }, () => {
        this.ngOnInit();
      });
    } else {
      this.schedulerIds = {};
    }
  }

  private getPermissions(): void {
    this.coreService.post('authentication/joc_cockpit_permissions', {}).subscribe((permission) => {
      this.authService.setPermission(permission);
      this.authService.save();
      if (!sessionStorage.preferenceId) {
        this.ngOnInit();
      }
      if (this.child) {
        this.child.reloadSettings();
      }
      setTimeout(() => {
        if (!this.loading) {
          this.loadInit();
        }
      }, 10);
    });
  }

  private getSchedulerIds(): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      if (res && res.controllerIds && res.controllerIds.length > 0) {
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
    }, () => {
      this.getComments();
      this.router.navigate(['/start-up']);
      setTimeout(() => {
        this.loading = true;
      }, 10);
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
    }, 10);
  }

  private authenticate(userName): any {
    this.coreService.post('authentication/login', {userName}).subscribe((data) => {
      this.authService.setUser(data);
      this.authService.save();
      this.getSchedulerIds();
      this.getPermissions();
    }, () => {
      const returnUrl = this.router.url.match(/login/) ? '/' : this.router.url;
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

    this.loadScheduleDetail();
    if (!this.loading) {
      this.loadInit();
    }
  }

  private loadInit(): void {
    this.sessionTimeout = parseInt(this.authService.sessionTimeout, 10);
    this.permission = JSON.parse(this.authService.permission) || {};
    if (sessionStorage.preferences) {
      this.loading = true;
    } else {
      return;
    }
    this.loadSettingConfiguration();
    this.count = this.sessionTimeout / 1000;
    if (this.sessionTimeout > 0) {
      this.calculateTime();
    }
    this.nzConfigService.set('empty', {nzDefaultEmptyContent: this.customTpl});
    setTimeout(() => {
      LayoutComponent.calculateHeight();
    }, 10);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.subscription4.unsubscribe();
    this.subscription5.unsubscribe();
    this.modalService.dismissAll();
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

  loadScheduleDetail(): void {
    if (sessionStorage.$SOS$CONTROLLER && sessionStorage.$SOS$CONTROLLER !== 'null') {
      this.selectedController = JSON.parse(sessionStorage.$SOS$CONTROLLER);
      this.selectedScheduler.scheduler = this.selectedController;
      if (this.selectedScheduler && this.selectedScheduler.scheduler) {
        document.title = 'JS7 : ' + this.selectedScheduler.scheduler.controllerId;
      }
    }
    if (this.schedulerIds && this.schedulerIds.selected) {
      this.getVolatileData(false);
    }
  }

  changeScheduler(controller): void {
    if (this.schedulerIds.selected === controller) {
      return;
    }
    this.child.switchScheduler = true;
    this.schedulerIds.selected = controller;
    const key = this.schedulerIds.selected;
    this.tabsMap.set(key, JSON.stringify(this.coreService.getTabs()));
    this.coreService.post('controller/switch', {controllerId: this.schedulerIds.selected}).subscribe(() => {
      this.coreService.post('controller/ids', {}).subscribe((res) => {
        if (res) {
          let previousData = this.tabsMap.get(controller);
          if (previousData) {
            previousData = JSON.parse(previousData);
            this.coreService.setTabs(previousData);
          } else {
            this.coreService.setDefaultTab();
          }
          this.authService.setIds(res);
          this.authService.save();
          this.reloadUI();
        } else {
          let title = '', msg = '';
          this.translate.get('message.oops').subscribe(translatedValue => {
            title = translatedValue;
          });
          this.translate.get('message.errorInLoadingScheduleIds').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.pop('error', title, msg);
        }
      });
    });
  }

  logout(timeout): void {
    this.isLogout = true;
    this.child.isLogout = true;
    this.coreService.post('authentication/logout', {}).subscribe(() => {
      this._logout(timeout);
    }, () => {
      this._logout(timeout);
    });
  }

  private _logout(timeout): void {
    this.authService.clearUser();
    this.authService.clearStorage();
    if (timeout) {
      sessionStorage.setItem('$SOS$CONTROLLER', null);
      const returnUrl = this.router.url;
      let queryParams = {queryParams: {returnUrl}};
      if (!returnUrl || returnUrl.match(/login/)) {
        queryParams = undefined;
      } else {
        queryParams.queryParams.returnUrl = returnUrl;
      }
      this.router.navigate(['login'], queryParams);
    } else {
      localStorage.setItem('logging', null);
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
      --this.count;
      if (!this.preferences.zone && sessionStorage.preferences) {
        this.preferences = JSON.parse(sessionStorage.preferences) || {};
      }
      this.currentTime = this.coreService.stringToDate(this.preferences, new Date());
      let s = Math.floor((this.count) % 60),
        m = Math.floor((this.count / (60)) % 60),
        h = Math.floor((this.count / (60 * 60)) % 24),
        d = Math.floor(this.count / (60 * 60 * 24));

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
    }, 1000);
  }

  private setUserPreferences(preferences, configObj, reload): void {
    if (sessionStorage.preferenceId === 0 || sessionStorage.preferenceId == '0') {
      const timezone = this.coreService.getTimeZone();
      if (timezone) {
        preferences.zone = timezone;
      } else {
        preferences.zone = this.selectedController.timeZone;
      }
      preferences.locale = 'en';
      preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
      preferences.maxRecords = 5000;
      preferences.maxAuditLogRecords = 5000;
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
    this.isProfileLoaded = false;
  }

  private setUserObject(preferences, conf, configObj): void {
    if (conf.configurationItem) {
      sessionStorage.preferences = JSON.parse(JSON.stringify(conf.configurationItem));
      this.reloadThemeAndLang(preferences);
    } else {
      this.setUserPreferences(preferences, configObj, false);
    }
  }

  private getUserProfileConfiguration(id, user, reload: boolean): void {
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
          let clientLogFilter = {
            status: ['info', 'debug', 'error', 'warn'],
            isEnable: false
          };
          sessionStorage.clientLogFilter = JSON.stringify(clientLogFilter);
          this.saveSettingConf(true);
        }
      });
    }
  }

  private saveSettingConf(flag): void {
    if ((sessionStorage.settingId || flag) && this.authService.currentUserData) {
      let configObj = {
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

  reloadThemeAndLang(preferences): void {
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

  private updateTitle(res): void {
    if (!res) {
      return;
    }
    this.selectedController = res.controller;
    this.selectedScheduler.scheduler = this.selectedController;
    if (this.selectedScheduler && this.selectedScheduler.scheduler) {
      document.title = 'JS7:' + this.selectedScheduler.scheduler.controllerId;
    }
    sessionStorage.$SOS$CONTROLLER = JSON.stringify(this.selectedController);
  }

  private getVolatileData(flag: boolean): void {
    this.coreService.post('controller', {controllerId: this.schedulerIds.selected}).subscribe(res => {
      this.updateTitle(res);
      this.child.switchSchedulerController();
      if (flag) {
        this.dataService.refreshUI('reload');
      }
    });
  }

  private reloadUI(): void {
    this.getVolatileData(true);
    this.child.reloadSettings();
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, true);
    this.loadSettingConfiguration();
  }
}
