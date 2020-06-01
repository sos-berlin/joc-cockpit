import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import * as moment from 'moment';
import * as _ from 'underscore';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader } from 'ng2-file-upload';
import { ToasterService } from 'angular2-toaster';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
declare const $;
@Component({
  selector: 'app-deploy-draft-modal',
  templateUrl: './deploy-dialog.html'
})
export class DeployComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() schedulerIds;
  @Input() preferences;
  selectedSchedulerIds = [];
  deployables: any = [{key: 1, recursivelyDeploy: false, children: [], isExpanded: true}];
  isRecursive = true;
  path;
  update: any = [];
  delete: any = [];
  isExpandAll = false;
  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private toasterService: ToasterService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildDeployablesTree();
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  deploy() {
    const ids = [];
    this.selectedSchedulerIds.forEach(element => {
      ids.push({jobschedulerId: element});
    });
    const obj = {
      schedulers: ids,
      update: this.update,
      delete: this.delete
    };
    this.coreService.post('publish/deploy', obj).subscribe((res: any) => {
      this.activeModal.close('ok');
    }, (error) => {
      this.toasterService.pop('error', error.code, error.message);
    });
  }

  createPath(data, path, action) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.createPath(z, path, action);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'update') {
        this.update.push(_.clone(str));
      }
    }
  }

  deletePath(data, path, action) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.deletePath(z, path, action);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'update') {
        for (let i = 0; i < this.update.length; i++) {
          if (str === this.update[i]) {
            this.update.splice(i, 1);
          }
        }
      }
    }
  }

  checkRecursiveOrder(node) {
    node.recursivelyDeploy = !node.recursivelyDeploy;
    this.updateTree();
    if (this.isRecursive && node.recursivelyDeploy) {
      this.handleRecursivelyRecursion(node);
    } else if (this.isRecursive && !node.recursivelyDeploy) {
      this.unCheckedHandleRecursivelyRecursion(node);
    } else if (!this.isRecursive && node.recursivelyDeploy && !node.type) {
      this.handleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && !node.type) {
      this.unCheckedHandleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && node.type) {
      this.uncheckedParentFolder(node);
      this.path = '';
      this.deletePath(node, this.path, node.action);
    } else if (!this.isRecursive && node.recursivelyDeploy && node.type) {
      this.path = '';
      this.createPath(node, this.path, node.action);
    }
  }

  uncheckedParentFolder(node) {
    this.treeCtrl.treeModel.setFocusedNode(node);
    const a = this.treeCtrl.treeModel.getFocusedNode().parent.data;
    this.getParent(a).recursivelyDeploy = false;
  }

  getParent(node) {
    const x = this.treeCtrl.getTreeNodeByKey(node.key);
    if (x.getParentNode()) {
      const a = x.getParentNode().origin;
      return a;
    } else {
      return undefined;
    }
  }

  handleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        if (data.children[i].children[index].type) {
          data.children[i].children[index].recursivelyDeploy = true;
          this.path = '';
          this.createPath(data.children[i].children[index], this.path, data.children[i].children[index].action)
        }
      }
    }
  }

  unCheckedHandleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        data.children[i].children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[i].children[index], this.path, data.children[i].children[index].action)
      }
    }
  }

  handleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = true;
        this.path = '';
        this.createPath(data.children[index], this.path, data.children[index].action);

      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = true;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j <data.children.length; j++) {
          this.handleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  unCheckedHandleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[index], this.path, data.children[index].action)
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = false;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j < data.children.length; j++) {
          this.unCheckedHandleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  expandAll(): void {
    this.isExpandAll = true;
    this.updateTree();
  }

  // Collapse all Node
  collapseAll() {
    this.isExpandAll = false;
    for (let i = 0; i < this.deployables.length; i++) {
      const a = this.treeCtrl.getTreeNodeByKey(this.deployables[i].key)
      this.openFolder(a);
      if (this.deployables[i].children && this.deployables[i].children.length > 0) {
          this.expandCollapseRec(this.deployables[i].children, false);
      }
    }
  }

  private expandCollapseRec(node, flag) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0 && !node[i].type) {
        const a = this.treeCtrl.getTreeNodeByKey(node[i].key);
        this.openFolder(a);
        this.expandCollapseRec(node[i].children, flag);
      }
    }
  }

  updateTree() {
    this.deployables = [...this.deployables];
  }


  buildDeployablesTree() {
    this.deployables[0].children = [
      {
        name: 'Workflows', key: 2, path: '/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
          {
            name: 'w1', key: 3, type: 'WORKFLOW', isSigned: true, recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        name: 'Job Classes', key: 4, path: '/JobClasses', object: 'JOBCLASS', isExpanded: true, children: [
          {
            name: 'j_c1', key: 5, type: 'JOBCLASS', isSigned: false, recursivelyDeploy: false, action: 'update'
          }, {
            name: 'j_c2', key: 6, type: 'JOBCLASS', isSigned: true, recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        name: 'Junctions', key: 7, path: '/Junctions', object: 'JUNCTION', isExpanded: true, children: [
          {
            name: 'j1', key: 8, type: 'JUNCTION', recursivelyDeploy: false, action: 'update'
          }, {
            name: 'j2', key: 9, type: 'JUNCTION', recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        name: 'Orders', key: 10, path: '/Orders', object: 'ORDER', isExpanded: true, children: [
          {
            name: 'order_1', key: 11, type: 'ORDER', isSigned: false, recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        name: 'Agent Clusters', key: 12, path: '/Agent_Clusters', object: 'AGENTCLUSTER', isExpanded: true, children: [
          {
            name: 'agent_1', key: 13, type: 'AGENTCLUSTER', isSigned: false, recursivelyDeploy: false, action: 'update'
          }
        ]
      },
      {name: 'Locks', key: 14, object: 'LOCK', children: []},
      {
        name: 'Calendars', key: 15, path: '/Calendars', object: 'CALENDAR', children: []
      }, {
        name: 'sos', key: 16, path: '/sos', recursivelyDeploy: false, children: [
          {
            name: 'Workflows', key: 17, path: '/sos/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
              {
                name: 'w1', key: 18, type: 'WORKFLOW', recursivelyDeploy: false, isSigned: true, action: 'update'
              }
            ]
          }
        ],
      }
    ];
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-set-version-modal',
  templateUrl: './setVersion-dialog.html'
})
export class SetVersionComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() preferences;
  deployables = [{ key: 1, children: [], isExpanded: true}];
  version = {type: 'setOneVersion', name: ''};
  isRecursive = true;
  path;
  isExpandAll = true;
  delete: any = [];
  update: any = [];
  prevVersion;
  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildDeployablesTree();
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  setVersion() {
    if (this.update.length > 0) {
      const obj: any = {
        jsObjects: this.update
      };
      if (this.version.type === 'setSeparateVersion') {
        this.coreService.post('publish/set_versions', obj).subscribe((res: any) => {
          this.activeModal.close('ok');
        }, (error) => {

        });
      } else {
        obj.version = this.version.name;
        this.coreService.post('publish/set_version', obj).subscribe((res: any) => {
          this.activeModal.close('ok');
        }, (error) => {

        });
      }
    } else {
      console.log('add Version');

    }
  }

  cancelSetVersion(data) {
    if (this.prevVersion) {
      data.version = _.clone(this.prevVersion);
    }
    this.prevVersion = undefined;
    data.setVersion = false;
  }

  deleteSetVersion(data) {
    this.path = '';
    this.deletePath(data, this.path, this.version.type);
    delete data['version'];
  }

  editVersion(data) {
    if (data.version) {
      this.prevVersion = _.clone(data.version);
    }
  }

  applySetVersion(data) {
    this.path = '';
    this.createPath(data, this.path, this.version.type, data.version);
    data.setVersion = false;
  }

  createPath(data, path, action, version) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.createPath(z, path, action, version);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'setSeparateVersion') {
        const obj = {
          version: version,
          path: _.clone(str)
        };
        this.update.push(obj);
      } else {
        this.update.push(_.clone(str));
      }
    }
    console.log(this.update);

  }

  deletePath(data, path, action) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.deletePath(z, path, action);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'setSeparateVersion') {
        for (let i = 0; i < this.update.length; i++) {
          if (str === this.update[i].path) {
            this.update.splice(i, 1);
          }
        }
      }
    }
  }

  checkRecursiveOrder(node) {
    node.recursivelyDeploy = !node.recursivelyDeploy;
    this.updateTree();
    if (this.isRecursive && node.recursivelyDeploy) {
      this.handleRecursivelyRecursion(node);
    } else if (this.isRecursive && !node.recursivelyDeploy) {
      this.unCheckedHandleRecursivelyRecursion(node);
    } else if (!this.isRecursive && node.recursivelyDeploy && !node.type) {
      this.handleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && !node.type) {
      this.unCheckedHandleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && node.type) {
      this.uncheckedParentFolder(node);
      this.path = '';
      this.deletePath(node, this.path, node.action);
    } else if (!this.isRecursive && node.recursivelyDeploy && node.type) {
      this.path = '';
      this.createPath(node, this.path, node.action, undefined);
    }
  }

  uncheckedParentFolder(node) {
    this.treeCtrl.treeModel.setFocusedNode(node);
    const a = this.treeCtrl.treeModel.getFocusedNode().parent.data;
    this.getParent(a).recursivelyDeploy = false;
  }

  getParent(node) {
    const x = this.treeCtrl.getTreeNodeByKey(node.key);
    if (x.getParentNode()) {
      const a = x.getParentNode().origin;
      return a;
    } else {
      return undefined;
    }
  }

  handleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        if (data.children[i].children[index].type) {
          data.children[i].children[index].recursivelyDeploy = true;
          this.path = '';
          this.createPath(data.children[i].children[index], this.path, data.children[i].children[index].action, undefined)
        }
      }
    }
  }

  unCheckedHandleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        data.children[i].children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[i].children[index], this.path, data.children[i].children[index].action)
      }
    }
  }

  handleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = true;
        this.path= '';
        this.createPath(data.children[index], this.path, data.children[index].action, undefined);
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = true;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j <data.children.length; j++) {
          this.handleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  unCheckedHandleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[index], this.path, data.children[index].action);
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = false;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j < data.children.length; j++) {
          this.unCheckedHandleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  setIndividualVersion(data) {
    data.setVersion = true;
  }

  expandAll(): void {
    this.isExpandAll = true;
    this.updateTree();
  }

  // Collapse all Node
  collapseAll() {
    this.isExpandAll = false;
    for (let i = 0; i < this.deployables.length; i++) {
      const a = this.treeCtrl.getTreeNodeByKey(this.deployables[i].key)
      this.openFolder(a);
      if (this.deployables[i].children && this.deployables[i].children.length > 0) {
          this.expandCollapseRec(this.deployables[i].children, false);
      }
    }
  }

  private expandCollapseRec(node, flag) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0 && !node[i].type) {
        const a = this.treeCtrl.getTreeNodeByKey(node[i].key);
        this.openFolder(a);
        this.expandCollapseRec(node[i].children, flag);
      }
    }
  }


  updateTree() {
    this.deployables = [...this.deployables];
  }

  buildDeployablesTree() {
    this.deployables[0].children = [
      {
        key: 2, name: 'Workflows', path: '/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
          {
            key: 3, name: 'w1', type: 'WORKFLOW', recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        key: 4, name: 'Job Classes', path: '/JobClasses', object: 'JOBCLASS', isExpanded: true, children: [
          {
            key: 5, name: 'j_c1', type: 'JOBCLASS', recursivelyDeploy: false, action: 'update'
          }, {
            key: 6, name: 'j_c2', type: 'JOBCLASS', recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        key: 7, name: 'Junctions', path: '/Junctions', object: 'JUNCTION', isExpanded: true, children: [
          {
            key: 8, name: 'j1', type: 'JUNCTION', recursivelyDeploy: false, action: 'update'
          }, {
            key: 9, name: 'j2', type: 'JUNCTION', recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        key: 10, name: 'Orders', path: '/Orders', object: 'ORDER', isExpanded: true, children: [
          {
            key: 11, name: 'order_1', type: 'ORDER', recursivelyDeploy: false, action: 'update'
          }
        ]
      }, {
        key: 12, name: 'Agent Clusters', path: '/Agent_Clusters', object: 'AGENTCLUSTER', isExpanded: true, children: [
          {
            key: 13, name: 'agent_1', type: 'AGENTCLUSTER', recursivelyDeploy: false, action: 'update'
          }
        ]
      },
      {key: 14, name: 'Locks', object: 'LOCK', children: []},
      {
        key: 15, name: 'Calendars', path: '/Calendars', object: 'CALENDAR', children: []
      }, {
        key: 16, name: 'sos', path: '/sos', children: [
          {
            key: 17, name: 'Workflows', path: '/sos/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
              {
                key: 18, name: 'w1', type: 'WORKFLOW', recursivelyDeploy: false, action: 'update'
              }
            ]
          }
        ],
      }
    ];
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-dialog.html'
})
export class ExportComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() schedulerIds;
  @Input() preferences;
  selectedSchedulerIds = [];
  deployables = [{key:1, children: []}];
  isRecursive = false;
  showUnSigned = true;
  showSigned = true;
  path;
  jsObjects = [];
  isExpandAll= true;
  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private authService: AuthService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildDeployablesTree();
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  export() {
    if (this.jsObjects.length > 0) {
      const obj: any = {
        jsObjects: this.jsObjects
      };
      this.coreService.post('publish/export', obj).subscribe((res: any) => {
        this.activeModal.close('ok');
      }, (error) => {

      });
    }
  }

  subSingleExport(data) {
    this.path = '';
    this.deletePath(data, this.path);
    delete data['version'];
  }

  addSingleExport(data) {
    this.path = '';
    this.createPath(data, this.path);
    data.setVersion = false;
  }

  checkRecursiveOrder(node) {
    node.recursivelyDeploy = !node.recursivelyDeploy;
    this.updateTree();
    if (node.recursivelyDeploy && !node.object && !node.type) {
      this.handleRecursivelyRecursion(node);
    } else if (!node.recursivelyDeploy && !node.object && !node.type) {
      this.unCheckedHandleRecursivelyRecursion(node);
    } else if (node.recursivelyDeploy && node.type) {
      this.addSingleExport(node);
    }  else if (!node.recursivelyDeploy && node.type) {
      this.subSingleExport(node);
    }
  }

  getParent(node) {
    const x = this.treeCtrl.getTreeNodeByKey(node.key);
    if (x.getParentNode()) {
      const a = x.getParentNode().origin;
      return a;
    } else {
      return undefined;
    }
  }

  createPath(data, path) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.createPath(z, path);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      this.jsObjects.push(_.clone(str));
    }
    console.log(this.jsObjects);
  }

  handleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = true;
        this.path = '';
        this.createPath(data.children[index], this.path);
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = true;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j < data.children.length; j++) {
          this.handleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  deletePath(data, path) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.deletePath(z, path);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      for (let i = 0; i < this.jsObjects.length; i++) {
        if (str === this.jsObjects[i]) {
          this.jsObjects.splice(i, 1);
          break;
        }
      }
    }
  }

  unCheckedHandleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[index], this.path);
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = false;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j < data.children.length; j++) {
          this.unCheckedHandleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  changeRecursiveOrder() {
    this.isRecursive = !this.isRecursive;
  }

  expandAll(): void {
    this.isExpandAll = true;
    this.updateTree();
  }

  // Collapse all Node
  collapseAll() {
    this.isExpandAll = false;
    for (let i = 0; i < this.deployables.length; i++) {
      const a = this.treeCtrl.getTreeNodeByKey(this.deployables[i].key)
      this.openFolder(a);
      if (this.deployables[i].children && this.deployables[i].children.length > 0) {
          this.expandCollapseRec(this.deployables[i].children, false);
      }
    }
  }

  private expandCollapseRec(node, flag) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0 && !node[i].type) {
        const a = this.treeCtrl.getTreeNodeByKey(node[i].key);
        this.openFolder(a);
        this.expandCollapseRec(node[i].children, flag);
      }
    }
  }

  updateTree() {
    this.deployables = [...this.deployables];
  }

  buildDeployablesTree() {
    this.deployables[0].children = [
      {
        key: 2, name: 'Workflows', path: '/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
          {
            key: 3, name: 'w1', type: 'WORKFLOW', isSigned: true
          }
        ]
      }, {
        key: 4, name: 'Job Classes', path: '/JobClasses', object: 'JOBCLASS', isExpanded: true, children: [
          {
            key: 5, name: 'j_c1', type: 'JOBCLASS', isSigned: false
          }, {
            key: 6, name: 'j_c2', type: 'JOBCLASS', isSigned: true
          }
        ]
      }, {
        key: 7, name: 'Junctions', path: '/Junctions', object: 'JUNCTION', isExpanded: true, children: [
          {
            key: 8, name: 'j1', type: 'JUNCTION'
          }, {
            key: 9, name: 'j2', type: 'JUNCTION'
          }
        ]
      }, {
        key: 10, name: 'Orders', path: '/Orders', object: 'ORDER', isExpanded: true, children: [
          {
            key: 11, name: 'order_1', type: 'ORDER', isSigned: false
          }
        ]
      }, {
        key: 12, name: 'Agent Clusters', path: '/Agent_Clusters', object: 'AGENTCLUSTER', isExpanded: true, children: [
          {
            key: 13, name: 'agent_1', type: 'AGENTCLUSTER', isSigned: false
          }
        ]
      },
      {key: 14, name: 'Locks', object: 'LOCK', children: []},
      {
        key: 15, name: 'Calendars', path: '/Calendars', object: 'CALENDAR', children: []
      }, {
        key: 16, name: 'sos', path: '/sos', children: [
          {
            key: 17, name: 'Workflows', path: '/sos/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
              {
                key: 18, name: 'w1', type: 'WORKFLOW', isSigned: true
              }
            ]
          }
        ],
      }
    ];
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-import-modal-content',
  templateUrl: './import-dialog.html'
})
export class ImportWorkflowModalComponent implements OnInit {
  uploader: FileUploader;
  fileLoading = false;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  uploadData: any;
  constructor(
    public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public toasterService: ToasterService,
  ) {
    this.uploader = new FileUploader({
      url: ''
    });
  }

  ngOnInit() {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }

    this.uploader.onBeforeUploadItem = (item: any) => {

    };

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      if (response.error) {
        this.toasterService.pop('error', response.error.code, response.error.message);
      }
    };
  }

  // import xml
  onFileSelected(event: any): void {
    const item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    this.fileLoading = false;
    const reader = new FileReader();
    reader.readAsText(item, 'UTF-8');
    reader.onload = (_event: any) => {
      this.uploadData = _event.target.result;
      if (this.uploadData !== undefined && this.uploadData !== '') {
      } else {
        this.toasterService.pop('error', 'Invalid xml file or file must be empty');
      }
    };
  }

  // submit data
  onSubmit() {
    this.activeModal.close({uploadData: this.uploadData});
  }

  cancel() {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-preview-calendar-template',
  template: '<div id="full-calendar"></div>',
})
export class PreviewCalendarComponent implements OnInit, OnDestroy {
  @Input() schedulerId: any;
  calendar: any;
  planItems = [];
  tempList = [];
  calendarTitle: number;
  toDate: any;
  subscription: Subscription;

  constructor(private coreService: CoreService, private dataService: DataService) {
    this.calendarTitle = new Date().getFullYear();
  }

  ngOnInit(): void {
    $('#full-calendar').calendar({
      renderEnd: (e) => {
        this.calendarTitle = e.currentYear;
        this.changeDate();
      }
    });
    this.subscription = this.dataService.isCalendarReload.subscribe(res => {
      this.calendar = res;
      this.init();
    });
  }

  init() {
    let obj = {
      jobschedulerId: this.schedulerId,
      dateFrom: this.calendar.from || moment().format('YYYY-MM-DD'),
      dateTo: this.calendar.to,
      path: this.calendar.path
    };
    this.toDate = _.clone(obj.dateTo);
    if (new Date(obj.dateTo).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      obj.dateTo = this.calendarTitle + '-12-31';
    }
    this.getDates(obj, true);
  }

  changeDate() {
    let newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }

    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      let obj = {
        jobschedulerId: this.schedulerId,
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
        path: this.calendar.path
      };
      this.getDates(obj, false);
    } else if (newDate.getFullYear() === this.calendarTitle) {
      this.planItems = _.clone(this.tempList);
      if ($('#full-calendar').data('calendar')) {
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }
    }
  }

  private getDates(obj, flag: boolean): void {
    this.planItems = [];
    this.coreService.post('calendar/dates', obj).subscribe((result: any) => {
      for (let i = 0; i < result.dates.length; i++) {
        let x = result.dates[i];
        let obj = {
          startDate: moment(x),
          endDate: moment(x),
          color: '#007da6'
        };

        this.planItems.push(obj);
      }
      for (let i = 0; i < result.withExcludes.length; i++) {
        let x = result.withExcludes[i];
        this.planItems.push({
          startDate: moment(x),
          endDate: moment(x),
          color: '#eb8814'
        });
      }
      if (flag) {
        this.tempList = _.clone(this.planItems);
      }
      $('#full-calendar').data('calendar').setDataSource(this.planItems);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}


@Component({
  selector: 'app-joe',
  templateUrl: './joe.component.html',
  styleUrls: ['./joe.component.scss']
})
export class JoeComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  tree: any = [];
  isLoading = true;
  pageView: any = 'grid';
  options: any = {};
  data: any = {};
  selectedObj: any = {};
  selectedPath: string;
  type: string;
  jobConfig:any;

  constructor(
    private authService: AuthService,
    public coreService: CoreService,
    private dataService: DataService,
    public modalService: NgbModal) {
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.jobConfig = this.coreService.getConfigurationTab().inventory;
    this.initTree();
  }

  ngOnDestroy() {
    this.coreService.tabs._configuration.state = 'inventory';
    this.jobConfig.expand_to = this.tree;
    this.jobConfig.selectedObj = this.selectedObj;
    this.jobConfig.activeTab = {type : 'type', object : this.type, path : '/'};
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      if (!_.isEmpty(this.jobConfig.expand_to)) {
        this.tree = this.jobConfig.expand_to;
        this.type = this.jobConfig.activeTab.object;
        this.selectedPath = this.jobConfig.activeTab.path;
        this.selectedObj = this.jobConfig.selectedObj;
      } else {
        this.tree = this.coreService.prepareTree(res);

        if (this.tree.length > 0) {
          this.updateObjects(this.tree[0], (children) => {
            this.tree[0].children.splice(0, 0, children);
          }, true);
        }
        this.tree[0].isSelected = true;
        this.tree[0].expanded = true;

        this.selectedPath = this.tree[0].path;
      }
      this.isLoading = false;
    }, () => this.isLoading = false);
  }

  openFolder(data: any): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
    if (data.isExpanded && !data.origin.configuration && !data.origin.type && !data.origin.object) {
      this.updateObjects(data.origin, (children) => {
        console.log(children);
        data.addChildren([children], 0);
      }, false);
    }
  }

  selectNode(node: NzTreeNode | NzFormatEmitEvent): void {
    if (node instanceof NzTreeNode) {
      let data = node.origin;
      if (data.childrens || data.deleted || !(data.object || data.type || data.param || data.configuration)) {
        if (!data.type && !data.object && !data.param && !data.configuration) {
          node.isExpanded = !node.isExpanded;
          if(data.expanded) {
           // this.expandNode(data, true);
          }
        }
        return;
      }
      if (this.preferences.expandOption === 'both' && !data.type) {
        data.expanded = true;
      }
      this.type = data.object || data.type;
      this.setSelectedObj(data.object || data.type, data.name, data.path || data.parent);
    }
  }

  private setSelectedObj (type, name, path) {
    this.selectedObj = {type: type, name: name, path: path};
  }

  updateObjects(data, cb, isExpandConfiguration) {
    let flag = true, arr = [];
    if (!data.children) {
      data.children = [];
    } else if (data.children.length > 0) {
      if (data.children[0].configuration) {
        flag = false;
        arr = data.children[0].children;
      }
    }
    if (flag) {
      arr = [{
        name: 'Workflows', object: 'WORKFLOW', children: [{
          name: 'w1', type: 'WORKFLOW', path: data.path
        }], parent: data.path
      },
        {
          name: 'Job Classes', object: 'JOBCLASS', children: [{
            name: 'j-c_1', type: 'JOBCLASS', path: data.path
          }], parent: data.path
        },
        {
          name: 'Junctions', object: 'JUNCTION', children: [{
            name: 'j1', type: 'JUNCTION', path: data.path
          }, {
            name: 'j2', type: 'JUNCTION', path: data.path
          }], parent: data.path
        },
        {
          name: 'Orders', object: 'ORDER', children: [{
            name: 'order_1', type: 'ORDER', path: data.path
          }], parent: data.path
        },
        {
          name: 'Agent Clusters', object: 'AGENTCLUSTER', children: [{
            name: 'agent_1', type: 'AGENTCLUSTER', path: data.path
          }], parent: data.path
        },
        {name: 'Locks', object: 'LOCK', children: [], parent: data.path},
        {name: 'Calendars', object: 'CALENDAR', children: [], parent: data.path}];
      cb({
        name: 'Configuration',
        configuration: 'CONFIGURATION',
        children: arr,
        parent: data.path
      });
    }

    if (this.preferences.joeExpandOption === 'both' || isExpandConfiguration) {
      data.children[0].expanded = true;
    }
  }

  deployDraft() {
    const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  export() {
    const modalRef = this.modalService.open(ExportComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  import() {
    const modalRef = this.modalService.open(ImportWorkflowModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  setVersion() {
    const modalRef = this.modalService.open(SetVersionComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  createFolder(node) {

  }

  newObject(node, type) {

  }

  deployObject(node) {

  }

  copy(node, e) {

  }

  paste(node, e) {

  }

  removeObject(node, e) {

  }

  removeDraft(node, e) {

  }

  restoreObject(node, e) {

  }

  receiveMessage($event) {
    this.pageView = $event;
  }
}
