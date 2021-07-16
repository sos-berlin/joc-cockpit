import {Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {SearchPipe} from '../../../pipes/core.pipe';

@Component({
  selector: 'app-notification-monitor',
  templateUrl: './notification-monitor.component.html',
  styleUrls: ['./notification-monitor.component.scss']
})
export class NotificationMonitorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() schedulerIds: any = {};
  @Input() filters: any = {};

  isLoaded = false;
  notifications = [];
  data = [];
  currentData = [];
  searchableProperties = ['controllerId', 'type', 'orderId', 'workflow', 'created'];

  subscription1: Subscription;

  constructor(private coreService: CoreService, private authService: AuthService,
              private dataService: DataService, private searchPipe: SearchPipe) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'MONITORINGNOTIFICATION') {
          this.getData();
          break;
        }
      }
    }
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  private getData(): void {
    let obj: any = {
      controllerId: this.filters.filter.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords, 10) || 5000
    };
    this.coreService.post('monitoring/notifications', obj).subscribe((res: any) => {
      this.notifications = res.notifications;
      this.searchInResult();
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
  }

  expandDetails(): void{
    this.currentData.forEach((value) => {
      this.showDetail(value);
    });
  }

  collapseDetails(): void {
    this.currentData.forEach((value: any) => {
      value.show = false;
    });
  }

  showDetail(data): void {
    data.show = true;
    if (!data.isLoaded) {
      this.coreService.post('monitoring/notification', {
        notificationId: data.notificationId
      }).subscribe((res: any) => {
        data.monitors = res.monitors;
        data.isLoaded = true;
      }, () => {
        data.isLoaded = true;
      });
    }
  }

  currentPageDataChange($event): void {
    this.currentData = $event;
  }

  pageIndexChange($event): void {
    this.filters.filter.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.filters.filter.entryPerPage = $event;
  }

  searchInResult(): void {
    this.data = this.filters.filter.searchText ? this.searchPipe.transform(this.notifications, this.filters.filter.searchText, this.searchableProperties) : this.notifications;
    this.data = [...this.data];
  }
}
