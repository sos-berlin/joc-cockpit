import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';
import {NzFormatEmitEvent, NzMessageService, NzTreeNode} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import * as _ from 'underscore';

declare const $;

@Component({
  selector: 'app-deploy-draft-modal',
  templateUrl: './single-deploy-dialog.html'
})
export class SingleDeployComponent implements OnInit {
  @Input() schedulerIds;
  @Input() data;
  @Input() type;
  @Input() releasable: boolean;
  @Input() isExport: boolean;
  @Input() isExportReleaseable: boolean;
  @Input() exportObject: any;
  @Input() display: any;
  selectedSchedulerIds = [];
  actualResult = [];
  deployablesObject = [];
  loading = true;
  submitted = false;
  comments: any = {radio: 'predefined'};
  required: boolean;
  messageList: any;
  exportObj = {
    filename: '',
    fileFormat: '.zip'
  };
  object: any = {
    checked: false,
    update: [],
    delete: [],
    store: {draftConfigurations: [], deployConfigurations: []},
    deleteObj: {deployConfigurations: []}
  };

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit() {
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
    this.init();
  }

  init() {
    let obj: any = {onlyValidObjects: true, withVersions: true};
    if (this.data.id) {
      obj.id = this.data.id;
      this.getSingleObject(obj);
      return;
    } else if (this.data.object) {
      obj.folder = this.data.path;
      obj.objectTypes = this.data.object === 'CALENDAR' ? ['WORKINGDAYSCALENDAR', 'NONWORKINGDAYSCALENDAR'] : [this.data.object];
    }
    if (this.exportObject) {
      obj.withoutRemovedObjects = true;
      obj.withVersions = this.exportObject.version !== 'draft';
      obj.onlyValidObjects = this.exportObject.isValid;
    }
    const URL = (this.isExportReleaseable || this.releasable) ? 'inventory/releasables' : 'inventory/deployables';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      this.actualResult = (this.isExportReleaseable || this.releasable) ? res.releasables : res.deployables;
      if (this.exportObject && this.exportObject.version !== 'any') {
        this.actualResult = this.actualResult.filter((value) => {
          if ((this.isExportReleaseable || this.releasable)) {
            return (this.exportObject.version !== 'draft' && value.release) || (this.exportObject.version === 'draft' && !value.release);
          } else {
            return (this.exportObject.version !== 'draft' && value.deployed) || (this.exportObject.version === 'draft' && !value.deployed);
          }
        });
      }
      this.filterTree();
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  private filterTree() {
    this.deployablesObject = this.actualResult;
    if (this.deployablesObject && this.deployablesObject.length > 0) {
      for (let j = 0; j < this.deployablesObject.length; j++) {
        if (this.deployablesObject[j].deployablesVersions && this.deployablesObject[j].deployablesVersions.length > 0) {
          this.deployablesObject[j].deployId = '';
          if (this.deployablesObject[j].valid && this.deployablesObject[j].deployablesVersions[0].versions &&
            this.deployablesObject[j].deployablesVersions[0].versions.length > 0) {
            this.deployablesObject[j].deployId = this.deployablesObject[j].deployablesVersions[0].deploymentId;
          }
        }
      }
    }
  }


  private getSingleObject(obj) {
    this.coreService.post('inventory/deployable', obj).subscribe((res: any) => {
      const result = res.deployable;
      if (result.deployablesVersions && result.deployablesVersions.length > 0) {
        result.deployId = '';
        if (result.valid && result.deployablesVersions[0].versions && result.deployablesVersions[0].versions.length > 0) {
          result.deployId = result.deployablesVersions[0].deploymentId;
        }
      }
      this.actualResult = [result];
      this.filterTree();
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  getJSObject() {
    this.object = {
      checked: false,
      update: [],
      delete: [],
      store: {draftConfigurations: [], deployConfigurations: []},
      deleteObj: {deployConfigurations: []}
    };
    const self = this;
    for (let i = 0; i < this.deployablesObject.length; i++) {
      if (this.deployablesObject[i].isChecked || !this.data.object) {
        const obj: any = {}, objDep: any = {};
        if (!this.releasable) {
          if (this.deployablesObject[i].deployId || this.deployablesObject[i].deploymentId) {
            objDep.deployConfiguration = {
              path: this.deployablesObject[i].folder + (this.deployablesObject[i].folder === '/' ? '' : '/') + this.deployablesObject[i].objectName,
              objectType: this.deployablesObject[i].objectType,
              commitId: ''
            };
            for (let j = 0; j < this.deployablesObject[i].deployablesVersions.length; j++) {
              if (this.deployablesObject[i].deployablesVersions[j].deploymentId === this.deployablesObject[i].deploymentId) {
                objDep.deployConfiguration.commitId = this.deployablesObject[i].deployablesVersions[j].commitId;
                break;
              }
            }
          } else {
            objDep.draftConfiguration = {
              path: this.deployablesObject[i].folder + (this.deployablesObject[i].folder === '/' ? '' : '/') + this.deployablesObject[i].objectName,
              objectType: this.deployablesObject[i].objectType
            };
          }
        } else {
          obj.id = this.deployablesObject[i].id;
        }
        if (this.deployablesObject[i].deleted) {
          if (!_.isEmpty(obj)) {
            self.object.delete.push(obj);
          } else if (objDep.deployConfiguration) {
            delete objDep['commitId'];
            self.object.deleteObj.deployConfigurations.push(objDep);
          }
        } else {
          if (!_.isEmpty(obj)) {
            self.object.update.push(obj);
          } else {
            if (objDep.deployConfiguration) {
              self.object.store.deployConfigurations.push(objDep);
            } else {
              self.object.store.draftConfigurations.push(objDep);
            }
          }
        }
      }
    }
  }

  deploy() {
    this.submitted = true;
    this.getJSObject();
    if (this.isExport) {
      this.export();
      return;
    }
    const obj: any = {};
    if (!this.releasable) {
      obj.controllerIds = [];
      if (this.object.store.draftConfigurations.length > 0 || this.object.store.deployConfigurations.length > 0) {
        if (this.object.store.draftConfigurations.length === 0) {
          delete this.object.store['draftConfigurations'];
        }
        if (this.object.store.deployConfigurations.length === 0) {
          delete this.object.store['deployConfigurations'];
        }
        obj.store = this.object.store;
      }

      if (this.object.deleteObj.deployConfigurations.length > 0) {
        obj.delete = this.object.deleteObj;
      }
      obj.auditLog = {};
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
      this.selectedSchedulerIds.forEach(element => {
        obj.controllerIds.push({controllerId: element});
      });
    } else {
      obj.delete = this.object.delete;
      obj.update = this.object.update;
    }

    if (!this.releasable && _.isEmpty(obj.store) && _.isEmpty(obj.delete)) {
      this.submitted = false;
      return;
    } else if (this.releasable && _.isEmpty(obj.update) && _.isEmpty(obj.delete)) {
      this.submitted = false;
      return;
    }

    const URL = this.releasable ? 'inventory/release' : 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      this.activeModal.close('ok');
    }, (error) => {
      this.submitted = false;
    });
  }

  export() {
    if ((this.object.store.deployConfigurations && this.object.store.deployConfigurations.length > 0) ||
      (this.object.store.draftConfigurations.length && this.object.store.draftConfigurations.length > 0)) {
      let param = '';
      if (this.object.store.deployConfigurations && this.object.store.deployConfigurations.length === 0) {
        delete this.object.store['deployConfigurations'];
      }
      if (this.object.store.draftConfigurations && this.object.store.draftConfigurations.length === 0) {
        delete this.object.store['draftConfigurations'];
      }

      param = param + '&exportFilter=' + JSON.stringify(this.object.store);
      if (this.comments.comment) {
        param = param + '&comment=' + this.comments.comment;
      }
      if (this.comments.timeSpent) {
        param = param + '&timeSpent=' + this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        param = param + '&ticketLink=' + encodeURIComponent(this.comments.ticketLink);
      }
      // console.log('http://jstest.zehntech.net:7446/joc/api/inventory/export?accessToken=' + this.authService.accessTokenId + '&filename=' + this.exportObj.filename + this.exportObj.fileFormat + param);
      try {
        $('#tmpFrame').attr('src', './api/inventory/export?accessToken=' + this.authService.accessTokenId + '&filename=' + this.exportObj.filename + this.exportObj.fileFormat + param);
        setTimeout(() => {
          this.submitted = false;
          this.activeModal.close('ok');
        }, 150);
      } catch (e) {
        console.log(e);
        this.submitted = false;
      }
    } else {
      this.submitted = false;
    }
  }

  checkAll() {
    for (let i = 0; i < this.deployablesObject.length; i++) {
      this.deployablesObject[i].isChecked = this.object.checked;
    }
  }

  handleCheckbox(node): void {
    node.isChecked = !node.isChecked;
    let flag = true;
    for (let i = 0; i < this.deployablesObject.length; i++) {
      if (!this.deployablesObject[i].isChecked) {
        flag = false;
        break;
      }
    }
    this.object.checked = flag;
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
  @Input() releasable: boolean;
  @Input() reDeploy: boolean;
  @Input() isExport: boolean;
  @Input() isExportReleaseable: boolean;
  @Input() exportObject: any;
  @Input() display: any;
  selectedSchedulerIds = [];
  actualResult = [];
  loading = true;
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];

  exportObj = {
    filename: '',
    fileFormat: '.zip'
  };
  object: any = {
    isRecursive: true,
    delete: [],
    update: [],
    store: {draftConfigurations: [], deployConfigurations: []},
    deleteObj: {deployConfigurations: []}
  };
  isExpandAll = false;
  submitted = false;
  comments: any = {radio: 'predefined'};
  required: boolean;
  messageList: any;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
    if (this.isExport) {
      this.object.isRecursive = false;
    }
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

  private filterTree() {
    this.nodes = [{path: '/', key: '/', name: '/', children: []}];
    this.buildDeployablesTree(this.actualResult);
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
    const obj: any = {
      folder: this.path || '/',
      recursive: true,
      onlyValidObjects: true,
      withVersions: !this.reDeploy
    };
    if (this.exportObject) {
      obj.withoutRemovedObjects = true;
      obj.withVersions = this.exportObject.version !== 'draft';
      obj.onlyValidObjects = this.exportObject.isValid;
    }
    const URL = (this.isExportReleaseable || this.releasable) ? 'inventory/releasables' : 'inventory/deployables';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      this.actualResult = (this.isExportReleaseable || this.releasable) ? res.releasables : res.deployables;
      if (this.exportObject && this.exportObject.version !== 'any') {
        this.actualResult = this.actualResult.filter((value) => {
          if ((this.isExportReleaseable || this.releasable)) {
            return (this.exportObject.version !== 'draft' && value.release) || (this.exportObject.version === 'draft' && !value.release);
          } else {
            return (this.exportObject.version !== 'draft' && value.deployed) || (this.exportObject.version === 'draft' && !value.deployed);
          }
        });
      }
      this.filterTree();
    }, (err) => {
      this.loading = false;
      this.nodes = [];
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
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].deployablesVersions && data.children[i].deployablesVersions.length > 0) {
        data.children[i].deployId = '';
        if (data.children[i].deployablesVersions[0].versions && data.children[i].deployablesVersions[0].versions.length > 0) {
          data.children[i].deployId = data.children[i].deployablesVersions[0].deploymentId;
        }
      }
    }
  }

  private buildDeployablesTree(result) {
    if (result && result.length > 0) {
      // result = _.sortBy(result, 'objectType').reverse();
      const arr = _.groupBy(_.sortBy(result, 'folder'), (res) => {
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
            nodes[i].isLeaf = false;
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
            if (nodes[i].children.length === 0 && !nodes[i].isFolder) {
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
        node.isLeaf = false;
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
            valid: data.valid,
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
            path: data.folder + (data.folder === '/' ? '' : '/') + data.objectName,
            key: data.id,
            isFolder: true,
            isLeaf: true,
            deleted: data.deleted,
            children: []
          });
        });

      }
    }
    return tempArr.concat(folderArr);
  }

  getJSObject() {
    this.object = {
      checked: false,
      update: [],
      delete: [],
      store: {draftConfigurations: [], deployConfigurations: []},
      deleteObj: {deployConfigurations: []}
    };
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((nodes[i].type || nodes[i].isFolder) && nodes[i].recursivelyDeploy) {
          let obj: any = {}, objDep: any = {};
          if (!self.releasable && !self.reDeploy) {
            if (nodes[i].deployId || nodes[i].deploymentId) {
              if (nodes[i].isFolder) {
                objDep.deployConfiguration = {
                  path: nodes[i].path,
                  objectType: 'FOLDER'
                };
              } else {
                objDep.deployConfiguration = {
                  path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
                  objectType: nodes[i].type,
                  commitId: ''
                };
              }
              if (nodes[i].deployablesVersions) {
                for (let j = 0; j < nodes[i].deployablesVersions.length; j++) {
                  if (nodes[i].deployablesVersions[j].deploymentId === nodes[i].deploymentId) {
                    objDep.deployConfiguration.commitId = nodes[i].deployablesVersions[j].commitId;
                    break;
                  }
                }
              }
            } else {
              if (nodes[i].isFolder) {
                if (nodes[i].deleted) {
                  objDep.deployConfiguration = {
                    path: nodes[i].path,
                    objectType: 'FOLDER'
                  };
                }
              } else {
                objDep[nodes[i].deleted ? 'deployConfiguration' : 'draftConfiguration'] = {
                  path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
                  objectType: nodes[i].type
                };
              }
            }
          } else {
            obj.id = nodes[i].key;
          }

          if (nodes[i].deleted) {
            if (!_.isEmpty(obj)) {
              self.object.delete.push(obj);
            } else if (objDep.deployConfiguration) {
              delete objDep['commitId'];
              self.object.deleteObj.deployConfigurations.push(objDep);
            }
          } else {
            if (!_.isEmpty(obj)) {
              self.object.update.push(obj);
            } else {
              if (objDep.deployConfiguration) {
                self.object.store.deployConfigurations.push(objDep);
              } else if (objDep.draftConfiguration) {
                self.object.store.draftConfigurations.push(objDep);
              }
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

  getRedeploy() {
    this.object.excludes = [];
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((nodes[i].type || nodes[i].isFolder) && !nodes[i].recursivelyDeploy) {
          const obj: any = {
            path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
            deployType: nodes[i].type ? nodes[i].type : 'FOLDER'
          };
          self.object.excludes.push(obj);
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
    if (this.reDeploy) {
      this.getRedeploy();
    } else {
      this.getJSObject();
    }
    if (this.isExport) {
      this.export();
      return;
    }
    const obj: any = {};
    if (this.reDeploy) {
      obj.controllerId = this.schedulerIds.selected;
      obj.folder = this.path || '/';
      obj.excludes = this.object.excludes;
    }

    if (!this.releasable && !this.reDeploy) {
      obj.controllerIds = [];
      this.selectedSchedulerIds.forEach(element => {
        obj.controllerIds.push({controllerId: element});
      });
      if (this.object.store.draftConfigurations.length > 0 || this.object.store.deployConfigurations.length > 0) {
        if (this.object.store.draftConfigurations.length === 0) {
          delete this.object.store['draftConfigurations'];
        }
        if (this.object.store.deployConfigurations.length === 0) {
          delete this.object.store['deployConfigurations'];
        }
        obj.store = this.object.store;
      }

      if (this.object.deleteObj.deployConfigurations.length > 0) {
        obj.delete = this.object.deleteObj;
      }
    } else if (this.releasable) {
      if (this.object.delete.length > 0) {
        obj.delete = this.object.delete;
      }
      if (this.object.update.length > 0) {
        obj.update = this.object.update;
      }
    }
    if (!this.releasable) {
      obj.auditLog = {};
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
    }
    if (!this.releasable && !this.reDeploy && _.isEmpty(obj.store) && _.isEmpty(obj.delete)) {
      this.submitted = false;
      return;
    } else {
      if (this.releasable) {
        if (_.isEmpty(obj) || (_.isEmpty(obj.update) && _.isEmpty(obj.delete))) {
          this.submitted = false;
          return;
        }
      }
    }

    let URL = this.releasable ? 'inventory/release' : 'inventory/deployment/deploy';
    if (this.reDeploy) {
      URL = 'inventory/deployment/redeploy';
    }
    this.coreService.post(URL, obj).subscribe((res: any) => {
      this.activeModal.close('ok');
    }, (error) => {
      this.submitted = false;
    });
  }

  export() {
    if ((this.object.store.deployConfigurations && this.object.store.deployConfigurations.length > 0) ||
      (this.object.store.draftConfigurations.length && this.object.store.draftConfigurations.length > 0)) {
      let param = '';
      if (this.object.store.deployConfigurations && this.object.store.deployConfigurations.length === 0) {
        delete this.object.store['deployConfigurations'];
      }
      if (this.object.store.draftConfigurations && this.object.store.draftConfigurations.length === 0) {
        delete this.object.store['draftConfigurations'];
      }

      param = param + '&exportFilter=' + JSON.stringify(this.object.store);
      if (this.comments.comment) {
        param = param + '&comment=' + this.comments.comment;
      }
      if (this.comments.timeSpent) {
        param = param + '&timeSpent=' + this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        param = param + '&ticketLink=' + encodeURIComponent(this.comments.ticketLink);
      }
      //console.log('http://jstest.zehntech.net:7446/joc/api/inventory/export?accessToken=' + this.authService.accessTokenId + '&filename=' + this.exportObj.filename + this.exportObj.fileFormat + param);
      try {
        $('#tmpFrame').attr('src', './api/inventory/export?accessToken=' + this.authService.accessTokenId + '&filename=' + this.exportObj.filename + this.exportObj.fileFormat + param);
        setTimeout(() => {
          this.submitted = false;
          this.activeModal.close('ok');
        }, 150);
      } catch (e) {
        console.log(e);
        this.submitted = false;
      }
    } else {
      this.submitted = false;
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
  @Input() schedulerIds;
  @Input() preferences;
  @Input() origin: any;
  @Input() display: any;

  exportObj: any = {};
  path: string;
  isExportReleaseable = false;
  isObjectTypeVisible = true;

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal) {
  }

  ngOnInit() {
    this.exportObj.objectType = 'controller';
    this.exportObj.version = 'any';
    this.exportObj.isValid = true;
    if (this.origin) {
      this.path = this.origin.path;
      this.isExportReleaseable = this.origin.dailyPlan;
      if (this.origin.controller || this.origin.dailyPlan || this.origin.object) {
        this.isObjectTypeVisible = false;
      }
      if (this.origin.dailyPlan || (this.origin.object &&
        (this.origin.object === 'SCHEDULE' || this.origin.object.match('CALENDAR')))) {
        this.exportObj.objectType = 'schedule';
      }
    }
  }

  onSubmit() {
    this.isExportReleaseable = this.exportObj.objectType === 'schedule';
    if (this.origin && this.origin.object) {
      const modalRef = this.modalService.open(SingleDeployComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.display = this.preferences.auditLog;
      modalRef.componentInstance.data = this.origin;
      modalRef.componentInstance.exportObject = this.exportObj;
      modalRef.componentInstance.isExport = true;
      modalRef.componentInstance.isExportReleaseable = this.isExportReleaseable;
      modalRef.result.then((res: any) => {
        this.activeModal.close();
      }, () => {
      });
    } else {
      const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.preferences = this.preferences;
      modalRef.componentInstance.display = this.preferences.auditLog;
      modalRef.componentInstance.path = this.path;
      modalRef.componentInstance.exportObject = this.exportObj;
      modalRef.componentInstance.isExport = true;
      modalRef.componentInstance.isExportReleaseable = this.isExportReleaseable;
      modalRef.result.then((res: any) => {
        this.activeModal.close();
      }, () => {
      });
    }
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
  @Input() display: any;
  nodes: any = [{key: '/', path: '/', name: '/', children: []}];
  version = {type: 'setOneVersion', name: ''};
  isExpandAll = false;
  loading = true;
  comments: any = {radio: 'predefined'};
  required: boolean;
  messageList: any;
  object: any = {
    isRecursive: true,
    configurations: [],
    deployments: [],
    prevVersion: ''
  };

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
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
      folder: '/',
      recursive: true,
      onlyValidObjects: true,
      withVersions: true
    }).subscribe((res) => {
      this.buildDeployablesTree(res);
      if (this.nodes.length > 0) {
        this.checkAndUpdateVersionList(this.nodes[0]);
      }
      setTimeout(() => {
        this.loading = false;
        this.updateTree();
      }, 0);
    }, (err) => {
      this.nodes = [];
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
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].deployablesVersions && data.children[i].deployablesVersions.length > 0) {
        data.children[i].deployId = '';
        if (data.children[i].deployablesVersions[0].versions && data.children[i].deployablesVersions[0].versions.length > 0) {
          data.children[i].deployId = data.children[i].deployablesVersions[0].deploymentId;
        }
      }
    }
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
    obj.auditLog = {};
    if (this.comments.comment) {
      obj.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      obj.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      obj.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.getJSObject();
    if (this.version.type === 'setSeparateVersion') {
      obj.deployments = this.object.deployments;
      this.coreService.post('inventory/deployment/set_versions', obj).subscribe((res: any) => {
        this.activeModal.close('ok');
      }, (error) => {

      });
    } else {
      if (this.object.deployments.length > 0) {
        obj.deployments = this.object.deployments;
        obj.version = this.version.name;
        this.coreService.post('inventory/deployment/set_version', obj).subscribe((res: any) => {
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
      url: this.isDeploy ? './api/inventory/deployment/import_deploy' : './api/inventory/import',
      queueLimit: 1,
      headers: [{
        name: 'X-Access-Token',
        value: this.authService.accessTokenId
      }]
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
      let obj: any = {};
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
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.pop('error', res.error.code, res.error.message);
      }
    };
  }

  import() {
    this.uploader.queue[0].upload();
  }

  cancel() {
    this.activeModal.close('Cross click');
  }
}

@Component({
  selector: 'app-create-folder-template',
  templateUrl: './create-folder-dialog.html'
})
export class CreateFolderModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() folders: any;
  @Input() rename: any;
  @Input() oldName: any;
  submitted = false;
  isUnique = true;
  folder = {error: false, name: ''};

  constructor(private coreService: CoreService, public activeModal: NgbActiveModal) {

  }

  ngOnInit() {
    if (this.rename) {
      this.folder.name = this.folders.name;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.rename) {
      const _path = this.folders.path + (this.folders.path === '/' ? '' : '/') + this.folder.name;
      this.coreService.post('inventory/store', {
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
    } else {
      if (this.folders.name !== this.folder.name) {
        this.coreService.post('inventory/rename', {
          path: this.folders.path,
          objectType: 'FOLDER',
          name: this.folder.name
        }).subscribe((res) => {
          this.activeModal.close('DONE');
        }, (err) => {
          this.submitted = false;
        });
      } else {
        this.activeModal.close('NO');
      }
    }
  }

  checkFolderName() {
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
  subscription3: Subscription;

  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;

  constructor(
    private authService: AuthService,
    public coreService: CoreService,
    private dataService: DataService,
    public modalService: NgbModal,
    private translate: TranslateService,
    private message: NzMessageService) {
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
          this.copy(res);
        } else if (res.paste) {
          this.paste(res.paste);
        } else if (res.deploy) {
          this.deployObject(res.deploy, false);
        } else if (res.release) {
          this.releaseObject(res.release);
        } else if (res.restore) {
          this.restoreObject(res.restore);
        } else if (res.rename) {
          this.rename(res.rename);
        } else if (res.back) {
          this.backToListView();
        }
      }
    });
    this.subscription3 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf();
    });
  }

  ngOnInit() {
    this.initConf();
  }

  private initConf() {
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
    this.subscription3.unsubscribe();
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
      controllerId: this.schedulerIds.selected,
      forInventory: true,
      types: ['INVENTORY']
    }).subscribe((res: any) => {
      if (res.folders.length === 0) {
        res.folders.push({name: '', path: '/'});
      }
      const tree = this.coreService.prepareTree(res, false);
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
              this.tree[0].children.splice(0, 0, children[0]);
              this.tree[0].children.splice(1, 0, children[1]);
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
                  if (destTree[i].children[x].controller) {
                    arr.push(destTree[i].children[x]);
                  }
                  if (destTree[i].children[x].dailyPlan) {
                    arr.push(destTree[i].children[x]);
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
            if (data.children.length > 1 && data.children[0].controller) {
              const index = data.children[0].controller ? 1 : 0;
              const index2 = data.children[1].dailyPlan ? 1 : 0;
              data.children.splice(0, index, children[0]);
              data.children.splice(1, index2, children[1]);
            } else {
              data.children = children;
            }
            self.updateTree();
          }, !path);
          matchData = data;
        }

        if (data.children) {
          let flag = false;
          for (let i = 0; i < data.children.length; i++) {
            if (data.children[i].controller || data.children[i].dailyPlan) {
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
      if (node.isExpanded && !node.origin.controller && !node.origin.dailyPlan && !node.origin.type && !node.origin.object) {
        let data = node.origin.children;
        if (!(data.length > 1 && data[0].controller)) {
          node.origin.loading = true;
        }
        this.updateObjects(node.origin, (children) => {
          if (data.length > 1 && data[0].controller) {

            node.isExpanded = true;
            node.origin.children[0] = children[0];
            node.origin.children[1] = children[1];
          } else {

            node.origin.children = children;
            if (data.length > 0) {
              node.origin.children = node.origin.children.concat(data);
            }
            node.origin.loading = false;
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
        if (!node.origin.type && !node.origin.object && !node.origin.controller && !node.origin.dailyPlan) {
          node.isExpanded = !node.isExpanded;
          if (node.isExpanded) {
            let data = node.origin.children;
            if (!(data.length > 1 && data[0].controller)) {
              node.origin.loading = true;
            }
            this.updateObjects(node.origin, (children) => {
              if (data.length > 1 && data[0].controller) {
                node.isExpanded = true;
                node.origin.children[0] = children[0];
                node.origin.children[1] = children[1];
              } else {
                node.origin.children = children;
                if (data.length > 0) {
                  node.origin.children = node.origin.children.concat(data);
                }
                node.origin.loading = false;
                node.origin.expanded = true;
                this.updateTree();
              }
            }, false);
          }
        } else if (node.origin.controller || node.origin.dailyPlan) {
          node.isExpanded = !node.isExpanded;
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

    let flag = true, controllerObj: any = {controllerArr: []}, dailyPlanObj: any = {dailyPlanArr: []};
    const _key = data.path === '/' ? '/' : (data.path + '/');
    if (!data.children) {
      data.children = [];
    } else if (data.children.length > 0) {
      if (data.children[0].controller) {
        controllerObj.controllerArr = data.children[0].children;
        controllerObj.expanded = data.children[0].expanded;
        controllerObj.expanded1 = true;
      }
      if (data.children.length > 1 && data.children[1].dailyPlan) {
        flag = false;
        dailyPlanObj.dailyPlanArr = data.children[1].children;
        dailyPlanObj.expanded = data.children[1].expanded;
      }
    }
    if (flag) {
      controllerObj.controllerArr = [{name: 'Workflows', object: 'WORKFLOW', children: [], path: data.path, key: (_key + 'Workflows$')},
        {name: 'Job Classes', object: 'JOBCLASS', children: [], path: data.path, key: (_key + 'Job_Classes$')},
        {name: 'Junctions', object: 'JUNCTION', children: [], path: data.path, key: (_key + 'Junctions$')},
        {name: 'Locks', object: 'LOCK', children: [], path: data.path, key: (_key + 'Locks$')}];
      dailyPlanObj.dailyPlanArr = [{name: 'Schedules', object: 'SCHEDULE', children: [], path: data.path, key: (_key + 'Schedules$')},
        {name: 'Calendars', object: 'CALENDAR', children: [], path: data.path, key: (_key + 'Calendars$')}];
    }

    this.coreService.post('inventory/read/folder', {
      path: data.path
    }).subscribe((res: any) => {
      for (let i = 0; i < controllerObj.controllerArr.length; i++) {
        controllerObj.controllerArr[i].deleted = data.deleted;
        let resObject;
        if (controllerObj.controllerArr[i].object === 'WORKFLOW') {
          resObject = res.workflows;
        } else if (controllerObj.controllerArr[i].object === 'JOBCLASS') {
          resObject = res.jobClasses;
        } else if (controllerObj.controllerArr[i].object === 'JUNCTION') {
          resObject = res.junctions;
        } else if (controllerObj.controllerArr[i].object === 'LOCK') {
          resObject = res.locks;
        }
        if (resObject) {
          if (!flag) {
            this.mergeFolderData(resObject, controllerObj.controllerArr[i], res.path);
          } else {
            controllerObj.controllerArr[i].children = resObject;
            controllerObj.controllerArr[i].children.forEach((child, index) => {
              controllerObj.controllerArr[i].children[index].type = controllerObj.controllerArr[i].object;
              controllerObj.controllerArr[i].children[index].path = res.path;
            });
            controllerObj.controllerArr[i].children = _.sortBy(controllerObj.controllerArr[i].children, 'name');
          }
        } else {
          controllerObj.controllerArr[i].children = [];
        }
      }
      for (let i = 0; i < dailyPlanObj.dailyPlanArr.length; i++) {
        dailyPlanObj.dailyPlanArr[i].deleted = data.deleted;
        let resObject;
        if (dailyPlanObj.dailyPlanArr[i].object === 'SCHEDULE') {
          resObject = res.schedules;
        } else if (dailyPlanObj.dailyPlanArr[i].object === 'CALENDAR') {
          resObject = res.calendars;
        }
        if (resObject) {
          if (!flag) {
            this.mergeFolderData(resObject, dailyPlanObj.dailyPlanArr[i], res.path);
          } else {
            dailyPlanObj.dailyPlanArr[i].children = resObject;
            dailyPlanObj.dailyPlanArr[i].children.forEach((child, index) => {
              dailyPlanObj.dailyPlanArr[i].children[index].type = dailyPlanObj.dailyPlanArr[i].object;
              dailyPlanObj.dailyPlanArr[i].children[index].path = res.path;
            });
            dailyPlanObj.dailyPlanArr[i].children = _.sortBy(dailyPlanObj.dailyPlanArr[i].children, 'name');
          }
        } else {
          dailyPlanObj.dailyPlanArr[i].children = [];
        }
      }
      const conf = [{
        name: 'Controller',
        controller: 'CONTROLLER',
        isLeaf: false,
        children: controllerObj.controllerArr,
        path: data.path,
        key: (_key + 'Controller$'),
        expanded: controllerObj.expanded,
        deleted: data.deleted
      }, {
        name: 'Daily Plan',
        dailyPlan: 'DAILYPLAN',
        isLeaf: false,
        children: dailyPlanObj.dailyPlanArr,
        path: data.path,
        key: (_key + 'Schedule$'),
        expanded: dailyPlanObj.expanded,
        deleted: data.deleted
      }];

      if ((this.preferences.joeExpandOption === 'both' || isExpandConfiguration) && !controllerObj.expanded1) {
        conf[0].expanded = true;
        conf[1].expanded = true;
      }
      cb(conf);
    }, (err) => {
      cb({
        name: 'Controller',
        controller: 'CONTROLLER',
        key: (_key + 'Controller$'),
        children: controllerObj.controllerArr,
        path: data.path,
        deleted: data.deleted
      }, {
        name: 'Daily Plan',
        dailyPlan: 'DAILYPLAN',
        key: (_key + 'Schedule$'),
        children: dailyPlanObj.dailyPlanArr,
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
    if (node.origin.controller || node.origin.dailyPlan) {
      node.origin.expanded = true;
      for (let i = 0; i < node.origin.children.length; i++) {
        if (node.origin.children[i].object === type || type.match(node.origin.children[i].object)) {
          node.origin.children[i].expanded = true;
          list = node.origin.children[i].children;
          break;
        }
      }
    } else {
      for (let i = 0; i < node.origin.children.length; i++) {
        if (node.origin.children[i].controller || node.origin.children[i].dailyPlan) {
          node.origin.children[i].expanded = true;
          for (let j = 0; j < node.origin.children[i].children.length; j++) {
            if (node.origin.children[i].children[j].object === type || type.match(node.origin.children[i].children[j].object)) {
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
      let data = node.origin.children;
      this.updateObjects(node.origin, (children) => {
        if ((type.match('CALENDAR') || type === 'SCHEDULE')) {
          children[1].expanded = true;
        } else {
          children[0].expanded = true;
        }
        if (data.length > 1 && data[0].controller) {
          node.isExpanded = true;
          node.origin.children[0] = children[0];
          node.origin.children[1] = children[1];
        } else {
          node.origin.children = children;
          if (data.length > 0) {
            node.origin.children = node.origin.children.concat(data);
          }
          node.origin.expanded = true;
        }

        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            let flg = false;
            for (let j = 0; j < children[i].children.length; j++) {
              if (children[i].children[j].object === type || type.match(children[i].children[j].object)) {
                children[i].children[j].expanded = true;
                list = children[i].children[j].children;
                flg = true;
                break;
              }
            }
            if (flg) {
              break;
            }
          }
        }
        this.createObject(type, list, node.origin.path);
      }, true);
    }
  }

  export() {
    const modalRef = this.modalService.open(ExportComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.result.then((result: any) => {
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
    modalRef.componentInstance.display = this.preferences.auditLog;
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
        node.origin.children = _.sortBy(node.origin.children, 'name');
        this.updateTree();
      }, () => {
      });
    }
  }

  exportObject(node) {
    const origin = node.origin ? node.origin : node;
    const modalRef = this.modalService.open(ExportComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.componentInstance.origin = origin;
    modalRef.result.then((result: any) => {

    }, () => {
    });
  }

  deployObject(node, releasable) {
    const origin = node.origin ? node.origin : node;
    if (releasable && origin.id) {
      this.releaseSingleObject(origin);
      return;
    }

    if (origin.object || origin.type || origin.id) {
      if (!node.origin) {
        origin.path = origin.path.substring(0, origin.path.lastIndexOf('/')) || '/';
      }
      const path = origin.path;
      const modalRef = this.modalService.open(SingleDeployComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.display = this.preferences.auditLog;
      modalRef.componentInstance.data = origin;
      modalRef.componentInstance.releasable = releasable;
      modalRef.result.then((res: any) => {
        setTimeout(() => {
          this.updateFolders(path, () => {
            this.updateTree();
          });
        }, 200);
      }, () => {
      });
    } else {
      const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static', size: releasable ? 'sm' : 'lg'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.preferences = this.preferences;
      modalRef.componentInstance.display = this.preferences.auditLog;
      modalRef.componentInstance.path = origin.path;
      modalRef.componentInstance.releasable = releasable;
      modalRef.result.then((res: any) => {
        setTimeout(() => {
          this.initTree(origin.path, null);
        }, 200);
      }, () => {
      });
    }
  }

  reDeployObject(node) {
    const origin = node.origin ? node.origin : node;
    const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.componentInstance.path = origin.path;
    modalRef.componentInstance.reDeploy = true;
    modalRef.result.then((res: any) => {
      this.initTree(origin.path, null);
    }, () => {
    });
  }

  releaseObject(data) {
    this.deployObject(data, true);
  }

  private releaseSingleObject(data) {
    const obj: any = {};
    if (data.deleted) {
      obj.delete = [{id: data.id}];
    } else {
      obj.update = [{id: data.id}];
    }
    this.coreService.post('inventory/release', obj).subscribe((res: any) => {
      this.updateFolders(data.path1 || data.path, () => {
        this.updateTree();
      });
    }, (error) => {

    });
  }

  rename(data) {
    if (data.id === this.selectedObj.id) {
      this.selectedObj.name = data.name;
    }
    this.updateFolders(data.path, () => {
      this.updateTree();
    });
  }

  renameFolder(node) {
    if (this.permission && this.permission.Inventory && this.permission.Inventory.configurations.edit) {
      const modalRef = this.modalService.open(CreateFolderModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.folders = node.origin;
      modalRef.componentInstance.rename = true;
      modalRef.result.then((res: any) => {
        if (res === 'DONE') {
          this.initTree(node.origin.path, null);
        }
      }, () => {
      });
    }
  }

  copy(node) {
    this.copyObj = node.copy || node.origin;
    let msg;
    this.translate.get('common.message.copied').subscribe(translatedValue => {
      msg = translatedValue;
    });
    this.message.success(msg);
  }

  paste(node) {
    let object = node;
    if (this.copyObj) {
      if (node instanceof NzTreeNode) {
        object = node.origin;
        if (!object.controller && !object.dailyPlan && !object.object) {
          let data = object.children;
          if (!data[0] || !data[0].controller || data.length === 0) {
            this.updateObjects(node.origin, (children) => {
              if ((this.copyObj.type === 'CALENDAR' || this.copyObj.type === 'SCHEDULE')) {
                children[1].expanded = true;
              } else {
                children[0].expanded = true;
              }
              node.origin.children = children;
              if (data.length > 0) {
                node.origin.children = node.origin.children.concat(data);
              }
              node.origin.expanded = true;
              this.updateTree();
              this.paste(node);
            }, true);
            return;
          }
          if (this.copyObj.type === 'CALENDAR' || this.copyObj.type === 'SCHEDULE') {
            data = object.children[1];
          } else {
            data = object.children[0];
          }
          data.expanded = true;
          if (data && data.children) {
            for (let i = 0; i < data.children.length; i++) {
              if (data.children[i].object === this.copyObj.type) {
                object = data.children[i];
                break;
              }
            }
          }
        }
      }
      this.coreService.post('inventory/read/configuration', {
        id: this.copyObj.id,
      }).subscribe((res: any) => {
        let obj: any = {
          type: this.copyObj.type === 'CALENDAR' ? res.configuration.type : this.copyObj.type,
          path: object.path,
          name: this.coreService.getCopyName(this.copyObj.name, object.children),
          valid: res.valid
        };
        object.expanded = true;
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
    modalRef.componentInstance.title = 'remove';
    modalRef.componentInstance.message = 'removeObject';
    modalRef.componentInstance.type = 'Remove';
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
      let obj: any = {id: object.id};
      if (!object.type) {
        obj = {path: _path, objectType: 'FOLDER'};
      }
      this.coreService.post('inventory/delete_draft', obj).subscribe((res) => {
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
      obj = {path: object.path, objectType: 'FOLDER'};
    }
    this.coreService.post('inventory/recover', obj).subscribe((res: any) => {
      object.deleted = false;
      this.initTree(obj.path || object.path, null);
    });
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  private refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          let path = args.eventSnapshots[j].path.substring(0, args.eventSnapshots[j].path.lastIndexOf('/') + 1) || '/';
          if (args.eventSnapshots[j].eventType.match(/FileBase/) && !args.eventSnapshots[j].eventId && this.isLoading) {
            this.initTree(args.eventSnapshots[j].path, path);
            break;
          } else if (args.eventSnapshots[j].eventType === 'JoeUpdated' && !args.eventSnapshots[j].eventId) {
            if (args.eventSnapshots[j].objectType === 'FOLDER' && this.isLoading) {
              this.initTree(args.eventSnapshots[j].path, path);
              break;
            } else {
              console.log(args.eventSnapshots[j]);
            }
          }
        }
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
          dest.children[i].released = sour[j].released;
          dest.children[i].hasReleases = sour[j].hasReleases;
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
          released: sour[j].released,
          valid: sour[j].valid,
          hasDeployments: sour[j].hasDeployments,
          hasReleases: sour[j].hasReleases,
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
    } else if (type === 'JOBCLASS') {
      configuration = {maxProcesses: 1};
      obj.name = this.coreService.getName(list, 'job_class1', 'name', 'job_class');
    } else if (type === 'SCHEDULE') {
      obj.name = this.coreService.getName(list, 'schedule1', 'name', 'schedule');
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
        objectType: obj.type,
        path: _path,
        valid: obj.valid ? obj.valid : !(obj.type.match(/CALENDAR/) || obj.type === 'SCHEDULE' || obj.type === 'WORKFLOW'),
        configuration: configuration
      }).subscribe((res: any) => {
        if ((obj.type === 'WORKINGDAYSCALENDAR' || obj.type === 'NONWORKINGDAYSCALENDAR')) {
          obj.objectType = obj.type;
          obj.type = 'CALENDAR';
        }
        obj.id = res.id;
        obj.valid = obj.valid ? obj.valid : !(obj.type.match(/CALENDAR/) || obj.type === 'SCHEDULE' || obj.type === 'WORKFLOW');
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
      obj = {path: _path, objectType: 'FOLDER'};
    }
    this.coreService.post('inventory/remove', obj).subscribe((res: any) => {
      object.deleted = true;
      if (node) {
        object.expanded = false;
        object.isExpanded = false;
      }
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
