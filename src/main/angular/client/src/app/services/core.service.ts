import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../components/guard';
import {AboutModalComponent} from '../components/about-modal/about.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'underscore';

declare var $;

@Injectable()
export class CoreService {

  _view = 'grid';
  _sideView = false;
  tabs: any = {};
  tempTabs: any = {};
  dashboard: any = {};
  newWindow: any;
  windowProperties: any = ',scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no';

  constructor(private http: HttpClient, private authService: AuthService, public modalService: NgbModal) {

    this.tabs._job = {};
    this.tabs._job.filter = {};
    this.tabs._job.filter.state = 'ALL';
    this.tabs._job.filter.type = 'ALL';
    this.tabs._job.filter.sortBy = 'name';
    this.tabs._job.reverse = false;
    this.tabs._job.searchText = '';
    this.tabs._job.currentPage = '1';
    this.tabs._job.expand_to = [];
    this.tabs._job.selectedView = true;
    this.tabs._job.showTaskPanel = undefined;

    this.tabs._daliyPlan = {};
    this.tabs._daliyPlan.filter = {};
    this.tabs._daliyPlan.filter.status = 'ALL';
    this.tabs._daliyPlan.filter.groupBy = 'ORDER';
    this.tabs._daliyPlan.filter.state = '';
    this.tabs._daliyPlan.filter.sortBy = 'plannedStartTime';
    this.tabs._daliyPlan.filter.range = 'today';
    this.tabs._daliyPlan.reverse = false;
    this.tabs._daliyPlan.reverse = false;
    this.tabs._daliyPlan.currentPage = '1';
    this.tabs._daliyPlan.selectedView = true;
    this.tabs._daliyPlan.searchText = '';

    this.tabs._order = {};
    this.tabs._order.filter = {};
    this.tabs._order.filter.state = 'ALL';
    this.tabs._order.filter.sortBy = 'orderId';
    this.tabs._order.reverse = false;
    this.tabs._order.searchText = '';
    this.tabs._order.currentPage = '1';
    this.tabs._order.expand_to = [];
    this.tabs._order.selectedView = true;
    this.tabs._order.showLogPanel = undefined;

    this.tabs._order1 = {};
    this.tabs._order1.filter = {};
    this.tabs._order1.filter.sortBy = 'orderId';
    this.tabs._order1.reverse = false;

    this.tabs._orderDetail = {};
    this.tabs._orderDetail.overview = true;
    this.tabs._orderDetail.filter = {};
    this.tabs._orderDetail.filter.sortBy = 'orderId';
    this.tabs._orderDetail.reverse = false;
    this.tabs._orderDetail.currentPage = '1';
    this.tabs._orderDetail.pageView = 'grid';
    this.tabs._orderDetail.showErrorNodes = true;
    this.tabs._orderDetail.fitToScreen = false;
    this.tabs._orderDetail.showLogPanel = undefined;

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

    this.tabs._yade = {};
    this.tabs._yade.filter = {};
    this.tabs._yade.filter.states = 'ALL';
    this.tabs._yade.filter.date = 'today';
    this.tabs._yade.filter.sortBy = 'start';
    this.tabs._yade.reverse = true;
    this.tabs._yade.searchText = '';
    this.tabs._yade.currentPage = '1';
    this.tabs._yade.selectedView = true;

    this.tabs._yadeDetail = {};
    this.tabs._yadeDetail.overview = true;
    this.tabs._yadeDetail.filter = {};
    this.tabs._yadeDetail.filter.sortBy = 'orderId';
    this.tabs._yadeDetail.reverse = false;
    this.tabs._yadeDetail.currentPage = '1';
    this.tabs._yadeDetail.pageView = 'grid';

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
    this.tabs._resource.agents.expand_to = [];
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
    this.tabs._resource.locks.expand_to = [];
    this.tabs._resource.processClasses = {};
    this.tabs._resource.processClasses.filter = {};
    this.tabs._resource.processClasses.filter.state = 'ALL';
    this.tabs._resource.processClasses.filter.sortBy = 'name';
    this.tabs._resource.processClasses.reverse = false;
    this.tabs._resource.processClasses.searchText = '';
    this.tabs._resource.processClasses.currentPage = '1';
    this.tabs._resource.processClasses.expand_to = [];
    this.tabs._resource.calendars = {};
    this.tabs._resource.calendars.filter = {};
    this.tabs._resource.calendars.filter.type = 'ALL';
    this.tabs._resource.calendars.filter.sortBy = 'name';
    this.tabs._resource.calendars.reverse = false;
    this.tabs._resource.calendars.searchText = '';
    this.tabs._resource.calendars.currentPage = '1';
    this.tabs._resource.calendars.expand_to = [];
    this.tabs._resource.documents = {};
    this.tabs._resource.documents.filter = {};
    this.tabs._resource.documents.filter.type = 'ALL';
    this.tabs._resource.documents.filter.sortBy = 'path';
    this.tabs._resource.documents.reverse = false;
    this.tabs._resource.documents.searchText = '';
    this.tabs._resource.documents.currentPage = '1';
    this.tabs._resource.documents.selectedView = true;
    this.tabs._resource.state = 'agent';

    this.tabs._configuration = {};
    this.tabs._configuration.state = 'joe';

    this.tempTabs._job = {};
    this.tempTabs._job.filter = {};
    this.tempTabs._job.filter.state = 'ALL';
    this.tempTabs._job.filter.type = 'ALL';
    this.tempTabs._job.filter.sortBy = 'name';
    this.tempTabs._job.reverse = false;
    this.tempTabs._job.currentPage = '1';
    this.tempTabs._job.expand_to = [];
    this.tempTabs._job.selectedView = true;
    this.tempTabs._job.showTaskPanel = undefined;

    this.tempTabs._daliyPlan = {};
    this.tempTabs._daliyPlan.filter = {};
    this.tempTabs._daliyPlan.filter.status = 'ALL';
    this.tempTabs._daliyPlan.filter.groupBy = 'ORDER';
    this.tempTabs._daliyPlan.filter.state = '';
    this.tempTabs._daliyPlan.filter.sortBy = 'processedPlanned';
    this.tempTabs._daliyPlan.filter.range = 'today';
    this.tempTabs._daliyPlan.range = 'period';
    this.tempTabs._daliyPlan.reverse = false;
    this.tempTabs._daliyPlan.currentPage = '1';
    this.tempTabs._daliyPlan.selectedView = true;
    this.tempTabs._daliyPlan.searchText = '';

    this.tempTabs._order = {};
    this.tempTabs._order.filter = {};
    this.tempTabs._order.filter.state = 'ALL';
    this.tempTabs._order.filter.sortBy = 'orderId';
    this.tempTabs._order.reverse = false;
    this.tempTabs._order.currentPage = '1';
    this.tempTabs._order.expand_to = [];
    this.tempTabs._order.selectedView = true;
    this.tempTabs._order.showLogPanel = undefined;

    this.tempTabs._order1 = {};
    this.tempTabs._order1.filter = {};
    this.tempTabs._order1.filter.sortBy = 'orderId';
    this.tempTabs._order1.reverse = false;

    this.tempTabs._orderDetail = {};
    this.tempTabs._orderDetail.overview = true;
    this.tempTabs._orderDetail.filter = {};
    this.tempTabs._orderDetail.filter.sortBy = 'orderId';
    this.tempTabs._orderDetail.reverse = false;
    this.tempTabs._orderDetail.currentPage = '1';
    this.tempTabs._orderDetail.pageView = 'grid';
    this.tempTabs._orderDetail.showErrorNodes = true;
    this.tempTabs._orderDetail.fitToScreen = false;

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

    this.tempTabs._yade = {};
    this.tempTabs._yade.filter = {};
    this.tempTabs._yade.filter.states = 'ALL';
    this.tempTabs._yade.filter.date = 'today';
    this.tempTabs._yade.filter.sortBy = 'start';
    this.tempTabs._yade.reverse = true;
    this.tempTabs._yade.currentPage = '1';
    this.tempTabs._yade.selectedView = true;

    this.tempTabs._yadeDetail = {};
    this.tempTabs._yadeDetail.overview = true;
    this.tempTabs._yadeDetail.filter = {};
    this.tempTabs._yadeDetail.filter.sortBy = 'orderId';
    this.tempTabs._yadeDetail.reverse = false;
    this.tempTabs._yadeDetail.currentPage = '1';
    this.tempTabs._yadeDetail.pageView = 'grid';


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
    this.tempTabs._resource.agents.expand_to = [];
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
    this.tempTabs._resource.locks.expand_to = [];
    this.tempTabs._resource.processClasses = {};
    this.tempTabs._resource.processClasses.filter = {};
    this.tempTabs._resource.processClasses.filter.state = 'ALL';
    this.tempTabs._resource.processClasses.filter.sortBy = 'name';
    this.tempTabs._resource.processClasses.reverse = false;
    this.tempTabs._resource.processClasses.currentPage = '1';
    this.tempTabs._resource.processClasses.expand_to = [];
    this.tempTabs._resource.calendars = {};
    this.tempTabs._resource.calendars.filter = {};
    this.tempTabs._resource.calendars.filter.type = 'ALL';
    this.tempTabs._resource.calendars.filter.sortBy = 'name';
    this.tempTabs._resource.calendars.reverse = false;
    this.tempTabs._resource.calendars.currentPage = '1';
    this.tempTabs._resource.calendars.expand_to = [];
    this.tempTabs._resource.documents = {};
    this.tempTabs._resource.documents.filter = {};
    this.tempTabs._resource.documents.filter.type = 'ALL';
    this.tempTabs._resource.documents.filter.sortBy = 'path';
    this.tempTabs._resource.documents.reverse = false;
    this.tempTabs._resource.documents.searchText = '';
    this.tempTabs._resource.documents.currentPage = '1';
    this.tempTabs._resource.documents.selectedView = true;
    this.tempTabs._resource.state = 'agent';

    this.tempTabs._configuration = {};
    this.tempTabs._configuration.state = 'joe';

    this.dashboard._dashboard = {};
    this.dashboard._dashboard.order = {};
    this.dashboard._dashboard.task = {};
    this.dashboard._dashboard.file = {};

    this.dashboard._dashboard.dailyplan = '0d';

    this.dashboard._dashboard.order.date = '0d';
    this.dashboard._dashboard.order.label = 'button.today';

    this.dashboard._dashboard.task.date = '0d';
    this.dashboard._dashboard.task.label = 'button.today';

    this.dashboard._dashboard.file.date = '0d';
    this.dashboard._dashboard.file.label = 'button.today';

    if (localStorage.$SOS$DASHBOARDTABS) {
      try {
        let obj = JSON.parse(localStorage.$SOS$DASHBOARDTABS);
        if (obj && obj.order) {
          this.dashboard = obj;
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (sessionStorage.$SOS$VIEW) {
      this._view = sessionStorage.$SOS$VIEW;
    } else {
      sessionStorage.$SOS$VIEW = 'grid';
    }

    if (sessionStorage.$SOS$SIDEVIEW == 'true' || sessionStorage.$SOS$SIDEVIEW == true) {
      this._sideView = sessionStorage.$SOS$SIDEVIEW;
    } else {
      sessionStorage.$SOS$SIDEVIEW = false;
    }
  }

  setView(view) {
    sessionStorage.$SOS$VIEW = view;
    this._view = view;
  }

  getView() {
    return this._view;
  }

  setSideView(view) {
    sessionStorage.$SOS$SIDEVIEW = view;
    this._sideView = view;
  }

  getSideView() {
    return !this._sideView;
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

  getJobTab() {
    return this.tabs._job;
  }

  getDailyPlanTab() {
    return this.tabs._daliyPlan;
  }


  getOrderTab() {
    return this.tabs._order;
  }

  getOrderTab1() {
    return this.tabs._order1;
  }

  getOrderDetailTab() {
    return this.tabs._orderDetail;
  }

  getHistoryTab() {
    return this.tabs._history;
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

  getYadeDetailTab() {
    return this.tabs._yadeDetail;
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
      return type === 'text' ? 'crimson' : type === 'border' ? 'crimson-box' : 'bg-crimson';
    } else if (d === 3) {
      return type === 'text' ? 'dimgrey' : type === 'border' ? 'dimgrey-box' : 'bg-dimgrey';
    } else if (d === 4) {
      return type === 'text' ? 'text-dark' : type === 'border' ? 'text-dark-box' : 'bg-transparent';
    } else if (d === 5) {
      return type === 'text' ? 'dark-orange' : type === 'border' ? 'dark-orange-box' : 'bg-dark-orange';
    } else if (d === 6) {
      return type === 'text' ? 'corn-flower-blue' : type === 'border' ? 'corn-flower-blue-box' : 'bg-corn-flower-blue';
    } else if (d === 7) {
      return type === 'text' ? 'dark-magenta' : type === 'border' ? 'dark-magenta-box' : 'bg-dark-magenta';
    } else if (d === 8) {
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
    if ((timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) != null) {
      const result = (timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) + '';
      if (result.match(/hh/g)) {
        return result + ' a';
      } else {
        return result;
      }
    }
  }

  backClicked() {
    window.history.back();
  }

  hidePanel() {
    const dom = $('#rightPanel');
    dom.addClass('m-l-0 fade-in');
    dom.find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
    $('#leftPanel').hide();
    $('.sidebar-btn').show();
  }

  showLeftPanel() {
    const dom = $('#rightPanel');
    dom.removeClass('fade-in m-l-0');
    dom.find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
    $('#leftPanel').show();
    $('.sidebar-btn').hide();
  }

  private recursive(data, output) {
    if (data.folders && data.folders.length > 0) {
      for (let i = 0; i < data.folders.length; i++) {
        output.push({
          name: data.folders[i].name,
          path: data.folders[i].path,
          children: []
        });
        if (data.folders[i].folders && data.folders[i].folders.length > 0) {
          this.recursive(data.folders[i], output[i].children);
          output[i].children = _.sortBy(output[i].children, function (x) {
            return x.name.toLowerCase();
          });
        }
      }
    }
  }

  prepareTree(actualData): any {
    if (actualData.folders && actualData.folders.length > 0) {
      let output = [{
        id: 1,
        name: actualData.folders[0].path,
        path: actualData.folders[0].path,
        children: []
      }];

      this.recursive(actualData.folders[0], output[0].children);
      output[0].children = _.sortBy(output[0].children, function (i) {
        return i.name.toLowerCase();
      });
      return output;
    } else {
      return [];
    }
  }

  recursiveTreeUpdate(scrTree, destTree): any {
    if (scrTree && destTree) {
      for (let i = 0; i < scrTree.length; i++) {
        for (let j = 0; j < destTree.length; j++) {
          if (scrTree[i].path === destTree[j].path) {
            scrTree[i].isExpanded = destTree[j].isExpanded;
            scrTree[i].isSelected = destTree[j].isSelected;
            scrTree[i].data = destTree[j].data;
            this.recursiveTreeUpdate(scrTree[i].children, destTree[j].children);
            destTree.splice(j, 1);
            break;
          }
        }
      }
    }
    return scrTree;
  }

  isIE() {
    return !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
  }

  isFF() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
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
      url = '?historyId=' + encodeURIComponent(order.historyId) + '&orderId=' + encodeURIComponent(order.orderId) + '&jobChain=' + encodeURIComponent(order.jobChain) + '&schedulerId=' + schedulerId;
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

  private downloadLog(data, id) {
    if (data.orderId) {
      this.post('order/log/info', {
        jobschedulerId: id,
        orderId: data.orderId,
        jobChain: data.jobChain,
        historyId: data.historyId
      }).subscribe((res: any) => {
        $('#tmpFrame').attr('src', './api/order/log/download?jobschedulerId=' + id + '&filename=' + res.log.filename +
          '&accessToken=' + this.authService.accessTokenId);
      });
    } else if (data.taskId) {
      this.post('task/log/info', {
        jobschedulerId: id,
        taskId: data.taskId
      }).subscribe((res: any) => {
        $('#tmpFrame').attr('src', './api/task/log/download?&jobschedulerId=' + id + '&filename=' + res.log.filename +
          '&accessToken=' + this.authService.accessTokenId);
      });
    }
  }

  private calWindowSize() {
    if (this.newWindow) {
      try {
        this.newWindow.addEventListener('beforeunload', () => {
          if (this.newWindow.innerWidth > 0 && this.newWindow.screenX > 0) {
            if (window.localStorage.log_window_ht == (this.newWindow.innerHeight - 3)) {
              this.newWindow.innerHeight = this.newWindow.innerHeight - 3;
            }
            window.localStorage.log_window_wt = this.newWindow.innerWidth + (this.isFF() ? 2 : 0);
            window.localStorage.log_window_ht = this.newWindow.innerHeight + (this.isFF() ? 1 : 0);
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
    } else if (/^\s*[-,+](\d+)([shdwMy])\s*[-,+](\d+)([shdwMy])\s*$/.test(regex)) {
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

  }

  showJob(job) {

  }

  showJobChain(jobChain) {

  }

  showOrderLink(order) {

  }

  showCalendarLink(calendar) {

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
        if (this.newWindow.innerWidth > 0 && this.newWindow.screenX > 0) {
          if (window.localStorage.log_window_ht == (this.newWindow.innerHeight - 3)) {
            this.newWindow.innerHeight = this.newWindow.innerHeight - 3;
          }
          window.localStorage.log_window_wt = this.newWindow.innerWidth;
          window.localStorage.log_window_ht = this.newWindow.innerHeight;
          window.localStorage.log_window_x = this.newWindow.screenX;
          window.localStorage.log_window_y = this.newWindow.screenY;
        }
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
}
