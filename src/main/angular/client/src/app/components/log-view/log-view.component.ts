import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {isEmpty} from 'underscore';
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";
import {AuthService} from "../guard";
import {CoreService} from '../../services/core.service';
import {POPOUT_MODAL_DATA, POPOUT_MODALS, PopoutData} from "../../services/popup.service";

declare const $: any;
export let that: any;

@Component({
  selector: 'app-log-view',
  templateUrl: './log-view.component.html'
})
export class LogViewComponent {
  preferences: any = {};
  loading = false;
  isLoading = false;
  isCancel = false;
  finished = false;
  errStatus = '';
  sheetContent = '';
  error: any;
  object: any = {
    checkBoxs: []
  };
  isStdSuccessLevel = false;
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
  orderCanceller: any;
  taskCanceller: any;
  runningCanceller: any;
  scrolled = false;
  isExpandCollapse = false;
  taskCount = 1;
  controllerId = '';
  lastScrollTop = 0;
  delta = 20;
  dataObject: PopoutData;
  treeStructure: any[] = [];
  isChildren = false;
  nodes = [];

  @ViewChild('dataBody', {static: false}) dataBody!: ElementRef;

  constructor(private authService: AuthService, public coreService: CoreService,
              @Inject(POPOUT_MODAL_DATA) public data: PopoutData) {

  }

  ngOnInit(): void {
    this.dataObject = POPOUT_MODALS['data'];
    if (!this.dataObject.controllerId) {
      setTimeout(() => {
        this.ngOnInit();
      }, 50);
      return;
    }
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    let title = this.dataObject.modalName + ' - ';
    if (this.dataObject.workflow) {
      title += 'Workflow : ' + this.dataObject.workflow.substring(this.dataObject.workflow.lastIndexOf('/') + 1) + ' - ';
    }
    if (this.dataObject.orderId) {
      title += 'Order ID : ' + this.dataObject.orderId;
    } else {
      if (this.dataObject.job) {
        title += 'Job : ' + this.dataObject.job;
      }
    }

    POPOUT_MODALS['windowInstance'].document.title = title;
    this.controllerId = this.dataObject.controllerId;
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

  ngOnDestroy() {
    this.cancelApiCalls();
    if (POPOUT_MODALS['windowInstance']) {
      try {
        POPOUT_MODALS['windowInstance'].removeEventListener('beforeunload', this.onUnload);
        POPOUT_MODALS['windowInstance'].removeEventListener('resize', this.onResize, false);
        POPOUT_MODALS['windowInstance'].removeEventListener('scroll', this.onScroll);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private calculateHeight(): void {
    const $header = POPOUT_MODALS['windowInstance'].document.getElementById('upper-header')?.clientHeight || 30;
    this.dataBody.nativeElement.setAttribute('style', 'margin-top:' + $header + 'px');
  }

  private cancelApiCalls(): void {
    if (this.orderCanceller) {
      this.orderCanceller.unsubscribe();
    }
    if (this.taskCanceller) {
      this.taskCanceller.unsubscribe();
    }
    if (this.runningCanceller) {
      this.runningCanceller.unsubscribe();
    }
  }

  private calWindowSize(): void {
    if (POPOUT_MODALS['windowInstance']) {
      try {
        that = this;
        POPOUT_MODALS['windowInstance'].addEventListener('beforeunload', this.onUnload);
        POPOUT_MODALS['windowInstance'].addEventListener('resize', this.onResize, false);
        POPOUT_MODALS['windowInstance'].addEventListener('scroll', this.onScroll);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private onUnload(event: any) {
    that.cancelApiCalls();
    if (POPOUT_MODALS['windowInstance'].screenX != window.localStorage['log_window_x']) {
      window.localStorage['log_window_x'] = POPOUT_MODALS['windowInstance'].screenX;
      window.localStorage['log_window_y'] = POPOUT_MODALS['windowInstance'].screenY;
    }

    return null;
  }

  private onResize(): void {
    that.calculateHeight();
    window.localStorage['log_window_wt'] = POPOUT_MODALS['windowInstance'].innerWidth;
    window.localStorage['log_window_ht'] = POPOUT_MODALS['windowInstance'].innerHeight;
    window.localStorage['log_window_x'] = POPOUT_MODALS['windowInstance'].screenX;
    window.localStorage['log_window_y'] = POPOUT_MODALS['windowInstance'].screenY;
  }

  private onScroll(): void {
    const nowScrollTop = $(this).scrollTop();
    if (Math.abs(that.lastScrollTop - nowScrollTop) >= that.delta) {
      that.scrolled = nowScrollTop <= that.lastScrollTop;
      that.lastScrollTop = nowScrollTop;
    }
  }

  scrollBottom(): void {
    if (!this.scrolled) {
      $(POPOUT_MODALS['windowInstance']).scrollTop(this.dataBody.nativeElement.scrollHeight);
    }
  }

  init(): void {
    this.calWindowSize();
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
    if (this.dataObject.historyId) {
      this.historyId = this.dataObject.historyId;
      this.orderId = this.dataObject.orderId;
      this.loadOrderLog();
    } else if (this.dataObject.taskId) {
      this.taskId = this.dataObject.taskId;
      this.loadJobLog();
    }

    // slight update to account for browsers not supporting e.which
    function disableF5(e: any) {
      if ((e.which || e.keyCode) == 116) {
        that.reloadLog();
        e.preventDefault();
      }
    }

    $(POPOUT_MODALS['windowInstance'].document).on("keydown", disableF5);
    // const panel = $('.property-panel');
    const dom = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-property-panel');
    const close = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-close');
    const open = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-open');
    $(open).click(() => {
      close[0].style.right = '300px';
      dom[0].style.width = '302px';
      this.dataBody.nativeElement.setAttribute('style', 'margin-right: 308px');
      open[0].style.right = '-20px';
      sessionStorage['isLogTreeOpen'] = true;
    });

    $(close).click(() => {
      open[0].style.right = '0';
      dom[0].style.width = '0';
      close[0].style.right = '-20px';
      this.dataBody.nativeElement.setAttribute('style', 'margin-right: 10px');
      sessionStorage['isLogTreeOpen'] = false;
    });

    if (!this.taskId) {
      setTimeout(() => {
        if (sessionStorage['isLogTreeOpen'] == 'true' || sessionStorage['isLogTreeOpen'] == true) {
          $(open).click();
        }
      }, 500)
    } else {
      if (close && close[0] && close[0].style) {
        close[0].style.display = 'none';
        open[0].style.display = 'none';
      }
    }
  }

  loadOrderLog(): void {
    this.workflow = this.dataObject.workflow;
    this.treeStructure = [];
    const order: any = {
      controllerId: this.controllerId,
      historyId: this.historyId
    };
    this.orderCanceller = this.coreService.post('order/log', order).subscribe({
      next: (res: any) => {
        if (res) {
          this.loading = false;
          this.checkDom(res, order);
        } else {
          this.loading = false;
          this.finished = true;
        }
        this.isLoading = false;
      }, error: (err) => {
        if (POPOUT_MODALS['windowInstance']) {
          POPOUT_MODALS['windowInstance'].document.getElementById('logs').innerHTML = '';
        }
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

  private checkDom(res: any, order: any): void {
    this.jsonToString(res);
    this.showHideTask(res.logEvents);
    if (!res.complete && !this.isCancel) {
      this.runningOrderLog({historyId: order.historyId, controllerId: this.controllerId, eventId: res.eventId});
    } else {
      this.finished = true;
    }
  }

  showHideTask(logs: any[]): void {
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

    const x: any = this.dataBody.nativeElement.querySelectorAll('.tx_order');
    for (let i = 0; i < x.length; i++) {
      const element = x[i];
      element.childNodes[0].addEventListener('click', () => {
        this.expandTask(i, false);
      });
    }

    if (x && x.length > 0) {
      const dom = x[x.length - 1].childNodes[0];
      if (dom) {
        dom.click();
      }
    }
  }

  private expandTask(i: number, expand: boolean): void {
    const domId = 'tx_log_' + (i + 1);
    const jobs: any = {};
    jobs.controllerId = this.controllerId;
    jobs.taskId = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1)).innerText;
    const a = this.dataBody.nativeElement.querySelector('#' + domId);
    if (a.classList.contains('hide')) {
      this.taskCanceller = this.coreService.log('task/log', jobs, {
        responseType: 'text' as 'json',
        observe: 'response' as 'response'
      }).subscribe((res: any) => {
        if (res) {
          this.renderData(res.body, domId);
          this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.remove('down');
          this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.add('up');
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
        this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.remove('up');
        this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.add('down');
        a.classList.remove('show');
        a.classList.add('hide');
        const z = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1)).innerText;
        this.dataBody.nativeElement.querySelector('#' + domId).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + z + `</div>`;
      }
    }
  }

  loadJobLog(): void {
    this.job = this.dataObject.job;
    const jobs: any = {};
    jobs.controllerId = this.controllerId;
    jobs.taskId = this.taskId;
    this.orderCanceller = this.coreService.log('task/log', jobs, {
      responseType: 'text' as 'json',
      observe: 'response' as 'response'
    }).subscribe({
      next: (res: any) => {
        if (res && res.body) {
          this.renderData(res.body, null);
          if (res.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
            const obj = {
              controllerId: this.controllerId,
              taskId: res.headers.get('x-log-task-id') || jobs.taskId,
              eventId: res.headers.get('x-log-event-id')
            };
            this.runningTaskLog(obj, '');
          } else {
            this.finished = true;
          }
        } else {
          this.loading = false;
        }
        this.isLoading = false;
      }, error: (err) => {
        this.dataBody.nativeElement.innerHTML = '';
        if (err.data && err.data.error) {
          this.error = err.data.error.message;
        } else {
          this.error = err.message;
        }
        this.errStatus = err.status;
        this.loading = false;
        this.finished = true;
        this.isLoading = false;
      }, complete: () => {
        POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-close')[0].style.display = 'none';
        POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-open')[0].style.display = 'none';
      }
    });
  }

  runningTaskLog(obj: any, domId: string): void {
    if (obj.eventId) {
      this.runningCanceller = this.coreService.post('task/log/running', obj).subscribe((res: any) => {
        if (res) {
          if (res.log) {
            this.renderData(res.log, domId);
          }
          if (!res.complete && !this.isCancel) {
            if (res.eventId) {
              obj.eventId = res.eventId;
              obj.taskId = res.taskId;
            }
            this.runningTaskLog(obj, domId);
            if (res.log) {
              this.scrollBottom();
            }
          } else {
            this.finished = true;
          }
        }
      });
    }
  }

  runningOrderLog(obj: any): void {
    if (obj.eventId) {
      this.runningCanceller = this.coreService.post('order/log/running', obj).subscribe({
        next: (res: any) => {
          if (res) {
            if (res.logEvents) {
              this.jsonToString(res);
              this.showHideTask(res.logEvents);
              if (res.logEvents.length > 0) {
                this.scrollBottom();
              }
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

  jsonToString(json: any): void {
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
      if (dt[i].logEvent !== 'OrderForked' && dt[i].logEvent !== 'OrderJoined') {
        for (let x in this.treeStructure) {
          if (this.treeStructure[x]['position'] == dt[i].position && this.treeStructure[x]['job'] == dt[i].job
            && (this.treeStructure[x]['expectNotices'] == dt[i].expectNotices && this.treeStructure[x]['postNotice'] == dt[i].postNotice
              && this.treeStructure[x]['consumeNotices'] == dt[i].consumeNotices && this.treeStructure[x]['moved'] == dt[i].moved
              && this.treeStructure[x]['question'] == dt[i].question && this.treeStructure[x]['cycle'] == dt[i].cycle && this.treeStructure[x]['attached'] == dt[i].attached)) {
            if (this.treeStructure[x]['orderId'] == dt[i].orderId) {
              flag = true;
              break;
            }
          }
        }
      }
      if (!flag) {
        if (/\d+[.]\w/gm.test(dt[i].orderId) && !/\d+[.]\w/gm.test(dt[i].position)) {
          const pos = dt[i].orderId.substring(dt[i].orderId.lastIndexOf('.') + 1);
          if (pos) {
            dt[i].name1 = pos;
          }
        }
        this.treeStructure.push(dt[i]);
      }

      const div = POPOUT_MODALS['windowInstance']?.document.createElement('div');
      if (!div) {
        return;
      }

      div.className = (dt[i].name1 ? (dt[i].position + '.' + dt[i].name1) : dt[i].position) + ' log_line';
      if (dt[i].logLevel === 'INFO') {
        div.className += ' log_info';
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
        '[' + dt[i].logEvent + '] ' + (dt[i].orderId ? ('id=' + dt[i].orderId) : '') + '');
      if (dt[i].job) {
        col += ', <b>Job=' + dt[i].job + '</b>';
      }
      if(dt[i].position || dt[i].position == 0) {
        col += ', pos=' + dt[i].position;
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
          col += ' ExpectNotice(board=' + dt[i].consumeNotices.consuming[x].boardName + ', id=' + dt[i].consumeNotices.consuming[x].id + ')';
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
      } else if (dt[i].logEvent === 'OrderMoved' && dt[i].moved?.waitingForAdmission?.entries) {
        col += ', waitingForAdmission(' + dt[i].moved.waitingForAdmission.entries + ')';
      } else if (dt[i].logEvent === 'OrderStarted' && dt[i].arguments) {
        col += ', arguments(';
        let arr: any = Object.entries(dt[i].arguments).map(([k1, v1]) => {
          if (v1 && typeof v1 == 'object') {
            v1 = Object.entries(v1).map(([k1, v1]) => {
              return {name: k1, value: v1};
            });
          }
          return {name: k1, value: v1};
        });
        col = this.coreService.createLogOutputString(arr, col);
        col += ')';
      } else if (dt[i].logEvent === 'OrderProcessed' && dt[i].returnValues) {
        col += ', returnValues(';
        let arr: any = Object.entries(dt[i].returnValues).map(([k1, v1]) => {
          if (v1 && typeof v1 == 'object') {
            v1 = Object.entries(v1).map(([k1, v1]) => {
              return {name: k1, value: v1};
            });
          }
          return {name: k1, value: v1};
        });
        col = this.coreService.createLogOutputString(arr, col);
        col += ')';
      } else if (dt[i].logEvent === 'OrderAttached' && dt[i].attached?.waitingForAdmission?.entries) {
        col += ', waitingForAdmission(' + dt[i].attached.waitingForAdmission.entries + ')';
      } else if (dt[i].logEvent === 'OrderPrompted' && dt[i].question) {
        col += ', question(' + dt[i].question + ')';
      } else if (dt[i].logEvent === 'OrderCyclingPrepared' && dt[i].cycle.prepared && (dt[i].cycle.prepared.next || dt[i].cycle.prepared.end)) {
        if (dt[i].cycle.prepared.next) {
          col += ', next(' + dt[i].cycle.prepared.next + ')';
        }
        if (dt[i].cycle.prepared.end) {
          col += ', end(' + dt[i].cycle.prepared.end + ')';
        }
      }

      if (dt[i].logEvent === 'OrderProcessingStarted') {
        const cls = !this.object.checkBoxs.main ? ' hide-block' : '';
        const x = `<div class="main log_main${cls}"><span class="tx_order"><i id="ex_` + this.taskCount + `" class="cursor caret down"></i></span>` + col + `</div><div id="tx_log_` + this.taskCount + `" class="hide inner-log-m"><div id="tx_id_` + this.taskCount + `" class="hide">` + dt[i].taskId + `</div><div class="tx_data_` + this.taskCount + `"></div></div>`;
        this.taskCount++;
        div.innerHTML = x;
      } else {
        div.className += ' p-l-21';
        div.innerHTML = `<span class="">` + col;
      }

      if (POPOUT_MODALS['windowInstance']?.document.getElementById('logs')) {
        POPOUT_MODALS['windowInstance']?.document.getElementById('logs').appendChild(div);
      }
    }

    if (this.taskCount > 1) {
      this.isExpandCollapse = true;
    }

    let obj = {
      treeStructure: this.treeStructure,
      isChildren: this.isChildren
    };
    this.nodes = this.coreService.createTreeStructure(obj);
    this.isChildren = obj.isChildren;
    this.loading = false;
  }

  renderData(res: any, domId: string | null): void {
    this.loading = false;
    this.calculateHeight();
    this.coreService.renderData(res, domId, this.object, {
      isFatalLevel: this.isFatalLevel,
      isWarnLevel: this.isWarnLevel,
      isTraceLevel: this.isTraceLevel,
      isStdErrLevel: this.isStdErrLevel,
      isInfoLevel: this.isInfoLevel
    });
    let lastLevel = '';
    let lastClass = '';
    const timestampRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9].(\d)+([+,-])(\d+)(:\d+)*/;
    ('\n' + res).replace(/\r?\n([^\r\n]+((\[)(main|success|error|info\s?|fatal\s?|warn\s?|debug\d?|trace|stdout|stderr)(\])||([a-z0-9:\/\\]))[^\r\n]*)/img, (match, prefix, level, suffix, offset) => {
      const div = POPOUT_MODALS['windowInstance'].document.createElement('div'); // Now create a div element and append it to a non-appended span.
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
        div.className += ' log_' + level;
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
      div.textContent = match.replace(/^\r?\n/, '');
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

      if (POPOUT_MODALS['windowInstance']?.document.getElementById('logs')) {
        if (!domId) {
          POPOUT_MODALS['windowInstance']?.document.getElementById('logs').appendChild(div);
        } else {
          try {
            POPOUT_MODALS['windowInstance']?.document.getElementById(domId).appendChild(div);
          } catch (e) {

          }
        }
      }
      return '';
    });

  }

  expandAll(): void {
    const x: any = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      this.expandTask(i, true);
    }
  }

  collapseAll(): void {
    const x: any = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      const a = POPOUT_MODALS['windowInstance'].document.getElementById('tx_log_' + (i + 1));
      POPOUT_MODALS['windowInstance'].document.getElementById('ex_' + (i + 1)).classList.remove('up');
      POPOUT_MODALS['windowInstance'].document.getElementById('ex_' + (i + 1)).classList.add('down');
      a.classList.remove('show');
      a.classList.add('hide');
      const y = POPOUT_MODALS['windowInstance'].document.getElementById('tx_id_' + (i + 1)).innerText;
      POPOUT_MODALS['windowInstance'].document.getElementById('tx_log_' + (i + 1)).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + y + `</div>`;
    }
  }

  expandAllTree(): void {
    this.traverseTree(this.nodes, true);
    this.nodes = [...this.nodes];
  }

  collapseAllTree(): void {
    this.traverseTree(this.nodes, false);
    this.nodes = [...this.nodes];
  }

  private traverseTree(data: any[], isExpand: boolean): void {
    for (let i in data) {
      if (data[i] && data[i].children && data[i].children.length > 0) {
        data[i].expanded = isExpand;
        this.traverseTree(data[i].children, isExpand);
      }
    }
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  selectNode(node: any): void {
    if (node.origin.key) {
      const dom = POPOUT_MODALS['windowInstance'].document.getElementsByClassName(node.origin.position);
      if (dom && dom.length > 0) {
        let classes = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('log_line');
        for (let i in classes) {
          if (classes[i].style) {
            classes[i].style.background = 'transparent';
          }
        }
        let nodeClasses = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('node-wrapper');
        for (let i in nodeClasses) {
          if (nodeClasses[i].style) {
            nodeClasses[i].style.background = 'transparent';
          }
        }
        const color = (this.preferences.theme != 'light' && this.preferences.theme != 'lighter') ? 'rgba(230,247,255,0.5)' : '#e6f7ff';
        const treeElemById = POPOUT_MODALS['windowInstance'].document.getElementById(node.origin.key);
        if (treeElemById) {
          treeElemById.style.background = color;
        }

        for (let x in dom) {
          if (dom.length > 2 && x == '0') {
            continue;
          }
          if (dom[x] && dom[x].style) {
            dom[x].style.background = color;
          }
        }

        dom[dom.length > 2 ? 1 : dom.length - 1].scrollIntoView({behavior: 'smooth', block: 'center'});
        if (dom.length > 0) {
          for (let x in dom) {
            if (dom[x] && dom[x].style) {
              try {
                let arrow = $(dom[x]).find('.tx_order');
                if (arrow && arrow.length > 0) {
                  const elem = arrow.find('i');
                  if (elem) {
                    let classes = elem[0].classList;
                    if (classes) {
                      classes.forEach((item: any) => {
                        if (item == 'down') {
                          elem.click();
                          return;
                        }
                      })
                    }

                  }
                }
              } catch (e) {
              }
            }
          }
        }
      }
    }
  }

  cancel(): void {
    this.isCancel = true;
    this.cancelApiCalls();
  }

  copy(): void {
    try {
      // Copy the text inside the text field
      POPOUT_MODALS['windowInstance'].navigator.clipboard.writeText(this.dataBody.nativeElement.innerText);
    } catch (err) {
      console.error('Failed to copy: ', err);
      /* Rejected - text failed to copy to the clipboard */
    }
  }

  reloadLog(): void {
    this.cancelApiCalls();
    this.isLoading = true;
    this.isCancel = false;
    this.finished = false;
    this.taskCount = 1;
    POPOUT_MODALS['windowInstance'].document.getElementById('logs').innerHTML = '';
    if (this.dataObject.historyId) {
      this.historyId = this.dataObject.historyId;
      this.orderId = this.dataObject.orderId;
      this.loadOrderLog();
    } else if (this.dataObject.taskId) {
      this.taskId = this.dataObject.taskId;
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

  checkLogLevel(type: string): void {
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
      const sheet = POPOUT_MODALS['windowInstance'].document.createElement('style');
      sheet.innerHTML = this.sheetContent;
      POPOUT_MODALS['windowInstance'].document.body.appendChild(sheet);
    }
    this.saveUserPreference();
  }

  /**
   * Save the user preference of log filter
   */
  saveUserPreference(): void {
    this.preferences.logFilter = this.object.checkBoxs;
    const configObj: any = {
      controllerId: this.controllerId,
      accountName: this.authService.currentUserData,
      profileItem: JSON.stringify(this.preferences)
    };

    this.coreService.post('profile/prefs/store', configObj).subscribe(() => {
      sessionStorage['preferences'] = JSON.stringify(this.preferences);
    });
  }
}
