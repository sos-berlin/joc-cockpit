import {Component, HostListener, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'underscore';
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
  finished = false;
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
  subscriber: any;
  orderId: any;
  taskId: any;
  workflow: any;
  job: any;
  canceller: any;
  scrolled = false;

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
        trace: true
      };
    }
    this.object.checkBoxs = this.preferences.logFilter;
    this.init();
  }

  ngAfterViewInit() {
    if (!this.scrolled) {
      this.dataBody.nativeElement.scrollTop = this.dataBody.nativeElement.scrollHeight;
      this.scrolled = true;
    }
  }

  scrollBottom() {
    var pre = this.dataBody.nativeElement;
    var height = pre.scrollHeight;
    $("#pp").scroll(() => {
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
      this.taskId = this.route.snapshot.queryParams['taskId'];
      this.loadJobLog();
    }
  }

  loadOrderLog() {
    this.workflow = this.route.snapshot.queryParams['workflow'];
    let orders: any = {};
    orders.jobschedulerId = this.route.snapshot.queryParams['schedulerId'];
    orders.historyId = this.route.snapshot.queryParams['historyId'];
    this.canceller = this.coreService.log('order/log', orders, {responseType: 'text' as 'json'}).subscribe((res: any) => {
      this.jsonToString(res);
      this.showHideTask(orders.jobschedulerId);
      if (res.completed) {
        this.runningOrderLog({});
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

  showHideTask(id) {
    let x: any = document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      const element = x[i];
      element['childNodes'][0].addEventListener('click', () => {
        let jobs: any = {};
        jobs.jobschedulerId = id;
        jobs.taskId = document.getElementById('tx_id_' + (i + 1)).innerText;
        const a = document.getElementById('tx_log_' + (i + 1));
        if (a.classList.contains('hide')) {
          this.coreService.log('task/log', jobs, {
            'Content-Type': 'application/json',
            responseType: 'text' as 'json',
            observe: 'response' as 'response'
          }).subscribe((res: any) => {
            this.renderData(res.body, 'tx_log_' + (i + 1));
            document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-down');
            document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-up');
            a.classList.remove('hide');
            a.classList.add('show');
          });
        } else {
          document.getElementById('ex_' + (i + 1)).classList.remove('fa-caret-up');
          document.getElementById('ex_' + (i + 1)).classList.add('fa-caret-down');
          a.classList.remove('show');
          a.classList.add('hide');
          const x = document.getElementById('tx_id_' + (i + 1)).innerText;
          document.getElementById('tx_log_' + (i + 1)).innerHTML = '';
          document.getElementById('tx_log_' + (i + 1)).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">`+x+`</div>`
        }
      });
    }
  }

  loadJobLog() {
    this.job = this.route.snapshot.queryParams['job'];
    let jobs: any = {};
    jobs.jobschedulerId = this.route.snapshot.queryParams['schedulerId'];
    jobs.taskId = this.taskId;

    this.canceller = this.coreService.log('task/log', jobs, {
      'Content-Type': 'application/json',
      responseType: 'text' as 'json',
      observe: 'response' as 'response'
    }).subscribe((res: any) => {
      this.renderData(res.body, false);
      if (res.headers.get('x-log-complete').toString() === 'false') {
        const obj = {jobschedulerId: jobs.jobschedulerId, tasks: []};
        obj.tasks.push({taskId: jobs.taskId, eventId: res.headers.get('X-Log-Event-Id')});
        this.runningTaskLog(obj);
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

  runningTaskLog(obj) {
    this.coreService.post('task/log/running', obj).subscribe((res: any) => {
      this.renderData(res.log, false);
      if (res.complete) {
        obj.tasks[0].eventId = res.eventId;
        this.runningTaskLog(obj);
      }
    });
  }

  runningOrderLog(obj) {
    this.coreService.post('order/log/running', obj).subscribe((res: any) => {
      this.jsonToString(res);
      this.showHideTask(obj.jobschedulerId);
      if (res.completed) {
        obj.tasks[0].eventId = res.eventId;
        this.runningTaskLog(obj);
      }
    });
  }

  jsonToString(json) {
    let count = 1;
    let dt = JSON.parse(json).logEvents;
    let col = '';
    for (let i = 0, j = 0; i < dt.length; i++) {
      let div = window.document.createElement('div');
      if (dt[i].logLevel === 'INFO' ) {
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
      }  else if (dt[i].logLevel === 'FATAL') {
        div.className += ' log_fatal';
        div.className += ' fatal';
        if (!this.object.checkBoxs.fatal) {
          div.className += ' hide-block';
        }
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
      let datetime = dt[i].masterDatetime;
      col = ( datetime + ' [' + dt[i].logLevel + '] [' + dt[i].logEvent + '] ' + 'id:' + dt[i].orderId + ', pos:' + dt[i].position + '');
      if (dt[i].agentDatetime) {
        col += ', Agent' + '(' + dt[i].agentDatetime;
        if (dt[i].agentPath) {
          col += ' path:' + dt[i].agentPath;
        }
        if (dt[i].agentUrl) {
          col += ', url:' + dt[i].agentUrl;
        }
        col += ')';
      }
      if (dt[i].job) {
        col += ', Job:' + dt[i].job;
      }
      if (dt[i].returnCode != null && dt[i].returnCode != undefined) {
        col += ', returnCode:' + dt[i].returnCode;
      }
      if (dt[i].error && !_.isEmpty(dt[i].error)) {
        col += ', error:' + dt[i].error;
      }
    // this.logElems.push(span);
    if (dt[i].logEvent === 'OrderProcessingStarted') {
      const x = `<span class="tx_order"><i id="ex_` + count + `" class="cursor fa fa-caret-down fa-lg p-l-xs p-r-xs"></i><span>`+col+`<div id="tx_log_`+count+`" class="hide m-l-md"><div id="tx_id_`+count+`" class="hide">`+dt[i].taskId+`</div><div class="tx_data_`+count+`"></div></div>`;
      count++;
      div.innerHTML = x;
      console.log(dt[i].taskId, div);
      } else {
        div.innerText = col;
      }
      window.document.getElementById('logs').appendChild(div);
    }
    this.loading = false;
  }

  renderData(res, ordertaskFlag) {
    this.loading = false;
    LogComponent.calculateHeight();
    if (!ordertaskFlag) {
      window.document.getElementById('logs').innerHTML = '';
    }
    res = ('\n' + res).replace(/\r?\n?([^\r\n]+([\[)(error|info\s?|fatal\s?|warn\s?|debug\d?|trace|stdout|stderr)(\]])*[^\r\n]*)/img, (match, prefix, level, suffix, offset) => {
      let div = window.document.createElement('div'); // Now create a div element and append it to a non-appended span.
      level = (level) ? level.trim().toLowerCase() : 'info';
      div.className = 'log_' + level;
      if (level === 'info' && !this.object.checkBoxs.info) {
        div.className += ' hide-block';
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
        div.className += ' stdout stdout_' + level;
        if (!this.object.checkBoxs.stdout) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[stderr\]/i) > -1) {
        div.className += ' stderr stderr_' + level;
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
      if (!ordertaskFlag) {
        window.document.getElementById('logs').appendChild(div);
      } else {
        window.document.getElementById(ordertaskFlag).appendChild(div);
      }
      return '';
    });

    if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter') {
      setTimeout(() => {
        $('.log_info').css('color', 'white');
      }, 100);
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
      $('#tmpFrame').attr('src', './api/order/log/download?historyId=' + historyId + '&jobschedulerId=' + schedulerId +
        '&accessToken=' + this.authService.accessTokenId);
    } else if (this.route.snapshot.queryParams['taskId']) {
      const taskId = this.route.snapshot.queryParams['taskId'];
      $('#tmpFrame').attr('src', './api/task/log/download?taskId=' + taskId + '&jobschedulerId=' + schedulerId +
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
        this.changeInfoLevel(type);
        this.changeDebugLevel(type, false);
      }
    } else if (type === 'STDERR') {
      if (!this.object.checkBoxs.stderr) {
        this.sheetContent += 'div.stderr {display: none;}\n';
      } else {
        this.sheetContent += 'div.stderr {display: block;}\n';
        this.changeInfoLevel(type);
        this.changeDebugLevel(type, false);
      }
    } else if (type === 'FATAL') {
      if (!this.object.checkBoxs.fatal) {
        this.sheetContent += 'div.fatal {display: none;}\n';
      } else {
        this.sheetContent += 'div.fatal {display: block;}\n';
        this.changeInfoLevel(type);
        this.changeDebugLevel(type, false);
      }
    } else if (type === 'ERROR') {
      if (!this.object.checkBoxs.error) {
        this.sheetContent += 'div.error {display: none;}\n';
      } else {
        this.sheetContent += 'div.error {display: block;}\n';
        this.changeInfoLevel(type);
        this.changeDebugLevel(type, false);
      }
    } else if (type === 'WARN') {
      if (!this.object.checkBoxs.warn) {
        this.sheetContent += 'div.warn {display: none;}\n';
      } else {
        this.sheetContent += 'div.warn {display: block;}\n';
        this.changeInfoLevel(type);
        this.changeDebugLevel(type, false);
      }
    } else if (type === 'TRACE') {
      if (!this.object.checkBoxs.trace) {
        this.sheetContent += 'div.trace {display: none;}\n';
      } else {
        this.sheetContent += 'div.trace {display: block;}\n';
        this.changeInfoLevel(type);
        this.changeDebugLevel(type, false);
      }
    } else if (type === 'SCHEDULER') {
      if (!this.object.checkBoxs.scheduler) {
        this.sheetContent += 'div.scheduler {display: none;}\n';
      } else {
        this.sheetContent += 'div.scheduler {display: block;}\n';
        this.changeInfoLevel(type);
        this.changeDebugLevel(type, false);
      }
    } else if (type === 'INFO') {
      if (!this.object.checkBoxs.info) {
        this.sheetContent += 'div.log_info {display: none;}\n';
        this.sheetContent += 'div.scheduler_info {display: none;}\n';
        this.sheetContent += 'div.stdout_info {display: none;}\n';
        this.sheetContent += 'div.stderr_info {display: none;}\n';
      } else {
        this.sheetContent += 'div.log_info {display: block;}\n';
        if (this.object.checkBoxs.scheduler) {
          this.sheetContent += 'div.scheduler_info {display: block;}\n';
        }
        if (this.object.checkBoxs.stdout) {
          this.sheetContent += 'div.stdout_info {display: block;}\n';
        }
        if (this.object.checkBoxs.stderr) {
          this.sheetContent += 'div.stderr_info {display: block;}\n';
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
    if (this.sheetContent != '') {
      let sheet = document.createElement('style');
      sheet.innerHTML = this.sheetContent;
      document.body.appendChild(sheet);
    }
    this.saveUserPreference();
  }

  changeInfoLevel(type) {
    if (!this.object.checkBoxs.info) {
      this.sheetContent += 'div.' + type.toLowerCase() + '_info {display: none;}\n';
    }
  }

  changeDebugLevel(type, setBlock) {
    if (type) {
      let num = this.object.debug.substring(5);
      if (!num) {
        num = 1;
      }
      if (this.object.checkBoxs.debug) {
        if (setBlock) {
          for (let x = 1; x <= num; x++) {
            let level = x === 1 ? '' : x;
            this.sheetContent += 'div.' + type.toLowerCase() + '_debug' + level + ' {display: block;}\n';
          }
        }
        if (num < 9) {
          for (let x = num + 1; x < 10; x++) {
            let level = x === 1 ? '' : x;
            this.sheetContent += 'div.' + type.toLowerCase() + '_debug' + level + ' {display: none;}\n';
          }
        }
      } else {
        for (let x = 1; x < 10; x++) {
          let level = x === 1 ? '' : x;
          this.sheetContent += 'div.' + type.toLowerCase() + '_debug' + level + ' {display: none;}\n';
        }
      }
    } else {
      this.sheetContent = '';
      if (this.object.checkBoxs.scheduler) {
        this.changeDebugLevel('SCHEDULER', true);
      }
      if (this.object.checkBoxs.stdout) {
        this.changeDebugLevel('STDOUT', true);
      }
      if (this.object.checkBoxs.stderr) {
        this.changeDebugLevel('STDERR', true);
      }
      if (this.object.checkBoxs.fatal) {
        this.changeDebugLevel('FATAL', true);
      }
      if (this.object.checkBoxs.error) {
        this.changeDebugLevel('ERROR', true);
      }
      if (this.object.checkBoxs.warn) {
        this.changeDebugLevel('WARN', true);
      }
      if (this.object.checkBoxs.trace) {
        this.changeDebugLevel('TRACE', true);
      }
      if (this.sheetContent != '') {
        let sheet = document.createElement('style');
        sheet.innerHTML = this.sheetContent;
        document.body.appendChild(sheet);
      }
    }
  }

  /**
   * Save the user preference of log filter
   *
   */
  saveUserPreference() {
    this.preferences.logFilter = this.object.checkBoxs;
    let configObj: any = {
      jobschedulerId: this.schedulerIds.selected,
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
