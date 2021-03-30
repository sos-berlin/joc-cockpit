import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import * as _ from 'underscore';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';
import {SearchPipe} from '../../pipes/core.pipe';
import {ActivatedRoute} from '@angular/router';

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

  constructor(private authService: AuthService, public activeModal: NgbActiveModal) {
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
      this.name = _.clone(this.filter.name);
    }
  }

  cancel(obj): void {
    if (obj) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.dismiss('');
    }
  }

}

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.html',
})
export class SearchComponent implements OnInit {

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
  allhosts: any;
  sourceProtocol: any = [];
  targetProtocol: any = [];

  stateOptions = [
    {status: 'SUCCESSFUL', text: 'successful'},
    {status: 'FAILED', text: 'failed'},
    {status: 'INCOMPLETE', text: 'incomplete'}
  ];

  operationOptions = [
    {status: 'COPY', text: 'copy'},
    {status: 'MOVE', text: 'move'},
    {status: 'GETLIST', text: 'getList'},
    {status: 'RENAME', text: 'rename'}
  ];

  constructor(public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.allhosts = this.coreService.getProtocols();
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.permission.user === this.allFilter[i].account && this.filter.name !== this.existingName) {
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
    console.log(result);
    this.submitted = true;
    let configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'DAILYPLAN',
      name: result.name,
      shared: result.shared,
      id: 0,
      configurationItem: {}
    };
    let fromDate: any;
    let toDate: any;
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.jobChain = result.jobChain;
    obj.orderId = result.orderId;
    obj.job = result.job;
    obj.state = result.state;
    obj.name = result.name;
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
      configObj.id = res.id;
      this.allFilter.push(configObj);
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
  dateFormat: any;
  temp_filter: any = {};
  searchKey: string;
  showFiles = false;
  isLoading = false;
  isLoaded = false;
  loading = false;
  loadConfig = false;
  showSearchPanel = false;
  object: any = {
    mapOfCheckedId: new Map(),
    checked: false,
    indeterminate: false
  };
  subscription1: Subscription;
  subscription2: Subscription;

  searchableProperties = ['controllerId', 'profile', 'mandator', 'start', 'end', 'operation', 'numOfFiles', 'source', 'target'];

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private searchPipe: SearchPipe, private dataService: DataService, private modalService: NgbModal) {
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
    if (type === 'DATE') {
      this.yadeFilters.filter.date = value;

    } else if (type === 'STATE') {
      this.yadeFilters.filter.states = value;
    }
    this.load();
  }

  load(): void {
    this.isLoaded = true;
    const self = this;
    this.reset();
    if (!this.filterList) {
      this.checkSharedFilters();
      return;
    }
    if (this.selectedFiltered && !_.isEmpty(this.selectedFiltered)) {
      this.isCustomizationSelected(true);
    }
    let obj: any = {
      controllerId: this.yadeView.current == true ? this.schedulerIds.selected : ''
    };
    if (this.selectedFiltered && !_.isEmpty(this.selectedFiltered)) {
      if (this.selectedFiltered.states && this.selectedFiltered.states.length > 0) {
        obj.states = this.selectedFiltered.states;
      }
      if (this.selectedFiltered.profileId) {
        this.selectedFiltered.profileId = this.selectedFiltered.profileId.replace(/\s*(,|^|$)\s*/g, '$1');
        obj.profiles = this.selectedFiltered.profileId.split(',');
      }
      if (this.selectedFiltered.mandator) {
        obj.mandator = this.selectedFiltered.mandator;
      }
      if (this.selectedFiltered.operations && this.selectedFiltered.operations.length > 0) {
        obj.operations = this.selectedFiltered.operations;
      }
      if (this.selectedFiltered.sourceFileName) {
        this.selectedFiltered.sourceFileName = this.selectedFiltered.sourceFileName.replace(/\s*(,|^|$)\s*/g, '$1');
        obj.sourceFiles = this.selectedFiltered.sourceFileName.split(',');
      }
      if (this.selectedFiltered.targetFileName) {
        this.selectedFiltered.targetFileName = this.selectedFiltered.targetFileName.replace(/\s*(,|^|$)\s*/g, '$1');
        obj.targetFiles = this.selectedFiltered.targetFileName.split(',');
      }
      if (this.selectedFiltered.sourceHost || this.selectedFiltered.sourceProtocol) {
        let hosts = [];
        let protocols = [];
        if (this.selectedFiltered.sourceHost) {
          this.selectedFiltered.sourceHost = this.selectedFiltered.sourceHost.replace(/\s*(,|^|$)\s*/g, '$1');
          hosts = this.selectedFiltered.sourceHost.split(',');
        }
        if (this.selectedFiltered.sourceProtocol) {
          this.selectedFiltered.sourceProtocol = this.selectedFiltered.sourceProtocol.replace(/\s*(,|^|$)\s*/g, '$1');
          protocols = this.selectedFiltered.sourceProtocol.split(',');
        }
        obj.sources = this.coreService.mergeHostAndProtocol(hosts, protocols);
      }
      if (this.selectedFiltered.targetHost || this.selectedFiltered.targetProtocol) {
        let hosts = [];
        let protocols = [];
        if (this.selectedFiltered.targetHost) {
          this.selectedFiltered.targetHost = this.selectedFiltered.targetHost.replace(/\s*(,|^|$)\s*/g, '$1');
          hosts = this.selectedFiltered.targetHost.split(',');
        }
        if (this.selectedFiltered.targetProtocol) {
          this.selectedFiltered.targetProtocol = this.selectedFiltered.targetProtocol.replace(/\s*(,|^|$)\s*/g, '$1');
          protocols = this.selectedFiltered.targetProtocol.split(',');
        }
        obj.targets = this.coreService.mergeHostAndProtocol(hosts, protocols);
      }

      if (this.selectedFiltered.planned) {
        obj = this.parseProcessExecuted(this.selectedFiltered.planned, obj);
      }
    } else {
      if (this.yadeFilters.filter.states && this.yadeFilters.filter.states != 'ALL') {
        obj.states = [];
        obj.states.push(this.yadeFilters.filter.states);
      }
      obj = this.setDateRange(obj);
    }
    if (!this.showFiles) {
      obj.compact = true;
    }
    obj.timeZone = this.preferences.zone;
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      delete obj['timeZone'];
    }
    if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
      obj.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, obj.dateFrom);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, obj.dateTo);
    }
    obj.limit = parseInt(this.preferences.maxRecords, 10);
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      this.fileTransfers = res.transfers || [];
      this.fileTransfers.forEach((transfer) => {
        let id = transfer.controllerId || self.schedulerIds.selected;
        transfer.permission = self.authService.getPermission(id).YADE;
        if (this.showFiles) {
          transfer.show = true;
          this.getFiles(transfer);
        }
      });
      this.searchInResult();
      this.isLoading = true;
    }, () => this.isLoading = true);
  }

  getTransfer(transfer): void {
    let obj = {
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
        transfer.mandator = res.transfers[0].mandator;
        transfer.profile = res.transfers[0].profile;
        transfer.taskId = res.transfers[0].taskId;
      }
    });
  }

  getFiles(value): void {
    let ids = [value.id];
    this.coreService.post('yade/files', {
      transferIds: ids,
      controllerId: value.controllerId || this.schedulerIds.selected
    }).subscribe((res: any) => {
      value.files = res.files;
    });
  }

  checkAll(value: boolean): void {
    if (this.currentData.length > 0) {
      this.object.mapOfCheckedId.clear();
      let data = this.currentData;
      data.forEach(item => {
        if (item.state._text !== 'SUCCESSFUL') {
          console.log(item, 'item');
          item.indeterminate = false;
          if (value) {
            this.object.mapOfCheckedId.set(item.id, item);
          }
          if (item.files && item.files.length > 0) {
            item.files.forEach((file) => {
              file.checked = value;
              console.log(file, 'file')
            });
          }
        }
      });
    }
    if (!value) {
      this.reset();
    }
  }

  onItemChecked(transfer: any, checked: boolean): void {
    transfer.indeterminate = false;
    if (checked) {
      this.object.mapOfCheckedId.set(transfer.id, transfer);
    } else {
      this.object.mapOfCheckedId.delete(transfer.id);
    }
    if (transfer.files && transfer.files.length > 0) {
      transfer.files.forEach(file => {
        file.checked = checked;
      });
    }
    this.object.checked = this.object.mapOfCheckedId.size === this.currentData.length;
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  checkALLFilesFnc(transfer, checked: boolean): void {
    transfer.indeterminate = checked;
    let count = 0;
    transfer.files.forEach((item) => {
      if (item.checked) {
        ++count;
      }
    });

    if (count === transfer.files.length) {
      this.object.mapOfCheckedId.set(transfer.id, transfer);
    } else if (count === 0) {
      this.object.mapOfCheckedId.delete(transfer.id);
    } else {
      transfer.indeterminate = true;
    }
    this.object.checked = this.object.mapOfCheckedId.size === this.currentData.length;
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  showTransferFuc(value): void {
    let obj = {
      controllerId: value.controllerId || this.schedulerIds.selected,
      transferIds: [value.id]
    };
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      value = _.extend(value, res.transfers[0]);
      this.isLoading = true;
    }, () => this.isLoading = true);
    value.show = true;
    this.getFiles(value);
  }

  search(): void {
    this.isLoaded = false;
    let filter: any = {
      controllerId: this.yadeView.current == true ? this.schedulerIds.selected : '',
      limit: parseInt(this.preferences.maxRecords, 10)
    };

    this.yadeFilters.filter.states = '';
    this.yadeFilters.filter.date = '';

    if (this.searchFilter.states && this.searchFilter.states.length > 0) {
      filter.states = this.searchFilter.states;
    }
    if (this.searchFilter.operations && this.searchFilter.operations.length > 0) {
      filter.operations = this.searchFilter.operations;
    }
    if (this.searchFilter.profileId) {
      this.searchFilter.profileId = this.searchFilter.profileId.replace(/\s*(,|^|$)\s*/g, '$1');
      filter.profiles = this.searchFilter.profileId.split(',');
    }

    if (this.searchFilter.mandator) {
      filter.mandator = this.searchFilter.mandator;
    }

    if (this.searchFilter.sourceFileName) {
      this.searchFilter.sourceFileName = this.searchFilter.sourceFileName.replace(/\s*(,|^|$)\s*/g, '$1');
      filter.sourceFiles = this.searchFilter.sourceFileName.split(',');
    }
    if (this.searchFilter.targetFileName) {
      this.searchFilter.targetFileName = this.searchFilter.targetFileName.replace(/\s*(,|^|$)\s*/g, '$1');
      filter.targetFiles = this.searchFilter.targetFileName.split(',');
    }
    if (this.searchFilter.sourceHost || this.searchFilter.sourceProtocol) {
      let hosts = [];
      let protocols = [];
      if (this.searchFilter.sourceHost) {
        this.searchFilter.sourceHost = this.searchFilter.sourceHost.replace(/\s*(,|^|$)\s*/g, '$1');
        hosts = this.searchFilter.sourceHost.split(',');
      }
      if (this.searchFilter.sourceProtocol) {

        protocols = this.searchFilter.sourceProtocol;
      }
      filter.sources = this.coreService.mergeHostAndProtocol(hosts, protocols);

    }
    if (this.searchFilter.targetHost || this.searchFilter.targetProtocol) {
      let hosts = [];
      let protocols = [];
      if (this.searchFilter.targetHost) {
        this.searchFilter.targetHost = this.searchFilter.targetHost.replace(/\s*(,|^|$)\s*/g, '$1');
        hosts = this.searchFilter.targetHost.split(',');
      }
      if (this.searchFilter.targetProtocol) {

        protocols = this.searchFilter.targetProtocol;
      }
      filter.targets = this.coreService.mergeHostAndProtocol(hosts, protocols);
    }
    if (this.searchFilter.radio == 'planned') {
      filter = this.parseProcessExecuted(this.searchFilter.planned, filter);
    } else {
      if (this.searchFilter.radio == 'current' && this.searchFilter.from) {
        let fromDate = new Date(this.searchFilter.from);
        if (this.searchFilter.fromTime) {
          fromDate.setHours(this.searchFilter.fromTime.getHours());
          fromDate.setMinutes(this.searchFilter.fromTime.getMinutes());
          fromDate.setSeconds(this.searchFilter.fromTime.getSeconds());
        } else {
          fromDate.setHours(0);
          fromDate.setMinutes(0);
          fromDate.setSeconds(0);
        }
        fromDate.setMilliseconds(0);
        filter.dateFrom = fromDate;
      }
      if (this.searchFilter.radio == 'current' && this.searchFilter.to) {
        let toDate = new Date(this.searchFilter.to);
        if (this.searchFilter.toTime) {
          toDate.setHours(this.searchFilter.toTime.getHours());
          toDate.setMinutes(this.searchFilter.toTime.getMinutes());
          toDate.setSeconds(this.searchFilter.toTime.getSeconds());
        } else {
          toDate.setHours(0);
          toDate.setMinutes(0);
          toDate.setSeconds(0);
        }
        toDate.setMilliseconds(0);
        filter.dateTo = toDate;
      }
    }

    if (this.searchFilter.controllerId) {
      filter.controllerId = this.searchFilter.controllerId;
    }

    filter.timeZone = this.preferences.zone;
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      delete filter['timeZone'];
    }
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
      filter.dateFrom = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateFrom);
    }
    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      filter.dateTo = this.coreService.convertTimeToLocalTZ(this.preferences, filter.dateTo);
    }
    this.coreService.post('yade/transfers', filter).subscribe((res: any) => {
      this.fileTransfers = res.transfers;
      this.searchInResult();
      this.loading = false;
      this.isLoaded = true;
    }, () => {
      this.loading = false;
      this.isLoaded = true;
    });
  }


  private init(): void {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.yadeFilters = this.coreService.getYadeTab();
    this.yadeView.current = this.preferences.fileTransfer == 'current';
    this.savedFilter = JSON.parse(this.saveService.yadeFilters) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    if (this.yadeFilters.showFiles != undefined) {
      this.showFiles = this.yadeFilters.showFiles;
    } else {
      this.showFiles = this.preferences.showFiles;
    }

    this.checkSharedFilters();
  }


  checkSharedFilters(): void {
    if (this.permission && this.permission.JOCConfigurations && this.permission.JOCConfigurations.share.view) {
      let obj = {
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
    } else {
      this.filterList = [];
      this.getYadeCustomizations();
    }
  }

  getYadeCustomizations(): void {
    let obj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'YADE'
    };
    this.coreService.post('configurations', obj).subscribe((res: any) => {
      if (this.filterList && this.filterList.length > 0) {
        if (res.configurations && res.configurations.length > 0) {
          this.filterList = this.filterList.concat(res.configurations);
        }
        let data = [];
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

    }, (err) => {
      this.loadConfig = true;
      this.savedFilter.selected = undefined;
      this.load();
    });
  }

  expandDetails(): void {
    this.showFiles = true;
    this.yadeFilters.showFiles = true;
    this.load();
  }

  collapseDetails(): void {
    this.showFiles = false;
    this.yadeFilters.showFiles = false;
    this.fileTransfers.forEach((value) => {
      value.show = false;
    });
  }

  /** ------------------Action------------------- */

  restartAllTransfer(): void {
    this.coreService.post('yade/transfers/restart', {
      transferIds: this.object.mapOfCheckedId.keys(),
      controllerId: this.schedulerIds.selected
    }).subscribe((res: any) => {

    });
  }

  restartTransfer(data): void {
    this.coreService.post('yade/transfers/restart', {
      transferIds: [data.id],
      controllerId: this.schedulerIds.selected
    }).subscribe((res: any) => {

    });
  }

  /* ------------- Advance search ------------------- */
  advancedSearch(): void {
    this.showSearchPanel = true;
    this.searchFilter = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      to: new Date(),
      toTime: new Date(),
      paths: [],
      state: []
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
    let configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
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
    const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.allFilter = this.filterList;
    modalRef.componentInstance.new = true;
    modalRef.result.then((configObj) => {
      if (this.filterList.length == 1) {
        this.savedFilter.selected = configObj.id;
        this.yadeFilters.selectedView = true;
        this.selectedFiltered = configObj;
        this.isCustomizationSelected(true);
        this.load();
        this.saveService.setYade(this.savedFilter);
        this.saveService.save();
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editFilters(): void {
    const modalRef = this.modalService.open(EditFilterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.filterList = this.filterList;
    modalRef.componentInstance.favorite = this.savedFilter.favorite;
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.username = this.permission.user;
    modalRef.componentInstance.action = this.action;
    modalRef.componentInstance.self = this;
    modalRef.result.then((obj) => {
      if (obj.type === 'EDIT') {
        this.editFilter(obj);
      } else if (obj.type === 'COPY') {
        this.copyFilter(obj);
      }
    }, () => {

    });
  }

  action(type, obj, self): void {
    if (type === 'DELETE') {
      if (self.savedFilter.selected === obj.id) {
        self.savedFilter.selected = undefined;
        self.isCustomizationSelected(false);
        self.yadeFilters.selectedView = false;
        self.selectedFiltered = undefined;
        self.setDateRange(null);
        self.load();
      } else {
        if (self.filterList.length == 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.yadeFilters.selectedView = false;
          self.selectedFiltered = undefined;
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

  private editFilter(filter): void {
    this.openFilterModal(filter, false);
  }

  private copyFilter(filter): void {
    this.openFilterModal(filter, true);
  }

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
      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.allFilter = this.filterList;
      modalRef.componentInstance.filter = filterObj;
      modalRef.componentInstance.edit = !isCopy;
      modalRef.result.then(() => {

      }, () => {

      });
    });
  }

  /* ---- End Customization ------ */

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

  private reset(): void {
    this.object = {
      mapOfCheckedId: new Map(),
      checked: false,
      indeterminate: false
    };
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
      this.temp_filter.states = _.clone(this.yadeFilters.filter.states);
      this.temp_filter.date = _.clone(this.yadeFilters.filter.date);
      this.yadeFilters.filter.states = '';
      this.yadeFilters.filter.date = '';
    } else {
      if (this.temp_filter.states) {
        this.yadeFilters.filter.states = _.clone(this.temp_filter.states);
        this.yadeFilters.filter.date = _.clone(this.temp_filter.date);
      } else {
        this.yadeFilters.filter.states = 'ALL';
        this.yadeFilters.filter.date = 'today';
      }
    }
  }

  private parseProcessExecuted(regex, obj): void {
    let fromDate, toDate, date, arr;

    if (/^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      fromDate = /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.exec(regex)[0];

    } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
      let seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2], 10);
      fromDate.setSeconds(toDate.getSeconds() - seconds);
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      fromDate = '0d';
      toDate = '0d';
    } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
      fromDate = '-1d';
      toDate = '0d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      fromDate = new Date();
      toDate = new Date();
    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
      date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
      arr = date[0].split('to');
      fromDate = arr[0].trim();
      toDate = arr[1].trim();

    } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(regex)) {
      let time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(regex);
      fromDate = new Date();
      if (/(pm)/i.test(time[3]) && parseInt(time[1]) != 12, 10) {
        fromDate.setHours(parseInt(time[1]) - 12, 10);
      } else {
        fromDate.setHours(parseInt(time[1], 10));
      }

      fromDate.setMinutes(parseInt(time[2], 10));
      toDate = new Date();
      if (/(pm)/i.test(time[6]) && parseInt(time[4]) != 12, 10) {
        toDate.setHours(parseInt(time[4]) - 12, 10);
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

}
