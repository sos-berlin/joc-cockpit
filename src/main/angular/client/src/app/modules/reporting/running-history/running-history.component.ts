import {Component, Input} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {SearchPipe, OrderPipe} from '../../../pipes/core.pipe';

@Component({
  selector: 'app-running-history',
  templateUrl: './running-history.component.html'
})
export class RunningHistoryComponent {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() filters: any = {};


  selectedReport = {};
  isVisible = false;
  isLoaded = false;
  reportHistory = [];
  data = [];

  searchableProperties = ['name', 'title', 'template', 'frequency', 'created'];

  subscription1: Subscription;

  private pendingHTTPRequests$ = new Subject<void>();

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private orderPipe: OrderPipe,
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });

  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].objectType === 'MONITORINGNOTIFICATION') {
          this.getData();
          break;
        }
      }
    }
  }


  private getData(): void {
    this.coreService.post('report_history', {}).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.isLoaded = true;
        this.reportHistory = this.orderPipe.transform(res.reportHistory, this.filters.filter.sortBy, this.filters.filter.reverse);

        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.filter.reverse);
  }


  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.filter.currentPage - 1)), (entryPerPage * filter.filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.filters.searchText ? this.searchPipe.transform(this.reportHistory, this.filters.searchText, this.searchableProperties) : this.reportHistory;
    this.data = [...this.data];
    if (this.reportHistory.length === 0) {
      this.filters.filter.currentPage = 1;
    }
  }

  onSelect(data): void {
    this.isVisible = true;
    this.selectedReport = data;
  }

  closePanel(): void {
    this.isVisible = false;
  }

}
