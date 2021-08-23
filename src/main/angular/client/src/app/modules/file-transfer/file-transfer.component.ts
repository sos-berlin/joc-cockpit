import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {isEmpty, extend, clone} from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';
import {SearchPipe} from '../../pipes/core.pipe';
import {ActivatedRoute, Router} from '@angular/router';
import {FileTransferService} from '../../services/file-transfer.service';

declare const $;

@Component({
  selector: 'app-modal-content',
  templateUrl: './filter-dialog.html',
})
export class FilterModalComponent implements OnInit {
  @Input() allFilter;
  @Input() new;
  @Input() edit;
  @Input() filter;

  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  name: string;

  constructor(private authService: AuthService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (this.new) {
      this.filter = {
        radio: 'planned',
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
  selector: 'app-file-transfer-form-template',
  templateUrl: './form-template.html',
})
export class FileTransferSearchComponent implements OnInit {
  @Input() schedulerIds: any;
  @Input() filter: any;
  @Input() preferences: any;
  @Input() allFilter: any;
  @Input() permission: any;
  @Input() isSearch: boolean;
  @Input() isHistory: boolean;

  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  dateFormat: any;
  existingName: any;
  submitted = false;
  isUnique = true;
  allhosts: any;
  sourceProtocol: any = [];
  targetProtocol: any = [];

  stateOptions = [
    {status: 'SUCCESSFUL', text: 'successful', checked: false},
    {status: 'FAILED', text: 'failed', checked: false},
    {status: 'INCOMPLETE', text: 'incomplete', checked: false}
  ];

  operationOptions = [
    {status: 'COPY', text: 'copy', checked: false},
    {status: 'MOVE', text: 'move', checked: false},
    {status: 'GETLIST', text: 'getList', checked: false},
    {status: 'RENAME', text: 'rename', checked: false}
  ];

  constructor(private authService: AuthService, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormatWithTime(this.preferences.dateFormat);
    this.allhosts = this.coreService.getProtocols();
    if (this.filter.states && this.filter.states.length > 0) {
      this.stateOptions = this.stateOptions.map(item => {
        return {
          ...item,
          checked: this.filter.states.indexOf(item.status) > -1
        };
      });
    }
    if (this.filter.operations && this.filter.operations.length > 0) {
      this.operationOptions = this.operationOptions.map(item => {
        return {
          ...item,
          checked: this.filter.operations.indexOf(item.status) > -1
        };
      });
    }
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.authService.currentUserData === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  selectedTargetProtocol(value: any): void {
    if (!this.filter.targetProtocol) {
      this.filter.targetProtocol = [];
    }
    this.filter.targetProtocol.push(value.text);
  }

  selectedSourceProtocol(value: any): void {
    if (!this.filter.targetProtocol) {
      this.filter.sourceProtocol = [];
    }
    this.filter.sourceProtocol.push(value.text);
  }

  stateChange(value: string[]): void {
    this.filter.states = value;
  }

  operationChange(value: string[]): void {
    this.filter.operations = value;
  }

  onSubmit(result): void {
    this.submitted = true;
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: this.isHistory ? 'YADE_HISTORY' : 'YADE',
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
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
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
      this.submitted = false;
    }, () => {
      this.submitted = false;
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
  selector: 'app-single-file-transfer',
  templateUrl: './single-file-transfer.component.html'
})
export class SingleFileTransferComponent implements OnInit, OnDestroy {
  controllerId: any;
  transferId: any;
  preferences: any = {};
  permission: any = {};
  fileTransfers: any = [];
  dateFormat: any;
  loading = false;
  widthArr = [];
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService,
              private route: ActivatedRoute, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.transferId = this.route.snapshot.queryParamMap.get('id');
    this.controllerId = this.route.snapshot.queryParamMap.get('controllerId');
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  getFileTransferById(transferId): void {
    const obj = {
      controllerId: this.controllerId,
      transferIds: [transferId]
    };
    this.coreService.post('yade/transfers', obj).subscribe((result: any) => {
      this.fileTransfers = result.transfers;
      this.loading = true;
      this.setHeaderWidth();
    }, () => this.loading = true);
  }

  getFiles(value): void {
    const self = this;
    value.widthArr = [];
    this.coreService.post('yade/files', {
      transferIds: [value.id],
      controllerId: this.controllerId
    }).subscribe((res: any) => {
      value.files = res.files;
      value.widthArr = this.coreService.calFileTransferRowWidth();
      setTimeout(() => {
        const dom = $('#fileTransferMainTable');
        dom.find('thead tr.main-header-row th').each(function(i) {
          $(this).css('width', self.widthArr[i] + 'px');
        });
      }, 0);
    });
  }

  showTransferFuc(value): void {
    value.show = true;
    this.getFiles(value);
  }

  private setHeaderWidth(): void {
    const self = this;
    setTimeout(() => {
      self.widthArr = [];
      const dom = $('#fileTransferMainTable');
      dom.find('thead tr.main-header-row th').each(function() {
        self.widthArr.push($(this).outerWidth());
      });
    }, 0);
  }

  private init(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getFileTransferById(7);
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].objectType === 'OTHER') {
          if (args.eventSnapshots[j].eventType === 'YADETransferStarted') {

            break;
          } else if (args.eventSnapshots[j].eventType == 'YADETransferUpdated') {
            for (let x = 0; x < this.fileTransfers.length; x++) {
              if (this.fileTransfers[x].id === args.eventSnapshots[j].path) {

                break;
              }
            }
          } else if (args.eventSnapshots[j].eventType === 'YADEFileStateChanged') {
            for (let x = 0; x < this.fileTransfers.length; x++) {
              if (this.fileTransfers[x].id === args.eventSnapshots[j].path && this.fileTransfers[x].show) {

                break;
              }
            }
          }
          break;
        }
      }
    }
  }
}

@Component({
  selector: 'app-file-transfer',
  templateUrl: './file-transfer.component.html'
})
export class FileTransferComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  yadeFilters: any = {};
  yadeView: any = {current: false};
  searchFilter: any = {};
  savedFilter: any = {};
  selectedFiltered: any = {};
  filterList: any = [];
  fileTransfers: any = [];
  currentData = [];
  data = [];
  widthArr = [];
  dateFormat: any;
  temp_filter: any = {};
  searchKey: string;
  showFiles = false;
  isLoading = false;
  isLoaded = false;
  loadConfig = false;
  showSearchPanel = false;
  subscription1: Subscription;
  subscription2: Subscription;

  searchableProperties = ['controllerId', 'profile', 'start', 'end', '_operation', 'numOfFiles', 'workflowPath', 'orderId'];

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService, private fileTransferService: FileTransferService,
              private router: Router, private searchPipe: SearchPipe, private dataService: DataService, private modal: NzModalService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  sort(propertyName): void {
    this.yadeFilters.reverse = !this.yadeFilters.reverse;
    this.yadeFilters.filter.sortBy = propertyName;
  }

  pageIndexChange($event): void {
    this.yadeFilters.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.yadeFilters.entryPerPage = $event;
  }


  currentPageDataChange($event): void {
    this.currentData = $event;
  }

  searchInResult(): void {
    this.data = this.yadeFilters.searchText ? this.searchPipe.transform(this.fileTransfers, this.yadeFilters.searchText, this.searchableProperties) : this.fileTransfers;
    this.data = [...this.data];
  }

  changeController(): void {
    this.load();
  }

  loadYadeFiles(type, value): void {
    this.showSearchPanel = false;
    if (type === 'DATE') {
      this.yadeFilters.filter.date = value;

    } else if (type === 'STATE') {
      this.yadeFilters.filter.states = value;
    }
    if (!this.yadeFilters.filter.date) {
      this.yadeFilters.filter.date = 'today';
    }
    if (!this.yadeFilters.filter.states) {
      this.yadeFilters.filter.states = 'ALL';
    }
    this.load();
  }

  load(): void {
    this.isLoaded = true;
    if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
      this.isCustomizationSelected(true);
    }
    let obj: any = {
      controllerId: this.yadeView.current == true ? this.schedulerIds.selected : '',
      limit : parseInt(this.preferences.maxRecords, 10),
      compact: true
    };
    if (this.showFiles) {
      obj.compact = false;
    }
    if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
      this.fileTransferService.getRequestForSearch(this.selectedFiltered, obj, this.preferences);
    } else {
      if (this.yadeFilters.filter.states && this.yadeFilters.filter.states != 'ALL') {
        obj.states = [];
        obj.states.push(this.yadeFilters.filter.states);
      }
      obj = this.setDateRange(obj);
    }
    obj.timeZone = this.preferences.zone;
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, obj.dateFrom)._d;
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, obj.dateTo)._d;
    }
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      this.fileTransfers = res.transfers || [];
      if (this.showFiles) {
        this.fileTransfers.forEach((transfer) => {
          transfer.show = true;
          this.getFiles(transfer);
        });
      }
      this.searchInResult();
      this.isLoading = true;
      this.setHeaderWidth();

    }, () => this.isLoading = true);
  }

  getTransfer(transfer): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      transferIds: [transfer.id]
    };
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      if (res.transfers && res.transfers.length > 0) {
        transfer.states = res.transfers[0].states;
        transfer.operations = res.transfers[0].operations;
        transfer.hasIntervention = res.transfers[0].hasIntervention;
        transfer.isIntervention = res.transfers[0].isIntervention;
        transfer.source = res.transfers[0].source;
        transfer.target = res.transfers[0].target;
        transfer.profile = res.transfers[0].profile;
        transfer.taskId = res.transfers[0].taskId;
      }
    });
  }

  getFiles(value): void {
    const self = this;
    value.widthArr = [];
    value.loading = true;
    this.coreService.post('yade/files', {
      transferIds: [value.id],
      controllerId: value.controllerId || this.schedulerIds.selected
    }).subscribe((res: any) => {
      value.files = res.files;
      value.loading = false;
      value.widthArr = [...this.coreService.calFileTransferRowWidth()];
      setTimeout(() => {
        const dom = $('#fileTransferMainTable');
        dom.find('thead tr.main-header-row th').each(function(i) {
          $(this).css('width', self.widthArr[i] + 'px');
        });
      }, 0);

    }, () => {
      value.loading = false;
    });
  }


  showTransferFuc(value): void {
    value.show = true;
    if (!value.target) {
      const obj = {
        controllerId: value.controllerId || this.schedulerIds.selected,
        transferIds: [value.id]
      };
      this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
        value = extend(value, res.transfers[0]);
      });
    }
    this.getFiles(value);
  }

  search(): void {
    this.isLoaded = false;
    let filter: any = {
      controllerId: this.yadeView.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxRecords, 10),
      compact : true
    };

    this.yadeFilters.filter.states = '';
    this.yadeFilters.filter.date = '';

    this.fileTransferService.getRequestForSearch(this.searchFilter, filter, this.preferences);
    this.coreService.post('yade/transfers', filter).subscribe((res: any) => {
      this.fileTransfers = res.transfers;
      this.searchInResult();
      this.isLoaded = true;
      this.setHeaderWidth();
    }, () => {
      this.isLoaded = true;
    });
  }

  checkSharedFilters(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE',
      shared: true
    };
    this.coreService.post('configurations', obj).subscribe((res: any) => {
      if (res.configurations && res.configurations.length > 0) {
        this.filterList = res.configurations;
      }
      this.getYadeCustomizations();
    }, () => {
      this.filterList = [];
      this.getYadeCustomizations();
    });
  }

  getYadeCustomizations(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE'
    };
    this.coreService.post('configurations', obj).subscribe((res: any) => {
      if (this.filterList && this.filterList.length > 0) {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = this.filterList.concat(res.configurations);
        }
        const data = [];
        for (let i = 0; i < this.filterList.length; i++) {
          let flag = true;
          for (let j = 0; j < data.length; j++) {
            if (data[j].account == this.filterList[i].account && data[j].name == this.filterList[i].name) {
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
          if (value.id == this.savedFilter.selected) {
            flag = false;
            this.coreService.post('configuration', {
              controllerId: value.controllerId,
              id: value.id
            }).subscribe((conf: any) => {
              this.loadConfig = true;
              this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
              this.selectedFiltered.account = value.account;
              this.load();
            });
          }
        });
        if (flag) {
          this.savedFilter.selected = undefined;
          this.loadConfig = true;
          this.load();
        }
      } else {
        this.loadConfig = true;
        this.savedFilter.selected = undefined;
        this.load();
      }
    }, () => {
      this.loadConfig = true;
      this.savedFilter.selected = undefined;
      this.load();
    });
  }

  expandDetails(): void {
    this.showFiles = true;
    this.yadeFilters.showFiles = true;
    this.data.forEach((value) => {
      this.showTransferFuc(value);
    });
  }

  collapseDetails(): void {
    this.showFiles = false;
    this.yadeFilters.showFiles = false;
    this.data.forEach((value) => {
      value.show = false;
    });
  }

  /* ------------- Advance search ------------------- */
  advancedSearch(): void {
    this.showSearchPanel = true;
    this.searchFilter = {
      radio: 'current',
      planned: 'today',
      from: new Date().setHours(0, 0, 0, 0),
      to: new Date(),
    };
  }

  cancel(): void {
    this.searchFilter = {};
    this.showSearchPanel = false;
    if (!this.yadeFilters.filter.states) {
      this.yadeFilters.filter.states = 'ALL';
    }
    if (!this.yadeFilters.filter.date) {
      this.yadeFilters.filter.date = 'today';
    }

    this.load();
  }

  saveAsFilter(): void {
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE',
      id: 0,
      name: this.searchFilter.name,
      configurationItem: JSON.stringify(this.searchFilter)
    };
    this.coreService.post('configuration/save', configObj).subscribe((res: any) => {
      configObj.id = res.id;
      this.searchFilter.name = '';
      this.filterList.push(configObj);
    });
  }

  /* ---- Customization Begin------ */
  createCustomization(): void {
    this.modal.create({
      nzTitle: null,
      nzContent: FilterModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        permission: this.permission,
        allFilter: this.filterList,
        new: true
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  editFilters(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: EditFilterModalComponent,
      nzComponentParams: {
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

  action(type, obj, self): void {
    if (type === 'DELETE') {
      if (self.savedFilter.selected === obj.id) {
        self.savedFilter.selected = undefined;
        self.isCustomizationSelected(false);
        self.yadeFilters.selectedView = false;
        self.selectedFiltered = {};
        self.setDateRange(null);
        self.load();
      } else {
        if (self.filterList.length == 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.yadeFilters.selectedView = false;
          self.selectedFiltered = {};
        }
      }
      self.saveService.setYade(self.savedFilter);
      self.saveService.save();
    } else if (type === 'MAKEFAV') {
      self.savedFilter.favorite = obj.id;
      self.yadeFilters.selectedView = true;
      self.saveService.setYade(self.savedFilter);
      self.saveService.save();
      self.load();
    } else if (type === 'REMOVEFAV') {
      self.savedFilter.favorite = '';
      self.saveService.setYade(self.savedFilter);
      self.saveService.save();
    }
  }

  changeFilter(filter): void {
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.yadeFilters.selectedView = true;
      this.coreService.post('configuration',
        {
          controllerId: filter.controllerId,
          id: filter.id
        }).subscribe((conf: any) => {
        this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
        this.selectedFiltered.account = filter.account;
        this.load();
      });
    } else {
      this.isCustomizationSelected(false);
      this.savedFilter.selected = filter;
      this.yadeFilters.selectedView = false;
      this.selectedFiltered = filter;
      this.load();
    }

    this.saveService.setYade(this.savedFilter);
    this.saveService.save();
  }

  navToWorkflowTab(workflow): void {
    this.coreService.getConfigurationTab().inventory.expand_to = [];
    this.coreService.getConfigurationTab().inventory.selectedObj = {
      name: workflow.substring(workflow.lastIndexOf('/') + 1),
      path: workflow.substring(0, workflow.lastIndexOf('/')) || '/',
      type: 'WORKFLOW'
    };
    this.router.navigate(['/configuration/inventory']);
  }

  private setHeaderWidth(): void {
    const self = this;
    setTimeout(() => {
      self.widthArr = [];
      const dom = $('#fileTransferMainTable');
      dom.find('thead tr.main-header-row th').each(function() {
        self.widthArr.push($(this).outerWidth());
      });
    }, 0);
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.yadeFilters = this.coreService.getYadeTab();
    this.yadeView.current = this.preferences.fileTransfer == 'current';
    this.savedFilter = JSON.parse(this.saveService.yadeFilters) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    if (this.yadeFilters.showFiles != undefined) {
      this.showFiles = this.yadeFilters.showFiles;
    } else {
      this.showFiles = this.preferences.showFiles;
    }

    if (!this.yadeFilters.filter.states) {
      this.yadeFilters.filter.states = 'ALL';
    }

    if (!this.yadeFilters.filter.date) {
      this.yadeFilters.filter.date = 'today';
    }

    if (this.schedulerIds.selected && this.permission.joc && this.permission.joc.administration.customization.view) {
      this.checkSharedFilters();
    } else {
      this.loadConfig = true;
      this.load();
    }
  }

  private editFilter(filter): void {
    this.openFilterModal(filter, false);
  }

  private copyFilter(filter): void {
    this.openFilterModal(filter, true);
  }

  /* ---- End Customization ------ */

  private openFilterModal(filter, isCopy): void {
    let filterObj: any = {};
    this.coreService.post('configuration', {controllerId: filter.controllerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      if (isCopy) {
        filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);
      } else {
        filterObj.id = filter.id;
      }
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: FilterModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
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

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].objectType === 'OTHER') {
          if (args.eventSnapshots[j].eventType == 'YADETransferStarted') {
            this.load();
            break;
          } else if (args.eventSnapshots[j].eventType == 'YADETransferUpdated') {
            for (let x = 0; x < this.fileTransfers.length; x++) {
              if (this.fileTransfers[x].id == args.eventSnapshots[j].path) {
                this.getTransfer(this.fileTransfers[x]);
                break;
              }
            }
          } else if (args.eventSnapshots[j].eventType == 'YADEFileStateChanged') {
            for (let x = 0; x < this.fileTransfers.length; x++) {
              if (this.fileTransfers[x].id == args.eventSnapshots[j].path && this.fileTransfers[x].show) {
                this.getFiles(this.fileTransfers[x]);
                break;
              }
            }
          }
          break;
        }
      }
    }
  }

  private setDateRange(filter): any {
    if (this.yadeFilters.filter.date == 'all') {

    } else if (this.yadeFilters.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else {
      filter.dateFrom = this.yadeFilters.filter.date;
    }
    return filter;
  }

  private isCustomizationSelected(flag): void {
    if (flag) {
      this.temp_filter.states = clone(this.yadeFilters.filter.states);
      this.temp_filter.date = clone(this.yadeFilters.filter.date);
      this.yadeFilters.filter.states = '';
      this.yadeFilters.filter.date = '';
    } else {
      if (this.temp_filter.states) {
        this.yadeFilters.filter.states = clone(this.temp_filter.states);
        this.yadeFilters.filter.date = clone(this.temp_filter.date);
      } else {
        this.yadeFilters.filter.states = 'ALL';
        this.yadeFilters.filter.date = 'today';
      }
    }
  }

}
