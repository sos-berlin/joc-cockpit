import { Component, EventEmitter, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { isEmpty } from 'underscore';
import { AuthService } from "../guard";
import { InventorySearch } from '../../models/enums';
import { CoreService } from '../../services/core.service';
import { UpdateJobComponent } from '../../modules/configuration/inventory/update-job/update-job.component';
import { UpdateObjectComponent } from '../../modules/configuration/inventory/update-object/update-object.component';

@Component({
  selector: 'app-inventory-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onNavigate: EventEmitter<any> = new EventEmitter();
  @Input() controllerId: any;
  @Input() agentData: any;
  @Input() isWorkflow: boolean;
  @Input() isBoard: boolean;
  @Input() isLock: boolean;
  @Input() isCalendar: boolean;
  permission: any = {};
  preferences: any = {};
  submitted = false;
  isControllerId = false;
  isJobSearch = false;
  deployTypes: Array<string> = [];
  results: any;
  folders = [];
  agentList = [];
  agents = {
    agentList: []
  };
  searchObj: any = {
    advanced: {}
  };
  ENUM: any;
  panel = {
    active: false
  };
  object = {
    mapOfCheckedId: new Set(),
    checked: false,
    indeterminate: false,
    type: ''
  };
  type: string;
  url: string;
  statusObj = {
    syncStatus: [],
    availabilityStatus: []
  };
  synchronizationStatusOptions = [
    { label: 'synchronized', value: 'IN_SYNC', checked: false },
    { label: 'notSynchronized', value: 'NOT_IN_SYNC', checked: false }
  ];

  availabilityStatusOptions = [
    { label: 'suspended', value: 'SUSPENDED', checked: false },
    { label: 'outstanding', value: 'OUTSTANDING', checked: false }
  ];

  jobAvailabilityStatusOptions = [
    { label: 'skipped', value: 'SKIPPED', checked: false },
    { label: 'stopped', value: 'STOPPED', checked: false }
  ];

  constructor(public coreService: CoreService, public modal: NzModalService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.ENUM = InventorySearch;
    this.deployTypes = Object.keys(this.ENUM).filter(key => isNaN(+key));
    this.getAgents();
    this.getFolderTree();
    const savedObj: any = this.coreService.getSearchResult(this.isWorkflow ? 'workflow' : this.isBoard ? 'board' : this.isLock ? 'lock' : this.isCalendar ? 'calendar' : 'inventory');
    this.panel.active = savedObj.panel;
    if (!isEmpty(savedObj.request)) {
      this.searchObj = savedObj.request;
      this.results = savedObj.result;
    } else {
      if (!this.isWorkflow && !this.isBoard && !this.isLock && !this.isCalendar) {
        this.searchObj.returnType = this.ENUM.WORKFLOW;
      } else {
        if (this.isWorkflow) {
          this.type = this.ENUM.WORKFLOW;
        } else if (this.isBoard) {
          this.type = this.ENUM.NOTICEBOARD;
        } else if (this.isLock) {
          this.type = this.ENUM.LOCK;
        } else if (this.isCalendar) {
          this.type = 'CALENDAR';
        }
        this.searchObj.returnType = this.type;
      }
    }
    if (this.searchObj.advanced && this.isWorkflow) {
      this.searchObj.advanced.instructionStates = this.searchObj.advanced.instructionStates ? this.searchObj.advanced.instructionStates : [];
      this.searchObj.advanced.states = this.searchObj.advanced.states ? this.searchObj.advanced.states : [];

      this.searchObj.advanced.instructionStates.forEach((item) => {
        for (let i in this.jobAvailabilityStatusOptions) {
          if (this.jobAvailabilityStatusOptions[i].value == item) {
            this.jobAvailabilityStatusOptions[i].checked = true;
            break;
          }
        }
      });
      this.searchObj.advanced.states.forEach((item) => {
        for (let i in this.synchronizationStatusOptions) {
          if (this.synchronizationStatusOptions[i].value == item) {
            this.synchronizationStatusOptions[i].checked = true;
            break;
          }
        }
        for (let i in this.availabilityStatusOptions) {
          if (this.availabilityStatusOptions[i].value == item) {
            this.availabilityStatusOptions[i].checked = true;
            break;
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    const savedObj: any = this.coreService.getSearchResult(this.isWorkflow ? 'workflow' : this.isBoard ? 'board' : this.isLock ? 'lock' : this.isCalendar ? 'calendar' : 'inventory');
    this.coreService.setSearchResult(this.isWorkflow ? 'workflow' : this.isBoard ? 'board' : this.isLock ? 'lock' : this.isCalendar ? 'calendar' : 'inventory',
      { ...savedObj, panel: this.panel.active, request: this.searchObj });
  }

  private getAgents(): void {
    if (this.agentData) {
      this.agents.agentList = this.agentData;
      this.agentList = this.coreService.clone(this.agents.agentList);
    } else {
      if (this.permission.joc && this.permission.joc.inventory.view) {
        this.coreService.getAgents(this.agents, '', () => {
          this.agentList = this.coreService.clone(this.agents.agentList);
        });
      }
    }
  }

  synchronizationStatusChange(value: string[]): void {
    this.statusObj.syncStatus = value;
  }

  availabilityStatusChange(value: string[]): void {
    this.statusObj.availabilityStatus = value;
  }

  jobAvailabilityStatusChange(value: string[]): void {
    this.searchObj.advanced.instructionStates = value;
  }

  displayWith(data): string {
    return data.key;
  }

  getFolderTree(): void {
    this.searchObj.folders = [];
    const obj: any = {};
    if (this.isWorkflow || this.isBoard || this.isLock || this.isCalendar) {
      obj.types = this.isWorkflow ? [this.ENUM.WORKFLOW] : this.isBoard ? [this.ENUM.NOTICEBOARD] : this.isLock ? [this.ENUM.LOCK] : ['WORKINGDAYSCALENDAR', 'NONWORKINGDAYSCALENDAR'];
      obj.controllerId = this.controllerId;
    } else {
      obj.forInventory = true;
    }
    this.coreService.post('tree', obj).subscribe(res => {
      this.folders = this.coreService.prepareTree(res, true);
      if (this.folders.length > 0) {
        this.folders[0].expanded = true;
      }
    });
  }

  selectFolder(node, $event): void {
    if (!node.origin.isLeaf) {
      node.isExpanded = !node.isExpanded;
    }
    $event.stopPropagation();
  }

  addFolder(path): void {
    if (this.searchObj.folders.indexOf(path) === -1) {
      this.searchObj.folders.push(path);
      this.searchObj.folders = [...this.searchObj.folders];
    }
  }

  remove(path): void {
    this.searchObj.folders.splice(this.searchObj.folders.indexOf(path), 1);
    this.searchObj.folders = [...this.searchObj.folders];
  }

  onChange(isActive): void {
    this.panel.active = isActive;
  }

  navToObject(data): void {
    this.onNavigate.emit(data);
  }

  checkAll(value: boolean): void {
    if (value && this.results.length > 0) {
      this.results.forEach(item => {
        this.object.mapOfCheckedId.add(item.name);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  onItemChecked(data: any, checked: boolean): void {
    if (checked) {
      this.object.mapOfCheckedId.add(data.name);
    } else {
      this.object.mapOfCheckedId.delete(data.name);
    }
    this.object.checked = this.object.mapOfCheckedId.size === this.results.length;
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  search(): void {
    this.object = {
      mapOfCheckedId: new Set(),
      checked: false,
      indeterminate: false,
      type: ''
    };
    this.submitted = true;
    const obj: any = {};

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
      if (this.searchObj.advanced.jobCountFrom === '') {
        delete this.searchObj.advanced.jobCountFrom;
      }
      if (this.searchObj.advanced.jobCountTo === '') {
        delete this.searchObj.advanced.jobCountTo;
      }
    }
    if (!isEmpty(this.searchObj.advanced)) {
      obj.advanced = this.searchObj.advanced;
      if (!obj.advanced.jobNameExactMatch || (obj.advanced.jobNameExactMatch && !obj.advanced.jobName)) {
        delete obj.advanced.jobNameExactMatch;
      }
    }
    if (this.searchObj.deployedOrReleased && this.searchObj.currentController) {
      obj.controllerId = this.controllerId;
    }
    if (!this.isWorkflow && !this.isBoard && !this.isLock && !this.isCalendar) {
      this.url = 'inventory/search';
      obj.deployedOrReleased = this.searchObj.deployedOrReleased;
      obj.returnType = this.searchObj.returnType;
    } else {
      obj.controllerId = this.controllerId;

      if (this.isWorkflow) {

        if (!obj.advanced) {
          obj.advanced = {};
        }
        obj.advanced.states = this.statusObj.syncStatus.concat(this.statusObj.availabilityStatus);
        this.url = 'workflows/search';
      } else if (this.isBoard) {
        this.url = 'notice/boards/search';
      } else if (this.isLock) {
        this.url = 'locks/search';
      } else if (this.isCalendar) {
        this.url = 'calendars/search';
      }
    }

    this.coreService.post(this.url, obj).subscribe({
      next: (res) => {
        this.object.type = obj.returnType;
        this.results = res.results;
        this.isControllerId = false;
        if (!this.isWorkflow && !this.isBoard && !this.isLock && !this.isCalendar) {
          if (this.results.length > 0 && this.results[0].controllerId) {
            this.isControllerId = true;
          }
          this.isJobSearch = !!(obj.returnType === this.ENUM.WORKFLOW && obj.advanced && obj.advanced.jobName);
        }
        this.coreService.setSearchResult(this.isWorkflow ? 'workflow' : this.isBoard ? 'board' : this.isLock ? 'lock' : this.isCalendar ? 'calendar' : 'inventory',
          { panel: this.panel.active, request: this.searchObj, result: this.results });
        this.submitted = false;
      }, error: () => {
        this.submitted = false;
      }
    });
  }

  clear(): void {
    const type = this.searchObj.returnType;
    this.searchObj = { advanced: {}, returnType: type };
    this.results = [];
    this.object.mapOfCheckedId = new Set();
    this.object.checked = false;
    this.object.indeterminate = false;
    this.coreService.setSearchResult(this.isWorkflow ? 'workflow' : this.isBoard ? 'board' : this.isLock ? 'lock' : this.isCalendar ? 'calendar' : 'inventory',
      { panel: false, request: {}, result: [] });
  }

  propagateJob(): void {
    this.updateJob(false);
  }

  updateJob(onlyUpdate = true): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: UpdateJobComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        controllerId: this.controllerId,
        data: {
          onlyUpdate,
          exactMatch: this.searchObj.advanced.jobNameExactMatch,
          jobName: this.searchObj.advanced.jobName,
          workflows: this.results.filter((item) => {
            return this.object.mapOfCheckedId.has(item.name);
          })
        }
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        this.onCancel.emit();
      }
    });
  }

  updateObject(): void {
    if (!this.object.type) {
      this.object.type = this.searchObj.returnType;
    }
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: UpdateObjectComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        controllerId: this.controllerId,
        type: this.object.type,
        data: this.results.filter((item) => {
          return this.object.mapOfCheckedId.has(item.name);
        })
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        this.onCancel.emit();
      }
    });
  }
}
