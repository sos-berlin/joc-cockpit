import { Component, OnInit } from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {InventorySearch} from '../../../../models/enums';
import {CoreService} from '../../../../services/core.service';

@Component({
  selector: 'app-inventory-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  deployTypes: Array<string> = [];
  results = [];
  folders = [];
  agents = [];
  searchObj: any = {};
  ENUM: any;
  showAdvanceFields = false;

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

  search(): void {
    this.coreService.post('inventory/search', {}).subscribe((result) => {
      this.results = result;
    });
  }

  showAdvance(): void {
    this.showAdvanceFields = !this.showAdvanceFields;
  }
}
