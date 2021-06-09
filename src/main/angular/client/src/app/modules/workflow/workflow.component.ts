import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {isEmpty, isArray, clone} from 'underscore';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {WorkflowActionComponent} from './workflow-action/workflow-action.component';
import {AuthService} from '../../components/guard';
import {SaveService} from '../../services/save.service';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {WorkflowService} from '../../services/workflow.service';
import {ExcelService} from '../../services/excel.service';
import {SearchPipe} from '../../pipes/core.pipe';

declare const $: any;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './filter-dialog.html',
})
export class FilterModalComponent implements OnInit {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  name: string;

  @Input() allFilter;
  @Input() new;
  @Input() edit;
  @Input() filter;

  constructor(private authService: AuthService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
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

  cancel(obj): void {
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
export class SearchComponent implements OnInit {
  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() permission: any;
  @Input() isSearch: boolean;
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  dateFormat: any;
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  getFolderTree(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: TreeModalComponent,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        paths: this.filter.paths || [],
        type: 'WORKFLOW',
        showCheckBox: true
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (isArray(result)) {
          this.filter.paths = result;
        }
      }
    });
  }

  remove(path): void {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
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
      name: result.name
    };
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'WORKFLOW',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: JSON.stringify(obj)
    };
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
      configObj.id = res.id;
      this.allFilter.push(configObj);
      if (this.isSearch) {
        this.filter.name = '';
      } else {
        this.onCancel.emit(configObj);
      }
      this.submitted = false;
    }, () => {
      this.submitted = false;
    });
  }

  search(): void {
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
export class SingleWorkflowComponent implements OnInit, OnDestroy {
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
  date = '1d';
  subscription1: Subscription;

  filterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'}
  ];

  @ViewChild(WorkflowActionComponent, {static: false}) actionChild;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService,
              private route: ActivatedRoute, private workflowService: WorkflowService, private router: Router) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.path = this.route.snapshot.queryParamMap.get('path');
    this.versionId = this.route.snapshot.queryParamMap.get('versionId');
    this.controllerId = this.route.snapshot.queryParamMap.get('controllerId');
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getWorkflowList({
      controllerId: this.controllerId,
      workflowId: {path: this.path, versionId: this.versionId ? this.versionId : undefined}
    });
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  loadOrders(date): void {
    this.date = date;
    const request = {
      compact: true,
      controllerId: this.controllerId,
      workflowIds: []
    };
    const path = this.workflows[0].path;
    request.workflowIds.push({path, versionId: this.workflows[0].versionId});
    if (request.workflowIds.length > 0) {
      this.getOrders(request);
    }
  }

  showPanelFuc(workflow): void {
    workflow.show = true;
    $('#workflowTableId').css('height', 450);
    workflow.configuration = this.coreService.clone(workflow);
    this.workflowService.convertTryToRetry(workflow.configuration, null);
  }

  hidePanelFuc(workflow): void {
    workflow.show = false;
    $('#workflowTableId').css('height', 150);
    delete workflow['configuration'];
  }

  viewOrders(workflow): void {
    this.sideBar = {isVisible: true, orders: workflow.orders, workflow: workflow.path, orderRequirements: workflow.orderRequirements};
  }

  navToDetailView(view, workflow): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', workflow.path, workflow.versionId]);
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (const j in args.eventSnapshots) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow
          && this.path === args.eventSnapshots[j].workflow.path && args.eventSnapshots[j].workflow === this.versionId) {
          this.getOrders({
            compact: true,
            controllerId:  this.controllerId,
            workflowIds: args.eventSnapshots[j].workflow
          });
          break;
        }
      }
    }
  }

  private getWorkflowList(obj): void {
    this.coreService.post('workflow', obj).subscribe((res: any) => {
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
      request.workflowIds.push({path, versionId: res.workflow.versionId});
      this.workflows = [res.workflow];
      if (request.workflowIds.length > 0) {
        this.getOrders(request);
      }
      if (this.permission && this.permission.joc && (this.permission.currentController.orders.view || this.permission.joc.auditLog.view)) {
        this.showPanel = this.workflows[0];
      }
    }, () => {
      this.loading = false;
    });
  }

  private getOrders(obj): void {
    if(this.permission && !this.permission.currentController.orders.view){
      return;
    }
    if (this.date !== 'ALL') {
      obj.dateTo = this.date;
    }
    obj.timeZone = this.preferences.zone;
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.workflows[0].orders = res.orders;
      this.workflows[0].ordersSummary = {};
      this.workflows[0].numOfOrders = res.orders.length;
      if (res.orders && res.orders.length > 0) {
        for (let j in res.orders) {
          for (const o in res.orders[j].position) {
            if (/^(try+)/.test(res.orders[j].position[o])) {
              res.orders[j].position[o] = 'try+0';
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
export class WorkflowComponent implements OnInit, OnDestroy {
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
  selectedPath: string;
  workflowFilters: any = {};
  showPanel: any;
  showSearchPanel = false;
  searchFilter: any = {};
  sideView: any = {};
  selectedFiltered: any = {};
  savedFilter: any = {};
  filterList: any = [];
  data = [];
  currentData = [];
  sideBar: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  searchableProperties = ['name', 'path', 'versionDate', 'state', '_text'];

  filterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'}
  ];

  @ViewChild(TreeComponent, {static: false}) child;
  @ViewChild(WorkflowActionComponent, {static: false}) actionChild;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modal: NzModalService, private workflowService: WorkflowService,
              private translate: TranslateService, private searchPipe: SearchPipe, private excelService: ExcelService,
              private toasterService: ToasterService, private router: Router) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
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
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.workflowFilters.expandedObjects = [];
    for (const i in this.currentData) {
      if (this.currentData[i].show) {
        this.workflowFilters.expandedObjects.push(this.currentData[i].path);
      }
    }
    if (this.child) {
      this.workflowFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.workflowFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    $('.scroll-y').remove();
    this.modal.closeAll();
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event): void {
    this.pageView = $event;
  }

  navToDetailView(view, workflow): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', workflow.path, workflow.versionId]);
  }

  checkSharedFilters(): void {
    if (this.permission.joc) {
      let obj = {
        controllerId: this.schedulerIds.selected,
        configurationType: 'CUSTOMIZATION',
        objectType: 'WORKFLOW',
        shared: true
      };
      this.coreService.post('configurations', obj).subscribe((res: any) => {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = res.configurations;
        }
        this.getCustomizations();
      }, (err) => {
        this.getCustomizations();
      });
    } else {
      this.getCustomizations();
    }
  }

  getCustomizations(): void {
    let obj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'WORKFLOW'
    };
    this.coreService.post('configurations', obj).subscribe((res: any) => {
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
            }).subscribe((conf: any) => {
              this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
              this.selectedFiltered.account = value.account;
              this.initTree();
            });
          }
        });
        if (flag) {
          this.savedFilter.selected = undefined;
          this.initTree();
        }
      }
    }, (err) => {
      this.savedFilter.selected = undefined;
    });
  }

  loadOrders(date): void {
    this.workflowFilters.filter.date = date;
    const request = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: []
    };
    for (const i in this.workflows) {
      const path = this.workflows[i].path;
      let flag = true;
      for (const j in request.workflowIds) {
        if (request.workflowIds[j].path === path && request.workflowIds[j].versionId === this.workflows[i].versionId) {
          flag = false;
          break;
        }
      }
      if (flag) {
        request.workflowIds.push({path, versionId: this.workflows[i].versionId});
      }
    }
    if (request.workflowIds.length > 0) {
      this.getOrders(request);
    }
  }

  loadWorkflow(): void {
    const obj = {
      folders: [],
      controllerId: this.schedulerIds.selected
    };
    this.workflows = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
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
          this.toasterService.pop('error', '', msg);
        }
      }
      paths = this.workflowFilters.selectedkeys;
    }
    for (let x in paths) {
      obj.folders.push({folder: paths[x], recursive: false});
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

  showPanelFuc(workflow): void {
    workflow.show = true;
    workflow.configuration = this.coreService.clone(workflow);
    this.workflowService.convertTryToRetry(workflow.configuration, null);
    this.updatePanelHeight();
  }

  hidePanelFuc(workflow): void {
    workflow.show = false;
    delete workflow['configuration'];
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
      compact: true
    };
    if (this.searchFilter && this.searchFilter.regex) {
      obj.regex = this.searchFilter.regex;
    }
    if (this.searchFilter.paths && this.searchFilter.paths.length > 0) {
      obj.folders = [];
      for (let i in this.searchFilter.paths) {
        obj.folders.push({folder: this.searchFilter.paths[i], recursive: true});
      }
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
        nzComponentParams: {
          permission: this.permission,
          allFilter: this.filterList,
          new: true
        },
        nzFooter: null,
        nzClosable: false
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
      nzComponentParams: {
        filterList: this.filterList,
        favorite: this.savedFilter.favorite,
        permission: this.permission,
        username: this.authService.currentUserData,
        action: this.action,
        self: this
      },
      nzFooter: null,
      nzClosable: false
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

  action(type, obj, self): void {
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
  }

  pageIndexChange($event): void {
    this.workflowFilters.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.workflowFilters.entryPerPage = $event;
  }

  currentPageDataChange($event): void {
    this.currentData = $event;
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
    let name = '', path = '', deploymentDate = '', status = '', numOfOrders = '', pending = '', running = '',
      suspended = '', failed = '', waiting = '', blocked = '', calling = '', inprogress = '';
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
        obj[inprogress] = this.workflows[i].ordersSummary.inprogress || 0;
        obj[running] = this.workflows[i].ordersSummary.running || 0;
        obj[suspended] = this.workflows[i].ordersSummary.suspended || 0;
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

  expandDetails(): void {
    this.currentData.forEach((workflow) => {
      workflow.show = true;
      workflow.configuration = this.coreService.clone(workflow);
      this.workflowService.convertTryToRetry(workflow.configuration, null);
    });
    this.updatePanelHeight();
  }

  collapseDetails(): void {
    this.currentData.forEach((workflow) => {
      workflow.show = false;
      delete workflow['configuration'];
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
        this._updatePanelHeight();
      }
    }
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
      orders: workflow.orders,
      workflow: workflow.path,
      versionId: workflow.versionId,
      orderRequirements: workflow.orderRequirements
    };
  }

  toggleCompactView(): void {
    this.workflowFilters.isCompact = !this.workflowFilters.isCompact;
    if (!this.workflowFilters.isCompact) {
      this.changeStatus();
    }
    this.preferences.isWorkflowCompact = this.workflowFilters.isCompact;
    this.saveProfileSettings(this.preferences);
  }

  cancel(): void {
    this.showSearchPanel = false;
    this.searchFilter = {};
    if (this.isSearchHit) {
      this.isSearchHit = false;
      this.changeStatus();
    }
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      const request = [];
      let flag = false;
      let reload = true;
      for (const j in args.eventSnapshots) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow) {
          for (const i in this.workflows) {
            if (this.workflows[i].path === args.eventSnapshots[j].workflow.path && this.workflows[i].versionId === args.eventSnapshots[j].workflow.versionId) {
              let flag = true;
              for (const x in request) {
                if (request[x].path === args.eventSnapshots[j].workflow.path && request[x].versionId === args.eventSnapshots[j].workflow.versionId) {
                  flag = false;
                  break;
                }
              }
              if (flag) {
                request.push(args.eventSnapshots[j].workflow);
              }
              break;
            }
          }
        }
        if (args.eventSnapshots[j].objectType === 'WORKFLOW' && (args.eventSnapshots[j].eventType.match(/Item/))) {
          let path = args.eventSnapshots[j].path.substring(0, args.eventSnapshots[j].path.lastIndexOf('/')) || args.eventSnapshots[j].path.substring(0, args.eventSnapshots[j].path.lastIndexOf('/') + 1);
          if (this.child && this.child.defaultSelectedKeys.length > 0 && this.child.defaultSelectedKeys.indexOf(path) > -1) {
            reload = false;
          }
          flag = true;
        }
      }
      if (flag) {
        this.initTree(reload);
      }
      if (request && request.length > 0) {
        this.updateWorkflow(request);
      }
    }
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).workflow;
    }
    if (!this.savedFilter.selected) {
      this.initTree();
    }
    //this.checkSharedFilters();
  }

  private initTree(reload = false): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        folders: [{
          folder: '/',
          recursive: true
        }],
        types: ['WORKFLOW']
      }).subscribe(res => {
        this.tree = this.coreService.prepareTree(res, true);
        if (this.tree.length && !reload) {
          this.loadWorkflow();
        }
        this.isLoading = true;
      }, () => {
        this.isLoading = true;
      });
    } else {
      this.isLoading = true;
    }
  }

  private getWorkflowList(obj): void {
    if (obj.folders.length === 1) {
      this.currentPath = obj.folders[0].folder;
    }
    this.coreService.post('workflows', obj).subscribe((res: any) => {
      this.loading = false;
      const request = {
        compact: true,
        controllerId: this.schedulerIds.selected,
        workflowIds: []
      };
      let flag = true;
      for (let i in res.workflows) {
        const path = res.workflows[i].path;
        res.workflows[i].name = path.substring(path.lastIndexOf('/') + 1);
        res.workflows[i].path1 = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1);
        if (!res.workflows[i].ordersSummary) {
          res.workflows[i].ordersSummary = {};
        }
        let flag = true;
        for (let j in request.workflowIds) {
          if (request.workflowIds[j].path === path && request.workflowIds[j].versionId === res.workflows[i].versionId) {
            flag = false;
            break;
          }
        }
        if (flag) {
          request.workflowIds.push({path, versionId: res.workflows[i].versionId});
        }
        if (this.workflowFilters.expandedObjects && this.workflowFilters.expandedObjects.length > 0 &&
          this.workflowFilters.expandedObjects.indexOf(path) > -1) {
          this.showPanelFuc(res.workflows[i]);
        }
        if (this.showPanel && this.showPanel.path === path) {
          flag = false;
        }
      }
      if (flag) {
        this.hidePanel();
      }
      this.workflows = res.workflows;
      this.searchInResult();
      if (request.workflowIds.length > 0) {
        this.getOrders(request);
      }
      if (this.isSearchHit && this.showSearchPanel) {
        this.traverseTreeForSearchData();
      }
      this.updatePanelHeight();
    }, () => {
      this.loading = false;
    });
  }

  private updateWorkflow(workflows): void {
    const request = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: workflows
    };
    this.getOrders(request);
  }

  private getOrders(obj): void {
    if (!obj.workflowIds || obj.workflowIds.length === 0 || (this.permission && !this.permission.currentController.orders.view)){
      return;
    }
    if (this.workflowFilters.filter.date !== 'ALL') {
      obj.dateTo = this.workflowFilters.filter.date;
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('orders', obj).subscribe((res: any) => {
      if (res.orders) {
        for (let i in this.workflows) {
          if (obj.workflowIds && obj.workflowIds.length > 0 && !isEmpty(this.workflows[i].ordersSummary)) {
            for (let j = 0; j < obj.workflowIds.length; j++) {
              if (this.workflows[i].path === obj.workflowIds[j].path && this.workflows[i].versionId === obj.workflowIds[j].versionId) {
                this.workflows[i].numOfOrders = 0;
                this.workflows[i].orders = [];
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
                if (/^(try+)/.test(res.orders[j].position[o])) {
                  res.orders[j].position[o] = 'try+0';
                }
              }
              this.workflows[i].orders.push(res.orders[j]);
              const state = res.orders[j].state._text.toLowerCase();
              if (this.workflows[i].ordersSummary[state]) {
                this.workflows[i].ordersSummary[state] = this.workflows[i].ordersSummary[state] + 1;
              } else {
                this.workflows[i].ordersSummary[state] = 1;
              }
            }
          }
          if (this.sideBar.isVisible && this.workflows[i].path === this.sideBar.workflow &&
            this.sideBar.isVisible && this.workflows[i].versionId === this.sideBar.versionId) {
            this.sideBar.orders = this.workflows[i].orders;
          }
        }
      }
    });
  }

  private getMatchPath(path): boolean {
    let flag = false;

    function traverseTree1(data) {
      if (!flag) {
        for (let i in data.children) {
          if (data.children[i].path === path) {
            flag = true;
            break;
          }
          if (data.children[i].children && data.children[i].children.length > 0) {
            traverseTree1(data.children[i]);
          }
        }
      }
    }

    for (let i in this.tree) {
      traverseTree1(this.tree[i]);
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
    let filterObj: any = {};
    this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      if (isCopy) {
        filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);
      } else {
        filterObj.id = filter.id;
      }
      this.modal.create({
        nzTitle: undefined,
        nzContent: FilterModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          permission: this.permission,
          allFilter: this.filterList,
          filter: filterObj,
          edit: !isCopy
        },
        nzFooter: null,
        nzClosable: false
      });
    });
  }

  private _updatePanelHeight(): void {
    setTimeout(() => {
      let ht = (parseInt($('#workflowTableId table').height(), 10) + 90);
      if (ht > 140 && ht < 150) {
        ht += 40;
      }
      let el = document.getElementById('workflowTableId');
      if (el && el.scrollWidth > el.clientWidth) {
        ht = ht + 11;
      }
      if (ht > 450) {
        ht = 450;
      }
      if (ht < 140) {
        ht = 142;
      }
      this.resizerHeight = ht + 'px';
      $('#workflowTableId').css('height', this.resizerHeight);
    }, 5);
  }

  private saveProfileSettings(preferences): void {
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'PROFILE',
      id: parseInt(sessionStorage.preferenceId, 10),
      configurationItem: JSON.stringify(preferences)
    };
    sessionStorage.preferences = JSON.stringify(preferences);
    this.coreService.post('configuration/save', configObj).subscribe((res) => {

    });
  }
}
