import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html'
})
export class MonitorComponent implements OnInit, OnDestroy {
  monitor: Array<any> = [];
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  monitorFilters: any = {};
  index: number;
  isNotReady = true;
  subscription: any;

  constructor(private authService: AuthService, public coreService: CoreService,
              private dataService: DataService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.monitorFilters = this.coreService.getMonitorTab();
    if (!this.monitorFilters.notification.mapOfCheckedId) {
      this.monitorFilters.notification.mapOfCheckedId = new Set();
    }
    this.index = this.monitorFilters.tabIndex;
    const username = this.authService.currentUserData;
    if (sessionStorage.defaultProfile === username) {
      this.isNotReady = false;
    } else {
      this.index = 2;
    }
  }

  tabChange($event): void {
    this.monitorFilters.tabIndex = $event.index;
  }

  changeDate(date): void {
    this.monitorFilters.notification.filter.date = date;
    this.dataService.announceFunction(this.monitorFilters.notification);
  }

  controllerChange(): void {
    this.dataService.announceFunction(this.monitorFilters[this.index === 0 ? 'controller' : this.index === 1 ? 'agent' : 'notification']);
  }

  changeTypes(type): void {
    const index = this.monitorFilters.notification.filter.types.indexOf(type);
    if (index === -1) {
      this.monitorFilters.notification.filter.types.push(type);
    } else {
      this.monitorFilters.notification.filter.types.splice(index, 1);
    }
    this.dataService.announceFunction(this.monitorFilters.notification);
  }

  acknowledge(): void {
    const obj: any = {action: 'acknowledge'};
    this.dataService.announceFunction(obj);
  }
}
