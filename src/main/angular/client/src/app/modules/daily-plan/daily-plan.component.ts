import {
  Component,
  EventEmitter,
  Input,
  ViewChild,
  OnDestroy,
  OnInit,
  SimpleChanges,
  Output, ElementRef,
  ViewEncapsulation,
  OnChanges, AfterViewInit
} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {OrderPipe} from 'ngx-order-pipe';
import {ToasterService} from 'angular2-toaster';
import * as moment from 'moment';
import * as _ from 'underscore';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {GroupByPipe, SearchPipe} from '../../filters/filter.pipe';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {ExcelService} from '../../services/excel.service';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';

declare const JSGantt;
declare let jsgantt;
declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './changeParameter-dialog.html'
})
export class ChangeParameterModalComponent implements OnInit {
  @Input() variable: any;
  @Input() updateOnly: any;
  @Input() order: any;
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
    if (this.variables.length === 0) {
      this.addVariable();
    }
  }

  removeVariable(index): void {
    this.variables.splice(index, 1);
  }

  addVariable(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.variables) {
      this.variables.push(param);
    }
  }

  onKeyPress($event) {
    if ($event.which === '13' || $event.which === 13) {
      this.addVariable();
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
  selector: 'app-select-schedule-template',
  template: '<nz-tree-select\n' +
    '          name="template"\n' +
    '          [nzNodes]="nodes"\n' +
    '          [nzHideUnMatched]="true"\n' +
    '          [nzDropdownStyle]="{ \'max-height\': \'260px\' }"\n' +
    '          nzShowSearch\n' +
    '          [nzMultiple]="true"\n' +
    '          [nzPlaceHolder]="\'dailyPlan.placeholder.selectOrderTemplate\' | translate"\n' +
    '          [(ngModel)]="object.schedules"\n' +
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
export class SelectOrderTemplatesComponent implements OnInit {
  @Input() schedulerId;
  @Input() object;
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];
  schedules: any = [];

  constructor(public  coreService: CoreService) {
  }

  ngOnInit() {
    this.getOrderTemplates();
  }

  getOrderTemplates() {
    this.coreService.post('schedules', {
      controllerId: this.schedulerId,
      selector: {folders: [{folder: '/', recursive: true}]}
    }).subscribe((res: any) => {
      this.schedules = res.schedules;
      if (!res.schedules || res.schedules.length === 0) {
        this.nodes = [];
      }
      const treeObj = [];
      for (let i = 0; i < this.schedules.length; i++) {
        const path = this.schedules[i].path;
        const obj = {
          name: path.substring(path.lastIndexOf('/') + 1),
          path: path.substring(0, path.lastIndexOf('/')) || path.substring(0, path.lastIndexOf('/') + 1),
          key: path
        };
        treeObj.push(obj);
      }

      const arr = _.groupBy(_.sortBy(treeObj, 'path'), (result) => {
        return result.path;
      });
      this.generateTree(arr);
    }, () => {
      this.nodes = [];
    });
  }

  private generateTree(arr) {
    for (const [key, value] of Object.entries(arr)) {
      if (key !== '/') {
        const paths = key.split('/');
        if (paths.length > 1) {
          const pathArr = [];
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
    const tempArr = [];
    for (let i = 0; i < arr.length; i++) {
      const parentObj: any = {
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
        node.isExpanded = !node.isExpanded;
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
  object: any = {at: 'all', overwrite: false, submitWith: false};
  plan: any;
  submitted = false;
  schedules: any = [];
  selectedTemplates: any = {schedules: []};

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {

  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      overwrite: this.object.overwrite,
      withSubmit: this.object.submitWith,
      controllerId: this.schedulerId
    };
    if (this.object.at === 'template' && this.selectedTemplates.schedules.length > 0) {
      obj.selector = {schedulePaths : this.selectedTemplates.schedules};
    }

    obj.dailyPlanDate = moment(this.selectedDate).format('YYYY-MM-DD');
    this.coreService.post('daily_plan/orders/generate', obj).subscribe((result) => {
      this.submitted = false;
      this.activeModal.close('Done');
    }, () => {
      this.submitted = false;
    });
  }

  cancel() {
    this.activeModal.dismiss('');
  }
}

@Component({
  selector: 'app-schedule-template',
  templateUrl: './schedule-template-dialog.html'
})
export class ScheduleTemplateModalComponent implements OnInit {
  @Input() schedulerId;
  @Input() plan: any;
  @Input() order: any;
  @Input() preferences: any;
  submitted = false;
  dateFormat: any;

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  onSubmit(): void {
    console.log(this.order.form , this.order.time)
    if (this.order.from && this.order.time) {
      this.order.from.setHours(moment(this.order.time).hours());
      this.order.from.setMinutes(moment(this.order.time).minutes());
      this.order.from.setSeconds(moment(this.order.time).seconds());
      this.order.from.setMilliseconds(0);
    }
    this.submitted = true;
    this.coreService.post('daily_plan/orders/starttime', {
      controllerId: this.schedulerId,
      orderIds: [this.order.orderId],
      startTime: moment(this.order.from).format('YYYY-MM-DD HH:mm:ss')
    }).subscribe((result) => {
      this.submitted = false;
      this.activeModal.close('Done');
    }, () => {
      this.submitted = false;
    });
  }

  cancel() {
    this.activeModal.dismiss('');
  }
}

@Component({
  selector: 'app-submit-order-modal',
  templateUrl: './submit-order-dialog.html',
})
export class SubmitOrderModalComponent implements OnInit {
  submitted = false;
  @Input() schedulerId: string;
  @Input() orders;
  @Input() order;
  @Input() plan;
  @Input() workflow;
  @Input() selectedDate;

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
    if (this.workflow && !this.order.key) {
      this.order.key = this.order.workflow;
    }
  }

  onSubmit() {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId,
      filter: {}
    };

    if (this.workflow) {
      obj.filter.workflowPaths = [this.order.key];
    } else {
      if (this.order) {
        if (this.plan) {
          obj.filter.schedulePaths = [this.order.schedulePath];
        } else {
          obj.filter.orderIds = [this.order.orderId];
        }
      } else if (this.orders) {
        obj.filter.orderIds = [];
        this.orders.forEach((order) => {
          obj.filter.orderIds.push(order.orderId);
        });
      }
    }
    this.coreService.post('daily_plan/orders/submit', obj).subscribe((res) => {
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
  selector: 'app-remove-plan-modal',
  templateUrl: './remove-plan-dialog.html',
})
export class RemovePlanModalComponent implements OnInit {
  submitted = false;
  @Input() schedulerId: string;
  @Input() orders;
  @Input() order;
  @Input() plan;
  @Input() workflow;
  @Input() timeZone;
  @Input() selectedDate;

  preferences: any;
  display: any;
  messageList: any;
  required = false;
  comments: any = {};

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    // this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
    if (this.workflow && !this.order.key) {
      this.order.key = this.order.workflow;
    }
  }

  onSubmit() {
    const obj: any = {
      controllerId: this.schedulerId,
      filter: {}
    };

    if (this.workflow) {
      obj.filter.workflowPaths = [this.order.key];
    } else {
      if (this.order) {
        if (this.plan) {
          obj.filter.schedulePaths = [this.order.schedulePath];
        } else {
          obj.filter.orderIds = [this.order.orderId];
        }
      }
    }

    if (this.orders) {
      obj.filter.orderIds = [];
      this.orders.forEach((order) => {
        obj.filter.orderIds.push(order.orderId);
      });
    }
    if (!obj.filter.dailyPlanDate && this.selectedDate) {
      obj.filter.dailyPlanDate = moment(this.selectedDate).format('YYYY-MM-DD');
    }
    this.remove(obj);
  }

  private remove(obj) {
    this.submitted = true;
    this.coreService.post('daily_plan/orders/delete', obj).subscribe((res) => {
      this.submitted = false;
      this.activeModal.close('Done');
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
  @Input() preferences: any;
  @Input() toggle: boolean;
  tasks = [];

  constructor(public coreService: CoreService, public translate: TranslateService) {
  }

  ngOnInit() {
    this.toggle = true;
    console.log('ngOnInit', this.toggle);
    this.initConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    JSGantt();
    console.log('ngOnChanges', this.toggle);
    this.init();
  }

  ngOnDestroy(): void {
    $('.tooltip').hide();
    jsgantt = null;
  }

  private initConfig(): void {
    $(this.editor.nativeElement).on('mouseover', '.my-tooltip', function () {
      $(this).tooltip('show');
    });
    $(this.editor.nativeElement).on('mouseout', '.my-tooltip', function () {
      $('.tooltip').tooltip('hide');
    });
    this.editor.nativeElement.style.height = 'calc(100vh - 248px)';
  }

  private init(): void {
    const self = this;
    let workflow = '', orderId = '';
    this.translate.get('dailyPlan.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('dailyPlan.label.scheduleAndOrder').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    jsgantt.config.columns = [{name: 'col2', tree: !0, label: workflow, align: 'left'}, {
      name: 'col1', label: orderId, width: '*', align: 'left'
    }];
    jsgantt.templates.task_class = function (start, end, task) {
      return task.class;
    };
    jsgantt.init(this.editor.nativeElement);
    this.tasks = [];
    const plans = this.data;
    const len = plans.length;
    if (len > 0) {
      let count = 0;
      console.log(this.toggle, 'this.toggle');
      for (let i = 0; i < len; i++) {
        const _obj = {
          id: ++count,
          col1: this.groupBy === 'WORKFLOW' ? '' : plans[i].key,
          col2: this.groupBy === 'WORKFLOW' ? plans[i].key : plans[i].value[0].workflowPath,
          value: plans[i].value,
          open: this.toggle,
          isWorkflow: this.groupBy === 'WORKFLOW'
        };
        this.tasks.push(_obj);
        const _len = plans[i].value.length;
        for (let j = 0; j < _len; j++) {
          const dur = plans[i].value[j].expectedDuration1;
          const obj: any = {
            id: ++count,
            col1: plans[i].value[j].orderId,
            col2: this.groupBy === 'WORKFLOW' ? '' : plans[i].value[j].workflowPath,
            plannedDate: moment(plans[i].value[j].plannedDate).tz(this.preferences.zone).format('YYYY-MM-DD HH:mm:ss'),
            begin: plans[i].value[j].period.begin ? moment(plans[i].value[j].period.begin).tz(self.preferences.zone).format('YYYY-MM-DD HH:mm:ss') : '',
            end: plans[i].value[j].period.end ? moment(plans[i].value[j].period.end).tz(self.preferences.zone).format('YYYY-MM-DD HH:mm:ss') : '',
            repeat: plans[i].value[j].period.repeat,
            class: this.coreService.getColor(plans[i].value[j].state.severity, 'bg'),
            duration: dur > 60 ? (dur / (60 * 60)) : 1,
            progress: dur > 60 ? (dur / (60 * 60)) : 0.1,
            state: plans[i].value[j].state,
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
        radio: 'planned',
        planned: 'today',
        schedules: [],
        state: [],
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
  nodes = [];
  schedules = [];
  workflowTree = [];

  constructor(public coreService: CoreService) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getFolderTree();
  }

  getFolderTree() {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      forInventory: true,
      types: ['SCHEDULE']
    }).subscribe(res => {
      this.nodes = this.coreService.prepareTree(res, true);
      if (this.nodes.length > 0) {
        this.nodes[0].expanded = true;
      }
    });
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      forInventory: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.workflowTree = this.coreService.prepareTree(res, true);
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
        let obj: any = {
          path: node.key,
          objectTypes: ['WORKFLOW']
        };
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
          let data = res.workflows;
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = _path;
            data[i].path = _path;
            data[i].type = 'WORKFLOW';
            data[i].key = _path;
            data[i].isLeaf = true;
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;
          node.origin.children = data;
          this.workflowTree = [...this.workflowTree];
        });
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
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.permission.user,
      configurationType: 'CUSTOMIZATION',
      objectType: 'DAILYPLAN',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };

    const obj: any = {};
    obj.workflow = result.workflow;
    obj.folders = result.folders;
    obj.schedules = result.schedules;
    obj.dailyPlanDate = result.dailyPlanDate;
    obj.state = result.state;
    obj.late = result.late;
    obj.name = result.name;
    if (result.radio && result.dailyPlanDate) {
      obj.dailyPlanDate = result.dailyPlanDate;
    } else {
      obj.planned = result.planned;
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
  submissionHistoryItems: any = [];
  planOrders: any = [];
  isLoaded = false;
  dailyPlanFilters: any = {filter: {}};
  pageView: string;
  savedFilter: any = {};
  selectedFiltered: any = {};
  searchFilter: any = {};
  temp_filter: any = {};
  filterList: any = [];
  showSearchPanel = false;
  selectedSubmissionId: number;
  isSearchHit = false;
  dateFormatM: any;
  isPastDate = false;
  isToggle = false;
  selectedDate: Date;
  submissionHistory: any = [];
  object: any = {templates: [], checkbox: false};
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modalService: NgbModal, private groupBy: GroupByPipe, private translate: TranslateService,
              private searchPipe: SearchPipe, private orderPipe: OrderPipe, private excelService: ExcelService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });

    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf();
    });
  }

  ngOnInit() {
    this.initConf();
    if (this.pageView === 'grid') {
      this.isToggle = true;
    }
  }

  ngOnDestroy() {
    this.dailyPlanFilters.selectedDate = this.selectedDate;
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  loadOrderPlan() {
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      filter: {}
    };
    if (this.selectedFiltered && this.selectedFiltered.name) {
      this.selectedDate = new Date(new Date().setFullYear(1970));
      $('#full-calendar').data('calendar').setSelectedDate(this.selectedDate);
      this.applySearchFilter(obj.filter, this.selectedFiltered);
    } else {
      obj.filter.dailyPlanDate = moment(this.selectedDate).format('YYYY-MM-DD');
      if (this.selectedSubmissionId) {
        obj.filter.submissionHistoryIds = [this.selectedSubmissionId];
      }
      if (this.dailyPlanFilters.filter.status && this.dailyPlanFilters.filter.status !== 'ALL') {
        obj.filter.states = [this.dailyPlanFilters.filter.status];
      }
      if (this.dailyPlanFilters.filter.late) {
        obj.filter.late = true;
      }
    }
    this.coreService.post('daily_plan/orders', obj).subscribe((res: any) => {
      this.filterData(res.plannedOrderItems);
      this.isLoaded = true;
    }, (err) => {
      this.isLoaded = true;
    });
  }

  selectSubmissionHistory(id) {
    this.selectedSubmissionId = id;
    this.loadOrderPlan();
  }

  private load(date): void {
    if (!date) {
      this.isLoaded = false;
    }
    const d = date || new Date();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 0, 0, 0, 0);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 0);
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      timeZone: this.preferences.zone,
      filter: {
        dateFrom: firstDay,
        dateTo: lastDay
      }
    };
    this.coreService.post('daily_plan/submissions', obj).subscribe((result: any) => {
      this.submissionHistoryItems = [];
      this.submissionHistory = [];
      if (result.submissionHistoryItems.length > 0) {
        for (let i = 0; i < result.submissionHistoryItems.length; i++) {
          result.submissionHistoryItems[i].startDate = new Date(result.submissionHistoryItems[i].dailyPlanDate).setHours(0, 0, 0, 0);
          result.submissionHistoryItems[i].endDate = result.submissionHistoryItems[i].startDate;
          this.submissionHistoryItems.push(result.submissionHistoryItems[i]);
          if (this.selectedDate && this.selectedDate.getTime() === result.submissionHistoryItems[i].startDate) {
            this.submissionHistory.push(result.submissionHistoryItems[i]);
          }
        }
        const calendar = $('#full-calendar').data('calendar');
        if (calendar) {
          calendar.setDataSource(this.submissionHistoryItems);
        }
      }

      this.isLoaded = true;
    }, () => {
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
    this.dailyPlanFilters.filter.late = !this.dailyPlanFilters.filter.late;
    if (this.dailyPlanFilters.filter.late) {
      if (this.dailyPlanFilters.filter.status === 'ALL') {
        this.dailyPlanFilters.filter.status = '';
      }
    }
    this.loadOrderPlan();
  }

  expandCollapseDetails(flag) {
    this.isToggle = flag;
    if (this.pageView !== 'grid') {
      this.planOrders.forEach((order) => {
        if (this.dailyPlanFilters.filter.groupBy === 'WORKFLOW') {
          order.show = flag;
        } else {
          order.order = flag;
        }
      });
    }
  }

  groupByWorkflow(type) {
    if (this.dailyPlanFilters.filter.groupBy !== type) {
      this.dailyPlanFilters.filter.groupBy = type;
      this.planOrders = this.groupBy.transform(this.plans, type === 'WORKFLOW' ? 'workflowPath' : 'schedulePath');
    }
  }

  createPlan() {
    const modalRef = this.modalService.open(CreatePlanModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.result.then((res) => {
      this.load(this.selectedDate);
      this.loadOrderPlan();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  /* ------------- Action ------------------- */

  submitSelectedOrder() {
    const modalRef = this.modalService.open(SubmitOrderModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.orders = this.object.templates;
    modalRef.result.then((res) => {
      this.load(this.selectedDate);
      this.resetCheckBox();
      this.loadOrderPlan();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  submitOrder(order, plan, workflow) {
    const modalRef = this.modalService.open(SubmitOrderModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.order = order;
    modalRef.componentInstance.plan = workflow ? null : plan;
    modalRef.componentInstance.workflow = workflow;
    modalRef.result.then((res) => {
      this.load(this.selectedDate);
      this.resetCheckBox();
      this.loadOrderPlan();
    }, () => {

    });
  }

  cancelSelectedOrder() {
    this.restCall(false, null, this.object.templates);
  }

  cancelOrderWithKill(order, plan, workflow) {
    if (plan && plan.value) {
      this.restCall(true, null, plan.value);
    } else {
      this.restCall(true, order, null);
    }
  }

  cancelOrder(order, plan, workflow) {
    if (plan && plan.value) {
      this.restCall(false, null, plan.value);
    } else {
      this.restCall(false, order, null);
    }
  }

  private restCall(isKill, order, multiple) {
    const obj: any = {
      controllerId: this.schedulerIds.selected, orderIds: [], kill: isKill
    };
    if (multiple) {
      multiple.forEach((value) => {
        obj.orderIds.push(value.orderId);
      });
    } else {
      obj.orderIds.push(order.orderId);
    }
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Order',
        operation: 'Cancel',
        name: ''
      };
      if (order) {
        comments.name = order.orderId;
      } else {
        multiple.forEach((value, index) => {
          if (index == multiple.length - 1) {
            comments.name = comments.name + ' ' + value.orderId;
          } else {
            comments.name = value.orderId + ', ' + comments.name;
          }
        });
      }
      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'orders/cancel';
      modalRef.result.then((result) => {
        this.resetCheckBox();
      }, () => {

      });
    } else {
      this.coreService.post('orders/cancel', obj).subscribe(() => {
        this.resetCheckBox();
        this.loadOrderPlan();
      });
    }
  }

  removeSelectedOrder() {
    const modalRef = this.modalService.open(RemovePlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.orders = this.object.templates;
    modalRef.componentInstance.timeZone = this.preferences.zone;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.result.then((res) => {
      this.load(this.selectedDate);
      this.resetCheckBox();
      this.loadOrderPlan();
    }, () => {

    });
  }

  removeOrder(order, plan, workflow) {
    const modalRef = this.modalService.open(RemovePlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.order = order;
    modalRef.componentInstance.plan = workflow ? null : plan;
    modalRef.componentInstance.workflow = workflow;
    modalRef.componentInstance.timeZone = this.preferences.zone;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.result.then((res) => {
      this.load(this.selectedDate);
      this.resetCheckBox();
      this.loadOrderPlan();
    }, () => {

    });
  }

  addDetailsOfOrder(plan) {
    plan.show = plan.show === undefined || plan.show === false;
    if (plan.show) {
      this.coreService.post('orders/variables', {
        orderId: plan.orderId,
        controllerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        plan.variables = res.variables;
      }, err => {
      });
    }
  }

  expandCollapseTable(plan) {
    plan.show = plan.show === undefined || plan.show === false;
  }

  expandCollapseOrder(plan) {
    plan.order = plan.order === undefined || plan.order === false;
  }

  exportToExcel() {
    let workflow = '', order = '', status = '', late = '', plannedStart = '', exceptedEnd = '', expectedDuration = '',
      startTime = '', endTime = '', duration = '', repeatInterval = '';
    this.translate.get('dailyPlan.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('dailyPlan.label.order').subscribe(translatedValue => {
      order = translatedValue;
    });
    this.translate.get('dailyPlan.label.status').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('dailyPlan.label.late').subscribe(translatedValue => {
      late = translatedValue;
    });
    this.translate.get('dailyPlan.label.plannedStart').subscribe(translatedValue => {
      plannedStart = translatedValue;
    });
    this.translate.get('dailyPlan.label.expectedEnd').subscribe(translatedValue => {
      exceptedEnd = translatedValue;
    });
    this.translate.get('dailyPlan.label.expectedDuration').subscribe(translatedValue => {
      expectedDuration = translatedValue;
    });
    this.translate.get('dailyPlan.label.startTime').subscribe(translatedValue => {
      startTime = translatedValue;
    });
    this.translate.get('dailyPlan.label.endTime').subscribe(translatedValue => {
      endTime = translatedValue;
    });
    this.translate.get('dailyPlan.label.repeatInterval').subscribe(translatedValue => {
      repeatInterval = translatedValue;
    });
    this.translate.get('dailyPlan.label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });

    let data = [];
    for (let i = 0; i < this.planOrders.length; i++) {
      let obj: any = {};
      obj[workflow] = this.planOrders[i].value[0].workflowPath;
      obj[order] = this.planOrders[i].value[0].schedulePath;
      obj[status] = '';
      obj[late] = '';
      obj[plannedStart] = '';
      obj[exceptedEnd] = '';
      obj[expectedDuration] = '';
      obj[startTime] = '';
      obj[endTime] = '';
      obj[duration] = '';
      obj[repeatInterval] = '';

      data.push(obj);
      for (let j = 0; j < this.planOrders[i].value.length; j++) {
        obj = {};
        obj[workflow] = this.planOrders[i].value[j].workflowPath;
        obj[order] = this.planOrders[i].value[j].orderId;
        obj[status] = this.planOrders[i].value[j].status;
        obj[late] = this.planOrders[i].value[j].late ? 'late' : '';
        obj[plannedStart] = this.planOrders[i].value[j].plannedStartTime;
        obj[exceptedEnd] = this.planOrders[i].value[j].expectedEndTime;
        obj[expectedDuration] = this.planOrders[i].value[j].expectedDuration;
        obj[startTime] = this.planOrders[i].value[j].startTime;
        obj[endTime] = this.planOrders[i].value[j].endTime;
        obj[duration] = this.planOrders[i].value[j].duration;
        obj[repeatInterval] = this.planOrders[i].value[j].period.repeat ? 'Repeat every ' + this.planOrders[i].value[j].period.repeat + 's' : '';

        data.push(obj);
      }
    }
    this.excelService.exportAsExcelFile(data, 'JS7-dailyplan');
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
      schedules: [],
      state: []
    };
  }

  applySearchFilter(obj, filter) {
    if (filter.workflowPaths) {
      obj.workflowPaths = filter.workflowPaths;
    }
    if (filter.radio === 'planned' || !filter.radio) {
      obj.dailyPlanDate = this.parseProcessExecuted(filter.planned);
    } else {
      obj.dailyPlanDate = moment(filter.dailyPlanDate || new Date()).format('YYYY-MM-DD');
    }
    if (filter.late) {
      obj.late = true;
    }
    if (filter.state && filter.state.length > 0) {
      obj.states = filter.state;
    }
    if (filter.schedules && filter.schedules.length > 0) {
      obj.schedulePaths = filter.schedules;
    }
    return obj;
  }

  getDates(startDate, endDate) {
    let dates = [],
      currentDate = startDate,
      addDays = function (days) {
        const date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  }

  search() {
    this.isSearchHit = true;
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      filter: {}
    };

    if (this.searchFilter.radio === 'current') {
      let dates = this.getDates(this.searchFilter.from, this.searchFilter.to);
      dates.forEach(function (date) {
        console.log(date);
      });
    }

    this.applySearchFilter(obj.filter, this.searchFilter);
    this.coreService.post('daily_plan/orders', obj).subscribe((res: any) => {
      this.filterData(res.plannedOrderItems);
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  private updateTable(filterData) {
    let tempArr = [];
    if (this.planOrders && this.planOrders.length > 0) {
      tempArr = this.coreService.clone(this.planOrders);
    }
    this.planOrders = this.groupBy.transform(filterData, this.dailyPlanFilters.filter.groupBy === 'WORKFLOW' ? 'workflowPath' : 'schedulePath');
    if (this.dailyPlanFilters.filter.sortBy === 'orderId') {
      this.planOrders = this.orderPipe.transform(this.planOrders,
        this.dailyPlanFilters.filter.groupBy === 'ORDER' ? 'schedulePath' : this.dailyPlanFilters.filter.sortBy,
        this.dailyPlanFilters.reverse);
    }
    if (tempArr.length > 0) {
      for (let i = 0; i < tempArr.length; i++) {
        for (let j = 0; j < this.planOrders.length; j++) {
          if (this.planOrders[j].key === tempArr[i].key) {
            this.planOrders[j].order = tempArr[i].order;
            this.planOrders[j].show = tempArr[i].show;
            break;
          }
        }
      }
    }
    this.planOrders = [...this.planOrders];
  }

  sortBy() {
    this.plans = this.orderPipe.transform(this.plans, this.dailyPlanFilters.filter.sortBy, this.dailyPlanFilters.reverse);
    this.updateTable(this.plans);
  }

  searchInResult() {
    this.updateTable(this.dailyPlanFilters.searchText ? this.searchPipe.transform(this.plans, this.dailyPlanFilters.searchText) : this.plans);
  }

  cancel() {
    this.showSearchPanel = false;
    this.searchFilter = {};
    if (this.isSearchHit) {
      this.isSearchHit = false;
      this.loadOrderPlan();
    }
  }

  private parseProcessExecuted(regex) {
    let date;
    if (/^\s*[-,+](\d+)(d)\s*$/.test(regex) || /^\s*(\d+)(d)\s*$/.test(regex)) {
      date = regex;
    } else if (/^\s*(Today)\s*$/i.test(regex)) {
      date = '0d';
    } else if (/^\s*(now)\s*$/i.test(regex)) {
      date = moment.utc(new Date());
    } else if (/^\s*(\d+)(d)\s*$/.test(regex)) {
      date = regex;
    }
    return date;
  }

  modifyOrder(order, plan) {
    console.log(plan);
    console.log(order);
    const modalRef = this.modalService.open(ScheduleTemplateModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.order = order;
    modalRef.componentInstance.plan = plan;
    modalRef.result.then((res) => {

    }, () => {

    });
  }

  changeParameter(plan, order) {
    if (!order) {
      this.coreService.post('orders/variables', {
        orderId: plan.orderId,
        controllerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        plan.variables = res.variables;
        this.openModel(plan, null);
      }, err => {

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
        this.loadOrderPlan();
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
    }, () => {

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
        controllerId: filter.controllerId,
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
    if ($event === 'grid') {
      this.isToggle = true;
    }
    this.pageView = $event;
    this.resetCheckBox();
  }

  checkAll() {
    if (this.planOrders.length > 0) {
      let orders = this.planOrders.slice((this.preferences.entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (this.preferences.entryPerPage * this.dailyPlanFilters.currentPage));
      if (this.object.checkbox) {
        this.object.templates = [];
        for (let i = 0; i < orders.length; i++) {
          orders[i].checkbox = true;
          this.object.templates = this.object.templates.concat(orders[i].value);
        }
      } else {
        this.object.templates = [];
        for (let i = 0; i < orders.length; i++) {
          orders[i].checkbox = false;
        }
      }
    } else {
      this.object.checkbox = false;
    }
  }

  checkOrderTemplate(template) {
    if (template.checkbox) {
      for (let i = 0; i < template.value.length; i++) {
        let flag = true;
        for (let j = 0; j < this.object.templates.length; j++) {
          if ((this.object.templates[j].orderId === template.value[i].orderId) && ((this.object.templates[j].workflowPath === template.key) || (this.object.templates[j].schedulePath === template.key))) {
            flag = false;
            break;
          }
        }
        if (flag) {
          this.object.templates.push(template.value[i]);
        }
      }
    } else {
      for (let i = 0; i < template.value.length; i++) {
        for (let j = 0; j < this.object.templates.length; j++) {
          if (this.object.templates[j].orderId === template.value[i].orderId) {
            this.object.templates.splice(j, 1);
            break;
          }
        }
      }
    }
    this.object.templates = [...this.object.templates];
    this.updateMainCheckbox();
  }

  checkPlan(plan) {
    let count = 0;
    for (let i = 0; i < this.object.templates.length; i++) {
      if ((this.object.templates[i].workflowPath === plan.key) || (this.object.templates[i].schedulePath === plan.key)) {
        ++count;
      }
    }
    plan.checkbox = count === plan.value.length;
    this.updateMainCheckbox();
  }

  private updateMainCheckbox() {
    let data = this.planOrders.slice((this.preferences.entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (this.preferences.entryPerPage * this.dailyPlanFilters.currentPage));
    let flag = true;
    for (let i = 0; i < data.length; i++) {
      if (!data[i].checkbox) {
        flag = false;
        break;
      }
    }
    this.object.checkbox = flag;
  }

  sort(key) {
    this.dailyPlanFilters.reverse = !this.dailyPlanFilters.reverse;
    this.dailyPlanFilters.filter.sortBy = key;
    this.sortBy();
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
      this.resetCheckBox();
    }
  }

  private initConf() {
    if (!sessionStorage.preferences) {
      setTimeout(() => {
        this.initConf();
      }, 100);
      return;
    }
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.dailyPlanFilters = this.coreService.getDailyPlanTab();
    this.savedFilter = JSON.parse(this.saveService.dailyPlanFilters) || {};
    if (this.dailyPlanFilters.selectedDate) {
      this.selectedDate = this.dailyPlanFilters.selectedDate;
      if (typeof this.selectedDate.getMonth !== 'function') {
        this.selectedDate = new Date(this.selectedDate);
      }
      this.isPastDate = this.selectedDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
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
        this.isPastDate = this.selectedDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        this.submissionHistory = e.events;
        this.selectedSubmissionId = null;
        this.loadOrderPlan();
      },
      renderEnd: (e) => {
        const year = e.currentYear || new Date().getFullYear(), month = e.currentMonth || new Date().getMonth();
        this.load(new Date(year, month, 1));
      }
    });
  }

  private openModel(plan, updateOnly) {
    const modalRef = this.modalService.open(ChangeParameterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.variable = plan.variables;
    modalRef.componentInstance.order = plan;
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
    }, () => {
    });
  }

  private refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'DailyPlanChanged') {
          this.load(this.selectedDate);
          this.loadOrderPlan();
          break;
        }
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
    if (res.configurations && res.configurations.length > 0) {
      this.filterList = res.configurations;
    }
    this.getCustomizations();
  }

  private checkSharedFilters() {
    if (this.permission.JOCConfigurations.share.view.status) {
      const obj = {
        controllerId: this.schedulerIds.selected,
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
      const data = [];
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
            controllerId: value.controllerId,
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
    const obj = {
      controllerId: this.schedulerIds.selected,
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

    if (planItems && planItems.length) {
      for (let i = 0; i < planItems.length; i++) {
        planItems[i].plannedDate = planItems[i].plannedStartTime;
        planItems[i].expectedDuration = this.coreService.calDuration(planItems[i].plannedStartTime, planItems[i].expectedEndTime);
        planItems[i].expectedDuration1 = new Date(planItems[i].plannedStartTime).getTime() - new Date(planItems[i].expectedEndTime).getTime();
        planItems[i].duration = this.coreService.calDuration(planItems[i].startTime, planItems[i].endTime);
        planItems[i].plannedStartTime = this.coreService.stringToDate(this.preferences, planItems[i].plannedStartTime);
        planItems[i].expectedEndTime = this.coreService.stringToDate(this.preferences, planItems[i].expectedEndTime);
        planItems[i].startTime = this.coreService.stringToDate(this.preferences, planItems[i].startTime);
        planItems[i].endTime = this.coreService.stringToDate(this.preferences, planItems[i].endTime);
        if (planItems[i].state && planItems[i].state._text) {
          this.translate.get(planItems[i].state._text).subscribe(translatedValue => {
            planItems[i].status = translatedValue;
          });
        }
      }

      this.plans = planItems;
      this.sortBy();
    } else {
      this.plans = [];
      this.planOrders = [];
    }
  }

  private resetCheckBox() {
    this.object.templates = [];
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
}
