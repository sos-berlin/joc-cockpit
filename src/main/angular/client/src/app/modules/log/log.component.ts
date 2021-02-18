import {Component, HostListener, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'underscore';
import * as moment from 'moment-timezone';
import {Subscription} from 'rxjs';

declare const $;

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html'
})
export class LogComponent implements OnInit, OnDestroy, AfterViewInit {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  loading = false;
  isCancel = false;
  errStatus = '';
  sheetContent = '';
  error: any;
  object: any = {
    checkBoxs: [],
    debug: 'Debug'
  };
  isDeBugLevel = false;
  isFatalLevel = false;
  isErrorLevel = false;
  isWarnLevel = false;
  isTraceLevel = false;
  isStdErrLevel = false;
  isDetailLevel = false;
  isInfoLevel = false;
  subscriber: Subscription;
  orderId: any;
  taskId: any;
  workflow: any;
  job: any;
  canceller: any;
  scrolled = false;
  isExpandCollapse = false;
  taskCount = 1;
  @ViewChild('dataBody', {static: false}) dataBody: ElementRef;

  constructor(private route: ActivatedRoute, private authService: AuthService, public coreService: CoreService) {

  }

  static calculateHeight() {
    const $header = $('app-header').height() || 60;
    const $topHeader = $('.top-header-bar').height() || 16;
    const $subHeaderHt = $('.sub-header').height() || 59;
    const height = window.innerHeight - ($header + $topHeader + $subHeaderHt + 140);
    $('.log').height(height);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    LogComponent.calculateHeight();
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    }
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (!this.preferences.logFilter) {
      this.preferences.logFilter = {
        scheduler: true,
        stdout: true,
        stderr: true,
        info: true,
        debug: false,
        fatal: true,
        error: true,
        warn: true,
        trace: true,
        detail: false
      };
    }
    this.object.checkBoxs = this.preferences.logFilter;
    this.init();
  }

  ngAfterViewInit() {
    if (!this.scrolled && this.dataBody.nativeElement) {
      this.dataBody.nativeElement.scrollTop = this.dataBody.nativeElement.scrollHeight;
      this.scrolled = true;
    }
  }

  scrollBottom() {
    const pre = this.dataBody.nativeElement;
    $('#pp').scroll(() => {
      if (!this.scrolled) {
        pre.scrollTop = pre.scrollHeight;
      }
      //updateScroll();
    });
  }

  ngOnDestroy(): void {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  init() {
    this.loading = true;
    if (this.route.snapshot.queryParams['historyId']) {
      this.orderId = this.route.snapshot.queryParams['orderId'];
      this.loadOrderLog();
    } else if (this.route.snapshot.queryParams['taskId']) {
      this.taskId = parseInt(this.route.snapshot.queryParams['taskId'], 10);
      this.loadJobLog();
    }
  }

  loadOrderLog() {
    this.workflow = this.route.snapshot.queryParams['workflow'];
    const order: any = {};
    order.controllerId = this.route.snapshot.queryParams['schedulerId'];
    order.historyId = parseInt(this.route.snapshot.queryParams['historyId'], 10);
    this.canceller = this.coreService.post('order/log', order).subscribe((res: any) => {
      if (res) {
        this.jsonToString(res);
        this.showHideTask(this.route.snapshot.queryParams['schedulerId'], res);
        if (!res.complete && !this.isCancel) {
          this.runningOrderLog({historyId: order.historyId, controllerId: order.controllerId, eventId: res.eventId});
        }
      }
    }, (err) => {
      window.document.getElementById('logs').innerHTML = '';
      if (err.data && err.data.error) {
        this.error = err.data.error.message;
      } else {
        this.error = err.message;
      }
      this.errStatus = err.status;
      this.loading = false;
    });
  }

  showHideTask(id, res) {
    const x: any = document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      const element = x[i];
      element['childNodes'][0].addEventListener('click', () => {
        const jobs: any = {};
        jobs.controllerId = id;
        jobs.taskId = document.getElementById('tx_id_' + (i + 1)).innerText;
        const a = document.getElementById('tx_log_' + (i + 1));
        if (a.classList.contains('hide')) {
          this.coreService.log('task/log', jobs, {
            responseType: 'text' as 'json',
            observe: 'response' as 'response'
          }).subscribe((res1: any) => {
            if (res1) {
              this.renderData(res1.body, 'tx_log_' + (i + 1));
              document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-down');
              document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-up');
              a.classList.remove('hide');
              a.classList.add('show');
              if (res1.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
                const obj = {controllerId: jobs.controllerId, tasks: []};
                obj.tasks.push({taskId: jobs.taskId, eventId: res1.headers.get('X-Log-Event-Id')});
                this.runningTaskLog(obj, 'tx_log_' + (i + 1));
              }
            }
          });
        } else {
          document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-up');
          document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-down');
          a.classList.remove('show');
          a.classList.add('hide');
          const z = document.getElementById('tx_id_' + (i + 1)).innerText;
          document.getElementById('tx_log_' + (i + 1)).innerHTML = '';
          document.getElementById('tx_log_' + (i + 1)).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + z + `</div>`;
        }
      });
    }

    if (res.complete) {
      const z: any = document.getElementsByClassName('tx_order');
      z[z.length - 1].childNodes[0].click();
    }
  }

  loadJobLog() {
    this.job = this.route.snapshot.queryParams['job'];
    let jobs: any = {};
    jobs.controllerId = this.route.snapshot.queryParams['schedulerId'];
    jobs.taskId = this.taskId;

    this.canceller = this.coreService.log('task/log', jobs, {
      responseType: 'text' as 'json',
      observe: 'response' as 'response'
    }).subscribe((res: any) => {
      if (res) {
        this.renderData(res.body, false);
        if (res.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
          const obj = {controllerId: jobs.controllerId, tasks: []};
          obj.tasks.push({taskId: jobs.taskId, eventId: res.headers.get('X-Log-Event-Id')});
          this.runningTaskLog(obj, false);
        }
      }
    }, (err) => {
      window.document.getElementById('logs').innerHTML = '';
      if (err.data && err.data.error) {
        this.error = err.data.error.message;
      } else {
        this.error = err.message;
      }
      this.errStatus = err.status;
      this.loading = false;
    });
  }

  runningTaskLog(obj, orderTaskFlag) {
    if (obj.eventId) {
      this.coreService.post('task/log/running', obj).subscribe((res: any) => {
        if (res) {
          for (let i = 0; i < res.tasks.length; i++) {
            this.renderData(res.tasks[i].log, orderTaskFlag);
            if (!res.tasks[i].complete && !this.isCancel) {
              obj.tasks[i].eventId = res.tasks[i].eventId;
              this.runningTaskLog(obj, orderTaskFlag);
            }
          }
        }
      });
    }
  }

  runningOrderLog(obj) {
    if (obj.eventId) {
      this.coreService.post('order/log/running', obj).subscribe((res: any) => {
        if (res) {
          this.jsonToString(res);
          if (!res.complet && !this.isCancel) {
            obj.eventId = res.eventId;
            this.runningOrderLog(obj);
            this.showHideTask(this.route.snapshot.queryParams['schedulerId'], res);
          } else {
            const x: any = document.getElementsByClassName('tx_order');
          }
        }
      });
    }
  }

  jsonToString(json) {
    if (!json) {
      return;
    }
    const dt = json.logEvents;
    let col = '';
    this.isInfoLevel = true;
    for (let i = 0; i < dt.length; i++) {
      const div = window.document.createElement('div');
      if (dt[i].logLevel === 'INFO') {
        div.className = 'log_info';
        if (!this.object.checkBoxs.info) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'STDOUT') {
        div.className += ' log_stdout';
        div.className += ' stdout';
        if (!this.object.checkBoxs.stdout) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'DEBUG') {
        div.className += ' log_debug';
        if (!this.object.checkBoxs.debug) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'STDERR') {
        div.className += ' log_stderr';
        div.className += ' stderr';
        if (!this.object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'WARN') {
        div.className += ' log_warn';
        div.className += ' warn';
        if (!this.object.checkBoxs.warn) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'ERROR') {
        div.className += ' log_error';
        div.className += ' error';
        if (!this.object.checkBoxs.error) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'TRACE') {
        div.className += ' log_trace';
        div.className += ' trace';
        if (!this.object.checkBoxs.trace) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'FATAL') {
        div.className += ' log_fatal';
        div.className += ' fatal';
        if (!this.object.checkBoxs.fatal) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'DETAIL') {
        div.className += ' log_detail';
        div.className += ' detail';
        if (!this.object.checkBoxs.detail) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'SUCCESS') {
        div.className += ' log_success';
      } else if (dt[i].logLevel === 'ERROR') {
        div.className += ' log_error';
      }

      if (!this.isDeBugLevel && dt[i].logLevel === 'DEBUG') {
        this.isDeBugLevel = true;
      }
      if (!this.isStdErrLevel && dt[i].logLevel === 'STDERR') {
        this.isStdErrLevel = true;
      }
      if (!this.isErrorLevel && dt[i].logLevel === 'ERROR') {
        this.isErrorLevel = true;
      }
      if (!this.isWarnLevel && dt[i].logLevel === 'WARN') {
        this.isWarnLevel = true;
      }
      if (!this.isTraceLevel && dt[i].logLevel === 'TRACE') {
        this.isTraceLevel = true;
      }
      if (!this.isFatalLevel && dt[i].logLevel === 'FATAL') {
        this.isFatalLevel = true;
      }
      if (!this.isDetailLevel && dt[i].logLevel === 'DETAIL') {
        this.isDetailLevel = true;
      }

      const datetime = this.preferences.logTimezone ? moment(dt[i].controllerDatetime).tz(this.preferences.zone).format('YYYY-MM-DD HH:mm:ss.SSSZ') : dt[i].controllerDatetime;
      col = (datetime + ' <span style="width: 64px;display: inline-block;">[' + dt[i].logLevel + ']</span> ' +
        '[' + dt[i].logEvent + '] ' + (dt[i].orderId ? ('id=' + dt[i].orderId) : '') + ( dt[i].position ? ', pos=' + dt[i].position : '') + '');
      if (dt[i].job) {
        col += ', Job=' + dt[i].job;
      }
      if (dt[i].agentDatetime) {
        col += ', Agent' + '(';
        if (dt[i].agentUrl) {
          col += 'url=' + dt[i].agentUrl + ', ';
        }
        if (dt[i].agentPath) {
          col += 'path=' + dt[i].agentPath + ', ';
        }
        if (dt[i].agentDatetime) {
          const datetime = this.preferences.logTimezone ? moment(dt[i].agentDatetime).tz(this.preferences.zone).format('YYYY-MM-DD HH:mm:ss.SSSZ') : dt[i].agentDatetime;
          col += 'time=' + datetime;
        }
        col += ')';
      }
      if (dt[i].error && !_.isEmpty(dt[i].error)) {
        col += ', Error (status=' + dt[i].error.errorState;
        if (dt[i].error.errorCode) {
          col += ', code=' + dt[i].error.errorCode;
        }
        if (dt[i].error.errorReason) {
          col += ', reason=' + dt[i].error.errorReason;
        }
        if (dt[i].error.errorText) {
          col += ', msg=' + dt[i].error.errorText;
        }
        col += ')';
      }
      if (dt[i].returnCode != null && dt[i].returnCode != undefined) {
        col += ', returnCode=' + dt[i].returnCode;
      }
      if (dt[i].logEvent && dt[i].logEvent.match(/Lock/)){
        if (dt[i].lock) {
          col += ', Lock' + '(';
          if (dt[i].lock.lockId) {
            col += 'id=' + dt[i].lock.lockId;
          }
          if (dt[i].lock.limit) {
            col += ', limit=' + dt[i].lock.limit;
          }
          if (dt[i].lock.count) {
            col += ', count=' + dt[i].lock.count;
          }
          if (dt[i].lock.lockState) {
            if (dt[i].lock.lockState.orderIds) {
              col += ', orderIds=' + dt[i].lock.lockState.orderIds;
            }
            if (dt[i].lock.lockState.queuedOrderIds) {
              col += ', queuedOrderIds=' + dt[i].lock.lockState.queuedOrderIds;
            }
          }
          col += ')';
        }
      }

      if (dt[i].logEvent === 'OrderProcessingStarted') {
        const x = `<span class="tx_order"><i id="ex_` + this.taskCount + `" class="cursor fa fa-caret-down fa-lg p-r-xs"></i><span>` + col + `<div id="tx_log_` + this.taskCount + `" class="hide inner-log-m"><div id="tx_id_` + this.taskCount + `" class="hide">` + dt[i].taskId + `</div><div class="tx_data_` + this.taskCount + `"></div></div>`;
        this.taskCount++;
        div.innerHTML = x;
      } else {
        div.innerHTML = `<span style="margin-left: 13px"><span>` + col;
      }
      window.document.getElementById('logs').appendChild(div);
    }
    if (this.taskCount > 1) {
      this.isExpandCollapse = true;
    }
    this.loading = false;
  }

  renderData(res, orderTaskFlag) {
    this.loading = false;
    LogComponent.calculateHeight();
    const timestampRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9].(\d)+([+,-])(\d+)(:\d+)*/;
    ('\n' + res).replace(/\r?\n([^\r\n]+((\[)(error|info\s?|fatal\s?|warn\s?|debug\d?|trace|stdout|stderr)(\])||([a-z0-9:\/\\]))[^\r\n]*)/img, (match, prefix, level, suffix, offset) => {
      let div = window.document.createElement('div'); // Now create a div element and append it to a non-appended span.
      if (timestampRegex.test(match)) {
        let arr = match.split(/\s+\[/);
        let date;
        if (arr && arr.length > 0) {
          date = arr[0];
        }
        if (date) {
          const datetime = this.preferences.logTimezone ? moment(date).tz(this.preferences.zone).format('YYYY-MM-DD HH:mm:ss.SSSZ') : date;
          match = match.replace(timestampRegex, datetime);
        }
      }
      level = (level) ? level.trim().toLowerCase() : 'info';
      if (level !== 'info') {
        div.className = 'log_' + level;
      }
      if (level === 'stdout') {
        div.className += ' stdout';
        if (!this.object.checkBoxs.stdout) {
          div.className += ' hide-block';
        }
      } else if (level === 'stderr') {
        div.className += ' stderr';
        if (!this.object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else if (level === 'fatal') {
        div.className += ' fatal';
        if (!this.object.checkBoxs.fatal) {
          div.className += ' hide-block';
        }
      } else if (level === 'error') {
        div.className += ' error';
        if (!this.object.checkBoxs.error) {
          div.className += ' hide-block';
        }
      } else if (level === 'warn') {
        div.className += ' warn';
        if (!this.object.checkBoxs.warn) {
          div.className += ' hide-block';
        }
      } else if (level === 'trace') {
        div.className += ' trace';
        if (!this.object.checkBoxs.trace) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[stdout\]/i) > -1) {
        div.className += ' stdout';
        if (!this.object.checkBoxs.stdout) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[stderr\]/i) > -1) {
        div.className += ' stderr';
        if (!this.object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else {
        div.className += ' scheduler scheduler_' + level;
        if (!this.object.checkBoxs.scheduler) {
          div.className += ' hide-block';
        }
      }

      if (level.match('^debug') && !this.object.checkBoxs.debug) {
        div.className += ' hide-block';
      }

      div.textContent = match.replace(/^\r?\n/, '');

      if (div.innerText.match(/(\[MAIN\])\s*(\[End\])\s*(\[Success\])/) || div.innerText.match(/(\[INFO\])\s*(\[End\])\s*(\[Success\])/)) {
        div.className += ' log_success';
      } else if (div.innerText.match(/(\[MAIN\])\s*(\[End\])\s*(\[Error\])/) || div.innerText.match(/(\[INFO\])\s*(\[End\])\s*(\[Error\])/)) {
        div.className += ' log_error';
      }

      if (!this.isDeBugLevel) {
        this.isDeBugLevel = !!level.match('^debug');
      }

      if (!this.isStdErrLevel) {
        this.isStdErrLevel = div.className.indexOf('stderr') > -1;
      }
      if (!this.isFatalLevel) {
        this.isFatalLevel = div.className.indexOf('fatal') > -1;
      }
      if (!this.isErrorLevel) {
        this.isErrorLevel = div.className.indexOf('error') > -1;
      }
      if (!this.isWarnLevel) {
        this.isWarnLevel = div.className.indexOf('warn') > -1;
      }
      if (!this.isTraceLevel) {
        this.isTraceLevel = div.className.indexOf('trace') > -1;
      }
      if (!orderTaskFlag) {
        window.document.getElementById('logs').appendChild(div);
      } else {
        window.document.getElementById(orderTaskFlag).appendChild(div);
      }
      return '';
    });

    if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter') {
      setTimeout(() => {
        $('.log_info').css('color', 'white');
      }, 100);
    }

  }

  expandAll() {
    const x: any = document.getElementsByClassName('tx_order');
    const arr: any = [];
    for (let i = 0; i < x.length; i++) {
      const jobs: any = {};
      jobs.controllerId = this.route.snapshot.queryParams['schedulerId'];
      jobs.taskId = document.getElementById('tx_id_' + (i + 1)).innerText;
      const a = document.getElementById('tx_log_' + (i + 1));
      if (a.classList.contains('hide')) {
        this.coreService.log('task/log', jobs, {
          responseType: 'text' as 'json',
          observe: 'response' as 'response'
        }).subscribe((res: any) => {
          if (res) {
            this.renderData(res.body, 'tx_log_' + (i + 1));
            document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-down');
            document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-up');
            a.classList.remove('hide');
            a.classList.add('show');
            if (res.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
              const obj = {controllerId: jobs.controllerId, tasks: []};
              obj.tasks.push({taskId: jobs.taskId, eventId: res.headers.get('X-Log-Event-Id')});
              this.runningTaskLog(obj, 'tx_log_' + (i + 1));
            }
          }
        });
      }
    }
  }

  collapseAll() {
    const x: any = document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      const a = document.getElementById('tx_log_' + (i + 1));
      document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-up');
      document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-down');
      a.classList.remove('show');
      a.classList.add('hide');
      const y = document.getElementById('tx_id_' + (i + 1)).innerText;
      document.getElementById('tx_log_' + (i + 1)).innerHTML = '';
      document.getElementById('tx_log_' + (i + 1)).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + y + `</div>`;
    }
  }

  cancel() {
    this.isCancel = true;
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
    if (this.canceller) {
      this.canceller.unsubscribe();
    }
  }

  downloadLog() {
    this.cancel();
    const schedulerId = this.route.snapshot.queryParams['schedulerId'];
    if (this.route.snapshot.queryParams['orderId']) {
      const historyId = this.route.snapshot.queryParams['historyId'];
      $('#tmpFrame').attr('src', './api/order/log/download?historyId=' + historyId + '&controllerId=' + schedulerId +
        '&accessToken=' + this.authService.accessTokenId);
    } else if (this.route.snapshot.queryParams['taskId']) {
      const taskId = this.route.snapshot.queryParams['taskId'];
      $('#tmpFrame').attr('src', './api/task/log/download?taskId=' + taskId + '&controllerId=' + schedulerId +
        '&accessToken=' + this.authService.accessTokenId);
    }
  }

  checkLogLevel(type) {
    this.sheetContent = '';
    if (type === 'STDOUT') {
      if (!this.object.checkBoxs.stdout) {
        this.sheetContent += 'div.stdout {display: none;}\n';
      } else {
        this.sheetContent += 'div.stdout {display: block;}\n';
      }
    } else if (type === 'STDERR') {
      if (!this.object.checkBoxs.stderr) {
        this.sheetContent += 'div.stderr {display: none;}\n';
      } else {
        this.sheetContent += 'div.stderr {display: block;}\n';
      }
    } else if (type === 'FATAL') {
      if (!this.object.checkBoxs.fatal) {
        this.sheetContent += 'div.fatal {display: none;}\n';
      } else {
        this.sheetContent += 'div.fatal {display: block;}\n';
      }
    } else if (type === 'DETAIL') {
      if (!this.object.checkBoxs.detail) {
        this.sheetContent += 'div.detail {display: none;}\n';
      } else {
        this.sheetContent += 'div.detail {display: block;}\n';
      }
    } else if (type === 'ERROR') {
      if (!this.object.checkBoxs.error) {
        this.sheetContent += 'div.error {display: none;}\n';
      } else {
        this.sheetContent += 'div.error {display: block;}\n';
      }
    } else if (type === 'WARN') {
      if (!this.object.checkBoxs.warn) {
        this.sheetContent += 'div.warn {display: none;}\n';
      } else {
        this.sheetContent += 'div.warn {display: block;}\n';
      }
    } else if (type === 'TRACE') {
      if (!this.object.checkBoxs.trace) {
        this.sheetContent += 'div.trace {display: none;}\n';
      } else {
        this.sheetContent += 'div.trace {display: block;}\n';
      }
    } else if (type === 'SCHEDULER') {
      if (!this.object.checkBoxs.scheduler) {
        this.sheetContent += 'div.scheduler {display: none;}\n';
      } else {
        this.sheetContent += 'div.scheduler {display: block;}\n';
      }
    } else if (type === 'INFO') {
      if (!this.object.checkBoxs.info) {
        this.sheetContent += 'div.log_info {display: none;}\n';
        this.sheetContent += 'div.scheduler_info {display: none;}\n';
      } else {
        this.sheetContent += 'div.log_info {display: block;}\n';
        if (this.object.checkBoxs.scheduler) {
          this.sheetContent += 'div.scheduler_info {display: block;}\n';
        }
      }
    } else if (type === 'DEBUG') {
      if (!this.object.checkBoxs.debug) {
        this.sheetContent += 'div.log_debug {display: none;}\n';
        this.sheetContent += 'div.debug {display: none;}\n';
      } else {
        this.sheetContent += 'div.log_debug {display: block;}\n';
        this.sheetContent += 'div.debug {display: block;}\n';
      }
    }
    if (this.sheetContent !== '') {
      const sheet = document.createElement('style');
      sheet.innerHTML = this.sheetContent;
      document.body.appendChild(sheet);
    }
    this.saveUserPreference();
  }

  /**
   * Save the user preference of log filter
   *
   */
  saveUserPreference() {
    this.preferences.logFilter = this.object.checkBoxs;
    let configObj: any = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'PROFILE',
      id: parseInt(window.sessionStorage.preferenceId, 10)
    };
    window.sessionStorage.preferences = JSON.stringify(this.preferences);
    configObj.configurationItem = JSON.stringify(this.preferences);
    this.coreService.post('configuration/save', configObj).subscribe(res => {

    });
  }
}
