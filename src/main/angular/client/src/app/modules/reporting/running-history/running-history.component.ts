import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {OrderPipe, SearchPipe} from '../../../pipes/core.pipe';
import {SharingDataService} from "../sharing-data.service";
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../../components/comfirm-modal/confirm.component";

@Component({
  selector: 'app-running-history',
  templateUrl: './running-history.component.html'
})
export class RunningHistoryComponent {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() filters: any = {};
  @Input() templates: any = [];

  isLoaded = false;
  reports = [];
  data = [];

  object = {
    mapOfCheckedId: new Set(),
    checked: false,
    indeterminate: false
  };

  searchableProperties = ['name', 'path', 'title', 'template', 'state', '_text', 'monthFrom', 'monthTo', 'frequencies'];

  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  private pendingHTTPRequests$ = new Subject<void>();
  @Output() bulkDelete: EventEmitter<any> = new EventEmitter();

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

    this.subscription3 = sharingDataService.functionAnnounced$.subscribe((res: any) => {
      if (res.state) {
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
        if (args.eventSnapshots[j].eventType.match(/Report/) && args.eventSnapshots[j].objectType === 'REPORT') {
          this.getData();
          break;
        }
      }
    }
  }


  private getData(): void {
    this.object.mapOfCheckedId = new Set();
    this.object.checked = false;
    this.refreshCheckedStatus();
    let obj: any = {compact: true};
    if (this.filters.filter.state !== 'ALL') {
      obj.states = [this.filters.filter.state];
    }
    this.coreService.post('reporting/run/history', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.isLoaded = true;
        this.reports = res.runs;
        this.reports.forEach((report) => {
          const template = this.templates.find(template => template.templateName == report.templateName);
          if (template) report.template = template.title;
          if (report.template?.includes('${hits}')) {
            report.template = report.template.replace('${hits}', report.hits || 10)
          }
        });
        this.data = this.orderPipe.transform(this.reports, this.filters.filter.sortBy, this.filters.reverse);
        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.reverse);
    this.reset();
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

  reset(): void {
    this.object = {
      mapOfCheckedId: new Set(),
      checked: false,
      indeterminate: false
    };
  }

  deleteReport(item?): void {
    const obj: any = {
      reportIds: item ? [item.runId] : []
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Report',
        operation: 'Delete',
        name: item ? item.path : ''
      };
      if (!item) {
        this.object.mapOfCheckedId.forEach((id) => {
          obj.reportIds.push(id);
        });
      }
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = {};
          this.coreService.getAuditLogObj(result, obj.auditLog);
          this._deleteReport(obj)
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: item ? 'delete' : 'deleteAllReport',
          message: item ? 'deleteReport' : 'deleteAllReport',
          item,
          objectName: item ? item.path : undefined,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteReport(obj);
        }
      });
    }
  }

  private _deleteReport(request) {
    this.coreService.post('reporting/reports/delete', request).subscribe({
      next: () => {
        setTimeout(() => {
          this.getData();
        }, 10)
      }
    });
  }

  checkAll(value: boolean): void {
    if (value && this.reports.length > 0) {
      const reports = this.getCurrentData(this.data, this.filters);
      reports.forEach(item => {
        this.object.mapOfCheckedId.add(item.runId);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(report: any, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.filters.filter.entryPerPage || this.preferences.entryPerPage)) {
      const orders = this.getCurrentData(this.data, this.filters);
      if (orders.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        orders.forEach(item => {
          this.object.mapOfCheckedId.add(item.runId);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.add(report.runId);
    } else {
      this.object.mapOfCheckedId.delete(report.runId);
    }

    this.object.checked = this.object.mapOfCheckedId.size === this.getCurrentData(this.data, this.filters).length;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    this.bulkDelete.emit(this.object.mapOfCheckedId);
  }
}


