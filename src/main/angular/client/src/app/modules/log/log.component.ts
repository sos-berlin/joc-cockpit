import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {isArray, isEmpty} from 'underscore';
import { ClipboardService } from 'ngx-clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../components/guard';
import { CoreService } from '../../services/core.service';
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";

declare const $;

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html'
})
export class LogComponent implements OnInit {
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
  orderId: any;
  taskId: any;
  historyId: any;
  workflow: any;
  job: any;
  canceller: any;
  scrolled = false;
  isExpandCollapse = false;
  taskCount = 1;
  controllerId: string;
  lastScrollTop = 0;
  delta = 20;
  taskMap = new Map();
  treeStructure = [];
  nodes = [];

  @ViewChild('dataBody', { static: false }) dataBody: ElementRef;

  constructor(private route: ActivatedRoute, private authService: AuthService, public coreService: CoreService,
    private clipboardService: ClipboardService, private message: NzMessageService) {

  }

  static calculateHeight(): void {
    const $header = $('app-header').height() || 60;
    const $topHeader = $('.top-header-bar').height() || 16;
    const $subHeaderHt = $('.sub-header').height() || 59;
    const height = window.innerHeight - ($header + $topHeader + $subHeaderHt + 130);
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
    if (this.authService.scheduleIds) {
      const ids = JSON.parse(this.authService.scheduleIds);
      if (ids && ids.selected != this.controllerId) {
        const configObj = {
          controllerId: this.controllerId,
          accountName: this.authService.currentUserData
        };
        this.coreService.post('profile/prefs', configObj).subscribe({
          next: (res: any) => {
            if (res.profileItem) {
              this.preferences = JSON.parse(res.profileItem);
            }
            this.init();
          }, error: () => this.init()
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

    const panel = $('.property-panel');
    const dom = document.getElementById('property-panel');
    const logDom = document.getElementById('log-body');
    const close: any = document.getElementsByClassName('sidebar-close');
    const open: any = document.getElementsByClassName('sidebar-open');

    $(open, panel).click(() => {
      close[0].style.right = '300px';
      dom.style.width = '300px';
      logDom.style['margin-right'] = '292px';
      dom.style.opacity = '1';
      open[0].style.right = '-20px';
      sessionStorage['isLogTreeOpen'] = true;
    });

    $(close, panel).click(() => {
      open[0].style.right = '0';
      dom.style.opacity = '0';
      close[0].style.right = '-20px';
      logDom.style['margin-right'] = 'auto';
      sessionStorage['isLogTreeOpen'] = false;
    });
    setTimeout(() => {
      if (sessionStorage['isLogTreeOpen'] == 'true' || sessionStorage['isLogTreeOpen'] == true) {
        $(open, panel).click();
      }
    }, 0)

  }


  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
      data.origin.isExpanded = !data.origin.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
        node.origin.isExpanded = !node.origin.isExpanded;
      }
    }
  }

  selectNode(node): void {
    if (node.origin.key) {
      const dom = document.getElementById(node.origin.key);
      if (dom) {
        let elems: any = document.getElementsByClassName('log_line');
        for (let i in elems) {
          if (elems[i].style) {
            elems[i].style.background = 'transparent';
          }
        }
        dom.style.background = '#e6f7ff';
        dom.scrollIntoView({
          behavior: "smooth"
        });
      }
    }
  }

  loadOrderLog(): void {
    this.taskMap = new Map();
    this.workflow = this.route.snapshot.queryParams.workflow;
    const order: any = {};
    order.controllerId = this.controllerId;
    order.historyId = this.historyId;
    this.canceller = this.coreService.post('order/log', order).subscribe({
      next: (res: any) => {
        if (res) {
          this.jsonToString(res);
          this.showHideTask(res.logEvents);
          if (!res.complete && !this.isCancel) {
            this.runningOrderLog({historyId: order.historyId, controllerId: this.controllerId, eventId: res.eventId});
          } else {
            this.finished = true;
          }
        } else {
          this.loading = false;
          this.finished = true;
        }
        this.isLoading = false;
      }, error: (err) => {
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
      }
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

  private expandTask(i, expand): void {
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
    }).subscribe({
      next: (res: any) => {
        if (res) {
          this.renderData(res.body, false);
          if (res.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
            const obj = {
              controllerId: this.controllerId,
              taskId: res.headers.get('x-log-task-id') || jobs.taskId,
              eventId: res.headers.get('x-log-event-id')
            };
            this.runningTaskLog(obj, false);
          } else {
            this.finished = true;
          }
        } else {
          this.loading = false;
        }
        this.isLoading = false;
      }, error: (err) => {
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
      }
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
          } else {
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

  private showHideCheckboxs(logLevel: string): void {
    if (!this.isInfoLevel && logLevel === 'INFO') {
      this.isInfoLevel = true;
    }
    if (!this.isStdSuccessLevel && logLevel === 'SUCCESS') {
      this.isStdSuccessLevel = true;
    }
    if (!this.isDeBugLevel && logLevel === 'DEBUG') {
      this.isDeBugLevel = true;
    }
    if (!this.isStdErrLevel && logLevel === 'STDERR') {
      this.isStdErrLevel = true;
    }
    if (!this.isErrorLevel && logLevel === 'ERROR') {
      this.isErrorLevel = true;
    }
    if (!this.isWarnLevel && logLevel === 'WARN') {
      this.isWarnLevel = true;
    }
    if (!this.isTraceLevel && logLevel === 'TRACE') {
      this.isTraceLevel = true;
    }
    if (!this.isFatalLevel && logLevel === 'FATAL') {
      this.isFatalLevel = true;
    }
    if (!this.isDetailLevel && logLevel === 'DETAIL') {
      this.isDetailLevel = true;
    }
  }

  private jsonToString(json): void {
    if (!json) {
      return;
    }
    const dt = json.logEvents;
    let col = '';
    for (let i = 0; i < dt.length; i++) {
      if (dt[i].position.match(/\/branch/)) {
        dt[i].position = dt[i].position.replace(/(\/branch)/, '/fork+branch');
      }

      let flag = false;

      if (!flag) {
        this.treeStructure.push(dt[i]);
      }

      const div = window.document.createElement('div');

      div.id = dt[i].orderId + dt[i].logEvent + dt[i].position;
      div.className += 'log_line';
      if (dt[i].logLevel === 'INFO') {
        div.className += 'log_info';
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
      this.showHideCheckboxs(dt[i].logLevel);

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
        if (dt[i].agentName) {
          col += 'name=' + dt[i].agentName + ', ';
        }
        if (dt[i].subagentClusterId) {
          col += 'clusterId=' + dt[i].subagentClusterId + ', ';
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
        if (dt[i].msg) {
          col += ': ' + dt[i].msg;
        }
      }
      if (dt[i].logEvent === 'OrderCaught' && dt[i].caught) {
        col += ', Caught(cause=' + dt[i].caught.cause + ')';
      } else if (dt[i].logEvent === 'OrderRetrying' && dt[i].retrying) {
        const delayedUntil = (this.preferences.logTimezone && dt[i].retrying.delayedUntil) ? this.coreService.getLogDateFormat(dt[i].retrying.delayedUntil, this.preferences.zone) : dt[i].retrying.delayedUntil;
        col += ', Retrying(delayedUntil=' + delayedUntil + ')';
      } else if (dt[i].logEvent === 'OrderNoticesExpected' && dt[i].expectNotices) {
        col += ', Waiting for';
        for (let x in dt[i].expectNotices.waitingFor) {
          col += ' ExpectNotice(board=' + dt[i].expectNotices.waitingFor[x].boardName + ', id=' + dt[i].expectNotices.waitingFor[x].id + ')';
          if (parseInt(x) < dt[i].expectNotices.waitingFor.length - 1)
            col += ',';
        }
      } else if (dt[i].logEvent === 'OrderNoticesRead' && dt[i].expectNotices) {
        col += ', ExpectNotices(' + dt[i].expectNotices.consumed + ')';
      } else if (dt[i].logEvent === 'OrderNoticePosted' && dt[i].postNotice) {
        col += ', PostNotice(board=' + dt[i].postNotice.boardName + ', id=' + dt[i].postNotice.id + ', endOfLife=' + dt[i].postNotice.endOfLife + ')';
      } else if (dt[i].logEvent === 'OrderNoticesConsumptionStarted' && dt[i].consumeNotices) {
        col += ', Consuming';
        for (let x in dt[i].consumeNotices.consuming) {
          col += ', ExpectNotice(board=' + dt[i].consumeNotices.consuming[x].boardName + ', id=' + dt[i].consumeNotices.consuming[x].id + ')';
          if (parseInt(x) < dt[i].consumeNotices.consuming.length - 1)
            col += ',';
        }
      } else if (dt[i].logEvent === 'OrderNoticesConsumed' && dt[i].consumeNotices && dt[i].consumeNotices.consumed == false) {
        col += ' (<span class="log_error">Failed</span>)';
      }
      if (dt[i].logEvent === 'OrderFinished' && dt[i].returnMessage) {
        col += ', returnMessage=' + dt[i].returnMessage;
      } else if (dt[i].logEvent === 'OrderSuspended' && dt[i].stopped && (dt[i].stopped.job || dt[i].stopped.instruction)) {
        col += ', Stopped(' + (dt[i].stopped.job ? ('job=' + dt[i].stopped.job) : ('instruction=' + dt[i].stopped.instruction)) + ')';
      } else if (dt[i].logEvent === 'OrderResumed' && dt[i].resumed && (dt[i].resumed.job || dt[i].resumed.instruction)) {
        if (dt[i].resumed.job) {
          col += ', Job=' + dt[i].resumed.job;
        } else {
          col += ', Instruction=' + dt[i].resumed.instruction;
        }
      }
      if (dt[i].logEvent === 'OrderMoved' && dt[i].moved && dt[i].moved.skipped && dt[i].moved.to) {
        col += ', Skipped(' + (dt[i].moved.skipped.instruction.job ? ('job=' + dt[i].moved.skipped.instruction.job) : ('instruction=' + dt[i].moved.skipped.instruction.instruction)) + ', reason=' + dt[i].moved.skipped.reason + '). Moved To(pos=' + dt[i].moved.to.position + ')';
      } else if (dt[i].logEvent === 'OrderStarted' && dt[i].arguments) {
        col += ', arguments(';
        let arr: any = Object.entries(dt[i].arguments).map(([k1, v1]) => {
          if (typeof v1 == 'object') {
            v1 = Object.entries(v1).map(([k1, v1]) => {
              return {name: k1, value: v1};
            });
          }
          return {name: k1, value: v1};
        });
        for (let i = 0; i < arr.length; i++) {
          if (isArray(arr[i].value)) {
            col += arr[i].name + '={';
            for (let j = 0; j < arr[i].value.length; j++) {
              if (isArray(arr[i].value[j].value)) {
                col += arr[i].value[j].name + '={';
                for (let k = 0; k < arr[i].value[j].value.length; k++) {
                  if (arr[i].value[j].value[k].name) {
                    col += arr[i].value[j].value[k].name + '=' + arr[i].value[j].value[k].value;
                  } else if (arr[i].value[j].value[k].key) {
                    if (arr[i].value[j].value[k].value.value || arr[i].value[j].value[k].value.value == 0 || arr[i].value[j].value[k].value.value == false) {
                      col += arr[i].value[j].value[k].key + '=' + arr[i].value[j].value[k].value.value;
                    } else {
                      col += arr[i].value[j].value[k].key + '=' + arr[i].value[j].value[k].value;
                    }
                  }
                  if (arr[i].value[j].value.length - 1 != k) {
                    col += ', ';
                  }
                }
                col += '}';
              } else {
                col += arr[i].value[j].name + '=' + arr[i].value[j].value;
              }
              if (arr[i].value.length - 1 != j) {
                col += ', ';
              }
            }
            col += '}';
          } else {
            col += arr[i].name + '=' + arr[i].value;
          }
          if (arr.length - 1 != i) {
            col += ', ';
          }
        }
        col += ')';
      } else if (dt[i].logEvent === 'OrderProcessed' && dt[i].returnValues) {
        col += ', returnValues(';
        let arr: any = Object.entries(dt[i].returnValues).map(([k1, v1]) => {
          if (typeof v1 == 'object') {
            v1 = Object.entries(v1).map(([k1, v1]) => {
              return {name: k1, value: v1};
            });
          }
          return {name: k1, value: v1};
        });
        for (let i = 0; i < arr.length; i++) {
          if (isArray(arr[i].value)) {
            col += arr[i].name + '={';
            for (let j = 0; j < arr[i].value.length; j++) {
              if (isArray(arr[i].value[j].value)) {
                col += arr[i].value[j].name + '={';
                for (let k = 0; k < arr[i].value[j].value.length; k++) {
                  if (arr[i].value[j].value[k].name) {
                    col += arr[i].value[j].value[k].name + '=' + arr[i].value[j].value[k].value;
                  } else if (arr[i].value[j].value[k].key) {
                    if (arr[i].value[j].value[k].value.value || arr[i].value[j].value[k].value.value == 0 || arr[i].value[j].value[k].value.value == false) {
                      col += arr[i].value[j].value[k].key + '=' + arr[i].value[j].value[k].value.value;
                    } else {
                      col += arr[i].value[j].value[k].key + '=' + arr[i].value[j].value[k].value;
                    }
                  }
                  if (arr[i].value[j].value.length - 1 != k) {
                    col += ', ';
                  }
                }
                col += '}';
              } else {
                col += arr[i].value[j].name + '=' + arr[i].value[j].value;
              }
              if (arr[i].value.length - 1 != j) {
                col += ', ';
              }
            }
            col += '}';
          } else {
            col += arr[i].name + '=' + arr[i].value;
          }
          if (arr.length - 1 != i) {
            col += ', ';
          }
        }
        col += ')';
      }

      if (dt[i].logEvent === 'OrderProcessingStarted') {
        const cls = !this.object.checkBoxs.main ? ' hide-block' : '';
        const x = `<div class="main log_main${cls}"><span class="tx_order"><i id="ex_` + this.taskCount + `" class="cursor fa fa-caret-down fa-lg p-r-xs"></i></span>` + col + `</div><div id="tx_log_` + this.taskCount + `" class="hide inner-log-m"><div id="tx_id_` + this.taskCount + `" class="hide">` + dt[i].taskId + `</div><div class="tx_data_` + this.taskCount + `"></div></div>`;
        this.taskCount++;
        div.innerHTML = x;
      } else {
        div.className += ' m-l-13';
        div.innerHTML = `<span >` + col;
      }
      window.document.getElementById('logs').appendChild(div);
    }
    if (this.taskCount > 1) {
      this.isExpandCollapse = true;
    }
    console.log(this.treeStructure, '?')
    this.nodes = this.coreService.createTreeStructure({treeStructure: this.treeStructure});
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
        if (date && /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.(\d+)([+,-]){1}(\d+)$/.test(date)) {
          const datetime = this.preferences.logTimezone ? this.coreService.getLogDateFormat(date, this.preferences.zone) : date;
          if (this.preferences.logTimezone && datetime && timestampRegex.test(datetime)) {
            match = match.replace(timestampRegex, datetime);
          }
        }
      }

      if (level) {
        lastLevel = level;
      } else {
        if (prefix.search(/\[stdout\]/i) > -1) {
          lastLevel = 'stdout';
        } else if (prefix.search(/\[stderr\]/i) > -1) {
          lastLevel = 'stderr';
        } else if (prefix.search(/\[debug\]/i) > -1) {
          lastLevel = 'debug';
        } else if (prefix.search(/\[trace\]/i) > -1) {
          lastLevel = 'trace';
        } else if (prefix.search(/\[info\]/i) > -1) {
          lastLevel = 'info';
        } else if (prefix.search(/\[main\]/i) > -1) {
          lastLevel = 'main';
        } else if (prefix.search(/\[success\]/i) > -1) {
          lastLevel = 'success';
        } else if (lastLevel) {
          level = lastLevel;
        }
      }

      level = (level) ? level.trim().toLowerCase() : 'info';
      if (level !== 'info') {
        div.className += 'log_' + level;
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
        this.isFatalLevel = true;
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
        this.isWarnLevel = true;
        div.className += ' warn';
        if (!this.object.checkBoxs.warn) {
          div.className += ' hide-block';
        }
      } else if (level === 'trace') {
        this.isTraceLevel = true;
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
        this.isStdErrLevel = true;
        div.className += ' stderr log_stderr';
        if (!this.object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[debug\]/i) > -1) {
        this.isDeBugLevel = true;
        div.className += ' debug log_debug';
        if (!this.object.checkBoxs.debug) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[trace\]/i) > -1) {
        this.isTraceLevel = true;
        div.className += ' trace log_trace';
        if (!this.object.checkBoxs.trace) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[main\]/i) > -1) {
        div.className += ' main log_main';
        if (!this.object.checkBoxs.main) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[info\]/i) > -1) {
        this.isInfoLevel = true;
        div.className += ' info log_info';
        if (!this.object.checkBoxs.info) {
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
      } else if (lastLevel && lastClass) {
        div.className += ' ' + lastClass;
      } else if (!lastLevel) {
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
    if (this.canceller) {
      this.canceller.unsubscribe();
    }
  }

  copy(): void {
    this.coreService.showCopyMessage(this.message);
    this.clipboardService.copyFromContent(this.dataBody.nativeElement.innerText);
  }

  reloadLog(): void {
    this.isLoading = true;
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
      accountName: this.authService.currentUserData,
      profileItem: JSON.stringify(this.preferences)
    };
    window.sessionStorage.preferences = configObj.profileItem;
    sessionStorage.setItem('controllerId', this.controllerId);
    this.coreService.post('profile/prefs/store', configObj).subscribe();
  }
}
