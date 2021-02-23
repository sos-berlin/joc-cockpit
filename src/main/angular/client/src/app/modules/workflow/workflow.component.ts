import {Component, OnInit, ViewChild, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import * as _ from 'underscore';
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

declare const $;

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

  constructor(private authService: AuthService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.new) {
      this.filter = {
        shared: false,
        path: []
      };
    } else {
      this.name = _.clone(this.filter.name);
    }
  }

  cancel(obj) {
    if (obj) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.dismiss('');
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

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  getFolderTree() {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'WORKFLOW';
    modalRef.componentInstance.showCheckBox = true;
    modalRef.result.then((result) => {
      if (_.isArray(result)) {
        this.filter.paths = result;
      }
    }, () => {

    });
  }

  remove(path) {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
  }

  checkFilterName() {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.permission.user === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    let configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'WORKFLOW',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.name = result.name;
    configObj.configurationItem = JSON.stringify(obj);
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
      configObj.id = res.id;
      this.allFilter.push(configObj);
      if (this.isSearch) {
        this.filter.name = '';
      } else {
        this.onCancel.emit(configObj);
      }
      this.submitted = false;
    }, err => {
      this.submitted = false;
    });
  }

  search() {
    this.onSearch.emit();
  }

  cancel() {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-single-workflow',
  templateUrl: './single-workflow.component.html'
})
export class SingleWorkflowComponent implements OnInit, OnDestroy {
  loading = true;
  schedulerId: any = {};
  preferences: any = {};
  permission: any = {};
  resizerHeight: any = 150;
  workflows: any = [];
  path: any;
  showPanel: any;
  sideBar: any = {};
  date = '0d';
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
              private route: ActivatedRoute, private workflowService: WorkflowService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit() {
    this.path = this.route.snapshot.queryParamMap.get('path');
    this.schedulerId = this.route.snapshot.queryParamMap.get('scheduler_id');
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getWorkflowList({
      controllerId: this.schedulerId,
      workflowId: {path: this.path}
    });
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }

  private refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow && this.path === args.eventSnapshots[j].workflow.path) {
          this.getOrders({
            compact: true,
            controllerId: this.schedulerId,
            workflowIds: args.eventSnapshots[j].workflow
          });
        }
      }
    }
  }

  private getWorkflowList(obj) {
    this.coreService.post('workflow', obj).subscribe((res: any) => {
      this.loading = false;
      const request = {
        compact: true,
        controllerId: this.schedulerId,
        workflowIds: []
      };
      const path = res.workflow.path;
      res.workflow.name = path.substring(path.lastIndexOf('/') + 1);
      if (!res.workflow.ordersSummary) {
        res.workflow.ordersSummary = {};
      }
      request.workflowIds.push({path: path, versionId: res.workflow.versionId});
      this.workflows = [res.workflow];
      if (request.workflowIds.length > 0) {
        this.getOrders(request);
      }
      this.showPanel = this.workflows[0];
    }, () => {
      this.loading = false;
    });
  }

  private getOrders(obj) {
    if (this.date !== 'ALL') {
      obj.dateTo = this.date;
    }
    obj.timeZone = this.preferences.zone;
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.workflows[0].ordersSummary = {};
      this.workflows[0].numOfOrders = res.orders.length;
      if (res.orders && res.orders.length > 0) {
        for (let j = 0; j < res.orders.length; j++) {
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

  loadOrders(date) {
    this.date = date;
    const request = {
      compact: true,
      controllerId: this.schedulerId,
      workflowIds: []
    };
    const path = this.workflows[0].path;
    request.workflowIds.push({path: path, versionId: this.workflows[0].versionId});
    if (request.workflowIds.length > 0) {
      this.getOrders(request);
    }
  }

  showPanelFuc(workflow) {
    workflow.show = true;
    workflow.configuration = this.coreService.clone(workflow);
    this.workflowService.convertTryToRetry(workflow.configuration, null);
  }

  hidePanelFuc(workflow) {
    workflow.show = false;
    delete workflow['configuration'];
  }

  viewOrders(workflow) {
    this.sideBar = {isVisible: true, orders: workflow.orders, workflow: workflow.path, orderRequirements: workflow.orderRequirements};
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
              private dataService: DataService, private modalService: NgbModal, private workflowService: WorkflowService,
              private translate: TranslateService, private searchPipe: SearchPipe, private excelService: ExcelService,
              private toasterService: ToasterService, private router: Router) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.workflowFilters = this.coreService.getWorkflowTab();
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.workflowFilters.expandedObjects = [];
    for (let i = 0; i < this.currentData.length; i++) {
      if (this.currentData[i].show) {
        this.workflowFilters.expandedObjects.push(this.currentData[i].path);
      }
    }
    if (this.child) {
      this.workflowFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.workflowFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
  }

  private refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      const workflows = [];
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow) {
          for (let i = 0; i < this.workflows.length; i++) {
            if (this.workflows[i].path === args.eventSnapshots[j].workflow.path && this.workflows[i].versionId === args.eventSnapshots[j].workflow.versionId) {
              workflows.push(args.eventSnapshots[j].workflow);
              break;
            }
          }
        }
        if (args.eventSnapshots[j].objectType === 'WORKFLOW' && (args.eventSnapshots[j].eventType.match(/Item/))) {
          this.initTree();
        }
      }
      this.updateWorkflow(workflows);
    }
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  private init() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).workflow;
    }
    if (!this.savedFilter.selected) {
      this.initTree();
    }
    //this.checkSharedFilters();
  }

  private initTree() {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      folders: [{
        folder: '/',
        recursive: true
      }],
      types: ['WORKFLOW']
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res, true));
      this.loadWorkflow();
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private filteredTreeData(output) {
    this.tree = output;
  }

  checkSharedFilters() {
    if (this.permission.JOCConfigurations.share.view) {
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

  getCustomizations() {
    let obj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'WORKFLOW'
    };
    this.coreService.post('configurations', obj).subscribe((res: any) => {
      if (this.filterList && this.filterList.length > 0) {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = this.filterList.concat(res.configurations);
        }
        let data = [];
        for (let i = 0; i < this.filterList.length; i++) {
          let flag = true;
          for (let j = 0; j < data.length; j++) {
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

  private getWorkflowList(obj) {
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
      for (let i = 0; i < res.workflows.length; i++) {
        const path = res.workflows[i].path;
        res.workflows[i].name = path.substring(path.lastIndexOf('/') + 1);
        res.workflows[i].path1 = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1);
        if (!res.workflows[i].ordersSummary) {
          res.workflows[i].ordersSummary = {};
        }
        request.workflowIds.push({path: path, versionId: res.workflows[i].versionId});
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

  private updateWorkflow(workflows) {
    const request = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: workflows
    };
    this.getOrders(request);
  }

  private getOrders(obj) {
    if (!obj.workflowIds || obj.workflowIds.length === 0) {
      return;
    }
    if (this.workflowFilters.filter.date !== 'ALL') {
      obj.dateTo = this.workflowFilters.filter.date;
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('orders', obj).subscribe((res: any) => {
      if (res.orders) {
        for (let i = 0; i < this.workflows.length; i++) {
          if (obj.workflowIds && obj.workflowIds.length > 0 && !_.isEmpty(this.workflows[i].ordersSummary)) {
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
          for (let j = 0; j < res.orders.length; j++) {
            if (this.workflows[i].path === res.orders[j].workflowId.path && this.workflows[i].versionId === res.orders[j].workflowId.versionId) {
              this.workflows[i].numOfOrders = (this.workflows[i].numOfOrders || 0) + 1;
              if (!this.workflows[i].orders) {
                this.workflows[i].orders = [];
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

  loadOrders(date) {
    this.workflowFilters.filter.date = date;
    const request = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: []
    };
    for (let i = 0; i < this.workflows.length; i++) {
      const path = this.workflows[i].path;
      request.workflowIds.push({path: path, versionId: this.workflows[i].versionId});
    }
    if (request.workflowIds.length > 0) {
      this.getOrders(request);
    }
  }

  loadWorkflow() {
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
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getWorkflowList(obj);
  }

  private getMatchPath(path): boolean {
    let flag = false;

    function traverseTree1(data) {
      if (!flag) {
        for (let i = 0; i < data.children.length; i++) {
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

    for (let i = 0; i < this.tree.length; i++) {
      traverseTree1(this.tree[i]);
    }
    return flag;
  }

  getWorkflows(data, recursive) {
    this.loading = true;
    const obj = {
      folders: [{folder: data.path, recursive: recursive}],
      controllerId: this.schedulerIds.selected
    };
    this.getWorkflowList(obj);
  }

  receiveAction($event) {
    this.getWorkflows($event, $event.action !== 'NODE');
  }

  private traverseTreeForSearchData() {
    const self = this;
    this.workflowFilters.expandedKeys = [];
    this.workflowFilters.selectedkeys = [];

    function traverseTree1(data) {
      for (let i = 0; i < data.children.length; i++) {
        if (!data.children[i].isLeaf) {
          self.workflowFilters.expandedKeys.push(data.children[i].path);
        }
        pushJob(data.children[i]);
        traverseTree1(data.children[i]);
      }
    }

    function navFullTree() {
      for (let i = 0; i < self.tree.length; i++) {
        if (!self.tree[i].isLeaf) {
          self.workflowFilters.expandedKeys.push(self.tree[i].path);
        }
        pushJob(self.tree[i]);
        traverseTree1(self.tree[i]);
      }
    }

    function pushJob(data) {
      for (let i = 0; i < self.workflows.length; i++) {
        if (data.path === self.workflows[i].path1) {
          self.workflowFilters.selectedkeys.push(self.workflows[i].path1);
        }
      }
    }

    navFullTree();
  }

  changeStatus() {
    this.loadWorkflow();
  }

  showPanelFuc(workflow) {
    workflow.show = true;
    workflow.configuration = this.coreService.clone(workflow);
    this.workflowService.convertTryToRetry(workflow.configuration, null);
    this.updatePanelHeight();
  }

  hidePanelFuc(workflow) {
    workflow.show = false;
    delete workflow['configuration'];
    this.updatePanelHeight();
  }

  /* ----------------------Advance Search --------------------- */
  advancedSearch() {
    this.showSearchPanel = true;
    this.isUnique = true;
    this.isSearchHit = false;
    this.searchFilter = {};
  }

  search() {
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
      for (let i = 0; i < this.searchFilter.paths.length; i++) {
        obj.folders.push({folder: this.searchFilter.paths[i], recursive: true});
      }
    }
    this.getWorkflowList(obj);
  }

  /* ---- Customization ------ */
  createCustomization() {
    const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.allFilter = this.filterList;
    modalRef.componentInstance.new = true;
    modalRef.result.then((configObj) => {
      if (this.filterList.length === 1) {
        this.savedFilter.selected = configObj.id;
        this.workflowFilters.selectedView = true;
        this.selectedFiltered = configObj;
        this.initTree();
        this.saveService.setWorkflow(this.savedFilter);
        this.saveService.save();
      }
    }, () => {

    });
  }

  editFilters() {
    const modalRef = this.modalService.open(EditFilterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.filterList = this.filterList;
    modalRef.componentInstance.favorite = this.savedFilter.favorite;
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.username = this.permission.user;
    modalRef.componentInstance.action = this.action;
    modalRef.componentInstance.self = this;

    modalRef.result.then((obj) => {
      if (obj.type === 'EDIT') {
        this.editFilter(obj);
      } else if (obj.type === 'COPY') {
        this.copyFilter(obj);
      }
    }, () => {

    });
  }

  private editFilter(filter) {
    this.openFilterModal(filter, false);
  }

  private copyFilter(filter) {
    this.openFilterModal(filter, true);
  }

  private openFilterModal(filter, isCopy) {
    let filterObj: any = {};
    this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      if (isCopy) {
        filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);
      } else {
        filterObj.id = filter.id;
      }
      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.allFilter = this.filterList;
      modalRef.componentInstance.filter = filterObj;
      modalRef.componentInstance.edit = !isCopy;
      modalRef.result.then((configObj) => {

      }, () => {

      });
    });
  }

  action(type, obj, self) {
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

  changeFilter(filter) {
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


  /** ---------------------------- Action ----------------------------------*/
  sort(key): void {
    this.workflowFilters.reverse = !this.workflowFilters.reverse;
    this.workflowFilters.filter.sortBy = key;
  }

  pageIndexChange($event) {
    this.workflowFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.workflowFilters.entryPerPage = $event;
  }

  currentPageDataChange($event) {
    this.currentData = $event;
  }

  searchInResult() {
    this.data = this.workflowFilters.searchText ? this.searchPipe.transform(this.workflows, this.workflowFilters.searchText) : this.workflows;
    this.data = [...this.data];
  }

  showPanelFunc(value) {
    this.showPanel = value;
  }

  exportToExcel() {
    let name = '', path = '', numOfOrders = '', pending = '', running = '',
      suspended = '', failed = '', waiting = '', blocked = '';
    this.translate.get('label.name').subscribe(translatedValue => {
      name = translatedValue;
    });
    this.translate.get('label.path').subscribe(translatedValue => {
      path = translatedValue;
    });
    this.translate.get('label.noOfOrders').subscribe(translatedValue => {
      numOfOrders = translatedValue;
    });
    if (!this.workflowFilters.isCompact) {
      this.translate.get('label.pending').subscribe(translatedValue => {
        pending = translatedValue;
      });
      this.translate.get('label.running').subscribe(translatedValue => {
        running = translatedValue;
      });
      this.translate.get('label.suspended').subscribe(translatedValue => {
        suspended = translatedValue;
      });
      this.translate.get('label.failed').subscribe(translatedValue => {
        failed = translatedValue;
      });
      this.translate.get('label.waiting').subscribe(translatedValue => {
        waiting = translatedValue;
      });
      this.translate.get('label.blocked').subscribe(translatedValue => {
        blocked = translatedValue;
      });
    }

    let data = [];
    for (let i = 0; i < this.currentData.length; i++) {
      let obj: any = {};
      obj[name] = this.currentData[i].name;
      obj[path] = this.currentData[i].path;
      obj[numOfOrders] = this.currentData[i].numOfOrders;
      if (!this.workflowFilters.isCompact) {
        obj[pending] = this.currentData[i].ordersSummary.pending || 0;
        obj[running] = this.currentData[i].ordersSummary.running || 0;
        obj[suspended] = this.currentData[i].ordersSummary.suspended || 0;
        obj[failed] = this.currentData[i].ordersSummary.failed || 0;
        obj[waiting] = this.currentData[i].ordersSummary.waiting || 0;
        obj[blocked] = this.currentData[i].ordersSummary.blocked || 0;
      }
      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-workflows');
  }

  hidePanel() {
    this.showPanel = '';
  }

  navToDetailView(workflow) {
    this.router.navigate(['/workflows/workflow_detail', workflow.path, workflow.versionId]);
  }

  expandDetails() {
    this.currentData.forEach((workflow) => {
      workflow.show = true;
      workflow.configuration = this.coreService.clone(workflow);
      this.workflowService.convertTryToRetry(workflow.configuration, null);
    });
    this.updatePanelHeight();
  }

  collapseDetails() {
    this.currentData.forEach((workflow) => {
      workflow.show = false;
      delete workflow['configuration'];
    });
    this.updatePanelHeight();
  }

  resetPanel() {
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

  updatePanelHeight() {
    let rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.workflow && !_.isEmpty(rsHt.workflow)) {
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

  private _updatePanelHeight() {
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

  viewOrders(workflow) {
    this.sideBar = {isVisible: true, orders: workflow.orders, workflow: workflow.path, versionId : workflow.versionId, orderRequirements: workflow.orderRequirements};
  }

  toggleCompactView() {
    this.workflowFilters.isCompact = !this.workflowFilters.isCompact;
    if (!this.workflowFilters.isCompact) {
      this.changeStatus();
    }
    this.preferences.isWorkflowCompact = this.workflowFilters.isCompact;
    this.saveProfileSettings(this.preferences);
  }

  private saveProfileSettings(preferences) {
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'PROFILE',
      id: parseInt(sessionStorage.preferenceId, 10),
      configurationItem: JSON.stringify(preferences)
    };
    sessionStorage.preferences = JSON.stringify(preferences);
    this.coreService.post('configuration/save', configObj).subscribe((res) => {

    });
  }

  cancel() {
    this.showSearchPanel = false;
    this.searchFilter = {};
    if (this.isSearchHit) {
      this.isSearchHit = false;
      this.changeStatus();
    }
  }
}
