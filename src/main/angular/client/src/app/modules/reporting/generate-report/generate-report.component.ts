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
import {TranslateService} from '@ngx-translate/core';

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
  groupType: string = '';
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
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe, private sharingDataService: SharingDataService, private translate: TranslateService) {
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
          if (template) report.template = template.templateName;
        });
        this.reports = this.orderPipe.transform(this.reports, this.filters.filter.sortBy, this.filters.filter.reverse);
        this.data = [...this.reports];
        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  sort(propertyName): void {
    const expandedStates = new Map<string, { expandedHighest: boolean, expandedLowest: boolean, expanded: boolean }>();

    // Save the current expanded states of the groups
    this.filteredData.forEach(item => {
      expandedStates.set(item.key, {
        expandedHighest: item.expandedHighest,
        expandedLowest: item.expandedLowest,
        expanded: item.expanded
      });
    });

    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;

    this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.filter.reverse);

    this.filteredData = this.manualGroupBy(this.data, this.filters.groupBy);

    this.filteredData.forEach(item => {
      item.path = item.value[0].path;
      item.title = item.value[0].title;
      item.template = item.value[0].template;
      item.hits = item.value[0].hits;
      item.sort = item.value[0].sort;

      item.highestGroup = item.value.filter(val => val.sort === 'HIGHEST') || [];
      item.lowestGroup = item.value.filter(val => val.sort === 'LOWEST') || [];

      if (expandedStates.has(item.key)) {
        const { expandedHighest, expandedLowest, expanded } = expandedStates.get(item.key);
        item.expandedHighest = expandedHighest;
        item.expandedLowest = expandedLowest;
        item.expanded = expanded;
      }
    });

    this.reset();
  }

  manualGroupBy(data: any[], groupBy: string): any[] {
    const groupedData = data.reduce((acc, item) => {
      const key = groupBy === 'hits' ? `${item.hits}_${item.template}` : item[groupBy];
      if (!acc[key]) {
        acc[key] = {
          key: key,
          path: item.path,
          title: item.title,
          template: item.template,
          hits: item.hits,
          sort: item.sort,
          value: []
        };
      }
      acc[key].value.push(item);
      return acc;
    }, {});

    return Object.values(groupedData);
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

  deleteReport(item, isBulk = false, groupType?: string): void {
    const obj: any = {
      reportIds: item ? [item.id] : []
    };

    if (isBulk) {
      obj.reportIds = [];
      item.value.forEach(val => {
        obj.reportIds.push(val.id);
      });
    }

    if (groupType) {
      if (groupType === 'highest') {
        obj.reportIds = item.highestGroup.map(val => val.id);
      } else if (groupType === 'lowest') {
        obj.reportIds = item.lowestGroup.map(val => val.id);
      }
    }

    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Report',
        operation: 'Delete',
        name: item.path || item.template
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
          this._deleteReport(obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: !isBulk ? 'delete' : 'deleteAllReport',
          message: !isBulk ? 'deleteReport' : 'deleteAllReport',
          objectName: item.path || item.template,
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

  onSelect(data, groupType?: string): void {
    this.isVisible = true;
    this.selectedReport = data;
    this.groupType = groupType; // Assign groupType
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
    data.checked = isChecked;
    data.indeterminate = false;

    if (data.value) {
      data.value.forEach(item => {
        item.checked = isChecked;
        item.indeterminate = false;
        if (isChecked) {
          this.object.mapOfCheckedId.set(item.id, item);
        } else {
          this.object.mapOfCheckedId.delete(item.id);
        }
      });
    }

    if (data.highestGroup) {
      data.highestGroup.forEach(nestedItem => {
        nestedItem.checked = isChecked;
        if (isChecked) {
          this.object.mapOfCheckedId.set(nestedItem.id, nestedItem);
        } else {
          this.object.mapOfCheckedId.delete(nestedItem.id);
        }
      });
      this.updateGroupState(data, 'highest');
    }

    if (data.lowestGroup) {
      data.lowestGroup.forEach(nestedItem => {
        nestedItem.checked = isChecked;
        if (isChecked) {
          this.object.mapOfCheckedId.set(nestedItem.id, nestedItem);
        } else {
          this.object.mapOfCheckedId.delete(nestedItem.id);
        }
      });
      this.updateGroupState(data, 'lowest');
    }

    this.updateParentState(data);
  }
  updateGroupState(parent, group: 'highest' | 'lowest'): void {
    let groupItems = group === 'highest' ? parent.highestGroup : parent.lowestGroup;
    let checkedCount = groupItems.filter(item => item.checked).length;

    const totalGroupItems = groupItems.length;
    const allChecked = checkedCount === totalGroupItems;
    const someChecked = checkedCount > 0 && checkedCount < totalGroupItems;

    if (group === 'highest') {
      parent.highestGroupChecked = allChecked;
      parent.highestGroupIndeterminate = someChecked;
    } else {
      parent.lowestGroupChecked = allChecked;
      parent.lowestGroupIndeterminate = someChecked;
    }

    this.updateParentState(parent);
  }
  onItemChecked(parent, item, isChecked: boolean, group: 'highest' | 'lowest'): void {
    item.checked = isChecked;
    if (isChecked) {
      this.object.mapOfCheckedId.set(item.id, item);
    } else {
      this.object.mapOfCheckedId.delete(item.id);
    }

    let groupItems = group === 'highest' ? parent.highestGroup : parent.lowestGroup;
    let checkedCount = 0;

    groupItems.forEach(nestedItem => {
      if (nestedItem.id === item.id) {
        nestedItem.checked = isChecked;
      }
      if (nestedItem.checked) {
        checkedCount++;
      }
    });

    const totalGroupItems = groupItems.length;
    const allChecked = checkedCount === totalGroupItems;
    const someChecked = checkedCount > 0 && checkedCount < totalGroupItems;

    if (group === 'highest') {
      parent.highestGroupChecked = allChecked;
      parent.highestGroupIndeterminate = someChecked;
    } else {
      parent.lowestGroupChecked = allChecked;
      parent.lowestGroupIndeterminate = someChecked;
    }

    this.updateParentState(parent);
  }

  updateParentState(parent): void {
    const totalItems = parent.value.length;
    const totalChecked = parent.value.filter(child => child.checked).length;

    const highestChecked = parent.highestGroup ? parent.highestGroup.filter(nestedItem => nestedItem.checked).length : 0;
    const lowestChecked = parent.lowestGroup ? parent.lowestGroup.filter(nestedItem => nestedItem.checked).length : 0;

    const total = totalItems + highestChecked + lowestChecked;
    const checked = totalChecked + highestChecked + lowestChecked;

    parent.checked = checked === total;
    parent.indeterminate = checked > 0 && checked < total;

    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const filteredData = this.getCurrentData(this.filteredData, this.filters.filter);
    let checkedCount = 0;
    filteredData.forEach(data => {
      if (data.checked) {
        checkedCount++;
      }
    });

    this.object.checked = checkedCount === filteredData.length;
    this.object.indeterminate = checkedCount > 0 && checkedCount < filteredData.length;
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

  toggleHighest(item: any): void {
    item.expandedHighest = !item.expandedHighest;
  }

  toggleLowest(item: any): void {
    item.expandedLowest = !item.expandedLowest;
  }

  groupByFunc() {
    if (this.filters.groupBy === 'hits') {
      this.filteredData = this.groupByHitsAndTemplate(this.data);
    } else {
      this.filteredData = this.groupBy.transform(this.data, this.filters.groupBy);
    }

    this.filteredData.forEach(item => {
      item.path = item.value[0].path;
      item.title = item.value[0].title;
      item.template = item.value[0].template;

      if (this.filters.groupBy !== 'hits') {
        // Group by Highest and Lowest only if not grouping by hits
        const highestGroup = item.value.filter(val => val.sort === 'HIGHEST');
        const lowestGroup = item.value.filter(val => val.sort === 'LOWEST');

        item.highestGroup = highestGroup;
        item.lowestGroup = lowestGroup;
      }

      // Initialize expanded state
      item.expandedHighest = false;
      item.expandedLowest = false;

      if (this.filters.expandedKey?.has(item.key)) {
        item.expanded = true;
      }
    });
  }

  groupByHitsAndTemplate(data: any[]) {
    const groupedData = data.reduce((acc, item) => {
      const key = item.hits + '_' + item.template;
      if (!acc[key]) {
        acc[key] = {
          key: key,
          hits: item.hits,
          template: item.template,
          sort: item.sort,
          value: []
        };
      }
      acc[key].value.push(item);
      return acc;
    }, {});

    return Object.values(groupedData);
  }


  expandAllItems() {
    if (!this.filters.expandedKey) {
      this.filters.expandedKey = new Set();
    }
    this.filteredData.forEach(item => {
      item.expanded = true;
      item.expandedHighest = true;
      item.expandedLowest = true;
      this.filters.expandedKey.add(item.key);
    });
  }

  collapseAllItems() {
    this.filters.expandedKey.clear();
    this.filteredData.forEach(item => {
      item.expanded = false;
      item.expandedHighest = false;
      item.expandedLowest = false;
    });
  }

  getTranslatedText(item: any): string {
    let translatedText = this.translate.instant('reporting.templates.' + item.template);
    if(item.sort && item.hits){
      const translatedSort = this.translate.instant('reporting.label.' + item.sort);
      translatedText = translatedText.replace('${hits}', item.hits.toString());
      translatedText = translatedText.replace('${sort}', translatedSort);
    }


    return translatedText;
  }

  trackByFn(index, item) {
    return item.id;
  }
}
