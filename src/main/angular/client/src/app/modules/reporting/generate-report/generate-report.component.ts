import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {GroupByPipe, OrderPipe, SearchPipe} from '../../../pipes/core.pipe';
import {SharingDataService} from "../sharing-data.service";
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../../components/comfirm-modal/confirm.component";

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
  searchableProperties = ['name', 'path', 'title', 'template', 'dateFrom', 'dateTo', 'frequency', 'created'];
  fromDate: any
  toDate: any
  filteredData: any = [];

  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  object = {
    mapOfCheckedId: new Map(),
    checked: false,
    indeterminate: false
  };

  @Output() bulkDelete: EventEmitter<any> = new EventEmitter();
  private pendingHTTPRequests$ = new Subject<void>();

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private orderPipe: OrderPipe, private groupBy: GroupByPipe,
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe, private sharingDataService: SharingDataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });

    this.subscription2 = sharingDataService.searchKeyAnnounced$.subscribe(() => {
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
        this.getData();
      } else if (res.expandAll) {
        this.expandAllItems();
      } else if (res.collapseAll) {
        this.collapseAllItems();
      } else if (res.groupBy) {
        if (this.filters.groupBy !== res.groupBy) {
          this.filters.groupBy = res.groupBy;
          this.reset();
          this.filters.expandedKey?.clear();
          this.groupByFunc();
        }
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
    this.reset();
    this.bulkDelete.emit(this.object.mapOfCheckedId);
    if (this.filteredData?.length > 0) {
      if (!this.filters.expandedKey) {
        this.filters.expandedKey = new Set();
      }
      this.filteredData.forEach(item => {
        if (item.expanded) {
          this.filters.expandedKey.add(item.key);
        }
      })
    }
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
        });
        this.reports = this.orderPipe.transform(this.reports, this.filters.filter.sortBy, this.filters.filter.reverse);
        this.data = [...this.reports];
        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
    if (this.filters.groupBy == 'path' && propertyName == 'path') {
      this.filteredData = this.orderPipe.transform(this.filteredData, this.filters.filter.sortBy, this.filters.filter.reverse);
    } else if (this.filters.groupBy == 'template' && propertyName == 'template') {
      this.filteredData = this.orderPipe.transform(this.filteredData, this.filters.filter.sortBy, this.filters.filter.reverse);
    } else {
      this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.filter.reverse);
      this.filteredData = this.groupBy.transform(this.data, this.filters.groupBy);
      this.filteredData.forEach(item => {
        item.path = item.value[0].path;
        item.title = item.value[0].title;
        item.template = item.value[0].template;
        if (this.filters.expandedKey?.has(item.key)) {
          item.expanded = true;
        }
      })
    }
    this.reset();
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.filters.searchText ? this.searchPipe.transform(this.reports, this.filters.searchText, this.searchableProperties) : this.reports;
    this.data = [...this.data];
    this.groupByFunc();
    if (this.reports.length === 0) {
      this.filters.filter.currentPage = 1;
    }
  }

  reset(): void {
    this.object = {
      mapOfCheckedId: new Map(),
      checked: false,
      indeterminate: false
    };
  }

  deleteReport(item?): void {
    const obj: any = {
      reportIds: item ? [item.id] : []
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
    this.coreService.post('reporting/reports/delete', request).subscribe();
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

  checkAll(value: boolean): void {
    const filteredData = this.getCurrentData(this.filteredData, this.filters.filter);
    if (value && this.data.length > 0) {
      for (let i = 0; i < filteredData.length; i++) {
        filteredData[i].checked = true;
        filteredData[i].indeterminate = false;
        filteredData[i].value.forEach(item => {
          this.object.mapOfCheckedId.set(item.id, item);
        });
      }

    } else {
      for (let i = 0; i < filteredData.length; i++) {
        filteredData[i].checked = false;
        filteredData[i].indeterminate = false;
      }
      this.object.mapOfCheckedId.clear();
    }
    this.object.indeterminate = false;
    this.bulkDelete.emit(this.object.mapOfCheckedId);
  }

  checkAllChild(data, isChecked: boolean): void {
    if (data.value) {
      data.value.forEach(item => {
        data.indeterminate = false;
        if (isChecked) {
          this.object.mapOfCheckedId.set(item.id, item);
        } else {
          this.object.mapOfCheckedId.delete(item.id);
        }
      })
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(item, report: any, checked: boolean): void {
    if (checked) {
      this.object.mapOfCheckedId.set(report.id, report);
    } else {
      this.object.mapOfCheckedId.delete(report.id);
    }
    let count = 0;
    item.value.forEach(x => {
      if (this.object.mapOfCheckedId.has(x.id)) {
        ++count;
      }
    });
    item.checked = count == item.value.length;
    item.indeterminate = count > 0 && !item.checked;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const filteredData = this.getCurrentData(this.filteredData, this.filters.filter);
    let count = 0;
    for (let i = 0; i < filteredData.length; i++) {
      if (filteredData[i].checked) {
        ++count;
      }
    }
    this.object.checked = count == filteredData.length;
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    this.bulkDelete.emit(this.object.mapOfCheckedId);
  }

  toggleRowExpansion(item: any): void {
    item.expanded = !item.expanded;
    if (!this.filters.expandedKey) {
      this.filters.expandedKey = new Set();
    }
    if (item.expanded) {
      this.filters.expandedKey.add(item.key);
    } else {
      this.filters.expandedKey.delete(item.key);
    }
  }


  groupByFunc() {
    this.filteredData = this.groupBy.transform(this.data, this.filters.groupBy);
    this.filteredData.forEach(item => {
      item.path = item.value[0].path;
      item.title = item.value[0].title;
      item.template = item.value[0].template;
      //item.value = this.orderPipe.transform(item.value, this.filters.filter.sortBy, this.filters.filter.reverse);
      if (this.filters.expandedKey?.has(item.key)) {
        item.expanded = true;
      }
    })

  }

  expandAllItems() {
    if (!this.filters.expandedKey) {
      this.filters.expandedKey = new Set();
    }
    this.filteredData.forEach(item => {
      item.expanded = true;
      this.filters.expandedKey.add(item.key);
    });
  }

  collapseAllItems() {
    this.filters.expandedKey.clear();
    this.filteredData.forEach(item => {
      item.expanded = false;
    });
  }
}


