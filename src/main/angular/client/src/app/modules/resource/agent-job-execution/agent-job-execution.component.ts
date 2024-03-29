import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {clone, isEmpty} from 'underscore';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {SearchPipe} from '../../../pipes/core.pipe';
import {ExcelService} from '../../../services/excel.service';
import {EditFilterModalComponent} from '../../../components/filter-modal/filter.component';
import {SaveService} from '../../../services/save.service';

@Component({
  selector: 'app-filter-agent-content',
  templateUrl: './filter-dialog.html'
})
export class FilterModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  allFilter: any;
  new = false;
  edit = false;
  filter: any;

  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  name: string;

  constructor(private authService: AuthService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.allFilter = this.modalData.allFilter;
    this.new = this.modalData.new;
    this.edit = this.modalData.edit;
    this.filter = this.modalData.filter;

    this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.new) {
      this.filter = {
        radio: 'planned',
        paths: [],
        state: [],
        planned: 'today',
        shared: false
      };
    } else {
      this.filter.radio = 'planned';
      this.name = clone(this.filter.name);
    }
  }

  cancel(obj): void {
    if (obj) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.destroy();
    }
  }

}

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.html',
})
export class SearchComponent {

  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() permission: any;
  @Input() isSearch: boolean;

  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  dateFormat: any;
  existingName: any;
  submitted = false;
  isUnique = true;
  agentIds = [];

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    if (this.filter.name) {
      this.existingName = this.coreService.clone(this.filter.name);
    }
    this.getAgentIds();
  }

  private getAgentIds(): void {
    this.coreService.post('agents', {
      controllerId: this.schedulerIds.selected,
      compact: true
    }).subscribe((result: any) => {
      this.agentIds = result.agents.map((item) => {
        return item.agentId;
      });
    });
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.authService.currentUserData === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  selectTime(time, isEditor = false, val = 'from'): void {
    this.coreService.selectTime(time, isEditor, this.filter, val);
  }

  onSubmit(result): void {
    this.submitted = true;
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'AGENTCLUSTER',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    const obj: any = this.coreService.clone(result);
    delete obj.shared;
    delete obj.radio;
    if (result.radio != 'current') {
      if (result.from1) {
        fromDate = this.coreService.parseProcessExecuted(result.from1);
      }
      if (result.to1) {
        toDate = this.coreService.parseProcessExecuted(result.to1);
      }
    }

    if (fromDate) {
      obj.from1 = fromDate;
    } else {
      obj.from1 = '0d';
    }
    if (toDate) {
      obj.to1 = toDate;
    } else {
      obj.to1 = '0d';
    }

    configObj.configurationItem = JSON.stringify(obj);
    this.coreService.post('configuration/save', configObj).subscribe({
      next: (res: any) => {
        this.submitted = false;
        if (result.id) {
          for (let i in this.allFilter) {
            if (this.allFilter[i].id === result.id) {
              this.allFilter[i] = configObj;
              break;
            }
          }
        } else {
          configObj.id = res.id;
          this.allFilter.push(configObj);
        }
        if (this.isSearch) {
          this.filter.name = '';
        } else {
          this.onCancel.emit(configObj);
        }
      }, error: () => this.submitted = false
    });
  }

  search(): void {
    this.onSearch.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}

@Component({
  selector: 'app-agent-job-execution',
  templateUrl: 'agent-job-execution.component.html'
})
export class AgentJobExecutionComponent {
  objectType = 'AGENTCLUSTER';
  isLoading = false;
  configLoading = true;
  showSearchPanel = false;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  agentTasks: any = [];
  agentFilters: any = {};
  totalJobExecution: any;
  totalNumOfJobs: any;
  dateFormat: any;
  data = [];
  selectedFiltered: any = {};
  temp_filter: any = {};
  searchFilter: any = {};
  savedFilter: any = {};
  filterList: any = [];
  searchableProperties = ['agentId', 'url', 'numOfSuccessfulTasks', 'numOfJobs'];

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private searchPipe: SearchPipe, private saveService: SaveService,
              private dataService: DataService, private modal: NzModalService, private translate: TranslateService, private excelService: ExcelService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (!this.configLoading) {
        this.refresh(res);
      }
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  static parseProcessExecuted(regex, obj): any {
    let fromDate;
    let toDate;

    if (/^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.exec(regex)[0];

    } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      const seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2], 10);
      fromDate.setSeconds(toDate.getSeconds() - seconds);
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      fromDate = '0d';
      toDate = '0d';
    } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
      fromDate = '-1d';
      toDate = '-1d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      const date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      const arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(regex)) {
      const time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(regex);
      fromDate = new Date();
      if (/(pm)/i.test(time[3]) && parseInt(time[1], 10) != 12) {
        fromDate.setHours(parseInt(time[1], 10) - 12);
      } else {
        fromDate.setHours(parseInt(time[1], 10));
      }

      fromDate.setMinutes(parseInt(time[2], 10));
      toDate = new Date();
      if (/(pm)/i.test(time[6]) && parseInt(time[4], 10) != 12) {
        toDate.setHours(parseInt(time[4], 10) - 12);
      } else {
        toDate.setHours(parseInt(time[4], 10));
      }
      toDate.setMinutes(parseInt(time[5], 10));
    }

    if (fromDate) {
      obj.dateFrom = fromDate;
    }
    if (toDate) {
      obj.dateTo = toDate;
    }
    return obj;
  }


  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private init(): void {
    this.agentFilters = this.coreService.getResourceTab().agentJobExecution;
    this.coreService.getResourceTab().state = 'agentJobExecutions';
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    if (!(this.agentFilters.current || this.agentFilters.current === false)) {
      this.agentFilters.current = this.preferences.currentController;
    }
    if (!this.agentFilters.filter.date) {
      this.agentFilters.filter.date = 'all';
    }
    this.savedFilter = JSON.parse(this.saveService.agentFilters) || {};
    if (this.schedulerIds.selected && this.permission.joc && this.permission.joc.administration.customization.view) {
      this.checkSharedFilters();
    } else {
      this.savedFilter.selected = undefined;
      this.loadAgentTasks();
    }
  }


  private generateRequestObj(object, filter): any {
    if (object.urls) {
      filter.urls = object.urls.split(',');
    }
    if (object.agentIds) {
      filter.agentIds = object.agentIds;
    }
    if (object.controllerId) {
      filter.controllerId = object.controllerId;
    }
    if (object.radio) {
      if (object.radio == 'planned') {
        filter = AgentJobExecutionComponent.parseProcessExecuted(object.planned, filter);
      } else {
        filter = this.parseDate(object, filter);
      }
    } else if (object.planned) {
      filter = AgentJobExecutionComponent.parseProcessExecuted(object.planned, filter);
    }
    return filter;
  }

  private parseDate(agentSearch, filter): any {
    if (agentSearch.fromDate) {
      this.coreService.getDateAndTime(agentSearch);
      filter.dateFrom = new Date(agentSearch.fromDate);
    }
    if (agentSearch.toDate) {
      this.coreService.getDateAndTime(agentSearch, 'to');
      filter.dateTo = new Date(agentSearch.toDate);
    }
    return filter;
  }

  checkSharedFilters(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType,
      shared: true
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res: any) => {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = res.configurations;
        }
        this.getCustomizations();
      }, error: () => this.getCustomizations()
    });
  }

  getCustomizations(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res: any) => {
        if (this.filterList && this.filterList.length > 0) {
          if (res.configurations && res.configurations.length > 0) {
            this.filterList = this.filterList.concat(res.configurations);
          }
          const data = [];
          for (let i = 0; i < this.filterList.length; i++) {
            let flag = true;
            for (let j = 0; j < data.length; j++) {
              if (data[j].id === this.filterList[i].id) {
                flag = false;
              }
            }
            if (flag) {
              data.push(this.filterList[i]);
            }
          }
          this.filterList = data;
        } else {
          this.filterList = res.configurations;
        }

        if (this.savedFilter.selected) {
          let flag = true;
          this.filterList.forEach((value) => {
            if (value.id === this.savedFilter.selected) {
              flag = false;
              this.coreService.post('configuration', {
                controllerId: value.controllerId,
                id: value.id
              }).subscribe({
                next: (conf: any) => {
                  this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                  this.selectedFiltered.account = value.account;
                  this.loadAgentTasks();
                }, error: () => {
                  this.savedFilter.selected = undefined;
                  this.loadAgentTasks();
                }
              });
            }
          });
          if (flag) {
            this.savedFilter.selected = undefined;
            this.loadAgentTasks();
          }
        } else {
          this.savedFilter.selected = undefined;
          this.loadAgentTasks();
        }
      }, error: () => {
        this.savedFilter.selected = undefined;
        this.loadAgentTasks();
      }
    });
  }

  isCustomizationSelected(flag): void {
    if (flag) {
      this.temp_filter = clone(this.agentFilters.filter.date);
      this.agentFilters.filter.date = '';
    } else {
      if (this.temp_filter) {
        this.agentFilters.filter.date = clone(this.temp_filter);
      } else {
        this.agentFilters.filter.date = 'today';
      }
    }
  }

  private setDateRange(filter): any {
    if (this.agentFilters.filter.date == 'all') {

    } else if (this.agentFilters.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else if (this.agentFilters.filter.date) {
      filter.dateFrom = this.agentFilters.filter.date;
    }
    return filter;
  }

  loadAgentTasks(date?: string): void {
    if (date) {
      this.agentFilters.filter.date = date;
      this.isLoading = false;
    }
    let obj: any = {
      controllerId: this.agentFilters.current === true ? this.schedulerIds.selected : '',
      timeZone: this.preferences.zone
    };
    if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
      this.isCustomizationSelected(true);
      obj = this.generateRequestObj(this.selectedFiltered, obj);
    } else {
      obj = this.setDateRange(obj);
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('agents/report', obj).subscribe({
      next: (res: any) => {
        this.isLoading = true;
        this.agentTasks = res.agents || [];
        this.searchInResult();
        this.totalJobExecution = res.totalNumOfSuccessfulTasks;
        this.totalNumOfJobs = res.totalNumOfJobs;
        this.configLoading = false;
      }, error: () => {
        this.agentTasks = [];
        this.isLoading = true;
        this.configLoading = false;
      }
    });
  }

  searchInResult(): void {
    this.data = this.agentFilters.searchText ? this.searchPipe.transform(this.agentTasks, this.agentFilters.searchText, this.searchableProperties) : this.agentTasks;
    this.data = [...this.data];
  }

  advancedSearch(): void {
    this.showSearchPanel = true;
    this.searchFilter = {
      radio: 'current',
      planned: 'today',
      fromDate: new Date(),
      fromTime: '00:00:00',
      toDate: new Date(),
      toTime: '23:59:59',
    };
  }

  cancel(): void {
    if (!this.agentFilters.filter.date) {
      this.agentFilters.filter.date = 'today';
    }
    this.showSearchPanel = false;
    this.searchFilter = {};
    this.loadAgentTasks();
  }

  search(flag = false): void {
    if (!flag) {
      this.isLoading = false;
    }
    let filter: any = {
      controllerId: this.searchFilter.controllerId || '',
      timeZone: this.preferences.zone
    };
    this.agentFilters.filter.date = '';
    filter = this.generateRequestObj(this.searchFilter, filter);
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
      filter.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateFrom)._d;
    }
    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      filter.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateTo)._d;
    }
    this.coreService.post('agents/report', filter).subscribe({
      next: (res: any) => {
        this.isLoading = true;
        this.agentTasks = res.agents || [];
        this.searchInResult();
        this.totalJobExecution = res.totalNumOfSuccessfulTasks;
        this.totalNumOfJobs = res.totalNumOfJobs;
        this.configLoading = false;
      }, error: () => {
        this.agentTasks = [];
        this.isLoading = true;
        this.configLoading = false;
      }
    })
  }

  /* ---------------------------- Action ----------------------------------*/

  pageIndexChange($event: number): void {
    this.agentFilters.currentPage = $event;
  }

  pageSizeChange($event: number): void {
    this.agentFilters.entryPerPage = $event;
  }

  sort(propertyName): void {
    this.agentFilters.reverse = !this.agentFilters.reverse;
    this.agentFilters.filter.sortBy = propertyName;
  }

  changeController(): void {
    this.loadAgentTasks();
  }

  exportToExcel(): void {
    let controllerId = '', agentId = '', url = '',
      numOfSuccessfulTasks = '', numOfJobs = '';
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('agent.label.agentId').subscribe(translatedValue => {
      agentId = translatedValue;
    });
    this.translate.get('agent.label.url').subscribe(translatedValue => {
      url = translatedValue;
    });
    this.translate.get('resource.agentJobExecution.label.numberOfSuccessfullyExecutedTask').subscribe(translatedValue => {
      numOfSuccessfulTasks = translatedValue;
    });
    this.translate.get('resource.agentJobExecution.label.numberOfJobsExecuted').subscribe(translatedValue => {
      numOfJobs = translatedValue;
    });
    const data = [];
    for (let i = 0; i < this.agentTasks.length; i++) {
      const obj: any = {};
      if (!this.agentFilters.current) {
        obj[controllerId] = this.agentTasks[i].controllerId;
      }
      obj[agentId] = this.agentTasks[i].agentId;
      obj[url] = this.agentTasks[i].url;
      obj[numOfSuccessfulTasks] = this.agentTasks[i].numOfSuccessfulTasks;
      obj[numOfJobs] = this.agentTasks[i].numOfJobs;

      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-agent-job-execution');
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'JobStateChanged') {
          this.configLoading = true;
          if (this.searchFilter && !isEmpty(this.searchFilter) && !this.agentFilters.filter.date) {
            this.search(true);
          } else {
            this.loadAgentTasks();
          }
          break;
        }
      }
    }
  }

  /* ----------------------Customization --------------------- */
  action(type, obj, self): void {
    if (type === 'DELETE') {
      if (self.savedFilter.selected == obj.id) {
        self.savedFilter.selected = undefined;
        self.isCustomizationSelected(false);
        self.agentFilters.selectedView = false;
        self.selectedFiltered = {};
        self.setDateRange({});
        self.loadAgentTasks();
      } else {
        if (self.filterList.length == 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.agentFilters.selectedView = false;
          self.selectedFiltered = {};
        }
      }
      self.saveService.setAgent(self.savedFilter);
      self.saveService.save();
    } else if (type === 'MAKEFAV') {
      self.savedFilter.favorite = obj.id;
      self.agentFilters.selectedView = true;
      self.saveService.setAgent(self.savedFilter);
      self.saveService.save();
      self.loadAgentTasks();
    } else if (type === 'REMOVEFAV') {
      self.savedFilter.favorite = '';
      self.saveService.setAgent(self.savedFilter);
      self.saveService.save();
    }
  }

  createCustomization(): void {
    if (this.schedulerIds.selected) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: FilterModalComponent,
        nzClassName: 'lg',
        nzData: {
          permission: this.permission,
          allFilter: this.filterList,
          new: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  editFilters(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EditFilterModalComponent,
      nzData: {
        filterList: this.filterList,
        favorite: this.savedFilter.favorite,
        permission: this.permission,
        username: this.authService.currentUserData,
        action: this.action,
        self: this
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(obj => {
      if (obj) {
        if (obj.type === 'EDIT') {
          this.editFilter(obj);
        } else if (obj.type === 'COPY') {
          this.copyFilter(obj);
        }
      }
    });
  }

  changeFilter(filter): void {
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.agentFilters.selectedView = true;
      this.coreService.post('configuration', {
        controllerId: filter.controllerId,
        id: filter.id
      }).subscribe((conf: any) => {
        this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
        this.selectedFiltered.account = filter.account;
        this.loadAgentTasks();
      });
    } else {
      this.isCustomizationSelected(false);
      this.savedFilter.selected = filter;
      this.agentFilters.selectedView = false;
      this.selectedFiltered = {};
      this.setDateRange({});
      this.loadAgentTasks();
    }

    this.saveService.setAgent(this.savedFilter);
    this.saveService.save();
  }

  private editFilter(filter): void {
    this.openFilterModal(filter, false);
  }

  private copyFilter(filter): void {
    this.openFilterModal(filter, true);
  }

  private openFilterModal(filter, isCopy): void {
    if (this.schedulerIds.selected) {
      let filterObj: any = {};
      this.coreService.post('configuration', {
        controllerId: filter.controllerId,
        id: filter.id
      }).subscribe((conf: any) => {
        filterObj = JSON.parse(conf.configuration.configurationItem);
        filterObj.shared = filter.shared;
        if (isCopy) {
          filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);
        } else {
          filterObj.id = filter.id;
        }
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: FilterModalComponent,
          nzClassName: 'lg',
          nzData: {
            permission: this.permission,
            allFilter: this.filterList,
            filter: filterObj,
            edit: !isCopy
          },
          nzFooter: null,
          nzClosable: false
        });
        modal.afterClose.subscribe(obj => {
          if (obj && this.savedFilter.selected && filterObj.id == this.savedFilter.selected) {
            this.changeFilter(filterObj);
          }
        });
      });
    }
  }

}

