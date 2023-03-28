import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {ClipboardService} from 'ngx-clipboard';
import {Observable} from 'rxjs';
import * as moment from 'moment-timezone';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from '@ngx-translate/core';
import {isEmpty, sortBy, isNumber, object, isArray, groupBy} from 'underscore';
import {saveAs} from 'file-saver';
import {AuthService} from '../components/guard';
import {POPOUT_MODALS, PopoutData, PopupService} from "./popup.service";

declare const diff_match_patch: any;
declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  tabs: any = {};
  dashboard: any = {};
  locales: any = [];
  expertMode;

  preferences: any = {};
  xmlEditorPreferences: any = {};
  sideView = {
    workflow: {width: 270, show: true},
    job: {width: 270, show: true},
    orderOverview: {width: 270, show: true},
    lock: {width: 270, show: true},
    board: {width: 270, show: true},
    calendar: {width: 270, show: true},
    documentation: {width: 270, show: true},
    inventory: {width: 300, show: true},
    xml: {width: 500, show: true},
    deployment: {width: 270, show: true}
  };

  searchResults = {};

  windowProperties: any = ',scrollbars=1,resizable=1,status=0,toolbar=0,menubar=0,location=0toolbar=0';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router, private toasterService: ToastrService,
              private clipboardService: ClipboardService, private translate: TranslateService, private popupService: PopupService) {
    this.init();
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

  private init(): void {
    this.preferences = {
      isFirst: true,
      controllers: new Set()
    };
    this.xmlEditorPreferences = {
      fileTransferActiveTab: '',
      otherActiveTab: ''
    };
    this.expertMode = undefined;
    this.searchResults = {};
    this.searchResults = {
      inventory: {
        panel: false,
        result: [],
        request: {}
      },
      workflow: {
        panel: false,
        result: [],
        request: {}
      },
      board: {
        panel: false,
        result: [],
        request: {}
      },
      lock: {
        panel: false,
        result: [],
        request: {}
      },
      calendar: {
        panel: false,
        result: [],
        request: {}
      }
    };
    this.tabs._admin = {
      isBlocklist: false,
      identityService: {
        filter: {
          sortBy: 'ordering',
          reverse: false
        },
        currentPage: '1'
      },
      sessionManagement: {
        filter: {
          sortBy: 'accountName',
          reverse: false
        },
        currentPage: '1'
      },
      blocklist: {
        filter: {
          date: 'all',
          sortBy: 'since',
          reverse: true
        },
        currentPage: '1'
      }
    };

    this.tabs._workflow = {};
    this.tabs._workflow.filter = {};
    this.tabs._workflow.historyFilter = {
      sortBy: 'startTime',
      reverse: true
    };
    this.tabs._workflow.taskHistoryFilter = {
      sortBy: 'startTime',
      reverse: true
    };
    this.tabs._workflow.jobHistoryFilter = {
      sortBy: 'startTime',
      reverse: true
    };
    this.tabs._workflow.auditLogFilter = {
      sortBy: 'created',
      reverse: true
    };
    this.tabs._workflow.filter.date = '1d';
    this.tabs._workflow.filter.label = 'today'
    this.tabs._workflow.filter.states = [];
    this.tabs._workflow.filter.sortBy = 'name';
    this.tabs._workflow.reverse = false;
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
    this.tabs._daliyPlan.filter.groupBy = '';
    this.tabs._daliyPlan.filter.late = false;
    this.tabs._daliyPlan.filter.sortBy = 'plannedStartTime';
    this.tabs._daliyPlan.reverse = true;
    this.tabs._daliyPlan.currentPage = '1';
    this.tabs._daliyPlan.selectedView = true;

    this.tabs._monitor = {};
    this.tabs._monitor.tabIndex = 0;
    this.tabs._monitor.currentDate = new Date();
    this.tabs._monitor.controller = {
      filter: {
        view: 'Week',
        startYear: this.tabs._monitor.currentDate.getFullYear(),
        startMonth: this.tabs._monitor.currentDate.getMonth(),
        currentYear: this.tabs._monitor.currentDate.getFullYear(),
        currentMonth: this.tabs._monitor.currentDate.getMonth(),
        startDate: new Date().setHours(0, 0, 0, 0),
        endDate: new Date().setHours(0, 0, 0, 0),
      }
    };
    this.tabs._monitor.agent = {
      filter: {
        view: 'Week',
        groupBy: 'DATE',
        startYear: this.tabs._monitor.currentDate.getFullYear(),
        startMonth: this.tabs._monitor.currentDate.getMonth(),
        currentYear: this.tabs._monitor.currentDate.getFullYear(),
        currentMonth: this.tabs._monitor.currentDate.getMonth(),
        startDate: new Date().setHours(0, 0, 0, 0),
        endDate: new Date().setHours(0, 0, 0, 0),
      }
    };
    this.tabs._monitor.orderNotification = {
      filter: {
        types: ['ERROR', 'WARNING', 'RECOVERED'],
        date: '0d',
        sortBy: 'created',
        reverse: true,
        currentPage: '1'
      }
    };
    this.tabs._monitor.systemNotification = {
      filter: {
        categories: ['ALL'],
        types: ['ERROR', 'WARNING'],
        date: '0d',
        sortBy: 'created',
        reverse: true,
        currentPage: '1'
      }
    };

    this.tabs._orderOverview = {};
    this.tabs._orderOverview.overview = true;
    this.tabs._orderOverview.filter = {};
    this.tabs._orderOverview.filter.date = '1d';
    this.tabs._orderOverview.filter.dateLabel = 'today';
    this.tabs._orderOverview.filter.sortBy = 'orderId';
    this.tabs._orderOverview.reverse = false;
    this.tabs._orderOverview.currentPage = '1';
    this.tabs._orderOverview.pageView = 'grid';
    this.tabs._orderOverview.expandedKeys = ['/'];
    this.tabs._orderOverview.selectedkeys = ['/'];
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
    this.tabs._history.submission.filter.sortBy = 'date';
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

    this.tabs._historyLogin = {};
    this.tabs._historyLogin.filter = {};
    this.tabs._historyLogin.filter.date = 'today';
    this.tabs._historyLogin.filter.sortBy = 'loginDate';
    this.tabs._historyLogin.reverse = true;
    this.tabs._historyLogin.currentPage = '1';

    this.tabs._resource = {};
    this.tabs._resource.agents = {};
    this.tabs._resource.agents.filter = {};
    this.tabs._resource.agents.filter.state = 'ALL';
    this.tabs._resource.agents.filter.sortBy = 'agentId';
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
    this.tabs._resource.boards = {};
    this.tabs._resource.boards.filter = {};
    this.tabs._resource.boards.filter.state = 'ALL';
    this.tabs._resource.boards.filter.sortBy = 'name';
    this.tabs._resource.boards.reverse = false;
    this.tabs._resource.boards.currentPage = '1';
    this.tabs._resource.boards.expandedKeys = ['/'];
    this.tabs._resource.boards.selectedkeys = ['/'];
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
    this.tabs._configuration.copiedInstuctionObject = [];

    this.tabs._agentCluster = {};
    this.tabs._agentCluster.filter = {};
    this.tabs._agentCluster.filter.sortBy = 'ordering';
    this.tabs._agentCluster.reverse = false;
    this.tabs._agentCluster.currentPage = '1';

    this.tabs._deployment = {};
  }

  setSearchResult(type, result): void {
    this.searchResults[type] = result;
  }

  getSearchResult(type): any {
    return this.searchResults[type];
  }

  setDefaultTab(): void {
    this.init();
  }

  setTabs(tempTabs: any): void {
    this.tabs = tempTabs;
  }

  getTabs(): any {
    return this.tabs;
  }

  getAdminTab(): any {
    return this.tabs._admin;
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

  getMonitorTab(): any {
    return this.tabs._monitor;
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

  getHistoryLoginTab(): any {
    return this.tabs._historyLogin;
  }

  getAgentClusterTab(): any {
    return this.tabs._agentCluster;
  }

  getYadeTab(): any {
    return this.tabs._yade;
  }

  getDeploymentTab(): any {
    return this.tabs._deployment;
  }

  setLocales(locale: any): void {
    this.locales = locale;
  }

  getLocale(): any {
    const arr = this.locales.filter((item: any) => {
      return localStorage.$SOS$LANG === item.lang;
    });
    if (arr.length > 0) {
      return arr[0];
    } else {
      return this.locales[0];
    }
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

  getAgents(data, controllerId, cb?): void {
    this.post('agents/names', {controllerId}).subscribe({
      next: (res: any) => {
        data.agentList = [{
          title: 'agents',
          hide: false,
          children: res.agentNames
        }];
        if (res.clusterAgentNames && res.clusterAgentNames.length > 0) {
          let obj = {
            title: 'agentGroups',
            hide: false,
            children: []
          };
          for (let prop in res.subagentClusterIds) {
            obj.children.push({
              title: prop,
              hide: true,
              children: res.subagentClusterIds[prop]
            });
          }
          data.agentList.push(obj);
        }
        if (cb) {
          cb();
        }
      }, error: () => {
        if (cb) {
          cb();
        }
      }
    });
  }

  getFilterAgentList(list, value: string, skip = false): any {
    return !value ? list : list.filter(option => {
      let flag = false;
      option.children = option.children.filter(option2 => {
        let isCheck = false;
        if (option2.children && !skip) {
          option2.children = option2.children.filter(option3 => {
            let isCheck2 = option3.toLowerCase().indexOf(value.toLowerCase()) > -1;
            if (isCheck2) {
              flag = true;
            }
            if (!isCheck && isCheck2) {
              isCheck = true;
            }
            return isCheck2;
          });
        } else {
          let isCheck3 = false;
          if (option2.title) {
            isCheck3 = option2.title.toLowerCase().indexOf(value.toLowerCase()) > -1
          } else {
            isCheck3 = option2.toLowerCase().indexOf(value.toLowerCase()) > -1
          }
          if (isCheck3) {
            flag = true;
          }
          if (!isCheck && isCheck3) {
            isCheck = true;
          }
        }
        return isCheck;
      });
      return flag;
    });
  }

  download(url: string, options: any, fileName: string, cb: any): void {
    const headers: any = {
      Accept: 'application/octet-stream',
      responseType: 'blob',
      observe: 'response'
    };
    this.http.post(url, options, headers).subscribe({
      next: (response: any) => {
        saveAs(response.body, fileName || response.headers.get('content-disposition'));
        cb(true);
      }, error: () => {
        cb(false);
      }
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
    } else if (d === 11) {
      return type === 'text' ? 'light-orange' : type === 'border' ? 'light-orange-box' : 'bg-light-orange';
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
    } else if (d === 10) {
      return isHover ? 'rgba(255,255,0, .7)' : '#ffff00';
    } else if (d === 11) {
      return isHover ? 'rgba(255,166,64, .7)' : '#FFA640';
    } else {
      return '';
    }
  }

  showCopyMessage(message: any, type = 'copied', messageType = 'success'): void {
    let msg = '';
    this.translate.get('common.message.' + type).subscribe(translatedValue => {
      msg = translatedValue;
    });
    if (messageType == 'error') {
      message.error(msg);
    } else if (messageType == 'warn') {
      message.warn(msg);
    } else if (messageType == 'info') {
      message.info(msg);
    } else {
      message.success(msg);
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

  private recursive(data: any, output: any, isLeaf: boolean): void {
    if (data.folders && data.folders.length > 0) {
      for (let i = 0; i < data.folders.length; i++) {
        const path = data.folders[i].path;
        output.push({
          name: data.folders[i].name || path.substring(path.lastIndexOf('/') + 1),
          title: data.folders[i].name || path.substring(path.lastIndexOf('/') + 1),
          path,
          key: path,
          permitted: data.folders[i].permitted,
          repoControlled: data.folders[i].repoControlled,
          isLeaf: isLeaf ? !data.folders[i].folders || data.folders[i].folders.length === 0 : false,
          children: [],
          items: data.folders[i].items,
          deployables: data.folders[i].deployables,
          releasables: data.folders[i].releasables
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

  prepareTree(actualData: any, isLeaf: boolean): any {
    if (actualData.folders && actualData.folders.length > 0) {
      const output = [];
      for (const i in actualData.folders) {
        if (actualData.folders[i]) {
          output.push({
            name: actualData.folders[i].name || actualData.folders[i].path,
            path: actualData.folders[i].path,
            title: actualData.folders[i].name || actualData.folders[i].path,
            key: actualData.folders[i].path,
            permitted: actualData.folders[i].permitted,
            repoControlled: actualData.folders[i].repoControlled,
            isLeaf: isLeaf ? !actualData.folders[i].folders || actualData.folders[i].folders.length === 0 : false,
            children: [],
            items: actualData.folders[i].items,
            deployables: actualData.folders[i].deployables,
            releasables: actualData.folders[i].releasables
          });
          this.recursive(actualData.folders[i], output[i].children, isLeaf);
          output[i].children = sortBy(output[i].children, (i: any) => {
            return i.name.toLowerCase();
          });
        }
      }
      return output;
    } else {
      return [];
    }
  }

  showOrderLogWindow(orderId: string, controllerId: string, workflow: string): void {
    const preferenceObj = JSON.parse(sessionStorage.preferences);
    const self = this;
    let url;

    function openWindow() {
      if (url) {
        if (preferenceObj.isNewWindow === 'newWindow') {
          const modalData: PopoutData = {
            modalName: 'Order Log',
            controllerId,
            orderId: orderId,
            historyId: url,
            workflow: workflow,
            instance: null
          };
          self.openPopout(modalData, 'top=' + window.localStorage.log_window_y + ',' +
            'left=' + window.localStorage.log_window_x + ',innerwidth=' + window.localStorage.log_window_wt + ',' +
            'innerheight=' + window.localStorage.log_window_ht + self.windowProperties);
        } else if (preferenceObj.isNewWindow === 'newTab') {
          window.open(url, '_blank');
        }
      } else if (url === undefined) {
        setTimeout(() => {
          openWindow();
        }, 50);
      }
    }

    openWindow();
    this.post('order/history', {
      orderId: orderId,
      controllerId
    }).subscribe({
      next: (res) => {
        if (res.historyId) {
          let url2 = '?historyId=' + encodeURIComponent(res.historyId) + '&orderId=' + encodeURIComponent(orderId) + '&workflow=' + encodeURIComponent(workflow) + '&controllerId=' + controllerId;
          if (preferenceObj.isNewWindow === 'newWindow') {
            this.popupService.closePopoutModal();
            url = res.historyId;
          } else if (preferenceObj.isNewWindow === 'newTab') {
            url = '#/log' + url2;
          } else {
            url = '';
            this.downloadLog(res, controllerId);
          }
        } else {
          url = '';
          let msg = '';
          this.translate.get('order.message.noLogHistoryFound').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.info(msg)
        }
      }, error: () => url = ''
    })
  }

  showLogWindow(order: any, task: any, job: any, id: string, transfer: any): void {
    if (!order && !task) {
      return;
    }

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
      // this.newWindow = window.open('assets/modal/popout.html' + url, '');
      const modalData: PopoutData = {
        modalName: (order && order.orderId) ? 'Order Log' : 'Task Log',
        controllerId,
        workflow: order?.workflow,
        orderId: (order && order.orderId) ? order.orderId : undefined,
        taskId: task ? task.taskId : undefined,
        historyId: (order && order.historyId) ? order.historyId : undefined,
        job: (task && task.taskId) ? (task.job ? task.job : job) : undefined,
        instance: null
      };
      this.openPopout(modalData, 'top=' + window.localStorage.log_window_y + ',' +
        'left=' + window.localStorage.log_window_x + ',innerwidth=' + window.localStorage.log_window_wt + ',' +
        'innerheight=' + window.localStorage.log_window_ht + this.windowProperties);
    } else if (preferenceObj.isNewWindow === 'newTab') {
      window.open('#/log' + url, '_blank');
    } else {
      const data = order || task || job || transfer;
      this.downloadLog(data, controllerId);
    }
  }

  private openPopout(modalData: PopoutData, properties) {
    if (!this.popupService.isPopoutWindowOpen()) {
      this.popupService.openPopoutModal(modalData, properties);
    } else {
      POPOUT_MODALS['outlet'].detach();
      const injector = this.popupService.createInjector(modalData);
      POPOUT_MODALS['componentInstance'] = this.popupService.attachLogContainer(POPOUT_MODALS['outlet'], injector);
      this.popupService.focusPopoutWindow();
    }
  }

  showDocumentation(document: string, preferences: any): void {
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

  parseProcessExecutedRegex(regex: string, obj: any, completedDate?): any {
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
      obj[completedDate ? 'completedDateFrom' : 'dateFrom'] = fromDate;
    }
    if (toDate) {
      obj[completedDate ? 'completedDateTo' : 'dateTo'] = toDate;
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
    const val = regEx.exec(window.location.href);
    let host = '';
    if (val) {
      host = val[1];
    }
    host = host + '/#/';
    if (objType === 'workflow' && name) {
      link = host + 'workflows/workflow?path=' + encodeURIComponent(name);
    } else if (objType === 'order' && name) {
      link = host + 'history/order?orderId=' + encodeURIComponent(name) + '&workflow=' + encodeURIComponent(workflow);
    } else if (objType === 'lock' && name) {
      link = host + 'resources/locks/lock?name=' + encodeURIComponent(name);
    } else if (objType === 'board' && name) {
      link = host + 'resources/boards/board?name=' + encodeURIComponent(name);
    } else if (objType === 'fileTransfer' && name) {
      link = host + 'file_transfer/file_transfer?id=' + name;
    } else if (objType === 'calendar' && name) {
      link = host + 'resources/calendars/calendar?name=' + encodeURIComponent(name);
    } else if (objType === 'document' && name) {
      link = host + 'resources/documentations/documentation?name=' + encodeURIComponent(name);
    } else if (objType === 'configuration') {
      if (workflow) {
        this.clipboardService.copyFromContent(host + 'configuration/inventory?objectType=' + workflow + '&path=' + encodeURIComponent(name));
      } else {
        this.clipboardService.copyFromContent(host + 'configuration/inventory?path=' + encodeURIComponent(name));
      }
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
    this.router.navigate(['/configuration/inventory']).then();
  }

  showBoard(boardName: any): void {
    this.post('inventory/path', {
      objectType: 'NOTICEBOARD',
      name: boardName
    }).subscribe((res: any) => {
      const pathArr: string[] = [];
      const arr = res.path.split('/');
      const boardFilters = this.getResourceTab().boards;
      boardFilters.selectedkeys = [];
      const len = arr.length - 1;
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
      boardFilters.expandedKeys = pathArr;
      boardFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
      boardFilters.expandedObjects = [res.path];
      this.router.navigate(['/resources/boards']).then();
    });
  }

  showWorkflow(workflow: any, versionId = null): void {
    this.router.navigate(['/workflows/workflow'], {
      queryParams: {
        path: workflow,
        versionId,
        controllerId: JSON.parse(this.authService.scheduleIds).selected
      }
    }).then();
  }

  showLock(lockName: string): void {
    this.post('inventory/path', {
      objectType: 'LOCK',
      name: lockName
    }).subscribe((res: any) => {
      const pathArr: string[] = [];
      const arr = res.path.split('/');
      const lockFilters = this.getResourceTab().locks;
      lockFilters.selectedkeys = [];
      const len = arr.length - 1;
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
      lockFilters.expandedKeys = pathArr;
      lockFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
      lockFilters.expandedObjects = [lockName];
      this.router.navigate(['/resources/locks']).then();
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

  downloadLog(data: any, id: string): void {
    let url = 'order/log/download';
    let obj: any;
    let name = '';
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
      this.download(url, obj, name, () => {
      });
    }
  }

  getName(list: any, name: string, key: any, type: any): string {
    if (list.length === 0) {
      return name;
    } else {
      const arr: any[] = [];
      list.forEach((element: any) => {
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
    if (!date && zone) {
      return moment().tz(zone).format(format);
    }
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
      const a = parseInt((i / 1e3 % 60).toString(), 10), s = parseInt((i / 6e4 % 60).toString(), 10),
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
      const arr = currentView != null ? [53] : [];
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
        $(this).css('width', arr[count] + 'px');
      });
    }, 100);
  }

  calFileTransferRowWidth(): Array<string> {
    const arr: Array<number> = [];
    const arr2 = [];
    const dom = $('#fileTransferTable');
    dom.find('thead tr.sub-header th.dynamic-thead').each(function () {
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
    return json ? JSON.parse(JSON.stringify(json)) : {};
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

  getDates(startDate: any, endDate: any): any {
    if (typeof startDate !== 'number') {
      startDate = new Date(startDate).setHours(0, 0, 0, 0);
    }
    if (typeof endDate !== 'number') {
      endDate = new Date(endDate).setHours(0, 0, 0, 0);
    }
    const dates = [];
    let currentDate = startDate;
    const addDays = function (days) {
      const date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date.setHours(0, 0, 0, 0);
    };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  }

  removeSlashToString(data: any, type: string): void {
    if (data[type]) {
      if (isArray(data[type])) {

      } else {
        if (data[type] === 'true' || data[type] === 'false') {
        } else if (/^\d+$/.test(data[type])) {
        } else if (typeof data[type] == 'string') {
          const startChar = data[type].substring(0, 1);
          if (startChar !== '$') {
            const endChar = data[type].substring(data[type].length - 1);
            const mainStr = data[type].substring(1, data[type].length - 1);
            if ((startChar === '"' && endChar === '"')) {
              if (/^\d+$/.test(mainStr)) {
                return;
              } else if (mainStr === 'true' || mainStr === 'false') {
                return;
              } else if (/^(now\()/i.test(mainStr) || /^(variable\()/i.test(data[type]) || /^(env\()/i.test(mainStr)
                || /^(toFile\()/i.test(mainStr) || /^(replaceAll\()/i.test(mainStr) || /^(jobResourceVariable\()/g.test(mainStr)
                || /^(scheduledOrEmpty\()/g.test(mainStr) || /^([0-9])+(.toString)$/g.test(data[type]) || /^(JobResource:)/g.test(data[type])) {
                return;
              } else if (mainStr.substring(0, 1) === '$') {
                const str = mainStr.substring(1, data[type].length);
                if (!str.match(/[!?~'"}\[\]{@#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(str) && /^(?!-)(?!.*--)/.test(str) && !/\s/.test(str)) {
                  return;
                }
              }
            }
            try {
              data[type] = JSON.parse(data[type]);
            } catch (e) {
              if ((startChar === '"' && endChar === '"')) {
                data[type] = mainStr;
              }
            }
          }
        }
      }
    }
  }

  addSlashToStringForEvn(obj: any): void {
    obj.env.forEach((env) => {
      if (env.value) {
        if (!(/[$+]/.test(env.value)) || (/\s/g.test(env.value) && !/[+]/.test(env.value))) {
          const startChar = env.value.substring(0, 1);
          const endChar = env.value.substring(env.value.length - 1);
          if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {

          } else if (env.value === 'true' || env.value === 'false') {
          } else if (/^\d+$/.test(env.value)) {

          } else {
            let x = env.value.replace(/\\([\s\S])|(")/g, '\\$1$2').trim();
            if (x.match(/\\/)) {
              env.value = JSON.stringify(env.value);
            } else {
              env.value = endChar === "$" ? env.value : '"' + env.value + '"';
            }
          }
        }
      }
    });
  }

  addSlashToString(data: any, type: string): void {
    if (data[type]) {
      if (data[type] === 'true' || data[type] === 'false') {
      } else if (/^\d+$/.test(data[type])) {
      } else if (/^(now\()/i.test(data[type]) || /^(variable\()/i.test(data[type]) || /^(env\()/i.test(data[type])
        || /^(toFile\()/i.test(data[type]) || /^(replaceAll\()/i.test(data[type]) || /^(jobResourceVariable\()/g.test(data[type])
        || /^(scheduledOrEmpty\()/g.test(data[type]) || /^([0-9])+(.toString)$/g.test(data[type]) || /^(JobResource:)/g.test(data[type])) {
      } else if (typeof data[type] == 'string') {
        const startChar = data[type].substring(0, 1);
        const endChar = data[type].substring(data[type].length - 1);
        if (startChar !== '$') {
          if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {
          } else {
            if (/\s+(\++)\s+/g.test(data[type])) {

            } else {
              if (data[type].match('.toNumber')) {

              } else {
                let x = data[type].replace(/\\([\s\S])|(")/g, '\\$1$2').trim();
                if (x.match(/\\/)) {
                  data[type] = JSON.stringify(data[type]);
                } else {
                  data[type] = endChar === "$" ? data[type] : '"' + data[type] + '"';
                }
              }
            }
          }
        } else {
          const mainStr = data[type].substring(1, data[type].length);
          if (mainStr.startsWith('{') && mainStr.substring(mainStr.length - 1, mainStr.length) === '}') {
          } else {
            if (!mainStr.match(/[!?~'"}\[\]{@#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(mainStr)
              && /^(?!-)(?!.*--)/.test(mainStr) && !/\s/.test(mainStr)) {
            } else if (/\(\d+\)/.test(mainStr)) {
            } else {
              data[type] = endChar === "$" ? data[type].trim() : '"' + data[type].trim() + '"';
            }
          }
        }
      }
    }
  }

  updateReplaceText(): void {
    setTimeout(() => {
      const dom = $('.CodeMirror-dialog .CodeMirror-search-label');
      const text = dom.text();
      if (text.match(/Replace:/)) {
        dom.text('Search:');
      } else if (text.match(/Replace all:/)) {
        dom.text('Search all:');
      }
      if (text.match(/Replace/)) {
        $('.CodeMirror-search-field').on('keydown', (e) => {
          if (e.keyCode === 13) {
            const dom2 = $('.CodeMirror-dialog .CodeMirror-search-label');
            if (dom2.text().match(/With:/)) {
              dom2.text('Replace:');
            }
          }
        });
      }
    }, 0);
  }

  convertTextToLink(value: string, link: any): string {
    return value.replace(new RegExp(/%(.*)%/, 'gi'),
      '<a target="_blank" href="' + (link || '$1') + '" class="text-primary text-u-l">$1</a>');
  }

  getJobResource(cb, obj = null): void {
    this.post('inventory/read/folder', {
      path: '/',
      recursive: true,
      objectTypes: ['JOBRESOURCE']
    }).subscribe({
      next: (res: any) => {
        res.jobResources = sortBy(res.jobResources, (i: any) => {
          return i.name.toLowerCase();
        });
        if (obj) {
          obj.list = res.jobResources;
        }
        let entries = [];
        res.jobResources.forEach((item) => {
          const obj = {
            name: item.name,
            path: item.path.substring(0, item.path.lastIndexOf('/')) || '/'
          };
          entries.push(obj);
        });
        entries = sortBy(entries, (i: any) => {
          return i.path.toLowerCase();
        });
        const arr = [];
        for (const [key, value] of Object.entries(groupBy(entries, 'path'))) {
          arr.push({name: key, list: value});
        }

        cb(arr);
      }, error: () => {
        cb([]);
      }
    });
  }

  getNotExistJobResource(data): any {
    let tempARr = [];
    const obj = {
      name: '/',
      notFound: true,
      list: []
    };
    data.arr.forEach(items => {
      if (items) {
        if (items.name === '/') {
          if (!items.notFound) {
            obj.list = items.list;
            delete obj.notFound;
          } else if (items.list.length > 0) {
            let x = [];
            for (let i in items.list) {
              if (!items.list[i].notFound) {
                x.push(items.list[i])
              }
            }
            items.list = x;
            obj.list = items.list;
          }
        }
        tempARr = tempARr.concat(items.list);
      }
    });
    if (typeof data.jobResources === 'string') {
      let x = data.jobResources;
      data.jobResources = [x];
    }
    for (let i in data.jobResources) {
      let flag = true;
      for (let j in tempARr) {
        if (tempARr[j]) {
          if (data.jobResources[i] === tempARr[j].name) {
            flag = false;
            break;
          }
        }
      }
      if (flag) {
        obj.notFound = true;
        obj.list = [{name: data.jobResources[i], path: '/', notFound: true}].concat(obj.list);
      }
    }

    if (obj.notFound && obj.list.length > 0) {
      if (data.arr[0] && data.arr[0].name === '/' && obj.name === '/') {
        data.arr.splice(0, 1);
      }
      data.arr = [obj].concat(data.arr);
    } else if (data.arr[0]) {
      if (data.arr[0].name === '/' && data.arr[0].notFound && data.arr[0].list.length === 0) {
        data.arr.splice(0, 1);
      }
    }
    return data.arr;
  }

  getDateAndTime(data, val = 'from'): any {
    if (data[val + 'Date'] && data[val + 'Time']) {
      const arr = data[val + 'Time'].split(':');
      if (arr[0] && arr[0].length === 2) {
        data[val + 'Date'].setHours(arr[0])
      } else {
        data[val + 'Date'].setHours(0)
      }
      if (arr[1] && arr[1].length === 2) {
        data[val + 'Date'].setMinutes(arr[1])
      } else {
        data[val + 'Date'].setMinutes(0)
      }
      if (arr[2] && arr[2].length === 2) {
        data[val + 'Date'].setSeconds(arr[2])
      } else {
        data[val + 'Date'].setSeconds(0);
      }
      data[val + 'Date'].setMilliseconds(0);
    }
  }

  selectTime(time, isEditor = false, data, val = 'from'): void {
    if (time && !isEditor) {
      const h = time.getHours() + '';
      const m = time.getMinutes() + '';
      const s = time.getSeconds() + '';
      data[val === 'from' ? 'fromTime' : val === 'start' ? 'startTime' : val.match('end') ? val : 'toTime'] = (h.length == 1 ? '0' + h : h) + ':' + (m.length == 1 ? '0' + m : m) + ':' + (s.length == 1 ? '0' + s : s);
    } else if (isEditor && time) {
      let d = new Date();
      const arr = time.split(':');
      if (arr[0] && arr[0].length === 2) {
        d.setHours(arr[0])
      }
      if (arr[1] && arr[1].length === 2) {
        d.setMinutes(arr[1])
      } else {
        d.setMinutes(0)
      }
      if (arr[2] && arr[2].length === 2) {
        d.setSeconds(arr[2])
      } else {
        d.setSeconds(0);
      }
      data[val === 'from' ? 'fromTime1' : val === 'start' ? 'startTime1' : val.match('end') ? val : 'toTime1'] = new Date(d);
    }
  }

  getUnixTime(date) {
    return moment(date).unix();
  }

  getUTCTime(time) {
    return moment.utc(time);
  }

  getAuditLogObj(comments, auditLog): void {
    if (comments.comment) {
      auditLog.comment = comments.comment;
    }
    if (comments.timeSpent) {
      auditLog.timeSpent = comments.timeSpent;
    }
    if (comments.ticketLink) {
      auditLog.ticketLink = comments.ticketLink;
    }
  }

  getHtml(exp, permission): string {
    const arr = exp.split(' ');
    let str = '';
    arr.forEach(item => {
      item = item.trim();
      let firstStr = '';
      let lastStr = '';
      if (item !== '&&' && item != '||') {
        if (item.substring(0, 1) == ')' || item.substring(0, 1) == '(') {
          firstStr = item.substring(0, 1);
          item = item.substring(1, item.length - 1);
        }
        if (item.substring(0, 1) == '"' || item.substring(0, 1) == "'") {
          if (item.substring(item.length - 1) == ')' || item.substring(item.length - 1) == '(') {
            lastStr = item.substring(item.length - 1);
            item = item.substring(0, item.length - 1);
          }
          let lastIndex = (item.substring(item.length - 1) == '"' || item.substring(item.length - 1) == "'") ? 1 : 0;
          item = item.substring(1, item.length - lastIndex);
        }

        if (permission && permission.joc && permission.joc.inventory && permission.joc.inventory.view) {
          str += '<i data-id-x="' + item + '" class="cursor fa fa-pencil text-hover-primary p-l-sm p-r-xs"></i>';
        }
        str += firstStr + '<a class="text-hover-primary" data-id-y="' + item + '" >' + item + '</a>'
        str += lastStr;
      } else {
        str += ' ' + item;
      }
    })
    return str;
  }

  //Locker store and retrive

  saveValueInLocker(body, cb): void {
    this.post('iam/locker/put', body).subscribe({
      next: (res) => {
        sessionStorage.$SOS$KEY = res.key;
        cb();
      }, error: () => {
        cb();
      }
    })
  }

  getValueFromLocker(key, cb) {
    if (key) {
      this.post('iam/locker/get', {key}).subscribe({
        next: (res) => {
          cb(res.content);
        }, error: () => {
          cb({});
        }
      })
    }
  }

  renewLocker(key) {
    let miliseconds = (new Date().getTime() < parseInt(sessionStorage.$SOS$RENEW)) ? (parseInt(sessionStorage.$SOS$RENEW) - new Date().getTime()) : (new Date().getTime() - parseInt(sessionStorage.$SOS$RENEW));
    setTimeout(() => {
      if (key && sessionStorage.$SOS$KEY && (sessionStorage.$SOS$KEY == key)) {
        this.post('iam/locker/renew', {key}).subscribe({
          next: (res) => {
            sessionStorage.$SOS$RENEW = (new Date().getTime() + 1800000) - 30000;
            this.renewLocker(res.key);
          }
        })
      }

    }, miliseconds);
  }

  /** -------- Log View --------- */

  createTreeStructure(mainObj): any {
    let nodes = [];
    mainObj.treeStructure.forEach(item => {
      if (item.name1) {
        item.position += '.' + item.name1
      }
      let data: any = {
        title: '',
        key: item.orderId + item.logEvent + item.position,
        name: '',
        orderId: item.orderId,
        count: item.count,
        logLevel: item.logLevel,
        position: item.position,
        isLeaf: false,
        logEvent: item.logEvent,
        name1: item.name1,
        children: []
      };

      let parentNode: any;
      let lastPos;
      if (item.logEvent === 'OrderForked') {
        data.title = 'Fork';
      } else if (item.logEvent === 'OrderJoined') {
        data.title = 'Join';
        data.isLeaf = true;
        delete data.children;

        let _tempArr = item.position.split('/');
        _tempArr.splice(_tempArr.length - 1, 1)
        let pos = _tempArr.join('/');
        if (pos) {
          data.position = pos;
          item.position = pos;
        }
      } else {
        let _tempArr = item.position.split('/');
        lastPos = _tempArr[_tempArr.length - 1];
        if (lastPos) {
          if (lastPos.match(/branch/)) {
            data.name = lastPos.substring(lastPos.indexOf('+') + 1, lastPos.indexOf(':'));
            data.title = data.name;
          } else {
            if (lastPos == 'try+0:0') {
              parentNode = {
                title: 'Try',
                key: 'try' + item.orderId + item.logEvent + item.position,
                name: '',
                logLevel: item.logLevel,
                position: item.position.substring(0, item.position.lastIndexOf(':')),
                isLeaf: false,
                count: item.count,
                logEvent: item.logEvent,
                orderId: item.orderId,
                children: []
              };
              if (item.logEvent === 'OrderRetrying') {
                data.title = 'Retry';
              }
            } else if (lastPos == 'catch+0:0' && item.logEvent == 'OrderCaught') {
              data = {
                title: 'Catch',
                key: 'catch' + item.orderId + item.logEvent + item.position,
                name: '',
                logLevel: item.logLevel,
                position: item.position.substring(0, item.position.lastIndexOf(':')),
                isLeaf: false,
                count: item.count,
                logEvent: item.logEvent,
                orderId: item.orderId,
                children: []
              };
            }
          }
        }
      }
      if (item.job) {
        data.title = 'Job';
        data.name = item.job;
        data.isLeaf = true;
        delete data.children;
      }

      if (nodes.length == 0) {
        if (parentNode && parentNode.children) {
          parentNode.children.push(data);
          nodes.push(parentNode);
        } else {
          nodes.push(data);
        }
      } else {
        let obj = {
          flag: false
        };
        for (let i in nodes) {
          let _tempArr = item.position.split('/');
          _tempArr.splice(_tempArr.length - 1, 1);
          if ((lastPos && (lastPos.match('then') || lastPos.match('else')) && item.job)) {
            ifInstructionRecursion(nodes, item, data);
            obj.flag = true;
            break;
          } else if ((lastPos && lastPos.match('branch') && item.job)) {

            if (nodes[i].position == item.position || (nodes[i].position.substring(0, nodes[i].position.lastIndexOf(':')) == item.position.substring(0, item.position.lastIndexOf(':')))) {
              checkAndUpdate(nodes[i], data);
              obj.flag = true;
              break;
            } else {
              recursion(nodes[i], item, obj, data, parentNode, lastPos);
              if (obj.flag) {
                break;
              }
            }
          } else {
            if (nodes[i].position == item.position || (nodes[i].position.indexOf(':') > -1 && nodes[i].position.substring(0, nodes[i].position.lastIndexOf(':')) == item.position.substring(0, item.position.lastIndexOf(':')))) {
              if (parentNode && parentNode.children) {
                parentNode.children.push(data);
                nodes.push(parentNode);
              } else {
                if (nodes[i].title == data.title || (nodes[i].title == '' && data.title == 'Job') || (nodes[i].title == 'Job' && data.title == '') || (nodes[i].title == 'Try' && data.title == 'Retry') || (nodes[i].title == 'Retry' && data.title == 'Try')) {
                  if (data.title) {
                    nodes[i].title = data.title;
                  }
                  if (data.name) {
                    nodes[i].name = data.name;
                  }
                  nodes[i].logEvent = data.logEvent;
                  nodes[i].logLevel = data.logLevel;
                  nodes[i].children = data.children;

                } else {
                  let flag = false;
                  for (let prop in nodes) {
                    if (nodes[prop].position == data.position && (nodes[prop].title == data.title || (!nodes[prop].title && data.title) || (nodes[prop].title == 'Try' && data.title == 'Retry') || (nodes[prop].title == 'Retry' && data.title == 'Try'))) {
                      nodes[prop].name = data.name;
                      nodes[prop].logEvent = data.logEvent;
                      nodes[prop].logLevel = data.logLevel;
                      nodes[prop].children = data.children;
                      if ((nodes[prop].title == data.title || (nodes[prop].title == 'Try' && data.title == 'Retry') || (nodes[prop].title == 'Retry' && data.title == 'Try'))) {

                      } else {
                        nodes[prop].title = data.title;
                      }
                      flag = true;
                      break;
                    }
                  }
                  if (!flag) {
                    if (data.title == 'Join' && nodes[nodes.length - 1].title == 'ForkList') {
                      data.end = 'ForkList-End';
                    }
                    nodes.push(data);
                  }
                }
              }
              obj.flag = true;
              break;
            } else if ((nodes[i].position == _tempArr.join('/'))) {
              let isFound = false;
              if (!item.job) {
                for (let x in nodes[i].children) {
                  if (nodes[i].children[x].position == item.position || (nodes[i].children[x].position.indexOf(':') > -1 &&
                    nodes[i].children[x].position.substring(0, nodes[i].children[x].position.lastIndexOf(':')) == item.position.substring(0, item.position.lastIndexOf(':')))) {
                    if (nodes[i].children[x].title != 'Job') {
                      if (parentNode) {
                        parentNode.children.push(data);
                        checkAndUpdate(nodes[i].children[x], parentNode);
                      } else {
                        checkAndUpdate(nodes[i].children[x], data);
                      }
                      isFound = true;
                    }
                    break;
                  }
                }
              }
              if (!isFound) {
                if (parentNode && parentNode.children) {
                  parentNode.children.push(data);
                  checkAndUpdate(nodes[i], parentNode);
                } else {
                  checkAndUpdate(nodes[i], data);
                }
              }

              obj.flag = true;
              break;
            } else if (nodes[i].children && nodes[i].children.length > 0) {
              mainObj.isChildren = true;
              if (!parentNode && ((item.position.match('try') && (data.title != 'Try' && data.title != 'Retry')) || (item.position.match('catch') || data.title == 'Catch'))) {
                let isCheck = false;
                if (/(try\+)(\d)/gm.test(item.position)) {
                  let arr = /(try\+)(\d)/gm.exec(item.position);
                  if (arr.length > 1) {
                    let regex = arr[1] + arr[2];
                    let pos = item.position.replace(regex, (arr[1] + 0));
                    if (pos == (nodes[i].position + ':0') && item.job) {
                      nodes[i].retryCount = (nodes[i].retryCount || 1) + 1;
                      checkAndUpdate(nodes[i], data);
                      isCheck = true;
                    }
                  }
                }
                if (!isCheck) {
                  tryCatchRecursion(nodes, item, data);
                }
                obj.flag = true;
                break;
              } else {
                recursion(nodes[i], item, obj, data, parentNode, lastPos)
              }
              if (obj.flag) {
                break;
              }
            }
          }
        }
        if (!obj.flag) {
          if (parentNode && parentNode.children) {
            parentNode.children.push(data);
            nodes.push(parentNode);
          } else {
            if (data.title == 'Join' && nodes[nodes.length - 1].title == 'ForkList') {
              data.end = 'ForkList-End';
            }
            nodes.push(data);
          }
        }
      }
    });

    function recursion(node, item, obj, data, parentNode, lastPos) {
      for (let i in node.children) {
        let arr = item.position.split('/');
        arr.splice(arr.length - 1, 1);
        if ((item.position.match('try') || item.position.match('catch')) && item.job) {
          if (arr.join('/') == node.children[i].position) {
            for (let x in node.children[i].children) {
              if (node.children[i].children[x].position == item.position.substring(0, item.position.lastIndexOf(':'))) {
                checkAndUpdate(node.children[i].children[x], data);
                obj.flag = true;
                break;
              }
            }
          }
        }
        if ((lastPos && lastPos.match('branch') && item.job)) {
          if (node.children[i].position == item.position || (node.children[i].position.indexOf(':') > -1 && node.children[i].position.substring(0, node.children[i].position.lastIndexOf(':')) == item.position.substring(0, item.position.lastIndexOf(':')))) {
            checkAndUpdate(node.children[i], data);
            obj.flag = true;
            break;
          } else {
            recursion(node.children[i], item, obj, data, parentNode, lastPos);
            if (obj.flag) {
              break;
            }
          }
        } else {
          if ((node.children[i].position == item.position) || (node.children[i].position.indexOf(':') > -1 && node.children[i].position.substring(0, node.children[i].position.lastIndexOf(':')) == item.position.substring(0, item.position.lastIndexOf(':')))) {
            if (parentNode && parentNode.children) {
              parentNode.children.push(data);
              checkAndUpdate(node.children[i], parentNode);
            } else {
              checkAndUpdate(node.children[i], data);
            }
            obj.flag = true;
            break;
          } else if ((node.children[i].position == arr.join('/'))) {
            let isFound = false;
            if (!item.job) {
              for (let x in node.children[i].children) {
                if (node.children[i].children[x].position == item.position || (node.children[i].children[x].position.indexOf(':') > -1 &&
                  node.children[i].children[x].position.substring(0, node.children[i].children[x].position.lastIndexOf(':')) == item.position.substring(0, item.position.lastIndexOf(':')))) {
                  if (node.children[i].children[x].title != 'Job') {
                    if (parentNode && parentNode.children) {
                      parentNode.children.push(data);
                      checkAndUpdate(node.children[i].children[x], parentNode);
                    } else {
                      checkAndUpdate(node.children[i].children[x], data);
                    }
                    isFound = true;
                  }
                  break;
                }
              }
            }
            if (!isFound) {
              if (parentNode && parentNode.children) {
                parentNode.children.push(data);
                checkAndUpdate(node.children[i], parentNode);
              } else {
                checkAndUpdate(node.children[i], data);
              }
            }
            obj.flag = true;
            break;
          } else if (node.children[i].children && node.children[i].children.length > 0) {
            recursion(node.children[i], item, obj, data, parentNode, lastPos);
          }
        }
      }
    }

    function tryCatchRecursion(nodes, item, data) {
      for (let i in nodes) {
        if (data.title == 'Catch' && (nodes[i].title == 'Try' || nodes[i].title == 'Retry')) {
          if (nodes[i].position == (item.position.substring(0, item.position.lastIndexOf('/')) + '/try+0')) {
            if (item.caught && item.caught.cause == 'Retry') {
              if (nodes[i].title == 'Try') {
                nodes[i].title = 'Retry';
              }
            } else {
              checkAndUpdate(nodes[i], data);
            }
            break;
          }
        }
        let pos = item.position.substring(0, item.position.lastIndexOf(':'));
        if ((pos == nodes[i].position)) {
          checkAndUpdate(nodes[i], data);
          break;
        } else if (nodes[i].children && nodes[i].children.length > 0) {
          tryCatchRecursion(nodes[i].children, item, data);
        }
      }
    }

    function ifInstructionRecursion(nodes, item, data) {
      let _tempArr = data.position.split('/');
      _tempArr.splice(_tempArr.length - 1, 1);
      let flag = false;
      recursion(nodes, item, data);
      if (!flag) {
        let obj = {
          title: 'If',
          key: 'if' + item.orderId + item.logEvent + item.position,
          name: '',
          logLevel: item.logLevel,
          position: item.position.substring(0, item.position.lastIndexOf(':')),
          isLeaf: false,
          count: item.count,
          logEvent: item.logEvent,
          children: [data]
        };

        for (let i in nodes) {
          if (obj.position == nodes[i].position && (obj.title == nodes[i].title || (nodes[i].title == 'Try' && obj.title == 'Retry') || (nodes[i].title == 'Retry' && obj.title == 'Try'))) {
            checkAndUpdate(nodes[i], data);
            flag = true;
            break;
          }
        }

        if (!flag) {
          nodes.push(obj);
        }
      }

      function recursion(list, item, data) {
        for (let i in list) {
          if (_tempArr.join('/') == list[i].position) {
            checkAndUpdate(list[i], data);
            flag = true;
            break;
          } else if (list[i].children && list[i].children.length > 0) {
            recursion(list[i].children, item, data);
          }
        }
      }
    }

    function checkAndUpdate(node, data) {
      let flag = false;
      for (let i in node.children) {
        if (node.children[i].position == data.position && (node.children[i].title == data.title || (node.children[i].title == 'Try' && data.title == 'Retry') || (node.children[i].title == 'Retry' && data.title == 'Try'))) {
          node.children[i].name = data.name;
          node.children[i].logEvent = data.logEvent;
          node.children[i].logLevel = data.logLevel;
          node.children[i].children = data.children;
          ++node.children[i].count;
          flag = true;
          break;
        }
      }
      if (!flag) {
        const _tempArr = data.position.split('/');
        if (_tempArr.length > 1) {
          const lastPos = _tempArr[_tempArr.length - 1];
          if (lastPos.match(/fork+/) && !lastPos.match(/branch/) && node.title == 'Fork') {
            node.title = 'ForkList'
          }
        }
        if (node.children) {
          if (data.title == 'Join' && node.children[node.children.length - 1].title == 'ForkList') {
            data.end = 'ForkList-End';
          }
          node.children.push(data);
        }
      }
    }

    return nodes;
  }
}
