import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';

import * as moment from 'moment';
import * as _ from 'underscore';

declare const JSGantt: any;
declare const $;


@Component ({
  selector: 'app-ngbd-modal-content',
  templateUrl: './changeParameter-dialog.html'
})
export class ChangeparameterModalComponent implements OnInit {
  @Input() variable: any;
  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    console.log(this.variable);
  }

  removeVariable(index): void {
    this.variable.splice(index, 1);
  }

  addCriteria(): void {
    let param = {
      name: '',
      value: ''
    };
    if (this.variable) {
      this.variable.push(param);
      console.log(this.variable);
      
    }
  }

  onSubmit(): void {
    console.log(this.variable);
    // TO DO
  }

}

@Component({
  selector: 'app-plan-modal-content',
  templateUrl: './remove-plan-dialog.html',
})
export class PlanModalComponent implements OnInit {
  permission: any = {};
  preferences: any = {};
  object: any = {};
  config: any = {};
  dateFormat: any;
  submitted = false;
  @Input() type: string;
  @Input() schedulerId: string;

  constructor(private authService: AuthService, public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.object = {
      radio: 'planned',
      paths: [],
      state: [],
      from1: '+0d',
      to1: '+0d'
    };
    this.dateFormat = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.config = {
      format: this.coreService.getDateFormatMom(this.preferences.dateFormat)
    };
  }

  onSubmit() {
    this.submitted = true;
    let fromDate;
    let toDate;

    if (this.object.radio === 'current') {
      if (this.object.from) {
        fromDate = new Date(this.object.from);
        fromDate.setHours(0);
        fromDate.setMinutes(0);
        fromDate.setSeconds(0);
        fromDate.setMilliseconds(0);


      }
      if (this.object.to) {
        toDate = new Date(this.object.to);
        toDate.setHours(0);
        toDate.setMinutes(0);
        toDate.setSeconds(0);
        toDate.setMilliseconds(0);

      }
    } else {
      if (this.object.from1) {
        fromDate = this.coreService.parseProcessExecuted(this.object.from1);
      }
      if (this.object.to1) {
        toDate = this.coreService.parseProcessExecuted(this.object.to1);
      }
    }

    let obj = {
      jobschedulerId: this.schedulerId,
      timeZone: this.preferences.zone,
      dateFrom: fromDate,
      dateTo: toDate
    };
    this.coreService.post('orders/remove_' + this.type, obj).subscribe((res) => {
      this.coreService.post('orders/calculate_' + this.type, obj).subscribe((result) => {
        this.submitted = false;
        this.activeModal.close('');
      }, () => {
        this.submitted = false;
      });
    });
  }

  cancel() {
    this.activeModal.dismiss('');
  }

}

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
        paths: [],
        state: [],
        from1: '+0d',
        to1: '+0d',
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
      this.activeModal.dismiss('cancel');
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
  dateFormatM: any;
  config: any = {};
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.config = {
      format: this.dateFormatM
    };
  }

  getFolderTree() {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.paths = this.filter.paths || [];
    modalRef.componentInstance.type = 'DAILYPLAN';
    modalRef.componentInstance.showCheckBox = true;
    modalRef.result.then((result) => {
      if (_.isArray(result)) {
        this.filter.paths = result;
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  remove(path) {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
  }

  checkFilterName() {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name && this.permission.user === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
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
    }, err => {
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
  selector: 'app-daily-plan',
  templateUrl: './daily-plan.component.html',
  styleUrls: ['./daily-plan.component.css']
})
export class DailyPlanComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  plans: any = [];
  isLoaded = false;
  notAuthenticate = false;
  dailyPlanFilters: any = {filter: {}};
  pageView: string;
  savedFilter: any = {};
  selectedFiltered: any = {};
  searchFilter: any = {};
  temp_filter: any = {};
  filterList: any = [];
  showSearchPanel = false;
  isSearchHit = false;
  late: boolean;
  searchKey: string;
  dateFormatM: any;
  maxPlannedTime: any;
  object: any = {orders: [], checkbox: false};
  subscription1: Subscription;
  subscription2: Subscription;
  flagOrderDetails: boolean = false;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService, private dataService: DataService, private modalService: NgbModal) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });

    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf();
    });
  }

  ngOnInit() {
    this.initConf();
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  getPlans(status, range): void {
    if (status) {
      this.dailyPlanFilters.filter.status = status;
    }
    if (range) {
      this.dailyPlanFilters.filter.range = range;
    }
    this.load();
  }

  changeLate() {
    this.dailyPlanFilters.filter.state = 'LATE';
    this.late = !this.late;
    if (this.late) {
      this.dailyPlanFilters.filter.state = '';
    } else {
      if (this.dailyPlanFilters.filter.status === 'ALL') {
        this.dailyPlanFilters.filter.status = '';
      }
    }

    this.load();
  }

  prepareGanttData(data2) {

    let minNextStartTime;
    let maxEndTime;
    let orders = [];

    let groupJobChain = [];
    for (let i = 0; i < data2.length; i++) {

      if (groupJobChain.length > 0) {
        let flag = false;
        for (let j = 0; j < groupJobChain.length; j++) {
          if (data2[i].jobChain && (groupJobChain[j].jobChain === data2[i].jobChain && groupJobChain[j].orderId === data2[i].orderId)) {
            flag = true;
          } else if (data2[i].job && (groupJobChain[j].job === data2[i].job)) {
            flag = true;
          }
        }
        if (!flag) {
          if (data2[i].orderId) {
            groupJobChain.push({orderId: data2[i].orderId, jobChain: data2[i].jobChain});
          } else if (data2[i].job) {
            groupJobChain.push({job: data2[i].job});
          }
        }
      } else {

        if (data2[i].orderId)
          groupJobChain.push({orderId: data2[i].orderId, jobChain: data2[i].jobChain});
        else if (data2[i].job)
          groupJobChain.push({job: data2[i].job});
      }
    }
    let theme = window.localStorage.$SOS$THEME;
    for (let index = 0; index < groupJobChain.length; index++) {
      let i = 0;
      orders[index] = {};
      orders[index].tasks = [];
      for (let index1 = 0; index1 < data2.length; index1++) {
        if (data2[index1].orderId && (groupJobChain[index].jobChain === data2[index1].jobChain && groupJobChain[index].orderId === data2[index1].orderId)) {
          orders[index].tasks[i] = {};
          orders[index].name = data2[index1].jobChain.substring(data2[index1].jobChain);
          orders[index].orderId = data2[index1].orderId;

          this.plans[index].processedPlanned = orders[index].name;
          orders[index].tasks[i].name = orders[index].name;

          this.plans[index].status = data2[index1].state._text;
          if (data2[index1].state._text === 'SUCCESSFUL') {
            orders[index].tasks[i].color = 'text-green';
          } else if (data2[index1].state._text === 'FAILED') {
            orders[index].tasks[i].color = 'text-red';
          } else if (data2[index1].late) {
            orders[index].tasks[i].color = '#ffc300';
          } else {
            if (theme != 'light' && theme != 'lighter')
              orders[index].tasks[i].color = '#fafafa';
          }
          orders[index].tasks[i].from = new Date(data2[index1].plannedStartTime);

          if (!minNextStartTime || minNextStartTime > new Date(data2[index1].plannedStartTime)) {
            minNextStartTime = new Date(data2[index1].plannedStartTime);
          }
          if (!maxEndTime || maxEndTime < new Date(data2[index1].expectedEndTime)) {
            maxEndTime = new Date(data2[index1].expectedEndTime);
          }
          orders[index].tasks[i].to = new Date(data2[index1].expectedEndTime);

          if (data2[index1].startMode === 0) {
            orders[index].tasks[i].startMode = 'label.singleStartMode';
            orders[index].tasks[i].content = '<i class="fa fa-repeat1">';
          } else if (data2[index1].startMode === 1) {
            orders[index].tasks[i].startMode = 'label.startStartRepeatMode';
            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/start-start.png">';
          } else if (data2[index1].startMode === 2) {
            orders[index].tasks[i].startMode = 'label.startEndRepeatMode';
            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/end-start.png">';
          }

          if (data2[index1].period.repeat) {
            let s = parseInt(((data2[index1].period.repeat) % 60).toString()),
              m = parseInt(((data2[index1].period.repeat / 60) % 60).toString()),
              h = parseInt(((data2[index1].period.repeat / (60 * 60)) % 24).toString());
            let h1 = h > 9 ? h : '0' + h;
            let m1 = m > 9 ? m : '0' + m;
            let s1 = s > 9 ? s : '0' + s;
            orders[index].tasks[i].repeat = h1 + ':' + m1 + ':' + s1;
          }
          i++;
        } else if (data2[index1].job && (groupJobChain[index].job === data2[index1].job)) {
          orders[index].tasks[i] = {};
          orders[index].name = data2[index1].job;

          this.plans[index].processedPlanned = orders[index].name;
          orders[index].tasks[i].name = orders[index].name;

          this.plans[index].status = data2[index1].state._text;
          if (data2[index1].state._text === 'SUCCESSFUL') {
            orders[index].tasks[i].color = 'text-green';
          } else if (data2[index1].state._text === 'FAILED') {
            orders[index].tasks[i].color = 'text-red';
          } else if (data2[index1].late) {
            orders[index].tasks[i].color = '#ffc300';
          } else {
            if (theme !== 'light' && theme !== 'lighter')
              orders[index].tasks[i].color = '#fafafa';
          }
          orders[index].tasks[i].from = new Date(data2[index1].plannedStartTime);

          if (!minNextStartTime || minNextStartTime > new Date(data2[index1].plannedStartTime)) {
            minNextStartTime = new Date(data2[index1].plannedStartTime);
          }
          if (!maxEndTime || maxEndTime < new Date(data2[index1].expectedEndTime)) {
            maxEndTime = new Date(data2[index1].expectedEndTime);
          }
          orders[index].tasks[i].to = new Date(data2[index1].expectedEndTime);

          if (data2[index1].startMode === 0) {
            orders[index].tasks[i].startMode = 'label.singleStartMode';
            orders[index].tasks[i].content = 'fa fa-repeat1';
          } else if (data2[index1].startMode === 1) {
            orders[index].tasks[i].startMode = 'label.startStartRepeatMode';
            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/start-start.png">';
          } else if (data2[index1].startMode === 2) {
            orders[index].tasks[i].startMode = 'label.startEndRepeatMode';
            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/end-start.png">';
          }

          if (data2[index1].period.repeat) {
            let s = parseInt(((data2[index1].period.repeat) % 60).toString()),
              m = parseInt(((data2[index1].period.repeat / 60) % 60).toString()),
              h = parseInt(((data2[index1].period.repeat / (60 * 60)) % 24).toString());
            let h1 = h > 9 ? h : '0' + h;
            let m1 = m > 9 ? m : '0' + m;
            let s1 = s > 9 ? s : '0' + s;
            orders[index].tasks[i].repeat = h1 + ':' + m1 + ':' + s1;
          }
          i++;
        }
      }
    }

    this.init(orders);
  }

  /* ------------- Action ------------------- */

  removeAllPlan() {
    const modalRef = this.modalService.open(PlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.type = 'plans';
    modalRef.result.then((res) => {
      this.load();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  removeAllOrder() {
    const modalRef = this.modalService.open(PlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.type = 'orders';
    modalRef.result.then((res) => {
      this.load();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  removeSelectedOrder() {
    let orders = [];
    this.object.orders.forEach((order) => {
      orders.push(order.orderId);
    });
    this.coreService.post('orders/remove_orders', {
      jobschedulerId: this.schedulerIds.selected,
      orders: orders
    }).subscribe((res: any) => {
      this.resetCheckBox();
      this.load();
    });
  }

  removeOrder(plan) {
    this.coreService.post('orders/remove_orders', {
      jobschedulerId: this.schedulerIds.selected,
      orderId: [plan.orderId]
    }).subscribe((res: any) => {
      this.resetCheckBox();
      this.load();
    });
  }

  addDetailsOfOrder(plan) {
    this.coreService.post('orders/variables', {orders:[{orderId: plan.orderId}], jobschedulerId: this.schedulerIds.selected}).subscribe((res: any) => {
      console.log(res);
    }, err => {
        if(!this.flagOrderDetails) {
          this.flagOrderDetails = true;
        } else {
          this.flagOrderDetails = false;
        }
        let res = {
          deliveryDate: '2019-03-06T14:23:15.315Z',
          variables : [
            {
              name: "myParam1",
              value: "myParam1Value"
            },
            {
              name: "myParam2",
              value: "myParam2Value"
            }
          ]
        }
        plan.variables =res.variables; 
    });

  }


  exportToExcel() {
    $('#dailyPlanTableId').table2excel({
      exclude: '.tableexport-ignore',
      filename: 'jobscheduler-dailyplan',
      fileext: '.xls',
      exclude_img: false,
      exclude_links: false,
      exclude_inputs: false
    });
  }

  /* ------------- Advance search ------------------- */
  advancedSearch() {
    this.showSearchPanel = true;
    this.searchFilter = {
      radio: 'current',
      from1: 'today',
      to1: 'today',
      from: moment().format(this.dateFormatM),
      fromTime: '00:00:00',
      to: moment().format(this.dateFormatM),
      toTime: '24:00:00',
      paths: [],
      state: []
    };
  }

  applySearchFilter(obj) {
    if (this.searchFilter.regex) {
      obj.regex = this.searchFilter.regex;
    }
    if (this.searchFilter.jobChain) {

      obj.jobChain = this.searchFilter.jobChain;
    }
    if (this.searchFilter.orderId) {
      obj.orderId = this.searchFilter.orderId;
    }

    if (this.searchFilter.state && this.searchFilter.state.length > 0) {
      obj.states = [];
      if (this.searchFilter.state.indexOf('WAITING') !== -1) {
        obj.states.push('PLANNED');
      }
      if (this.searchFilter.state.indexOf('SUCCESSFUL') !== -1) {
        obj.states.push('SUCCESSFUL');
      }
      if (this.searchFilter.state.indexOf('FAILED') !== -1) {
        obj.states.push('FAILED');
      }
      if (this.searchFilter.state.indexOf('LATE') !== -1) {
        obj.late = true;
      }
    }
    if (this.searchFilter.paths && this.searchFilter.paths.length > 0) {
      obj.folders = [];
      for (let i = 0; i < this.searchFilter.paths.length; i++) {
        obj.folders.push({folder: this.searchFilter.paths[i], recursive: true});
      }
    }
    let fromDate;
    let toDate;

    if (this.searchFilter.radio === 'current') {
      if (this.searchFilter.from) {
        fromDate = moment(this.searchFilter.from, this.dateFormatM);
        if (this.searchFilter.fromTime) {
          if (this.searchFilter.fromTime === '24:00' || this.searchFilter.fromTime === '24:00:00') {
            fromDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
            fromDate.add(1, 'days');
          } else {
            fromDate.set({
              hour: moment(this.searchFilter.fromTime, 'HH:mm:ss').hours(),
              minute: moment(this.searchFilter.fromTime, 'HH:mm:ss').minutes(),
              second: moment(this.searchFilter.fromTime, 'HH:mm:ss').seconds(), millisecond: 0
            });
          }
        } else {
          fromDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        }
      }
      if (this.searchFilter.to) {
        toDate = moment(this.searchFilter.to , this.dateFormatM);
        if (this.searchFilter.toTime) {
          if (this.searchFilter.toTime === '24:00' || this.searchFilter.toTime === '24:00:00') {
            toDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
            toDate.add(1, 'days');
          } else {
            toDate.set({
              hour: moment(this.searchFilter.toTime, 'HH:mm:ss').hours(),
              minute: moment(this.searchFilter.toTime, 'HH:mm:ss').minutes(),
              second: moment(this.searchFilter.toTime, 'HH:mm:ss').seconds(), millisecond: 0
            });
          }
        } else {
          toDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        }
      }
    } else {
      if (this.searchFilter.from1) {
        fromDate = this.coreService.parseProcessExecuted(this.searchFilter.from1);
      }
      if (this.searchFilter.to1) {
        toDate = this.coreService.parseProcessExecuted(this.searchFilter.to1);
      }
    }
    if (!fromDate) {
      fromDate = new Date();
      fromDate.setHours(0);
      fromDate.setMinutes(0);
      fromDate.setSeconds(0);
      fromDate.setMilliseconds(0);
    }

    obj.dateFrom = fromDate;
    if (!toDate) {
      toDate = new Date();
      toDate.setDate(toDate.getDate() + 1);
      toDate.setHours(0);
      toDate.setMinutes(0);
      toDate.setSeconds(0);
      toDate.setMilliseconds(0);

    }
    obj.dateTo = toDate;

    return obj;
  }

  search() {
    this.isSearchHit = true;
    let obj: any = {};
    obj.jobschedulerId = this.schedulerIds.selected;
    obj = this.applySearchFilter(obj);
    if (!obj.dateFrom) {
      obj.dateFrom = new Date();
      obj.dateFrom.setHours(0);
      obj.dateFrom.setMinutes(0);
      obj.dateFrom.setSeconds(0);
      obj.dateFrom.setMilliseconds(0);
    }
    if (!obj.dateTo) {
      obj.dateTo = new Date();
      obj.dateTo.setDate(obj.toDate.getDate() + 1);
      obj.dateTo.setHours(0);
      obj.dateTo.setMinutes(0);
      obj.dateTo.setSeconds(0);
      obj.dateTo.setMilliseconds(0);
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
    this.coreService.post('orders/plan', obj).subscribe((res: any) => {
      this.filterData(res.planItems);
      // this.prepareGanttData(this.plans);
      if (res.created) {
        this.maxPlannedTime = new Date(res.deliveryDate);
      } else {
        this.maxPlannedTime = undefined;
      }
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  cancel() {
    this.showSearchPanel = false;
    this.searchFilter = {};
    if (this.isSearchHit) {
      this.isSearchHit = false;
      this.load();
    }
  }

  changeParameter(plan) {
    const modalRef = this.modalService.open(ChangeparameterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.variable = plan.variables;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  /* ---- Customization ------ */
  createCustomization() {
    const modalRef = this.modalService.open(FilterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.permission = this.permission;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.allFilter = this.filterList;
    modalRef.componentInstance.new = true;
    modalRef.result.then((configObj) => {
      if (this.filterList.length === 1) {
        this.savedFilter.selected = configObj.id;
        this.dailyPlanFilters.selectedView = true;
        this.selectedFiltered = configObj;
        this.isCustomizationSelected(true);
        this.load();
        this.saveService.setDailyPlan(this.savedFilter);
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
      if (self.savedFilter.selected === obj.id) {
        self.savedFilter.selected = undefined;
        self.isCustomizationSelected(false);
        self.dailyPlanFilters.selectedView = false;
        self.selectedFiltered = undefined;
        self.setDateRange(null);
        self.load();
      } else {
        if (self.filterList.length === 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.dailyPlanFilters.selectedView = false;
          self.selectedFiltered = undefined;
        }
      }
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
    } else if (type === 'MAKEFAV') {
      self.savedFilter.favorite = obj.id;
      self.dailyPlanFilters.selectedView = true;
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
      self.load();
    } else if (type === 'REMOVEFAV') {
      self.savedFilter.favorite = '';
      self.saveService.setDailyPlan(self.savedFilter);
      self.saveService.save();
    }
  }

  changeFilter(filter) {
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.dailyPlanFilters.selectedView = true;
      this.coreService.post('configuration', {
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
      this.dailyPlanFilters.selectedView = false;
      this.selectedFiltered = {};
      // this.setDateRange()
      this.load();
    }

    this.saveService.setDailyPlan(this.savedFilter);
    this.saveService.save();
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  checkAll() {
    if (this.object.checkbox && this.plans.length > 0) {
      this.object.orders = this.plans.slice((this.preferences.entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (this.preferences.entryPerPage * this.dailyPlanFilters.currentPage));
    } else {
      this.object.orders = [];
    }
  }

  checkPlan() {
    this.object.checkbox = this.object.orders.length === this.plans.slice((this.preferences.entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (this.preferences.entryPerPage * this.dailyPlanFilters.currentPage)).length;
  }

  pageChange($event) {
    this.dailyPlanFilters.currentPage = $event;
    if (this.object.checkbox) {
      this.checkAll();
    }
  }

  sortBy(propertyName) {
    this.dailyPlanFilters.reverse = !this.dailyPlanFilters.reverse;
    this.dailyPlanFilters.filter.sortBy = propertyName;
    this.resetCheckBox();
  }

  changePage(pageNum) {
    this.preferences.entryPerPage = pageNum;
    if (this.object.checkbox) {
      this.checkAll();
    } else {
      this.object.orders = [];
    }
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'DailyPlanChanged') {
              this.load();
              break;
            }
          }
        }
        break;
      }
    }
  }

  private initConf() {

    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.dailyPlanFilters = this.coreService.getDailyPlanTab();
    this.savedFilter = JSON.parse(this.saveService.dailyPlanFilters) || {};

    if (this.dailyPlanFilters.selectedView) {
      this.savedFilter.selected = this.savedFilter.selected || this.savedFilter.favorite;
    } else {
      this.savedFilter.selected = undefined;
    }
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).dailyPlan;
    }
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.checkSharedFilters();
  }

  private load(): void {
    this.isLoaded = false;

    let obj: any = {
      jobschedulerId: this.schedulerIds.selected,
      states: []
    };
    if (this.selectedFiltered && this.selectedFiltered.name) {
      this.isCustomizationSelected(true);
      obj = this.applySavedFilter(obj);
    } else {

      if (this.dailyPlanFilters.filter.status !== 'ALL') {
        obj.states = [];
        if (this.dailyPlanFilters.filter.status === 'WAITING') {
          obj.states.push('PLANNED');
        } else {
          obj.states.push(this.dailyPlanFilters.filter.status);
        }
      }
      if (this.dailyPlanFilters.filter.state === 'LATE') {
        obj.late = true;
      }
    }
    this.setDateRange(obj);

    this.coreService.post('orders/plan', obj).subscribe((res: any) => {
      this.filterData(res.planItems);
      this.isLoaded = true;
    }, (err) => {
      console.log(err);
      this.isLoaded = true;
    });
  }

  private isCustomizationSelected(flag) {
    if (flag) {
      this.temp_filter.status = _.clone(this.dailyPlanFilters.filter.status);
      this.temp_filter.range = _.clone(this.dailyPlanFilters.filter.range);
      this.dailyPlanFilters.filter.status = '';
      this.dailyPlanFilters.filter.range = '';
    } else {
      if (this.temp_filter.status) {
        this.dailyPlanFilters.filter.status = _.clone(this.temp_filter.status);
        this.dailyPlanFilters.filter.range = _.clone(this.temp_filter.range);
      } else {
        this.dailyPlanFilters.filter.status = 'ALL';
        this.dailyPlanFilters.filter.range = 'today';
      }
    }
  }

  private applySavedFilter(obj) {
    if (this.selectedFiltered.regex) {
      obj.regex = this.selectedFiltered.regex;
    }
    if (this.selectedFiltered.jobChain) {
      obj.jobChain = this.selectedFiltered.jobChain;
    }
    if (this.selectedFiltered.orderId) {
      obj.orderId = this.selectedFiltered.orderId;
    }
    if (this.selectedFiltered.state && this.selectedFiltered.state.length > 0) {
      obj.states = [];
      if (this.selectedFiltered.state.indexOf('WAITING') !== -1) {
        obj.states.push('PLANNED');
      }
      if (this.selectedFiltered.state.indexOf('SUCCESSFUL') !== -1) {
        obj.states.push('SUCCESSFUL');
      }
      if (this.selectedFiltered.state.indexOf('FAILED') !== -1) {
        obj.states.push('FAILED');
      }
      if (this.selectedFiltered.state.indexOf('LATE') !== -1) {
        obj.late = true;
      }

    }
    if (this.selectedFiltered.paths && this.selectedFiltered.paths.length > 0) {
      obj.folders = [];
      for (let i = 0; i < this.selectedFiltered.paths.length; i++) {
        obj.folders.push({folder: this.selectedFiltered.paths[i], recursive: true});
      }
    }
    let fromDate;
    let toDate;

    if (this.selectedFiltered.from) {
      fromDate = this.coreService.parseProcessExecuted(this.selectedFiltered.from);
    }
    if (this.selectedFiltered.to) {
      toDate = this.coreService.parseProcessExecuted(this.selectedFiltered.to);
    }

    if (!fromDate) {
      fromDate = new Date();
      fromDate.setHours(0);
      fromDate.setMinutes(0);
      fromDate.setSeconds(0);
      fromDate.setMilliseconds(0);

    }
    obj.dateFrom = fromDate;
    if (!toDate) {
      toDate = new Date();
      toDate.setDate(toDate.getDate() + 1);
      toDate.setHours(0);
      toDate.setMinutes(0);
      toDate.setSeconds(0);
      toDate.setMilliseconds(0);
    }
    obj.dateTo = toDate;

    return obj;
  }

  private filterResponse(res) {
    if (res.configurations && res.configurations.length > 0)
      this.filterList = res.configurations;
    this.getCustomizations();
  }

  private checkSharedFilters() {
    if (this.permission.JOCConfigurations.share.view.status) {
      let obj = {
        jobschedulerId: this.schedulerIds.selected,
        configurationType: 'CUSTOMIZATION',
        objectType: 'DAILYPLAN',
        shared: true
      };
      this.coreService.post('configurations', obj).subscribe((res) => {
        this.filterResponse(res);
      }, err => {
        this.getCustomizations();
      });
    } else {
      this.getCustomizations();
    }
  }

  private filterCustomizationResponse(res) {
    if (this.filterList && this.filterList.length > 0) {
      if (res.configurations && res.configurations.length > 0) {
        this.filterList = this.filterList.concat(res.configurations);
      }
      let data = [];
      for (let i = 0; i < this.filterList.length; i++) {
        let flag = true;
        for (let j = 0; j < data.length; j++) {
          if (data[j].account === this.filterList[i].account && data[j].name === this.filterList[i].name) {
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
      const self = this;
      this.filterList.forEach(function (value) {
        if (value.id === self.savedFilter.selected) {
          flag = false;
          let result: any;
          self.coreService.post('configuration', {
            jobschedulerId: value.jobschedulerId,
            id: value.id
          }).subscribe(conf => {
            result = conf;
            self.selectedFiltered = JSON.parse(result.configuration.configurationItem);
            self.selectedFiltered.account = value.account;
            self.load();
          });
        }
      });
      if (flag) {
        this.savedFilter.selected = undefined;
        this.load();
      }
    } else {
      this.savedFilter.selected = undefined;
      this.load();
    }
  }

  private getCustomizations() {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'DAILYPLAN'
    };
    this.coreService.post('configurations', obj).subscribe((res) => {
      this.filterCustomizationResponse(res);
    }, (err) => {
      this.savedFilter.selected = undefined;
      this.load();
    });
  }

  private naturalSorter(as, bs) {
    let a, b, a1, b1, i = 0, n, L,
      rx = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
    if (as === bs) return 0;
    a = as.toLowerCase().match(rx);
    b = bs.toLowerCase().match(rx);
    L = a.length;
    while (i < L) {
      if (!b[i]) return 1;
      a1 = a[i];
      b1 = b[i++];
      if (a1 !== b1) {
        n = a1 - b1;
        if (!isNaN(n)) return n;
        return a1 > b1 ? 1 : -1;
      }
    }
    return b[i] ? -1 : 0;
  }

  private sortByKey(array, key, order) {
    const reA = /[^a-zA-Z]/g;
    const self = this;
    if (key === 'processedPlanned' || key === 'orderId') {
      return array.sort(function (x, y) {
        let key1 = key === 'processedPlanned' ? x.orderId ? 'jobChain' : 'job' : key;

        let a = x[key1];
        let b = y[key1];
        if (order) {
          a = y[key1];
          b = x[key1];
        }

        if (!a && b) {
          if (key1 === 'job') {
            a = x['jobChain'];
            if (order) {
              a = y['jobChain'];
            }
          } else if (key1 === 'jobChain') {
            a = x['job'];
            if (order) {
              a = y['job'];
            }
          } else {
            return -1;
          }
        } else if (a && !b) {
          if (key1 === 'job') {
            b = y['jobChain'];
            if (order) {
              b = x['jobChain'];
            }
          } else if (key1 === 'jobChain') {
            b = y['job'];
            if (order) {
              b = x['job'];
            }
          } else {
            return 1;
          }
        }

        let AInt = parseInt(a, 10);
        let BInt = parseInt(b, 10);

        if (isNaN(AInt) && isNaN(BInt)) {
          return self.naturalSorter(a, b);
        } else if (isNaN(AInt)) {//A is not an Int
          return 1;
        } else if (isNaN(BInt)) {//B is not an Int
          return -1;
        } else if (AInt === BInt) {
          let aA = a.replace(reA, '');
          let bA = b.replace(reA, '');
          return aA > bA ? 1 : -1;
        } else {
          return AInt > BInt ? 1 : -1;
        }

      });
    } else if (key === 'duration') {
      return array.sort(function (x, y) {
        let a = x;
        let b = y;
        if (!order) {
          a = y;
          b = x;
        }
        let m, n;
        if (a.plannedStartTime && a.expectedEndTime) {
          m = moment(a.plannedStartTime).diff(a.expectedEndTime);
        }
        if (b.plannedStartTime && b.expectedEndTime) {
          n = moment(b.plannedStartTime).diff(b.expectedEndTime);
        }
        return m > n ? 1 : -1;
      });
    } else if (key === 'duration1') {
      return array.sort(function (x, y) {
        let a = x;
        let b = y;
        if (!order) {
          a = y;
          b = x;
        }

        let m = 0, n = 0;
        if (a.startTime && a.endTime) {
          m = moment(a.startTime).diff(a.endTime) || 0;
        }
        if (b.startTime && b.endTime) {
          n = moment(b.startTime).diff(b.endTime) || 0;
        }
        return m > n ? 1 : -1;
      });
    } else {
      let direction = order ? 1 : -1;
      return array.sort(function (a, b) {
        if (a[key] < b[key]) {
          return -1 * direction;
        } else if (a[key] > b[key]) {
          return 1 * direction;
        } else {
          return 0;
        }
      });
    }
  }

  private filterData(planItems): void {
    this.plans = this.sortByKey(planItems, this.dailyPlanFilters.filter.sortBy, this.dailyPlanFilters.reverse);
    this.prepareGanttData(this.plans);
  }

  private resetCheckBox() {
    this.object.orders = [];
    this.object.checkbox = false;
  }

  private setDateRange(obj) {
    if (!(this.dailyPlanFilters.filter.range === 'today' || !this.dailyPlanFilters.filter.range)) {
      let from = new Date();
      let to = new Date();
      from.setDate(from.getDate());
      to.setDate(to.getDate() + 1);
      obj.dateFrom = from;
      obj.dateTo = to;
    } else {
      obj.dateFrom = '0d';
      obj.dateTo = '0d';
      obj.timeZone = this.preferences.zone;
    }
  }

  private init(data) {
    let g = new JSGantt.GanttChart(document.getElementById('embedded-Gantt'), 'hour');
    if (g.getDivId() != null) {
      g.setCaptionType('Duration');  // Set to Show Caption (None,Caption,Resource,Duration,Complete)
      g.setShowDur(0);
      g.setShowComp(0);
      g.setShowStartDate(0);
      g.setShowEndDate(0);
      g.setScrollTo('today');
      g.setShowTaskInfoLink(0); // Show link in tool tip (0/1)
      g.setFormatArr('Hour', 'Day', 'Week'); // Even with setUseSingleCell using Hour format on such a large chart can cause issues in some browsers
      // Parameters
      // (pID, pName, pStart, pEnd, pStyle, pLink (unused)  pMile, pRes, pComp, pGroup, pParent, pOpen, pDepend, pCaption, pNotes, pGantt)

      for (let i = 0; i < data.length; i++) {
        //  console.log(data[i])
        g.AddTaskItem(new JSGantt.TaskItem(i + 1, data[i].name, data[i].tasks[0].from, data[i].tasks[0].to, data[i].tasks[0].color, '', 0, data[i].orderId, 0, 0, 0, 0, 'SF', '', '', g));
      }

      g.Draw();
    } else {
      console.log('Error, unable to create Gantt Chart');
    }
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
