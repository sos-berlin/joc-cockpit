import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../guard';
import {DataService} from '../../services/data.service';
import {Router} from '@angular/router';
import * as _ from 'underscore';
import {Subscription} from 'rxjs';
declare const $;

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
  allEvents: any = [];
  eventsRequest: any = [];
  events: any = [];
  allSessionEvent: any = {};
  showGroupEvent: any = [];
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

  private init(){
    this.allSessionEvent = {group: [], eventUnReadCount: 0};
    this.username = this.authService.currentUserData;
    this.reloadSettings();
    this.getSelectedSchedulerInfo();
    if (this.schedulerIds && this.schedulerIds.controllerIds && this.schedulerIds.controllerIds.length > 0) {
      this.getEvents(this.schedulerIds.controllerIds);
    }

    if (sessionStorage.$SOS$ALLEVENT != 'null' && sessionStorage.$SOS$ALLEVENT != null) {
      if (sessionStorage.$SOS$ALLEVENT.length != 0) {
        this.allSessionEvent = JSON.parse(sessionStorage.$SOS$ALLEVENT);
      }
    }
    $('#notification').click(function (e) {
      e.stopPropagation();
    });
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

  switchSchedulerController(){
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
    for (let i = 0; i < res.events.length; i++) {
      if (res.events[i].controllerId !== this.schedulerIds.selected) {
        this.eventsRequest.push({
          controllerId: res.events[i].controllerId,
          eventId: res.events[i].eventId
        });
      }
    }
    this.allEvents = res.events;
    this.reformatEventResult();
  }

  getNotification(eventByPath, i, j): void {
    eventByPath.controllerId = this.allEvents[i].controllerId;
    eventByPath.objectType = this.allEvents[i].eventSnapshots[j].objectType;
    eventByPath.eventId = this.allEvents[i].eventSnapshots[j].eventId;

    if (this.allEvents[i].eventSnapshots[j].path.indexOf(',') !== -1) {
      eventByPath.path = this.allEvents[i].eventSnapshots[j].path.substring(0, this.allEvents[i].eventSnapshots[j].path.lastIndexOf(','));
    } else {
      eventByPath.path = this.allEvents[i].eventSnapshots[j].path;
    }

    eventByPath.events.push(this.allEvents[i].eventSnapshots[j]);

    for (let m = 0; m <= eventByPath.events.length - 1; m++) {
      eventByPath.events[m].read = false;
    }
    let flag = true;

    if (this.allSessionEvent.group) {

      for (let x = 0; x <= this.allSessionEvent.group.length - 1; x++) {
        if (this.allSessionEvent.group[x].objectType === eventByPath.objectType &&
          this.allSessionEvent.group[x].path === eventByPath.path &&
          this.allSessionEvent.group[x].controllerId === eventByPath.controllerId) {
          for (let m = 0; m <= eventByPath.events.length - 1; m++) {
            if (this.allSessionEvent.group[x].events.indexOf(eventByPath.events[m]) === -1) {
              this.allSessionEvent.group[x].eventId = eventByPath.eventId;
              this.allSessionEvent.group[x].readCount++;
              this.allSessionEvent.eventUnReadCount++;
              eventByPath.events[m].read = false;
              this.allSessionEvent.group[x].events.push(eventByPath.events[m]);
            }
          }
          flag = false;
          $('#notifyBell').toggleClass('notify');
        }
      }
    }
    if (flag) {
      eventByPath.readCount = 1;
      this.allSessionEvent.eventUnReadCount++;
      $('#notifyBell').toggleClass('notify');
      this.allSessionEvent.group.push(eventByPath);
    }
  }


  reformatEventResult() {
    if (this.preferences.events) {
      let eventFilter = this.preferences.events.filter;
      if (eventFilter && (eventFilter instanceof Array) && eventFilter.length > 0) {
        for (let i = 0; i < this.allEvents.length; i++) {
          if (this.allEvents[i] && this.allEvents[i].eventSnapshots) {
            for (let j = 0; j < this.allEvents[i].eventSnapshots.length; j++) {
              if (this.allEvents[i].eventSnapshots[j].eventId) {
                const evnType = this.allEvents[i].eventSnapshots[j].eventType;
                let eventByPath = {
                  controllerId: '',
                  objectType: '',
                  path: '',
                  eventId: '',
                  events: [],
                  readCount: 0
                };
                if (evnType !== 'JobStateChanged' && evnType !== 'WorkflowStateChanged') {
                  if (eventFilter.indexOf(evnType) !== -1) {
                    this.getNotification(eventByPath, i, j);
                  }
                } else if (evnType === 'JobStateChanged') {
                  const type = 'Job' + this.allEvents[i].eventSnapshots[j].state.charAt(0).toUpperCase() + this.allEvents[i].eventSnapshots[j].state.slice(1);
                  if (eventFilter.indexOf(type) !== -1) {
                    this.getNotification(eventByPath, i, j);
                  }
                } else if (evnType === 'WorkflowStateChanged') {
                  const type = 'Workflow' + this.allEvents[i].eventSnapshots[j].state.charAt(0).toUpperCase() + this.allEvents[i].eventSnapshots[j].state.slice(1);
                  if (eventFilter.indexOf(type) !== -1) {
                    this.getNotification(eventByPath, i, j);
                  }
                }
              }
            }
          }
        }
        sessionStorage.$SOS$ALLEVENT = JSON.stringify(this.allSessionEvent);
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
        for (let j = 0; j < controller.length; j++) {
          if (this.schedulerIds.selected !== controller[j]) {
            obj.controllers.push(
              {'controllerId': controller[j]}
            );
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

  expandNotification(group) {
    this.showEvent = !this.showEvent;
    this.showGroupEvent = group;
    sessionStorage.$SOS$ALLEVENT = JSON.stringify(this.allSessionEvent);

  }

  collapseNotification() {
    this.showEvent = !this.showEvent;
    sessionStorage.$SOS$ALLEVENT = JSON.stringify(this.allSessionEvent);
  }

  updateAllEvent(event) {
    this.allSessionEvent = [];
    this.allSessionEvent = event;
  }

  readEvent(group, event, allSessionEvent) {
    if (!event.read) {
      event.read = true;
      group.readCount--;
      allSessionEvent.eventUnReadCount--;
    }
  }

  viewObject(group, event, allSessionEvent) {
    if (!event.read) {
      event.read = true;
      group.readCount--;
      allSessionEvent.eventUnReadCount--;
    }
    event.navigate = true;

    let p = event.path.substring(0, event.path.lastIndexOf('/'));

    if (this.schedulerIds.selected != group.controllerId) {
      sessionStorage.$SOS$NAVIGATEOBJ = JSON.stringify({
        tab: event.objectType,
        path: p,
        name: p.substring(p.lastIndexOf('/') + 1, p.length)
      });
    }
    $('li .dropdown').removeClass('open');
  }

  makeAllGroupEventRead(allSessionEvent) {
    if (allSessionEvent.group) {
      for (let i = 0; i <= allSessionEvent.group.length - 1; i++) {
        allSessionEvent.group[i].readCount = 0;
        if (allSessionEvent.group[i].events) {
          for (let j = 0; j <= allSessionEvent.group[i].events.length - 1; j++) {
            allSessionEvent.group[i].events[j].read = true;

          }
        }
      }
      allSessionEvent.eventUnReadCount = 0;
    }
    sessionStorage.$SOS$ALLEVENT = JSON.stringify(allSessionEvent);

  }

  makeAllEventRead(allSessionEvent, showGroupEvent) {
    if (showGroupEvent) {
      for (let i = 0; i <= showGroupEvent.events.length - 1; i++) {
        if (!showGroupEvent.events[i].read) {
          allSessionEvent.eventUnReadCount--;
        }
        showGroupEvent.events[i].read = true;
      }
      showGroupEvent.readCount = 0;
    }
  }
}
