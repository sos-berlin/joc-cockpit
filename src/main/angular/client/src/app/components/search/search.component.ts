import {Component, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {InventorySearch} from '../../models/enums';
import {isEmpty} from 'underscore';
import {CoreService} from '../../services/core.service';
import {InventoryService} from '../../modules/configuration/inventory/inventory.service';
import {WorkflowService} from '../../services/workflow.service';

@Component({
  selector: 'app-inventory-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onNavigate: EventEmitter<any> = new EventEmitter();
  @Input() controllerId: string;
  @Input() isWorkflow: boolean;
  submitted = false;
  deployTypes: Array<string> = [];
  results: any;
  folders = [];
  agents = [];
  searchObj: any = {
    advanced: {}
  };
  ENUM: any;
  panel = {
    active: false
  };

  constructor(public coreService: CoreService, public modal: NzModalService,
              private inventoryService: InventoryService, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    this.ENUM = InventorySearch;
    this.searchObj.returnType = this.ENUM.WORKFLOW;
    this.deployTypes = Object.keys(this.ENUM).filter(key => isNaN(+key));
    this.getAgents();
    this.getFolderTree();
    if (!this.isWorkflow) {
      this.results = this.inventoryService.getSearchResult();
    } else{
      this.results = this.workflowService.getSearchResult();
    }
  }

  private getAgents(): void {
    this.coreService.post('agents/names', {controllerId: ''}).subscribe((res: any) => {
      this.agents = res.agentNames ? res.agentNames.sort() : [];
    });
  }

  displayWith(data): string {
    return data.key;
  }

  getFolderTree(): void {
    this.coreService.post('tree', {
      forInventory: true
    }).subscribe(res => {
      this.folders = this.coreService.prepareTree(res, true);
      if (this.folders.length > 0) {
        this.folders[0].expanded = true;
      }
    });
  }

  onChange(isActive): void {
    this.panel.active = isActive;
  }

  navToObject(data): void {
    this.onNavigate.emit(data);
  }

  search(): void {
    this.submitted = true;
    const obj: any = {
      deployedOrReleased: this.searchObj.deployedOrReleased,
      returnType: this.searchObj.returnType,
    };
    if (this.isWorkflow) {
      obj.deployedOrReleased = true;
    }
    if (this.searchObj.search) {
      obj.search = this.searchObj.search;
    }
    if (this.searchObj.folders && this.searchObj.folders.length > 0) {
      obj.folders = this.searchObj.folders;
    }
    if (this.searchObj.advanced) {
      if (this.searchObj.advanced.jobCriticality == null) {
        delete this.searchObj.advanced.jobCriticality;
      }
      if (this.searchObj.advanced.agentName == null) {
        delete this.searchObj.advanced.agentName;
      }
    }
    if (!isEmpty(this.searchObj.advanced)) {
      obj.advanced = this.searchObj.advanced;
    }
    if (this.searchObj.deployedOrReleased && this.searchObj.currentController) {
      obj.controllerId = this.controllerId;
    }
    this.coreService.post('inventory/search', obj).subscribe((res) => {
      this.results = res.results;
      if (!this.isWorkflow) {
        this.inventoryService.setSearchResult(this.results);
      } else{
        this.workflowService.setSearchResult(this.results);
      }
      this.submitted = false;
    }, () => {
      this.submitted = false;
    });
  }

  clear(): void {
    this.results = [];
    if (!this.isWorkflow) {
      this.inventoryService.setSearchResult(this.results);
    } else{
      this.workflowService.setSearchResult(this.results);
    }
  }

}
