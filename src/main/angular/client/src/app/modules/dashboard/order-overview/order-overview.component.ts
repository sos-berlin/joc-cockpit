import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html'
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
  @Input('sizeX') xbody: number;
  @Input('sizeY') ybody: number;
  orders: any = {};
  schedulerIds: any = {};
  preferences: any = {};
  notAuthenticate = false;
  isLoaded = false;
  filters: any = {};
  subscription: Subscription;

  dateFilterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'},
    {date: '7d', text: 'nextWeak'},
    {date: 'NEVER', text: 'never'}
  ];

  constructor(public authService: AuthService, public coreService: CoreService,
              private router: Router, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.filters = this.coreService.getDashboardTab().order;
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    if (this.schedulerIds.selected) {
      this.getSnapshot();
    } else {
      this.notAuthenticate = true;
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/WorkflowStateChanged/)) {
          this.getSnapshot();
          break;
        }
      }
    }
  }

  getSnapshot(): void {
    const obj: any = {
      controllerId: this.schedulerIds.selected
    };
    if (this.filters.date === 'NEVER') {
      obj.scheduledNever = true;
    } else {
      if (this.filters.date !== 'ALL') {
        obj.dateTo = this.filters.date;
        obj.timeZone = this.preferences.zone;
      }
    }
    this.coreService.post('orders/overview/snapshot', obj).subscribe((res: any) => {
      this.orders = res.orders;
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }

  changeDate(date): void {
    this.filters.date = date;
    this.getSnapshot();
  }

  navigate(state): void {
    const filter = this.coreService.getOrderOverviewTab();
    filter.filter.date = this.filters.date;
    filter.filter.dateLabel = this.filters.label;
    this.router.navigate(['/orders_overview', state]);
  }
}
