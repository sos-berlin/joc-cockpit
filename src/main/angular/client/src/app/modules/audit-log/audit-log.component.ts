import {Component, OnInit, Input, OnDestroy, EventEmitter, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {ExcelService} from '../../services/excel.service';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {SearchPipe} from '../../pipes/core.pipe';

@Component({
  selector: 'app-filter-content',
  templateUrl: './filter-dialog.html',
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

  constructor(private authService: AuthService, public activeModal: NgbActiveModal) {
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
      this.name = _.clone(this.filter.name);
    }
  }

  cancel(obj): void {
    if (obj) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.dismiss('');
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

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
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
    let configObj = {
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
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.workflow = result.workflow;
    obj.orderId = result.orderId;
    obj.job = result.job;
    obj.state = result.state;
    obj.name = result.name;
    if (result.radio != 'current') {
      if (result.from1) {
        fromDate = this.coreService.parseProcessExecuted(result.from1);
      }
      if (result.to1) {
        toDate = this.coreService.parseProcessExecuted(result.to1);
      }
    }

    if (result.radio) {
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
    } else {
      obj.planned = result.planned;
    }
    configObj.configurationItem = JSON.stringify(obj);
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
      configObj.id = res.id;
      this.allFilter.push(configObj);
      if (this.isSearch) {
        this.filter.name = '';
      } else {
        this.onCancel.emit(configObj);
      }
      this.submitted = false;
    }, err => {
      this.submitted = false;
    });
  }

  search() {
    this.onSearch.emit();
  }

  cancel() {
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
  showSearchPanel = false;
  searchFilter: any = {};
  temp_filter: any = {};
  selectedFiltered: any = {};
  savedFilter: any = {};
  filterList: any = [];
  data = [];
  searchableProperties = ['controllerId', 'orderId', 'account', 'request', 'workflow', 'created', 'comment', 'ticketLink'];

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modalService: NgbModal, private searchPipe: SearchPipe,
              private translate: TranslateService, private excelService: ExcelService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};

    this.adtLog = this.coreService.getAuditLogTab();
    if (!(this.adtLog.current || this.adtLog.current === false)) {
      this.adtLog.current = this.preferences.currentController;
    }
    this.savedFilter = JSON.parse(this.saveService.auditLogFilters) || {};
    if (this.schedulerIds.selected && this.permission.joc && this.permission.joc.administration.customization.view) {
      this.checkSharedFilters();
    } else {
      this.savedFilter.selected = undefined;
      this.load(null);
    }
  }

  checkSharedFilters(): void {
    let obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType,
      shared: true
    };
    this.coreService.post('configurations', obj).subscribe((res: any) => {
      if (res.configurations && res.configurations.length > 0) {
        this.filterList = res.configurations;
      }
      this.getCustomizations();
    }, () => {
      this.getCustomizations();
    });
  }

  getCustomizations(): void {
    let obj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType
    };
    this.coreService.post('configurations', obj).subscribe((res: any) => {
      if (this.filterList && this.filterList.length > 0) {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = this.filterList.concat(res.configurations);
        }
        let data = [];
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
            }).subscribe((conf: any) => {
              this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
              this.selectedFiltered.account = value.account;
              this.load(null);
            }, () => {
              this.savedFilter.selected = undefined;
              this.load(null);
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
    }, () => {
      this.savedFilter.selected = undefined;
      this.load(null);
    });
  }

  isCustomizationSelected(flag): void {
    if (flag) {
      this.temp_filter = _.clone(this.adtLog.filter.date);
      this.adtLog.filter.date = '';
    } else {
      if (this.temp_filter) {
        this.adtLog.filter.date = _.clone(this.temp_filter);
      } else {
        this.adtLog.filter.date = 'today';
      }
    }
  }

  load(date): void {
    if (date) {
      this.adtLog.filter.date = date;
    }
    let obj:any = {
      controllerId: this.adtLog.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords, 10) || 5000
    };
    if (this.selectedFiltered && !_.isEmpty(this.selectedFiltered)) {
      this.isCustomizationSelected(true);
      obj = this.generateRequestObj(this.selectedFiltered, obj);
    } else {
      obj = this.setDateRange(obj);
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
      this.searchInResult();
      this.isLoaded = true;
    }, (err) => {
      this.isLoaded = true;
    });
  }

  changeController(): void {
    this.load(null);
  }

  sort(propertyName): void {
    this.adtLog.reverse = !this.adtLog.reverse;
    this.adtLog.filter.sortBy = propertyName;
  }

  pageIndexChange($event): void {
    this.adtLog.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.adtLog.entryPerPage = $event;
  }

  searchInResult(): void {
    this.data = this.adtLog.searchText ? this.searchPipe.transform(this.auditLogs, this.adtLog.searchText, this.searchableProperties) : this.auditLogs;
    this.data = [...this.data];
  }

  exportToExcel(): void {
    let created = '', controllerId = '', workflow = '', orderId = '', account = '',
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
    this.translate.get('auditLog.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('auditLog.label.orderId').subscribe(translatedValue => {
      orderId = translatedValue;
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
    let data = [];
    for (let i = 0; i < this.auditLogs.length; i++) {
      let obj: any = {};
      if (!this.adtLog.current) {
        obj[controllerId] = this.auditLogs[i].orderId;
      }
      obj[created] = this.coreService.stringToDate(this.preferences, this.auditLogs[i].created);
      obj[account] = this.auditLogs[i].account;
      obj[request] = this.auditLogs[i].request;
      obj[workflow] = this.auditLogs[i].workflow;
      obj[orderId] = this.auditLogs[i].orderId;
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
      from: new Date(),
      to: new Date(),
      toTime: new Date()
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

  private generateRequestObj(object, filter): any {
    if (object.workflow) {
      filter.orders = [];
      if (object.orderIds) {
        let s = object.orderIds.replace(/\s*(,|^|$)\s*/g, '$1');
        let orderIds = s.split(',');
        let self = this;
        orderIds.forEach((value) => {
          filter.orders.push({workflow: self.searchFilter.workflow, orderId: value});
        });
      } else {
        filter.orders.push({workflow: object.workflow});
      }
    }
    if (object.regex) {
      filter.regex = object.regex;
    }
    if (object.radio == 'planned') {
      filter = this.parseProcessExecuted(object.planned, filter);
    } else {
      filter = this.parseDate(object, filter);
    }
    return filter;
  }

  search(): void {
    this.isLoaded = false;
    let filter: any = {
      controllerId: this.adtLog.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords, 10),
      account: this.searchFilter.account ? this.searchFilter.account : undefined,
      timeZone: this.preferences.zone
    };

    this.adtLog.filter.date = '';
    filter = this.generateRequestObj(this.searchFilter, filter);
    this.coreService.post('audit_log', filter).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
      this.searchInResult();
      this.isLoaded = true;
    }, (err) => {
      console.log(err);
      this.isLoaded = true;
    });
  }

  /* ----------------------Action --------------------- */

  /* ---- Customization ------ */
  createCustomization(): void {
    if (this.schedulerIds.selected) {
      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.allFilter = this.filterList;
      modalRef.componentInstance.new = true;
      modalRef.result.then((configObj) => {
        if (this.filterList.length == 1) {
          this.savedFilter.selected = configObj.id;
          this.adtLog.selectedView = true;
          this.selectedFiltered = configObj;
          this.isCustomizationSelected(true);
          this.load(null);
          this.saveService.setAuditLog(this.savedFilter);
          this.saveService.save();
        }
      }, (reason) => {
        console.log('close...', reason);
      });
    }
  }

  editFilters(): void {
    const modalRef = this.modalService.open(EditFilterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.filterList = this.filterList;
    modalRef.componentInstance.favorite = this.savedFilter.favorite;
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.username = this.authService.currentUserData;
    modalRef.componentInstance.action = this.action;
    modalRef.componentInstance.self = this;

    modalRef.result.then((obj) => {
      if (obj.type === 'EDIT') {
        this.editFilter(obj);
      } else if (obj.type === 'COPY') {
        this.copyFilter(obj);
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  action(type, obj, self): void {
    if (type === 'DELETE') {
      if (self.savedFilter.selected == obj.id) {
        self.savedFilter.selected = undefined;
        self.isCustomizationSelected(false);
        self.adtLog.selectedView = false;
        self.selectedFiltered = undefined;
        self.setDateRange(null);
        self.load();
      } else {
        if (self.filterList.length == 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.adtLog.selectedView = false;
          self.selectedFiltered = undefined;
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
      this.setDateRange(null);
      this.load(null);
    }

    this.saveService.setAuditLog(this.savedFilter);
    this.saveService.save();
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AuditLogChanged') {
          this.load(null);
          break;
        }
      }
    }
  }

  private setDateRange(filter): void {
    if (this.adtLog.filter.date == 'all') {

    } else if (this.adtLog.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else {
      filter.dateFrom = this.adtLog.filter.date;
    }
    return filter;
  }

  private parseProcessExecuted(regex, obj): void {
    let fromDate;
    let toDate;

    if (/^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.exec(regex)[0];

    } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      let seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2], 10);
      fromDate.setSeconds(toDate.getSeconds() - seconds);
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      fromDate = '0d';
      toDate = '0d';
    } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
      fromDate = '-1d';
      toDate = '0d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      let date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      let arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      let date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      let arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      let date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      let arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      let date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      let arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(regex)) {
      let time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(regex);
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

  private parseDate(auditSearch, filter): void {

    if (auditSearch.from) {
      let fromDate = new Date(auditSearch.from);
      if (auditSearch.fromTime) {
        let fromTime = new Date(auditSearch.fromTime);
        fromDate.setHours(fromTime.getHours());
        fromDate.setMinutes(fromTime.getMinutes());
        fromDate.setSeconds(fromTime.getSeconds());
      } else {
        fromDate.setHours(0);
        fromDate.setMinutes(0);
        fromDate.setSeconds(0);
      }
      fromDate.setMilliseconds(0);
      filter.dateFrom = fromDate;
    }
    if (auditSearch.to) {
      let toDate = new Date(auditSearch.to);
      if (auditSearch.toTime) {
        let toTime = new Date(auditSearch.toTime);
        toDate.setHours(toTime.getHours());
        toDate.setMinutes(toTime.getMinutes());
        toDate.setSeconds(toTime.getSeconds());

      } else {
        toDate.setHours(0);
        toDate.setMinutes(0);
        toDate.setSeconds(0);
      }
      toDate.setMilliseconds(0);

      filter.dateTo = toDate;
    }

    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      delete filter['timeZone'];
    }
    return filter;
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
        const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
        modalRef.componentInstance.permission = this.permission;
        modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
        modalRef.componentInstance.allFilter = this.filterList;
        modalRef.componentInstance.filter = filterObj;
        modalRef.componentInstance.edit = !isCopy;
        modalRef.result.then((configObj) => {

        }, (reason) => {
          console.log('close...', reason);
        });
      });
    }
  }
}
