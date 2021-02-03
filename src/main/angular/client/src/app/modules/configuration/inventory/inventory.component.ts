import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import {NzFormatEmitEvent, NzMessageService, NzTreeNode} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {InventoryService} from './inventory.service';
import * as _ from 'underscore';
import {ClipboardService} from 'ngx-clipboard';
import {saveAs} from 'file-saver';
declare const $;

@Component({
  selector: 'app-deploy-draft-modal',
  templateUrl: './single-deploy-dialog.html'
})
export class SingleDeployComponent implements OnInit {
  @Input() schedulerIds;
  @Input() data;
  @Input() type;
  @Input() display: any;
  selectedSchedulerIds = [];
  deployablesObject = [];
  loading = true;
  submitted = false;
  comments: any = {radio: 'predefined'};
  required: boolean;
  messageList: any;
  object: any = {
    store: {draftConfigurations: [], deployConfigurations: []},
    delete: {deployConfigurations: []}
  };

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
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
    let obj: any = {onlyValidObjects: true, withVersions: true, id: this.data.id};
    this.getSingleObject(obj);
  }

  private getSingleObject(obj) {
    this.coreService.post('inventory/deployable', obj).subscribe((res: any) => {
      const result = res.deployable;
      if (result.deployablesVersions && result.deployablesVersions.length > 0 && !result.deleted) {
        result.deployId = '';
        if (result.valid && result.deployablesVersions[0].versions && result.deployablesVersions[0].versions.length > 0) {
          result.deployId = result.deployablesVersions[0].deploymentId;
        }
      } else {
        result.deployablesVersions = [];
      }
      this.deployablesObject = [result];
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  getJSObject() {
    this.object = {
      store: {draftConfigurations: [], deployConfigurations: []},
      delete: {deployConfigurations: []}
    };
    const self = this;
    for (let i = 0; i < this.deployablesObject.length; i++) {
      if (this.deployablesObject[i].isChecked || !this.data.object) {
        const obj: any = {}, objDep: any = {};
        if (this.deployablesObject[i].deployId || this.deployablesObject[i].deploymentId) {
          objDep.configuration = {
            path: this.deployablesObject[i].folder + (this.deployablesObject[i].folder === '/' ? '' : '/') + this.deployablesObject[i].objectName,
            objectType: this.deployablesObject[i].objectType
          };
          for (let j = 0; j < this.deployablesObject[i].deployablesVersions.length; j++) {
            if (this.deployablesObject[i].deployablesVersions[j].deploymentId === this.deployablesObject[i].deploymentId ||
              this.deployablesObject[i].deployablesVersions[j].deploymentId === this.deployablesObject[i].deployId) {
              objDep.configuration.commitId = this.deployablesObject[i].deployablesVersions[j].commitId;
              break;
            }
          }
        } else {
          objDep.configuration = {
            path: this.deployablesObject[i].folder + (this.deployablesObject[i].folder === '/' ? '' : '/') + this.deployablesObject[i].objectName,
            objectType: this.deployablesObject[i].objectType
          };
        }

        if (this.deployablesObject[i].deleted) {
          if (!_.isEmpty(obj)) {
            self.object.delete.push(obj);
          } else if (objDep.configuration) {
            self.object.delete.deployConfigurations.push(objDep);
          }
        } else {
          if (objDep.configuration) {
            if (objDep.configuration.commitId) {
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
    const obj: any = {
      controllerIds: this.selectedSchedulerIds,
      auditLog: {}
    };
    if (this.object.store.draftConfigurations.length > 0 || this.object.store.deployConfigurations.length > 0) {
      if (this.object.store.draftConfigurations.length === 0) {
        delete this.object.store['draftConfigurations'];
      }
      if (this.object.store.deployConfigurations.length === 0) {
        delete this.object.store['deployConfigurations'];
      }
      obj.store = this.object.store;
    }
    if (this.object.delete.deployConfigurations.length > 0) {
      obj.delete = this.object.delete;
    }
    if (this.comments.comment) {
      obj.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      obj.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      obj.auditLog.ticketLink = this.comments.ticketLink;
    }

    if (_.isEmpty(obj.store) && _.isEmpty(obj.delete)) {
      this.submitted = false;
      return;
    }
    const URL = 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe((res: any) => {
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
  @Input() display: any;
  @Input() data: any;
  @Input() isRemove: any;
  selectedSchedulerIds = [];
  actualResult = [];
  loading = true;
  nodes: any = [{path: '/', key: '/', name: '/', children: [], isFolder: true}];
  object: any = {
    isRecursive: false,
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
  isDeleted = false;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService,
              private authService: AuthService, private inventoryService: InventoryService) {
  }

  ngOnInit() {
    if (this.data && this.data.deleted) {
      this.isDeleted = true;
    }
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
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
    const self = this;

    function recursive(node) {
      for (let i = 0; i < node.length; i++) {
        if (node[i].children && node[i].children.length > 0) {
          if (!node[i].isCall) {
            self.inventoryService.checkAndUpdateVersionList(node[i]);
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
    this.nodes = [{path: '/', key: '/', name: '/', children: [], isFolder: true}];
    this.buildDeployablesTree(this.actualResult);
    setTimeout(() => {
      this.loading = false;
      if (this.path) {
        this.getChildTree();
        if (this.nodes.length > 0) {
          this.nodes[0].expanded = true;
        }
      }
      if (this.nodes.length > 0) {
        this.preselected(this.nodes[0]);
        this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
      }
    }, 0);
  }

  private preselected(node) {
    node.checked = true;
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].type) {
        node.children[i].checked = node.checked;
      }
      if (node.children[i].isFolder) {
        break;
      }
    }
  }

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.object.isRecursive) {
      const node = e.node;
      if (node.origin.type && node.parentNode) {
        node.parentNode.isHalfChecked = true;
        let flag = true;
        if (!node.isChecked) {
          node.parentNode.isChecked = false;
          flag = this.inventoryService.checkHalfCheckBox(node.parentNode, false);
        } else {
          flag = this.inventoryService.checkHalfCheckBox(node.parentNode, true);
          node.parentNode.isChecked = flag;
        }
        node.parentNode.isHalfChecked = !flag;
      }
      if (!node.origin.type) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].origin.type) {
            node.children[i].isChecked = node.isChecked;
          }
          if (node.children[i].origin.isFolder) {
            break;
          }
        }
      }
    }
  }

  private getChildTree() {
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
      withRemovedObjects: true
    };
    if (this.data && this.data.object) {
      obj.recursive = false;
      obj.objectTypes = this.data.object === 'CALENDAR' ? ['WORKINGDAYSCALENDAR', 'NONWORKINGDAYSCALENDAR'] : [this.data.object];
    }
    if (this.releasable) {
      obj.withoutReleased = true;
    } else {
      obj.withVersions = !this.reDeploy;
    }
    if (this.isRemove) {
      obj.recursive = false;
      obj.withRemovedObjects = false;
      obj.withoutDrafts = true;
    }
    const URL = this.releasable ? 'inventory/releasables' : 'inventory/deployables';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      this.actualResult = this.releasable ? res.releasables : res.deployables;
      this.actualResult = this.inventoryService.sortList(this.actualResult);
      this.filterTree();
    }, (err) => {
      this.loading = false;
      this.nodes = [];
    });
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    let node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      this.inventoryService.checkAndUpdateVersionList(node.origin);
    }
  }

  private buildDeployablesTree(result) {
    if (result && result.length > 0) {
      const arr = _.groupBy(_.sortBy(result, 'folder'), (res) => {
        return res.folder;
      });
      this.inventoryService.generateTree(arr, this.nodes);
    } else {
      this.nodes = [];
    }
  }

  getJSObject() {
    this.object.store = {draftConfigurations: [], deployConfigurations: []};
    this.object.deleteObj = {deployConfigurations: []};
    const self = this;
    let selectFolder = true;
    if (this.data && this.data.object) {
      selectFolder = false;
    }
    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((nodes[i].type || nodes[i].isFolder) && nodes[i].checked) {
          let objDep: any = {};
          if (nodes[i].deployId || nodes[i].deploymentId || nodes[i].isFolder) {
            if (nodes[i].isFolder) {
              if (selectFolder) {
                objDep.configuration = {
                  path: nodes[i].path,
                  objectType: 'FOLDER',
                  recursive: self.object.isRecursive
                };
              }
            } else {
              objDep.configuration = {
                path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
                objectType: nodes[i].type
              };
              if (nodes[i].deployablesVersions) {
                for (let j = 0; j < nodes[i].deployablesVersions.length; j++) {
                  if (nodes[i].deployablesVersions[j].deploymentId === nodes[i].deploymentId ||
                    nodes[i].deployablesVersions[j].deploymentId === nodes[i].deployId) {
                    objDep.configuration.commitId = nodes[i].deployablesVersions[j].commitId;
                    break;
                  }
                }
              }
            }
          } else {
            objDep.configuration = {
              path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
              objectType: nodes[i].type
            };
          }
          if (objDep.configuration) {
            if (nodes[i].deleted) {
              if (objDep.configuration) {
                if (objDep.configuration.objectType === 'FOLDER') {
                  objDep.configuration.recursive = true;
                }
                self.object.deleteObj.deployConfigurations.push(objDep);
              }
            } else {
              if (objDep.configuration) {
                if (nodes[i].isFolder) {
                  let check1 = false, check2 = false, isEmpty = false;
                  if (nodes[i].children && nodes[i].children.length > 0) {
                    for (let j = 0; j < nodes[i].children.length; j++) {
                      if (nodes[i].children[j].type) {
                        isEmpty = true;
                        if ((nodes[i].children[j].deployId || nodes[i].children[j].deploymentId) && !check1) {
                          check1 = true;
                          self.object.store.deployConfigurations.push(objDep);
                        } else if (!check2) {
                          check2 = true;
                          self.object.store.draftConfigurations.push(objDep);
                        }
                        if (check1 && check2) {
                          break;
                        }
                      }
                    }
                  }
                  if (!isEmpty) {
                    self.object.store.deployConfigurations.push(objDep);
                    self.object.store.draftConfigurations.push(objDep);
                  }
                } else {
                  if (objDep.configuration.commitId) {
                    self.object.store.deployConfigurations.push(objDep);
                  } else {
                    self.object.store.draftConfigurations.push(objDep);
                  }
                }
              }
            }
          }
        }
        if (!nodes[i].type && !nodes[i].object && nodes[i].children) {
          if (!nodes[i].checked || !selectFolder) {
            recursive(nodes[i].children);
          } else if (!self.object.isRecursive) {
            for (let j = 0; j < nodes[i].children.length; j++) {
              if (nodes[i].children[j].isFolder && nodes[i].children[j].children) {
                recursive(nodes[i].children[j].children);
              }
            }
          }
        }
      }
    }

    recursive(this.nodes);
  }

  getReleaseObject() {
    this.object = {
      update: [],
      delete: []
    };
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((nodes[i].type || nodes[i].isFolder) && nodes[i].checked) {
          if (nodes[i].isFolder && nodes[i].deleted) {
            self.object.delete.push({
              path: nodes[i].path,
              objectType: 'FOLDER'
            });
          } else if (nodes[i].type) {
            const obj: any = {
              path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
              objectType: nodes[i].type
            };
            if (nodes[i].deleted) {
              self.object.delete.push(obj);
            } else {
              self.object.update.push(obj);
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
        if ((nodes[i].type || nodes[i].isFolder) && !nodes[i].checked) {
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
    } else if (this.releasable) {
      this.getReleaseObject();
    } else {
      this.getJSObject();
    }
    const obj: any = {};
    if (this.reDeploy) {
      obj.controllerId = this.schedulerIds.selected;
      obj.folder = this.path || '/';
      obj.excludes = this.object.excludes;
    }

    if (!this.releasable && !this.reDeploy) {
      obj.controllerIds = this.selectedSchedulerIds;
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

  remove() {
    if (this.nodes.length > 0) {
      this.submitted = true;
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (this.nodes[0].children[i].type && this.nodes[0].children[i].checked) {
          this.coreService.post('inventory/remove', {
            objectType: this.nodes[0].children[i].type,
            path: this.nodes[0].children[i].path + (this.nodes[0].children[i].path === '/' ? '' : '/') + this.nodes[0].children[i].name
          }).subscribe((res: any) => {
            if (this.nodes[0].children.length - 1 === i) {
              this.submitted = false;
              this.activeModal.close('ok');
            }
          });
        }
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
  @Input() origin: any;
  @Input() display: any;
  actualResult = [];
  loading = true;
  nodes: any = [{path: '/', key: '/', name: '/', children: [], isFolder: true}];
  isExpandAll = false;
  submitted = false;
  comments: any = {radio: 'predefined'};
  required: boolean;
  inValid = false;
  exportType = 'BOTH';
  messageList: any;
  path: string;
  securityLevel: string;
  REGEX = /^[0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_ ]+$/;
  exportObj = {
    isRecursive: false,
    controllerId: '',
    forSigning: false,
    filename: '',
    fileFormat: 'ZIP'
  };
  filter = {
    draft: true,
    deploy: true,
    valid: false,
  };
  object: any = {draftConfigurations: [], releaseDraftConfigurations: [], deployConfigurations: [], releasedConfigurations: []};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService,
              private authService: AuthService, private inventoryService: InventoryService) {
  }

  ngOnInit() {
    this.exportObj.controllerId = this.schedulerIds.selected;
    this.securityLevel = sessionStorage.securityLevel;
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
    if (this.origin) {
      this.path = this.origin.path;
      if (this.origin.dailyPlan || (this.origin.object &&
        (this.origin.object === 'SCHEDULE' || this.origin.object.match('CALENDAR')))) {
        this.exportType = this.origin.object || 'DAILYPLAN';
      } else {
        if (this.origin.controller || this.origin.object) {
          this.exportType = this.origin.object || 'CONTROLLER';
        }
      }
    }
    this.buildTree();
  }

  checkFileName() {
    if (this.exportObj.filename) {
      const ext = this.exportObj.filename.split('.').pop();
      if (ext) {
        if (this.exportObj.fileFormat === 'ZIP' && (ext === 'ZIP' || ext === 'zip')) {
          this.inValid = false;
        } else {
          this.inValid = !(this.exportObj.fileFormat === 'TAR_GZ' && (ext === 'tar' || ext === 'gz'));
        }
      } else {
        this.inValid = true;
      }
    }
  }

  buildTree() {
    const obj: any = {
      folder: this.path || '/',
      onlyValidObjects: false,
      withoutRemovedObjects: true
    };

    const APIs = [];
    if (this.exportType === 'BOTH') {
      obj.recursive = true;
      obj.withoutReleased = false;
      obj.withoutDrafts = false;
      APIs.push(this.coreService.post('inventory/deployables', obj));
      APIs.push(this.coreService.post('inventory/releasables', obj));
    } else {
      if (this.exportType === 'CONTROLLER' || this.exportType === 'DAILYPLAN') {
        obj.recursive = true;
      } else {
        obj.objectTypes = this.exportType === 'CALENDAR' ? ['WORKINGDAYSCALENDAR', 'NONWORKINGDAYSCALENDAR'] : [this.exportType];
      }
      if (this.exportType === 'DAILYPLAN' || this.exportType === 'SCHEDULE' || this.exportType.match('CALENDAR')) {
        obj.withoutReleased = false;
        obj.withoutDrafts = false;
        APIs.push(this.coreService.post('inventory/releasables', obj));
      } else {
        obj.withVersions = true;
        APIs.push(this.coreService.post('inventory/deployables', obj));
      }
    }
    forkJoin(APIs).subscribe(res => {
      this.actualResult = [];
      res.forEach((data) => {
        if (data.releasables) {
          this.actualResult = this.actualResult.concat(data.releasables);
        } else {
          this.actualResult = this.actualResult.concat(data.deployables);
        }
      });
      this.actualResult = this.inventoryService.sortList(this.actualResult);
      this.filterList();
    }, (err) => {
      this.loading = false;
      this.nodes = [];
    });
  }

  onchangeSigning() {
    if (this.exportObj.forSigning) {
      this.filter.valid = true;
    }
    this.filterList();
  }

  expandAll(): void {
    this.isExpandAll = true;
    const self = this;

    function recursive(node) {
      for (let i = 0; i < node.length; i++) {
        if (node[i].children && node[i].children.length > 0) {
          if (!node[i].isCall) {
            self.inventoryService.checkAndUpdateVersionList(node[i]);
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

  filterList() {
    this.nodes = [{path: '/', key: '/', name: '/', children: [], isFolder: true}];
    const arr = this.actualResult.filter((value) => {
      if (value.objectType === 'FOLDER') {
        return false;
      }
      if (this.exportObj.forSigning) {
        if (!(value.objectType === 'SCHEDULE' || value.objectType.match(/CALENDAR/))) {
          if (this.filter.draft && (value.deployed === false || value.released === false)) {
            return !(this.filter.valid && !value.valid);
          }
          return !!(this.filter.deploy && (value.deployed || value.released));
        } else {
          return false;
        }
      } else {
        if (this.filter.draft && (value.deployed === false || value.released === false)) {
          return !(this.filter.valid && !value.valid);
        }
        return !!(this.filter.deploy && (value.deployed || value.released));
      }
    });
    this.buildDeployablesTree(arr);
    setTimeout(() => {
      this.loading = false;
      if (this.path) {
        this.getChildTree();
        if (this.nodes.length > 0) {
          this.nodes[0].expanded = true;
        }
      }
      if (this.nodes.length > 0) {
        this.preselected( this.nodes[0]);
        this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
      }
    }, 0);
  }

  private preselected(node) {
    node.checked = true;
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].type) {
        node.children[i].checked = node.checked;
      }
      if (node.children[i].isFolder) {
        break;
      }
    }
  }

  private getChildTree() {
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

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    let node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      this.inventoryService.checkAndUpdateVersionList(node.origin);
    }
  }

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.exportObj.isRecursive) {
      const node = e.node;
      if (node.origin.type && node.parentNode) {
        node.parentNode.isHalfChecked = true;
        let flag = true;
        if (!node.isChecked) {
          node.parentNode.isChecked = false;
          flag = this.inventoryService.checkHalfCheckBox(node.parentNode, false);
        } else {
          flag = this.inventoryService.checkHalfCheckBox(node.parentNode, true);
          node.parentNode.isChecked = flag;
        }
        node.parentNode.isHalfChecked = !flag;
      }
      if (!node.origin.type) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].origin.type) {
            node.children[i].isChecked = node.isChecked;
          }
          if (node.children[i].origin.isFolder) {
            break;
          }
        }
      }
    }
  }

  private buildDeployablesTree(result) {
    if (result && result.length > 0) {
      const arr = _.groupBy(_.sortBy(result, 'folder'), (res) => {
        return res.folder;
      });
      this.inventoryService.generateTree(arr, this.nodes);
    } else {
      this.nodes = [];
    }
  }

  getJSObject() {
    const self = this;
    let selectFolder = true;
    if (this.exportType && this.exportType !== 'CONTROLLER' && this.exportType !== 'DAILYPLAN' && this.exportType !== 'BOTH') {
      selectFolder = false;
    }
    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((nodes[i].type || nodes[i].isFolder) && nodes[i].checked) {
          const objDep: any = {};
          if (nodes[i].isFolder) {
            if (selectFolder) {
              objDep.configuration = {
                path: nodes[i].path,
                objectType: 'FOLDER',
                recursive: self.exportObj.isRecursive
              };
            }
          } else {
            objDep.configuration = {
              path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
              objectType: nodes[i].type
            };
          }
          if (objDep.configuration) {
            if (nodes[i].deployablesVersions) {
              for (let j = 0; j < nodes[i].deployablesVersions.length; j++) {
                if (nodes[i].deployablesVersions[j].deploymentId === nodes[i].deploymentId || nodes[i].deployablesVersions[j].deploymentId === nodes[i].deployId) {
                  objDep.configuration.commitId = nodes[i].deployablesVersions[j].commitId;
                  break;
                }
              }
            }
            if (objDep.configuration.objectType !== 'FOLDER') {
              if (self.inventoryService.isControllerObject(nodes[i].type)) {
                if (objDep.configuration.commitId) {
                  self.object.deployConfigurations.push(objDep);
                } else {
                  self.object.draftConfigurations.push(objDep);
                }
              } else {
                if (nodes[i].releaseId) {
                  self.object.releasedConfigurations.push(objDep);
                } else {
                  self.object.releaseDraftConfigurations.push(objDep);
                }
              }
            } else {
              let check1 = false, check2 = false, check3 = false, check4 = false, isEmpty = false;
              for (let j = 0; j < nodes[i].children.length; j++) {
                if (nodes[i].children[j].type) {
                  isEmpty = true;
                  if (self.inventoryService.isControllerObject(nodes[i].children[j].type)) {
                    if ((nodes[i].children[j].deployId || nodes[i].children[j].deploymentId) && !check1) {
                      check1 = true;
                      self.object.deployConfigurations.push(objDep);
                    } else if (!check2) {
                      check2 = true;
                      self.object.draftConfigurations.push(objDep);
                    }
                  } else {
                    if (nodes[i].children[j].release && !check3) {
                      check3 = true;
                      self.object.releasedConfigurations.push(objDep);
                    } else if (!check4) {
                      check4 = true;
                      self.object.releaseDraftConfigurations.push(objDep);
                    }
                  }
                  if (check1 && check2 && check3 && check4) {
                    break;
                  }
                }
              }
              if (!isEmpty) {
                if (self.filter.deploy) {
                  self.object.deployConfigurations.push(objDep);
                }
                if (self.filter.draft) {
                  self.object.draftConfigurations.push(objDep);
                }
              }
            }
          }
        }
        if (!nodes[i].type && !nodes[i].object && nodes[i].children) {
          if (!nodes[i].checked || !selectFolder) {
            recursive(nodes[i].children);
          } else if (!self.exportObj.isRecursive) {
            for (let j = 0; j < nodes[i].children.length; j++) {
              if (nodes[i].children[j].isFolder && nodes[i].children[j].children) {
                recursive(nodes[i].children[j].children);
              }
            }
          }
        }
      }
    }

    recursive(this.nodes);
  }

  onSubmit() {
    this.submitted = true;
    this.getJSObject();
    this.export();
  }

  export() {
    if ((this.object.deployConfigurations && this.object.deployConfigurations.length > 0) ||
      (this.object.draftConfigurations.length && this.object.draftConfigurations.length > 0) ||
      (this.object.releasedConfigurations && this.object.releasedConfigurations.length > 0) ||
      (this.object.releaseDraftConfigurations.length && this.object.releaseDraftConfigurations.length > 0)) {
      let param = '';
      if (this.object.deployConfigurations && this.object.deployConfigurations.length === 0) {
        delete this.object['deployConfigurations'];
      }
      if (this.object.draftConfigurations && this.object.draftConfigurations.length === 0) {
        delete this.object['draftConfigurations'];
      }
      if (this.object.releasedConfigurations && this.object.releasedConfigurations.length === 0) {
        delete this.object['releasedConfigurations'];
      }
      if (this.object.releaseDraftConfigurations && this.object.releaseDraftConfigurations.length === 0) {
        delete this.object['releaseDraftConfigurations'];
      }
      let obj: any = {
        exportFile: {filename: this.exportObj.filename, format: this.exportObj.fileFormat}
      };
      if (this.exportObj.forSigning) {
        obj.forSigning = {controllerId: this.exportObj.controllerId};
        if (this.object.draftConfigurations || this.object.deployConfigurations) {
          obj.forSigning.deployables = {
            draftConfigurations: this.object.draftConfigurations,
            deployConfigurations: this.object.deployConfigurations
          };
        }
      } else {
        obj.shallowCopy = {
          withoutInvalid: this.filter.valid
        };
        if (this.object.releasedConfigurations || this.object.releaseDraftConfigurations) {
          obj.shallowCopy.releasables = {
            releasedConfigurations: this.object.releasedConfigurations,
            draftConfigurations: this.object.releaseDraftConfigurations
          };
        }
        if (this.object.draftConfigurations || this.object.deployConfigurations) {
          obj.shallowCopy.deployables = {
            draftConfigurations: this.object.draftConfigurations,
            deployConfigurations: this.object.deployConfigurations
          };
        }
      }

      param = param + '&exportFilter=' + JSON.stringify(obj);
      if (this.comments.comment) {
        param = param + '&comment=' + this.comments.comment;
      }
      if (this.comments.timeSpent) {
        param = param + '&timeSpent=' + this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        param = param + '&ticketLink=' + encodeURIComponent(this.comments.ticketLink);
      }
      //console.log('http://jstest.zehntech.net:7446/joc/api/inventory/export?accessToken=' + this.authService.accessTokenId + param);

      try {
        $('#tmpFrame').attr('src', './api/inventory/export?accessToken=' + this.authService.accessTokenId + param);
        setTimeout(() => {
          this.submitted = false;
          this.activeModal.close('ok');
        }, 150);
      } catch (e) {
        console.error(e);
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
  selector: 'app-set-version-modal',
  templateUrl: './setVersion-dialog.html'
})
export class SetVersionComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() preferences;
  @Input() schedulerIds;
  @Input() display: any;
  nodes: any = [{key: '/', path: '/', name: '/', children: [], isFolder: true}];
  version = {type: 'setOneVersion', name: ''};
  isExpandAll = false;
  loading = true;
  comments: any = {radio: 'predefined'};
  required: boolean;
  messageList: any;
  object: any = {
    isRecursive: false,
    deployConfigurations: [],
    prevVersion: ''
  };

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, private inventoryService: InventoryService) {
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
      withoutRemovedObjects: true,
      withVersions: true
    }).subscribe((res: any) => {
      this.buildDeployablesTree(this.inventoryService.sortList(res.deployables));
      if (this.nodes.length > 0) {
        this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
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
      this.inventoryService.checkAndUpdateVersionList(node.origin);
    }
  }

  private buildDeployablesTree(result) {
    if (result && result.length > 0) {
      const arr = _.groupBy(_.sortBy(result, 'folder'), (res) => {
        return res.folder;
      });
      this.inventoryService.generateTree(arr, this.nodes);
    }
  }

  getJSObject() {
    this.object.deployConfigurations = [];
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type && (nodes[i].version || nodes[i].checked)) {
          if (nodes[i].deployId || nodes[i].deploymentId) {
            const configuration: any = {
              path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
              objectType: nodes[i].type
            };
            if (nodes[i].deployablesVersions) {
              for (let j = 0; j < nodes[i].deployablesVersions.length; j++) {
                if (nodes[i].deployablesVersions[j].deploymentId === nodes[i].deploymentId) {
                  configuration.commitId = nodes[i].deployablesVersions[j].commitId;
                  break;
                }
              }
            }
            if (self.version.type === 'setSeparateVersion') {
              self.object.deployConfigurations.push({
                configuration: configuration,
                version: nodes[i].version
              });
            } else {
              self.object.deployConfigurations.push({configuration: configuration});
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
      auditLog: {}
    };
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
      obj.deployConfigurations = this.object.deployConfigurations;
      this.coreService.post('inventory/deployment/set_versions', obj).subscribe((res: any) => {
        this.activeModal.close('ok');
      }, (error) => {

      });
    } else {
      if (this.object.deployConfigurations.length > 0) {
        obj.deployConfigurations = this.object.deployConfigurations;
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

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.object.isRecursive) {
      const node = e.node;
      if (node.origin.type && node.parentNode) {
        node.parentNode.isHalfChecked = true;
        let flag = true;
        if (!node.isChecked) {
          node.parentNode.isChecked = false;
          flag = this.inventoryService.checkHalfCheckBox(node.parentNode, false);
        } else {
          flag = this.inventoryService.checkHalfCheckBox(node.parentNode, true);
          node.parentNode.isChecked = flag;
        }
        node.parentNode.isHalfChecked = !flag;
      }
      if (!node.origin.type) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].origin.type) {
            node.children[i].isChecked = node.isChecked;
          }
          if (node.children[i].origin.isFolder) {
            break;
          }
        }
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
  comments: any = {};
  requestObj: any = {
    overwrite: false,
    format: 'ZIP',
    targetFolder: ''
  };

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, private translate: TranslateService,
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
      if (!this.isDeploy) {
        if (this.requestObj.targetFolder) {
          if (this.requestObj.targetFolder.substring(0, 1) !== '/') {
            this.requestObj.targetFolder = '/' + this.requestObj.targetFolder;
          }
          obj.targetFolder = this.requestObj.targetFolder;
        }
        obj.overwrite = this.requestObj.overwrite;
      }
      if (this.isDeploy) {
        obj.signatureAlgorithm = this.signatureAlgorithm;
        obj.controllerId = this.schedulerIds.selected;
      }
      obj.format = this.requestObj.format;
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

  // CALLBACKS
  onFileSelected(event: any): void {
    let item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1);
    if (!(fileExt && ((fileExt === 'zip' && this.requestObj.format === 'ZIP') ||
      (this.requestObj.format !== 'ZIP' && (fileExt.match(/tar/) || fileExt.match(/gz/)))))) {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      this.uploader.clearQueue();
    }
  }

  import() {
    this.uploader.queue[0].upload();
  }

  cancel() {
    this.activeModal.close('Cross click');
  }
}

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor-dialog.html'
})
export class JsonEditorModalComponent implements OnInit {
  @Input() name: string;
  @Input() objectType: string;
  @Input() object: any;
  @Input() edit: boolean;
  @Input() schedulerId: any;
  submitted = false;
  isError = false;
  data: any;
  errorMsg: string;
  options = new JsonEditorOptions();

  @ViewChild('editor', {static: false}) editor: JsonEditorComponent;

  constructor(public coreService: CoreService, private clipboardService: ClipboardService, public activeModal: NgbActiveModal,
              private translate: TranslateService, private message: NzMessageService) {
    this.options.mode = 'code';
    this.options.statusBar = false;
    this.options.onChange = () => {
      try {
        this.isError = false;
        this.editor.get();
      } catch (err) {
        this.isError = true;
        this.errorMsg = '';
      }
    };
  }

  private parseErrorMsg(res, cb) {
    let flag = true;
    if (!res.valid) {
      flag = false;
      if (res.invalidMsg.match(/label/)) {
        flag = true;
      }
      this.errorMsg = res.invalidMsg;
    }
    this.isError = !flag;
    cb(flag);
  }

  private validateByURL(json, cb) {
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe((res: any) => {
      this.parseErrorMsg(res, (flag)=>{
        cb(flag);
      });
    }, (err) => {
      cb(err);
    });
  }

  ngOnInit() {
    this.data = this.coreService.clone(this.object);
    delete this.data['type'];
    delete this.data['TYPE'];
    delete this.data['versionId'];
  }

  copyToClipboard() {
    this.validateByURL(this.editor.get(), (isValid) => {
      if (isValid) {
        this.showMsg();
        this.clipboardService.copyFromContent(this.editor.getText());
      }
    });
  }

  private showMsg() {
    let msg;
    this.translate.get('common.message.copied').subscribe(translatedValue => {
      msg = translatedValue;
    });
    this.message.success(msg);
  }

  onSubmit(): void {
    this.submitted = true;
    this.validateByURL(this.editor.get(), (isValid) => {
      if (isValid) {
        this.activeModal.close(this.editor.get());
      }
      this.submitted = false;
    });

  }
}

@Component({
  selector: 'app-upload-json',
  templateUrl: './upload-json-dialog.html'
})
export class UploadModalComponent implements OnInit {
  @Input() object: any;
  @Input() name: string;
  @Input() objectType: string;
  submitted = false;
  uploader: FileUploader;
  data: any;

  constructor(public coreService: CoreService, public activeModal: NgbActiveModal, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit() {
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

  private validateByURL(json, cb) {
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe((res: any) => {
      cb(res);
    }, (err) => {
      cb(err);
    });
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    let item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      this.uploader.clearQueue();
    } else {
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event) {
      let data;
      try {
        data = JSON.parse(_event.target.result);
      } catch (e) {

      }
      if (data) {
        self.validateByURL(data, (res) => {
          if (!res.valid) {
            self.showErrorMsg(res.invalidMsg);
          }else{
            self.data = data;
          }
        });
      } else {
        self.showErrorMsg(null);
      }
    }
  }

  private showErrorMsg(errorMsg) {
    let msg = errorMsg;
    if (!errorMsg) {
      this.translate.get('inventory.message.invalidFile', {objectType: this.object.objectType}).subscribe(translatedValue => {
        msg = translatedValue;
      });
    }
    this.toasterService.pop('error', '', msg);
    this.uploader.queue[0].remove();
  }

  onSubmit() {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.data);
    }, 100);
  }
}

@Component({
  selector: 'app-create-object-template',
  templateUrl: './create-object-dialog.html'
})
export class CreateObjectModalComponent {
  @Input() schedulerId: any;
  @Input() obj: any;
  @Input() copy: any;
  submitted = false;
  object = {name: ''};

  constructor(private coreService: CoreService, public activeModal: NgbActiveModal) {
  }

  onSubmit(): void {
    this.submitted = true;
    const _path = this.obj.path + (this.obj.path === '/' ? '' : '/') + this.object.name;
    this.coreService.post('inventory/validate/path', {
      objectType: this.obj.type,
      path: _path
    }).subscribe((res: any) => {
      this.activeModal.close({
        name: this.object.name
      });
    }, (err) => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-create-folder-template',
  templateUrl: './create-folder-dialog.html'
})
export class CreateFolderModalComponent{
  @Input() schedulerId: any;
  @Input() folders: any;
  @Input() rename: any;
  @Input() oldName: any;
  submitted = false;
  isUnique = true;
  folder = {error: false, name: '', overwrite: false};

  constructor(private coreService: CoreService, public activeModal: NgbActiveModal) {

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
          newPath: this.folder.name,
          overwrite: this.folder.overwrite,
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
  selector: 'app-inventory',
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
    private inventoryService: InventoryService,
    public modalService: NgbModal,
    private translate: TranslateService,
    private toasterService: ToasterService,
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
        } else if (res.cut) {
          this.cut(res);
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
        } else if (res.showJson) {
          this.showJson(res);
        } else if (res.exportJSON) {
          this.exportJSON(res.exportJSON);
        } else if (res.importJSON) {
          this.importJSON(res.importJSON);
        } else if (res.rename) {
          this.rename(res.rename);
        } else if (res.back) {
          this.backToListView();
        }
      }
    });
    this.subscription3 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf(false);
    });
  }

  ngOnInit() {
    this.initConf(true);
  }

  private initConf(isReload) {
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.securityLevel = sessionStorage.securityLevel;
    if (isReload) {
      this.sideView = this.coreService.getSideView();
      if (this.sideView.inventory && !this.sideView.inventory.show) {
        this.hidePanel();
      }
      this.inventoryConfig = this.coreService.getConfigurationTab().inventory;
      this.initTree(null, null);
    }
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.dataService.reloadTree.next(null);
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
        } else if (!_.isEmpty(this.inventoryConfig.selectedObj)) {
          this.tree = tree;
          this.selectedObj = this.inventoryConfig.selectedObj;
          this.recursivelyExpandTree();
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

  recursivelyExpandTree() {
    this.coreService.post('inventory/read/configuration', {
      objectType: this.selectedObj.type,
      name: this.selectedObj.name
    }).subscribe((res: any) => {
      const pathArr = [];
      const arr = this.selectedObj.path.split('/');
      const len = arr.length;
      if (len > 1) {
        for (let i = 0; i < len; i++) {
          if (arr[i]) {
            if (i > 0 && pathArr[i - 1]) {
              pathArr.push(pathArr[i - 1] + (pathArr[i - 1] === '/' ? '' : '/') + arr[i]);
            } else {
              pathArr.push('/' + arr[i]);
            }
          } else {
            pathArr.push('/');
          }
        }
      }
      const self = this;
      if (this.tree.length > 0) {
        function traverseTree(data) {
          let flag = false;
          for (let i = 0; i < pathArr.length; i++) {
            if (pathArr[i] === data.path) {
              data.expanded = true;
              flag = true;
              pathArr.splice(i, 1);
              break;
            }
          }
          if (flag) {
            self.updateObjects(data, (children) => {
              data.children.splice(0, 0, children[0]);
              data.children.splice(1, 0, children[1]);
              const parentNode = (self.selectedObj.type === 'SCHEDULE' || self.selectedObj.type.match(/CALENDAR/)) ? children[1] : children[0];
              if (self.selectedObj.path === parentNode.path) {
                parentNode.expanded = true;
                for (let j = 0; j < parentNode.children.length; j++) {
                  let x = parentNode.children[j];
                  if (x.object === self.selectedObj.type) {
                    x.expanded = true;
                    for (let k = 0; k < x.children.length; k++) {
                      if (x.children[k].name === self.selectedObj.name) {
                        self.selectedData = x.children[k];
                        break;
                      }
                    }
                    break;
                  }
                }

                self.type = self.selectedObj.type;
                self.isLoading = false;
                self.updateTree();
              }
            }, false);
          }
          if (data.children && pathArr.length > 0) {
            for (let i = 0; i < data.children.length; i++) {
              traverseTree(data.children[i]);
            }
          }
        }

        traverseTree(this.tree[0]);
      }
    }, () => {
      this.updateObjects(this.tree[0], (children) => {
        this.isLoading = false;
        this.tree[0].children.splice(0, 0, children[0]);
        this.tree[0].children.splice(1, 0, children[1]);
        this.tree[0].expanded = true;
        this.updateTree();
      }, false);
    });
  }

  recursiveTreeUpdate(scr, dest) {
    function recursive(scrTree, destTree) {
      if (scrTree && destTree) {
        for (let j = 0; j < scrTree.length; j++) {
          for (let i = 0; i < destTree.length; i++) {
            if (destTree[i].path && scrTree[j].path && (destTree[i].path === scrTree[j].path)) {
              if (scrTree[j].object && destTree[i].object) {
                if (scrTree[j].object === destTree[i].object) {
                  scrTree[j].expanded = destTree[i].expanded;
                }
              } else if (scrTree[j].controller && destTree[i].controller) {
                if (scrTree[j].controller === destTree[i].controller) {
                  scrTree[j].expanded = destTree[i].expanded;
                }
              } else if (scrTree[j].dailyPlan && destTree[i].dailyPlan) {
                if (scrTree[j].dailyPlan === destTree[i].dailyPlan) {
                  scrTree[j].expanded = destTree[i].expanded;
                }
              } else if (scrTree[j].name === destTree[i].name && scrTree[j].path === destTree[i].path) {
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
        node.isExpanded = !node.isExpanded;
      }
      this.type = node.origin.object || node.origin.type;
      this.selectedData = node.origin;
      this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
    }
  }

  updateObjects(data, cb, isExpandConfiguration) {
    let flag = true;
    const controllerObj: any = {controllerArr: []}, dailyPlanObj: any = {dailyPlanArr: []};
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

  exportObject(node) {
    let origin = null;
    if (node) {
      origin = node.origin ? node.origin : node;
    }
    const modalRef = this.modalService.open(ExportComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.componentInstance.origin = origin;
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
        this.initTree(node.origin.path, null);
      }, () => {
      });
    }
  }

  deployObject(node, releasable) {
    const origin = node.origin ? node.origin : node;
    if (releasable && origin.id) {
      this.releaseSingleObject(origin);
      return;
    }

    if (origin.type || this.inventoryService.isControllerObject(origin.objectType)) {
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

      }, () => {
      });
    } else {
      const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static', size: releasable ? 'sm' : 'lg'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.preferences = this.preferences;
      modalRef.componentInstance.display = this.preferences.auditLog;
      modalRef.componentInstance.path = origin.path;
      modalRef.componentInstance.data = origin;
      modalRef.componentInstance.releasable = releasable;
      modalRef.result.then((res: any) => {

      }, () => {
      });
    }
  }

  deletePermanently(node) {
    const object = node.origin;
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteDraftObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = object.path;
    modalRef.result.then((res: any) => {
      this.coreService.post('inventory/delete_draft', {objectType: 'FOLDER', path: object.path}).subscribe((res) => {
        forkJoin([
          this.coreService.post('inventory/deployment/deploy', {
            controllerIds: this.schedulerIds.controllerIds,
            delete: {deployConfigurations: [{configuration: {objectType: 'FOLDER', recursive: true, path: object.path}}]}
          }),
          this.coreService.post('inventory/release', {
            delete: [{objectType: 'FOLDER', path: object.path}]
          })
        ]).subscribe((result) => {
          this.initTree(object.path, null);
        }, (err) => {

        });
      });
    }, () => {
    });
  }

  /*  reDeployObject(node) {
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
    }*/

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

  showJson(obj) {
    this.coreService.post('inventory/read/configuration', {
      id: obj.showJson.id,
    }).subscribe((res: any) => {
      const modalRef = this.modalService.open(JsonEditorModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.object = res.configuration;
      modalRef.componentInstance.objectType = res.objectType;
      modalRef.componentInstance.name = res.path;
      modalRef.componentInstance.edit = obj.edit;
      modalRef.result.then((result) => {
        this.storeData(obj.showJson, result);
      }, () => {
      });
    });
  }

  editJson(data, isEdit) {
    this.showJson({showJson: data, edit: isEdit});
  }

  importJSON(obj) {
    const modalRef = this.modalService.open(UploadModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.object = obj;
    modalRef.componentInstance.objectType = obj.objectType || obj.type;
    modalRef.result.then((result) => {
      if (result) {
        this.storeData(obj, result);
      }
    }, () => {
    });
  }

  exportJSON(obj) {
    this.coreService.post('inventory/read/configuration', {
      id: obj.id,
    }).subscribe((res: any) => {
      const name = obj.name + '.json';
      const fileType = 'application/octet-stream';
      delete res.configuration['TYPE'];
      let data = JSON.stringify(res.configuration, undefined, 2);
      const blob = new Blob([data], {type: fileType});
      saveAs(blob, name);
    });
  }

  private storeData(obj, result) {
    this.coreService.post('inventory/store', {
      configuration: result,
      valid: true,
      id: obj.id,
      objectType: obj.objectType || obj.type
    }).subscribe((res: any) => {
      obj.valid = res.valid;
      if (obj.id === this.selectedObj.id) {
        this.type = null;
        this.selectedData.valid = res.valid;
        this.selectedData.deployed = res.deployed;
        this.selectedData.released = res.released;
        setTimeout(() => {
          this.type = obj.objectType || obj.type;
        }, 5);
      }
      this.updateFolders(obj.path, () => {
        this.updateTree();
      });
    }, (err) => {
      console.log(err);
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

  cut(node){
    this.copyObj = node.cut || node.origin;
    this.copyObj.operation = 'CUT';
  }

  copy(node) {
    this.copyObj = node.copy || node.origin;
    this.copyObj.operation = 'COPY';
    let msg = '';
    this.translate.get('common.message.copied').subscribe(translatedValue => {
      msg = translatedValue;
    });
    this.message.success(msg);
  }

  paste(node) {
    let object = node;
    if (this.copyObj) {
      if (this.copyObj.operation === 'COPY') {
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
            valid: res.valid
          };
          object.expanded = true;
          this.openObjectNameModal(obj, object.children, res.configuration);
        }, () => {

        });
      } else if (this.copyObj.operation === 'CUT') {
        if (node instanceof NzTreeNode) {
          object = node.origin;
        }
        let obj: any = {newPath: object.path};
        if (this.copyObj.id) {
          obj.id = this.copyObj.id;
        } else {
          obj.objectType = 'FOLDER';
          obj.path = this.copyObj.path;
        }
        if (this.copyObj.path === obj.newPath) {
          this.copyObj = null;
          return;
        } else {
          let pathArr = [];
          let arr = obj.newPath.split('/');
          let len = arr.length;
          if (len > 1) {
            for (let i = 0; i < len; i++) {
              if (arr[i]) {
                if (i > 0 && pathArr[i - 1]) {
                  pathArr.push(pathArr[i - 1] + (pathArr[i - 1] === '/' ? '' : '/') + arr[i]);
                } else {
                  pathArr.push('/' + arr[i]);
                }
              } else {
                pathArr.push('/');
              }
            }
          }
          if (pathArr.length > 0 && pathArr.indexOf(this.copyObj.path) > -1) {
            let msg = '';
            this.translate.get('error.message.pasteInSubFolderNotAllowed').subscribe(translatedValue => {
              msg = translatedValue;
            });
            this.toasterService.pop('warning', '', msg);
            return;
          }
        }
        obj.newPath = obj.newPath + '/' + this.copyObj.name;
        this.coreService.post('inventory/rename', obj).subscribe((res) => {
          this.copyObj = null;
          this.initTree(obj.newPath, null);
        }, (err) => {

        });
      }
    }
  }

  private openObjectNameModal(obj, children, configuration) {
    const modalRef = this.modalService.open(CreateObjectModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.obj = obj;
    modalRef.componentInstance.copy = this.copyObj.name;
    modalRef.result.then((res: any) => {
      obj.name = res.name;
      this.storeObject(obj, children, configuration);
    }, () => {
    });
  }

  removeObject(node) {
    const object = node.origin;
    if (object.object || object.controller || object.dailyPlan) {
      let releasable = false;
      if (object.dailyPlan || (object.object && (object.object === 'SCHEDULE' || object.object.match('CALENDAR')))) {
        releasable = true;
      }
      const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerIds = this.schedulerIds;
      modalRef.componentInstance.preferences = this.preferences;
      modalRef.componentInstance.display = this.preferences.auditLog;
      modalRef.componentInstance.data = object;
      modalRef.componentInstance.path = object.path;
      modalRef.componentInstance.isRemove = true;
      modalRef.componentInstance.releasable = releasable;
      modalRef.result.then((res: any) => {

      }, () => {
      });
    } else {
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
  }

  deleteDraft(node) {
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
          if (args.eventSnapshots[j].eventType.match(/InventoryAdded/) || args.eventSnapshots[j].eventType.match(/ItemAdded/) || args.eventSnapshots[j].eventType.match(/ItemChanged/) || args.eventSnapshots[j].eventType.match(/InventoryUpdated/)) {
            if (args.eventSnapshots[j].objectType === 'FOLDER') {
              this.initTree(args.eventSnapshots[j].path, path);
              break;
            } else {
              console.log(args.eventSnapshots[j].path, 'updated...');
              this.updateFolders(args.eventSnapshots[j].path, () => {
                this.updateTree();
              });
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
    const modalRef = this.modalService.open(CreateObjectModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.obj = obj;
    modalRef.result.then((res: any) => {
      let configuration = {};
      obj.name = res.name;
      if (type === 'JOBCLASS') {
        configuration = {maxProcesses: 1};
      } else if (type === 'SCHEDULE') {
        configuration = {controllerId: this.schedulerIds.selected};
      } else if (type === 'LOCK') {
        configuration = {limit: 1, id: res.name};
      } else if (type === 'WORKINGDAYSCALENDAR' || type === 'NONWORKINGDAYSCALENDAR') {
        configuration = {type: type};
      }
      this.storeObject(obj, list, configuration);
    }, () => {
    });
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
        this.clearCopyObject(object);
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
    if ((this.selectedData && this.selectedData.type === obj.type && this.selectedData.name === obj.name
      && this.selectedData.path === obj.path)) {
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
