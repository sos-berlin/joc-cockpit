import {Component, HostListener, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Subscription} from 'rxjs';
import {isEmpty} from 'underscore';
import {NzConfigService} from 'ng-zorro-antd/core/config';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {PopupService} from "../../services/popup.service";
import {AuthService, OIDCAuthService} from '../../components/guard';
import {HeaderComponent} from '../../components/header/header.component';
import {StepGuideComponent} from '../../components/info-menu/info-menu.component';
import {ChangePasswordComponent} from "../../components/change-password/change-password.component";

declare const $: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
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
  subscription6: any = Subscription;
  isLogout = false;
  loading = false;
  sessionTimeout = 0;
  isTouch = false;
  isProfileLoaded = false;
  isPropertiesLoaded = false;
  isPopupOpen = false;
  isChangePasswordPopupOpen = false;
  isGlobalSettingCall = false;
  count = 0;
  count2 = 0;
  currentDate = new Date();
  licenseDate: Date;
  warningMessage: string;
  warningMessage2: string;

  @ViewChild(HeaderComponent, {static: false}) child: any;
  @ViewChild('customTpl', {static: true}) customTpl: any;

  constructor(private coreService: CoreService, private route: ActivatedRoute, private authService: AuthService, private router: Router,
              private dataService: DataService, public translate: TranslateService, private toasterService: ToastrService, private popoutService: PopupService,
              private nzConfigService: NzConfigService, private modal: NzModalService, private oauthService: OIDCAuthService) {
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
      if (res && sessionStorage['preferences']) {
        this.preferences = JSON.parse(sessionStorage['preferences']) || {};
      }
    });

    this.subscription5 = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!this.isChangePasswordPopupOpen && this.authService.currentUserData && (this.authService.forcePasswordChange == true || this.authService.forcePasswordChange == 'true')) {
          this.isChangePasswordPopupOpen = true;
          this.changePassword();
        }
        if (this.loading) {
          setTimeout(() => {
            LayoutComponent.calculateHeight();
          }, 50)
        }
      }
    });

    this.subscription6 = dataService.reloadLicenseCheck.subscribe(res => {
      if (res == true) {
        this.checkLicenseExpireDate();
      }
    });
  }

  static calculateHeight(): void {
    const navBar = $('#navbarId');
    if (navBar.hasClass('in')) {
      navBar.removeClass('in');
    }
    const headerHt = $('.fixed-top').height() || 70;
    $('.app-body').css({'margin-top': headerHt + 'px'});
    $('.max-ht').css({'max-height': 'calc(100vh - ' + (headerHt + 56) + 'px)'});
    $('.max-ht2').css({'max-height': 'calc(100vh - ' + (headerHt + 102) + 'px)'});
  }

  static setControllerPermission(permissions: any, controllerIds: any): any {
    if (permissions.controllers && controllerIds.selected && permissions.controllers[controllerIds.selected]) {
      return permissions.controllers[controllerIds.selected];
    } else {
      return permissions.controllerDefaults;
    }
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if ((args.eventSnapshots[j].eventType === 'ProblemEvent' || args.eventSnapshots[j].eventType === 'ProblemAsHintEvent' || args.eventSnapshots[j].eventType === 'NodeLossProblemEvent') && args.eventSnapshots[j].message) {
          if ((args.eventSnapshots[j].accessToken === this.authService.accessTokenId) || !args.eventSnapshots[j].accessToken) {
            if (args.eventSnapshots[j].eventType === 'ProblemEvent' || args.eventSnapshots[j].eventType === 'NodeLossProblemEvent') {
              this.toasterService.error(args.eventSnapshots[j].message);
            } else {
              this.toasterService.warning(args.eventSnapshots[j].message);
            }
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

  checkLicenseExpireDate() {
    if (sessionStorage.getItem('licenseValidUntil')) {
      if (!this.isGlobalSettingCall) {
        this.isGlobalSettingCall = true;
        this.coreService.post('configurations', {configurationType: 'GLOBALS'}).subscribe({
          next: (res) => {
            this.isGlobalSettingCall = false;
            let flag = false;
            let timeZone = '';
            if (res.configurations[0] && res.configurations[0].configurationItem) {
              const configuration = JSON.parse(res.configurations[0].configurationItem);
              timeZone = configuration?.dailyplan?.time_zone?.value;
              if (configuration?.joc) {
                flag = configuration.joc.disable_warning_on_license_expiration;
              }
            }
            if (!timeZone) {
              timeZone = res.defaultGlobals?.dailyplan?.time_zone?.default;
            }
            sessionStorage.setItem('$SOS$DAILYPLANTIMEZONE', timeZone);
            this._checkLicenseExpireDate(flag);
          }, error: () => {
            this.isGlobalSettingCall = false;
            this._checkLicenseExpireDate();
          }
        });
      }
    } else if (this.preferences.licenseReminderDate) {
      this.preferences.licenseReminderDate = null;
      this.preferences.licenseExpirationWarning = false;
      this.warningMessage = '';
      this.saveLicenseReminderDate();
    }
  }

  private _checkLicenseExpireDate(isDisable = false): void {
    const date = this.preferences.licenseReminderDate;
    this.licenseDate = new Date(sessionStorage.getItem('licenseValidUntil'));
    const differenceInTime = this.licenseDate.getTime() - this.currentDate.getTime();
    const remainingDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    if (date && remainingDays !== 0 && differenceInTime > 0
    ) {
      if (parseInt(date, 10) > new Date().getTime()) {
        return;
      }
    }
    if (this.preferences.licenseExpirationWarning && !date) {
      this.preferences.licenseReminderDate = remainingDays > 30 ? new Date().setMonth(new Date().getMonth() + 1) : this.preferences.licenseReminderDate = remainingDays > 7 ? new Date().setDate(new Date().getDate() + 7) : new Date(this.licenseDate).setDate(new Date(this.licenseDate).getDate() - 1);
      if (remainingDays !== 30 && remainingDays !== 7) {
        return;
      }
    }
    if (isDisable && remainingDays > 0) {
      return;
    }
    if (remainingDays < 61) {
      if (differenceInTime < 0) {
        this.translate.get('license.secondWarning', {date: this.coreService.getDateByFormat(this.licenseDate, this.preferences.zone, this.preferences.dateFormat)}).subscribe(translatedValue => {
          this.warningMessage2 = translatedValue;
        });
      } else {
        if (remainingDays == 0) {
          this.warningMessage2 = 'Hide';
        }
        this.translate.get('license.firstWarning', {date: this.coreService.getDateByFormat(this.licenseDate, this.preferences.zone, this.preferences.dateFormat)}).subscribe(translatedValue => {
          this.warningMessage = this.coreService.convertTextToLink(translatedValue, 'mailto:sales@sos-berlin.com');
        });
      }
    } else {
      this.warningMessage = '';
    }
  }

  remindLater() {
    this.preferences.licenseReminderDate = new Date().setDate(new Date().getDate() + 1);
    this.preferences.licenseExpirationWarning = true;
    this.warningMessage = '';
    this.saveLicenseReminderDate();
  }

  gotIt() {
    const differenceInTime = this.licenseDate.getTime() - this.currentDate.getTime();
    const remainingDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    if (remainingDays > 30) {
      this.preferences.licenseReminderDate = new Date().setMonth(new Date().getMonth() + 1);
    } else if (remainingDays > 7) {
      this.preferences.licenseReminderDate = new Date().setDate(new Date().getDate() + 7);
    } else {
      this.preferences.licenseReminderDate = new Date(this.licenseDate).setDate(new Date(this.licenseDate).getDate() - 1);
    }
    this.preferences.licenseExpirationWarning = true;
    this.saveLicenseReminderDate();
    this.warningMessage = '';
  }

  private saveLicenseReminderDate(): void {
    const configObj = {
      controllerId: this.schedulerIds.selected,
      accountName: this.authService.currentUserData,
      profileItem: JSON.stringify(this.preferences)
    };
    sessionStorage['preferences'] = configObj.profileItem;
    this.coreService.post('profile/prefs/store', configObj).subscribe();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.subscription4.unsubscribe();
    this.subscription5.unsubscribe();
    this.subscription6.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    LayoutComponent.calculateHeight();
  }

  @HostListener('window:click', ['$event'])
  onClick(): void {
    if (!this.isLogout) {
      this.refreshSession();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onWindowClose() {
    this.popoutService.closePopoutModal();
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
          this.toasterService.error(title, msg);
        }
      });
    });
  }

  logout(timeout: any): void {
    this.popoutService.closePopoutModal();
    if (sessionStorage['$SOS$KEY']) {
      this.oauthService.logOut(sessionStorage['$SOS$KEY']);
      delete sessionStorage['$SOS$KEY'];
    }
    this.isLogout = true;
    if (this.child) {
      this.child.isLogout = true;
    }
    this.coreService.post('authentication/logout', {}).subscribe({
      next: () => {
        this._logout(timeout);
      }, error: () => this._logout(timeout)
    });
  }

  reloadThemeAndLang(preferences: any): void {
    preferences = JSON.parse(sessionStorage['preferences']);
    $('#style-color').attr('href', './styles/' + preferences.theme + '-style.css');
    localStorage['$SOS$THEME'] = preferences.theme;
    localStorage['$SOS$LANG'] = preferences.locale;
    this.translate.setDefaultLang(preferences.locale);
    this.translate.use(preferences.locale);
    if (this.child) {
      this.child.reloadSettings();
    }
  }

  private getComments(flag = false, cb): void {
    if (!this.permission) {
      this.getPermissions(flag);
    }
    if (this.schedulerIds && this.schedulerIds.selected) {
      if (!this.isProfileLoaded) {
        this.isProfileLoaded = true;
        this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData, false);
      }
      this.loadJocProperties(cb);
    } else {
      this.schedulerIds = {};
      this.loadJocProperties(cb);
    }
  }

  private loadJocProperties(cb): void {
    if (!this.isPropertiesLoaded) {
      this.isPropertiesLoaded = true;
      this.coreService.post('joc/properties', {}).subscribe({
        next: (result: any) => {
          this.coreService.setProperties(result);
          if (result.title) {
            document.title = 'JS7: ' + result.title;
          }
          if (result.licenseValidUntil) {
            sessionStorage['licenseValidUntil'] = result.licenseValidUntil;
            setTimeout(() => {
              this.checkLicenseExpireDate();
            }, 1500);
          }

          if (!this.loading) {
            this.init();
          }
          this.isPropertiesLoaded = false;
          if (this.preferences && (sessionStorage['$SOS$FORCELOGING'] === 'true' || sessionStorage['$SOS$FORCELOGING'] === true)) {
            this.preferences.auditLog = true;
          }
          cb();
        }, error: () => {
          this.ngOnInit();
          cb();
        }
      });
    }
  }

  private getPermissions(flag = false): void {
    if (!this.permission) {
      this.coreService.post('authentication/joc_cockpit_permissions', {}).subscribe((permission: any) => {
        permission.currentController = LayoutComponent.setControllerPermission(permission, this.schedulerIds);
        this.authService.setPermission(permission);
        this.authService.save();
        this.permission = permission;
        if (!sessionStorage['preferences']) {
          this.ngOnInit();
        }
        if (this.child) {
          this.child.reloadSettings();
        }
        if (flag) {
          this.loading = true;
        }
        setTimeout(() => {
          if (!this.loading) {
            this.loadInit(false);
          }
        }, 10);
      });
    }
  }

  private getSchedulerIds(): void {
    this.coreService.post('controller/ids', {}).subscribe({
      next: (res: any) => {
        if (res && res.controllerIds && res.controllerIds.length > 0) {
          const ID = localStorage.getItem('$SOS$SELECTEDID');
          if (ID && ID !== 'null' && ID !== res.selected) {
            if (res.controllerIds.length > 0 && res.controllerIds.indexOf(ID) > -1) {
              res.selected = ID;
              this.coreService.post('controller/switch', {controllerId: ID}).subscribe();
            } else {
              localStorage.removeItem('$SOS$SELECTEDID');
            }
          }
          this.authService.setIds(res);
          this.authService.save();
          this.schedulerIds = res;
          this.getComments(false, () => {
          });
        } else {
          const preferences: any = {};
          this.getDefaultPreferences(preferences);
          sessionStorage['preferences'] = JSON.stringify(preferences);
          this.coreService.post('controllers/security_level', {}).subscribe({
            next: (result: any) => {
              this.checkSecurityControllers(result);
            }, error: () => this.checkSecurityControllers(null)
          });
        }
      }, error: (err) => {
        if (err.error && (err.message === 'Access denied' || err.error.message === 'Access denied')) {
          this.getComments(true, () => {
          });
          LayoutComponent.calculateHeight();
        } else {
          this.getComments(false, () => {
            this.router.navigate(['/start-up']).then();
          });
          setTimeout(() => {
            this.loading = true;
          }, 10);
        }
      }
    });
  }

  private checkSecurityControllers(res): void {
    this.getComments(false, () => {
      if (res && res.controllers && res.controllers.length > 0) {
        this.router.navigate(['/controllers']).then();
      } else {
        this.router.navigate(['/start-up']).then();
      }
    });
    setTimeout(() => {
      this.loading = true;
      this.loadInit(false, true);
    }, 10);
  }

  private authenticate(): any {
    if (typeof sessionStorage['logoutUrl'] == 'string') {
      let returnUrl = this.router.url.match(/login/) ? '/' : this.router.url;
      if (returnUrl === '/error' || returnUrl === 'error') {
        returnUrl = '/';
      }
      this.router.navigate(['login'], {queryParams: {returnUrl}}).then();
      return;
    }
    this.coreService.post('authentication/login', {}).subscribe({
      next: (data) => {
        this.authService.setUser(data);
        this.authService.save();
        this.getSchedulerIds();
        if (!this.isChangePasswordPopupOpen && this.authService.currentUserData && (this.authService.forcePasswordChange == true || this.authService.forcePasswordChange == 'true')) {
          this.isChangePasswordPopupOpen = true;
          this.changePassword();
        }
      }, error: () => {
        let returnUrl = this.router.url.match(/login/) ? '/' : this.router.url;
        if (returnUrl === '/error' || returnUrl === 'error') {
          returnUrl = '/';
        }
        this.router.navigate(['login'], {queryParams: {returnUrl}}).then();
      }
    });
  }

  private init(): void {
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
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
        this.router.navigate(['/error']).then();
      }
      if (sessionStorage['preferences'] || isError) {
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
    this.nzConfigService.set('empty', {nzDefaultEmptyContent: this.customTpl});
    setTimeout(() => {
      LayoutComponent.calculateHeight();
    }, 10);
  }

  private changePassword(): void {
    if (!sessionStorage['$SOS$FORCELOGING']) {
      setTimeout(() => {
        this.changePassword()
      }, 50);
      return;
    }
    this.modal.create({
      nzTitle: undefined,
      nzContent: ChangePasswordComponent,
      nzData: {
        username: this.authService.currentUserData,
        identityServiceName: this.authService.currentUserIdentityService.substring(this.authService.currentUserIdentityService.lastIndexOf(':') + 1)
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((result) => {
      this.isChangePasswordPopupOpen = false;
      if (result) {
        this.authService.forcePasswordChange = false;
        this.authService.save();
      } else {
        this.logout(null);
      }
    });
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
      this.router.navigate(['login'], queryParams).then();
    } else {
      localStorage.removeItem('logging');
      this.coreService.setDefaultTab();
      sessionStorage.clear();
      this.router.navigate(['login']).then();
    }
  }

  private refreshSession(): void {
    const inSec = (this.sessionTimeout / 1000 - 1);
    if (!(inSec > 60 && this.count > 60 && ((inSec - this.count) <= 12))) {
      if (!this.isTouch && this.sessionTimeout >= 0) {
        this.isTouch = true;
        this.coreService.post('touch', undefined).subscribe({
          next: res => {
            this.isTouch = false;
            if (res) {
              this.count = inSec;
            }
          }, error: () => this.isTouch = false
        });
      }
    }
  }

  private calculateTime(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      if (!this.preferences || !this.preferences.zone && sessionStorage['preferences']) {
        this.preferences = JSON.parse(sessionStorage['preferences']) || {};
        if (sessionStorage['licenseValidUntil']) {
          this.checkLicenseExpireDate();
        }
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
        } else {
          let currentTime = this.coreService.convertTimeToLocalTZ(this.preferences, new Date()).format('HH:mm:ss');
          if (currentTime === '00:00:00' || currentTime === '00:00:01' || currentTime === '00:00:02') {
            this.dataService.refreshUI('reload');
          }
        }
      }
      this.openStepGuideModal();

    }, 3000);
  }

  private setUserPreferences(preferences: any, configObj: any, reload: boolean): void {
    if (!sessionStorage['preferences']) {
      this.getDefaultPreferences(preferences);
      configObj.profileItem = JSON.stringify(preferences);
      sessionStorage['preferences'] = configObj.profileItem;
      if (this.schedulerIds.selected) {
        this.coreService.post('profile/prefs/store', configObj).subscribe((res: any) => {
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

  private getDefaultPreferences(preferences): void {
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
    preferences.maxLockRecords = 5000;
    preferences.maxBoardRecords = 5000;
    preferences.maxHistoryPerOrder = 10;
    preferences.maxHistoryPerTask = 10;
    preferences.maxAuditLogPerObject = 10;
    preferences.maxFavoriteEntries = 10;
    preferences.tabSize = 4;
    preferences.maxEntryPerPage = '1000';
    preferences.entryPerPage = '25';
    preferences.isNewWindow = 'newWindow';
    preferences.isDocNewWindow = 'newWindow';
    preferences.isXSDNewWindow = 'newWindow';
    preferences.pageView = 'list';
    preferences.orderOverviewPageView = 'list';
    preferences.theme = 'light';
    preferences.headerColor = '';
    preferences.historyTab = 'order';
    preferences.expandOption = 'both';
    preferences.currentController = true;
    preferences.logTimezone = true;
    if (sessionStorage['$SOS$FORCELOGING'] === 'true' || sessionStorage['$SOS$FORCELOGING'] === true) {
      preferences.auditLog = true;
    }
  }

  private setUserObject(preferences: any, conf: any, configObj: any): void {
    if (conf.profileItem) {
      const data = JSON.parse(conf.profileItem);
      if (sessionStorage['$SOS$FORCELOGING'] === 'true' || sessionStorage['$SOS$FORCELOGING'] === true) {
        data.auditLog = true;
      }
      if (!data.maxNotificationRecords) {
        data.maxNotificationRecords = 5000;
      }
      if (!data.maxOrderRecords) {
        data.maxOrderRecords = 5000;
      }
      if (!data.maxDailyPlanRecords) {
        data.maxDailyPlanRecords = 5000;
      }
      if (!data.maxWorkflowRecords) {
        data.maxWorkflowRecords = 5000;
      }
      if (!data.maxFileTransferRecords) {
        data.maxFileTransferRecords = 5000;
      }
      if (!data.maxLockRecords) {
        data.maxLockRecords = 5000;
      }
      if (!data.maxBoardRecords) {
        data.maxBoardRecords = 5000;
      }
      if (!data.maxFavoriteEntries) {
        data.maxFavoriteEntries = 10;
      }
      if (!data.tabSize) {
        data.tabSize = 4;
      }
      if (!data.orderOverviewPageView) {
        data.orderOverviewPageView = 'list';
      }
      sessionStorage['preferences'] = JSON.stringify(data);
      this.reloadThemeAndLang(preferences);
    } else {
      this.setUserPreferences(preferences, configObj, false);
    }
  }

  private getUserProfileConfiguration(id: string, user: string, reload: boolean): void {
    if (id) {
      const configObj = {
        controllerId: id,
        accountName: user
      };
      const preferences: any = {};
      this.coreService.post('profile/prefs', configObj).subscribe({
        next: (res: any) => {
          if (res.profileItem) {
            this.setUserObject(preferences, res, configObj);
            if (reload) {
              this.dataService.refreshUI('reload');
            }
          } else {
            this.setUserPreferences(preferences, configObj, true);
          }
        }, error: () => this.setUserPreferences(preferences, configObj, reload)
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
      if (!sessionStorage['settingId']) {
        sessionStorage['settingId'] = 0;
      }
      this.coreService.post('configurations', configObj).subscribe((res1: any) => {
        if (res1.configurations && res1.configurations.length > 0) {
          sessionStorage['settingId'] = res1.configurations[0].id;
          sessionStorage['clientLogFilter'] = res1.configurations[0].configurationItem;
        } else {
          const clientLogFilter = {
            status: ['info', 'debug', 'error', 'warn'],
            isEnable: false
          };
          sessionStorage['clientLogFilter'] = JSON.stringify(clientLogFilter);
          this.saveSettingConf(true);
        }
      });
    }
  }

  private saveSettingConf(flag: boolean): void {
    if ((sessionStorage['settingId'] || flag) && this.authService.currentUserData) {
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'SETTING',
        id: flag ? 0 : parseInt(sessionStorage['settingId'], 10),
        configurationItem: sessionStorage['clientLogFilter']
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        sessionStorage['settingId'] = res.id;
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
      if ((sessionStorage['welcomeDoNotRemindMe'] && sessionStorage['welcomeDoNotRemindMe'] == 'true')
        || (sessionStorage['welcomeGotIt'] && sessionStorage['welcomeGotIt'] == 'true')) {
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
        nzAutofocus: null,
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
      const request: any = {
        id: configuration.id || 0,
        configurationType: 'GLOBALS',
        configurationItem: JSON.stringify(configuration.configurationItem)
      };
      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }
      this.coreService.post('configuration/save', request).subscribe(() => {
        sessionStorage['welcomeDoNotRemindMe'] = true;
        sessionStorage['welcomeGotIt'] = true;
      });
    });
  }
}
