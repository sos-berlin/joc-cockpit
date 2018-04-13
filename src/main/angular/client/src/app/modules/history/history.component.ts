import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {DataService} from "../../services/data.service";
import {CoreService} from "../../services/core.service";
import {AuthService} from "../../components/guard/auth.service";
import {SaveService} from "../../services/save.service";

import * as _ from 'underscore';
import * as moment from 'moment';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  historyView: any = {};
  schedulerIds: any={};
  preferences: any={};
  permission: any={};
  subscription: Subscription;
  isLoading: boolean = false;
  loading: boolean = false;
  loadConfig: boolean = false;
  loadIgnoreList: boolean = false;
  isLoaded: boolean = false;
  showSearchPanel: boolean = false;
  dateFormat: any;
  dateFormatM: any;
  config: any = {};
  notAuthenticate: boolean = false;
  historyFilters: any = {};
  dataFormat: string;
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

  ignoreListConfigId: number = 0;


  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });

  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === "AuditLogChanged") {

              break;
            }
          }
        }
        break
      }
    }
  }

  ngOnInit() {
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.permission = JSON.parse(this.authService.permission);
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
    console.log('this.order.filter........')
    console.log(this.order.filter)
    console.log('befor........')
    this.checkSharedFilters(this.historyFilters.type);
    this.getIgnoreList();
    console.log(this.order.filter)

  }

  private parseProcessExecuted(regex, obj): any {
    let fromDate, toDate, date, arr;

    if (/^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.exec(regex)[0];

    } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      let seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2]);
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
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(regex)) {
      let time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(regex);
      fromDate = new Date();
      if (/(pm)/i.test(time[3]) && parseInt(time[1]) != 12) {
        fromDate.setHours(parseInt(time[1]) - 12);
      } else {
        fromDate.setHours(parseInt(time[1]));
      }

      fromDate.setMinutes(parseInt(time[2]));
      toDate = new Date();
      if (/(pm)/i.test(time[6]) && parseInt(time[4]) != 12) {
        toDate.setHours(parseInt(time[4]) - 12);
      } else {
        toDate.setHours(parseInt(time[4]));
      }
      toDate.setMinutes(parseInt(time[5]));
    }

    if (fromDate) {
      obj.dateFrom = fromDate;
    }
    if (toDate) {
      obj.dateTo = toDate;
    }
    return obj;
  }

  private checkSharedFilters(type) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      configurationType: "CUSTOMIZATION",
      objectType: type === 'ORDER' ? "ORDER_HISTORY" : type === 'TASK' ? "TASK_HISTORY" : "YADE_HISTORY",
      shared: true
    };
    if (this.permission.JOCConfigurations.share.view) {
      this.coreService.post('configurations', obj).subscribe((res) => {
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
    this.coreService.post('configurations', obj).subscribe((result) => {
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
          let result: any;
          this.coreService.post('configuration', {
            jobschedulerId: this.orderHistoryFilterList[i].jobschedulerId,
            id: this.orderHistoryFilterList[i].id
          }).subscribe((conf) => {
            result = conf;
            this.loadConfig = true;
            this.selectedFiltered1 = JSON.parse(result.configuration.configurationItem);
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
          let result: any;
          this.coreService.post('configuration', {
            jobschedulerId: this.jobHistoryFilterList[i].jobschedulerId,
            id: this.jobHistoryFilterList[i].id
          }).subscribe((conf) => {
            result = conf;
            this.loadConfig = true;
            this.selectedFiltered2 = JSON.parse(result.configuration.configurationItem);
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
          let result: any;
          this.coreService.post('configuration', {
            jobschedulerId: this.yadeHistoryFilterList[i].jobschedulerId,
            id: this.yadeHistoryFilterList[i].id
          }).subscribe((conf) => {
            result = conf;
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
      configurationType: "IGNORELIST"
    };
    let result: any;
    this.coreService.post('configurations', configObj).subscribe((res) => {
      result = res;
      if (result.configurations && result.configurations.length > 0) {
        this.ignoreListConfigId = result.configurations[0].id;
        let result1: any;
        this.coreService.post('configuration', {
          jobschedulerId: this.schedulerIds.selected,
          id: result.configurations[0].id
        }).subscribe((res1) => {
          result1 = res1;
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

  changeJobScheduler() {
    this.init();
  };


  init() {
    let obj = {
      jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : ''
    };
    if (this.loadConfig && this.loadIgnoreList) {
      this.isLoaded = false;
      if (this.historyFilters.type == 'TASK') {
        this.taskHistory(obj);
      } else if (this.historyFilters.type == 'ORDER') {
        this.orderHistory(obj);
      } else {
        this.yadeHistory(obj);
      }
    }
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
      })
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

    obj = this.parseProcessExecuted(this.selectedFiltered1.planned, obj);
    return obj;
  }

  isCustomizationSelected1(flag) {
    console.log(flag + ' flag...')
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
    obj.limit = parseInt(this.preferences.maxRecords);
    obj.timeZone = this.preferences.zone;
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      delete obj["timeZone"];
    }
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = moment(obj.dateFrom).tz(this.preferences.zone);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = moment(obj.dateTo).tz(this.preferences.zone);
    }
    this.coreService.post('orders/history', obj).subscribe((res) => {
      this.historys = this.setDuration(res);
      this.isLoading = true;
      this.isLoaded = true;
    }, function () {
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
      })
    }
    if (this.selectedFiltered2.jobs && this.selectedFiltered2.jobs.length > 0) {
      obj.jobs = [];

      this.selectedFiltered2.jobs.forEach(function (value) {
        obj.jobs.push({job: value});
      });

    }
    obj = this.parseProcessExecuted(this.selectedFiltered2.planned, obj);
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
    obj.limit = parseInt(this.preferences.maxRecords);
    obj.timeZone = this.preferences.zone;

    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      delete obj["timeZone"];
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

  mergeHostAndProtocol(hosts, protocols) {
    var arr = [];
    if (protocols.length < hosts.length) {
      hosts.forEach(function (value, index) {
        if (protocols.length > 0) {
          if (protocols.length < hosts.length) {
            if (protocols.length == 1) {
              arr.push({host: value, protocol: protocols[0]});
            } else {
              for (var x = 0; x < protocols.length; x++) {
                if (protocols.length >= index) {
                  arr.push({host: value, protocol: protocols[index]});
                }
                break;
              }
            }
          }
        } else {
          arr.push({host: value})
        }

      })
    } else if (protocols.length > hosts.length) {
      protocols.forEach(function (value, index) {
        if (hosts.length > 0) {
          if (hosts.length < protocols.length) {
            if (hosts.length == 1) {
              arr.push({protocol: value, host: hosts[0]});
            } else {
              for (var x = 0; x < hosts.length; x++) {
                if (hosts.length >= index) {
                  arr.push({protocol: value, host: hosts[index]});
                }
                break;
              }
            }
          }
        } else {
          arr.push({protocol: value})
        }

      })
    } else {
      hosts.forEach(function (value, index) {
        for (let x = 0; x < protocols.length; x++) {
          arr.push({host: value, protocol: protocols[x]});
          protocols.splice(index, 1);
          break;
        }
      });
    }
    return arr;
  }

  yadeParseDate(obj) {
    if (this.selectedFiltered3.states && this.selectedFiltered3.states.length > 0) {
      obj.states = this.selectedFiltered3.states;
    }

    if (this.selectedFiltered3.operations && this.selectedFiltered3.operations.length > 0) {
      obj.operations = this.selectedFiltered3.operations;
    }

    if (this.selectedFiltered3.profileId) {
      this.selectedFiltered3.profileId = this.selectedFiltered3.profileId.replace(/\s*(,|^|$)\s*/g, "$1");
      obj.profiles = this.selectedFiltered3.profileId.split(',');
    }

    if (this.selectedFiltered3.mandator) {
      obj.mandator = this.selectedFiltered3.mandator;
    }

    if (this.selectedFiltered3.sourceFileName) {
      this.selectedFiltered3.sourceFileName = this.selectedFiltered3.sourceFileName.replace(/\s*(,|^|$)\s*/g, "$1");
      obj.sourceFiles = this.selectedFiltered3.sourceFileName.split(',');
    }
    if (this.selectedFiltered3.targetFileName) {
      this.selectedFiltered3.targetFileName = this.selectedFiltered3.targetFileName.replace(/\s*(,|^|$)\s*/g, "$1");
      obj.targetFiles = this.selectedFiltered3.targetFileName.split(',');
    }
    if (this.selectedFiltered3.sourceHost || this.selectedFiltered3.sourceProtocol) {
      let hosts = [];
      let protocols = [];
      if (this.selectedFiltered3.sourceHost) {
        this.selectedFiltered3.sourceHost = this.selectedFiltered3.sourceHost.replace(/\s*(,|^|$)\s*/g, "$1");
        hosts = this.selectedFiltered3.sourceHost.split(',');
      }
      if (this.selectedFiltered3.sourceProtocol) {
        this.selectedFiltered3.sourceProtocol = this.selectedFiltered3.sourceProtocol.replace(/\s*(,|^|$)\s*/g, "$1");
        protocols = this.selectedFiltered3.sourceProtocol.split(',');
      }
      obj.sources = this.mergeHostAndProtocol(hosts, protocols);

    }
    if (this.selectedFiltered3.targetHost || this.selectedFiltered3.targetProtocol) {
      let hosts = [];
      let protocols = [];
      if (this.selectedFiltered3.targetHost) {
        this.selectedFiltered3.targetHost = this.selectedFiltered3.targetHost.replace(/\s*(,|^|$)\s*/g, "$1");
        hosts = this.selectedFiltered3.targetHost.split(',');
      }
      if (this.selectedFiltered3.targetProtocol) {
        this.selectedFiltered3.targetProtocol = this.selectedFiltered3.targetProtocol.replace(/\s*(,|^|$)\s*/g, "$1");
        protocols = this.selectedFiltered3.targetProtocol.split(',');
      }
      obj.targets = this.mergeHostAndProtocol(hosts, protocols);
    }
    if (this.selectedFiltered3.planned)
      obj = this.parseProcessExecuted(this.selectedFiltered3.planned, obj);
    return obj;
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
      obj = this.yadeParseDate(obj);
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
      delete obj["timeZone"];
    }
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = moment(obj.dateFrom).tz(this.preferences.zone);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = moment(obj.dateTo).tz(this.preferences.zone);
    }
    obj.compact = true;
    let result:any;
    this.coreService.post('yade/transfers', obj).subscribe((res) => {
      result=res;
      this.yadeHistorys = result.transfers;
      this.isLoading = true;
      this.isLoaded = true;
    }, () => {
      this.isLoading = true;
      this.isLoaded = true;
    });
  }

  private setDuration(histories): any {
    histories.history.forEach(function (history, index) {
      if (history.startTime && history.endTime) {
        histories.history[index].duration = new Date(history.endTime).getTime() - new Date(history.startTime).getTime();
      }
    });
    return histories.history;
  }

  search(flag) {
    if (!flag)
      this.loading = true;
    let obj = {
      jobschedulerId: this.historyView.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxRecords)
    };
  }

  advancedSearch() {
    this.showSearchPanel = true;
    this.object.paths = [];
    this.object.orders = [];
    this.object.jobChains = [];
    this.object.jobs = [];
    this.jobChainSearch.date = 'date';
    this.jobSearch.date = 'date';
    this.yadeSearch.date = 'date';

    this.jobChainSearch.from = new Date();
    this.jobChainSearch.fromTime = '00:00';
    this.jobChainSearch.to = new Date();
    this.jobChainSearch.toTime = '00:00';

    this.jobSearch.from = new Date();
    this.jobSearch.fromTime = '00:00';
    this.jobSearch.to = new Date();
    this.jobSearch.toTime = '00:00';

    this.yadeSearch.from = new Date();
    this.yadeSearch.fromTime = '00:00';
    this.yadeSearch.to = new Date();
    this.yadeSearch.toTime = '00:00';
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
    this.init()
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

  /* --------------------------Actions -----------------------*/


  showLogWindow() {

  }

  showJobChain(jobChain) {

  }

  showJob(job) {

  }

  showOrderLink(jobChain, orderId) {

  }

  exportToExcel() {

  }

  showPanelFuc(data) {
    data.show = true;
    data.steps =[];
    let obj = {
      jobschedulerId: data.jobschedulerId || this.schedulerIds.selected,
      jobChain: data.jobChain,
      orderId: data.orderId,
      historyId: data.historyId
    };
    let result:any;
    this.coreService.post('order/history', obj).subscribe((res) => {
      result = res;
      data.steps = result.history.steps;
    });
  }

  showTransferFuc(data) {
    let obj = {
      jobschedulerId: data.jobschedulerId || this.schedulerIds.selected,
      transferIds: [data.id]
    };
    let result: any;
    this.coreService.post('yade/transfers', obj).subscribe((res) => {
       result = res;
      data = _.extend(data, result.transfers[0]);
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
    data.show = true;
    data.files =[];
    let ids = [data.id];
    let result1: any;
    this.coreService.post('yade/files', {
      transferIds: ids,
      jobschedulerId: data.jobschedulerId || this.schedulerIds.selected
    }).subscribe((res) => {
      result1 = res;
      data.files = result1.files;
    })
  };

  /* --------------------------Ignore List -----------------------*/
  addOrderToIgnoreList(orderId, jobChain) {

  }

  addJobToIgnoreList(job) {

  }

  addJobChainToIgnoreList(jobChain) {

  }

  editIgnoreList() {

  }

  enableDisableIgnoreList() {

  }

  resetIgnoreList() {

  }

  /* --------------------------Customizations -----------------------*/

  checkFilterName() {

  }

  advanceFilter() {

  }

  editFilters() {

  }

  changeFilter(filter) {

  }

  saveAsFilter() {

  }

  /* --------------------------Tree Modal -----------------------*/
  getTreeStructure() {

  }

  remove(obj, type) {

  }

  getTreeStructureForObjects() {

  }

}
