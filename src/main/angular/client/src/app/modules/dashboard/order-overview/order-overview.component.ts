import {Component, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {HelpViewerComponent} from "../../../components/help-viewer/help-viewer.component";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  standalone: false,
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html'
})
export class OrderOverviewComponent {
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
    {date: '2d', text: 'nextDay'},
    {date: '7d', text: 'nextWeak'}
  ];

  constructor(public authService: AuthService, public coreService: CoreService,
              private router: Router, private dataService: DataService,private modal: NzModalService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit(): void {
    this.filters = this.coreService.getDashboardTab().order;
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
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

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/WorkflowStateChanged/) || args.eventSnapshots[j].eventType === 'ProxyCoupled'
          || args.eventSnapshots[j].eventType === 'ProxyDecoupled') {
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
    if (this.filters.date !== 'ALL') {
      obj.dateTo = this.filters.date;
      if (this.filters.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('orders/overview/snapshot', obj).subscribe({
      next: (res: any) => {
        this.orders = res.orders;
        this.isLoaded = true;
      }, error: (err) => {
        this.notAuthenticate = !err.isPermitted;
        this.isLoaded = true;
      }
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
    this.router.navigate(['/orders_overview', state]).then();
  }

  helpPage(): void{
    this.modal.create({
      nzTitle: undefined,
      nzContent: HelpViewerComponent,
      nzClassName: 'lg',
      nzData: {
        preferences: this.preferences,
        helpKey: 'dashboard-orders'
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    })
  }
}
