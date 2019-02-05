import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {interval} from 'rxjs';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {ActivatedRoute} from '@angular/router';

declare const $;

@Component({
  selector: 'app-log2',
  templateUrl: './log2.component.html',
  styleUrls: ['./log2.component.css']
})
export class Log2Component implements OnInit, OnDestroy {
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
  isStdErrLevel = false;
  isDebugLevels = [false, false, false, false, false, false, false, false, false];
  debugLevels = ['Debug', 'Debug2', 'Debug3', 'Debug4', 'Debug5', 'Debug6', 'Debug7', 'Debug8', 'Debug9'];
  logElems = [];
  subscriber: any;
  orderId: any;
  taskId: any;
  jobChain: any;
  job: any;
  canceller: any;

  constructor(private route: ActivatedRoute, private authService: AuthService, public coreService: CoreService) {

  }

  static calculateHeight() {
    const $header = $('.upper-header').height() || 30;
    $('.log').css('margin-top', $header + ' px');
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    Log2Component.calculateHeight();
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
        debug: false
      };
    }
    this.object.checkBoxs = this.preferences.logFilter;
    this.init();
  }

  public init() {
    this.loading = true;
    if (this.route.snapshot.queryParams['historyId']) {
      this.orderId = this.route.snapshot.queryParams['orderId'];
      this.loadOrderLog();
    } else if (this.route.snapshot.queryParams['taskId']) {
      this.taskId = this.route.snapshot.queryParams['taskId'];
      this.loadJobLog();
    } else {
      alert('Invalid URL');
    }
  }

  ngOnDestroy(): void {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  loadOrderLog() {
    this.jobChain = this.route.snapshot.queryParams['jobChain'];
    let orders: any = {};
    orders.jobschedulerId = this.route.snapshot.queryParams['schedulerId'];
    orders.jobChain = this.jobChain;
    orders.orderId = this.orderId;
    orders.historyId = this.route.snapshot.queryParams['historyId'];
    this.canceller = this.coreService.log('order/log', orders, {responseType: 'text' as 'json'}).subscribe((res) => {

      this.renderData(res);
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

  loadJobLog() {
    this.job = this.route.snapshot.queryParams['job'];
    let jobs: any = {};
    jobs.jobschedulerId = this.route.snapshot.queryParams['schedulerId'];
    jobs.taskId = this.taskId;

    this.canceller = this.coreService.log('task/log', jobs, {responseType: 'text' as 'json'}).subscribe((res) => {
      this.renderData(res);
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

  renderData(res) {
    this.loading = false;
    Log2Component.calculateHeight();
    window.document.getElementById('logs').innerHTML = '';
    res = ('\n' + res).replace(/\r?\n([^\r\n]+\[)(error|info\s?|warn\s?|debug\d?|trace|stdout|stderr)(\][^\r\n]*)/img, (match, prefix, level, suffix, offset) => {
      let div = window.document.createElement('div'); // Now create a div element and append it to a non-appended span.
      level = (level) ? level.trim().toLowerCase() : 'info';
      if (level === 'trace') {
        level = 'debug9';
      }
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
      if (this.isDeBugLevel && level.match('^debug')) {
        if (level === 'debug') {
          this.isDebugLevels[0] = true;
        } else {
          for (let x = 2; x < 10; x++) {
            if (level == 'debug' + x) {
              this.isDebugLevels[x - 1] = true;
              break;
            }
          }
        }
        if (!this.object.checkBoxs.debug) {
          div.className += ' hide-block';
        }
      }
      if (!this.isStdErrLevel) {
        this.isStdErrLevel = div.className.indexOf('stderr') > -1;
      }

      let j = 0;
      while (true) {
        if (offset < (j + 1) * 1024 * 512) {
          if (this.logElems.length == j) {
            this.logElems.push(window.document.createElement('span'));
          }
          this.logElems[j].appendChild(div);
          return '';
        }
        j++;
      }
      return '';
    });
    if (this.isDeBugLevel) {
      this.debugLevels = [];
      if (this.isDebugLevels[0]) {
        this.debugLevels.push('Debug');
      }
      for (let x = 2; x < 10; x++) {
        if (this.isDebugLevels[x - 1]) {
          this.debugLevels.push('Debug' + x);
        }
      }
    }

    let firstLogs = this.logElems.shift(); // first MB of log
    if (firstLogs !== undefined) {
      window.document.getElementById('logs').appendChild(firstLogs);
    }

    // now the scroll simulation. It loads the next MB for each 50ms.
    const secondsCounter = interval(1000);
    this.subscriber = secondsCounter.subscribe(n => {
      let nextLogs = this.logElems.shift();
      if (nextLogs !== undefined) {
        window.document.getElementById('logs').appendChild(nextLogs);
      } else {
        this.finished = true;
        this.subscriber.unsubscribe();
      }
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

  reload() {
    this.isCancel = false;
    this.finished = false;
    this.init();
  }

  downloadLog() {
    console.log('downloadLog............')
    const schedulerId = this.route.snapshot.queryParams['schedulerId'];
    if (this.route.snapshot.queryParams['orderId']) {
      const orderId = this.route.snapshot.queryParams['orderId'];
      const jobChain = this.route.snapshot.queryParams['jobChain'];
      const historyId = this.route.snapshot.queryParams['historyId'];
      this.coreService.post('order/log/info', {
        jobschedulerId: schedulerId,
        orderId: orderId,
        jobChain: jobChain,
        historyId: historyId
      }).subscribe((res: any) => {
        $('#tmpFrame').attr('src', 'http://localhost:4447/joc/api/order/log/download?orderId=' + orderId + '&jobChain=' + jobChain + '&historyId=' + historyId + '&jobschedulerId=' + schedulerId + '&filename=' + res.log.filename +
          '&accessToken=' + this.authService.accessTokenId);
      });
    } else if (this.route.snapshot.queryParams['taskId']) {
      const taskId = this.route.snapshot.queryParams['taskId'];
      this.coreService.post('task/log/info', {
        jobschedulerId: schedulerId,
        taskId: taskId
      }).subscribe((res: any) => {
        $('#tmpFrame').attr('src', 'http://localhost:4447/joc/api/task/log/download?taskId=' + taskId + '&jobschedulerId=' + schedulerId + '&filename=' + res.log.filename +
          '&accessToken=' + this.authService.accessTokenId);
      });
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
        this.changeDebugLevel('SCHEDULER', false);
        this.changeDebugLevel('STDOUT', false);
        this.changeDebugLevel('STDERR', false);
      } else {
        this.changeDebugLevel(null, null);
        this.sheetContent = '';
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
