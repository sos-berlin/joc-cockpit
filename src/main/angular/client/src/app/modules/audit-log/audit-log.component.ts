import { Component, OnInit,Input, OnDestroy } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { SaveService } from '../../services/save.service';
import { AuthService } from '../../components/guard/auth.service';
import { DataService } from '../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';

import * as _ from 'underscore';
import * as moment from 'moment';

declare var $;

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit, OnDestroy {

  schedulerIds: any ={};
  preferences: any ={};
  permission: any ={};
  adtLog: any = {};
  subscription: Subscription;
  auditLogs: any = [];
  isLoaded: boolean = false;
  loading: boolean = false;
  showSearchPanel: boolean = false;
  auditSearch: any = {};
  dateFormat: any;
  dateFormatM: any;
  config: any = {};
  searchKey: string;

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
              this.load(null);
              break;
            }
          }
        }
        break
      }
    }
  }

  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences);
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.permission = JSON.parse(this.authService.permission);
    this.adtLog = this.coreService.getAuditLogTab();
    this.load(null);
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.config = {
      format: this.dateFormatM,
      max: moment().format(this.dateFormatM)
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  sortBy(propertyName) {
    this.adtLog.reverse = !this.adtLog.reverse;
    this.adtLog.filter.sortBy = propertyName;
  }

  private setDateRange(filter) {
    if (this.adtLog.filter.date == 'all') {

    } else if (this.adtLog.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else {
      filter.dateFrom = this.adtLog.filter.date;
    }
    return filter;
  }

  private parseProcessExecuted(regex, obj) {
    let fromDate;
    let toDate;

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

  load(date) {
    if (date)
      this.adtLog.filter.date = date;
    let obj = {
      jobschedulerId: this.adtLog.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords),
      timeZone: this.preferences.zone
    };
    obj = this.setDateRange(obj);
    let result: any;
    this.coreService.post('audit_log', obj).subscribe(res => {
      result = res;
      this.auditLogs = result.auditLog;
      this.isLoaded = true;
    }, (err) => {
      console.log(err);
      this.isLoaded = true;
    });
  }

  changeJobScheduler() {
    this.load(null);
  }

  /* ----------------------Action --------------------- */

  exportToExcel() {
    $('#auditLogTableId').table2excel({
      exclude: ".tableexport-ignore",
      filename: "jobscheduler-agent-job-excution",
      fileext: ".xls",
      exclude_img: false,
      exclude_links: false,
      exclude_inputs: false
    });
  }

  showJobChain(jobChain) {

  }

  showOrderLink(jobChain) {

  }

  showJob(job) {

  }

  showCalendarLink(calendar) {

  }

  /* ----------------------Advance Search --------------------- */
  advancedSearch() {
    let date = new Date();
    date.setDate(date.getDate() - 1);
    this.showSearchPanel = true;
    this.auditSearch = {
      date: 'date',
      from: moment(date).format(this.dateFormatM),
      fromTime: '00:00:00',
      to: moment().format(this.dateFormatM),
      toTime: '00:00:00',
      planned: ''
    };
  }

  cancel() {
    if (!this.adtLog.filter.date) {
      this.adtLog.filter.date = 'today';
    }
    this.showSearchPanel = false;
    this.auditSearch = {};
    this.load(null);
  }

  private parseDate(auditSearch, filter) {
    if (auditSearch.date === 'date' && auditSearch.from) {
      let fromDate = new Date(auditSearch.from);
      if (auditSearch.fromTime) {
        fromDate.setHours(moment(auditSearch.fromTime, 'HH:mm:ss').hours());
        fromDate.setMinutes(moment(auditSearch.fromTime, 'HH:mm:ss').minutes());
        fromDate.setSeconds(moment(auditSearch.fromTime, 'HH:mm:ss').seconds());
      } else {
        fromDate.setHours(0);
        fromDate.setMinutes(0);
        fromDate.setSeconds(0);
      }
      fromDate.setMilliseconds(0);

      filter.dateFrom = fromDate;
    }
    if (auditSearch.date === 'date' && auditSearch.to) {
      let toDate = new Date(auditSearch.to);
      if (auditSearch.toTime) {
        toDate.setHours(moment(auditSearch.fromTime, 'HH:mm:ss').hours());
        toDate.setMinutes(moment(auditSearch.fromTime, 'HH:mm:ss').minutes());
        toDate.setSeconds(moment(auditSearch.fromTime, 'HH:mm:ss').seconds());

      } else {
        toDate.setHours(0);
        toDate.setMinutes(0);
        toDate.setSeconds(0);
      }
      toDate.setMilliseconds(0);

      filter.dateTo = toDate;
    }
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      delete filter['timeZone']
    }
    return filter;
  }

  search() {

    let filter = {
      jobschedulerId: this.adtLog.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxAuditLogRecords),
      orders: [],
      jobs: [],
      regex: '',
      calendars: '',
      account: this.auditSearch.account ? this.auditSearch.account : undefined,
      timeZone: this.preferences.zone
    };

    this.adtLog.filter.date = '';
    if (this.auditSearch.jobChain) {
      if (this.auditSearch.orderIds) {
        let s = this.auditSearch.orderIds.replace(/\s*(,|^|$)\s*/g, "$1");
        let orderIds = s.split(',');
        let self = this;
        orderIds.forEach(function (value) {
          filter.orders.push({jobChain: self.auditSearch.jobChain, orderId: value})
        });
      } else {
        filter.orders.push({jobChain: this.auditSearch.jobChain})
      }
    }
    if (this.auditSearch.job) {
      let s = this.auditSearch.job.replace(/\s*(,|^|$)\s*/g, "$1");
      let jobs = s.split(',');
      jobs.forEach(function (value) {
        filter.jobs.push({job: value})
      });
    }
    if (this.auditSearch.calendars) {
      let s = this.auditSearch.calendars.replace(/\s*(,|^|$)\s*/g, "$1");
      filter.calendars = s.split(',');
    }
    if (this.auditSearch.regex) {
      filter.regex = this.auditSearch.regex;
    }
    if (this.auditSearch.date == 'process') {
      filter = this.parseProcessExecuted(this.auditSearch.planned, filter);
    } else {
      filter = this.parseDate(this.auditSearch, filter);
    }

    let result: any;
    this.coreService.post('audit_log', filter).subscribe(res => {
      result = res;
      this.auditLogs = result.auditLog;
      //  this.isLoaded = false;
    }, (err) => {
      console.log(err);
      //  this.isLoaded = false;
    });
  }

}
