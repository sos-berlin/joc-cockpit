import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {isEmpty, clone} from 'underscore';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {SaveService} from '../../services/save.service';
import {ExcelService} from '../../services/excel.service';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {EditIgnoreListComponent} from './ignore-list-modal/ignore-list.component';
import {SearchPipe} from '../../pipes/core.pipe';

declare const $;

@Component({
  selector: 'app-order-history-template',
  templateUrl: './order-history-template.html'
})
export class OrderTemplateComponent {
  @Input() history: any;
  @Input() historyView: any;
  @Input() schedulerId: any;
  @Input() orderSearch: any;

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router) {
  }

  downloadLog(obj, schedulerId): void {
    if (!schedulerId) {
      schedulerId = this.schedulerId;
    }
    this.coreService.downloadLog(obj, schedulerId);
  }

  showPanelFuc(data, count): void {
    data.loading = true;
    data.show = true;
    data.steps = [];
    const obj = {
      controllerId: data.controllerId || this.schedulerId,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      data.children = res.children;
      data.level = count + 1;
      data.states = res.states;
      data.loading = false;
      this.coreService.calRowWidth(this.historyView.current);
    }, () => {
      data.loading = false;
    });
  }

  navToWorkflowTab(workflow) {
    this.coreService.getConfigurationTab().inventory.expand_to = [];
    this.coreService.getConfigurationTab().inventory.selectedObj = {
      name: workflow.substring(workflow.lastIndexOf('/') + 1),
      path: workflow.substring(0, workflow.lastIndexOf('/')) || '/',
      type: 'WORKFLOW'
    };
    this.router.navigate(['/configuration/inventory']);
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './filter-dialog.html'
})
export class FilterModalComponent implements OnInit {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};

  @Input() allFilter;
  @Input() new;
  @Input() edit;
  @Input() filter;
  @Input() type;

  name: string;

  constructor(private authService: AuthService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.new) {
      this.filter = {
        radio: 'planned',
        planned: 'today',
        shared: false
      };
    } else {
      this.filter.radio = 'planned';
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
  selector: 'app-order-form-template',
  templateUrl: './order-form-template.html',
})
export class OrderSearchComponent implements OnInit {

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
  workflowTree = [];
  checkOptions = [
    {label: 'successful', value: 'SUCCESSFUL', checked: false},
    {label: 'failed', value: 'FAILED', checked: false},
    {label: 'incomplete', value: 'INCOMPLETE', checked: false}
  ];

  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getWorkflowTree();
    if (this.filter.states && this.filter.states.length > 0) {
      this.checkOptions = this.checkOptions.map(item => {
        return {
          ...item,
          checked: this.filter.states.indexOf(item.value) > -1
        };
      });
    }
  }

  stateChange(value: string[]): void {
    this.filter.states = value;
  }

  getFolderTree(flag: boolean): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: TreeModalComponent,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        paths: this.filter.paths || [],
        type: 'FOLDER',
        showCheckBox: !flag
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.filter.paths = result;
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

  loadData(node, $event): void {
    if (!node.origin.type) {
      if ($event) {
        $event.stopPropagation();
      }
    }
  }

  loadWorkflow(node, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        const obj: any = {
          path: node.key,
          objectTypes: ['WORKFLOW']
        };
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
          let data = res.workflows;
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = _path;
            data[i].path = _path;
            data[i].type = 'WORKFLOW';
            data[i].key = _path;
            data[i].isLeaf = true;
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;
          node.origin.children = data;
          this.workflowTree = [...this.workflowTree];
        });
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'ORDER_HISTORY',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    const obj: any = {};
    obj.orderId = result.orderId;
    obj.paths = result.paths;
    obj.workflowPaths = result.workflowPaths;
    obj.states = result.states;
    obj.name = result.name;
    if (result.radio != 'current') {
      if (result.from1) {
        fromDate = this.coreService.parseProcessExecuted(result.from1);
      }
      if (result.to1) {
        toDate = this.coreService.parseProcessExecuted(result.to1);
      }
    }

    if (result.radio) {
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
    } else {
      obj.planned = result.planned;
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
    }, () => {
      this.submitted = false;
    });
  }

  search(): void {
    this.onSearch.emit(this.filter);
  }

  cancel(): void {
    this.onCancel.emit();
  }

  private getWorkflowTree(): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        forInventory: true,
        types: ['WORKFLOW']
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, true);
      });
    }
  }
}

@Component({
  selector: 'app-task-form-template',
  templateUrl: './task-form-template.html',
})
export class TaskSearchComponent implements OnInit {
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
  workflowTree = [];
  checkOptions = [
    {label: 'successful', value: 'SUCCESSFUL', checked: false},
    {label: 'failed', value: 'FAILED', checked: false},
    {label: 'incomplete', value: 'INCOMPLETE', checked: false}
  ];
  criticalities = [
    {label: 'normal', value: 'NORMAL', checked: false},
    {label: 'minor', value: 'MINOR', checked: false},
    {label: 'major', value: 'MAJOR', checked: false}
  ];

  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getWorkflowTree();
    if (this.filter.historyStates && this.filter.historyStates.length > 0) {
      this.checkOptions = this.checkOptions.map(item => {
        return {
          ...item,
          checked: this.filter.historyStates.indexOf(item.value) > -1
        };
      });
    }
    if (this.filter.criticality && this.filter.criticality.length > 0) {
      this.criticalities = this.criticalities.map(item => {
        return {
          ...item,
          checked: this.filter.criticality.indexOf(item.value) > -1
        };
      });
    }

  }

  stateChange(value: string[]): void {
    this.filter.historyStates = value;
  }

  criticalityChange(value: string[]): void {
    this.filter.criticality = value;
  }

  getFolderTree(flag: boolean): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: TreeModalComponent,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        paths: this.filter.paths || [],
        type: 'FOLDER',
        showCheckBox: !flag
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.filter.paths = result;
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

  loadData(node, $event): void {
    if (!node.origin.type) {
      if ($event) {
        $event.stopPropagation();
      }
    }
  }

  loadWorkflow(node, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        const obj: any = {
          path: node.key,
          objectTypes: ['WORKFLOW']
        };
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
          let data = res.workflows;
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = _path;
            data[i].path = _path;
            data[i].type = 'WORKFLOW';
            data[i].key = _path;
            data[i].isLeaf = true;
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;
          node.origin.children = data;
          this.workflowTree = [...this.workflowTree];
        });
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'TASK_HISTORY',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    const obj: any = {};
    obj.paths = result.paths;
    obj.workflowPaths = result.workflowPaths;
    obj.jobName = result.jobName;
    obj.state = result.state;
    obj.name = result.name;
    obj.criticality = result.criticality;
    obj.historyStates = result.historyStates;
    if (result.radio != 'current') {
      if (result.from1) {
        fromDate = this.coreService.parseProcessExecuted(result.from1);
      }
      if (result.to1) {
        toDate = this.coreService.parseProcessExecuted(result.to1);
      }
    }

    if (result.radio) {
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
    } else {
      obj.planned = result.planned;
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
    }, () => {
      this.submitted = false;
    });
  }

  search(): void {
    this.onSearch.emit(this.filter);
  }

  cancel(): void {
    this.onCancel.emit();
  }

  private getWorkflowTree(): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        forInventory: true,
        types: ['WORKFLOW']
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, true);
      });
    }
  }
}

@Component({
  selector: 'app-deployment-form-template',
  templateUrl: './deployment-form-template.html',
})
export class DeploymentSearchComponent implements OnInit {
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
  deployTypes = [];

  constructor(private authService: AuthService, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.deployTypes = ['WORKFLOW', 'JOBCLASS', 'LOCK', 'JUNCTION'];
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
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'DEPLOYMENT_HISTORY',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    const obj: any = {};
    obj.deployType = result.deployType;
    obj.operation = result.operation;
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

    if (result.radio) {
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
    } else {
      obj.planned = result.planned;
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
    }, () => {
      this.submitted = false;
    });
  }

  search(): void {
    this.onSearch.emit(this.filter);
  }

  cancel(): void {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-submission-form-template',
  templateUrl: './submission-form-template.html',
})
export class SubmissionSearchComponent implements OnInit {
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
  checkOptions = [
    {label: 'submitted', value: 'SUBMITTED', checked: false},
    {label: 'notSubmitted', value: 'NOT_SUBMITTED', checked: false}
  ];

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    if (this.filter.type && this.filter.type.length > 0) {
      this.checkOptions = this.checkOptions.map(item => {
        return {
          ...item,
          checked: this.filter.type.indexOf(item.value) > -1
        };
      });
    }
  }

  remove(path): void {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
  }

  typeChange(value: string[]): void {
    this.filter.type = value;
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
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'SUBMISSION_HISTORY',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    const obj: any = {};
    obj.name = result.name;
    if (result.radio != 'current') {
      if (result.from1) {
        fromDate = this.coreService.parseProcessExecuted(result.from1);
      }
      if (result.to1) {
        toDate = this.coreService.parseProcessExecuted(result.to1);
      }
    }

    if (result.radio) {
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
    } else {
      obj.planned = result.planned;
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
    }, () => {
      this.submitted = false;
    });
  }

  search(): void {
    this.onSearch.emit(this.filter);
  }

  cancel(): void {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-yade-form-template',
  templateUrl: './yade-form-template.html',
})
export class YadeSearchComponent implements OnInit {

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
  allhosts: any;
  sourceProtocol: any = [];
  targetProtocol: any = [];

  stateOptions = [
    {status: 'SUCCESSFUL', text: 'successful', checked: false},
    {status: 'FAILED', text: 'failed', checked: false},
    {status: 'INCOMPLETE', text: 'incomplete', checked: false}
  ];

  operationOptions = [
    {status: 'COPY', text: 'copy', checked: false},
    {status: 'MOVE', text: 'move'},
    {status: 'GETLIST', text: 'getList', checked: false},
    {status: 'RENAME', text: 'rename', checked: false}
  ];

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.allhosts = this.coreService.getProtocols();
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.authService.currentUserData === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  stateChange(value: string[]): void {
    this.filter.states = value;
  }

  operationChange(value: string[]): void {
    this.filter.operations = value;
  }

  selectedTargetProtocol(value: any): void {
    if (!this.filter.targetProtocol) {
      this.filter.targetProtocol = [];
    }
    this.filter.targetProtocol.push(value.text);
  }

  onSubmit(result): void {
    this.submitted = true;
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE_HISTORY',
      name: result.name,
      shared: result.shared,
      id: 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    const obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.workflow = result.workflow;
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
    }, () => {
      this.submitted = false;
    });
  }

  search(): void {
    this.onSearch.emit(this.filter);
  }

  cancel(): void {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-single-history',
  templateUrl: './single-history.component.html'
})
export class SingleHistoryComponent implements OnInit, OnDestroy {
  loading: boolean;
  controllerId: any = {};
  preferences: any = {};
  permission: any = {};
  history: any = [];
  orderId: string;
  workflowPath: string;
  commitId: string;
  dailyPlanDate: string;
  subscription: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private router: Router,
              private dataService: DataService, private route: ActivatedRoute) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.workflowPath = this.route.snapshot.queryParamMap.get('workflow');
    this.commitId = this.route.snapshot.queryParamMap.get('commitId');
    this.dailyPlanDate = this.route.snapshot.queryParamMap.get('dailyPlanDate');
    this.controllerId = this.route.snapshot.queryParamMap.get('controllerId');
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.workflowPath) {
      this.getOrderHistory();
    } else if (this.commitId) {
      this.getDeploymentHistory();
    } else if (this.dailyPlanDate){
      this.getSubmissionHistory();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getOrderHistory(): void {
    this.coreService.post('orders/history', {
      controllerId: this.controllerId,
      orders: [{workflowPath: this.workflowPath, orderId: this.orderId}]
    }).subscribe((res: any) => {
      this.loading = false;
      this.history = res.history;
    }, () => {
      this.loading = false;
    });
  }

  private getDeploymentHistory(): void {
    const obj = {
      detailFilter: {
        controllerId: this.controllerId,
        commitId: this.commitId
      }
    };
    this.coreService.post('inventory/deployment/history', obj).subscribe((res: any) => {
      const obj = {
        controllerId: '',
        deploymentDate: '',
        state: '',
        account: '',
        children: res.depHistory
      };
      if (res.depHistory.length > 0) {
        obj.deploymentDate = res.depHistory[0].deploymentDate;
        obj.controllerId = res.depHistory[0].controllerId || this.controllerId;
        obj.account = res.depHistory[0].account;
        obj.state = res.depHistory[0].state;
      }
      this.history = [obj];
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private getSubmissionHistory(): void {
    const obj = {
      controllerId: this.controllerId,
      filter: {
        controllerId: this.controllerId,
        dateFrom: this.dailyPlanDate
      }
    };
    this.coreService.post('daily_plan/history', obj).subscribe((res: any) => {
      this.history = res.dailyPlans;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if ((args.eventSnapshots[j].eventType === 'HistoryOrderTerminated' || args.eventSnapshots[j].eventType === 'HistoryOrderStarted') && this.orderId) {
          this.getOrderHistory();
          break;
        } else if (args.eventSnapshots[j].eventType.match(/Deploy/) && this.commitId) {
          this.getDeploymentHistory();
          break;
        }
      }
    }
  }

  /* --------------------------Actions -----------------------*/

  navToWorkflowTab(workflow): void {
    this.coreService.getConfigurationTab().inventory.expand_to = [];
    this.coreService.getConfigurationTab().inventory.selectedObj = {
      name: workflow.substring(workflow.lastIndexOf('/') + 1),
      path: workflow.substring(0, workflow.lastIndexOf('/')) || '/',
      type: 'WORKFLOW'
    };
    this.router.navigate(['/configuration/inventory']);
  }

  navToInventoryTab(data): void {
    if (data.operation === 'UPDATE') {
      this.coreService.getConfigurationTab().inventory.expand_to = [];
      this.coreService.getConfigurationTab().inventory.selectedObj = {
        name: data.path.substring(data.path.lastIndexOf('/') + 1),
        path: data.folder,
        type: data.deployType.toUpperCase()
      };
      this.router.navigate(['/configuration/inventory']);
    }
  }

  showPanelFuc(data: any): void {
    data.loading = true;
    data.show = true;
    data.children = [];
    data.states = [];
    const obj = {
      controllerId: this.controllerId,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      data.level = 1;
      data.children = res.children;
      data.states = res.states;
      data.loading = false;
    }, () => {
      data.loading = false;
    });
  }

  hidePanelFuc(data: any): void {
    data.show = false;
    data.showAll = false;
  }

}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  isLoading = false;
  loadConfig = false;
  loadIgnoreList = false;
  showSearchPanel = false;
  dateFormat: any;
  dateFormatM: any;
  historyFilters: any = {};
  selectedFiltered1: any = {};
  selectedFiltered2: any = {};
  selectedFiltered3: any = {};
  selectedFiltered4: any = {};
  selectedFiltered5: any = {};
  temp_filter1: any = {};
  temp_filter2: any = {};
  temp_filter3: any = {};
  temp_filter4: any = {};
  temp_filter5: any = {};
  historyFilterObj: any = {};
  savedHistoryFilter: any = {};
  savedJobHistoryFilter: any = {};
  savedYadeHistoryFilter: any = {};
  savedDeploymentHistoryFilter: any = {};
  savedSubmissionHistoryFilter: any = {};
  savedIgnoreList: any = {workflows: [], jobs: []};
  orderSearch: any = {};
  jobSearch: any = {};
  yadeSearch: any = {};
  deploymentSearch: any = {};
  submissionSearch: any = {};
  data = [];
  currentData = [];
  order: any = {};
  task: any = {};
  yade: any = {};
  deployment: any = {};
  submission: any = {};
  historys: any = [];
  taskHistorys: any = [];
  yadeHistorys: any = [];
  deploymentHistorys: any = [];
  submissionHistorys: any = [];
  widthArr = [];
  orderHistoryFilterList: any;
  jobHistoryFilterList: any;
  yadeHistoryFilterList: any;
  deploymentHistoryFilterList: any;
  submissionHistoryFilterList: any;

  orderSearchableProperties = ['controllerId', 'orderId', 'workflow', 'state', '_text', 'orderState', 'position'];
  taskSearchableProperties = ['controllerId', 'job', 'criticality', 'request', 'workflow', 'orderId', 'position'];
  deploymentSearchableProperties = ['controllerId', 'deploymentDate', 'account', 'state'];
  yadeSearchableProperties = ['controllerId', 'profile', 'mandator', 'start', 'end', '_operation', 'numOfFiles', 'workflowPath', 'orderId'];

  object: any = {};
  ignoreListConfigId = 0;
  subscription1: Subscription;
  subscription2: Subscription;

  filterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: 'today', text: 'today'},
    {date: '-1h', text: 'last1'},
    {date: '-12h', text: 'last12'},
    {date: '-24h', text: 'last24'},
    {date: '-7d', text: 'lastWeak'}
  ];

  subMissionFilterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '-30d', text: 'last30'},
    {date: '-7d', text: 'lastWeak'},
    {date: '-1d', text: 'yesterday'},
    {date: 'today', text: 'today'},
    {date: '7d', text: 'nextWeak'},
    {date: '30d', text: 'next30'}
  ];

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modal: NzModalService, private searchPipe: SearchPipe,
              private message: NzMessageService, private router: Router, private translate: TranslateService, private excelService: ExcelService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf();
    });
  }

  ngOnInit(): void {
    this.initConf();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  changeController(): void {
    this.init(true);
  }

  orderParseDate(obj): any {
    if (this.selectedFiltered1.orderId) {
      obj.orderId = this.selectedFiltered1.orderId;
    }
    if (this.selectedFiltered1.paths && this.selectedFiltered1.paths.length > 0) {
      obj.folders = [];
      this.selectedFiltered1.paths.forEach((value) => {
        obj.folders.push({folder: value, recursive: true});
      });
    }
    if (this.selectedFiltered1.workflowPaths && this.selectedFiltered1.workflowPaths.length > 0) {
      obj.orders = [];
      this.selectedFiltered1.workflowPaths.workflowPaths((value) => {
        obj.orders.push({workflowPath: value});
      });
    }
    if (this.selectedFiltered1.state && this.selectedFiltered1.state.length > 0) {
      obj.historyStates = this.selectedFiltered1.state;
    }

    obj = this.coreService.parseProcessExecutedRegex(this.selectedFiltered1.planned, obj);
    return obj;
  }

  isCustomizationSelected1(flag): void {
    if (flag) {
      this.temp_filter1.historyStates = clone(this.order.filter.historyStates);
      this.temp_filter1.date = clone(this.order.filter.date);
      this.order.filter.historyStates = '';
      this.order.filter.date = '';
    } else {
      if (this.temp_filter1.historyStates) {
        this.order.filter.historyStates = clone(this.temp_filter1.historyStates);
        this.order.filter.date = clone(this.temp_filter1.date);
      } else {
        this.order.filter.historyStates = 'ALL';
        this.order.filter.date = 'today';
      }
    }
  }

  setOrderDateRange(filter): any {
    if (this.order.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';

    } else if (this.order.filter.date && this.order.filter.date != 'ALL') {
      filter.dateFrom = this.order.filter.date;
    }
    return filter;
  }

  convertRequestBody(obj): void {
    obj.limit = parseInt(this.preferences.maxRecords, 10) || 5000;
    obj.timeZone = this.preferences.zone;
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      delete obj.timeZone;
    }
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, obj.dateFrom);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, obj.dateTo);
    }
  }

  orderHistory(obj, flag): void {
    this.historyFilters.type = 'ORDER';
    if (!obj) {
      if (!this.orderHistoryFilterList && this.schedulerIds.selected) {
        this.data = [];
        this.checkSharedFilters('ORDER');
        return;
      }
      obj = {controllerId: this.historyFilters.current == true ? this.schedulerIds.selected : ''};
      this.isLoading = false;
      this.data = [];
    }

    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true') && ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0))) {
      obj.excludeWorkflows = this.savedIgnoreList.workflows;
    }

    if (this.selectedFiltered1 && !isEmpty(this.selectedFiltered1)) {
      this.isCustomizationSelected1(true);
      obj = this.orderParseDate(obj);
    } else {
      obj = this.setOrderDateRange(obj);
      if (this.order.filter.historyStates && this.order.filter.historyStates !== 'ALL' && this.order.filter.historyStates.length > 0) {
        obj.historyStates = [];
        obj.historyStates.push(this.order.filter.historyStates);
      }
    }
    this.convertRequestBody(obj);
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.historys = this.setDuration(res);
      if (flag) {
        this.mergeOldData();
      } else {
        this.searchInResult();
      }
      this.isLoading = true;
    }, () => {
      this.data = [];
      this.isLoading = true;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (this.historyFilters.type === 'ORDER') {
      this.coreService.calRowWidth(this.historyFilters.current);
    }
  }

  isCustomizationSelected2(flag): void {
    if (flag) {
      this.temp_filter2.historyStates = clone(this.task.filter.historyStates);
      this.temp_filter2.date = clone(this.task.filter.date);
      this.task.filter.historyStates = '';
      this.task.filter.date = '';
    } else {
      if (this.temp_filter2.historyStates) {
        this.task.filter.historyStates = clone(this.temp_filter2.historyStates);
        this.task.filter.date = clone(this.temp_filter2.date);
      } else {
        this.task.filter.historyStates = 'ALL';
        this.task.filter.date = 'today';
      }
    }
  }

  jobParseDate(obj): any {
    if (this.selectedFiltered2.jobName) {
      obj.jobName = this.selectedFiltered2.jobName;
    }
    if (this.selectedFiltered2.state && this.selectedFiltered2.state.length > 0) {
      obj.historyStates = this.selectedFiltered2.state;
    }
    if (this.selectedFiltered2.paths && this.selectedFiltered2.paths.length > 0) {
      obj.folders = [];
      this.selectedFiltered2.paths.forEach((value) => {
        obj.folders.push({folder: value, recursive: true});
      });
    }
    if (this.selectedFiltered2.workflowPaths && this.selectedFiltered2.workflowPaths.length > 0) {
      obj.jobs = [];
      this.selectedFiltered2.workflowPaths.forEach((value) => {
        obj.jobs.push({workflowPath: value});
      });
    }
    obj = this.coreService.parseProcessExecutedRegex(this.selectedFiltered2.planned, obj);
    return obj;
  }

  setTaskDateRange(filter): any {
    if (this.task.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else if (this.task.filter.date && this.task.filter.date != 'ALL') {
      filter.dateFrom = this.task.filter.date;
    }
    return filter;
  }

  taskHistory(obj, flag): void {
    this.historyFilters.type = 'TASK';
    if (!obj) {
      if (!this.jobHistoryFilterList && this.schedulerIds.selected) {
        this.data = [];
        this.checkSharedFilters('TASK');
        return;
      }
      obj = {controllerId: this.historyFilters.current == true ? this.schedulerIds.selected : ''};
      this.isLoading = false;
      this.data = [];
    }
    if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true')
      && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
      obj.excludeJobs = this.savedIgnoreList.jobs;
    }
    if (this.selectedFiltered2 && !isEmpty(this.selectedFiltered2)) {
      this.isCustomizationSelected2(true);
      obj = this.jobParseDate(obj);
    } else {
      obj = this.setTaskDateRange(obj);
      if (this.task.filter.historyStates && this.task.filter.historyStates != 'ALL' && this.task.filter.historyStates.length > 0) {
        obj.historyStates = [];
        obj.historyStates.push(this.task.filter.historyStates);
      }
    }
    this.convertRequestBody(obj);
    this.coreService.post('tasks/history', obj).subscribe((res) => {
      this.taskHistorys = this.setDuration(res);
      if (flag) {
        this.mergeOldTaskData();
      } else {
        this.searchInResult();
      }
      this.isLoading = true;
    }, () => {
      this.data = [];
      this.isLoading = true;
    });
  }

  isCustomizationSelected3(flag) {
    if (flag) {
      this.temp_filter3.states = clone(this.yade.filter.historyStates);
      this.temp_filter3.date = clone(this.yade.filter.date);
      this.yade.filter.historyStates = '';
      this.yade.filter.date = '';
    } else {
      if (this.temp_filter3.states) {
        this.yade.filter.historyStates = clone(this.temp_filter3.historyStates);
        this.yade.filter.date = clone(this.temp_filter3.date);
      } else {
        this.yade.filter.historyStates = 'ALL';
        this.yade.filter.date = 'today';
      }
    }
  }

  setYadeDateRange(filter) {
    if (this.yade.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else if (this.yade.filter.date && this.yade.filter.date != 'ALL') {
      filter.dateFrom = this.yade.filter.date;
    }
    return filter;
  }

  yadeHistory(obj, flag) {
    this.historyFilters.type = 'YADE';
    if (!obj) {
      if (!this.yadeHistoryFilterList && this.schedulerIds.selected) {
        this.data = [];
        this.checkSharedFilters('YADE');
        return;
      }
      obj = {controllerId: this.historyFilters.current == true ? this.schedulerIds.selected : ''};
      this.isLoading = false;
      this.data = [];
    }

    if (this.selectedFiltered3 && !isEmpty(this.selectedFiltered3)) {
      this.isCustomizationSelected3(true);
      //obj = this.yadeParseDate(obj);
    } else {
      obj = this.setYadeDateRange(obj);
      if (this.yade.filter.historyStates && this.yade.filter.historyStates != 'ALL' && this.yade.filter.historyStates.length > 0) {
        obj.states = [];
        obj.states.push(this.yade.filter.historyStates);
      }
    }
    this.convertRequestBody(obj);
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      this.yadeHistorys = res.transfers || [];
      if (flag) {
        this.mergeOldYadeData();
      } else {
        this.searchInResult();
      }
      this.isLoading = true;
      this.setHeaderWidth();
    }, () => {
      this.data = [];
      this.isLoading = true;
    });
  }

  isCustomizationSelected4(flag): void {
    if (flag) {
      this.temp_filter4.state = clone(this.deployment.filter.state);
      this.temp_filter4.date = clone(this.deployment.filter.date);
      this.deployment.filter.state = '';
      this.deployment.filter.date = '';
    } else {
      if (this.temp_filter4.state) {
        this.deployment.filter.state = clone(this.temp_filter4.state);
        this.deployment.filter.date = clone(this.temp_filter4.date);
      } else {
        this.deployment.filter.state = 'ALL';
        this.deployment.filter.date = 'today';
      }
    }
  }

  deploymentParseDate(obj, data, flag): any {
    obj.state = (data.state && data.state !== 'ALL') ? data.state : undefined;
    obj.operation = (data.operation && data.operation !== 'ALL') ? data.operation : undefined;
    obj.deployType = data.deployType ? data.deployType : undefined;
    if (flag) {
      obj = this.coreService.parseProcessExecutedRegex(data.planned, obj);
      if (obj.dateFrom) {
        obj.from = obj.dateFrom;
        delete obj.dateFrom;
      }
      if (obj.dateTo) {
        obj.to = obj.dateTo;
        delete obj.dateTo;
      }
    }
    return obj;
  }

  setDeploymentDateRange(filter) {
    if (this.deployment.filter.date == 'today') {
      filter.from = '0d';
      filter.to = '0d';
    } else if (this.deployment.filter.date && this.deployment.filter.date !== 'ALL') {
      filter.from = this.deployment.filter.date;
    }
    return filter;
  }

  deploymentHistory(obj, flag) {
    this.historyFilters.type = 'DEPLOYMENT';
    if (!obj) {
      if (!this.deploymentHistoryFilterList && this.schedulerIds.selected) {
        this.data = [];
        this.checkSharedFilters('DEPLOYMENT');
        return;
      }
      if (this.historyFilters.current == true) {
        obj = {controllerId: this.schedulerIds.selected};
      } else {
        obj = {};
      }
      this.isLoading = false;
      this.data = [];
    } else {
      if (!obj.controllerId) {
        delete obj.controllerId;
      }
    }
    if (this.selectedFiltered4 && !isEmpty(this.selectedFiltered4)) {
      this.isCustomizationSelected4(true);
      obj = this.deploymentParseDate(obj, this.selectedFiltered4, true);
    } else {
      obj = this.setDeploymentDateRange(obj);
      obj.state = (this.deployment.filter.state && this.deployment.filter.state !== 'ALL') ? this.deployment.filter.state : undefined;
    }
    this.convertDeployRequestBody(obj);
    this.coreService.post('inventory/deployment/history', {compactFilter: obj}).subscribe((res: any) => {
      this.deploymentHistorys = res.depHistory;
      if (flag) {
        this.mergeDepData();
      } else {
        this.searchInResult();
      }
      this.isLoading = true;
    }, () => {
      this.data = [];
      this.isLoading = true;
    });
  }

  isCustomizationSelected5(flag): void {
    if (flag) {
      this.temp_filter5.category = clone(this.submission.filter.category);
      this.temp_filter5.date = clone(this.submission.filter.date);
      this.submission.filter.category = '';
      this.submission.filter.date = '';
    } else {
      if (this.temp_filter5.category) {
        this.submission.filter.category = clone(this.temp_filter5.category);
        this.submission.filter.date = clone(this.temp_filter5.date);
      } else {
        this.submission.filter.category = 'ALL';
        this.submission.filter.date = 'today';
      }
    }
  }

  setSubmissionDateRange(filter) {
    if (this.submission.filter.date === 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else if (this.submission.filter.date && this.submission.filter.date !== 'ALL') {
      if (this.submission.filter.date === '7d' || this.submission.filter.date === '30d') {
        filter.dateFrom = '0d';
        filter.dateTo = this.submission.filter.date;
      } else if (this.submission.filter.date === '-1d') {
        filter.dateFrom = this.submission.filter.date;
        filter.dateTo = this.submission.filter.date;
      } else {
        filter.dateFrom = this.submission.filter.date;
        filter.dateTo = '0d';
      }
    }
    return filter;
  }

  submissionHistory(obj, flag) {
    this.historyFilters.type = 'SUBMISSION';
    if (!obj) {
      if (!this.submissionHistoryFilterList && this.schedulerIds.selected) {
        this.data = [];
        this.checkSharedFilters('SUBMISSION');
        return;
      }
      if (this.historyFilters.current == true) {
        obj = {controllerId: this.schedulerIds.selected};
      } else {
        obj = {};
      }
      this.isLoading = false;
      this.data = [];
    } else {
      if (!obj.controllerId) {
        delete obj.controllerId;
      }
    }
    if (this.selectedFiltered5 && !isEmpty(this.selectedFiltered5)) {
      this.isCustomizationSelected5(true);
      if (this.selectedFiltered5.type && this.selectedFiltered5.type.length === 1) {
        obj.submitted = this.selectedFiltered5.type[0] === 'SUBMITTED';
      }
      obj = this.coreService.parseProcessExecutedRegex(this.selectedFiltered5.planned, obj);
    } else {
      if (this.submission.filter.category !== 'ALL') {
        obj.submitted = this.submission.filter.category === 'SUBMITTED';
      }
      obj = this.setSubmissionDateRange(obj);
    }
    this.convertRequestBody(obj);
    this.coreService.post('daily_plan/history', {filter: obj, controllerId: this.schedulerIds.selected}).subscribe((res: any) => {
      this.submissionHistorys = res.dailyPlans;
      if (flag) {
        this.mergeSubData();
      } else {
        this.searchInResult();
      }
      this.isLoading = true;
    }, () => {
      this.data = [];
      this.isLoading = true;
    });
  }

  expandDailyPlan(history) {
    history.show = true;
    if (history.controllers && history.controllers.length > 0) {
      history.controllers.forEach((controller) => {
        controller.submissions.forEach((sub) => {
          if (sub.show === undefined) {
            sub.show = true;
          }
        });
      });
    }
  }

  search(obj) {
    let filter: any = {
      limit: parseInt(this.preferences.maxRecords, 10) || 5000
    };
    let fromDate, toDate;
    if (this.historyFilters.type === 'ORDER') {
      this.order.filter.historyStates = '';
      this.order.filter.date = '';
      if (obj.workflowPaths) {
        filter.orders = [];
        obj.workflowPaths.forEach((value) => {
          filter.orders.push({workflowPath: value});
        });
      }
      if (obj.states && obj.states.length > 0) {
        filter.historyStates = obj.states;
      }
      if (obj.radio === 'planned') {
        filter = this.coreService.parseProcessExecutedRegex(obj.planned, filter);
      } else {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {
            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());
          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = this.coreService.getUTC(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {
            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());
          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = this.coreService.getUTC(toDate);
        }
      }

      if (obj.orderId) {
        filter.orderId = obj.orderId;
      }
      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      } else {
        filter.controllerId = '';
      }
      if (obj.paths && obj.paths.length > 0) {
        filter.folders = [];
        obj.paths.forEach((value) => {
          filter.folders.push({folder: value, recursive: true});
        });
      }
      if ((obj.workflows && obj.workflows.length > 0) || (obj.orders && obj.orders.length > 0)) {
        filter.orders = [];

        obj.orders.forEach((value) => {
          filter.orders.push({workflow: value.workflow, orderId: value.orderId});
        });
        if (!obj.orders || obj.orders.length == 0) {
          obj.workflows.forEach((value) => {
            filter.orders.push({workflow: value});
          });
        } else {
          if (obj.workflows) {
            for (let i = 0; i < obj.workflows.length; i++) {
              let flg = true;
              for (let j = 0; j < filter.orders.length; j++) {
                if (filter.orders[j].workflow === obj.workflows[i]) {
                  flg = false;
                  break;
                }
              }
              if (flg) {
                filter.orders.push({workflow: obj.workflows[i]});
              }
            }
          }
        }

      }
      filter.timeZone = this.preferences.zone;
      if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
        filter.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateFrom);
      }
      if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
        filter.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateTo);
      }
      if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true') && ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0))) {
        filter.excludeWorkflows = this.savedIgnoreList.workflows;
      }
      this.coreService.post('orders/history', filter).subscribe((res: any) => {
        this.historys = this.setDuration(res);
        this.searchInResult();
        this.isLoading = true;
      }, () => {
        this.data = [];
        this.isLoading = true;
      });
    } else if (this.historyFilters.type === 'TASK') {
      this.task.filter.historyStates = '';
      this.task.filter.date = '';
      if (obj.workflowPaths) {
        filter.jobs = [];
        obj.workflowPaths.forEach((value) => {
          filter.jobs.push({workflowPath: value});
        });
      }
      if (obj.historyStates && obj.historyStates.length > 0) {
        filter.historyStates = obj.historyStates;
      }
      if (obj.criticality && obj.criticality.length > 0) {
        filter.criticality = obj.criticality;
      }
      if (obj.radio == 'planned') {
        filter = this.coreService.parseProcessExecutedRegex(obj.planned, filter);
      } else {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {
            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());
          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = this.coreService.getUTC(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {
            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());
          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = this.coreService.getUTC(toDate);
        }
      }

      if (obj.jobName) {
        filter.jobName = obj.jobName;
      }
      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      } else {
        filter.controllerId = '';
      }
      if (obj.paths && obj.paths.length > 0) {
        filter.folders = [];
        obj.paths.forEach((value) => {
          filter.folders.push({folder: value, recursive: true});
        });
      }
      if (obj.jobs && obj.jobs.length > 0) {
        filter.jobs = [];
        obj.jobs.forEach((value) => {
          filter.jobs.push({job: value});
        });
      }
      filter.timeZone = this.preferences.zone;
      if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
        filter.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateFrom);
      }
      if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
        filter.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateTo);
      }
      if ((this.savedIgnoreList.isEnable == true || this.savedIgnoreList.isEnable == 'true')
        && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
        filter.excludeJobs = this.savedIgnoreList.jobs;
      }

      this.coreService.post('tasks/history', filter).subscribe((res: any) => {
        this.taskHistorys = this.setDuration(res);
        this.searchInResult();
        this.isLoading = true;
      }, () => {
        this.data = [];
        this.isLoading = true;
      });
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.deployment.filter.state = '';
      this.deployment.filter.date = '';
      filter = this.deploymentParseDate(filter, obj, (obj.radio === 'planned'));
      if (obj.radio !== 'planned') {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {
            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());
          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.from = this.coreService.getUTC(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {
            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());
          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.to = this.coreService.getUTC(toDate);
        }
      }

      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      }
      if (obj.paths && obj.paths.length > 0) {
        filter.folders = [];
        obj.paths.forEach((value) => {
          filter.folders.push({folder: value, recursive: true});
        });
      }

      filter.timeZone = this.preferences.zone;
      if ((filter.from && typeof filter.from.getMonth === 'function')) {
        filter.from = this.coreService.convertTimeToLocalTZ(this.preferences, filter.from);
      }
      if ((filter.to && typeof filter.to.getMonth === 'function')) {
        filter.to = this.coreService.convertTimeToLocalTZ(this.preferences, filter.to);
      }
      this.coreService.post('inventory/deployment/history', {compactFilter: filter}).subscribe((res: any) => {
        this.deploymentHistorys = res.depHistory;
        this.searchInResult();
        this.isLoading = true;
      }, () => {
        this.data = [];
        this.isLoading = true;
      });
    } else if (this.historyFilters.type === 'SUBMISSION') {
      this.submission.filter.date = '';
      if (obj.radio === 'planned') {
        filter = this.coreService.parseProcessExecutedRegex(obj.planned, filter);
      } else {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {
            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());
          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = this.coreService.getUTC(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {
            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());
          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = this.coreService.getUTC(toDate);
        }
      }
      if (obj.type && obj.type.length === 1) {
        filter.submitted = obj.type[0] === 'SUBMITTED';
      }

      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      }

      filter.timeZone = this.preferences.zone;
      if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
        filter.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateFrom);
      }
      if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
        filter.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateTo);
      }
      this.coreService.post('daily_plan/history', {filter, controllerId: this.schedulerIds.selected}).subscribe((res: any) => {
        this.submissionHistorys = res.dailyPlans;
        this.searchInResult();
        this.isLoading = true;
      }, () => {
        this.data = [];
        this.isLoading = true;
      });
    } else if (this.historyFilters.type === 'YADE') {
      this.yade.filter.historyStates = '';
      this.yade.filter.date = '';
      if (obj.file) {
        filter.files = [];
        const s = obj.file.replace(/,\s+/g, ',');
        const files = s.split(',');
        files.forEach((value) => {
          filter.files.push({file: value});
        });
      }
      if (obj.states && obj.states.length > 0) {
        filter.historyStates = obj.states;
      }
      if (obj.criticality && obj.criticality.length > 0) {
        filter.criticality = obj.criticality;
      }
      if (obj.radio === 'process') {
        filter = this.coreService.parseProcessExecutedRegex(obj.planned, filter);
      } else {
        if (obj.from) {
          fromDate = new Date(obj.from);
          if (obj.fromTime) {
            fromDate.setHours(obj.fromTime.getHours());
            fromDate.setMinutes(obj.fromTime.getMinutes());
            fromDate.setSeconds(obj.fromTime.getSeconds());
          } else {
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
          }
          fromDate.setMilliseconds(0);
          filter.dateFrom = this.coreService.getUTC(fromDate);
        }
        if (obj.to) {
          toDate = new Date(obj.to);
          if (obj.toTime) {
            toDate.setHours(obj.toTime.getHours());
            toDate.setMinutes(obj.toTime.getMinutes());
            toDate.setSeconds(obj.toTime.getSeconds());
          } else {
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
          }
          toDate.setMilliseconds(0);
          filter.dateTo = this.coreService.getUTC(toDate);
        }
      }

      if (obj.regex) {
        filter.regex = obj.regex;
      }
      if (obj.controllerId) {
        filter.controllerId = obj.controllerId;
      }
      if (obj.paths && obj.paths.length > 0) {
        filter.folders = [];
        obj.paths.forEach((value) => {
          filter.folders.push({folder: value, recursive: true});
        });
      }
      if (obj.files && obj.files.length > 0) {
        filter.files = [];
        obj.files.forEach((value) => {
          filter.files.push({file: value});
        });
      }
      filter.timeZone = this.preferences.zone;
      if ((filter.dateFrom && (typeof filter.dateFrom.getMonth === 'function' || typeof filter.dateFrom === 'object')) || (filter.dateTo && (typeof filter.dateTo.getMonth === 'function' || typeof filter.dateTo === 'object'))) {
        filter.timeZone = 'UTC';
      }
      if ((filter.from && typeof filter.from.getMonth === 'function')) {
        filter.from = this.coreService.convertTimeToLocalTZ(this.preferences, filter.from);
      }
      if ((filter.to && typeof filter.to.getMonth === 'function')) {
        filter.to = this.coreService.convertTimeToLocalTZ(this.preferences, filter.to);
      }
      this.coreService.post('yade/transfers', filter).subscribe((res: any) => {
        this.yadeHistorys = this.setDuration(res);
        this.searchInResult();
        this.isLoading = true;
        this.setHeaderWidth();
      }, () => {
        this.data = [];
        this.isLoading = true;
      });
    }
  }

  advancedSearch(): void {
    this.showSearchPanel = true;
    this.object.paths = [];
    this.object.orders = [];
    this.object.workflows = [];
    this.object.jobs = [];

    this.orderSearch = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
    };

    this.jobSearch = {
      radio: 'current',
      planned: 'today',
      operation: 'ALL',
      state: 'ALL',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
    };

    this.yadeSearch = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
    };

    this.deploymentSearch = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date()
    };

    this.submissionSearch = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date()
    };
  }

  cancel(): void {
    this.loadHistory(null, null);
  }

  loadHistory(type, value) {
    this.showSearchPanel = false;
    if (!this.order.filter.historyStates) {
      this.order.filter.historyStates = 'ALL';
    }
    if (!this.order.filter.date) {
      this.order.filter.date = 'today';
    }
    if (!this.task.filter.historyStates) {
      this.task.filter.historyStates = 'ALL';
    }
    if (!this.task.filter.date) {
      this.task.filter.date = 'today';
    }
    if (!this.yade.filter.historyStates) {
      this.yade.filter.historyStates = 'ALL';
    }
    if (!this.yade.filter.date) {
      this.yade.filter.date = 'today';
    }
    if (!this.deployment.filter.state) {
      this.deployment.filter.state = 'ALL';
    }
    if (!this.deployment.filter.date) {
      this.deployment.filter.date = 'today';
    }
    if (!this.submission.filter.date) {
      this.submission.filter.date = 'today';
    }
    if (!this.submission.filter.category) {
      this.submission.filter.category = 'ALL';
    }
    if (this.historyFilters.type === 'TASK') {
      this.jobSearch = {};
      this.jobSearch.date = 'date';
      if (type === 'STATE') {
        this.task.filter.historyStates = value;
      } else if (type === 'DATE') {
        this.task.filter.date = value;
      }
    } else if (this.historyFilters.type === 'ORDER') {
      this.orderSearch = {};
      this.orderSearch.date = 'date';
      if (type === 'STATE') {
        this.order.filter.historyStates = value;
      } else if (type === 'DATE') {
        this.order.filter.date = value;
      }
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.deploymentSearch = {};
      this.deploymentSearch.date = 'date';
      if (type === 'STATE') {
        this.deployment.filter.state = value;
      } else if (type === 'DATE') {
        this.deployment.filter.date = value;
      }
    } else if (this.historyFilters.type === 'SUBMISSION') {
      this.submissionSearch = {};
      this.submissionSearch.date = 'date';
      if (type === 'DATE') {
        this.submission.filter.date = value;
      } else if (type === 'CATEGORY') {
        this.submission.filter.category = value;
      }
    } else if (this.historyFilters.type === 'YADE') {
      this.yadeSearch = {};
      this.yadeSearch.date = 'date';
      if (type === 'STATE') {
        this.yade.filter.historyStates = value;
      } else if (type === 'DATE') {
        this.yade.filter.date = value;
      }
    }
    this.init(false);
  }

  /*--------------- Navigate to inventory tab -------------------*/

  navToWorkflowTab(workflow): void {
    this.coreService.getConfigurationTab().inventory.expand_to = [];
    this.coreService.getConfigurationTab().inventory.selectedObj = {
      name: workflow.substring(workflow.lastIndexOf('/') + 1),
      path: workflow.substring(0, workflow.lastIndexOf('/')) || '/',
      type: 'WORKFLOW'
    };
    this.router.navigate(['/configuration/inventory']);
  }

  navToInventoryTab(data): void {
    if (data.operation === 'UPDATE') {
      this.coreService.getConfigurationTab().inventory.expand_to = [];
      this.coreService.getConfigurationTab().inventory.selectedObj = {
        name: data.path.substring(data.path.lastIndexOf('/') + 1),
        path: data.folder,
        type: data.deployType.toUpperCase()
      };
      this.router.navigate(['/configuration/inventory']);
    }
  }

  /*--------------- sorting and pagination -------------------*/
  sort(propertyName): void {
    this.order.reverse = !this.order.reverse;
    this.order.filter.sortBy = propertyName;
  }

  sort1(propertyName): void {
    this.task.reverse = !this.task.reverse;
    this.task.filter.sortBy = propertyName;
  }

  sortBy2(propertyName): void {
    this.yade.reverse = !this.yade.reverse;
    this.yade.filter.sortBy = propertyName;
  }

  sort3(propertyName): void {
    this.deployment.reverse = !this.deployment.reverse;
    this.deployment.filter.sortBy = propertyName;
  }

  sort4(propertyName): void {
    this.submission.reverse = !this.submission.reverse;
    this.submission.filter.sortBy = propertyName;
  }

  pageIndexChange($event): void {
    if (this.historyFilters.type === 'ORDER') {
      this.order.currentPage = $event;
    } else if (this.historyFilters.type === 'TASK') {
      this.task.currentPage = $event;
    } else if (this.historyFilters.type === 'YADE') {
      this.yade.currentPage = $event;
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.deployment.currentPage = $event;
    } else if (this.historyFilters.type === 'SUBMISSION') {
      this.submission.currentPage = $event;
    }
  }

  pageSizeChange($event): void {
    if (this.historyFilters.type === 'ORDER') {
      this.order.entryPerPage = $event;
    } else if (this.historyFilters.type === 'TASK') {
      this.task.entryPerPage = $event;
    } else if (this.historyFilters.type === 'YADE') {
      this.yade.entryPerPage = $event;
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.deployment.entryPerPage = $event;
    } else if (this.historyFilters.type === 'SUBMISSION') {
      this.submission.entryPerPage = $event;
    }
  }

  currentPageDataChange($event): void {
    this.currentData = $event;
  }

  searchInResult(): void {
    if (this.historyFilters.type === 'ORDER') {
      this.data = this.order.searchText ? this.searchPipe.transform(this.historys, this.order.searchText, this.orderSearchableProperties) : this.historys;
    } else if (this.historyFilters.type === 'TASK') {
      this.data = this.task.searchText ? this.searchPipe.transform(this.taskHistorys, this.task.searchText, this.taskSearchableProperties) : this.taskHistorys;
    } else if (this.historyFilters.type === 'YADE') {
      this.data = this.yade.searchText ? this.searchPipe.transform(this.yadeHistorys, this.yade.searchText, this.yadeSearchableProperties) : this.yadeHistorys;
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      this.data = this.deployment.searchText ? this.searchPipe.transform(this.deploymentHistorys, this.deployment.searchText, this.deploymentSearchableProperties) : this.deploymentHistorys;
    } else if (this.historyFilters.type === 'SUBMISSION') {
      this.data = this.submissionHistorys;
    }
    this.data = [...this.data];
  }

  expandDetails(): void {
    if (this.historyFilters.type !== 'YADE') {
      this.currentData.forEach((value: any) => {
        value.show = true;
        if (this.historyFilters.type === 'DEPLOYMENT') {
          this.showChildHistory(value);
        } else if (this.historyFilters.type === 'SUBMISSION') {
          value.controllers.forEach((controller: any) => {
            controller.submissions.forEach((sub: any) => {
              sub.show = true;
            });
          });
        }
      });
    } else {
      this.currentData.forEach((value) => {
        this.showTransferFuc(value);
      });
    }
  }

  collapseDetails(): void {
    this.currentData.forEach((value: any) => {
      value.show = false;
    });
  }

  exportToExcel(): void {
    let data = [];
    let fileName = 'JS7-order-history-report';
    if (this.historyFilters.type === 'TASK') {
      data = this.exportToExcelTask();
      fileName = 'JS7-task-history-report';
    } else if (this.historyFilters.type === 'YADE') {
      data = this.exportToExcelYade();
      fileName = 'JS7-yade-history-report';
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      data = this.exportToExcelDeployment();
      fileName = 'JS7-deployment-history-report';
    } else if (this.historyFilters.type === 'SUBMISSION') {
      data = this.exportToExcelSubmission();
      fileName = 'JS7-submission-history-report';
    } else {
      data = this.exportToExcelOrder();
    }
    this.excelService.exportAsExcelFile(data, fileName);
  }

  showAllPanelFuc(data: any): void {
    data.showAll = true;
    data.show = true;
    this.recursiveExpand(data, 1);
  }

  hideAllPanelFuc(data: any): void {
    data.showAll = false;
    data.show = false;
  }

  showPanelFuc(data: any): void {
    data.loading = true;
    data.show = true;
    data.children = [];
    data.states = [];
    const obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      data.level = 1;
      data.children = res.children;
      data.states = res.states;
      data.loading = false;
      this.coreService.calRowWidth(this.historyFilters.current);
    }, () => {
      data.loading = false;
    });
  }

  hidePanelFuc(data: any): void {
    data.show = false;
    data.showAll = false;
  }

  showChildHistory(data: any): void {
    data.loading = true;
    data.show = true;
    data.children = [];
    const obj = {
      detailFilter: {
        controllerId: data.controllerId || this.schedulerIds.selected,
        commitId: data.commitId
      }
    };
    this.coreService.post('inventory/deployment/history', obj).subscribe((res: any) => {
      data.children = res.depHistory;
      data.loading = false;
    }, () => {
      data.loading = false;
    });
  }

  showTransferFuc(data: any): void {
    const self = this;
    data.show = true;
    data.files = [];
    data.widthArr = [];
    data.loading = true;
    this.coreService.post('yade/files', {
      transferIds: [data.id],
      controllerId: data.controllerId || this.schedulerIds.selected
    }).subscribe((res: any) => {
      data.files = res.files;
      data.loading = false;
      data.widthArr = [...data.widthArr, ...this.coreService.calFileTransferRowWidth(false)];
      setTimeout(() => {
        const dom = $('#fileTransferMainTable');
        dom.find('thead tr.main-header-row th').each(function(i) {
          $(this).css('width', self.widthArr[i] + 'px');
        });
      }, 0);
    }, () => {
      data.loading = false;
    });
  }

  addJobToIgnoreList(name, workflow): void {
    const obj = {
      workflowPath: workflow,
      job: name ? name : undefined
    };
    if (this.savedIgnoreList.jobs.indexOf(obj) === -1) {
      this.savedIgnoreList.jobs.push(obj);
      this.saveIgnoreList((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true));
    }
  }

  addWorkflowToIgnoreList(name): void {
    if (this.savedIgnoreList.workflows.indexOf(name) === -1) {
      this.savedIgnoreList.workflows.push(name);
      this.saveIgnoreList((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true));
    }
  }

  removeObjectFromIgnoreList(): void {
    this.saveIgnoreList(true);
  }

  editIgnoreList(): void {
    if ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0) || (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: EditIgnoreListComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          savedIgnoreList: this.savedIgnoreList,
          historyFilters: this.historyFilters,
          self: this
        },
        nzFooter: null,
        nzClosable: false
      });
    }
  }

  enableDisableIgnoreList(): void {
    if (this.schedulerIds.selected) {
      this.savedIgnoreList.isEnable = !this.savedIgnoreList.isEnable;
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'IGNORELIST',
        id: this.ignoreListConfigId,
        configurationItem: JSON.stringify(this.savedIgnoreList)
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        this.ignoreListConfigId = res.id;
      });
      if ((!isEmpty(this.jobSearch) && this.historyFilters.type === 'TASK') || (!isEmpty(this.orderSearch) && this.historyFilters.type === 'ORDER')) {
        this.search(true);
      } else {
        this.init(false);
      }
    }
  }

  resetIgnoreList(): void {
    if (this.schedulerIds.selected) {
      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true) && this.historyFilters.type == 'ORDER' && ((this.savedIgnoreList.workflows && this.savedIgnoreList.workflows.length > 0))) {
        if (!isEmpty(this.orderSearch)) {
          this.search(true);
        } else {
          this.init(false);
        }
      } else if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true) && this.historyFilters.type != 'ORDER' && (this.savedIgnoreList.jobs && this.savedIgnoreList.jobs.length > 0)) {
        if (!isEmpty(this.jobSearch)) {
          this.search(true);
        } else {
          this.init(false);
        }
      }
      this.savedIgnoreList.workflows = [];
      this.savedIgnoreList.jobs = [];
      this.savedIgnoreList.isEnable = false;
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'IGNORELIST',
        id: this.ignoreListConfigId,
        configurationItem: JSON.stringify(this.savedIgnoreList)
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        this.ignoreListConfigId = res.id;
      });
    }
  }

  createCustomization(): void {
    if (this.schedulerIds.selected) {
      const obj: any = {
        permission: this.permission,
        schedulerId: this.schedulerIds.selected,
        new: true,
        type: this.historyFilters.type
      };
      if (this.historyFilters.type === 'ORDER') {
        obj.allFilter = this.orderHistoryFilterList;
      } else if (this.historyFilters.type === 'TASK') {
        obj.allFilter = this.jobHistoryFilterList;
      } else if (this.historyFilters.type === 'YADE') {
        obj.allFilter = this.yadeHistoryFilterList;
      } else if (this.historyFilters.type === 'DEPLOYMENT') {
        obj.allFilter = this.deploymentHistoryFilterList;
      } else if (this.historyFilters.type === 'SUBMISSION') {
        obj.allFilter = this.submissionHistoryFilterList;
      }
      this.modal.create({
        nzTitle: undefined,
        nzContent: FilterModalComponent,
        nzClassName: 'lg',
        nzComponentParams: obj,
        nzFooter: null,
        nzClosable: false
      });
    }
  }

  editFilters(): void {
    const obj: any = {
      permission: this.permission,
      username: this.authService.currentUserData,
      action: this.action
    };
    if (this.historyFilters.type === 'ORDER') {
      obj.filterList = this.orderHistoryFilterList;
      obj.favorite = this.savedHistoryFilter.favorite;
    } else if (this.historyFilters.type === 'TASK') {
      obj.filterList = this.jobHistoryFilterList;
      obj.favorite = this.savedJobHistoryFilter.favorite;
    } else if (this.historyFilters.type === 'YADE') {
      obj.filterList = this.yadeHistoryFilterList;
      obj.favorite = this.savedYadeHistoryFilter.favorite;
    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      obj.filterList = this.deploymentHistoryFilterList;
      obj.favorite = this.savedDeploymentHistoryFilter.favorite;
    } else if (this.historyFilters.type === 'SUBMISSION') {
      obj.filterList = this.submissionHistoryFilterList;
      obj.favorite = this.savedSubmissionHistoryFilter.favorite;
    }
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EditFilterModalComponent,
      nzComponentParams: obj,
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe((result) => {
      if (result) {
        if (result.type === 'EDIT') {
          this.editFilter(result);
        } else if (result.type === 'COPY') {
          this.copyFilter(result);
        }
      }
    }, () => {
    });
  }

  /* --------------------------Actions -----------------------*/

  downloadLog(obj, schedulerId): void {
    if (!schedulerId) {
      schedulerId = this.schedulerIds.selected;
    }
    this.coreService.downloadLog(obj, schedulerId);
  }

  action(type, obj, self): void {
    if (self.historyFilters.type === 'ORDER') {
      if (type === 'DELETE') {
        if (self.savedHistoryFilter.selected == obj.id) {
          self.savedHistoryFilter.selected = undefined;
          self.isCustomizationSelected1(false);
          self.order.selectedView = false;
          self.selectedFiltered1 = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.orderHistoryFilterList.length == 0) {
            self.isCustomizationSelected1(false);
            self.savedHistoryFilter.selected = undefined;
            self.order.selectedView = false;
            self.selectedFiltered1 = undefined;
          }
        }
        self.saveService.setHistory(self.savedHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedHistoryFilter.favorite = obj.id;
        self.order.selectedView = true;
        self.saveService.setHistory(self.savedHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedHistoryFilter);
        self.saveService.save();
      }
    } else if (self.historyFilters.type === 'TASK') {
      if (type === 'DELETE') {
        if (self.savedJobHistoryFilter.selected == obj.id) {
          self.savedJobHistoryFilter.selected = undefined;
          self.isCustomizationSelected2(false);
          self.task.selectedView = false;
          self.selectedFiltered2 = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.jobHistoryFilterList.length == 0) {
            self.isCustomizationSelected2(false);
            self.savedJobHistoryFilter.selected = undefined;
            self.task.selectedView = false;
            self.selectedFiltered2 = undefined;
          }
        }
        self.saveService.setHistory(self.savedJobHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedJobHistoryFilter.favorite = obj.id;
        self.task.selectedView = true;
        self.saveService.setHistory(self.savedJobHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedJobHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedJobHistoryFilter);
        self.saveService.save();
      }
    } else if (self.historyFilters.type === 'YADE') {
      if (type === 'DELETE') {
        if (self.savedYadeHistoryFilter.selected == obj.id) {
          self.savedYadeHistoryFilter.selected = undefined;
          self.isCustomizationSelected3(false);
          self.yade.selectedView = false;
          self.selectedFiltered3 = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.yadeHistoryFilterList.length == 0) {
            self.isCustomizationSelected(false);
            self.savedYadeHistoryFilter.selected = undefined;
            self.yade.selectedView = false;
            self.selectedFiltered3 = undefined;
          }
        }
        self.saveService.setHistory(self.savedYadeHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedYadeHistoryFilter.favorite = obj.id;
        self.yade.selectedView = true;
        self.saveService.setHistory(self.savedYadeHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedYadeHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedYadeHistoryFilter);
        self.saveService.save();
      }
    } else if (self.historyFilters.type === 'DEPLOYMENT') {
      if (type === 'DELETE') {
        if (self.savedDeploymentHistoryFilter.selected == obj.id) {
          self.savedDeploymentHistoryFilter.selected = undefined;
          self.isCustomizationSelected4(false);
          self.deployment.selectedView = false;
          self.selectedFiltered4 = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.deploymentHistoryFilterList.length == 0) {
            self.isCustomizationSelected4(false);
            self.savedDeploymentHistoryFilter.selected = undefined;
            self.deployment.selectedView = false;
            self.selectedFiltered4 = undefined;
          }
        }
        self.saveService.setHistory(self.savedDeploymentHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedDeploymentHistoryFilter.favorite = obj.id;
        self.deployment.selectedView = true;
        self.saveService.setHistory(self.savedDeploymentHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedDeploymentHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedDeploymentHistoryFilter);
        self.saveService.save();
      }
    } else if (self.historyFilters.type === 'SUBMISSION') {
      if (type === 'DELETE') {
        if (self.savedSubmissionHistoryFilter.selected == obj.id) {
          self.savedSubmissionHistoryFilter.selected = undefined;
          self.isCustomizationSelected5(false);
          self.submission.selectedView = false;
          self.selectedFiltered5 = undefined;
          self.setDateRange(null);
          self.load();
        } else {
          if (self.submissionHistoryFilterList.length == 0) {
            self.isCustomizationSelected5(false);
            self.savedSubmissionHistoryFilter.selected = undefined;
            self.submission.selectedView = false;
            self.selectedFiltered5 = undefined;
          }
        }
        self.saveService.setHistory(self.savedSubmissionHistoryFilter);
        self.saveService.save();
      } else if (type === 'MAKEFAV') {
        self.savedSubmissionHistoryFilter.favorite = obj.id;
        self.submission.selectedView = true;
        self.saveService.setHistory(self.savedSubmissionHistoryFilter);
        self.saveService.save();
        self.load();
      } else if (type === 'REMOVEFAV') {
        self.savedSubmissionHistoryFilter.favorite = '';
        self.saveService.setHistory(self.savedSubmissionHistoryFilter);
        self.saveService.save();
      }
    }
  }

  changeFilter(filter): void {
    if (this.historyFilters.type === 'ORDER') {
      if (filter) {
        this.savedHistoryFilter.selected = filter.id;
        this.historyFilters.order.selectedView = true;
        this.coreService.post('configuration', {
          controllerId: filter.controllerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered1.account = filter.account;
          this.init(false);
        });
      } else {
        this.isCustomizationSelected1(false);
        this.savedHistoryFilter.selected = filter;
        this.historyFilters.order.selectedView = false;
        this.selectedFiltered1 = {};
        this.init(false);
      }
      this.historyFilterObj.order = this.savedHistoryFilter;
    } else if (this.historyFilters.type === 'TASK') {
      if (filter) {
        this.savedJobHistoryFilter.selected = filter.id;
        this.historyFilters.task.selectedView = true;
        this.coreService.post('configuration', {
          controllerId: filter.controllerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered2.account = filter.account;
          this.init(false);
        });
      } else {
        this.isCustomizationSelected2(false);
        this.savedJobHistoryFilter.selected = filter;
        this.historyFilters.task.selectedView = false;
        this.selectedFiltered2 = {};
        this.init(false);
      }
      this.historyFilterObj.job = this.savedJobHistoryFilter;
    } else if (this.historyFilters.type === 'YADE') {
      if (filter) {
        this.savedYadeHistoryFilter.selected = filter.id;
        this.historyFilters.yade.selectedView = true;
        this.coreService.post('configuration', {
          controllerId: filter.controllerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered3.account = filter.account;
          this.init(false);
        });
      } else {
        this.isCustomizationSelected3(false);
        this.savedYadeHistoryFilter.selected = filter;
        this.historyFilters.yade.selectedView = false;
        this.selectedFiltered3 = {};
        this.init(false);
      }
      this.historyFilterObj.yade = this.savedYadeHistoryFilter;

    } else if (this.historyFilters.type === 'DEPLOYMENT') {
      if (filter) {
        this.savedDeploymentHistoryFilter.selected = filter.id;
        this.historyFilters.deployment.selectedView = true;
        this.coreService.post('configuration', {
          controllerId: filter.controllerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered4 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered4.account = filter.account;
          this.init(false);
        });
      } else {
        this.isCustomizationSelected4(false);
        this.savedDeploymentHistoryFilter.selected = filter;
        this.historyFilters.deployment.selectedView = false;
        this.selectedFiltered4 = {};
        this.init(false);
      }
      this.historyFilterObj.deployment = this.savedDeploymentHistoryFilter;
    } else if (this.historyFilters.type === 'SUBMISSION') {
      if (filter) {
        this.savedSubmissionHistoryFilter.selected = filter.id;
        this.historyFilters.submission.selectedView = true;
        this.coreService.post('configuration', {
          controllerId: filter.controllerId,
          id: filter.id
        }).subscribe((conf: any) => {
          this.selectedFiltered5 = JSON.parse(conf.configuration.configurationItem);
          this.selectedFiltered5.account = filter.account;
          this.init(false);
        });
      } else {
        this.isCustomizationSelected5(false);
        this.savedSubmissionHistoryFilter.selected = filter;
        this.historyFilters.submission.selectedView = false;
        this.selectedFiltered5 = {};
        this.init(false);
      }
      this.historyFilterObj.submission = this.savedSubmissionHistoryFilter;
    }
    this.saveService.setHistory(this.historyFilterObj);
    this.saveService.save();
  }

  private setHeaderWidth(): void {
    const self = this;
    setTimeout(() => {
      self.widthArr = [];
      const dom = $('#fileTransferMainTable');
      dom.find('thead tr.main-header-row th').each(function() {
        self.widthArr.push($(this).outerWidth());
      });
    }, 0);
  }

  private mergeOldData(): void {
    const oldEntires = clone(this.data);
    const arr = this.order.searchText ? this.searchPipe.transform(this.historys, this.order.searchText, this.orderSearchableProperties) : this.historys;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < oldEntires.length; j++) {
        if (arr[i].orderId === oldEntires[j].orderId) {
          if (oldEntires[j].show) {
            arr[i].show = true;
            arr[i].children = oldEntires[j].children;
            this.recursiveMerge(arr[i], 1);
          }
          oldEntires.splice(j, 1);
          break;
        }
      }
    }
    this.data = arr;
  }

  private recursiveMerge(data, count): void {
    data.loading = true;
    const obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    const perviousArr = data.children.filter((value) => {
      return value.order;
    });

    this.coreService.post('order/history', obj).subscribe((res: any) => {
      for (let i = 0; i < res.children.length; i++) {
        if (res.children[i].order) {
          for (let j = 0; j < perviousArr.length; j++) {
            if (res.children[i].order.orderId === perviousArr[j].orderId) {
              if (perviousArr[j].show) {
                res.children[i].order.show = true;
                res.children[i].order.children = perviousArr[j].children;
                this.recursiveMerge(res.children[i].order, ++count);
              }
              perviousArr.splice(j, 1);
              break;
            }
          }
        }
      }
      data.level = count;
      data.children = res.children;
      data.states = res.states;
      data.loading = false;
      this.coreService.calRowWidth(this.historyFilters.current);
    }, () => {
      data.loading = false;
    });
  }

  private mergeOldTaskData(): void {
    const oldEntires = clone(this.data);
    const arr = this.task.searchText ? this.searchPipe.transform(this.taskHistorys, this.task.searchText, this.taskSearchableProperties) : this.taskHistorys;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < oldEntires.length; j++) {
        if (arr[i].taskId === oldEntires[j].taskId) {
          if (oldEntires[j].show) {
            arr[i].show = true;
          }
          oldEntires.splice(j, 1);
          break;
        }
      }
    }
    this.data = arr;
  }

  private mergeOldYadeData(): void {
    const oldEntires = clone(this.data);
    const arr = this.yade.searchText ? this.searchPipe.transform(this.yadeHistorys, this.yade.searchText, this.yadeSearchableProperties) : this.yadeHistorys;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < oldEntires.length; j++) {
        if (arr[i].yadeId === oldEntires[j].yadeId) {
          if (oldEntires[j].show) {
            arr[i].show = true;
          }
          oldEntires.splice(j, 1);
          break;
        }
      }
    }
    this.data = arr;
  }

  private mergeDepData() {
    const oldEntires = clone(this.data);
    const arr = this.deployment.searchText ? this.searchPipe.transform(this.deploymentHistorys, this.deployment.searchText, this.deploymentSearchableProperties) : this.deploymentHistorys;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < oldEntires.length; j++) {
        if (arr[i].commitId === oldEntires[j].commitId) {
          if (oldEntires[j].show) {
            arr[i].show = true;
            arr[i].children = oldEntires[j].children;
          }
          oldEntires.splice(j, 1);
          break;
        }
      }
    }
    this.data = arr;
  }

  private convertDeployRequestBody(obj) {
    obj.limit = parseInt(this.preferences.maxRecords, 10) || 5000;
    obj.timeZone = this.preferences.zone;
    if ((obj.from && typeof obj.from.getMonth === 'function') || (obj.to && typeof obj.to.getMonth === 'function')) {
      delete obj.timeZone;
    }
    if ((obj.from && typeof obj.from.getMonth === 'function')) {
      obj.from = this.coreService.convertTimeToLocalTZ(this.preferences, obj.from);
    }
    if ((obj.to && typeof obj.to.getMonth === 'function')) {
      obj.to = this.coreService.convertTimeToLocalTZ(this.preferences, obj.to);
    }
  }

  /* --------------------------Actions -----------------------*/

  private mergeSubData(): void {
    const oldEntires = clone(this.data);
    const arr = this.submissionHistorys;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < oldEntires.length; j++) {
        if (arr[i].dailyPlanDate === oldEntires[j].dailyPlanDate) {
          if (oldEntires[j].show) {
            arr[i].show = true;
          }
          oldEntires.splice(j, 1);
          break;
        }
      }
    }
    this.data = arr;
  }

  private recursiveExpand(data, count): void {
    data.loading = true;
    const obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      for (let i = 0; i < res.children.length; i++) {
        if (res.children[i].order) {
          res.children[i].order.show = true;
          this.recursiveExpand(res.children[i].order, ++count);
        }
      }
      data.level = count;
      data.children = res.children;
      data.states = res.states;
      data.loading = false;
      this.coreService.calRowWidth(this.historyFilters.current);
    }, () => {
      data.loading = false;
    });
  }

  private saveIgnoreList(flag): void {
    if (this.schedulerIds.selected) {
      if (!flag) {
        let msg;
        this.translate.get('history.message.addedToIgnoreList').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.message.success(msg);
      }
      if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
        if ((!isEmpty(this.jobSearch) && this.historyFilters.type === 'TASK') || (!isEmpty(this.orderSearch) && this.historyFilters.type === 'ORDER')) {
          this.search(true);
        } else {
          this.init(false);
        }
      }
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'IGNORELIST',
        id: this.ignoreListConfigId,
        configurationItem: JSON.stringify(this.savedIgnoreList)
      };
      this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
        this.ignoreListConfigId = res.id;
      });
    }
  }

  /* --------------------------Actions -----------------------*/

  private exportToExcelOrder(): any {
    let controllerId = '', workflow = '', orderId = '', status = '', orderState = '', position = '',
      startTime = '', endTime = '', duration = '', plannedTime = '';
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('history.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('history.label.orderId').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    this.translate.get('history.label.status').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('history.label.orderState').subscribe(translatedValue => {
      orderState = translatedValue;
    });
    this.translate.get('history.label.position').subscribe(translatedValue => {
      position = translatedValue;
    });
    this.translate.get('history.label.plannedTime').subscribe(translatedValue => {
      plannedTime = translatedValue;
    });
    this.translate.get('history.label.startTime').subscribe(translatedValue => {
      startTime = translatedValue;
    });
    this.translate.get('history.label.endTime').subscribe(translatedValue => {
      endTime = translatedValue;
    });
    this.translate.get('history.label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });
    const data = [];
    for (let i = 0; i < this.historys.length; i++) {
      const obj: any = {};
      if (!this.historyFilters.current) {
        obj[controllerId] = this.historys[i].controllerId;
      }
      obj[orderId] = this.historys[i].orderId;
      obj[workflow] = this.historys[i].workflow;
      obj[position] = this.historys[i].position;
      this.translate.get(this.historys[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      this.translate.get(this.historys[i].orderState._text).subscribe(translatedValue => {
        obj[orderState] = translatedValue;
      });
      obj[plannedTime] = this.coreService.stringToDate(this.preferences, this.historys[i].plannedTime);
      obj[startTime] = this.coreService.stringToDate(this.preferences, this.historys[i].startTime);
      obj[endTime] = this.coreService.stringToDate(this.preferences, this.historys[i].endTime);
      obj[duration] = this.coreService.calDuration(this.historys[i].startTime, this.historys[i].endTime);
      data.push(obj);
    }
    return data;
  }

  private exportToExcelTask(): any {
    let controllerId = '', workflow = '', job = '', status = '', position = '', plannedTime = '',
      startTime = '', endTime = '', duration = '', criticality = '', returnCode = '';
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('history.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('history.label.job').subscribe(translatedValue => {
      job = translatedValue;
    });
    this.translate.get('history.label.status').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('history.label.position').subscribe(translatedValue => {
      position = translatedValue;
    });
    this.translate.get('history.label.plannedTime').subscribe(translatedValue => {
      plannedTime = translatedValue;
    });
    this.translate.get('history.label.startTime').subscribe(translatedValue => {
      startTime = translatedValue;
    });
    this.translate.get('history.label.endTime').subscribe(translatedValue => {
      endTime = translatedValue;
    });
    this.translate.get('history.label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });
    this.translate.get('history.label.criticality').subscribe(translatedValue => {
      criticality = translatedValue;
    });
    this.translate.get('history.label.returnCode').subscribe(translatedValue => {
      returnCode = translatedValue;
    });
    const data = [];
    for (let i = 0; i < this.taskHistorys.length; i++) {
      const obj: any = {};
      if (!this.historyFilters.current) {
        obj[controllerId] = this.taskHistorys[i].controllerId;
      }
      obj[job] = this.taskHistorys[i].job;
      obj[workflow] = this.taskHistorys[i].workflow;
      obj[position] = this.taskHistorys[i].position;
      this.translate.get(this.taskHistorys[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      obj[startTime] = this.coreService.stringToDate(this.preferences, this.taskHistorys[i].startTime);
      obj[endTime] = this.coreService.stringToDate(this.preferences, this.taskHistorys[i].endTime);
      obj[duration] = this.coreService.calDuration(this.taskHistorys[i].startTime, this.taskHistorys[i].endTime);
      obj[criticality] = this.taskHistorys[i].criticality;
      obj[returnCode] = this.taskHistorys[i].exitCode;
      data.push(obj);
    }
    return data;
  }

  private exportToExcelYade(): any {
    let controllerId = '', workflow = '', status = '', profileName = '', mandator = '',
      startTime = '', endTime = '', duration = '', operation = '', order = '', total = '', lastErrorMessage = '';
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('fileTransfer.label.status').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('fileTransfer.label.profileName').subscribe(translatedValue => {
      profileName = translatedValue;
    });
    this.translate.get('fileTransfer.label.mandator').subscribe(translatedValue => {
      mandator = translatedValue;
    });
    this.translate.get('fileTransfer.label.operation').subscribe(translatedValue => {
      operation = translatedValue;
    });
    this.translate.get('fileTransfer.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('fileTransfer.label.order').subscribe(translatedValue => {
      order = translatedValue;
    });
    this.translate.get('fileTransfer.label.total').subscribe(translatedValue => {
      total = translatedValue;
    });
    this.translate.get('fileTransfer.label.lastErrorMessage').subscribe(translatedValue => {
      lastErrorMessage = translatedValue;
    });
    this.translate.get('fileTransfer.label.startTime').subscribe(translatedValue => {
      startTime = translatedValue;
    });
    this.translate.get('fileTransfer.label.endTime').subscribe(translatedValue => {
      endTime = translatedValue;
    });
    this.translate.get('history.label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });
    const data = [];
    for (let i = 0; i < this.yadeHistorys.length; i++) {
      const obj: any = {};
      if (!this.historyFilters.current) {
        obj[controllerId] = this.yadeHistorys[i].controllerId;
      }
      this.translate.get(this.yadeHistorys[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      obj[profileName] = this.yadeHistorys[i].profile;
      obj[mandator] = this.yadeHistorys[i].mandator;
      obj[operation] = this.yadeHistorys[i]._operation;
      obj[workflow] = this.yadeHistorys[i].workflowPath;
      obj[order] = this.yadeHistorys[i].orderId;
      obj[total] = this.yadeHistorys[i].numOfFiles;
      obj[lastErrorMessage] = this.yadeHistorys[i].error ? this.yadeHistorys[i].error.message : '';
      obj[startTime] = this.coreService.stringToDate(this.preferences, this.yadeHistorys[i].start);
      obj[endTime] = this.coreService.stringToDate(this.preferences, this.yadeHistorys[i].end);
      obj[duration] = this.coreService.calDuration(this.yadeHistorys[i].start, this.yadeHistorys[i].end);
      data.push(obj);
    }
    return data;
  }

  private exportToExcelDeployment(): any {
    let controllerId = '', state = '', deploymentDate = '', account = '';
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('history.label.deploymentDate').subscribe(translatedValue => {
      deploymentDate = translatedValue;
    });
    this.translate.get('history.label.account').subscribe(translatedValue => {
      account = translatedValue;
    });
    this.translate.get('history.label.state').subscribe(translatedValue => {
      state = translatedValue;
    });
    const data = [];
    for (let i = 0; i < this.deploymentHistorys.length; i++) {
      const obj: any = {};
      if (!this.historyFilters.current) {
        obj[controllerId] = this.deploymentHistorys[i].controllerId;
      }
      obj[deploymentDate] = this.coreService.stringToDate(this.preferences, this.deploymentHistorys[i].deploymentDate);
      obj[account] = this.coreService.stringToDate(this.preferences, this.deploymentHistorys[i].account);
      this.translate.get(this.deploymentHistorys[i].state).subscribe(translatedValue => {
        obj[state] = translatedValue;
      });
      data.push(obj);
    }
    return data;
  }

  private exportToExcelSubmission(): any {
    let controllerId = '', dailyPlanDate = '', orderId = '', workflow = '', submission = '',
      scheduledFor = '', status = '', warnMessages = '', errorMessages = '';
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('history.label.dailyPlanDate').subscribe(translatedValue => {
      dailyPlanDate = translatedValue;
    });
    this.translate.get('history.label.submission').subscribe(translatedValue => {
      submission = translatedValue;
    });
    this.translate.get('history.label.orderId').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    this.translate.get('order.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('order.label.scheduledFor').subscribe(translatedValue => {
      scheduledFor = translatedValue;
    });
    this.translate.get('common.label.status').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('history.label.warnMessages').subscribe(translatedValue => {
      warnMessages = translatedValue;
    });
    this.translate.get('history.label.errorMessages').subscribe(translatedValue => {
      errorMessages = translatedValue;
    });
    let df = this.preferences.dateFormat;
    if (df.match('HH:mm')) {
      df = df.replace('HH:mm', '');
    } else if (df.match('hh:mm')) {
      df = df.replace('hh:mm', '');
    }

    if (df.match(':ss')) {
      df = df.replace(':ss', '');
    }
    if (df.match('A')) {
      df = df.replace('A', '');
    }
    if (df.match('|')) {
      df = df.replace('|', '');
    }
    df = df.trim();
    const data = [];
    for (let i = 0; i < this.submissionHistorys.length; i++) {
      const obj: any = {};
      obj[dailyPlanDate] = this.coreService.getDateByFormat(this.submissionHistorys[i].dailyPlanDate, this.preferences.zone, df);
      data.push(obj);
      for (let j = 0; j < this.submissionHistorys[i].controllers.length; j++) {
        if (!this.historyFilters.current) {
          const obj1: any = {};
          obj1[controllerId] = this.submissionHistorys[i].controllers[j].controllerId;
          data.push(obj1);
        }
        for (let k = 0; k < this.submissionHistorys[i].controllers[j].submissions.length; k++) {
          for (let m = 0; m < this.submissionHistorys[i].controllers[j].submissions[k].warnMessages.length; m++) {
            const obj1: any = {};
            obj1[warnMessages] = this.submissionHistorys[i].controllers[j].submissions[k].warnMessages[m];
            data.push(obj1);
          }
          for (let m = 0; m < this.submissionHistorys[i].controllers[j].submissions[k].errorMessages.length; m++) {
            const obj1: any = {};
            obj1[errorMessages] = this.submissionHistorys[i].controllers[j].submissions[k].errorMessages[m];
            data.push(obj1);
          }
          for (let m = 0; m < this.submissionHistorys[i].controllers[j].submissions[k].orderIds.length; m++) {
            const obj1: any = {};
            obj1[orderId] = this.submissionHistorys[i].controllers[j].submissions[k].orderIds[m].orderId;
            obj1[workflow] = this.submissionHistorys[i].controllers[j].submissions[k].orderIds[m].workflowPath;
            obj1[scheduledFor] = this.coreService.stringToDate(this.preferences, this.submissionHistorys[i].controllers[j].submissions[k].orderIds[m].scheduledFor);
            this.translate.get(this.submissionHistorys[i].controllers[j].submissions[k].orderIds[m].submitted ? 'submitted' : 'notSubmitted').subscribe(translatedValue => {
              obj1[status] = translatedValue;
            });
            data.push(obj1);
          }
        }
      }
    }
    return data;
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if ((args.eventSnapshots[j].eventType === 'HistoryOrderTerminated' || args.eventSnapshots[j].eventType === 'HistoryOrderStarted') && this.isLoading && this.historyFilters.type === 'ORDER') {
          this.init(true);
          break;
        } else if ((args.eventSnapshots[j].eventType === 'HistoryTaskTerminated' || args.eventSnapshots[j].eventType === 'HistoryTaskStarted') && this.isLoading && this.historyFilters.type === 'TASK') {
          this.init(true);
          break;
        } else if (args.eventSnapshots[j].eventType.match(/Deploy/) && this.isLoading && this.historyFilters.type === 'DEPLOYMENT') {
          this.init(true);
          break;
        } else if (this.isLoading && this.historyFilters.type === 'SUBMISSION') {
          // this.init(true);
          break;
        }
      }
    }
  }

  private initConf(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (this.preferences.dateFormat) {
      this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    }
    this.historyFilters = this.coreService.getHistoryTab();
    if (!this.permission.currentController.orders.view && (this.historyFilters.type === 'ORDER' || this.historyFilters.type === 'TASK')) {
      this.historyFilters.type = 'YADE';
    }
    if (!this.permission.joc.fileTransfer.view && this.historyFilters.type === 'YADE') {
      this.historyFilters.type = 'DEPLOYMENT';
    }
    if (!this.permission.currentController.deployments.view && this.historyFilters.type === 'DEPLOYMENT') {
      this.historyFilters.type = 'SUBMISSION';
    }
    this.order = this.historyFilters.order;
    this.task = this.historyFilters.task;
    this.yade = this.historyFilters.yade;
    this.deployment = this.historyFilters.deployment;
    this.submission = this.historyFilters.submission;

    if (!this.order.filter.historyStates) {
      this.order.filter.historyStates = 'ALL';
    }
    if (!this.order.filter.date) {
      this.order.filter.date = 'today';
    }
    if (!this.task.filter.historyStates) {
      this.task.filter.historyStates = 'ALL';
    }
    if (!this.task.filter.date) {
      this.task.filter.date = 'today';
    }
    if (!this.yade.filter.historyStates) {
      this.yade.filter.historyStates = 'ALL';
    }
    if (!this.yade.filter.date) {
      this.yade.filter.date = 'today';
    }
    if (!this.deployment.filter.date) {
      this.deployment.filter.date = 'today';
    }
    if (!this.submission.filter.date) {
      this.submission.filter.date = 'today';
    }
    if (!this.submission.filter.category) {
      this.submission.filter.category = 'ALL';
    }
    if (!(this.historyFilters.current || this.historyFilters.current === false)) {
      this.historyFilters.current = this.preferences.currentController;
    }
    this.historyFilterObj = JSON.parse(this.saveService.historyFilters) || {};
    this.savedHistoryFilter = this.historyFilterObj.order || {};

    if (this.historyFilters.order.selectedView) {
      this.savedHistoryFilter.selected = this.savedHistoryFilter.selected || this.savedHistoryFilter.favorite;
    } else {
      this.savedHistoryFilter.selected = undefined;
    }

    this.savedJobHistoryFilter = this.historyFilterObj.job || {};
    if (this.historyFilters.task.selectedView) {
      this.savedJobHistoryFilter.selected = this.savedJobHistoryFilter.selected || this.savedJobHistoryFilter.favorite;
    } else {
      this.savedJobHistoryFilter.selected = undefined;
    }

    this.savedYadeHistoryFilter = this.historyFilterObj.yade || {};
    if (this.historyFilters.yade.selectedView) {
      this.savedYadeHistoryFilter.selected = this.savedYadeHistoryFilter.selected || this.savedYadeHistoryFilter.favorite;
    } else {
      this.savedYadeHistoryFilter.selected = undefined;
    }

    this.savedDeploymentHistoryFilter = this.historyFilterObj.deployment || {};
    if (this.historyFilters.deployment.selectedView) {
      this.savedDeploymentHistoryFilter.selected = this.savedDeploymentHistoryFilter.selected || this.savedDeploymentHistoryFilter.favorite;
    } else {
      this.savedDeploymentHistoryFilter.selected = undefined;
    }

    this.savedSubmissionHistoryFilter = this.historyFilterObj.submission || {};
    if (this.historyFilters.submission.selectedView) {
      this.savedSubmissionHistoryFilter.selected = this.savedSubmissionHistoryFilter.selected || this.savedSubmissionHistoryFilter.favorite;
    } else {
      this.savedSubmissionHistoryFilter.selected = undefined;
    }

    if (this.schedulerIds.selected && this.permission.joc && this.permission.joc.administration.customization.view) {
      this.checkSharedFilters(this.historyFilters.type);
      this.getIgnoreList();
    } else {
      this.orderHistoryFilterList = [];
      this.jobHistoryFilterList = [];
      this.yadeHistoryFilterList = [];
      this.deploymentHistoryFilterList = [];
      this.submissionHistoryFilterList = [];
      this.loadIgnoreList = true;
      this.loadConfig = true;
      this.init(false);
    }
  }

  private checkCurrentTab(type, res, obj): void {
    if (type === 'ORDER') {
      this.orderHistoryFilterList = res ? res.configurations : [];
    } else if (type === 'TASK') {
      this.jobHistoryFilterList = res ? res.configurations : [];
    } else if (type === 'YADE') {
      this.yadeHistoryFilterList = res ? res.configurations : [];
    } else if (type === 'DEPLOYMENT') {
      this.deploymentHistoryFilterList = res ? res.configurations : [];
    } else if (type === 'SUBMISSION') {
      this.submissionHistoryFilterList = res ? res.configurations : [];
    }
    this.getCustomizations(type, obj);
  }

  private init(flag): void {
    if (this.loadConfig && this.loadIgnoreList) {
      const obj = {
        controllerId: this.historyFilters.current == true ? this.schedulerIds.selected : ''
      };
      if (!flag) {
        this.isLoading = false;
        this.data = [];
      }
      if (this.historyFilters.type === 'ORDER') {
        this.orderHistory(obj, flag);
      } else if (this.historyFilters.type === 'TASK') {
        this.taskHistory(obj, flag);
      } else if (this.historyFilters.type === 'YADE') {
        this.yadeHistory(obj, flag);
      } else if (this.historyFilters.type === 'DEPLOYMENT') {
        this.deploymentHistory(obj, flag);
      } else if (this.historyFilters.type === 'SUBMISSION') {
        this.submissionHistory(obj, flag);
      }
    }
  }

  /* --------------------------Customizations Begin-----------------------*/

  private checkSharedFilters(type): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: type === 'ORDER' ? 'ORDER_HISTORY' : type === 'TASK' ? 'TASK_HISTORY' : type === 'YADE' ? 'YADE_HISTORY' : type === 'DEPLOYMENT' ? 'DEPLOYMENT_HISTORY' : 'SUBMISSION_HISTORY',
      shared: true
    };
    if (this.permission.joc.administration.customization.view) {
      this.coreService.post('configurations', obj).subscribe((res: any) => {
        this.checkCurrentTab(type, res, obj);
      }, () => {
        this.checkCurrentTab(type, null, obj);
      });
    } else {
      this.checkCurrentTab(type, null, obj);
    }
  }

  private getCustomizations(type, obj): void {
    obj.account = this.authService.currentUserData;
    obj.shared = false;
    this.coreService.post('configurations', obj).subscribe((result: any) => {
      if (type === 'ORDER') {
        this.checkOrderCustomization(result);
      } else if (type === 'TASK') {
        this.checkTaskCustomization(result);
      } else if (type === 'YADE') {
        this.checkYadeCustomization(result);
      } else if (type === 'DEPLOYMENT') {
        this.checkDeploymentCustomization(result);
      } else if (type === 'SUBMISSION') {
        this.checkSubmissionCustomization(result);
      } else {
        this.checkYadeCustomization(result);
      }
    }, () => {
      this.savedHistoryFilter.selected = undefined;
      this.loadConfig = true;
      this.init(false);
    });
  }

  private checkOrderCustomization(result): void {
    if (this.orderHistoryFilterList && this.orderHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        const data = [];

        for (let i = 0; i < this.orderHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.orderHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.orderHistoryFilterList[i]);
          }
        }
        this.orderHistoryFilterList = data;
      }
    } else {
      this.orderHistoryFilterList = result.configurations;
    }

    if (this.savedHistoryFilter.selected) {
      let flag = true;
      for (let i = 0; i < this.orderHistoryFilterList.length; i++) {
        if (this.orderHistoryFilterList[i].id == this.savedHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            controllerId: this.orderHistoryFilterList[i].controllerId,
            id: this.orderHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered1.account = this.orderHistoryFilterList[i].account;
            this.init(false);
          });
          break;
        }
      }

      if (flag) {
        this.savedHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init(false);
      }
    } else {
      this.loadConfig = true;
      this.savedHistoryFilter.selected = undefined;
      this.init(false);
    }
  }

  private checkTaskCustomization(result): void {
    if (this.jobHistoryFilterList && this.jobHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        const data = [];

        for (let i = 0; i < this.jobHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.jobHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.jobHistoryFilterList[i]);
          }
        }
        this.jobHistoryFilterList = data;
      }
    } else {
      this.jobHistoryFilterList = result.configurations;
    }

    if (this.savedJobHistoryFilter.selected) {
      let flag = true;
      for (let i = 0; i < this.jobHistoryFilterList.length; i++) {
        if (this.jobHistoryFilterList[i].id == this.savedJobHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            controllerId: this.jobHistoryFilterList[i].controllerId,
            id: this.jobHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered2.account = this.jobHistoryFilterList[i].account;
            this.init(false);
          });
          break;
        }
      }
      if (flag) {
        this.savedJobHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init(false);
      }
    } else {
      this.loadConfig = true;
      this.savedJobHistoryFilter.selected = undefined;
      this.init(false);
    }
  }

  private checkYadeCustomization(result): void {
    if (this.yadeHistoryFilterList && this.yadeHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        const data = [];

        for (let i = 0; i < this.yadeHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id === this.yadeHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.yadeHistoryFilterList[i]);
          }
        }
        this.yadeHistoryFilterList = data;
      }
    } else {
      this.yadeHistoryFilterList = result.configurations;
    }

    if (this.savedYadeHistoryFilter.selected) {
      let flag = true;
      for (let i = 0; i < this.yadeHistoryFilterList.length; i++) {
        if (this.yadeHistoryFilterList[i].id === this.savedYadeHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            controllerId: this.yadeHistoryFilterList[i].controllerId,
            id: this.yadeHistoryFilterList[i].id
          }).subscribe(() => {
            this.loadConfig = true;
            this.selectedFiltered3 = JSON.parse(result.configuration.configurationItem);
            this.selectedFiltered3.account = this.yadeHistoryFilterList[i].account;
            this.init(false);
          });
          break;
        }
      }

      if (flag) {
        this.savedYadeHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init(false);
      }
    } else {
      this.loadConfig = true;
      this.savedYadeHistoryFilter.selected = undefined;
      this.init(false);
    }
  }

  private checkDeploymentCustomization(result): void {
    if (this.deploymentHistoryFilterList && this.deploymentHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        const data = [];

        for (let i = 0; i < this.deploymentHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.deploymentHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.deploymentHistoryFilterList[i]);
          }
        }
        this.deploymentHistoryFilterList = data;
      }
    } else {
      this.deploymentHistoryFilterList = result.configurations;
    }

    if (this.savedDeploymentHistoryFilter.selected) {
      let flag = true;
      for (let i = 0; i < this.deploymentHistoryFilterList.length; i++) {
        if (this.deploymentHistoryFilterList[i].id == this.savedDeploymentHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            controllerId: this.deploymentHistoryFilterList[i].controllerId,
            id: this.deploymentHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered4 = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered4.account = this.deploymentHistoryFilterList[i].account;
            this.init(false);
          });
          break;
        }
      }
      if (flag) {
        this.savedDeploymentHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init(false);
      }
    } else {
      this.loadConfig = true;
      this.savedDeploymentHistoryFilter.selected = undefined;
      this.init(false);
    }
  }

  private checkSubmissionCustomization(result): void {
    if (this.submissionHistoryFilterList && this.submissionHistoryFilterList.length > 0) {
      if (result.configurations && result.configurations.length > 0) {
        const data = [];

        for (let i = 0; i < this.submissionHistoryFilterList.length; i++) {
          let flag = true;
          for (let j = 0; j < result.configurations.length; j++) {
            if (result.configurations[j].id == this.submissionHistoryFilterList[i].id) {
              flag = false;
              result.configurations.splice(j, 1);
              break;
            }
          }
          if (flag) {
            data.push(this.submissionHistoryFilterList[i]);
          }
        }
        this.submissionHistoryFilterList = data;
      }
    } else {
      this.submissionHistoryFilterList = result.configurations;
    }

    if (this.savedSubmissionHistoryFilter.selected) {
      let flag = true;
      for (let i = 0; i < this.submissionHistoryFilterList.length; i++) {
        if (this.submissionHistoryFilterList[i].id == this.savedSubmissionHistoryFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            controllerId: this.submissionHistoryFilterList[i].controllerId,
            id: this.submissionHistoryFilterList[i].id
          }).subscribe((conf: any) => {
            this.loadConfig = true;
            this.selectedFiltered5 = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered5.account = this.submissionHistoryFilterList[i].account;
            this.init(false);
          });
          break;
        }
      }
      if (flag) {
        this.savedSubmissionHistoryFilter.selected = undefined;
        this.loadConfig = true;
        this.init(false);
      }
    } else {
      this.loadConfig = true;
      this.savedSubmissionHistoryFilter.selected = undefined;
      this.init(false);
    }
  }

  private getIgnoreList(): void {
    if (this.schedulerIds.selected) {
      const configObj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'IGNORELIST'
      };
      this.coreService.post('configurations', configObj).subscribe((result: any) => {
        if (result.configurations && result.configurations.length > 0) {
          this.ignoreListConfigId = result.configurations[0].id;
          this.coreService.post('configuration', {
            controllerId: this.schedulerIds.selected,
            id: result.configurations[0].id
          }).subscribe((result1: any) => {
            if (result1.configuration && result1.configuration.configurationItem) {
              this.savedIgnoreList = JSON.parse(result1.configuration.configurationItem) || {};
            }
            this.loadIgnoreList = true;
            this.init(false);
          }, () => {
            this.loadIgnoreList = true;
            this.init(false);
          });
        } else {
          this.loadIgnoreList = true;
          this.init(false);
        }
      }, () => {
        this.loadIgnoreList = true;
        this.init(false);
      });
    }
  }

  private setDuration(histories): any {
    if (histories.history) {
      histories.history.forEach((history, index) => {
        if (history.startTime && history.endTime) {
          histories.history[index].duration = new Date(history.endTime).getTime() - new Date(history.startTime).getTime();
        }
      });
    }
    return histories.history || [];
  }

  private editFilter(filter): void {
    if (this.schedulerIds.selected) {
      let filterObj: any = {};
      this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
        filterObj = JSON.parse(conf.configuration.configurationItem);
        filterObj.shared = filter.shared;
        filterObj.id = filter.id;

        const obj: any = {};
        obj.permission = this.permission;
        obj.schedulerId = this.schedulerIds.selected;
        if (this.historyFilters.type === 'ORDER') {
          obj.allFilter = this.orderHistoryFilterList;
        } else if (this.historyFilters.type === 'TASK') {
          obj.allFilter = this.jobHistoryFilterList;
        } else if (this.historyFilters.type === 'YADE') {
          obj.allFilter = this.yadeHistoryFilterList;
        } else if (this.historyFilters.type === 'DEPLOYMENT') {
          obj.allFilter = this.deploymentHistoryFilterList;
        } else if (this.historyFilters.type === 'SUBMISSION') {
          obj.allFilter = this.submissionHistoryFilterList;
        }
        obj.filter = filterObj;
        obj.edit = true;
        obj.type = this.historyFilters.type;

        this.modal.create({
          nzTitle: undefined,
          nzContent: FilterModalComponent,
          nzClassName: 'lg',
          nzComponentParams: obj,
          nzFooter: null,
          nzClosable: false
        });
      });
    }
  }

  private copyFilter(filter: any): void {
    if (this.schedulerIds.selected) {
      let filterObj: any = {};
      this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
        filterObj = JSON.parse(conf.configuration.configurationItem);
        filterObj.shared = filter.shared;
        if (this.historyFilters.type === 'ORDER') {
          filterObj.name = this.coreService.checkCopyName(this.orderHistoryFilterList, filter.name);
        } else if (this.historyFilters.type === 'TASK') {
          filterObj.name = this.coreService.checkCopyName(this.jobHistoryFilterList, filter.name);
        } else if (this.historyFilters.type === 'YADE') {
          filterObj.name = this.coreService.checkCopyName(this.yadeHistoryFilterList, filter.name);
        } else if (this.historyFilters.type === 'DEPLOYMENT') {
          filterObj.name = this.coreService.checkCopyName(this.deploymentHistoryFilterList, filter.name);
        } else if (this.historyFilters.type === 'SUBMISSION') {
          filterObj.name = this.coreService.checkCopyName(this.submissionHistoryFilterList, filter.name);
        }

        const obj: any = {};
        obj.permission = this.permission;
        obj.schedulerId = this.schedulerIds.selected;
        obj.type = this.historyFilters.type;
        if (this.historyFilters.type === 'ORDER') {
          obj.allFilter = this.orderHistoryFilterList;
        } else if (this.historyFilters.type === 'TASK') {
          obj.allFilter = this.jobHistoryFilterList;
        } else if (this.historyFilters.type === 'YADE') {
          obj.allFilter = this.yadeHistoryFilterList;
        } else if (this.historyFilters.type === 'DEPLOYMENT') {
          obj.allFilter = this.deploymentHistoryFilterList;
        } else if (this.historyFilters.type === 'SUBMISSION') {
          obj.allFilter = this.submissionHistoryFilterList;
        }
        obj.filter = filterObj;
        this.modal.create({
          nzTitle: undefined,
          nzContent: FilterModalComponent,
          nzClassName: 'lg',
          nzComponentParams: obj,
          nzFooter: null,
          nzClosable: false
        });
      });
    }
  }

  /* --------------------------Customizations End-----------------------*/
}
