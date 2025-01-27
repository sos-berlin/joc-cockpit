import {Component, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isEmpty} from 'underscore';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../guard';
import {DataService} from '../../services/data.service';
import {AboutModalComponent} from '../info-menu/info-menu.component';
import { KioskService } from '../../services/kiosk.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  preferences: any = {};
  schedulerIds: any = {};
  permission: any = {};
  username = '';
  showViews: any = {};
  eventId: string | undefined;
  eventLoading = false;
  switchScheduler = false;
  isLogout = false;
  colorOfJOCEvent = 0;
  colorOfSystemEvent = 0;
  isBackUp = '';
  timeout: any;
  jocMonitor = [];
  systemMonitor = [];
  problemEvent: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  @Output() myLogout: EventEmitter<any> = new EventEmitter();

  constructor(public coreService: CoreService, private authService: AuthService,
              private modal: NzModalService, private router: Router, private dataService: DataService, private kioskService: KioskService) {
    this.subscription1 = dataService.isProfileReload.subscribe(res => {
      if (res) {
        this.init();
      }
    });
    this.subscription2 = dataService.isThemeReload.subscribe(res => {
      if (res) {
        this.preferences = JSON.parse(sessionStorage['preferences']);
      }
    });
    this.subscription3 = dataService.functionAnnounced$.subscribe(res => {
      if (res) {
        if(res){
          this.isBackUp = res;
        }
      }
    });
  }

  ngOnInit(): void {
    if (sessionStorage['$SOS$JOCMONITOR']) {
      this.jocMonitor = JSON.parse(sessionStorage['$SOS$JOCMONITOR']);
    }
    if (sessionStorage['$SOS$SYSTEMMONITOR']) {
      this.systemMonitor = JSON.parse(sessionStorage['$SOS$SYSTEMMONITOR']);
    }
    if (sessionStorage['$SOS$NODELOSS']) {
      this.problemEvent = JSON.parse(sessionStorage['$SOS$NODELOSS']);
    }
    this.init();
  }

  private init(): void {
    this.reloadSettings();
    if (!this.isBackUp) {
      this.isJocActive();
    }
    if (this.schedulerIds && this.schedulerIds.selected) {
      this.getEvents();
    }
    if (sessionStorage['showViews']) {
      const showViews = JSON.parse(sessionStorage['showViews']);
      if (!isEmpty(showViews)) {
        this.showViews = showViews;
      }
    }
  }

  reloadSettings(): void {
    this.username = this.authService.currentUserData;
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    }
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    if (!this.isBackUp) {
      this.isJocActive();
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.modal.closeAll();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  about(): any {
    this.modal.create({
      nzTitle: undefined,
      nzContent: AboutModalComponent,
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  clearProblemEvent(): void {
    setTimeout(() => {
      this.problemEvent = {};
      sessionStorage.removeItem('$SOS$NODELOSS');
    }, 250);
  }

  clearJocEvent(): void {
    this.jocMonitor = [];
    sessionStorage.removeItem('$SOS$JOCMONITOR')
  }

  clearSystemEvent(): void {
    this.systemMonitor = [];
    sessionStorage.removeItem('$SOS$SYSTEMMONITOR')
  }

  resetJOCEvent(): void {
    this.colorOfJOCEvent = 0;
  }

  resetSystemEvent(): void {
    this.colorOfSystemEvent = 0;
  }

  navToOrderNoti(index: number, data: any): void {
    let filter = this.coreService.getMonitorTab();
    filter.tabIndex = index;
    if (index == 2) {
      filter.orderNotification.filter.types = [data.level];
    } else {
      filter.systemNotification.filter.categories = data.category;
      filter.systemNotification.filter.types = [data.level];
    }
    this.router.navigate(['/monitor']).then();
  }

  logout(): void {
    if (this.permission.roles[0] === 'kiosk') {
      this.kioskService.stopKioskMode();
    }
    this.isLogout = true;
    this.myLogout.emit();
  }

  navigateToResource(): void {
    const resourceFilters = this.coreService.getResourceTab();
    if (resourceFilters.state === 'agent') {
      if (this.permission.currentController.agents.view) {
        this.router.navigate(['/resources/agents']).then();
        return;
      } else {
        resourceFilters.state = 'agentJobExecutions';
      }
    }
    if (resourceFilters.state === 'agentJobExecutions') {
      if (this.permission.currentController.agents.view) {
        this.router.navigate(['/resources/agent_job_executions']).then();
        return;
      } else {
        resourceFilters.state = 'locks';
      }
    }
    if (resourceFilters.state === 'locks') {
      if (this.permission.currentController.locks.view) {
        this.router.navigate(['/resources/locks']).then();
        return;
      } else {
        resourceFilters.state = 'boards';
      }
    }
    if (resourceFilters.state === 'boards') {
      if (this.permission.currentController.noticeBoards.view) {
        this.router.navigate(['/resources/boards']).then();
        return;
      } else {
        resourceFilters.state = 'calendars';
      }
    }
    if (resourceFilters.state === 'calendars') {
      if (this.permission.joc.calendars.view) {
        this.router.navigate(['/resources/calendars']).then();
        return;
      } else {
        resourceFilters.state = 'documentations';
      }
    }
    if (resourceFilters.state === 'documentations') {
      if (this.permission.joc.documentations.view) {
        this.router.navigate(['/resources/documentations']).then();
        return;
      }
    }
  }

  navigateToConfiguration(): void {
    const confFilters = this.coreService.getConfigurationTab();
    if (confFilters.state === 'inventory') {
      if (this.permission.joc.inventory.view) {
        this.router.navigate(['/configuration/' + confFilters.state]).then();
        return;
      } else {
        confFilters.state = 'file_transfer';
      }
    }
    if (confFilters.state === 'file_transfer') {
      if (this.permission.joc.fileTransfer.view) {
        this.router.navigate(['/configuration/' + confFilters.state]).then();
        return;
      } else {
        confFilters.state = 'notification';
      }
    }
    if (confFilters.state === 'notification') {
      if (this.permission.joc.notification.view) {
        this.router.navigate(['/configuration/' + confFilters.state]).then();
        return;
      } else {
        confFilters.state = 'other';
      }
    }
    if (confFilters.state === 'other') {
      if (this.permission.joc.others.view) {
        this.router.navigate(['/configuration/' + confFilters.state]).then();
      }
    }
  }

  private isJocActive(): void {
    this.coreService.post('joc/is_active', {}).subscribe((res: any) => {
      this.isBackUp = res.ok ? 'NO' : 'YES';
      sessionStorage['$SOS$ISJOCACTIVE'] = res.ok ? 'YES' : 'NO';
    });
  }

  getEvents(): void {
    if (!this.schedulerIds.selected || this.isLogout) {
      return;
    }
    if (!this.eventLoading) {
      this.eventLoading = true;
      const obj = {
        controllerId: this.schedulerIds.selected,
        eventId: this.eventId
      };
      this.coreService.post('events', obj).subscribe({
        next: (res: any) => {
          if (!this.switchScheduler && !this.isLogout) {
            this.eventId = res.eventId;
            this.dataService.announceEvent(res);
            for (let j = 0; j < res.eventSnapshots.length; j++) {
              if (res.eventSnapshots[j].eventType === 'ControllerStateChanged' ||
                res.eventSnapshots[j].eventType === 'JOCStateChanged' ||
                res.eventSnapshots[j].eventType === 'ProxyCoupled' ||
                res.eventSnapshots[j].eventType === 'ProxyDecoupled') {
                this.isJocActive();
              } else if (res.eventSnapshots[j].eventType === 'NodeLossProblemEvent') {
                res.eventSnapshots[j].date = parseInt(this.eventId) * 1000;
                this.problemEvent = res.eventSnapshots[j];
                sessionStorage['$SOS$NODELOSS'] = JSON.stringify(res.eventSnapshots[j]);
              }
            }

            for (let j = 0; j < res.eventsFromOrderMonitoring.length; j++) {
              this.colorOfJOCEvent = res.eventsFromOrderMonitoring[j].level === 'ERROR' ? 2 : this.colorOfJOCEvent == 2 ? 2 : 1;
              this.jocMonitor.push(res.eventsFromOrderMonitoring[j]);
              if (this.jocMonitor.length > 10) {
                this.jocMonitor.shift();
              }
            }
            for (let j = 0; j < res.eventsFromSystemMonitoring.length; j++) {
              this.colorOfSystemEvent = res.eventsFromSystemMonitoring[j].level === 'ERROR' ? 2 : this.colorOfSystemEvent == 2 ? 2 : 1;
              this.systemMonitor.push(res.eventsFromSystemMonitoring[j]);
              if (this.systemMonitor.length > 10) {
                this.systemMonitor.shift();
              }
            }
            if (this.jocMonitor.length > 0) {
              sessionStorage['$SOS$JOCMONITOR'] = JSON.stringify(this.jocMonitor);
            }
            if (this.systemMonitor.length > 0) {
              sessionStorage['$SOS$SYSTEMMONITOR'] = JSON.stringify(this.systemMonitor);
            }
          }
          if (!this.isLogout) {
            this.timeout = setTimeout(() => {
              this.eventLoading = false;
              this.getEvents();
            }, 100);
          }
          this.switchScheduler = false;
        }, error: (err) => {
          if (!this.isLogout && err) {
            if (err.status == 420 && err.error && err.error.error && err.error.error.message.match(/ExpiredSessionException/)) {

            } else {
              this.timeout = setTimeout(() => {
                this.eventLoading = false;
                this.getEvents();
              }, 1000);
            }
          }
        }
      });
    }
  }

  toggle(): void {
    const dom: any = document.getElementById('navbarId');
    if (dom && dom.classList.contains('in')) {
      dom.classList.remove('in');
    } else {
      dom.classList.add('in');
    }
  }
}
