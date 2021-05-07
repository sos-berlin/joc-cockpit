import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isEmpty} from 'underscore';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../guard';
import {DataService} from '../../services/data.service';
import {AboutModalComponent} from '../about-modal/about.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  preferences: any = {};
  schedulerIds: any = {};
  permission: any = {};
  username = '';
  showViews: any = {};
  timeout: any;
  eventId: string;
  eventLoading = false;
  switchScheduler = false;
  isLogout = false;
  selectedController: any;
  subscription: Subscription;

  @Output() myLogout: EventEmitter<any> = new EventEmitter();

  constructor(public coreService: CoreService, private authService: AuthService,
              private modal: NzModalService, private router: Router, private dataService: DataService) {
    this.subscription = dataService.isProfileReload.subscribe(res => {
      if (res) {
        this.init();
      }
    });
  }

  ngOnInit(): void {
    this.init();
  }

  private init(): void {
    this.reloadSettings();
    this.getSelectedSchedulerInfo();
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

  getSelectedSchedulerInfo(): void {
    if (sessionStorage.$SOS$CONTROLLER && JSON.parse(sessionStorage.$SOS$CONTROLLER)) {
      this.selectedController = JSON.parse(sessionStorage.$SOS$CONTROLLER) || {};
    }
    if (isEmpty(this.selectedController)) {
      const interval = setInterval(() => {
        if (sessionStorage.$SOS$CONTROLLER && JSON.parse(sessionStorage.$SOS$CONTROLLER)) {
          this.selectedController = JSON.parse(sessionStorage.$SOS$CONTROLLER) || {};
          if (!isEmpty(this.selectedController)) {
            clearInterval(interval);
          }
        }
      }, 100);
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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    clearTimeout(this.timeout);
  }

  about(): any {
    this.modal.create({
      nzTitle: null,
      nzContent: AboutModalComponent,
      nzFooter: null,
      nzClosable: false
    });
  }

  logout(): void {
    this.isLogout = true;
    this.myLogout.emit();
  }

  switchSchedulerController(): void {
    this.getSelectedSchedulerInfo();
  }

  navigateToResource(): void {
    const resourceFilters = this.coreService.getResourceTab();
    if (resourceFilters.state === 'agent') {
      if (this.permission.currentController.agents.view) {
        this.router.navigate(['/resources/agents']);
        return;
      } else {
        resourceFilters.state = 'agentJobExecutions';
      }
    }
    if (resourceFilters.state === 'agentJobExecutions') {
      if (this.permission.currentController.agents.view) {
        this.router.navigate(['/resources/agent_job_executions']);
        return;
      } else {
        resourceFilters.state = 'locks';
      }
    }
    if (resourceFilters.state === 'locks') {
      if (this.permission.currentController.locks.view) {
        this.router.navigate(['/resources/locks']);
        return;
      } else {
        resourceFilters.state = 'calendars';
      }
    }
    if (resourceFilters.state === 'calendars') {
      if (this.permission.joc.calendars.view) {
        this.router.navigate(['/resources/calendars']);
        return;
      } else {
        resourceFilters.state = 'documentations';
      }
    }
    if (resourceFilters.state === 'documentations') {
      if (this.permission.joc.documentations.view) {
        this.router.navigate(['/resources/documentations']);
        return;
      }
    }
  }

  navigateToConfiguration(): void {
    const confFilters = this.coreService.getConfigurationTab();
    if (confFilters.state === 'inventory') {
      if (this.permission.joc.inventory.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
        return;
      } else {
        confFilters.state = 'file_transfer';
      }
    }
    if (confFilters.state === 'file_transfer') {
      if (this.permission.joc.fileTransfer.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
        return;
      } else {
        confFilters.state = 'notification';
      }
    }
    if (confFilters.state === 'notification') {
      if (this.permission.joc.notification.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
        return;
      } else {
        confFilters.state = 'other';
      }
    }
    if (confFilters.state === 'other') {
      if (this.permission.joc.others.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
      }
    }
  }

  getEvents(): void {
    if (!this.schedulerIds.selected || this.isLogout) {
      return;
    }
    if (!this.eventLoading) {
      this.eventLoading = true;
      let obj = {
        controllerId: this.schedulerIds.selected,
        eventId: this.eventId
      };
      this.coreService.post('events', obj).subscribe((res: any) => {
        if (!this.switchScheduler && !this.isLogout) {
          this.eventId = res.eventId;
          this.dataService.announceEvent(res);
        }
        if (!this.isLogout) {
          this.eventLoading = false;
          this.getEvents();
        }
        this.switchScheduler = false;
      }, (err) => {
        if (!this.isLogout && err) {
          this.timeout = setTimeout(() => {
            this.eventLoading = false;
            this.getEvents();
            clearTimeout(this.timeout);
          }, 1000);
        }
      });
    }
  }
}
