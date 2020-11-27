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
import {SearchPipe} from '../../filters/filter.pipe';
import {TranslateService} from '@ngx-translate/core';
import {ExcelService} from '../../services/excel.service';
import {EditIgnoreListComponent} from './ignore-list-modal/ignore-list.component';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './filter-dialog.html'
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
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  getFolderTree(flag) {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'ORDER_HISTORY';
    modalRef.componentInstance.showCheckBox = !flag;
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
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'ORDER_HISTORY',
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
    this.onSearch.emit(this.filter);
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
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  getFolderTree(flag) {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'TASK_HISTORY';
    modalRef.componentInstance.showCheckBox = !flag;
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
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'TASK_HISTORY',
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
    this.onSearch.emit(this.filter);
  }

  cancel() {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-deployment-form-template',
  templateUrl: './deployment-form-template.html',
})
export class DeploymentSearchComponent implements OnInit {

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
  existingName: any;
  submitted = false;
  isUnique = true;
  deployTypes = [];

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.deployTypes = ['WORKFLOW', 'JOBCLASS', 'LOCK', 'JUNCTION'];
  }

  getFolderTree(flag) {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'DEPLOYMENT_HISTORY';
    modalRef.componentInstance.showCheckBox = !flag;
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
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'DEPLOYMENT_HISTORY',
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
    this.onSearch.emit(this.filter);
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
  loadConfig = false;
  loadIgnoreList = false;
  showSearchPanel = false;
  dateFormat: any;
  dateFormatM: any;
  notAuthenticate = false;
  historyFilters: any = {};
  selectedFiltered1: any = {};
  selectedFiltered2: any = {};
  selectedFiltered3: any = {};
  selectedFiltered4: any = {};
  temp_filter1: any = {};
  temp_filter2: any = {};
  temp_filter3: any = {};
  temp_filter4: any = {};
  historyFilterObj: any = {};
  savedHistoryFilter: any = {};
  savedJobHistoryFilter: any = {};
  savedDeploymentHistoryFilter: any = {};
  savedIgnoreList: any = {workflows: [], jobs: [], orders: []};
  orderSearch: any = {paths: []};
  jobSearch: any = {paths: []};
  deploymentSearch: any = {paths: []};
  data = [];
  currentData = [];
  order: any = {};
  task: any = {};

  deployment: any = {};
  historys: any = [];
  jobHistorys: any = [];
  deploymentHistorys: any = [];
  orderHistoryFilterList: any = [];
  jobHistoryFilterList: any = [];
  deploymentHistoryFilterList: any = [];
  object: any = {};
  ignoreListConfigId = 0;
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modalService: NgbModal, private searchPipe: SearchPipe,
              private translate: TranslateService, private excelService: ExcelService) {
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

  changeController() {
    this.init();
  }

  orderParseDate(obj) {
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true') && ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0) || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0))) {
      obj.excludeOrders = [];
      this.savedIgnoreList.workflows.forEach(function (workflow) {
        obj.excludeOrders.push({workflow: workflow});
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
    if ((this.selectedFiltered1.workflows && this.selectedFiltered1.workflows.length > 0) || (this.selectedFiltered1.orders && this.selectedFiltered1.orders.length > 0)) {
      obj.orders = [];
      this.selectedFiltered1.orders.forEach(function (value) {
        obj.orders.push({workflow: value.workflow, orderId: value.orderId});
      });
      if (!this.selectedFiltered1.orders || this.selectedFiltered1.orders.length == 0) {
        this.selectedFiltered1.workflows.forEach(function (value) {
          obj.orders.push({workflow: value});
        });
      } else {
        for (let i = 0; i < this.selectedFiltered1.workflows.length; i++) {
          let flag = true;
          for (let j = 0; j < obj.orders.length; j++) {
            if (obj.orders[j].workflow == this.selectedFiltered1.workflows[i]) {
              flag = false;
              break;
            }
          }
          if (flag) {
            obj.orders.push({workflow: this.selectedFiltered1.workflows[i]});
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
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true')
      && ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0)
        || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0))) {
      filter.excludeOrders = [];
      this.savedIgnoreList.workflows.forEach(function (workflow) {
        filter.excludeOrders.push({workflow: workflow});
      });

      this.savedIgnoreList.orders.forEach(function (order) {
        filter.excludeOrders.push(order);
      });
    }
    if (this.order.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';

    } else if (this.order.filter.date && this.order.filter.date != 'ALL') {
      filter.dateFrom = this.order.filter.date;
    }
    return filter;
  }

  convertRequestBody(obj) {
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
  }

  orderHistory(obj) {
    this.historyFilters.type = 'ORDER';
    if (!obj) {
      obj = {controllerId: this.historyView.current == true ? this.schedulerIds.selected : ''};
    }
    this.isLoading = false;
    if (this.selectedFiltered1 && !_.isEmpty(this.selectedFiltered1)) {
      this.isCustomizationSelected1(true);
      obj = this.orderParseDate(obj);
    } else {
      obj = this.setOrderDateRange(obj);
      if (this.order.filter.historyStates && this.order.filter.historyStates !== 'ALL' && this.order.filter.historyStates.length > 0) {
        obj.historyStates = [];
        obj.historyStates.push(this.order.filter.historyStates);
      }
    }
    this.convertRequestBody(obj);
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.historys = this.setDuration(res);
      this.searchInResult();
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
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
        this.task.filter.historyStates = 'ALL';
        this.task.filter.date = 'today';
      }
    }
  }

  jobParseDate(obj) {
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true')
      && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
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
    } else if (this.task.filter.date && this.task.filter.date != 'ALL') {
      filter.dateFrom = this.task.filter.date;
    }
    return filter;
  }

  taskHistory(obj) {
    this.historyFilters.type = 'TASK';
    if (!obj) {
      obj = {controllerId: this.historyView.current == true ? this.schedulerIds.selected : ''};
    }
    this.isLoading = false;

    if (this.selectedFiltered2 && !_.isEmpty(this.selectedFiltered2)) {
      this.isCustomizationSelected2(true);
      obj = this.jobParseDate(obj);
    } else {
      obj = this.setTaskDateRange(obj);
      if (this.task.filter.historyStates && this.task.filter.historyStates != 'ALL' && this.task.filter.historyStates.length > 0) {
        obj.historyStates = [];
        obj.historyStates.push(this.task.filter.historyStates);
      }
    }
    this.convertRequestBody(obj);
    this.coreService.post('tasks/history', obj).subscribe((res) => {
      this.jobHistorys = this.setDuration(res);
      this.searchInResult();
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  isCustomizationSelected4(flag) {
    if (flag) {
      this.temp_filter4.state = _.clone(this.deployment.filter.state);
      this.temp_filter4.date = _.clone(this.deployment.filter.date);
      this.deployment.filter.state = '';
      this.deployment.filter.date = '';
    } else {
      if (this.temp_filter4.state) {
        this.deployment.filter.state = _.clone(this.temp_filter4.state);
        this.deployment.filter.date = _.clone(this.temp_filter4.date);
      } else {
        this.deployment.filter.state = 'ALL';
        this.deployment.filter.date = 'today';
      }
    }
  }

  setDeploymentDateRange(filter) {
    if (this.deployment.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else if (this.deployment.filter.date && this.deployment.filter.date != 'ALL') {
      filter.dateFrom = this.deployment.filter.date;
    }
    return filter;
  }

  deploymentHistory(obj){
    this.historyFilters.type = 'DEPLOYMENT';
    if (!obj) {
      obj = {controllerId: this.historyView.current == true ? this.schedulerIds.selected : ''};
    }
    this.isLoading = false;
    if (this.selectedFiltered4 && !_.isEmpty(this.selectedFiltered4)) {
      this.isCustomizationSelected4(true);
      // obj = this.deploymentParseDate(obj);
    } else {
      obj = this.setDeploymentDateRange(obj);
      obj.state = (this.deployment.filter.state && this.deployment.filter.state !== 'ALL') ? this.deployment.filter.state : undefined;
    }
    this.convertRequestBody(obj);
    this.coreService.post('inventory/deployment/history', obj).subscribe((res: any) => {
      this.deploymentHistorys = res.depHistory;
      this.searchInResult();
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  search(obj) {
    let filter: any = {
      controllerId: this.historyView.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxRecords, 10)
    };
    let fromDate, toDate;
    if (this.historyFilters.type === 'ORDER') {
      this.order.filter.historyStates = '';
      this.order.filter.date = '';
      if (obj.workflow) {
        filter.orders = [];
        if (obj.orderIds) {
          var s = obj.orderIds.replace(/,\s+/g, ',');
          var orderIds = s.split(',');
          orderIds.forEach(function (value) {
            filter.orders.push({workflow: obj.workflow, orderId: value});
          });
        } else {
          filter.orders.push({workflow: obj.workflow});
        }
      }
      if (obj.states && obj.states.length > 0) {
        filter.historyStates = obj.states;
      }
      if (obj.radio == 'process') {
        filter = this.coreService.parseProcessExecutedRegex(obj.planned, filter);
      } else {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {
            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());
          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = moment.utc(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {
            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());
          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = moment.utc(toDate);
        }
      }

      if (obj.regex) {
        filter.regex = obj.regex;
      }
      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      } else {
        filter.controllerId = '';
      }
      if (obj.paths && obj.paths.length > 0) {
        filter.folders = [];
        obj.paths.forEach(function (value) {
          filter.folders.push({folder: value, recursive: true});
        });
      }
      if ((obj.workflows && obj.workflows.length > 0) || (obj.orders && obj.orders.length > 0)) {
        filter.orders = [];

        obj.orders.forEach(function (value) {
          filter.orders.push({workflow: value.workflow, orderId: value.orderId});
        });
        if (!obj.orders || obj.orders.length == 0) {
          obj.workflows.forEach(function (value) {
            filter.orders.push({workflow: value});
          });
        } else {
          if (obj.workflows)
            for (let i = 0; i < obj.workflows.length; i++) {
              let flg = true;
              for (let j = 0; j < filter.orders.length; j++) {
                if (filter.orders[j].workflow == obj.workflows[i]) {
                  flg = false;
                  break;
                }
              }
              if (flg) {
                filter.orders.push({workflow: obj.workflows[i]});
              }
            }
        }

      }
      filter.timeZone = this.preferences.zone;
      if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
        filter.timeZone = 'UTC';
      }
      if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
        filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone);
      }
      if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
        filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone);
      }
      this.coreService.post('orders/history', filter).subscribe((res: any) => {
        this.historys = this.setDuration(res);
        this.searchInResult();
        this.isLoading = true;
      }, () => {
        this.isLoading = true;
      });
    } else if (this.historyFilters.type === 'TASK') {
      this.task.filter.historyStates = '';
      this.task.filter.date = '';
      if (obj.job) {
        filter.jobs = [];
        let s = obj.job.replace(/,\s+/g, ',');
        var jobs = s.split(',');
        jobs.forEach(function (value) {
          filter.jobs.push({job: value});
        });
      }
      if (obj.states && obj.states.length > 0) {
        filter.historyStates = obj.states;
      }
      if (obj.criticality && obj.criticality.length > 0) {
        filter.criticality = obj.criticality;
      }
      if (obj.radio == 'process') {
        filter = this.coreService.parseProcessExecutedRegex(obj.planned, filter);
      } else {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {

            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());

          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = moment.utc(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {
            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());

          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = moment.utc(toDate);
        }
      }

      if (obj.regex) {
        filter.regex = obj.regex;
      }
      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      }
      if (obj.paths && obj.paths.length > 0) {
        filter.folders = [];
        obj.paths.forEach(function (value) {
          filter.folders.push({folder: value, recursive: true});
        });
      }

      if (obj.jobs && obj.jobs.length > 0) {
        filter.jobs = [];

        obj.jobs.forEach(function (value) {
          filter.jobs.push({job: value});
        });

      }
      filter.timeZone = this.preferences.zone;
      if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
        filter.timeZone = 'UTC';
      }
      if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
        filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone);
      }
      if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
        filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone);
      }
      this.coreService.post('tasks/history', filter).subscribe((res: any) => {
        this.jobHistorys = this.setDuration(res);
        this.searchInResult();
        this.isLoading = true;
      }, () => {
        this.isLoading = true;
      });
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.deployment.filter.state = '';
      this.deployment.filter.date = '';
      filter.state = (obj.state && obj.state !== 'ALL') ? obj.state : undefined;
      filter.operation = obj.operation ? obj.operation : undefined;
      filter.deployType = obj.deployType ? obj.deployType : undefined;

      if (obj.radio == 'process') {
        filter = this.coreService.parseProcessExecutedRegex(obj.planned, filter);
      } else {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {

            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());

          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = moment.utc(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {

            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());

          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = moment.utc(toDate);
        }
      }

      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      }
      if (obj.paths && obj.paths.length > 0) {
        filter.folders = [];
        obj.paths.forEach(function (value) {
          filter.folders.push({folder: value, recursive: true});
        });
      }

      filter.timeZone = this.preferences.zone;
      if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
        filter.timeZone = 'UTC';
      }
      if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
        filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone);
      }
      if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
        filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone);
      }
      this.coreService.post('inventory/deployment/history', filter).subscribe((res: any) => {
        this.deploymentHistorys = res.depHistory;
        this.searchInResult();
        this.isLoading = true;
      }, () => {
        this.isLoading = true;
      });
    }
  }

  advancedSearch() {
    this.showSearchPanel = true;
    this.object.paths = [];
    this.object.orders = [];
    this.object.workflows = [];
    this.object.jobs = [];

    this.orderSearch = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
    };

    this.jobSearch = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
    };

    this.deploymentSearch = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
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

    if (!this.deployment.filter.state) {
      this.deployment.filter.state = 'ALL';
    }
    if (!this.deployment.filter.date) {
      this.deployment.filter.date = 'today';
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
      this.orderSearch = {};
      this.orderSearch.date = 'date';
      if (type === 'STATE') {
        this.order.filter.historyStates = value;
      } else if (type === 'DATE') {
        this.order.filter.date = value;
      }

    } else if (this.historyFilters.type == 'DEPLOYMENT'){
      this.deploymentSearch = {};
      this.deploymentSearch.date = 'date';
      if (type === 'STATE') {
        this.deployment.filter.state = value;
      } else if (type === 'DATE') {
        this.deployment.filter.date = value;
      }
    }
    this.init();
  }

  /**--------------- sorting and pagination -------------------*/
  sort(propertyName): void {
    this.order.reverse = !this.order.reverse;
    this.order.filter.sortBy = propertyName;
  }

  sort1(propertyName): void {
    this.task.reverse = !this.task.reverse;
    this.task.filter.sortBy = propertyName;
  }

  sort3(propertyName): void {
    this.deployment.reverse = !this.deployment.reverse;
    this.deployment.filter.sortBy = propertyName;
  }

  pageIndexChange($event) {
    if (this.historyFilters.type === 'ORDER') {
      this.order.currentPage = $event;
    } else if (this.historyFilters.type === 'TASK') {
      this.task.currentPage = $event;
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.deployment.currentPage = $event;
    }
  }

  pageSizeChange($event) {
    if (this.historyFilters.type === 'ORDER') {
      this.order.entryPerPage = $event;
    } else if (this.historyFilters.type === 'TASK') {
      this.task.entryPerPage = $event;
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.deployment.entryPerPage = $event;
    }
  }

  currentPageDataChange($event) {
    this.currentData = $event;
  }

  searchInResult() {
    if (this.historyFilters.type === 'ORDER') {
      this.data = this.order.searchText ? this.searchPipe.transform(this.historys, this.order.searchText) : this.historys;
    } else if (this.historyFilters.type === 'TASK') {
      this.data = this.task.searchText ? this.searchPipe.transform(this.jobHistorys, this.task.searchText) : this.jobHistorys;
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.data = this.deployment.searchText ? this.searchPipe.transform(this.deploymentHistorys, this.deployment.searchText) : this.deploymentHistorys;
    }
    this.data = [...this.data];
  }

  exportToExcel() {
    let data = [];
    let fileName = 'JS7-order-history-report';
    if (this.historyFilters.type === 'TASK') {
      data = this.exportToExcelTask();
      fileName = 'JS7-task-history-report';
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      data = this.exportToExcelDeployment();
      fileName = 'JS7-deployment-history-report';
    } else {
      data = this.exportToExcelOrder();
    }
    this.excelService.exportAsExcelFile(data, fileName);
  }

  showPanelFuc(data) {
    data.loading = true;
    data.show = true;
    data.steps = [];
    let obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      data.steps = res.history;
      data.loading = false;
    }, function () {
      data.loading = false;
    });
  }


  /* --------------------------Ignore List -----------------------*/
  addOrderToIgnoreList(orderId, workflow) {
    let obj = {
      workflow: workflow,
      orderId: orderId
    };

    if (this.savedIgnoreList.orders.indexOf(obj) === -1) {
      this.savedIgnoreList.orders.push(obj);
      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
        if (this.orderSearch) {
          this.search(true);
        } else {
          this.init();
        }
      }
      let configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.permission.user,
        configurationType: 'IGNORELIST',
        id: this.ignoreListConfigId,
        configurationItem: JSON.stringify(this.savedIgnoreList)
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        this.ignoreListConfigId = res.id;
      });
    }
  }

  addJobToIgnoreList(name) {
    if (this.savedIgnoreList.jobs.indexOf(name) === -1) {
      this.savedIgnoreList.jobs.push(name);
      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
        if (this.jobSearch) {
          this.search(true);
        } else {
          this.init();
        }
      }
      let configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.permission.user,
        configurationType: 'IGNORELIST',
        id: this.ignoreListConfigId,
        configurationItem: JSON.stringify(this.savedIgnoreList)
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        this.ignoreListConfigId = res.id;
      });
    }
  }

  addWorkflowToIgnoreList(name) {
    if (this.savedIgnoreList.workflows.indexOf(name) === -1) {
      this.savedIgnoreList.workflows.push(name);
      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
        if (this.orderSearch) {
          this.search(true);
        } else {
          this.init();
        }
      }
      let configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.permission.user,
        configurationType: 'IGNORELIST',
        id: this.ignoreListConfigId,
        configurationItem: JSON.stringify(this.savedIgnoreList)
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        this.ignoreListConfigId = res.id;
      });
    }
  }

  editIgnoreList() {
    if ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0) || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0) || (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
      const modalRef = this.modalService.open(EditIgnoreListComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.savedIgnoreList = this.savedIgnoreList;
      modalRef.componentInstance.historyFilters = this.historyFilters;
      modalRef.componentInstance.action = this.action;
      modalRef.componentInstance.self = this;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    }
  }

  enableDisableIgnoreList() {
    this.savedIgnoreList.isEnable = !this.savedIgnoreList.isEnable;
    let configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'IGNORELIST',
      id: this.ignoreListConfigId,
      configurationItem: JSON.stringify(this.savedIgnoreList)
    };
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
      this.ignoreListConfigId = res.id;
    });
    if ((this.jobSearch && this.historyFilters.type != 'ORDER') || (this.orderSearch && this.historyFilters.type == 'ORDER')) {
      this.search(true);
    } else {
      this.init();
    }
  }

  resetIgnoreList() {
    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true) && this.historyFilters.type == 'ORDER' && ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0) || (this.savedIgnoreList.orders && this.savedIgnoreList.orders.length > 0))) {
      if (this.orderSearch) {
        this.search(true);
      } else {
        this.init();
      }
    } else if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true) && this.historyFilters.type != 'ORDER' && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
      if (this.jobSearch) {
        this.search(true);
      } else {
        this.init();
      }
    }
    this.savedIgnoreList.orders = [];
    this.savedIgnoreList.workflows = [];
    this.savedIgnoreList.jobs = [];
    this.savedIgnoreList.isEnable = false;
    let configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'IGNORELIST',
      id: this.ignoreListConfigId,
      configurationItem: JSON.stringify(this.savedIgnoreList)
    };
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
      this.ignoreListConfigId = res.id;
    });
  }

  createCustomization() {
    const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    if (this.historyFilters.type == 'ORDER') {
      modalRef.componentInstance.allFilter = this.orderHistoryFilterList;
    } else if (this.historyFilters.type == 'TASK') {
      modalRef.componentInstance.allFilter = this.jobHistoryFilterList;
    } else if (this.historyFilters.type == 'DEPLOYMENT') {
      modalRef.componentInstance.allFilter = this.deploymentHistoryFilterList;
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
    } else if (this.historyFilters.type == 'DEPLOYMENT') {
      modalRef.componentInstance.filterList = this.deploymentHistoryFilterList;
      modalRef.componentInstance.favorite = this.savedDeploymentHistoryFilter.favorite;
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

  downloadLog(obj, schedulerId) {
    if (!schedulerId) {
      schedulerId = this.schedulerIds.selected;
    }
    if (this.historyFilters.type == 'ORDER') {
      $('#tmpFrame').attr('src', './api/order/log/download?historyId=' + obj.historyId + '&controllerId=' + schedulerId +
        '&accessToken=' + this.authService.accessTokenId);
    } else {
      $('#tmpFrame').attr('src', './api/task/log/download?taskId=' + obj.taskId + '&controllerId=' + schedulerId +
        '&accessToken=' + this.authService.accessTokenId);
    }
  }

  action(type, obj, self) {
    if (self.historyFilters.type === 'ORDER') {
      if (type === 'DELETE') {
        if (self.savedHistoryFilter.selected == obj.id) {
          self.savedHistoryFilter.selected = undefined;
          self.isCustomizationSelected1(false);
          self.order.selectedView = false;
          self.selectedFiltered = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.orderHistoryFilterList.length == 0) {
            self.isCustomizationSelected1(false);
            self.savedHistoryFilter.selected = undefined;
            self.order.selectedView = false;
            self.selectedFiltered = undefined;
          }
        }
        self.saveService.setHistory(self.savedHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedHistoryFilter.favorite = obj.id;
        self.order.selectedView = true;
        self.saveService.setHistory(self.savedHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedHistoryFilter);
        self.saveService.save();
      }
    } else if (self.historyFilters.type === 'TASK') {
      if (type === 'DELETE') {
        if (self.savedJobHistoryFilter.selected == obj.id) {
          self.savedJobHistoryFilter.selected = undefined;
          self.isCustomizationSelected2(false);
          self.task.selectedView = false;
          self.selectedFiltered = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.jobHistoryFilterList.length == 0) {
            self.isCustomizationSelected2(false);
            self.savedJobHistoryFilter.selected = undefined;
            self.task.selectedView = false;
            self.selectedFiltered = undefined;
          }
        }
        self.saveService.setHistory(self.savedJobHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedJobHistoryFilter.favorite = obj.id;
        self.task.selectedView = true;
        self.saveService.setHistory(self.savedJobHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedJobHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedJobHistoryFilter);
        self.saveService.save();
      }
    } else if (self.historyFilters.type === 'DEPLOYMENT') {
      if (type === 'DELETE') {
        if (self.savedDeploymentHistoryFilter.selected == obj.id) {
          self.savedDeploymentHistoryFilter.selected = undefined;
          self.isCustomizationSelected4(false);
          self.deployment.selectedView = false;
          self.selectedFiltered = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.deploymentHistoryFilterList.length == 0) {
            self.isCustomizationSelected4(false);
            self.savedDeploymentHistoryFilter.selected = undefined;
            self.deployment.selectedView = false;
            self.selectedFiltered = undefined;
          }
        }
        self.saveService.setHistory(self.savedDeploymentHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedDeploymentHistoryFilter.favorite = obj.id;
        self.deployment.selectedView = true;
        self.saveService.setHistory(self.savedDeploymentHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedDeploymentHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedDeploymentHistoryFilter);
        self.saveService.save();
      }
    }
  }

  changeFilter(filter) {
    if (this.historyFilters.type == 'ORDER') {
      if (filter) {
        this.savedHistoryFilter.selected = filter.id;
        this.historyFilters.order.selectedView = true;
        this.coreService.post('configuration', {
          controllerId: filter.controllerId,
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
          controllerId: filter.controllerId,
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
    } else if (this.historyFilters.type == 'DEPLOYMENT') {
      if (filter) {
        this.savedDeploymentHistoryFilter.selected = filter.id;
        this.historyFilters.depleyment.selectedView = true;
        this.coreService.post('configuration', {
          controllerId: filter.controllerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered4 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered4.account = filter.account;
          this.init();
        });
      } else {
        this.isCustomizationSelected4(false);
        this.savedDeploymentHistoryFilter.selected = filter;
        this.historyFilters.depleyment.selectedView = false;
        this.selectedFiltered4 = {};
        this.init();
      }
      this.historyFilterObj.depleyment = this.savedDeploymentHistoryFilter;

    }
    this.saveService.setHistory(this.historyFilterObj);
    this.saveService.save();
  }

  /* --------------------------Actions -----------------------*/

  private exportToExcelOrder(): any {
    let controllerId = '', workflow = '', orderId = '', status = '', position = '',
      startTime = '', endTime = '', duration = '', plannedTime = '';
    this.translate.get('label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('label.orderId').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    this.translate.get('label.state').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('label.position').subscribe(translatedValue => {
      position = translatedValue;
    });
    this.translate.get('label.plannedTime').subscribe(translatedValue => {
      plannedTime = translatedValue;
    });
    this.translate.get('label.startTime').subscribe(translatedValue => {
      startTime = translatedValue;
    });
    this.translate.get('label.endTime').subscribe(translatedValue => {
      endTime = translatedValue;
    });
    this.translate.get('label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });
    let data = [];
    for (let i = 0; i < this.currentData.length; i++) {
      let obj: any = {};
      if (!this.historyView.current) {
        obj[controllerId] = this.currentData[i].controllerId;
      }
      obj[orderId] = this.currentData[i].orderId;
      obj[workflow] = this.currentData[i].workflow;
      obj[position] = this.currentData[i].position;
      this.translate.get(this.currentData[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      obj[plannedTime] = this.coreService.stringToDate(this.preferences, this.currentData[i].plannedTime);
      obj[startTime] = this.coreService.stringToDate(this.preferences, this.currentData[i].startTime);
      obj[endTime] = this.coreService.stringToDate(this.preferences, this.currentData[i].endTime);
      obj[duration] = this.coreService.calDuration(this.currentData[i].startTime, this.currentData[i].endTime);
      data.push(obj);
    }
    return data;
  }

  private exportToExcelTask(): any {
    let controllerId = '', workflow = '', job = '', status = '', position = '', plannedTime = '',
      startTime = '', endTime = '', duration = '', criticality = '', returnCode = '';
    this.translate.get('label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('label.job').subscribe(translatedValue => {
      job = translatedValue;
    });
    this.translate.get('label.state').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('label.position').subscribe(translatedValue => {
      position = translatedValue;
    });
    this.translate.get('label.plannedTime').subscribe(translatedValue => {
      plannedTime = translatedValue;
    });
    this.translate.get('label.startTime').subscribe(translatedValue => {
      startTime = translatedValue;
    });
    this.translate.get('label.endTime').subscribe(translatedValue => {
      endTime = translatedValue;
    });
    this.translate.get('label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });
    this.translate.get('label.criticality').subscribe(translatedValue => {
      criticality = translatedValue;
    });
    this.translate.get('label.returnCode').subscribe(translatedValue => {
      returnCode = translatedValue;
    });
    let data = [];
    for (let i = 0; i < this.currentData.length; i++) {
      let obj: any = {};
      if (!this.historyView.current) {
        obj[controllerId] = this.currentData[i].controllerId;
      }

      obj[job] = this.currentData[i].job;
      obj[workflow] = this.currentData[i].workflow;
      obj[position] = this.currentData[i].position;
      this.translate.get(this.currentData[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      obj[startTime] = this.coreService.stringToDate(this.preferences, this.currentData[i].startTime);
      obj[endTime] = this.coreService.stringToDate(this.preferences, this.currentData[i].endTime);
      obj[duration] = this.coreService.calDuration(this.currentData[i].startTime, this.currentData[i].endTime);
      obj[criticality] = this.currentData[i].criticality;
      obj[returnCode] = this.currentData[i].exitCode;
      data.push(obj);
    }
    return data;
  }


  private exportToExcelDeployment(): any {
    let controllerId = '', status = '', duration = '', startTime = '', endTime = '';
    this.translate.get('label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('label.startTime').subscribe(translatedValue => {
      startTime = translatedValue;
    });
    this.translate.get('label.endTime').subscribe(translatedValue => {
      endTime = translatedValue;
    });
    this.translate.get('label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });
    let data = [];
    for (let i = 0; i < this.currentData.length; i++) {
      let obj: any = {};
      if (!this.historyView.current) {
        obj[controllerId] = this.currentData[i].controllerId;
      }
      this.translate.get(this.currentData[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });

      obj[startTime] = this.coreService.stringToDate(this.preferences, this.currentData[i].startTime);
      obj[endTime] = this.coreService.stringToDate(this.preferences, this.currentData[i].endTime);
      obj[duration] = this.coreService.calDuration(this.currentData[i].startTime, this.currentData[i].endTime);
      data.push(obj);
    }
    return data;
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].controllerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType == 'ReportingChangedOrder' && this.isLoading && this.historyFilters.type == 'ORDER') {
              //  this.updateHistoryAfterEvent();
              break;
            } else if (args[i].eventSnapshots[j].eventType == 'ReportingChangedJob' && this.isLoading && this.historyFilters.type == 'TASK') {
              //   this.updateHistoryAfterEvent();
              break;
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
    if (this.preferences.dateFormat) {
      this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    }
    this.historyFilters = this.coreService.getHistoryTab();
    this.order = this.historyFilters.order;
    this.task = this.historyFilters.task;
    this.deployment = this.historyFilters.deployment;

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

    if (!this.deployment.filter.date) {
      this.deployment.filter.date = 'today';
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

    this.savedDeploymentHistoryFilter = this.historyFilterObj.deployment || {};
    if (this.historyFilters.deployment.selectedView) {
      this.savedDeploymentHistoryFilter.selected = this.savedDeploymentHistoryFilter.selected || this.savedDeploymentHistoryFilter.favorite;
    } else {
      this.savedDeploymentHistoryFilter.selected = undefined;
    }

    this.checkSharedFilters(this.historyFilters.type);
    this.getIgnoreList();
  }

  private checkSharedFilters(type) {
    let obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: type === 'ORDER' ? 'ORDER_HISTORY' : type === 'TASK' ? 'TASK_HISTORY' : 'DEPLOYMENT_HISTORY',
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
      this.deploymentHistoryFilterList = res ? res.configurations : [];
    }
    this.getCustomizations(type, obj);
  }

  /* --------------------------Customizations -----------------------*/

  private getCustomizations(type, obj) {
    obj.account = this.permission.user;
    obj.shared = false;
    this.coreService.post('configurations', obj).subscribe((result: any) => {
      if (type === 'ORDER') {
        this.checkOrderCustomization(result);
      } else if (type === 'TASK') {
        this.checkTaskCustomization(result);
      } else if (type === 'DEPLOYMENT') {
        this.checkDeploymentCustomization(result);
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
            controllerId: this.orderHistoryFilterList[i].controllerId,
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
            controllerId: this.jobHistoryFilterList[i].controllerId,
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

  private checkDeploymentCustomization(result) {
    if (this.deploymentHistoryFilterList && this.deploymentHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        let data = [];

        for (let i = 0; i < this.deploymentHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.deploymentHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.deploymentHistoryFilterList[i]);
          }
        }
        this.deploymentHistoryFilterList = data;
      }
    } else {
      this.deploymentHistoryFilterList = result.configurations;
    }

    if (this.savedDeploymentHistoryFilter.selected) {
      let flag = true;
      for (let i = 0; i < this.deploymentHistoryFilterList.length; i++) {
        if (this.deploymentHistoryFilterList[i].id == this.savedDeploymentHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            controllerId: this.deploymentHistoryFilterList[i].controllerId,
            id: this.deploymentHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered4 = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered4.account = this.deploymentHistoryFilterList[i].account;
            this.init();
          });
          break;
        }
      }
      if (flag) {
        this.savedDeploymentHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init();
      }
    } else {
      this.loadConfig = true;
      this.savedDeploymentHistoryFilter.selected = undefined;
      this.init();
    }
  }

  private getIgnoreList() {
    let configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'IGNORELIST'
    };
    this.coreService.post('configurations', configObj).subscribe((result: any) => {
      if (result.configurations && result.configurations.length > 0) {
        this.ignoreListConfigId = result.configurations[0].id;
        this.coreService.post('configuration', {
          controllerId: this.schedulerIds.selected,
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
      controllerId: this.historyView.current == true ? this.schedulerIds.selected : ''
    };
    if (this.loadConfig && this.loadIgnoreList) {
      this.isLoading = false;
      if (this.historyFilters.type == 'ORDER') {
        this.orderHistory(obj);
      } else if (this.historyFilters.type == 'TASK') {
        this.taskHistory(obj);
      } else if (this.historyFilters.type == 'DEPLOYMENT') {
        this.deploymentHistory(obj);
      }
    }
  }

  private setDuration(histories): any {
    if (histories.history) {
      histories.history.forEach(function (history, index) {
        if (history.startTime && history.endTime) {
          histories.history[index].duration = new Date(history.endTime).getTime() - new Date(history.startTime).getTime();
        }
      });
    }
    return histories.history || [];
  }

  private editFilter(filter) {
    let filterObj: any = {};
    this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      filterObj.id = filter.id;

      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      if (this.historyFilters.type == 'ORDER') {
        modalRef.componentInstance.allFilter = this.orderHistoryFilterList;
      } else if (this.historyFilters.type == 'TASK') {
        modalRef.componentInstance.allFilter = this.jobHistoryFilterList;
      } else if (this.historyFilters.type == 'DEPLOYMENT') {
        modalRef.componentInstance.allFilter = this.deploymentHistoryFilterList;
      }
      modalRef.componentInstance.filter = filterObj;
      modalRef.componentInstance.edit = true;
      modalRef.componentInstance.type = this.historyFilters.type;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

  private copyFilter(filter) {
    let filterObj: any = {};
    this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      if (this.historyFilters.type == 'ORDER') {
        filterObj.name = this.coreService.checkCopyName(this.orderHistoryFilterList, filter.name);
      } else if (this.historyFilters.type == 'TASK') {
        filterObj.name = this.coreService.checkCopyName(this.jobHistoryFilterList, filter.name);
      } else if (this.historyFilters.type == 'DEPLOYMENT') {
        filterObj.name = this.coreService.checkCopyName(this.deploymentHistoryFilterList, filter.name);
      }

      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.type = this.historyFilters.type;
      if (this.historyFilters.type === 'ORDER') {
        modalRef.componentInstance.allFilter = this.orderHistoryFilterList;
      } else if (this.historyFilters.type === 'TASK') {
        modalRef.componentInstance.allFilter = this.jobHistoryFilterList;
      } else if (this.historyFilters.type === 'DEPLOYMENT') {
        modalRef.componentInstance.allFilter = this.deploymentHistoryFilterList;
      }
      modalRef.componentInstance.filter = filterObj;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

}
