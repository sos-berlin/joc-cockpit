import {Component, Input} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {SearchPipe} from '../../../pipes/core.pipe';
import {SharingDataService} from "../sharing-data.service";

@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.component.html'
})
export class GenerateReportComponent {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() filters: any = {};
  @Input() templates: any = [];

  isLoaded = false;
  reports = [];
  data = [];
  selectedReport = {};
  isVisible = false;
  templateName: any[] = []
  searchableProperties = ['name', 'title', 'template', 'dateFrom', 'dateTo', 'frequency', 'created'];
  fromDate: any
  toDate: any
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  private pendingHTTPRequests$ = new Subject<void>();

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router,
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe, private sharingDataService: SharingDataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });

    this.subscription2 = sharingDataService.searchKeyAnnounced$.subscribe(res => {
      this.searchInResult();
    });
    this.subscription3 = sharingDataService.filterAnnounced$.subscribe((res: any) => {
      if (res.templateName) {
        this.templateName = [res.templateName];
        this.getData()
      } else if (res.state) {
        this.getDateRange(res.state)
        this.getData()
      } else if (res.allTemplate) {
        this.templateName = [];
        this.getData()
      }
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ReportsUpdated' && args.eventSnapshots[j].objectType === 'REPORT') {
          this.getData();
        }
      }
    }
  }


  private getData(): void {
    this.coreService.post('reporting/reports/generated', {
      compact: true,
      templateNames: this.templateName,
      dateFrom: this.fromDate,
      dateTo: this.toDate
    }).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.isLoaded = true;
        this.reports = res.reports;
        this.reports.forEach((report) => {
          const template = this.templates.find(template => template.templateName == report.templateName);
          if (template) report.template = template.title;
          if (report.template?.includes('${hits}')) {
            report.template = report.template.replace('${hits}', report.hits || 10)
          }
        })
        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.filter.currentPage - 1)), (entryPerPage * filter.filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.filters.searchText ? this.searchPipe.transform(this.reports, this.filters.searchText, this.searchableProperties) : this.reports;
    this.data = [...this.data];
    if (this.reports.length === 0) {
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

  getDateRange(timePeriod): any {
    const currentDate = new Date();
    let fromDate, toDate;

    switch (timePeriod.state) {
      case "All":
        fromDate = undefined;
        toDate = undefined;
        break;
      case "lastMonth":
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
      case "last3Months":
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
      case "last6Months":
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
        toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
      case "lastYear":
        fromDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        toDate = new Date(currentDate.getFullYear() - 1, 11, 31);
        break;
      default:
        fromDate = null;
        toDate = null;
        break;
    }
    if (fromDate != undefined && toDate != undefined) {
      this.fromDate = fromDate.toISOString().split('T')[0];
      this.toDate = toDate.toISOString().split('T')[0]
    } else {
      this.fromDate = fromDate;
      this.toDate = toDate;
    }
  }
}


