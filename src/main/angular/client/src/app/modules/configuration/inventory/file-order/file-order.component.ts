import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {isEmpty, isEqual, sortBy} from 'underscore';
import {debounceTime} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {InventoryObject} from '../../../../models/enums';
import {InventoryService} from '../inventory.service';

@Component({
  selector: 'app-file-order',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-order.component.html'
})
export class FileOrderComponent implements OnChanges, OnInit, OnDestroy {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  invalidMsg: string;
  zones = [];
  agents = [];
  notFound: string;
  workflowTree = [];
  fileOrder: any = {};
  objectType = InventoryObject.FILEORDERSOURCE;
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  subscription1: Subscription;
  subscription2: Subscription;

  private subject: Subject<string> = new Subject<string>();
  @ViewChild('treeSelectCtrl', {static: false}) treeCtrl;

  constructor(public coreService: CoreService, private dataService: DataService, private translate: TranslateService,
              public inventoryService: InventoryService, private ref: ChangeDetectorRef) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.fileOrder.actual) {
          this.ref.detectChanges();
        }
      }
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'REDO') {
        this.redo();
      } else if (res === 'UNDO') {
        this.undo();
      }
    });
    this.subject.pipe(
      debounceTime(250)
    ).subscribe(searchTextValue => {
      this.checkWorkflowExist(searchTextValue);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.copyObj && !changes.data) {
      return;
    }
    if (changes.reload) {
      if (changes.reload.previousValue === true && changes.reload.currentValue === false) {
        return;
      }
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.fileOrder = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnInit(): void {
    this.zones = this.coreService.getTimeZoneList();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subject.complete();
    if (this.fileOrder.name) {
      this.saveJSON();
    }
  }

  private getAgents(): void {
    if (this.agents.length === 0) {
      this.coreService.post('agents/names', {controllerId: this.schedulerId}).subscribe((res: any) => {
        this.agents = res.agentNames ? res.agentNames.sort() : [];
        this.checkIsAgentExist();
      });
    } else {
      this.checkIsAgentExist();
    }
  }

  private checkIsAgentExist(): void {
    if (this.notFound) {
      this.agents = this.agents.filter((item) => {
        return item !== this.notFound;
      });
    }
    if (this.fileOrder.configuration.agentName) {
      let isFound = false;
      for (const i in this.agents) {
        if (this.agents[i] === this.fileOrder.configuration.agentName) {
          isFound = true;
          break;
        }
      }
      if (!isFound) {
        this.notFound = this.fileOrder.configuration.agentName;
        this.agents.push(this.fileOrder.configuration.agentName);
      }
    }
    this.ref.detectChanges();
  }

  private getWorkflows(): void {
    if (this.workflowTree.length === 0) {
      this.coreService.post('tree', {
        controllerId: this.schedulerId,
        forInventory: true,
        types: [InventoryObject.WORKFLOW]
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, true);
      });
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    const obj: any = {
      id: this.data.id
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked && !this.isTrash) {
      obj.controllerId = this.schedulerId;
    }
    this.coreService.post(URL, obj).subscribe((res: any) => {
      this.history = [];
      this.indexOfNextAdd = 0;
      this.getDocumentations();
      if (res.configuration) {
        delete res.configuration.TYPE;
        delete res.configuration.path;
        delete res.configuration.version;
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }
      if (this.data.deployed !== res.deployed) {
        this.data.deployed = res.deployed;
      }
      if (this.data.valid !== res.valid) {
        this.data.valid = res.valid;
      }
      this.data.syncState = res.syncState;
      if (res.configuration.directoryExpr) {
        this.coreService.removeSlashToString(res.configuration, 'directoryExpr');
      }
      this.fileOrder = res;
      this.fileOrder.path1 = this.data.path;
      this.fileOrder.name = this.data.name;
      this.fileOrder.actual = JSON.stringify(res.configuration);
      this.history.push(this.fileOrder.actual);
      if (!this.fileOrder.configuration.timeZone) {
        this.fileOrder.configuration.timeZone = this.preferences.zone;
      }
      this.getAgents();
      this.getWorkflows();
      if (!res.valid) {
        if (!this.fileOrder.configuration.workflowName) {
          this.invalidMsg = 'inventory.message.workflowIsMissing';
        } else if (!this.fileOrder.configuration.agentName) {
          this.invalidMsg = 'workflow.message.agentIsMissing';
        } else if (!this.fileOrder.configuration.directoryExpr) {
          this.invalidMsg = 'inventory.message.directoryIsMissing';
        } else {
          this.validateJSON(res.configuration);
        }
      } else {
        this.invalidMsg = '';
      }
      this.ref.detectChanges();
    });
  }

  private validateJSON(json): void {
    const obj = this.coreService.clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.fileOrder.valid = res.valid;
      if (this.fileOrder.id === this.data.id) {
        if (this.data.valid !== res.valid) {
          this.saveJSON(true, true);
        }
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      this.invalidMsg = res.invalidMsg;
      if (res.invalidMsg.match('workflowName')) {
        this.invalidMsg = 'inventory.message.workflowIsMissing';
      } else if (res.invalidMsg.match('agentName')) {
        this.invalidMsg = 'workflow.message.agentIsMissing';
      } else if (res.invalidMsg.match('directoryExpr: is missing but it is required')) {
        this.invalidMsg = 'inventory.message.directoryIsMissing';
      }
    }
    this.ref.detectChanges();
  }

  rename(inValid): void {
    if (this.data.id === this.fileOrder.id && this.data.name !== this.fileOrder.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.fileOrder.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe({
          next: () => {
            if (data.id === this.data.id) {
              this.data.name = name;
            }
            data.name = name;
            this.dataService.reloadTree.next({rename: data});
          }, error: () => {
            this.fileOrder.name = this.data.name;
            this.ref.detectChanges();
          }
        });
      } else {
        this.fileOrder.name = this.data.name;
        this.ref.detectChanges();
      }
    }
  }

  private getDocumentations(): void {
    if (this.documentationTree.length === 0 && this.permission.joc.documentations.view) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
  }

  loadData(node, type, $event, reload = false): void {
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

        this.updateList(node, type, reload);
      }
    } else {
      if (type === 'DOCUMENTATION') {
        if (this.fileOrder.configuration.documentationName1) {
          if (this.fileOrder.configuration.documentationName !== this.fileOrder.configuration.documentationName1) {
            this.fileOrder.configuration.documentationName = this.fileOrder.configuration.documentationName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.fileOrder.configuration.documentationName !== node.key) {
            this.fileOrder.configuration.documentationName = node.key;
          }
        }
      } else {
        if (this.fileOrder.configuration.workflowName1) {
          if (this.fileOrder.configuration.workflowName !== this.fileOrder.configuration.workflowName1) {
            this.fileOrder.configuration.workflowName = this.fileOrder.configuration.workflowName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.fileOrder.configuration.workflowName !== node.key) {
            this.fileOrder.configuration.workflowName = node.key;
          }
        }
      }
      setTimeout(() => {
        this.saveJSON();
      }, 10);
    }
  }

  updateList(node, type, reload): void {
    let obj: any = {
      path: node.key,
      objectTypes: [type]
    };
    if (type === 'DOCUMENTATION') {
      if (!this.permission.joc.documentations.view) {
        return;
      }
      obj = {
        folders: [{folder: node.key, recursive: false}],
        onlyWithAssignReference: true
      };
    }
    const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      let data = res.workflows || res.documentations;
      data = sortBy(data, (i: any) => {
        return i.name.toLowerCase();
      });
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
      } else {
        this.workflowTree = [...this.workflowTree];
        if (reload) {
          const text = this.treeCtrl.inputValue;
          if (text) {
            this.treeCtrl.nzSelectSearchComponent.onValueChange(text + 1);
            setTimeout(() => {
              this.treeCtrl.nzSelectSearchComponent.onValueChange(text);
            }, 0);
          }
        }
      }
      this.ref.detectChanges();
    });
  }

  onKeyPressFunc($event): void {
    this.subject.next($event.target.value);
  }

  private checkWorkflowExist(name): void {
    this.coreService.post('inventory/path', {
      name,
      objectType: InventoryObject.WORKFLOW
    }).subscribe((res: any) => {
      this.loadWorkflowList(res.path);
    });
  }

  private loadWorkflowList(path): void {
    const node = this.treeCtrl.getTreeNodeByKey(path.substring(0, path.lastIndexOf('/')) || '/');
    if (node && node.origin) {
      this.loadData(node, 'WORKFLOW', null, true);
    }
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  deploy(): void {
    this.dataService.reloadTree.next({deploy: this.fileOrder});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.fileOrder});
  }

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    const n = this.history.length;
    if (this.indexOfNextAdd < n) {
      const obj = this.history[this.indexOfNextAdd++];
      this.fileOrder.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  /**
   * Function: undo
   *
   * Undoes the last change.
   */
  undo(): void {
    if (this.indexOfNextAdd > 0) {
      const obj = this.history[--this.indexOfNextAdd];
      this.fileOrder.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  navToWorkflow(): void {
    this.dataService.reloadTree.next({
      navigate: {
        name: this.fileOrder.configuration.workflowName,
        type: InventoryObject.WORKFLOW
      }
    });
  }

  changeValue($event, type): void {
    this.fileOrder.configuration[type] = $event;
    this.saveJSON();
  }

  saveJSON(flag = false, skip = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if (skip || (this.fileOrder.actual && !isEqual(this.fileOrder.actual, JSON.stringify(this.fileOrder.configuration)))) {
      let isValid = false;
      if (this.fileOrder.configuration.workflowName && this.fileOrder.configuration.agentName) {
        isValid = true;
      }
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.fileOrder.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }
      const obj = this.coreService.clone(this.fileOrder.configuration);
      if (obj.directoryExpr) {
        this.coreService.addSlashToString(obj, 'directoryExpr');
      }
      const request: any = {
        configuration: obj,
        valid: isValid,
        id: this.fileOrder.id,
        objectType: this.objectType
      };
  
      if (sessionStorage.$SOS$FORCELOGING === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }
      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.id === this.data.id && this.fileOrder.id === this.data.id) {
            this.fileOrder.actual = JSON.stringify(this.fileOrder.configuration);
            this.data.valid = res.valid;
            this.fileOrder.valid = res.valid;
            this.fileOrder.deployed = false;
            this.data.deployed = false;
            this.setErrorMessage(res);
          }
        }, error: () => this.ref.detectChanges()
      });
    }
  }
}
