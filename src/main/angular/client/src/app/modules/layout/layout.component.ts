import {Component, HostListener, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from 'rxjs';
import * as jstz from 'jstz';
import {NzConfigService} from 'ng-zorro-antd';
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
  schedulerIds: any = {};
  permission: any = {};
  selectedScheduler: any = {};
  selectedController: any = {};
  remainingSessionTime: string;
  interval: any;
  tabsMap = new Map();
  currentTime = new Date();
  subscription1: any = Subscription;
  subscription2: any = Subscription;
  subscription3: any = Subscription;
  subscription4: any = Subscription;
  isLogout = false;
  isTouch = false;
  count = 0;

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
      if (res) {
        this.preferences = JSON.parse(sessionStorage.preferences) || {};
      }
    });

    router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        LayoutComponent.calculateHeight();
        // close all open modals
        this.modalService.dismissAll();
      }
    });
  }

  static calculateHeight() {
    const navBar = $('#navbar1');
    if (navBar.hasClass('in')) {
      navBar.removeClass('in');
      $('a.navbar-item').addClass('collapsed');
    }
    const headerHt = $('.fixed-top').height() || 70;
    $('.app-body').css('margin-top', headerHt + 'px');
  }

  static checkNavHeader() {
    const dom = $('#navbar1');
    if (dom && dom.hasClass('in')) {
      dom.removeClass('in');
      $('a.navbar-item').addClass('collapsed');
    }
  }

  refresh(args) {
    if (args && args.length) {
      for (let i = 0; i < args.length; i++) {
        if (args[i].controllerId === this.schedulerIds.selected) {
          if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
            for (let j = 0; j < args[i].eventSnapshots.length; j++) {
              if (args[i].eventSnapshots[j].eventType === 'ControllerStateChanged') {
                this.loadScheduleDetail();
                break;
              } else if (args[i].eventSnapshots[j].eventType.match(/Problem/) && args[i].eventSnapshots[j].message) {
                if (args[i].eventSnapshots[j].accessToken == this.authService.accessTokenId) {
                  this.toasterService.pop('error', '', args[i].eventSnapshots[j].message);
                }
              }
            }
          }
          break;
        }
      }
    }
  }

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, false);
    this.loadSettingConfiguration();
    this.count = parseInt(this.authService.sessionTimeout, 10) / 1000;
    this.loadScheduleDetail();
    this.calculateTime();
    this.nzConfigService.set('empty', {nzDefaultEmptyContent: this.customTpl});
    LayoutComponent.calculateHeight();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.subscription4.unsubscribe();
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
    LayoutComponent.calculateHeight();
    LayoutComponent.checkNavHeader();
  }

  @HostListener('window:click', ['$event'])
  onClick() {
    if (!this.isLogout) {
      this.refreshSession();
    }
  }

  @HostListener('window:beforeunload')
  onUnload() {
    this.coreService.refreshParent();
    return true;
  }

  loadScheduleDetail() {
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

  changeScheduler(controller) {
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
          this.authService.savePermission(controller);
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

  logout(timeout) {
    this.isLogout = true;
    this.child.isLogout = true;
    this.coreService.post('security/logout', {}).subscribe(() => {
      this._logout(timeout);
    }, () => {
      this._logout(timeout);
    });
  }

  private _logout(timeout) {
    this.authService.clearUser();
    this.authService.clearStorage();
    localStorage.setItem('logging', null);
    if (timeout) {
      sessionStorage.setItem('$SOS$CONTROLLER', null);
      sessionStorage.setItem('$SOS$ALLEVENT', null);
      this.router.navigate(['login'], {queryParams: {returnUrl: this.router.url}});
    } else {
      this.coreService.setDefaultTab();
      sessionStorage.clear();
      this.router.navigate(['login']);
    }
  }

  private refreshSession() {
    if (!this.isTouch) {
      this.isTouch = true;
      this.coreService.post('touch', undefined).subscribe(res => {
        this.isTouch = false;
        if (res) {
          this.count = parseInt(this.authService.sessionTimeout, 10) / 1000 - 1;
        }
      }, () => {
        this.isTouch = false;
      });
    }
  }

  private calculateTime() {
    this.interval = setInterval(() => {
      --this.count;
      this.currentTime = new Date();
      const s = Math.floor((this.count) % 60),
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

      if (this.count < 0) {
        clearInterval(this.interval);
        this.isLogout = true;
        this.logout('timeout');
      }

    }, 1000);
  }

  private setUserPreferences(preferences, configObj, reload) {
    if (sessionStorage.preferenceId === 0 || sessionStorage.preferenceId == '0') {
      const timezone = jstz.determine();
      if (timezone) {
        preferences.zone = timezone.name() || this.selectedController.timeZone;
      } else {
        preferences.zone = this.selectedController.timeZone;
      }
      preferences.locale = 'en';
      preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
      preferences.maxRecords = 10000;
      preferences.maxAuditLogRecords = 10000;
      preferences.maxHistoryPerOrder = 30;
      preferences.maxHistoryPerTask = 10;
      preferences.maxAuditLogPerObject = 10;
      preferences.maxEntryPerPage = '1000';
      preferences.entryPerPage = '10';
      preferences.isNewWindow = 'newWindow';
      preferences.pageView = 'list';
      preferences.theme = 'light';
      preferences.historyView = 'current';
      preferences.adtLog = 'current';
      preferences.fileTransfer = 'current';
      preferences.logTimezone = true;
      preferences.showOrders = false;
      if (sessionStorage.$SOS$FORCELOGING === 'true' || sessionStorage.$SOS$FORCELOGING === true) {
        preferences.auditLog = true;
      }
      preferences.events = {};
      preferences.events.filter = [];
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
  }

  private setUserObject(preferences, conf, configObj) {
    if (conf.configurationItem) {
      sessionStorage.preferences = JSON.parse(JSON.stringify(conf.configurationItem));
      this.reloadThemeAndLang(preferences);
    } else {
      this.setUserPreferences(preferences, configObj, false);
    }
  }

  private getUserProfileConfiguration(id, user, reload: boolean) {
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

  private loadSettingConfiguration() {
    if(this.permission.user) {
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.permission.user,
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

  private saveSettingConf(flag) {
    if ((sessionStorage.settingId || flag) && this.permission.user) {
      let configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.permission.user,
        configurationType: 'SETTING',
        id: flag ? 0 : parseInt(sessionStorage.settingId, 10),
        configurationItem: sessionStorage.clientLogFilter
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        sessionStorage.settingId = res.id;
      });
    }
  }

  reloadThemeAndLang(preferences) {
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

  private updateTitle(res) {
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
    }, (err) => {
    });
  }

  private reloadUI() {
    this.getVolatileData(true);
    this.child.reloadSettings();
    this.preferences = JSON.parse(sessionStorage.preferences);
    this.permission = JSON.parse(this.authService.permission);
  }
}
