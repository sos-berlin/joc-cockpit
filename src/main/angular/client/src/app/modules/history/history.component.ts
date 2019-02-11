import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {SaveService} from '../../services/save.service';

import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';

import * as _ from 'underscore';
import * as moment from 'moment';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './filter-dialog.html',
})

export class FilterModalComponent implements OnInit {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};

  @Input() allFilter;
  @Input() new;
  @Input() edit;
  @Input() filter;
  @Input() type;

  name: string;

  constructor(private authService: AuthService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.new) {
      this.filter = {
        radio: 'planned',
        planned: 'today',
        shared: false
      };
    } else {
      this.filter.radio = 'planned';
      this.name = _.clone(this.filter.name);
    }
  }

  cancel(obj) {
    if (obj) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.dismiss('');
    }
  }

}

@Component({
  selector: 'app-order-form-template',
  templateUrl: './order-form-template.html',
})
export class OrderSearchComponent implements OnInit {

  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() permission: any;
  @Input() isSearch: boolean;

  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  dateFormat: any;
  dateFormatM: any;
  config: any = {};
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.config = {
      format: this.dateFormatM
    };
  }

  getFolderTree(flag) {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'ORDER_HISTORY';
    modalRef.componentInstance.showCheckBox = true;
    modalRef.result.then((result) => {
      this.filter.paths = result;
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  remove(path) {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
  }

  checkFilterName() {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.permission.user === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    let configObj = {
      jobschedulerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'ORDER_HISTORY',
      name: result.name,
      shared: result.shared,
      id: 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.jobChain = result.jobChain;
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
  selector: 'app-task-form-template',
  templateUrl: './task-form-template.html',
})
export class TaskSearchComponent implements OnInit {

  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() permission: any;
  @Input() isSearch: boolean;

  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  dateFormat: any;
  dateFormatM: any;
  config: any = {};
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.config = {
      format: this.dateFormatM
    };
  }

  getFolderTree(flag) {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'TASK_HISTORY';
    modalRef.componentInstance.showCheckBox = true;
    modalRef.result.then((result) => {
      this.filter.paths = result;
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  remove(path) {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
  }

  checkFilterName() {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.permission.user === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    let configObj = {
      jobschedulerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'TASK_HISTORY',
      name: result.name,
      shared: result.shared,
      id: 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.jobChain = result.jobChain;
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
  selector: 'app-yade-form-template',
  templateUrl: './yade-form-template.html',
})
export class YadeSearchComponent implements OnInit {

  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() permission: any;
  @Input() isSearch: boolean;

  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  dateFormat: any;
  dateFormatM: any;
  config: any = {};
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.config = {
      format: this.dateFormatM
    };
  }

  getFolderTree(flag) {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'YADE_HISTORY';
    modalRef.componentInstance.showCheckBox = true;
    modalRef.result.then((result) => {
      this.filter.paths = result;
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  remove(path) {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
  }

  checkFilterName() {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.permission.user === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    let configObj = {
      jobschedulerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE_HISTORY',
      name: result.name,
      shared: result.shared,
      id: 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.jobChain = result.jobChain;
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
  selector: 'app-history',
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit, OnDestroy {

  historyView: any = {};
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  isLoading = false;
  loading = false;
  loadConfig = false;
  loadIgnoreList = false;
  isLoaded = false;
  showSearchPanel = false;
  dateFormat: any;
  dateFormatM: any;
  config: any = {};
  notAuthenticate = false;
  historyFilters: any = {};
  selectedFiltered1: any = {};
  selectedFiltered2: any = {};
  selectedFiltered3: any = {};
  temp_filter1: any = {};
  temp_filter2: any = {};
  temp_filter3: any = {};

  historyFilterObj: any = {};

  savedHistoryFilter: any = {};
  savedJobHistoryFilter: any = {};
  savedYadeHistoryFilter: any = {};

  searchKey: string;

  savedIgnoreList: any = {jobChains: [], jobs: [], orders: []};
  jobChainSearch: any = {paths: []};
  jobSearch: any = {paths: []};
  yadeSearch: any = {paths: []};

  order: any = {};
  task: any = {};
  yade: any = {};

  historys: any = [];
  jobHistorys: any = [];
  yadeHistorys: any = [];

  orderHistoryFilterList: any = [];
  jobHistoryFilterList: any = [];
  yadeHistoryFilterList: any = [];

  object: any = {};

  ignoreListConfigId = 0;

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService, private dataService: DataService, private modalService: NgbModal) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf();
    });
  }

  ngOnInit() {
    this.initConf();
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  changeJobScheduler() {
    this.init();
  }

  orderParseDate(obj) {
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true') && ((this.savedIgnoreList.jobChains && this.savedIgnoreList.jobChains.length > 0) || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0))) {
      obj.excludeOrders = [];
      this.savedIgnoreList.jobChains.forEach(function (jobChain) {
        obj.excludeOrders.push({jobChain: jobChain});
      });

      this.savedIgnoreList.orders.forEach(function (order) {
        obj.excludeOrders.push(order);
      });
    }

    if (this.selectedFiltered1.regex) {
      obj.regex = this.selectedFiltered1.regex;
    }
    if (this.selectedFiltered1.paths && this.selectedFiltered1.paths.length > 0) {
      obj.folders = [];
      this.selectedFiltered1.paths.forEach(function (value) {
        obj.folders.push({folder: value, recursive: true});
      });
    }
    if ((this.selectedFiltered1.jobChains && this.selectedFiltered1.jobChains.length > 0) || (this.selectedFiltered1.orders && this.selectedFiltered1.orders.length > 0)) {
      obj.orders = [];
      this.selectedFiltered1.orders.forEach(function (value) {
        obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
      });
      if (!this.selectedFiltered1.orders || this.selectedFiltered1.orders.length == 0) {
        this.selectedFiltered1.jobChains.forEach(function (value) {
          obj.orders.push({jobChain: value});
        });
      } else {
        for (let i = 0; i < this.selectedFiltered1.jobChains.length; i++) {
          let flag = true;
          for (let j = 0; j < obj.orders.length; j++) {
            if (obj.orders[j].jobChain == this.selectedFiltered1.jobChains[i]) {
              flag = false;
              break;
            }
          }
          if (flag) {
            obj.orders.push({jobChain: this.selectedFiltered1.jobChains[i]});
          }
        }
      }
    }
    if (this.selectedFiltered1.state && this.selectedFiltered1.state.length > 0) {
      obj.historyStates = this.selectedFiltered1.state;
    }

    obj = this.coreService.parseProcessExecutedRegex(this.selectedFiltered1.planned, obj);
    return obj;
  }

  isCustomizationSelected1(flag) {
    if (flag) {
      this.temp_filter1.historyStates = _.clone(this.order.filter.historyStates);
      this.temp_filter1.date = _.clone(this.order.filter.date);
      this.order.filter.historyStates = '';
      this.order.filter.date = '';
    } else {
      if (this.temp_filter1.historyStates) {
        this.order.filter.historyStates = _.clone(this.temp_filter1.historyStates);
        this.order.filter.date = _.clone(this.temp_filter1.date);
      } else {
        this.order.filter.historyStates = 'ALL';
        this.order.filter.date = 'today';
      }
    }
  }

  setOrderDateRange(filter) {
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true') && ((this.savedIgnoreList.jobChains && this.savedIgnoreList.jobChains.length > 0) || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0))) {
      filter.excludeOrders = [];
      this.savedIgnoreList.jobChains.forEach(function (jobChain) {
        filter.excludeOrders.push({jobChain: jobChain});
      });

      this.savedIgnoreList.orders.forEach(function (order) {
        filter.excludeOrders.push(order);
      });
    }

    if (this.order.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';

    } else if (this.order.filter.date && this.order.filter.date != 'all') {
      filter.dateFrom = this.order.filter.date;
    }

    return filter;
  }

  orderHistory(obj) {
    this.historyFilters.type = 'ORDER';
    if (!obj) {
      obj = {jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : ''};
    }
    this.isLoading = false;
    if (this.selectedFiltered1 && !_.isEmpty(this.selectedFiltered1)) {
      this.isCustomizationSelected1(true);
      obj = this.orderParseDate(obj);
    } else {
      obj = this.setOrderDateRange(obj);
      if (this.order.filter.historyStates && this.order.filter.historyStates != 'ALL' && this.order.filter.historyStates.length > 0) {
        obj.historyStates = [];
        obj.historyStates.push(this.order.filter.historyStates);
      }
    }
    obj.limit = parseInt(this.preferences.maxRecords, 10);
    obj.timeZone = this.preferences.zone;
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      delete obj['timeZone'];
    }
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = moment(obj.dateFrom).tz(this.preferences.zone);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = moment(obj.dateTo).tz(this.preferences.zone);
    }
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.historys = this.setDuration(res);
      this.isLoading = true;
      this.isLoaded = true;
    }, () => {
      this.isLoading = true;
      this.isLoaded = true;
    });
  }

  isCustomizationSelected2(flag) {
    if (flag) {
      this.temp_filter2.historyStates = _.clone(this.task.filter.historyStates);
      this.temp_filter2.date = _.clone(this.task.filter.date);
      this.task.filter.historyStates = '';
      this.task.filter.date = '';
    } else {
      if (this.temp_filter2.historyStates) {
        this.task.filter.historyStates = _.clone(this.temp_filter2.historyStates);
        this.task.filter.date = _.clone(this.temp_filter2.date);
      } else {
        this.task.filter.historyStates = 'all';
        this.task.filter.date = 'today';
      }
    }
  }

  jobParseDate(obj) {
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true') && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {

      obj.excludeJobs = [];
      this.savedIgnoreList.jobs.forEach(function (job) {
        obj.excludeJobs.push({job: job});
      });
    }

    if (this.selectedFiltered2.regex) {
      obj.regex = this.selectedFiltered2.regex;
    }
    if (this.selectedFiltered2.state && this.selectedFiltered2.state.length > 0) {
      obj.historyStates = this.selectedFiltered2.state;
    }
    if (this.selectedFiltered2.paths && this.selectedFiltered2.paths.length > 0) {
      obj.folders = [];
      this.selectedFiltered2.paths.forEach(function (value) {
        obj.folders.push({folder: value, recursive: true});
      });
    }
    if (this.selectedFiltered2.jobs && this.selectedFiltered2.jobs.length > 0) {
      obj.jobs = [];

      this.selectedFiltered2.jobs.forEach(function (value) {
        obj.jobs.push({job: value});
      });

    }
    obj = this.coreService.parseProcessExecutedRegex(this.selectedFiltered2.planned, obj);
    return obj;
  }

  setTaskDateRange(filter) {
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true') && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
      filter.excludeJobs = [];
      this.savedIgnoreList.jobs.forEach(function (job) {
        filter.excludeJobs.push({job: job});
      });
    }
    if (this.task.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else if (this.task.filter.date && this.task.filter.date != 'all') {
      filter.dateFrom = this.task.filter.date;
    }
    return filter;
  }

  taskHistory(obj) {
    this.historyFilters.type = 'TASK';

    if (!obj) {
      obj = {jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : ''};
    }
    this.isLoading = false;

    if (this.selectedFiltered2 && !_.isEmpty(this.selectedFiltered2)) {
      this.isCustomizationSelected2(true);
      obj = this.jobParseDate(obj);
    } else {
      obj = this.setTaskDateRange(obj);
      if (this.task.filter.historyStates && this.task.filter.historyStates != 'all' && this.task.filter.historyStates.length > 0) {
        obj.historyStates = [];
        obj.historyStates.push(this.task.filter.historyStates);
      }
    }
    obj.limit = parseInt(this.preferences.maxRecords, 10);
    obj.timeZone = this.preferences.zone;

    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      delete obj['timeZone'];
    }
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = moment(obj.dateFrom).tz(this.preferences.zone);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = moment(obj.dateTo).tz(this.preferences.zone);
    }
    this.coreService.post('tasks/history', obj).subscribe((res) => {
      this.jobHistorys = this.setDuration(res);
      this.isLoading = true;
      this.isLoaded = true;
    }, () => {
      this.isLoading = true;
      this.isLoaded = true;
    });
  }

  isCustomizationSelected3(flag) {
    if (flag) {
      this.temp_filter3.states = _.clone(this.yade.filter.historyStates);
      this.temp_filter3.date = _.clone(this.yade.filter.date);
      this.yade.filter.historyStates = '';
      this.yade.filter.date = '';
    } else {
      if (this.temp_filter3.states) {
        this.task.filter.historyStates = _.clone(this.temp_filter3.historyStates);
        this.task.filter.date = _.clone(this.temp_filter3.date);
      } else {
        this.yade.filter.historyStates = 'all';
        this.yade.filter.date = 'today';
      }
    }
  }

  setYadeDateRange(filter) {
    if (this.yade.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else if (this.yade.filter.date && this.yade.filter.date != 'all') {
      filter.dateFrom = this.yade.filter.date;
    }
    return filter;
  }

  yadeHistory(obj) {
    this.historyFilters.type = 'YADE';
    if (!obj) {
      obj = {jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : ''};
    }
    this.isLoading = false;
    if (this.selectedFiltered3 && !_.isEmpty(this.selectedFiltered3)) {
      this.isCustomizationSelected3(true);
      // obj = this.yadeParseDate(obj);
    } else {
      obj = this.setYadeDateRange(obj);
      if (this.yade.filter.historyStates && this.yade.filter.historyStates != 'all' && this.yade.filter.historyStates.length > 0) {
        obj.states = [];
        obj.states.push(this.yade.filter.historyStates);
      }
    }
    obj.limit = parseInt(this.preferences.maxRecords);
    obj.timeZone = this.preferences.zone;
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      delete obj['timeZone'];
    }
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = moment(obj.dateFrom).tz(this.preferences.zone);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = moment(obj.dateTo).tz(this.preferences.zone);
    }
    obj.compact = true;
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      this.yadeHistorys = res.transfers;
      this.isLoading = true;
      this.isLoaded = true;
    }, () => {
      this.isLoading = true;
      this.isLoaded = true;
    });
  }

  search(flag) {
    if (!flag) {
      this.loading = true;
    }
    let obj = {
      jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxRecords, 10)
    };
  }

  advancedSearch() {
    this.showSearchPanel = true;
    this.object.paths = [];
    this.object.orders = [];
    this.object.jobChains = [];
    this.object.jobs = [];

    this.jobChainSearch = {
      radio: 'current',
      planned: 'today',
      from: moment().format(this.dateFormatM),
      fromTime: '00:00',
      to: moment().format(this.dateFormatM),
      toTime: '24:00'
    };
    this.jobSearch = {
      radio: 'current',
      planned: 'today',
      from: moment().format(this.dateFormatM),
      fromTime: '00:00',
      to: moment().format(this.dateFormatM),
      toTime: '24:00'
    };
    this.yadeSearch = {
      radio: 'current',
      planned: 'today',
      from: moment().format(this.dateFormatM),
      fromTime: '00:00',
      to: moment().format(this.dateFormatM),
      toTime: '24:00'
    };

  }

  cancel() {
    this.showSearchPanel = false;
    this.loadHistory(null, null);
  }

  loadHistory(type, value) {
    if (!this.order.filter.historyStates) {
      this.order.filter.historyStates = 'ALL';
    }
    if (!this.order.filter.date) {
      this.order.filter.date = 'today';
    }
    if (!this.task.filter.historyStates) {
      this.task.filter.historyStates = 'ALL';
    }
    if (!this.task.filter.date) {
      this.task.filter.date = 'today';
    }
    if (!this.yade.filter.historyStates) {
      this.yade.filter.historyStates = 'ALL';
    }
    if (!this.yade.filter.date) {
      this.yade.filter.date = 'today';
    }

    if (this.historyFilters.type == 'TASK') {
      this.jobSearch = {};
      this.jobSearch.date = 'date';
      if (type === 'STATE') {
        this.task.filter.historyStates = value;
      } else if (type === 'DATE') {
        this.task.filter.date = value;
      }
    } else if (this.historyFilters.type == 'ORDER') {
      this.jobChainSearch = {};
      this.jobChainSearch.date = 'date';
      if (type === 'STATE') {
        this.order.filter.historyStates = value;
      } else if (type === 'DATE') {
        this.order.filter.date = value;
      }

    } else {
      this.yadeSearch = {};
      this.yadeSearch.date = 'date';
      if (type === 'STATE') {
        this.yade.filter.historyStates = value;
      } else if (type === 'DATE') {
        this.yade.filter.date = value;
      }
    }
    this.init();
  }

  /**--------------- sorting and pagination -------------------*/
  sortBy(propertyName) {
    this.order.reverse = !this.order.reverse;
    this.order.filter.sortBy = propertyName;
  }

  sortBy1(propertyName) {
    this.task.reverse = !this.task.reverse;
    this.task.filter.sortBy = propertyName;
  }

  sortBy2(propertyName) {
    this.yade.reverse = !this.yade.reverse;
    this.yade.filter.sortBy = propertyName;
  }

  exportToExcel() {
    $('#dailyPlanTableId').table2excel({
      exclude: '.tableexport-ignore',
      filename: 'jobscheduler-histroy',
      fileext: '.xls',
      exclude_img: false,
      exclude_links: false,
      exclude_inputs: false
    });
  }

  showPanelFuc(data) {
    data.show = true;
    data.steps = [];
    let obj = {
      jobschedulerId: data.jobschedulerId || this.schedulerIds.selected,
      jobChain: data.jobChain,
      orderId: data.orderId,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      data.steps = res.history.steps;
    });
  }

  showTransferFuc(data) {
    const obj = {
      jobschedulerId: data.jobschedulerId || this.schedulerIds.selected,
      transferIds: [data.id]
    };
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      data = _.extend(data, res.transfers[0]);
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
    data.show = true;
    data.files = [];
    this.coreService.post('yade/files', obj).subscribe((res: any) => {
      data.files = res.files;
    });
  };

  /* --------------------------Ignore List -----------------------*/
  addOrderToIgnoreList(orderId, jobChain) {
    let obj = {
      jobChain: jobChain,
      orderId: orderId
    };

    if (this.savedIgnoreList.orders.indexOf(obj) === -1) {
      this.savedIgnoreList.orders.push(obj);
      /*      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
              if (jobChainSearch) {
                this.search(true);
              } else {
                this.init();
              }
            }
            configObj.configurationType = "IGNORELIST";
            configObj.id = this.ignoreListConfigId;
            configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
            UserService.saveConfiguration(configObj).then(function (res) {
              this.ignoreListConfigId = res.id;
            })*/
    }
  }

  addJobToIgnoreList(name) {
    if (this.savedIgnoreList.jobs.indexOf(name) === -1) {
      this.savedIgnoreList.jobs.push(name);
      /*      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
              if (jobSearch) {
                this.search(true);
              } else {
                this.init();
              }
            }
            configObj.configurationType = "IGNORELIST";
            configObj.id = this.ignoreListConfigId;
            configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
            UserService.saveConfiguration(configObj).then(function (res) {
              this.ignoreListConfigId = res.id;
            })*/
    }
  }

  addJobChainToIgnoreList(name) {
    if (this.savedIgnoreList.jobChains.indexOf(name) === -1) {
      this.savedIgnoreList.jobChains.push(name);
      /*      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
              if (jobChainSearch) {
                this.search(true);
              } else {
                this.init();
              }
            }
            configObj.configurationType = "IGNORELIST";
            configObj.id = this.ignoreListConfigId;
            configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
            UserService.saveConfiguration(configObj).then(function (res) {
              this.ignoreListConfigId = res.id;
            })*/
    }
  }

  editIgnoreList() {

    if ((this.savedIgnoreList.jobChains && this.savedIgnoreList.jobChains.length > 0) || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0) || (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
      //Open ignore list modal
    }
  };

  enableDisableIgnoreList() {
    this.savedIgnoreList.isEnable = !this.savedIgnoreList.isEnable;
    /*    configObj.configurationType = "IGNORELIST";
        configObj.id = this.ignoreListConfigId;
        configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
        UserService.saveConfiguration(configObj).then(function (res) {
          this.ignoreListConfigId = res.id;
        });
        if ((jobSearch && this.historyFilters.type != 'jobChain') || (jobChainSearch && this.historyFilters.type == 'jobChain')) {
          this.search(true);
        } else
          this.init();*/
  }

  /*  updateHistoryAfterEvent() {
      let filter: any = {};
      this.isLoaded = false;
      if (this.historyFilters.type == 'ORDER') {

        filter.jobschedulerId = this.historyView.current == true ? this.schedulerIds.selected : '';

        if (this.selectedFiltered1) {
          filter = this.orderParseDate(filter);
        } else {
          filter = this.setOrderDateRange(filter);
          if (this.workflow.filter.historyStates != 'all') {
            filter.historyStates = [];
            filter.historyStates.push(this.workflow.filter.historyStates);
          }
        }
        filter.limit = parseInt(this.preferences.maxRecords);
        if (this.jobChainSearch) {
          this.search(true);
        } else {
          filter.timeZone = this.preferences.zone;
          if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
            delete filter["timeZone"];
          }
          if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
            filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone)._d;
          }
          if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
            filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone)._d;
          }
          OrderService.histories(filter).then(function (res) {
            this.historys = res.history;
            setDuration(this.historys);
            this.isLoaded = true;
          }, function () {
            this.isLoaded = true;
          });
        }
      } else if (this.historyFilters.type == 'TASK') {

        filter.jobschedulerId = this.historyView.current == true ? this.schedulerIds.selected : '';
        if (this.selectedFiltered2) {
          filter = this.jobParseDate(filter);
        } else {
          filter = this.setTaskDateRange(filter);
          if (this.task.filter.historyStates != 'all') {
            filter.historyStates = [];
            filter.historyStates.push(this.task.filter.historyStates);
          }
        }
        filter.limit = parseInt(this.preferences.maxRecords);
        if (this.jobSearch) {
          this.search(true);
        } else {
          filter.timeZone = this.preferences.zone;
          if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
            delete filter["timeZone"];
          }
          if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
            filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone)._d;
          }
          if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
            filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone)._d;
          }
          TaskService.histories(filter).then(function (res) {
            this.jobHistorys = res.history;
            setDuration(this.jobHistorys);
            this.isLoaded = true;
          }, function () {
            this.isLoaded = true;
          });
        }
      } else if (this.historyFilters.type == 'YADE') {

        filter = {jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : ''};

        if (this.selectedFiltered3) {
          this.isCustomizationSelected3(true);
          filter = this.yadeParseDate(filter);
        } else {
          filter = this.setYadeDateRange(filter);
          if (this.yade.filter.historyStates && this.yade.filter.historyStates != 'all' && this.yade.filter.historyStates.length > 0) {
            filter.states = [];
            filter.states.push(this.yade.filter.historyStates);
          }
        }
        filter.limit = parseInt(this.preferences.maxRecords);
        filter.timeZone = this.preferences.zone;
        if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
          delete filter["timeZone"];
        }
        if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
          filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone)._d;
        }
        if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
          filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone)._d;
        }
        filter.compact = true;
        if (this.yadeSearch) {
          this.search(true);
        } else {
          YadeService.getTransfers(filter).then(function (res) {
            this.yadeHistorys = res.transfers;
            this.isLoading = true;
            this.isLoaded = true;
          }, function () {
            this.isLoading = true;
            this.isLoaded = true;
          });
        }
      }
    }*/

  resetIgnoreList() {
    /*    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true) && this.historyFilters.type == 'jobChain' && ((this.savedIgnoreList.jobChains && this.savedIgnoreList.jobChains.length > 0) || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0))) {
          if (jobChainSearch) {
            this.search(true);
          } else
            this.init();
        } else if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true) && this.historyFilters.type != 'jobChain' && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
          if (jobSearch) {
            this.search(true);
          } else
            this.init();
        }
        this.savedIgnoreList.orders = [];
        this.savedIgnoreList.jobChains = [];
        this.savedIgnoreList.jobs = [];
        this.savedIgnoreList.isEnable = false;
        configObj.configurationType = "IGNORELIST";
        configObj.id = this.ignoreListConfigId;
        configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
        UserService.saveConfiguration(configObj).then(function (res) {
          this.ignoreListConfigId = res.id;
        })*/
  }

  createCustomization() {
    const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    if (this.historyFilters.type == 'ORDER') {
      modalRef.componentInstance.allFilter = this.orderHistoryFilterList;
    } else if (this.historyFilters.type == 'TASK') {
      modalRef.componentInstance.allFilter = this.jobHistoryFilterList;
    } else if (this.historyFilters.type == 'YADE') {
      modalRef.componentInstance.allFilter = this.yadeHistoryFilterList;
    }
    modalRef.componentInstance.new = true;
    modalRef.componentInstance.type = this.historyFilters.type;
    modalRef.result.then((configObj) => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editFilters() {
    const modalRef = this.modalService.open(EditFilterModalComponent, {backdrop: 'static'});
    if (this.historyFilters.type == 'ORDER') {
      modalRef.componentInstance.filterList = this.orderHistoryFilterList;
      modalRef.componentInstance.favorite = this.savedHistoryFilter.favorite;
    } else if (this.historyFilters.type == 'TASK') {
      modalRef.componentInstance.filterList = this.jobHistoryFilterList;
      modalRef.componentInstance.favorite = this.savedJobHistoryFilter.favorite;
    } else if (this.historyFilters.type == 'YADE') {
      modalRef.componentInstance.filterList = this.yadeHistoryFilterList;
      modalRef.componentInstance.favorite = this.savedYadeHistoryFilter.favorite;
    }
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.username = this.permission.user;
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

  /* --------------------------Actions -----------------------*/

  action(type, obj, self) {
    if (type === 'DELETE') {
      if (self.savedFilter.selected == obj.id) {
        self.savedFilter.selected = undefined;
        self.isCustomizationSelected(false);
        self.dailyPlanFilters.selectedView = false;
        self.selectedFiltered = undefined;
        self.setDateRange(null);
        self.load();
      } else {
        if (self.filterList.length == 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.dailyPlanFilters.selectedView = false;
          self.selectedFiltered = undefined;
        }
      }
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
    } else if (type === 'MAKEFAV') {
      self.savedFilter.favorite = obj.id;
      self.dailyPlanFilters.selectedView = true;
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
      self.load();
    } else if (type === 'REMOVEFAV') {
      self.savedFilter.favorite = '';
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
    }
  }

  changeFilter(filter) {
    if (this.historyFilters.type == 'ORDER') {
      if (filter) {
        this.savedHistoryFilter.selected = filter.id;
        this.historyFilters.order.selectedView = true;
        this.coreService.post('configuration', {
          jobschedulerId: filter.jobschedulerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered1.account = filter.account;
          this.init();
        });
      } else {
        this.isCustomizationSelected1(false);
        this.savedHistoryFilter.selected = filter;
        this.historyFilters.order.selectedView = false;
        this.selectedFiltered1 = {};
        this.init();
      }
      this.historyFilterObj.order = this.savedHistoryFilter;
    } else if (this.historyFilters.type == 'TASK') {
      if (filter) {
        this.savedJobHistoryFilter.selected = filter.id;
        this.historyFilters.task.selectedView = true;
        this.coreService.post('configuration', {
          jobschedulerId: filter.jobschedulerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered2.account = filter.account;
          this.init();
        });
      } else {
        this.isCustomizationSelected2(false);
        this.savedJobHistoryFilter.selected = filter;
        this.historyFilters.task.selectedView = false;
        this.selectedFiltered2 = {};
        this.init();
      }
      this.historyFilterObj.job = this.savedJobHistoryFilter;
    } else if (this.historyFilters.type == 'YADE') {
      if (filter) {
        this.savedYadeHistoryFilter.selected = filter.id;
        this.historyFilters.yade.selectedView = true;
        this.coreService.post('configuration', {
          jobschedulerId: filter.jobschedulerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered3.account = filter.account;
          this.init();
        });
      } else {
        this.isCustomizationSelected3(false);
        this.savedYadeHistoryFilter.selected = filter;
        this.historyFilters.yade.selectedView = false;
        this.selectedFiltered3 = {};
        this.init();
      }
      this.historyFilterObj.yade = this.savedYadeHistoryFilter;

    }
    this.saveService.setHistory(this.historyFilterObj);
    this.saveService.save();
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType == 'ReportingChangedOrder' && this.isLoaded && this.historyFilters.type == 'ORDER') {
              this.isLoaded = false;
              //  this.updateHistoryAfterEvent();
              break;
            } else if (args[i].eventSnapshots[j].eventType == 'ReportingChangedJob' && this.isLoaded && this.historyFilters.type == 'TASK') {
              //   this.updateHistoryAfterEvent();
              break;
            } else if (args[i].eventSnapshots[j].objectType == 'OTHER' && this.historyFilters.type == 'YADE') {
              if (args[i].eventSnapshots[j].eventType == 'YADETransferStarted') {
                //    this.updateHistoryAfterEvent();
                break;
              } else if (args[i].eventSnapshots[j].eventType == 'YADETransferUpdated') {
                for (let x = 0; x < this.yadeHistorys.length; x++) {
                  if (this.yadeHistorys[x].id == args[i].eventSnapshots[j].path) {
                    //     this.getTransfer(this.yadeHistorys[x]);
                    break;
                  }
                }
              } else if (args[i].eventSnapshots[j].eventType == 'YADEFileStateChanged') {
                for (let x = 0; x < this.yadeHistorys.length; x++) {
                  if (this.yadeHistorys[x].id == args[i].eventSnapshots[j].path && this.yadeHistorys[x].show) {
                    //    this.getFiles(this.yadeHistorys[x]);
                    break;
                  }
                }
              }
            }

          }
        }
        break;
      }
    }
  }

  private initConf() {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.historyFilters = this.coreService.getHistoryTab();
    this.order = this.historyFilters.order;
    this.task = this.historyFilters.task;
    this.yade = this.historyFilters.yade;

    if (!this.order.filter.historyStates) {
      this.order.filter.historyStates = 'ALL';
    }
    if (!this.order.filter.date) {
      this.order.filter.date = 'today';
    }
    if (!this.task.filter.historyStates) {
      this.task.filter.historyStates = 'ALL';
    }
    if (!this.task.filter.date) {
      this.task.filter.date = 'today';
    }
    if (!this.yade.filter.historyStates) {
      this.yade.filter.historyStates = 'ALL';
    }
    if (!this.yade.filter.date) {
      this.yade.filter.date = 'today';
    }

    this.historyView.current = this.preferences.historyView == 'current';
    this.historyFilterObj = JSON.parse(this.saveService.historyFilters) || {};

    this.savedHistoryFilter = this.historyFilterObj.order || {};

    if (this.historyFilters.order.selectedView) {
      this.savedHistoryFilter.selected = this.savedHistoryFilter.selected || this.savedHistoryFilter.favorite;
    } else {
      this.savedHistoryFilter.selected = undefined;
    }

    this.savedJobHistoryFilter = this.historyFilterObj.job || {};
    if (this.historyFilters.task.selectedView) {
      this.savedJobHistoryFilter.selected = this.savedJobHistoryFilter.selected || this.savedJobHistoryFilter.favorite;
    } else {
      this.savedJobHistoryFilter.selected = undefined;
    }

    this.savedYadeHistoryFilter = this.historyFilterObj.yade || {};
    if (this.historyFilters.yade.selectedView) {
      this.savedYadeHistoryFilter.selected = this.savedYadeHistoryFilter.selected || this.savedYadeHistoryFilter.favorite;
    } else {
      this.savedYadeHistoryFilter.selected = undefined;
    }

    this.checkSharedFilters(this.historyFilters.type);
    this.getIgnoreList();
  }

  private checkSharedFilters(type) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: type === 'ORDER' ? 'ORDER_HISTORY' : type === 'TASK' ? 'TASK_HISTORY' : 'YADE_HISTORY',
      shared: true
    };
    if (this.permission.JOCConfigurations.share.view) {
      this.coreService.post('configurations', obj).subscribe((res: any) => {
        this.checkCurrentTab(type, res, obj);
      }, (err) => {
        this.checkCurrentTab(type, null, obj);
      });
    } else {
      this.checkCurrentTab(type, null, obj);
    }
  }

  private checkCurrentTab(type, res, obj) {
    if (type === 'ORDER') {
      this.orderHistoryFilterList = res ? res.configurations : [];
    } else if (type === 'TASK') {
      this.jobHistoryFilterList = res ? res.configurations : [];
    } else {
      this.yadeHistoryFilterList = res ? res.configurations : [];
    }
    this.getCustomizations(type, obj);
  }

  private getCustomizations(type, obj) {
    obj.account = this.permission.user;
    obj.shared = false;
    this.coreService.post('configurations', obj).subscribe((result: any) => {
      if (type === 'ORDER') {
        this.checkOrderCustomization(result);
      } else if (type === 'TASK') {
        this.checkTaskCustomization(result);
      } else {
        this.checkYadeCustomization(result);
      }
    }, (err) => {
      this.savedHistoryFilter.selected = undefined;
      this.loadConfig = true;
      this.init();
    });
  }

  private checkOrderCustomization(result) {
    if (this.orderHistoryFilterList && this.orderHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        let data = [];

        for (let i = 0; i < this.orderHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.orderHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.orderHistoryFilterList[i]);
          }
        }
        this.orderHistoryFilterList = data;
      }
    } else {
      this.orderHistoryFilterList = result.configurations;
    }

    if (this.savedHistoryFilter.selected) {
      let flag = true;

      for (let i = 0; i < this.orderHistoryFilterList.length; i++) {
        if (this.orderHistoryFilterList[i].id == this.savedHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            jobschedulerId: this.orderHistoryFilterList[i].jobschedulerId,
            id: this.orderHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered1.account = this.orderHistoryFilterList[i].account;
            this.init();
          });
          break;
        }
      }

      if (flag) {
        this.savedHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init();
      }
    } else {
      this.loadConfig = true;
      this.savedHistoryFilter.selected = undefined;
      this.init();
    }
  }

  private checkTaskCustomization(result) {
    if (this.jobHistoryFilterList && this.jobHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        let data = [];

        for (let i = 0; i < this.jobHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.jobHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.jobHistoryFilterList[i]);
          }
        }
        this.jobHistoryFilterList = data;
      }
    } else {
      this.jobHistoryFilterList = result.configurations;
    }

    if (this.savedJobHistoryFilter.selected) {
      let flag = true;

      for (let i = 0; i < this.jobHistoryFilterList.length; i++) {
        if (this.jobHistoryFilterList[i].id == this.savedJobHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            jobschedulerId: this.jobHistoryFilterList[i].jobschedulerId,
            id: this.jobHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered2.account = this.jobHistoryFilterList[i].account;
            this.init();
          });
          break;
        }
      }

      if (flag) {
        this.savedJobHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init();
      }
    } else {
      this.loadConfig = true;
      this.savedJobHistoryFilter.selected = undefined;
      this.init();
    }
  }

  /* --------------------------Customizations -----------------------*/


  /* ---- Customization ------ */

  private checkYadeCustomization(result) {
    if (this.yadeHistoryFilterList && this.yadeHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        let data = [];

        for (let i = 0; i < this.yadeHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.yadeHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.yadeHistoryFilterList[i]);
          }
        }
        this.yadeHistoryFilterList = data;
      }
    } else {
      this.yadeHistoryFilterList = result.configurations;
    }

    if (this.savedYadeHistoryFilter.selected) {
      let flag = true;

      for (let i = 0; i < this.yadeHistoryFilterList.length; i++) {
        if (this.yadeHistoryFilterList[i].id == this.savedYadeHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            jobschedulerId: this.yadeHistoryFilterList[i].jobschedulerId,
            id: this.yadeHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered3 = JSON.parse(result.configuration.configurationItem);
            this.selectedFiltered3.account = this.yadeHistoryFilterList[i].account;
            this.init();
          });
          break;
        }
      }

      if (flag) {
        this.savedYadeHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init();
      }
    } else {
      this.loadConfig = true;
      this.savedYadeHistoryFilter.selected = undefined;
      this.init();
    }
  }

  private getIgnoreList() {
    let configObj = {
      jobschedulerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'IGNORELIST'
    };
    this.coreService.post('configurations', configObj).subscribe((result: any) => {
      if (result.configurations && result.configurations.length > 0) {
        this.ignoreListConfigId = result.configurations[0].id;
        this.coreService.post('configuration', {
          jobschedulerId: this.schedulerIds.selected,
          id: result.configurations[0].id
        }).subscribe((result1: any) => {
          if (result1.configuration && result1.configuration.configurationItem) {
            this.savedIgnoreList = JSON.parse(result1.configuration.configurationItem) || {};
          }
          this.loadIgnoreList = true;
          this.init();
        }, () => {
          this.loadIgnoreList = true;
          this.init();
        });
      } else {
        this.loadIgnoreList = true;
        this.init();
      }
    }, () => {
      this.loadIgnoreList = true;
      this.init();
    });
  }

  private init() {
    let obj = {
      jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : ''
    };
    if (this.loadConfig && this.loadIgnoreList) {
      this.isLoaded = false;
      if (this.historyFilters.type == 'ORDER') {
        this.orderHistory(obj);
      } else if (this.historyFilters.type == 'TASK') {
        this.taskHistory(obj);
      } else if (this.historyFilters.type == 'YADE') {
        this.yadeHistory(obj);
      }
    }
  }

  private setDuration(histories): any {
    histories.history.forEach(function (history, index) {
      if (history.startTime && history.endTime) {
        histories.history[index].duration = new Date(history.endTime).getTime() - new Date(history.startTime).getTime();
      }
    });
    return histories.history;
  }

  private editFilter(filter) {
    let filterObj: any = {};
    this.coreService.post('configuration', {jobschedulerId: filter.jobschedulerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;

      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      if (this.historyFilters.type == 'ORDER') {
        modalRef.componentInstance.allFilter = this.orderHistoryFilterList;
      } else if (this.historyFilters.type == 'TASK') {
        modalRef.componentInstance.allFilter = this.jobHistoryFilterList;
      } else if (this.historyFilters.type == 'YADE') {
        modalRef.componentInstance.allFilter = this.yadeHistoryFilterList;
      }
      modalRef.componentInstance.filter = filterObj;
      modalRef.componentInstance.edit = true;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

  private copyFilter(filter) {
    let filterObj: any = {};
    this.coreService.post('configuration', {jobschedulerId: filter.jobschedulerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      if (this.historyFilters.type == 'ORDER') {
        filterObj.name = this.coreService.checkCopyName(this.orderHistoryFilterList, filter.name);
      } else if (this.historyFilters.type == 'TASK') {
        filterObj.name = this.coreService.checkCopyName(this.jobHistoryFilterList, filter.name);
      } else if (this.historyFilters.type == 'YADE') {
        filterObj.name = this.coreService.checkCopyName(this.yadeHistoryFilterList, filter.name);
      }

      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      if (this.historyFilters.type == 'ORDER') {
        modalRef.componentInstance.allFilter = this.orderHistoryFilterList;
      } else if (this.historyFilters.type == 'TASK') {
        modalRef.componentInstance.allFilter = this.jobHistoryFilterList;
      } else if (this.historyFilters.type == 'YADE') {
        modalRef.componentInstance.allFilter = this.yadeHistoryFilterList;
      }
      modalRef.componentInstance.filter = filterObj;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

}
