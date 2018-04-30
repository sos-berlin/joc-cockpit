import { Component, OnInit,OnDestroy, ViewChild} from '@angular/core';
import { CoreService } from '../../services/core.service';
import { DataService } from '../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';
import { AuthService } from '../../components/guard/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from "ng2-translate";
import {ToasterService} from "angular2-toaster";

import * as jstz from 'jstz';
declare var $:any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  host: {
    '(window:resize)': 'onResize()',
    '(window:click)': 'onClick()'
  }
})
export class LayoutComponent implements OnInit, OnDestroy {

  preferences: any = {};
  schedulerIds: any = {};
  permission: any = {};
  selectedScheduler: any = {};
  scheduleState: string = '';
  selectedJobScheduler: any = {};
  currentTime = new Date();
  interval: any;
  remainingSessionTime: any;
  isTouch: boolean = false;
  count: number = 0;
  subscription1: Subscription;
  subscription2: Subscription;
  isLogout: boolean = false;

  @ViewChild(HeaderComponent) child;

  constructor(private coreService: CoreService, private route: ActivatedRoute, private authService: AuthService, private router: Router, private dataService: DataService, public translate: TranslateService, private toasterService: ToasterService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.switchSchedulerAnnounced$.subscribe(res => {
      this.changeScheduler(res);
    });
    let evn: any;
    router.events.subscribe(e => {
      evn = e;
      if (evn.url) {
        LayoutComponent.calculateHeight();
        if (evn.url === '/resources') {
          this.router.navigate(['/resources/agent_cluster']);
        }
      }
    });
  }

  refresh(args) {
    if (args && args.length) {
      for (let i = 0; i < args.length; i++) {
        if (args[i].jobschedulerId == this.schedulerIds.selected) {
          if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
            for (let j = 0; j < args[i].eventSnapshots.length; j++) {
              if (args[i].eventSnapshots[j].eventType === "SchedulerStateChanged") {
                this.loadScheduleDetail();
                break;
              } else if (args[i].eventSnapshots[j].eventType === "CurrentJobSchedulerChanged") {
                this.getScheduleDetail(true);
                break;
              }
            }
          }
          break
        }
      }
    }
  }


  ngOnInit() {
    if (this.router.url === '/') {
      if (localStorage.$SOS$URL) {
        this.router.navigate([localStorage.$SOS$URL]);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }

    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    }
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    this.permission = JSON.parse(this.authService.permission);
    this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData);
    this.count = parseInt(this.authService.sessionTimeout) / 1000;
    this.loadScheduleDetail();
    this.calculateTime();
    LayoutComponent.calculateHeight();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  static calculateHeight() {
    let headerHt = $('.fixed-top').height() || 70;
    $('.app-body').css('margin-top', headerHt + 'px');
  }

  static checkNavHeader() {
    let dom = $('#navbar1');
    if (dom && dom.hasClass('in')) {
      dom.removeClass('in');
      $('a.navbar-item').addClass('collapsed');
    }
  }

  onResize() {
    LayoutComponent.calculateHeight();
    LayoutComponent.checkNavHeader();
  }

  onClick() {
    if (!this.isLogout)
      this.refreshSession();
  }

  private refreshSession() {
    if (!this.isTouch) {
      this.isTouch = true;
      this.coreService.post('touch', {}).subscribe(res => {
        this.isTouch = false;
        if (res)
          this.count = parseInt(this.authService.sessionTimeout) / 1000 - 1;
      }, () => {
        this.isTouch = false;
      });
    }
  }

  private calculateTime() {
    this.interval = setInterval(() => {
      --this.count;
      this.currentTime = new Date();
      let s = Math.floor((this.count) % 60),
        m = Math.floor((this.count / (60)) % 60),
        h = Math.floor((this.count / (60 * 60)) % 24),
        d = Math.floor(this.count / (60 * 60 * 24));


      let x = m > 9 ? m : '0' + m;
      let y = s > 9 ? s : '0' + s;

      if (d == 0 && h != 0) {
        this.remainingSessionTime = h + 'h ' + x + 'm ' + y + 's';
      } else if (d == 0 && h == 0 && m != 0) {
        this.remainingSessionTime = x + 'm ' + y + 's';
      } else if (d == 0 && h == 0 && m == 0) {
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
    if (sessionStorage.preferenceId == 0) {
      let timezone = jstz.determine();
      if (timezone)
        preferences.zone = timezone.name() || this.selectedJobScheduler.timeZone;
      else {
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
      if (sessionStorage.$SOS$FORCELOGING === 'true' || sessionStorage.$SOS$FORCELOGING == true)
        preferences.auditLog = true;
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
      })
    }
  }

  private setUserObject(preferences, res, configObj) {
    if (res.configuration && res.configuration.configurationItem) {
      sessionStorage.preferences = JSON.parse(JSON.stringify(res.configuration.configurationItem));
      preferences = JSON.parse(sessionStorage.preferences);
      $('#style-color').attr('href', './styles/' + preferences.theme + '-style.css');
      localStorage.$SOS$THEME = preferences.theme;
      if (preferences.theme == 'lighter') {
        $('#orders_id img').attr("src", './assets/images/order.png');
        $('#jobs_id img').attr("src", './assets/images/job.png');
        $('#dailyPlan_id img').attr("src", './assets/images/daily_plan1.png');
        $('resources_id img').attr("src", './assets/images/resources1.png');
      } else {
        $('#orders_id img').attr("src", './assets/images/order1.png');
        $('#jobs_id img').attr("src", './assets/images/job1.png');
        $('#dailyPlan_id img').attr("src", './assets/images/daily_plan.png');
        $('#resources_id img').attr("src", './assets/images/resources.png');
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
    let configObj = {
      jobschedulerId: id,
      account: user,
      configurationType: "PROFILE"
    };
    let preferences = {};
    this.coreService.post('configurations', configObj).subscribe(res1 => {
      sessionStorage.preferenceId = 0;
      this.setUserProfileConfiguration(configObj, preferences, res1, id);
    }, (err) => {
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
    if (this.selectedScheduler && this.selectedScheduler.scheduler)
      document.title = this.selectedScheduler.scheduler.host + ':' + this.selectedScheduler.scheduler.port + '/' + this.selectedScheduler.scheduler.jobschedulerId;
    sessionStorage.$SOS$JOBSCHEDULE = JSON.stringify(this.selectedJobScheduler);
    if (this.selectedJobScheduler && this.selectedJobScheduler.state)
      this.scheduleState = this.selectedJobScheduler.state._text;
    if (this.selectedJobScheduler && this.selectedJobScheduler.clusterType)
      this.permission.precedence = this.selectedJobScheduler.clusterType.precedence;
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

  getScheduleDetail(refresh: boolean): void {
    this.coreService.post('jobscheduler/p', {jobschedulerId: this.schedulerIds.selected}).subscribe(result => {
      this.getVolatileData(result, refresh);
    }, error => {
      this.getVolatileData(null, refresh);
    });
  }

  loadScheduleDetail() {
    if (sessionStorage.$SOS$JOBSCHEDULE && sessionStorage.$SOS$JOBSCHEDULE != 'null') {
      this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE);
      if (this.selectedJobScheduler && this.selectedJobScheduler.state)
        this.scheduleState = this.selectedJobScheduler.state._text;
      this.selectedScheduler.scheduler = this.selectedJobScheduler;
      if (this.selectedScheduler && this.selectedScheduler.scheduler)
        document.title = this.selectedScheduler.scheduler.host + ':' + this.selectedScheduler.scheduler.port + '/' + this.selectedScheduler.scheduler.jobschedulerId;
    } else if (this.schedulerIds.selected) {
      this.getScheduleDetail(false);
    }
  }

  private reloadUI() {
    this.getScheduleDetail(true);
    this.child.reloadSettings();
    this.preferences = JSON.parse(sessionStorage.preferences);
    this.permission = JSON.parse(this.authService.permission);
  }

  changeScheduler(jobScheduler) {
    this.child.switchScheduler = true;
    this.schedulerIds.selected = jobScheduler;
    this.coreService.post('jobscheduler/switch', {jobschedulerId: this.schedulerIds.selected}).subscribe((permission) => {

      this.coreService.post('jobscheduler/ids', {}).subscribe((res) => {
        if (res) {
          this.coreService.setDefaultTab();
          this.authService.setIds(res);
          this.authService.save();

          if (this.router.url.match('job_chain_detail/')) {
            this.router.navigate(['/dashboard'], {queryParams: {}});
          } else {
            this.reloadUI();
          }
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
    })
  }

  logout(timeout) {
    this.isLogout = true;
    this.coreService.post('security/logout', {}).subscribe((res) => {
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
}
