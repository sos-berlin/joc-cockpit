import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {isArray, isEmpty} from 'underscore';
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";
import {AuthService} from "../guard";
import {CoreService} from '../../services/core.service';
import {POPOUT_MODAL_DATA, POPOUT_MODALS, PopoutData} from "../../services/popup.service";
import {HelpViewerComponent} from "../help-viewer/help-viewer.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {HelpRenderResult, HelpService} from "../../services/help.service";

declare const $: any;
export let that: any;

@Component({
  standalone: false,
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
  loaded = false;
  isExpandCollapse = false;
  taskCount = 1;
  controllerId = '';
  lastScrollTop = 0;
  delta = 20;
  logPanelWidth: number;
  dataObject: PopoutData;
  treeStructure: any[] = [];
  isChildren = false;
  nodes = [];


  @ViewChild('dataBody', {static: false}) dataBody!: ElementRef;

  constructor(private authService: AuthService,private helpService: HelpService, public coreService: CoreService,private modal: NzModalService,
              @Inject(POPOUT_MODAL_DATA) public data: PopoutData) {

  }

  ngOnInit(): void {
    this.loaded = false;
    this.dataObject = POPOUT_MODALS['data'];
    if (!this.dataObject || !this.dataObject.controllerId) {
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
    this.isCancel = true;
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
    that.isCancel = true;
    that.cancelApiCalls();
    that.unsubscribeLogs();
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
    this.loaded = true;
    this.calWindowSize();
    this.addStylesToPopupWindow();

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
      if (this.historyId !== this.coreService.logViewDetails.historyId) {
        this.coreService.logViewDetails.historyId = this.historyId;
        this.coreService.logViewDetails.expandedLogTree = [];
        this.coreService.logViewDetails.expandedLogPanel = new Set();
      }
      this.loadOrderLog();
    } else if (this.dataObject.taskId) {
      this.taskId = this.dataObject.taskId;
      this.loadJobLog();
    }

    function disableF5(e: any) {
      if ((e.which || e.keyCode) == 116) {
        that.reloadLog();
        e.preventDefault();
      }
    }

    setTimeout(() => {
      const self = this;
      $(POPOUT_MODALS['windowInstance'].document).on("keydown", disableF5);
      const panel = POPOUT_MODALS['windowInstance'].document.getElementById('property-panel');
      const close = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-close');
      const open = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-open');
      const transitionCSS = {transition: 'none'};
      if (panel) {
        $(panel).resizable({
          minWidth: 22,
          maxWidth: 768,
          handles: 'w',
          resize: (e, x) => {
            const wt = x.size.width;
            const transitionCSS = {transition: 'none'};
            $(panel).css({width: wt + 'px'});
            this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + wt + 'px');
            $(close).css({...transitionCSS, right: (wt - 2) + 'px'});
            localStorage['logPanelWidth'] = wt;
          }
        });
      }

      $(open).click(() => {
        self.logPanelWidth = localStorage['logPanelWidth'] ? parseInt(localStorage['logPanelWidth'], 10) : 300;
        this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + (self.logPanelWidth + 8) + 'px');
        $(close).css({...transitionCSS, right: (self.logPanelWidth - 2) + 'px'});

        $(panel).css({...transitionCSS, width: self.logPanelWidth + 'px'}).show();
        $(open).css({...transitionCSS, right: '-20px'});
        sessionStorage['isLogTreeOpen'] = true;
      });

      $(close).click(() => {
        const panelEl = POPOUT_MODALS['windowInstance'].document.getElementById('property-panel');
        const open = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-open');
        const transitionCSS = {transition: 'none'};

        if (panelEl && panelEl.getAttribute('data-mode') === 'help') {
          if (this.taskId) {
            panelEl.style.display = 'none';
            this.dataBody.nativeElement.setAttribute('style', 'margin-right: 10px');
            (close[0] as HTMLElement).style.display = 'none';
          } else {
            this.restoreTreeView(POPOUT_MODALS['windowInstance']);
          }
          panelEl.removeAttribute('data-mode');

        } else {
          this.dataBody.nativeElement.setAttribute('style', 'margin-right: 10px');
          $(panelEl).css(transitionCSS).hide();
          $(open).css({...transitionCSS, right: '0'});
          $(close).css({...transitionCSS, right: '-20px'});
          sessionStorage['isLogTreeOpen'] = false;
        }
      });      if (!this.taskId) {
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
    }, 5)
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

    if (!this.coreService.logViewDetails.expandedAllLog && this.coreService.logViewDetails.expandedLogPanel.size == 0) {
      if (x && x.length > 0) {
        const dom = x[x.length - 1].childNodes[0];
        if (dom) {
          dom.click();
        }
      }
    }
  }

  private expandTask(i: number, expand: boolean): void {
    if (!expand) {
      this.coreService.logViewDetails.expandedAllLog = false;
    }
    const domId = 'tx_log_' + (i + 1);
    const jobs: any = {};
    jobs.controllerId = this.controllerId;
    jobs.taskId = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1))?.innerText;
    const a = this.dataBody.nativeElement.querySelector('#' + domId);
    const classList = this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList;
    if (a.classList.contains('hide') || classList.contains('down')) {
      this.taskCanceller = this.coreService.log('task/log', jobs, {
        responseType: 'text' as 'json',
        observe: 'response' as 'response'
      }).subscribe((res: any) => {
        if (res) {
          this.renderData(res.body, domId);
          this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.remove('down');
          this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.add('up');
          this.coreService.logViewDetails.expandedLogPanel.add('#ex_' + (i + 1));
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
        this.coreService.logViewDetails.expandedLogPanel.delete('#ex_' + (i + 1));
        a.classList.remove('show');
        a.classList.add('hide');
        const z = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1))?.innerText;
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
        if (res) {
          if (res.body) {
            this.renderData(res.body, null);
          }
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
              if (dt[i].label) {
                this.treeStructure[x]['label'] = dt[i].label;
              }
              if (dt[i].logLevel) {
                this.treeStructure[x]['logLevel'] = dt[i].logLevel
              }
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
      if (dt[i].label) {
        col += ', label=' + dt[i].label;
      }
      if (dt[i].position || dt[i].position == 0) {
        col += ', pos=' + dt[i].position;
      }

      if (dt[i].priority !== undefined && dt[i].priority !== null) {
        col += ', prio=' + this.getPriorityLabel(dt[i].priority);
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
          if (dt[i].lock.label) {
            col += ', label=' + dt[i].lock.label;
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
        col += ', Retrying(delayedUntil=' + delayedUntil;
        if (dt[i].retrying.label) {
          col += ', label=' + dt[i].retrying.label;
        }
        col += ')';
      } else if (dt[i].logEvent === 'OrderSleeping' && dt[i].sleep) {
        const until = (this.preferences.logTimezone && dt[i].sleep.until) ? this.coreService.getLogDateFormat(dt[i].sleep.until, this.preferences.zone) : dt[i].sleep.until;
        col += ', until=' + until;
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
            if (isArray(v1)) {
              v1.forEach((list, index) => {
                v1[index] = Object.entries(list).map(([k1, v1]) => {
                  return {name: k1, value: v1};
                });
              });
            } else {
              v1 = Object.entries(v1).map(([k1, v1]) => {
                return {name: k1, value: v1};
              });
            }
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
      } else if (dt[i].orderAdded) {
        col += `, OrderAdded(id=${dt[i].orderAdded.orderId}, workflow=${dt[i].orderAdded.workflowPath}, arguments(`;
        if (dt[i].orderAdded.arguments) {
          const arr = this.flattenArgumentsToStrings(dt[i].orderAdded.arguments);
          col = this.coreService.createLogOutputString(arr, col);
        }

        col += '))';
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
        const logsContainer = POPOUT_MODALS['windowInstance']?.document.getElementById('logs');
        const uniqueId = `${dt[i].controllerDatetime}-${dt[i].orderId}-${dt[i].logEvent}-${dt[i].position}`;
        const existingDiv = logsContainer.querySelector(`[data-log-id="${uniqueId}"]`);

        if (!existingDiv) {
          div.setAttribute('data-log-id', uniqueId);
          logsContainer.appendChild(div);
        }
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
    this.checkAndExpand();
    this.isChildren = obj.isChildren;
    this.loading = false;
  }

   flattenArgumentsToStrings(obj: any): any[] {
    const result: any[] = [];

    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'object' && val !== null) {
        result.push({
          name: key,
          value: JSON.stringify(val)
        });
      } else {
        result.push({
          name: key,
          value: val
        });
      }
    }

    return result;
  }


  private getPriorityLabel(prio: number): string {
    switch (prio) {
      case 20000:   return 'HIGH';
      case 10000:    return 'ABOVE NORMAL';
      case 0:       return 'NORMAL';
      case -10000:   return 'BELOW NORMAL';
      case -20000:  return 'LOW';
      default:      return prio.toString();
    }
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
    }, this.preferences, POPOUT_MODALS['windowInstance']);
  }

  private checkAndExpand(): void {
    const self = this;

    if (this.coreService.logViewDetails.expandedLogPanel.size || this.coreService.logViewDetails.expandedAllLog) {
      const x: any = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('tx_order');
      for (let i = 0; i < x.length; i++) {
        const id = '#' + x[i]?.firstChild?.id;
        if (this.coreService.logViewDetails.expandedLogPanel.has(id) || this.coreService.logViewDetails.expandedAllLog) {
          this.expandTask(i, true);
        }
      }
    }

    function traverseTree(data): void {
      for (let i in data) {
        if (data[i] && data[i].children && data[i].children.length > 0) {
          if (self.coreService.logViewDetails.expandedLogTree.indexOf(data[i].key) > -1 || self.coreService.logViewDetails.expandedAllTree) {
            data[i].expanded = true;
          }
          traverseTree(data[i].children);
        }
      }
    }

    traverseTree(this.nodes);
  }

  expandAll(): void {
    this.coreService.logViewDetails.expandedAllLog = true;
    const x: any = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      this.expandTask(i, true);
    }
  }

  collapseAll(): void {
    this.coreService.logViewDetails.expandedAllLog = false;
    this.coreService.logViewDetails.expandedLogPanel.clear();
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
    this.coreService.logViewDetails.expandedAllTree = true;
    this.coreService.logViewDetails.expandedLogTree = [];
    this.traverseTree(this.nodes, true);
    this.nodes = [...this.nodes];
  }

  collapseAllTree(): void {
    this.coreService.logViewDetails.expandedAllTree = false;
    this.coreService.logViewDetails.expandedLogTree = [];
    this.traverseTree(this.nodes, false);
    this.nodes = [...this.nodes];
  }

  private traverseTree(data: any[], isExpand: boolean): void {
    for (let i in data) {
      if (data[i] && data[i].children && data[i].children.length > 0) {
        data[i].expanded = isExpand;
        if (isExpand) {
          this.coreService.logViewDetails.expandedLogTree.push(data[i].key);
        }
        this.traverseTree(data[i].children, isExpand);
      }
    }
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
      data.origin['isExpanded'] = !data.origin['isExpanded'];
      if (data.origin['isExpanded']) {
        this.coreService.logViewDetails.expandedLogTree.push(data.origin.key);
      } else {
        this.coreService.logViewDetails.expandedAllTree = false;
        this.coreService.logViewDetails.expandedLogTree.splice(this.coreService.logViewDetails.expandedLogTree.indexOf(data.origin.key), 1);
      }
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
      POPOUT_MODALS['windowInstance'].navigator.clipboard.writeText(this.dataBody.nativeElement.innerText);
    } catch (err) {
      console.error('Failed to copy: ', err);
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


  private unsubscribeLogs(): void {
    if (!this.controllerId) { return; }

    const reqs: Array<{url: string, body: any}> = [];

    if (this.historyId) {
      reqs.push({
        url: 'order/log/unsubscribe',
        body: { controllerId: this.controllerId, historyId: this.historyId }
      });
    }
    if (this.taskId) {
      reqs.push({
        url: 'task/log/unsubscribe',
        body: { controllerId: this.controllerId, taskId: this.taskId }
      });
    }

    reqs.forEach(({url, body}) => {
      this.coreService.post(url, body).subscribe({
        next: (res) => {

        },
        error: (err) => {
        }
      });
    });
  }


  private addStylesToPopupWindow(): void {
    const popupWindow = POPOUT_MODALS['windowInstance'];
    if (!popupWindow || popupWindow.document.getElementById('log-view-styles')) {
      return;
    }

    const styleElement = popupWindow.document.createElement('style');
    styleElement.id = 'log-view-styles';
    styleElement.textContent = `
      .help-sidebar-content{height:100%;display:flex;flex-direction:column}.help-header{padding:12px 16px;border-bottom:1px solid #e8e8e8;background:#fafafa;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.help-header .help-title{margin:0;font-size:14px;font-weight:500;color:#262626}.help-header .help-title .help-icon{margin-right:8px;color:#1890ff}.help-header .help-actions{display:flex;align-items:center;gap:8px}.help-header .help-actions .btn-back-to-tree{font-size:12px;padding:4px 8px;border-radius:3px}.help-header .help-actions .btn-help-close{background:0 0;border:none;cursor:pointer;color:#999;font-size:16px;padding:4px;border-radius:3px;transition:color .2s ease}.help-header .help-actions .btn-help-close:hover{color:#666;background-color:rgba(0,0,0,.04)}.help-body{flex:1;overflow-y:auto;padding:16px;background:#fff;margin-top:16px}.help-body .help-loading{text-align:center;padding:50px 20px;color:#1890ff}.help-body .help-loading .loading-text{margin-top:10px;font-size:14px}.help-body .help-error{text-align:center;padding:50px 20px;color:#999;font-size:14px}.help-body .help-content.help-md{margin:0;padding:0;max-width:100%;overflow-wrap:break-word}.help-body .help-content.help-md h1{font-size:24px!important}.help-body .help-content.help-md h2{font-size:20px!important}.help-body .help-content.help-md h3{font-size:16px!important}.help-body .help-content.help-md table{font-size:12px!important}.help-body .help-content.help-md table th,.help-body .help-content.help-md table td{padding:6px!important}.help-body .help-content.help-md pre{font-size:12px!important;overflow-x:auto;max-width:100%}.help-body .help-content.help-md code{font-size:11px!important}#property-panel.help-mode .rg-right{display:none}.help-content .help-target-highlight{background-color:#fff2b8!important;transition:background-color .3s ease;padding:4px 8px;border-radius:4px;margin:-4px -8px}@media (max-width:1200px){.help-body .help-content.help-md h1{font-size:20px!important}.help-body .help-content.help-md h2{font-size:18px!important}.help-body .help-content.help-md h3{font-size:16px!important}.help-body .help-content.help-md table{font-size:11px!important}}
      .help-md{font-size:14px!important;line-height:1.65!important;color:#111827!important}.help-md h1{font-size:28px!important;margin:0 0 .6rem!important;font-weight:700!important;padding-bottom:.6rem!important;border-bottom:1px solid #e5e7eb!important}.help-md h2{font-size:22px!important;margin:2rem 0 .5rem!important;font-weight:700!important;padding-bottom:.4rem!important;border-bottom:1px solid #eef0f3!important}.help-md h3{font-size:18px!important;margin:1.25rem 0 .4rem!important;font-weight:700!important}.help-md h1+p,.help-md h2+p,.help-md h3+p{margin-top:.3rem!important}.help-md p{margin:.5rem 0 1rem!important;color:#374151}.help-md ul,.help-md ol{margin:.6rem 0 1rem!important;padding-left:1.4rem!important;list-style-position:outside!important}.help-md ul{list-style-type:disc!important}.help-md ul ul{list-style-type:circle!important}.help-md ul ul ul{list-style-type:square!important}.help-md ol{list-style-type:decimal!important}.help-md ol ol{list-style-type:lower-alpha!important}.help-md ol ol ol{list-style-type:lower-roman!important}.help-md li{margin:.25rem 0!important}.help-md li p{margin:.25rem 0!important}.help-md blockquote{margin:1rem 0!important;padding:.6rem 1rem!important;border-left:4px solid #e5e7eb!important;background:#f9fafb!important}.help-md hr{border:0!important;border-top:1px solid #e5e7eb!important;margin:1.25rem 0!important}.help-md table{border-collapse:collapse!important;width:100%!important;margin:1rem 0!important;font-size:13px!important}.help-md th,.help-md td{border:1px solid #e5e7eb!important;padding:8px!important;vertical-align:top!important}.help-md thead th{background:#f3f4f6!important;font-weight:600!important}.help-md pre{padding:12px!important;overflow:auto!important;border-radius:6px!important;background:#0f172a0d!important}.help-md code{padding:0 .25em!important;background:#0000000f!important;border-radius:4px!important}.help-md input[type=checkbox]{margin-right:.5em!important;transform:translateY(.1em)!important}.help-md a{color:var(--primary)!important;text-decoration:underline!important;text-underline-offset:2px!important;cursor:pointer!important}.help-md a:hover{text-decoration-thickness:2px!important}.help-md a:focus-visible{outline:2px solid var(--primary)!important;outline-offset:2px!important}.help-md a:visited{color:var(--primary)!important}.help-md a[href^="#"]{color:var(--primary)!important}.help-md a[href^=http]:not([href*="//localhost"]):not([href*="//127.0.0.1"])::after{content:" ⬈"!important;margin-left:.25em!important;font-size:.85em!important;opacity:.7!important}.help-md a[href^=mailto:]::before{content:"✉ "}.help-md a[href^=tel:]::before{content:"☎ "}.help-md h1 a,.help-md h2 a,.help-md h3 a,.help-md h4 a,.help-md h5 a,.help-md h6 a{color:inherit!important;text-decoration:underline!important}@media (prefers-color-scheme:dark){.help-md a{color:var(--primary)!important}.help-md a:visited{color:var(--primary)!important}.help-md a:focus-visible{outline-color:var(--primary)!important}}.help-md-target{background:#fde68a66;transition:background .8s ease}.help-md :is(h1,h2,h3,h4,h5,h6){scroll-margin-top:64px}.help-md-target{animation:highlight-fade 1.2s forwards}@keyframes highlight-fade{0%{background-color:var(--primary)}100%{background-color:transparent}}.help-md pre,.help-md code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace!important;white-space:pre!important;overflow:auto!important}
    `;
    popupWindow.document.head.appendChild(styleElement);
  }

  helpPage(): void {
    const key = this.taskId ? 'task-log' : 'order-log';
    const popupWindow = POPOUT_MODALS['windowInstance'];
    if (!popupWindow) return;

    const panel = popupWindow.document.getElementById('property-panel') as HTMLElement;
    const isHelpOpen = panel && panel.getAttribute('data-mode') === 'help';

    if (isHelpOpen) {
      const sidebarClose = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;
      if (sidebarClose) {
        sidebarClose.click();
      }
    } else {
      this.showHelpInSidebar(key);
    }
  }

  private showHelpInSidebar(key: string): void {
    const popupWindow = POPOUT_MODALS['windowInstance'];
    if (!popupWindow) return;

    this.addStylesToPopupWindow();

    const panel = popupWindow.document.getElementById('property-panel') as HTMLElement;
    const treeWrapper = popupWindow.document.getElementById('tree-wrapper') as HTMLElement;
    const helpWrapper = popupWindow.document.getElementById('help-wrapper') as HTMLElement;
    const close = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;
    const open = popupWindow.document.getElementsByClassName('sidebar-open')[0] as HTMLElement;

    if (!panel || !treeWrapper || !helpWrapper) return;

    const helpWidth = Math.floor(popupWindow.innerWidth * 0.8);

    panel.style.display = 'block';
    panel.style.width = helpWidth + 'px';
    this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + (helpWidth + 8) + 'px');

    if (close) {
      close.style.display = 'block';
      close.style.right = (helpWidth - 2) + 'px';
    }
    if (open) {
      open.style.right = '-20px';
    }

    treeWrapper.style.display = 'none';
    helpWrapper.style.display = 'block';

    this.loadHelpContentIntoSidebar(popupWindow, key);
    panel.setAttribute('data-mode', 'help');
  }


  private loadHelpContentIntoSidebar(popupWindow: Window, key: string): void {
    const helpWrapper = popupWindow.document.getElementById('help-wrapper');
    if (!helpWrapper) return;

    const helpHtml = `
    <div class="help-sidebar-content">

      <div class="help-body">
        <div class="help-content help-md" style="display: none;"></div>
      </div>
    </div>`;

    helpWrapper.innerHTML = helpHtml;
    this.setupHelpSidebarEvents(popupWindow);
    this.fetchHelpContent(popupWindow, key);
  }


  private setupHelpSidebarEvents(popupWindow: Window): void {
    const panel = popupWindow.document.getElementById('property-panel');
    if (!panel) return;

    const backBtn = panel.querySelector('.btn-back-to-tree');
    const closeBtn = panel.querySelector('.btn-help-close');
    const sidebarClose = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;

    if (backBtn) {
      backBtn.addEventListener('click', () => this.restoreTreeView(popupWindow));
    }

    if (closeBtn && sidebarClose) {
      closeBtn.addEventListener('click', () => sidebarClose.click());
    }
  }


  private restoreTreeView(popupWindow: Window): void {
    const panel = popupWindow.document.getElementById('property-panel') as HTMLElement;
    const treeWrapper = popupWindow.document.getElementById('tree-wrapper') as HTMLElement;
    const helpWrapper = popupWindow.document.getElementById('help-wrapper') as HTMLElement;
    const close = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;

    if (!panel || !treeWrapper || !helpWrapper) return;

    helpWrapper.style.display = 'none';
    treeWrapper.style.display = 'block';
    panel.removeAttribute('data-mode');

    const normalWidth = localStorage['logPanelWidth'] ? parseInt(localStorage['logPanelWidth'], 10) : 300;
    panel.style.width = normalWidth + 'px';
    this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + (normalWidth + 8) + 'px');

    if (close) {
      close.style.right = (normalWidth - 2) + 'px';
      close.style.display = 'block';
    }
  }
  private fetchHelpContent(popupWindow: Window, key: string): void {
    const panel = popupWindow.document.getElementById('property-panel');
    if (!panel) return;

    const loadingEl = panel.querySelector('.help-loading') as HTMLElement;
    const contentEl = panel.querySelector('.help-content') as HTMLElement;
    const errorEl = panel.querySelector('.help-error') as HTMLElement;

    this.helpService.getHelpHtml(key).subscribe({
      next: (result: HelpRenderResult | null) => {
        if (loadingEl) loadingEl.style.display = 'none';
        if (result?.html) {
          if (contentEl) {
            contentEl.innerHTML = result.html;
            contentEl.style.display = 'block';
            this.processHelpContent(contentEl);
          }
          if (result.fellBack) {
            this.showFallbackNotice(panel, result);
          }
        } else {
          if (errorEl) errorEl.style.display = 'block';
        }
      },
      error: (err) => {
        console.error('Error loading help content:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'block';
      }
    });
  }

  private processHelpContent(contentEl: HTMLElement): void {
    this.applyHeadingIds(contentEl);
    this.setupHelpContentLinks(contentEl);
  }

  private applyHeadingIds(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6').forEach(h => {
      if (h.id?.trim()) return;
      const raw = h.textContent || '';
      const custom = raw.match(/\s*\{#([A-Za-z0-9._:-]+)\}\s*$/);
      if (custom) {
        h.id = custom[1];
        h.textContent = raw.replace(/\s*\{#([A-Za-z0-9._:-]+)\}\s*$/, '').trim();
      } else {
        h.id = this.slug(raw);
      }
    });
  }

  private setupHelpContentLinks(contentEl: HTMLElement): void {
    contentEl.querySelectorAll('a[href^="#"], a[href^="/"]').forEach((link: HTMLAnchorElement) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        if (href.startsWith('#')) {
          const targetId = href.slice(1);
          const target = contentEl.querySelector(`#${CSS.escape(targetId)}`);
          if (target) {
            target.scrollIntoView({behavior: 'smooth', block: 'start'});
            target.classList.add('help-md-target');
            setTimeout(() => target.classList.remove('help-md-target'), 1200);
          }
        } else if (href.startsWith('/')) {
          const mdMatch = href.match(/^\/([a-z0-9._-]+)(?:\.md)?$/i);
          if (mdMatch) {
            this.showHelpInSidebar(mdMatch[1]);
          }
        }
      });
    });
  }

  private slug(s: string): string {
    return s.toLowerCase().trim().replace(/<[^>]+>/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  private showFallbackNotice(panel: HTMLElement, result: HelpRenderResult): void {
    const headerEl = panel.querySelector('.help-header .help-actions');
    if (headerEl?.querySelector('.fallback-notice')) return;
    if (headerEl && result.fellBack) {
      const noticeHtml = `<small class="fallback-notice text-warning" style="font-size:11px;">Showing ${result.usedLang.toUpperCase()}</small>`;
      headerEl.insertAdjacentHTML('afterbegin', noticeHtml);
    }
  }

}
