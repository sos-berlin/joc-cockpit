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
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {GroupByPipe} from '../../filters/filter.pipe';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';

declare const JSGantt;
declare let jsgantt;
declare const $;

@Component({
  selector: 'app-select-order-template',
  template: '<nz-tree-select\n' +
    '          name="template"\n' +
    '          [nzNodes]="nodes"\n' +
    '          [nzHideUnMatched]="true"\n' +
    '          [nzDropdownStyle]="{ \'max-height\': \'260px\' }"\n' +
    '          nzShowSearch\n' +
    '          [nzMultiple]="true"\n' +
    '          (ngModelChange)="onChange($event)"\n' +
    '          [nzPlaceHolder]="\'dailyPlan.placeholder.selectOrderTemplate\' | translate"\n' +
    '          [(ngModel)]="object.orderTemplates"\n' +
    '        >\n' +
    '          <ng-template #nzTreeTemplate let-node>\n' +
    '            <div style="width: 93%" class="node-wrapper" (click)="loadData(node, $event);">\n' +
    '              <div class="node-content-wrapper" [class.node-content-wrapper-active]="node.isSelected">\n' +
    '                <i *ngIf="!node.origin.type" nz-icon [nzType]="node.isExpanded ? \'folder-open\' : \'folder\'" class="w-14"></i>\n' +
    '                <i *ngIf="node.origin.type" class="fa fa-circle-o text-xs w-11 m-t-xs"></i>\n' +
    '                {{node.origin.name}}\n' +
    '              </div>\n' +
    '            </div>\n' +
    '          </ng-template>\n' +
    '        </nz-tree-select>'
})
export class SelectOrderTemplatesComponent implements OnInit, OnChanges {
  @Input() schedulerId;
  @Input() object;
  @Input() selectAll: boolean;
  @Output() changeTemp = new EventEmitter();
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];
  orderTemplates: any = [];

  constructor(public  coreService: CoreService) {
  }

  ngOnInit() {
    this.getOrderTemplates();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selectAll) {
      this.orderTemplates.forEach((template) => {
        if (this.object.orderTemplates.indexOf(template.path) === -1) {
          this.object.orderTemplates.push(template.path);
        }
      });
      this.object.orderTemplates = [...this.object.orderTemplates];
    } else {
      this.object.orderTemplates = [];
    }
  }

  onChange($event: string): void {
    console.log($event, this.orderTemplates);
    this.changeTemp.emit($event.length === this.orderTemplates.length)
  }

  getOrderTemplates() {
    this.coreService.post('order_templates/list', {controllerId: this.schedulerId}).subscribe((res: any) => {
      this.orderTemplates = res.orderTemplates;
      let treeObj = [];
      for (let i = 0; i < this.orderTemplates.length; i++) {
        const path = this.orderTemplates[i].path;
        let obj = {
          name: path.substring(path.lastIndexOf('/') + 1),
          path: path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1),
          key: path
        };
        treeObj.push(obj);
      }

      const arr = _.groupBy(_.sortBy(treeObj, 'path'), (res) => {
        return res.path;
      });
      this.generateTree(arr);
    });
  }

  private generateTree(arr) {
    for (const [key, value] of Object.entries(arr)) {
      if (key !== '/') {
        let paths = key.split('/');
        if (paths.length > 1) {
          let pathArr = [];
          for (let i = 0; i < paths.length; i++) {
            if (paths[i]) {
              if (i > 0 && paths[i - 1]) {
                pathArr.push('/' + paths[i - 1] + '/' + paths[i]);
              } else {
                pathArr.push('/' + paths[i]);
              }
            }
          }
          for (let i = 0; i < pathArr.length; i++) {
            this.checkAndAddFolder(pathArr[i]);
          }
        }
      }
      this.checkFolderRecur(key, value);
    }
  }

  private checkFolderRecur(_path, data) {
    let flag = false;
    let arr = [];
    if (data.length > 0) {
      arr = this.createTempArray(data);
    }

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type) {
          if (nodes[i].path === path) {
            if (!nodes[i].children || nodes[i].children.length === 0) {
              nodes[i].children = arr;
            } else {
              nodes[i].children = nodes[i].children.concat(arr);
            }
            flag = true;
            break;
          }
          if (!flag && nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    if (this.nodes && this.nodes[0]) {
      this.nodes[0].expanded = true;
      recursive(_path, this.nodes);
    }
  }

  private checkAndAddFolder(_path) {
    let node: any;

    function recursive(path, nodes) {
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].type) {
          if (nodes[i].path === path.substring(0, path.lastIndexOf('/') + 1) || nodes[i].path === path.substring(0, path.lastIndexOf('/'))) {
            node = nodes[i];
            break;
          }
          if (nodes[i].children) {
            recursive(path, nodes[i].children);
          }
        }
      }
    }

    recursive(_path, this.nodes);

    if (node) {
      let falg = false;
      for (let x = 0; x < node.children.length; x++) {
        if (!node.children[x].type && !node.children[x].object && node.children[x].path === _path) {
          falg = true;
          break;
        }
      }
      if (!falg) {
        node.children.push({
          name: _path.substring(_path.lastIndexOf('/') + 1),
          path: _path,
          key: _path,
          children: []
        });
      }
    }
  }

  private createTempArray(arr) {
    let tempArr = [];
    for (let i = 0; i < arr.length; i++) {
      let parentObj: any = {
        name: arr[i].name,
        path: arr[i].path,
        key: arr[i].key,
        title: arr[i].key,
        type: true,
        isLeaf: true
      };
      tempArr.push(parentObj);
    }
    return tempArr;
  }

  loadData(node, $event) {
    if (!node.origin.type) {
      if ($event) {
        $event.stopPropagation();
      }
    }
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './create-plan-dialog.html'
})
export class CreatePlanModalComponent implements OnInit {
  @Input() schedulerId;
  @Input() selectedDate;
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];
  objects: any = [];
  object = {checkbox :  false, overwrite: false};
  plan: any;
  submitted = false;
  orderTemplates: any = [];
  selectedTemplates: any = {orderTemplates: []};

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
  }

  changeTemp(value){
    //this.object.checkbox = value;
  }

  onSubmit(): void {
    let obj: any = {
      overwrite: this.object.overwrite,
    };
    if (!this.object.checkbox && this.selectedTemplates.orderTemplates.length > 0) {
      obj.orderTemplates = this.selectedTemplates.orderTemplates;
    }
    this.activeModal.close(obj);
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
  objects: any;
  plan: any;
  submitted = false;
  tree: any = [];

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
    this.initTree();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerId,
      compact: true,
      types: ['OTHER']
    }).subscribe(res => {
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
  selector: 'app-plan-modal-content',
  templateUrl: './remove-plan-dialog.html',
})
export class RemovePlanModalComponent implements OnInit {
  submitted = false;
  @Input() schedulerId: string;
  @Input() selectedDate;
  @Input() orderCount;

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {

  }

  onSubmit() {
    this.submitted = true;
    let obj = {
      controllerId: this.schedulerId,
      dailyPlanDate: moment(this.selectedDate).format('YYYY-MM-DD')
    };
    this.coreService.post('daily_plan/remove_orders', obj).subscribe((res) => {
      this.submitted = false;
      this.activeModal.close('');
    }, () => {
      this.submitted = false;
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
    let workflow = '', orderId = '', btnRemoveOrder = '';
    this.translate.get('label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('label.orderId').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    this.translate.get('dailyPlan.button.removeOrder').subscribe(translatedValue => {
      btnRemoveOrder = translatedValue;
    });

    jsgantt.config.columns = [{name: 'col2', tree: !0, label: workflow, align: 'left'}, {
      name: 'col1', label: orderId, width: '*', align: 'left'
    }];
    jsgantt.config.btnRemoveOrder = btnRemoveOrder;

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
          order.action = 'REMOVE_ORDER';
          _id = id.substring(0, id.lastIndexOf('removeBtn'));

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

  ngOnChanges(changes: SimpleChanges): void {
    const _groupBy: SimpleChange = changes.groupBy;
    const _sortBy: SimpleChange = changes.sortBy;
    if (_groupBy && _groupBy.previousValue && (_groupBy.previousValue !== _groupBy.currentValue)) {
      this.init();
      jsgantt.render();
    }
    if (_sortBy && _sortBy.previousValue && (_sortBy.previousValue !== _sortBy.currentValue)) {
      // this.init();
      //jsgantt.render();
    }
  }

  ngOnDestroy(): void {
    $('.tooltip').hide();
    jsgantt = null;
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
        orderTemplates: [],
        state: [],
        shared: false
      };
    } else {
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
  nodes = [];
  orderTemplates = [];

  constructor(public coreService: CoreService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getFolderTree();
  }

  getFolderTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      forInventory: true,
      types: ['OTHER']
    }).subscribe(res => {
      this.nodes = this.coreService.prepareTree(res, true);
      if (this.nodes.length > 0) {
        this.nodes[0].expanded = true;
      }
    });
  }

  displayWith(data): string {
    return data.key;
  }

  remove(path) {
    this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
  }

  loadData(node, $event) {
    if (!node.origin.type) {
      if ($event) {
        $event.stopPropagation();
      }
    }
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
      id: result.id || 0,
      configurationItem: {}
    };

    console.log('on submit', result)
    let obj: any = {};
    obj.regex = result.regex;
    obj.paths = result.paths;
    obj.workflow = result.workflow;
    obj.folders = result.folders;
    obj.orderTemplates = result.orderTemplates;
    obj.dailyPlanDate = result.dailyPlanDate;
    obj.state = result.state;
    obj.name = result.name;
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

  receiveData(object) {
      this.removeOrder(object);
  }

  loadOrderPlan() {
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      dailyPlanDate: moment(this.selectedDate).format('YYYY-MM-DD')
    };
    if (this.dailyPlanFilters.filter.status && this.dailyPlanFilters.filter.status !== 'ALL') {
      obj.states = [this.dailyPlanFilters.filter.status];
    }
    if (this.late) {
      obj.late = true;
    }
    this.coreService.post('daily_plan/orders', obj).subscribe((res: any) => {
      this.filterData(res.plannedOrderItems);
      this.isLoaded = true;
    }, (err) => {
      this.isLoaded = true;
    });
  }

  getPlans(status): void {
    if (status) {
      this.dailyPlanFilters.filter.status = status;
    }
    this.loadOrderPlan();
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
    this.loadOrderPlan();
  }

  groupByWorkflow() {
    this.dailyPlanFilters.filter.groupBy = this.dailyPlanFilters.filter.groupBy === 'ORDER' ? 'WORKFLOW' : 'ORDER';
    if (this.dailyPlanFilters.filter.groupBy === 'WORKFLOW') {
      this.workflows = this.groupBy.transform(this.plans, 'workflow');
    } else {
      this.workflows = [];
    }
  }

  generatePlan(obj) {
    obj.controllerId = this.schedulerIds.selected;
    obj.dailyPlanDate = moment(this.selectedDate).format('YYYY-MM-DD');
    this.coreService.post('daily_plan/orders/generate', obj).subscribe((result) => {
      this.loadOrderPlan();
    }, () => {

    });
  }

  createPlan() {
    const modalRef = this.modalService.open(CreatePlanModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.result.then((res) => {
      console.log(res)
      this.generatePlan(res);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  /* ------------- Action ------------------- */

  deployOrder(order) {

  }

  removeAllOrder() {
    const modalRef = this.modalService.open(RemovePlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.componentInstance.orderCount = this.plans.length;
    modalRef.result.then((res) => {
      this.loadOrderPlan();
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
      controllerId: this.schedulerIds.selected,
      orders: orders
    }).subscribe((res: any) => {
      this.resetCheckBox();
      this.loadOrderPlan();
    });
  }

  removeOrder(plan) {
    this.coreService.post('orders/remove_orders', {
      controllerId: this.schedulerIds.selected,
      orderId: [plan.orderId]
    }).subscribe((res: any) => {
      this.resetCheckBox();
      this.loadOrderPlan();
    });
  }

  addDetailsOfOrder(plan) {
    plan.show = plan.show === undefined || plan.show === false;
    if (plan.show) {
      this.coreService.post('orders/variables', {
        orders: [{orderId: '/order1'}],
        jobschedulerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        plan.variables = res.variables;
      }, err => {
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
      filename: 'JS7-dailyplan',
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
      dailyPlanDate : new Date(),
      orderTemplates: [],
      state: []
    };
  }

  applySearchFilter(obj) {
    if (this.searchFilter.workflow) {
      obj.workflow = this.searchFilter.workflow;
    }
    obj.dailyPlanDate = moment(this.searchFilter.dailyPlanDate || new Date()).format('YYYY-MM-DD');

    if (this.searchFilter.state && this.searchFilter.state.length > 0) {
      obj.states = [];
      if (this.searchFilter.state.indexOf('PLANNED') !== -1) {
        obj.states.push('PLANNED');
      }
      if (this.searchFilter.state.indexOf('INCOMPLETE') !== -1) {
        obj.states.push('INCOMPLETE');
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
    if (this.searchFilter.folders && this.searchFilter.folders.length > 0) {
      obj.folders = [];
      for (let i = 0; i < this.searchFilter.folders.length; i++) {
        obj.folders.push({folder: this.searchFilter.folders[i], recursive: true});
      }
    }
    if (this.searchFilter.orderTemplates && this.searchFilter.orderTemplates.length > 0) {
      obj.orderTemplates = this.searchFilter.orderTemplates;
    }
    return obj;
  }

  search() {
    this.isSearchHit = true;
    let obj: any = {};
    obj.controllerId = this.schedulerIds.selected;
    obj = this.applySearchFilter(obj);
    this.coreService.post('daily_plan/orders', obj).subscribe((res: any) => {
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
      this.loadOrderPlan();
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
        this.loadOrderPlan();
        this.saveService.setDailyPlan(this.savedFilter);
        this.saveService.save();
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editFilters() {
    console.log('editFilters')
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
        self.loadOrderPlan();
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
      self.loadOrderPlan();
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
        this.loadOrderPlan();
      });
    } else {
      this.isCustomizationSelected(false);
      this.savedFilter.selected = filter;
      this.dailyPlanFilters.selectedView = false;
      this.selectedFiltered = {};
      this.loadOrderPlan();
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

  sort(propertyName) {
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
        this.loadOrderPlan();
      },
      renderEnd: (e) => {
       // const year = e.currentYear || new Date().getFullYear(), month = e.currentMonth || new Date().getMonth();
       // this.load(new Date(year, month, 1));
      }
    });
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'DailyPlanChanged') {
              this.loadOrderPlan();
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
      this.dailyPlanFilters.filter.status = '';
    } else {
      if (this.temp_filter.status) {
        this.dailyPlanFilters.filter.status = _.clone(this.temp_filter.status);
      } else {
        this.dailyPlanFilters.filter.status = 'ALL';
      }
    }
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
            self.loadOrderPlan();
          });
        }
      });
      if (flag) {
        this.savedFilter.selected = undefined;
        this.loadOrderPlan();
      }
    } else {
      this.savedFilter.selected = undefined;
      this.loadOrderPlan();
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
      this.loadOrderPlan();
    });
  }

  private filterData(planItems): void {
    if(planItems && planItems.length) {
      this.plans = _.sortBy(planItems, this.dailyPlanFilters.filter.sortBy, this.dailyPlanFilters.reverse);
      if (this.dailyPlanFilters.filter.groupBy === 'WORKFLOW') {
        this.workflows = this.groupBy.transform(this.plans, 'workflow');
      }
      for (let i = 0; i < this.plans.length; i++) {
        this.plans[i].order = this.plans[i].orderId.substring(0, this.plans[i].orderId.lastIndexOf('_'));
      }
    }else{
      this.plans = [];
    }
  }

  private resetCheckBox() {
    this.object.orders = [];
    this.object.checkbox = false;
  }

  private editFilter(filter) {
    this.openFilterModal(filter, false);
  }

  private copyFilter(filter) {
    this.openFilterModal(filter, true);
  }

  private openFilterModal(filter, isCopy) {
    let filterObj: any = {};
    this.coreService.post('configuration', {jobschedulerId: filter.jobschedulerId, id: filter.id}).subscribe((conf: any) => {
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
      modalRef.result.then((configObj) => {

      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }
}
