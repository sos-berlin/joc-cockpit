import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../components/guard';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AboutModalComponent} from '../components/about-modal/about.component';

import * as moment from 'moment';
import * as _ from 'underscore';
import {Router} from '@angular/router';
import {ClipboardService} from 'ngx-clipboard';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService} from 'ng-zorro-antd';

declare const diff_match_patch;
declare var $;

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  tabs: any = {};
  tempTabs: any = {};
  dashboard: any = {};
  _sideView = {
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
              private clipboardService: ClipboardService, public modalService: NgbModal, private translate: TranslateService,
              private message: NzMessageService) {

    this.tabs._workflow = {};
    this.tabs._workflow.filter = {};
    this.tabs._workflow.filter.sortBy = 'name';
    this.tabs._workflow.reverse = false;
    this.tabs._workflow.searchText = '';
    this.tabs._workflow.currentPage = '1';
    this.tabs._workflow.expandedKeys = ['/'];
    this.tabs._workflow.selectedkeys = ['/'];
    this.tabs._workflow.selectedView = true;

    this.tabs._workflowDetail = {};
    this.tabs._workflowDetail.panelSize = 0;
    this.tabs._workflowDetail.panelSize2 = 450;

    this.tabs._daliyPlan = {};
    this.tabs._daliyPlan.filter = {};
    this.tabs._daliyPlan.filter.status = 'ALL';
    this.tabs._daliyPlan.filter.groupBy = 'ORDER';
    this.tabs._daliyPlan.filter.late = false;
    this.tabs._daliyPlan.filter.sortBy = 'plannedStartTime';
    this.tabs._daliyPlan.reverse = true;
    this.tabs._daliyPlan.currentPage = '1';
    this.tabs._daliyPlan.selectedView = true;
    this.tabs._daliyPlan.searchText = '';

    this.tabs._orderOverview = {};
    this.tabs._orderOverview.overview = true;
    this.tabs._orderOverview.filter = {};
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
    this.tabs._history.order.searchText = '';
    this.tabs._history.order.currentPage = '1';
    this.tabs._history.order.selectedView = true;
    this.tabs._history.task = {};
    this.tabs._history.task.filter = {};
    this.tabs._history.task.filter.historyStates = 'ALL';
    this.tabs._history.task.filter.date = 'today';
    this.tabs._history.task.filter.sortBy = 'startTime';
    this.tabs._history.task.reverse = true;
    this.tabs._history.task.searchText = '';
    this.tabs._history.task.currentPage = '1';
    this.tabs._history.task.selectedView = true;
    this.tabs._history.yade = {};
    this.tabs._history.yade.filter = {};
    this.tabs._history.yade.filter.historyStates = 'ALL';
    this.tabs._history.yade.filter.date = 'today';
    this.tabs._history.yade.filter.sortBy = 'start';
    this.tabs._history.yade.reverse = true;
    this.tabs._history.yade.searchText = '';
    this.tabs._history.yade.currentPage = '1';
    this.tabs._history.yade.selectedView = true;
    this.tabs._history.deployment = {};
    this.tabs._history.deployment.filter = {};
    this.tabs._history.deployment.filter.state = 'ALL';
    this.tabs._history.deployment.filter.date = 'today';
    this.tabs._history.deployment.filter.sortBy = 'deploymentDate';
    this.tabs._history.deployment.reverse = true;
    this.tabs._history.deployment.searchText = '';
    this.tabs._history.deployment.currentPage = '1';
    this.tabs._history.deployment.selectedView = true;
    this.tabs._history.submission = {};
    this.tabs._history.submission.filter = {};
    this.tabs._history.submission.filter.category = 'ALL';
    this.tabs._history.submission.filter.date = 'today';
    this.tabs._history.submission.filter.sortBy = 'dailyPlanDate';
    this.tabs._history.submission.reverse = true;
    this.tabs._history.submission.searchText = '';
    this.tabs._history.submission.currentPage = '1';
    this.tabs._history.submission.selectedView = true;

    this.tabs._yade = {};
    this.tabs._yade.filter = {};
    this.tabs._yade.filter.states = 'ALL';
    this.tabs._yade.filter.date = 'today';
    this.tabs._yade.filter.sortBy = 'start';
    this.tabs._yade.reverse = true;
    this.tabs._yade.searchText = '';
    this.tabs._yade.currentPage = '1';
    this.tabs._yade.selectedView = true;

    this.tabs._auditLog = {};
    this.tabs._auditLog.filter = {};
    this.tabs._auditLog.filter.historyStates = 'ALL';
    this.tabs._auditLog.filter.date = 'today';
    this.tabs._auditLog.filter.sortBy = 'created';
    this.tabs._auditLog.reverse = true;
    this.tabs._auditLog.searchText = '';
    this.tabs._auditLog.currentPage = '1';

    this.tabs._resource = {};
    this.tabs._resource.agents = {};
    this.tabs._resource.agents.filter = {};
    this.tabs._resource.agents.filter.state = 'ALL';
    this.tabs._resource.agents.filter.sortBy = 'path';
    this.tabs._resource.agents.reverse = false;
    this.tabs._resource.agents.searchText = '';
    this.tabs._resource.agents.currentPage = '1';
    this.tabs._resource.agentJobExecution = {};
    this.tabs._resource.agentJobExecution.filter = {};
    this.tabs._resource.agentJobExecution.filter.date = 'today';
    this.tabs._resource.agentJobExecution.filter.sortBy = 'agent';
    this.tabs._resource.agentJobExecution.reverse = false;
    this.tabs._resource.agentJobExecution.searchText = '';
    this.tabs._resource.agentJobExecution.currentPage = '1';
    this.tabs._resource.locks = {};
    this.tabs._resource.locks.filter = {};
    this.tabs._resource.locks.filter.state = 'ALL';
    this.tabs._resource.locks.filter.sortBy = 'name';
    this.tabs._resource.locks.reverse = false;
    this.tabs._resource.locks.searchText = '';
    this.tabs._resource.locks.currentPage = '1';
    this.tabs._resource.locks.expandedKeys = ['/'];
    this.tabs._resource.locks.selectedkeys = ['/'];
    this.tabs._resource.calendars = {};
    this.tabs._resource.calendars.filter = {};
    this.tabs._resource.calendars.filter.type = 'ALL';
    this.tabs._resource.calendars.filter.sortBy = 'name';
    this.tabs._resource.calendars.reverse = false;
    this.tabs._resource.calendars.searchText = '';
    this.tabs._resource.calendars.currentPage = '1';
    this.tabs._resource.calendars.expandedKeys = ['/'];
    this.tabs._resource.calendars.selectedkeys = ['/'];
    this.tabs._resource.documents = {};
    this.tabs._resource.documents.filter = {};
    this.tabs._resource.documents.filter.type = 'ALL';
    this.tabs._resource.documents.filter.sortBy = 'path';
    this.tabs._resource.documents.reverse = false;
    this.tabs._resource.documents.searchText = '';
    this.tabs._resource.documents.currentPage = '1';
    this.tabs._resource.documents.expandedKeys = ['/'];
    this.tabs._resource.documents.selectedkeys = ['/'];
    this.tabs._resource.documents.selectedView = true;
    this.tabs._resource.state = 'agent';

    this.tabs._configuration = {};
    this.tabs._configuration.state = 'inventory';
    this.tabs._configuration.inventory = {};
    this.tabs._configuration.inventory.deployedMessages = [];

    this.tempTabs._workflow = {};
    this.tempTabs._workflow.filter = {};
    this.tempTabs._workflow.filter.sortBy = 'name';
    this.tempTabs._workflow.reverse = false;
    this.tempTabs._workflow.currentPage = '1';
    this.tempTabs._workflow.expandedKeys = ['/'];
    this.tempTabs._workflow.selectedkeys = ['/'];
    this.tempTabs._workflow.selectedView = true;
    this.tempTabs._workflow.showTaskPanel = undefined;

    this.tempTabs._workflowDetail = {};
    this.tempTabs._workflowDetail.panelSize = 0;
    this.tempTabs._workflowDetail.panelSize2 = 450;

    this.tempTabs._daliyPlan = {};
    this.tempTabs._daliyPlan.filter = {};
    this.tempTabs._daliyPlan.filter.status = 'ALL';
    this.tempTabs._daliyPlan.filter.groupBy = 'ORDER';
    this.tempTabs._daliyPlan.filter.late = false;
    this.tempTabs._daliyPlan.filter.sortBy = 'processedPlanned';
    this.tempTabs._daliyPlan.reverse = true;
    this.tempTabs._daliyPlan.currentPage = '1';
    this.tempTabs._daliyPlan.selectedView = true;
    this.tempTabs._daliyPlan.searchText = '';

    this.tempTabs._orderOverview = {};
    this.tempTabs._orderOverview.overview = true;
    this.tempTabs._orderOverview.filter = {};
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
    this.tempTabs._history.yade.filter.historyStates = 'ALL';
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
    this.tempTabs._history.deployment.searchText = '';
    this.tempTabs._history.deployment.currentPage = '1';
    this.tempTabs._history.deployment.selectedView = true;
    this.tempTabs._history.submission = {};
    this.tempTabs._history.submission.filter = {};
    this.tempTabs._history.submission.filter.category = 'ALL';
    this.tempTabs._history.submission.filter.date = 'today';
    this.tempTabs._history.submission.filter.sortBy = 'dailyPlanDate';
    this.tempTabs._history.submission.reverse = true;
    this.tempTabs._history.submission.searchText = '';
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
    this.tempTabs._resource.agents.searchText = '';
    this.tempTabs._resource.agents.currentPage = '1';
    this.tempTabs._resource.agentJobExecution = {};
    this.tempTabs._resource.agentJobExecution.filter = {};
    this.tempTabs._resource.agentJobExecution.filter.date = 'today';
    this.tempTabs._resource.agentJobExecution.filter.sortBy = 'agent';
    this.tempTabs._resource.agentJobExecution.reverse = false;
    this.tempTabs._resource.agentJobExecution.currentPage = '1';
    this.tempTabs._resource.locks = {};
    this.tempTabs._resource.locks.filter = {};
    this.tempTabs._resource.locks.filter.state = 'ALL';
    this.tempTabs._resource.locks.filter.sortBy = 'name';
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
    this.tempTabs._resource.documents.filter.sortBy = 'path';
    this.tempTabs._resource.documents.reverse = false;
    this.tempTabs._resource.documents.searchText = '';
    this.tempTabs._resource.documents.currentPage = '1';
    this.tempTabs._resource.documents.expandedKeys = ['/'];
    this.tempTabs._resource.documents.selectedkeys = ['/'];
    this.tempTabs._resource.documents.selectedView = true;
    this.tempTabs._resource.state = 'agent';

    this.tempTabs._configuration = {};
    this.tempTabs._configuration.state = 'inventory';
    this.tempTabs._configuration.inventory = {};
    this.tempTabs._configuration.inventory.deployedMessages = [];

    this.dashboard._dashboard = {};
    this.dashboard._dashboard.order = {};
    this.dashboard._dashboard.task = {};
    this.dashboard._dashboard.file = {};

    this.dashboard._dashboard.dailyplan = '0d';
    this.dashboard._dashboard.order.date = '0d';
    this.dashboard._dashboard.order.label = 'filters.button.today';
    this.dashboard._dashboard.task.date = '0d';
    this.dashboard._dashboard.task.label = 'filters.button.today';
    this.dashboard._dashboard.file.date = '0d';
    this.dashboard._dashboard.file.label = 'filters.button.today';

    if (localStorage.$SOS$DASHBOARDTABS) {
      try {
        let obj = JSON.parse(localStorage.$SOS$DASHBOARDTABS);
        if (obj && obj.order) {
          this.dashboard = obj;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!sessionStorage.$SOS$SIDEVIEW || typeof JSON.parse(sessionStorage.$SOS$SIDEVIEW) !== 'object') {
      sessionStorage.$SOS$SIDEVIEW = JSON.stringify(this._sideView);
    } else {
      this._sideView = JSON.parse(sessionStorage.$SOS$SIDEVIEW);
    }
  }

  setDefaultTab() {
    this.tabs = this.tempTabs;
  }

  setTabs(tempTabs) {
    this.tabs = tempTabs;
  }

  getTabs() {
    return this.tabs;
  }

  getDashboard() {
    return this.dashboard;
  }

  getWorkflowTab() {
    return this.tabs._workflow;
  }

  getWorkflowDetailTab() {
    return this.tabs._workflowDetail;
  }

  getDailyPlanTab() {
    return this.tabs._daliyPlan;
  }

  getHistoryTab() {
    return this.tabs._history;
  }

  getOrderOverviewTab() {
    return this.tabs._orderOverview;
  }

  getDashboardTab() {
    return this.dashboard._dashboard;
  }

  getResourceTab() {
    return this.tabs._resource;
  }

  getConfigurationTab() {
    return this.tabs._configuration;
  }

  getAuditLogTab() {
    return this.tabs._auditLog;
  }

  getYadeTab() {
    return this.tabs._yade;
  }

  get(url) {
    return this.http.get<any>(url);
  }

  post(url, object) {
    return this.http.post(url, object);
  }

  log(url, object, headers) {
    return this.http.post(url, object, headers);
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
      return type === 'text' ? 'magenta' : type === 'border' ? 'magenta-box' : 'bg-magenta';
    } else if (d === 8) {
      return type === 'text' ? 'yellow-green' : type === 'border' ? 'yellow-green-box' : 'bg-yellow-green';
    } else if (d === 9) {
      return type === 'text' ? 'chocolate' : type === 'border' ? 'chocolate-box' : 'bg-chocolate';
    }
  }

  getDateFormat(dateFormat): string {
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

  getTimeFormat(timeFormat: string): string {
    if (!timeFormat) {
      return '';
    }
    if ((timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) != null) {
      const result = (timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) + '';
      if (result.match(/hh/g)) {
        return result + ' a';
      } else {
        return result;
      }
    }
  }

  setSideView(view) {
    if (view) {
      window.sessionStorage.$SOS$SIDEVIEW = JSON.stringify(view);
      this._sideView = view;
    } else {
      window.sessionStorage.$SOS$SIDEVIEW = JSON.stringify(this._sideView);
    }
  }

  getSideView() {
    return this._sideView;
  }

  hidePanel() {
    const dom = $('#rightPanel');
    dom.addClass('m-l-xs fade-in');
    dom.find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
    $('#leftPanel').addClass('sidebar-hover-effect');
  }

  showLeftPanel() {
    const dom = $('#rightPanel');
    dom.removeClass('fade-in m-l-xs');
    dom.find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
    $('#leftPanel').removeClass('sidebar-hover-effect');
  }

  hideConfigPanel() {
    const dom = $('#rightPanel');
    dom.addClass('m-l-xs fade-in');
    dom.find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
    $('#xmlLeftSidePanel').addClass('sidebar-hover-effect');
  }

  showConfigPanel() {
    const dom = $('#rightPanel');
    dom.removeClass('fade-in m-l-xs');
    dom.find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
    $('#xmlLeftSidePanel').removeClass('sidebar-hover-effect');
  }

  prepareTree(actualData, isLeaf): any {
    if (actualData.folders && actualData.folders.length > 0) {
      let output = [{
        name: actualData.folders[0].path,
        path: actualData.folders[0].path,
        title: actualData.folders[0].path,
        key: actualData.folders[0].path,
        deleted: actualData.folders[0].deleted,
        isLeaf: isLeaf ? !actualData.folders[0].folders || actualData.folders[0].folders.length === 0 : false,
        children: []
      }];

      this.recursive(actualData.folders[0], output[0].children, isLeaf);
      output[0].children = _.sortBy(output[0].children, function (i) {
        return i.name.toLowerCase();
      });
      return output;
    } else {
      return [];
    }
  }

  isIE() {
    return !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
  }

  isFF() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  }

  isChrome() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  }

  showLogWindow(order, task, job, id, transfer) {
    if (!order && !task) {
      return;
    }
    this.refreshParent();

    const preferenceObj = JSON.parse(sessionStorage.preferences);
    const schedulerId = id || JSON.parse(this.authService.scheduleIds).selected;
    let url = '';

    if (order && order.historyId && order.orderId) {
      url = '?historyId=' + encodeURIComponent(order.historyId) + '&orderId=' + encodeURIComponent(order.orderId) + '&workflow=' + encodeURIComponent(order.workflow) + '&schedulerId=' + schedulerId;
    } else if (task && task.taskId) {
      if (transfer) {
        if (task.job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + '&schedulerId=' + schedulerId;
        } else if (job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + job + '&schedulerId=' + schedulerId;
        } else {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&schedulerId=' + schedulerId;
        }
      } else {
        if (task.job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + '&schedulerId=' + schedulerId;
        } else if (job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(job) + '&schedulerId=' + schedulerId;
        } else {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&schedulerId=' + schedulerId;
        }
      }
    } else {
      return;
    }

    if (preferenceObj.isNewWindow === 'newWindow') {
      this.newWindow = window.open('#/log2' + url, '', 'top=' + window.localStorage.log_window_y + ',' +
        'left=' + window.localStorage.log_window_x + ',innerwidth=' + window.localStorage.log_window_wt + ',' +
        'innerheight=' + window.localStorage.log_window_ht + this.windowProperties, true);
      setTimeout(() => {
        this.calWindowSize();
      }, 500);
    } else if (preferenceObj.isNewWindow === 'newTab') {
      window.open('#/log' + url, '_blank');
    } else {
      let data = order || task || job || transfer;
      this.downloadLog(data, schedulerId);
    }
  }

  parseProcessExecuted(regex): any {
    let date;
    if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(regex)) {
      let fromDate = new Date();
      date = new Date();
      let seconds = parseInt(/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex)[2], 10);
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

  parseProcessExecutedRegex(regex, obj): any {
    let fromDate, toDate, date, arr;
    if (/^\s*(-)\s*(\d+)([shdwMy])\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)([shdwMy])\s*$/.exec(regex)[0];
    } else if (/^\s*(now\s*-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      let seconds = parseInt(/^\s*(now\s*-)\s*(\d+)\s*$/i.exec(regex)[2], 10);
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
    } else if (/^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*to\s*(-)(\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();
    } else if (/^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/.test(regex)) {
      let reg = /^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/i.exec(regex);
      let arr = reg[0].split('to');
      let fromTime = moment(arr[0].trim(), 'HH:mm:ss:a');
      let toTime = moment(arr[1].trim(), 'HH:mm:ss:a');

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

  mergeHostAndProtocol(hosts, protocols) {
    let arr = [];
    if (protocols.length < hosts.length) {
      hosts.forEach((value, index) => {
        if (protocols.length > 0) {
          if (protocols.length < hosts.length) {
            if (protocols.length == 1) {
              arr.push({host: value, protocol: protocols[0]});
            } else {
              for (let x = 0; x < protocols.length; x++) {
                if (protocols.length >= index) {
                  arr.push({host: value, protocol: protocols[index]});
                }
                break;
              }
            }
          }
        } else {
          arr.push({host: value});
        }

      });
    } else if (protocols.length > hosts.length) {
      protocols.forEach((value, index) => {
        if (hosts.length > 0) {
          if (hosts.length < protocols.length) {
            if (hosts.length == 1) {
              arr.push({protocol: value, host: hosts[0]});
            } else {
              for (let x = 0; x < hosts.length; x++) {
                if (hosts.length >= index) {
                  arr.push({protocol: value, host: hosts[index]});
                }
                break;
              }
            }

          }
        } else {
          arr.push({protocol: value});
        }

      });
    } else {
      hosts.forEach((value, index) => {
        for (let x = 0; x < protocols.length; x++) {
          arr.push({host: value, protocol: protocols[x]});
          protocols.splice(index, 1);
          break;
        }
      });
    }
    return arr;
  }

  checkCopyName(list: any, name: string): string {
    let _temp = '';
    if (/.+\((\d+)\)$/.test(name)) {
      _temp = name;
    } else {
      _temp = name + '(1)';
    }

    function recursion() {
      for (let j = 0; j < list.length; j++) {
        if (list[j].name == _temp) {
          _temp = _temp.replace(/\(\d+\)$/, '(' + (parseInt(/\((\d+)\)$/.exec(_temp)[1], 10) + 1) + ')');
          recursion();
        }
      }
    }

    recursion();
    return _temp;
  }

  copyLink(objType, path) {
    let link = '';
    const regEx = /(.+)\/#/;
    if (!regEx.test(window.location.href)) {
      return;
    }
    let host = regEx.exec(window.location.href)[1];
    host = host + '/#/';

    if (objType === 'workflow' && path) {
      link = host + 'workflows/workflow?path=' + encodeURIComponent(path);
    } else if (objType === 'order' && path) {
      link = host + 'order?orderId=' + encodeURIComponent(path);
    } else if (objType === 'lock' && path) {
      link = host + 'resources/locks/lock?path=' + encodeURIComponent(path);
    } else if (objType === 'fileTransfer' && path) {
      link = host + 'file_transfer?id=' + encodeURIComponent(path);
    } else if (objType === 'calendar' && path) {
      link = host + 'resources/calendars/calendar?path=' + encodeURIComponent(path);
    } else if (objType === 'document' && path) {
      link = host + 'resources/documentations/documentation?path=' + encodeURIComponent(path);
    }
    if (link !== '') {
      this.clipboardService.copyFromContent(link + '&scheduler_id=' + JSON.parse(this.authService.scheduleIds).selected);
      let msg;
      this.translate.get('common.message.copied').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.message.success(msg);
    }
  }

  showWorkflow(workflow) {
    let pathArr = [];
    let arr = workflow.split('/');
    let workflowFilters = this.getWorkflowTab();
    workflowFilters.selectedkeys = [];
    let len = arr.length - 1;
    if (len > 1) {
      for (let i = 0; i < len; i++) {
        if (arr[i]) {
          if (i > 0 && pathArr[i - 1]) {
            pathArr.push(pathArr[i - 1] + (pathArr[i - 1] === '/' ? '' : '/') + arr[i]);
          } else {
            pathArr.push('/' + arr[i]);
          }
        } else {
          pathArr.push('/');
        }
      }
    }
    if (pathArr.length === 0) {
      pathArr.push('/');
    }
    workflowFilters.expandedKeys = pathArr;
    workflowFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
    this.router.navigate(['/workflows']);
  }

  isLastEntryEmpty(list, key1, key2): boolean {
    let flag = false;
    if (list && list.length > 0) {
      const x = list[list.length - 1];
      if ((x[key1] !== undefined && x[key1] === '') || (x[key2] !== undefined && x[key2] === '')) {
        flag = true;
      }
    }
    return flag;
  }

  about() {
    this.get('version.json').subscribe((data) => {
      const modalRef = this.modalService.open(AboutModalComponent, {
        backdrop: 'static'
      });
      modalRef.componentInstance.versionData = data;
      modalRef.result.then(() => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

  // To convert date string into moment date format
  toMomentDateFormat(date) {
    return moment(date, 'DD.MM.YYYY');
  }

  getProtocols() {
    return ['LOCAL', 'FTP', 'FTPS', 'SFTP', 'HTTP', 'HTTPS', 'WEBDAV', 'WEBDAVS', 'SMB'];
  }

  refreshParent() {
    try {
      if (typeof this.newWindow != 'undefined' && this.newWindow != null && this.newWindow.closed == false) {
        if (this.newWindow.sessionStorage.changedPreferences) {
          let preferences = JSON.parse(sessionStorage.preferences);
          preferences.logFilter = JSON.parse(this.newWindow.sessionStorage.changedPreferences).logFilter;
          window.sessionStorage.preferences = JSON.stringify(preferences);
        }
        this.newWindow.close();
      }
    } catch (x) {
      console.error(x);
    }
  }

  xsdAnyURIValidation(value) {
    return /^((ht|f)tp(s?)\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/.test(value)
      || /^(?:(<protocol>http(?:s?)|ftp)(?:\:\/\/))(?:(<usrpwd>\w+\:\w+)(?:\@))?(<domain>[^/\r\n\:]+)?(<port>\:\d+)?(<path>(?:\/.*)*\/)?(<filename>.*?\.(<ext>\w{2,4}))?(<qrystr>\??(?:\w+\=[^\#]+)(?:\&?\w+\=\w+)*)*(<bkmrk>\#.{})?$/.test(value)
      || /^([a-zA-Z]\:|\\\\[^\/\\:*?"<>|]+\\[^\/\\:*?"<>|]+)(\\[^\/\\:*?"<>|]+)+(|([a-zA-Z0-9]{0,*}))$/.test(value)
      || /^((?:2[0-5]{2}|1\d{2}|[1-9]\d|[1-9])\.(?:(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d)\.){2}(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d))(:((\d|[1-9]\d|[1-9]\d{2,3}|[1-5]\d{4}|6[0-4]\d{3}|654\d{2}|655[0-2]\d|6553[0-5]))|(\d{0}))$/.test(value)
      || /^(((..\/){0,1})([A-Za-z0-9é\%]+)(\.([a-zA-Z]+((\#{0,1})([a-zA-Z]{0,})))))$/.test(value)
      || /^((mailto:){0,1}([A-Za-z0-9]{0,}(\@){0,1}([a-zA-Z0-9]{0,})(\.{0,1}(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk))))$/.test(value);
  }

  diff(data1, data2) {
    const dmp = new diff_match_patch();
    const a = dmp.diff_main(data1, data2, false);
    let b = dmp.diff_prettyHtml(a);
    b = b.replace(/(&para;)+/gi, '');
    b = b.replace(/<br>(\s+&lt;)/gi, '$1');
    return b;
  }

  private recursive(data, output, isLeaf) {
    if (data.folders && data.folders.length > 0) {
      for (let i = 0; i < data.folders.length; i++) {
        output.push({
          name: data.folders[i].name,
          title: data.folders[i].name,
          path: data.folders[i].path,
          key: data.folders[i].path,
          deleted: data.folders[i].deleted,
          isLeaf: isLeaf ? !data.folders[i].folders || data.folders[i].folders.length === 0 : false,
          children: []
        });
        if (data.folders[i].folders && data.folders[i].folders.length > 0) {
          this.recursive(data.folders[i], output[i].children, isLeaf);
          output[i].children = _.sortBy(output[i].children, function (x) {
            return x.name.toLowerCase();
          });
        }
      }
    }
  }

  private downloadLog(data, id) {
    if (data.historyId) {
      $('#tmpFrame').attr('src', './api/order/log/download?controllerId=' + id + '&historyId=' + data.historyId +
        '&accessToken=' + this.authService.accessTokenId);
    } else if (data.taskId) {
      $('#tmpFrame').attr('src', './api/task/log/download?&controllerId=' + id + '&taskId=' + data.taskId +
        '&accessToken=' + this.authService.accessTokenId);
    }
  }

  private calWindowSize() {
    if (this.newWindow) {
      try {
        this.newWindow.addEventListener('beforeunload', () => {
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

  getName(list, name, key, type) {
    if (list.length === 0) {
      return name;
    } else {
      let arr = [];
      list.forEach(function (element) {
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
      if (!_.isNumber(large) || isNaN(large)) {
        large = 0;
      }
      return (type + large);
    }
  }

  getCopyName(actual_name, list): string {
    let str = actual_name;
    for (let i = 0; i < list.length; i++) {
      if (list[i].name == actual_name) {
        str = str + '_copy_1'
        break;
      }
    }
    function recursivelyCheck(name) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].name == name) {
          if (name.match(/_copy_[0-9]+/)) {
            const arr = name.split('copy_');
            let x = arr[arr.length - 1];
            const num = parseInt(x, 10) || 0;
            str = name.substring(0, name.lastIndexOf('_copy')) + '_copy' + '_' + (num + 1);
            recursivelyCheck(str);
          }
          break;
        }
      }
    }

    recursivelyCheck(str);
    return str;
  }

  stringToDate(preferences, date) {
    if (!date) {
      return '-';
    }

    if (!preferences.zone) {
      return;
    }
    return moment(date).tz(preferences.zone).format(preferences.dateFormat);
  }

  calDuration(n: any, r: any): string {
    if (!n || !r) return '-';
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

  getTimeFromDate(t, tf: string): string {
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

  calRowWidth(currentView) {
    setTimeout(() => {
      let arr = [53];
      if (!currentView) {
        $('#orderTable').find('thead th.dynamic-thead-o').each(function () {
          const w = $(this).outerWidth();
          arr.push(w);
        });
      }
      $('#orderTable').find('thead th.dynamic-thead').each(function () {
        const w = $(this).outerWidth();
        arr.push(w);
      });
      let count = -1;
      $('tr.tr-border').find('td').each(function (i) {
        count = count + 1;
        if (arr.length === count) {
          count = 0;
        }
        const w = $(this).outerWidth();
        $(this).css('width', arr[count] + 'px');
      });
    }, 100);
  }

  clone(json): any {
    return JSON.parse(JSON.stringify(json));
  }
}
