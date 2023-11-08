import {Component, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Subject, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {clone, isEmpty} from 'underscore';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {WorkflowActionComponent} from './workflow-action/workflow-action.component';
import {CreateTagModalComponent} from "../configuration/inventory/inventory.component";
import {PerfectScrollbarComponent} from "../perfect-scrollbar/perfect-scrollbar.component";
import {AuthService} from '../../components/guard';
import {SaveService} from '../../services/save.service';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {WorkflowService} from '../../services/workflow.service';
import {ExcelService} from '../../services/excel.service';
import {OrderPipe, SearchPipe} from '../../pipes/core.pipe';


declare const $: any;

@Component({
  selector: 'app-filter-workflow-content',
  templateUrl: './filter-dialog.html',
})
export class FilterModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  allFilter: any;
  new = false;
  edit: any;
  filter: any;
  listOfAgents: any = [];
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  name = '';

  constructor(private authService: AuthService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.allFilter = this.modalData.allFilter;
    this.new = this.modalData.new;
    this.edit = this.modalData.edit;
    this.filter = this.modalData.filter;
    this.listOfAgents = this.modalData.listOfAgents || [];
    this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.new) {
      this.filter = {
        shared: false,
        path: []
      };
    } else {
      this.name = clone(this.filter.name);
    }
  }

  cancel(obj: any): void {
    if (obj) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.destroy();
    }
  }

}

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.html',
})
export class SearchComponent {
  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() listOfAgents = [];
  @Input() permission: any;
  @Input() isSearch: boolean;
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  folders = [];
  dateFormat: any;
  existingName: any;
  submitted = false;
  isUnique = true;
  objectType = 'WORKFLOW';
  tags: any = [];
  statusObj = {
    syncStatus: [],
    availabilityStatus: []
  };

  synchronizationStatusOptions = [
    {label: 'synchronized', value: 'IN_SYNC', checked: false},
    {label: 'notSynchronized', value: 'NOT_IN_SYNC', checked: false}
  ];

  availabilityStatusOptions = [
    {label: 'suspended', value: 'SUSPENDED', checked: false},
    {label: 'outstanding', value: 'OUTSTANDING', checked: false}
  ];

  jobAvailabilityStatusOptions = [
    {label: 'skipped', value: 'SKIPPED', checked: false},
    {label: 'stopped', value: 'STOPPED', checked: false}
  ];


  constructor(private authService: AuthService, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    if (this.filter.name) {
      this.existingName = this.coreService.clone(this.filter.name);
    }
    this.getFolderTree();
    this.fetchTags();
    this.filter.instructionStates = this.filter.instructionStates ? this.filter.instructionStates : [];
    this.filter.states = this.filter.states ? this.filter.states : [];

    this.filter.instructionStates.forEach((item: any) => {
      for (let i in this.jobAvailabilityStatusOptions) {
        if (this.jobAvailabilityStatusOptions[i].value == item) {
          this.jobAvailabilityStatusOptions[i].checked = true;
          break;
        }
      }
    });
    this.filter.states.forEach((item: any) => {
      for (let i in this.synchronizationStatusOptions) {
        if (this.synchronizationStatusOptions[i].value == item) {
          this.synchronizationStatusOptions[i].checked = true;
          this.statusObj.syncStatus.push(item)
          break;
        }
      }
      for (let i in this.availabilityStatusOptions) {
        if (this.availabilityStatusOptions[i].value == item) {
          this.availabilityStatusOptions[i].checked = true;
          this.statusObj.availabilityStatus.push(item)
          break;
        }
      }
    });
  }

  private getFolderTree(): void {
    this.filter.paths = [];
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      forInventory: true,
      types: [this.permission.joc.inventory.view ? 'FOLDER' : 'WORKFLOW']
    }).subscribe({
      next: (res) => {
        this.folders = this.coreService.prepareTree(res, true);
        if (this.folders.length > 0) {
          this.folders[0].expanded = true;
        }
      }
    });
  }

  private fetchTags(): void {
    this.coreService.post('workflows/tag/search', {
      search: '',
      controllerId: this.schedulerIds.selected
    }).subscribe((res) => {
      this.tags = res.results;
    });
  }

  displayWith(data: any): string {
    return data.key;
  }

  synchronizationStatusChange(value: string[]): void {
    this.statusObj.syncStatus = value;
  }

  availabilityStatusChange(value: string[]): void {
    this.statusObj.availabilityStatus = value;
  }

  jobAvailabilityStatusChange(value: string[]): void {
    this.filter.instructionStates = value;
  }

  selectFolder(node: any, $event: any): void {
    if (!node.origin.isLeaf) {
      node.isExpanded = !node.isExpanded;
    }
    $event.stopPropagation();
  }

  addFolder(path: string): void {
    if (this.filter.paths.indexOf(path) === -1) {
      this.filter.paths.push(path);
      this.filter.paths = [...this.filter.paths];
    }
  }

  remove(path: string): void {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
    this.filter.paths = [...this.filter.paths];
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.authService.currentUserData === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    const obj: any = {
      regex: result.regex,
      paths: result.paths,
      tags: result.tags,
      handleRecursively: result.handleRecursively,
      name: result.name,
      instructionStates: result.instructionStates,
      agentNames: result.agentNames,

    };
    const states = this.statusObj.syncStatus.concat(this.statusObj.availabilityStatus);
    if (states && states.length > 0) {
      obj.states = states;
    }
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType,
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: JSON.stringify(obj)
    };
    this.coreService.post('configuration/save', configObj).subscribe({
      next: (res: any) => {
        if (result.id) {
          for (const i in this.allFilter) {
            if (this.allFilter[i].id === result.id) {
              this.allFilter[i] = configObj;
              break;
            }
          }
        } else {
          configObj.id = res.id;
          this.allFilter.push(configObj);
        }
        if (this.isSearch) {
          this.filter.name = '';
        } else {
          this.onCancel.emit(configObj);
        }
        this.submitted = false;
      }, error: () => this.submitted = false
    });
  }

  search(): void {
    const states = this.statusObj.syncStatus.concat(this.statusObj.availabilityStatus);
    if (states && states.length > 0) {
      this.filter.states = states;
    } else {
      delete this.filter.states;
    }
    this.onSearch.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-single-workflow',
  templateUrl: './single-workflow.component.html'
})
export class SingleWorkflowComponent {
  loading = true;
  controllerId: any;
  preferences: any = {};
  permission: any = {};
  resizerHeight: any = 150;
  workflows: any = [];
  path: any;
  versionId: any;
  showPanel: any;
  sideBar: any = {};
  isPathDisplay = false;
  date = '1d';
  subscription1: Subscription;
  subscription2: Subscription;

  filterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'},
    {date: '2d', text: 'nextDay'},
    {date: '7d', text: 'nextWeak'}
  ];

  @ViewChild(WorkflowActionComponent, {static: false}) actionChild;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService,
              private route: ActivatedRoute, private workflowService: WorkflowService, private router: Router) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'true';
    this.permission = JSON.parse(this.authService.permission) || {};
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    // Subscribe to changes in the route parameters (including query parameters).
    this.subscription2 = this.route.queryParamMap.subscribe(params => {

      this.path = params.get('path');
      this.versionId = params.get('versionId');
      this.controllerId = params.get('controllerId');
      this.getWorkflowList({
        controllerId: this.controllerId,
        workflowId: {path: this.path, versionId: this.versionId ? this.versionId : undefined}
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  loadOrders(date): void {
    this.date = date;
    const request = {
      compact: true,
      controllerId: this.controllerId,
      workflowIds: []
    };
    const path = this.workflows[0].path;
    if (path) {
      request.workflowIds.push({path, versionId: this.workflows[0].versionId});
    }
    if (request.workflowIds.length > 0) {
      this.getOrders(request);
    }
  }

  showPanelFuc(workflow): void {
    workflow.show = true;
    $('#workflowTableId').css('height', 450);
    workflow.configuration = this.coreService.clone(workflow);
    this.workflowService.convertTryToRetry(workflow.configuration, null, {}, {count: 0});
  }

  viewHistory(data): void {
    if (this.permission && this.permission.joc && (this.permission.currentController.orders.view || this.permission.joc.auditLog.view)) {
      this.showPanel.jobName = data.jobName;
    }
  }

  hidePanelFuc(workflow): void {
    workflow.show = false;
    $('#workflowTableId').css('height', 150);
    delete workflow.configuration;
  }

  viewOrders(workflow): void {
    this.sideBar = {
      isVisible: true,
      orders: workflow.orders,
      workflow: workflow.path,
      orderPreparation: workflow.orderPreparation
    };
  }

  navToDetailView(view, workflow): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', workflow.path, workflow.versionId]).then();
  }

  addOrder(workflow): void {
    this.actionChild.addOrder(workflow);
  }

  suspend(workflow) {
    this.actionChild.suspend(workflow);
  }

  resume(workflow) {
    this.actionChild.resume(workflow);
  }

  showDependency(workflow): void {
    this.actionChild.showDependency(workflow);
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (const j in args.eventSnapshots) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow
          && this.path === args.eventSnapshots[j].workflow.path && (args.eventSnapshots[j].workflow.versionId === this.versionId || !this.versionId)) {
          this.getOrders({
            compact: true,
            controllerId: this.controllerId,
            workflowIds: [args.eventSnapshots[j].workflow]
          });
        } else if (args.eventSnapshots[j].eventType === 'WorkflowUpdated' && (args.eventSnapshots[j].path && this.path === args.eventSnapshots[j].path)) {
          this.getWorkflowList({
            controllerId: this.controllerId,
            workflowId: {path: this.path, versionId: this.versionId ? this.versionId : undefined}
          });
          break;
        }
      }
    }
  }

  private getWorkflowList(obj): void {
    this.coreService.post('workflow', obj).subscribe({
      next: (res: any) => {
        this.loading = false;
        const request = {
          compact: true,
          controllerId: this.controllerId,
          workflowIds: []
        };
        const path = res.workflow.path;
        res.workflow.name = path.substring(path.lastIndexOf('/') + 1);
        if (!res.workflow.ordersSummary) {
          res.workflow.ordersSummary = {};
        }
        if (path) {
          request.workflowIds.push({path, versionId: res.workflow.versionId});
        }
        this.workflows = [res.workflow];
        if (request.workflowIds.length > 0) {
          this.getOrders(request);
        }
        if (this.permission && this.permission.joc && (this.permission.currentController.orders.view || this.permission.joc.auditLog.view)) {
          this.showPanel = this.workflows[0];
        }
        this.showPanelFuc(this.workflows[0]);
      }, error: () => this.loading = false
    });
  }

  private getOrders(obj): void {
    if (this.permission && !this.permission.currentController.orders.view) {
      return;
    }
    if (this.date !== 'ALL') {
      obj.dateTo = this.date;
      if (this.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.preferences.zone;
    }
    obj.compact = true;
    obj.limit = this.preferences.maxWorkflowRecords;
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.workflows[0].orders = res.orders;
      this.workflows[0].ordersSummary = {};
      this.workflows[0].numOfOrders = res.orders.length;
      if (res.orders && res.orders.length > 0) {
        for (let j in res.orders) {
          for (const o in res.orders[j].position) {
            if (/^(try\+)/.test(res.orders[j].position[o])) {
              res.orders[j].position[o] = 'try+0';
            }
            if (/^(cycle\+)/.test(res.orders[j].position[o])) {
              res.orders[j].position[o] = 'cycle';
            }
          }
          const state = res.orders[j].state._text.toLowerCase();
          if (this.workflows[0].ordersSummary[state]) {
            this.workflows[0].ordersSummary[state] = this.workflows[0].ordersSummary[state] + 1;
          } else {
            this.workflows[0].ordersSummary[state] = 1;
          }
        }
      }
      if (this.sideBar.isVisible) {
        this.sideBar.orders = res.orders;
      }
    });
  }
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html'
})
export class WorkflowComponent {
  isLoading = false;
  loading: boolean;
  isSearchHit: boolean;
  isUnique: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  resizerHeight: any = 200;
  currentPath = '/';
  pageView: any;
  workflows: any = [];
  workflowFilters: any = {};
  showPanel: any;
  showSearchPanel = false;
  searchFilter: any = {};
  isProcessing = false;
  isSearchVisible = false;
  isDropdownOpen = false;
  sideView: any = {};
  selectedFiltered: any = {};
  savedFilter: any = {};
  filterList: any = [];
  data = [];
  sideBar: any = {};
  reloadState = 'no';

  objectType = 'WORKFLOW';
  isPathDisplay = true;
  numOfAllOrders: any = {};
  listOfAgents: any = [];
  object = {
    mapOfCheckedId: new Map(),
    checked: false,
    indeterminate: false,
    isSuspend: false,
    isResume: false,
  };

  selectedTags = new Set();
  searchTag = {
    loading: false,
    token: '',
    tags: [],
    text: ''
  };
  private searchTerm = new Subject<string>();

  searchableProperties = ['name', 'path', 'versionDate', 'state', '_text'];

  filterState: any = [
    {state: 'IN_SYNC', text: 'synchronized'},
    {state: 'NOT_IN_SYNC', text: 'notSynchronized'},
    {state: 'SUSPENDED', text: 'suspended'},
    {state: 'OUTSTANDING', text: 'outstanding'}
  ];

  filterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'},
    {date: '2d', text: 'nextDay'},
    {date: '7d', text: 'nextWeak'}
  ];

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  @ViewChild(PerfectScrollbarComponent) scrollbar?: PerfectScrollbarComponent;
  @ViewChild(TreeComponent, {static: false}) child;
  @ViewChild(WorkflowActionComponent, {static: false}) actionChild;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modal: NzModalService, private workflowService: WorkflowService,
              private translate: TranslateService, private searchPipe: SearchPipe, private excelService: ExcelService,
              private toasterService: ToastrService, private router: Router, private orderPipe: OrderPipe) {
    this.subscription1 = dataService.eventAnnounced$.subscribe((res) => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.workflowFilters = this.coreService.getWorkflowTab();
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy(): void {
    this.workflowFilters.expandedObjects = [];
    this.workflowFilters.mapObj = new Map();
    const workflows = this.getCurrentData(this.data, this.workflowFilters);

    for (const i in workflows) {
      if (workflows[i].show) {
        let key = workflows[i].path + workflows[i].versionId;
        this.workflowFilters.expandedObjects.push(key);
        this.workflowFilters.mapObj.set(key, this.getExpandData(workflows[i].configuration));
      }
    }


    if (this.workflowFilters.isTag) {
      this.workflowFilters.selectedTags = this.selectedTags;
    }
    if (this.child) {
      this.workflowFilters.expandedKeys = this.child.defaultExpandedKeys;
      if (!this.workflowFilters.isTag) {
        this.workflowFilters.selectedkeys = this.child.defaultSelectedKeys;
      }
    }
    this.workflowFilters.showPanel = this.showPanel ? this.showPanel.path : '';
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    $('.scroll-y').remove();
  }

  private getExpandData(mainJson): any {
    let expandedPos = new Set<string>();

    function recursive(json): void {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {

          if (json.instructions[x].positionString && json.instructions[x].show) {
            expandedPos.add(json.instructions[x].positionString);
          }

          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].show) {
                  expandedPos.add(json.instructions[x].positionString + '_branch' + i);
                }
                if (json.instructions[x].branches[i].instructions) {
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }

          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else) {
            if (json.instructions[x].else.instructions) {
              recursive(json.instructions[x].else);
            }
          }
        }
      }
    }

    recursive(mainJson);

    return expandedPos;
  }

  selectObject(item): void {
    let flag = true;
    const PATH = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
    for (let i in this.workflowFilters.expandedKeys) {
      if (PATH == this.workflowFilters.expandedKeys[i]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      this.workflowFilters.expandedKeys.push(PATH);
    }
    let selectedCheck = false;
    if (this.workflowFilters.selectedkeys.length <= 1) {
      if (this.workflowFilters.selectedkeys[0] == PATH) {
        selectedCheck = true;
      }
    }
    this.workflowFilters.selectedkeys = [PATH];
    this.workflowFilters.expandedObjects = [item.path + 'CURRENT'];
    if (!selectedCheck) {
      this.loadWorkflow(null, true);
    }
  }

  scrollEnd(e): void {
    this.workflowFilters.scrollTop = $(e.target).scrollTop();
  }

  changedHandler(obj: any): void {
    this.isProcessing = obj.flag;
    if (obj.isOrderAdded && obj.flag) {
      this.showPanelFunc(obj.isOrderAdded);
    }
  }

  dropdownChangedHandler(isOpen: boolean): void {
    this.isDropdownOpen = isOpen;
  }

  processingHandler(flag: boolean): void {
    this.isProcessing = flag;
  }

  private resetAction(): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, 100);
    }
  }

  onTagChecked(tag, checked: boolean): void {
    if (checked) {
      this.selectedTags.add(tag);
    } else {
      this.selectedTags.delete(tag);
    }
    if (this.selectedTags.size) {
      const obj: any = {
        tags: Array.from(this.selectedTags),
        controllerId: this.schedulerIds.selected
      };
      this.getWorkflowList(obj);
    }
  }

  onItemChecked(workflow, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.workflowFilters.entryPerPage || this.preferences.entryPerPage)) {
      const workflows = this.getCurrentData(this.data, this.workflowFilters);
      if (workflows.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        workflows.forEach(item => {
          this.object.mapOfCheckedId.set(item.path, item);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.set(workflow.path, workflow);
    } else {
      this.object.mapOfCheckedId.delete(workflow.path);
    }
    this.refreshCheckedStatus();
  }

  resetCheckBox(): void {
    this.object = {
      mapOfCheckedId: new Map(),
      checked: false,
      indeterminate: false,
      isSuspend: false,
      isResume: false,
    };
  }

  selectAll(): void {
    this.data.forEach(item => {
      this.object.mapOfCheckedId.set(item.path, item);
    });
    this.refreshCheckedStatus(true);
  }

  checkAll(value: boolean): void {
    if (value && this.data.length > 0) {
      const workflows = this.getCurrentData(this.data, this.workflowFilters);
      workflows.forEach(item => {
        this.object.mapOfCheckedId.set(item.path, item);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(allWorkflow = false): void {
    const workflows = allWorkflow ? this.data : this.getCurrentData(this.data, this.workflowFilters);
    this.object.checked = this.object.mapOfCheckedId.size === workflows.length;
    this.object.isSuspend = true;
    this.object.isResume = true;
    this.object.mapOfCheckedId.forEach(workflow => {
      if (workflow.suspended) {
        this.object.isSuspend = false;
      } else {
        this.object.isResume = false;
      }
    })
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  private init(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'true';
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).workflow;
    }
    let obj = {
      agentList: []
    }
    this.coreService.getAgents(obj, this.schedulerIds.selected, () => {
      this.listOfAgents = obj.agentList;
    });
    this.savedFilter = JSON.parse(this.saveService.workflowFilters) || {};
    if (this.schedulerIds.selected && this.permission.joc && this.permission.joc.administration.customization.view) {
      this.checkSharedFilters();
    } else {
      this.savedFilter.selected = undefined;
      this.initTree();
    }
    if (this.workflowFilters.isTag) {
      this.selectedTags = this.workflowFilters.selectedTags;
      this.calTop();
      this.switchToTagging(true, () => {
        const obj: any = {
          tags: Array.from(this.workflowFilters.selectedTags),
          controllerId: this.schedulerIds.selected
        };
        this.getWorkflowList(obj);
        this.calTop();
      });
    }
    //200ms Delay in search
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  private calTop(): void {
    const dom = $('.scroll-y');
    if (dom && dom.position()) {
      let top = dom.position().top + 12;
      top = top - $(window).scrollTop();
      if (top < 70) {
        top = 92;
      }
      if (top < 150 && top > 140) {
        top = 150;
      }
      $('.sticky').css('top', top);
    }
  }

  private initTree(reload = false): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        folders: [{
          folder: '/',
          recursive: true
        }],
        types: [this.objectType]
      }).subscribe({
        next: res => {
          this.tree = this.coreService.prepareTree(res, true);
          if (this.selectedFiltered && this.selectedFiltered.paths && this.selectedFiltered.paths.length > 0) {
            this.workflowFilters.expandedKeys = this.selectedFiltered.paths;
            this.expandTreeNode(this.selectedFiltered.paths);
          }
          this.isLoading = true;
          if (this.tree.length && !reload) {
            if (!this.workflowFilters.isTag) {
              this.loadWorkflow();
            }
          }
          let isFound = false;
          for (let x in this.workflowFilters.expandedKeys) {
            if (this.workflowFilters.expandedKeys[x] == '/') {
              isFound = true;
              break;
            }
          }
          if (!isFound) {
            this.workflowFilters.expandedKeys.push('/');
          }
        }, error: () => this.isLoading = true
      });
    } else {
      this.isLoading = true;
    }
  }

  private expandTreeNode(paths): void {
    const self = this;
    this.workflowFilters.selectedkeys = [];

    function pushSelectPath(data) {
      for (let i in data.children) {
        self.workflowFilters.selectedkeys.push(data.children[i].path);
        if (data.children[i].children) {
          pushSelectPath(data.children[i]);
        }
      }
    }

    function traverseTree(data) {
      for (let i in data.children) {
        let isMatch = false;
        if (!data.children[i].isLeaf) {
          if (paths.indexOf(data.children[i].path) > -1) {
            self.workflowFilters.selectedkeys.push(data.children[i].path);
            isMatch = true;
            if (data.children[i].children && data.children[i].children.length > 0) {
              pushSelectPath(data.children[i]);
            }
          }
        }
        if (data.children[i].children && !isMatch) {
          traverseTree(data.children[i]);
        }
      }
    }

    function navFullTree() {
      for (let i in self.tree) {
        if (!self.tree[i].isLeaf) {
          if (paths.indexOf(self.tree[i].path) > -1) {
            self.workflowFilters.selectedkeys.push(self.tree[i].path);
          }
        }
        if (self.tree[i].children) {
          traverseTree(self.tree[i]);
        }
      }
    }

    navFullTree();
  }

  private getWorkflowList(obj): void {
    if (obj.folders && obj.folders.length === 1) {
      this.currentPath = obj.folders[0].folder;
    }
    if (!obj.states) {
      if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
        if (this.selectedFiltered.states && this.selectedFiltered.states.length > 0) {
          obj.states = this.selectedFiltered.states;
        }
      } else {
        if (this.workflowFilters.filter.states && this.workflowFilters.filter.states.length > 0) {
          obj.states = [...this.workflowFilters.filter.states];
        }
      }
    }
    if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
      if (this.selectedFiltered.agentNames && this.selectedFiltered.agentNames.length > 0) {
        obj.agentNames = this.selectedFiltered.agentNames;
      }
      if (this.selectedFiltered.tags && this.selectedFiltered.tags.length > 0) {
        obj.tags = this.selectedFiltered.tags;
      }
    } else {
      if (this.workflowFilters.filter.agentNames && this.workflowFilters.filter.agentNames.length > 0) {
        obj.agentNames = this.workflowFilters.filter.agentNames;
      }
    }
    this.coreService.post('workflows', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        if (res.workflows && res.workflows.length === 0) {
          this.workflowFilters.currentPage = 1;
        }
        const request = {
          compact: true,
          controllerId: this.schedulerIds.selected,
          workflowIds: []
        };
        const request2 = {
          controllerId: this.schedulerIds.selected,
          workflowIds: []
        };
        let flag = true;
        let panelObj;
        for (const i in res.workflows) {
          const path = res.workflows[i].path;
          res.workflows[i].name = path.substring(path.lastIndexOf('/') + 1);
          res.workflows[i].path1 = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1);
          if (!res.workflows[i].ordersSummary) {
            res.workflows[i].ordersSummary = {};
          }

          if (this.workflowFilters.expandedObjects && this.workflowFilters.expandedObjects.length > 0 &&
            ((this.workflowFilters.expandedObjects.indexOf(path + res.workflows[i].versionId) > -1) ||
              (this.workflowFilters.expandedObjects.indexOf(path + 'CURRENT') > -1 && res.workflows[i].isCurrentVersion))) {
            this.showPanelFuc(res.workflows[i], false, this.workflowFilters?.mapObj?.get(path + res.workflows[i].versionId));
            if (path) {
              request.workflowIds.push({path, versionId: res.workflows[i].versionId});
            }
          } else {
            if (path) {
              request2.workflowIds.push({path, versionId: res.workflows[i].versionId});
            }
          }

          if (this.showPanel && this.showPanel.path === path) {
            flag = false;
            panelObj = this.showPanel;
          } else {
            if (this.workflowFilters.showPanel == path) {
              flag = false;
              panelObj = res.workflows[i];
              delete this.workflowFilters.showPanel;
            }
          }
        }
        setTimeout(() => {
          if (this.workflowFilters.scrollTop) {
            this.scrollbar?.directiveRef?.scrollToY(this.workflowFilters.scrollTop, 100);
          }
          this.workflowFilters.scrollTop = 0;
        }, 10)
        if (flag) {
          this.hidePanel();
        } else if (panelObj) {
          this.showPanelFunc(panelObj);
        }
        this.workflowFilters.expandedObjects = [];
        this.workflowFilters.mapObj = new Map();
        this.loading = false;
        this.workflows = res.workflows;
        this.workflows = this.orderPipe.transform(this.workflows, this.workflowFilters.filter.sortBy, this.workflowFilters.reverse);
        this.searchInResult();
        if (this.object.mapOfCheckedId.size > 0) {
          const tempObject = new Map();
          this.data.forEach((order) => {
            if (this.object.mapOfCheckedId.has(order.path)) {
              tempObject.set(order.path, order);
            }
          });
          this.object.mapOfCheckedId = tempObject;
          this.object.mapOfCheckedId.size > 0 ? this.refreshCheckedStatus() : this.resetCheckBox();
        } else {
          this.resetCheckBox();
        }
        if (request.workflowIds.length > 0) {
          this.getOrders(request);
        }
        if (request2.workflowIds.length > 0) {
          this.getOrderCounts(request2);
        }
        if (this.isSearchHit && this.showSearchPanel) {
          this.traverseTreeForSearchData();
        }
        this.updatePanelHeight();
      }, error: () => this.loading = false
    });
  }

  checkSharedFilters(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType,
      shared: true
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res: any) => {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = res.configurations;
        }
        this.getCustomizations();
      }, error: () => this.getCustomizations()
    });
  }

  getCustomizations(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res: any) => {
        if (this.filterList && this.filterList.length > 0) {
          if (res.configurations && res.configurations.length > 0) {
            this.filterList = this.filterList.concat(res.configurations);
          }
          let data = [];
          for (let i in this.filterList) {
            let flag = true;
            for (let j in data) {
              if (data[j].id === this.filterList[i].id) {
                flag = false;
              }
            }
            if (flag) {
              data.push(this.filterList[i]);
            }
          }
          this.filterList = data;
        } else {
          this.filterList = res.configurations;
        }

        if (this.savedFilter.selected) {
          let flag = true;
          this.filterList.forEach((value) => {
            if (value.id === this.savedFilter.selected) {
              flag = false;
              this.coreService.post('configuration', {
                controllerId: value.controllerId,
                id: value.id
              }).subscribe({
                next: (conf: any) => {
                  this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                  this.selectedFiltered.account = value.account;
                  this.initTree();
                }, error: () => {
                  this.savedFilter.selected = undefined;
                  this.initTree();
                }
              });
            }
          });
          if (flag) {
            this.savedFilter.selected = undefined;
            this.initTree();
          }
        } else {
          this.savedFilter.selected = undefined;
          this.initTree();
        }
      }, error: () => {
        this.savedFilter.selected = undefined;
        this.initTree();
      }
    });
  }

  inventorySearch(): void {
    this.isSearchVisible = true;
  }

  closeSearch(): void {
    this.isSearchVisible = false;
  }

  onNavigate(data): void {
    const pathArr = [];
    const arr = data.path.split('/');
    this.workflowFilters.selectedkeys = [];
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
    const PATH = data.path.substring(0, data.path.lastIndexOf('/')) || '/';
    this.workflowFilters.expandedKeys = pathArr;
    this.workflowFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
    this.workflowFilters.expandedObjects = [data.path];
    if (this.workflowFilters.isTag) {
      this.workflowFilters.isTag = false;
      this.workflowFilters.selectedIndex = 0;
    }
    const obj = {
      controllerId: this.schedulerIds.selected,
      folders: [{folder: PATH, recursive: false}]
    };
    this.workflows = [];
    this.loading = true;
    this.getWorkflowList(obj);
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event): void {
    this.pageView = $event;
    if (this.pageView === 'list') {
      this.updatePanelHeight();
    }
  }

  navToDetailView(view, workflow): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', workflow.path, workflow.versionId]).then();
  }

  addOrder(workflow): void {
    this.actionChild.addOrder(workflow);
  }

  suspend(workflow) {
    this.actionChild.suspend(workflow);
  }

  suspendAll(all = false) {
    this.suspendResumeOperation('Suspend', all);
  }

  resume(workflow): void {
    this.actionChild.resume(workflow);
  }

  resumeAll(all = false): void {
    this.suspendResumeOperation('Resume', all);
  }

  private suspendResumeOperation(type, all): void {
    const paths = [];
    this.object.mapOfCheckedId.forEach((workflow) => {
      paths.push(workflow.path);
    });
    if (paths.length > 0 || all) {
      this.actionChild[type === 'Resume' ? 'resume' : 'suspend'](null, all || paths, () => {
        this.resetCheckBox();
      });
    }
  }

  showDependency(workflow): void {
    this.actionChild.showDependency(workflow);
  }

  loadOrders(date): void {
    this.workflowFilters.filter.date = date;
    const request = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: []
    };
    const request2 = {
      controllerId: this.schedulerIds.selected,
      workflowIds: []
    };
    for (const i in this.workflows) {
      if (this.workflows[i].path) {
        if (this.workflows[i].show) {
          request.workflowIds.push({path: this.workflows[i].path, versionId: this.workflows[i].versionId});
        } else {
          request2.workflowIds.push({path: this.workflows[i].path, versionId: this.workflows[i].versionId});
        }
      }
    }
    if (request.workflowIds.length > 0) {
      this.getOrders(request);
    }
    if (request2.workflowIds.length > 0) {
      this.getOrderCounts(request2);
    }
  }

  selectAgents(list): void {
    this.workflowFilters.filter.agentNames = list;
    this.loadWorkflow();
  }

  openSelectbox(): void {
    $('#agent-select').click();
  }

  loadWorkflow(status?, skipChild = false): void {
    if (status) {
      const index = this.workflowFilters.filter.states.indexOf(status);
      if (index === -1) {
        this.workflowFilters.filter.states.push(status);
      } else {
        this.workflowFilters.filter.states.splice(index, 1);
      }
    }
    this.reloadState = 'no';
    const obj: any = {
      folders: [],
      controllerId: this.schedulerIds.selected
    };
    this.workflows = [];
    this.loading = true;
    let paths;
    if (this.child && !skipChild) {
      if (this.child.defaultSelectedKeys.length === 0) {
        this.child.defaultSelectedKeys = ['/'];
      }
      paths = this.child.defaultSelectedKeys;
    } else {
      if (this.workflowFilters.selectedkeys.length === 1 && this.workflowFilters.selectedkeys[0] !== '/') {
        if (!this.getMatchPath(this.workflowFilters.selectedkeys[0])) {
          this.workflowFilters.selectedkeys = ['/'];
          let msg = '';
          this.translate.get('error.message.objectNotFound').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.error(msg);
        }
      }
      paths = this.workflowFilters.selectedkeys;
    }
    for (let x in paths) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
      obj.regex = this.selectedFiltered.regex;
      if (this.selectedFiltered.paths && this.selectedFiltered.paths.length > 0) {
        obj.folders = [];
        for (let i in this.selectedFiltered.paths) {
          obj.folders.push({
            folder: this.selectedFiltered.paths[i],
            recursive: this.selectedFiltered.handleRecursively
          });
        }
      }
    }
    this.getWorkflowList(obj);
  }

  getWorkflows(data, recursive): void {
    this.loading = true;
    const obj = {
      folders: [{folder: data.path, recursive}],
      controllerId: this.schedulerIds.selected
    };
    this.getWorkflowList(obj);
  }

  receiveAction($event): void {
    this.getWorkflows($event, $event.action !== 'NODE');
  }

  changeStatus(): void {
    this.loadWorkflow();
  }

  switchToTagging(flag, cb?): void {
    this.workflowFilters.isTag = flag;
    this.workflows = [];
    this.data = [];
    if (flag) {

    } else {
      this.selectedTags.clear();
    }
  }


  selectTags(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: CreateTagModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        filters: this.workflowFilters,
        controllerId: this.schedulerIds.selected
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  selectTag(tag: string): void {
    this.selectedTags.clear();
    this.selectedTags.add(tag);
    const obj: any = {
      tags: [tag],
      controllerId: this.schedulerIds.selected
    };
    this.getWorkflowList(obj);
  }

  showPanelFuc(workflow, flag = true, setObj?): void {
    if (flag && workflow.numOfOrders > 0 && workflow.path) {
      this.getOrders({
        compact: true,
        controllerId: this.schedulerIds.selected,
        workflowIds: [{path: workflow.path, versionId: workflow.versionId}]
      });
    }
    workflow.show = true;
    workflow.configuration = this.coreService.clone(workflow);
    setTimeout(() => {
      this.workflowService.convertTryToRetry(workflow.configuration, null, {}, {count: 0, setObj});
      this.updatePanelHeight();
    }, 0);
  }

  hidePanelFuc(workflow): void {
    workflow.show = false;
    delete workflow.configuration;
    this.updatePanelHeight();
  }

  /* ----------------------Advance Search --------------------- */
  advancedSearch(): void {
    this.showSearchPanel = true;
    this.isUnique = true;
    this.isSearchHit = false;
    this.searchFilter = {};
  }

  search(): void {
    this.loading = true;
    this.isSearchHit = true;
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      compact: false
    };
    if (this.searchFilter && this.searchFilter.regex) {
      obj.regex = this.searchFilter.regex;
    }
    if (this.searchFilter.paths && this.searchFilter.paths.length > 0) {
      obj.folders = [];
      for (let i in this.searchFilter.paths) {
        obj.folders.push({folder: this.searchFilter.paths[i], recursive: this.searchFilter.handleRecursively});
      }
    }
    if (this.searchFilter.instructionStates && this.searchFilter.instructionStates.length > 0) {
      obj.instructionStates = this.searchFilter.instructionStates;
    }
    if (this.searchFilter.states && this.searchFilter.states.length > 0) {
      obj.states = this.searchFilter.states;
    }
    if (this.searchFilter.agentNames && this.searchFilter.agentNames.length > 0) {
      obj.agentNames = this.searchFilter.agentNames;
    }
    if (this.searchFilter.tags && this.searchFilter.tags.length > 0) {
      obj.tags = this.searchFilter.tags;
    }

    this.getWorkflowList(obj);
  }

  /* ---- Customization ------ */
  createCustomization(): void {
    if (this.schedulerIds.selected) {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: FilterModalComponent,
        nzClassName: 'lg',
        nzData: {
          permission: this.permission,
          allFilter: this.filterList,
          listOfAgents: this.listOfAgents,
          new: true
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((configObj) => {
        if (configObj) {
          if (this.filterList.length === 1) {
            this.savedFilter.selected = configObj.id;
            this.workflowFilters.selectedView = true;
            this.selectedFiltered = configObj;
            this.initTree();
            this.saveService.setWorkflow(this.savedFilter);
            this.saveService.save();
          }
        }
      });
    }
  }

  editFilters(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EditFilterModalComponent,
      nzData: {
        filterList: this.filterList,
        favorite: this.savedFilter.favorite,
        permission: this.permission,
        username: this.authService.currentUserData,
        action: this.action,
        self: this
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(obj => {
      if (obj) {
        if (obj.type === 'EDIT') {
          this.editFilter(obj);
        } else if (obj.type === 'COPY') {
          this.copyFilter(obj);
        }
      }
    });
  }

  action(type: string, obj: any, self: any): void {
    if (type === 'DELETE') {
      if (self.savedFilter.selected == obj.id) {
        self.savedFilter.selected = undefined;
        self.workflowFilters.selectedView = false;
        self.selectedFiltered = undefined;
        self.initTree();
      } else {
        if (self.filterList.length == 0) {
          self.savedFilter.selected = undefined;
          self.workflowFilters.selectedView = false;
          self.selectedFiltered = undefined;
        }
      }
      self.saveService.setWorkflow(self.savedFilter);
      self.saveService.save();
    } else if (type === 'MAKEFAV') {
      self.savedFilter.favorite = obj.id;
      self.workflowFilters.selectedView = true;
      self.saveService.setWorkflow(self.savedFilter);
      self.saveService.save();
      self.initTree();
    } else if (type === 'REMOVEFAV') {
      self.savedFilter.favorite = '';
      self.saveService.setWorkflow(self.savedFilter);
      self.saveService.save();
    }
  }

  changeFilter(filter): void {
    this.cancel();
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.workflowFilters.selectedView = true;
      this.coreService.post('configuration', {
        controllerId: filter.controllerId,
        id: filter.id
      }).subscribe((conf: any) => {
        this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
        this.selectedFiltered.account = filter.account;
        this.initTree();
      });
    } else {
      this.savedFilter.selected = filter;
      this.workflowFilters.selectedView = false;
      this.selectedFiltered = {};
      this.initTree();
    }

    this.saveService.setWorkflow(this.savedFilter);
    this.saveService.save();
  }

  /* ---------------------------- Action ----------------------------------*/
  sort(key): void {
    this.workflowFilters.reverse = !this.workflowFilters.reverse;
    this.workflowFilters.filter.sortBy = key;
    this.data = this.orderPipe.transform(this.data, this.workflowFilters.filter.sortBy, this.workflowFilters.reverse);
    this.resetCheckBox();
  }

  pageIndexChange($event: number): void {
    this.workflowFilters.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      this.resetCheckBox();
    }
  }

  pageSizeChange($event: number): void {
    this.workflowFilters.entryPerPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      }
    }
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.workflowFilters.searchText ? this.searchPipe.transform(this.workflows, this.workflowFilters.searchText, this.searchableProperties) : this.workflows;
    this.data = [...this.data];
  }

  showPanelFunc(value): void {
    if (this.permission && this.permission.joc && (this.permission.currentController.orders.view || this.permission.joc.auditLog.view)) {
      this.showPanel = value;
    }
  }

  exportToExcel(): void {
    let name = '', path = '', deploymentDate = '', status = '', numOfOrders = '', pending = '', scheduled = '',
      running = '',
      suspended = '', prompting = '', failed = '', waiting = '', blocked = '', calling = '', inprogress = '';
    this.translate.get('common.label.name').subscribe(translatedValue => {
      name = translatedValue;
    });
    this.translate.get('common.label.path').subscribe(translatedValue => {
      path = translatedValue;
    });
    this.translate.get('inventory.label.deploymentDate').subscribe(translatedValue => {
      deploymentDate = translatedValue;
    });
    this.translate.get('common.label.status').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('workflow.label.noOfOrders').subscribe(translatedValue => {
      numOfOrders = translatedValue;
    });
    if (!this.workflowFilters.isCompact) {
      this.translate.get('common.label.pending').subscribe(translatedValue => {
        pending = translatedValue;
      });
      this.translate.get('common.label.scheduled').subscribe(translatedValue => {
        scheduled = translatedValue;
      });
      this.translate.get('common.label.incomplete').subscribe(translatedValue => {
        inprogress = translatedValue;
      });
      this.translate.get('common.label.running').subscribe(translatedValue => {
        running = translatedValue;
      });
      this.translate.get('common.label.calling').subscribe(translatedValue => {
        calling = translatedValue;
      });
      this.translate.get('common.label.suspended').subscribe(translatedValue => {
        suspended = translatedValue;
      });
      this.translate.get('common.label.prompting').subscribe(translatedValue => {
        prompting = translatedValue;
      });
      this.translate.get('common.label.failed').subscribe(translatedValue => {
        failed = translatedValue;
      });
      this.translate.get('common.label.waiting').subscribe(translatedValue => {
        waiting = translatedValue;
      });
      this.translate.get('common.label.blocked').subscribe(translatedValue => {
        blocked = translatedValue;
      });
    }

    let data = [];
    for (let i in this.workflows) {
      let obj: any = {};
      obj[name] = this.workflows[i].name;
      obj[path] = this.workflows[i].path;
      obj[deploymentDate] = this.coreService.stringToDate(this.preferences, this.workflows[i].versionDate);
      this.translate.get(this.workflows[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      obj[numOfOrders] = this.workflows[i].numOfOrders || 0;
      if (!this.workflowFilters.isCompact) {
        obj[pending] = this.workflows[i].ordersSummary.pending || 0;
        obj[scheduled] = this.workflows[i].ordersSummary.scheduled || 0;
        obj[inprogress] = this.workflows[i].ordersSummary.inprogress || 0;
        obj[running] = this.workflows[i].ordersSummary.running || 0;
        obj[suspended] = this.workflows[i].ordersSummary.suspended || 0;
        obj[prompting] = this.workflows[i].ordersSummary.prompting || 0;
        obj[calling] = this.workflows[i].ordersSummary.calling || 0;
        obj[waiting] = this.workflows[i].ordersSummary.waiting || 0;
        obj[blocked] = this.workflows[i].ordersSummary.blocked || 0;
        obj[failed] = this.workflows[i].ordersSummary.failed || 0;
      }
      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-workflows');
  }

  hidePanel(): void {
    this.showPanel = '';
  }

  hideSidebarPanel(): void {
    this.sideView.show = false;
    this.coreService.hidePanel();
  }

  showSidebarPanel(): void {
    this.sideView.show = true;
    this.coreService.showLeftPanel();
  }

  expandDetails(): void {
    const workflows = this.getCurrentData(this.data, this.workflowFilters);
    const workflowIds = [];
    workflows.forEach((workflow) => {
      workflow.show = true;
      workflow.configuration = this.coreService.clone(workflow);
      this.workflowService.convertTryToRetry(workflow.configuration, null, {}, {count: 0});
      if (workflow.numOfOrders > 0) {
        workflowIds.push({path: workflow.path, versionId: workflow.versionId});
      }
    });
    this.updatePanelHeight();
    this.getOrders({
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds
    });
  }

  collapseDetails(): void {
    const workflows = this.getCurrentData(this.data, this.workflowFilters);
    workflows.forEach((workflow) => {
      workflow.show = false;
      delete workflow.configuration;
    });
    this.updatePanelHeight();
  }

  resetPanel(): void {
    const rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.workflow && typeof rsHt.workflow === 'object') {
      if (rsHt.workflow[this.currentPath]) {
        delete rsHt.workflow[this.currentPath];
        this.saveService.setResizerHeight(rsHt);
        this.saveService.save();
      }
    }
    this._updatePanelHeight();
  }

  updatePanelHeight(): void {
    let rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.workflow && !isEmpty(rsHt.workflow)) {
      if (rsHt.workflow[this.currentPath]) {
        this.resizerHeight = rsHt.workflow[this.currentPath];
        $('#workflowTableId').css('height', this.resizerHeight);
      } else {
        this._updatePanelHeight();
      }
    } else {
      this._updatePanelHeight();
    }
  }

  viewOrders(workflow): void {
    this.sideBar = {
      isVisible: true,
      loading: true,
      orders: workflow.orders,
      workflow: workflow.path,
      versionId: workflow.versionId,
      orderPreparation: workflow.orderPreparation
    };
    if (!workflow.show && workflow.numOfOrders > 0) {
      this.getOrders({
        compact: true,
        controllerId: this.schedulerIds.selected,
        workflowIds: [{path: workflow.path, versionId: workflow.versionId}]
      }, () => {
        this.sideBar.loading = false;
      });
    } else {
      this.sideBar.loading = false;
    }
  }

  viewOrderState(state, loading = true) {
    let workflowIds = [];
    for (let i in this.workflows) {
      if (this.workflows[i].path) {
        workflowIds.push({path: this.workflows[i].path, versionId: this.workflows[i].versionId});
      }
    }
    if (loading) {
      this.sideBar = {
        isVisible: true,
        loading: loading,
        state,
        orders: []
      };
    }
    const request = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: workflowIds,
      states: state == 'COMPLETED' ? ["FINISHED", "CANCELLED"] : [state]
    };
    this.getOrdersOnState(request);
  }

  private getOrdersOnState(obj) {
    obj.limit = this.preferences.maxOrderRecords;
    this.coreService.post('orders', obj).subscribe((res: any) => {
      if (res) {
        this.sideBar.loading = false;
      }
      this.sideBar.orders = res.orders;
    });
  }

  toggleCompactView(): void {
    this.workflowFilters.isCompact = !this.workflowFilters.isCompact;
    this.preferences.isWorkflowCompact = this.workflowFilters.isCompact;
    this.saveProfileSettings(this.preferences);
  }

  viewHistory(data): void {
    if (this.permission && this.permission.joc && (this.permission.currentController.orders.view || this.permission.joc.auditLog.view)) {
      if (data.path) {
        for (let i in this.data) {
          if (this.data[i].path == data.path) {
            let timeOut = 0;
            if (this.showPanel && this.showPanel.jobName === data.jobName) {
              this.showPanel.jobName = null;
              timeOut = 10;
            }
            setTimeout(() => {
              this.showPanel = this.data[i];
              this.showPanel.jobName = data.jobName;
            }, timeOut);
            break;
          }
        }
      }
    }
  }

  cancel(): void {
    this.showSearchPanel = false;
    this.searchFilter = {};
    if (this.isSearchHit) {
      this.isSearchHit = false;
      this.changeStatus();
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      const request = [];

      let flag = false;
      let reload = true;
      let callOrderCount = false;
      for (const j in args.eventSnapshots) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' || args.eventSnapshots[j].eventType === 'WorkflowUpdated') {
          for (const i in this.workflows) {
            if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow &&
              (this.workflows[i].path === args.eventSnapshots[j].workflow.path
                && this.workflows[i].versionId === args.eventSnapshots[j].workflow.versionId)) {
              let flg = true;
              for (const x in request) {
                if (request[x].path === args.eventSnapshots[j].workflow.path && request[x].versionId === args.eventSnapshots[j].workflow.versionId) {
                  flg = false;
                  break;
                }
              }
              if (flg) {
                if (this.workflows[i].show || (this.sideBar.workflow === this.workflows[i].path && this.sideBar.versionId === this.workflows[i].versionId)) {
                  request.push(args.eventSnapshots[j].workflow);
                }
              }
              callOrderCount = true;
            } else if (args.eventSnapshots[j].eventType === 'WorkflowUpdated' && (args.eventSnapshots[j].path && this.workflows[i].path === args.eventSnapshots[j].path)) {
              this.coreService.post('workflow', {
                controllerId: this.schedulerIds.selected,
                workflowId: {path: this.workflows[i].path, versionId: this.workflows[i].versionId}
              }).subscribe({
                next: (res: any) => {
                  this.workflows[i].suspended = res.workflow.suspended;
                  this.workflows[i].state = res.workflow.state;
                  this.workflows[i].jobs = res.workflow.jobs;
                  if (this.workflows[i].show) {
                    this.workflowService.convertTryToRetry(res.workflow, null, {}, {count: 0});
                    this.workflowService.compareAndMergeInstructions(this.workflows[i].configuration.instructions, res.workflow.instructions);
                  }
                }
              });
            }
          }
        }
        if ((args.eventSnapshots[j].eventType === 'ProblemEvent' || args.eventSnapshots[j].eventType === 'ProblemAsHintEvent') && args.eventSnapshots[j].message) {
          this.resetAction();
        }
        if (args.eventSnapshots[j].objectType === this.objectType && (args.eventSnapshots[j].eventType.match(/Item/))) {
          if (args.eventSnapshots[j].path) {
            let path = args.eventSnapshots[j].path.substring(0, args.eventSnapshots[j].path.lastIndexOf('/')) || args.eventSnapshots[j].path.substring(0, args.eventSnapshots[j].path.lastIndexOf('/') + 1);
            if (this.child && this.child.defaultSelectedKeys.length > 0 && this.child.defaultSelectedKeys.indexOf(path) > -1) {
              reload = false;
            }
          }
          if (args.eventSnapshots[j].eventType === 'ItemDeleted') {
            for (const i in this.workflows) {
              if (this.workflows[i].path === args.eventSnapshots[j].workflow.path && this.workflows[i].versionId === args.eventSnapshots[j].workflow.versionId) {
                this.workflows.splice(i, 1);
                this.resetAction();
                this.searchInResult();
                break;
              }
            }
          }
          flag = true;
        }
      }
      this.refreshView(flag, reload, request, callOrderCount);
    }
  }


  private refreshView(flag, reload, request, callOrderCount): void {
    if (!this.isDropdownOpen && this.object.mapOfCheckedId.size === 0) {
      if (flag) {
        this.initTree(reload);
      }
      if (request && request.length > 0) {
        this.getOrders({
          compact: true,
          controllerId: this.schedulerIds.selected,
          workflowIds: request
        });
      }
      if (callOrderCount) {
        this.getOrderCounts({
          controllerId: this.schedulerIds.selected,
          workflowIds: this.workflows.map(item => {
            return {path: item.path, versionId: item.versionId}
          })
        });
        if (this.sideBar?.isVisible) {
          if (this.sideBar.state) {
            this.viewOrderState(this.sideBar.state, false);
          }
        }
      }
    } else {
      setTimeout(() => {
        this.refreshView(flag, reload, request, callOrderCount);
      }, 750);
    }
  }

  private getOrderCounts(obj): void {
    if (!obj.workflowIds || obj.workflowIds.length === 0 || (this.permission && !this.permission.currentController.orders.view)) {
      return;
    }
    if (this.workflowFilters.filter.date !== 'ALL') {
      obj.dateTo = this.workflowFilters.filter.date;
      if (this.workflowFilters.filter.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('workflows/order_count', obj).subscribe((res: any) => {
      this.numOfAllOrders = res.numOfAllOrders;
      for (let i in this.workflows) {
        for (let j in res.workflows) {
          if ((this.workflows[i].path === res.workflows[j].path || this.workflows[i].name === res.workflows[j].path)
            && this.workflows[i].versionId === res.workflows[j].versionId) {
            this.workflows[i].numOfOrders = res.workflows[j].numOfOrders.blocked + res.workflows[j].numOfOrders.failed + res.workflows[j].numOfOrders.inProgress
              + res.workflows[j].numOfOrders.pending + res.workflows[j].numOfOrders.prompting + res.workflows[j].numOfOrders.running + res.workflows[j].numOfOrders.suspended
              + res.workflows[j].numOfOrders.scheduled + res.workflows[j].numOfOrders.terminated + res.workflows[j].numOfOrders.waiting;
            this.workflows[i].ordersSummary = res.workflows[j].numOfOrders || {};
            this.workflows[i].ordersSummary.inprogress = this.workflows[i].ordersSummary.inProgress;
            res.workflows.splice(j, 1);
            break;
          }
        }
      }
    });
  }

  private getOrders(obj, cb = null): void {
    if (!obj.workflowIds || obj.workflowIds.length === 0 || (this.permission && !this.permission.currentController.orders.view)) {
      return;
    }
    if (this.workflowFilters.filter.date !== 'ALL') {
      obj.dateTo = this.workflowFilters.filter.date;
      if (this.workflowFilters.filter.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.preferences.zone;
    }
    obj.compact = true;
    obj.limit = this.preferences.maxWorkflowRecords;
    this.coreService.post('orders', obj).subscribe({
      next: (res: any) => {
        if (res.orders) {
          for (let i in this.workflows) {
            if (obj.workflowIds && obj.workflowIds.length > 0 && !isEmpty(this.workflows[i].ordersSummary)) {
              for (let j = 0; j < obj.workflowIds.length; j++) {
                if (this.workflows[i].path === obj.workflowIds[j].path && this.workflows[i].versionId === obj.workflowIds[j].versionId) {
                  this.workflows[i].numOfOrders = 0;
                  this.workflows[i].orders = [];
                  this.workflows[i].orderReload = false;
                  this.workflows[i].ordersSummary = {};
                  obj.workflowIds.splice(j, 1);
                  break;
                }
              }
            }
            for (let j in res.orders) {
              if (this.workflows[i].path === res.orders[j].workflowId.path && this.workflows[i].versionId === res.orders[j].workflowId.versionId) {
                this.workflows[i].numOfOrders = (this.workflows[i].numOfOrders || 0) + 1;
                if (!this.workflows[i].orders) {
                  this.workflows[i].orders = [];
                }
                for (const o in res.orders[j].position) {
                  if (/^(try\+)/.test(res.orders[j].position[o])) {
                    res.orders[j].position[o] = 'try+0';
                  }
                  if (/^(cycle\+)/.test(res.orders[j].position[o])) {
                    res.orders[j].position[o] = 'cycle';
                  }
                }
                this.workflows[i].orders.push(res.orders[j]);
                const state = res.orders[j].state._text.toLowerCase();
                if (this.workflows[i].ordersSummary[state]) {
                  this.workflows[i].ordersSummary[state] = this.workflows[i].ordersSummary[state] + 1;
                } else {
                  this.workflows[i].ordersSummary[state] = 1;
                }
                this.workflows[i].orderReload = true;
              }
            }
            if (this.sideBar.isVisible && this.workflows[i].path === this.sideBar.workflow &&
              this.sideBar.isVisible && this.workflows[i].versionId === this.sideBar.versionId) {
              this.sideBar.orders = this.workflows[i].orders;
            }
          }
        }
        if (cb) {
          cb();
        }
        this.resetAction();
      }, error: () => {
        if (cb) {
          cb();
        }
        this.resetAction();
      }
    });
  }

  private getMatchPath(path): boolean {
    let flag = false;

    function traverseTree(data): void {
      if (!flag) {
        for (const i in data.children) {
          if (data.children[i].path === path) {
            flag = true;
            break;
          }
          if (data.children[i].children && data.children[i].children.length > 0) {
            traverseTree(data.children[i]);
          }
        }
      }
    }

    for (const x in this.tree) {
      traverseTree(this.tree[x]);
    }
    return flag;
  }

  private traverseTreeForSearchData(): void {
    const self = this;
    this.workflowFilters.expandedKeys = [];
    this.workflowFilters.selectedkeys = [];

    function traverseTree1(data) {
      for (let i in data.children) {
        if (!data.children[i].isLeaf) {
          self.workflowFilters.expandedKeys.push(data.children[i].path);
        }
        pushJob(data.children[i]);
        traverseTree1(data.children[i]);
      }
    }

    function navFullTree() {
      for (let i in self.tree) {
        if (!self.tree[i].isLeaf) {
          self.workflowFilters.expandedKeys.push(self.tree[i].path);
        }
        pushJob(self.tree[i]);
        traverseTree1(self.tree[i]);
      }
    }

    function pushJob(data) {
      for (let i in self.workflows) {
        if (data.path === self.workflows[i].path1) {
          self.workflowFilters.selectedkeys.push(self.workflows[i].path1);
        }
      }
    }

    navFullTree();
  }

  private editFilter(filter): void {
    this.openFilterModal(filter, false);
  }

  private copyFilter(filter): void {
    this.openFilterModal(filter, true);
  }

  private openFilterModal(filter, isCopy): void {
    if (this.schedulerIds.selected) {
      let filterObj: any = {};
      this.coreService.post('configuration', {
        controllerId: filter.controllerId,
        id: filter.id
      }).subscribe((conf: any) => {
        filterObj = JSON.parse(conf.configuration.configurationItem);
        filterObj.shared = filter.shared;
        if (isCopy) {
          filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);
        } else {
          filterObj.id = filter.id;
        }
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: FilterModalComponent,
          nzClassName: 'lg',
          nzData: {
            permission: this.permission,
            allFilter: this.filterList,
            listOfAgents: this.listOfAgents,
            filter: filterObj,
            edit: !isCopy
          },
          nzFooter: null,
          nzAutofocus: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(obj => {
          if (obj && this.savedFilter.selected && filterObj.id == this.savedFilter.selected) {
            this.changeFilter(filterObj);
          }
        });
      });
    }
  }

  private _updatePanelHeight(): void {
    setTimeout(() => {
      let ht = (parseInt($('#workflowTableId table').height(), 10) + 62);
      if (ht > 140 && ht < 150) {
        ht += 40;
      }
      let el = document.getElementById('workflowTableId');
      if (el && el.scrollWidth > el.clientWidth) {
        ht = ht + 11;
      }
      if (ht > 480) {
        ht = 480;
      }

      if (ht < 140) {
        ht = 142;
      }
      this.resizerHeight = ht + 'px';
      $('#workflowTableId').css('height', this.resizerHeight);
    }, 10);
  }

  private saveProfileSettings(preferences): void {
    const configObj = {
      controllerId: this.schedulerIds.selected,
      accountName: this.authService.currentUserData,
      profileItem: JSON.stringify(preferences)
    };
    sessionStorage['preferences'] = configObj.profileItem;
    this.coreService.post('profile/prefs/store', configObj).subscribe();
  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.workflows = [];
      this.data = [];
      this.reloadState = 'yes';
      this.loading = false;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.loading = true;
      this.loadWorkflow();
    }
  }

  /***************** Tag Search ***********/

  private searchObjects(value: string) {
    if (value !== '') {
      const searchValueWithoutSpecialChars = value.replace(/[^\w\s]/gi, '');
      if (searchValueWithoutSpecialChars.length >= 2) {
        this.searchTag.loading = true;
        let request: any = {
          search: value,
          controllerId: this.schedulerIds.selected
        };
        if (this.searchTag.token) {
          request.token = this.searchTag.token;
        }
        this.coreService.post('workflows/tag/search', request).subscribe({
          next: (res: any) => {
            console.log(res)
            this.searchTag.tags = res.results;
            this.searchTag.token = res.token;
            this.searchTag.loading = false;
          }, error: () => this.searchTag.loading = true
        });
      }
    } else {
      this.searchTag.tags = [];
    }
  }

  selectTagOnSearch(tag): void{
    this.coreService.selectedTags.push(tag);
    this.coreService.removeDuplicates();
  }

  objectTreeSearch() {
    $('#objectTagSearch').focus();
    $('.editor-tree  a').addClass('hide-on-focus');
  }

  clearSearchInput(): void {
    this.searchTag.tags = [];
    this.searchTag.text = '';
    $('.editor-tree  a').removeClass('hide-on-focus');
  }

  onSearchInput(searchValue: string) {
    this.searchTerm.next(searchValue);
  }
}
