import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isEmpty} from 'underscore';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../guard';
import {DataService} from '../../services/data.service';
import {AboutModalComponent} from '../info-menu/info-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  preferences: any = {};
  schedulerIds: any = {};
  permission: any = {};
  username = '';
  showViews: any = {};
  eventId: string;
  eventLoading = false;
  switchScheduler = false;
  isLogout = false;
  isBackUp = '';
  timeout: any;
  jocMonitor = [];
  systemMonitor = [];
  subscription1: Subscription;
  subscription2: Subscription;

  @Output() myLogout: EventEmitter<any> = new EventEmitter();

  constructor(public coreService: CoreService, private authService: AuthService,
              private modal: NzModalService, private router: Router, private dataService: DataService) {
    this.subscription1 = dataService.isProfileReload.subscribe(res => {
      if (res) {
        this.init();
      }
    });
    this.subscription2 = dataService.isThemeReload.subscribe(res => {
      if (res) {
        this.preferences = JSON.parse(sessionStorage.preferences);
      }
    });
  }

  ngOnInit(): void {
    this.init();
  }

  private init(): void {
    this.reloadSettings();
    if (this.schedulerIds && this.schedulerIds.selected) {
      this.getEvents();
    }
    if (sessionStorage.showViews) {
      const showViews = JSON.parse(sessionStorage.showViews);
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
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    if (!this.isBackUp) {
      this.isJocActive();
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
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

  logout(): void {
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
              if (res.eventSnapshots[j].eventType === 'JOCStateChanged') {
                this.isJocActive();
                break;
              }
            }

            for (let j = 0; j < res.eventsFromMonitoring.length; j++) {
              if (res.eventsFromMonitoring[j].category && res.eventsFromMonitoring[j].category.toLowerCase() === 'joc') {
                this.jocMonitor.push(res.eventsFromMonitoring[j]);
                if(this.jocMonitor.length > 10){
                  this.jocMonitor.slice(this.jocMonitor.length - 10);
                }
              } else {
                this.systemMonitor.push(res.eventsFromMonitoring[j]);
                if(this.systemMonitor.length > 10){
                  this.systemMonitor.slice(this.systemMonitor.length - 10);
                }
              }
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
    const dom = document.getElementById('navbarId');
    if (dom && dom.classList.contains('in')) {
      dom.classList.remove('in');
    } else {
      dom.classList.add('in');
    }
  }
}
