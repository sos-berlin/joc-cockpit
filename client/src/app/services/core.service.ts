import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthService} from "../components/guard/auth.service";
import * as _ from 'underscore';

declare var $;

@Injectable()
export class CoreService {

  _view: string = 'grid';
  _sideView: boolean = false;
  tabs: any = {};
  tempTabs: any = {};
  dashboard: any = {};
  newWindow:any;
  windowProperties:any = ',scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no';

  constructor(private http: HttpClient, private authService: AuthService) {

    this.tabs._job = {};
    this.tabs._job.filter = {};
    this.tabs._job.filter.state = 'ALL';
    this.tabs._job.filter.type = 'ALL';
    this.tabs._job.filter.sortBy = 'name';
    this.tabs._job.reverse = false;
    this.tabs._job.currentPage = '1';
    this.tabs._job.expand_to = [];
    this.tabs._job.selectedView = true;
    this.tabs._job.showTaskPanel = undefined;

    this.tabs._daliyPlan = {};
    this.tabs._daliyPlan.filter = {};
    this.tabs._daliyPlan.filter.status = 'ALL';
    this.tabs._daliyPlan.filter.state = '';
    this.tabs._daliyPlan.filter.sortBy = 'processedPlanned';
    this.tabs._daliyPlan.filter.range = "today";
    this.tabs._daliyPlan.range = 'period';
    this.tabs._daliyPlan.reverse = false;
    this.tabs._daliyPlan.currentPage = '1';
    this.tabs._daliyPlan.selectedView = true;

    this.tabs._order = {};
    this.tabs._order.filter = {};
    this.tabs._order.filter.state = 'ALL';
    this.tabs._order.filter.sortBy = 'orderId';
    this.tabs._order.reverse = false;
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
    this.tabs._history.yade.filter.historyStates = 'ALL';
    this.tabs._history.yade.filter.date = 'today';
    this.tabs._history.yade.filter.sortBy = 'start';
    this.tabs._history.yade.reverse = true;
    this.tabs._history.yade.currentPage = '1';
    this.tabs._history.yade.selectedView = true;

    this.tabs._yade = {};
    this.tabs._yade.filter = {};
    this.tabs._yade.filter.states = 'all';
    this.tabs._yade.filter.date = 'today';
    this.tabs._yade.filter.sortBy = 'start';
    this.tabs._yade.reverse = true;
    this.tabs._yade.currentPage = '1';
    this.tabs._yade.selectedView = true;

    this.tabs._yadeDetail = {};
    this.tabs._yadeDetail.overview = true;
    this.tabs._yadeDetail.filter = {};
    this.tabs._yadeDetail.filter.sortBy = 'orderId';
    this.tabs._yadeDetail.reverse = false;
    this.tabs._yadeDetail.currentPage = '1';
    this.tabs._yadeDetail.pageView = 'grid';
    this.tabs._yadeDetail.showErrorNodes = true;
    this.tabs._yadeDetail.fitToScreen = false;

    this.tabs._auditLog = {};
    this.tabs._auditLog.filter = {};
    this.tabs._auditLog.filter.historyStates = 'all';
    this.tabs._auditLog.filter.date = 'today';
    this.tabs._auditLog.filter.sortBy = "created";
    this.tabs._auditLog.reverse = true;
    this.tabs._auditLog.currentPage = '1';

    this.tabs._resource = {};
    this.tabs._resource.agents = {};
    this.tabs._resource.agents.filter = {};
    this.tabs._resource.agents.filter.state = 'all';
    this.tabs._resource.agents.filter.sortBy = 'path';
    this.tabs._resource.agents.reverse = false;
    this.tabs._resource.agents.currentPage = '1';
    this.tabs._resource.agents.expand_to = [];
    this.tabs._resource.agentJobExecution = {};
    this.tabs._resource.agentJobExecution.filter = {};
    this.tabs._resource.agentJobExecution.filter.date = 'today';
    this.tabs._resource.agentJobExecution.filter.sortBy = 'agent';
    this.tabs._resource.agentJobExecution.reverse = false;
    this.tabs._resource.agentJobExecution.currentPage = '1';
    this.tabs._resource.locks = {};
    this.tabs._resource.locks.filter = {};
    this.tabs._resource.locks.filter.state = 'all';
    this.tabs._resource.locks.filter.sortBy = 'name';
    this.tabs._resource.locks.reverse = false;
    this.tabs._resource.locks.currentPage = '1';
    this.tabs._resource.locks.expand_to = [];
    this.tabs._resource.processClasses = {};
    this.tabs._resource.processClasses.filter = {};
    this.tabs._resource.processClasses.filter.state = 'all';
    this.tabs._resource.processClasses.filter.sortBy = 'name';
    this.tabs._resource.processClasses.reverse = false;
    this.tabs._resource.processClasses.currentPage = '1';
    this.tabs._resource.processClasses.expand_to = [];
    this.tabs._resource.calendars = {};
    this.tabs._resource.calendars.filter = {};
    this.tabs._resource.calendars.filter.type = 'ALL';
    this.tabs._resource.calendars.filter.sortBy = 'name';
    this.tabs._resource.calendars.reverse = false;
    this.tabs._resource.calendars.currentPage = '1';
    this.tabs._resource.calendars.expand_to = [];


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
    this.tempTabs._daliyPlan.filter.state = '';
    this.tempTabs._daliyPlan.filter.sortBy = 'processedPlanned';
    this.tempTabs._daliyPlan.filter.range = "today";
    this.tempTabs._daliyPlan.range = 'period';
    this.tempTabs._daliyPlan.reverse = false;
    this.tempTabs._daliyPlan.currentPage = '1';
    this.tempTabs._daliyPlan.selectedView = true;

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
    this.tempTabs._yade.filter.states = 'all';
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
    this.tempTabs._yadeDetail.showErrorNodes = true;
    this.tempTabs._yadeDetail.fitToScreen = false;

    this.tempTabs._auditLog = {};
    this.tempTabs._auditLog.filter = {};
    this.tempTabs._auditLog.filter.historyStates = 'all';
    this.tempTabs._auditLog.filter.date = 'today';
    this.tempTabs._auditLog.filter.sortBy = "created";
    this.tempTabs._auditLog.reverse = true;
    this.tempTabs._auditLog.currentPage = '1';

    this.tempTabs._resource = {};
    this.tempTabs._resource.agents = {};
    this.tempTabs._resource.agents.filter = {};
    this.tempTabs._resource.agents.filter.state = 'all';
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
    this.tempTabs._resource.locks.filter.state = 'all';
    this.tempTabs._resource.locks.filter.sortBy = 'name';
    this.tempTabs._resource.locks.reverse = false;
    this.tempTabs._resource.locks.currentPage = '1';
    this.tempTabs._resource.locks.expand_to = [];
    this.tempTabs._resource.processClasses = {};
    this.tempTabs._resource.processClasses.filter = {};
    this.tempTabs._resource.processClasses.filter.state = 'all';
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

    this.dashboard._dashboard = {};
    this.dashboard._dashboard.order = {};
    this.dashboard._dashboard.task = {};
    this.dashboard._dashboard.file = {};

    this.dashboard._dashboard.dailyplan = "0d";

    this.dashboard._dashboard.order.date = "0d";
    this.dashboard._dashboard.order.label = 'button.today';

    this.dashboard._dashboard.task.date = "0d";
    this.dashboard._dashboard.task.label = 'button.today';

    this.dashboard._dashboard.file.date = "0d";
    this.dashboard._dashboard.file.label = 'button.today';

    if (localStorage.$SOS$DASHBOARDTABS) {
      try {
        let obj = JSON.parse(localStorage.$SOS$DASHBOARDTABS);

        if (obj) {
          if (obj._dashboard.filter.orderRange != 'today') {

            this.dashboard = obj;
          }
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

  getColor(d, type): string {
    if (d == 0) {
      return type === 'text' ? 'green' : type === 'border' ? 'green-box' : 'bg-green';
    } else if (d == 1) {
      return type === 'text' ? 'gold' : type === 'border' ? 'gold-box' : 'bg-gold';
    } else if (d == 2) {
      return type === 'text' ? 'crimson' : type === 'border' ? 'crimson-box' : 'bg-crimson';
    } else if (d == 3) {
      return type === 'text' ? 'dimgrey' : type === 'border' ? 'dimgrey-box' : 'bg-dimgrey';
    } else if (d == 4) {
      return type === 'text' ? 'text-dark' : type === 'border' ? 'text-dark-box' : 'bg-transparent';
    } else if (d == 5) {
      return type === 'text' ? 'dark-orange' : type === 'border' ? 'dark-orange-box' : 'bg-dark-orange';
    } else if (d == 6) {
      return type === 'text' ? 'corn-flower-blue' : type === 'border' ? 'corn-flower-blue-box' : 'bg-corn-flower-blue';
    } else if (d == 7) {
      return type === 'text' ? 'dark-magenta' : type === 'border' ? 'dark-magenta-box' : 'bg-dark-magenta';
    } else if (d == 8) {
      return type === 'text' ? 'chocolate' : type === 'border' ? 'chocolate-box' : 'bg-chocolate';
    }
  }

  getDateFormat(dateFormat): string {
    dateFormat = dateFormat.replace('YY', 'yy');
    dateFormat = dateFormat.replace('YY', 'yy');
    dateFormat = dateFormat.replace('D', 'd');
    dateFormat = dateFormat.replace('D', 'd');
    dateFormat = dateFormat.trim();
    return this.getDateFormatMom(dateFormat);
  }

  getDateFormatMom(dateFormat): string {
    if (dateFormat.match('HH:mm')) {
      dateFormat = dateFormat.replace('HH:mm', '');
    }
    else if (dateFormat.match('hh:mm')) {
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

  getTimeFormat(timeFormat): string {
    if ((timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) != null) {
      let result = (timeFormat.match(/HH:mm:ss/gi) || timeFormat.match(/HH:mm/gi) || timeFormat.match(/hh:mm:ss A/gi) || timeFormat.match(/hh:mm A/gi)) + '';
      if (result.match(/hh/g)) {
        return result + " a";
      } else {
        return result;
      }
    }
  }

  backClicked() {
    window.history.back();
  }

  hidePanel() {
    let dom = $('#rightPanel');

    dom.addClass('m-l-0 fade-in');
    dom.find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
    $('#leftPanel').hide();
    $('.sidebar-btn').show();
  }

  showLeftPanel() {
    let dom = $('#rightPanel');
    dom.removeClass('fade-in m-l-0');
    dom.find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
    $('#leftPanel').show();
    $('.sidebar-btn').hide();
  }

  prepareTree(actualData):any {
    if(actualData.folders && actualData.folders.length>0) {
      let output = [{
        id: 1,
        name: actualData.folders[0].path,
        path: actualData.folders[0].path,
        children: []
      }];

      this.recursive(actualData.folders[0], output[0].children);
      return output;
    }else{
      return [];
    }
  }

  private recursive(data, output) {

    if (data.folders && data.folders.length > 0) {
      data.folders = _.sortBy(data.folders, 'name');
      for (let i = 0; i < data.folders.length; i++) {
        output.push({
          name: data.folders[i].name,
          path: data.folders[i].path,
          children: []
        });
        if (data.folders[i].folders && data.folders[i].folders.length > 0) {
          this.recursive(data.folders[i], output[i].children);
        }
      }
    }
  }

  recursiveTreeUpdate(scrTree, destTree):any {
    if (scrTree && destTree)
      for (let i = 0; i < scrTree.length; i++) {
        for (let j = 0; j < destTree.length; j++) {
          if (scrTree[i].path == destTree[j].path) {
            scrTree[i].isExpanded = destTree[j].isExpanded;
            scrTree[i].isSelected = destTree[j].isSelected;
            scrTree[i].data = destTree[j].data;
            this.recursiveTreeUpdate(scrTree[i].children, destTree[j].children);
            destTree.splice(j, 1);
            break;
          }
        }
      }
    return scrTree;
  }

  private refreshParent() {
    try {
      if (typeof this.newWindow != 'undefined' && this.newWindow != null && this.newWindow.closed == false) {
        window.localStorage.log_window_wt = this.newWindow.innerWidth;
        window.localStorage.log_window_ht = this.newWindow.innerHeight;
        window.localStorage.log_window_x = this.newWindow.screenX;
        window.localStorage.log_window_y = this.newWindow.screenY;
        this.newWindow.close();
      }
    }
    catch (x) {
      console.log(x)
    }
  }
  showLogWindow(order, task, job, id, transfer, preferenceObj, schedulerId) {
    if (!order && !task) {
      return;
    }
    this.refreshParent();
    let url = null;
    if (preferenceObj.isNewWindow == 'newWindow') {

      try {
        if (typeof this.newWindow == 'undefined' || this.newWindow == null || this.newWindow.closed == true) {

          if (order && order.historyId && order.orderId) {
            url = 'log.html#!/?historyId=' + order.historyId + '&orderId=' + order.orderId + '&jobChain=' + order.jobChain;
          } else if (task && task.taskId) {
            if (task.job)
              url = 'log.html#!/?taskId=' + task.taskId + '&job=' + task.job;
            else if (job)
              url = 'log.html#!/?taskId=' + task.taskId + '&job=' + job;
            else
              url = 'log.html#!/?taskId=' + task.taskId;

          } else {
            return;
          }

          if (id) {
            document.cookie = "$SOS$scheduleId=" + id + ";path=/";
          } else {
            document.cookie = "$SOS$scheduleId=" + schedulerId + ";path=/";
          }
          document.cookie = "$SOS$accessTokenId=" + this.authService.accessTokenId + ";path=/";
          this.newWindow = window.open(url, "Log", 'top=' + window.localStorage.log_window_y + ',left=' + window.localStorage.log_window_x + ',innerwidth=' + window.localStorage.log_window_wt + ',innerheight=' + window.localStorage.log_window_ht + this.windowProperties, true);
          let self = this;
          setTimeout(()=> {
            self.calWindowSize();
          }, 400);
        }
      } catch (e) {
        throw new Error(e.message);
      }
    } else {
      if (order && order.historyId && order.orderId) {
        url = '#!/order/log?historyId=' + order.historyId + '&orderId=' + order.orderId + '&jobChain=' + order.jobChain + '&schedulerId=' + (id || schedulerId);
      } else if (task && task.taskId) {

        if (transfer) {
          if (task.job)
            url = '#!/file_transfer/log?taskId=' + task.taskId + '&job=' + task.job + '&schedulerId=' + (id || schedulerId);
          else if (job)
            url = '#!/file_transfer/log?taskId=' + task.taskId + '&job=' + job + '&schedulerId=' + (id || schedulerId);
          else
            url = '#!/file_transfer/log?taskId=' + task.taskId + '&schedulerId=' + (id || schedulerId);
        } else {
          if (task.job)
            url = '#!/job/log?taskId=' + task.taskId + '&job=' + task.job + '&schedulerId=' + (id || schedulerId);
          else if (job)
            url = '#!/job/log?taskId=' + task.taskId + '&job=' + job + '&schedulerId=' + (id || schedulerId);
          else
            url = '#!/job/log?taskId=' + task.taskId + '&schedulerId=' + (id || schedulerId);
        }

      } else {
        return;
      }
      window.open(url, '_blank');
    }
  }

  calWindowSize() {
    if (this.newWindow) {
      try {
        this.newWindow.onbeforeunload = function () {
          window.localStorage.log_window_wt = this.newWindow.innerWidth;
          window.localStorage.log_window_ht = this.newWindow.innerHeight;
          window.localStorage.log_window_x = this.newWindow.screenX;
          window.localStorage.log_window_y = this.newWindow.screenY;
          return;
        };
        this.newWindow.addEventListener("resize", function () {
          window.localStorage.log_window_wt = this.newWindow.innerWidth;
          window.localStorage.log_window_ht = this.newWindow.innerHeight;
          window.localStorage.log_window_x = this.newWindow.screenX;
          window.localStorage.log_window_y = this.newWindow.screenY;
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  copyLink(objType, path){

  }

}
