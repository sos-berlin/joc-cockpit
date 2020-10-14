import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';

@Component({
  selector: 'app-deploy-draft-modal',
  templateUrl: './single-deploy-dialog.html'
})
export class SingleDeployComponent implements OnInit {
  @Input() schedulerIds;
  @Input() data;
  @Input() type;
  selectedSchedulerIds = [];
  deployablesobject = [];
  loading = true;
  submitted = false;

  object: any = {
    update: []
  };

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    this.init();
  }

  init() {
    let obj: any = {};
    if (this.data.id) {
      obj.id = this.data.id;
    } else if (this.data.object) {
      obj.path = this.data.path;
      obj.objectType = this.data.object;
    }
    this.coreService.post('inventory/deployables', obj).subscribe((res: any) => {
      this.deployablesobject = res.deployables;
      if (res.deployables && res.deployables.length > 0) {
        for (let j = 0; j < res.deployables.length; j++) {
          if (res.deployables[j].deployablesVersions && res.deployables[j].deployablesVersions.length > 0) {
            res.deployables[j].deployId = '';
            if (res.deployables[j].deployablesVersions[0].versions && res.deployables[j].deployablesVersions[0].versions.length > 0) {
              res.deployables[j].deployId = res.deployables[j].deployablesVersions[0].deploymentId;
            }
          }
        }
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  getJSObject() {
    this.object.update = [];
    const self = this;
    for (let i = 0; i < this.deployablesobject.length; i++) {
      if (this.deployablesobject[i].isChecked || !this.data.object) {
        let obj: any = {};
        if (this.deployablesobject[i].deployId || this.deployablesobject[i].deploymentId) {
          obj.deploymentId = this.deployablesobject[i].deployId || this.deployablesobject[i].deploymentId;
        } else {
          obj.configurationId = this.deployablesobject[i].id;
        }
        self.object.update.push(obj);
      }
    }
  }

  deploy() {
    this.submitted = true;
    this.getJSObject();
    const ids = [];
    this.selectedSchedulerIds.forEach(element => {
      ids.push({controller: element});
    });
    const obj = {
      controllers: ids,
      update: this.object.update
    };

    this.coreService.post('publish/deploy', obj).subscribe((res: any) => {
      this.activeModal.close('ok');
    }, (error) => {
      this.submitted = false;
    });
  }

  handleCheckbox(node): void {
    node.isChecked = !node.isChecked;
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-deploy-draft-modal',
  templateUrl: './deploy-dialog.html'
})
export class DeployComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() schedulerIds;
  @Input() preferences;
  @Input() path: string;
  selectedSchedulerIds = [];
  loading = true;
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];
  object: any = {
    isRecursive: true,
    delete: [],
    update: []
  };
  isExpandAll = false;
  submitted = false;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    this.buildTree();
  }

  expandAll(): void {
    this.isExpandAll = true;
    const self = this;

    function recursive(node) {
      for (let i = 0; i < node.length; i++) {
        if (node[i].children && node[i].children.length > 0) {
          if (!node[i].isCall) {
            self.checkAndUpdateVersionList(node[i]);
          }
          recursive(node[i].children);
        }
      }
    }

    recursive(this.nodes);
  }

  collapseAll() {
    this.isExpandAll = false;
    this.expandCollapseRec(this.nodes);
  }

  private expandCollapseRec(node) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0) {
        const a = this.treeCtrl.getTreeNodeByKey(node[i].key);
        a.isExpanded = false;
        this.expandCollapseRec(node[i].children);
      }
    }
  }

  handleCheckbox(node): void {
    node.recursivelyDeploy = !node.recursivelyDeploy;
    if (!node.type) {
      this.toggleObject(node, node.recursivelyDeploy);
    }
    this.getParent(node, node.recursivelyDeploy);
    this.updateTree();
  }

  private getParent(node, flag) {
    const parent = this.treeCtrl.getTreeNodeByKey(node.path);
    if (parent) {
      if (!flag) {
        parent.origin.recursivelyDeploy = flag;
      } else if (parent.origin.children) {
        let flg = true;
        for (let i = 0; i < parent.origin.children.length; i++) {
          if (parent.origin.children[i].type && !parent.origin.children[i].recursivelyDeploy) {
            flg = false;
            break;
          } else if (!parent.origin.children[i].type && !parent.origin.children[i].object && !parent.origin.children[i].recursivelyDeploy) {
            flg = false;
            break;
          }
        }
        parent.origin.recursivelyDeploy = flg;
      }
      if (parent.origin.path !== '/') {
        if (parent.getParentNode()) {
          this.getParent(parent.getParentNode().origin, flag);
        }
      }
    }
  }

  private toggleObject(data, flag) {
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].type) {
        data.children[i].recursivelyDeploy = flag;
      } else if (!data.children[i].object) {
        data.children[i].recursivelyDeploy = flag;
        this.toggleObject(data.children[i], flag);
      }
    }
  }

  updateTree() {
    this.nodes = [...this.nodes];
  }

  private getChildTree() {
    this.object.isRecursive = false;
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        let flag = false;
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === self.path) {
            flag = true;
            self.nodes = nodes;
            break;
          }
          if (!flag && nodes[i].children) {
            recursive(nodes[i].children);
          }
        }
      }
    }

    recursive(this.nodes);
  }

  buildTree() {
    this.coreService.post('inventory/deployables', {path: this.path || '/', recursive: true}).subscribe((res) => {
      this.buildDeployablesTree(res);
      if (this.nodes.length > 0) {
        this.checkAndUpdateVersionList(this.nodes[0]);
      }
      setTimeout(() => {
        this.loading = false;
        if (this.path) {
          this.getChildTree();
        }
        this.updateTree();
      }, 0);
    }, (err) => {
      this.loading = false;
    });
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    let node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      this.checkAndUpdateVersionList(node.origin);
    }
  }

  private checkAndUpdateVersionList(data) {
    data.isCall = true;
    this.coreService.post('inventory/deployables', {path: data.path}).subscribe((res: any) => {
      if (res.deployables && res.deployables.length > 0) {
        for (let i = 0; i < data.children.length; i++) {
          for (let j = 0; j < res.deployables.length; j++) {
            if (data.children[i].key === res.deployables[j].id) {
              data.children[i].deployablesVersions = res.deployables[j].deployablesVersions;
              if (data.children[i].deployablesVersions && data.children[i].deployablesVersions.length > 0) {
                data.children[i].deployId = '';
                if (data.children[i].deployablesVersions[0].versions && data.children[i].deployablesVersions[0].versions.length > 0) {
                  data.children[i].deployId = data.children[i].deployablesVersions[0].deploymentId;
                }
              }
              res.deployables.splice(j, 1);
              break;
            }
          }
          if (res.deployables.length === 0) {
            break;
          }
        }
      }
    }, (err) => {

    });
  }

  private buildDeployablesTree(result) {
    if (result.deployables && result.deployables.length > 0) {
      const arr = _.groupBy(_.sortBy(result.deployables, 'folder'), (res) => {
        return res.folder;
      });
      this.generateTree(arr);
    } else {
      this.nodes = [];
    }
  }

  private generateTree(arr) {
    for (const [key, value] of Object.entries(arr)) {
      if (key !== '/') {
        let paths = key.split('/');
        if (paths.length > 1) {
          let pathArr = [];
          for (let i = 0; i < paths.length; i++) {
            if (paths[i]) {
              if (i > 0 && paths[i - 1]) {
                pathArr.push('/' + paths[i - 1] + '/' + paths[i]);
              } else {
                pathArr.push('/' + paths[i]);
              }
            }
          }
          for (let i = 0; i < pathArr.length; i++) {
            this.checkAndAddFolder(pathArr[i]);
          }
        }
      }
      this.checkFolderRecur(key, value);
    }
  }

  private checkFolderRecur(_path, data) {
    let flag = false;
    let arr = [];
    if (data.length > 0) {
      arr = this.createTempArray(data);
    }

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path) {
            if (!nodes[i].children || nodes[i].children.length === 0) {
              for (let j = 0; j < arr.length; j++) {
                if (arr[j].name === nodes[i].name && arr[j].path === nodes[i].path) {
                  nodes[i].key = arr[j].key;
                  nodes[i].deleted = arr[j].deleted;
                  nodes[i].isFolder = true;
                  arr.splice(j, 1);
                  break;
                }
              }
              nodes[i].children = arr;
            } else {
              nodes[i].children = nodes[i].children.concat(arr);
            }
            if (nodes[i].children.length === 0) {
              nodes[i].isLeaf = true;
            }
            flag = true;
            break;
          }
          if (!flag && nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    if (this.nodes && this.nodes[0]) {
      this.nodes[0].expanded = true;
      recursive(_path, this.nodes);
    }
  }

  private checkAndAddFolder(_path) {
    let node: any;

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path.substring(0, path.lastIndexOf('/') + 1) || nodes[i].path === path.substring(0, path.lastIndexOf('/'))) {
            node = nodes[i];
            break;
          }
          if (nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    recursive(_path, this.nodes);

    if (node) {
      let falg = false;
      for (let x = 0; x < node.children.length; x++) {
        if (!node.children[x].type && !node.children[x].object && node.children[x].path === _path) {
          falg = true;
          break;
        }
      }
      if (!falg) {
        node.children.push({
          name: _path.substring(_path.lastIndexOf('/') + 1),
          path: _path,
          key: _path,
          children: []
        });
      }
    }
  }

  private createTempArray(arr) {
    let x = _.groupBy(arr, (res) => {
      return res.objectType;
    });
    let tempArr = [], folderArr = [];
    for (const [key, value] of Object.entries(x)) {
      const temp: any = value;
      if (key !== 'FOLDER') {
        let parentObj: any = {
          name: value[0].objectType,
          object: value[0].objectType,
          path: value[0].folder,
          key: value[0].folder + (value[0].folder === '/' ? '' : '/') + value[0].objectType,
          isLeaf: true
        };
        tempArr.push(parentObj);
        temp.forEach(data => {
          const child: any = {
            name: data.objectName,
            path: data.folder,
            key: data.id,
            type: data.objectType,
            deleted: data.deleted,
            deployed: data.deployed,
            deploymentId: data.deploymentId,
            deployablesVersions: data.deployablesVersions,
            isLeaf: true
          };
          tempArr.push(child);
        });

      } else {
        temp.forEach(data => {
          folderArr.push({
            name: data.objectName,
            path: data.folder,
            key: data.id,
            deleted: data.deleted,
            children: []
          });
        });
      }
    }
    return tempArr.concat(folderArr);
  }

  getJSObject() {
    this.object.update = [];
    this.object.delete = [];
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((nodes[i].type || nodes[i].isFolder) && nodes[i].recursivelyDeploy) {
          let obj: any = {};
          if (nodes[i].deployId || nodes[i].deploymentId) {
            obj.deploymentId = nodes[i].deployId || nodes[i].deploymentId;
          } else {
            obj.configurationId = nodes[i].key;
          }
          if (nodes[i].deleted) {
            self.object.delete.push(obj);
          } else {
            self.object.update.push(obj);
          }
        }
        if (!nodes[i].type && !nodes[i].object && nodes[i].children) {
          recursive(nodes[i].children);
        }
      }
    }

    recursive(this.nodes);
  }

  deploy() {
    this.submitted = true;
    this.getJSObject();
    const ids = [];
    this.selectedSchedulerIds.forEach(element => {
      ids.push({controller: element});
    });
    const obj = {
      controllers: ids,
      update: this.object.update,
      delete: this.object.delete
    };
    this.coreService.post('publish/deploy', obj).subscribe((res: any) => {
      this.activeModal.close('ok');
    }, (error) => {
      this.submitted = false;
    });
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
  @Input() schedulerIds;
  nodes: any = [{key: '/', path: '/', name: '/', children: []}];
  version = {type: 'setOneVersion', name: ''};
  isExpandAll = false;
  object: any = {
    isRecursive: true,
    configurations: [],
    deployments: [],
    prevVersion: ''
  };

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildTree();
  }

  expandAll(): void {
    this.isExpandAll = true;
  }

  // Collapse all Node
  collapseAll() {
    this.isExpandAll = false;
    this.expandCollapseRec(this.nodes);
  }

  private expandCollapseRec(node) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0) {
        const a = this.treeCtrl.getTreeNodeByKey(node[i].key);
        a.isExpanded = false;
        this.expandCollapseRec(node[i].children);
      }
    }
  }

  updateTree() {
    this.nodes = [...this.nodes];
  }

  buildTree() {
    this.coreService.post('inventory/deployables', {
      path: '/',
      recursive: true
    }).subscribe((res) => {
      this.buildDeployablesTree(res);
      if (this.nodes.length > 0) {
        this.checkAndUpdateVersionList(this.nodes[0]);
      }
      setTimeout(() => {
        this.updateTree();
      }, 0);
    }, (err) => {
    });
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    let node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      this.checkAndUpdateVersionList(node.origin);
    }
  }

  private checkAndUpdateVersionList(data) {
    data.isCall = true;
    this.coreService.post('inventory/deployables', {path: data.path}).subscribe((res: any) => {
      if (res.deployables && res.deployables.length > 0) {
        for (let i = 0; i < data.children.length; i++) {
          for (let j = 0; j < res.deployables.length; j++) {
            if (data.children[i].key === res.deployables[j].id) {
              data.children[i].deployablesVersions = res.deployables[j].deployablesVersions;
              if (data.children[i].deployablesVersions && data.children[i].deployablesVersions.length > 0) {
                data.children[i].deployId = '';
                if (data.children[i].deployablesVersions[0].versions && data.children[i].deployablesVersions[0].versions.length > 0) {
                  data.children[i].deployId = data.children[i].deployablesVersions[0].deploymentId;
                }
              }
              res.deployables.splice(j, 1);
              break;
            }
          }
          if (res.deployables.length === 0) {
            break;
          }
        }
      }
    }, (err) => {

    });
  }

  private buildDeployablesTree(result) {
    if (result.deployables && result.deployables.length > 0) {
      const arr = _.groupBy(_.sortBy(result.deployables, 'folder'), (res) => {
        return res.folder;
      });
      this.generateTree(arr);
    }
  }

  private generateTree(arr) {
    for (const [key, value] of Object.entries(arr)) {
      if (key !== '/') {
        let paths = key.split('/');
        if (paths.length > 1) {
          let pathArr = [];
          for (let i = 0; i < paths.length; i++) {
            if (paths[i]) {
              if (i > 0 && paths[i - 1]) {
                pathArr.push('/' + paths[i - 1] + '/' + paths[i]);
              } else {
                pathArr.push('/' + paths[i]);
              }
            }
          }
          for (let i = 0; i < pathArr.length; i++) {
            this.checkAndAddFolder(pathArr[i]);
          }
        }
      }
      this.checkFolderRecur(key, value);
    }
  }

  private checkFolderRecur(_path, data) {
    let flag = false;
    let arr = [];
    if (data.length > 0) {
      arr = this.createTempArray(data);
    }

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path) {
            if (!nodes[i].children || nodes[i].children.length === 0) {
              nodes[i].children = arr;
            } else {
              nodes[i].children = nodes[i].children.concat(arr);
            }
            flag = true;
            break;
          }
          if (!flag && nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    if (this.nodes && this.nodes[0]) {
      this.nodes[0].expanded = true;
      recursive(_path, this.nodes);
    }
  }

  private checkAndAddFolder(_path) {
    let node: any;

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path.substring(0, path.lastIndexOf('/') + 1) || nodes[i].path === path.substring(0, path.lastIndexOf('/'))) {
            node = nodes[i];
            break;
          }
          if (nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    recursive(_path, this.nodes);

    if (node) {
      let falg = false;
      for (let x = 0; x < node.children.length; x++) {
        if (!node.children[x].type && !node.children[x].object && node.children[x].path === _path) {
          falg = true;
          break;
        }
      }
      if (!falg) {
        node.children.push({
          name: _path.substring(_path.lastIndexOf('/') + 1),
          path: _path,
          key: _path,
          children: []
        });
      }
    }
  }

  private createTempArray(arr) {
    let x = _.groupBy(arr, (res) => {
      return res.objectType;
    });
    let tempArr = [], folderArr = [];
    for (const [key, value] of Object.entries(x)) {
      const temp: any = value;
      if (key !== 'FOLDER') {
        let parentObj: any = {
          name: value[0].objectType,
          object: value[0].objectType,
          path: value[0].folder,
          key: value[0].folder + (value[0].folder === '/' ? '' : '/') + value[0].objectType,
          isLeaf: true
        };
        tempArr.push(parentObj);
        temp.forEach(data => {
          const child: any = {
            name: data.objectName,
            path: data.folder,
            key: data.id,
            type: data.objectType,
            deploymentId: data.deploymentId,
            deployablesVersions: data.deployablesVersions,
            isLeaf: true
          };
          tempArr.push(child);
        });

      } else {
        temp.forEach(data => {
          folderArr.push({
            name: data.objectName,
            path: data.folder,
            key: data.id,
            children: []
          });
        });
      }
    }
    return tempArr.concat(folderArr);
  }

  getJSObject() {
    this.object.configurations = [];
    this.object.deployments = [];
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type && (nodes[i].version || nodes[i].recursivelyDeploy)) {
          if (nodes[i].deployId || nodes[i].deploymentId) {
            if (self.version.type === 'setSeparateVersion') {
              self.object.deployments.push({deploymentId: nodes[i].deployId || nodes[i].deploymentId, version: nodes[i].version});
            } else {
              self.object.deployments.push(nodes[i].deployId || nodes[i].deploymentId);
            }
          } else {
            if (self.version.type === 'setSeparateVersion') {
              self.object.configurations.push({configurationId: nodes[i].key, version: nodes[i].version});
            } else {
              self.object.configurations.push(nodes[i].key);
            }
          }
        }
        if (!nodes[i].type && !nodes[i].object && nodes[i].children) {
          recursive(nodes[i].children);
        }
      }
    }

    recursive(this.nodes);
  }

  setVersion() {
    const obj: any = {
      configurations: [],
      deployments: []
    };
    this.getJSObject();
    if (this.version.type === 'setSeparateVersion') {
      obj.configurations = this.object.configurations;
      obj.deployments = this.object.deployments;
      this.coreService.post('publish/set_versions', obj).subscribe((res: any) => {
        this.activeModal.close('ok');
      }, (error) => {

      });
    } else {
      if (this.object.configurations.length > 0 || this.object.deployments.length > 0) {
        obj.configurations = this.object.configurations;
        obj.deployments = this.object.deployments;
        obj.version = this.version.name;
        this.coreService.post('publish/set_version', obj).subscribe((res: any) => {
          this.activeModal.close('ok');
        }, (error) => {

        });
      }
    }
  }

  cancelSetVersion(data) {
    if (this.object.prevVersion) {
      data.version = _.clone(this.object.prevVersion);
    }
    this.object.prevVersion = undefined;
    data.setVersion = false;
  }

  deleteSetVersion(data) {
    delete data['version'];
  }

  editVersion(data) {
    if (data.version) {
      this.object.prevVersion = _.clone(data.version);
    }
  }

  applySetVersion(data) {
    data.setVersion = false;
  }

  setIndividualVersion(data) {
    data.setVersion = true;
  }

  handleCheckbox(node): void {
    node.recursivelyDeploy = !node.recursivelyDeploy;
    if (!node.type) {
      this.toggleObject(node, node.recursivelyDeploy);
    }
    this.getParent(node, node.recursivelyDeploy);
    this.updateTree();
  }

  private getParent(node, flag) {
    const parent = this.treeCtrl.getTreeNodeByKey(node.path);
    if (parent) {
      if (!flag) {
        parent.origin.recursivelyDeploy = flag;
      } else if (parent.origin.children) {
        let flg = true;
        for (let i = 0; i < parent.origin.children.length; i++) {
          if (parent.origin.children[i].type && !parent.origin.children[i].recursivelyDeploy) {
            flg = false;
            break;
          } else if (!parent.origin.children[i].type && !parent.origin.children[i].object && !parent.origin.children[i].recursivelyDeploy) {
            flg = false;
            break;
          }
        }
        parent.origin.recursivelyDeploy = flg;
      }
      if (parent.origin.path !== '/') {
        if (parent.getParentNode()) {
          this.getParent(parent.getParentNode().origin, flag);
        }
      }
    }
  }

  private toggleObject(data, flag) {
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].type) {
        data.children[i].recursivelyDeploy = flag;
      } else if (!data.children[i].object) {
        data.children[i].recursivelyDeploy = flag;
        this.toggleObject(data.children[i], flag);
      }
    }
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
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];
  object: any = {
    configurations: [],
    deployments: []
  };
  showUnSigned = true;
  showSigned = true;
  isExpandAll = false;

  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private authService: AuthService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildTree();
  }

  expandAll(): void {
    this.isExpandAll = true;
  }

  // Collapse all Node
  collapseAll() {
    this.isExpandAll = false;
    this.expandCollapseRec(this.nodes);
  }

  private expandCollapseRec(node) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0) {
        const a = this.treeCtrl.getTreeNodeByKey(node[i].key);
        a.isExpanded = false;
        this.expandCollapseRec(node[i].children);
      }
    }
  }

  handleCheckbox(node): void {
    node.recursivelyDeploy = !node.recursivelyDeploy;
    if (!node.type) {
      this.toggleObject(node, node.recursivelyDeploy);
    }
    this.getParent(node, node.recursivelyDeploy);
    this.updateTree();
  }

  private getParent(node, flag) {
    const parent = this.treeCtrl.getTreeNodeByKey(node.path);
    if (parent) {
      if (!flag) {
        parent.origin.recursivelyDeploy = flag;
      } else if (parent.origin.children) {
        let flg = true;
        for (let i = 0; i < parent.origin.children.length; i++) {
          if (parent.origin.children[i].type && !parent.origin.children[i].recursivelyDeploy) {
            flg = false;
            break;
          } else if (!parent.origin.children[i].type && !parent.origin.children[i].object && !parent.origin.children[i].recursivelyDeploy) {
            flg = false;
            break;
          }
        }
        parent.origin.recursivelyDeploy = flg;
      }
      if (parent.origin.path !== '/') {
        if (parent.getParentNode()) {
          this.getParent(parent.getParentNode().origin, flag);
        }
      }
    }
  }

  private toggleObject(data, flag) {
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].type) {
        data.children[i].recursivelyDeploy = flag;
      } else if (!data.children[i].object) {
        data.children[i].recursivelyDeploy = flag;
        this.toggleObject(data.children[i], flag);
      }
    }
  }

  updateTree() {
    this.nodes = [...this.nodes];
  }

  buildTree() {
    this.coreService.post('inventory/deployables', {
      path: '/',
      recursive: true
    }).subscribe((res) => {
      this.buildDeployablesTree(res);
      if (this.nodes.length > 0) {
        this.checkAndUpdateVersionList(this.nodes[0]);
      }
      setTimeout(() => {
        this.updateTree();
      }, 0);
    }, (err) => {
    });
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    let node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      this.checkAndUpdateVersionList(node.origin);
    }
  }

  private checkAndUpdateVersionList(data) {
    data.isCall = true;
    this.coreService.post('inventory/deployables', {path: data.path}).subscribe((res: any) => {
      if (res.deployables && res.deployables.length > 0) {
        for (let i = 0; i < data.children.length; i++) {
          for (let j = 0; j < res.deployables.length; j++) {
            if (data.children[i].key === res.deployables[j].id) {
              data.children[i].deployablesVersions = res.deployables[j].deployablesVersions;
              if (data.children[i].deployablesVersions && data.children[i].deployablesVersions.length > 0) {
                data.children[i].deployId = '';
                if (data.children[i].deployablesVersions[0].versions && data.children[i].deployablesVersions[0].versions.length > 0) {
                  data.children[i].deployId = data.children[i].deployablesVersions[0].deploymentId;
                }
              }
              res.deployables.splice(j, 1);
              break;
            }
          }
          if (res.deployables.length === 0) {
            break;
          }
        }
      }
    }, (err) => {

    });
  }

  private buildDeployablesTree(result) {
    if (result.deployables && result.deployables.length > 0) {
      const arr = _.groupBy(_.sortBy(result.deployables, 'folder'), (res) => {
        return res.folder;
      });
      this.generateTree(arr);
    } else {
      this.nodes = [];
    }
  }

  private generateTree(arr) {
    for (const [key, value] of Object.entries(arr)) {
      if (key !== '/') {
        let paths = key.split('/');
        if (paths.length > 1) {
          let pathArr = [];
          for (let i = 0; i < paths.length; i++) {
            if (paths[i]) {
              if (i > 0 && paths[i - 1]) {
                pathArr.push('/' + paths[i - 1] + '/' + paths[i]);
              } else {
                pathArr.push('/' + paths[i]);
              }
            }
          }
          for (let i = 0; i < pathArr.length; i++) {
            this.checkAndAddFolder(pathArr[i]);
          }
        }
      }
      this.checkFolderRecur(key, value);
    }
  }

  private checkFolderRecur(_path, data) {
    let flag = false;
    let arr = [];
    if (data.length > 0) {
      arr = this.createTempArray(data);
    }

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path) {
            if (!nodes[i].children || nodes[i].children.length === 0) {
              nodes[i].children = arr;
            } else {
              nodes[i].children = nodes[i].children.concat(arr);
            }
            flag = true;
            break;
          }
          if (!flag && nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    if (this.nodes && this.nodes[0]) {
      this.nodes[0].expanded = true;
      recursive(_path, this.nodes);
    }
  }

  private checkAndAddFolder(_path) {
    let node: any;

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type && !nodes[i].object) {
          if (nodes[i].path === path.substring(0, path.lastIndexOf('/') + 1) || nodes[i].path === path.substring(0, path.lastIndexOf('/'))) {
            node = nodes[i];
            break;
          }
          if (nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    recursive(_path, this.nodes);

    if (node) {
      let falg = false;
      for (let x = 0; x < node.children.length; x++) {
        if (!node.children[x].type && !node.children[x].object && node.children[x].path === _path) {
          falg = true;
          break;
        }
      }
      if (!falg) {
        node.children.push({
          name: _path.substring(_path.lastIndexOf('/') + 1),
          path: _path,
          key: _path,
          children: []
        });
      }
    }
  }

  private createTempArray(arr) {
    let x = _.groupBy(arr, (res) => {
      return res.objectType;
    });
    let tempArr = [], folderArr = [];
    for (const [key, value] of Object.entries(x)) {
      const temp: any = value;
      if (key !== 'FOLDER') {
        let parentObj: any = {
          name: value[0].objectType,
          object: value[0].objectType,
          path: value[0].folder,
          key: value[0].folder + (value[0].folder === '/' ? '' : '/') + value[0].objectType,
          isLeaf: true
        };
        tempArr.push(parentObj);
        temp.forEach(data => {
          const child: any = {
            name: data.objectName,
            path: data.folder,
            key: data.id,
            type: data.objectType,
            deploymentId: data.deploymentId,
            deployablesVersions: data.deployablesVersions,
            isLeaf: true
          };
          tempArr.push(child);
        });
      } else {
        temp.forEach(data => {
          folderArr.push({
            name: data.objectName,
            path: data.folder,
            key: data.id,
            children: []
          });
        });
      }
    }
    return tempArr.concat(folderArr);
  }

  getJSObject() {
    this.object.configurations = [];
    this.object.deployments = [];
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type && nodes[i].recursivelyDeploy) {
          if (nodes[i].deployId || nodes[i].deploymentId) {
            self.object.deployments.push(nodes[i].deployId || nodes[i].deploymentId);
          } else {
            self.object.configurations.push(nodes[i].key);
          }
        }
        if (!nodes[i].type && !nodes[i].object && nodes[i].children) {
          recursive(nodes[i].children);
        }
      }
    }

    recursive(this.nodes);
  }

  export() {
    this.getJSObject();
    if (this.object.configurations.length > 0 || this.object.deployments.length > 0) {
      this.coreService.post('publish/export', this.object).subscribe((res: any) => {
        this.exportFile(res);
        this.activeModal.close('ok');
      }, (error) => {

      });
    }
  }

  private exportFile(res) {
    let name = 'bundles' + '.zip';
    if (res.headers && res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
      name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
    }
    let blob = new Blob([res], {type: 'application/octet-stream'});
    saveAs(blob, name);
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
  @Input() display: any;
  @Input() isDeploy: any;
  @Input() schedulerIds;

  uploader: FileUploader;
  messageList: any;
  required = false;
  submitted = false;
  signatureAlgorithm: string;
  selectedSchedulerIds = [];
  comments: any = {};

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal,
              public toasterService: ToasterService, private authService: AuthService) {
  }

  ngOnInit() {
    this.uploader = new FileUploader({
      url: this.isDeploy ? './api/publish/import_deploy' : './api/publish/import'
    });
    if (this.schedulerIds) {
      this.selectedSchedulerIds.push(this.schedulerIds.selected);
    }
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }

    this.uploader.onBeforeUploadItem = (item: any) => {
      let obj: any = {
        'X-Access-Token': this.authService.accessTokenId,
      };
      if (this.comments.comment) {
        obj.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.ticketLink = this.comments.ticketLink;
      }
      if (this.selectedSchedulerIds && this.selectedSchedulerIds.length > 0) {
        const importDeployFilter = {controllers: []};
        for (let i = 0; i < this.selectedSchedulerIds.length; i++) {
          importDeployFilter.controllers.push({controller: this.selectedSchedulerIds[i]});
        }
        if (this.isDeploy) {
          obj.signatureAlgorithm = this.signatureAlgorithm;
        }
        obj.importDeployFilter = JSON.stringify(importDeployFilter);
      }
      item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
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

  cancel() {
    this.activeModal.close('Cross click');
  }
}

@Component({
  selector: 'app-create-folder-template',
  templateUrl: './create-folder-dialog.html'
})
export class CreateFolderModalComponent {
  @Input() schedulerId: any;
  @Input() folders: any;
  submitted = false;
  isUnique = true;
  folder = {error: false, name: ''};

  constructor(private coreService: CoreService, public activeModal: NgbActiveModal) {

  }

  onSubmit(): void {
    const _path = this.folders.path + (this.folders.path === '/' ? '' : '/') + this.folder.name;
    this.submitted = true;
    this.coreService.post('inventory/store', {
      jobschedulerId: this.schedulerId,
      objectType: 'FOLDER',
      path: _path,
      configuration: {}
    }).subscribe((res: any) => {
      this.activeModal.close({
        name: this.folder.name,
        title: res.path,
        path: res.path,
        key: res.path,
        children: []
      });
    }, (err) => {
      this.submitted = false;
    });
  }

  checkFolderName() {
    let isValid = true;
    let reg = ['/', '\\', ':', '<', '>', '|', '?', '*', '"'];
    for (let i = 0; i < reg.length; i++) {
      if (this.folder.name.indexOf(reg[i]) > -1) {
        isValid = false;
        break;
      }
    }
    if (isValid && this.folder.name.lastIndexOf('.') > -1) {
      isValid = false;
    }
    if (isValid) {
      this.folder.error = false;
    } else {
      this.folder.error = true;
      return;
    }
    this.isUnique = true;
    for (let i = 0; i < this.folders.children.length; i++) {
      if (this.folder.name === this.folders.children[i].name) {
        this.isUnique = false;
        break;
      }
    }
  }
}

@Component({
  selector: 'app-joe',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  tree: any = [];
  isLoading = true;
  pageView = 'grid';
  options: any = {};
  data: any = {};
  copyObj: any;
  selectedObj: any = {};
  selectedData: any = {};
  sideView: any = {};
  securityLevel: string;
  type: string;
  inventoryConfig: any;
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;

  constructor(
    private authService: AuthService,
    public coreService: CoreService,
    private dataService: DataService,
    public modalService: NgbModal) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.reloadTree.subscribe(res => {
      if (res) {
        if (res.add || res.reload) {
          this.updateTree();
        } else if (res.set) {
          if (this.treeCtrl) {
            this.selectedData = res.set;
            this.setSelectedObj(this.selectedObj.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
          }
        } else if (res.copy) {
          this.copyObj = res.copy;
        } else if (res.paste) {
          this.paste(res.paste);
        } else if (res.deploy) {
          this.deployObject(res.deploy);
        } else if (res.restore) {
          this.restoreObject(res.restore);
        } else if (res.rename) {
          this.rename(res.rename);
        } else if (res.back) {
          this.backToListView();
        }
      }
    });
  }

  ngOnInit() {
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.sideView = this.coreService.getSideView();
    if (this.sideView.inventory && !this.sideView.inventory.show) {
      this.hidePanel();
    }
    this.securityLevel = sessionStorage.securityLevel;
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.inventoryConfig = this.coreService.getConfigurationTab().inventory;
    this.initTree(null, null);
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.coreService.tabs._configuration.state = 'inventory';
    this.inventoryConfig.expand_to = this.tree;
    this.inventoryConfig.selectedObj = this.selectedObj;
    this.inventoryConfig.copyObj = this.copyObj;
  }

  private backToListView() {
    const parent = this.treeCtrl.getTreeNodeByKey(this.selectedObj.path);
    if (parent && parent.origin.children) {
      let child = parent.origin.children[0];
      for (let i = 0; i < child.children.length; i++) {
        if (child.children[i].object === this.selectedObj.type) {
          this.selectedData = child.children[i];
          this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
          break;
        }
      }
    }
  }

  initTree(path, mainPath) {
    if (!path) {
      this.isLoading = true;
    }
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      forInventory: true,
      types: ['INVENTORY']
    }).subscribe((res) => {
      let tree = this.coreService.prepareTree(res, false);
      if (path) {
        this.tree = this.recursiveTreeUpdate(tree, this.tree);
        this.updateFolders(path, () => {
          this.updateTree();
        });
        if (mainPath && path !== mainPath) {
          this.updateFolders(mainPath, () => {
            this.updateTree();
          });
        }
      } else {
        if (!_.isEmpty(this.inventoryConfig.expand_to)) {
          this.tree = this.recursiveTreeUpdate(tree, this.inventoryConfig.expand_to);
          this.selectedObj = this.inventoryConfig.selectedObj;
          this.copyObj = this.inventoryConfig.copyObj;
          if (this.inventoryConfig.selectedObj.path) {
            this.updateFolders(this.inventoryConfig.selectedObj.path, (response) => {
              this.isLoading = false;
              this.type = this.inventoryConfig.selectedObj.type;
              if (response) {
                this.selectedData = response.data;
              }
              this.updateTree();
            });
          } else {
            this.isLoading = false;
          }
        } else {
          this.tree = tree;
          if (this.tree.length > 0) {
            this.updateObjects(this.tree[0], (children) => {
              this.isLoading = false;
              this.tree[0].children.splice(0, 0, children);
              this.tree[0].expanded = true;
              this.updateTree();
            }, false);
          }
          if (this.inventoryConfig.selectedObj) {
            this.inventoryConfig.selectedObj.path = this.tree[0].path;
          }
        }
      }
    }, () => this.isLoading = false);
  }

  recursiveTreeUpdate(scr, dest) {
    function recursive(scrTree, destTree) {
      if (scrTree && destTree) {
        for (let j = 0; j < scrTree.length; j++) {
          for (let i = 0; i < destTree.length; i++) {
            if (destTree[i].path && scrTree[j].path && (destTree[i].path === scrTree[j].path)) {
              if (scrTree[j].object === destTree[i].object) {
                scrTree[j].expanded = destTree[i].expanded;
              }
              if (destTree[i].children && destTree[i].children.length > 0 && !destTree[i].object) {
                let arr = [];
                for (let x = 0; x < destTree[i].children.length; x++) {
                  if (destTree[i].children[x].configuration) {
                    arr.push(destTree[i].children[x]);
                    break;
                  }
                }
                if (arr.length > 0) {
                  if (scrTree[j].children) {
                    scrTree[j].children = arr.concat(scrTree[j].children);
                  } else {
                    scrTree[j].children = arr;
                  }
                }
              }
              if (scrTree[j].children && destTree[i].children && !destTree[i].object) {
                recursive(scrTree[j].children, destTree[i].children);
              }
              break;
            }
          }
        }
      }
    }

    recursive(scr, dest);
    return scr;
  }

  updateFolders(path, cb) {
    const self = this;
    let matchData: any;
    if (this.tree.length > 0) {
      function traverseTree(data) {
        if (path && data.path && (path === data.path)) {
          self.updateObjects(data, (children) => {
            const index = data.children[0].configuration ? 1 : 0;
            data.children.splice(0, index, children);
            self.updateTree();
          }, true);
          matchData = data;
        }

        if (data.children) {
          let flag = false;
          for (let i = 0; i < data.children.length; i++) {
            if (data.children[i].configuration) {
              for (let j = 0; j < data.children[i].children.length; j++) {
                let x = data.children[i].children[j];
                if (x.object === self.selectedObj.type &&
                  x.path === self.selectedObj.path && cb) {
                  flag = true;
                  let isMatch = false;
                  for (let k = 0; k < x.children.length; k++) {
                    if (x.children[k].name === self.selectedObj.name) {
                      isMatch = true;
                      cb({data: x.children[k], parentNode: data.children[i]});
                      break;
                    }
                  }
                  if (!isMatch) {
                    cb({data: x, parentNode: data.children[i]});
                  }
                  break;
                }
              }
            }
            if (!matchData) {
              traverseTree(data.children[i]);
            }
            if (flag) {
              break;
            }
          }
        }
      }

      traverseTree(this.tree[0]);
    }
    if (!matchData && cb) {
      cb();
    }
  }

  openFolder(node: NzTreeNode): void {
    if (node instanceof NzTreeNode) {
      node.isExpanded = !node.isExpanded;
      if (node.isExpanded && !node.origin.configuration && !node.origin.type && !node.origin.object) {
        this.updateObjects(node.origin, (children) => {
          if (node.children.length > 0 && node.origin.children[0].configuration) {
            node.isExpanded = true;
            node.origin.children[0] = children;
          } else {
            node.origin.children.splice(0, 0, children);
            node.origin.expanded = true;
            this.updateTree();
          }
        }, false);
      }
    }
  }

  selectNode(node: NzTreeNode | NzFormatEmitEvent): void {
    if (node instanceof NzTreeNode) {
      if ((!node.origin.object && !node.origin.type)) {
        if (!node.origin.type && !node.origin.object && !node.origin.configuration) {
          node.isExpanded = !node.isExpanded;
          if (node.origin.expanded) {
            this.updateObjects(node.origin, (children) => {
              if (node.children.length > 0 && node.origin.children[0].configuration) {
                node.isExpanded = true;
                node.origin.children[0] = children;
              } else {
                node.origin.children.splice(0, 0, children);
                node.origin.expanded = true;
                this.updateTree();
              }
            }, true);
          }
        }
        return;
      }
      if (this.preferences.expandOption === 'both' && !node.origin.type) {
        node.isExpanded = true;
      }
      this.type = node.origin.object || node.origin.type;
      this.selectedData = node.origin;
      this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
    }
  }

  updateObjects(data, cb, isExpandConfiguration) {
    let flag = true, arr = [];
    const _key = data.path === '/' ? '/' : (data.path + '/');
    if (!data.children) {
      data.children = [];
    } else if (data.children.length > 0) {
      if (data.children[0].configuration) {
        flag = false;
        arr = data.children[0].children;
      }
    }
    if (flag) {
      arr = [{name: 'Workflows', object: 'WORKFLOW', children: [], path: data.path, key: (_key + 'Workflows$')},
        {name: 'Job Classes', object: 'JOBCLASS', children: [], path: data.path, key: (_key + 'Job_Classes$')},
        {name: 'Junctions', object: 'JUNCTION', children: [], path: data.path, key: (_key + 'Junctions$')},
        {name: 'Orders', object: 'ORDER', children: [], path: data.path, key: (_key + 'Orders$')},
        {name: 'Agent Clusters', object: 'AGENTCLUSTER', children: [], path: data.path, key: (_key + 'Agent_Clusters$')},
        {name: 'Locks', object: 'LOCK', children: [], path: data.path, key: (_key + 'Locks$')},
        {name: 'Calendars', object: 'CALENDAR', children: [], path: data.path, key: (_key + 'Calendars$')}];
    }

    this.coreService.post('inventory/read/folder', {
      path: data.path
    }).subscribe((res: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i].deleted = data.deleted;
        let resObject;
        if (arr[i].object === 'WORKFLOW') {
          resObject = res.workflows;
        } else if (arr[i].object === 'JOBCLASS') {
          resObject = res.jobClasses;
        } else if (arr[i].object === 'JUNCTION') {
          resObject = res.junctions;
        } else if (arr[i].object === 'ORDER') {
          resObject = res.orders;
        } else if (arr[i].object === 'AGENTCLUSTER') {
          resObject = res.agentClusters;
        } else if (arr[i].object === 'LOCK') {
          resObject = res.locks;
        } else if (arr[i].object === 'CALENDAR') {
          resObject = res.calendars;
        }
        if (resObject) {
          if (!flag) {
            this.mergeFolderData(resObject, arr[i], res.path);
          } else {
            arr[i].children = resObject;
            arr[i].children.forEach(function (child, index) {
              arr[i].children[index].type = arr[i].object;
              arr[i].children[index].path = res.path;
            });
            arr[i].children = _.sortBy(arr[i].children, 'name');
          }
        } else {
          arr[i].children = [];
        }
      }
      let conf = {
        name: 'Configuration',
        configuration: 'CONFIGURATION',
        isLeaf: false,
        children: arr,
        path: data.path,
        key: (_key + 'Configuration$'),
        expanded: false,
        deleted: data.deleted
      };

      if ((this.preferences.joeExpandOption === 'both' || isExpandConfiguration)) {
        conf.expanded = true;
      }
      cb(conf);
    }, (err) => {
      cb({
        name: 'Configuration',
        configuration: 'CONFIGURATION',
        key: (_key + 'Configuration$'),
        children: arr,
        path: data.path,
        deleted: data.deleted
      });
    });
  }

  addObject(data, type) {
    if (data instanceof NzTreeNode) {
      data.isExpanded = true;
    }
    const object = data.origin;
    this.createObject(type || object.object, object.children, object.path);
  }

  newObject(node, type) {
    let list;
    if (node instanceof NzTreeNode) {
      node.isExpanded = true;
    }
    if (node.origin.configuration) {
      node.origin.expanded = true;
      for (let i = 0; i < node.origin.children.length; i++) {
        if (node.origin.children[i].object === type) {
          node.origin.children[i].expanded = true;
          list = node.origin.children[i].children;
          break;
        }
      }
    } else {
      for (let i = 0; i < node.origin.children.length; i++) {
        if (node.origin.children[i].configuration) {
          node.origin.children[i].expanded = true;
          for (let j = 0; j < node.origin.children[i].children.length; j++) {
            if (node.origin.children[i].children[j].object === type) {
              node.origin.children[i].children[j].expanded = true;
              list = node.origin.children[i].children[j].children;
              break;
            }
          }
          break;
        }
      }
    }

    if (list) {
      this.createObject(type, list, node.origin.path);
    } else {
      this.updateObjects(node.origin, (children) => {
        if (node.children.length > 0 && node.origin.children[0].configuration) {
          node.isExpanded = true;
          node.origin.children[0] = children;
        } else {
          node.origin.children.splice(0, 0, children);
          node.origin.expanded = true;
        }
        for (let j = 0; j < children.children.length; j++) {
          if (children.children[j].object === type) {
            children.children[j].expanded = true;
            list = children.children[j].children;
            break;
          }
        }
        this.createObject(type, list, node.origin.path);
      }, true);
    }
  }

  deployDraft() {
    const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.result.then((res: any) => {
      this.initTree('/', null);
    }, () => {

    });
  }

  export() {
    const modalRef = this.modalService.open(ExportComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  import() {
    const modalRef = this.modalService.open(ImportWorkflowModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  importDeploy() {
    const modalRef = this.modalService.open(ImportWorkflowModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.componentInstance.isDeploy = true;
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  setVersion() {
    const modalRef = this.modalService.open(SetVersionComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  createFolder(node) {
    if (this.permission && this.permission.Inventory && this.permission.Inventory.configurations.edit) {
      const modalRef = this.modalService.open(CreateFolderModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.folders = node.origin;
      modalRef.result.then((res: any) => {
        node.origin.children.push(res);
        this.updateTree();
      }, () => {

      });
    }
  }

  deployObject(node) {
    let origin = node.origin ? node.origin : node;
    if (origin.object || origin.type || origin.id) {
      const modalRef = this.modalService.open(SingleDeployComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.data = origin;
      modalRef.result.then((res: any) => {
        origin.deployed = true;
        if (!node.origin) {
          this.selectedData.deployed = true;
        }
        this.updateTree();
      }, () => {

      });
    } else {
      const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.preferences = this.preferences;
      modalRef.componentInstance.path = origin.path;
      modalRef.result.then((res: any) => {
        this.initTree(origin.path, null);
      }, () => {

      });
    }
  }

  rename(data) {
    if (data.id === this.selectedObj.id) {
      this.selectedObj.name = data.name;
    } else {
      this.updateFolders(data.path, () => {
        this.updateTree();
      });
    }
  }

  copy(node) {
    this.copyObj = node.origin;
  }

  paste(node) {
    let object = node;
    if (node instanceof NzTreeNode) {
      object = node.origin;
    }
    if (this.copyObj) {
      const _path = this.copyObj.path + (this.copyObj.path === '/' ? '' : '/') + this.copyObj.name;
      this.coreService.post('inventory/read/configuration', {
        jobschedulerId: this.schedulerIds.selected,
        objectType: this.copyObj.type,
        path: _path,
        id: this.copyObj.id,
      }).subscribe((res: any) => {
        let obj: any = {
          type: this.copyObj.type,
          path: object.path,
          name: this.coreService.getCopyName(this.copyObj.name, object.children),
        };
        this.storeObject(obj, object.children, res.configuration);
      }, () => {

      });
    }
  }

  removeObject(node) {
    const object = node.origin;
    let _path;
    if (object.type) {
      _path = object.path + (object.path === '/' ? '' : '/') + object.name;
    } else {
      _path = object.path;
    }
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then((res: any) => {
      this.deleteObject(_path, object, node);
    }, () => {
    });
  }

  removeDraft(node) {
    const object = node.origin;
    let _path;
    if (object.type) {
      _path = object.path + (object.path === '/' ? '' : '/') + object.name;
    } else {
      _path = object.path;
    }
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteDraftObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then((res: any) => {
      this.coreService.post('inventory/deletedraft', {
        jobschedulerId: this.schedulerIds.selected,
        objectType: object.type || 'FOLDER',
        path: _path,
        id: object.id
      }).subscribe((res: any) => {
        this.clearCopyObject(object);
        if (node.parentNode && node.parentNode.origin && node.parentNode.origin.children) {
          for (let i = 0; i < node.parentNode.origin.children.length; i++) {
            if (node.parentNode.origin.children[i].name === object.name && node.parentNode.origin.children[i].path === object.path) {
              node.parentNode.origin.children.splice(i, 1);
              break;
            }
          }
        }
        this.updateTree();
      });
    }, () => {

    });
  }

  restoreObject(node) {
    let object = node;
    if (node instanceof NzTreeNode) {
      object = node.origin;
    }
    let obj: any = {id: object.id};
    if (!object.type) {
      obj = {path: object.path};
    }
    this.coreService.post('inventory/undelete', obj).subscribe((res: any) => {
      object.deleted = false;
      this.initTree(obj.path || object.path, null);
    });
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].path) {
              let path = args[i].eventSnapshots[j].path.substring(0, args[i].eventSnapshots[j].path.lastIndexOf('/') + 1) || '/';
              if (args[i].eventSnapshots[j].eventType.match(/FileBase/) && !args[i].eventSnapshots[j].eventId && this.isLoading) {
                this.initTree(args[i].eventSnapshots[j].path, path);
                break;
              } else if (args[i].eventSnapshots[j].eventType === 'JoeUpdated' && !args[i].eventSnapshots[j].eventId) {
                if (args[i].eventSnapshots[j].objectType === 'FOLDER' && this.isLoading) {
                  this.initTree(args[i].eventSnapshots[j].path, path);
                  break;
                } else {
                  console.log(args[i].eventSnapshots[j]);
                }
              }
            }
          }
        }
        break;
      }
    }
  }

  private setSelectedObj(type, name, path, id) {
    this.selectedObj = {type: type, name: name, path: path, id: id};
  }

  private mergeFolderData(sour, dest, path) {
    for (let i = 0; i < dest.children.length; i++) {
      for (let j = 0; j < sour.length; j++) {
        if (dest.children[i].name === sour[j].name) {
          dest.children[i].deleted = sour[j].deleted;
          dest.children[i].deployed = sour[j].deployed;
          dest.children[i].hasDeployments = sour[j].hasDeployments;
          dest.children[i].valid = sour[j].valid;
          dest.children[i] = _.extend(dest.children[i], sour[j]);
          dest.children[i].match = true;
          sour.splice(j, 1);
          break;
        }
      }
    }
    for (let i = dest.children.length - 1; i >= 0; i--) {
      if (dest.children[i].match) {
        dest.children[i].path = path;
        delete dest.children[i]['match'];
      } else {
        dest.children.splice(i, 1);
      }
    }
    if (sour.length > 0) {
      for (let j = 0; j < sour.length; j++) {
        sour[j].path = path;
        sour[j].type = dest.object;
        dest.children.push({
          name: sour[j].name,
          id: sour[j].id,
          path: path,
          deleted: sour[j].deleted,
          deployed: sour[j].deployed,
          valid: sour[j].valid,
          hasDeployments: sour[j].hasDeployments,
          type: dest.object,
        });
      }
    }
    dest.children = _.sortBy(dest.children, 'name');
  }

  private createObject(type, list, path) {
    if (!path) {
      return;
    }
    let obj: any = {
      type: type,
      path: path
    };
    let configuration = {};
    if (type === 'WORKFLOW') {
      obj.name = this.coreService.getName(list, 'workflow1', 'name', 'workflow');
    } else if (type === 'JUNCTION') {
      obj.name = this.coreService.getName(list, 'junction1', 'name', 'junction');
    } else if (type === 'AGENTCLUSTER') {
      obj.name = this.coreService.getName(list, 'agent_cluster1', 'name', 'agent_cluster');
    } else if (type === 'JOBCLASS') {
      configuration = {maxProcesses: 1};
      obj.name = this.coreService.getName(list, 'job_class1', 'name', 'job_class');
    } else if (type === 'ORDER') {
      obj.name = this.coreService.getName(list, 'order1', 'name', 'order');
      configuration = {controllerId: this.schedulerIds.selected};
    } else if (type === 'LOCK') {
      obj.name = this.coreService.getName(list, 'lock1', 'name', 'lock');
    } else if (type === 'WORKINGDAYSCALENDAR' || type === 'NONWORKINGDAYSCALENDAR') {
      configuration = {type: type};
      obj.name = this.coreService.getName(list, 'calendar1', 'name', 'calendar');
    }
    this.storeObject(obj, list, configuration);
  }

  private storeObject(obj, list, configuration) {
    const _path = obj.path + (obj.path === '/' ? '' : '/') + obj.name;
    if (_path && obj.type) {
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerIds.selected,
        objectType: obj.type,
        path: _path,
        valid: !(obj.type === 'ORDER' || obj.type === 'AGENTCLUSTER' || obj.type === 'WORKFLOW'),
        configuration: configuration
      }).subscribe((res: any) => {
        if ((obj.type === 'WORKINGDAYSCALENDAR' || obj.type === 'NONWORKINGDAYSCALENDAR')) {
          obj.type = 'CALENDAR';
        }
        obj.id = res.id;
        obj.valid = !(obj.type === 'ORDER' || obj.type === 'AGENTCLUSTER' || obj.type === 'WORKFLOW');
        list.push(obj);
        this.type = obj.type;
        this.selectedData = obj;
        this.setSelectedObj(this.selectedData.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
        this.updateTree();
      });
    }
  }

  private deleteObject(_path, object, node) {
    let obj: any = {id: object.id};
    if (!object.type) {
      obj = {path: _path};
    }
    this.coreService.post('inventory/delete', obj).subscribe((res: any) => {
      object.deleted = true;
      if (obj.path) {
        if (this.selectedObj && obj.path === this.selectedObj.path) {
          this.type = null;
          this.selectedData = {};
          this.selectedObj = {};
        }
        this.initTree(obj.path, null);
      } else {
        this.clearCopyObject(obj);
        this.updateTree();
      }
    });
  }

  private updateTree() {
    this.tree = [...this.tree];
    if (this.selectedData && this.selectedData.children) {
      this.selectedData.children = [...this.selectedData.children];
    }
  }

  private clearCopyObject(obj) {
    if (this.selectedData && this.selectedData.type === obj.type && this.selectedData.name === obj.name
      && this.selectedData.path === obj.path) {
      this.type = null;
      this.selectedData = {};
      this.selectedObj = {};
    }
    if (this.copyObj && this.copyObj.type === obj.type && this.copyObj.name === obj.name && this.copyObj.path === obj.path) {
      this.copyObj = null;
    }
  }

  hidePanel() {
    this.sideView.inventory.show = false;
    this.coreService.hidePanel();
  }

  showPanel() {
    this.sideView.inventory.show = true;
    this.coreService.showLeftPanel();
  }
}
