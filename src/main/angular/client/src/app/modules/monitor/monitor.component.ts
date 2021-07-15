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
    this.index = this.monitorFilters.tabIndex;
  }

  tabChange($event): void {
    this.monitorFilters.tabIndex = $event.index;
  }

}
