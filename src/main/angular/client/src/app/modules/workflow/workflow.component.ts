import {Component, OnInit, ViewChild, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {saveAs} from 'file-saver';

declare const $;

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html'
})
export class TypeComponent implements OnInit {
  @Input() workflowJson;

  constructor() {
  }

  ngOnInit() {
  }

  collapse(typeId, node) {
    if (node == 'undefined') {
      $('#' + typeId).toggle();
    } else {
      $('#' + node + '-' + typeId).toggle();
    }
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
  pageView: any;
  workflows: any;
  selectedPath: string;
  worflowFilters: any = {};
  showPanel: any;
  auditLogs: any = [];

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService) {
  }

  ngOnInit() {
    this.worflowFilters = this.coreService.getWorkflowTab();
    this.init();
  }

  ngOnDestroy() {
    if (this.child) {
      this.worflowFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.worflowFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  expandAll() {

  }

  collapseAll() {

  }

  private init() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.initTree();
  }

  private initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
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

  private getWorkflowList(obj) {
    this.coreService.post('workflows', obj).subscribe((res: any) => {
      this.loading = false;
      for (let i = 0; i < res.workflows.length; i++) {
        res.workflows[i].path1 = res.workflows[i].path.substring(0, res.workflows[i].path.lastIndexOf('/')) || res.workflows[i].path.substring(0, res.workflows[i].path.lastIndexOf('/') + 1);
      }
      this.workflows = res.workflows;
    }, () => {
      this.loading = false;
    });
  }

  loadWorkflow() {
    let obj = {
      folders: [],
      jobschedulerId: this.schedulerIds.selected,
      compact: true
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
      jobschedulerId: this.schedulerIds.selected,
      compact: true
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

  /** ---------------------------- Action ----------------------------------*/
  sortBy(propertyName) {
    this.worflowFilters.reverse = !this.worflowFilters.reverse;
    this.worflowFilters.filter.sortBy = propertyName.key;
  }

  loadAuditLogs(value) {
    this.showPanel = value;
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      workflows: [value.path],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }

  hideAuditPanel() {
    this.showPanel = '';
  }

  private exportFile(res) {
    let name = 'calendars' + '.json';
    let fileType = 'application/octet-stream';

    if (res.headers && res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
      name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
    }

    let data = res;
    if (typeof data === 'object') {
      data = JSON.stringify(data, undefined, 2);
    }
    let blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
  }
}
