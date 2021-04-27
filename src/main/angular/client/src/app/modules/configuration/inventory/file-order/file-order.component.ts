import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-file-order',
  templateUrl: './file-order.component.html'
})
export class FileOrderComponent implements OnChanges, OnInit {
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

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
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
      }
    }
  }

  ngOnInit(): void {
    this.zones = this.coreService.getTimeZoneList();
  }

  private getAgents(): void {
    if (this.agents.length === 0) {
      this.coreService.post('agents/names', {controllerId: this.schedulerId}).subscribe((res: any) => {
        this.agents = res.agentNames ? res.agentNames.sort() : [];
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
      if (res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
      } else {
        res.configuration = {};
      }
      this.fileOrder = res;
      this.fileOrder.path1 = this.data.path;
      this.fileOrder.name = this.data.name;
      this.fileOrder.actual = JSON.stringify(res.configuration);
      if(!this.fileOrder.configuration.timeZone){
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
        });
      } else {
        this.fileOrder.name = this.data.name;
      }
    }
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
        this.updateList(node);
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
      setTimeout(() => {
        this.saveJSON();
      }, 10);
    }
  }

  updateList(node): void {
    let obj: any = {
      path: node.key,
      objectTypes: ['WORKFLOW']
    };
    this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
      let data = res.workflows;
      for (let i = 0; i < data.length; i++) {
        const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
        data[i].title = data[i].name;
        data[i].path = _path;
        data[i].key = data[i].name;
        data[i].type = 'WORKFLOW';
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
      this.workflowTree = [...this.workflowTree];
    });
  }

  onExpand(e): void {
    this.loadData(e.node, null);
  }

  deploy(): void {
    this.dataService.reloadTree.next({deploy: this.fileOrder});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.fileOrder});
  }

  navToWorkflow(): void {
    this.dataService.reloadTree.next({navigate: {name: this.fileOrder.configuration.workflowName, type: 'WORKFLOW'}});
  }

  saveJSON(): void {
    if (this.isTrash) {
      return;
    }
    if (this.fileOrder.actual !== JSON.stringify(this.fileOrder.configuration)) {
      let isValid = false;
      if (this.fileOrder.configuration.workflowName && this.fileOrder.configuration.agentName) {
        isValid = true;
      }
      this.fileOrder.configuration.id = this.fileOrder.name;
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
        console.log(err);
      });
    }
  }
}
