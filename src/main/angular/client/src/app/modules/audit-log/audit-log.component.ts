import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {isEmpty, clone} from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {ExcelService} from '../../services/excel.service';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {SearchPipe, OrderPipe} from '../../pipes/core.pipe';

@Component({
  selector: 'app-filter-content',
  templateUrl: './filter-dialog.html'
})
export class FilterModalComponent implements OnInit {
  @Input() allFilter;
  @Input() new;
  @Input() edit;
  @Input() filter;

  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  name: string;

  constructor(private authService: AuthService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.new) {
      this.filter = {
        radio: 'planned',
        paths: [],
        state: [],
        planned: 'today',
        shared: false
      };
    } else {
      this.filter.radio = 'planned';
      this.name = clone(this.filter.name);
    }
  }

  cancel(obj): void {
    if (obj) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.destroy();
    }
  }

}

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.html',
})
export class SearchComponent implements OnInit {

  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() permission: any;
  @Input() isSearch: boolean;

  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  dateFormat: any;
  existingName: any;
  submitted = false;
  isUnique = true;
  objectTypes = ['WORKFLOW',
    'FILEORDERSOURCE',
    'JOBRESOURCE',
    'NOTICEBOARD',
    'LOCK',
    'SCHEDULE',
    'WORKINGDAYSCALENDAR',
    'NONWORKINGDAYSCALENDAR',
    'INCLUDESCRIPT',
    'ORDER',
    'DOCUMENTATION'];
  categories = ['INVENTORY',
    'CONTROLLER',
    'DAILYPLAN',
    'DEPLOYMENT',
    'DOCUMENTATIONS',
    'CERTIFICATES'];

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormatWithTime(this.preferences.dateFormat);
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.authService.currentUserData === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'AUDITLOG',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    const obj: any = this.coreService.clone(result);
    delete obj.shared;
    delete obj.radio;
    if (result.radio != 'current') {
      if (result.from1) {
        fromDate = this.coreService.parseProcessExecuted(result.from1);
      }
      if (result.to1) {
        toDate = this.coreService.parseProcessExecuted(result.to1);
      }
    }

    if (fromDate) {
      obj.from1 = fromDate;
    } else {
      obj.from1 = '0d';
    }
    if (toDate) {
      obj.to1 = toDate;
    } else {
      obj.to1 = '0d';
    }

    configObj.configurationItem = JSON.stringify(obj);
    this.coreService.post('configuration/save', configObj).subscribe({
      next: (res: any) => {
        if (result.id) {
          for (const i in this.allFilter) {
            if (this.allFilter[i].id === result.id) {
              this.allFilter[i] = configObj;
              break;
            }
          }
        } else {
          configObj.id = res.id;
          this.allFilter.push(configObj);
        }
        if (this.isSearch) {
          this.filter.name = '';
        } else {
          this.onCancel.emit(configObj);
        }
        this.submitted = false;
      }, error: () => this.submitted = false
    });
  }

  search(): void {
    this.onSearch.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent implements OnInit, OnDestroy {
  objectType = 'AUDITLOG';
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  adtLog: any = {};
  auditLogs: any = [];
  isLoaded = false;
  reloadState = 'no';
  showSearchPanel = false;
  searchFilter: any = {};
  temp_filter: any = {};
  selectedFiltered: any = {};
  savedFilter: any = {};
  filterList: any = [];
  data = [];
  searchableProperties = ['controllerId', 'category', 'account', 'request', 'created', 'comment', 'ticketLink'];

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modal: NzModalService, private searchPipe: SearchPipe,
              private translate: TranslateService, private excelService: ExcelService, private router: Router,
              private orderPipe: OrderPipe) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  static parseProcessExecuted(regex, obj): any {
    let fromDate;
    let toDate;

    if (/^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.exec(regex)[0];

    } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      const seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2], 10);
      fromDate.setSeconds(toDate.getSeconds() - seconds);
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      fromDate = '0d';
      toDate = '0d';
    } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
      fromDate = '-1d';
      toDate = '-1d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(regex)) {
      const time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(regex);
      fromDate = new Date();
      if (/(pm)/i.test(time[3]) && parseInt(time[1], 10) != 12) {
        fromDate.setHours(parseInt(time[1], 10) - 12);
      } else {
        fromDate.setHours(parseInt(time[1], 10));
      }

      fromDate.setMinutes(parseInt(time[2], 10));
      toDate = new Date();
      if (/(pm)/i.test(time[6]) && parseInt(time[4], 10) != 12) {
        toDate.setHours(parseInt(time[4], 10) - 12);
      } else {
        toDate.setHours(parseInt(time[4], 10));
      }
      toDate.setMinutes(parseInt(time[5], 10));
    }

    if (fromDate) {
      obj.dateFrom = fromDate;
    }
    if (toDate) {
      obj.dateTo = toDate;
    }
    return obj;
  }

  static parseDate(auditSearch, filter): any {
    if (auditSearch.from) {
      filter.dateFrom = new Date(auditSearch.from);
    }
    if (auditSearch.to) {
      filter.dateTo = new Date(auditSearch.to);
    }
    return filter;
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  checkSharedFilters(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType,
      shared: true
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res: any) => {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = res.configurations;
        }
        this.getCustomizations();
      }, error: () => this.getCustomizations()
    });
  }

  getCustomizations(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res: any) => {
        if (this.filterList && this.filterList.length > 0) {
          if (res.configurations && res.configurations.length > 0) {
            this.filterList = this.filterList.concat(res.configurations);
          }
          const data = [];
          for (let i = 0; i < this.filterList.length; i++) {
            let flag = true;
            for (let j = 0; j < data.length; j++) {
              if (data[j].id === this.filterList[i].id) {
                flag = false;
              }
            }
            if (flag) {
              data.push(this.filterList[i]);
            }
          }
          this.filterList = data;
        } else {
          this.filterList = res.configurations;
        }

        if (this.savedFilter.selected) {
          let flag = true;
          this.filterList.forEach((value) => {
            if (value.id === this.savedFilter.selected) {
              flag = false;
              this.coreService.post('configuration', {
                controllerId: value.controllerId,
                id: value.id
              }).subscribe({
                next: (conf: any) => {
                  this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                  this.selectedFiltered.account = value.account;
                  this.load(null);
                }, error: () => {
                  this.savedFilter.selected = undefined;
                  this.load(null);
                }
              });
            }
          });
          if (flag) {
            this.savedFilter.selected = undefined;
            this.load(null);
          }
        } else {
          this.savedFilter.selected = undefined;
          this.load(null);
        }
      }, error: () => {
        this.savedFilter.selected = undefined;
        this.load(null);
      }
    });
  }

  isCustomizationSelected(flag): void {
    if (flag) {
      this.temp_filter = clone(this.adtLog.filter.date);
      this.adtLog.filter.date = '';
    } else {
      if (this.temp_filter) {
        this.adtLog.filter.date = clone(this.temp_filter);
      } else {
        this.adtLog.filter.date = 'today';
      }
    }
  }

  load(date): void {
    if (date) {
      this.adtLog.filter.date = date;
      this.isLoaded = false;
    }
    this.reloadState = 'no';
    let obj: any = {
      controllerId: this.adtLog.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords, 10) || 5000
    };
    if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
      this.isCustomizationSelected(true);
      obj = this.generateRequestObj(this.selectedFiltered, obj);
    } else {
      obj = this.setDateRange(obj);
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('audit_log', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        res.auditLog = this.orderPipe.transform(res.auditLog, this.adtLog.filter.sortBy, this.adtLog.reverse);
        if (res.auditLog && res.auditLog.length === 0) {
          this.adtLog.currentPage = 1;
        }
        this.auditLogs = res.auditLog;
        if (!date) {
          this.data.forEach((item) => {
            if (item.show) {
              for (const i in this.auditLogs) {
                if (item.id === this.auditLogs[i].id) {
                  this.auditLogs[i].show = true;
                  this.auditLogs[i].isLoaded = true;
                  this.auditLogs[i].details = item.details;
                  break;
                }
              }
            }
          });
        }
        this.isLoaded = true;
        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};

    this.adtLog = this.coreService.getAuditLogTab();
    if (!(this.adtLog.current || this.adtLog.current === false)) {
      this.adtLog.current = this.preferences.currentController;
    }
    if (!this.adtLog.filter.date) {
      this.adtLog.filter.date = 'today';
    }
    this.savedFilter = JSON.parse(this.saveService.auditLogFilters) || {};
    if (this.schedulerIds.selected && this.permission.joc && this.permission.joc.administration.customization.view) {
      this.checkSharedFilters();
    } else {
      this.savedFilter.selected = undefined;
      this.load(null);
    }
  }

  private generateRequestObj(object, filter): any {
    if (object.objectName) {
      filter.objectName = object.objectName;
    }
    if (object.comment) {
      filter.comment = object.comment;
    }
    if (object.ticketLink) {
      filter.ticketLink = object.ticketLink;
    }
    if (object.objectTypes) {
      filter.objectTypes = object.objectTypes;
    }
    if (object.categories) {
      filter.categories = object.categories;
    }
    if (object.account) {
      filter.account = object.account;
    }
    if (object.controllerId) {
      filter.controllerId = object.controllerId;
    }
    if (object.radio) {
      if (object.radio == 'planned') {
        filter = AuditLogComponent.parseProcessExecuted(object.planned, filter);
      } else {
        filter = AuditLogComponent.parseDate(object, filter);
      }
    } else if (object.planned) {
      filter = AuditLogComponent.parseProcessExecuted(object.planned, filter);
    }
    return filter;
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AuditLogChanged' || args.eventSnapshots[j].eventType === 'InventoryUpdated'
          || args.eventSnapshots[j].eventType === 'InventoryTreeUpdated' || args.eventSnapshots[j].eventType === 'InventoryTrashUpdated'
          || args.eventSnapshots[j].eventType === 'InventoryTrashTreeUpdated' || args.eventSnapshots[j].eventType === 'DocumentationUpdated'
          || args.eventSnapshots[j].eventType === 'DocumentationTreeUpdated') {
          if (this.searchFilter && !isEmpty(this.searchFilter)) {
            this.search(true);
          } else {
            this.load(null);
          }
          break;
        }
      }
    }
  }

  private setDateRange(filter): any {
    if (this.adtLog.filter.date == 'all') {

    } else if (this.adtLog.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else {
      filter.dateFrom = this.adtLog.filter.date;
    }
    return filter;
  }

  /* ----------------------Action --------------------- */
  action(type, obj, self): void {
    if (type === 'DELETE') {
      if (self.savedFilter.selected == obj.id) {
        self.savedFilter.selected = undefined;
        self.isCustomizationSelected(false);
        self.adtLog.selectedView = false;
        self.selectedFiltered = {};
        self.setDateRange({});
        self.load();
      } else {
        if (self.filterList.length == 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.adtLog.selectedView = false;
          self.selectedFiltered = {};
        }
      }
      self.saveService.setAuditLog(self.savedFilter);
      self.saveService.save();
    } else if (type === 'MAKEFAV') {
      self.savedFilter.favorite = obj.id;
      self.adtLog.selectedView = true;
      self.saveService.setAuditLog(self.savedFilter);
      self.saveService.save();
      self.load();
    } else if (type === 'REMOVEFAV') {
      self.savedFilter.favorite = '';
      self.saveService.setAuditLog(self.savedFilter);
      self.saveService.save();
    }
  }

  changeController(): void {
    this.load(null);
  }

  navToDeploymentHistory(auditLog): void {
    if (auditLog.commitId) {
      this.router.navigate(['/history/deployment'], {
        queryParams: {
          commitId: auditLog.commitId,
          controllerId: (!auditLog.controllerId || auditLog.controllerId === '-') ? this.schedulerIds.selected : auditLog.controllerId
        }
      });
    } else {
      this.router.navigate(['/history/daily_plan'], {
        queryParams: {
          auditLogId: auditLog.id,
          controllerId: (!auditLog.controllerId || auditLog.controllerId === '-') ? this.schedulerIds.selected : auditLog.controllerId
        }
      });
    }
  }

  showDetail(auditLog): void {
    auditLog.show = true;
    if (!auditLog.isLoaded) {
      this.coreService.post('audit_log/details', {
        auditLogId: auditLog.id
      }).subscribe({
        next: (res: any) => {
          auditLog.details = res.auditLogDetails;
          auditLog.isLoaded = true;
        }, error: () => auditLog.isLoaded = true
      });
    }
  }

  sort(propertyName): void {
    this.adtLog.reverse = !this.adtLog.reverse;
    this.adtLog.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.adtLog.filter.sortBy, this.adtLog.reverse);
  }

  pageIndexChange($event): void {
    this.adtLog.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.adtLog.entryPerPage = $event;
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.adtLog.searchText ? this.searchPipe.transform(this.auditLogs, this.adtLog.searchText, this.searchableProperties) : this.auditLogs;
    this.data = [...this.data];
  }

  exportToExcel(): void {
    let created = '', controllerId = '', category = '', account = '',
      request = '', comment = '', timeSpend = '', ticketLink = '';
    this.translate.get('auditLog.label.created').subscribe(translatedValue => {
      created = translatedValue;
    });
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('auditLog.label.account').subscribe(translatedValue => {
      account = translatedValue;
    });
    this.translate.get('auditLog.label.request').subscribe(translatedValue => {
      request = translatedValue;
    });
    this.translate.get('auditLog.label.category').subscribe(translatedValue => {
      category = translatedValue;
    });
    this.translate.get('auditLog.label.comment').subscribe(translatedValue => {
      comment = translatedValue;
    });
    this.translate.get('auditLog.label.timeSpend').subscribe(translatedValue => {
      timeSpend = translatedValue;
    });
    this.translate.get('auditLog.label.ticketLink').subscribe(translatedValue => {
      ticketLink = translatedValue;
    });
    const data = [];
    for (let i = 0; i < this.auditLogs.length; i++) {
      const obj: any = {};
      if (!this.adtLog.current) {
        obj[controllerId] = this.auditLogs[i].controllerId;
      }
      obj[created] = this.coreService.stringToDate(this.preferences, this.auditLogs[i].created);
      obj[account] = this.auditLogs[i].account;
      obj[request] = this.auditLogs[i].request;
      obj[category] = this.auditLogs[i].category;
      obj[comment] = this.auditLogs[i].comment;
      obj[timeSpend] = this.auditLogs[i].timeSpend;
      obj[ticketLink] = this.auditLogs[i].ticketLink;

      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-audit-logs');
  }

  /* ----------------------Advance Search --------------------- */
  advancedSearch(): void {
    this.showSearchPanel = true;
    this.searchFilter = {
      radio: 'current',
      planned: 'today',
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date()
    };
  }

  cancel(): void {
    if (!this.adtLog.filter.date) {
      this.adtLog.filter.date = 'today';
    }
    this.showSearchPanel = false;
    this.searchFilter = {};
    this.load(null);
  }

  expandDetails(): void {
    const logs = this.getCurrentData(this.data, this.adtLog);
    logs.forEach((value) => {
      this.showDetail(value);
    });
  }

  collapseDetails(): void {
    const logs = this.getCurrentData(this.data, this.adtLog);
    logs.forEach((value: any) => {
      value.show = false;
    });
  }

  search(flag = false): void {
    if (!flag) {
      this.isLoaded = false;
    }
    let filter: any = {
      controllerId: this.adtLog.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords, 10),
      account: this.searchFilter.account ? this.searchFilter.account : undefined,
      timeZone: this.preferences.zone
    };

    this.adtLog.filter.date = '';
    filter = this.generateRequestObj(this.searchFilter, filter);
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
      filter.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateFrom)._d;
    }
    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      filter.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateTo)._d;
    }
    this.coreService.post('audit_log', filter).subscribe({
      next: (res: any) => {
        res.auditLog = this.orderPipe.transform(res.auditLog, this.adtLog.filter.sortBy, this.adtLog.reverse);
        this.auditLogs = res.auditLog;
        this.isLoaded = true;
        this.searchInResult();
      }, error: () => this.isLoaded = true
    });
  }

  /* ---- Customization ------ */
  createCustomization(): void {
    if (this.schedulerIds.selected) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: FilterModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          permission: this.permission,
          allFilter: this.filterList,
          new: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  editFilters(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EditFilterModalComponent,
      nzComponentParams: {
        filterList: this.filterList,
        favorite: this.savedFilter.favorite,
        permission: this.permission,
        username: this.authService.currentUserData,
        action: this.action,
        self: this
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(obj => {
      if (obj) {
        if (obj.type === 'EDIT') {
          this.editFilter(obj);
        } else if (obj.type === 'COPY') {
          this.copyFilter(obj);
        }
      }
    });
  }

  changeFilter(filter): void {
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.adtLog.selectedView = true;
      this.coreService.post('configuration', {
        controllerId: filter.controllerId,
        id: filter.id
      }).subscribe((conf: any) => {
        this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
        this.selectedFiltered.account = filter.account;
        this.load(null);
      });
    } else {
      this.isCustomizationSelected(false);
      this.savedFilter.selected = filter;
      this.adtLog.selectedView = false;
      this.selectedFiltered = {};
      this.setDateRange({});
      this.load(null);
    }

    this.saveService.setAuditLog(this.savedFilter);
    this.saveService.save();
  }

  private editFilter(filter): void {
    this.openFilterModal(filter, false);
  }

  private copyFilter(filter): void {
    this.openFilterModal(filter, true);
  }

  private openFilterModal(filter, isCopy): void {
    if (this.schedulerIds.selected) {
      let filterObj: any = {};
      this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
        filterObj = JSON.parse(conf.configuration.configurationItem);
        filterObj.shared = filter.shared;
        if (isCopy) {
          filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);
        } else {
          filterObj.id = filter.id;
        }
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: FilterModalComponent,
          nzClassName: 'lg',
          nzComponentParams: {
            permission: this.permission,
            allFilter: this.filterList,
            filter: filterObj,
            edit: !isCopy
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(obj => {
          if (obj && this.savedFilter.selected && filterObj.id == this.savedFilter.selected) {
            this.changeFilter(filterObj);
          }
        });
      });
    }
  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.auditLogs = [];
      this.data = [];
      this.reloadState = 'yes';
      this.isLoaded = true;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.isLoaded = false;
      this.load(null);
    }
  }
}
