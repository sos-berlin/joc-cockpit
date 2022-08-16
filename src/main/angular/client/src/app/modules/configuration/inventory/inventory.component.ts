import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {forkJoin, of, Subscription} from 'rxjs';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {FileUploader} from 'ng2-file-upload';
import {ToastrService} from 'ngx-toastr';
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {TranslateService} from '@ngx-translate/core';
import {clone, extend, isArray, isEmpty, isEqual, sortBy} from 'underscore';
import {ClipboardService} from 'ngx-clipboard';
import {saveAs} from 'file-saver';
import {catchError} from 'rxjs/operators';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd/tree';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ActivatedRoute} from "@angular/router";
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {InventoryService} from './inventory.service';
import {AuthService} from '../../../components/guard';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {InventoryObject} from '../../../models/enums';

declare const $: any;

@Component({
  selector: 'app-new-draft-modal',
  templateUrl: './new-draft-dialog.html'
})
export class NewDraftComponent implements OnInit {
  @Input() data;
  deployablesObject = [];
  loading = true;
  submitted = false;
  display = false;
  required = false;
  comments: any = {radio: 'predefined'};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.init();
  }

  init(): void {
    const obj: any = {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.data.objectType
    };
    if (this.data.hasDeployments) {
      this.getSingleObject(obj);
    } else {
      this.loading = false;
    }
  }

  private getSingleObject(obj): void {
    this.coreService.post('inventory/deployable', obj).subscribe({
      next: (res: any) => {
        const result = res.deployable;
        result.deployId = 'new';
        if (!result.deployablesVersions) {
          result.deployablesVersions = [];
        }
        this.loading = false;
        this.deployablesObject = [result];
      }, error: () => this.loading = false
    });
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.data.objectType,
    }
    if (this.deployablesObject && this.deployablesObject.length > 0 && this.deployablesObject[0].deployId && this.deployablesObject[0].deployId != 'new') {
      for (let j = 0; j < this.deployablesObject[0].deployablesVersions.length; j++) {
        if (this.deployablesObject[0].deployablesVersions[j].deploymentId === this.deployablesObject[0].deployId) {
          obj.commitId = this.deployablesObject[0].deployablesVersions[j].commitId;
          break;
        }
      }
      this.coreService.post('inventory/read/configuration', obj).subscribe({
        next: (res) => {
          obj.configuration = res.configuration;
          delete obj.commitId;
          this.store(obj);
        }, error: () => {
          this.submitted = false;
        }
      });
    } else {
      obj.configuration = {};
      this.store(obj);
    }
  }

  private store(obj): void {
    this.coreService.post('inventory/store', obj).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => {
        this.submitted = false;
      }
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-single-deploy-modal',
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
  required = false;
  comments: any = {radio: 'predefined'};
  object: any = {
    store: {draftConfigurations: [], deployConfigurations: []},
    delete: {deployConfigurations: []}
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    this.init();
  }

  init(): void {
    const obj: any = {
      onlyValidObjects: true,
      withVersions: true,
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.data.objectType || this.data.type
    };
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
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);

    if ((isEmpty(obj.store) && isEmpty(obj.delete)) && !this.isRevoke) {
      this.submitted = false;
      return;
    }
    this.coreService.post(this.isRevoke ? 'inventory/deployment/revoke' : 'inventory/deployment/deploy', obj).subscribe({
      next: () => {
        this.activeModal.close('ok');
      }, error: () => this.submitted = false
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private getSingleObject(obj): void {
    this.coreService.post('inventory/deployable', obj).subscribe({
      next: (res: any) => {
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
        this.loading = false;
        this.deployablesObject = [result];
      }, error: () => this.loading = false
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
  @Input() operation: string;
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
    releasables: [],
    store: {draftConfigurations: [], deployConfigurations: []},
    deleteObj: {deployConfigurations: []}
  };
  filter = {
    draft: true,
    deploy: true
  };
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  isDeleted = false;

  constructor(public activeModal: NzModalRef, public coreService: CoreService, private ref: ChangeDetectorRef,
              private inventoryService: InventoryService, private toasterService: ToastrService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
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
      this.nodes = [...this.nodes];
      this.ref.detectChanges();
    }, true);
  }

  private expandCollapseRec(node): void {
    for (const i in node) {
      if (!node[i].isLeaf) {
        node[i].expanded = false;
      }
      if (node[i].children && node[i].children.length > 0) {
        this.expandCollapseRec(node[i].children);
      }
    }
  }

  collapseAll(): void {
    this.expandCollapseRec(this.nodes);
    this.nodes = [...this.nodes];
    this.ref.detectChanges();
  }

  filterList(): void {
    this.nodes = [];
    this.loading = true;
    this.buildTree(this.path);
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

  buildTree(path, merge = null, cb = null, flag = false): void {
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
          obj.withoutReleased = this.operation !== 'recall';
          obj.withRemovedObjects = this.operation !== 'recall';
          obj.recursive = !(this.data.dailyPlan || this.data.object);
        } else {
          obj.withVersions = true;
        }
      } else if (this.isRemove) {
        obj.withRemovedObjects = false;
        obj.withoutDrafts = true;
        obj.latest = true;
      }
    }
    if (this.isChecked && !this.releasable) {
      obj.controllerId = this.schedulerIds.selected;
    }
    if (!this.isRemove && !this.isDeleted && !this.releasable) {
      obj.withoutDrafts = !this.filter.draft;
      obj.withoutDeployed = !this.filter.deploy;
    }
    const URL = this.releasable ? 'inventory/releasables' : 'inventory/deployables';
    this.coreService.post(URL, obj).subscribe({
      next: (res: any) => {
        let tree = [];
        if (res.folders && res.folders.length > 0 ||
          ((res.deployables && res.deployables.length > 0) || (res.releasables && res.releasables.length > 0))) {
          tree = this.coreService.prepareTree({
            folders: [{
              name: res.name,
              path: res.path,
              folders: (this.data.dailyPlan || this.data.object || this.data.controller) ? [] : res.folders,
              deployables: res.deployables,
              releasables: res.releasables
            }]
          }, false);
          this.inventoryService.updateTree(tree[0]);
        }
        if (tree.length > 0) {
          if(tree[0].children.length === 0 && !tree[0].deployables && !tree[0].releasables){
            tree = [];
          }
        }
        if (merge) {
          if (tree.length > 0) {
            merge.children = tree[0].children;
            this.inventoryService.checkAndUpdateVersionList(tree[0]);
          }
          delete merge.loading;
          if (!flag) {
            this.nodes = [...this.nodes];
            this.ref.detectChanges();
          }
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
      }, error: () => {
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
      }
    });
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    const node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      if (!node.origin.type && !node.origin.object && !this.releasable) {
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
                  if (self.filter.deploy) {
                    self.object.store.deployConfigurations.push(objDep);
                  }
                  if (self.filter.draft) {
                    self.object.store.draftConfigurations.push(objDep);
                  }
                }
              } else {
                if (objDep.configuration.commitId) {
                  if (self.filter.deploy) {
                    self.object.store.deployConfigurations.push(objDep);
                  }
                } else if (self.filter.draft) {
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
    this.object.update = [];
    this.object.delete = [];
    this.object.releasables = [];
    const self = this;
    function recursive(nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if ((!nodes[i].object) && nodes[i].checked) {
          if (nodes[i].type) {
            const obj: any = {
              path: nodes[i].path + (nodes[i].path === '/' ? '' : '/') + nodes[i].name,
              objectType: nodes[i].type
            };
            if (nodes[i].deleted) {
              self.object.delete.push(obj);
            } else {
              self.object.update.push(obj);
            }
            self.object.releasables.push({
              name: nodes[i].name,
              objectType: nodes[i].type
            });
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
      if (this.operation !== 'recall') {
        if (this.object.delete.length > 0) {
          obj.delete = this.object.delete;
        }
        if (this.object.update.length > 0) {
          obj.update = this.object.update;
        }
      } else {
        if (this.object.releasables.length > 0) {
          obj.releasables = this.object.releasables;
        } else{
          this.ref.detectChanges();
          return;
        }
      }
    }

    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    if (!this.releasable && isEmpty(obj.store) && isEmpty(obj.delete) && !this.isRevoke) {
      this.submitted = false;
      this.ref.detectChanges();
      return;
    } else {
      if (this.releasable && this.operation !== 'recall') {
        if (isEmpty(obj) || (isEmpty(obj.update) && isEmpty(obj.delete))) {
          this.submitted = false;
          let msg = '';
          this.translate.get('inventory.message.noObjectFoundToRelease').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.info(msg);
          this.ref.detectChanges();
          return;
        }
      }
    }

    const URL = this.releasable ? this.operation === 'recall' ? 'inventory/releasables/recall' : 'inventory/release' : this.isRevoke ? 'inventory/deployment/revoke' : 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        this.activeModal.close('ok');
      }, error: () => {
        this.submitted = false;
        this.ref.detectChanges();
      }
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
      this.coreService.post(URL, obj).subscribe({
        next: () => {
          this.activeModal.close('ok');
        }, error: () => {
          this.submitted = false;
          this.ref.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}

@Component({
  selector: 'app-cron-import-modal-content',
  templateUrl: './cron-import-dialog.html'
})
export class CronImportModalComponent implements OnInit {
  @Input() preferences: any;
  @Input() display: any;
  @Input() controllerId;
  @Input() agents: any = [];
  nodes: any = [];
  calendarTree: any = [];
  uploader: FileUploader;
  comments: any = {};
  required = false;
  hasBaseDropZoneOver: any;
  requestObj: any = {
    systemCrontab: false,
    folder: '/'
  };

  constructor(public activeModal: NzModalRef, private toasterService: ToastrService, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }

    this.getTree();
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
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      if (this.requestObj.folder && this.requestObj.folder.substring(0, 1) !== '/') {
        this.requestObj.folder = '/' + this.requestObj.folder;
      }
      obj.folder = this.requestObj.folder || '/';
      obj.systemCrontab = this.requestObj.systemCrontab;
      obj.agentName = this.requestObj.agentName;
      obj.calendarName = this.requestObj.calendarName;
      if (this.requestObj.agentName1) {
        obj.subagentClusterId = this.requestObj.agentName;
        obj.agentName = this.requestObj.agentName1;
      }
      item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
    };

    this.uploader.onCompleteItem = (fileItem: any, response, status) => {
      if (status === 200) {
        this.activeModal.close(this.requestObj.folder || '/');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
      }
    };
  }

  selectSubagentCluster(cluster): void {
    if (cluster) {
      this.requestObj.agentName1 = cluster.title;
    } else {
      delete this.requestObj.agentName1;
    }
  }

  private getTree(): void {
    this.coreService.post('tree', {
      forInventory: true,
      types: ['INVENTORY']
    }).subscribe({
      next: (res: any) => {
        if (res.folders.length === 0) {
          res.folders.push({name: '', path: '/'});
        }
        this.nodes = this.coreService.prepareTree(res, true);
      }
    });
  }

  private getCalendars(): void {
    this.coreService.post('tree', {
      forInventory: true,
      types: ['WORKINGDAYSCALENDAR']
    }).subscribe({
      next: (res: any) => {
        this.calendarTree = this.coreService.prepareTree(res, false);
      }
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
  required = false;
  comments: any = {radio: 'predefined'};
  inValid = false;
  exportType = 'BOTH';
  path: string;
  securityLevel: string;
  exportObj = {
    isRecursive: false,
    controllerId: '',
    forSigning: false,
    filename: '',
    fileFormat: 'ZIP',
    exportType: 'folders',
    objectTypes: []
  };
  filter = {
    controller: true,
    dailyPlan: true,
    draft: true,
    deploy: true,
    release: true,
    valid: false,
  };
  objectTypes = [];
  object: any = {
    draftConfigurations: [],
    releaseDraftConfigurations: [],
    deployConfigurations: [],
    releasedConfigurations: []
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.exportObj.controllerId = this.schedulerIds.selected;
    this.securityLevel = sessionStorage.securityLevel;
    if (this.origin) {
      if(this.origin.object){
        this.exportObj.exportType = '';
      }
      this.path = this.origin.path;
      if (this.origin.dailyPlan || (this.origin.object &&
        (this.origin.object === InventoryObject.SCHEDULE || this.origin.object === InventoryObject.INCLUDESCRIPT || this.origin.object.match('CALENDAR')))) {
        this.exportType = this.origin.object || 'DAILYPLAN';
        this.filter.controller = false;
        this.filter.deploy = false;
        if (this.origin.dailyPlan) {
          this.objectTypes.push(InventoryObject.INCLUDESCRIPT, InventoryObject.SCHEDULE, InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR, InventoryObject.JOBTEMPLATE);
        } else {
          this.objectTypes.push(this.origin.object.match('CALENDAR') ? (InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR) : this.origin.object);
        }
      } else {
        if (this.origin.controller || this.origin.object) {
          this.exportType = this.origin.object || 'CONTROLLER';
          this.filter.dailyPlan = false;
          this.filter.release = false;
          if (this.origin.controller) {
            this.objectTypes.push(InventoryObject.WORKFLOW, InventoryObject.FILEORDERSOURCE, InventoryObject.JOBRESOURCE,
              InventoryObject.NOTICEBOARD, InventoryObject.LOCK);
          } else {
            this.objectTypes.push(this.origin.object);
          }
        }
      }
    }
    if (this.objectTypes.length === 0) {
      this.objectTypes.push(InventoryObject.WORKFLOW, InventoryObject.FILEORDERSOURCE, InventoryObject.JOBRESOURCE,
        InventoryObject.NOTICEBOARD, InventoryObject.LOCK);
      this.objectTypes.push(InventoryObject.INCLUDESCRIPT, InventoryObject.SCHEDULE, InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR, InventoryObject.JOBTEMPLATE);
    }
    this.exportObj.objectTypes = [...this.objectTypes];
    this.buildTree(this.path);
  }

  checkFileName(): void {
    if (this.exportObj.filename) {
      const ext = this.exportObj.filename.split('.').pop();
      if (ext && this.exportObj.filename.indexOf('.') > -1) {
        if (this.exportObj.fileFormat === 'ZIP' && (ext === 'ZIP' || ext === 'zip')) {
          this.inValid = false;
        } else {
          this.inValid = !(this.exportObj.fileFormat === 'TAR_GZ' && (ext === 'tar' || ext === 'gz'));
        }
      } else {
        this.inValid = false;
        this.exportObj.filename = this.exportObj.filename + (this.exportObj.fileFormat === 'ZIP' ? '.zip' : '.tar.gz');
      }
    }
  }

  buildTree(path, merge = null, cb = null, flag = false): void {
    const obj: any = {
      folder: path || '/',
      onlyValidObjects: this.filter.valid,
      recursive: flag,
      withoutDrafts: !this.filter.draft,
      withoutDeployed: !this.filter.deploy,
      withoutRemovedObjects: true
    };

    let deployObjectTypes = [];
    let releaseObjectTypes = [];
    if (this.exportObj.objectTypes.length > 0) {
      this.exportObj.objectTypes.forEach((item) => {
        if (item === InventoryObject.WORKFLOW || item === InventoryObject.FILEORDERSOURCE || item === InventoryObject.JOBRESOURCE ||
          item === InventoryObject.NOTICEBOARD || item === InventoryObject.LOCK) {
          deployObjectTypes.push(item);
        } else {
          releaseObjectTypes.push(item);
        }
      })
    }

    if (this.exportObj.exportType !== 'folders') {
      deployObjectTypes.push(InventoryObject.WORKFLOW, InventoryObject.FILEORDERSOURCE, InventoryObject.JOBRESOURCE,
        InventoryObject.NOTICEBOARD, InventoryObject.LOCK);
      releaseObjectTypes.push(InventoryObject.INCLUDESCRIPT, InventoryObject.SCHEDULE, InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR, InventoryObject.JOBTEMPLATE);
    }

    const APIs = [];
    if (this.filter.controller && this.filter.dailyPlan) {
      obj.withoutReleased = !this.filter.release;
      if (deployObjectTypes.length > 0) {
        APIs.push(this.coreService.post('inventory/deployables', { ...obj, ...{ objectTypes: deployObjectTypes } }).pipe(
          catchError(error => of(error))
        ));
      }
      if (releaseObjectTypes.length > 0) {
        APIs.push(this.coreService.post('inventory/releasables', { ...obj, ...{ objectTypes: releaseObjectTypes } }).pipe(
          catchError(error => of(error))
        ));
      }
    } else {
      if (this.filter.dailyPlan) {
        obj.withoutReleased = !this.filter.release;
        if (releaseObjectTypes.length > 0) {
          obj.objectTypes = releaseObjectTypes;
          APIs.push(this.coreService.post('inventory/releasables', obj).pipe(
            catchError(error => of(error))
          ));
        }
      } else {
        obj.withVersions = !this.filter.deploy;
        if (deployObjectTypes.length > 0) {
          obj.objectTypes = deployObjectTypes;
          APIs.push(this.coreService.post('inventory/deployables', obj).pipe(
            catchError(error => of(error))
          ));
        }
      }
    }
    if (APIs.length === 0) {
      this.nodes = [];
      this.loading = false;
      return;
    }
    forkJoin(APIs).subscribe({
      next: (res: any) => {
        let mergeObj: any = {};
        if (res.length > 1) {
          if (res[0].path && res[1].path) {
            mergeObj = this.mergeDeep(res[0], res[1]);
          } else if (res[0].path && !res[1].path) {
            mergeObj = res[0];
          } else if (!res[0].path && res[1].path) {
            mergeObj = res[1];
          }
        } else {
          if (res[0].path) {
            mergeObj = res[0];
          }
        }
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
          if (!flag) {
            this.nodes = [...this.nodes];
          }
        } else {
          this.nodes = tree;
          if (!cb) {
            setTimeout(() => {
              this.loading = false;
              if (this.nodes.length > 0) {
                this.nodes[0].expanded = true;
                this.inventoryService.preselected(this.nodes[0]);
                this.disabledCheckbox(this.nodes[0]);
                this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
              }
              this.nodes = [...this.nodes];
            }, 0);
          } else {
            cb();
          }
        }
      }
    })
  }

  private disabledCheckbox(node: any): void {
    if (this.exportObj.exportType === 'folders') {
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].type) {
          node.children[i].disableCheckbox = true;
        }
        if (!node.children[i].type && !node.children[i].object) {
          break;
        }
      }
    }
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
      const expandedList = this.treeCtrl.getExpandedNodeList();
      this.buildTree(this.path, null, () => {
        this.loading = false;
        if (this.nodes.length > 0) {
          this.nodes[0].expanded = true;
          this.inventoryService.checkAndUpdateVersionList(this.nodes[0]);
        }
        this.nodes = [...this.nodes];
      });
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
      this.nodes = [...this.nodes];
    }, true);
  }

  private expandCollapseRec(node): void {
    for (let i = 0; i < node.length; i++) {
      if (!node[i].isLeaf) {
        node[i].expanded = false;
      }
      if (node[i].children && node[i].children.length > 0) {
        this.expandCollapseRec(node[i].children);
      }
    }
  }

  collapseAll(): void {
    this.expandCollapseRec(this.nodes);
    this.nodes = [...this.nodes];
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
            node.children[i].isDisableCheckbox = (node.children[i].isChecked && this.exportObj.exportType === 'folders');
          }
          if (!node.children[i].origin.object && !node.children[i].origin.type) {
            break;
          }
        }
      }
    }
  }

  getJSObject(): void {
    const self = this;
    this.object = {
      draftConfigurations: [],
      releaseDraftConfigurations: [],
      deployConfigurations: [],
      releasedConfigurations: [],
      folders: []
    };
    let selectFolder = true;
    if (this.exportType && this.exportType !== 'CONTROLLER' && this.exportType !== 'DAILYPLAN' && this.exportType !== 'BOTH') {
      selectFolder = false;
    } else if(this.exportObj.exportType !== 'folders'){
      selectFolder = false;
    }

    function recursive(nodes): void {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].object && nodes[i].checked) {
          const objDep: any = {};
          if (!nodes[i].type) {
            if (selectFolder) {
              self.object.folders.push(nodes[i].path);
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
              if (!nodes[i].children[j].object && !nodes[i].children[j].type) {
                if(nodes[i].children[j].checked && selectFolder) {
                  self.object.folders.push(nodes[i].children[j].path);
                }
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
    const obj: any = {
      exportFile: {filename: this.exportObj.filename, format: this.exportObj.fileFormat}
    };
    if (this.comments.comment) {
      obj.auditLog = {};
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    }
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
      if (this.exportObj.filename) {
        if (this.exportObj.filename.indexOf('.') === -1) {
          this.exportObj.filename = this.exportObj.filename + (this.exportObj.fileFormat === 'ZIP' ? '.zip' : '.tar.gz');
        }
      }
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

      if (this.object.folders && this.object.folders.length > 0) {
        this.exportFolder(obj);
      } else {
        this.coreService.download('inventory/export', obj, this.exportObj.filename, (res) => {
          if (res) {
            this.activeModal.close('ok');
          } else {
            this.submitted = false;
          }
        });
      }
    } else {
      if (this.object.folders && this.object.folders.length > 0) {
        this.exportFolder(obj);
      } else {
        this.submitted = false;
      }
    }
  }

  private exportFolder(obj): void {
    if (this.exportObj.forSigning) {
      obj.forSigning = {
        controllerId: this.exportObj.controllerId,
        objectTypes: this.exportObj.objectTypes,
        folders: Array.from(new Set(this.object.folders)),
        recursive: this.exportObj.isRecursive,
        withoutDrafts: !this.filter.draft,
        withoutDeployed: !this.filter.deploy
      };
    } else {
      obj.shallowCopy = {
        objectTypes: this.exportObj.objectTypes,
        folders: Array.from(new Set(this.object.folders)),
        recursive: this.exportObj.isRecursive,
        onlyValidObjects: this.filter.valid,
        withoutDrafts: !this.filter.draft,
        withoutDeployed: !this.filter.deploy,
        withoutReleased: !this.filter.release
      };
    }

    this.coreService.download('inventory/export/folder', obj, this.exportObj.filename, (res) => {
      if (res) {
        this.activeModal.close('ok');
      } else {
        this.submitted = false;
      }
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}

@Component({
  selector: 'app-repository-modal',
  templateUrl: './repository-dialog.html'
})
export class RepositoryComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() controllerId;
  @Input() preferences;
  @Input() origin: any;
  @Input() operation: string;
  @Input() category: string;
  @Input() display: boolean;
  loading = true;
  path: string;
  type = 'ALL';
  nodes: any = [];
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  exportObj = {
    isRecursive: false
  };
  filter = {
    envRelated: true,
    envIndependent: false,
    draft: true,
    deploy: true,
    release: true,
    valid: false,
  };
  object: any = {
    draftConfigurations: [],
    releaseDraftConfigurations: [],
    deployConfigurations: [],
    releasedConfigurations: []
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.filter.envIndependent = this.category !== 'LOCAL';
    if (this.origin) {
      this.path = this.origin.path;
      if (this.origin.object) {
        if (this.origin.object === InventoryObject.SCHEDULE || this.origin.object === InventoryObject.INCLUDESCRIPT || this.origin.object.match('CALENDAR')) {
          this.type = this.origin.object;
          this.filter.envIndependent = false;
          this.filter.deploy = false;
        } else {
          this.type = this.origin.object;
          this.filter.envRelated = false;
          this.filter.release = false;
        }
      }
    }
    if (this.operation === 'store') {
      this.buildTree(this.path);
    } else {
      this.readFileSystem(this.path);
    }
  }

  private buildTree(path, merge = null, cb = null, flag = false): void {
    const obj: any = {
      folder: path || '/',
      onlyValidObjects: this.filter.valid,
      recursive: flag,
      withoutDrafts: !this.filter.draft,
      withoutDeployed: !this.filter.deploy,
      withoutRemovedObjects: true
    };
    const APIs = [];
    if (this.filter.envRelated) {
      if (this.type !== 'ALL') {
        obj.objectTypes = this.type === 'CALENDAR' ? [InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR] : [this.type];
      } else {
        const obj2 = clone(obj);
        if (!this.filter.envIndependent && this.type === 'ALL') {
          obj2.objectTypes = [InventoryObject.JOBRESOURCE];
        } else {
          obj2.objectTypes = [InventoryObject.WORKFLOW, InventoryObject.FILEORDERSOURCE, InventoryObject.LOCK, InventoryObject.NOTICEBOARD];
        }
        if (obj2.objectTypes.length > 0) {
          APIs.push(this.coreService.post('inventory/deployables', obj2).pipe(
            catchError(error => of(error))
          ));
        }
      }
      if (this.category !== 'LOCAL') {
        obj.objectTypes = [InventoryObject.INCLUDESCRIPT];
      } else {
        obj.objectTypes = [InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR, InventoryObject.SCHEDULE, InventoryObject.JOBTEMPLATE];
      }
      obj.withoutReleased = !this.filter.release;
      if (obj.objectTypes.length === 0) {
        APIs.push(this.coreService.post('inventory/releasables', obj).pipe(
          catchError(error => of(error))
        ));
      }
    } else if (this.filter.envIndependent) {
      obj.withVersions = !this.filter.deploy;
      if (this.type !== 'ALL') {
        obj.objectTypes = [this.type];
      } else {
        obj.objectTypes = [InventoryObject.WORKFLOW, InventoryObject.FILEORDERSOURCE, InventoryObject.LOCK, InventoryObject.NOTICEBOARD];
      }
      if (obj.objectTypes.length === 0) {
        APIs.push(this.coreService.post('inventory/deployables', obj).pipe(
          catchError(error => of(error))
        ));
      }
    } else {
      this.loading = false;
      return;
    }
    if (APIs.length > 0) {
      forkJoin(APIs).subscribe({
        next: (res: any) => {
          let mergeObj: any = {};
          if (res.length > 1) {
            if (res[0].path && res[1].path) {
              mergeObj = this.mergeDeep(res[0], res[1]);
            } else if (res[0].path && !res[1].path) {
              mergeObj = res[0];
            } else if (!res[0].path && res[1].path) {
              mergeObj = res[1];
            }
          } else {
            if (res[0].path) {
              mergeObj = res[0];
            }
          }
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
            if (!flag) {
              this.nodes = [...this.nodes];
            }
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
        }
      })
    } else {
      this.nodes = [];
      this.loading = false;
    }
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

  private readFileSystem(path, merge = null, cb = null, flag = false): void {
    this.coreService.post('inventory/repository/read', {
      folder: path || '/',
      recursive: flag,
      category: this.category
    }).subscribe((res) => {
      let tree = [];
      if (res.folders && res.folders.length > 0 || res.items && res.items.length > 0) {
        if (this.type !== 'ALL') {
          if (res.folders && res.folders.length > 0) {
            res.folders.forEach((folder) => {
              if (folder.items && folder.items.length > 0) {
                folder.items = folder.items.filter((item) => {
                  return item.objectType === this.type;
                })
              }
            })
          }
          if (res.items && res.items.length > 0) {
            res.items = res.items.filter((item) => {
              return item.objectType === this.type;
            })
          }
        }
        tree = this.coreService.prepareTree({
          folders: [{
            name: res.name,
            path: res.path,
            folders: res.folders,
            items: res.items
          }]
        }, false);
        this.inventoryService.updateTree(tree[0]);
      }
      if (!merge && tree[0] && tree[0].children && tree[0].children.length === 0) {
        tree = [];
      }
      if (merge) {
        if (tree.length > 0) {
          merge.children = tree[0].children;
        }
        delete merge.loading;
        if (!flag) {
          this.nodes = [...this.nodes];
        }
      } else {
        this.nodes = tree;
        if (!cb) {
          this.loading = false;
          if (this.nodes.length > 0) {
            this.nodes[0].expanded = true;
            this.inventoryService.preselected(this.nodes[0]);
          }
          this.nodes = [...this.nodes];

        } else {
          cb();
        }
      }
    });
  }

  filterList(): void {
    this.nodes = [];
    if (!this.filter.envRelated && !this.filter.envIndependent) {
      return;
    } else {
      this.loading = true;
      this.buildTree(this.path);
    }
  }

  expandAll(): void {
    const self = this;

    function recursive(node): void {
      for (const i in node) {
        if (!node[i].isLeaf) {
          node[i].expanded = true;
        }
        if (node[i].children && node[i].children.length > 0) {
          if (!node[i].isCall && self.operation === 'store') {
            self.inventoryService.checkAndUpdateVersionList(node[i]);
          }
          recursive(node[i].children);
        }
      }
    }

    if (this.operation === 'store') {
      this.buildTree(this.path, null, () => {
        recursive(this.nodes);
        this.nodes = [...this.nodes];
      }, true);
    } else {
      this.readFileSystem(this.path, null, () => {
        recursive(this.nodes);
        this.nodes = [...this.nodes];
      }, true);
    }
  }

  private expandCollapseRec(node): void {
    for (let i = 0; i < node.length; i++) {
      if (!node[i].isLeaf) {
        node[i].expanded = false;
      }
      if (node[i].children && node[i].children.length > 0) {
        this.expandCollapseRec(node[i].children);
      }
    }
  }

  collapseAll(): void {
    this.expandCollapseRec(this.nodes);
    this.nodes = [...this.nodes];
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    const node = e.node;
    if (node && node.origin && node.origin.expanded && !node.origin.isCall) {
      if (!node.origin.type && !node.origin.object) {
        node.origin.loading = true;
        if (this.operation === 'store') {
          this.buildTree(node.origin.path, node.origin);
        } else {
          this.readFileSystem(node.origin.path, node.origin);
        }
      }
      if (this.operation === 'store') {
        this.inventoryService.checkAndUpdateVersionList(node.origin);
      }
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
          if (!node.children[i].origin.type && !node.children[i].origin.object) {
            break;
          }
        }
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.operation === 'store') {
      this.store();
    } else {
      this.updateOrDelete();
    }
  }

  private updateOrDelete(): void {
    const self = this;
    const obj: any = {
      configurations: []
    };

    function recursive(nodes): void {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].object && nodes[i].checked) {
          const objDep: any = {};
          if (!nodes[i].type) {
            if (self.type === 'ALL') {
              objDep.configuration = {
                path: nodes[i].path || nodes[i].name,
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
            obj.configurations.push(objDep);
          }
        }
        if (!nodes[i].type && !nodes[i].object && nodes[i].children) {
          if (!nodes[i].checked || self.type !== 'ALL') {
            recursive(nodes[i].children);
          } else if (!self.exportObj.isRecursive) {
            for (let j = 0; j < nodes[i].children.length; j++) {
              if (!nodes[i].children[j].object && !nodes[i].children[j].type && nodes[i].children[j].children) {
                recursive(nodes[i].children[j].children);
              }
            }
          }
        }
      }
    }

    if (this.nodes.length > 0) {
      recursive(this.nodes);
    } else if (this.operation === 'delete' && !this.origin.object) {
      obj.configurations.push({
        configuration: {
          path: this.path,
          objectType: 'FOLDER'
        }
      });
    }
    if (obj.configurations.length > 0) {
      if (this.comments.comment) {
        obj.auditLog = {};
        this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      }
      obj.category = this.category;
      this.coreService.post('inventory/repository/' + this.operation, obj).subscribe({
        next: (res) => {
          this.activeModal.close(res);
        }, error: () => this.submitted = false
      });
    } else {
      this.submitted = false;
    }
  }

  private store(): void {
    const self = this;
    this.object = {
      draftConfigurations: [],
      releaseDraftConfigurations: [],
      deployConfigurations: [],
      deploy2Configurations: [],
      releasedConfigurations: []
    };

    function recursive(nodes): void {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].object && nodes[i].checked) {
          const objDep: any = {};
          if (!nodes[i].type) {
            if (self.type === 'ALL') {
              objDep.configuration = {
                path: nodes[i].path || nodes[i].name,
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
                if (objDep.configuration.objectType === InventoryObject.JOBRESOURCE) {
                  if (objDep.configuration.commitId) {
                    self.object.deploy2Configurations.push(objDep);
                  } else {
                    self.object.releaseDraftConfigurations.push(objDep);
                  }
                } else {
                  if (objDep.configuration.commitId) {
                    self.object.deployConfigurations.push(objDep);
                  } else {
                    self.object.draftConfigurations.push(objDep);
                  }
                }
              } else {
                if (nodes[i].releaseId) {
                  self.object.releasedConfigurations.push(objDep);
                } else {
                  self.object.releaseDraftConfigurations.push(objDep);
                }
              }
            } else {
              if (self.filter.envIndependent) {
                if (self.filter.deploy) {
                  self.object.deployConfigurations.push(objDep);
                }
                if (self.filter.draft) {
                  self.object.draftConfigurations.push(objDep);
                }
                if (self.filter.release) {
                  self.object.releasedConfigurations.push(objDep);
                }
              }
              if (self.filter.envRelated) {
                if (self.filter.deploy) {
                  self.object.deploy2Configurations.push(objDep);
                }
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
          if (!nodes[i].checked || self.type !== 'ALL') {
            recursive(nodes[i].children);
          } else if (!self.exportObj.isRecursive) {
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
    if ((this.object.deployConfigurations && this.object.deployConfigurations.length > 0) ||
      (this.object.draftConfigurations.length && this.object.draftConfigurations.length > 0) ||
      (this.object.deploy2Configurations && this.object.deploy2Configurations.length > 0) ||
      (this.object.releasedConfigurations && this.object.releasedConfigurations.length > 0) ||
      (this.object.releaseDraftConfigurations.length && this.object.releaseDraftConfigurations.length > 0)) {
      if (this.object.deployConfigurations && this.object.deployConfigurations.length === 0) {
        delete this.object.deployConfigurations;
      }
      if (this.object.draftConfigurations && this.object.draftConfigurations.length === 0) {
        delete this.object.draftConfigurations;
      }
      if (this.object.deploy2Configurations && this.object.deploy2Configurations.length === 0) {
        delete this.object.deploy2Configurations;
      }
      if (this.object.releasedConfigurations && this.object.releasedConfigurations.length === 0) {
        delete this.object.releasedConfigurations;
      }
      if (this.object.releaseDraftConfigurations && this.object.releaseDraftConfigurations.length === 0) {
        delete this.object.releaseDraftConfigurations;
      }
      const obj: any = {
        controllerId: this.controllerId,
        withoutInvalid: this.filter.valid
      };

      if (this.object.releasedConfigurations || this.object.releaseDraftConfigurations || this.object.deploy2Configurations) {
        obj.local = {
          releasedConfigurations: this.object.releasedConfigurations,
          deployConfigurations: this.object.deploy2Configurations,
          draftConfigurations: this.object.releaseDraftConfigurations
        };
      }
      if (this.object.draftConfigurations || this.object.deployConfigurations || this.object.releasedConfigurations) {
        obj.rollout = {
          draftConfigurations: this.object.draftConfigurations,
          deployConfigurations: this.object.deployConfigurations,
          releasedConfigurations: this.object.releasedConfigurations
        };
      }

      if (this.comments.comment) {
        obj.auditLog = {};
        this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      }
      this.coreService.post('inventory/repository/store', obj).subscribe({
        next: () => {
          this.activeModal.close();
        }, error: () => this.submitted = false
      });
    } else {
      this.submitted = false;
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}

@Component({
  selector: 'app-git-modal',
  templateUrl: './git-dialog.html'
})
export class GitComponent implements OnInit {
  @Input() controllerId;
  @Input() preferences;
  @Input() data: any;
  @Input() operation: string;
  @Input() category: string;
  @Input() display: boolean;
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  object: any = {
    folder: '',
    category: ''
  };
  message = '';
  results = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private modal: NzModalService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.object.folder = this.data.path;
    this.object.category = this.category;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.comments.comment) {
      this.object.auditLog = {};
      this.coreService.getAuditLogObj(this.comments, this.object.auditLog);
    }
    if (this.operation == 'clone') {
      let folder = this.object.folder === '/' ? ('/' + this.object.folderName) : this.object.folder;
      this.coreService.post('inventory/repository/git/clone', {
        auditLog: this.object.auditLog,
        folder,
        remoteUri: this.object.remoteUri,
        category: this.object.category
      }).subscribe({
        next: (res) => {
          this.results.push(res);
          this.showResult();
          this.activeModal.close('Done');
        }, error: () => {
          this.submitted = false;
        }
      });
    } else {
      this.coreService.post('inventory/repository/git/add', this.object).subscribe({
        next: (res) => {
          this.results.push(res);
          this.commitAndPush();
        }, error: () => {
          this.submitted = false;
        }
      });
    }
  }

  private commitAndPush(): void {
    this.coreService.post('inventory/repository/git/commit', {
      ...this.object, message: this.message
    }).subscribe({
      next: (result) => {
        this.results.push(result);
        this.coreService.post('inventory/repository/git/push', this.object).subscribe({
          next: (result2) => {
            this.results.push(result2);
            this.showResult();
            this.activeModal.close('Done');
          }, error: () => {
            this.submitted = false;
            this.showResult();
          }
        });
      }, error: () => {
        this.submitted = false;
        this.showResult();
      }
    });
  }

  private showResult(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: NotificationComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        results: this.results,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      this.results = [];
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-notification-modal',
  templateUrl: './notification-dialog.html'
})
export class NotificationComponent {
  @Input() results: any;

  constructor(public activeModal: NzModalRef) {
  }

  cancel(): void {
    this.activeModal.destroy();
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
  required = false;
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
              public toasterService: ToastrService, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
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
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
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

    this.uploader.onCompleteItem = (fileItem: any, response, status) => {
      if (status === 200) {
        this.activeModal.close(this.requestObj.targetFolder || '/');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
      }
    };
  }

  private getTree(): void {
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
      this.toasterService.error(fileExt + ' ' + msg);
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
              private message: NzMessageService, private ref: ChangeDetectorRef) {
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
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe({
      next: (res: any) => {
        this.parseErrorMsg(res, (flag) => {
          cb(flag);
        });
      }, error: (err) => {
        cb(err);
      }
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

  constructor(public coreService: CoreService, public activeModal: NzModalRef, public translate: TranslateService, public toasterService: ToastrService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit(): void {
    this.uploader.onCompleteItem = (fileItem: any, response, status) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
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
      this.toasterService.error(fileExt + ' ' + msg);
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
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe({
      next: (res: any) => {
        cb(res);
      }, error: (err) => {
        cb(err);
      }
    });
  }

  private showErrorMsg(errorMsg): void {
    let msg = errorMsg;
    if (!errorMsg) {
      this.translate.get('inventory.message.invalidFile', {objectType: this.object.objectType}).subscribe(translatedValue => {
        msg = translatedValue;
      });
    }
    this.toasterService.error(msg);
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
  required = false;
  comments: any = {};
  object = {name: '', type: 'suffix', newName: '', onlyContains: false, originalName: '', suffix: '', prefix: ''};

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
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
      } else if (this.object.type !== 'existing') {
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
      }).subscribe({
        next: () => {
          this.activeModal.close({
            name: this.object.name,
            comments: this.comments
          });
        }, error: () => {
          this.submitted = false;
          this.ref.detectChanges();
        }
      });
    }
  }

  private paste(obj, data): void {
    const request: any = {
      shallowCopy: this.copy.shallowCopy,
      suffix: data.suffix,
      prefix: data.prefix
    };
    if (this.copy.objectType) {
      request.newPath = obj.path + (obj.path === '/' ? '' : '/') + (data.originalName ? data.originalName : this.copy.name);
      request.objectType = this.copy.objectType;
      request.path = this.copy.path + (this.copy.path === '/' ? '' : '/') + this.copy.name;
    } else {
      request.objectType = 'FOLDER';
      request.path = this.copy.path;
      request.newPath = (obj.path || '/') + (data.noFolder ? '' : (obj.path === '/' ? '' : '/') + this.copy.name);
    }

    request.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    this.coreService.post('inventory/copy', request).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => {
        this.submitted = false;
        this.ref.detectChanges();
      }
    });
  }

  private restoreFunc(obj, data): void {
    const request: any = {
      suffix: data.suffix,
      prefix: data.prefix
    };
    if (this.obj.objectType) {
      request.newPath = obj.path + (obj.path === '/' ? '' : '/') + (data.newName ? data.newName : obj.name);
      request.path = obj.path + (obj.path === '/' ? '' : '/') + obj.name;
      request.objectType = this.obj.objectType;
    } else {
      request.objectType = 'FOLDER';
      const tempPath = obj.path.substring(0, obj.path.lastIndexOf('/'));
      request.newPath = data.newName ? (tempPath + (tempPath === '/' ? '' : '/') + data.newName) : obj.path;
      request.path = obj.path;
    }

    request.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    this.coreService.post('inventory/trash/restore', request).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => {
        this.submitted = false;
        this.ref.detectChanges();
      }
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
  @Input() display: any;
  submitted = false;
  required = false;
  isUnique = true;
  isValid = true;
  folder = {error: false, name: '', deepRename: 'rename', search: '', replace: ''};
  comments: any = {};

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
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
      const obj: any = {
        objectType: 'FOLDER',
        path: PATH,
        configuration: {}
      };
      if (this.comments.comment) {
        obj.auditLog = {};
        this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      }
      this.coreService.post('inventory/store', obj).subscribe({
        next: (res) => {
          this.activeModal.close({
            name: this.folder.name,
            title: res.path,
            path: res.path,
            key: res.path,
            children: []
          });
        }, error: () => {
          this.submitted = false;
          this.ref.detectChanges();
        }
      });
    } else {
      if (!this.origin.controller && !this.origin.dailyPlan && !this.origin.object && this.origin.name === this.folder.name && this.folder.deepRename === 'rename') {
        this.activeModal.close('NO');
        return;
      }
      let obj: any = {
        newPath: this.folder.name
      };
      if (this.origin.objectType) {
        obj.objectType = this.origin.objectType;
        obj.path = this.origin.path + (this.origin.path === '/' ? '' : '/') + this.origin.name;
      } else {
        obj.objectType = 'FOLDER';
        obj.path = this.origin.path;
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
      if (this.comments.comment) {
        obj.auditLog = {};
        this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      }
      this.submitted = false;
      this.coreService.post(URL, obj).subscribe({
        next: (res) => {
          this.activeModal.close(res);
        }, error: () => {
          this.submitted = false;
          this.ref.detectChanges();
        }
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
          obj.objects.push({objectType: data.objectType, path: data.path + (data.path === '/' ? '' : '/') + data.name});
        });
      } else {
        obj.objects.push({objectType: item.objectType, path: item.path + (item.path === '/' ? '' : '/') + item.name});
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
  objectType: string;
  path: string;
  indexOfNextAdd = 0;
  objectHistory = [];
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;
  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(
    private authService: AuthService,
    public coreService: CoreService,
    private dataService: DataService,
    public inventoryService: InventoryService,
    private modal: NzModalService,
    private translate: TranslateService,
    private toasterService: ToastrService,
    private route: ActivatedRoute,
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
        } else if (res.recall) {
          this.recallObject(res.recall);
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
        } else if (res.reloadAgents) {
          this.getAgents();
        } else if (res.newDraft) {
          this.newDraft(res.newDraft);
        }
      }
    });
    this.subscription3 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf(false);
    });
  }

  ngOnInit(): void {
    this.objectType = this.route.snapshot.queryParamMap.get('objectType');
    this.path = this.route.snapshot.queryParamMap.get('path');
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

  private getAgents(): void {
    this.coreService.getAgents(this.inventoryService, this.schedulerIds.selected);
  }

  initTree(path, mainPath, redirect = false): void {
    if (!path) {
      this.isLoading = true;
    }
    this.coreService.post('tree', {
      forInventory: true,
      types: ['INVENTORY']
    }).subscribe({
      next: (res: any) => {
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
          } else if (!isEmpty(this.inventoryConfig.selectedObj) || (this.objectType && this.path)) {
            this.tree = tree;
            this.selectedObj = this.inventoryConfig.selectedObj;
            if (this.objectType && this.path) {
              this.selectedObj = {
                name: this.path.substring(this.path.lastIndexOf('/') + 1),
                path: this.path.substring(0, this.path.lastIndexOf('/')) || '/',
                type: this.objectType
              };
            }
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
      }, error: () => this.isLoading = false
    });
  }

  initTrashTree(path): void {
    this.coreService.post('tree', {
      forInventoryTrash: true,
      types: ['INVENTORY']
    }).subscribe({
      next: (res: any) => {
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
      }, error: () => this.isTreeLoaded = false
    });
  }

  recursivelyExpandTree(): void {
    if (this.selectedObj.type) {
      this.coreService.post('inventory/read/configuration', {
        objectType: this.selectedObj.type,
        path: this.selectedObj.name
      }).subscribe({
        next: (res) => {
          this.findObjectByPath(res.path);
        }, error: () => {
          this.updateObjects(this.tree[0], this.isTrash, (children) => {
            this.isLoading = false;
            if (children.length > 0) {
              this.tree[0].children.splice(0, 0, children[0]);
              this.tree[0].children.splice(1, 0, children[1]);
              this.tree[0].expanded = true;
            }
            this.updateTree(this.isTrash);
          }, false);
        }
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

                const parentNode = (self.selectedObj.type === InventoryObject.SCHEDULE || self.selectedObj.type === InventoryObject.INCLUDESCRIPT || (self.selectedObj.type && self.selectedObj.type.match(/CALENDAR/))) ? children[1] : children[0];
                if (self.selectedObj.path === parentNode.path) {
                  parentNode.expanded = true;
                  for (let j = 0; j < parentNode.children.length; j++) {
                    const x = parentNode.children[j];
                    if (x.object === self.selectedObj.type || (x.object && x.object.match(/CALENDAR/) && self.selectedObj.type && self.selectedObj.type.match(/CALENDAR/))) {
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
                if (self.selectedObj.type && (x.object === self.selectedObj.type || (x.object.match('CALENDAR') && self.selectedObj.type.match('CALENDAR'))) &&
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
      this.type = node.origin.objectType || node.origin.object || node.origin.type;
      this.selectedData = node.origin;
      this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, node.origin.objectType ? '$ID' : undefined);
    }
  }

  updateObjects(data, isTrash, cb, isExpandConfiguration): void {
    if (!data.permitted) {
      cb([]);
      return;
    }
    let flag = true;
    const controllerObj: any = {controllerArr: [], isArrow: false};
    const dailyPlanObj: any = {dailyPlanArr: [], isArrow: false};
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
        {
          name: 'Workflows',
          title: 'Workflows',
          object: InventoryObject.WORKFLOW,
          children: [],
          path: data.path,
          key: (KEY + 'Workflows$')
        },
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
        {
          name: 'Boards',
          title: 'Boards',
          object: InventoryObject.NOTICEBOARD,
          children: [],
          path: data.path,
          key: (KEY + 'Boards$')
        },
        {
          name: 'Locks',
          title: 'Locks',
          object: InventoryObject.LOCK,
          children: [],
          path: data.path,
          key: (KEY + 'Locks$')
        }
      ];
      dailyPlanObj.dailyPlanArr = [
        {
          name: 'IncludeScripts',
          title: 'Include Scripts',
          object: InventoryObject.INCLUDESCRIPT,
          children: [],
          path: data.path,
          key: (KEY + 'IncludeScripts$')
        },
        {
          name: 'Schedules',
          title: 'Schedules',
          object: InventoryObject.SCHEDULE,
          children: [],
          path: data.path,
          key: (KEY + 'Schedules$')
        },
        {
          name: 'Calendars',
          title: 'Calendars',
          object: 'CALENDAR',
          children: [],
          path: data.path,
          key: (KEY + 'Calendars$')
        },
        {
          name: 'Job Templates',
          title: 'Job Templates',
          object: InventoryObject.JOBTEMPLATE,
          children: [],
          path: data.path,
          key: (KEY + 'JobTemplates$')
        },
      ];
    }
    const obj: any = {
      path: data.path
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked && !isTrash) {
      obj.controllerId = this.schedulerIds.selected;
    }
    const URL = isTrash ? 'inventory/trash/read/folder' : 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe({
      next: (res: any) => {
        if (res.workflows && (res.workflows.length || res.fileOrderSources.length || res.jobResources.length
          || res.noticeBoards.length || res.locks.length)) {
          controllerObj.isArrow = true;
        }
        if (res.schedules && (res.schedules.length || res.includeScripts.length || res.calendars.length || res.jobTemplates.length)) {
          dailyPlanObj.isArrow = true;
        }
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
              this.mergeFolderData(resObject, controllerObj.controllerArr[i], res.path, controllerObj.controllerArr[i].object);
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
          } else if (dailyPlanObj.dailyPlanArr[i].object === InventoryObject.JOBTEMPLATE) {
            resObject = res.jobTemplates;
          }
          if (resObject) {
            if (!flag) {
              this.mergeFolderData(resObject, dailyPlanObj.dailyPlanArr[i], res.path, dailyPlanObj.dailyPlanArr[i].object);
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
          isArrow: controllerObj.isArrow,
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
          isArrow: dailyPlanObj.isArrow,
          deleted: data.deleted
        }];

        if ((this.preferences.joeExpandOption === 'both' || isExpandConfiguration) && !controllerObj.expanded1) {
          conf[0].expanded = true;
          conf[1].expanded = true;
        }
        if (this.selectedData.reload) {
          this.selectedData.reload = false;
        }
        cb(conf);
      }, error: () => {
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
      }
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

  repositoryOperation(node, operation, category): void {
    const origin = node.origin ? node.origin : node;
    this.modal.create({
      nzTitle: undefined,
      nzContent: RepositoryComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        controllerId: this.schedulerIds.selected,
        preferences: this.preferences,
        display: this.preferences.auditLog,
        origin,
        operation,
        category
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        setTimeout(() => {
          if (this.tree && this.tree.length > 0) {
            if (this.selectedData.path && (origin.path.indexOf(this.selectedData.path) > -1 || origin.path === this.selectedData.path)) {
              this.selectedData.reload = true;
            }
            this.initTree(origin.path, null);
          }
        }, 750);
      }
    });
  }

  gitClone(data, category): void {
    this.openGitModal(data, category, 'clone');
  }

  gitPull(data, category): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Folder',
        operation: 'Git pull',
        name: data.path
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
          this._gitPull(data, category, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          });
        }
      });
    } else {
      this._gitPull(data, category, {});
    }
  }

  private _gitPull(data, category, auditLog): void {
    this.coreService.post('inventory/repository/git/pull', {
      folder: data.path,
      category,
      auditLog
    }).subscribe({
      next: (res: any) => {
        this.showResult(res);
      }
    });
  }

  private showResult(result): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: NotificationComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        results: [result],
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  gitPush(data, category): void {
    this.openGitModal(data, category, 'push');
  }

  private openGitModal(data, category, operation): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: GitComponent,
      nzAutofocus: null,
      nzComponentParams: {
        controllerId: this.schedulerIds.selected,
        preferences: this.preferences,
        display: this.preferences.auditLog,
        data,
        operation,
        category
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result && operation === 'clone' && data.path == '/') {
        this.initTree(data.path, null);
      }
    })
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

  convertJob(type: string): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CronImportModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        preferences: this.preferences,
        display: this.preferences.auditLog,
        agents: this.inventoryService.agentList,
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
        display: this.preferences.auditLog,
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

  deployObject(node, releasable, operation?): void {
    const origin = this.coreService.clone(node.origin ? node.origin : node);
    if (this.selectedObj && this.selectedObj.id &&
      this.selectedObj.type === InventoryObject.WORKFLOW) {
      this.dataService.reloadTree.next({saveObject: origin});
    }
    if (releasable && origin.objectType) {
      this.releaseSingleObject(origin, operation);
      return;
    }

    if (origin.type || this.inventoryService.isControllerObject(origin.objectType)) {
      if (!node.origin) {
        if (origin.configuration) {
          origin.path = origin.path.substring(0, origin.path.lastIndexOf('/')) || '/';
        }
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
        nzClassName: 'lg',
        nzComponentParams: {
          schedulerIds: this.getAllowedControllerOnly(),
          preferences: this.preferences,
          display: this.preferences.auditLog,
          path: origin.path,
          data: origin,
          isChecked: this.inventoryService.checkDeploymentStatus.isChecked,
          releasable,
          operation
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

  reDeployObject(node: any): void {
    if (this.preferences.auditLog) {
      const object = node.origin;
      let comments = {
        radio: 'predefined',
        type: object.type || object.object || 'Folder',
        operation: 'Redeploy',
        name: object.name || object.path
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
          this.checkAuditLog(node, false, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          });
        }
      });
    } else {
      this.checkAuditLog(node, false);
    }
  }

  synchronize(node): void {
    if (this.preferences.auditLog) {
      const object = node.origin;
      let comments = {
        radio: 'predefined',
        type: object.type || object.object || 'Folder',
        operation: 'Synchronize',
        name: object.name || object.path
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
          this.checkAuditLog(node, true, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          });
        }
      });
    } else {
      this.checkAuditLog(node, true);
    }
  }

  private checkAuditLog(node, sync, auditLog = {}): void {
    const origin = node.origin ? node.origin : node;
    if (origin.controller) {
      this.coreService.post(sync ? 'inventory/deployment/synchronize' : 'inventory/deployment/redeploy', {
        controllerId: this.schedulerIds.selected,
        folder: origin.path,
        recursive: false,
        auditLog
      }).subscribe();
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
            auditLog,
            recursive: true
          }).subscribe();
        }
      });
    }
  }

  releaseObject(data): void {
    this.deployObject(data, true, 'release');
  }

  recallObject(data): void {
    this.deployObject(data, true, 'recall');
  }

  rename(data): void {
    if (data.name === this.selectedObj.name && data.path === this.selectedObj.path) {
      this.selectedObj.name = data.name1;
    }
    this.updateFolders(data.path, false, () => {
      this.updateTree(false);
    });
  }

  showJson(obj: any): void {
    this.coreService.post('inventory/read/configuration', {
      objectType: obj.showJson.objectType,
      path: (obj.showJson.path + (obj.showJson.path === '/' ? '' : '/') + obj.showJson.name)
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
          this.storeData(obj.showJson, result, obj.edit);
        }
      });
    });
  }

  newDraft(data): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: NewDraftComponent,
      nzComponentParams: {
        data
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(res => {
      if (res) {
        if (data.path === this.selectedObj.path && data.name === this.selectedObj.name && data.objectType === this.selectedObj.type) {
          this.type = undefined;
          this.selectedData.valid = res.valid;
          this.selectedData.deployed = res.deployed;
          this.selectedData.released = res.released;
          setTimeout(() => {
            this.type = data.objectType;
          }, 5);
        }
      }
    });
  }

  updateFromJobTemplates(workflow): void{

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
    let type = obj.objectType || obj.type;
    if (obj.objectType === 'CALENDAR') {
      type = obj.type;
    }
    if (obj.path && obj.name) {
      this.coreService.post('inventory/read/configuration', {
        path: (obj.path + (obj.path === '/' ? '' : '/') + obj.name),
        objectType: type,
      }).subscribe((res: any) => {
        const name = obj.name + '.' + type.toLowerCase() + '.json';
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
          display: this.preferences.auditLog,
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
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: object.type || object.object || 'Folder',
            operation: 'Paste',
            name: object.name || object.path
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
              this.cutPaste(object, result);
            }
          });
        } else {
          this.cutPaste(object);
        }
      }
    }
  }

  private cutPaste(object, comments: any = {}): void {
    const request: any = {newPath: object.path};
    if (this.copyObj.objectType || this.copyObj.type) {
      request.objectType = this.copyObj.objectType || this.copyObj.type;
      request.path = (this.copyObj.path + (this.copyObj.path === '/' ? '' : '/') + this.copyObj.name);
    } else {
      request.objectType = 'FOLDER';
      request.path = this.copyObj.path;
    }
    if (this.copyObj.path === request.newPath) {
      this.copyObj = undefined;
      return;
    } else {
      const pathArr = [];
      const arr = request.newPath.split('/');
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
      if (pathArr.length > 0 && pathArr.indexOf(this.copyObj.path) > -1 && request.objectType === 'FOLDER') {
        let msg = '';
        this.translate.get('error.message.pasteInSubFolderNotAllowed').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.toasterService.warning(msg);
        return;
      }
    }
    if (comments.comment) {
      request.auditLog = {};
      this.coreService.getAuditLogObj(comments, request.auditLog);
    }
    request.newPath = request.newPath + (request.newPath === '/' ? '' : '/') + this.copyObj.name;
    this.coreService.post('inventory/rename', request).subscribe((res) => {
      let obj: any = this.coreService.clone(this.copyObj);
      this.updateFolders(this.copyObj.path, false, () => {
        this.updateTree(false);
        obj.path = res.path.substring(0, res.path.lastIndexOf('/')) || '/';
        obj.name = res.path.substring(res.path.lastIndexOf('/') + 1);
        this.type = obj.objectType || obj.type;
        this.selectedData = obj;
        this.setSelectedObj(this.selectedData.type, this.selectedData.name, this.selectedData.path, obj.objectType ? '$ID' : undefined);
      });
      this.copyObj = undefined;
    });
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
        type: object.type || object.object || 'Folder',
        operation: 'Remove',
        name: object.name || object.path
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
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            });
          } else {
            obj.auditLog = {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            };
            this.coreService.post('inventory/remove', obj).subscribe(() => {
              if (this.selectedData.name === object.name && this.selectedData.path === object.path && this.selectedData.objectType === object.objectType) {
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
          type: 'Remove',
          objectName: path,
          countMessage: (obj.objects && !object.type) ? 'removeAllObject' : undefined,
          count: (obj.objects && !object.type) ? obj.objects.length : undefined
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
              if (this.selectedData.name === object.name && this.selectedData.path === object.path && this.selectedData.objectType === object.objectType) {
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
        type: object.type || object.object || 'Folder',
        operation: 'Delete',
        name: object.name || object.path
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
          countMessage: (obj.objects && !object.type) ? 'deleteAllDraftObject' : undefined,
          count: (obj.objects && !object.type) ? obj.objects.length : undefined
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
      if (object.objectType) {
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
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: object.type || object.object || 'Folder',
        operation: 'Delete',
        name: object.name || object.path
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments
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
          const URL = (object.type || object.object || object.controller || object.dailyPlan) ? 'inventory/trash/delete' : 'inventory/trash/delete/folder';
          this.coreService.post(URL, obj).subscribe();
        }
      });
    } else {
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
          this.coreService.post(URL, obj).subscribe();
        }
      });
    }
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
      nzClassName: 'lg',
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
    if (!this.permission.joc) {
      setTimeout(() => {
        this.initConf(isReload);
      }, 50);
      return;
    }
    this.getAgents();
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
    if (parent && parent.origin.children && this.selectedObj.type) {
      const index = (this.selectedObj.type.match('CALENDAR') || this.selectedObj.type === InventoryObject.SCHEDULE || this.selectedObj.type === InventoryObject.INCLUDESCRIPT) ? 1 : 0;
      const child = parent.origin.children[index];
      for (let i = 0; i < child.children.length; i++) {
        if (child.children[i].object === this.selectedObj.type || (this.selectedObj.type && this.selectedObj.type.match('CALENDAR') && child.children[i].object && child.children[i].object.match('CALENDAR'))) {
          this.selectedData = child.children[i];
          this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, this.selectedData.id);
          break;
        }
      }
    }
  }

  private releaseSingleObject(data,operation?): void {
    const PATH = data.path1 ? ((data.path1 + (data.path1 === '/' ? '' : '/') + data.name)) : ((data.path + (data.path === '/' ? '' : '/') + data.name));
    let obj: any = {};
    if (operation === 'release') {
      if (data.deleted) {
        obj.delete = [{objectType: data.objectType, path: PATH}];
      } else {
        obj.update = [{objectType: data.objectType, path: PATH}];
      }
    } else {
      obj.releasables = [{objectType: data.objectType, name: data.name}];
    }
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: data.type || data.objectType,
        operation: operation === 'release' ? 'Release' : 'Recall',
        name: data.name
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
          obj.auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          };
          this.releaseRecallOperation(operation, obj);
        }
      });
    } else {
      this.releaseRecallOperation(operation, obj);
    }
  }

  private releaseRecallOperation(operation, obj): void{
    this.coreService.post(operation === 'release' ? 'inventory/release' : 'inventory/releasables/recall', obj).subscribe();
  }

  private storeData(obj, result, reload): void {
    if (!obj.path && !obj.name) {
      return;
    }
    const path = (obj.path + (obj.path === '/' ? '' : '/') + obj.name);
    const request: any = {
      configuration: result,
      valid: true,
      path,
      objectType: obj.objectType || obj.type
    };
    if (request.objectType === 'CALENDAR' || (request.objectType.match(/CALENDAR/) && result.type && result.type.match(/CALENDAR/))) {
      request.objectType = result.type || 'WORKINGDAYSCALENDAR';
    }

    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        request.auditLog = {comment: translatedValue};
      });
    }
    this.coreService.post('inventory/store', request).subscribe((res: any) => {
      obj.valid = res.valid;
      if (obj.path === this.selectedObj.path && obj.name === this.selectedObj.name && request.objectType === this.selectedObj.type) {
        this.type = obj.objectType || obj.type;
        this.selectedData.valid = res.valid;
        this.selectedData.deployed = res.deployed;
        this.selectedData.released = res.released;
        if (reload) {
          this.selectedData.reload = true;
        }
      }
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
        objectType: this.copyObj.objectType || this.copyObj.type,
        path: res.path.substring(0, res.path.lastIndexOf('/')) || '/',
        name: res.path.substring(res.path.lastIndexOf('/') + 1),
        valid: this.copyObj.valid
      };
      object.expanded = true;
      this.type = obj.objectType;
      this.selectedData = obj;
      this.setSelectedObj(this.selectedData.type, this.selectedData.name, this.selectedData.path, '$ID');
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
        if (args.eventSnapshots[j].eventType === 'AgentInventoryUpdated' && args.eventSnapshots[j].objectType === 'AGENT') {
          this.getAgents();
        }
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

  private checkAndUpdateSelectedObj(sour): void {
    if (this.selectedData.name === sour.name) {
      this.selectedData.deployed = sour.deployed;
      this.selectedData.released = sour.released;
      this.selectedData.hasReleases = sour.hasReleases;
      this.selectedData.hasDeployments = sour.hasDeployments;
      this.selectedData.valid = sour.valid;
    }
  }

  private mergeFolderData(sour, dest, path, objectType): void {
    let isSelectedObjCheck = false;
    if (path === this.selectedData.path && this.selectedData.objectType &&
      (objectType === this.selectedData.objectType || (objectType === 'CALENDAR' && this.selectedData.objectType.match('CALENDAR')))) {
      isSelectedObjCheck = true;
    }
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
          if (isSelectedObjCheck) {
            this.checkAndUpdateSelectedObj(sour[j]);
          }
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
        if ((this.selectedObj.type === child.type || this.selectedObj.type === child.objectType) && child.name === this.selectedObj.name && child.path === this.selectedObj.path) {
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
          path,
          deleted: sour[j].deleted,
          deployed: sour[j].deployed,
          released: sour[j].released,
          valid: sour[j].valid,
          objectType: sour[j].objectType,
          hasDeployments: sour[j].hasDeployments,
          hasReleases: sour[j].hasReleases,
          type: dest.object,
        });
        if (isSelectedObjCheck) {
          this.checkAndUpdateSelectedObj(sour[j]);
        }
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
        this.storeObject(obj, list, configuration, res.comments);
      }
    });
  }

  private storeObject(obj, list, configuration, comments: any = {}): void {
    if (obj.type === InventoryObject.WORKFLOW && !configuration.timeZone) {
      configuration.timeZone = this.preferences.zone;
    }
    const valid = !(obj.type.match(/CALENDAR/) || obj.type === InventoryObject.SCHEDULE || obj.type === InventoryObject.INCLUDESCRIPT || obj.type === InventoryObject.NOTICEBOARD
      || obj.type === InventoryObject.WORKFLOW || obj.type === InventoryObject.FILEORDERSOURCE || obj.type === InventoryObject.JOBRESOURCE || obj.type === InventoryObject.JOBTEMPLATE);
    const PATH = obj.path + (obj.path === '/' ? '' : '/') + obj.name;
    if (PATH && obj.type && obj.name) {
      const request: any = {
        objectType: obj.type,
        path: PATH,
        valid: obj.valid ? obj.valid : valid,
        configuration
      };

      if (comments.comment) {
        request.auditLog = {
          comment: comments.comment,
          timeSpent: comments.timeSpent,
          ticketLink: comments.ticketLink
        }
      }

      this.coreService.post('inventory/store', request).subscribe(() => {
        if ((obj.type === InventoryObject.WORKINGDAYSCALENDAR || obj.type === InventoryObject.NONWORKINGDAYSCALENDAR)) {
          obj.objectType = clone(obj.type);
          obj.type = 'CALENDAR';
        }
        obj.valid = obj.valid ? obj.valid : valid;
        list.push(obj);
        this.type = obj.type;
        this.selectedData = obj;
        this.setSelectedObj(this.selectedData.type, this.selectedData.name, this.selectedData.path, '$ID');
        this.updateTree(false);
      });
    }
  }

  private deleteObject(path, object, node, auditLog): void {
    this.coreService.post('inventory/remove/folder', { path, auditLog }).subscribe(() => {
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
    let obj: any = { objects: [] };
    if (!object.type) {
      if (object.object || object.controller || object.dailyPlan) {
        object.children.forEach((item) => {
          if (item.children) {
            item.children.forEach((data) => {
              if (!isDraft || (!data.deployed && !data.released)) {
                obj.objects.push({
                  objectType: data.objectType,
                  path: data.path + (data.path === '/' ? '' : '/') + data.name
                });
              }
            });
          } else if (!isDraft || (!item.deployed && !item.released)) {
            obj.objects.push({
              objectType: item.objectType,
              path: item.path + (item.path === '/' ? '' : '/') + item.name
            });
          }
        });
      } else {
        obj = {path: object.path};
      }
    } else {
      obj.objects.push({
        objectType: object.objectType,
        path: object.path + (object.path === '/' ? '' : '/') + object.name
      });
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
    if (this.selectedObj && this.selectedObj.name) {
      this.exportJSON(this.selectedObj);
    }
  }

  upload(): void {
    if (this.selectedObj && this.selectedObj.name) {
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
    this.pushObjectInHistory();
    this.selectedObj.type = data.objectType;
    this.selectedObj.name = data.name;
    this.selectedObj.id = '$ID';
    this.findObjectByPath(data.path);
  }
}
