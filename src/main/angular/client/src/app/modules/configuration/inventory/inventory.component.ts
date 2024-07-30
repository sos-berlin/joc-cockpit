import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, ViewChild} from '@angular/core';
import {forkJoin, of, Subject, Subscription} from 'rxjs';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ToastrService} from 'ngx-toastr';
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {TranslateService} from '@ngx-translate/core';
import {clone, extend, groupBy, isArray, isEmpty, isEqual, sortBy} from 'underscore';
import {ClipboardService} from 'ngx-clipboard';
import {saveAs} from 'file-saver';
import {catchError, debounceTime} from 'rxjs/operators';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd/tree';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {ActivatedRoute} from "@angular/router";
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {InventoryService} from './inventory.service';
import {AuthService} from '../../../components/guard';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {InventoryObject} from '../../../models/enums';
import {UpdateJobTemplatesComponent} from "./job-template/job-template.component";
import {FileUploaderComponent} from "../../../components/file-uploader/file-uploader.component";
import {WorkflowService} from "../../../services/workflow.service";

declare const $: any;

@Component({
  selector: 'app-create-tag-template',
  templateUrl: './create-tag-dialog.html'
})
export class CreateTagModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  preferences: any;
  data: any;
  tag: any;
  isRename = false;
  submitted = false;
  display: any;
  required = false;
  comments: any = {};
  controllerId: string;
  filters: any;
  filter: any = {
    tags: []
  };
  object = {
    expanded: new Set(),
    deleteTags: new Set(),
    tagsObject: {},
    isRecursive: false
  };
  tags = [];
  allTags = [];
  filteredOptions: string[] = [];
  inputVisible = false;
  isUnique = true;
  inputValue = '';

  @ViewChild('inputElement', {static: false}) inputElement?: ElementRef;


  constructor(private coreService: CoreService, public activeModal: NzModalRef, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    if (this.modalData.filters) {
      this.filters = this.modalData.filters;
      this.controllerId = this.modalData.controllerId;
      this.filter.tags = this.coreService.selectedTags;
      this.fetchAllWorkflowTags();
    } else {
      this.preferences = this.modalData.preferences;
      this.data = this.modalData.data;
      if (this.modalData.isRename) {
        this.isRename = this.modalData.isRename;
        this.tag = this.coreService.clone(this.modalData.tag);
      }
      this.display = this.preferences.auditLog;
      if (this.data) {
        if (this.data.type) {
          this.fetchTags();
          this.fetchWorkflowTags();
        } else {
          this.object.isRecursive = (!this.data.controller && !this.data.object);
          this.fetchUsedTags();
        }
      } else if (this.isRename) {
        this.fetchTags();
      }
      this.comments.radio = 'predefined';
      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.required = true;
        this.display = true;
      }
    }
  }

  onChange(value: string): void {
    this.filteredOptions = this.allTags.filter(option => option.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    this.filteredOptions = this.filteredOptions.filter((tag) => {
      return this.tags.indexOf(tag) == -1;
    })
  }

  private fetchTags(): void {
    this.coreService.post('tags', {}).subscribe((res) => {
      this.allTags = res.tags;
    });
  }

  private fetchWorkflowTags(): void {
    this.coreService.post('inventory/workflow/tags', {path: (this.data.path + (this.data.path == '/' ? '' : '/') + this.data.name)}).subscribe((res) => {
      this.tags = res.tags;
    });
  }

  private fetchUsedTags(): void {
    this.coreService.post('tags/used', {
      folders: [
        {folder: this.data.path, recursive: this.object.isRecursive}
      ]
    }).subscribe({
      next: (res) => {
        delete res.deliveryDate;
        this.object.tagsObject = res;
      }
    });
  }

  expandAll(): void{
    for(let i in this.object.tagsObject){
      this.object.expanded.add(i);
    }
  }

  collapseAll(): void{
    this.object.expanded.clear();
  }

  handleRecursive(): void {
    this.fetchUsedTags();
  }

  private fetchAllWorkflowTags() {
    this.coreService.post('workflows/tag/search', {
      search: '',
      controllerId: this.controllerId
    }).subscribe({
      next: (res: any) => {
        this.allTags = res.results;
      }
    });
  }

  handleClose(removedTag: {}): void {
    this.tags = this.tags.filter(tag => tag !== removedTag);
  }

  sliceTagName(tag: string): string {
    const isLongTag = tag.length > 20;
    return isLongTag ? `${tag.slice(0, 20)}...` : tag;
  }

  showInput(): void {
    this.inputVisible = true;
    this.filteredOptions = this.allTags;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }

  handleInputConfirm(): void {
    if (this.inputValue && this.tags.indexOf(this.inputValue) === -1 && this.workflowService.isValidObject(this.inputValue)) {
      this.tags = [...this.tags, this.inputValue];
    }
    this.inputValue = '';
    this.inputVisible = false;
  }

  checkValidInput(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allTags.length; i++) {
      if (this.tag.name === this.allTags[i] &&
        this.tag.name === this.allTags[i] && this.tag.name !== this.modalData.tag?.name) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(): void {

    if (this.filters) {
      this.coreService.selectedTags = this.filter.tags;
      this.coreService.removeDuplicates();
      this.activeModal.close('DONE');
    } else {
      this.submitted = true;
      const obj: any = {
        auditLog: {}
      };
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      if (this.data) {
        if (!this.data?.type && !this.isRename) {
          this.storeFolderTags(obj);
          return;
        }
      }

      if (this.data) {
        obj.tags = this.tags;
        obj.path = (this.data.path + (this.data.path == '/' ? '' : '/') + this.data.name);
      } else if (this.isRename) {
        obj.name = this.modalData.tag.name;
        obj.newName = this.tag.name;
      } else {
        obj.tags = this.tags;
      }
      const URL = this.data ? 'inventory/workflow/tags/store' : this.isRename ? 'tag/rename' : 'tags/add'
      this.coreService.post(URL, obj).subscribe({
        next: () => {
          this.activeModal.close(this.isRename ? this.tag.name : 'DONE');
        }, error: () => {
          this.submitted = false;
        }
      });
    }
  }

  private storeFolderTags(obj): void {
    obj.folders = [{
      folder: this.data.path,
      recursive: this.object.isRecursive
    }];
    obj.addTags = this.tags;
    obj.deleteTags = Array.from(this.object.deleteTags);
    this.coreService.post('inventory/workflow/tags/store/folder',
      obj
    ).subscribe({
      next: (res) => {
        this.activeModal.close('DONE');
      }, error: () => {
        this.submitted = false;
      }
    });
  }

}

@Component({
  selector: 'app-show-objects',
  templateUrl: './show-objects-dialog.html'
})
export class ShowObjectsComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  panels: any = [];

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    this.panels.push({
      active: true,
      name: 'inventory.label.validityDenied',
      data: this.data.invalidObjs,
    });
    this.panels.push({
      active: false,
      name: 'inventory.label.validityApproved',
      data: this.data.validObjs,
    });
    this.panels.push({
      active: false,
      name: 'inventory.label.validationInfeasible',
      data: this.data.erroneousObjs,
    });
  }

  navToObject(data: any): void {
    this.activeModal.close(data);
  }
}

@Component({
  selector: 'app-new-draft-modal',
  templateUrl: './new-draft-dialog.html'
})
export class NewDraftComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  deployablesObject: any = [];
  loading = true;
  submitted = false;
  display = false;
  required = false;
  comments: any = {radio: 'predefined'};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
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

  private getSingleObject(obj: any): void {
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

  private store(obj: any): void {
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
export class SingleDeployComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerIds: any;
  data: any;
  type = '';
  display: any;
  releasable = false;
  isRevoke = false;
  isChecked = false;
  isRemoved = false;
  selectedSchedulerIds: any = [];
  deployablesObject: any = [];
  loading = true;
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  dateFormat: any = {};
  includeLate: boolean = false;
  object: any = {
    store: {draftConfigurations: [], deployConfigurations: []},
    delete: {deployConfigurations: []}
  };
  dailyPlanDate: any = {
    addOrdersDateFrom: 'now',
  };
impactedWorkflows: any = {
    workflows: [],
    isRenamed: false
  }
  dateObj: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.schedulerIds = this.modalData.schedulerIds;
    this.data = this.modalData.data;
    this.type = this.modalData.type;
    this.display = this.modalData.display;
    this.releasable = this.modalData.releasable;
    this.isRevoke = this.modalData.isRevoke;
    this.isChecked = this.modalData.isChecked;
    this.isRemoved = this.modalData.isRemoved;
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    const preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.dateFormat = this.coreService.getDateFormat(preferences.dateFormat);
    this.init();
   if(this.data?.objectType === 'NOTICEBOARD' || this.data?.type === 'NOTICEBOARD') {
      this.getNoticeReferences();
    }
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
    if (this.isRemoved) {
      this.remove();
      return;
    }
    if (this.releasable) {
      this.release();
      return;
    }

    this.getJSObject();
    const obj: any = {
      controllerIds: this.selectedSchedulerIds,
      auditLog: {},
      includeLate: this.includeLate
    };
    if ((this.data.objectType == 'WORKFLOW' || this.releasable || this.isRemoved) && this.deployablesObject.length > 0) {
      if (!this.isRevoke) {
        if (this.dailyPlanDate.addOrdersDateFrom == 'startingFrom') {
          obj.addOrdersDateFrom = this.coreService.getDateByFormat(this.dateObj.fromDate, null, 'YYYY-MM-DD');
        } else if (this.dailyPlanDate.addOrdersDateFrom == 'now') {
          obj.addOrdersDateFrom = 'now';
        }
      }
    }
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
    if (this.impactedWorkflows && this.impactedWorkflows.workflows.length > 0 && this.impactedWorkflows.isRenamed) {
      const selectedWorkflows = this.impactedWorkflows.workflows.filter(workflow => workflow.selected);
      if (selectedWorkflows.length > 0) {
        this.object.store.draftConfigurations.push(selectedWorkflows.map(workflow => ({
          configuration: {
            objectType: 'WORKFLOW',
            path: workflow.path
          }
        })));
      }
    }

    this.coreService.post(this.isRevoke ? 'inventory/deployment/revoke' : 'inventory/deployment/deploy', obj).subscribe({
      next: () => {
        this.activeModal.close();
      }, error: () => this.submitted = false
    });
  }

  release(): void {
    const PATH = this.data.path1 ? ((this.data.path1 + (this.data.path1 === '/' ? '' : '/') + this.data.name)) : ((this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name));
    let obj: any = {
      auditLog: {},
      includeLate: this.includeLate
    };

    if (this.dailyPlanDate.addOrdersDateFrom == 'startingFrom') {
      obj.addOrdersDateFrom = this.coreService.getDateByFormat(this.dateObj.fromDate, null, 'YYYY-MM-DD');
    } else if (this.dailyPlanDate.addOrdersDateFrom == 'now') {
      obj.addOrdersDateFrom = 'now';
    }

    if (this.data.deleted) {
      obj.delete = [{objectType: this.data.objectType, path: PATH}];
    } else {
      obj.update = [{objectType: this.data.objectType, path: PATH}];
    }
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);

    this.coreService.post('inventory/release', obj).subscribe({
      next: () => {
        this.activeModal.close();
      }, error: () => this.submitted = false
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private remove(): void {
    const obj: any = {
      auditLog: {}
    };
    if (this.dailyPlanDate.addOrdersDateFrom == 'startingFrom') {
      obj.cancelOrdersDateFrom = this.coreService.getDateByFormat(this.dateObj.fromDate, null, 'YYYY-MM-DD');
    } else if (this.dailyPlanDate.addOrdersDateFrom == 'now') {
      obj.cancelOrdersDateFrom = 'now';
    }
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    this.activeModal.close(obj);
  }

  private getSingleObject(obj): void {
    if (this.isRemoved) {
      this.loading = false;
      // this.deployablesObject.push(this.data);
    } else {
      this.coreService.post((this.releasable ? 'inventory/releasable' : 'inventory/deployable'), obj).subscribe({
        next: (res: any) => {
          const result = res.deployable || res.releasable;
          if (result.deployablesVersions && result.deployablesVersions.length > 0 && !result.deleted) {
            result.deployId = '';
            if (result.deployablesVersions[0].versions && result.deployablesVersions[0].versions.length > 0) {
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

 private getNoticeReferences(): void {
    const obj = {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.data.objectType || this.data.type
    };
    this.coreService.post('inventory/noticeboard/references', obj).subscribe({
      next: (res: any) => {
        if (res.workflows) {
          this.impactedWorkflows = {
            workflows: res.workflows.map((workflow: any) => ({
              ...workflow,
              selected: true
            })),
            isRenamed: res.isRenamed
          };
        }
      }
    });
  }}

@Component({
  selector: 'app-deploy-draft-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deploy-dialog.html'
})
export class DeployComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;
  schedulerIds: any;
  preferences: any;
  path = '';
  releasable = false;
  display: any;
  data: any;
  operation = '';
  isRemove: any;
  isRevoke = false;
  isChecked = false;
  isSelectedObjects = false;
  selectedSchedulerIds: any = [];
  loading = true;
  nodes: any = [];
  checkedObject = new Set();
  dateFormat: any = '';
  dateObj: any = {};
  includeLate: boolean = false;

  object: any = {
    isRecursive: false,
    delete: [],
    update: [],
    releasables: [],
    store: {draftConfigurations: [], deployConfigurations: []},
    deleteObj: {deployConfigurations: []}
  };
  dailyPlanDate: any = {
    addOrdersDateFrom: 'now',
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
    this.schedulerIds = this.modalData.schedulerIds;
    this.preferences = this.modalData.preferences;
    this.path = this.modalData.path;
    this.releasable = this.modalData.releasable;
    this.display = this.modalData.display;
    this.data = this.modalData.data;
    this.operation = this.modalData.operation;
    this.isRemove = this.modalData.isRemove;
    this.isRevoke = this.modalData.isRevoke;
    this.isChecked = this.modalData.isChecked;
    this.isSelectedObjects = this.modalData.isSelectedObjects;

    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data && this.data.deleted) {
      this.isDeleted = true;
    }
    this.selectedSchedulerIds.push(this.schedulerIds.selected);
    if (this.isRemove && (!this.data.type || !this.data.object)) {
      this.loading = false;
      this.nodes.push({
        name: this.data.object ? this.path : this.data.name,
        path: this.path,
        isLeaf: true
      })
      this.ref.detectChanges();
    } else {
      this.buildTree(this.path);
    }
  }

  handleRecursive(): void {
    this.ref.detectChanges();
  }

  expandAll(): void {
    this.buildTree(this.path, null, () => {
      const self = this;

      function recursive(node: any): void {
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

  private expandCollapseRec(node: any): void {
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

  private recursiveCheck(node: any, isUpdate = false): void {
    for (const i in node) {
      if (!isUpdate) {
        if (node[i].checked && !node[i].disableCheckbox) {
          this.checkedObject.add(node[i].key)
        }
      } else {
        node[i].checked = this.checkedObject.has(node[i].key);
      }
      if (node[i].children && node[i].children.length > 0) {
        this.recursiveCheck(node[i].children, isUpdate);
      }
    }
  }

  filterList(): void {
    this.checkedObject.clear();
    this.recursiveCheck(this.nodes);
    //  this.nodes = [];
    this.loading = true;
    this.buildTree(this.path);
  }

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.object.isRecursive) {
      const node: any = e.node;
      if (node.origin['type'] && node.parentNode) {
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
      if (!node.origin['type']) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].origin['type']) {
            node.children[i].isChecked = node.isChecked;
          }
          if (!node.children[i].origin['object'] && !node.children[i].origin['type']) {
            break;
          }
        }
      }
    }
  }

  buildTree(path: string, merge?: any, cb?: any, flag = false): void {
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
    if (this.isSelectedObjects) {
      obj.objectTypes = this.data.objectType === 'CALENDAR' ? [InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR] : [this.data.objectType];
    }
    const URL = this.releasable ? 'inventory/releasables' : 'inventory/deployables';
    this.coreService.post(URL, obj).subscribe({
      next: (res: any) => {
        let tree = [];
        if (this.isSelectedObjects) {
          res.folders = [];
          if (res.deployables) {
            res.deployables = res.deployables.filter((item: any) => {
              let flag = false;
              item.checked = true;
              for (let i in this.data.list) {
                if (this.data.list[i].name == item.objectName) {
                  flag = true;
                  break;
                }
              }
              return flag;
            });
          }
          if (res.releasables) {
            res.releasables = res.releasables.filter((item: any) => {
              let flag = false;
              for (let i in this.data.list) {
                if (this.data.list[i].name == item.objectName) {
                  flag = true;
                  break;
                }
              }
              return flag;
            });
          }
        }
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
          if (tree[0].children.length === 0 && !tree[0].deployables && !tree[0].releasables) {
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
          if (this.checkedObject.size > 0) {
            this.recursiveCheck(this.nodes, true);
            this.checkedObject.clear();
          }
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

  openFolder(node, skip = true): void {
    if (skip) {
      node.isExpanded = !node.isExpanded;
    }
    if (node && node.origin && node.origin.expanded && !node.origin['isCall']) {
      if (!node.origin['type'] && !node.origin['object'] && !this.releasable) {
        node.origin['loading'] = true;
        this.buildTree(node.origin['path'], node.origin);
      }
      this.inventoryService.checkAndUpdateVersionList(node.origin);
    }
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    const node = e.node;
    this.openFolder(node, false);
  }

  getJSObject(): void {
    this.object.store = {draftConfigurations: [], deployConfigurations: []};
    this.object.deleteObj = {deployConfigurations: []};
    const self = this;
    let selectFolder = true;
    if ((this.data && this.data.object) || this.isSelectedObjects) {
      selectFolder = false;
    }

    function recursive(nodes: any): void {
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

    function recursive(nodes: any) {
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
              path: nodes[i].name,
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
    const obj: any = {
      includeLate: this.includeLate
    };

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
        } else {
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

    if (this.operation !== 'recall') {
      if (((!this.data.controller && !this.data.dailyPlan && !this.data.object && !this.data.objectType) ||
        ((this.data.object && (this.data.object == 'WORKFLOW' || this.data.object == 'SCHEDULE' || this.data.object.match('CALENDAR'))) ||
          (this.data.objectType && (this.data.objectType == 'WORKFLOW' || this.data.objectType == 'SCHEDULE' || this.data.objectType.match('CALENDAR'))) || this.data.controller || this.data.dailyPlan))) {
        if (!this.isRevoke) {
          if (this.dailyPlanDate.addOrdersDateFrom == 'startingFrom') {
            obj.addOrdersDateFrom = this.coreService.getDateByFormat(this.dateObj.fromDate, null, 'YYYY-MM-DD');
          } else if (this.dailyPlanDate.addOrdersDateFrom == 'now') {
            obj.addOrdersDateFrom = 'now';
          }
        }
      }
    }

    const URL = this.releasable ? this.operation === 'recall' ? 'inventory/releasables/recall' : 'inventory/release' : this.isRevoke ? 'inventory/deployment/revoke' : 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        if (this.isSelectedObjects) {
          this.activeModal.close('CLOSE');
        } else {
          this.activeModal.close();
        }
      }, error: () => {
        this.submitted = false;
        this.ref.detectChanges();
      }
    });
  }

  remove(): void {
    this.submitted = true;
    const obj: any = {
      auditLog: {}
    };
    if (this.dailyPlanDate.addOrdersDateFrom == 'startingFrom') {
      obj.cancelOrdersDateFrom = this.coreService.getDateByFormat(this.dateObj.fromDate, null, 'YYYY-MM-DD');
    } else if (this.dailyPlanDate.addOrdersDateFrom == 'now') {
      obj.cancelOrdersDateFrom = 'now';
    }
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    this.activeModal.close(obj);
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-dialog.html'
})
export class ExportComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  @ViewChild('treeCtrl', {static: false}) treeCtrl!: any;
  schedulerIds: any;
  preferences: any;
  origin: any;
  display: any;
  loading = true;
  nodes: any = [];
  checkedObject = new Set();
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  inValid = false;
  exportType = 'BOTH';
  path = '';
  securityLevel = '';
  exportObj = {
    useShortPath: false,
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
  objectTypes: string[] = [];
  object: any = {
    draftConfigurations: [],
    releaseDraftConfigurations: [],
    deployConfigurations: [],
    releasedConfigurations: []
  };
  fileFormat = [{value: 'ZIP', name: 'ZIP'},
    {value: 'TAR_GZ', name: 'TAR_GZ'}
  ]
  folderArr = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    this.schedulerIds = this.modalData.schedulerIds;
    this.preferences = this.modalData.preferences;
    this.origin = this.modalData.origin;
    this.display = this.modalData.display;
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }

    this.exportObj.controllerId = this.schedulerIds.selected;
    this.securityLevel = sessionStorage['securityLevel'];
    if (this.origin) {
      if (this.origin.object) {
        this.exportObj.exportType = '';
      }
      this.path = this.origin.path;
      if (this.origin.dailyPlan || (this.origin.object &&
        (this.origin.object === InventoryObject.SCHEDULE || this.origin.object === InventoryObject.JOBTEMPLATE || this.origin.object === InventoryObject.INCLUDESCRIPT || this.origin.object.match('CALENDAR')))) {
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
        if ((ext === 'ZIP' || ext === 'zip')) {
          this.exportObj.fileFormat = 'ZIP';
        } else if ((ext === 'tar' || ext === 'gz')) {
          this.exportObj.fileFormat = 'TAR_GZ';
        }
      } else {
        this.inValid = false;
        this.exportObj.filename = this.exportObj.filename + (this.exportObj.fileFormat === 'ZIP' ? '.zip' : '.tar.gz');
      }
    }
  }

  buildTree(path: string, merge?: any, cb?: any, flag = false): void {
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
        APIs.push(this.coreService.post('inventory/deployables', {...obj, ...{objectTypes: deployObjectTypes}}).pipe(
          catchError(error => of(error))
        ));
      }
      if (releaseObjectTypes.length > 0) {
        APIs.push(this.coreService.post('inventory/releasables', {...obj, ...{objectTypes: releaseObjectTypes}}).pipe(
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
            this.inventoryService.checkAndUpdateVersionList(tree[0], this.exportObj.exportType === 'folders');
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
                this.inventoryService.checkAndUpdateVersionList(this.nodes[0], this.exportObj.exportType === 'folders');
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

  private mergeDeep(deployables: any, releasables: any): any {
    function recursive(sour: any, dest: any): void {
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

  private recursiveCheck(node: any, isUpdate = false): void {
    for (const i in node) {
      if (!isUpdate) {
        if (node[i].checked && !node[i].disableCheckbox) {
          this.checkedObject.add(node[i].key)
        }
      } else {
        node[i].checked = this.checkedObject.has(node[i].key);
      }
      if (node[i].children && node[i].children.length > 0) {
        this.recursiveCheck(node[i].children, isUpdate);
      }
    }
  }


  filterList(isChecked = true): void {
    this.checkedObject.clear();
    if (isChecked) {
      this.recursiveCheck(this.nodes);
    }
    if (!this.filter.controller && !this.filter.dailyPlan) {
      this.nodes = [];
      return;
    } else {
      this.loading = true;
      this.buildTree(this.path, null, () => {
        this.loading = false;
        if (this.nodes.length > 0) {
          this.nodes[0].expanded = true;
          this.inventoryService.checkAndUpdateVersionList(this.nodes[0], this.exportObj.exportType === 'folders');
        }
        if (this.checkedObject.size > 0) {
          this.recursiveCheck(this.nodes, true);
          this.checkedObject.clear();
        }
        this.nodes = [...this.nodes];
      });
    }
  }

  expandAll(): void {
    this.buildTree(this.path, null, () => {
      const self = this;

      function recursive(node: any): void {
        for (const i in node) {
          if (!node[i].isLeaf) {
            node[i].expanded = true;
          }
          if (node[i].children && node[i].children.length > 0) {
            if (!node[i].isCall) {
              self.inventoryService.checkAndUpdateVersionList(node[i], self.exportObj.exportType === 'folders');
            }
            recursive(node[i].children);
          }
        }
      }

      recursive(this.nodes);
      this.nodes = [...this.nodes];
    }, true);
  }

  private expandCollapseRec(node: any): void {
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

  openFolder(node, skip = true): void {
    if (skip) {
      node.isExpanded = !node.isExpanded;
    }
    if (node && node.origin && node.origin.expanded && !node.origin['isCall']) {
      if (!node.origin['type'] && !node.origin['object']) {
        node.origin['loading'] = true;
        this.buildTree(node.origin['path'], node.origin);
      }
      this.inventoryService.checkAndUpdateVersionList(node.origin, this.exportObj.exportType === 'folders');
    }
  }

  getDeploymentVersion(e: NzFormatEmitEvent): void {
    const node = e.node;
    this.openFolder(node, false);
  }

  checkBoxChange(e: NzFormatEmitEvent): void {
    if (!this.exportObj.isRecursive) {
      const node: any = e.node;
      if (node.origin['type'] && node.parentNode) {
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
    } else if (this.exportObj.exportType !== 'folders') {
      selectFolder = false;
    }

    function recursive(nodes: any): void {
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
                if (nodes[i].children[j].checked && selectFolder) {
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
      useShortPath: this.exportObj.useShortPath,
      exportFile: {filename: this.exportObj.filename, format: this.exportObj.fileFormat}
    };

    if (this.path && this.path != 'path') {
      obj.startFolder = this.path;
    }

    if (this.comments.comment) {
      obj.auditLog = {};
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    }

    let folders = [];
    if (this.exportObj.exportType !== 'folders') {
      this.buildTreeOnSubmit(this.path, null, () => {
        const self = this;
        function recursive(node: any): void {
          for (const i in node) {
            if (!node[i].isLeaf) {
              node[i].expanded = true;
            }
            if (node[i].children && node[i].children.length > 0) {
              if (!node[i].isCall) {
                self.inventoryService.checkAndUpdateVersionList(node[i], self.exportObj.exportType === 'folders');
              }
              recursive(node[i].children);
            }
          }
        }
        recursive(this.nodes);
        this.nodes = [...this.nodes];
      }, true);
      setTimeout(() => {
        this.checkFolderSelection(folders);
      }, 100);
    }
    setTimeout(() => {
      if ((folders.length > 0) || (this.object.deployConfigurations && this.object.deployConfigurations.length > 0) ||
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

        if (folders.length > 0) {
          if (!obj.shallowCopy.releasables) {
            obj.shallowCopy.releasables = {
              releasedConfigurations: folders,
              draftConfigurations: folders
            }
          } else {
            if (!obj.shallowCopy.releasables.releasedConfigurations) {
              obj.shallowCopy.releasables.releasedConfigurations = folders;
            } else {
              obj.shallowCopy.releasables.releasedConfigurations = obj.shallowCopy.releasables.releasedConfigurations.concat(folders);
            }

            if (!obj.shallowCopy.releasables.draftConfigurations) {
              obj.shallowCopy.releasables.draftConfigurations = folders;
            } else {
              obj.shallowCopy.releasables.draftConfigurations = obj.shallowCopy.releasables.draftConfigurations.concat(folders);
            }
          }
          if (!obj.shallowCopy.deployables) {
            obj.shallowCopy.releasables = {
              deployConfigurations: folders,
              draftConfigurations: folders
            }
          } else {
            if (!obj.shallowCopy.deployables.deployConfigurations) {
              obj.shallowCopy.deployables.deployConfigurations = folders;
            } else {
              obj.shallowCopy.deployables.deployConfigurations = obj.shallowCopy.deployables.deployConfigurations.concat(folders);
            }

            if (!obj.shallowCopy.deployables.draftConfigurations) {
              obj.shallowCopy.deployables.draftConfigurations = folders;
            } else {
              obj.shallowCopy.deployables.draftConfigurations = obj.shallowCopy.deployables.draftConfigurations.concat(folders);
            }
          }
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
    }, 100);
  }

  private checkFolderSelection(folders): void {
    function recursive(nodes, folderArr) {
      for (let i in nodes.children) {
        if (nodes.children[i] && !nodes.children[i].type) {
          if (nodes.children[i].checked) {
            folders.push({
              configuration: {
                path: nodes.children[i].path,
                objectType: 'FOLDER'
              }
            });
            folderArr.forEach((arr) => {
              if (arr.path.split('/')[1] === nodes.children[i].name && arr.path !== nodes.children[i].path) {
                folders.push({
                  configuration: {
                    path: arr.path,
                    objectType: 'FOLDER'
                  }
                });
              }
            })
          }
          if (nodes.children[i].children?.length > 0) {
            recursive(nodes.children[i], folderArr);
          }
        }
      }
    }

    this.nodes.forEach((x) => {
      if (!x.type) {
        if (x.checked) {
          folders.push({
            configuration: {
              path: x.path,
              objectType: 'FOLDER'
            }
          });
          this.folderArr.forEach((arr) => {
            if (arr.path.split('/')[1] === x.name && arr.path !== x.path) {
              folders.push({
                configuration: {
                  path: arr.path,
                  objectType: 'FOLDER'
                }
              });
            }
          })
        }

        if (x.children?.length > 0) {
          recursive(x, this.folderArr);
        }
      }
    })
  }

  private exportFolder(obj: any): void {

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


  buildTreeOnSubmit(path: string, merge?: any, cb?: any, flag = false): void {
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
      releaseObjectTypes.push( InventoryObject.INCLUDESCRIPT, InventoryObject.SCHEDULE, InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR, InventoryObject.JOBTEMPLATE);
    }

    const APIs = [];
    if (this.filter.controller && this.filter.dailyPlan) {
      obj.withoutReleased = !this.filter.release;
      if (deployObjectTypes.length > 0) {
        APIs.push(this.coreService.post('inventory/deployables', {...obj, ...{objectTypes: deployObjectTypes}}).pipe(
          catchError(error => of(error))
        ));
      }
      if (releaseObjectTypes.length > 0) {
        APIs.push(this.coreService.post('inventory/releasables', {...obj, ...{objectTypes: releaseObjectTypes}}).pipe(
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

    forkJoin(APIs).subscribe({
      next: (res: any) => {
        for(let i in res){
          this.updateDataRecursively(res[i], res[i].deployables ? 'deployables' : 'releasables');
        }

      }
    })
  }

  private updateDataRecursively(list, type, callback?): void {
    // for(let i=0; i<list[type]?.length; i++){
    //   console.log(list[type][i]);
    // }

    for (let j in list['folders']) {

      if (list['folders'][j]) {
        this.updateDataRecursively(list['folders'][j], type);
        this.folderArr.push({
          path: list['folders'][j]?.path,
        });
      }
    }

    if (callback) {
      callback();
    }
  }

}

@Component({
  selector: 'app-repository-modal',
  templateUrl: './repository-dialog.html'
})
export class RepositoryComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  @ViewChild('treeCtrl', {static: false}) treeCtrl!: any;
  controllerId = '';
  preferences: any;
  origin: any;
  operation = '';
  category = '';
  display = false
  loading = true;
  path = '';
  type = 'ALL';
  nodes: any = [];
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  exportObj = {
    isRecursive: false
  };
  showLabel = false;
  filter = {
    envRelated: true,
    envIndependent: false,
    deploy: true,
    draft: false,
    valid: false,
  };
  object: any = {
    draftConfigurations: [],
    releaseDraftConfigurations: [],
    deployConfigurations: [],
    releasedConfigurations: []
  };

  listOfDeployables: any = [];
  listOfReleaseables: any = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService,
              private inventoryService: InventoryService) {
  }

  ngOnInit(): void {
    this.controllerId = this.modalData.controllerId;
    this.preferences = this.modalData.preferences;
    this.origin = this.modalData.origin;
    this.operation = this.modalData.operation;
    this.category = this.modalData.category;
    this.display = this.modalData.display;
    this.loadSetting();
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    this.filter.envIndependent = this.category !== 'LOCAL';
  }

  private init(): void {
    if (this.origin) {
      this.path = this.origin.path;
      if (this.origin.object) {
        if (this.origin.object === InventoryObject.SCHEDULE || this.origin.object === InventoryObject.JOBTEMPLATE || this.origin.object === InventoryObject.INCLUDESCRIPT || this.origin.object.match('CALENDAR')) {
          this.type = this.origin.object;
          this.filter.envIndependent = false;
          this.filter.deploy = false;
        } else {
          this.type = this.origin.object;
          this.filter.envRelated = false;
          this.filter.deploy = false;
        }
      }
    }
    if (this.operation === 'store') {
      this.buildTree(this.path);
    } else {
      this.readFileSystem(this.path);
    }
  }

  private loadSetting() {
    this.coreService.post('configurations', {configurationType: 'GLOBALS'}).subscribe({
      next: (res) => {
        let configuration: any = {};
        if (res.configurations[0] && res.configurations[0].configurationItem) {
          configuration = JSON.parse(res.configurations[0].configurationItem);
        }
        const category = this.category.toLowerCase();
        if ((configuration.git?.git_hold_job_resources && configuration.git?.git_hold_job_resources.value == category)
          || (!configuration.git?.git_hold_job_resources && res.defaultGlobals.git?.git_hold_job_resources && res.defaultGlobals.git?.git_hold_job_resources.default == category)) {
          this.listOfDeployables.push(InventoryObject.JOBRESOURCE);
        }
        if ((configuration.git?.git_hold_workflows && configuration.git?.git_hold_workflows.value == category)
          || (!configuration.git?.git_hold_workflows && res.defaultGlobals.git?.git_hold_workflows && res.defaultGlobals.git?.git_hold_workflows.default == category)) {
          this.listOfDeployables.push(InventoryObject.WORKFLOW);
        }
        if ((configuration.git?.git_hold_notice_boards && configuration.git?.git_hold_notice_boards.value == category)
          || (!configuration.git?.git_hold_notice_boards && res.defaultGlobals.git?.git_hold_notice_boards && res.defaultGlobals.git?.git_hold_notice_boards.default == category)) {
          this.listOfDeployables.push(InventoryObject.NOTICEBOARD);
        }
        if ((configuration.git?.git_hold_resource_locks && configuration.git?.git_hold_resource_locks.value == category)
          || (!configuration.git?.git_hold_resource_locks && res.defaultGlobals.git?.git_hold_resource_locks && res.defaultGlobals.git?.git_hold_resource_locks.default == category)) {
          this.listOfDeployables.push(InventoryObject.LOCK);
        }

        if ((configuration.git?.git_hold_file_order_sources && configuration.git?.git_hold_file_order_sources.value == category)
          || (!configuration.git?.git_hold_file_order_sources && res.defaultGlobals.git?.git_hold_file_order_sources && res.defaultGlobals.git?.git_hold_file_order_sources.default == category)) {
          this.listOfDeployables.push(InventoryObject.FILEORDERSOURCE);
        }
        if ((configuration.git?.git_hold_schedules && configuration.git?.git_hold_schedules.value == category)
          || (!configuration.git?.git_hold_schedules && res.defaultGlobals.git?.git_hold_schedules && res.defaultGlobals.git?.git_hold_schedules.default == category)) {
          this.listOfReleaseables.push(InventoryObject.SCHEDULE);
        }
        if ((configuration.git?.git_hold_calendars && configuration.git?.git_hold_calendars.value == category)
          || (!configuration.git?.git_hold_calendars && res.defaultGlobals.git?.git_hold_calendars && res.defaultGlobals.git?.git_hold_calendars.default == category)) {
          this.listOfReleaseables.push(InventoryObject.WORKINGDAYSCALENDAR, InventoryObject.NONWORKINGDAYSCALENDAR);
        }

        if ((configuration.git?.git_hold_job_templates && configuration.git?.git_hold_job_templates.value == category)
          || (!configuration.git?.git_hold_job_templates && res.defaultGlobals.git?.git_hold_job_templates && res.defaultGlobals.git?.git_hold_job_templates.default == category)) {
          this.listOfReleaseables.push(InventoryObject.JOBTEMPLATE);
        }
        if ((configuration.git?.git_hold_script_includes && configuration.git?.git_hold_script_includes.value == category)
          || (!configuration.git?.git_hold_script_includes && res.defaultGlobals.git?.git_hold_script_includes && res.defaultGlobals.git?.git_hold_script_includes.default == category)) {
          this.listOfReleaseables.push(InventoryObject.INCLUDESCRIPT);
        }
        this.init();
      }, error: () => {
        this.init();
      }
    });
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
        obj2.objectTypes = this.listOfDeployables;
        if (obj2.objectTypes.length > 0) {
          APIs.push(this.coreService.post('inventory/deployables', obj2).pipe(
            catchError(error => of(error))
          ));
        }
      }

      obj.objectTypes = this.listOfReleaseables;
      obj.withoutReleased = !this.filter.deploy;
      if (obj.objectTypes.length > 0) {
        APIs.push(this.coreService.post('inventory/releasables', obj).pipe(
          catchError(error => of(error))
        ));
      }
    } else if (this.filter.envIndependent) {
      obj.withVersions = !this.filter.deploy;
      if (this.type !== 'ALL') {
        obj.objectTypes = [this.type];
      } else {
        obj.objectTypes = this.listOfDeployables;
      }
      if (obj.objectTypes.length > 0) {
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

  private mergeDeep(deployables: any, releasables: any): any {
    function recursive(sour: any, dest: any): void {
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

  private readFileSystem(path: string, merge?: any, cb?: any, flag = false): void {
    this.coreService.post('inventory/repository/read', {
      folder: path || '/',
      recursive: flag,
      category: this.category
    }).subscribe((res) => {
      let tree = [];
      if (res.folders && res.folders.length > 0 || res.items && res.items.length > 0) {
        if (this.type !== 'ALL') {
          if (res.folders && res.folders.length > 0) {
            res.folders.forEach((folder: any) => {
              if (folder.items && folder.items.length > 0) {
                folder.items = folder.items.filter((item: any) => {
                  return item.objectType === this.type;
                })
              }
            })
          }
          if (res.items && res.items.length > 0) {
            res.items = res.items.filter((item: any) => {
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
    this.showLabel = false;
    if (!this.filter.deploy && !this.filter.draft) {
      this.showLabel = false;
      this.filter.draft = true;
      this.filter.valid = true;
    } else {
      if (this.filter.deploy && this.filter.draft) {
        this.showLabel = true;
        this.filter.valid = true;
      }
    }
    if (!this.filter.envRelated && !this.filter.envIndependent) {
      this.nodes = [];
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
    if (node && node.origin && node.origin.expanded && !node.origin['isCall']) {
      if (!node.origin['type'] && !node.origin['object']) {
        node.origin['loading'] = true;
        if (this.operation === 'store') {
          this.buildTree(node.origin['path'], node.origin);
        } else {
          this.readFileSystem(node.origin['path'], node.origin);
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
      if (node.origin['type'] && node.parentNode) {
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
      if (!node.origin['type']) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].origin['type']) {
            node.children[i].isChecked = node.isChecked;
          }
          if (!node.children[i].origin['type'] && !node.children[i].origin['object']) {
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
                  self.object.releasedConfigurations.push(objDep);
                }
                if (self.filter.draft) {
                  self.object.draftConfigurations.push(objDep);
                }
              }
              if (self.filter.envRelated) {
                if (self.filter.deploy) {
                  self.object.deploy2Configurations.push(objDep);
                  if (!self.filter.envIndependent) {
                    self.object.releasedConfigurations.push(objDep);
                  }
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
export class GitComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  controllerId = '';
  preferences: any;
  data: any;
  operation = '';
  category = '';
  display = false;
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
    this.controllerId = this.modalData.controllerId;
    this.preferences = this.modalData.preferences;
    this.data = this.modalData.data;
    this.operation = this.modalData.operation;
    this.category = this.modalData.category;
    this.display = this.modalData.display;
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
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
        remoteUrl: this.object.remoteUrl,
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
      nzAutofocus: null,
      nzContent: NotificationComponent,
      nzClassName: 'lg',
      nzData: {
        results: this.results,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(() => {
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
  readonly modalData: any = inject(NZ_MODAL_DATA);
  results: any;

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.results = this.modalData.results;
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
export class JsonEditorModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  name = '';
  objectType = '';
  object: any;
  edit = false;
  schedulerId: any;
  preferences: any;
  submitted = false;
  isError = false;
  data: any;
  errorMsg = '';
  options: any = new JsonEditorOptions();

  @ViewChild('editor', {static: false}) editor!: JsonEditorComponent;

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
    this.name = this.modalData.name;
    this.objectType = this.modalData.objectType;
    this.object = this.modalData.object;
    this.edit = this.modalData.edit;
    this.schedulerId = this.modalData.schedulerId;
    this.preferences = this.modalData.preferences;

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
    this.validateByURL(this.editor.get(), () => {
    });
    this.coreService.showCopyMessage(this.message);
    this.clipboardService.copyFromContent(this.editor.getText());
  }

  onSubmit(isForce = false): void {
    this.submitted = true;
    if (isForce) {
      this.activeModal.close(this.editor.get());
    } else {
      this.validateByURL(this.editor.get(), (isValid: boolean) => {
        if (isValid) {
          this.activeModal.close(this.editor.get());
        }
        this.submitted = false;
        this.ref.detectChanges();
      });
    }
  }

  private parseErrorMsg(res: any, cb: any): void {
    let flag = true;
    if (!res.valid) {
      flag = false;
      this.errorMsg = res.invalidMsg;
    }
    this.isError = !flag;
    this.ref.detectChanges();
    cb(flag);
  }

  private validateByURL(json: any, cb: any): void {
    this.coreService.post('inventory/' + this.objectType + '/validate', json).subscribe({
      next: (res: any) => {
        this.parseErrorMsg(res, (flag: boolean) => {
          cb(flag);
        });
      }, error: (err) => {
        cb(err);
      }
    });
  }

}

@Component({
  selector: 'app-create-object-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-object-dialog.html'
})
export class CreateObjectModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  schedulerId: any;
  preferences: any;
  obj: any;
  copy: any;
  restore = false;
  allowPath = false;
  type = '';
  isValid = true;
  submitted = false;
  settings: any = {};
  display: any;
  required = false;
  comments: any = {};
  object = {name: '', type: 'suffix', newName: '', onlyContains: false, originalName: '', suffix: '', prefix: ''};

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId
    this.preferences = this.modalData.preferences
    this.obj = this.modalData.obj
    this.copy = this.modalData.copy
    this.restore = this.modalData.restore;
    this.allowPath = this.modalData.allowPath;
    this.type = this.modalData.type;

    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.restore) {
      this.settings = JSON.parse(sessionStorage['$SOS$RESTORE']);
    } else if (this.copy) {
      this.settings = JSON.parse(sessionStorage['$SOS$COPY']);
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
      const PATH = this.object.name.match(/\//gm) ? this.object.name : this.obj.path + (this.obj.path === '/' ? '' : '/') + this.object.name;
      this.coreService.post('inventory/validate/path', {
        objectType: this.obj.type,
        path: PATH
      }).subscribe({
        next: () => {
          this.activeModal.close({
            name: this.object.name,
            path: PATH,
            comments: this.comments
          });
        }, error: () => {
          this.submitted = false;
          this.ref.detectChanges();
        }
      });
    }
  }

  private paste(obj: any, data: any): void {
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
      request.objectType = this.type == 'DEPLOYMENTDESCRIPTOR' ? 'DESCRIPTORFOLDER' : 'FOLDER';
      request.path = this.copy.path;
      request.newPath = (obj.path || '/') + (data.noFolder ? '' : (obj.path === '/' ? '' : '/') + this.copy.name);
    }

    if (this.type == 'DEPLOYMENTDESCRIPTOR') {
      request.path = this.copy.path;
      delete request.shallowCopy;
    }
    request.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    this.coreService.post(this.type == 'DEPLOYMENTDESCRIPTOR' ? 'descriptor/copy' : 'inventory/copy', request).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => {
        this.submitted = false;
        this.ref.detectChanges();
      }
    });
  }

  private restoreFunc(obj: any, data: any): void {
    const request: any = {
      suffix: data.suffix,
      prefix: data.prefix
    };

    if (this.obj.objectType) {
      request.newPath = this.type == 'DEPLOYMENTDESCRIPTOR' ? (obj.path.substring(0, obj.path.lastIndexOf('/') + 1) + (data.newName ? data.newName : obj.name)) : (obj.path + (obj.path === '/' ? '' : '/') + (data.newName ? data.newName : obj.name));
      request.path = this.type == 'DEPLOYMENTDESCRIPTOR' ? obj.path : (obj.path + (obj.path === '/' ? '' : '/') + obj.name);
      request.objectType = this.obj.objectType;
    } else {
      request.objectType = this.type == 'DEPLOYMENTDESCRIPTOR' ? 'DESCRIPTORFOLDER' : 'FOLDER';
      const tempPath = obj.path.substring(0, obj.path.lastIndexOf('/'));
      request.newPath = data.newName ? (tempPath + (tempPath === '/' ? '' : '/') + data.newName) : obj.path;
      request.path = obj.path;
    }

    request.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    this.coreService.post(this.type ? 'descriptor/trash/restore' : 'inventory/trash/restore', request).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => {
        this.submitted = false;
        this.ref.detectChanges();
      }
    });
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
}

@Component({
  selector: 'app-create-folder-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-folder-dialog.html'
})
export class CreateFolderModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  origin: any;
  type: any;
  deepRename: any;
  rename: any;
  oldName: any;
  display: any;
  submitted = false;
  required = false;
  isUnique = true;
  isValid = true;
  folder = {error: false, name: '', deepRename: 'rename', search: '', replace: ''};
  comments: any = {};

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.origin = this.modalData.origin;
    this.type = this.modalData.type;
    this.deepRename = this.modalData.deepRename;
    this.rename = this.modalData.rename;
    this.oldName = this.modalData.oldName;
    this.display = this.modalData.display;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
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
        objectType: this.type == 'DEPLOYMENTDESCRIPTOR' ? 'DESCRIPTORFOLDER' : 'FOLDER',
        path: PATH,
        configuration: {}
      };
      if (this.comments.comment) {
        obj.auditLog = {};
        this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      }
      if (this.type) {
        delete obj.configuration;
      }
      this.coreService.post(this.type == 'DEPLOYMENTDESCRIPTOR' ? 'descriptor/store' : 'inventory/store', obj).subscribe({
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
        obj.objectType = this.type == 'DEPLOYMENTDESCRIPTOR' ? 'DESCRIPTORFOLDER' : 'FOLDER';
        obj.path = this.origin.path;
      }

      let URL = this.folder.deepRename === 'replace' ? 'inventory/replace' : 'inventory/rename';
      if (this.type == 'DEPLOYMENTDESCRIPTOR') {
        URL = 'descriptor/rename'
        obj.path = this.origin.path;
      }
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

  private getObjectArr(object: any): any {
    const obj: any = {objects: []};
    object.children.forEach((item: any) => {
      if (item.children) {
        item.children.forEach((data: any) => {
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
export class InventoryComponent {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  tree: any = [];
  trashTree: any = [];
  tags: any = [];
  isLoading = true;
  isTagLoaded = true;
  pageView = 'grid';
  options: any = {};
  data: any = {};
  node: any = {};
  copyObj: any;
  selectedObj: any = {};
  selectedData: any = {};
  sideView: any = {};
  securityLevel = '';
  type = '';
  inventoryConfig: any;
  isTreeLoaded = false;
  isTrash = false;
  isTag = false;
  isSearchVisible = false;
  isNavigationComplete = true;
  revalidating = false;
  tempObjSelection: any = {};
  objectType: string | null = '';
  path: string | null = '';
  indexOfNextAdd = 0;
  selectTagName: string;

  allObjects: any = [];
  objectHistory = [];
  searchNode = {
    loading: false,
    token: '',
    text: ''
  }

  private intervalIds: { [objectType: string]: ReturnType<typeof setInterval> } = {}; // Store interval IDs for each objectType
  private searchTerm = new Subject<string>();

  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;
  @ViewChild('menu', {static: true}) menu!: NzDropdownMenuComponent;

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
          this.deployObject(res.deploy, false, null, res.remove || false);
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
        } else if (res.addTag) {
          this.addTags(res.addTag);
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
        } else if (res.updateFromJobTemplate) {
          this.updateFromJobTemplates(res.updateFromJobTemplate);
        }
      }
    });
    this.subscription3 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf(false);
    });

    //200ms Delay in search
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  ngOnInit(): void {
    this.objectType = this.route.snapshot.queryParamMap.get('objectType');
    this.path = this.route.snapshot.queryParamMap.get('path');
    this.initConf(true);
  }

  ngOnDestroy(): void {
    Object.values(this.intervalIds).forEach((intervalId) => {
      clearInterval(intervalId);
    });
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
    this.inventoryConfig.isTag = this.isTag;
    if (this.isTag) {
      this.inventoryConfig.selectTagName = this.selectTagName;
    }
    $('.scroll-y').remove();
  }

  private getAgents(): void {
    this.coreService.getAgents(this.inventoryService, this.schedulerIds.selected);
  }

  initTree(path: string, mainPath: string, redirect = false, recursive= false): void {
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
          this.updateFolders(path, false, recursive, (response: any) => {
            this.updateTree(false);
            if (redirect) {
              if (response) {
                response.expanded = true;
              }
              this.clearSelection();
            }
          }, redirect);
          if (mainPath && path !== mainPath) {
            this.updateFolders(mainPath, false, recursive,() => {
              this.updateTree(false);
            });
          }
        } else {
          if (!isEmpty(this.inventoryConfig.expand_to)) {
            this.tree = this.mergeTree(tree, this.inventoryConfig.expand_to);
            this.inventoryConfig.expand_to = undefined;
            this.selectedObj = this.inventoryConfig.selectedObj || {};
            this.copyObj = this.inventoryConfig.copyObj;
            if (this.inventoryConfig.selectedObj && this.inventoryConfig.selectedObj.path && !this.isTag) {
              this.updateFolders(this.inventoryConfig.selectedObj.path, false, recursive, (response: any) => {
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
            if (!this.isTag) {
              this.selectedObj = this.inventoryConfig.selectedObj;
              if (this.objectType && this.path) {
                this.selectedObj = {
                  name: this.path.substring(this.path.lastIndexOf('/') + 1),
                  path: this.path.substring(0, this.path.lastIndexOf('/')) || '/',
                  type: this.objectType
                };
              }
              this.recursivelyExpandTree();
            }
          } else {
            this.tree = tree;
            if (this.tree.length > 0) {
              this.updateObjects(this.tree[0], false, recursive,(children: any) => {
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

  initTrashTree(path: string): void {
    this.coreService.post('tree', {
      forInventoryTrash: true,
      types: ['INVENTORY']
    }).subscribe({
      next: (res: any) => {
        if (res.folders.length > 0) {
          const tree = this.coreService.prepareTree(res, false);
          if (path) {
            this.trashTree = this.recursiveTreeUpdate(tree, this.trashTree, true);
            this.updateFolders(path, true, false,() => {
              this.updateTree(true);
            });
          } else {
            this.trashTree = tree;
            if (this.trashTree.length > 0) {
              this.trashTree[0].expanded = true;
              this.updateObjects(this.trashTree[0], true, false,(children) => {
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
          this.updateObjects(this.tree[0], this.isTrash, false,(children) => {
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

  private findObjectByPath(path: string): void {
    this.selectedObj.path = path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1);
    const pathArr: any = [];
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
      function traverseTree(data: any) {
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
            self.updateObjects(data, self.isTrash, false,(children: any) => {
              if (children.length > 0) {
                const index = data.children[0] && data.children[0].controller ? 1 : 0;
                data.children.splice(0, index, children[0]);
                data.children.splice(1, index, children[1]);

                const parentNode = (self.selectedObj.type === InventoryObject.SCHEDULE || self.selectedObj.type === InventoryObject.JOBTEMPLATE || self.selectedObj.type === InventoryObject.INCLUDESCRIPT || (self.selectedObj.type && self.selectedObj.type.match(/CALENDAR/))) ? children[1] : children[0];
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

  recursiveTreeUpdate(scr: any, dest: any, isTrash: boolean): any {
    const self = this;
    let isFound = false;

    function recursive(scrTree: any, destTree: any) {
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
        const paths: any = [];

        function traverseTree(data: any): void {
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
        paths.forEach((path: string, index: number) => {
          this.updateFolders(path, false, false, () => {
            if (index == paths.length - 1) {
              this.updateTree(false);
            }
          });
        });
      }
    }
  }

  updateFolders(path: string, isTrash: boolean, recursive: boolean, cb: any, redirect = false): void {
    const self = this;
    let matchData: any;
    if ((!isTrash && this.tree.length > 0) || (isTrash && this.trashTree.length > 0)) {
      function traverseTree(data: any) {
        if (path && data.path && (path === data.path)) {
          self.updateObjects(data, isTrash, recursive,(children: any) => {
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

  openMenu(node: any, evt: any): void {
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
      if (node.isExpanded && !node.origin['controller'] && !node.origin['dailyPlan'] && !node.origin['type'] && !node.origin['object']) {
        this.expandFolder(node);
      }
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.tags, event.previousIndex, event.currentIndex);
    let comments = {};
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        comments = {comment: translatedValue};
      });
    }
    this.coreService.post('tags/ordering', {
      tags: this.tags.map(tag => tag.name),
      auditLog: comments
    }).subscribe()
  }

  selectTag(tag: any, isArray = false, cb?): void {
    if (this.preferences.expandOption === 'both' || isArray) {
      tag.isExpanded = !tag.isExpanded;
    }
    if (tag.isExpanded) {
      tag.loading = true;
    }
    this.selectTagName = tag.name;
    const obj: any = {
      tag: tag.name
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked) {
      obj.controllerId = this.schedulerIds.selected;
    }

    if (tag.isExpanded) {
      this.coreService.post('inventory/read/tag', obj).subscribe({
        next: (res: any) => {
          tag.loading = false;
          tag.children = res.workflows.map(workflow => {
            workflow.path = workflow.path.substring(0, workflow.path.lastIndexOf('/')) || '/';
            return workflow;
          });
          if (cb) {
            cb();
          }
        }, error: () => {
          tag.loading = false;
        }
      });
    } else {
      tag.loading = false;
    }
  }

  selectWorkflow(node, isList): void {
    if (isList) {
      this.type = InventoryObject.WORKFLOW;
    } else {
      node.type = InventoryObject.WORKFLOW;
      this.type = node.type;
      this.selectedData = this.coreService.clone(node);
      this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, '$ID');
    }
  }

  selectNode(node: NzTreeNode | NzFormatEmitEvent): void {
    if (node instanceof NzTreeNode) {
      if ((!node.origin['object'] && !node.origin['type'])) {
        if (!node.origin['type'] && !node.origin['object'] && !node.origin['controller'] && !node.origin['dailyPlan']) {
          node.isExpanded = !node.isExpanded;
          if (node.isExpanded) {
            this.expandFolder(node);
          }
        } else if (node.origin['controller'] || node.origin['dailyPlan']) {
          node.isExpanded = !node.isExpanded;
        }
        return;
      }
      if (this.preferences.expandOption === 'both' && !node.origin['type']) {
        node.isExpanded = !node.isExpanded;
      }
      this.type = node.origin['objectType'] || node.origin['object'] || node.origin['type'];
      this.selectedData = node.origin;
      this.setSelectedObj(this.type, this.selectedData.name, this.selectedData.path, node.origin['objectType'] ? '$ID' : undefined);
    }
  }

  updateObjects(data: any, isTrash: boolean, recursive: boolean, cb, isExpandConfiguration: boolean, extraCb?): void {
    if (!data.permitted) {
      if (cb) {
        cb([]);
      }
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
        if (recursive) {
          data.children.forEach((item) => {
            if (!item.controller && !item.dailyPlan) {
              if (item.expanded) {
                this.updateObjects(item, isTrash, recursive, null, isExpandConfiguration, (children) => {
                  if (children.length > 0) {
                    let folders = item.children;
                    if (item.children.length > 1 && item.children[0].controller) {
                      const index = item.children[0].controller ? 1 : 0;
                      const index2 = item.children[1].dailyPlan ? 1 : 0;
                      item.children.splice(0, index, children[0]);
                      item.children.splice(1, index2, children[1]);
                    } else {
                      item.children = children;
                      if (folders.length > 0 && !folders[0].controller) {
                        item.children = item.children.concat(folders);
                      }
                    }
                  }
                  this.updateTree(isTrash);
                });
              }
            }
          })
        }
        if (cb) {
          cb(conf);
        } else if(extraCb){
          extraCb(conf);
        }
      }, error: () => {
        if (cb) {
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
      }
    });
  }

  treeSearch(): void {
    $('#treeSearch').focus();
    $('.editor-tree > a').addClass('hide-on-focus');
  }

  onSearchInput(searchValue: string) {
    if (!this.isTrash && !this.isTag) {
      this.searchTerm.next(searchValue);
    }
  }

  private searchObjects(value: string) {
    if (value !== '') {
      const searchValueWithoutSpecialChars = value.replace(/[^\w\s]/gi, '');
      if (searchValueWithoutSpecialChars.length >= 2) {
        this.searchNode.loading = true;

        const request: any = {
          search: value
        };
        if (value.includes(":")) {
          const arr = value.split(":");
          const qualifiers = arr[0];
          request.search = arr[1];
          if (qualifiers?.trim().length == 1) {
            let char = getReturnType(qualifiers);
            if (char) {
              request.returnTypes = [char]
            }
          } else {
            let chars = qualifiers.split('');
            if (chars.length > 0) {
              request.returnTypes = [];
              chars.forEach(char => {
                const type = getReturnType(char);
                if (type) {
                  request.returnTypes.push(type)
                }
              })
            }
          }
        }
        if (this.searchNode.token) {
          request.token = this.searchNode.token;
        }
        this.coreService.post('inventory/quick/search', request).subscribe({
          next: (res: any) => {
            this.searchNode.token = res.token;
            if (res.results?.length == 0) {
              this.allObjects = [];
            } else {
              this.updateData(res.results);
            }
            this.searchNode.loading = false;
          }, error: () => this.searchNode.loading = false
        });
      }
    } else {
      this.allObjects = [];
    }

    function getReturnType(qualifier: string): string {
      qualifier = qualifier.toLowerCase();
      if (qualifier === 'w') {
        return "WORKFLOW";
      } else if (qualifier === 'f') {
        return "FILEORDERSOURCE";
      } else if (qualifier === 'r') {
        return "JOBRESOURCE";
      } else if (qualifier === 'b') {
        return "NOTICEBOARD";
      } else if (qualifier === 'l') {
        return "LOCK";
      } else if (qualifier === 'i') {
        return "INCLUDESCRIPT";
      } else if (qualifier === 's') {
        return "SCHEDULE";
      } else if (qualifier === 'c') {
        return "CALENDAR";
      } else if (qualifier === 't') {
        return "JOBTEMPLATE";
      }
      return '';
    }
  }

  orderKeys(object: any): string[] {
    const order = [
      'WORKFLOW',
      'JOBRESOURCE',
      'SCHEDULE',
      'NOTICEBOARD',
      'LOCK',
      'FILEORDERSOURCE',
      'JOBTEMPLATE',
      'INCLUDESCRIPT',
      'WORKINGDAYSCALENDAR'
    ];
    return Object.keys(object).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }

  private updateData(data: any[]): void {
    // Clear existing intervals if any
    Object.values(this.intervalIds).forEach((intervalId) => {
      clearInterval(intervalId);
    });
    const x = groupBy(data, (res) => {
      return res.objectType;
    });

    const objectTypes = Object.keys(x);
    const batchSize = 100;
    const delay = 100;
    const updatedAllObjects: { [objectType: string]: any[] } = {};

    objectTypes.forEach((objectType) => {
      const subObjects = x[objectType];
      let index = 0;
      const intervalId = setInterval(() => {
        const batch = subObjects.slice(index, index + batchSize);
        if (!updatedAllObjects[objectType]) {
          updatedAllObjects[objectType] = [];
        }
        updatedAllObjects[objectType].push(...batch);
        index += batchSize;
        if (index >= subObjects.length) {
          clearInterval(intervalId);
          this.allObjects = updatedAllObjects;
        }
      }, index == 0 ? 0 : delay);
      this.intervalIds[objectType] = intervalId;
    });
  }

  clearSearchInput(): void {
    this.allObjects = [];
    this.searchNode.text = '';
    $('.editor-tree > a').removeClass('hide-on-focus');
  }

  selectObject(item: any): void {
    this.isNavigationComplete = false;
    if (item.objectType && item.path && item.objectType !== 'FOLDER') {
      this.selectedObj = {
        name: item.name,
        path: item.path.substring(0, item.path.lastIndexOf('/')) || '/',
        type: item.objectType
      };
    }
    this.recursivelyExpandTree();
    setTimeout(() => {
      this.allObjects = [];
      this.searchNode.text = '';
      $('#treeSearch').blur();
      //$('.editor-tree > a').removeClass('hide-on-focus');
    }, 10);
  }

  switchToTagging(): void {
    this.inventoryConfig.selectedIndex = 1;
    this.isTag = true;
    this.isTrash = false;
    this.isTagLoaded = false;
    if (this.type) {
      this.tempObjSelection = {
        type: clone(this.type),
        selectedData: this.coreService.clone(this.selectedData),
        selectedObj: clone(this.selectedObj)
      };
    }
    this.type = '';
    this.coreService.post('tags', {}).subscribe({
      next: (res) => {
        this.tags = res.tags.map((tag) => {
          return {name: tag, children: []}
        });
        for (let i in this.tags) {
          if (this.inventoryConfig.selectTagName === this.tags[i].name) {
            this.selectTag(this.tags[i], false, () => {
              if (this.tags[i].children?.length > 0) {
                for (let j in this.tags[i].children) {
                  if (this.tags[i].children[j].name == this.inventoryConfig.selectedObj.name) {
                    this.selectWorkflow(this.tags[i].children[j], false);
                    break;
                  }
                }
              }
            });
            break;
          }
        }
        this.clearSelection();
        this.isTagLoaded = true;
      }, error: () => {
        this.isTagLoaded = true;
      }
    });
  }

  private updateTags(): void {
    this.coreService.post('tags', {}).subscribe({
      next: (res) => {
        const _tags = this.coreService.clone(this.tags);
        this.tags = res.tags.map((tag) => {
          const obj: any = {
            name: tag, children: []
          };
          for (let i = 0; i < _tags.length; i++) {
            if (_tags[i].name === tag) {
              obj.isExpanded = _tags[i].isExpanded;
              if (obj.isExpanded) {
                obj.children = _tags[i].children;
              }
              _tags.splice(i, 1);
              break;
            }
          }
          return obj;
        });
      }
    });
  }

  switchToTrash(isTrash): void {
    this.isTag = false;
    this.trashTree = [];
    this.isTrash = isTrash;
    if (this.isTrash) {
      this.isTreeLoaded = false;
      this.initTrashTree('');
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

  mergeTree(scr: any, dest: any): any {
    function checkPath(obj: any) {
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

    function recursive(scrTree: any) {
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

  addObject(data: any, type: string): void {
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
      this.updateObjects(node.origin, false, false, (children: any) => {
        if (children.length > 0) {
          if ((type.match('CALENDAR') || type === InventoryObject.SCHEDULE || type === InventoryObject.JOBTEMPLATE || type === InventoryObject.INCLUDESCRIPT)) {
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
      nzData: {
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
            this.initTree(origin.path, '', false, true);
          }
        }, 750);
      }
    });
  }

  gitClone(data: any, category: string): void {
    this.openGitModal(data, category, 'clone');
  }

  gitPull(data: any, category: string): void {
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
        nzData: {
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

  private _gitPull(data: any, category: string, auditLog: any): void {
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

  private showResult(result: any): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: NotificationComponent,
      nzClassName: 'lg',
      nzData: {
        results: [result],
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  gitPush(data: any, category: string): void {
    this.openGitModal(data, category, 'push');
  }

  private openGitModal(data: any, category: string, operation: string): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: GitComponent,
      nzAutofocus: null,
      nzData: {
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
        this.initTree(data.path, '');
      }
    })
  }

  exportObject(node: any): void {
    let origin = null;
    if (node) {
      origin = node.origin ? node.origin : node;
    }
    this.modal.create({
      nzTitle: undefined,
      nzContent: ExportComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
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
    this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        type: 'INVENTORY',
        display: this.preferences.auditLog
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  importDeploy(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        type: 'INVENTORY',
        schedulerIds: this.schedulerIds,
        display: this.preferences.auditLog,
        isDeploy: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  convertJob(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        type: 'CRON',
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
            this.initTree(path, '', true, false);
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
      nzData: {
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
        this.initTree(node.origin.path, '');
      }
    });
  }

  private getAllowedControllerOnly(): any {
    const obj = clone(this.schedulerIds);
    obj.controllerIds = obj.controllerIds.filter((id: any) => {
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

  deployObject(node, releasable, operation?, isRemoved = false, skip = true): void {
    const origin = this.coreService.clone(node.origin ? node.origin : node);
    if (this.selectedObj && this.selectedObj.id &&
      this.selectedObj.type === InventoryObject.WORKFLOW && skip) {
      this.dataService.reloadTree.next({saveObject: origin});
      setTimeout(() => {
        this.deployObject(node, releasable, operation, isRemoved, false);
      }, 750)
      return;
    }
    let flag = false;
    if (releasable && origin.objectType) {
      if ((!origin.objectType.match(/CALENDAR/) && origin.objectType !== InventoryObject.SCHEDULE) || operation == 'recall') {
        this.releaseSingleObject(origin, operation);
        return;
      } else {
        flag = true;
      }
    }

    if (origin.type || flag || this.inventoryService.isControllerObject(origin.objectType)) {
      if (!node.origin) {
        if (origin.configuration) {
          origin.path = origin.path.substring(0, origin.path.lastIndexOf('/')) || '/';
        }
      }
      this.modal.create({
        nzTitle: undefined,
        nzContent: SingleDeployComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerIds: this.getAllowedControllerOnly(),
          display: this.preferences.auditLog,
          data: origin,
          releasable,
          isRemoved,
          isChecked: this.inventoryService.checkDeploymentStatus.isChecked
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          const object = node.origin ? node.origin : node;
          const obj = this.getObjectArr(object, false);
          obj.cancelOrdersDateFrom = result.cancelOrdersDateFrom;
          obj.auditLog = result.auditLog;
          this.coreService.post('inventory/remove', obj).subscribe(() => {
            this.clearCopyObject(object);
            if (this.selectedData.name === object.name && this.selectedData.path === object.path && this.selectedData.objectType === object.objectType) {
              this.clearSelection();
            }
          });
        }
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: DeployComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerIds: this.getAllowedControllerOnly(),
          preferences: this.preferences,
          display: this.preferences.auditLog,
          path: origin.path,
          data: origin,
          isChecked: this.inventoryService.checkDeploymentStatus.isChecked,
          isRemove: isRemoved,
          releasable,
          operation
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          const object = node.origin;
          const obj = this.getObjectArr(object, false);
          let path;
          if (object.type) {
            path = object.path + (object.path === '/' ? '' : '/') + object.name;
          } else {
            path = object.path;
          }
          obj.cancelOrdersDateFrom = result.cancelOrdersDateFrom;
          obj.auditLog = result.auditLog;
          if (!object.type && !object.object && !object.controller && !object.dailyPlan) {
            this.deleteObject(path, object, node, obj.auditLog, result.cancelOrdersDateFrom);
          } else {
            this.coreService.post('inventory/remove', obj).subscribe(() => {
              this.clearCopyObject(object);
              if (this.selectedData.name === object.name && this.selectedData.path === object.path && this.selectedData.objectType === object.objectType) {
                this.clearSelection();
              }
            });
          }
        }
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
        nzClassName: 'lg',
        nzData: {
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
        nzData: {
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
        nzData: {
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
        nzData: {
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
        nzData: obj,
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
    this.updateFolders(data.path, false, false, () => {
      this.updateTree(false);
    });
  }

  showJson(obj: any): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      objectType: obj.showJson.objectType,
      path: (obj.showJson.path + (obj.showJson.path === '/' ? '' : '/') + obj.showJson.name)
    }).subscribe((res: any) => {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: JsonEditorModalComponent,
        nzAutofocus: null,
        nzClassName: 'lg',
        nzData: {
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
      nzData: {
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

  updateFromJobTemplates(workflow): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateJobTemplatesComponent,
      nzClassName: 'lg',
      nzData: {
        preferences: this.preferences,
        treeObj: workflow
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result && this.selectedData && this.selectedData.type === 'WORKFLOW') {
        if ((this.selectedData.name === workflow.name && this.selectedData.path === workflow.path)) {
          this.selectedData.reload = true;
        } else if (isArray(result)) {
          if (result.length > 0) {
            const PATH = this.selectedData.path + (this.selectedData.path === '/' ? '' : '/') + this.selectedData.name;
            for (let i in result) {
              if (PATH === result[i].path) {
                this.selectedData.reload = true;
                break;
              }
            }
          }
        }
      }
    })
  }

  updateJobs(object): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateJobTemplatesComponent,
      nzClassName: 'lg',
      nzData: {
        preferences: this.preferences,
        object: object.type ? undefined : object,
        data: object.type ? object : undefined
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  editJson(data: any, isEdit: boolean): void {
    this.showJson({showJson: data, edit: isEdit});
  }

  importJSON(obj: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzData: {
        type: 'INVENTORY_OBJECT',
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
    if (type === 'CALENDAR') {
      if (this.selectedData && this.selectedData.objectType && this.selectedData.objectType.match('CALENDAR')) {
        type = this.selectedData.objectType;
      }
    }

    if (obj.path && obj.name) {
      const  URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
      this.coreService.post(URL, {
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
        nzData: {
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
            nzData: {
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
      this.updateFolders(this.copyObj.path, false, false, () => {
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

    if ((object.object === InventoryObject.INCLUDESCRIPT || object.object === InventoryObject.FILEORDERSOURCE ||
      object.object === InventoryObject.LOCK || object.object === InventoryObject.JOBRESOURCE || object.object === InventoryObject.JOBTEMPLATE ||
      object.object === InventoryObject.NOTICEBOARD) || (object.type === InventoryObject.INCLUDESCRIPT || object.type === InventoryObject.FILEORDERSOURCE ||
      object.type === InventoryObject.LOCK || object.type === InventoryObject.JOBRESOURCE || object.type === InventoryObject.JOBTEMPLATE ||
      object.type === InventoryObject.NOTICEBOARD)) {
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
          nzData: {
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
              object.deleted = true;
              object.loading = true;
              this.coreService.post('inventory/remove', obj).subscribe({
                next: () => {
                  object.loading = false;
                  this.clearCopyObject(object);
                  if (this.selectedData.name === object.name && this.selectedData.path === object.path && this.selectedData.objectType === object.objectType) {
                    this.clearSelection();
                  }
                }, error: () => {
                  object.deleted = false;
                  object.loading = false;
                }
              });
            }
          }
        });
      } else {
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: ConfirmModalComponent,
          nzData: {
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
              object.deleted = true;
              object.loading = true;
              this.coreService.post('inventory/remove', obj).subscribe({
                next: () => {
                  object.loading = false;
                  this.clearCopyObject(object);
                  if (this.selectedData.name === object.name && this.selectedData.path === object.path && this.selectedData.objectType === object.objectType) {
                    this.clearSelection();
                  }
                }, error: () => {
                  object.deleted = false;
                  object.loading = false;
                }
              });
            }
          }
        });
      }
    } else {
      const isController = object.object === InventoryObject.WORKFLOW || object.type === InventoryObject.WORKFLOW || !!object.controller;
      this.deployObject(node, !isController, null, true);
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
        operation: 'Revert Draft',
        name: object.name || object.path
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
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
        nzData: {
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
        if (object.type.match(/CALENDAR/) || object.type === InventoryObject.SCHEDULE || object.type === InventoryObject.JOBTEMPLATE || object.type === InventoryObject.INCLUDESCRIPT) {
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
        nzData: {
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
        nzData: {
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

  revalidateObject(node: any): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Folder',
        operation: 'Revalidate',
        name: node.origin.name
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          let auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          };
          this.revalidate({path: node.origin.path, recursive: true, auditLog})
        }
      });
    } else {
      this.revalidate({path: node.origin.path, recursive: true})
    }
  }

  private revalidate(obj) {
    this.revalidating = true;
    this.coreService.post('inventory/revalidate/folder',
      obj).subscribe({
      next: (res) => {
        this.revalidating = false;
        this.modal.create({
          nzTitle: undefined,
          nzContent: ShowObjectsComponent,
          nzClassName: 'lg',
          nzData: {
            data: res,
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        }).afterClose.subscribe((result) => {
          if (result) {
            this.onNavigate(result)
          }
        })
      }, error: () => {
        this.revalidating = false;
      }
    })
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
      nzData: {
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
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (!this.permission.joc) {
      setTimeout(() => {
        this.initConf(isReload);
      }, 50);
      return;
    }
    if (this.coreService.expertMode == undefined || this.coreService.expertMode == null) {
      this.coreService.expertMode = this.preferences.showMoreOptions;
    }
    this.getAgents();
    this.securityLevel = sessionStorage['securityLevel'];
    if (isReload) {
      this.sideView = this.coreService.getSideView();
      if (this.sideView.inventory && !this.sideView.inventory.show) {
        this.hidePanel();
      }
      this.inventoryConfig = this.coreService.getConfigurationTab().inventory;
      this.isTrash = this.inventoryConfig.isTrash;
      this.isTag = this.inventoryConfig.isTag;

      this.initTree(null, null);

      if (this.isTrash) {
        this.clearSelection();
        this.initTrashTree(null);
      } else if (this.isTag) {
        this.isLoading = false;
        this.switchToTagging();
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
    this.updateObjects(node.origin, this.isTrash, false, (children) => {
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
      const index = (this.selectedObj.type.match('CALENDAR') || this.selectedObj.type === InventoryObject.SCHEDULE || this.selectedObj.type === InventoryObject.JOBTEMPLATE || this.selectedObj.type === InventoryObject.INCLUDESCRIPT) ? 1 : 0;
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

  private releaseSingleObject(data, operation?): void {
    const PATH = data.path1 ? ((data.path1 + (data.path1 === '/' ? '' : '/') + data.name)) : ((data.path + (data.path === '/' ? '' : '/') + data.name));
    let obj: any = {};
    if (operation === 'release') {
      if (data.deleted) {
        obj.delete = [{objectType: data.objectType, path: PATH}];
      } else {
        obj.update = [{objectType: data.objectType, path: PATH}];
      }
    } else {
      obj.releasables = [{objectType: data.objectType, path: data.name}];
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
        nzData: {
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

  private releaseRecallOperation(operation, obj): void {
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

    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
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
            this.updateObjects(node.origin, false, false, (children) => {
              if (children.length > 0) {
                if (res.objectType !== 'FOLDER' && this.copyObj.type) {
                  if ((this.copyObj.type === 'CALENDAR' || this.copyObj.type === InventoryObject.SCHEDULE || this.copyObj.type === InventoryObject.JOBTEMPLATE || this.copyObj.type === InventoryObject.INCLUDESCRIPT)) {
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
            if (this.copyObj.type === 'CALENDAR' || this.copyObj.type === InventoryObject.SCHEDULE || this.copyObj.type === InventoryObject.JOBTEMPLATE || this.copyObj.type === InventoryObject.INCLUDESCRIPT) {
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
      nzData: {
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
    this.coreService.post('tree', obj).subscribe({
      next: (res: any) => {
        const tree = this.coreService.prepareTree(res, false);
        if (isTrash) {
          this.trashTree = this.recursiveTreeUpdate(tree, this.trashTree, true);
        } else {
          this.tree = this.recursiveTreeUpdate(tree, this.tree, false);
        }
      }
    });
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    let loadTree = false;
    let _isNormal = false;
    let _isTrash = false;
    let paths = [];
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentInventoryUpdated' && args.eventSnapshots[j].objectType === 'AGENT') {
          this.getAgents();
        }
        if (args.eventSnapshots[j].eventType.match(/InventoryTagsUpdated/) || args.eventSnapshots[j].eventType.match(/InventoryTagAdded/)) {
          if (this.isTag) {
            this.updateTags();
          }
        } else if (args.eventSnapshots[j].path) {
          if (this.isTag && args.eventSnapshots[j].eventType.match(/InventoryTaggingUpdated/)) {
            if (this.isTag) {
              this.fetchWorkflowTags(args.eventSnapshots[j].path);
            }
          }
          if (args.eventSnapshots[j].eventType.match(/InventoryTagDeleted/)) {
            if (this.isTag) {
              if (this.selectTagName == args.eventSnapshots[j].path) {
                this.selectTagName = null;
                this.type = null;
              }
            }
          } else if (args.eventSnapshots[j].eventType.match(/Inventory/)) {
            const isTrash = args.eventSnapshots[j].eventType.match(/Trash/);
            if (!this.isTrash && isTrash) {
            } else {
              if (args.eventSnapshots[j].eventType.match(/InventoryTreeUpdated/) || args.eventSnapshots[j].eventType.match(/InventoryTrashTreeUpdated/)) {
                paths.push(args.eventSnapshots[j].path);
                loadTree = true;
                if (!_isTrash && this.isTrash) {
                  _isTrash = isTrash;
                }
                if (args.eventSnapshots[j].eventType.match(/InventoryTreeUpdated/)) {
                  _isNormal = true;
                }
              } else if (args.eventSnapshots[j].eventType.match(/InventoryUpdated/) || args.eventSnapshots[j].eventType.match(/InventoryTrashUpdated/)) {
                paths = paths.filter((path) => {
                  return path !== args.eventSnapshots[j].path;
                });
                this.updateFolders(args.eventSnapshots[j].path, isTrash, true, () => {
                  this.updateTree(isTrash);
                });
              }
            }
          }
        }
      }
    }

    if (loadTree) {
      if (_isTrash) {
        this.reloadTree(_isTrash);
      }
      if (_isNormal) {
        this.reloadTree(false);
      }
      if (paths.length > 0) {
        paths.forEach((path, index) => {
          if (_isTrash) {
            this.updateFolders(path, _isTrash, false, () => {
              if (index == paths.length - 1) {
                this.updateTree(_isTrash);
              }
            });
          }
          if (_isNormal) {
            this.updateFolders(path, false, true, () => {
              if (index == paths.length - 1) {
                this.updateTree(false);
              }
            });
          }
        });
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

    if (flag && this.selectedObj.id) {
      if (this.objectHistory.length === 20) {
        this.objectHistory.shift();
      }
      this.objectHistory.push(this.coreService.clone(this.selectedObj));
      ++this.indexOfNextAdd;
    }
  }

  private fetchWorkflowTags(path): void {
    this.coreService.post('inventory/workflow/tags', {path}).subscribe((res) => {
      for (let i in this.tags) {
        if (this.tags[i].isExpanded && res.tags.indexOf(this.tags[i].name) > -1) {
          this.tags[i].isExpanded = false;
          this.selectTag(this.tags[i], true);
        }
      }
    });
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

  private createObject(type: string, list: any[], path: string): void {
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
      nzData: {
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
          configuration = {
            controllerId: this.schedulerIds.selected,
            planOrderAutomatically: true,
            submitOrderToControllerWhenPlanned: true
          };
        } else if (type === InventoryObject.LOCK) {
          configuration = {limit: 1, id: res.name};
        } else if (type === InventoryObject.FILEORDERSOURCE) {
          configuration = {delay: 2};
        } else if (type === InventoryObject.WORKINGDAYSCALENDAR || type === InventoryObject.NONWORKINGDAYSCALENDAR) {
          configuration = {type};
        }
        this.storeObject(obj, list, configuration, res.comments);
      }
    });
  }

  private storeObject(obj: any, list: any[], configuration: any, comments: any = {}): void {
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

  addTags(node?): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: CreateTagModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        preferences: this.preferences,
        data: node?.origin || node
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  deleteTag(tag): void {
    const obj: any = {
      tags: [tag.name]
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Tag',
        operation: 'Delete',
        name: tag.name
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
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
          this._deleteTag(obj, tag.name);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'delete',
          message: 'deleteTag',
          type: 'Delete',
          objectName: tag.name
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteTag(obj, tag.name);
        }
      });
    }
  }

  private _deleteTag(obj, tagName): void {
    this.coreService.post('tags/delete', obj).subscribe(() => {
      this.tags = this.tags.filter(tag => {
        if (this.selectTagName == tagName) {
          this.selectTagName = null;
          this.type = null;
        }
        return tag.name != tagName;
      })
    });
  }

  renameTag(tag): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: CreateTagModalComponent,
      nzAutofocus: null,
      nzData: {
        preferences: this.preferences,
        tag: tag,
        isRename: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((res) => {
      if (res) {
        tag.name = res;
      }
    });
  }


  private deleteObject(path: string, object: any, node: any, auditLog: any, cancelOrdersDateFrom = undefined): void {
    object.expanded = false;
    object.deleted = true;
    object.loading = true;
    this.coreService.post('inventory/remove/folder', {path, auditLog, cancelOrdersDateFrom}).subscribe({
      next: () => {
        object.loading = false;
        if (node && node.parentNode && node.parentNode.origin) {
          node.parentNode.origin.children = node.parentNode.origin.children.filter((child: any) => {
            return child.path !== path;
          });
        }
        this.clearCopyObject(object);
        if (this.selectedObj && path === this.selectedObj.path) {
          this.clearSelection();
        }
        this.updateTree(false);
      }, error: () => {
        object.loading = false;
        object.deleted = false;
      }
    });
  }

  private getObjectArr(object: any, isDraft: boolean): any {
    let obj: any = {objects: []};
    if (!object.type) {
      if (object.object || object.controller || object.dailyPlan) {
        object.children.forEach((item: any) => {
          if (item.children) {
            item.children.forEach((data: any) => {
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

  private updateTree(isTrash: boolean): void {
    this.isNavigationComplete = true;
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

  private clearCopyObject(obj: any): void {
    if ((this.selectedData && this.selectedData.type === obj.type && this.selectedData.name === obj.name
      && this.selectedData.path === obj.path)) {
      this.clearSelection();
    }
    if (this.copyObj && this.copyObj.type === obj.type && this.copyObj.name === obj.name && this.copyObj.path === obj.path) {
      this.copyObj = undefined;
    }
  }

  private clearSelection(): void {
    this.type = '';
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
