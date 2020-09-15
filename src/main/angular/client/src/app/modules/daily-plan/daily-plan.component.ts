import {
  Component,
  EventEmitter,
  Input,
  ViewChild,
  OnDestroy,
  OnInit,
  SimpleChanges,
  SimpleChange,
  Output, ElementRef,
  ViewEncapsulation,
  OnChanges
} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TreeModalComponent} from '../../components/tree-modal/tree.component';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {GroupByPipe} from '../../filters/filter.pipe';
import * as moment from 'moment';
import * as _ from 'underscore';
import {TranslateService} from '@ngx-translate/core';

declare const JSGantt;
declare let jsgantt;
declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './create-plan-dialog.html'
})
export class CreatePlanModalComponent implements OnInit {
  @Input() schedulerId;
  @Input() selectedDate;
  defaultExpandedKeys: any = [];
  objects: any = [];
  plan: any;
  submitted = false;
  tree: any = [];

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
    this.defaultExpandedKeys = ['/'];
    this.initTree();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerId,
      compact: true,
      types: ['JOB']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
    });
  }

  getOrderTemplates(data) {

    this.coreService.post('order_templates/list', {controllerId: this.schedulerId}).subscribe((res: any) => {
        data.origin.data = res.orderTemplates;
    }, (err) => {

    });
  }

  onSubmit(): void {
    this.activeModal.dismiss('');
  }

  cancel() {
    this.activeModal.dismiss('');
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './order-template-dialog.html'
})
export class OrderTemplateModalComponent implements OnInit {
  @Input() schedulerId;
  @Input() selectedDate;
  defaultExpandedKeys: any = [];
  objects: any;
  plan: any;
  submitted = false;
  tree: any = [];

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
    this.defaultExpandedKeys = ['/'];
    this.initTree();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerId,
      compact: true,
      types: ['JOB']
    }).subscribe(res => {
      res = {
        folders: [{
          name: '', path: '/', folders: [
            {name: 'sos', path: '/sos'},
            {
              name: 'zehntech', path: '/zehntech',
              folders: [
                {name: 'example', path: '/sos'},
                {name: 'test', path: '/test'}
              ]
            }
          ]
        }]
      };
      this.tree = this.coreService.prepareTree(res, true);
    });
  }

  onSubmit(): void {
    this.activeModal.dismiss('');
  }

  cancel() {
    this.activeModal.dismiss('');
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './changeParameter-dialog.html'
})
export class ChangeParameterModalComponent implements OnInit {
  @Input() variable: any;
  @Input() updateOnly: any;
  variables: any = [];
  submitted = false;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (!this.updateOnly) {
      this.variables = Object.assign(this.variables, this.variable);
    } else {
      this.variables.push(_.clone(this.updateOnly));
    }
  }

  removeVariable(index): void {
    this.variables.splice(index, 1);
  }

  addCriteria(): void {
    let param = {
      name: '',
      value: ''
    };
    if (this.variables) {
      this.variables.push(param);
    }
  }

  onSubmit(): void {
    // TODO
    this.submitted = true;
    console.log(this.variables);
    setTimeout(() => {
      this.submitted = false;
      this.activeModal.close(this.variables);
    }, 800);
  }

  cancel() {
    this.activeModal.dismiss('');
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
      // this.coreService.post('plan/calculate', obj).subscribe((result) => {
      this.submitted = false;
      this.activeModal.close('');
    }, () => {
      this.submitted = false;
      // });
    });
  }

  cancel() {
    this.activeModal.dismiss('');
  }

}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-gantt',
  template: `
    <div #jsgantt class='jsgantt-chart'></div>`,
})
export class GanttComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('jsgantt', {static: true}) editor: ElementRef;

  @Input() data: any;
  @Input() groupBy: any;
  @Input() sortBy: any;
  @Input() preferences: any;
  @Output() dataEvent = new EventEmitter<any>();
  tasks = [];

  constructor(public coreService: CoreService, private groupByPipe: GroupByPipe, public translate: TranslateService) {
    JSGantt();
  }

  ngOnInit() {
    const self = this;
    let workflow = '', orderId = '', btnRemoveOrder = '', btnChangeParameter = '';
    this.translate.get('label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('label.orderId').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    this.translate.get('dailyPlan.button.removeOrder').subscribe(translatedValue => {
      btnRemoveOrder = translatedValue;
    });
    this.translate.get('button.changeParameter').subscribe(translatedValue => {
      btnChangeParameter = translatedValue;
    });

    jsgantt.config.columns = [{name: 'col2', tree: !0, label: workflow, align: 'left'}, {
      name: 'col1', label: orderId, width: '*', align: 'left'
    }];
    jsgantt.config.btnRemoveOrder = btnRemoveOrder;
    jsgantt.config.btnChangeParameter = btnChangeParameter;

    jsgantt.templates.task_class = function (start, end, task) {
      return task.class;
    };

    $(this.editor.nativeElement).on('mouseover', '.my-tooltip', function () {
      $(this).tooltip('show');
    });

    $(this.editor.nativeElement).on('mouseout', '.my-tooltip', function () {
      $('.tooltip').tooltip('hide');
    });
    $(document).on('click', '.ant-dropdown-menu-item', function (e) {
      const id = $(this).attr('id');
      if (id) {
        let _id = '';
        const _len = self.tasks.length;
        let order = {action: '', orderId: '', workflow: ''};
        if (id.match('editBtn')) {
          order.action = 'CHANGE_PARAMETER';
          _id = id.substring(0, id.lastIndexOf('editBtn'));
        } else {
          order.action = 'REMOVE_ORDER';
          _id = id.substring(0, id.lastIndexOf('removeBtn'));
        }
        for (let x = 0; x < _len; x++) {
          if (self.tasks[x].id == _id) {
            order.orderId = self.tasks[x].col1;
            order.workflow = self.tasks[x].col2;
            break;
          }
        }
        self.dataEvent.emit(order);
      }
    });

    this.editor.nativeElement.style.height = 'calc(100vh - 248px)';
    jsgantt.init(this.editor.nativeElement);
    this.init();

  }

  private init(): void {
    const self = this;
    let plans = this.groupByPipe.transform(this.data, this.groupBy === 'WORKFLOW' ? 'workflow' : 'order');
    const len = plans.length;
    if (len > 0) {
      let count = 0;
      for (let i = 0; i < len; i++) {
        let _obj = {
          id: ++count,
          col1: this.groupBy === 'WORKFLOW' ? plans[i].value[0].orderId : plans[i].key,
          col2: this.groupBy === 'WORKFLOW' ? plans[i].key : plans[i].value[0].workflow,
          open: true,
          isWorkflow: this.groupBy === 'WORKFLOW'
        };
        this.tasks.push(_obj);
        let _len = plans[i].value.length;
        for (let j = 0; j < _len; j++) {
          let dur = moment(plans[i].value[j].expectedEndTime).diff(plans[i].value[j].plannedStartTime) / 1000; // In second
          let obj: any = {
            id: ++count,
            col1: plans[i].value[j].orderId,
            col2: this.groupBy === 'WORKFLOW' ? '' : plans[i].value[j].workflow,
            plannedDate: moment(plans[i].value[j].plannedStartTime).tz(this.preferences.zone).format('YYYY-MM-DD HH:mm:ss'),
            begin: plans[i].value[j].period.begin ? moment(plans[i].value[j].period.begin).tz(self.preferences.zone).format('YYYY-MM-DD HH:mm:ss') : '',
            end: plans[i].value[j].period.end ? moment(plans[i].value[j].period.end).tz(self.preferences.zone).format('YYYY-MM-DD HH:mm:ss') : '',
            repeat: plans[i].value[j].period.repeat,
            class: this.coreService.getColor(plans[i].value[j].state.severity, 'bg'),
            duration: dur > 60 ? (dur / (60 * 60)) : 1,
            progress: dur > 60 ? (dur / (60 * 60)) : 0.1,
            parent: _obj.id
          };
          this.tasks.push(obj);
        }
      }
    }
    jsgantt.parse({data: this.tasks});
  }


  ngOnChanges(changes: SimpleChanges): void {
    const _groupBy: SimpleChange = changes.groupBy;
    const _sortBy: SimpleChange = changes.sortBy;
    if (_groupBy && _groupBy.previousValue && (_groupBy.previousValue !== _groupBy.currentValue)) {
      this.init();
      console.log('>>>>>>>.....', _groupBy.currentValue);
      jsgantt.render();
    }
    if (_sortBy && _sortBy.previousValue && (_sortBy.previousValue !== _sortBy.currentValue)) {
      console.log('>>>>>>>');
      // this.init();
      //jsgantt.render();
    }
  }

  ngOnDestroy(): void {
    $('.tooltip').hide();
    jsgantt = null;
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
  existingName: any;
  submitted = false;
  isUnique = true;

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
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
    obj.workflow = result.workflow;
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
  planItems: any = [];
  workflows: any = [];
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
  selectedDate: Date;
  selectedPlan: any = [];
  object: any = {orders: [], checkbox: false};
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modalService: NgbModal, private groupBy: GroupByPipe) {
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
    this.dailyPlanFilters.selectedDate = this.selectedDate;
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private initConf() {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.dailyPlanFilters = this.coreService.getDailyPlanTab();
    this.savedFilter = JSON.parse(this.saveService.dailyPlanFilters) || {};
    if (this.dailyPlanFilters.selectedDate) {
      this.selectedDate = this.dailyPlanFilters.selectedDate;
    } else {
      const d = new Date().setHours(0, 0, 0, 0);
      this.selectedDate = new Date(d);
    }
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
    $('#full-calendar').calendar({
      view: 'month',
      language: localStorage.$SOS$LANG,
      selectedDate: this.selectedDate,
      clickDay: (e) => {
        this.selectedDate = e.date;
        this.loadOrderPlan(e.events);
      },
      renderEnd: (e) => {
        const year = e.currentYear || new Date().getFullYear(), month = e.currentMonth || new Date().getMonth();
        this.load(new Date(year, month, 1));
      }
    });
  }

  receiveData(object) {
    if (object.action === 'CHANGE_PARAMETER') {
      this.changeParameter(object, null);
    } else {
      this.removeOrder(object);
    }
  }


  private load(date): void {
    if (!date) {
      this.isLoaded = false;
    }
    const d = date || new Date();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 0, 0, 0, 0);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 0);
    let obj: any = {
      jobschedulerId: this.schedulerIds.selected,
      dateFrom: firstDay,
      timeZone: this.preferences.zone
    };
    this.coreService.post('plan/list', obj).subscribe((result: any) => {
      this.planItems = [];
      if (result.planItems.length > 0) {
        for (let i = 0; i < result.planItems.length; i++) {
          result.planItems[i].startDate = new Date(result.planItems[i].planDay).setHours(0, 0, 0, 0);
          result.planItems[i].endDate = result.planItems[i].startDate;
          this.planItems.push(result.planItems[i]);
          if (this.selectedPlan.length === 0 && this.selectedDate.getTime() === result.planItems[i].startDate) {
            this.selectedPlan.push(result.planItems[i]);
          }
        }
        const calendar = $('#full-calendar').data('calendar');
        if (calendar) {
          calendar.setDataSource(this.planItems);
        }
      }

      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  loadOrderPlan(item) {
    if (item) {
      this.selectedPlan = item;
    }
    if (this.selectedPlan.length === 0) {
      this.plans = [];
    } else {
      for (let i = 0; i < this.selectedPlan.length; i++) {
        this.coreService.post('orders/plan', {
          jobschedulerId: this.schedulerIds.selected,
          planId: this.selectedPlan[i].planId
        }).subscribe((res: any) => {
          this.filterData(res.plannedOrderItems);
        }, (err) => {
          console.log(err);
        });
      }
    }
  }

  getPlans(status, range): void {
    if (status) {
      this.dailyPlanFilters.filter.status = status;
    }
    if (range) {
      this.dailyPlanFilters.filter.range = range;
    }
    this.loadOrderPlan(null);
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

    this.loadOrderPlan(null);
  }

  groupByWorkflow() {
    this.dailyPlanFilters.filter.groupBy = this.dailyPlanFilters.filter.groupBy === 'ORDER' ? 'WORKFLOW' : 'ORDER';
    if (this.dailyPlanFilters.filter.groupBy === 'WORKFLOW') {
      this.workflows = this.groupBy.transform(this.plans, 'workflow');
    } else {
      this.workflows = [];
    }
  }

  /* ------------- Action ------------------- */

  calculatePlan() {
    this.coreService.post('plan/calculate', {
      jobschedulerId: this.schedulerIds.selected,
      timeZone: this.preferences.zone,
      dateFrom: this.selectedDate,
      dateTo: this.selectedDate,
      orderTemplatesFolder: '/var/sos-berlin.com/js7/joc/resources/joc/order_templates'
    }).subscribe((result) => {
      console.log(result);
    }, () => {

    });
    /*    const modalRef = this.modalService.open(PlanModalComponent, {backdrop: 'static'});
        modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
        modalRef.componentInstance.type = 'plans';
        modalRef.result.then((res) => {
          //  this.loadOrderPlan(null);
        }, (reason) => {
          console.log('close...', reason);
        });*/
  }

  createPlan() {
    const modalRef = this.modalService.open(CreatePlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.result.then((res) => {
      this.loadOrderPlan(null);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  deployOrder(order) {

  }

  removeAllOrder() {
    const modalRef = this.modalService.open(PlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.type = 'orders';
    modalRef.result.then((res) => {
      this.loadOrderPlan(null);
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
      this.loadOrderPlan(null);
    });
  }

  removeOrder(plan) {
    this.coreService.post('orders/remove_orders', {
      jobschedulerId: this.schedulerIds.selected,
      orderId: [plan.orderId]
    }).subscribe((res: any) => {
      this.resetCheckBox();
      this.loadOrderPlan(null);
    });
  }

  addDetailsOfOrder(plan) {
    plan.show = plan.show === undefined || plan.show === false;
    if (plan.show) {
      this.coreService.post('orders/variables', {
        orders: [{orderId: plan.orderId}],
        jobschedulerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        plan.variables = res.variables;
      }, err => {
        const res = {
          deliveryDate: '2019-03-06T14:23:15.315Z',
          variables: [
            {
              name: 'myParam1',
              value: 'myParam1Value'
            },
            {
              name: 'myParam2',
              value: 'myParam2Value'
            }
          ]
        };
        plan.variables = res.variables;
      });
    }
  }

  expandCollapseTable(plan) {
    plan.show = plan.show === undefined || plan.show === false;
    plan.value = _.sortBy(plan.value, 'plannedStartTime');
  }

  expandCollapseOrder(plan) {
    plan.order = plan.order === undefined || plan.order === false;
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
      from: new Date(),
      to: new Date(),
      toTime: new Date(),
      paths: [],
      state: []
    };
  }

  applySearchFilter(obj) {
    if (this.searchFilter.regex) {
      obj.regex = this.searchFilter.regex;
    }
    if (this.searchFilter.workflow) {
      obj.workflow = this.searchFilter.workflow;
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
              hour: this.searchFilter.fromTime.getHours(),
              minute: this.searchFilter.fromTime.getMinutes(),
              second: this.searchFilter.fromTime.getSeconds(), millisecond: 0
            });
          }
        } else {
          fromDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        }
      }
      if (this.searchFilter.to) {
        toDate = moment(this.searchFilter.to, this.dateFormatM);
        if (this.searchFilter.toTime) {
          if (this.searchFilter.toTime === '24:00' || this.searchFilter.toTime === '24:00:00') {
            toDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
            toDate.add(1, 'days');
          } else {
            toDate.set({
              hour: this.searchFilter.toTime.getHours(),
              minute: this.searchFilter.toTime.getMinutes(),
              second: this.searchFilter.toTime.getSeconds(), millisecond: 0
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
      this.filterData(res.plannedOrderItems);
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
      this.loadOrderPlan(null);
    }
  }

  changeParameter(plan, order) {
    if (!order) {
      this.coreService.post('orders/variables', {
        orders: [{orderId: plan.orderId}],
        jobschedulerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        plan.variables = res.variables;
        this.openModel(plan, null);
      }, err => {
        const res = {
          deliveryDate: '2019-03-06T14:23:15.315Z',
          variables: [
            {
              name: 'myParam1',
              value: 'myParam1Value'
            },
            {
              name: 'myParam2',
              value: 'myParam2Value'
            }
          ]
        };
        plan.variables = res.variables;
        this.openModel(plan, null);
      });
    } else {
      this.openModel(plan, order);
    }
  }

  removeParameter(plan, order) {
    for (let i = 0; i < plan.variables.length; i++) {
      if (_.isEqual(plan.variables[i], order)) {
        plan.variables.splice(i, 1);
        break;
      }
    }
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
        this.loadOrderPlan(null);
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
        self.loadOrderPlan(null);
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
      self.loadOrderPlan(null);
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
        this.loadOrderPlan(null);
      });
    } else {
      this.isCustomizationSelected(false);
      this.savedFilter.selected = filter;
      this.dailyPlanFilters.selectedView = false;
      this.selectedFiltered = {};
      // this.setDateRange()
      this.loadOrderPlan(null);
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

  sortBy(propertyName) {
    this.dailyPlanFilters.reverse = !this.dailyPlanFilters.reverse;
    this.dailyPlanFilters.filter.sortBy = propertyName.key;
    this.resetCheckBox();
  }

  pageIndexChange($event) {
    this.dailyPlanFilters.currentPage = $event;
    if (this.object.checkbox) {
      this.checkAll();
    }
  }

  pageSizeChange($event) {
    this.dailyPlanFilters.entryPerPage = $event;
    if (this.object.checkbox) {
      this.checkAll();
    } else {
      this.object.orders = [];
    }
  }

  private openModel(plan, updateOnly) {
    const modalRef = this.modalService.open(ChangeParameterModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.variable = plan.variables;
    modalRef.componentInstance.updateOnly = updateOnly;
    modalRef.result.then((res) => {
      if (!updateOnly) {
        plan.variables = res;
      } else {
        for (let i = 0; i < plan.variables.length; i++) {
          if (_.isEqual(plan.variables[i], updateOnly)) {
            plan.variables[i] = res[0];
            break;
          }
        }
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'DailyPlanChanged') {
              this.loadOrderPlan(null);
              break;
            }
          }
        }
        break;
      }
    }
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
    if (this.selectedFiltered.workflow) {
      obj.workflow = this.selectedFiltered.workflow;
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
    if (this.selectedFiltered.from1) {
      fromDate = this.coreService.parseProcessExecuted(this.selectedFiltered.from1);
    }
    if (this.selectedFiltered.to1) {
      toDate = this.coreService.parseProcessExecuted(this.selectedFiltered.to1);
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
            self.loadOrderPlan(null);
          });
        }
      });
      if (flag) {
        this.savedFilter.selected = undefined;
        this.loadOrderPlan(null);
      }
    } else {
      this.savedFilter.selected = undefined;
      this.loadOrderPlan(null);
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
      this.loadOrderPlan(null);
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
        let key1 = key === 'processedPlanned' ? x.orderId ? 'workflow' : 'job' : key;

        let a = x[key1];
        let b = y[key1];
        if (order) {
          a = y[key1];
          b = x[key1];
        }

        if (!a && b) {
          if (key1 === 'job') {
            a = x['r'];
            if (order) {
              a = y['workflow'];
            }
          } else if (key1 === 'workflow') {
            a = x['job'];
            if (order) {
              a = y['job'];
            }
          } else {
            return -1;
          }
        } else if (a && !b) {
          if (key1 === 'job') {
            b = y['workflow'];
            if (order) {
              b = x['workflow'];
            }
          } else if (key1 === 'workflow') {
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
    if (this.dailyPlanFilters.filter.groupBy === 'WORKFLOW') {
      this.workflows = this.groupBy.transform(this.plans, 'workflow');
    }
    for (let i = 0; i < this.plans.length; i++) {
      this.plans[i].order = this.plans[i].orderId.substring(0, this.plans[i].orderId.lastIndexOf('_'));
    }
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
