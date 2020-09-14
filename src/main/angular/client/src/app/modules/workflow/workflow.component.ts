import {Component, OnInit, ViewChild, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {AuthService} from '../../components/guard';
import {SaveService} from '../../services/save.service';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {WorkflowService} from '../../services/workflow.service';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './filter-dialog.html',
})

export class FilterModalComponent implements OnInit {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};

  @Input() allFilter;
  @Input() new;
  @Input() edit;
  @Input() filter;

  name: string;

  constructor(private authService: AuthService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.new) {
      this.filter = {
        radio: 'planned',
        paths: [],
        state: [],
        planned: 'today',
        shared: false
      };
    } else {
      this.filter.radio = 'planned';
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

  constructor(public coreService: CoreService) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
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
      jobschedulerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'AUDITLOG',
      name: result.name,
      shared: result.shared,
      id: 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.jobChain = result.jobChain;
    obj.orderId = result.orderId;
    obj.job = result.job;
    obj.state = result.state;
    obj.name = result.name;
    if (result.radio != 'current') {
      if (result.from1) {
        fromDate = this.coreService.parseProcessExecuted(result.from1);
      }
      if (result.to1) {
        toDate = this.coreService.parseProcessExecuted(result.to1);
      }
    }

    if (fromDate) {
      obj.from1 = fromDate;
    } else {
      obj.from1 = '0d';
    }
    if (toDate) {
      obj.to1 = toDate;
    } else {
      obj.to1 = '0d';
    }
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
  selector: 'app-order',
  templateUrl: './workflow.component.html'
})
export class WorkflowComponent implements OnInit, OnDestroy {
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  resizerHeight: any = 200;
  pageView: any;
  workflows: any = [];
  selectedPath: string;
  worflowFilters: any = {};
  showPanel: any;
  auditLogs: any = [];
  showSearchPanel = false;
  searchFilter: any = {};
  temp_filter: any = {};
  searchKey: string;
  sideView: any = {};
  selectedFiltered: any = {};
  savedFilter: any = {};
  filterList: any = [];
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService, private router: Router,
              private dataService: DataService, private modalService: NgbModal, private workflowService: WorkflowService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.worflowFilters = this.coreService.getWorkflowTab();
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    if (this.child) {
      this.worflowFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.worflowFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'WORKFLOWChanged') {
              this.load(null);
              break;
            }
          }
        }
        break;
      }
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
    this.initTree();
  }

  private initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
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
        jobschedulerId: this.schedulerIds.selected,
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
      jobschedulerId: this.schedulerIds.selected,
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
              jobschedulerId: value.jobschedulerId,
              id: value.id
            }).subscribe((conf: any) => {
              this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
              this.selectedFiltered.account = value.account;
              this.load(null);
            });
          }
        });
        if (flag) {
          this.savedFilter.selected = undefined;
          this.load(null);
        }
      }
    }, (err) => {
      this.savedFilter.selected = undefined;
    });
  }

  private getWorkflowList(obj) {
    this.coreService.post('workflows', obj).subscribe((res: any) => {
      this.loading = false;
      for (let i = 0; i < res.workflows.length; i++) {
        const path = res.workflows[i].path;
        res.workflows[i].name = path.substring(path.lastIndexOf('/') + 1);
        res.workflows[i].path1 = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1);
        if (!res.workflows[i].ordersSummary) {
          res.workflows[i].ordersSummary = {};
        }
      }
      this.workflows = res.workflows;
      this.updatePanelHeight();
    }, () => {
      this.loading = false;
    });
  }

  loadWorkflow() {
    let obj = {
      folders: [],
      jobschedulerId: this.schedulerIds.selected
    };
    this.workflows = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.worflowFilters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getWorkflowList(obj);
  }

  getWorkflows(data, recursive) {
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: recursive}],
      jobschedulerId: this.schedulerIds.selected
    };
    this.getWorkflowList(obj);
  }

  receiveAction($event) {
    this.getWorkflows($event, $event.action !== 'NODE');
  }

  private addPathToExpand(path) {
    const arr = path.split('/');
    let _path = '';
    this.child.defaultExpandedKeys = [];
    arr.forEach((value) => {
      if (_path !== '/') {
        _path = _path + '/' + value;
      } else {
        _path = _path + value;
      }
      this.child.defaultExpandedKeys.push(_path);
    });
  }

  load(data) {

  }

  changeStatus() {

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
    this.searchFilter = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
    };
  }

  search() {

  }

  /* ---- Customization ------ */
  createCustomization() {
    const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.allFilter = this.filterList;
    modalRef.componentInstance.new = true;
    modalRef.result.then((configObj) => {
      if (this.filterList.length == 1) {
        this.savedFilter.selected = configObj.id;
        this.worflowFilters.selectedView = true;
        this.selectedFiltered = configObj;
        this.load(null);
        this.saveService.setAuditLog(this.savedFilter);
        this.saveService.save();
      }
    }, (reason) => {
      console.log('close...', reason);
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
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  private editFilter(filter) {
    this.opneFilterModal(filter, false);
  }

  private copyFilter(filter) {
    this.opneFilterModal(filter, true);
  }

  private opneFilterModal(filter, isCopy) {
    let filterObj: any = {};
    this.coreService.post('configuration', {jobschedulerId: filter.jobschedulerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      if (isCopy) {
        filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);
      }
      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.allFilter = this.filterList;
      modalRef.componentInstance.filter = filterObj;
      modalRef.componentInstance.edit = !isCopy;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

  action(type, obj, self) {
    if (type === 'DELETE') {
      if (self.savedFilter.selected == obj.id) {
        self.savedFilter.selected = undefined;
        self.worflowFilters.selectedView = false;
        self.selectedFiltered = undefined;
        self.setDateRange(null);
        self.load();
      } else {
        if (self.filterList.length == 0) {
          self.savedFilter.selected = undefined;
          self.worflowFilters.selectedView = false;
          self.selectedFiltered = undefined;
        }
      }
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
    } else if (type === 'MAKEFAV') {
      self.savedFilter.favorite = obj.id;
      self.worflowFilters.selectedView = true;
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
      self.load();
    } else if (type === 'REMOVEFAV') {
      self.savedFilter.favorite = '';
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
    }
  }

  changeFilter(filter) {
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.worflowFilters.selectedView = true;
      this.coreService.post('configuration', {
        jobschedulerId: filter.jobschedulerId,
        id: filter.id
      }).subscribe((conf: any) => {
        this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
        this.selectedFiltered.account = filter.account;
        this.load(null);
      });
    } else {
      this.savedFilter.selected = filter;
      this.worflowFilters.selectedView = false;
      this.selectedFiltered = {};
      this.load(null);
    }

    this.saveService.setAuditLog(this.savedFilter);
    this.saveService.save();
  }


  /** ---------------------------- Action ----------------------------------*/
  sortBy(propertyName) {
    this.worflowFilters.reverse = !this.worflowFilters.reverse;
    this.worflowFilters.filter.sortBy = propertyName.key;
  }

  loadAuditLogs(value) {
    this.showPanel = value;
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      workflows: [{workflow: value.path}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }

  hideAuditPanel() {
    this.showPanel = '';
  }

  exportToExcel() {
    $('#workflowTableId table').table2excel({
      exclude: '.tableexport-ignore',
      filename: 'JS7-workflow',
      fileext: '.xls',
      exclude_img: false,
      exclude_links: false,
      exclude_inputs: false
    });
  }

  navToDetailView(workflow) {
    this.router.navigate(['/workflow_detail', workflow.path, workflow.versionId]);
  }


  expandDetails() {
    this.workflows.forEach((workflow) => {
      workflow.show = true;
      workflow.configuration = this.coreService.clone(workflow);
      this.workflowService.convertTryToRetry(workflow.configuration, null);
    });
    this.updatePanelHeight();
  }

  collapseDetails() {
    this.workflows.forEach((workflow) => {
      workflow.show = false;
      delete workflow['configuration'];
    });
    this.updatePanelHeight();
  }

  resetPanel() {
    const rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.workflow && typeof rsHt.workflow === 'object') {
      if (rsHt.workflow[this.worflowFilters.selectedkeys[0]]) {
        delete rsHt.workflow[this.worflowFilters.selectedkeys[0]];
        this.saveService.setResizerHeight(rsHt);
        this.saveService.save();
        this._updatePanelHeight();
      }
    }
  }

  private updatePanelHeight() {
    let rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.workflow && !_.isEmpty(rsHt.workflow)) {
      if (rsHt.workflow[this.worflowFilters.selectedkeys[0]]) {
        this.resizerHeight = rsHt.workflow[this.worflowFilters.selectedkeys[0]];
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
      let ht = (parseInt($('#workflowTableId table').height(), 10) + 80);
      let el = document.getElementById('workflowTableId');
      if (el && el.scrollWidth > el.clientWidth) {
        ht = ht + 11;
      }
      if (ht > 450) {
        ht = 450;
      }

      this.resizerHeight = ht + 'px';
      $('#workflowTableId').css('height', this.resizerHeight);
    }, 5);
  }

  addOrder(workflow) {
  }

  viewOrders(workflow, state) {
  }

  showDailyPlan(workflow) {
  }

  toggleCompactView() {
    this.worflowFilters.isCompact = !this.worflowFilters.isCompact;
    if (!this.worflowFilters.isCompact) {
      this.changeStatus();
    }
    this.preferences.isWorkflowCompact = this.worflowFilters.isCompact;
    this.saveProfileSettings(this.preferences);
  }

  private saveProfileSettings(preferences) {
    let configObj = {
      jobschedulerId: this.schedulerIds.selected,
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
  }
}
