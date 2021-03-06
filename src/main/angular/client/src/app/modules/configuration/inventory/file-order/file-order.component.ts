import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {isEmpty, isEqual} from 'underscore';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

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
  workflowTree = [];
  fileOrder: any = {};
  objectType = 'FILEORDERSOURCE';
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private coreService: CoreService, private dataService: DataService, private ref: ChangeDetectorRef) {
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.copyObj && !changes.data){
      return;
    }
    if (changes.reload) {
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
    if (this.fileOrder.name) {
      this.saveJSON();
    }
  }

  private getAgents(): void {
    if (this.agents.length === 0) {
      this.coreService.post('agents/names', {controllerId: this.schedulerId}).subscribe((res: any) => {
        this.agents = res.agentNames ? res.agentNames.sort() : [];
        this.ref.detectChanges();
      });
    }
  }

  private getWorkflows(): void {
    if (this.workflowTree.length === 0) {
      this.coreService.post('tree', {
        controllerId: this.schedulerId,
        forInventory: true,
        types: ['WORKFLOW']
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, true);
      });
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
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
      if (this.data.deployed !== res.deployed){
        this.data.deployed = res.deployed;
      }
      if (this.data.valid !== res.valid){
        this.data.valid = res.valid;
      }
      this.fileOrder = res;
      this.fileOrder.path1 = this.data.path;
      this.fileOrder.name = this.data.name;
      this.fileOrder.actual = JSON.stringify(res.configuration);
      this.history.push(this.fileOrder.actual);
      if (!this.fileOrder.configuration.timeZone){
        this.fileOrder.configuration.timeZone = this.preferences.zone;
      }
      this.getAgents();
      this.getWorkflows();
      if (!res.valid) {
        if (!this.fileOrder.configuration.workflowName) {
          this.invalidMsg = 'inventory.message.workflowIsMissing';
        } else if (!this.fileOrder.configuration.agentName) {
          this.invalidMsg = 'workflow.message.agentIsMissing';
        } else if (!this.fileOrder.configuration.directory) {
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
      this.setErrorMessage(res);
    }, () => {
    });
  }

  private setErrorMessage(res): void {
    if (res.invalidMsg) {
      this.invalidMsg = res.invalidMsg;
      if (res.invalidMsg.match('workflowName')) {
        this.invalidMsg = 'inventory.message.workflowIsMissing';
      } else if (res.invalidMsg.match('agentName')) {
        this.invalidMsg = 'workflow.message.agentIsMissing';
      } else if (res.invalidMsg.match('directory')) {
        this.invalidMsg = 'inventory.message.directoryIsMissing';
      }
    } else {
      this.invalidMsg = '';
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
        }).subscribe((res) => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, (err) => {
          this.fileOrder.name = this.data.name;
          this.ref.detectChanges();
        });
      } else {
        this.fileOrder.name = this.data.name;
        this.ref.detectChanges();
      }
    }
  }

  private getDocumentations(): void {
    if (this.documentationTree.length === 0) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
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
        if (this.fileOrder.configuration.documentationName1) {
          if (this.fileOrder.configuration.documentationName !== this.fileOrder.configuration.documentationName1) {
            this.fileOrder.configuration.documentationName = this.fileOrder.configuration.documentationName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.fileOrder.configuration.documentationName !== node.key) {
            this.fileOrder.configuration.documentationName = node.key;
          }
        }
      } else{
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
      let data = res.workflows || res.documentations;
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
      }
    });
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
    this.dataService.reloadTree.next({navigate: {name: this.fileOrder.configuration.workflowName, type: 'WORKFLOW'}});
  }

  changeValue($event, type): void{
    this.fileOrder.configuration[type] = $event;
    this.saveJSON();
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if (this.fileOrder.actual && !isEqual(this.fileOrder.actual, JSON.stringify(this.fileOrder.configuration))) {
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
      this.coreService.post('inventory/store', {
        configuration: this.fileOrder.configuration,
        valid: isValid,
        id: this.fileOrder.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.fileOrder.id === this.data.id) {
          this.fileOrder.actual = JSON.stringify(this.fileOrder.configuration);
          this.data.valid = res.valid;
          this.fileOrder.valid = res.valid;
          this.fileOrder.deployed = false;
          this.data.deployed = false;
          this.setErrorMessage(res);
        }
      }, (err) => {
        this.ref.detectChanges();
      });
    }
  }
}
