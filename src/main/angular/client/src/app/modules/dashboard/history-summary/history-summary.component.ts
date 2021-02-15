import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-history-summary',
  templateUrl: './history-summary.component.html'
})
export class HistorySummaryComponent implements OnInit, OnDestroy {
  orderSummary: any;
  taskSummary: any;
  schedulerIds: any;
  preferences: any = {};
  filters: any = {};
  isLoaded = false;
  notAuthenticate = false;
  subscription: Subscription;

  constructor(private authService: AuthService, private coreService: CoreService, private router: Router, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ReportingChangedOrder') {
          this.getSummary();
        }
        if (args.eventSnapshots[j].eventType === 'JobStateChanged') {
          this.getTaskSummary();
        }
      }
    }
  }

  ngOnInit() {
    this.orderSummary = {};
    this.taskSummary = {};
    this.filters = this.coreService.getDashboardTab().history;
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getSummary();
      this.getTaskSummary();
    } else {
      this.notAuthenticate = true;
      this.isLoaded = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getSummary(): void {
    this.coreService.post('orders/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.orderSummary = res.orders || {};
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }

  getSummaryByDate(date): void {
    this.filters.date = date;
    this.getTaskSummaryByDate();
    this.coreService.post('orders/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: date,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.orderSummary = res.orders || {};
    });
  }

  getTaskSummary(): void {
    this.coreService.post('jobs/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.taskSummary = res.jobs;
      this.isLoaded = true;
    }, (err) => {
      this.isLoaded = true;
    });
  }

  getTaskSummaryByDate(): void {
    this.coreService.post('jobs/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    }).subscribe((res:any) => {
      this.taskSummary = res.jobs;
    });
  }

  showOrderSummary(state) {
    let filter = this.coreService.getHistoryTab();
    filter.type = 'ORDER';
    filter.order.filter.historyStates = state;
    filter.order.selectedView = false;
    filter.order.filter.date = this.filters.date === '0d' ? 'today' : this.filters.date;
    this.router.navigate(['/history']);
  }

  showTaskSummary(state) {
    let filter = this.coreService.getHistoryTab();
    filter.type = 'TASK';
    filter.task.filter.historyStates = state;
    filter.task.selectedView = false;
    filter.task.filter.date = this.filters.date === '0d' ? 'today' : this.filters.date;
    this.router.navigate(['/history']);
  }
}
