import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ClipboardService} from 'ngx-clipboard';
import {Observable} from 'rxjs';
import * as moment from 'moment-timezone';
import {isEmpty, sortBy, isNumber, object} from 'underscore';
import {saveAs} from 'file-saver';
import {AuthService} from '../components/guard';

declare const diff_match_patch: any;
declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  tabs: any = {};
  tempTabs: any = {};
  dashboard: any = {};
  sideView = {
    workflow: {width: 270, show: true},
    job: {width: 270, show: true},
    orderOverview: {show: true},
    lock: {width: 270, show: true},
    calendar: {width: 270, show: true},
    documentation: {width: 270, show: true},
    inventory: {width: 300, show: true},
    xml: {width: 500, show: true}
  };

  newWindow: any;
  windowProperties: any = ',scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router,
              private clipboardService: ClipboardService) {

    this.tabs._workflow = {};
    this.tabs._workflow.filter = {};
    this.tabs._workflow.filter.date = '1d';
    this.tabs._workflow.filter.sortBy = 'versionDate';
    this.tabs._workflow.reverse = true;
    this.tabs._workflow.currentPage = '1';
    this.tabs._workflow.expandedKeys = ['/'];
    this.tabs._workflow.selectedkeys = ['/'];
    this.tabs._workflow.isCompact = true;
    this.tabs._workflow.selectedView = true;

    this.tabs._workflowDetail = {};
    this.tabs._workflowDetail.date = '1d';
    this.tabs._workflowDetail.panelSize = 0;
    this.tabs._workflowDetail.panelSize2 = 450;
    this.tabs._workflowDetail.pageView = 'list';

    this.tabs._daliyPlan = {};
    this.tabs._daliyPlan.filter = {};
    this.tabs._daliyPlan.filter.status = 'ALL';
    this.tabs._daliyPlan.filter.groupBy = 'ORDER';
    this.tabs._daliyPlan.filter.late = false;
    this.tabs._daliyPlan.filter.sortBy = 'plannedStartTime';
    this.tabs._daliyPlan.reverse = true;
    this.tabs._daliyPlan.currentPage = '1';
    this.tabs._daliyPlan.selectedView = true;

    this.tabs._orderOverview = {};
    this.tabs._orderOverview.overview = true;
    this.tabs._orderOverview.filter = {};
    this.tabs._orderOverview.filter.date = '1d';
    this.tabs._orderOverview.filter.dateLabel = 'today';
    this.tabs._orderOverview.filter.sortBy = 'orderId';
    this.tabs._orderOverview.reverse = false;
    this.tabs._orderOverview.currentPage = '1';
    this.tabs._orderOverview.pageView = 'grid';
    this.tabs._orderOverview.showErrorNodes = true;
    this.tabs._orderOverview.isNodePanelVisible = true;
    this.tabs._orderOverview.showLogPanel = undefined;
    this.tabs._orderOverview.panelSize = 0;

    this.tabs._history = {};
    this.tabs._history.order = {};
    this.tabs._history.type = 'ORDER';
    this.tabs._history.order.filter = {};
    this.tabs._history.order.filter.historyStates = 'ALL';
    this.tabs._history.order.filter.date = 'today';
    this.tabs._history.order.filter.sortBy = 'startTime';
    this.tabs._history.order.reverse = true;
    this.tabs._history.order.currentPage = '1';
    this.tabs._history.order.selectedView = true;
    this.tabs._history.task = {};
    this.tabs._history.task.filter = {};
    this.tabs._history.task.filter.historyStates = 'ALL';
    this.tabs._history.task.filter.date = 'today';
    this.tabs._history.task.filter.sortBy = 'startTime';
    this.tabs._history.task.reverse = true;
    this.tabs._history.task.currentPage = '1';
    this.tabs._history.task.selectedView = true;
    this.tabs._history.yade = {};
    this.tabs._history.yade.filter = {};
    this.tabs._history.yade.filter.states = 'ALL';
    this.tabs._history.yade.filter.date = 'today';
    this.tabs._history.yade.filter.sortBy = 'start';
    this.tabs._history.yade.reverse = true;
    this.tabs._history.yade.currentPage = '1';
    this.tabs._history.yade.selectedView = true;
    this.tabs._history.deployment = {};
    this.tabs._history.deployment.filter = {};
    this.tabs._history.deployment.filter.state = 'ALL';
    this.tabs._history.deployment.filter.date = 'today';
    this.tabs._history.deployment.filter.sortBy = 'deploymentDate';
    this.tabs._history.deployment.reverse = true;
    this.tabs._history.deployment.currentPage = '1';
    this.tabs._history.deployment.selectedView = true;
    this.tabs._history.submission = {};
    this.tabs._history.submission.filter = {};
    this.tabs._history.submission.filter.category = 'ALL';
    this.tabs._history.submission.filter.date = 'today';
    this.tabs._history.submission.filter.sortBy = 'dailyPlanDate';
    this.tabs._history.submission.reverse = true;
    this.tabs._history.submission.currentPage = '1';
    this.tabs._history.submission.selectedView = true;

    this.tabs._yade = {};
    this.tabs._yade.filter = {};
    this.tabs._yade.filter.states = 'ALL';
    this.tabs._yade.filter.date = 'today';
    this.tabs._yade.filter.sortBy = 'start';
    this.tabs._yade.reverse = true;
    this.tabs._yade.currentPage = '1';
    this.tabs._yade.selectedView = true;

    this.tabs._auditLog = {};
    this.tabs._auditLog.filter = {};
    this.tabs._auditLog.filter.historyStates = 'ALL';
    this.tabs._auditLog.filter.date = 'today';
    this.tabs._auditLog.filter.sortBy = 'created';
    this.tabs._auditLog.reverse = true;
    this.tabs._auditLog.currentPage = '1';

    this.tabs._resource = {};
    this.tabs._resource.agents = {};
    this.tabs._resource.agents.filter = {};
    this.tabs._resource.agents.filter.state = 'ALL';
    this.tabs._resource.agents.filter.sortBy = 'path';
    this.tabs._resource.agents.reverse = false;
    this.tabs._resource.agents.currentPage = '1';
    this.tabs._resource.agentJobExecution = {};
    this.tabs._resource.agentJobExecution.filter = {};
    this.tabs._resource.agentJobExecution.filter.date = 'today';
    this.tabs._resource.agentJobExecution.filter.sortBy = 'agentId';
    this.tabs._resource.agentJobExecution.reverse = false;
    this.tabs._resource.agentJobExecution.currentPage = '1';
    this.tabs._resource.locks = {};
    this.tabs._resource.locks.filter = {};
    this.tabs._resource.locks.filter.state = 'ALL';
    this.tabs._resource.locks.filter.sortBy = 'id';
    this.tabs._resource.locks.reverse = false;
    this.tabs._resource.locks.currentPage = '1';
    this.tabs._resource.locks.expandedKeys = ['/'];
    this.tabs._resource.locks.selectedkeys = ['/'];
    this.tabs._resource.calendars = {};
    this.tabs._resource.calendars.filter = {};
    this.tabs._resource.calendars.filter.type = 'ALL';
    this.tabs._resource.calendars.filter.sortBy = 'name';
    this.tabs._resource.calendars.reverse = false;
    this.tabs._resource.calendars.currentPage = '1';
    this.tabs._resource.calendars.expandedKeys = ['/'];
    this.tabs._resource.calendars.selectedkeys = ['/'];
    this.tabs._resource.documents = {};
    this.tabs._resource.documents.filter = {};
    this.tabs._resource.documents.filter.type = 'ALL';
    this.tabs._resource.documents.filter.sortBy = 'name';
    this.tabs._resource.documents.reverse = false;
    this.tabs._resource.documents.currentPage = '1';
    this.tabs._resource.documents.expandedKeys = ['/'];
    this.tabs._resource.documents.selectedkeys = ['/'];
    this.tabs._resource.documents.selectedView = true;
    this.tabs._resource.state = 'agent';

    this.tabs._configuration = {};
    this.tabs._configuration.state = 'inventory';
    this.tabs._configuration.inventory = {};
    this.tabs._configuration.copiedParamObjects = {};
    this.tabs._configuration.copiedInstuctionObject = {};

    this.tempTabs._workflow = {};
    this.tempTabs._workflow.filter = {};
    this.tempTabs._workflow.filter.date = '1d';
    this.tempTabs._workflow.filter.sortBy = 'versionDate';
    this.tempTabs._workflow.reverse = true;
    this.tempTabs._workflow.currentPage = '1';
    this.tempTabs._workflow.expandedKeys = ['/'];
    this.tempTabs._workflow.selectedkeys = ['/'];
    this.tempTabs._workflow.selectedView = true;
    this.tempTabs._workflow.isCompact = true;

    this.tempTabs._workflowDetail = {};
    this.tempTabs._workflowDetail.date = '1d';
    this.tempTabs._workflowDetail.panelSize = 0;
    this.tempTabs._workflowDetail.panelSize2 = 450;
    this.tempTabs._workflowDetail.pageView = 'list';

    this.tempTabs._daliyPlan = {};
    this.tempTabs._daliyPlan.filter = {};
    this.tempTabs._daliyPlan.filter.status = 'ALL';
    this.tempTabs._daliyPlan.filter.groupBy = 'ORDER';
    this.tempTabs._daliyPlan.filter.late = false;
    this.tempTabs._daliyPlan.filter.sortBy = 'plannedStartTime';
    this.tempTabs._daliyPlan.reverse = true;
    this.tempTabs._daliyPlan.currentPage = '1';
    this.tempTabs._daliyPlan.selectedView = true;

    this.tempTabs._orderOverview = {};
    this.tempTabs._orderOverview.overview = true;
    this.tempTabs._orderOverview.filter = {};
    this.tempTabs._orderOverview.filter.date = '1d';
    this.tempTabs._orderOverview.filter.dateLabel = 'today';
    this.tempTabs._orderOverview.filter.sortBy = 'orderId';
    this.tempTabs._orderOverview.reverse = false;
    this.tempTabs._orderOverview.currentPage = '1';
    this.tempTabs._orderOverview.pageView = 'grid';
    this.tempTabs._orderOverview.showErrorNodes = true;
    this.tempTabs._orderOverview.isNodePanelVisible = true;
    this.tempTabs._orderOverview.showLogPanel = undefined;
    this.tempTabs._orderOverview.panelSize = 0;

    this.tempTabs._history = {};
    this.tempTabs._history.order = {};
    this.tempTabs._history.type = 'ORDER';
    this.tempTabs._history.order.filter = {};
    this.tempTabs._history.order.filter.historyStates = 'ALL';
    this.tempTabs._history.order.filter.date = 'today';
    this.tempTabs._history.order.filter.sortBy = 'startTime';
    this.tempTabs._history.order.reverse = true;
    this.tempTabs._history.order.currentPage = '1';
    this.tempTabs._history.order.selectedView = true;
    this.tempTabs._history.task = {};
    this.tempTabs._history.task.filter = {};
    this.tempTabs._history.task.filter.historyStates = 'ALL';
    this.tempTabs._history.task.filter.date = 'today';
    this.tempTabs._history.task.filter.sortBy = 'startTime';
    this.tempTabs._history.task.reverse = true;
    this.tempTabs._history.task.currentPage = '1';
    this.tempTabs._history.task.selectedView = true;
    this.tempTabs._history.yade = {};
    this.tempTabs._history.yade.filter = {};
    this.tempTabs._history.yade.filter.states = 'ALL';
    this.tempTabs._history.yade.filter.date = 'today';
    this.tempTabs._history.yade.filter.sortBy = 'start';
    this.tempTabs._history.yade.reverse = true;
    this.tempTabs._history.yade.currentPage = '1';
    this.tempTabs._history.yade.selectedView = true;
    this.tempTabs._history.deployment = {};
    this.tempTabs._history.deployment.filter = {};
    this.tempTabs._history.deployment.filter.state = 'ALL';
    this.tempTabs._history.deployment.filter.date = 'today';
    this.tempTabs._history.deployment.filter.sortBy = 'deploymentDate';
    this.tempTabs._history.deployment.reverse = true;
    this.tempTabs._history.deployment.currentPage = '1';
    this.tempTabs._history.deployment.selectedView = true;
    this.tempTabs._history.submission = {};
    this.tempTabs._history.submission.filter = {};
    this.tempTabs._history.submission.filter.category = 'ALL';
    this.tempTabs._history.submission.filter.date = 'today';
    this.tempTabs._history.submission.filter.sortBy = 'dailyPlanDate';
    this.tempTabs._history.submission.reverse = true;
    this.tempTabs._history.submission.currentPage = '1';
    this.tempTabs._history.submission.selectedView = true;

    this.tempTabs._yade = {};
    this.tempTabs._yade.filter = {};
    this.tempTabs._yade.filter.states = 'ALL';
    this.tempTabs._yade.filter.date = 'today';
    this.tempTabs._yade.filter.sortBy = 'start';
    this.tempTabs._yade.reverse = true;
    this.tempTabs._yade.currentPage = '1';
    this.tempTabs._yade.selectedView = true;

    this.tempTabs._auditLog = {};
    this.tempTabs._auditLog.filter = {};
    this.tempTabs._auditLog.filter.historyStates = 'ALL';
    this.tempTabs._auditLog.filter.date = 'today';
    this.tempTabs._auditLog.filter.sortBy = 'created';
    this.tempTabs._auditLog.reverse = true;
    this.tempTabs._auditLog.currentPage = '1';

    this.tempTabs._resource = {};
    this.tempTabs._resource.agents = {};
    this.tempTabs._resource.agents.filter = {};
    this.tempTabs._resource.agents.filter.state = 'ALL';
    this.tempTabs._resource.agents.filter.sortBy = 'path';
    this.tempTabs._resource.agents.reverse = false;
    this.tempTabs._resource.agents.currentPage = '1';
    this.tempTabs._resource.agentJobExecution = {};
    this.tempTabs._resource.agentJobExecution.filter = {};
    this.tempTabs._resource.agentJobExecution.filter.date = 'today';
    this.tempTabs._resource.agentJobExecution.filter.sortBy = 'agentId';
    this.tempTabs._resource.agentJobExecution.reverse = false;
    this.tempTabs._resource.agentJobExecution.currentPage = '1';
    this.tempTabs._resource.locks = {};
    this.tempTabs._resource.locks.filter = {};
    this.tempTabs._resource.locks.filter.state = 'ALL';
    this.tempTabs._resource.locks.filter.sortBy = 'id';
    this.tempTabs._resource.locks.reverse = false;
    this.tempTabs._resource.locks.currentPage = '1';
    this.tempTabs._resource.locks.expandedKeys = ['/'];
    this.tempTabs._resource.locks.selectedkeys = ['/'];
    this.tempTabs._resource.calendars = {};
    this.tempTabs._resource.calendars.filter = {};
    this.tempTabs._resource.calendars.filter.type = 'ALL';
    this.tempTabs._resource.calendars.filter.sortBy = 'name';
    this.tempTabs._resource.calendars.reverse = false;
    this.tempTabs._resource.calendars.currentPage = '1';
    this.tempTabs._resource.calendars.expandedKeys = ['/'];
    this.tempTabs._resource.calendars.selectedkeys = ['/'];
    this.tempTabs._resource.documents = {};
    this.tempTabs._resource.documents.filter = {};
    this.tempTabs._resource.documents.filter.type = 'ALL';
    this.tempTabs._resource.documents.filter.sortBy = 'name';
    this.tempTabs._resource.documents.reverse = false;
    this.tempTabs._resource.documents.currentPage = '1';
    this.tempTabs._resource.documents.expandedKeys = ['/'];
    this.tempTabs._resource.documents.selectedkeys = ['/'];
    this.tempTabs._resource.documents.selectedView = true;
    this.tempTabs._resource.state = 'agent';

    this.tempTabs._configuration = {};
    this.tempTabs._configuration.state = 'inventory';
    this.tempTabs._configuration.inventory = {};
    this.tempTabs._configuration.copiedParamObjects = {};
    this.tempTabs._configuration.copiedInstuctionObject = {};

    this.dashboard._dashboard = {};
    this.dashboard._dashboard.order = {};
    this.dashboard._dashboard.history = {};
    this.dashboard._dashboard.file = {};
    this.dashboard._dashboard.dailyplan = {};
    this.dashboard._dashboard.dailyplan.date = '0d';
    this.dashboard._dashboard.dailyplan.label = 'filters.button.today';
    this.dashboard._dashboard.history.date = '0d';
    this.dashboard._dashboard.history.label = 'filters.button.today';
    this.dashboard._dashboard.order.date = '1d';
    this.dashboard._dashboard.order.label = 'today';
    this.dashboard._dashboard.file.date = '0d';
    this.dashboard._dashboard.file.label = 'today';

    if (localStorage.$SOS$DASHBOARDTABS) {
      try {
        const obj = JSON.parse(localStorage.$SOS$DASHBOARDTABS);
        if (obj && obj.order) {
          this.dashboard = obj;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!sessionStorage.$SOS$SIDEVIEW || typeof JSON.parse(sessionStorage.$SOS$SIDEVIEW) !== 'object') {
      sessionStorage.$SOS$SIDEVIEW = JSON.stringify(this.sideView);
    } else {
      this.sideView = JSON.parse(sessionStorage.$SOS$SIDEVIEW);
    }
  }

  setDefaultTab(): void {
    this.tabs = this.tempTabs;
  }

  setTabs(tempTabs): void {
    this.tabs = tempTabs;
  }

  getTabs(): any {
    return this.tabs;
  }

  getWorkflowTab(): any {
    return this.tabs._workflow;
  }

  getWorkflowDetailTab(): any {
    return this.tabs._workflowDetail;
  }

  getDailyPlanTab(): any {
    return this.tabs._daliyPlan;
  }

  getHistoryTab(): any {
    return this.tabs._history;
  }

  getOrderOverviewTab(): any {
    return this.tabs._orderOverview;
  }

  getDashboardTab(): any {
    return this.dashboard._dashboard;
  }

  getResourceTab(): any {
    return this.tabs._resource;
  }

  getConfigurationTab(): any {
    return this.tabs._configuration;
  }

  getAuditLogTab(): any {
    return this.tabs._auditLog;
  }

  getYadeTab(): any {
    return this.tabs._yade;
  }

  get(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  post(url: string, options: any): Observable<any> {
    return this.http.post(url, options);
  }

  log(url: string, options: any, headers: any): Observable<any> {
    return this.http.post(url, options, headers);
  }

  download(url: string, options: any, fileName: string, cb: any): void {
    const headers: any = {
      Accept: 'application/octet-stream',
      responseType: 'blob',
      observe: 'response'
    };
    this.http.post(url, options, headers).subscribe((response: any) => {
      saveAs(response.body, fileName || response.headers.get('content-disposition'));
      cb(true);
    }, () => {
      cb(false);
    });
  }

  getColor(d: number, type: string): string {
    if (d === 0) {
      return type === 'text' ? 'green' : type === 'border' ? 'green-box' : 'bg-green';
    } else if (d === 1) {
      return type === 'text' ? 'gold' : type === 'border' ? 'gold-box' : 'bg-gold';
    } else if (d === 2) {
      return type === 'text' ? 'red' : type === 'border' ? 'red-box' : 'bg-red';
    } else if (d === 3) {
      return type === 'text' ? 'light-blue' : type === 'border' ? 'light-blue-box' : 'bg-light-blue';
    } else if (d === 4) {
      return type === 'text' ? 'planned' : type === 'border' ? 'planned-box' : 'bg-planned';
    } else if (d === 5) {
      return type === 'text' ? 'orange' : type === 'border' ? 'orange-box' : 'bg-orange';
    } else if (d === 6) {
      return type === 'text' ? 'dark-blue' : type === 'border' ? 'dark-blue-box' : 'bg-dark-blue';
    } else if (d === 7) {
      return type === 'text' ? 'mangenta' : type === 'border' ? 'mangenta-box' : 'bg-mangenta';
    } else if (d === 8) {
      return type === 'text' ? 'yellow-green' : type === 'border' ? 'yellow-green-box' : 'bg-yellow-green';
    } else if (d === 9) {
      return type === 'text' ? 'calling' : type === 'border' ? 'calling-box' : 'bg-calling';
    } else if (d === 10) {
      return type === 'text' ? 'light-yellow' : type === 'border' ? 'light-yellow-box' : 'bg-light-yellow';
    } else {
      return type === 'text' ? 'light-green' : type === 'border' ? 'light-green-box' : 'bg-light-green';
    }
  }

  getColorBySeverity(d: number, isHover: boolean): string {
    if (d === 0) {
      return isHover ? 'rgba(122,185,122, .7)' : '#7ab97a';
    } else if (d === 1) {
      return isHover ? 'rgba(255,201,26, .7)' : '#ffc91a';
    } else if (d === 2) {
      return isHover ? 'rgba(239,72,106,.7)' : '#ef486a';
    } else if (d === 3) {
      return isHover ? 'rgba(163,198,234, .7)' : '#a3c6ea';
    } else if (d === 4) {
      return isHover ? '#ccc' : '#bbb';
    } else if (d === 5) {
      return isHover ? 'rgba(255,141,26,.7)' : '#FF8d1a';
    } else if (d === 6) {
      return isHover ? 'rgba(21,145,212, .7)' : '#1591d4';
    } else if (d === 7) {
      return isHover ? 'rgba(185,102,185, .7)' : '#b966b9';
    } else if (d === 8) {
      return isHover ? 'rgba(204,204,0, .7)' : '#cccc00';
    } else if (d === 9) {
      return isHover ? 'rgba(243,120,145, .7)' : '#f37891';
    } else {
      return '';
    }
  }

  getDateFormat(dateFormat: string): string {
    if (!dateFormat) {
      return '';
    }
    dateFormat = dateFormat.replace('YY', 'yy');
    dateFormat = dateFormat.replace('YY', 'yy');
    dateFormat = dateFormat.replace('D', 'd');
    dateFormat = dateFormat.replace('D', 'd');
    dateFormat = dateFormat.trim();
    return this.getDateFormatMom(dateFormat);
  }

  getDateFormatMom(dateFormat: string): string {
    if (!dateFormat) {
      return '';
    }
    if (dateFormat.match('HH:mm')) {
      dateFormat = dateFormat.replace('HH:mm', '');
    } else if (dateFormat.match('hh:mm')) {
      dateFormat = dateFormat.replace('hh:mm', '');
    }

    if (dateFormat.match(':ss')) {
      dateFormat = dateFormat.replace(':ss', '');
    }
    if (dateFormat.match('A')) {
      dateFormat = dateFormat.replace('A', '');
    }
    if (dateFormat.match('|')) {
      dateFormat = dateFormat.replace('|', '');
    }
    dateFormat = dateFormat.trim();
    return dateFormat;
  }

  setSideView(view: any): void {
    if (view) {
      window.sessionStorage.$SOS$SIDEVIEW = JSON.stringify(view);
      this.sideView = view;
    } else {
      window.sessionStorage.$SOS$SIDEVIEW = JSON.stringify(this.sideView);
    }
  }

  getSideView(): object {
    return this.sideView;
  }

  hidePanel(): void {
    const dom = $('#rightPanel');
    dom.addClass('m-l-xs fade-in');
    dom.find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
    $('#leftPanel').addClass('sidebar-hover-effect');
  }

  showLeftPanel(): void {
    const dom = $('#rightPanel');
    dom.removeClass('fade-in m-l-xs');
    dom.find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
    $('#leftPanel').removeClass('sidebar-hover-effect');
  }

  hideConfigPanel(): void {
    const dom = $('#rightPanel');
    dom.addClass('m-l-xs fade-in');
    dom.find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
    $('#xmlLeftSidePanel').addClass('sidebar-hover-effect');
  }

  showConfigPanel(): void {
    const dom = $('#rightPanel');
    dom.removeClass('fade-in m-l-xs');
    dom.find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
    $('#xmlLeftSidePanel').removeClass('sidebar-hover-effect');
  }

  prepareTree(actualData: any, isLeaf: boolean): any {
    if (actualData.folders && actualData.folders.length > 0) {
      let output = [{
        name: actualData.folders[0].path,
        path: actualData.folders[0].path,
        title: actualData.folders[0].path,
        key: actualData.folders[0].path,
        permitted: actualData.folders[0].permitted,
        isLeaf: isLeaf ? !actualData.folders[0].folders || actualData.folders[0].folders.length === 0 : false,
        children: []
      }];

      this.recursive(actualData.folders[0], output[0].children, isLeaf);
      output[0].children = sortBy(output[0].children, (i: any) => {
        return i.name.toLowerCase();
      });
      return output;
    } else {
      return [];
    }
  }

  showLogWindow(order: any, task: any, job: any, id: string, transfer: any): void {
    if (!order && !task) {
      return;
    }
    this.refreshParent();

    const preferenceObj = JSON.parse(sessionStorage.preferences);
    const controllerId = id || JSON.parse(this.authService.scheduleIds).selected;
    let url = '';

    if (order && order.historyId && order.orderId) {
      url = '?historyId=' + encodeURIComponent(order.historyId) + '&orderId=' + encodeURIComponent(order.orderId) + '&workflow=' + encodeURIComponent(order.workflow) + '&controllerId=' + controllerId;
    } else if (task && task.taskId) {
      if (transfer) {
        if (task.job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + '&controllerId=' + controllerId;
        } else if (job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + job + '&controllerId=' + controllerId;
        } else {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&controllerId=' + controllerId;
        }
      } else {
        if (task.job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + '&controllerId=' + controllerId;
        } else if (job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(job) + '&controllerId=' + controllerId;
        } else {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&controllerId=' + controllerId;
        }
      }
    } else {
      return;
    }

    if (preferenceObj.isNewWindow === 'newWindow') {
      this.newWindow = window.open('#/log2' + url, '', 'top=' + window.localStorage.log_window_y + ',' +
        'left=' + window.localStorage.log_window_x + ',innerwidth=' + window.localStorage.log_window_wt + ',' +
        'innerheight=' + window.localStorage.log_window_ht + this.windowProperties);
      setTimeout(() => {
        this.calWindowSize();
      }, 500);
    } else if (preferenceObj.isNewWindow === 'newTab') {
      window.open('#/log' + url, '_blank');
    } else {
      const data = order || task || job || transfer;
      this.downloadLog(data, controllerId);
    }
  }

  showDocumentation(document: string, preferences: any): void {
    console.log(document);
    const link = './api/documentation/show?documentation=' + encodeURIComponent(document) + '&accessToken=' + this.authService.accessTokenId;
    if (preferences.isDocNewWindow === 'newWindow') {
      window.open(link, '', 'top=0,left=0,scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no');
    } else {
      window.open(link, '_blank');
    }
  }

  parseProcessExecuted(regex: string): any {
    let date;
    if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(regex)) {
      const fromDate = new Date();
      date = new Date();
      const arr = /^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex);
      const seconds = arr && arr.length > 1 ? parseInt(arr[2], 10) : 0;
      date.setSeconds(fromDate.getSeconds() - seconds);
    } else if (/^\s*[-,+](\d+)([shdwMy])\s*$/.test(regex)) {
      date = regex;
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      date = '0d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      date = new Date();
    } else if (/^\s*[-,+](\d+)([shdwMy])\s*$/.test(regex)) {
      date = regex;
    }
    return date;
  }

  parseProcessExecutedRegex(regex: string, obj: any): any {
    let fromDate;
    let toDate;
    let date;
    let arr;
    if (/^\s*(-)\s*(\d+)([shdwMy])\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)([shdwMy])\s*$/.exec(regex);
      if (fromDate) {
        fromDate = fromDate[0];
      }
    } else if (/^\s*(now\s*-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      const arr2 = /^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex);
      const seconds = arr2 && arr2.length > 1 ? parseInt(arr2[2], 10) : 0;
      fromDate.setSeconds(toDate.getSeconds() - seconds);
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      fromDate = '0d';
      toDate = '0d';
    } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
      fromDate = '-1d';
      toDate = '-1d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
    } else if (/^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.exec(regex);
      arr = date ? date[0].split('to') : [];
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.exec(regex);
      arr = date ? date[0].split('to') : [];
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.exec(regex);
      arr = date ? date[0].split('to') : [];
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.exec(regex);
      arr = date ? date[0].split('to') : [];
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/.test(regex)) {
      const reg = /^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/i.exec(regex);
      const arr = reg ? reg[0].split('to') : [];
      const fromTime = moment(arr[0].trim(), 'HH:mm:ss:a');
      const toTime = moment(arr[1].trim(), 'HH:mm:ss:a');

      fromDate = moment.utc(fromTime);
      toDate = moment.utc(toTime);
    }
    if (fromDate) {
      obj.dateFrom = fromDate;
    }
    if (toDate) {
      obj.dateTo = toDate;
    }
    return obj;
  }

  checkCopyName(list: any, name: string): string {
    let temp = '';
    if (/.+\((\d+)\)$/.test(name)) {
      temp = name;
    } else {
      temp = name + '(1)';
    }

    function recursion(): void {
      for (let j = 0; j < list.length; j++) {
        if (list[j].name == temp) {
          temp = temp.replace(/\(\d+\)$/, '(' + (parseInt(/\((\d+)\)$/.exec(temp)[1], 10) + 1) + ')');
          recursion();
        }
      }
    }

    recursion();
    return temp;
  }

  copyLink(objType: string, name: string, workflow: string = ''): void {
    let link = '';
    const regEx = /(.+)\/#/;
    if (!regEx.test(window.location.href)) {
      return;
    }
    let host = regEx.exec(window.location.href)[1];
    host = host + '/#/';
    if (objType === 'workflow' && name) {
      link = host + 'workflows/workflow?path=' + encodeURIComponent(name);
    } else if (objType === 'order' && name) {
      link = host + 'history/order?orderId=' + encodeURIComponent(name) + '&workflow=' + encodeURIComponent(workflow);
    } else if (objType === 'lock' && name) {
      link = host + 'resources/locks/lock?name=' + encodeURIComponent(name);
    } else if (objType === 'fileTransfer' && name) {
      link = host + 'file_transfer/file_transfer?id=' + name;
    } else if (objType === 'calendar' && name) {
      link = host + 'resources/calendars/calendar?name=' + encodeURIComponent(name);
    } else if (objType === 'document' && name) {
      link = host + 'resources/documentations/documentation?name=' + encodeURIComponent(name);
    }
    if (link !== '') {
      this.clipboardService.copyFromContent(link + '&controllerId=' + JSON.parse(this.authService.scheduleIds).selected);
    }
  }

  navToInventoryTab(path: string, type: string): void {
    const config = this.getConfigurationTab();
    config.inventory.isTrash = false;
    config.inventory.expand_to = [];
    config.inventory.selectedObj = {
      name: path.substring(path.lastIndexOf('/') + 1),
      path: path.substring(0, path.lastIndexOf('/')) || '/',
      type
    };
    this.router.navigate(['/configuration/inventory']);
  }

  showWorkflow(workflow, versionId = null): void {
    this.router.navigate(['/workflows/workflow'], {
      queryParams: {
        path: workflow,
        versionId,
        controllerId: JSON.parse(this.authService.scheduleIds).selected
      }
    });
  }

  isLastEntryEmpty(list: Array<any>, key1: string, key2: string): boolean {
    let flag = false;
    if (list && list.length > 0) {
      const x = list[list.length - 1];
      if ((x[key1] !== undefined && x[key1] === '') || (x[key2] !== undefined && x[key2] === '')) {
        flag = true;
      }
      if (!flag && x.isRequired && (!x.value && x.value !== false && x.value !== 0)) {
        flag = true;
      }
    }
    return flag;
  }

  // To convert date string into moment date format
  toMomentDateFormat(date: any): any {
    return moment(date, 'DD.MM.YYYY');
  }

  // Function: get local time zone
  getTimeZone(): string {
    return moment.tz.guess();
  }

  // Function: get list of time zones
  getTimeZoneList(): any {
    return moment.tz.names();
  }

  getProtocols(): Array<string> {
    return ['LOCAL', 'FTP', 'FTPS', 'SFTP', 'HTTP', 'HTTPS', 'WEBDAV', 'WEBDAVS', 'SMB'];
  }

  refreshParent(): any {
    try {
      if (typeof this.newWindow != 'undefined' && this.newWindow != null && this.newWindow.closed == false) {
        if (this.newWindow.sessionStorage.changedPreferences) {
          if (this.newWindow.sessionStorage.controllerId === JSON.parse(this.authService.scheduleIds).selected) {
            const preferences = JSON.parse(sessionStorage.preferences);
            preferences.logFilter = JSON.parse(this.newWindow.sessionStorage.changedPreferences).logFilter;
            window.sessionStorage.preferences = JSON.stringify(preferences);
          }
        }
        this.newWindow.close();
      }
    } catch (x) {
      console.error(x);
    }
  }

  xsdAnyURIValidation(value: string): boolean {
    return /^((ht|f)tp(s?)\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/.test(value)
      || /^(?:(<protocol>http(?:s?)|ftp)(?:\:\/\/))(?:(<usrpwd>\w+\:\w+)(?:\@))?(<domain>[^/\r\n\:]+)?(<port>\:\d+)?(<path>(?:\/.*)*\/)?(<filename>.*?\.(<ext>\w{2,4}))?(<qrystr>\??(?:\w+\=[^\#]+)(?:\&?\w+\=\w+)*)*(<bkmrk>\#.{})?$/.test(value)
      || /^([a-zA-Z]\:|\\\\[^\/\\:*?"<>|]+\\[^\/\\:*?"<>|]+)(\\[^\/\\:*?"<>|]+)+(|([a-zA-Z0-9]{0,*}))$/.test(value)
      || /^((?:2[0-5]{2}|1\d{2}|[1-9]\d|[1-9])\.(?:(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d)\.){2}(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d))(:((\d|[1-9]\d|[1-9]\d{2,3}|[1-5]\d{4}|6[0-4]\d{3}|654\d{2}|655[0-2]\d|6553[0-5]))|(\d{0}))$/.test(value)
      || /^(((..\/){0,1})([A-Za-z0-9é\%]+)(\.([a-zA-Z]+((\#{0,1})([a-zA-Z]{0,})))))$/.test(value)
      || /^((mailto:){0,1}([A-Za-z0-9]{0,}(\@){0,1}([a-zA-Z0-9]{0,})(\.{0,1}(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk))))$/.test(value);
  }

  diff(data1: any, data2: any): any {
    const dmp = new diff_match_patch();
    const a = dmp.diff_main(data1, data2, false);
    let b = dmp.diff_prettyHtml(a);
    b = b.replace(/(&para;)+/gi, '');
    b = b.replace(/<br>(\s+&lt;)/gi, '$1');
    return b;
  }

  private recursive(data: any, output: any, isLeaf: boolean): void {
    if (data.folders && data.folders.length > 0) {
      for (let i = 0; i < data.folders.length; i++) {
        output.push({
          name: data.folders[i].name,
          title: data.folders[i].name,
          path: data.folders[i].path,
          key: data.folders[i].path,
          permitted: data.folders[i].permitted,
          isLeaf: isLeaf ? !data.folders[i].folders || data.folders[i].folders.length === 0 : false,
          children: []
        });
        if (data.folders[i].folders && data.folders[i].folders.length > 0) {
          this.recursive(data.folders[i], output[i].children, isLeaf);
          output[i].children = sortBy(output[i].children, (x) => {
            return x.name.toLowerCase();
          });
        }
      }
    }
  }

  downloadLog(data: any, id: string): void {
    let url = 'order/log/download';
    let obj: any;
    let name;
    if (data.historyId) {
      name = 'order-' + data.historyId + '.log';
      obj = {
        historyId: data.historyId,
        controllerId: id
      };
    } else if (data.taskId) {
      name = 'task-' + data.taskId + '.log';
      obj = {
        taskId: data.taskId,
        controllerId: id
      };
      url = 'task/log/download';
    }
    if (obj) {
      this.download(url, obj, name, (res) => {
      });
    }
  }

  private calWindowSize(): void {
    if (this.newWindow) {
      try {
        this.newWindow.addEventListener('beforeunload', () => {
          if (this.newWindow.screenX != window.localStorage.log_window_x) {
            window.localStorage.log_window_x = this.newWindow.screenX;
            window.localStorage.log_window_y = this.newWindow.screenY;
          }
          if (this.newWindow.sessionStorage.changedPreferences) {
            let preferences = JSON.parse(sessionStorage.preferences);
            preferences.logFilter = JSON.parse(this.newWindow.sessionStorage.changedPreferences).logFilter;
            window.sessionStorage.preferences = JSON.stringify(preferences);
          }
          return null;
        });
        this.newWindow.addEventListener('resize', () => {
          window.localStorage.log_window_wt = this.newWindow.innerWidth;
          window.localStorage.log_window_ht = this.newWindow.innerHeight;
          window.localStorage.log_window_x = this.newWindow.screenX;
          window.localStorage.log_window_y = this.newWindow.screenY;
        }, false);
      } catch (e) {
        console.error(e);
      }
    }
  }

  getName(list, name, key, type): string {
    if (list.length === 0) {
      return name;
    } else {
      let arr = [];
      list.forEach((element) => {
        if (element[key] && element[key].split(/(\d+)(?!.*\d)/)[1]) {
          arr.push(element[key].split(/(\d+)(?!.*\d)/)[1]);
        }
      });
      let large = 0;
      for (let i = 0; i < arr.length; i++) {
        if (large < parseInt(arr[i], 10)) {
          large = parseInt(arr[i], 10);
        }
      }
      large++;
      if (!isNumber(large) || isNaN(large)) {
        large = 0;
      }
      return (type + large);
    }
  }

  getLogDateFormat(date: any, zone: string): string {
    return moment(date).tz(zone).format('YYYY-MM-DD HH:mm:ss.SSSZ');
  }

  getDateByFormat(date: any, zone: string, format: string): string {
    if (zone) {
      return moment(date).tz(zone).format(format);
    }
    return moment(date).format(format);
  }

  getStringDate(date: any): string {
    if (!date) {
      return moment().format('YYYY-MM-DD');
    }
    return moment(date).format('YYYY-MM-DD');
  }

  convertTimeToLocalTZ(preferences: any, date: any): any {
    return moment(date).tz(preferences.zone);
  }

  getUTC(date: any): any {
    return moment.utc(date);
  }

  getDate(date: any): any {
    return moment(date);
  }

  stringToDate(preferences: any, date: any): string {
    if (!date) {
      return '-';
    }
    if (!preferences.zone) {
      return moment(date).tz(this.getTimeZone()).format('DD.MM.YYYY HH:mm:ss');
    }
    return moment(date).tz(preferences.zone).format(preferences.dateFormat);
  }

  getTimeDiff(preferences: any, date: any): number {
    if (!date) {
      return 0;
    }
    if (!preferences.zone) {
      return 0;
    }
    return moment(moment(date).tz(preferences.zone)).diff(moment());
  }

  calDuration(n: any, r: any): string {
    if (!n || !r) {
      return '-';
    }
    n = moment(n);
    r = moment(r);
    const i = moment(r).diff(n);
    if (i >= 1e3) {
      let a = parseInt((i / 1e3 % 60).toString(), 10), s = parseInt((i / 6e4 % 60).toString(), 10),
        f = parseInt((i / 36e5 % 24).toString(), 10), u = parseInt((i / 864e5).toString(), 10);
      if (u > 0) {
        if (u === 1 && f === 0) {
          return '24h ' + s + 'm ' + a + 's';
        } else {
          return u + 'd ' + f + 'h ' + s + 'm ' + a + 's';
        }
      }
      return 0 == u && 0 != f ? f + 'h ' + s + 'm ' + a + 's' : 0 == f && 0 != s ? s + 'm ' + a + 's' : 0 == u && 0 == f && 0 == s ? a + ' sec' : u + 'd ' + f + 'h ' + s + 'm ' + a + 's';
    }
    return '< 1 sec';

  }

  getTimeFromDate(t: any, tf: string): string {
    let x = 'HH:mm:ss';
    if ((tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) != null) {
      const result = (tf.match(/HH:mm:ss/gi) || tf.match(/HH:mm/gi) || tf.match(/hh:mm:ss A/gi) || tf.match(/hh:mm A/gi)) + '';
      if (result.match(/hh/g)) {
        x = result + ' a';
      } else {
        x = result;
      }
    }
    let time = moment(t).format(x);
    if (time === '00:00' || time === '00:00:00') {
      time = '24:00:00';
    }
    return time;
  }

  calRowWidth(currentView: boolean): void {
    setTimeout(() => {
      let arr = currentView != null ? [53] : [];
      if (!currentView) {
        $('#orderTable').find('thead th.dynamic-thead-o').each(function() {
          const w = $(this).outerWidth();
          arr.push(w);
        });
      }
      $('#orderTable').find('thead th.dynamic-thead').each(function() {
        const w = $(this).outerWidth();
        arr.push(w);
      });
      let count = -1;
      $('tr.tr-border').find('td').each(function(i) {
        count = count + 1;
        if (arr.length === count) {
          count = 0;
        }
        $(this).css('width', arr[count] + 'px');
      });
    }, 100);
  }

  calFileTransferRowWidth(): Array<string> {
    const arr: Array<number> = [];
    const arr2 = [];
    const dom = $('#fileTransferTable');
    dom.find('thead tr.sub-header th.dynamic-thead').each(function() {
      arr.push($(this).outerWidth());
    });

    arr2.push((arr[0] + arr[1]) + 'px');
    arr2.push((arr[2] + arr[3]) + 'px');
    arr2.push((arr[4] + arr[5]) + 'px');
    arr2.push((arr[6] + arr[7]) + 'px');
    arr2.push((arr[8]) + 'px');
    arr2.push((arr[9]) + 'px');
    arr2.push((arr[10] + arr[11]) + 'px');
    return arr2;
  }

  clone(json: any): any {
    return JSON.parse(JSON.stringify(json));
  }

  convertObjectToArray(obj: any, type: string): Array<object> {
    let arrObject: Array<any> = [];
    if (!obj[type] || isEmpty(obj[type])) {
      obj[type] = [];
    }
    if (obj[type] && !isEmpty(obj[type])) {
      arrObject = Object.entries(obj[type]).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    return arrObject;
  }

  convertArrayToObject(obj: any, type: string, isDelete: boolean): void {
    if (obj[type]) {
      if (obj[type].length > 0 && this.isLastEntryEmpty(obj[type], 'name', '')) {
        obj[type].splice(obj[type].length - 1, 1);
      }
      if (obj[type].length > 0) {
        obj[type] = this.keyValuePair(obj[type]);
      } else {
        if (isDelete) {
          delete obj[type];
        } else {
          obj[type] = {};
        }
      }
    }
  }

  keyValuePair(argu: any): any {
    return object(argu.map((val) => {
      return [val.name, val.value];
    }));
  }

  getDates(startDate: any, endDate: string): any {
    let dates = [];
    let currentDate = startDate;
    let addDays = function(days) {
      const date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  }

  removeSlashToString(data: any, type: string): void {
    if (data[type]) {
      if (data[type] === 'true' || data[type] === 'false') {
      } else if (/^\d+$/.test(data[type])) {
      } else {
        const startChar = data[type].substring(0, 1);
        if (startChar !== '$') {
          const endChar = data[type].substring(data[type].length - 1);
          let mainStr = data[type].substring(1, data[type].length - 1);
          if ((startChar === '"' && endChar === '"')) {
            if (/^\d+$/.test(mainStr)) {
              return;
            } else if (mainStr === 'true' || mainStr === 'false') {
              return;
            } else if (/^(now\()/i.test(mainStr) || /^(env\()/i.test(mainStr) || /^(scheduledOrEmpty\()/g.test(mainStr)) {
              return;
            } else if (mainStr.substring(0, 1) === '$') {
              mainStr = mainStr.substring(1, data[type].length);
              if (!mainStr.match(/[!?~'"}\[\]{@#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(mainStr) && /^(?!-)(?!.*--)/.test(mainStr) && !/\s/.test(mainStr)) {
                return;
              }
            }
          }
          try {
            data[type] = JSON.parse(data[type]);
          } catch (e) {
            if ((startChar === '"' && endChar === '"') || (startChar === "'" && endChar === "'" && (type === 'final' || type === 'default'))) {
              data[type] = mainStr;
            }
          }
        }
      }
    }
  }

  addSlashToString(data: any, type: string): void {
    if (data[type]) {
      if (data[type] === 'true' || data[type] === 'false') {
      } else if (/^\d+$/.test(data[type])) {
      } else if (/^(now\()/i.test(data[type]) || /^(env\()/i.test(data[type]) || /^(scheduledOrEmpty\()/g.test(data[type])) {
      } else {
        const startChar = data[type].substring(0, 1);
        if (startChar !== '$') {
          const endChar = data[type].substring(data[type].length - 1);
          if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {
          } else {
            data[type] = data[type].replace(/\\([\s\S])|(")/g, '\\$1$2');
            data[type] = '"' + data[type] + '"';
          }
        } else {
          const mainStr = data[type].substring(1, data[type].length);
          if (mainStr.startsWith('{') && mainStr.substring(mainStr.length - 1, mainStr.length) === '}') {
          } else {
            if (!mainStr.match(/[!?~'"}\[\]{@#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(mainStr)
              && /^(?!-)(?!.*--)/.test(mainStr) && !/\s/.test(mainStr)) {
            } else {
              data[type] = '"' + data[type] + '"';
            }
          }
        }
      }
    } else if (data[type] === '') {
      data[type] = '"' + data[type] + '"';
    }
  }
}
