import {Component, HostListener, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../components/guard';
import {HeaderComponent} from '../../components/header/header.component';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from 'rxjs';
import * as jstz from 'jstz';

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
  selectedJobScheduler: any = {};
  remainingSessionTime: any = {};
  interval: any;
  tabsMap = new Map();
  scheduleState: string;
  currentTime = new Date();
  subscription1: any = Subscription;
  subscription2: any = Subscription;
  isLogout = false;
  isTouch = false;
  count = 0;

  @ViewChild(HeaderComponent) child;

  constructor(private coreService: CoreService, private route: ActivatedRoute, private authService: AuthService, private router: Router,
              private dataService: DataService, public translate: TranslateService, private toasterService: ToasterService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.switchSchedulerAnnounced$.subscribe(res => {
      this.changeScheduler(res);
    });

    router.events.subscribe((e: any) => {
      if (e.url) {
        LayoutComponent.calculateHeight();
      }
    });
  }

  static calculateHeight() {
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
        if (args[i].jobschedulerId === this.schedulerIds.selected) {
          if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
            for (let j = 0; j < args[i].eventSnapshots.length; j++) {
              if (args[i].eventSnapshots[j].eventType === 'SchedulerStateChanged') {
                this.loadScheduleDetail();
                break;
              } else if (args[i].eventSnapshots[j].eventType === 'CurrentJobSchedulerChanged') {
                this.getScheduleDetail(true);
                break;
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
    this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData);
    this.count = parseInt(this.authService.sessionTimeout, 10) / 1000;
    this.loadScheduleDetail();
    this.calculateTime();
    LayoutComponent.calculateHeight();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
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

  getScheduleDetail(refresh: boolean): void {
    this.coreService.post('jobscheduler/p', {jobschedulerId: this.schedulerIds.selected}).subscribe(result => {
      this.getVolatileData(result, refresh);
    }, () => {
      this.getVolatileData(null, refresh);
    });
  }

  loadScheduleDetail() {
    if (sessionStorage.$SOS$JOBSCHEDULE && sessionStorage.$SOS$JOBSCHEDULE !== 'null') {
      this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE);
      if (this.selectedJobScheduler && this.selectedJobScheduler.state) {
        this.scheduleState = this.selectedJobScheduler.state._text;
      }
      this.selectedScheduler.scheduler = this.selectedJobScheduler;
      if (this.selectedScheduler && this.selectedScheduler.scheduler) {
        document.title = this.selectedScheduler.scheduler.host + ':' +
          this.selectedScheduler.scheduler.port + '/' + this.selectedScheduler.scheduler.jobschedulerId;
      }
    } else if (this.schedulerIds && this.schedulerIds.selected) {
      this.getScheduleDetail(false);
    }
  }

  changeScheduler(jobScheduler) {
    this.child.switchScheduler = true;
    this.schedulerIds.selected = jobScheduler;
    const key = this.schedulerIds.selected;
    this.tabsMap.set(key, JSON.stringify(this.coreService.getTabs()));
    this.coreService.post('jobscheduler/switch', {jobschedulerId: this.schedulerIds.selected}).subscribe(() => {

      this.coreService.post('jobscheduler/ids', {}).subscribe((res) => {
        if (res) {
          let previousData = this.tabsMap.get(jobScheduler);
          if (previousData) {
            previousData = JSON.parse(previousData);
            this.coreService.setTabs(previousData);
          } else {
            this.coreService.setDefaultTab();
          }
          this.authService.setIds(res);
          this.authService.setPermissions(jobScheduler);
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
      this.authService.clearUser();
      this.authService.clearStorage();
      if (timeout) {
        localStorage.setItem('clientLogs', null);
        sessionStorage.setItem('$SOS$JOBSCHEDULE', null);
        sessionStorage.setItem('$SOS$ALLEVENT', null);
        this.router.navigate(['/login']);
      } else {
        this.coreService.setDefaultTab();
        localStorage.removeItem('$SOS$URL');
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }

    });
  }

  private refreshSession() {
    if (!this.isTouch) {
      this.isTouch = true;
      this.coreService.post('touch', {}).subscribe(res => {
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
        localStorage.$SOS$URL = this.router.url;
        this.isLogout = true;
        this.logout('timeout');
      }

    }, 1000);
  }

  private setUserPreferences(preferences, configObj) {
    if (sessionStorage.preferenceId === 0) {
      const timezone = jstz.determine();
      if (timezone) {
        preferences.zone = timezone.name() || this.selectedJobScheduler.timeZone;
      } else {
        preferences.zone = this.selectedJobScheduler.timeZone;
      }
      preferences.locale = 'en';
      preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
      preferences.maxRecords = 10000;
      preferences.maxAuditLogRecords = 10000;
      preferences.maxHistoryPerOrder = 30;
      preferences.maxHistoryPerTask = 10;
      preferences.maxHistoryPerJobchain = 30;
      preferences.maxOrderPerJobchain = 5;
      preferences.maxAuditLogPerObject = 10;
      preferences.maxEntryPerPage = '1000';
      preferences.entryPerPage = '10';
      preferences.isNewWindow = 'newWindow';
      preferences.pageView = 'list';
      preferences.theme = 'light';
      preferences.historyView = 'current';
      preferences.adtLog = 'current';
      preferences.agentTask = 'current';
      preferences.fileTransfer = 'current';
      preferences.showTasks = true;
      preferences.showOrders = false;
      if (sessionStorage.$SOS$FORCELOGING === 'true' || sessionStorage.$SOS$FORCELOGING === true) {
        preferences.auditLog = true;
      }
      preferences.events = {};

      preferences.events.filter = ['JobChainStopped', 'OrderStarted', 'OrderSetback', 'OrderSuspended'];
      preferences.events.taskCount = 0;
      preferences.events.jobCount = 0;
      preferences.events.jobChainCount = 1;
      preferences.events.positiveOrderCount = 1;
      preferences.events.negativeOrderCount = 2;
      configObj.configurationItem = JSON.stringify(preferences);

      configObj.id = 0;
      sessionStorage.preferences = configObj.configurationItem;
      this.coreService.post('configuration/save', configObj).subscribe(res => {
        sessionStorage.preferenceId = res;
      });
    }
  }

  private setUserObject(preferences, res, configObj) {
    if (res.configuration && res.configuration.configurationItem) {
      sessionStorage.preferences = JSON.parse(JSON.stringify(res.configuration.configurationItem));
      preferences = JSON.parse(sessionStorage.preferences);
      $('#style-color').attr('href', './styles/' + preferences.theme + '-style.css');
      localStorage.$SOS$THEME = preferences.theme;
      $('#headerColor').addClass(preferences.headerColor);
      localStorage.$SOS$MENUTHEME = preferences.headerColor;
      $('#avatarBg').addClass(preferences.avatarColor);
      localStorage.$SOS$AVATARTHEME = preferences.avatarColor;
      if ($('#dailyPlan_id img')) {
        if (preferences.theme === 'lighter') {
          $('#jobs_id img').attr('src', './assets/images/job.png');
          $('#dailyPlan_id img').attr('src', './assets/images/daily_plan1.png');
          $('#resources_id img').attr('src', './assets/images/resources1.png');
        } else {
          $('#jobs_id img').attr('src', './assets/images/job1.png');
          $('#dailyPlan_id img').attr('src', './assets/images/daily_plan.png');
          $('#resources_id img').attr('src', './assets/images/resources.png');
        }
      }
      localStorage.$SOS$LANG = preferences.locale;
      this.translate.setDefaultLang(preferences.locale);
      this.translate.use(preferences.locale);
    } else {
      this.setUserPreferences(preferences, configObj);
    }
  }

  private setUserProfileConfiguration(configObj, preferences, res1, id) {
    if (res1.configurations && res1.configurations.length > 0) {
      sessionStorage.preferenceId = res1.configurations[0].id;
      this.coreService.post('configuration', {
        jobschedulerId: id,
        id: sessionStorage.preferenceId
      }).subscribe(res => {
        this.setUserObject(preferences, res, configObj);

      }, (err) => {
        this.setUserPreferences(preferences, configObj);
      });
    } else {
      this.setUserPreferences(preferences, configObj);
    }
  }

  private getUserProfileConfiguration(id, user) {
    const configObj = {
      jobschedulerId: id,
      account: user,
      configurationType: 'PROFILE'
    };
    const preferences = {};
    this.coreService.post('configurations', configObj).subscribe(res1 => {
      sessionStorage.preferenceId = 0;
      this.setUserProfileConfiguration(configObj, preferences, res1, id);
    }, () => {
      this.setUserPreferences(preferences, configObj);
    });
  }

  private mergeData(result, res) {

    if (!result && !res) {
      return;
    }
    if (res) {
      res.jobscheduler.os = result.jobscheduler.os;
      res.jobscheduler.timeZone = result.jobscheduler.timeZone;
      this.selectedJobScheduler = res.jobscheduler;
    } else {
      this.selectedJobScheduler = result.jobscheduler;
    }
    this.selectedScheduler.scheduler = this.selectedJobScheduler;
    if (this.selectedScheduler && this.selectedScheduler.scheduler) {
      document.title = this.selectedScheduler.scheduler.host + ':' +
        this.selectedScheduler.scheduler.port + '/' + this.selectedScheduler.scheduler.jobschedulerId;
    }
    sessionStorage.$SOS$JOBSCHEDULE = JSON.stringify(this.selectedJobScheduler);
    if (this.selectedJobScheduler && this.selectedJobScheduler.state) {
      this.scheduleState = this.selectedJobScheduler.state._text;
    }
    if (this.selectedJobScheduler && this.selectedJobScheduler.clusterType) {
      this.permission.precedence = this.selectedJobScheduler.clusterType.precedence;
    }
  }

  private getVolatileData(result: any, flag: boolean): void {
    this.coreService.post('jobscheduler', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
      this.mergeData(result, res);
      if (flag) {
        this.dataService.refreshUI('reload');
      }
    }, (err) => {
      this.mergeData(result, null);
      if (flag) {
        this.dataService.refreshUI('reload');
      }
    });
  }

  private reloadUI() {
    this.getScheduleDetail(true);
    this.child.reloadSettings();
    this.preferences = JSON.parse(sessionStorage.preferences);
    this.permission = JSON.parse(this.authService.permission);
  }
}
