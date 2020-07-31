import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import * as moment from 'moment';
import * as _ from 'underscore';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';

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
  deployables: any = [{key: 1, path: '/', name: '/', children: []}];
  isRecursive = true;
  path;
  update: any = [];
  delete: any = [];
  isExpandAll = false;
  count = 1;

  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private toasterService: ToasterService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildTree();
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

  createPath(data, path) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z && (z.name || z.path)) {
      this.createPath(z, path);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      const actualPath = _.clone(str.substring(0, str.lastIndexOf('/')));
      if (this.update.indexOf(actualPath) === -1) {
        this.update.push(_.clone(str.substring(0, str.lastIndexOf('/'))));
      }
    }
  }

  deletePath(data, path) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z && (z.name || z.path)) {
      this.deletePath(z, path);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }

      for (let i = 0; i < this.update.length; i++) {
        if (str.substring(0, str.lastIndexOf('/')) === this.update[i]) {
          this.update.splice(i, 1);
        }
      }
    }
  }

  checkRecursiveOrder(node) {
    node.recursivelyDeploy = !node.recursivelyDeploy;
    this.updateTree();
    if (this.isRecursive && node.recursivelyDeploy) {
      node.recursivelyDeploy = true;
      this.handleRecursivelyRecursion(node);
    } else if (this.isRecursive && !node.recursivelyDeploy) {
      node.recursivelyDeploy = false;
      this.unCheckedHandleRecursivelyRecursion(node);
    } else if (!this.isRecursive && node.recursivelyDeploy && !node.type) {
      node.recursivelyDeploy = true;
      this.handleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && !node.type) {
      node.recursivelyDeploy = false;
      this.unCheckedHandleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && node.type) {
      node.recursivelyDeploy = false;
      this.uncheckedParentFolder(node);
      this.path = '';
      this.deletePath(node, this.path);
    } else if (!this.isRecursive && node.recursivelyDeploy && node.type) {
      this.path = '';
      node.recursivelyDeploy = true;
      this.createPath(node, this.path);
    }
  }

  uncheckedParentFolder(node) {
    this.getParent(node).recursivelyDeploy = false;
  }

  getParent(node) {
    const x = this.treeCtrl.getTreeNodeByKey(node.key);
    if (x.getParentNode()) {
      return x.getParentNode().origin;
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
          this.createPath(data.children[i].children[index], this.path);
        }
      }
    }
  }

  unCheckedHandleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        data.children[i].children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[i].children[index], this.path);
      }
    }
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

  expandAll(): void {
    this.isExpandAll = true;
    this.updateTree();
  }

  // Collapse all Node
  collapseAll() {
    this.isExpandAll = false;
    for (let i = 0; i < this.deployables.length; i++) {
      const a = this.treeCtrl.getTreeNodeByKey(this.deployables[i].key);
      this.openFolder(a);
      if (this.deployables[i].children && this.deployables[i].children.length > 0) {
        this.expandCollapseRec(this.deployables[i].children, false);
      }
    }
  }

  updateTree() {
    this.deployables = [...this.deployables];
  }

  buildTree() {
    this.coreService.post('inventory/deployables', {
      jobschedulerId: this.schedulerIds.selected
    }).subscribe((res) => {
      this.buildDeployablesTree(res);
      setTimeout(() => {
        this.updateTree();
      }, 0);
    }, (err) => {
    });
  }

  cancel() {
    this.activeModal.dismiss();
  }

  createTempArray(obj) {
    let x = _.groupBy(obj.b, (res) => {
      return res.objectType;
    });
    for (const [key, value] of Object.entries(x)) {
      let z: any = {};
      let temp: any = value;
      z.name = value[0].objectName;
      z.object = value[0].objectType;
      z.path = value[0].folder;
      z.key = this.count++;
      z.isExpand = true;
      z.children = [];
      temp.forEach(data => {
        const objT: any = {};
        objT.key = this.count++;
        objT.name = data.objectName;
        objT.type = data.objectType;
        objT.recursivelyDeploy = false;
        objT.action = 'update';
        z.children.push(objT);
      });
      this.deployables[0].children.push(z);
    }
    let z = _.groupBy(obj.a, (res) => {
      return res.folder;
    });
    const tempFolderArr = [];
    for (const [key, value] of Object.entries(z)) {
      const az = key.split('/');
      const path = '/';
      let tOj = undefined;
      const tObj: any = {};
      for (let i = 0; i < az.length; i++) {
        if (az[i] !== '') {
          tObj.key = this.count++;
          tObj.path = path + az[i];
          tObj.name = az[i];
          tObj.children = [];
          tOj = Object.assign({}, tObj);
        }
      }
      if (az.length === 2) {
        const y = _.groupBy(value, (res) => {
          return res.objectType;
        });
        for (const [key, value] of Object.entries(y)) {
          let r: any = {};
          let temp: any = value;
          r.name = value[0].objectName;
          r.object = value[0].objectType;
          r.path = value[0].folder;
          r.key = this.count++;
          r.isExpand = true;
          r.children = [];
          temp.forEach(data => {
            const objT: any = {};
            objT.key = this.count++;
            objT.name = data.objectName;
            objT.type = data.objectType;
            objT.recursivelyDeploy = false;
            r.children.push(objT);
          });
          tOj.children.push(r);
        }
        this.deployables[0].children.push(tOj);
      } else {
        tempFolderArr.push(Object.assign({folder: key, value: value}, tOj));
      }
    }
    for (let i = 0; i < tempFolderArr.length; i++) {
      let flag = 0;
      let path = tempFolderArr[i].path.split();
      path = path.splice(0, 1);
      this.checkFolder(tempFolderArr[i], flag, this.deployables[0].children, path.length, path);
    }
  }

  checkFolder(obj, flag, mainArr, len, path) {
    for (let index = 0; index < path.length; index++) {
      for (let i = 0; i < mainArr.length; i++) {
        if (!mainArr[i].object && !mainArr[i].type) {
          if (path[index].includes(mainArr[i].path)) {
            flag++;
            path.splice(0, 1);
            if (flag !== len) {
              this.checkFolder(obj, flag, mainArr[i].children, len, path);
            } else {
              let value = Object.assign({}, obj.value);
              delete obj['value'];
              let x = _.groupBy(value, (item) => {
                return item.objectType;
              });
              for (const [key, value] of Object.entries(x)) {
                let z: any = {};
                let temp: any = value;

                z.name = value[0].objectName;
                z.object = value[0].objectType;
                z.path = value[0].folder;
                z.key = this.count++;
                z.isExpand = true;
                z.children = [];
                temp.forEach(data => {
                  const objT: any = {};
                  objT.key = this.count++;
                  objT.name = data.objectName;
                  objT.type = data.objectType;
                  objT.recursivelyDeploy = false;
                  objT.action = 'update';
                  z.children.push(objT);
                });
                obj.children.push(z);
              }
              mainArr[i].children.push(obj);
            }
            break;
          }
        }
      }
    }
  }

  private buildDeployablesTree(res) {
    if (res.deployables && res.deployables.length > 0) {
      const temp = {a: [], b: []};
      res.deployables.forEach((item) => {
        if (item.folder.split('/')[1] !== '') {
          if (item.objectType !== 'FOLDER') {
            temp.a.push(item);
          }
        } else {
          if (item.objectType !== 'FOLDER') {
            temp.b.push(item);
          }
        }
      });
      this.createTempArray(temp);
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
}

@Component({
  selector: 'app-set-version-modal',
  templateUrl: './setVersion-dialog.html'
})
export class SetVersionComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() preferences;
  @Input() schedulerIds;
  deployables: any = [{key: 1, path: '/', name: '/', children: []}];
  version = {type: 'setOneVersion', name: ''};
  isRecursive = true;
  path;
  isExpandAll = true;
  delete: any = [];
  update: any = [];
  prevVersion;
  count = 1;

  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildTree();
  }

  buildTree() {
    this.coreService.post('inventory/deployables', {
      jobschedulerId: this.schedulerIds.selected
    }).subscribe((res) => {
      this.buildDeployablesTree(res);
      setTimeout(() => {
        this.updateTree();
      }, 0);
    }, (err) => {
    });
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
    if (z && (z.name || z.path)) {
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
  }

  deletePath(data, path, action) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z && (z.name || z.path)) {
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
      node.recursivelyDeploy = true;
      this.handleRecursivelyRecursion(node);
    } else if (this.isRecursive && !node.recursivelyDeploy) {
      node.recursivelyDeploy = false;
      this.unCheckedHandleRecursivelyRecursion(node);
    } else if (!this.isRecursive && node.recursivelyDeploy && !node.type) {
      node.recursivelyDeploy = true;
      this.handleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && !node.type) {
      node.recursivelyDeploy = false;
      this.unCheckedHandleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && node.type) {
      node.recursivelyDeploy = false;
      this.uncheckedParentFolder(node);
      this.path = '';
      this.deletePath(node, this.path, node.action);
    } else if (!this.isRecursive && node.recursivelyDeploy && node.type) {
      this.path = '';
      node.recursivelyDeploy = true;
      this.createPath(node, this.path, node.action, undefined);
    }
  }

  uncheckedParentFolder(node) {
    this.getParent(node).recursivelyDeploy = false;
  }

  getParent(node) {
    const x = this.treeCtrl.getTreeNodeByKey(node.key);
    if (x.getParentNode()) {
      return x.getParentNode().origin;
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
          this.createPath(data.children[i].children[index], this.path, data.children[i].children[index].action, undefined);
        }
      }
    }
  }

  unCheckedHandleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        data.children[i].children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[i].children[index], this.path, data.children[i].children[index].action);
      }
    }
  }

  handleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = true;
        this.path = '';
        this.createPath(data.children[index], this.path, data.children[index].action, undefined);
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
      const a = this.treeCtrl.getTreeNodeByKey(this.deployables[i].key);
      this.openFolder(a);
      if (this.deployables[i].children && this.deployables[i].children.length > 0) {
        this.expandCollapseRec(this.deployables[i].children, false);
      }
    }
  }

  updateTree() {
    this.deployables = [...this.deployables];
  }

  cancel() {
    this.activeModal.dismiss();
  }

  createTempArray(obj) {
    let x = _.groupBy(obj.b, (res) => {
      return res.objectType;
    });
    for (const [key, value] of Object.entries(x)) {
      let z: any = {};
      let temp: any = value;
      z.path = '/';
      z.name = value[0].objectName;
      z.object = value[0].objectType;
      z.path = value[0].folder + value[0].objectType;
      z.key = this.count++;
      z.isExpand = true;
      z.children = [];
      temp.forEach(data => {
        const objT: any = {};
        objT.key = this.count++;
        objT.name = data.objectName;
        objT.type = data.objectType,
          objT.recursivelyDeploy = false,
          objT.action = 'update';
        z.children.push(objT);
      });
      this.deployables[0].children.push(z);
    }
    let z = _.groupBy(obj.a, (res) => {
      return res.folder;
    });
    const tempFolderArr = [];
    for (const [key, value] of Object.entries(z)) {
      const az = key.split('/');
      const path = '/';
      let tOj = undefined;
      const tObj: any = {};
      for (let i = 0; i < az.length; i++) {
        if (az[i] !== '') {
          tObj.key = this.count++;
          tObj.path = path + az[i];
          tObj.name = az[i];
          tObj.children = [];
          tOj = Object.assign({}, tObj);
        }
      }
      if (az.length === 2) {
        const y = _.groupBy(value, (res) => {
          return res.objectType;
        });
        for (const [key, value] of Object.entries(y)) {
          let r: any = {};
          let temp: any = value;
          r.name = value[0].objectName;
          r.object = value[0].objectType;
          r.path = value[0].folder;
          r.key = this.count++;
          r.isExpand = true;
          r.children = [];
          temp.forEach(data => {
            const objT: any = {};
            objT.key = this.count++;
            objT.name = data.objectName;
            objT.type = data.objectType;
            objT.recursivelyDeploy = false;
            objT.action = 'update';
            r.children.push(objT);
          });
          tOj.children.push(r);
        }
        this.deployables[0].children.push(tOj);
      } else {
        tempFolderArr.push(Object.assign({folder: key, value: value}, tOj));
      }
    }
    for (let i = 0; i < tempFolderArr.length; i++) {
      let flag = 0;
      let path = tempFolderArr[i].path.split();
      path = path.splice(0, 1);
      this.checkFolder(tempFolderArr[i], flag, this.deployables[0].children, path.length, path);
    }
  }

  checkFolder(obj, flag, mainArr, len, path) {
    for (let index = 0; index < path.length; index++) {
      for (let i = 0; i < mainArr.length; i++) {
        if (!mainArr[i].object && !mainArr[i].type) {
          if (path[index].includes(mainArr[i].path)) {
            flag++;
            path.splice(0, 1);
            if (flag !== len) {
              this.checkFolder(obj, flag, mainArr[i].children, len, path);
            } else {
              let value = Object.assign({}, obj.value);
              delete obj['value'];
              let x = _.groupBy(value, (item) => {
                return item.objectType;
              });
              for (const [key, value] of Object.entries(x)) {
                let z: any = {};
                let temp: any = value;
                z.name = value[0].objectName;
                z.object = value[0].objectType;
                z.path = value[0].folder;
                z.key = this.count++;
                z.isExpand = true;
                z.children = [];
                temp.forEach(data => {
                  const objT: any = {};
                  objT.key = this.count++;
                  objT.name = data.objectName;
                  objT.type = data.objectType;
                  objT.recursivelyDeploy = false;
                  objT.action = 'update';
                  z.children.push(objT);
                });
                obj.children.push(z);
              }
              mainArr[i].children.push(obj);
            }
            break;
          }
        }
      }
    }
  }

  private buildDeployablesTree(res) {
    if (res.deployables && res.deployables.length > 0) {
      const temp = {a: [], b: []};
      res.deployables.forEach((item) => {
        if (item.folder.split('/')[1] !== '') {
          if (item.objectType !== 'FOLDER') {
            temp.a.push(item);
          }
        } else {
          if (item.objectType !== 'FOLDER') {
            temp.b.push(item);
          }
        }
      });
      this.createTempArray(temp);
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
  deployables = [{key: 1, children: []}];
  isRecursive = false;
  showUnSigned = true;
  showSigned = true;
  path;
  jsObjects = [];
  isExpandAll = true;
  count = 0;

  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private authService: AuthService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildTree();
  }

  buildTree() {
    this.coreService.post('inventory/deployables', {
      jobschedulerId: this.schedulerIds.selected
    }).subscribe((res) => {
      this.buildDeployablesTree(res);
      setTimeout(() => {
        this.updateTree();
      }, 0);
    }, (err) => {
    });
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
    } else if (!node.recursivelyDeploy && node.type) {
      this.subSingleExport(node);
    }
  }

  getParent(node) {
    const x = this.treeCtrl.getTreeNodeByKey(node.key);
    if (x.getParentNode()) {
      return x.getParentNode().origin;
    } else {
      return undefined;
    }
  }

  createPath(data, path) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z && (z.name || z.path)) {
      this.createPath(z, path);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      const actualPath = _.clone(str.substring(0, str.lastIndexOf('/')));
      if (this.jsObjects.indexOf(actualPath) === -1) {
        this.jsObjects.push(_.clone(str.substring(0, str.lastIndexOf('/'))));
      }
    }
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
    if (z && (z.name || z.path)) {
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
        if (str.substring(0, str.lastIndexOf('/')) === this.jsObjects[i]) {
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
      const a = this.treeCtrl.getTreeNodeByKey(this.deployables[i].key);
      this.openFolder(a);
      if (this.deployables[i].children && this.deployables[i].children.length > 0) {
        this.expandCollapseRec(this.deployables[i].children, false);
      }
    }
  }

  updateTree() {
    this.deployables = [...this.deployables];
  }

  createTempArray(obj) {
    let x = _.groupBy(obj.b, (res) => {
      return res.objectType;
    });
    for (const [key, value] of Object.entries(x)) {
      let z: any = {};
      let temp: any = value;
      z.path = '/';
      z.name = (value[0].objectType.toLowerCase())[0].toUpperCase() + (value[0].objectType.toLowerCase()).slice(1);
      z.object = value[0].objectType;
      z.path = value[0].folder + value[0].objectType;
      z.key = this.count++;
      z.isExpand = true;
      z.children = [];
      temp.forEach(data => {
        const objT: any = {};
        objT.key = this.count++;
        objT.name = data.objectName;
        objT.type = data.objectType,
          objT.isSigned = true;
        z.children.push(objT);
      });
      this.deployables[0].children.push(z);
    }
    let z = _.groupBy(obj.a, (res) => {
      return res.folder;
    });
    const tempFolderArr = [];
    for (const [key, value] of Object.entries(z)) {
      const az = key.split('/');
      const path = '/';
      let tOj = undefined;
      const tObj: any = {};
      for (let i = 0; i < az.length; i++) {
        if (az[i] !== '') {
          tObj.key = this.count++;
          tObj.path = path + az[i];
          tObj.name = az[i];
          tObj.children = [];
          tOj = Object.assign({}, tObj);
        }
      }
      if (az.length === 2) {
        const y = _.groupBy(value, (res) => {
          return res.objectType;
        });
        for (const [key, value] of Object.entries(y)) {
          let r: any = {};
          let temp: any = value;
          r.name = (value[0].objectType.toLowerCase())[0].toUpperCase() + (value[0].objectType.toLowerCase()).slice(1);
          r.object = value[0].objectType;
          r.path = value[0].folder + '/' + value[0].objectType;
          r.key = this.count++;
          r.isExpand = true;
          r.children = [];
          temp.forEach(data => {
            const objT: any = {};
            objT.key = this.count++;
            objT.name = data.objectName;
            objT.type = data.objectType,
              objT.isSigned = false;
            r.children.push(objT);
          });
          tOj.children.push(r);
        }
        this.deployables[0].children.push(tOj);
      } else {
        tempFolderArr.push(Object.assign({folder: key, value: value}, tOj));
      }
    }
    for (let i = 0; i < tempFolderArr.length; i++) {
      let flag = 0;
      let path = tempFolderArr[i].path.split();
      path = path.splice(0, 1);
      this.checkFolder(tempFolderArr[i], flag, this.deployables[0].children, path.length, path);
    }
  }

  checkFolder(obj, flag, mainArr, len, path) {
    for (let index = 0; index < path.length; index++) {
      for (let i = 0; i < mainArr.length; i++) {
        if (!mainArr[i].object && !mainArr[i].type) {
          if (path[index].includes(mainArr[i].path)) {
            flag++;
            path.splice(0, 1);
            if (flag !== len) {
              this.checkFolder(obj, flag, mainArr[i].children, len, path);
            } else {
              let value = Object.assign({}, obj.value);
              delete obj['value'];
              let x = _.groupBy(value, (item) => {
                return item.objectType;
              });
              for (const [key, value] of Object.entries(x)) {
                let z: any = {};
                let temp: any = value;
                z.path = '/';
                z.name = (value[0].objectType.toLowerCase())[0].toUpperCase() + (value[0].objectType.toLowerCase()).slice(1);
                z.object = value[0].objectType;
                z.path = value[0].folder + value[0].objectType;
                z.key = this.count++;
                z.isExpand = true;
                z.children = [];
                temp.forEach(data => {
                  const objT: any = {};
                  objT.key = this.count++;
                  objT.name = data.objectName;
                  objT.type = data.objectType,
                    objT.isSigned = true;
                  z.children.push(objT);
                });
                obj.children.push(z);
              }
              mainArr[i].children.push(obj);
            }
            break;
          }
        }
      }
    }
  }

  cancel() {
    this.activeModal.dismiss();
  }

  private buildDeployablesTree(res) {
    if (res.deployables && res.deployables.length > 0) {
      const temp = {a: [], b: []};
      res.deployables.forEach((item) => {
        if (item.folder.split('/')[1] !== '') {
          if (item.objectType !== 'FOLDER') {
            temp.a.push(item);
          }
        } else {
          if (item.objectType !== 'FOLDER') {
            temp.b.push(item);
          }
        }
      });
      this.createTempArray(temp);
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
  template: '<div id="full-calendar"></div>'
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
    let path = this.calendar.calendarPath;
    this.coreService.post('inventory/read/configuration', {
      jobschedulerId: this.schedulerId,
      objectType: 'CALENDAR',
      path: path,
    }).subscribe((res: any) => {
      this.calendar = JSON.parse(res.configuration);
      this.calendar.path = path;
      let obj = {
        jobschedulerId: this.schedulerId,
        dateFrom: this.calendar.from || moment().format('YYYY-MM-DD'),
        dateTo: this.calendar.to,
        path: path
      };
      this.toDate = _.clone(obj.dateTo);
      if (new Date(obj.dateTo).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
        obj.dateTo = this.calendarTitle + '-12-31';
      }
      this.getDates(obj, true);
    });

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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getDates(obj, flag: boolean): void {
    this.planItems = [];
    this.coreService.post('inventory/calendar/dates', obj).subscribe((result: any) => {
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
      configuration: '{}'
    }).subscribe((res: any) => {
      this.activeModal.close({
        id: res.id,
        name: this.folder.name,
        title: res.path,
        path: res.path,
        key: res.path,
        children: [],
        isLeaf: true
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
  nodes: any = [];
  tree: any = [];
  isLoading = true;
  pageView: any = 'grid';
  options: any = {};
  data: any = {};
  copyObj: any;
  selectedObj: any = {};
  selectedData: any = {};
  selectedPath: string;
  type: string;
  jobConfig: any;
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
        if (res.add) {
          this.tree = [...this.tree];
        } else if (res.set) {
          if (this.treeCtrl) {
            const parent = this.treeCtrl.getTreeNodeByKey(res.set.path);
            this.selectedData = res.set;
            this.selectedData.parentNode = parent.origin.children[0];
            this.setSelectedObj(this.selectedObj.type, res.set.name, res.set.path);
          }
        } else if (res.copy) {
          this.copyObj = res.copy;
        } else if (res.paste) {
          this.paste(res.paste);
        }
      }
    });
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
    this.initTree(null, null);
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.coreService.tabs._configuration.state = 'inventory';
    this.jobConfig.expand_to = this.tree;
    this.jobConfig.selectedObj = this.selectedObj;
    this.jobConfig.copyObj = this.copyObj;
  }

  initTree(path, mainPath) {
    this.isLoading = true;
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['INVENTORY']
    }).subscribe((res) => {
      let tree = this.coreService.prepareTree(res);
      this.nodes = JSON.parse(JSON.stringify(tree));
      if (!_.isEmpty(this.jobConfig.expand_to) && !_.isEmpty(this.jobConfig.selectedObj)) {
        this.tree = this.recursiveTreeUpdate(tree, this.jobConfig.expand_to);
        this.selectedPath = this.jobConfig.selectedObj.path;
        this.selectedObj = this.jobConfig.selectedObj;
        this.copyObj = this.jobConfig.copyObj;
        this.updateFolders(this.selectedPath, (response) => {
          this.isLoading = false;
          this.tree = [...this.tree];
          this.type = this.jobConfig.selectedObj.type;
          if (response) {
            this.selectedData = response.data;
            this.selectedData.parentNode = response.parentNode;
          }
        });
      } else {
        this.tree = tree;
        if (this.tree.length > 0) {
          this.updateObjects(this.tree[0], (children) => {
            this.isLoading = false;
            this.tree[0].children.splice(0, 0, children);
            this.tree[0].expanded = true;
            this.tree = [...this.tree];
          }, false);
        }
        this.selectedPath = this.tree[0].path;
      }
    }, () => this.isLoading = false);
  }

  recursiveTreeUpdate(scrTree, destTree) {
    if (scrTree && destTree) {
      for (let j = 0; j < scrTree.length; j++) {
        for (let i = 0; i < destTree.length; i++) {
          if (destTree[i].path && scrTree[j].path && (destTree[i].path === scrTree[j].path)) {
            scrTree[j].expanded = destTree[i].expanded;
            if (scrTree[j].deleted) {
              scrTree[j].expanded = false;
            }
            if (destTree[i].children && destTree[i].children.length > 0) {
              let arr = [];
              for (let x = 0; x < destTree[i].children.length; x++) {
                if (destTree[i].children[x].configuration) {
                  arr.push(destTree[i].children[x]);
                  break;
                }
              }
              if (scrTree[j].children) {
                scrTree[j].children = arr.concat(scrTree[j].children);
              } else {
                scrTree[j].children = arr;
              }
            }
            if (scrTree[j].children && destTree[i].children) {
              this.recursiveTreeUpdate(scrTree[j].children, destTree[i].children);
            }
            break;
          }
        }
      }
    }
    return scrTree;
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
          }, false);
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
    if (!matchData) {
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
            node.origin.isLeaf = false;
            this.tree = [...this.tree];
          }
        }, false);
      }
    }
  }

  selectNode(node: NzTreeNode | NzFormatEmitEvent): void {
    if (node instanceof NzTreeNode) {
      if (node.origin.key || node.origin.deleted || !(node.origin.object || node.origin.type || node.origin.configuration)) {
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
                node.origin.isLeaf = false;
                this.tree = [...this.tree];
              }
            }, true);
          }
        }
        return;
      }
      if (this.preferences.expandOption === 'both' && !node.origin.type) {
        node.isExpanded = true;
      }
      if (!node.origin.configuration && !node.origin.key) {
        this.type = node.origin.object || node.origin.type;
        this.selectedData = node.origin;
        if (node.parentNode.origin.configuration) {
          this.selectedData.parentNode = node.parentNode.origin;
        } else if (node.parentNode.parentNode && node.parentNode.parentNode.origin.configuration) {
          this.selectedData.parentNode = node.parentNode.parentNode.origin;
        }
        this.setSelectedObj(this.type, node.origin.name, node.origin.path);
      }
    }
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
      arr = [{name: 'Workflows', object: 'WORKFLOW', children: [], path: data.path},
        {name: 'Job Classes', object: 'JOBCLASS', children: [], path: data.path},
        {name: 'Junctions', object: 'JUNCTION', children: [], path: data.path},
        {name: 'Orders', object: 'ORDER', children: [], path: data.path},
        {name: 'Agent Clusters', object: 'AGENTCLUSTER', children: [], path: data.path},
        {name: 'Locks', object: 'LOCK', children: [], path: data.path},
        {name: 'Calendars', object: 'CALENDAR', children: [], path: data.path}];
    }

    this.coreService.post('inventory/read/folder', {
      jobschedulerId: this.schedulerIds.selected,
      path: data.path
    }).subscribe((res: any) => {
      for (let i = 0; i < arr.length; i++) {
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
          }
        } else {
          arr[i].children = [];
        }
      }
      let conf = {
        name: 'Configuration',
        configuration: 'CONFIGURATION',
        children: arr,
        path: data.path,
        expanded: false
      };

      if ((this.preferences.joeExpandOption === 'both' || isExpandConfiguration)) {
        conf.expanded = true;
      }
      cb(conf);
    }, (err) => {
      cb({
        name: 'Configuration',
        configuration: 'CONFIGURATION',
        children: arr,
        path: data.path
      });
    });
  }

  addObject(data) {
    if (data instanceof NzTreeNode) {
      data.isExpanded = true;
    }
    const object = data.origin;
    this.createObject(object.object, object.children, object.path);
  }

  newObject(node, type) {
    let list;
    if (node instanceof NzTreeNode) {
      node.isExpanded = true;
      node.origin.isLeaf = false;
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
          node.origin.isLeaf = false;
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
    if (this.permission && this.permission.JobschedulerMaster && this.permission.JobschedulerMaster.administration.configurations.edit) {
      const modalRef = this.modalService.open(CreateFolderModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.folders = node.origin;
      modalRef.result.then((res: any) => {
        node.origin.children.push(res);
        node.origin.isLeaf = false;
        this.tree = [...this.tree];
      }, () => {

      });
    }
  }

  deployObject(node) {
    let arr = [];

    if (node.origin.object) {
      for (let i = 0; i < node.origin.children.length; i++) {
        const _path = node.origin.children[i].path + (node.origin.children[i].path === '/' ? '' : '/') + node.origin.children[i].name;
        arr.push(_path);
      }
    } else {
      arr.push(node.origin.path + (node.origin.path === '/' ? '' : '/') + node.origin.name);
    }
    this.coreService.post('publish/deploy', {
      schedulers: [{jobscedulerId: this.schedulerIds.selected}],
      update: arr,
    }).subscribe((res: any) => {
      this.tree = [...this.tree];
    });
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
        id: this.data.id,
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
        this.tree = [...this.tree];
      });
    }, () => {

    });
  }

  restoreObject(node) {

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

  private setSelectedObj(type, name, path) {
    this.selectedObj = {type: type, name: name, path: path};
  }

  private mergeFolderData(sour, dest, path) {
    for (let i = 0; i < dest.children.length; i++) {
      for (let j = 0; j < sour.length; j++) {
        if (dest.children[i].name === sour[j].name) {
          dest.children[i].deleted = sour[j].deleted;
          dest.children[i].deployed = sour[j].deployed;
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
          type: dest.object,
        });
      }
    }
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
      configuration = {lifetime: 60};
      obj.name = this.coreService.getName(list, 'junction1', 'name', 'junction');
    } else if (type === 'AGENTCLUSTER') {
      configuration = {maxProcess: 1};
      obj.name = this.coreService.getName(list, 'agent-cluster1', 'name', 'agent-cluster');
    } else if (type === 'JOBCLASS') {
      configuration = {maxProcess: 1};
      obj.name = this.coreService.getName(list, 'job-class1', 'name', 'job-class');
    } else if (type === 'ORDER') {
      obj.name = this.coreService.getName(list, 'order1', 'name', 'order');
    } else if (type === 'LOCK') {
      obj.name = this.coreService.getName(list, 'lock1', 'name', 'lock');
    } else if (type === 'CALENDAR') {
      obj.name = this.coreService.getName(list, 'calendar1', 'name', 'calendar');
    }
    this.storeObject(obj, list, JSON.stringify(configuration));
  }

  private storeObject(obj, list, configuration) {
    const _path = obj.path + (obj.path === '/' ? '' : '/') + obj.name;
    if (_path && obj.type) {
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerIds.selected,
        objectType: obj.type,
        path: _path,
        configuration: configuration
      }).subscribe((res: any) => {
        obj.id = res.id;
        list.push(obj);
        if (this.selectedData && this.selectedData.children) {
          this.selectedData.children = [...this.selectedData.children];
        }
        this.tree = [...this.tree];
      });
    }
  }

  private deleteObject(_path, object, node) {
    this.coreService.post('inventory/delete', {
      jobschedulerId: this.schedulerIds.selected,
      objectType: object.type || 'FOLDER',
      path: _path,
      id: object.id
    }).subscribe((res: any) => {
      object.delete = true;
      this.tree = [...this.tree];
    });
  }

  private clearCopyObject(obj) {
    if (this.selectedData && this.selectedData.type === obj.type && this.selectedData.name === obj.name && this.selectedData.path === obj.path) {
      this.type = null;
      this.selectedData = {};
      this.selectedObj = {};
    }
    if (this.copyObj && this.copyObj.type === obj.type && this.copyObj.name === obj.name && this.copyObj.path === obj.path) {
      this.copyObj = null;
    }
  }
}
