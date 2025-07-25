import {Injectable, ViewContainerRef} from '@angular/core';
import {HttpClient, HttpRequest, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {Router} from '@angular/router';
import {ClipboardService} from 'ngx-clipboard';
import {filter, Observable} from 'rxjs';
import * as moment from 'moment-timezone';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from '@ngx-translate/core';
import {clone, isArray, isEmpty, isEqual, isNumber, object, sortBy} from 'underscore';
import {saveAs} from 'file-saver';
import {AuthService} from '../components/guard';
import {POPOUT_MODALS, PopoutData, PopupService} from "./popup.service";
import {LogViewComponent} from "../components/log-view/log-view.component";
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {KioskService} from "./kiosk.service";
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  tabs: any = {};
  selectedTags: any = [];
  selectedOrderTags: any = [];
  checkedTags = new Set();
  checkedOrderTags = new Set();
  dashboard: any = {};
  locales: any = [];
  expertMode: string | undefined | null;
  reportStartRunning = false;
  scheduleExpandedProperties: any = new Map();
  allTagsSelected = true;
  allOrderTagsSelected = true;
  logViewDetails = {
    historyId: '',
    expandedAllLog: false,
    expandedLogPanel: new Set(),
    expandedAllTree: false,
    expandedLogTree: []
  }

  currentDate = new Date();
  preferences: any = {};
  xmlEditorPreferences: any = {};
  sideView = {
    workflow: {width: 270, show: true},
    job: {width: 270, show: true},
    orderOverview: {width: 270, show: true},
    lock: {width: 270, show: true},
    board: {width: 270, show: true},
    report: {width: 270, show: true},
    history: {width: 270, show: true},
    calendar: {width: 270, show: true},
    documentation: {width: 270, show: true},
    inventory: {width: 300, show: true},
    xml: {width: 500, show: true},
    deployment: {width: 270, show: true}
  };

  searchResults: any = {};
  numOfTags: any;
  numOfWorkflowTags: any;
  windowProperties: any = ',scrollbars=1,resizable=1,status=0,toolbar=0,menubar=0,location=0toolbar=0';
  private sortedTags: string[] = [];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router, private toasterService: ToastrService,
              private clipboardService: ClipboardService, private translate: TranslateService, private popupService: PopupService, private sanitizer: DomSanitizer, private kioskService: KioskService, private fb: FormBuilder) {
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

    if (localStorage['$SOS$DASHBOARDTABS']) {
      try {
        const obj = JSON.parse(localStorage['$SOS$DASHBOARDTABS']);
        if (obj && obj.order) {
          this.dashboard = obj;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!sessionStorage['$SOS$SIDEVIEW'] || typeof JSON.parse(sessionStorage['$SOS$SIDEVIEW']) !== 'object') {
      sessionStorage['$SOS$SIDEVIEW'] = JSON.stringify(this.sideView);
    } else {
      let sideView = JSON.parse(sessionStorage['$SOS$SIDEVIEW']);
      if (sideView && sideView.workflow) {
        this.sideView = sideView;
      }
    }
  }

  private init(): void {
    this.selectedTags = [];
    this.selectedOrderTags = [];
    this.checkedTags = new Set();
    this.checkedOrderTags = new Set();
    this.scheduleExpandedProperties = new Map();
    this.logViewDetails = {
      historyId: '',
      expandedAllLog: false,
      expandedLogPanel: new Set(),
      expandedAllTree: false,
      expandedLogTree: []
    };
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
      },
      report: {
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

    this.tabs._workflow = {
      selectedIndex: 0
    };
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
    this.tabs._workflowDetail.leftTreePanelSizeVisible = false;
    this.tabs._workflowDetail.pageView = 'list';

    this.tabs._daliyPlan = {};
    this.tabs._daliyPlan.filter = {};
    this.tabs._daliyPlan.projection = {
      calView: 'Month',
      currentYear: this.currentDate.getFullYear(),
      currentMonth: this.currentDate.getMonth(),
      showDetail: {
        sortBy: 'workflow',
        reverse: false,
        currentPage: 1,
        searchText: ''
      }
    };
    this.tabs._daliyPlan.filter.status = 'ALL';
    this.tabs._daliyPlan.filter.groupBy = '';
    this.tabs._daliyPlan.filter.filterBy = '';
    this.tabs._daliyPlan.filter.late = false;
    this.tabs._daliyPlan.filter.sortBy = 'plannedStartTime';
    this.tabs._daliyPlan.reverse = true;
    this.tabs._daliyPlan.tabIndex = 0;
    this.tabs._daliyPlan.currentPage = '1';
    this.tabs._daliyPlan.selectedView = true;

    this.tabs._plans = {};
    this.tabs._plans.filter = {
      isCompact: true,
      sortBy: 'path',
      reverse: true,
      currentPage: '1',
      entryPerPage: 10,
      filterBy: []
    };
    this.tabs._plans.filter.calView ='Global';

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

    this.tabs._approvals = {};
    this.tabs._approvals.tabIndex = 0;
    this.tabs._approvals.approvalRequests = {
      filter: {
        requestorStates: [],
        approverStates: [],
        sortBy: 'modified',
        reverse: true,
        currentPage: '1'
      }
    };

    this.tabs._approvals.approvers = {
      filter: {
        sortBy: 'modified',
        reverse: true,
        currentPage: '1'
      }
    };
    this.tabs._reporting = {

      manageList: {
        expandedKeys: ['/'],
        selectedkeys: ['/'],
        filter: {
          sortBy: 'name',
          reverse: true,
          currentPage: '1'
        }
      },
      runHistory: {
        filter: {
          state: 'ALL',
          sortBy: 'modified',
          reverse: true,
          currentPage: '1'
        }
      },
      generateReport: {
        groupBy: 'path',
        filter: {
          state: 'All',
          sortBy: 'created',
          reverse: true,
          currentPage: '1'
        }
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
    this.tabs._configuration.inventory = {
      selectedIndex: 0
    };
    this.tabs._configuration.copiedParamObjects = {};
    this.tabs._configuration.copiedInstuctionObject = [];

    this.tabs._agentCluster = {};
    this.tabs._agentCluster.filter = {};
    this.tabs._agentCluster.filter.sortBy = 'ordering';
    this.tabs._agentCluster.reverse = false;
    this.tabs._agentCluster.currentPage = '1';

    this.tabs._controller = {
      searchText: '',
      filter: {
        state: 'ALL'
      }
    };
    this.tabs._deployment = {};
  }

  removeDuplicates() {
    this.selectedTags = this.selectedTags.filter((obj, index, self) =>
      index === self.findIndex((o) => o.name === obj.name)
    );
  }

  removeOrderDuplicates() {
    this.selectedOrderTags = this.selectedOrderTags.filter((obj, index, self) =>
      index === self.findIndex((o) => o.name === obj.name)
    );
  }

  setSearchResult(type: string, result: any): void {
    this.searchResults[type] = result;
  }

  getSearchResult(type: string): any {
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

  getPlansTab(): any {
    return this.tabs._plans;
  }
  getMonitorTab(): any {
    return this.tabs._monitor;
  }

  getApprovalsTab(): any {
    return this.tabs._approvals;
  }

  getHistoryTab(): any {
    return this.tabs._history;
  }

  getReportingTab(): any {
    return this.tabs._reporting;
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

  getControllerTab(): any {
    return this.tabs._controller;
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
      return localStorage['$SOS$LANG'] === item.lang;
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

  log(url: string | undefined, options: any, headers: any): Observable<any> {
    return this.http.post(url, options, headers);
  }

  request(url: string, formData: any, headers: any): Observable<any> {
    const req = new HttpRequest('POST', url, formData, {
      headers,
      reportProgress: true
    });
    return this.http
      .request(req)
      .pipe(filter(e => e instanceof HttpResponse))
  }

  getAgents(data: any, controllerId: string, cb?: any): void {
    this.post('agents/names', {controllerId}).subscribe({
      next: (res: any) => {
        data.agentList = [{
          title: 'agents',
          hide: false,
          children: res.agentNames
        }];
        if (res.clusterAgentNames && res.clusterAgentNames.length > 0) {
          let obj: any = {
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

  getFilterAgentList(list: any[], value: string, skip = false): any {
    return !value ? list : list.filter((option: any) => {
      let flag = false;
      option.children = option.children.filter((option2: any) => {
        let isCheck = false;
        if (option2.children && !skip) {
          option2.children = option2.children.filter((option3: any) => {
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
          let isCheck3;
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

  plainData(url: string, options: any): Observable<any> {
    const headers: any = {
      Accept: 'text/plain',
      responseType: 'text/plain',
      observe: 'response'
    };
    return this.http.post(url, options, headers);
  }

  startReport(): void {
    this.reportStartRunning = true;
    setTimeout(() => {
      this.reportStartRunning = false;
    }, 10000);
  }

  getColor(d: number, type: string): string {
    if(!sessionStorage['preferences']){
      return '';
    }
    const preferenceObj = JSON.parse(sessionStorage['preferences']);
    const orderStateColors = preferenceObj.orderStateColors || [];
    this.applyThemeColors(orderStateColors)
    const stateColorMap = {
      0: 'running',
      1: 'scheduled',
      2: 'failed',
      3: 'inProgress',
      4: 'planned',
      5: 'suspended',
      6: 'finished',
      7: 'blocked',
      8: 'waiting',
      // 9: 'prompting',
      10: 'pending',
      11: 'light-orange',
      12: 'prompting',
    };
    const state = stateColorMap[d] || 'default';
    const colorObj = orderStateColors.find(item => item.state === state);

    if (colorObj) {
      const className = state;
      if (type === 'text') {
        return `text-${className}`;
      } else if (type === 'border') {
        return `border-${className}-box`;
      } else {
        return `bg-${className}`;
      }
    } else {
      return this.defaultColor(d, type);
    }
  }

  applyThemeColors(themeColors: any[]): void {
    const existingStyleElement = document.getElementById('theme-color-styles');
    if (existingStyleElement) {
      existingStyleElement.remove();
    }

    let style = document.createElement('style');
    style.id = 'theme-color-styles';
    themeColors.forEach(colorObj => {
      style.innerHTML += `
      .bg-${colorObj.state} { background-color: ${colorObj.color}; }
      .border-${colorObj.state}-box { border-color: ${colorObj.color}; }
      .text-${colorObj.state} { color: ${colorObj.color}; }
    `;
    });
    document.head.appendChild(style);

  }

  defaultColor(d: number, type: string): string {
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


  getColorBySeverity(d: number, isHover: boolean, isDisabled: boolean = false): string {
    if (d === 0) {
      return isDisabled ? (isHover ? 'rgba(144,238,144, .7)' : '#90ee90') : (isHover ? 'rgba(122,185,122, .7)' : '#7ab97a');
    } else if (d === 1) {
      return isDisabled ? (isHover ? 'rgba(255,229,150, .7)' : '#ffe596') : (isHover ? 'rgba(255,201,26, .7)' : '#ffc91a');
    } else if (d === 2) {
      return isDisabled ? (isHover ? 'rgba(239,174,190, .7)' : '#efaeae') : (isHover ? 'rgba(239,72,106, .7)' : '#ef486a');
    } else if (d === 3) {
      return isDisabled ? (isHover ? 'rgba(203,222,245, .7)' : '#cbdef5') : (isHover ? 'rgba(163,198,234, .7)' : '#a3c6ea');
    } else if (d === 4) {
      return isDisabled ? (isHover ? '#ddd' : '#ccc') : (isHover ? '#ccc' : '#bbb');
    } else if (d === 5) {
      return isDisabled ? (isHover ? 'rgba(255,188,117, .7)' : '#ffbc75') : (isHover ? 'rgba(255,141,26, .7)' : '#FF8d1a');
    } else if (d === 6) {
      return isDisabled ? (isHover ? 'rgba(133,188,228, .7)' : '#85bce4') : (isHover ? 'rgba(21,145,212, .7)' : '#1591d4');
    } else if (d === 7) {
      return isDisabled ? (isHover ? 'rgba(221,167,221, .7)' : '#dda7dd') : (isHover ? 'rgba(185,102,185, .7)' : '#b966b9');
    } else if (d === 8) {
      return isDisabled ? (isHover ? 'rgba(238,238,204, .7)' : '#eeeecc') : (isHover ? 'rgba(204,204,0, .7)' : '#cccc00');
    } else if (d === 9) {
      return isDisabled ? (isHover ? 'rgba(243,182,197, .7)' : '#f3b6c5') : (isHover ? 'rgba(243,120,145, .7)' : '#f37891');
    } else if (d === 10) {
      return isDisabled ? (isHover ? 'rgba(255,255,150, .7)' : '#ffff96') : (isHover ? 'rgba(255,255,0, .7)' : '#ffff00');
    } else if (d === 11) {
      return isDisabled ? (isHover ? 'rgba(255,206,145, .7)' : '#ffce91') : (isHover ? 'rgba(255,166,64, .7)' : '#FFA640');
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
      window.sessionStorage['$SOS$SIDEVIEW'] = JSON.stringify(view);
      this.sideView = view;
    } else {
      window.sessionStorage['$SOS$SIDEVIEW'] = JSON.stringify(this.sideView);
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
      const output: any = [];
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

  showOrderLogWindow(orderId: string, controllerId: string, workflow: string, viewRef: any): void {
    const preferenceObj = JSON.parse(sessionStorage['preferences']);
    const self = this;
    let url = '';

    function openWindow() {
      if (url) {
        if (preferenceObj.isNewWindow === 'newWindow') {
          const modalData: PopoutData = {
            modalName: 'Order Log',
            controllerId,
            historyId: url,
            orderId: orderId,
            workflow: workflow
          };
          self.openPopout(modalData, 'top=' + window.localStorage['log_window_y'] + ',' +
            'left=' + window.localStorage['log_window_x'] + ',innerwidth=' + window.localStorage['log_window_wt'] + ',' +
            'innerheight=' + window.localStorage['log_window_ht'] + self.windowProperties, viewRef);
        } else if (preferenceObj.isNewWindow === 'newTab') {
          window.open(url, '_blank');
        }
      } else if (url === undefined) {
        setTimeout(() => {
          openWindow();
        }, 50);
      }
    }


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
          openWindow();
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

  showLogWindow(order: any, task: any, job: any, id: string, transfer: any, viewRef: ViewContainerRef): void {
    if (!order && !task) {
      return;
    }

    const preferenceObj = JSON.parse(sessionStorage['preferences']);
    const controllerId = id || JSON.parse(this.authService.scheduleIds).selected;
    let url = '';

    if (order && order.historyId && order.orderId) {
      url = '?historyId=' + encodeURIComponent(order.historyId) + '&orderId=' + encodeURIComponent(order.orderId) + '&workflow=' + encodeURIComponent(order.workflow) + '&controllerId=' + controllerId;
    } else if (task && task.taskId) {
      if (transfer) {
        if (task.job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + (task.workflow ? '&workflow=' + encodeURIComponent(task.workflow) : '') + '&controllerId=' + controllerId;
        } else if (job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + job + (task.workflow ? '&workflow=' + encodeURIComponent(task.workflow) : '') + '&controllerId=' + controllerId;
        } else {
          url = '?taskId=' + encodeURIComponent(task.taskId) + (task.workflow ? '&workflow=' + encodeURIComponent(task.workflow) : '') + '&controllerId=' + controllerId;
        }
      } else {
        if (task.job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(task.job) + (task.workflow ? '&workflow=' + encodeURIComponent(task.workflow) : '') + '&controllerId=' + controllerId;
        } else if (job) {
          url = '?taskId=' + encodeURIComponent(task.taskId) + '&job=' + encodeURIComponent(job) + (task.workflow ? '&workflow=' + encodeURIComponent(task.workflow) : '') + '&controllerId=' + controllerId;
        } else {
          url = '?taskId=' + encodeURIComponent(task.taskId) + (task.workflow ? '&workflow=' + encodeURIComponent(task.workflow) : '') + '&controllerId=' + controllerId;
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
        workflow: order?.workflow || task?.workflow,
        orderId: (order && order.orderId) ? order.orderId : undefined,
        taskId: task ? task.taskId : undefined,
        historyId: (order && order.historyId) ? order.historyId : undefined,
        job: (task && task.taskId) ? (task.job ? task.job : job) : undefined
      };
      this.openPopout(modalData, 'top=' + window.localStorage['log_window_y'] + ',' +
        'left=' + window.localStorage['log_window_x'] + ',innerwidth=' + window.localStorage['log_window_wt'] + ',' +
        'innerheight=' + window.localStorage['log_window_ht'] + this.windowProperties, viewRef);
    } else if (preferenceObj.isNewWindow === 'newTab') {
      window.open('#/log' + url, '_blank');
    } else {
      const data = order || task || job || transfer;
      this.downloadLog(data, controllerId);
    }
  }

  private openPopout(modalData: PopoutData, properties: any, viewContainerRef: ViewContainerRef) {
    if (!this.popupService.isPopoutWindowOpen()) {
      this.popupService.openPopoutModal(modalData, properties, viewContainerRef);
    } else {
      this.popupService.detachView();
      this.popupService.createCDKPortal(modalData, POPOUT_MODALS['windowInstance'], LogViewComponent, viewContainerRef);
      this.popupService.focusPopoutWindow();
    }
  }

  renderData(res, domId, object, obj, preferences, windowInstance?): void {
    const doc = windowInstance ? windowInstance.document : document;
    const styleId = 'log-indent-styles';
    if (!doc.getElementById(styleId)) {
      const styleEl = doc.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
      .scheduler_stdout {
        margin-left: 289px;
      }
      .scheduler_success {
        margin-left: 289px;
      }
      .scheduler_error {
        margin-left: 289px;
      }
      .scheduler_main {
        margin-left: 289px;
      }
      .scheduler_detail {
        margin-left: 289px;
      }
      .scheduler_debug {
        margin-left: 289px;
      }
      .log_info {
        margin-left: 289px;
      }
      .scheduler_stderr {
        margin-left: 289px;
      }
    `;
      doc.head.appendChild(styleEl);
    }
    let argu = {
      lastLevel: '',
      lastClass: ''
    };
    let arr = res.split('\n');

    let index = 0;


    let lastLevel = '';
    let lastClass = '';
    let continueClass = [];
    const timestampRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9].(\d)+([+,-])(\d+)(:\d+)*/;
    ('\n' + res).replace(/\r?\n([^\r\n]+((\[)(main|success|error|info\s?|fatal\s?|warn\s?|debug\d?|trace|stdout|stderr)(\])||([a-z0-9:\/\\]))[^\r\n]*)/img, (match, prefix, level, suffix, offset) => {
      let div;// Now create a div element and append it to a non-appended span.
      if (windowInstance) {
        div = windowInstance.document.createElement('div');
      } else {
        div = window.document.createElement('div');
      }
      if (timestampRegex.test(match)) {
        const arr = match.split(/\s+\[/);
        let date;
        if (arr && arr.length > 0) {
          date = arr[0];
        }
        if (date && /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.(\d+)([+,-]){1}(\d+)$/.test(date)) {
          const datetime = preferences.logTimezone ? this.getLogDateFormat(date, preferences.zone) : date;
          if (preferences.logTimezone && datetime && timestampRegex.test(datetime)) {
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
        if (!object.checkBoxs.main) {
          div.className += ' hide-block';
        }
      } else if (level === 'success') {
        div.className += ' success';
        if (!object.checkBoxs.success) {
          div.className += ' hide-block';
        }
      } else if (level === 'stdout') {
        div.className += ' stdout';
        if (!object.checkBoxs.stdout) {
          div.className += ' hide-block';
        }
      } else if (level === 'stderr') {
        div.className += ' stderr';
        if (!object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else if (level === 'fatal') {
        obj.isFatalLevel = true;
        div.className += ' fatal';
        if (!object.checkBoxs.fatal) {
          div.className += ' hide-block';
        }
      } else if (level === 'error') {
        div.className += ' error';
        if (!object.checkBoxs.error) {
          div.className += ' hide-block';
        }
      } else if (level === 'warn') {
        obj.isWarnLevel = true;
        div.className += ' warn';
        if (!object.checkBoxs.warn) {
          div.className += ' hide-block';
        }
      } else if (level === 'trace') {
        obj.isTraceLevel = true;
        div.className += ' trace';
        if (!object.checkBoxs.trace) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[stdout\]/i) > -1) {
        div.className += ' stdout';
        if (!object.checkBoxs.stdout) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[stderr\]/i) > -1) {
        obj.isStdErrLevel = true;
        div.className += ' stderr log_stderr';
        if (!object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[debug\]/i) > -1) {
        div.className += ' debug log_debug';
        if (!object.checkBoxs.debug) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[trace\]/i) > -1) {
        obj.isTraceLevel = true;
        div.className += ' trace log_trace';
        if (!object.checkBoxs.trace) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[main\]/i) > -1) {
        div.className += ' main log_main';
        if (!object.checkBoxs.main) {
          div.className += ' hide-block';
        }
      } else if (prefix.search(/\[info\]/i) > -1) {
        obj.isInfoLevel = true;
        div.className += ' info log_info';
        if (!object.checkBoxs.info) {
          div.className += ' hide-block';
        }
      } else {
        div.className += ' scheduler scheduler_' + level;
        if (!object.checkBoxs.scheduler) {
          div.className += ' hide-block';
        }
      }

      if (level.match('^debug') && !object.checkBoxs.debug) {
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
      div.className += ' scheduler scheduler_' + level;
      if (arr.length - 1 == index && !res.endsWith("\n")) {
        div.className += ' continue';
      }
      let flag = true;
      if (index == 0) {
        let dom;
        if (windowInstance) {
          if (!domId) {
            dom = windowInstance.document.getElementById('logs');
          } else {
            dom = windowInstance.document.getElementById(domId);
          }
        } else {
          if (!domId) {
            dom = window.document.getElementById('logs');
          } else {
            dom = window.document.getElementById(domId);
          }
        }

        if (dom) {
          // Get all the <div> children of the parent
          let divs = dom.getElementsByTagName('div');
          // Get the last <div> child
          let lastDiv = divs[divs.length - 1];
          if (lastDiv) {
            // Log the last <div> to the console
            // console.log('lastDiv', lastDiv.innerText, lastDiv.classList);
            if (lastDiv.classList.contains('continue')) {
              let text = lastDiv.innerText;
              match = match.replace(/^\r?\n/, '');
              console.log(text + ' >< ' + match);
              lastDiv.innerText = (text + '' + match);
              continueClass = lastDiv.classList;
              flag = false;
            }

          }
        }
      }
      ++index;
      if (flag) {
        if (windowInstance) {
          if (!domId) {
            windowInstance.document.getElementById('logs')?.appendChild(div);
          } else {
            windowInstance.document.getElementById(domId)?.appendChild(div);
          }
        } else {
          if (!domId) {
            window.document.getElementById('logs')?.appendChild(div);
          } else {
            window.document.getElementById(domId)?.appendChild(div);
          }
        }
      }
      return '';
    });
  }

  showDocumentation(path: string, preferences: any): void {
    const link = window.location.origin + '/joc/api/documentation/show?documentation=' + encodeURIComponent(path) + '&accessToken=' + this.authService.accessTokenId;
    let win;
    if (preferences.isDocNewWindow === 'newWindow') {
      win = window.open(link, '', 'top=0,left=0,scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no');
    } else {
      win = window.open(link, '_blank');
    }
    //  const iframe = document.createElement('iframe');
    //  iframe.src = link;
    //  this.addFrame(win, iframe);
  }

  private addFrame(popupWindow, iframe): void {
    if (popupWindow.document && popupWindow.document.body && popupWindow.document.body.getAttribute('id')) {
      popupWindow.document.body.appendChild(iframe);
    } else {
      setTimeout(() => {
        this.addFrame(popupWindow, iframe);
      }, 400);
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

  parseProcessExecutedRegex(regex: string, obj: any, completedDate?: any): any {
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
          const regArr = /\((\d+)\)$/.exec(temp);
          if (regArr && regArr.length > 0) {
            temp = temp.replace(/\(\d+\)$/, '(' + (+(regArr[1]) + 1) + ')');
          }
          recursion();
        }
      }
    }

    recursion();
    return temp;
  }

  copyLink(objType: string, name: string, workflow: any = '', versionId?): void {
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
      if (versionId) {
        link += '&versionId=' + encodeURIComponent(versionId);
      }
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
      link = host + 'resources/documentations/documentation?path=' + encodeURIComponent(name);
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
    config.inventory.isTag = false;
    config.inventory.selectedIndex = 0;
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
      boardFilters.searchText = boardName;
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
      lockFilters.searchText = lockName;
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
    return ['LOCAL', 'FTP', 'FTPS', 'SFTP', 'HTTP', 'HTTPS', 'WEBDAV', 'WEBDAVS', 'SMB', 'AZURE_BLOB_STORAGE'];
  }

  xsdAnyURIValidation(value: string): boolean {
    return /^((ht|f)tp(s?)\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/.test(value)
      || /^(?:(<protocol>http(?:s?)|ftp)(?:\:\/\/))(?:(<usrpwd>\w+\:\w+)(?:\@))?(<domain>[^/\r\n\:]+)?(<port>\:\d+)?(<path>(?:\/.*)*\/)?(<filename>.*?\.(<ext>\w{2,4}))?(<qrystr>\??(?:\w+\=[^\#]+)(?:\&?\w+\=\w+)*)*(<bkmrk>\#.{})?$/.test(value)
      || /^([a-zA-Z]\:|\\\\[^\/\\:*?"<>|]+\\[^\/\\:*?"<>|]+)(\\[^\/\\:*?"<>|]+)+(|([a-zA-Z0-9]{0,*}))$/.test(value)
      || /^((?:2[0-5]{2}|1\d{2}|[1-9]\d|[1-9])\.(?:(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d)\.){2}(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d))(:((\d|[1-9]\d|[1-9]\d{2,3}|[1-5]\d{4}|6[0-4]\d{3}|654\d{2}|655[0-2]\d|6553[0-5]))|(\d{0}))$/.test(value)
      || /^(((..\/){0,1})([A-Za-z0-9é\%]+)(\.([a-zA-Z]+((\#{0,1})([a-zA-Z]{0,})))))$/.test(value)
      || /^((mailto:){0,1}([A-Za-z0-9]{0,}(\@){0,1}([a-zA-Z0-9]{0,})(\.{0,1}(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk))))$/.test(value);
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

  getPreferredDateByFormat(date: any, timeZone: string | null, format: string): string {
    if (!date) {
      return '-';
    }
    const inputFormat = 'YYYY-MM-DD HH:mm:ss';
    let dateMoment = moment.utc(date, inputFormat);
    if (timeZone) {
      dateMoment = dateMoment.tz(timeZone);
    }
    return dateMoment.format(format);
  }

  getStringDate(date?): string {
    if (!date) {
      return moment().format('YYYY-MM-DD');
    }
    return moment(date).format('YYYY-MM-DD');
  }

  convertTimeToLocalTZ(preferences: any, date: any): any {
    return moment(date).tz(preferences.zone);
  }

  getDate(date: any, format?: string): any {
    if (format) {
      return moment(date, format);
    }
    return moment(date);
  }

  stringToDate(preferences: any, date: any): string {
    if (!date) {
      return '-';
    }
    if (!preferences.zone) {
      return moment(date).tz(this.getTimeZone()).format('DD.MM.YYYY HH:mm:ss');
    }
    const dateY = new Date(date);
    if (dateY.getFullYear() === 10000) {
      return 'common.label.never'
    } else {
      return moment(date).tz(preferences.zone).format(preferences.dateFormat);
    }
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

  getDuration(startDate: any, endDate: any): number {

    return moment(endDate).diff(startDate) / 1000;
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
        $('#orderTable').find('thead th.dynamic-thead-o').each(function (this: any) {
          const w = $(this).outerWidth();
          arr.push(w);
        });
      }
      $('#orderTable').find('thead th.dynamic-thead').each(function (this: any) {
        const w = $(this).outerWidth();
        arr.push(w);
      });
      let count = -1;
      $('tr.tr-border').find('td').each(function (this: any, i: any) {
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
    dom.find('thead tr.sub-header th.dynamic-thead').each(function (this: any) {
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
    return object(argu.map((val: any) => {
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
    const addDays = function (this: any, days: any) {
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

  removeSlashToString(data: any, type: string, tagName?: string): void {
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
              } else if (/^(now\s*\()/i.test(mainStr) || /^(variable\s*\()/i.test(data[type]) || /^(env\s*\()/i.test(mainStr)
                || /^(toFile\s*\()/i.test(mainStr) || /^(replaceAll\s*\()/i.test(mainStr) || /^(jobResourceVariable\s*\()/g.test(mainStr)
                || /^(scheduledOrEmpty\s*\()/g.test(mainStr) || /^([0-9])+(.toString)$/g.test(data[type]) || /^(JobResource:)/g.test(data[type])) {
                data[type] = mainStr;
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
              if ((startChar === '"' && endChar === '"') && tagName !== 'AddOrder' || undefined) {
                data['default1'] = '""';
              }
            } catch (e) {
              if ((startChar === '"' && endChar === '"')) {
                data[type] = mainStr;
                data['default1'] = '""';
              }
            }
          }
        }
      }
    }
  }

  addSlashToStringForEvn(obj: any): void {
    obj.env.forEach((env: any) => {
      if (env.value) {
        if (!(/[$+]/.test(env.value)) || (/\s/g.test(env.value) && !/[+]/.test(env.value))) {
          const startChar = env.value.substring(0, 1);
          const endChar = env.value.substring(env.value.length - 1);
          if (startChar === "$" || (startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {

          } else if (env.value === 'true' || env.value === 'false') {
          } else if (/^\d+$/.test(env.value) || (/^(now\s*\()/i.test(env.value) || /^(variable\s*\()/i.test(env.value) || /^(env\s*\()/i.test(env.value)
            || /^(toFile\s*\()/i.test(env.value) || /^(replaceAll\s*\()/i.test(env.value) || /^(jobResourceVariable\s*\()/g.test(env.value)
            || /^(scheduledOrEmpty\s*\()/g.test(env.value) || /^([0-9])+(.toString)$/g.test(env.value) || /^(JobResource:)/g.test(env.value))) {
          } else {
            let x = env.value.replace(/\\([\s\S])|(")/g, '\\$1$2').trim();
            if (x.match(/\\/)) {
              env.value = JSON.stringify(env.value);
            } else {
              env.value = endChar === "$" ? env.value : '"' + env.value + '"';
            }
          }
        }
      } else if (env.value === "" || env.value === '') {
        //env.value = JSON.stringify(env.value);
      }
    });
  }

  addSlashToString(data: any, type: string): void {
    if (data[type]) {
      if (data[type] === 'true' || data[type] === 'false') {
      } else if (/^\d+$/.test(data[type])) {
      } else if (/^(now\s*\()/i.test(data[type]) || /^(variable\s*\()/i.test(data[type]) || /^(env\s*\()/i.test(data[type])
        || /^(toFile\s*\()/i.test(data[type]) || /^(replaceAll\s*\()/i.test(data[type]) || /^(jobResourceVariable\s*\()/g.test(data[type])
        || /^(scheduledOrEmpty\s*\()/g.test(data[type]) || /^([0-9])+(.toString)$/g.test(data[type]) || /^(JobResource:)/g.test(data[type])) {
      } else if (data[type] === "" || data[type] === '') {

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
        $('.CodeMirror-search-field').on('keydown', (e: any) => {
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

  getDateAndTime(data: any, val = 'from'): any {
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

  selectTime(time: any, isEditor = false, data: any, val = 'from'): void {
    if (time && !isEditor) {
      const h = time.getHours() + '';
      const m = time.getMinutes() + '';
      const s = time.getSeconds() + '';
      data[val === 'from' || val === 'fromTime' ? 'fromTime' : val === 'start' ? 'startTime' : val.match('end') ? val : 'toTime'] = (h.length == 1 ? '0' + h : h) + ':' + (m.length == 1 ? '0' + m : m) + ':' + (s.length == 1 ? '0' + s : s);
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

  getUnixTime(date: any) {
    return moment(date).unix();
  }

  getUTCTime(time: any) {
    return moment.utc(time);
  }

  getAuditLogObj(comments: any, auditLog: any): void {
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

  getHtml(exp: string, permission: any, name): string {
    exp = exp.replace(/('[^']*')\s*(&&|\|\|)\s*('[^']*')/g, "$1 $2 $3");
    exp = exp.replace(/("[^"]*")\s*(&&|\|\|)\s*("[^"]*")/g, "$1 $2 $3");

    const arr = exp.match(/('[^']*'|"[^"]*"|\&\&|\|\||\S+)/g);
    let str = '';
    arr.forEach((item: string) => {
      item = item.replace(/[{}[\]()]/g, '');
      item = item.trim();
      if (item) {
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
            str += '<i data-id-x="' + item + '" class="cursor fa fa-pencil text-hover-primary p-l-sm"></i>';
          }
          if (permission?.currentController && permission.currentController.noticeBoards?.post) {
            str += '<button class="btn-drop more-option-h" type="button">\n' +
              '<i data-id-m="' + item + '" class="fa fa-ellipsis-h"></i></button>' +
              '<span class="ant-checkbox" ><input data-id-a="chk_' + name + '" data-id-n="' + item + '" type="checkbox" class="ant-checkbox-input" ><span class="ant-checkbox-inner"></span></span>';
          }

          str += firstStr + '<a class="text-hover-primary m-l-xs" data-id-y="' + item + '" >' + item + '</a>'
          str += lastStr;
        } else {
          str += ' ' + item;
        }
      }
    })
    return str;
  }

  //Locker store and retrive

  saveValueInLocker(body: any, cb: any): void {
    this.post('iam/locker/put', body).subscribe({
      next: (res) => {
        sessionStorage['$SOS$KEY'] = res.key;
        cb();
      }, error: () => {
        cb();
      }
    })
  }

  getValueFromLocker(key: string, cb: any) {
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

  renewLocker(key: string) {
    let miliseconds = (new Date().getTime() < parseInt(sessionStorage['$SOS$RENEW'])) ? (parseInt(sessionStorage['$SOS$RENEW']) - new Date().getTime()) : (new Date().getTime() - parseInt(sessionStorage['$SOS$RENEW']));
    setTimeout(() => {
      if (key && sessionStorage['$SOS$KEY'] && (sessionStorage['$SOS$KEY'] == key)) {
        this.post('iam/locker/renew', {key}).subscribe({
          next: (res) => {
            sessionStorage['$SOS$RENEW'] = (new Date().getTime() + 1800000) - 30000;
            this.renewLocker(res.key);
          }
        })
      }

    }, miliseconds);
  }

  /** -------- Log View --------- */

  private upperFLetter(string: string): string {
    return string[0].toUpperCase() +
      string.slice(1);
  }

private checkParentNode(lastPos, data, item, nodes): any {
  let parentNode: any;

  const [text, idx] = lastPos.split(':');

  if (text === 'lock') {
    const groupPosition = item.position.substring(0, item.position.indexOf(':'));

    let lockNode = this.findNodeRecursive(nodes, 'Lock', groupPosition);

    if (!lockNode) {
      lockNode = {
        title: 'Lock',
        key: `lock-${item.orderId}-${groupPosition}`,
        name: '',
        logLevel: item.logLevel,
        label: '',
        position: groupPosition,
        isLeaf: false,
        count: 0,
        logEvent: 'orderLocksAcquired',
        orderId: item.orderId,
        children: []
      };
    }

    return lockNode;
  }

  if (lastPos == 'try+0:0') {
    parentNode = {
      title: 'Try',
      key: 'try' + item.orderId + item.logEvent + item.position,
      name: '',
      logLevel: item.logLevel,
      label: item.label,
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

    for (let x in nodes) {
      if (nodes[x].title == parentNode.title && nodes[x].name == parentNode.name && nodes[x].position == parentNode.position && nodes[x].orderId == parentNode.orderId) {
        parentNode = null;
        break;
      }
    }
  } else if (lastPos == 'catch+0:0' && item.logEvent == 'OrderCaught') {
    data = {
      title: 'Catch',
      key: 'catch' + item.orderId + item.logEvent + item.position,
      name: '',
      logLevel: item.logLevel,
      label: item.label,
      position: item.position.substring(0, item.position.lastIndexOf(':')),
      isLeaf: false,
      count: item.count,
      logEvent: item.logEvent,
      orderId: item.orderId,
      children: []
    };
  } else {
    let text = lastPos.split(':')[0];
    if (lastPos.split(':')[1] === '0') {
      parentNode = {
        title: this.upperFLetter(text),
        key: text + item.orderId + item.logEvent + item.position,
        name: '',
        logLevel: item.logLevel,
        position: item.position,
        position1: item.position.substring(0, item.position.lastIndexOf(':')),
        isLeaf: false,
        count: item.count,
        logEvent: item.logEvent,
        orderId: item.orderId,
        children: []
      };
    }
  }

  return parentNode;
}

 findNodeRecursive(nodes: any[], title: string, position: string): any {
  for (let node of nodes) {
    if (node.title === title && node.position === position) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = this.findNodeRecursive(node.children, title, position);
      if (found) return found;
    }
  }
  return null;
}
  createTreeStructure(mainObj: any): any {
    let nodes: any = [];
    mainObj.treeStructure.forEach((item: any) => {
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

      if (item.label) {
        data.label = item.label;
      }
      let parentNode: any;
      let lastPos;
      if (item.logEvent === 'OrderForked') {
        let _tempArr = item.position.split('/');
        lastPos = _tempArr[_tempArr.length - 1];
        parentNode = this.checkParentNode(lastPos, data, item, nodes);
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
          // write a regex to check if string has fork+ and some text after tin it
          if (/fork\+.+/g.test(lastPos)) {
            if (item.expectNotices || item.postNotice || item.consumeNotices
              || item.moved || item.attached || item.cycle || item.question) {
              data.name = item.logEvent;
            } else {
              data.name = lastPos.substring(lastPos.indexOf('+') + 1, lastPos.indexOf(':'));
            }
            data.title = data.name;
          } else {
            parentNode = this.checkParentNode(lastPos, data, item, nodes);
          }
        }
      }
      if (item.job) {
        data.title = 'Job';
        data.name = item.job;
        if (item.label) {
          data.label = item.label;
        }
        data.isLeaf = true;
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
          if (parentNode) {
            if (nodes[i].title === parentNode.title && nodes[i].position === parentNode.position) {
              obj.flag = true;
              continue;
            }
          }
          let _tempArr = item.position.split('/');
          _tempArr.splice(_tempArr.length - 1, 1);
          if ((lastPos && (lastPos.match('then') || lastPos.match('else')) && (item.job || item.expectNotices || item.postNotice || item.consumeNotices || item.moved || item.attached || item.cycle || item.question))) {
            ifInstructionRecursion(nodes, item, data);
            obj.flag = true;
            break;
          } else if ((lastPos && (/fork\+.+/g.test(lastPos)) && (item.job || item.expectNotices || item.postNotice || item.consumeNotices || item.moved || item.attached || item.cycle || item.question))) {
            if (nodes[i].position == item.position || (nodes[i].position.substring(0, nodes[i].position.lastIndexOf(':')) == item.position.substring(0, item.position.lastIndexOf(':')))
              || (nodes[i].title == 'Try' && nodes[i].position.indexOf('try+') > -1 && nodes[i].position == item.position.substring(0, item.position.indexOf(':')))) {
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
                obj.flag = true;
              } else {
                if (nodes[i].title == 'Job' && nodes[i].title == data.title && nodes[i].name && data.name && nodes[i].name != data.name) {

                } else {
                  if (nodes[i].title == data.title || (nodes[i].title == '' && data.title == 'Job') || (nodes[i].title == 'Job' && data.title == '') || (nodes[i].title == 'Try' && data.title == 'Retry') || (nodes[i].title == 'Retry' && data.title == 'Try')) {
                    if (data.title) {
                      nodes[i].title = data.title;
                    }
                    if (data.name) {
                      nodes[i].name = data.name;
                    }
                    if (data.label) {
                      nodes[i].label = data.label;
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
                        if (data.label) {
                          nodes[prop].label = data.label;
                        }
                        if ((nodes[prop].title == data.title || (nodes[prop].title == 'Try' && data.title == 'Retry') || (nodes[prop].title == 'Retry' && data.title == 'Try'))) {

                        } else {
                          nodes[prop].title = data.title;
                        }
                        flag = true;
                        break;
                      } else if (nodes[prop].position1 && data.title == 'Job' && nodes[prop].position1 == data.position.substring(0, data.position.lastIndexOf(':'))) {
                        if (nodes[prop].children) {
                          nodes[prop].children.push(data)
                        }
                        flag = true;
                      }
                    }
                    if (!flag) {
                      if (data.title == 'Join' && nodes[nodes.length - 1].title == 'ForkList') {
                        data.end = 'ForkList-End';
                      }
                      nodes.push(data);
                    }
                  }
                  obj.flag = true;
                }
              }

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
              if (!parentNode && ((item.position.match('try') && (data.title != 'Try' && data.title != 'Retry' && (!/fork\+.+/g.test(lastPos)))) || (item.position.match('catch') || data.title == 'Catch'))) {
                let isCheck = false;
                if (/(try\+)(\d)/gm.test(item.position)) {
                  let arr = /(try\+)(\d)/gm.exec(item.position);
                  if (arr && arr.length > 1) {
                    let regex = arr[1] + arr[2];
                    let pos = item.position.replace(regex, (arr[1] + 0));
                    if (pos == (nodes[i].position + ':0') && (item.job || item.expectNotices || item.postNotice || item.consumeNotices || item.moved || item.attached || item.cycle || item.question)) {
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

    function recursion(node: any, item: any, obj: any, data: any, parentNode: any, lastPos: any) {
      for (let i in node.children) {
        let arr = item.position.split('/');
        arr.splice(arr.length - 1, 1);
        if ((item.position.match('try') || item.position.match('catch')) && (item.job || item.expectNotices || item.postNotice || item.consumeNotices || item.moved || item.attached || item.cycle || item.question)) {

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

        if ((lastPos && (/fork\+.+/g.test(lastPos)) && (item.job || item.expectNotices || item.postNotice || item.consumeNotices || item.moved || item.attached || item.cycle || item.question))) {
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

    function tryCatchRecursion(nodes: any, item: any, data: any) {
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

    function ifInstructionRecursion(nodes: any, item: any, data: any) {
      let _tempArr = data.position.split('/');
      _tempArr.splice(_tempArr.length - 1, 1);
      let flag = false;
      recursion(nodes, item, data);
      if (!flag) {
        let obj = {
          title: 'If',
          key: 'if' + item.orderId + item.logEvent + item.position,
          name: '',
          label: item.label,
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

      function recursion(list: any[], item: any, data: any) {
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

    function matchExactPosition(node: any, data: any): boolean {
      let flag = false;
      for (let i in node.children) {
        if (node.children[i].position == data.position) {
          if (node.children[i].children) {
            node.children[i].children.push(data);
          } else {
            node.children.push(data);
          }
          flag = true;
          break;
        } else if (flag == false) {
          if (node.children[i].children?.length) {
            flag = matchExactPosition(node.children[i], data);
          }
        }
      }

      return flag;
    }

    function checkAndUpdate(node: any, data: any) {
      let flag = false;
      for (let i in node.children) {
        if (node.children[i].logEvent == 'OrderNoticesConsumptionStarted') {
          if ((node.children[i].position == data.position || node.children[i].position == data.position.substring(0, data.position.lastIndexOf(':') + 1) + '0') && data.name) {
            node.children[i].children.push(data);
            flag = true;
            break;
          }
        }
        if (node.children[i].position == data.position && (node.children[i].title == data.title || (node.children[i].title == 'Try' && data.title == 'Retry') || (node.children[i].title == 'Retry' && data.title == 'Try'))) {
          node.children[i].name = data.name;
          node.children[i].logEvent = data.logEvent;
          if (data.label) {
            node.children[i].label = data.label;
          }
          node.children[i].logLevel = data.logLevel;
          node.children[i].children = data.children;
          ++node.children[i].count;
          flag = true;
          break;
        }
      }
      if (!flag) {
        let check = false;
        for (let i in node.children) {
          if (check) {
            break;
          } else if (node.children[i].children?.length) {
            check = matchExactPosition(node.children[i], data);
          }
        }
        if (!check) {
          const _tempArr = data.position.split('/');
          if (_tempArr.length > 1) {
            const lastPos = _tempArr[_tempArr.length - 1];
            if (lastPos.match(/fork+/) && !/fork\+.+/g.test(lastPos) && node.title == 'Fork') {
              node.title = 'ForkList';
              node.children = [];
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
    }

    return nodes;
  }

  private isDomainSecureAndValid() {
    let hostname = window.location.hostname;
    // Check if the protocol is HTTPS
    if (hostname !== 'localhost') {
      if (window.location.protocol !== 'https:') {
        return false;
      }

      // Check if the domain is valid (not an IP address)
      let ipAddressRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      if (ipAddressRegex.test(hostname)) {
        return false;
      }
    }

    return true;
  }

  checkConnection(): boolean {
    if (this.isDomainSecureAndValid()) {
      if (window.PublicKeyCredential) {
        return true;
      } else {
        let title = '';
        let msg = '';
        this.translate.get('register.message.updateToModernBrowser').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.translate.get('register.message.browseDoesnotSupportWebAuthn').subscribe(translatedValue => {
          title = translatedValue;
        });
        this.toasterService.warning(msg,
          title);
      }
    } else {
      this.translate.get('login.message.notSecureConnection').subscribe(translatedValue => {
        this.toasterService.warning(translatedValue);
      });

    }

    return false;
  }

  create_UUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  convertExpToArray(exp: any): Array<string> {
    let arr: any[] = [];
    exp.split(' ').forEach((item: any) => {
      let x = item.trim();
      if (x !== '&&' && x !== '||') {
        if (x.substring(0, 1) == '(') {
          x = x.substring(1, x.length - 1);
        }
        if (x.substring(0, 1) == '"' || x.substring(0, 1) == "'") {
          x = x.substring(1, x.length - 1);
        }
        arr.push(x);
      }
    });
    return arr;
  }

  convertTryToRetry(mainJson: any, positions?: any, startNode?: string,
                    isMap = false, order?: any, workflowObj?: any): void {
    const self = this;
    let count = 1
    let isChecked = false;
    let map: Map<string, any>;
    let jobMap: Map<string, any>;
    let flag = false;
    if (isMap) {
      map = new Map();
    }

    if (workflowObj) {
      jobMap = new Map();
    }

    // Function to check if string starts with a specific pattern
    function startsWithPattern(str, pattern) {
      return str.startsWith(pattern);
    }

    function recursive(json: any, parent = null) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (workflowObj?.countObj && workflowObj.countObj.setObj) {
            if (workflowObj.countObj.setObj.has(json.instructions[x].positionString)) {
              json.instructions[x].show = true;
            }
          }
          if (!isMap && !workflowObj) {
            json.instructions[x].id = ++count;
            if (positions && !positions.has(json.instructions[x].positionString)) {
              json.instructions[x].position = undefined;
            } else {
              if (startNode) {
                if (!isChecked) {
                  json.instructions[x].position = undefined;
                }
                if (startNode === json.instructions[x].positionString) {
                  isChecked = true;
                }
              }
            }
          }
          if (workflowObj) {
            if ((!workflowObj.cb || workflowObj.isSkip)) {
              json.instructions[x].id = ++workflowObj.countObj.count;
              if (json.instructions[x].TYPE === 'ImplicitEnd' && (json.TYPE || parent)) {
                if (json.TYPE === 'ForkList') {
                  json.instructions[x].TYPE = 'ForkListEnd';
                } else if (json.TYPE === 'Cycle') {
                  json.instructions[x].TYPE = 'CycleEnd';
                } else if (parent) {
                  let positionArr = [];
                  if (!parent.join) {
                    parent.join = {};
                  } else {
                    positionArr = clone(parent.join.positionStrings);
                  }
                  positionArr.push(json.instructions[x].position);
                  parent.join.positionStrings = positionArr;
                  json.instructions[x].TYPE = 'Join';
                }
              }
            }
          } else {
            if (json.instructions[x].TYPE === 'ImplicitEnd' && (json.TYPE || parent)) {
              if (json.TYPE === 'ForkList') {
                json.instructions[x].TYPE = 'ForkListEnd';
              } else if (json.TYPE === 'Cycle') {
                json.instructions[x].TYPE = 'CycleEnd';
              } else if (parent) {
                let arr = [];
                if (isMap) {

                  if (map.has(parent.positionString)) {
                    arr = JSON.parse(map.get(parent.positionString));
                  }
                  arr.push(json.instructions[x].positionString);
                  map.set(parent.positionString, JSON.stringify(arr));
                }

                let positionArr = [];
                if (!parent.join) {
                  parent.join = {};
                } else {
                  positionArr = self.clone(parent.join.positionStrings);
                }
                if (order && order.positionString && order.positionString == json.instructions[x].positionString) {
                  parent.join.order = order;
                }
                positionArr.push(json.instructions[x].position);
                parent.join.positionStrings = positionArr;
                if (order) {
                  parent.join.unique = arr.join('$');
                  if (positions.indexOf(json.instructions[x].positionString) > -1) {
                    parent.join.enabled = true;
                  }
                }
                if (positions && !isArray(positions) && positions.has(parent.join.positionStrings)) {
                  parent.join.position = positions.get(parent.join.positionString);
                }
                json.instructions[x].TYPE = 'Join';
              }
            }
          }
          if (json.instructions[x].TYPE === 'Execute.Named') {
            if (workflowObj) {
              if (jobMap.has(json.instructions[x].jobName)) {
                jobMap.set(json.instructions[x].jobName, 2)
              } else {
                jobMap.set(json.instructions[x].jobName, 1)
              }

              if (!isEmpty(workflowObj.jobs)) {
                const job = workflowObj.jobs[json.instructions[x].jobName];
                if (!job) {
                  for (let job in workflowObj.jobs) {
                    if (workflowObj.jobs[job].name === json.instructions[x].jobName) {
                      if (workflowObj.jobs[job].value) {
                        if (!json.instructions[x].documentationName) {
                          json.instructions[x].documentationName = workflowObj.jobs[job].value.documentationName;
                        }
                      }
                      break;
                    }
                  }
                } else {
                  if (!json.instructions[x].documentationName) {
                    json.instructions[x].documentationName = job ? job.documentationName : null;
                  }
                }
              }
            }
            json.instructions[x].TYPE = 'Job';
          }
          if (json.instructions[x].TYPE === 'CaseWhen') {
            json.instructions[x].instructions = [];

            if (json.instructions[x].cases) {
              for (let i = 0; i < json.instructions[x].cases.length; i++) {
                const obj = {
                  TYPE: 'When',
                  predicate: json.instructions[x].cases[i].predicate,
                  instructions: json.instructions[x].cases[i].then.instructions
                };
                json.instructions[x].instructions.push(obj);
                delete json.instructions[x].cases[i].then;
              }
            }
            delete json.instructions[x].cases;
            if (json.instructions[x].else) {
              const obj = {
                TYPE: 'ElseWhen',
                instructions: json.instructions[x].else.instructions
              };
              json.instructions[x].instructions.push(obj);
              delete json.instructions[x].else;
            }
          }
          if (order) {

            if (json.instructions[x].positionString) {
              if (!flag) {
                if (startsWithPattern(order.positionString, json.instructions[x].positionString) || json.instructions[x].positionString == order.positionString) {
                  json.instructions[x].show = true;
                  json.show = true;
                }
              }
              if (positions.indexOf(json.instructions[x].positionString) > -1) {
                json.instructions[x].enabled = true;
              }
              if (order.positionString && order.positionString == json.instructions[x].positionString) {
                flag = true;
                json.instructions[x].order = order;
              }
            }
          }

          if (json.instructions[x].TYPE === 'Try') {
            let isRetry = false;
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length === 1
                && json.instructions[x].catch.instructions[0].TYPE === 'Retry') {
                json.instructions[x].TYPE = 'Retry';
                json.instructions[x].instructions = json.instructions[x].try.instructions;
                isRetry = true;
                delete json.instructions[x].try;
                delete json.instructions[x].catch;
              }
            }
            if (!isRetry) {
              if (json.instructions[x].try) {
                json.instructions[x].instructions = json.instructions[x].try.instructions || [];
                delete json.instructions[x].try;
              }
              if (json.instructions[x].catch) {
                if (!json.instructions[x].catch.instructions) {
                  json.instructions[x].catch.instructions = [];
                }
              } else {
                json.instructions[x].catch = {instructions: []};
              }
            }
          } else if (json.instructions[x].TYPE === 'StickySubagent' || json.instructions[x].TYPE === 'ConsumeNotices') {
            if (json.instructions[x].subworkflow) {
              json.instructions[x].instructions = json.instructions[x].subworkflow.instructions;
              delete json.instructions[x].subworkflow;
            }
          } else if (json.instructions[x].TYPE === 'Lock') {
            if (json.instructions[x].lockedWorkflow) {
              json.instructions[x].instructions = json.instructions[x].lockedWorkflow.instructions;
              delete json.instructions[x].lockedWorkflow;
            }
          } else if (json.instructions[x].TYPE === 'Options') {
            if (json.instructions[x].block) {
              json.instructions[x].instructions = json.instructions[x].block.instructions;
              delete json.instructions[x].block;
            }
          } else if (json.instructions[x].TYPE === 'Cycle') {
            if (json.instructions[x].cycleWorkflow) {
              json.instructions[x].instructions = json.instructions[x].cycleWorkflow.instructions;
              delete json.instructions[x].cycleWorkflow;
            }
          } else if (json.instructions[x].TYPE === 'ForkList') {
            if (json.instructions[x].workflow) {
              json.instructions[x].instructions = json.instructions[x].workflow.instructions;
              json.instructions[x].result = json.instructions[x].workflow.result;
              delete json.instructions[x].workflow;
            }
          }

          if (workflowObj && mainJson.compressData && (json.instructions[x].TYPE === 'PostNotices' || json.instructions[x].TYPE === 'ExpectNotices' || json.instructions[x].TYPE === 'ConsumeNotices')) {
            let arr = [];
            if (json.instructions[x].TYPE === 'ExpectNotices' || json.instructions[x].TYPE === 'ConsumeNotices') {
              arr = self.convertExpToArray(json.instructions[x].noticeBoardNames);
            } else {
              arr = json.instructions[x].noticeBoardNames;
            }
            arr = Array.from(new Set(arr));
            for (const key in mainJson.compressData) {
              for (let m = 0; m < arr.length; m++) {
                if ((mainJson.compressData[key].name == arr[m])) {
                  if (!json.instructions[x].uuid) {
                    json.instructions[x].uuid = self.create_UUID();
                  }
                  mainJson.compressData[key].instructions.push(json.instructions[x]);
                  arr.splice(m, 1);
                  break;
                }
              }
            }
            if (arr.length > 0) {
              for (const m in arr) {
                if (!json.instructions[x].uuid) {
                  json.instructions[x].uuid = self.create_UUID();
                }
                mainJson.compressData.push({
                  name: arr[m],
                  instructions: [json.instructions[x]]
                });
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {

              recursive(json.instructions[x].catch);
              if (order) {
                if (json.instructions[x].catch.positionString) {
                  if (!flag) {
                    if (startsWithPattern(order.positionString, json.instructions[x].catch.positionString) || json.instructions[x].catch.positionString == order.positionString) {
                      json.instructions[x].catch.show = true;
                    }
                  }

                  if (order.positionString && order.positionString == json.instructions[x].catch.positionString) {
                    json.instructions[x].catch.order = order;
                  }
                }
              }
            }
          }

          if (json.instructions[x].then && json.instructions[x].then.instructions) {

            recursive(json.instructions[x].then);
            if (json.instructions[x].then.positionString && order) {
              if (!flag) {
                if (startsWithPattern(order.positionString, json.instructions[x].then.positionString) || json.instructions[x].then.positionString == order.positionString) {
                  json.instructions[x].then.show = true;
                }
              }
              if (order.positionString && order.positionString == json.instructions[x].then.positionString) {
                json.instructions[x].then.order = order;
              }
            }
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {

            recursive(json.instructions[x].else);
            if (json.instructions[x].else.positionString && order) {
              if (!flag) {
                if (startsWithPattern(order.positionString, json.instructions[x].else.positionString) || json.instructions[x].else.positionString == order.positionString) {
                  json.instructions[x].else.show = true;
                }
              }
              if (order.positionString && order.positionString == json.instructions[x].else.positionString) {
                json.instructions[x].else.order = order;
              }
            }
          }
          if (json.instructions[x].branches) {
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any, index: number) => {

              if (workflowObj?.countObj?.setObj) {
                if (workflowObj.countObj.setObj.has(json.instructions[x].positionString + '_branch' + index)) {
                  branch.show = true;
                }
              }

              if (branch.workflow) {
                branch.instructions = branch.workflow.instructions;
                branch.result = branch.workflow.result;
                delete branch.workflow;
              }
              return (branch.instructions && branch.instructions.length > 0);
            });
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i]) {

                recursive(json.instructions[x].branches[i], json.instructions[x]);
                if (order && json.instructions[x].branches[i].positionString) {
                  if (!flag) {
                    if (startsWithPattern(order.positionString, json.instructions[x].branches[i].positionString) || json.instructions[x].branches[i].positionString == order.positionString) {
                      json.instructions[x].branches[i].show = true;
                    }
                  }
                  if (order.positionString && order.positionString == json.instructions[x].branches[i].positionString) {
                    json.instructions[x].branches[i].order = order;
                  }
                }
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
    if (workflowObj?.cb) {
      workflowObj.cb(jobMap);
    }
  }

  setProperties(result: any, isKiosk?): void {
    sessionStorage['$SOS$FORCELOGING'] = result.forceCommentsForAuditLog;
    sessionStorage['comments'] = JSON.stringify(result.comments);
    sessionStorage['showViews'] = JSON.stringify(result.showViews);
    sessionStorage['securityLevel'] = result.securityLevel;
    sessionStorage['defaultProfile'] = result.defaultProfileAccount;
    sessionStorage['$SOS$COPY'] = JSON.stringify(result.copy);
    sessionStorage['$SOS$RESTORE'] = JSON.stringify(result.restore);
    sessionStorage['$SOS$IMPORT'] = JSON.stringify(result.import);
    sessionStorage['welcomeDoNotRemindMe'] = result.welcomeDoNotRemindMe;
    sessionStorage['welcomeGotIt'] = result.welcomeGotIt;
    sessionStorage['hasLicense'] = result.clusterLicense;
    sessionStorage['licenseType'] = result.licenseType;
    sessionStorage['allowEmptyArguments'] = result.allowEmptyArguments;
    sessionStorage['allowUndeclaredVariables'] = result.allowUndeclaredVariables;
    sessionStorage['displayFoldersInViews'] = result.displayFoldersInViews;
    sessionStorage['numOfTagsDisplayedAsOrderId'] = result.numOfTagsDisplayedAsOrderId;
    sessionStorage['numOfWorkflowTagsDisplayed'] = result.numOfWorkflowTagsDisplayed;
    if(!isKiosk){
      sessionStorage['kioskRole'] = result.kioskRole;
    }
    const kioskValues = {
      dashboard: result.kioskViews?.dashboard,
      historyOrders: result.kioskViews?.historyOrders,
      historyTasks: result.kioskViews?.historyTasks,
      monitorOrderNotification: result.kioskViews?.monitorOrderNotification,
      monitorSystemNotification: result.kioskViews?.monitorSystemNotification
    };
    sessionStorage.setItem('kioskValues', JSON.stringify(kioskValues));
    if(isKiosk){
      this.kioskService.loadKioskValues()
    }
    if (result.licenseValidFrom) {
      sessionStorage['licenseValidFrom'] = result.licenseValidFrom;
    }
    if (sessionStorage['preferences'] && (result.forceCommentsForAuditLog === 'true' || result.forceCommentsForAuditLog === true)) {
      const preferences = JSON.parse(sessionStorage['preferences']);
      if (preferences && !preferences.auditLog) {
        preferences.auditLog = true;
        sessionStorage['preferences'] = JSON.stringify(preferences);
      }
    }
  }

  slimscrollFunc(dom: any, ht: any, graph): void {
    dom.css({height: ht});
    /**
     * Changes the zoom on mouseWheel events
     */
    $('.graph-container').bind('mousewheel DOMMouseScroll', (event) => {
      if (graph) {
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            graph.zoomIn();
          } else {
            graph.zoomOut();
          }
        }
      }
    });
  }

  createLogOutputString(arr: any[], col: string): string {
    for (let i = 0; i < arr.length; i++) {
      if (isArray(arr[i].value)) {
        col += arr[i].name + '={';
        for (let j = 0; j < arr[i].value.length; j++) {

          if (isArray(arr[i].value[j])) {
            arr[i].value[j].forEach((val, index) => {
              col += val.name + '=' + val.value;
              if (arr[i].value[j].length - 1 != index) {
                col += ', ';
              }
            });
          } else {
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
    return col;
  }

  sanitizeFileName(fileName) {
    fileName = decodeURIComponent(fileName);
    const pattern = /[*?<>]/i
    return pattern.test(fileName);
  }

  lowerFLetter(string: string): string {
    return string[0].toLowerCase() +
      string.slice(1);
  }

  getPositionStr(positionData, newPositions, positions): string {
    let positionString;
    if (newPositions) {
      if (newPositions.length > 0) {
        for (let i in newPositions) {
          if (JSON.stringify(positionData) === JSON.stringify(newPositions[i].position) ||
            positionData === JSON.stringify(newPositions[i].position) || JSON.stringify(positionData) === newPositions[i].position ||
            isEqual(positionData, newPositions[i].position)) {
            positionString = newPositions[i].positionString;
            break;
          }
        }
      }
    } else {
      for (const [key, value] of positions) {
        if (JSON.stringify(positionData) === JSON.stringify(value) || positionData === JSON.stringify(value)
          || JSON.stringify(positionData) === value || isEqual(positionData, value)) {
          positionString = key;
          break;
        }
      }
    }
    return positionString;
  }

  renderTimeSheetHeader(filters: any, weekStart, cb): void {
    const headerDates = [];
    const firstDate = new Date(filters.filter.startYear, filters.filter.startMonth, 1);
    const lastDate = new Date(filters.filter.startYear, filters.filter.startMonth + 1, 0);
    let currentDate = new Date(firstDate.getTime());
    if (filters.filter.view === 'Week') {
      currentDate = new Date(filters.filter.endDate);
    }
    while (currentDate.getDay() !== weekStart) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    if (filters.filter.view === 'Month') {
      while (currentDate <= lastDate) {
        do {
          const date = currentDate.getDate();
          if (currentDate >= firstDate && currentDate <= lastDate) {
            headerDates.push(new Date(currentDate));
          }
          currentDate.setDate(date + 1);
        }
        while (currentDate.getDay() !== weekStart);
      }
    } else {
      do {
        const date = currentDate.getDate();
        headerDates.push(new Date(currentDate));
        currentDate.setDate(date + 1);
      }
      while (currentDate.getDay() !== weekStart);
    }
    filters.filter.startDate = headerDates[0];
    filters.filter.endDate = headerDates[headerDates.length - 1];
    cb();
  }

  getDefaultJSFunc(): string {
    return "class JS7Job extends js7.Job {\n\tprocessOrder(js7Step) {\n\t\tjs7Step.getLogger().info('hello world');\n\t\t// do some stuff\n\t}\n}";
  }

  copyArguments(data, type, message): void {

    let arr: any[];

    if (!Array.isArray(data[type])) {
      arr = this.convertObjectToArray1(data, type);

      arr.forEach(item => {
        if (item.value && typeof item.value === 'object') {
          if (Array.isArray(item.value)) {
            item.value = item.value.map(subItem => {
              if (typeof subItem === 'object' && !Array.isArray(subItem)) {
                return this.convertObjectToArray1({value: subItem}, 'value');
              }
              return subItem;
            }).flat();
          } else {
            item.value = this.convertObjectToArray1({value: item.value}, 'value');
          }
        }
      });
    } else {
      arr = data[type];
    }

    if (arr.length > 0) {
      // Get existing data from sessionStorage (if any)
      let storedData = sessionStorage.getItem('$SOS$copiedArgument') ? JSON.parse(sessionStorage.getItem('$SOS$copiedArgument')) : [];

      // Add the new data to the array
      storedData.push(JSON.stringify(arr));

      // Check if the length exceeds 20, remove the oldest entry
      if (storedData.length > 20) {
        storedData.shift(); // Remove the first element (oldest)
      }

      // Update the stored data in sessionStorage
      sessionStorage.setItem('$SOS$copiedArgument', JSON.stringify(storedData));
      this.showCopyMessage(message);
    }
  }

// Helper method to convert object to array
  convertObjectToArray1(data, type): any[] {
    return Object.keys(data[type]).map(key => {
      return {name: key, value: data[type][key]};
    });
  }


  setForkListVariables(sour, target): void {
    for (let x in target) {
      if (target[x].name === sour.name) {
        if (sour.value) {
          if (sour.value.length > 0) {
            for (const i in sour.value) {
              const tempList = this.clone(target[x].list);
              sour.value[i] = Object.entries(sour.value[i]).map(([k1, v1]) => {
                let type, index = 0, isRequired = true;
                for (const prop in tempList) {
                  if (tempList[prop].name === k1) {
                    type = tempList[prop].value.type;
                    isRequired = tempList[prop].value.isRequired;
                    tempList.splice(index, 1);
                    break;
                  }
                  index++;
                }
                return {name: k1, value: v1, type, isRequired};
              });
              for (const prop in tempList) {
                sour.value[i].push(
                  {
                    name: tempList[prop].name,
                    value: tempList[prop].value.value || tempList[prop].value.default,
                    type: tempList[prop].value.type,
                    isRequired: tempList[prop].value.isRequired || tempList[prop].isRequired,
                  });
              }

            }
          } else {
            const tempArr = [];
            for (const prop in target[x].list) {
              tempArr.push({
                name: target[x].list[prop].name,
                value: (target[x].list[prop].value.value || target[x].list[prop].value.default),
                type: target[x].list[prop].value.type,
                isRequired: (target[x].list[prop].isRequired || target[x].list[prop].value.isRequired)
              });
            }
            sour.value.push(tempArr);
          }
        }
        target[x].actualList = sour.value;
        break;
      }
    }
  }

  getPeriodStr(period, skip = false): string {
    let periodStr = null;
    if (period.begin) {
      periodStr = this.stringToDate2(period.begin);
    }
    if (period.end) {
      periodStr = periodStr + '-' + this.stringToDate2(period.end);
    }
    if (period.singleStart) {
      periodStr = (skip ? '' : 'Single start: ') + this.stringToDate2(period.singleStart);
    } else if (period.repeat) {
      periodStr = periodStr + ' every ' + this.getTimeInString(period.repeat);
    }
    return periodStr;
  }

  stringToDate2(date: string): string {
    if (!date) {
      return '-';
    }
    if (sessionStorage['preferences']) {
      const n = JSON.parse(sessionStorage['preferences']);
      if (!n.zone) {
        return '';
      }
      const dateY = new Date(date);
      if (dateY.getFullYear() === 10000) {
        return 'common.label.never'
      } else {
        return moment(date).tz(n.zone).format(n.dateFormat);
      }
    } else {
      return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }
  }
  getTimeInString(time: any): string {
    if (time.toString().substring(0, 2) === '00' && time.toString().substring(3, 5) === '00') {
      return time.toString().substring(6, time.length) + ' seconds';
    } else if (time.toString().substring(0, 2) === '00') {
      return time.toString().substring(3, time.length) + ' minutes';
    } else if ((time.toString().substring(0, 2) != '00' && time.length === 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) === '00'))) {
      return time.toString().substring(0, 5) + ' hours';
    } else {
      return time;
    }
  }

  checkDataType(sour) {
    if (sour.value || sour.value == 0 || sour.value == false) {
      if (sour.type === 'Number') {
        if (typeof sour.value == 'boolean') {
          sour.value = sour.value == true ? 1 : 0;
        } else if (typeof sour.value == 'string') {
          if (sour.value) {
            sour.value = this.convertToNumberIfValid(sour.value);
          } else {
            sour.value = '';
          }
        }else if ((sour.type === 'Number') && typeof sour.value === "object") {
          sour.value = ''
        }
      } else if (sour.type === 'Boolean') {
        const booleanMapping: { [key: string]: boolean } = {
          '1': true,
          '0': false,
          'true': true,
          'false': false,
          'yes': true,
          'no': false,
          'on': true,
          'off': false,
          '': false,
        };

        const defaultValue = String(sour.value).toLowerCase();
        if (defaultValue in booleanMapping) {
          sour.value = booleanMapping[defaultValue];
        } else {
          sour.value = false;
        }
      } else if (sour.type === 'String' && typeof sour.value !== 'string') {
        sour.value = sour.value.toString();
        if (sour.type === 'String' && sour.value === '[object Object]') {
          sour.value = ''
        }
      } else if (sour.type === undefined && sour.name != '') {
        sour.value = ''
        sour.name = ''
      }
    }

  }

  convertToNumberIfValid(value: string): string | number {
    const stringValue = value != null ? String(value) : '';

    const trimmedValue = stringValue.trim();

    if (trimmedValue.toLowerCase() === 'true') {
      return 1; // Convert "true" to 1
    }
    if (trimmedValue.toLowerCase() === 'false') {
      return 0; // Convert "false" to 0
    }

    if (!isNaN(Number(trimmedValue)) && trimmedValue !== '') {
      return Number(trimmedValue); // Convert and return the number
    }

    return '';
  }

  copyToClipboard(orderId, message) {
    this.clipboardService.copy(orderId);
    this.showCopyMessage(message);
  }

  getModifiedOrderId(order: any, searchText?: string): SafeHtml {
    this.numOfTags = sessionStorage.getItem('numOfTagsDisplayedAsOrderId');
    const match = order.orderId.match(/^(#\d{4}-\d{2}-\d{2}#(T|P|C|D|F))(\d+)-(.+?)(\|.+)?$/);
    if (match && order.tags && order.tags.length > 0) {
      const prefix = match[1];
      const orderName = match[4] || '';
      const branch = match[5] || '';
      const tagsString = order.tags.slice(0, this.numOfTags).map(tag => `<span class="tag-oval">${tag}</span>`).join('');
      const modifiedOrderId = `${prefix}${orderName} ${tagsString}${branch}`;

      const highlightedOrderId = this.highlightText(modifiedOrderId, searchText);
      return this.sanitizer.bypassSecurityTrustHtml(highlightedOrderId);
    }
    return order.orderId;
  }

  highlightText(value: string, searchText?: string): string {
    if (!searchText) {
      return value;
    }

    const parts = value.split(/(<[^>]+>)/g);
    const highlighted = parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part;
      } else {
        return part.replace(new RegExp(searchText, 'gi'), '<span class="highlighted">$&</span>');
      }
    });

    return highlighted.join('');
  }

  getModifiedWorkflowTags(workflow: any, searchText?: string): SafeHtml {
    this.numOfWorkflowTags = parseInt(sessionStorage.getItem('numOfWorkflowTagsDisplayed'), 10) || workflow.workflowTags.length;

    if (workflow.workflowTags && workflow.workflowTags.length > 0) {
      const visibleTags = workflow.workflowTags.slice(0, this.numOfWorkflowTags).map(tag => `<span class="tag-oval">${tag}</span>`).join('');
      const highlightedOrderId = this.highlightText(visibleTags, searchText);
      return this.sanitizer.bypassSecurityTrustHtml(highlightedOrderId);
    } else if (workflow && workflow.length > 0) {
      const visibleTags = workflow.slice(0, this.numOfWorkflowTags)
        .map(tag => `<span class="tag-oval">${tag}</span>`)
        .join('');
      const highlightedTags = this.highlightText(visibleTags, searchText);
      return this.sanitizer.bypassSecurityTrustHtml(highlightedTags);
    }

    return '';
  }


  setSortedTags(tags: string[]): void {
    this.sortedTags = tags;
  }

  getSortedTags(): string[] {
    return this.sortedTags;
  }

  convertToSeconds(timeString: string): string {
    const hhmmssRegex = /^(\d{2}):(\d{2}):(\d{2})$/i;
    const hhmmRegex = /^(\d{2}):(\d{2})$/i;
    const durationRegex = /^(\d+y\s?)?(\d+M\s?)?(\d+w\s?)?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i;
    const singleUnitRegex = /^\d+[a-zA-Z]$/; // Regex to detect single unit patterns

    const hhmmssMatch = timeString.match(hhmmssRegex);
    const hhmmMatch = timeString.match(hhmmRegex);
    const durationMatch = timeString.match(durationRegex);

    let totalSeconds = 0;

    // Check if it's a single unit pattern like 1s or 1m, return as it is
    if (singleUnitRegex.test(timeString)) {
      return timeString;
    }

    if (hhmmssMatch) {
      const hours = parseInt(hhmmssMatch[1], 10);
      const minutes = parseInt(hhmmssMatch[2], 10);
      const seconds = parseInt(hhmmssMatch[3], 10);

      totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
      return totalSeconds + 's';
    }

    if (hhmmMatch) {
      const hours = parseInt(hhmmMatch[1], 10);
      const minutes = parseInt(hhmmMatch[2], 10);

      totalSeconds = (hours * 3600) + (minutes * 60);
      return totalSeconds + 's';
    }

    if (durationMatch) {
      if (durationMatch[1]) {
        const years = parseInt(durationMatch[1].replace(/y/i, ''), 10);
        totalSeconds += years * 31536000; // 1 year = 365 days
      }
      if (durationMatch[2]) {
        const months = parseInt(durationMatch[2].replace(/M/i, ''), 10);
        totalSeconds += months * 2592000; // 1 month = 30 days
      }
      if (durationMatch[3]) {
        const weeks = parseInt(durationMatch[3].replace(/w/i, ''), 10);
        totalSeconds += weeks * 604800; // 1 week = 7 days
      }
      if (durationMatch[4]) {
        const days = parseInt(durationMatch[4].replace(/d/i, ''), 10);
        totalSeconds += days * 86400; // 1 day = 24 hours
      }
      if (durationMatch[5]) {
        const hours = parseInt(durationMatch[5].replace(/h/i, ''), 10);
        totalSeconds += hours * 3600;
      }
      if (durationMatch[6]) {
        const minutes = parseInt(durationMatch[6].replace(/m/i, ''), 10);
        totalSeconds += minutes * 60;
      }
      if (durationMatch[7]) {
        const seconds = parseInt(durationMatch[7].replace(/s/i, ''), 10);
        totalSeconds += seconds;
      }

      return totalSeconds + 's';
    }

    return 'Invalid time format';
  }


  padTime(value: string): string {
    if (!value) {
      return value;
    }

    const containsAlphabet = /[a-zA-Z]/.test(value);

    if (containsAlphabet) {
      return value;
    }
    const parts = value.split(':');
    if (parts.length === 2) {
      parts[0] = parts[0].padStart(2, '0');
      parts[1] = parts[1].padEnd(2, '0');
      return parts.join(':') + ':00';
    } else if (parts.length === 3) {
      parts[0] = parts[0].padStart(2, '0');
      parts[1] = parts[1].padStart(2, '0');
      parts[2] = parts[2].padEnd(2, '0');
      return parts.join(':');
    }
    const isDigit = (str: string) => /^\d+$/.test(str);

    if (isDigit(value)) {
      if (value.length === 1) {
        return `0${value}:00:00`;
      } else if (value.length === 2) {
        return `${value}:00:00`;
      } else if (value.length === 3) {
        return `${value[0]}${value[1]}:0${value[2]}:00`;
      } else if (value.length === 4) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:00`;
      } else if (value.length === 5) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}0`;
      } else if (value.length === 6) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}${value[5]}0`;
      } else if (value.length === 7) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}${value[5]}${value[6]}0`;
      }
    }

    return value;
  }

  padAdmissionTime(value: string): string {
    if (!value) {
      return value;
    }

    const trimmedValue = value.trim();

    const isDurationFormat = /^(\d+\s*[wdhms]\s*)+$/i.test(trimmedValue);

    if (isDurationFormat) {
      return value;
    }

    const parts = value.split(':');

    if (parts.length === 2) {
      parts[0] = parts[0].padStart(2, '0');
      parts[1] = parts[1].padEnd(2, '0');
      return parts.join(':') + ':00';
    } else if (parts.length === 3) {
      parts[0] = parts[0].padStart(2, '0');
      parts[1] = parts[1].padStart(2, '0');
      parts[2] = parts[2].padEnd(2, '0');
      return parts.join(':');
    }

    const isDigit = (str: string) => /^\d+$/.test(str);
    if (isDigit(value)) {
      if (value.length === 1) {
        return `0${value}:00:00`;
      } else if (value.length === 2) {
        return `${value}:00:00`;
      } else if (value.length === 3) {
        return `${value[0]}${value[1]}:0${value[2]}:00`;
      } else if (value.length === 4) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:00`;
      } else if (value.length === 5) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}0`;
      } else if (value.length === 6) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}${value[5]}`;
      } else if (value.length === 7) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}${value[5]}${value[6]}0`;
      }
    }

    return value;
  }

 requestTest(
  method: string,
  url: string,
  headers: Record<string, string>,
  params: Record<string, string>,
  body: any
): Observable<any> {
  const safeUrl = url.trim();
  const httpHeaders = new HttpHeaders(headers);
  let httpParams = new HttpParams();
  Object.keys(params).forEach(key => {
    httpParams = httpParams.set(key, params[key]);
  });

  let parsedBody: any = null;

  if (body) {
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      this.translate.get('workflow.apiRequest.label.invalidJson').subscribe(translatedValue => {
        this.toasterService.warning(translatedValue);
      });
    }
  }
  return this.http.request(method, safeUrl, {
    headers: httpHeaders,
    params: httpParams,
    body: parsedBody,
    observe: 'response'
  });
}

}
