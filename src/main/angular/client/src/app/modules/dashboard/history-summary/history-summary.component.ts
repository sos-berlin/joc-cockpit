import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

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
  notAuthenticate1 = false;
  notAuthenticate2 = false;
  subscription: Subscription;

  constructor(private authService: AuthService, private coreService: CoreService,
              private router: Router, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      let flag1 = false;
      let flag2 = false;
      for (const j in args.eventSnapshots) {
        if (args.eventSnapshots[j]) {
          if (args.eventSnapshots[j].eventType === 'HistoryOrderTerminated' && !flag1) {
            flag1 = true;
            this.getSummary();
          }
          if (args.eventSnapshots[j].eventType === 'HistoryTaskTerminated' && !flag2) {
            flag2 = true;
            this.getTaskSummary();
          }
          if (flag1 && flag2) {
            break;
          }
        }
      }
    }
  }

  ngOnInit(): void {
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
      this.notAuthenticate1 = true;
      this.notAuthenticate2 = true;
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getSummary(): void {
    this.coreService.post('orders/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    }).subscribe({
      next: (res: any) => {
        this.orderSummary = res.orders || {};
        this.isLoaded = true;
      }, error: (err) => {
        this.notAuthenticate1 = !err.isPermitted;
        this.isLoaded = true;
      }
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
    }).subscribe({
      next: (res: any) => {
        this.taskSummary = res.jobs;
        this.isLoaded = true;
      }, error: (err) => {
        this.notAuthenticate2 = !err.isPermitted;
        this.isLoaded = true;
      }
    });
  }

  getTaskSummaryByDate(): void {
    this.coreService.post('jobs/overview/summary', {
      controllerId: this.schedulerIds.selected,
      dateFrom: this.filters.date,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.taskSummary = res.jobs;
    });
  }

  showOrderSummary(state): void {
    const filter = this.coreService.getHistoryTab();
    filter.type = 'ORDER';
    filter.order.filter.historyStates = state;
    filter.order.selectedView = false;
    filter.order.filter.date = this.filters.date === '0d' ? 'today' : this.filters.date;
    this.router.navigate(['/history']).then();
  }

  showTaskSummary(state): void {
    const filter = this.coreService.getHistoryTab();
    filter.type = 'TASK';
    filter.task.filter.historyStates = state;
    filter.task.selectedView = false;
    filter.task.filter.date = this.filters.date === '0d' ? 'today' : this.filters.date;
    this.router.navigate(['/history']).then();
  }
}
