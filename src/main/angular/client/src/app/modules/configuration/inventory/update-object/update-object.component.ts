import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {sortBy} from 'underscore';
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from '../../../../models/enums';
import {WorkflowService} from '../../../../services/workflow.service';
import {AuthService} from '../../../../components/guard';

@Component({
  selector: 'app-update-object',
  templateUrl: './update-object.component.html'
})
export class UpdateObjectComponent implements OnInit {
  @Input() data: any;
  @Input() type: string;
  @Input() controllerId: any;

  preferences: any = {};
  schedulerIds: any = {};
  comments: any = {};
  selectedSchedulerIds = [];
  zones = [];
  agents = [];
  workflowTree = [];
  jobResourcesTree = [];
  documentationTree = [];
  step = 1;
  submitted = false;
  dateFormat: any;
  object: any = {};

  constructor(private coreService: CoreService, public activeModal: NzModalRef,
              private workflowService: WorkflowService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.comments.radio = 'predefined';
    this.selectedSchedulerIds.push(this.controllerId);
    this.init();
  }

  private init(): void {
    if (this.type === InventoryObject.WORKFLOW || this.type === 'FILEORDERSOURCE') {
      this.zones = this.coreService.getTimeZoneList();
    } else if (this.type === 'CALENDAR') {
      this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    } else if (this.type === 'NOTICEBOARD') {
      this.object = {
        endOfLifeMsg: '$js7EpochMilli + ',
        units: 'Milliseconds'
      };
    }
    if (this.jobResourcesTree.length === 0 && this.type === InventoryObject.WORKFLOW) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.JOBRESOURCE]
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, false);
        this.getJobResources();
      });
    }
    if (this.workflowTree.length === 0 && (this.type === 'FILEORDERSOURCE' || this.type === 'SCHEDULE')) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.WORKFLOW]
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.documentationTree.length === 0) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.agents.length === 0 && this.type === 'FILEORDERSOURCE') {
      this.coreService.post('agents/names', {controllerId: this.controllerId}).subscribe((res: any) => {
        this.agents = res.agentNames ? res.agentNames.sort() : [];
      });
    }
  }

  private getJobResources(): void {
    this.coreService.post('inventory/read/folder', {
      path: '/',
      recursive: true,
      objectTypes: [InventoryObject.JOBRESOURCE]
    }).subscribe((res: any) => {
      let map = new Map();
      res.jobResources = sortBy(res.jobResources, 'name');
      res.jobResources.forEach((item) => {
        const path = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        const obj = {
          title: item.name,
          path: item.path,
          key: item.name,
          type: item.objectType,
          isLeaf: true
        };
        if (map.has(path)) {
          const arr = map.get(path);
          arr.push(obj);
          map.set(path, arr);
        } else {
          map.set(path, [obj]);
        }
      });
      this.jobResourcesTree[0].expanded = true;
      this.updateTreeRecursive(this.jobResourcesTree, map);
      this.jobResourcesTree = [...this.jobResourcesTree];
    });
  }

  private updateTreeRecursive(nodes, map): void {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].path && map.has(nodes[i].path)) {
        nodes[i].children = map.get(nodes[i].path).concat(nodes[i].children || []);
      }
      if (nodes[i].children) {
        this.updateTreeRecursive(nodes[i].children, map);
      }
    }
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  loadData(node, type, $event): void {
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
        this.updateList(node, type);
      }
    } else {
      if (type === 'DOCUMENTATION') {
        if (node.key && !node.key.match('/')) {
          if (this.object.documentationName !== node.key) {
            this.object.documentationName = node.key;
          }
        }
      } else if (type === 'WORKFLOW'){
        if (node.key && !node.key.match('/')) {
          if (this.object.workflowName !== node.key) {
            this.object.workflowName = node.key;
          }
        }
      }
    }
  }

  updateList(node, type): void {
    let obj: any = {
      path: node.key,
      objectTypes: [type]
    };
    if (type === 'DOCUMENTATION') {
      obj = {
        folders: [{folder: node.key, recursive: false}],
        onlyWithAssignReference: true
      };
    }
    const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      let data;
      if (type === InventoryObject.WORKFLOW) {
        data = res.workflows;
      } else if (type === 'DOCUMENTATION') {
        data = res.documentations;
      }
      data = sortBy(data, 'name');
      for (let i = 0; i < data.length; i++) {
        const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
        data[i].title = data[i].assignReference || data[i].name;
        data[i].path = path;
        data[i].key = data[i].assignReference || data[i].name;
        data[i].type = type;
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
      if (type === 'DOCUMENTATION') {
        this.documentationTree = [...this.documentationTree];
      } else if (type === InventoryObject.WORKFLOW) {
        this.workflowTree = [...this.workflowTree];
      } else if (type === InventoryObject.JOBRESOURCE) {
        this.jobResourcesTree = [...this.jobResourcesTree];
      }
    });
  }

  changeExp($event, type: string): void {
    if (type === 'toNotice') {
      this.object.postOrderToNoticeId = $event;
    } else {
      this.object.expectOrderToNoticeId = $event;
    }
  }

  changeUnit($event): void {
    if ($event === 'HH:MM:SS') {
      if (!isNaN(this.object.endOfLife)) {
        this.object.endOfLife = '';
      }
    } else {
      if (isNaN(this.object.endOfLife)) {
        this.object.endOfLife = '';
      }
    }
  }

  deploy(isDeploy): void {
    this.submitted = true;
    const obj: any = {};
    if (isDeploy) {
      obj.controllerIds = this.selectedSchedulerIds;
      obj.store = {
        draftConfigurations: []
      };
    } else {
      obj.update = [];
    }
    if (this.comments.comment) {
      obj.auditLog = this.comments;
    }
    this.data.forEach((item) => {
      const configuration = {
        path: item.path,
        objectType: this.type
      };
      if (isDeploy) {
        obj.store.draftConfigurations.push({configuration});
      } else {
        obj.update.push(configuration);
      }
    });
    const URL = !isDeploy ? 'inventory/release' : 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        this.activeModal.close('ok');
      }, complete: () => {
        this.submitted = false;
      }
    });
  }

  updateObject(data, cb): void {
    this.coreService.post('inventory/store', {
      configuration: data.configuration,
      valid: true,
      id: data.id,
      objectType: this.type
    }).subscribe({
      next: () => {
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

  private getConvertedValue(value): any {
    let str = value;
    if (this.object.units === 'Seconds') {
      str = str + ' * 1000';
    } else if (this.object.units === 'Minutes') {
      str = str + ' * 60 * 1000';
    } else if (this.object.units === 'Hours') {
      str = str + ' * 60 * 60 * 1000';
    } else if (this.object.units === 'Days') {
      str = str + ' * 24 * 60 * 60 * 1000';
    } else if (this.object.units === 'HH:MM:SS') {
      const arr = value.split(':');
      let ms = 0;
      for (const i in arr) {
        if (i === '0') {
          ms += (arr[i] * 60 * 60 * 1000);
        } else if (i === '1') {
          ms += (arr[i] * 60 * 1000);
        } else {
          ms += (arr[i] * 1000);
        }
      }
      str = ms;
    }
    return str;
  }

  private updateProperties(obj, object): any {
    if (object.title) {
      obj.title = object.title;
    }
    if (object.documentationName) {
      obj.documentationName = object.documentationName;
    }
    if (object.workflowName) {
      if (this.type === 'SCHEDULE' || this.type === 'FILEORDERSOURCE') {
        obj.workflowName = object.workflowName;
      }
    }
    if (object.timeZone) {
      if (this.type === 'WORKFLOW' || this.type === 'FILEORDERSOURCE') {
        obj.timeZone = object.timeZone;
      }
    }
    if (this.type === 'WORKFLOW') {
      if (object.jobResourceNames) {
        obj.jobResourceNames = object.jobResourceNames;
      }
    } else if (this.type === 'FILEORDERSOURCE') {
      if (object.agentName) {
        obj.agentName = object.agentName;
      }
      if (object.directoryExpr) {
        obj.directoryExpr = object.directoryExpr;
      }
      if (object.pattern) {
        obj.pattern = object.pattern;
      }
      if (object.delay) {
        obj.delay = object.delay;
      }
    } else if (this.type === 'NOTICEBOARD') {
      if (object.endOfLife) {
        obj.endOfLife = object.endOfLifeMsg + this.getConvertedValue(object.endOfLife);
      }
      if (object.postOrderToNoticeId) {
        obj.postOrderToNoticeId = object.postOrderToNoticeId;
      }
      if (object.expectOrderToNoticeId) {
        obj.expectOrderToNoticeId = object.expectOrderToNoticeId;
      }
    } else if (this.type === 'LOCK') {
      if (object.limit || object.limit === 0) {
        obj.limit = object.limit;
      }
    } else if (this.type === 'SCHEDULE') {
      if (object.planOrderAutomatically || object.planOrderAutomatically === false) {
        obj.planOrderAutomatically = object.planOrderAutomatically;
      }
      if (object.submitOrderToControllerWhenPlanned || object.submitOrderToControllerWhenPlanned === false) {
        obj.submitOrderToControllerWhenPlanned = object.submitOrderToControllerWhenPlanned;
      }
    } else if (this.type === 'CALENDAR') {
      if (object.type) {
        obj.type = object.type;
      }
      if (object.from) {
        obj.from = object.from;
      }
      if (object.to) {
        obj.to = object.to;
      }
    }
    return obj;
  }

  private findAndUpdate(cb): void {
    this.data.forEach((item, index) => {
      this.coreService.post('inventory/read/configuration', {
        id: item.id
      }).subscribe((res: any) => {
        res.configuration = this.updateProperties(res.configuration, this.object);
        this.updateObject(res, index === this.data.length - 1 ? cb : null);
      });
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.findAndUpdate(() => {
      this.step = 2;
      this.submitted = false;
    });
  }
}
