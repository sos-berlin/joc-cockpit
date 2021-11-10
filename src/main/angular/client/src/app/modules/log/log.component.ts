import {Component, HostListener, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {isEmpty} from 'underscore';
import {Subscription} from 'rxjs';
import {ClipboardService} from 'ngx-clipboard';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';

declare const $;

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html'
})
export class LogComponent implements OnInit, OnDestroy {
  preferences: any = {};
  loading = false;
  isLoading = false;
  isCancel = false;
  finished = false;
  errStatus = '';
  sheetContent = '';
  error: any;
  object: any = {
    checkBoxs: [],
  };
  isStdSuccessLevel = false;
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
  historyId: any;
  workflow: any;
  job: any;
  canceller: any;
  scrolled = false;
  isExpandCollapse = false;
  taskCount = 1;
  preferenceId: any;
  controllerId: string;
  lastScrollTop = 0;
  delta = 20;
  taskMap = new Map();

  @ViewChild('dataBody', {static: false}) dataBody: ElementRef;

  constructor(private route: ActivatedRoute, private authService: AuthService, public coreService: CoreService,
              private clipboardService: ClipboardService) {

  }

  static calculateHeight(): void {
    const $header = $('app-header').height() || 60;
    const $topHeader = $('.top-header-bar').height() || 16;
    const $subHeaderHt = $('.sub-header').height() || 59;
    const height = window.innerHeight - ($header + $topHeader + $subHeaderHt + 140);
    $('.log').height(height);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    LogComponent.calculateHeight();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const nowScrollTop = $(window).scrollTop();
    if (Math.abs(this.lastScrollTop - nowScrollTop) >= this.delta) {
      this.scrolled = nowScrollTop <= this.lastScrollTop;
      this.lastScrollTop = nowScrollTop;
    }
  }


  ngOnInit(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.controllerId = this.route.snapshot.queryParams.controllerId;
    this.preferenceId = window.sessionStorage.preferenceId;
    if (this.authService.scheduleIds) {
      const ids = JSON.parse(this.authService.scheduleIds);
      if (ids && ids.selected != this.controllerId) {
        const configObj = {
          controllerId: this.controllerId,
          account: this.authService.currentUserData,
          configurationType: 'PROFILE'
        };
        this.coreService.post('configurations', configObj).subscribe((res: any) => {
          if (res.configurations && res.configurations.length > 0) {
            const conf = res.configurations[0];
            this.preferences = JSON.parse(conf.configurationItem);
            this.preferenceId = conf.id;
            this.init();
          } else {
            this.init();
          }
        }, () => {
          this.init();
        });
      } else {
        this.init();
      }
    } else {
      this.init();
    }
  }

  scrollBottom(): void {
    if (!this.scrolled) {
      $(window).scrollTop(this.dataBody.nativeElement.scrollHeight);
    }
  }

  ngOnDestroy(): void {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  init(): void {
    if (!this.preferences.logFilter || this.preferences.logFilter.length === 0) {
      this.preferences.logFilter = {
        scheduler: true,
        main: true,
        success: true,
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
    } else if (this.preferences.logFilter) {
      if (!(this.preferences.logFilter.main === false || this.preferences.logFilter.main === true)) {
        this.preferences.logFilter.main = true;
        this.preferences.logFilter.success = true;
      }
    }
    this.loading = true;
    this.object.checkBoxs = this.preferences.logFilter;
    if (this.route.snapshot.queryParams.historyId) {
      this.historyId = parseInt(this.route.snapshot.queryParams.historyId, 10);
      this.orderId = this.route.snapshot.queryParams.orderId;
      this.loadOrderLog();
    } else if (this.route.snapshot.queryParams.taskId) {
      this.taskId = parseInt(this.route.snapshot.queryParams.taskId, 10);
      this.loadJobLog();
    }
  }

  loadOrderLog(): void {
    this.taskMap = new Map();
    this.workflow = this.route.snapshot.queryParams.workflow;
    const order: any = {};
    order.controllerId = this.controllerId;
    order.historyId = this.historyId;
    this.canceller = this.coreService.post('order/log', order).subscribe((res: any) => {
      if (res) {
        this.jsonToString(res);
        this.showHideTask(res.logEvents);
        if (!res.complete && !this.isCancel) {
          this.runningOrderLog({historyId: order.historyId, controllerId: this.controllerId, eventId: res.eventId});
        } else{
          this.finished = true;
        }
      } else {
        this.loading = false;
        this.finished = true;
      }
      this.isLoading = false;
    }, (err) => {
      window.document.getElementById('logs').innerHTML = '';
      if (err.data && err.data.error) {
        this.error = err.data.error.message;
      } else {
        this.error = err.message;
      }
      this.errStatus = err.status;
      this.loading = false;
      this.finished = true;
      this.isLoading = false;
    });
  }

  showHideTask(logs): void {
    let flag = false;
    for (let i in logs) {
      if (logs[i].logEvent === 'OrderProcessingStarted') {
        flag = true;
        break;
      }
    }
    if (!flag) {
      return;
    }
    const x: any = document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      const element = x[i];
      this.taskMap.set('ex_' + (i + 1), '');
      element.childNodes[0].addEventListener('click', () => {
        this.expandTask(i, false);
      });
    }

    if (x && x.length > 0) {
      const dom = x[x.length - 1].childNodes[0];
      if (this.taskMap.has(dom.getAttribute('id')) && this.taskMap.get(dom.getAttribute('id')) !== 'false') {
        dom.click();
      }
    }
  }

  private expandTask(i, expand): void{
    const domId = 'tx_log_' + (i + 1);
    const jobs: any = {};
    jobs.controllerId = this.controllerId;
    jobs.taskId = document.getElementById('tx_id_' + (i + 1)).innerText;
    const a = document.getElementById(domId);
    if (a.classList.contains('hide')) {
      this.taskMap.set('ex_' + (i + 1), 'true');
      this.coreService.log('task/log', jobs, {
        responseType: 'text' as 'json',
        observe: 'response' as 'response'
      }).subscribe((res: any) => {
        if (res) {
          this.renderData(res.body, domId);
          document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-down');
          document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-up');
          a.classList.remove('hide');
          a.classList.add('show');
          if (res.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
            const obj = {
              controllerId: jobs.controllerId,
              taskId: res.headers.get('x-log-task-id') || jobs.taskId,
              eventId: res.headers.get('x-log-event-id')
            };
            this.runningTaskLog(obj, domId);
          }
        }
      });
    } else {
      if (!expand) {
        this.taskMap.set('ex_' + (i + 1), 'false');
        document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-up');
        document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-down');
        a.classList.remove('show');
        a.classList.add('hide');
        const z = document.getElementById('tx_id_' + (i + 1)).innerText;
        document.getElementById(domId).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + z + `</div>`;
      }
    }
  }

  loadJobLog(): void {
    this.job = this.route.snapshot.queryParams.job;
    const jobs: any = {};
    jobs.controllerId = this.controllerId;
    jobs.taskId = this.taskId;

    this.canceller = this.coreService.log('task/log', jobs, {
      responseType: 'text' as 'json',
      observe: 'response' as 'response'
    }).subscribe((res: any) => {
      if (res) {
        this.renderData(res.body, false);
        if (res.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
          const obj = {
            controllerId: this.controllerId,
            taskId: res.headers.get('x-log-task-id') || jobs.taskId,
            eventId: res.headers.get('x-log-event-id')
          };
          this.runningTaskLog(obj, false);
        } else{
          this.finished = true;
        }
      } else {
        this.loading = false;
      }
      this.isLoading = false;
    }, (err) => {
      window.document.getElementById('logs').innerHTML = '';
      if (err.data && err.data.error) {
        this.error = err.data.error.message;
      } else {
        this.error = err.message;
      }
      this.errStatus = err.status;
      this.loading = false;
      this.finished = true;
      this.isLoading = false;
    });
  }

  runningTaskLog(obj, orderTaskFlag): void {
    if (obj.eventId) {
      this.coreService.post('task/log/running', obj).subscribe((res: any) => {
        if (res) {
          if (res.log) {
            this.renderData(res.log, orderTaskFlag);
          }
          if (!res.complete && !this.isCancel) {
            if (res.eventId) {
              obj.eventId = res.eventId;
              obj.taskId = res.taskId;
            }
            this.runningTaskLog(obj, orderTaskFlag);
          } else{
            this.finished = true;
          }
          this.scrollBottom();
        }
      });
    }
  }

  runningOrderLog(obj): void {
    if (obj.eventId) {
      this.coreService.post('order/log/running', obj).subscribe((res: any) => {
        if (res) {
          if (res.logEvents) {
            this.jsonToString(res);
            this.showHideTask(res.logEvents);
            this.scrollBottom();
          }
          if (!res.complete && !this.isCancel) {
            if (res.eventId) {
              obj.eventId = res.eventId;
              this.runningOrderLog(obj);
            }
          } else {
            this.finished = true;
          }
        }
      });
    }
  }

  jsonToString(json): void {
    if (!json) {
      return;
    }
    const dt = json.logEvents;
    let col = '';
    for (let i = 0; i < dt.length; i++) {
      const div = window.document.createElement('div');
      if (dt[i].logLevel === 'INFO') {
        div.className = 'log_info';
        if (!this.object.checkBoxs.info) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'MAIN') {
        if (dt[i].logEvent !== 'OrderProcessingStarted') {
          div.className += ' log_main';
          div.className += ' main';
          if (!this.object.checkBoxs.main) {
            div.className += ' hide-block';
          }
        }
      } else if (dt[i].logLevel === 'SUCCESS') {
        div.className += ' log_success';
        div.className += ' success';
        if (!this.object.checkBoxs.success) {
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
      if (!this.isInfoLevel && dt[i].logLevel === 'INFO') {
        this.isInfoLevel = true;
      }
      if (!this.isStdSuccessLevel && dt[i].logLevel === 'SUCCESS') {
        this.isStdSuccessLevel = true;
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

      const datetime = this.preferences.logTimezone ? this.coreService.getLogDateFormat(dt[i].controllerDatetime, this.preferences.zone) : dt[i].controllerDatetime;
      col = (datetime + ' <span class="w-64 inline">[' + dt[i].logLevel + ']</span> ' +
        '[' + dt[i].logEvent + '] ' + (dt[i].orderId ? ('id=' + dt[i].orderId) : '') + (dt[i].position ? ', pos=' + dt[i].position : '') + '');
      if (dt[i].job) {
        col += ', Job=' + dt[i].job;
      }
      if (dt[i].agentDatetime) {
        col += ', Agent' + '(';
        if (dt[i].agentUrl) {
          col += 'url=' + dt[i].agentUrl + ', ';
        }
        if (dt[i].agentId) {
          col += 'id=' + dt[i].agentId + ', ';
        }
        if (dt[i].agentDatetime) {
          const dateTime = this.preferences.logTimezone ? this.coreService.getLogDateFormat(dt[i].agentDatetime, this.preferences.zone) : dt[i].agentDatetime;
          col += 'time=' + dateTime;
        }
        col += ')';
      }
      if (dt[i].error && !isEmpty(dt[i].error)) {
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
      if (dt[i].logEvent && dt[i].logEvent.match(/Lock/)) {
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
        const cls = !this.object.checkBoxs.main ? ' hide-block' : '';
        const x = `<div class="main log_main${cls}"><span class="tx_order"><i id="ex_` + this.taskCount + `" class="cursor fa fa-caret-down fa-lg p-r-xs"></i></span>` + col + `</div><div id="tx_log_` + this.taskCount + `" class="hide inner-log-m"><div id="tx_id_` + this.taskCount + `" class="hide">` + dt[i].taskId + `</div><div class="tx_data_` + this.taskCount + `"></div></div>`;
        this.taskCount++;
        div.innerHTML = x;
      } else {
        div.innerHTML = `<span class="m-l-13">` + col;
      }
      window.document.getElementById('logs').appendChild(div);
    }
    if (this.taskCount > 1) {
      this.isExpandCollapse = true;
    }
    this.loading = false;
  }

  renderData(res, orderTaskFlag): void {
    this.loading = false;
    LogComponent.calculateHeight();
    let lastLevel = '';
    let lastClass = '';
    const timestampRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9].(\d)+([+,-])(\d+)(:\d+)*/;
    ('\n' + res).replace(/\r?\n([^\r\n]+((\[)(main|success|error|info\s?|fatal\s?|warn\s?|debug\d?|trace|stdout|stderr)(\])||([a-z0-9:\/\\]))[^\r\n]*)/img, (match, prefix, level, suffix, offset) => {
      const div = window.document.createElement('div'); // Now create a div element and append it to a non-appended span.
      if (timestampRegex.test(match)) {
        const arr = match.split(/\s+\[/);
        let date;
        if (arr && arr.length > 0) {
          date = arr[0];
        }
        if (date) {
          const datetime = this.preferences.logTimezone ? this.coreService.getLogDateFormat(date, this.preferences.zone) : date;
          match = match.replace(timestampRegex, datetime);
        }
      }
      if (level){
        lastLevel = level;
      } else {
        if (prefix.search(/\[stdout\]/i) > -1) {
          lastLevel = 'stdout';
        } else if (prefix.search(/\[stderr\]/i) > -1) {
          lastLevel = 'stderr';
        } else if (prefix.search(/\[debug\]/i) > -1) {
          lastLevel = 'debug';
        } else if (prefix.search(/\[main\]/i) > -1) {
          lastLevel = 'main';
        } else if (lastLevel) {
          level = lastLevel;
        }
      }
      level = (level) ? level.trim().toLowerCase() : 'info';
      if (level !== 'info') {
        div.className = 'log_' + level;
      }
      if (level === 'main') {
        div.className += ' main';
        if (!this.object.checkBoxs.main) {
          div.className += ' hide-block';
        }
      } else if (level === 'success') {
        div.className += ' success';
        if (!this.object.checkBoxs.success) {
          div.className += ' hide-block';
        }
      } else if (level === 'stdout') {
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
        div.className += ' stderr log_stderr';
        if (!this.object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[debug\]/i) > -1) {
        div.className += ' stderr log_debug';
        if (!this.object.checkBoxs.debug) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[main\]/i) > -1) {
        div.className += ' main log_main';
        if (!this.object.checkBoxs.main) {
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
      const text = match.replace(/^\r?\n/, '');
      div.textContent = text.trim();
      if (div.innerText.match(/(\[MAIN\])\s*(\[End\])\s*(\[Success\])/) || div.innerText.match(/(\[INFO\])\s*(\[End\])\s*(\[Success\])/)) {
        div.className += ' log_success';
        lastClass = 'log_success';
      } else if (div.innerText.match(/(\[MAIN\])\s*(\[End\])\s*(\[Error\])/) || div.innerText.match(/(\[INFO\])\s*(\[End\])\s*(\[Error\])/)) {
        div.className += ' log_error';
        lastClass = 'log_error';
      } else if (lastLevel && lastClass){
        div.className += ' ' + lastClass;
      } else if (!lastLevel){
        lastClass = '';
      }

      if (!orderTaskFlag) {
        window.document.getElementById('logs').appendChild(div);
      } else {
        window.document.getElementById(orderTaskFlag).appendChild(div);
      }
      return '';
    });
  }

  expandAll(): void {
    const x: any = document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      this.taskMap.set('ex_' + (i + 1), 'true');
      this.expandTask(i, true);
    }
  }

  collapseAll(): void {
    const x: any = document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      this.taskMap.set('ex_' + (i + 1), 'false');
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

  cancel(): void {
    this.isCancel = true;
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
    if (this.canceller) {
      this.canceller.unsubscribe();
    }
  }

  copy(): void {
    this.clipboardService.copyFromContent(this.dataBody.nativeElement.innerText);
  }

  reloadLog(): void {
    this.isLoading  = true;
    this.isCancel = false;
    this.finished = false;
    this.taskCount = 1;
    document.getElementById('logs').innerHTML = '';
    if (this.route.snapshot.queryParams.historyId) {
      this.historyId = parseInt(this.route.snapshot.queryParams.historyId, 10);
      this.orderId = this.route.snapshot.queryParams.orderId;
      this.loadOrderLog();
    } else if (this.route.snapshot.queryParams.taskId) {
      this.taskId = parseInt(this.route.snapshot.queryParams.taskId, 10);
      this.loadJobLog();
    }
  }

  downloadLog(): void {
    this.cancel();
    let obj: any;
    if (this.orderId) {
      obj = {
        historyId: this.historyId
      };
    } else if (this.taskId) {
      obj = {
        taskId: this.taskId
      };
    }
    this.coreService.downloadLog(obj, this.controllerId);
  }

  checkLogLevel(type): void {
    this.sheetContent = '';
    if (type === 'MAIN') {
      if (!this.object.checkBoxs.main) {
        this.sheetContent += 'div.main {display: none;}\n';
      } else {
        this.sheetContent += 'div.main {display: block;}\n';
      }
    } else if (type === 'SUCCESS') {
      if (!this.object.checkBoxs.success) {
        this.sheetContent += 'div.success {display: none;}\n';
      } else {
        this.sheetContent += 'div.success {display: block;}\n';
      }
    } else if (type === 'STDOUT') {
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
  saveUserPreference(): void {
    this.preferences.logFilter = this.object.checkBoxs;
    const configObj: any = {
      controllerId: this.controllerId,
      account: this.authService.currentUserData,
      configurationType: 'PROFILE',
      id: this.preferenceId
    };
    window.sessionStorage.preferences = JSON.stringify(this.preferences);
    sessionStorage.setItem('controllerId', this.controllerId);
    configObj.configurationItem = JSON.stringify(this.preferences);
    this.coreService.post('configuration/save', configObj).subscribe(() => {

    });
  }
}
