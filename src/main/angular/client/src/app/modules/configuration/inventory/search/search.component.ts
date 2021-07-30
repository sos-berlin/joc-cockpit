import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {InventoryObject, InventorySearch} from '../../../../models/enums';
import {CoreService} from '../../../../services/core.service';

@Component({
  selector: 'app-inventory-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onNavigate: EventEmitter<any> = new EventEmitter();
  submitted = false;
  deployTypes: Array<string> = [];
  results: any;
  folders = [];
  agents = [];
  searchObj: any = {};
  ENUM: any;
  panel = {
    active: false
  };

  constructor(private coreService: CoreService, public modal: NzModalService) {
  }

  ngOnInit(): void {
    this.ENUM = InventorySearch;
    this.searchObj.returnType = this.ENUM.WORKFLOW;
    this.deployTypes = Object.keys(this.ENUM).filter(key => isNaN(+key));
    this.getAgents();
    this.getFolderTree();
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

  navToObject(data): void {
    this.onNavigate.emit(data);
  }

  search(): void {
    this.submitted = true;
    this.coreService.post('inventory/search', this.searchObj).subscribe((result) => {
      if (this.searchObj.returnType === this.ENUM.SCHEDULE) {
        this.results = result.schedules;
      } else if (this.searchObj.returnType === this.ENUM.WORKFLOW) {
        this.results = result.workflows;
      } else if (this.searchObj.returnType === this.ENUM.FILE_ORDER_SOURCE) {
        this.results = result.fileOrderSources;
      } else if (this.searchObj.returnType === this.ENUM.JOB_RESOURCE) {
        this.results = result.jobResources;
      } else if (this.searchObj.returnType === this.ENUM.BOARD) {
        this.results = result.boards;
      } else if (this.searchObj.returnType === this.ENUM.LOCK) {
        this.results = result.locks;
      } else{
        this.results = [];
      }
      this.submitted = false;
    }, () => {
      this.submitted = false;
    });
  }

}
