import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../components/guard';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';

import * as moment from 'moment';
import * as _ from 'underscore';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './filter-dialog.html',
})

export class FilterModalComponent implements OnInit {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};

  @Input() allFilter;
  @Input() new;
  @Input() edit;
  @Input() filter;

  name: string;

  constructor(private authService: AuthService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
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

  cancel(obj) {
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

  constructor(public coreService: CoreService) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.allhosts = this.coreService.getProtocols();
  }

  checkFilterName() {
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

  removedTargetProtocol(value: any): void {
    this.filter.targetProtocol.splice(this.filter.targetProtocol.indexOf(value.text), 1);
  }

  selectedSourceProtocol(value: any): void {
    if (!this.filter.targetProtocol) {
      this.filter.sourceProtocol = [];
    }
    this.filter.sourceProtocol.push(value.text);
  }

  removedSourceProtocol(value: any): void {
    this.filter.sourceProtocol.splice(this.filter.sourceProtocol.indexOf(value.text), 1);
  }

  onSubmit(result): void {
    console.log(result);

    this.submitted = true;
    let configObj = {
      jobschedulerId: this.schedulerIds.selected,
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

  search() {
    this.onSearch.emit();
  }

  cancel() {
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
  object: any = {files: [], fileTransfers: []};
  searchFilter: any = {};
  savedFilter: any = {};
  selectedFiltered: any = {};
  filterList: any = [];
  fileTransfers: any = [];
  subscription1: Subscription;
  subscription2: Subscription;

  dateFormat: any;
  checkAllFileTransfers: any = {checkbox: false};
  temp_filter: any = {};
  searchKey: string;

  showFiles = false;
  isLoading = false;
  isLoaded = false;
  loading = false;
  loadConfig = false;
  showSearchPanel = false;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService, private dataService: DataService, private modalService: NgbModal) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  sortBy(propertyName) {
    this.yadeFilters.reverse = !this.yadeFilters.reverse;
    this.yadeFilters.filter.sortBy = propertyName.key;
  }

  pageIndexChange($event) {
    this.yadeFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.yadeFilters.entryPerPage = $event;
  }

  changeJobScheduler() {
    this.load();
  }

  loadYadeFiles(type, value) {
    if (type === 'DATE') {
      this.yadeFilters.filter.date = value;

    } else if (type === 'STATE') {
      this.yadeFilters.filter.states = value;
    }
    this.load();
  }

  load() {
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
    let obj: any = {};

    obj.jobschedulerId = this.yadeView.current == true ? this.schedulerIds.selected : '';

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
      obj.dateFrom = moment(obj.dateFrom).tz(this.preferences.zone);
    }
    if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
      obj.dateTo = moment(obj.dateTo).tz(this.preferences.zone);
    }
    obj.limit = parseInt(this.preferences.maxRecords, 10);

    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      this.fileTransfers = res.transfers || [];

      this.fileTransfers.forEach(function (transfer) {
        let id = transfer.jobschedulerId || self.schedulerIds.selected;
        transfer.permission = self.authService.getPermission(id).YADE;
        if (self.showFiles) {
          transfer.show = true;
          self.getFiles(transfer);
        }
      });


      this.isLoading = true;
    }, () => this.isLoading = true);
  }

  getTransfer(transfer) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
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

  getFileTransferById(transferId) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      transferIds: [transferId]
    };
    this.coreService.post('yade/transfers', obj).subscribe((result: any) => {
      this.fileTransfers = result.transfers;
      this.fileTransfers[0].permission = this.authService.getPermission(this.schedulerIds.selected).YADE;
      this.isLoading = true;
    }, () => this.isLoading = true);
  }

  getFiles(value) {
    let ids = [value.id];
    this.coreService.post('yade/files', {
      transferIds: ids,
      jobschedulerId: value.jobschedulerId || this.schedulerIds.selected
    }).subscribe((res: any) => {
      value.files = res.files;
    });
  }

  checkAllFileTransfersFnc() {
    const self = this;
    if (this.checkAllFileTransfers.checkbox && this.fileTransfers.length > 0) {
      this.object.fileTransfers = [];
      // let data = $filter('orderBy')($scope.filtered, this.yadeFilters.filter.sortBy, this.yadeFilters.sortReverse);
      let data = this.fileTransfers.slice((this.preferences.entryPerPage * (this.yadeFilters.currentPage - 1)), (this.preferences.entryPerPage * this.yadeFilters.currentPage));
      data.forEach(function (value) {
        if (value.state._text != 'SUCCESSFUL') {
          self.object.fileTransfers.push(value);
          if (value.files && value.files.length > 0) {
            value.files.forEach(function (file) {
              self.object.files.push(file);
            });
          }
        }
      });

    } else {
      this.reset();
    }
  }

  checkFileTransfers(newNames) {
    if (newNames && newNames.length > 0) {

    } else {
      this.checkAllFileTransfers.checkbox = false;
      this.object.files = [];
    }

  }

  checkALLFilesFnc(transfer) {
    const self = this;
    if ($('#' + transfer.id) && $('#' + transfer.id).prop('checked')) {
      if (transfer && transfer.files) {
        transfer.files.forEach(function (file) {
          let flag = false;
          for (let x = 0; x < self.object.files.length; x++) {
            if (_.isEqual(file, self.object.files[x])) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            self.object.files.push(file);
          }
        });
      }
    } else {
      let _temp = _.clone(this.object.files);
      _temp.forEach(function (file, index) {
        for (let x = 0; x < self.object.files.length; x++) {
          if (transfer.id == self.object.files[x].id) {
            self.object.files.splice(index, 1);
            break;
          }
        }
      });
    }
  }

  checkFile(newNames) {
    const self = this;
    if (newNames && newNames.length > 0) {
      let data = this.fileTransfers.slice((this.preferences.entryPerPage * (this.yadeFilters.currentPage - 1)), (this.preferences.entryPerPage * this.yadeFilters.currentPage));
      newNames.forEach(function (value) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].id == value.transferId) {
            let flg = false;
            for (let x = 0; x < self.object.fileTransfers.length; x++) {
              if (self.object.fileTransfers[x].id == data[i].id) {
                flg = true;
              }
            }
            if (!flg)
              self.object.fileTransfers.push(data[i]);
            break;
          }
        }
      });

    } else {
      if (this.fileTransfers && this.fileTransfers.length > 0) {
        let data = this.fileTransfers.slice((this.preferences.entryPerPage * (this.yadeFilters.currentPage - 1)), (this.preferences.entryPerPage * this.yadeFilters.currentPage));
        data.forEach(function (transfer) {
          if ($('#' + transfer.id)) {
            $('#' + transfer.id).prop('checked', false);
          }
        });
      }
    }
  }

  showTransferFuc(value) {
    let obj = {
      jobschedulerId: value.jobschedulerId || this.schedulerIds.selected,
      transferIds: [value.id]
    };
    this.coreService.post('yade/transfers', obj).subscribe((res: any) => {
      value = _.extend(value, res.transfers[0]);
      this.isLoading = true;
    }, () => this.isLoading = true);
    value.show = true;
    this.getFiles(value);
  }

  search() {
    this.isLoaded = false;
    let filter: any = {
      jobschedulerId: this.yadeView.current == true ? this.schedulerIds.selected : '',
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

    if (this.searchFilter.jobschedulerId) {
      filter.jobschedulerId = this.searchFilter.jobschedulerId;
    }

    filter.timeZone = this.preferences.zone;
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      delete filter['timeZone'];
    }
    if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
      filter.dateFrom = moment(filter.dateFrom).tz(this.preferences.zone);
    }
    if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
      filter.dateTo = moment(filter.dateTo).tz(this.preferences.zone);
    }
    this.coreService.post('yade/transfers', filter).subscribe((res: any) => {
      this.fileTransfers = res.transfers;
      this.loading = false;
      this.isLoaded = true;
    }, () => {
      this.loading = false;
      this.isLoaded = true;
    });
  }

  /* ------------- Advance search ------------------- */
  advancedSearch() {
    this.showSearchPanel = true;
    this.searchFilter = {
      radio: 'current',
      planned: 'today',
      from: new Date(),
      fromTime: new Date(),
      to: new Date(),
      toTime: new Date(),
      paths: [],
      state: []
    };
  }

  cancel() {
    this.searchFilter = {};
    this.showSearchPanel = false;
    if (!this.yadeFilters.filter.states) {
      this.yadeFilters.filter.states = 'ALL';
    }
    if (!this.yadeFilters.filter.date) {
      this.yadeFilters.filter.date = 'today';
    }

    this.load();
  };

  checkSharedFilters() {
    if (this.permission.JOCConfigurations.share.view) {
      let obj = {
        jobschedulerId: this.schedulerIds.selected,
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

  getYadeCustomizations() {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
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
              jobschedulerId: value.jobschedulerId,
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

  saveAsFilter() {
    let configObj = {
      jobschedulerId: this.schedulerIds.selected,
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

  expandDetails() {
    this.showFiles = true;
    this.yadeFilters.showFiles = true;
    this.load();
  }

  collapseDetails() {
    this.showFiles = false;
    this.yadeFilters.showFiles = false;

    this.fileTransfers.forEach(function (value) {
      value.show = false;
    });
  }

  /** ------------------Action------------------- */

  restartAllTransfer() {

  }

  restartTransfer(data) {

  }

  /* ---- Customization ------ */
  createCustomization() {
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

  editFilters() {
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
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  action(type, obj, self) {
    if (type === 'DELETE') {
      if (self.savedFilter.selected == obj.id) {
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

  changeFilter(filter) {
    this.cancel();
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.yadeFilters.selectedView = true;
      this.coreService.post('configuration',
        {
          jobschedulerId: filter.jobschedulerId,
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
  };

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].objectType === 'OTHER') {
              if (args[i].eventSnapshots[j].eventType == 'YADETransferStarted') {
                this.load();
                break;
              } else if (args[i].eventSnapshots[j].eventType == 'YADETransferUpdated') {
                for (let x = 0; x < this.fileTransfers.length; x++) {
                  if (this.fileTransfers[x].id == args[i].eventSnapshots[j].path) {
                    this.getTransfer(this.fileTransfers[x]);
                    break;
                  }
                }
              } else if (args[i].eventSnapshots[j].eventType == 'YADEFileStateChanged') {
                for (let x = 0; x < this.fileTransfers.length; x++) {
                  if (this.fileTransfers[x].id == args[i].eventSnapshots[j].path && this.fileTransfers[x].show) {
                    this.getFiles(this.fileTransfers[x]);
                    break;
                  }
                }
              }
              break;
            }
          }
        }
        break;
      }
    }
  }

  private init() {
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

  private reset() {
    this.object.files = [];
    this.object.fileTransfers = [];
  }

  private setDateRange(filter) {
    if (this.yadeFilters.filter.date == 'all') {

    } else if (this.yadeFilters.filter.date == 'today') {
      filter.dateFrom = '0d';
      filter.dateTo = '0d';
    } else {
      filter.dateFrom = this.yadeFilters.filter.date;
    }
    return filter;
  }

  private isCustomizationSelected(flag) {
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

  private parseProcessExecuted(regex, obj) {
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

  private editFilter(filter) {
    let filterObj: any = {};
    this.coreService.post('configuration', {jobschedulerId: filter.jobschedulerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;

      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.allFilter = this.filterList;
      modalRef.componentInstance.filter = filterObj;
      modalRef.componentInstance.edit = true;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

  private copyFilter(filter) {
    let filterObj: any = {};
    this.coreService.post('configuration', {jobschedulerId: filter.jobschedulerId, id: filter.id}).subscribe((conf: any) => {
      filterObj = JSON.parse(conf.configuration.configurationItem);
      filterObj.shared = filter.shared;
      filterObj.name = this.coreService.checkCopyName(this.filterList, filter.name);

      const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.allFilter = this.filterList;
      modalRef.componentInstance.filter = filterObj;
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

}
