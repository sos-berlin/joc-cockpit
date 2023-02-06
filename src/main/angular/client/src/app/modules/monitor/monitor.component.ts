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
  loading = false;
  index: number;
  subscription: any;

  constructor(private authService: AuthService, public coreService: CoreService,
              private dataService: DataService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.loading = false;
      this.init();
      setTimeout(() => {
        this.loading = true;
      }, 10);
    });
  }

  ngOnInit(): void {
    this.init();
    this.loading = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.monitorFilters = this.coreService.getMonitorTab();
    if (!this.monitorFilters.orderNotification.mapOfCheckedId) {
      this.monitorFilters.orderNotification.mapOfCheckedId = new Set();
    }
    if (!this.monitorFilters.systemNotification.mapOfCheckedId) {
      this.monitorFilters.systemNotification.mapOfCheckedId = new Set();
    }
    if (!(this.monitorFilters.controller.current || this.monitorFilters.controller.current === false)) {
      this.monitorFilters.controller.current = this.preferences.currentController;
    }
    if (!(this.monitorFilters.agent.current || this.monitorFilters.agent.current === false)) {
      this.monitorFilters.agent.current = this.preferences.currentController;
    }
    if (!(this.monitorFilters.orderNotification.current || this.monitorFilters.orderNotification.current === false)) {
      this.monitorFilters.orderNotification.current = this.preferences.currentController;
    }
    this.index = this.monitorFilters.tabIndex;
  }

  tabChange($event): void {
    this.monitorFilters.tabIndex = $event.index;
  }

  changeDate(date): void {
    if (this.monitorFilters.tabIndex == 2) {
      this.monitorFilters.orderNotification.filter.date = date;
      this.dataService.announceFunction(this.monitorFilters.orderNotification);
    } else {
      this.monitorFilters.systemNotification.filter.date = date;
      this.dataService.announceFunction(this.monitorFilters.systemNotification);
    }
  }

  controllerChange(): void {
    this.dataService.announceFunction(this.monitorFilters[this.index === 0 ? 'controller' : this.index === 1 ? 'agent' : 'notification']);
  }

  changeTypes(type): void {
    const index = this.monitorFilters.orderNotification.filter.types.indexOf(type);
    if (index === -1) {
      this.monitorFilters.orderNotification.filter.types.push(type);
    } else {
      this.monitorFilters.orderNotification.filter.types.splice(index, 1);
    }
    this.dataService.announceFunction(this.monitorFilters.orderNotification);
  }

  changeCategories(category): void {
    this.monitorFilters.systemNotification.filter.categories = category;
    this.dataService.announceFunction(this.monitorFilters.systemNotification);
  }

  changeSystemType(type): void {
    const index = this.monitorFilters.systemNotification.filter.types.indexOf(type);
    if (index === -1) {
      this.monitorFilters.systemNotification.filter.types.push(type);
    } else {
      this.monitorFilters.systemNotification.filter.types.splice(index, 1);
    }
    this.dataService.announceFunction(this.monitorFilters.systemNotification);
  }

  acknowledge(): void {
    this.dataService.announceFunction('ACKNOWLEDGE');
  }

  exportToExcel(){
    this.dataService.announceFunction('EXPORT');
  }
}
