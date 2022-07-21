import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {isEmpty, extend, clone, sortBy} from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';
import {SearchPipe, OrderPipe} from '../../pipes/core.pipe';
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
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
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
  workflowTree: any = [];

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
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.allhosts = this.coreService.getProtocols();
    this.getFolderTree();
    if (!this.filter.profiles) {
      this.filter.profiles = [];
    } else {
      let profiles = [];
      this.filter.profiles.forEach((name) => {
        profiles.push({name});
      });
      this.filter.profiles = profiles;
    }
    if (this.filter.profiles.length === 0) {
      this.addProfile();
    }

    if (!this.filter.sourceFiles) {
      this.filter.sourceFiles = [];
    } else {
      let sourceFiles = [];
      this.filter.sourceFiles.forEach((name) => {
        sourceFiles.push({name});
      });
      this.filter.sourceFiles = sourceFiles;
    }
    if (this.filter.sourceFiles.length === 0) {
      this.addSourcePath();
    }

    if (!this.filter.targetFiles) {
      this.filter.targetFiles = [];
    } else {
      let targetFiles = [];
      this.filter.targetFiles.forEach((name) => {
        targetFiles.push({name});
      });
      this.filter.targetFiles = targetFiles;
    }
    if (this.filter.targetFiles.length === 0) {
      this.addTargetPath();
    }

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

  getFolderTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      forInventory: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.workflowTree = this.coreService.prepareTree(res, false);
      if (this.filter.workflowNames && this.filter.workflowNames.length > 0) {
        this.filter.workflowNames.forEach(name => {
          const obj = {
            name: name,
            title: name,
            key: name,
            isSelected: true,
            isLeaf: true,
            type: 'WORKFLOW',
            objectType: 'WORKFLOW',
            notExist: true,
            path: '/' + name
          };
          this.workflowTree[0].children.push(obj);
        })
      }
    });
  }

  loadWorkflow(node, $event): void {
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
        this.loadWorkflowObjects(node.origin, {
          path: node.key,
          objectTypes: ['WORKFLOW']
        });
      }
    }
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13 || $event.which === '32' || $event.which === 32) {
      let val = $event.target.value;
      if (!this.filter.workflowNames) {
        this.filter.workflowNames = [];
      }
      if (this.filter.workflowNames.indexOf(val) === -1) {
        const obj = {
          name: val,
          title: val,
          key: val,
          isSelected: true,
          isLeaf: true,
          type: 'WORKFLOW',
          objectType: 'WORKFLOW',
          notExist: true,
          path: '/' + val
        };
        this.workflowTree[0].children.push(obj);
        this.filter.workflowNames.push(val);
        this.filter.workflowNames = [...this.filter.workflowNames];
        this.workflowTree = [...this.workflowTree];
      }
      $event.preventDefault();
    }
  }

  private loadWorkflowObjects(node, obj): void {
    this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
      let data = res.workflows;
      data = sortBy(data, (i: any) => {
        return i.name.toLowerCase();
      });
      for (let i = 0; i < data.length; i++) {
        const path = obj.path + (obj.path === '/' ? '' : '/') + data[i].name;
        data[i].title = data[i].name;
        data[i].path = path;
        data[i].type = 'WORKFLOW';
        data[i].key = data[i].name;
        data[i].isLeaf = true;
      }
      if (node.children && node.children.length > 0) {
        data = data.concat(node.children);
      }
      if (node.isLeaf) {
        node.expanded = true;
      }
      node.isLeaf = false;
      node.children = data;
      this.workflowTree = [...this.workflowTree];
      if (this.filter.workflowNames) {
        this.filter.workflowNames = [...this.filter.workflowNames];
      }
    });
  }

  addProfile(): void {
    if (!this.coreService.isLastEntryEmpty(this.filter.profiles, 'name', '')) {
      this.filter.profiles.push({name: ''});
    }
  }

  removeProfile(index): void {
    this.filter.profiles.splice(index, 1)
  }

  addSourcePath(): void {
    if (!this.coreService.isLastEntryEmpty(this.filter.sourceFiles, 'name', '')) {
      this.filter.sourceFiles.push({name: ''});
    }
  }

  removeSourcePath(index): void {
    this.filter.sourceFiles.splice(index, 1)
  }

  addTargetPath(): void {
    if (!this.coreService.isLastEntryEmpty(this.filter.targetFiles, 'name', '')) {
      this.filter.targetFiles.push({name: ''});
    }
  }

  removeTargetPath(index): void {
    this.filter.targetFiles.splice(index, 1)
  }

  selectTime(time, isEditor = false, val = 'from'): void {
    this.coreService.selectTime(time, isEditor, this.filter, val);
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.authService.currentUserData === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
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
    if (obj.profiles && obj.profiles.length > 0) {
      obj.profiles = [];
      result.profiles.forEach((item) => {
        if (item.name) {
          obj.profiles.push(item.name);
        }
      })
    }
    if (obj.sourceFiles && obj.sourceFiles.length > 0) {
      obj.sourceFiles = [];
      result.sourceFiles.forEach((item) => {
        if (item.name) {
          obj.sourceFiles.push(item.name);
        }
      })
    }
    if (obj.targetFiles && obj.targetFiles.length > 0) {
      obj.targetFiles = [];
      result.targetFiles.forEach((item) => {
        if (item.name) {
          obj.targetFiles.push(item.name);
        }
      })
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
      if (res) {
        this.refresh(res);
      }
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
      compact: false,
      transferId: transferId
    };
    this.coreService.post('yade/transfer', obj).subscribe({
      next: (result: any) => {
        this.fileTransfers = [result];
        this.loading = true;
        this.setHeaderWidth();
      }, error: () => this.loading = true
    });
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
        dom.find('thead tr.main-header-row th').each(function (i) {
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
      dom.find('thead tr.main-header-row th').each(function () {
        self.widthArr.push($(this).outerWidth());
      });
    }, 0);
  }

  private init(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getFileTransferById(this.transferId);
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
  searchFilter: any = {};
  savedFilter: any = {};
  selectedFiltered: any = {};
  filterList: any = [];
  fileTransfers: any = [];
  data = [];
  widthArr = [];
  dateFormat: any;
  temp_filter: any = {};
  searchKey: string;
  showFiles = false;
  isLoaded = false;
  loadConfig = false;
  showSearchPanel = false;
  reloadState = 'no';

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  searchableProperties = ['controllerId', 'profile', 'start', 'end', '_operation', 'numOfFiles', 'workflowPath', 'orderId'];

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService, private fileTransferService: FileTransferService,
              private router: Router, private orderPipe: OrderPipe, private searchPipe: SearchPipe, private dataService: DataService, private modal: NzModalService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
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
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  sort(propertyName): void {
    this.yadeFilters.reverse = !this.yadeFilters.reverse;
    this.yadeFilters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.yadeFilters.filter.sortBy, this.yadeFilters.reverse);
  }

  pageIndexChange($event): void {
    this.yadeFilters.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.yadeFilters.entryPerPage = $event;
  }

  searchInResult(): void {
    this.fileTransfers = this.orderPipe.transform(this.fileTransfers, this.yadeFilters.filter.sortBy, this.yadeFilters.reverse);
    this.data = this.yadeFilters.searchText ? this.searchPipe.transform(this.fileTransfers, this.yadeFilters.searchText, this.searchableProperties) : this.fileTransfers;
    this.data = [...this.data];
    if (this.fileTransfers.length === 0) {
      this.yadeFilters.currentPage = 1;
    }
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
    this.reloadState = 'no';
    if (this.selectedFiltered && !isEmpty(this.selectedFiltered)) {
      this.isCustomizationSelected(true);
    }
    let obj: any = {
      controllerId: this.yadeFilters.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxFileTransferRecords, 10) || 5000,
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
    this.coreService.post('yade/transfers', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.isLoaded = true;
        this.fileTransfers = res.transfers || [];
        if (this.showFiles) {
          this.fileTransfers.forEach((transfer) => {
            transfer.show = true;
            this.getFiles(transfer);
          });
        }
        this.searchInResult();
        this.setHeaderWidth();
      }, error: () => this.isLoaded = true
    });
  }

  getTransfer(transfer): void {
    const obj = {
      transferId: transfer.id
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
    }).subscribe({
      next: (res: any) => {
        value.files = res.files;
        value.loading = false;
        value.widthArr = [...this.coreService.calFileTransferRowWidth()];
        setTimeout(() => {
          const dom = $('#fileTransferMainTable');
          dom.find('thead tr.main-header-row th').each(function (i) {
            $(this).css('width', self.widthArr[i] + 'px');
          });
        }, 0);

      }, error: () => value.loading = false
    });
  }


  showTransferFuc(value): void {
    value.show = true;
    if (!value.target) {
      const obj = {
        compact: false,
        transferId: value.id
      };
      this.coreService.post('yade/transfer', obj).subscribe((res: any) => {
        value = extend(value, res);
      });
    }
    this.getFiles(value);
  }

  search(): void {
    this.isLoaded = false;
    let filter: any = {
      controllerId: this.yadeFilters.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxFileTransferRecords, 10) || 5000,
      compact: true
    };

    this.yadeFilters.filter.states = '';
    this.yadeFilters.filter.date = '';
    this.fileTransferService.getRequestForSearch(this.searchFilter, filter, this.preferences);
    this.coreService.post('yade/transfers', filter).subscribe({
      next: (res: any) => {
        this.isLoaded = true;
        this.fileTransfers = res.transfers;
        this.searchInResult();
        this.setHeaderWidth();
      }, error: () => this.isLoaded = true
    });
  }

  checkSharedFilters(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE',
      shared: true
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res: any) => {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = res.configurations;
        }
        this.getYadeCustomizations();
      }, error: () => {
        this.filterList = [];
        this.getYadeCustomizations();
      }
    });
  }

  getYadeCustomizations(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE'
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
      }, error: () => {
        this.loadConfig = true;
        this.savedFilter.selected = undefined;
        this.load();
      }
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
      fromDate: new Date(),
      fromTime: '00:00:00',
      toDate: new Date(),
      toTime: '23:59:59',
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
      nzClosable: false,
      nzMaskClosable: false
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
      nzClosable: false,
      nzMaskClosable: false
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
      this.selectedFiltered = {};
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
    this.router.navigate(['/configuration/inventory']).then()
  }

  private setHeaderWidth(): void {
    const self = this;
    setTimeout(() => {
      self.widthArr = [];
      const dom = $('#fileTransferMainTable');
      dom.find('thead tr.main-header-row th').each(function () {
        self.widthArr.push($(this).outerWidth());
      });
    }, 0);
  }

  private init(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.yadeFilters = this.coreService.getYadeTab();
    if (!(this.yadeFilters.current || this.yadeFilters.current === false)) {
      this.yadeFilters.current = this.preferences.currentController;
    }
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
        nzClosable: false,
        nzMaskClosable: false
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

  reload(): void {
    if (this.reloadState === 'no') {
      this.fileTransfers = [];
      this.data = [];
      this.reloadState = 'yes';
      this.isLoaded = true;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.isLoaded = false;
      this.load();
    }
  }

}
