import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {forkJoin, of, Subscription} from 'rxjs';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {FileUploader} from 'ng2-file-upload';
import {ToasterService} from 'angular2-toaster';
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {TranslateService} from '@ngx-translate/core';
import {isEmpty, sortBy, isArray, clone, extend, isEqual} from 'underscore';
import {ClipboardService} from 'ngx-clipboard';
import {saveAs} from 'file-saver';
import {catchError} from 'rxjs/operators';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd/tree';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {InventoryService} from './inventory.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {InventoryObject} from '../../../models/enums';

declare const $: any;

@Component({
  selector: 'app-deploy-draft-modal',
  templateUrl: './single-deploy-dialog.html'
})
export class SingleDeployComponent implements OnInit {
  @Input() schedulerIds;
  @Input() data;
  @Input() type;
  @Input() display: any;
  @Input() isRevoke: boolean;
  @Input() isChecked: boolean;
  selectedSchedulerIds = [];
  deployablesObject = [];
  loading = true;
  submitted = false;
  comments: any = {radio: 'predefined'};
  object: any = {
    store: {draftConfigurations: [], deployConfigurations: []},
    delete: {deployConfigurations: []}
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    this.init();
  }

  init(): void {
    const obj: any = {onlyValidObjects: true, withVersions: true, id: this.data.id};
    if (this.isRevoke) {
      obj.withoutDeployed = false;
      obj.latest = true;
    }
    if (this.isChecked) {
      obj.controllerId = this.schedulerIds.selected;
    }
    this.getSingleObject(obj);
  }

  getJSObject(): void {
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

        if (this.deployablesObject[i].deleted || this.isRevoke) {
          if (!isEmpty(obj)) {
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

  deploy(): void {
    this.submitted = true;
    this.getJSObject();
    const obj: any = {
      controllerIds: this.selectedSchedulerIds,
      auditLog: {}
    };
    if (this.object.store.draftConfigurations.length > 0 || this.object.store.deployConfigurations.length > 0) {
      if (this.object.store.draftConfigurations.length === 0) {
        delete this.object.store.draftConfigurations;
      }
      if (this.object.store.deployConfigurations.length === 0) {
        delete this.object.store.deployConfigurations;
      }
      obj.store = this.object.store;
    }
    if (!this.isRevoke && this.object.delete.deployConfigurations.length > 0) {
      obj.delete = this.object.delete;
    }
    if (this.isRevoke && this.object.delete.deployConfigurations.length > 0) {
      obj.deployConfigurations = this.object.delete.deployConfigurations;
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

    if ((isEmpty(obj.store) && isEmpty(obj.delete)) && !this.isRevoke) {
      this.submitted = false;
      return;
    }
    this.coreService.post(this.isRevoke ? 'inventory/deployment/revoke' : 'inventory/deployment/deploy', obj).subscribe(() => {
      this.activeModal.close('ok');
    }, () => {
      this.submitted = false;
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private getSingleObject(obj): void {
    this.coreService.post('inventory/deployable', obj).subscribe((res: any) => {
      const result = res.deployable;
      if (result.deployablesVersions && result.deployablesVersions.length > 0 && !result.deleted) {
        result.deployId = '';
        if (result.valid && result.deployablesVersions[0].versions && result.deployablesVersions[0].versions.length > 0) {
          result.deployId = result.deployablesVersions[0].deploymentId;
        } else if (!result.deployablesVersions[0].deploymentId) {
          result.deployablesVersions[0].deploymentId = '';
        }
      } else {
        result.deployablesVersions = [];
      }
      this.deployablesObject = [result];
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
}

@Component({
  selector: 'app-deploy-draft-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deploy-dialog.html'
})
export class DeployComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() schedulerIds;
  @Input() preferences;
  @Input() path: string;
  @Input() releasable: boolean;
  @Input() display: any;
  @Input() data: any;
  @Input() isRemove: any;
  @Input() isRevoke: boolean;
  @Input() isChecked: boolean;
  selectedSchedulerIds = [];
  loading = true;
  nodes: any = [];
  object: any = {
    isRecursive: false,
    delete: [],
    update: [],
    store: {draftConfigurations: [], deployConfigurations: []},
    deleteObj: {deployConfigurations: []}
  };
  submitted = false;
  comments: any = {radio: 'predefined'};
  isDeleted = false;

  constructor(public activeModal: NzModalRef, public coreService: CoreService, private ref: ChangeDetectorRef,
              private authService: AuthService, private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    if (this.data && this.data.deleted) {
      this.isDeleted = true;
    }
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    this.buildTree(this.path);
  }

  handleRecursive(): void {
    this.ref.detectChanges();
  }

  expandAll(): void {
    this.buildTree(this.path, null, () => {
      const self = this;

      function recursive(node): void {
        for (const i in node) {
          if (!node[i].isLeaf) {
            node[i].expanded = true;
          }
          if (node[i].children && node[i].children.length > 0) {
            if (!node[i].isCall) {
              self.inventoryService.checkAndUpdateVersionList(node[i]);
            }
            recursive(node[i].children);
          }
        }
      }

      recursive(this.nodes);
      this.ref.detectChanges();
    });
  }

  collapseAll(): void {
    this.expandCollapseRec(this.nodes);
    this.ref.detectChanges();
  }

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.object.isRecursive) {
      const node = e.node;
      if (node.origin.type && node.parentNode) {
        node.parentNode.isHalfChecked = true;
        let flag;
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
          if (!node.children[i].origin.object && !node.children[i].origin.type) {
            break;
          }
        }
      }
    }
  }

  buildTree(path, merge = null, cb = null): void {
    const obj: any = {
      folder: path || '/',
      recursive: !!cb,
      onlyValidObjects: true,
      withRemovedObjects: true
    };
    if (this.data && this.data.object) {
      obj.objectTypes = this.data.object === 'CALENDAR' ? [InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR] : [this.data.object];
    }
    if (this.isRevoke) {
      obj.withoutDeployed = false;
      obj.withRemovedObjects = false;
      obj.onlyValidObjects = false;
      obj.withoutDrafts = true;
      obj.latest = true;
    } else {
      if (!this.isRemove) {
        if (this.releasable) {
          obj.withoutReleased = true;
        } else {
          obj.withVersions = true;
        }
      }
      if (this.isRemove) {
        obj.withRemovedObjects = false;
        obj.withoutDrafts = true;
        obj.latest = true;
      }
    }
    if (this.isChecked && !this.releasable) {
      obj.controllerId = this.schedulerIds.selected;
    }
    const URL = this.releasable ? 'inventory/releasables' : 'inventory/deployables';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      let tree = [];
      if (res.folders && res.folders.length > 0 ||
        ((res.deployables && res.deployables.length > 0) || (res.releasables && res.releasables.length > 0))) {
        tree = this.coreService.prepareTree({
          folders: [{
            name: res.name,
            path: res.path,
            folders: res.folders,
            deployables: res.deployables,
            releasables: res.releasables
          }]
        }, false);
        this.inventoryService.updateTree(tree[0]);
      }

      if (merge) {
        if (tree.length > 0) {
          merge.children = tree[0].children;
          this.inventoryService.checkAndUpdateVersionList(tree[0]);
        }
        delete merge.loading;
        this.nodes = [...this.nodes];
        this.ref.detectChanges();
      } else {
        this.nodes = tree;
        if (!cb) {
          setTimeout(() => {
            this.loading = false;
            if (this.path) {
              if (this.nodes.length > 0) {
                this.nodes[0].expanded = true;
              }
            }
            if (this.nodes.length > 0) {
              this.inventoryService.preselected(this.nodes[0]);
              this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
            }
            this.ref.detectChanges();
          }, 0);
        } else {
          cb();
        }
      }
    }, () => {
      if (merge) {
        delete merge.loading;
      } else {
        if (!cb) {
          this.loading = false;
          this.nodes = [];
        } else {
          cb();
        }
      }
    });
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    const node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      if (!node.origin.type && !node.origin.object) {
        node.origin.loading = true;
        this.buildTree(node.origin.path, node.origin);
      }
      this.inventoryService.checkAndUpdateVersionList(node.origin);
    }
  }

  getJSObject(): void {
    this.object.store = {draftConfigurations: [], deployConfigurations: []};
    this.object.deleteObj = {deployConfigurations: []};
    const self = this;
    let selectFolder = true;
    if (this.data && this.data.object) {
      selectFolder = false;
    }

    function recursive(nodes): void {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].object && nodes[i].checked) {
          const objDep: any = {};
          if (nodes[i].deployId || nodes[i].deploymentId || (!nodes[i].type && !nodes[i].object)) {
            if ((!nodes[i].type && !nodes[i].object)) {
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
            if (nodes[i].deleted || self.isRevoke) {
              if (objDep.configuration.objectType === 'FOLDER') {
                objDep.configuration.recursive = true;
              }
              self.object.deleteObj.deployConfigurations.push(objDep);
            } else {
              if ((!nodes[i].type && !nodes[i].object)) {
                let check1 = false;
                let check2 = false;
                let isEmpty = false;
                if (nodes[i].children && nodes[i].children.length > 0) {
                  for (let j = 0; j < nodes[i].children.length; j++) {
                    if (nodes[i].children[j].type) {
                      isEmpty = true;
                      if ((nodes[i].children[j].deployId || nodes[i].children[j].deployed || nodes[i].children[j].deploymentId) && !check1) {
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
        if (!nodes[i].type && !nodes[i].object && nodes[i].children) {
          if (!nodes[i].checked || !selectFolder) {
            recursive(nodes[i].children);
          } else if (!self.object.isRecursive) {
            for (let j = 0; j < nodes[i].children.length; j++) {
              if (!nodes[i].children[j].object && !nodes[i].children[j].type && nodes[i].children[j].children) {
                recursive(nodes[i].children[j].children);
              }
            }
          }
        }
      }
    }

    recursive(this.nodes);
  }

  getReleaseObject(): void {
    this.object = {
      update: [],
      delete: []
    };
    const self = this;

    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((!nodes[i].object) && nodes[i].checked) {
          if ((!nodes[i].type) && nodes[i].deleted) {
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

  deploy(): void {
    this.submitted = true;
    if (this.releasable) {
      this.getReleaseObject();
    } else {
      this.getJSObject();
    }
    const obj: any = {};

    if (!this.releasable) {
      obj.controllerIds = this.selectedSchedulerIds;
      if (this.object.store.draftConfigurations.length > 0 || this.object.store.deployConfigurations.length > 0) {
        if (this.object.store.draftConfigurations.length === 0) {
          delete this.object.store.draftConfigurations;
        }
        if (this.object.store.deployConfigurations.length === 0) {
          delete this.object.store.deployConfigurations;
        }
        obj.store = this.object.store;
      }

      if (!this.isRevoke && this.object.deleteObj.deployConfigurations.length > 0) {
        obj.delete = this.object.deleteObj;
      }
      if (this.isRevoke && this.object.deleteObj.deployConfigurations.length > 0) {
        obj.deployConfigurations = this.object.deleteObj.deployConfigurations;
      }
    } else if (this.releasable) {
      if (this.object.delete.length > 0) {
        obj.delete = this.object.delete;
      }
      if (this.object.update.length > 0) {
        obj.update = this.object.update;
      }
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

    if (!this.releasable && isEmpty(obj.store) && isEmpty(obj.delete) && !this.isRevoke) {
      this.submitted = false;
      this.ref.detectChanges();
      return;
    } else {
      if (this.releasable) {
        if (isEmpty(obj) || (isEmpty(obj.update) && isEmpty(obj.delete))) {
          this.submitted = false;
          this.ref.detectChanges();
          return;
        }
      }
    }

    const URL = this.releasable ? 'inventory/release' : this.isRevoke ? 'inventory/deployment/revoke' : 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe(() => {
      this.activeModal.close('ok');
    }, () => {
      this.submitted = false;
      this.ref.detectChanges();
    });
  }

  remove(): void {
    if (this.nodes.length > 0) {
      this.submitted = true;
      const obj: any = {delete: {deployConfigurations: []}};
      if (!this.releasable) {
        obj.controllerIds = this.selectedSchedulerIds;
      }
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (this.nodes[0].children[i].type && this.nodes[0].children[i].checked) {
          if (this.releasable) {
            if (!isArray(obj.delete)) {
              obj.delete = [];
            }
            obj.delete.push({id: this.nodes[0].children[i].key});
          } else {
            const objDep = {
              configuration: {
                path: this.nodes[0].children[i].path + (this.nodes[0].children[i].path === '/' ? '' : '/') + this.nodes[0].children[i].name,
                objectType: this.nodes[0].children[i].type
              }
            };
            obj.delete.deployConfigurations.push(objDep);
          }
        }
      }
      const URL = this.releasable ? 'inventory/release' : 'inventory/deployment/deploy';
      this.coreService.post(URL, obj).subscribe(() => {
        this.activeModal.close('ok');
      }, () => {
        this.submitted = false;
        this.ref.detectChanges();
      });
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private expandCollapseRec(node): void {
    for (const i in node) {
      if (!node[i].isLeaf) {
        node[i].expanded = true;
      }
      if (node[i].children && node[i].children.length > 0) {
        this.expandCollapseRec(node[i].children);
      }
    }
  }

}

@Component({
  selector: 'app-cron-import-modal-content',
  templateUrl: './cron-import-dialog.html'
})
export class CronImportModalComponent implements OnInit {
  @Input() display: any;
  @Input() controllerId;
  nodes: any = [];
  agents: any = [];
  calendarTree: any = [];
  uploader: FileUploader;
  comments: any = {};
  hasBaseDropZoneOver: any;
  requestObj: any = {
    systemCrontab: false,
    folder: '/'
  };

  constructor(public activeModal: NzModalRef, private modal: NzModalService, private translate: TranslateService,
              public toasterService: ToasterService, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.getTree();
    this.getAgents();
    this.getCalendars();
    this.uploader = new FileUploader({
      url: './api/inventory/convert/cron',
      queueLimit: 1,
      headers: [{
        name: 'X-Access-Token',
        value: this.authService.accessTokenId
      }]
    });
    this.comments.radio = 'predefined';

    this.uploader.onBeforeUploadItem = (item: any) => {
      const obj: any = {};
      if (this.comments.comment) {
        obj.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.ticketLink = this.comments.ticketLink;
      }

      if (this.requestObj.folder && this.requestObj.folder.substring(0, 1) !== '/') {
        this.requestObj.folder = '/' + this.requestObj.folder;
      }
      obj.folder = this.requestObj.folder || '/';
      obj.systemCrontab = this.requestObj.systemCrontab;
      obj.agentName = this.requestObj.agentName;
      obj.calendarName = this.requestObj.calendarName;
      item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
    };

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close(this.requestObj.folder || '/');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.pop('error', res.error.code, res.error.message);
      }
    };
  }

  private getTree(): void{
    this.coreService.post('tree', {
      forInventory: true,
      types: ['INVENTORY']
    }).subscribe((res: any) => {
      if (res.folders.length === 0) {
        res.folders.push({name: '', path: '/'});
      }
      this.nodes = this.coreService.prepareTree(res, true);
    });
  }

  private getAgents(): void{
    this.coreService.post('agents/names', {controllerId: this.controllerId}).subscribe((res: any) => {
      this.agents = res.agentNames ? res.agentNames.sort() : [];
    });
  }

  private getCalendars(): void{
    this.coreService.post('tree', {
      forInventory: true,
      types: ['WORKINGDAYSCALENDAR']
    }).subscribe((res: any) => {
      this.calendarTree = this.coreService.prepareTree(res, false);
    });
  }

  loadData(node, $event): void {
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
        const request: any = {
          path: node.key,
          objectTypes: ['WORKINGDAYSCALENDAR']
        };
        const URL = 'inventory/read/folder';
        this.coreService.post(URL, request).subscribe((res: any) => {
          let data = res.calendars;
          for (let i = 0; i < data.length; i++) {
            const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = data[i].name;
            data[i].path = path;
            data[i].key = data[i].name;
            data[i].type = 'WORKINGDAYSCALENDAR';
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
          this.calendarTree = [...this.calendarTree];
        });
      }
    } else {

    }
  }

  onExpand(e): void {
    this.loadData(e.node, null);
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  import(): void {
    this.uploader.queue[0].upload();
  }

  displayWith(data): string {
    return data.key;
  }

  selectPath(node): void {
    if (!node || !node.origin) {
      return;
    }
    if (this.requestObj.folder !== node.key) {
      this.requestObj.folder = node.key;
    }
  }

  cancel(): void {
    this.activeModal.destroy();
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
  loading = true;
  nodes: any = [];
  submitted = false;
  comments: any = {radio: 'predefined'};
  inValid = false;
  exportType = 'BOTH';
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
    controller: true,
    dailyPlan: true,
    draft: true,
    deploy: true,
    release: true,
    valid: false,
  };
  object: any = {draftConfigurations: [], releaseDraftConfigurations: [], deployConfigurations: [], releasedConfigurations: []};

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private authService: AuthService, private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    this.exportObj.controllerId = this.schedulerIds.selected;
    this.securityLevel = sessionStorage.securityLevel;
    if (this.origin) {
      this.path = this.origin.path;
      if (this.origin.dailyPlan || (this.origin.object &&
        (this.origin.object === InventoryObject.SCHEDULE || this.origin.object === InventoryObject.INCLUDESCRIPT || this.origin.object.match('CALENDAR')))) {
        this.exportType = this.origin.object || 'DAILYPLAN';
        this.filter.controller = false;
        this.filter.deploy = false;
      } else {
        if (this.origin.controller || this.origin.object) {
          this.exportType = this.origin.object || 'CONTROLLER';
          this.filter.dailyPlan = false;
          this.filter.release = false;
        }
      }
    }
    this.buildTree(this.path);
  }

  checkFileName(): void {
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

  buildTree(path, merge = null, cb = null): void {
    const obj: any = {
      folder: path || '/',
      onlyValidObjects: this.filter.valid,
      recursive: false,
      withoutDrafts: !this.filter.draft,
      withoutDeployed: !this.filter.deploy,
      withoutRemovedObjects: true
    };
    const APIs = [];
    if (this.filter.controller && this.filter.dailyPlan) {
      obj.withoutReleased = !this.filter.release;
      APIs.push(this.coreService.post('inventory/deployables', obj).pipe(
        catchError(error => of(error))
      ));
      APIs.push(this.coreService.post('inventory/releasables', obj).pipe(
        catchError(error => of(error))
      ));
    } else {
      if (this.origin && this.origin.object) {
        obj.objectTypes = this.origin.object === 'CALENDAR' ? [InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR] : [this.origin.object];
      }
      if (this.filter.dailyPlan) {
        obj.withoutReleased = !this.filter.release;
        APIs.push(this.coreService.post('inventory/releasables', obj).pipe(
          catchError(error => of(error))
        ));
      } else {
        obj.withVersions = !this.filter.deploy;
        APIs.push(this.coreService.post('inventory/deployables', obj).pipe(
          catchError(error => of(error))
        ));
      }
    }
    forkJoin(APIs).subscribe(res => {
      const mergeObj = res.length > 1 ? this.mergeDeep(res[0], res[1]) : res[0];
      let tree = [];
      if (mergeObj.folders && mergeObj.folders.length > 0 ||
        ((mergeObj.deployables && mergeObj.deployables.length > 0) || (mergeObj.releasables && mergeObj.releasables.length > 0))) {
        tree = this.coreService.prepareTree({
          folders: [{
            name: mergeObj.name,
            path: mergeObj.path,
            folders: mergeObj.folders,
            deployables: mergeObj.deployables,
            releasables: mergeObj.releasables
          }]
        }, false);
        this.inventoryService.updateTree(tree[0]);
      }
      if (merge) {
        if (tree.length > 0) {
          merge.children = tree[0].children;
          this.inventoryService.checkAndUpdateVersionList(tree[0]);
        }
        delete merge.loading;
        this.nodes = [...this.nodes];
      } else {
        this.nodes = tree;
        if (!cb) {
          setTimeout(() => {
            this.loading = false;
            if (this.nodes.length > 0) {
              this.nodes[0].expanded = true;
              this.inventoryService.preselected(this.nodes[0]);
              this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
            }
            this.nodes = [...this.nodes];
          }, 0);
        } else {
          cb();
        }
      }
    }, () => {
      if (merge) {
        delete merge.loading;
      } else {
        if (!cb) {
          this.loading = false;
          this.nodes = [];
        } else {
          cb();
        }
      }
    });
  }

  private mergeDeep(deployables, releasables): any {
    function recursive(sour, dest): void {
      if (!sour.deployables) {
        sour.deployables = [];
      }
      sour.deployables = sour.deployables.concat(dest.releasables || []);
      if (dest.folders && dest.folders.length > 0) {
        for (const i in sour.folders) {
          for (const j in dest.folders) {
            if (sour.folders[i].path === dest.folders[j].path) {
              recursive(sour.folders[i], dest.folders[j]);
              dest.folders.splice(j, 1);
              break;
            }
          }
        }
      }
      if (dest.folders && dest.folders.length > 0) {
        sour.folders = sour.folders.concat(dest.folders);
      }
    }

    recursive(deployables, releasables);
    return deployables;
  }

  onchangeSigning(): void {
    if (this.exportObj.forSigning) {
      this.filter.valid = true;
    }
  }

  filterList(): void {
    this.nodes = [];
    if (!this.filter.controller && !this.filter.dailyPlan) {
      return;
    } else {
      this.loading = true;
      this.buildTree(this.path);
    }
  }

  expandAll(): void {
    this.buildTree(this.path, null, () => {
      const self = this;

      function recursive(node): void {
        for (const i in node) {
          if (!node[i].isLeaf) {
            node[i].expanded = true;
          }
          if (node[i].children && node[i].children.length > 0) {
            if (!node[i].isCall) {
              self.inventoryService.checkAndUpdateVersionList(node[i]);
            }
            recursive(node[i].children);
          }
        }
      }

      recursive(this.nodes);
    });
  }

  collapseAll(): void {
    this.expandCollapseRec(this.nodes);
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    const node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      if (!node.origin.type && !node.origin.object) {
        node.origin.loading = true;
        this.buildTree(node.origin.path, node.origin);
      }
      this.inventoryService.checkAndUpdateVersionList(node.origin);
    }
  }

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.exportObj.isRecursive) {
      const node = e.node;
      if (node.origin.type && node.parentNode) {
        node.parentNode.isHalfChecked = true;
        let flag;
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

  getJSObject(): void {
    const self = this;
    this.object = {draftConfigurations: [], releaseDraftConfigurations: [], deployConfigurations: [], releasedConfigurations: []};
    let selectFolder = true;
    if (this.exportType && this.exportType !== 'CONTROLLER' && this.exportType !== 'DAILYPLAN' && this.exportType !== 'BOTH') {
      selectFolder = false;
    }

    function recursive(nodes): void {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].object && nodes[i].checked) {
          const objDep: any = {};
          if (!nodes[i].type) {
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

              if (self.filter.controller) {
                if (self.filter.deploy) {
                  self.object.deployConfigurations.push(objDep);
                }
                if (self.filter.draft) {
                  self.object.draftConfigurations.push(objDep);
                }
              }
              if (self.filter.dailyPlan) {
                if (self.filter.release) {
                  self.object.releasedConfigurations.push(objDep);
                }
                if (self.filter.draft) {
                  self.object.releaseDraftConfigurations.push(objDep);
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

  onSubmit(): void {
    this.submitted = true;
    this.getJSObject();
    this.export();
  }

  export(): void {
    if ((this.object.deployConfigurations && this.object.deployConfigurations.length > 0) ||
      (this.object.draftConfigurations.length && this.object.draftConfigurations.length > 0) ||
      (this.object.releasedConfigurations && this.object.releasedConfigurations.length > 0) ||
      (this.object.releaseDraftConfigurations.length && this.object.releaseDraftConfigurations.length > 0)) {
      if (this.object.deployConfigurations && this.object.deployConfigurations.length === 0) {
        delete this.object.deployConfigurations;
      }
      if (this.object.draftConfigurations && this.object.draftConfigurations.length === 0) {
        delete this.object.draftConfigurations;
      }
      if (this.object.releasedConfigurations && this.object.releasedConfigurations.length === 0) {
        delete this.object.releasedConfigurations;
      }
      if (this.object.releaseDraftConfigurations && this.object.releaseDraftConfigurations.length === 0) {
        delete this.object.releaseDraftConfigurations;
      }
      const obj: any = {
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

      if (this.comments.comment) {
        obj.auditLog = {};
        obj.auditLog.comment = this.comments.comment;
        if (this.comments.timeSpent) {
          obj.auditLog.timeSpent = this.comments.timeSpent;
        }
        if (this.comments.ticketLink) {
          obj.auditLog.ticketLink = this.comments.ticketLink;
        }
      }
      this.coreService.download('inventory/export', obj, this.exportObj.filename, (res) => {
        if (res) {
          this.activeModal.close('ok');
        } else {
          this.submitted = false;
        }
      });
    } else {
      this.submitted = false;
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private expandCollapseRec(node): void {
    for (let i = 0; i < node.length; i++) {
      if (!node[i].isLeaf) {
        node[i].expanded = true;
      }
      if (node[i].children && node[i].children.length > 0) {
        this.expandCollapseRec(node[i].children);
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
  @Input() display: any;
  nodes: any = [];
  version = {type: 'setOneVersion', name: ''};
  loading = true;
  comments: any = {radio: 'predefined'};
  object: any = {
    isRecursive: false,
    deployConfigurations: [],
    prevVersion: ''
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    this.buildTree();
  }

  expandAll(): void {

  }

  // Collapse all Node
  collapseAll(): void {
    this.expandCollapseRec(this.nodes);
  }

  buildTree(): void {
    this.coreService.post('inventory/deployables', {
      folder: '/',
      recursive: true,
      onlyValidObjects: true,
      withoutRemovedObjects: true,
      withVersions: true
    }).subscribe((res: any) => {
      let tree = [];
      if (res.folders && res.folders.length > 0 ||
        ((res.deployables && res.deployables.length > 0) || (res.releasables && res.releasables.length > 0))) {
        tree = this.coreService.prepareTree({
          folders: [{
            name: res.name,
            path: res.path,
            folders: res.folders,
            deployables: res.deployables,
            releasables: res.releasables
          }]
        }, false);
        this.inventoryService.updateTree(tree[0]);
      }
      this.nodes = tree;
      if (this.nodes.length > 0) {
        this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
      }
      this.loading = false;
    }, () => {
      this.nodes = [];
      this.loading = false;
    });
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    const node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      this.inventoryService.checkAndUpdateVersionList(node.origin);
    }
  }

  getJSObject(): void {
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
                configuration,
                version: nodes[i].version
              });
            } else {
              self.object.deployConfigurations.push({configuration});
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

  setVersion(): void {
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
      this.coreService.post('inventory/deployment/set_versions', obj).subscribe(() => {
        this.activeModal.close('ok');
      });
    } else {
      if (this.object.deployConfigurations.length > 0) {
        obj.deployConfigurations = this.object.deployConfigurations;
        obj.version = this.version.name;
        this.coreService.post('inventory/deployment/set_version', obj).subscribe(() => {
          this.activeModal.close('ok');
        });
      }
    }
  }

  cancelSetVersion(data): void {
    if (this.object.prevVersion) {
      data.version = clone(this.object.prevVersion);
    }
    this.object.prevVersion = undefined;
    data.setVersion = false;
  }

  deleteSetVersion(data): void {
    delete data.version;
  }

  editVersion(data): void {
    if (data.version) {
      this.object.prevVersion = clone(data.version);
    }
  }

  applySetVersion(data): void {
    data.setVersion = false;
  }

  setIndividualVersion(data): void {
    data.setVersion = true;
  }

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.object.isRecursive) {
      const node = e.node;
      if (node.origin.type && node.parentNode) {
        node.parentNode.isHalfChecked = true;
        let flag;
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

  cancel(): void {
    this.activeModal.destroy();
  }

  private expandCollapseRec(node): void {
    for (let i = 0; i < node.length; i++) {
      if (!node[i].isLeaf) {
        node[i].expanded = true;
      }
      if (node[i].children && node[i].children.length > 0) {
        this.expandCollapseRec(node[i].children);
      }
    }
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
  nodes: any = [];
  uploader: FileUploader;
  signatureAlgorithm: string;
  comments: any = {};
  settings: any = {};
  hasBaseDropZoneOver: any;
  requestObj: any = {
    overwrite: false,
    format: 'ZIP',
    targetFolder: '',
    type: 'ignore'
  };

  constructor(public activeModal: NzModalRef, private modal: NzModalService, private translate: TranslateService,
              public toasterService: ToasterService, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.getTree();
    this.uploader = new FileUploader({
      url: this.isDeploy ? './api/inventory/deployment/import_deploy' : './api/inventory/import',
      queueLimit: 1,
      headers: [{
        name: 'X-Access-Token',
        value: this.authService.accessTokenId
      }]
    });
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$IMPORT && sessionStorage.$SOS$IMPORT !== 'undefined') {
      this.settings = JSON.parse(sessionStorage.$SOS$IMPORT);
      if (this.settings) {
        this.requestObj.suffix = this.settings.suffix;
        this.requestObj.prefix = this.settings.prefix;
      }
    }

    this.uploader.onBeforeUploadItem = (item: any) => {
      const obj: any = {};
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
      if (!this.requestObj.overwrite) {
        if (this.requestObj.type === 'suffix') {
          obj.suffix = this.requestObj.suffix;
        } else if (this.requestObj.type === 'prefix') {
          obj.prefix = this.requestObj.prefix;
        }
      }
      obj.format = this.requestObj.format;
      item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
    };

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close(this.requestObj.targetFolder || '/');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.pop('error', res.error.code, res.error.message);
      }
    };
  }

  private getTree(): void{
    this.coreService.post('tree', {
      forInventory: true,
      types: ['INVENTORY']
    }).subscribe((res: any) => {
      if (res.folders.length === 0) {
        res.folders.push({name: '', path: '/'});
      }
      this.nodes = this.coreService.prepareTree(res, true);
    });
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const item = event['0'];
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

  import(): void {
    this.uploader.queue[0].upload();
  }

  displayWith(data): string {
    return data.key;
  }

  selectPath(node): void {
    if (!node || !node.origin) {
      return;
    }
    if (this.requestObj.targetFolder !== node.key) {
      this.requestObj.targetFolder = node.key;
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-json-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './json-editor-dialog.html'
})
export class JsonEditorModalComponent implements OnInit {
  @Input() name: string;
  @Input() objectType: string;
  @Input() object: any;
  @Input() edit: boolean;
  @Input() schedulerId: any;
  @Input() preferences: any;
  submitted = false;
  isError = false;
  data: any;
  errorMsg: string;
  options = new JsonEditorOptions();

  @ViewChild('editor', {static: false}) editor: JsonEditorComponent;

  constructor(public coreService: CoreService, private clipboardService: ClipboardService, public activeModal: NzModalRef,
              private translate: TranslateService, private message: NzMessageService, private ref: ChangeDetectorRef) {
    this.options.mode = 'code';
    this.options.onEditable = () => {
      return this.edit;
    };
    this.options.onChange = () => {
      try {
        this.isError = false;
        this.editor.get();
      } catch (err) {
        this.isError = true;
        this.errorMsg = '';
      }
      this.ref.detectChanges();
    };
  }

  ngOnInit(): void {
    this.coreService.get('assets/i18n/json-editor-text_' + this.preferences.locale + '.json').subscribe((data) => {
      this.options.languages = {};
      this.options.languages[this.preferences.locale] = data;
      this.options.language = this.preferences.locale;
      this.editor.setOptions(this.options);
    });
    this.options.modes = ['code', 'tree'];
    this.data = this.coreService.clone(this.object);
    delete this.data.type;
    delete this.data.TYPE;
    delete this.data.versionId;
  }

  copyToClipboard(): void {
    this.validateByURL(this.editor.get(), (isValid) => {
      if (isValid) {
        this.coreService.showCopyMessage(this.message);
        this.clipboardService.copyFromContent(this.editor.getText());
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.validateByURL(this.editor.get(), (isValid) => {
      if (isValid) {
        this.activeModal.close(this.editor.get());
      }
      this.submitted = false;
      this.ref.detectChanges();
    });
  }

  private parseErrorMsg(res, cb): void {
    let flag = true;
    if (!res.valid) {
      flag = false;
      this.errorMsg = res.invalidMsg;
    }
    this.isError = !flag;
    this.ref.detectChanges();
    cb(flag);
  }

  private validateByURL(json, cb): void {
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe((res: any) => {
      this.parseErrorMsg(res, (flag) => {
        cb(flag);
      });
    }, (err) => {
      cb(err);
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

  constructor(public coreService: CoreService, public activeModal: NzModalRef, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit(): void {
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
    const self = this;
    const item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      this.uploader.clearQueue();
    } else {
      const reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event): void {
      let data;
      try {
        data = JSON.parse(_event.target.result);
      } catch (e) {

      }
      if (data) {
        self.validateByURL(data, (res) => {
          if (!res.valid) {
            self.showErrorMsg(res.invalidMsg);
          } else {
            self.data = data;
          }
        });
      } else {
        self.showErrorMsg(null);
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.data);
    }, 100);
  }

  private validateByURL(json, cb): void {
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe((res: any) => {
      cb(res);
    }, (err) => {
      cb(err);
    });
  }

  private showErrorMsg(errorMsg): void {
    let msg = errorMsg;
    if (!errorMsg) {
      this.translate.get('inventory.message.invalidFile', {objectType: this.object.objectType}).subscribe(translatedValue => {
        msg = translatedValue;
      });
    }
    this.toasterService.pop('error', '', msg);
    this.uploader.queue[0].remove();
  }
}

@Component({
  selector: 'app-create-object-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-object-dialog.html'
})
export class CreateObjectModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() obj: any;
  @Input() copy: any;
  @Input() restore: boolean;
  submitted = false;
  settings: any = {};
  display: any;
  comments: any = {};
  object = {name: '', type: 'suffix', newName: '', onlyContains: false, originalName: '', suffix: '', prefix: ''};

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (this.restore) {
      this.settings = JSON.parse(sessionStorage.$SOS$RESTORE);
    } else if (this.copy) {
      this.settings = JSON.parse(sessionStorage.$SOS$COPY);
    }
    if (this.copy) {
      this.object.originalName = this.copy.name;
    }
    if (this.settings) {
      this.object.suffix = this.settings.suffix;
      this.object.prefix = this.settings.prefix;
    }
    this.ref.detectChanges();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.copy || this.restore) {
      const data: any = {};
      if (this.object.type === 'suffix') {
        data.suffix = this.object.suffix;
      } else if (this.object.type === 'prefix') {
        data.prefix = this.object.prefix;
      } else if (this.object.type === 'existing') {

      } else {
        data.newName = this.object.newName;
      }
      if (this.object.originalName) {
        data.originalName = this.object.originalName;
      }
      if (this.object.onlyContains) {
        data.noFolder = true;
      }
      if (this.restore) {
        this.restoreFunc(this.obj, data);
      } else {
        this.paste(this.obj, data);
      }
    } else {
      const PATH = this.obj.path + (this.obj.path === '/' ? '' : '/') + this.object.name;
      this.coreService.post('inventory/validate/path', {
        objectType: this.obj.type,
        path: PATH
      }).subscribe(() => {
        this.activeModal.close({
          name: this.object.name
        });
      }, () => {
        this.submitted = false;
        this.ref.detectChanges();
      });
    }
  }

  private paste(obj, data): void {
    const request: any = {
      shallowCopy: this.copy.shallowCopy,
      suffix: data.suffix,
      prefix: data.prefix
    };
    if (this.copy.id) {
      request.newPath = obj.path + (obj.path === '/' ? '' : '/') + (data.originalName ? data.originalName : this.copy.name);
      request.id = this.copy.id;
    } else {
      request.objectType = 'FOLDER';
      request.newPath = obj.path + (data.noFolder ? '' : (obj.path === '/' ? '' : '/') + this.copy.name);
      request.path = this.copy.path;
    }
    request.auditLog = {};
    if (this.comments.comment) {
      request.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      request.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      request.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.coreService.post('inventory/copy', request).subscribe((res) => {
      this.activeModal.close(res);
    }, () => {
      this.submitted = false;
      this.ref.detectChanges();
    });
  }

  private restoreFunc(obj, data): void {
    const request: any = {
      suffix: data.suffix,
      prefix: data.prefix
    };
    if (this.obj.id) {
      request.newPath = obj.path + (obj.path === '/' ? '' : '/') + (data.newName ? data.newName : obj.name);
      request.id = this.obj.id;
    } else {
      request.objectType = 'FOLDER';
      request.newPath = data.newName ? (obj.path.substring(0, obj.path.lastIndexOf('/'))) + '/' + data.newName : obj.path;
      request.path = obj.path;
    }
    request.auditLog = {};
    if (this.comments.comment) {
      request.auditLog.comment = this.comments.comment;
    }
    if (this.comments.timeSpent) {
      request.auditLog.timeSpent = this.comments.timeSpent;
    }
    if (this.comments.ticketLink) {
      request.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.coreService.post('inventory/trash/restore', request).subscribe((res) => {
      this.activeModal.close(res);
    }, () => {
      this.submitted = false;
      this.ref.detectChanges();
    });
  }
}

@Component({
  selector: 'app-create-folder-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-folder-dialog.html'
})
export class CreateFolderModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() origin: any;
  @Input() deepRename: any;
  @Input() rename: any;
  @Input() oldName: any;
  submitted = false;
  isUnique = true;
  isValid = true;
  folder = {error: false, name: '', deepRename: 'rename', search: '', replace: ''};

  constructor(private coreService: CoreService, public activeModal: NzModalRef,  private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (this.origin) {
      if (this.origin.object || this.origin.controller || this.origin.dailyPlan) {
        this.folder.deepRename = 'replace';
      } else if (this.origin.type) {
        this.folder.name = clone(this.origin.name);
      } else if (this.origin.path === '/') {
        this.folder.deepRename = 'replace';
      }
    }
    if (this.rename && !this.folder.name) {
      this.folder.name = this.origin.name;
    }
    this.ref.detectChanges();
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.rename) {
      const PATH = this.origin.path + (this.origin.path === '/' ? '' : '/') + this.folder.name;
      this.coreService.post('inventory/store', {
        objectType: 'FOLDER',
        path: PATH,
        configuration: {}
      }).subscribe((res: any) => {
        this.activeModal.close({
          name: this.folder.name,
          title: res.path,
          path: res.path,
          key: res.path,
          children: []
        });
      }, () => {
        this.submitted = false;
        this.ref.detectChanges();
      });
    } else {
      if (!this.origin.controller && !this.origin.dailyPlan && !this.origin.object && this.origin.name === this.folder.name) {
        this.activeModal.close('NO');
        return;
      }

      let obj: any = {
        newPath: this.folder.name
      };
      if (this.origin.id) {
        obj.id = this.origin.id;
      } else {
        obj.path = this.origin.path;
        obj.objectType = 'FOLDER';
      }

      let URL = this.folder.deepRename === 'replace' ? 'inventory/replace' : 'inventory/rename';
      if (this.folder.deepRename === 'replace') {
        if (this.origin.object || this.origin.controller || this.origin.dailyPlan) {
          obj = this.getObjectArr(this.origin);
        } else {
          obj = {path: this.origin.path};
          URL = 'inventory/replace/folder';
        }
        obj.search = this.folder.search;
        obj.replace = this.folder.replace;
      }

      this.submitted = false;
      this.coreService.post(URL, obj).subscribe((res) => {
        this.activeModal.close(res);
      }, () => {
        this.submitted = false;
        this.ref.detectChanges();
      });
    }
  }

  checkFolderName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.origin.children.length; i++) {
      if (this.folder.name === this.origin.children[i].name) {
        this.isUnique = false;
        break;
      }
    }
    this.ref.detectChanges();
  }

  isValidObject(str: string): void {
    this.isValid = true;
    if (!str.match(/[!?~'"}\[\]{@:;#\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(str) && /^(?!-)(?!.*--)/.test(str)
      && !str.substring(0, 1).match(/[-]/) && !str.substring(str.length - 1).match(/[-]/) && !/\s/.test(str)
      && !str.endsWith('/') && !/\/{2,}/g.test(str)) {
      if (/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(str)) {
        this.isValid = false;
      }
    } else {
      this.isValid = false;
    }
    this.ref.detectChanges();
  }

  private getObjectArr(object): any {
    const obj: any = {objects: []};
    object.children.forEach((item) => {
      if (item.children) {
        item.children.forEach((data) => {
          obj.objects.push({id: data.id});
        });
      } else {
        obj.objects.push({id: item.id});
      }
    });
    return obj;
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
  trashTree: any = [];
  isLoading = true;
  pageView = 'grid';
  options: any = {};
  data: any = {};
  node: any = {};
  copyObj: any;
  selectedObj: any = {};
  selectedData: any = {};
  sideView: any = {};
  securityLevel: string;
  type: string;
  inventoryConfig: any;
  isTreeLoaded = false;
  isTrash = false;
  isSearchVisible = false;
  tempObjSelection: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  indexOfNextAdd = 0;
  objectHistory = [];

  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;
  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(
    private authService: AuthService,
    public coreService: CoreService,
    private dataService: DataService,
    public inventoryService: InventoryService,
    private modal: NzModalService,
    private translate: TranslateService,
    private toasterService: ToasterService,
    private nzContextMenuService: NzContextMenuService,
    private message: NzMessageService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.add || res.reload) {
          this.updateTree(this.isTrash);
        } else if (res.set) {
          if (this.treeCtrl && !this.isTrash) {
            if (!this.isTrash) {
              this.selectedData = res.set;
              this.setSelectedObj(this.selectedObj.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
            } else if (this.isTrash) {
              this.selectedData = res.set;
              this.setSelectedObj(this.selectedObj.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
            }
          }
        } else if (res.cut) {
          this.cut(res);
        } else if (res.copy) {
          this.copy(res);
        } else if (res.paste) {
          this.paste(res.paste);
        } else if (res.deploy) {
          this.deployObject(res.deploy, false);
        } else if (res.revoke) {
          this.revoke(res.revoke);
        } else if (res.release) {
          this.releaseObject(res.release);
        } else if (res.restore) {
          this.restoreObject(res.restore);
        } else if (res.delete) {
          this.deletePermanently(res.delete);
        } else if (res.showJson) {
          this.showJson(res);
        } else if (res.exportJSON) {
          this.exportJSON(res.exportJSON);
        } else if (res.importJSON) {
          this.importJSON(res.importJSON);
        } else if (res.rename) {
          this.rename(res.rename);
        } else if (res.renameObject) {
          this.renameObject(res);
        } else if (res.back) {
          this.backToListView();
        } else if (res.navigate) {
          this.pushObjectInHistory();
          this.selectedObj.type = res.navigate.type;
          this.selectedObj.name = res.navigate.name;
          this.recursivelyExpandTree();
        }
      }
    });
    this.subscription3 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf(false);
    });
  }

  ngOnInit(): void {
    this.initConf(true);
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.coreService.setSideView(this.sideView);
    this.dataService.reloadTree.next(null);
    this.dataService.announceFunction('');
    this.coreService.tabs._configuration.state = 'inventory';
    this.inventoryConfig.expand_to = this.getExpandPaths();
    if (!this.isTrash) {
      this.inventoryConfig.selectedObj = this.selectedObj;
    }
    this.inventoryConfig.copyObj = this.copyObj;
    this.inventoryConfig.isTrash = this.isTrash;
    $('.scroll-y').remove();
  }

  initTree(path, mainPath, redirect = false): void {
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
        this.tree = this.recursiveTreeUpdate(tree, this.tree, false);
        this.updateFolders(path, false, (response) => {
          this.updateTree(false);
          if (redirect) {
            if (response) {
              response.expanded = true;
            }
            this.clearSelection();
          }
        }, redirect);
        if (mainPath && path !== mainPath) {
          this.updateFolders(mainPath, false, () => {
            this.updateTree(false);
          });
        }
      } else {
        if (!isEmpty(this.inventoryConfig.expand_to)) {
          this.tree = this.mergeTree(tree, this.inventoryConfig.expand_to);
          this.inventoryConfig.expand_to = undefined;
          this.selectedObj = this.inventoryConfig.selectedObj || {};
          this.copyObj = this.inventoryConfig.copyObj;
          if (this.inventoryConfig.selectedObj && this.inventoryConfig.selectedObj.path) {
            this.updateFolders(this.inventoryConfig.selectedObj.path, false, (response) => {
              this.isLoading = false;
              this.type = this.inventoryConfig.selectedObj.type;
              if (response) {
                this.selectedData = response.data;
              }
              this.updateTree(false);
            });
          } else {
            this.isLoading = false;
          }
        } else if (!isEmpty(this.inventoryConfig.selectedObj)) {
          this.tree = tree;
          this.selectedObj = this.inventoryConfig.selectedObj;
          this.recursivelyExpandTree();
        } else {
          this.tree = tree;
          if (this.tree.length > 0) {
            this.updateObjects(this.tree[0], false, (children) => {
              this.isLoading = false;
              if (children.length > 0) {
                this.tree[0].children.splice(0, 0, children[0]);
                this.tree[0].children.splice(1, 0, children[1]);
              }
              this.tree[0].expanded = true;
              this.updateTree(false);
            }, false);
          }
          if (this.inventoryConfig.selectedObj) {
            this.inventoryConfig.selectedObj.path = this.tree[0].path;
          }
        }
      }
    }, () => this.isLoading = false);
  }

  initTrashTree(path): void {
    this.coreService.post('tree', {
      forInventoryTrash: true,
      types: ['INVENTORY']
    }).subscribe((res: any) => {
      if (res.folders.length > 0) {
        const tree = this.coreService.prepareTree(res, false);
        if (path) {
          this.trashTree = this.recursiveTreeUpdate(tree, this.trashTree, true);
          this.updateFolders(path, true, () => {
            this.updateTree(true);
          });
        } else {
          this.trashTree = tree;
          if (this.trashTree.length > 0) {
            this.trashTree[0].expanded = true;
            this.updateObjects(this.trashTree[0], true, (children) => {
              this.isTreeLoaded = false;
              if (children.length > 0) {
                this.trashTree[0].children.splice(0, 0, children[0]);
                this.trashTree[0].children.splice(1, 0, children[1]);
              }
              this.updateTree(true);
            }, false);
          }
        }
      }
    }, () => this.isTreeLoaded = false);
  }

  recursivelyExpandTree(): void {
    if (this.selectedObj.type) {
      this.coreService.post('inventory/read/configuration', {
        objectType: this.selectedObj.type,
        path: this.selectedObj.name
      }).subscribe((res) => {
        if (this.selectedObj.type.match(/CALENDAR/)) {
          this.selectedObj.type = 'CALENDAR';
        }
        this.selectedObj.id = res.id;
        this.findObjectByPath(res.path);
      }, () => {
        this.updateObjects(this.tree[0], this.isTrash, (children) => {
          this.isLoading = false;
          if (children.length > 0) {
            this.tree[0].children.splice(0, 0, children[0]);
            this.tree[0].children.splice(1, 0, children[1]);
            this.tree[0].expanded = true;
          }
          this.updateTree(this.isTrash);
        }, false);
      });
    }
  }

  private findObjectByPath(path): void {
    this.selectedObj.path = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1);
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
          if (!data.controller && !data.dailyPlan) {
            self.updateObjects(data, self.isTrash, (children) => {
              if (children.length > 0) {
                const index = data.children[0] && data.children[0].controller ? 1 : 0;
                data.children.splice(0, index, children[0]);
                data.children.splice(1, index, children[1]);

                const parentNode = (self.selectedObj.type === InventoryObject.SCHEDULE || self.selectedObj.type === InventoryObject.INCLUDESCRIPT || self.selectedObj.type.match(/CALENDAR/)) ? children[1] : children[0];
                if (self.selectedObj.path === parentNode.path) {
                  parentNode.expanded = true;
                  for (let j = 0; j < parentNode.children.length; j++) {
                    const x = parentNode.children[j];
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
                  self.updateTree(self.isTrash);
                }
              }
            }, false);
          }
        }
        if (data.children && pathArr.length > 0) {
          for (let i = 0; i < data.children.length; i++) {
            traverseTree(data.children[i]);
          }
        }
      }

      traverseTree(this.tree[0]);
    }
  }

  recursiveTreeUpdate(scr, dest, isTrash): any {
    const self = this;
    let isFound = false;

    function recursive(scrTree, destTree) {
      if (scrTree && destTree) {
        for (let j = 0; j < scrTree.length; j++) {
          if (isTrash === self.isTrash && self.type) {
            if (scrTree[j].path === self.selectedData.path) {
              isFound = true;
            }
          }
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
                const arr = [];
                for (let x = 0; x < destTree[i].children.length; x++) {
                  if (destTree[i].children[x].controller) {
                    arr.push(destTree[i].children[x]);
                  }
                  if (destTree[i].children[x].dailyPlan) {
                    arr.push(destTree[i].children[x]);
                  }
                }
                if (arr.length > 0) {
                  scrTree[j].children = arr.concat(scrTree[j].children || []);
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
    if (!isFound && this.type && isTrash === self.isTrash) {
      this.clearSelection();
    }
    return scr;
  }

  reloadFolders(isChecked: boolean): void {
    this.dataService.reloadTree.next({reloadFolder: isChecked + ''});
    if (!this.isTrash && isChecked) {
      if (this.tree.length > 0) {
        const paths = [];

        function traverseTree(data): void {
          if (data.children && data.children.length > 0 && data.expanded) {
            paths.push(data.path);
            for (const i in data.children) {
              if (data.children[i] && !data.children[i].controller && !data.children[i].object && !data.children[i].dailyPlan) {
                traverseTree(data.children[i]);
              }
            }
          }
        }

        traverseTree(this.tree[0]);
        paths.forEach((path, index) => {
          this.updateFolders(path, false, () => {
            if (index == paths.length - 1) {
              this.updateTree(false);
            }
          });
        });
      }
    }
  }

  updateFolders(path, isTrash, cb, redirect = false): void {
    const self = this;
    let matchData: any;
    if ((!isTrash && this.tree.length > 0) || (isTrash && this.trashTree.length > 0)) {
      function traverseTree(data) {
        if (path && data.path && (path === data.path)) {
          self.updateObjects(data, isTrash, (children) => {
            if (children.length > 0) {
              let folders = data.children;
              if (data.children.length > 1 && data.children[0].controller) {
                const index = data.children[0].controller ? 1 : 0;
                const index2 = data.children[1].dailyPlan ? 1 : 0;
                data.children.splice(0, index, children[0]);
                data.children.splice(1, index2, children[1]);
              } else {
                data.children = children;
                if (folders.length > 0 && !folders[0].controller) {
                  data.children = data.children.concat(folders);
                }
              }
            }
            self.updateTree(isTrash);
          }, !path);
          matchData = data;
          if (redirect) {
            cb(matchData);
          }
        }

        if (data.children) {
          let flag = false;
          for (let i = 0; i < data.children.length; i++) {
            if (data.children[i].controller || data.children[i].dailyPlan) {
              for (let j = 0; j < data.children[i].children.length; j++) {
                const x = data.children[i].children[j];
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

      traverseTree(isTrash ? this.trashTree[0] : this.tree[0]);
    }
    if (!matchData && cb) {
      cb();
    }
  }

  openMenu(node, evt): void {
    if (this.menu) {
      this.node = node;
      setTimeout(() => {
        this.nzContextMenuService.create(evt, this.menu);
      }, 0);
    }
  }

  openFolder(node: NzTreeNode): void {
    if (node instanceof NzTreeNode) {
      node.isExpanded = !node.isExpanded;
      if (node.isExpanded && !node.origin.controller && !node.origin.dailyPlan && !node.origin.type && !node.origin.object) {
        this.expandFolder(node);
      }
    }
  }

  selectNode(node: NzTreeNode | NzFormatEmitEvent): void {
    if (node instanceof NzTreeNode) {
      if ((!node.origin.object && !node.origin.type)) {
        if (!node.origin.type && !node.origin.object && !node.origin.controller && !node.origin.dailyPlan) {
          node.isExpanded = !node.isExpanded;
          if (node.isExpanded) {
            this.expandFolder(node);
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

  updateObjects(data, isTrash, cb, isExpandConfiguration): void {
    if (!data.permitted) {
      cb([]);
      return;
    }
    let flag = true;
    const controllerObj: any = {controllerArr: []};
    const dailyPlanObj: any = {dailyPlanArr: []};
    const KEY = data.path === '/' ? '/' : (data.path + '/');
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
      controllerObj.controllerArr = [
        {name: 'Workflows', title: 'Workflows', object: InventoryObject.WORKFLOW, children: [], path: data.path, key: (KEY + 'Workflows$')},
        {
          name: 'File Order Sources',
          title: 'File Order Sources',
          object: InventoryObject.FILEORDERSOURCE,
          children: [],
          path: data.path,
          key: (KEY + 'File_Order_Sources$')
        },
        {
          name: 'Job Resources',
          title: 'Job Resources',
          object: InventoryObject.JOBRESOURCE,
          children: [],
          path: data.path,
          key: (KEY + 'Job_Resources$')
        },
        {name: 'Boards', title: 'Boards', object: InventoryObject.NOTICEBOARD, children: [], path: data.path, key: (KEY + 'Boards$')},
        {name: 'Locks', title: 'Locks', object: InventoryObject.LOCK, children: [], path: data.path, key: (KEY + 'Locks$')}
      ];
      dailyPlanObj.dailyPlanArr = [
        {name: 'IncludeScripts', title: 'Include Scripts', object: InventoryObject.INCLUDESCRIPT, children: [], path: data.path, key: (KEY + 'IncludeScripts$')},
        {name: 'Schedules', title: 'Schedules', object: InventoryObject.SCHEDULE, children: [], path: data.path, key: (KEY + 'Schedules$')},
        {name: 'Calendars', title: 'Calendars', object: 'CALENDAR', children: [], path: data.path, key: (KEY + 'Calendars$')}
      ];
    }
    const obj: any = {
      path: data.path
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked && !isTrash) {
      obj.controllerId = this.schedulerIds.selected;
    }
    const URL = isTrash ? 'inventory/trash/read/folder' : 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      for (let i = 0; i < controllerObj.controllerArr.length; i++) {
        let resObject;
        if (controllerObj.controllerArr[i].object === InventoryObject.WORKFLOW) {
          resObject = res.workflows;
        } else if (controllerObj.controllerArr[i].object === InventoryObject.FILEORDERSOURCE) {
          resObject = res.fileOrderSources;
        } else if (controllerObj.controllerArr[i].object === InventoryObject.JOBRESOURCE) {
          resObject = res.jobResources;
        } else if (controllerObj.controllerArr[i].object === InventoryObject.NOTICEBOARD) {
          resObject = res.noticeBoards;
        } else if (controllerObj.controllerArr[i].object === InventoryObject.LOCK) {
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
            controllerObj.controllerArr[i].children = sortBy(controllerObj.controllerArr[i].children, 'name');
          }
        } else {
          controllerObj.controllerArr[i].children = [];
        }
      }
      for (let i = 0; i < dailyPlanObj.dailyPlanArr.length; i++) {
        dailyPlanObj.dailyPlanArr[i].deleted = data.deleted;
        let resObject;
        if (dailyPlanObj.dailyPlanArr[i].object === InventoryObject.SCHEDULE) {
          resObject = res.schedules;
        } else if (dailyPlanObj.dailyPlanArr[i].object === InventoryObject.INCLUDESCRIPT) {
          resObject = res.includeScripts;
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
            dailyPlanObj.dailyPlanArr[i].children = sortBy(dailyPlanObj.dailyPlanArr[i].children, 'name');
          }
        } else {
          dailyPlanObj.dailyPlanArr[i].children = [];
        }
      }
      const conf = [{
        name: 'Controller',
        title: 'Controller',
        controller: 'CONTROLLER',
        isLeaf: false,
        children: controllerObj.controllerArr,
        path: data.path,
        key: (KEY + 'Controller$'),
        expanded: controllerObj.expanded,
        deleted: data.deleted
      }, {
        name: 'Daily Plan',
        title: 'Automation',
        dailyPlan: 'DAILYPLAN',
        isLeaf: false,
        children: dailyPlanObj.dailyPlanArr,
        path: data.path,
        key: (KEY + 'Automation$'),
        expanded: dailyPlanObj.expanded,
        deleted: data.deleted
      }];

      if ((this.preferences.joeExpandOption === 'both' || isExpandConfiguration) && !controllerObj.expanded1) {
        conf[0].expanded = true;
        conf[1].expanded = true;
      }
      cb(conf);
    }, () => {
      cb([{
        name: 'Controller',
        title: 'Controller',
        controller: 'CONTROLLER',
        key: (KEY + 'Controller$'),
        children: controllerObj.controllerArr,
        path: data.path,
        deleted: data.deleted
      }, {
        name: 'Daily Plan',
        title: 'Automation',
        dailyPlan: 'DAILYPLAN',
        key: (KEY + 'Automation$'),
        children: dailyPlanObj.dailyPlanArr,
        path: data.path,
        deleted: data.deleted
      }]);
    });
  }

  switchToTrash(): void {
    this.trashTree = [];
    this.isTrash = !this.isTrash;
    if (this.isTrash) {
      this.isTreeLoaded = false;
      this.initTrashTree(null);
      if (this.type) {
        this.tempObjSelection = {
          type: clone(this.type),
          selectedData: this.coreService.clone(this.selectedData),
          selectedObj: clone(this.selectedObj)
        };
      }
      this.clearSelection();
    } else {
      this.clearSelection();
      if (this.tempObjSelection.type) {
        this.type = clone(this.tempObjSelection.type);
        this.selectedData = this.coreService.clone(this.tempObjSelection.selectedData);
        this.selectedObj = clone(this.tempObjSelection.selectedObj);
        this.tempObjSelection = {};
      }
    }
  }

  mergeTree(scr, dest): any {
    function checkPath(obj) {
      for (let i = 0; i < dest.length; i++) {
        if (dest[i].name === obj.name && dest[i].path === obj.path) {
          obj.expanded = dest[i].expanded;
          if (dest[i].child1 && Array.isArray(obj.children)) {
            obj.children.splice(0, 0, dest[i].child1);
            obj.children.splice(1, 0, dest[i].child2);
          }
          dest.splice(i, 1);
          break;
        }
      }
    }

    function recursive(scrTree) {
      if (scrTree) {
        for (let j = 0; j < scrTree.length; j++) {
          checkPath(scrTree[j]);
          if (scrTree[j].children) {
            recursive(scrTree[j].children);
          }
        }
      }
    }

    recursive(scr);
    return scr;
  }

  backToObject(): void {
    if (this.indexOfNextAdd > 0) {
      --this.indexOfNextAdd;
      this.selectedObj = clone(this.objectHistory[this.indexOfNextAdd]);
      this.objectHistory.splice(this.indexOfNextAdd, 1);
      this.recursivelyExpandTree();
    }
  }

  addObject(data, type): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = true;
    }
    const object = data.origin;
    this.createObject(type || object.object, object.children, object.path);
  }

  newObject(node, type): void {
    let list;
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
      const data = node.origin.children;
      this.updateObjects(node.origin, false, (children) => {
        if (children.length > 0) {
          if ((type.match('CALENDAR') || type === InventoryObject.SCHEDULE || type === InventoryObject.INCLUDESCRIPT)) {
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

  exportObject(node): void {
    let origin = null;
    if (node) {
      origin = node.origin ? node.origin : node;
    }
    this.modal.create({
      nzTitle: undefined,
      nzContent: ExportComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        schedulerIds: this.schedulerIds,
        preferences: this.preferences,
        display: this.preferences.auditLog,
        origin
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  import(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportWorkflowModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        display: this.preferences.auditLog
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(path => {
      if (path) {
        setTimeout(() => {
          if (this.tree && this.tree.length > 0) {
            this.initTree(path, null, true);
          }
        }, 700);
      }
    });
  }

  importDeploy(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportWorkflowModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        schedulerIds: this.schedulerIds,
        display: this.preferences.auditLog,
        isDeploy: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(path => {
      if (path) {
        setTimeout(() => {
          if (this.tree && this.tree.length > 0) {
            this.initTree(path, null, true);
          }
        }, 700);
      }
    });
  }

  setVersion(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: SetVersionComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerIds: this.schedulerIds,
        preferences: this.preferences,
        display: this.preferences.auditLog
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(path => {

    });
  }

  convertJob(type: string): void{
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CronImportModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        display: this.preferences.auditLog,
        controllerId: this.schedulerIds.selected
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(path => {
      if (path) {
        setTimeout(() => {
          if (this.tree && this.tree.length > 0) {
            this.initTree(path, null, true);
          }
        }, 700);
      }
    });
  }

  createFolder(node: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateFolderModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        origin: node.origin
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(path => {
      if (path) {
        this.initTree(node.origin.path, null);
      }
    });
  }

  private getAllowedControllerOnly(): any {
    const obj = clone(this.schedulerIds);
    obj.controllerIds = obj.controllerIds.filter((id) => {
      let flag = true;
      if (this.permission.controllers) {
        if (this.permission.controllers[id]) {
          if (!this.permission.controllers[id].deployments.deploy) {
            flag = false;
          }
        }
      }
      return flag;
    });
    return obj;
  }

  deployObject(node, releasable): void {
    const origin = node.origin ? node.origin : node;
    if (this.selectedObj && this.selectedObj.id &&
      this.selectedObj.type === InventoryObject.WORKFLOW) {
      this.dataService.reloadTree.next({saveObject: origin});
    }
    if (releasable && origin.id) {
      this.releaseSingleObject(origin);
      return;
    }

    if (origin.type || this.inventoryService.isControllerObject(origin.objectType)) {
      if (!node.origin) {
        origin.path = origin.path.substring(0, origin.path.lastIndexOf('/')) || '/';
      }

      this.modal.create({
        nzTitle: undefined,
        nzContent: SingleDeployComponent,
        nzComponentParams: {
          schedulerIds: this.getAllowedControllerOnly(),
          display: this.preferences.auditLog,
          data: origin,
          isChecked: this.inventoryService.checkDeploymentStatus.isChecked
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: DeployComponent,
        nzClassName: releasable ? 'sm' : 'lg',
        nzComponentParams: {
          schedulerIds: this.getAllowedControllerOnly(),
          preferences: this.preferences,
          display: this.preferences.auditLog,
          path: origin.path,
          data: origin,
          isChecked: this.inventoryService.checkDeploymentStatus.isChecked,
          releasable
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  revoke(node): void {
    const origin = node.origin ? node.origin : node;
    if (origin.type || this.inventoryService.isControllerObject(origin.objectType)) {
      if (!node.origin) {
        origin.path = origin.path.substring(0, origin.path.lastIndexOf('/')) || '/';
      }

      this.modal.create({
        nzTitle: undefined,
        nzContent: SingleDeployComponent,
        nzComponentParams: {
          schedulerIds: this.getAllowedControllerOnly(),
          display: this.preferences.auditLog,
          data: origin,
          isRevoke: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: DeployComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          schedulerIds: this.getAllowedControllerOnly(),
          preferences: this.preferences,
          display: this.preferences.auditLog,
          path: origin.path,
          data: origin,
          isRevoke: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  reDeployObject(node: any, sync = false): void {
    const origin = node.origin ? node.origin : node;
    if (origin.controller) {
      this.coreService.post(sync ? 'inventory/deployment/synchronize' : 'inventory/deployment/redeploy', {
        controllerId: this.schedulerIds.selected,
        folder: origin.path,
        recursive: false
      }).subscribe(() => {
      });
    } else {
      const obj = {
        title: 'redeploy',
        message: 'redeployFolderRecursively',
        type: 'Redeploy',
        objectName: origin.path
      };
      if (sync) {
        obj.title = 'synchronize';
        obj.message = 'synchronizeFolderRecursively';
        obj.type = 'Synchronize';
      }
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: obj,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.coreService.post(sync ? 'inventory/deployment/synchronize' : 'inventory/deployment/redeploy', {
            controllerId: this.schedulerIds.selected,
            folder: origin.path,
            recursive: true
          }).subscribe(() => {
          });
        }
      });
    }
  }

  synchronize(node): void {
    this.reDeployObject(node, true);
  }

  releaseObject(data): void {
    this.deployObject(data, true);
  }

  rename(data): void {
    if (data.id === this.selectedObj.id) {
      this.selectedObj.name = data.name;
    }
    this.updateFolders(data.path, false, () => {
      this.updateTree(false);
    });
  }

  showJson(obj: any): void {
    this.coreService.post('inventory/read/configuration', {
      id: obj.showJson.id,
    }).subscribe((res: any) => {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: JsonEditorModalComponent,
        nzAutofocus: null,
        nzClassName: 'lg',
        nzComponentParams: {
          schedulerId: this.schedulerIds.selected,
          preferences: this.preferences,
          object: res.configuration,
          objectType: res.objectType,
          name: res.path,
          edit: obj.edit
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.storeData(obj.showJson, result, false);
        }
      });
    });
  }

  editJson(data: any, isEdit: boolean): void {
    this.showJson({showJson: data, edit: isEdit});
  }

  importJSON(obj: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: UploadModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        object: obj,
        objectType: obj.objectType || obj.type
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.storeData(obj, result, !!this.type);
      }
    });
  }

  exportJSON(obj): void {
    if (obj.id) {
      this.coreService.post('inventory/read/configuration', {
        id: obj.id,
      }).subscribe((res: any) => {
        const name = obj.name + (obj.type ? '.' + obj.type.toLowerCase() : '') + '.json';
        const fileType = 'application/octet-stream';
        delete res.configuration.TYPE;
        const data = JSON.stringify(res.configuration, undefined, 2);
        const blob = new Blob([data], {type: fileType});
        saveAs(blob, name);
      });
    }
  }

  renameObject(node: any): void {
    if (this.permission && this.permission.joc && this.permission.joc.inventory.manage) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: CreateFolderModalComponent,
        nzAutofocus: null,
        nzComponentParams: {
          schedulerId: this.schedulerIds.selected,
          origin: node.renameObject || node.origin,
          rename: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  cut(node): void {
    this.copyObj = node.cut || node.origin;
    this.copyObj.operation = 'CUT';
  }

  copy(node): void {
    this._copy(node, false);
  }

  shallowCopy(node): void {
    this._copy(node, true);
  }

  paste(node): void {
    let object = node;
    if (node instanceof NzTreeNode) {
      object = node.origin;
    }
    if (this.copyObj) {
      if (this.copyObj.operation === 'COPY') {
        this.openObjectNameModal(object, (res) => {
          this.checkNewCopyObject(node, res);
        });
      } else if (this.copyObj.operation === 'CUT') {
        const obj: any = {newPath: object.path};
        if (this.copyObj.id) {
          obj.id = this.copyObj.id;
        } else {
          obj.objectType = 'FOLDER';
          obj.path = this.copyObj.path;
        }
        if (this.copyObj.path === obj.newPath) {
          this.copyObj = undefined;
          return;
        } else {
          const pathArr = [];
          const arr = obj.newPath.split('/');
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
          if (pathArr.length > 0 && pathArr.indexOf(this.copyObj.path) > -1 && obj.objectType === 'FOLDER') {
            let msg = '';
            this.translate.get('error.message.pasteInSubFolderNotAllowed').subscribe(translatedValue => {
              msg = translatedValue;
            });
            this.toasterService.pop('warning', '', msg);
            return;
          }
        }
        obj.newPath = obj.newPath + (obj.newPath === '/' ? '' : '/') + this.copyObj.name;
        this.coreService.post('inventory/rename', obj).subscribe((res) => {
          let obj: any = this.coreService.clone(this.copyObj);
          this.updateFolders(this.copyObj.path, false, () => {
            this.updateTree(false);
            obj.path = res.path.substring(0, res.path.lastIndexOf('/')) || '/';
            obj.name = res.path.substring(res.path.lastIndexOf('/') + 1);
            this.type = obj.type;
            this.selectedData = obj;
            this.setSelectedObj(this.selectedData.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
          });
          this.copyObj = undefined;
        });
      }
    }
  }

  removeObject(node): void {
    const object = node.origin;
    let path;
    if (object.type) {
      path = object.path + (object.path === '/' ? '' : '/') + object.name;
    } else {
      path = object.path;
    }
    const obj = this.getObjectArr(object, false);
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: object.type,
        operation: 'Remove',
        name: object.name
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (!object.type && !object.object && !object.controller && !object.dailyPlan) {
            this.deleteObject(path, object, node, {
              auditLog: {
                comment: result.comment,
                timeSpent: result.timeSpent,
                ticketLink: result.ticketLink
              }
            });
          } else {
            obj.auditLog = {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            };
            this.coreService.post('inventory/remove', obj).subscribe(() => {
              if (this.selectedData.id === object.id) {
                this.clearSelection();
              }
            });
          }
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'remove',
          message: 'removeObject',
          type: 'Reset',
          objectName: path,
          countMessage: (obj.objects || object.type) ? 'removeAllObject' : undefined,
          count: (obj.objects || object.type) ? obj.objects.length : undefined
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (!object.type && !object.object && !object.controller && !object.dailyPlan) {
            this.deleteObject(path, object, node, undefined);
          } else {
            this.coreService.post('inventory/remove', obj).subscribe(() => {
              if (this.selectedData.id === object.id) {
                this.clearSelection();
              }
            });
          }
        }
      });
    }
  }

  deleteDraft(node): void {
    const object = node.origin;
    let path;
    if (object.type) {
      path = object.path + (object.path === '/' ? '' : '/') + object.name;
    } else {
      path = object.path;
    }
    const obj = this.getObjectArr(object, true);
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: object.type || 'Folder',
        operation: 'Delete',
        name: object.name
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          };
          this.deleteApiCall(object, node, obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deleteDraftObject',
          type: 'Delete',
          objectName: path,
          countMessage: (obj.objects || object.type) ? 'deleteAllDraftObject' : undefined,
          count: (obj.objects || object.type) ? obj.objects.length : undefined
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteApiCall(object, node, obj);
        }
      });
    }
  }

  private deleteApiCall(object, node, obj): void {
    const URL = (object.type || object.object || object.controller || object.dailyPlan) ? 'inventory/delete_draft' : 'inventory/delete_draft/folder';
    this.coreService.post(URL, obj).subscribe(() => {
      if (object.id) {
        let isDraftOnly = true;
        let isDeployObj = true;
        if (object.type.match(/CALENDAR/) || object.type === InventoryObject.SCHEDULE || object.type === InventoryObject.INCLUDESCRIPT) {
          isDeployObj = false;
          if (object.hasReleases) {
            isDraftOnly = false;
          }
        } else if (object.hasDeployments) {
          isDraftOnly = false;
        }
        if (isDraftOnly) {
          if (node.parentNode && node.parentNode.origin && node.parentNode.origin.children) {
            for (let i = 0; i < node.parentNode.origin.children.length; i++) {
              if (node.parentNode.origin.children[i].name === object.name && node.parentNode.origin.children[i].path === object.path) {
                node.parentNode.origin.children.splice(i, 1);
                break;
              }
            }
          }
          this.clearCopyObject(object);
        } else {
          object.valid = true;
          if (isDeployObj) {
            object.deployed = true;
          } else {
            object.released = true;
          }
          if ((this.selectedData && this.selectedData.type === object.type && this.selectedData.name === object.name
            && this.selectedData.path === object.path)) {
            this.selectedData.reload = true;
          }
        }
        this.updateTree(false);
      } else {
        this.clearCopyObject(object);
      }
    });
  }

  deletePermanently(node: any): void {
    let object = node;
    if (node instanceof NzTreeNode) {
      object = node.origin;
    }
    const obj = this.getObjectArr(object, false);
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
        title: 'delete',
        message: 'deleteObject',
        type: 'Delete',
        objectName: object.type ? object.path + (object.path === '/' ? '' : '/') + object.name : object.path,
        countMessage: (obj.objects || object.type) ? 'deleteAllObject' : undefined,
        count: (obj.objects || object.type) ? obj.objects.length : undefined
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        const URL = (object.type || object.object || object.controller || object.dailyPlan) ? 'inventory/trash/delete' : 'inventory/trash/delete/folder';
        this.coreService.post(URL, obj).subscribe(() => {

        });
      }
    });
  }

  restoreObject(node: any): void {
    let object = node;
    if (node instanceof NzTreeNode) {
      object = node.origin;
    }
    this.modal.create({
      nzTitle: undefined,
      nzContent: CreateObjectModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        preferences: this.preferences,
        obj: object,
        restore: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  receiveMessage($event: any): void {
    this.pageView = $event;
  }

  hidePanel(): void {
    this.sideView.inventory.show = false;
    this.coreService.hidePanel();
  }

  showPanel(): void {
    this.sideView.inventory.show = true;
    this.coreService.showLeftPanel();
  }

  private initConf(isReload): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if(!this.permission.joc) {
      setTimeout(() => {
        this.initConf(isReload);
      }, 50);
      return;
    }
    this.securityLevel = sessionStorage.securityLevel;
    if (isReload) {
      this.sideView = this.coreService.getSideView();
      if (this.sideView.inventory && !this.sideView.inventory.show) {
        this.hidePanel();
      }
      this.inventoryConfig = this.coreService.getConfigurationTab().inventory;
      this.isTrash = this.inventoryConfig.isTrash;
      this.initTree(null, null);
      if (this.isTrash) {
        this.clearSelection();
        this.initTrashTree(null);
      }
    }
  }

  private getExpandPaths(): Array<any> {
    const arr = [];
    if (this.tree.length > 0) {
      function traverseTree(data) {
        if (data.children && data.children.length > 0) {
          const obj: any = {name: data.name, path: data.path};
          if (data.children[0].controller) {
            obj.child1 = data.children[0];
            obj.child2 = data.children[1];
            obj.expanded = data.expanded;
          }
          arr.push(obj);
          for (let i = 0; i < data.children.length; i++) {
            if (!data.children[i].controller && !data.children[i].dailyPlan) {
              traverseTree(data.children[i]);
            }
          }
        }
      }

      traverseTree(this.tree[0]);
    }
    return arr;
  }

  private expandFolder(node): void {
    const data = node.origin.children;
    if (!(data.length > 1 && data[0].controller)) {
      node.origin.loading = true;
    }
    this.updateObjects(node.origin, this.isTrash, (children) => {
      if (data.length > 1 && data[0].controller) {
        node.isExpanded = true;
        if (children.length > 0) {
          node.origin.children[0] = children[0];
          node.origin.children[1] = children[1];
        }
      } else {
        node.origin.children = children;
        if (data.length > 0) {
          node.origin.children = node.origin.children.concat(data);
        }
        node.origin.loading = false;
        node.origin.expanded = true;
      }
      this.updateTree(this.isTrash);
    }, false);
  }

  private backToListView(): void {
    const parent = this.treeCtrl.getTreeNodeByKey(this.selectedObj.path);
    if (parent && parent.origin.children) {
      const index = (this.selectedObj.type === 'CALENDAR' || this.selectedObj.type === InventoryObject.SCHEDULE || this.selectedObj.type === InventoryObject.INCLUDESCRIPT) ? 1 : 0;
      const child = parent.origin.children[index];
      for (let i = 0; i < child.children.length; i++) {
        if (child.children[i].object === this.selectedObj.type) {
          this.selectedData = child.children[i];
          this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
          break;
        }
      }
    }
  }

  private releaseSingleObject(data): void {
    const obj: any = {};
    if (data.deleted) {
      obj.delete = [{id: data.id}];
    } else {
      obj.update = [{id: data.id}];
    }
    this.coreService.post('inventory/release', obj).subscribe(() => {
    });
  }

  private storeData(obj, result, reload): void {
    if (!obj.id){
      return;
    }
    this.coreService.post('inventory/store', {
      configuration: result,
      valid: true,
      id: obj.id,
      objectType: obj.objectType || obj.type
    }).subscribe((res: any) => {
      obj.valid = res.valid;
      if (obj.id === this.selectedObj.id) {
        this.type = undefined;
        this.selectedData.valid = res.valid;
        this.selectedData.deployed = res.deployed;
        this.selectedData.released = res.released;
        if (reload) {
          this.selectedData.reload = true;
        }
        setTimeout(() => {
          this.type = obj.objectType || obj.type;
        }, 5);
      }
      this.updateFolders(obj.path, false, () => {
        this.updateTree(false);
      });
    });
  }

  private _copy(node, isShallowCopy): void {
    this.copyObj = node.copy || node.origin;
    this.copyObj.operation = 'COPY';
    this.copyObj.shallowCopy = isShallowCopy;
    this.coreService.showCopyMessage(this.message);
  }

  private checkNewCopyObject(node, res): void {
    let object = node;
    if (this.copyObj) {
      if (node instanceof NzTreeNode) {
        object = node.origin;
        if (!object.controller && !object.dailyPlan && !object.object) {
          let data = object.children;
          if (!data[0] || !data[0].controller || data.length === 0) {
            this.updateObjects(node.origin, false, (children) => {
              if (children.length > 0) {
                if (res.objectType !== 'FOLDER' && this.copyObj.type) {
                  if ((this.copyObj.type === 'CALENDAR' || this.copyObj.type === InventoryObject.SCHEDULE || this.copyObj.type === InventoryObject.INCLUDESCRIPT)) {
                    children[1].expanded = true;
                  } else {
                    children[0].expanded = true;
                  }
                }
                node.origin.children = children;
                if (data.length > 0) {
                  node.origin.children = node.origin.children.concat(data);
                }
                node.origin.expanded = true;
                this.updateTree(false);
                this.checkNewCopyObject(node, res);
              }
            }, true);
            return;
          }
          if (this.copyObj.type) {
            if (this.copyObj.type === 'CALENDAR' || this.copyObj.type === InventoryObject.SCHEDULE || this.copyObj.type === InventoryObject.INCLUDESCRIPT) {
              data = object.children[1];
            } else {
              data = object.children[0];
            }
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
      let obj: any = {
        type: this.copyObj.type,
        objectType: this.copyObj.type,
        id: res.id,
        path: res.path.substring(0, res.path.lastIndexOf('/')) || '/',
        name: res.path.substring(res.path.lastIndexOf('/') + 1),
        valid: this.copyObj.valid
      };
      object.expanded = true;
      this.type = obj.type;
      this.selectedData = obj;
      this.setSelectedObj(this.selectedData.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
    }
  }

  private openObjectNameModal(obj: any, cb: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateObjectModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        preferences: this.preferences,
        obj,
        copy: this.copyObj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(data => {
      if (data) {
        cb(data);
      }
    });
  }

  reloadTree(isTrash): void {
    const obj: any = {
      types: ['INVENTORY']
    };
    if (isTrash) {
      obj.forInventoryTrash = true;
    } else {
      obj.forInventory = true;
    }
    this.coreService.post('tree', obj).subscribe((res: any) => {
      const tree = this.coreService.prepareTree(res, false);
      if (isTrash) {
        this.trashTree = this.recursiveTreeUpdate(tree, this.trashTree, true);
      } else {
        this.tree = this.recursiveTreeUpdate(tree, this.tree, false);
      }
    });
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          if (args.eventSnapshots[j].eventType.match(/Inventory/)) {
            const isTrash = args.eventSnapshots[j].eventType.match(/Trash/);
            if (!this.isTrash && isTrash) {
            } else {
              if (args.eventSnapshots[j].eventType.match(/InventoryTreeUpdated/) || args.eventSnapshots[j].eventType.match(/InventoryTrashTreeUpdated/)) {
                this.reloadTree(isTrash);
              } else if (args.eventSnapshots[j].eventType.match(/InventoryUpdated/) || args.eventSnapshots[j].eventType.match(/InventoryTrashUpdated/)) {
                this.updateFolders(args.eventSnapshots[j].path, isTrash, () => {
                  this.updateTree(isTrash);
                });
              }
            }
          }
        }
      }
    }
  }

  private pushObjectInHistory(): void {
    let flag = true;
    if (this.objectHistory.length > 0) {
      const x = this.objectHistory[this.objectHistory.length - 1];
      if (isEqual(JSON.stringify(this.selectedObj), JSON.stringify(x))) {
        flag = false;
      }
    }
    if (flag && this.selectedObj.type) {
      if (this.objectHistory.length === 20) {
        this.objectHistory.shift();
      }
      this.objectHistory.push(this.coreService.clone(this.selectedObj));
      ++this.indexOfNextAdd;
    }
  }

  private setSelectedObj(type, name, path, id): void {
    if (this.selectedObj.id) {
      this.pushObjectInHistory();
    }
    this.selectedObj = {type, name, path, id};
  }

  private mergeFolderData(sour, dest, path): void {
    for (let i = 0; i < dest.children.length; i++) {
      for (let j = 0; j < sour.length; j++) {
        if (dest.children[i].name === sour[j].name) {
          dest.children[i].deleted = sour[j].deleted;
          dest.children[i].title1 = sour[j].title;
          dest.children[i].deployed = sour[j].deployed;
          dest.children[i].released = sour[j].released;
          dest.children[i].hasReleases = sour[j].hasReleases;
          dest.children[i].hasDeployments = sour[j].hasDeployments;
          dest.children[i].valid = sour[j].valid;
          dest.children[i] = extend(dest.children[i], sour[j]);
          dest.children[i].match = true;
          sour.splice(j, 1);
          break;
        }
      }
    }
    dest.children = dest.children.filter(child => {
      if (child.match) {
        child.path = path;
        delete child.match;
        return true;
      } else if (this.type) {
        if (this.selectedObj.type === child.type && child.name === this.selectedObj.name) {
          this.clearSelection();
        }
      }
      return false;
    });
    if (sour.length > 0) {
      for (let j = 0; j < sour.length; j++) {
        sour[j].path = path;
        sour[j].type = dest.object;
        dest.children.push({
          name: sour[j].name,
          title: sour[j].title || sour[j].name,
          id: sour[j].id,
          path,
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
    dest.children = sortBy(dest.children, 'name');
  }

  private createObject(type, list, path): void {
    if (!path) {
      return;
    }
    const obj: any = {
      type,
      path
    };
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateObjectModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        preferences: this.preferences,
        obj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res: any) => {
      if (res) {
        let configuration = {};
        obj.name = res.name;
        if (type === InventoryObject.SCHEDULE) {
          configuration = {controllerId: this.schedulerIds.selected};
        } else if (type === 'LOCK') {
          configuration = {limit: 1, id: res.name};
        } else if (type === InventoryObject.WORKINGDAYSCALENDAR || type === InventoryObject.NONWORKINGDAYSCALENDAR) {
          configuration = {type};
        }
        this.storeObject(obj, list, configuration);
      }
    });
  }

  private storeObject(obj, list, configuration): void {
    if (obj.type === InventoryObject.WORKFLOW && !configuration.timeZone) {
      configuration.timeZone = this.preferences.zone;
    }
    const valid = !(obj.type.match(/CALENDAR/) || obj.type === InventoryObject.SCHEDULE || obj.type === InventoryObject.INCLUDESCRIPT || obj.type === InventoryObject.NOTICEBOARD
      || obj.type === InventoryObject.WORKFLOW || obj.type === InventoryObject.FILEORDERSOURCE || obj.type === InventoryObject.JOBRESOURCE);
    const PATH = obj.path + (obj.path === '/' ? '' : '/') + obj.name;
    if (PATH && obj.type && obj.name) {
      this.coreService.post('inventory/store', {
        objectType: obj.type,
        path: PATH,
        valid: obj.valid ? obj.valid : valid,
        configuration
      }).subscribe((res: any) => {
        if ((obj.type === InventoryObject.WORKINGDAYSCALENDAR || obj.type === InventoryObject.NONWORKINGDAYSCALENDAR)) {
          obj.objectType = obj.type;
          obj.type = 'CALENDAR';
        }
        obj.id = res.id;
        obj.valid = obj.valid ? obj.valid : valid;
        list.push(obj);
        this.type = obj.type;
        this.selectedData = obj;
        this.setSelectedObj(this.selectedData.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
        this.updateTree(false);
      });
    }
  }

  private deleteObject(path, object, node, auditLog): void {
    this.coreService.post('inventory/remove/folder', {path, auditLog}).subscribe(() => {
      object.deleted = true;
      if (node && node.parentNode && node.parentNode.origin) {
        node.parentNode.origin.children = node.parentNode.origin.children.filter((child) => {
          return child.path !== path;
        });
      }
      if (this.selectedObj && path === this.selectedObj.path) {
        this.clearSelection();
      }
      this.updateTree(false);
    });
  }

  private getObjectArr(object, isDraft): any {
    let obj: any = {objects: []};
    if (!object.type) {
      if (object.object || object.controller || object.dailyPlan) {
        object.children.forEach((item) => {
          if (item.children) {
            item.children.forEach((data) => {
              if (!isDraft || (!data.deployed && !data.released)) {
                obj.objects.push({id: data.id});
              }
            });
          } else if (!isDraft || (!item.deployed && !item.released)) {
            obj.objects.push({id: item.id});
          }
        });
      } else {
        obj = {path: object.path};
      }
    } else {
      obj.objects.push({id: object.id});
    }
    return obj;
  }

  private updateTree(isTrash): void {
    if (isTrash) {
      this.trashTree = [...this.trashTree];
    } else {
      this.tree = [...this.tree];
      if (this.selectedData && this.type) {
        if (this.selectedData.children) {
          this.selectedData.children = [...this.selectedData.children];
        }
        this.dataService.reloadTree.next({reloadTree: this.selectedData});
      }
    }
  }

  private clearCopyObject(obj): void {
    if ((this.selectedData && this.selectedData.type === obj.type && this.selectedData.name === obj.name
      && this.selectedData.path === obj.path)) {
      this.clearSelection();
    }
    if (this.copyObj && this.copyObj.type === obj.type && this.copyObj.name === obj.name && this.copyObj.path === obj.path) {
      this.copyObj = undefined;
    }
  }

  private clearSelection(): void {
    this.type = undefined;
    this.selectedData = {};
    this.selectedObj = {};
  }

  /* ------------- Object based operations Begin---------- */

  undo(): void {
    this.dataService.announceFunction('UNDO');
  }

  redo(): void {
    this.dataService.announceFunction('REDO');
  }

  download(): void {
    if (this.selectedObj && this.selectedObj.id) {
      this.exportJSON(this.selectedObj);
    }
  }

  upload(): void {
    if (this.selectedObj && this.selectedObj.id) {
      this.importJSON(this.selectedObj);
    }
  }

  /* ------------- Object based operations End---------- */

  search(): void {
    this.isSearchVisible = true;
  }

  closeSearch(): void {
    this.isSearchVisible = false;
  }

  onNavigate(data): void {
   // this.isSearchVisible = false;
    this.pushObjectInHistory();
    this.selectedObj.type = data.objectType;
    this.selectedObj.name = data.name;
    this.selectedObj.id = data.id;
    this.findObjectByPath(data.path);
  }
}
