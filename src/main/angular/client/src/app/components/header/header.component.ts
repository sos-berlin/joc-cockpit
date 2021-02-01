import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import * as _ from 'underscore';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../guard';
import {DataService} from '../../services/data.service';

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
  timeout: any;
  eventId: string;
  eventLoading = false;
  switchScheduler = false;
  eventsRequest: any = [];
  events: any = [];
  isLogout = false;
  showEvent = false;
  selectedController: any;
  subscription: Subscription;

  @Output() myLogout: EventEmitter<any> = new EventEmitter();

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private dataService: DataService) {
    this.subscription = dataService.isProfileReload.subscribe(res => {
      if (res) {
        this.init();
      }
    });
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.username = this.authService.currentUserData;
    this.reloadSettings();
    this.getSelectedSchedulerInfo();
    if (this.schedulerIds && this.schedulerIds.controllerIds && this.schedulerIds.controllerIds.length > 0) {
      this.getEvents(this.schedulerIds.controllerIds);
    }
  }

  getSelectedSchedulerInfo() {
    if (sessionStorage.$SOS$CONTROLLER && JSON.parse(sessionStorage.$SOS$CONTROLLER)) {
      this.selectedController = JSON.parse(sessionStorage.$SOS$CONTROLLER) || {};
    }
    if (_.isEmpty(this.selectedController)) {
      const interval = setInterval(() => {
        if (sessionStorage.$SOS$CONTROLLER && JSON.parse(sessionStorage.$SOS$CONTROLLER)) {
          this.selectedController = JSON.parse(sessionStorage.$SOS$CONTROLLER) || {};
          if (!_.isEmpty(this.selectedController)) {
            clearInterval(interval);
          }
        }
      }, 100);
    }
  }

  reloadSettings() {
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }

  logout() {
    this.isLogout = true;
    this.myLogout.emit();
  }

  switchSchedulerController() {
    this.getSelectedSchedulerInfo();
  }

  navigateToResource() {
    const resourceFilters = this.coreService.getResourceTab();
    if (resourceFilters.state === 'agent') {
      if (this.permission.JS7UniversalAgent.view.status) {
        this.router.navigate(['/resources/agents']);
        return;
      } else {
        resourceFilters.state = 'agentJobExecutions';
      }
    }
    if (resourceFilters.state === 'agentJobExecutions') {
      if (this.permission.JS7UniversalAgent.view.status) {
        this.router.navigate(['/resources/agent_job_executions']);
        return;
      } else {
        resourceFilters.state = 'locks';
      }
    }
    if (resourceFilters.state === 'locks') {
      if (this.permission.Lock.view.status) {
        this.router.navigate(['/resources/locks']);
        return;
      } else {
        resourceFilters.state = 'calendars';
      }
    }
    if (resourceFilters.state === 'calendars') {
      if (this.permission.Calendar.view.status) {
        this.router.navigate(['/resources/calendars']);
        return;
      } else {
        resourceFilters.state = 'documentations';
      }
    }
    if (resourceFilters.state === 'documentations') {
      if (this.permission.Documentation.view) {
        this.router.navigate(['/resources/documentations']);
        return;
      }
    }
  }

  navigateToConfiguration() {
    const confFilters = this.coreService.getConfigurationTab();
    if (confFilters.state === 'inventory') {
      if (this.permission.Inventory.configurations.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
        return;
      } else {
        confFilters.state = 'yade';
      }
    }
    if (confFilters.state === 'yade') {
      if (this.permission.YADE.configurations.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
        return;
      } else {
        confFilters.state = 'notification';
      }
    }
    if (confFilters.state === 'notification') {
      if (this.permission.YADE.configurations.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
        return;
      } else {
        confFilters.state = 'other';
      }
    }
    if (confFilters.state === 'other') {
      if (this.permission.YADE.configurations.view) {
        this.router.navigate(['/configuration/' + confFilters.state]);
      }
    }
  }

  filterEventResult(res): void {
    for (let i = 0; i < res.events.length; i++) {
      if (res.events[i].controllerId === this.schedulerIds.selected) {
        this.eventsRequest.push({
          controllerId: res.events[i].controllerId,
          eventId: res.events[i].eventId
        });
        this.dataService.announceEvent(res.events[i]);
        break;
      }
    }
  }

  getEvents(controller): void {
    if (!controller || this.isLogout) {
      return;
    }
    if (!this.eventLoading) {
      this.eventLoading = true;
      let obj = {
        controllers: []
      };
      if (!this.eventsRequest || (this.eventsRequest && this.eventsRequest.length === 0)) {
        for (let i = 0; i < controller.length; i++) {
          if (this.schedulerIds.selected === controller[i]) {
            obj.controllers.push({'controllerId': controller[i], 'eventId': this.eventId});
            break;
          }
        }
      } else {
        obj.controllers = this.eventsRequest;
      }
      this.coreService.post('events', obj).subscribe(res => {
        if (!this.switchScheduler && !this.isLogout) {
          this.eventsRequest = [];
          this.filterEventResult(res);
        }
        if (!this.isLogout) {
          this.eventLoading = false;
          this.getEvents(this.schedulerIds.controllerIds);
        }
        this.switchScheduler = false;
      }, (err) => {
        if (!this.isLogout && err && (err.status == 420 || err.status == 434 || err.status == 504)) {
          this.timeout = setTimeout(() => {
            this.eventLoading = false;
            this.getEvents(this.schedulerIds.controllerIds);
            clearTimeout(this.timeout);
          }, 1000);
        }
      });
    }
  }
}
