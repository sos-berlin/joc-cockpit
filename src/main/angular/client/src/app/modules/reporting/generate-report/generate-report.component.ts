import {Component, Input} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {SearchPipe, OrderPipe} from '../../../pipes/core.pipe';
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

  searchableProperties = ['name', 'title', 'template', 'dateFrom', 'dateTo', 'frequency', 'created'];

  subscription1: Subscription;
  subscription2: Subscription;

  private pendingHTTPRequests$ = new Subject<void>();

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private orderPipe: OrderPipe,
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe, private sharingDataService: SharingDataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });

    this.subscription2 = sharingDataService.searchKeyAnnounced$.subscribe(res => {
      this.searchInResult();
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
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
    this.coreService.post('reporting/reports/generated', {compact: true}).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.isLoaded = true;
        this.reports = this.orderPipe.transform(res.reports, this.filters.sortBy, this.filters.reverse);
        this.reports.forEach((report) => {
          const template = this.templates.find(template => template.templateName == report.templateName);
          if (template) report.template = template.title;
          if(report.template?.includes('${hits}')){
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
    this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.filter.reverse);
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

}


