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
  OnChanges
} from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {OrderPipe} from 'ngx-order-pipe';
import * as moment from 'moment';
import * as _ from 'underscore';
import {Router} from '@angular/router';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {GroupByPipe, SearchPipe} from '../../filters/filter.pipe';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {ExcelService} from '../../services/excel.service';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../components/modify-modal/modify.component';
import {ResumeOrderModalComponent} from '../../components/resume-modal/resume.component';
import {ToasterService} from 'angular2-toaster';

declare const JSGantt;
declare let jsgantt;
declare const $;

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
      obj.selector = {schedulePaths: this.selectedTemplates.schedules};
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
  @Input() submissionsDelete: boolean;

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
    if (!obj.filter.dailyPlanDate && this.selectedDate && !this.submissionsDelete) {
      obj.filter.dailyPlanDate = moment(this.selectedDate).format('YYYY-MM-DD');
    } else if (this.submissionsDelete) {
      obj.filter.dateFrom = new Date(this.selectedDate);
      let d = new Date(this.selectedDate).setDate(obj.filter.dateFrom.getDate() + 1);
      obj.filter.dateTo = new Date(d);
      // obj.filter.timeZone = this.timeZone;
    }
    this.remove(obj);
  }

  private remove(obj) {
    this.submitted = true;
    this.coreService.post(this.submissionsDelete ? 'daily_plan/submissions/delete' : 'daily_plan/orders/delete', obj).subscribe((res) => {
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
    this.initConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    JSGantt();
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
    if (this.groupBy === 'WORKFLOW' || this.groupBy === 'ORDER') {
      const plans = this.data;
      const len = plans.length;
      if (len > 0) {
        let count = 0;
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
    } else {
      for (let j = 0; j < this.data.length; j++) {
        const dur = this.data[j].expectedDuration1;
        const obj: any = {
          id: (j + 1),
          col1: this.data[j].orderId,
          col2: this.groupBy === 'WORKFLOW' ? '' : this.data[j].workflowPath,
          plannedDate: moment(this.data[j].plannedDate).tz(this.preferences.zone).format('YYYY-MM-DD HH:mm:ss'),
          begin: this.data[j].period.begin ? moment(this.data[j].period.begin).tz(self.preferences.zone).format('YYYY-MM-DD HH:mm:ss') : '',
          end: this.data[j].period.end ? moment(this.data[j].period.end).tz(self.preferences.zone).format('YYYY-MM-DD HH:mm:ss') : '',
          repeat: this.data[j].period.repeat,
          class: this.coreService.getColor(this.data[j].state.severity, 'bg'),
          duration: dur > 60 ? (dur / (60 * 60)) : 1,
          progress: dur > 60 ? (dur / (60 * 60)) : 0.1,
          state: this.data[j].state
        };
        this.tasks.push(obj);
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
        from1: '0d',
        to1: '0d',
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
    obj.state = result.state;
    obj.late = result.late;
    obj.name = result.name;
    obj.from = result.from1;
    obj.to = result.to1;

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
  objectType = 'DAILYPLAN';
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
  expandedPaths = new Set();

  object = {
    mapOfCheckedId: new Map(),
    checked: false,
    indeterminate: false,
    isCancel: false,
    isSuspend: false,
    isResume: false,
    isModify: false,
    isRunning: false,
    isPlanned: false,
    isFinished: false
  };

  filterBtn: any = [
    {status: 'ALL', text: 'all'},
    {status: 'PLANNED', text: 'planned'},
    {status: 'PENDING', text: 'pending'},
    {status: 'INPROGRESS', text: 'incomplete'},
    {status: 'RUNNING', text: 'running'},
    {status: 'SUSPENDED', text: 'suspended'},
    {status: 'CALLING', text: 'calling'},
    {status: 'WAITING', text: 'waiting'},
    {status: 'BLOCKED', text: 'blocked'},
    {status: 'FAILED', text: 'failed'},
    {status: 'FINISHED', text: 'finished'}
  ];

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private modalService: NgbModal, private groupBy: GroupByPipe,
              private translate: TranslateService, private searchPipe: SearchPipe, private orderPipe: OrderPipe,
              public toasterService: ToasterService, private excelService: ExcelService, private router: Router) {
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
      this.selectedDate = new Date();
      $('#full-calendar').data('calendar').setSelectedDate(this.selectedDate);
      this.applySearchFilter(obj.filter, this.selectedFiltered);
      this.getDatesByUrl([this.selectedFiltered.from, this.selectedFiltered.to], (dates) => {
        this.callApi(new Date(dates[0]), new Date(dates[1]), obj);
      });
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
      this.coreService.post('daily_plan/orders', obj).subscribe((res: any) => {
        this.filterData(res.plannedOrderItems);
        this.isLoaded = true;
      }, (err) => {
        this.isLoaded = true;
      });
    }
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
    }, () => {

    });
  }

  getPlans(status): void {
    if (status === 'ALL') {
      this.dailyPlanFilters.filter.late = false;
    }
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
      if (!this.dailyPlanFilters.filter.groupBy) {
        this.planOrders.forEach((order) => {
          this.addDetailsOfOrder(order);
        });
      } else {
        this.planOrders.forEach((order) => {
          if (this.dailyPlanFilters.filter.groupBy === 'WORKFLOW') {
            order.show = flag;
          } else if (this.dailyPlanFilters.filter.groupBy === 'ORDER') {
            order.order = flag;
          }
        });
      }
    }
  }

  private updateList() {
    this.load(this.selectedDate);
    this.loadOrderPlan();
    this.resetCheckBox();
  }

  groupByWorkflow(type) {
    if (this.dailyPlanFilters.filter.groupBy !== type) {
      this.dailyPlanFilters.filter.groupBy = type;
      if (type) {
        this.planOrders = this.groupBy.transform(this.plans, type === 'WORKFLOW' ? 'workflowPath' : 'schedulePath');
      } else {
        this.planOrders = this.plans.slice();
      }
    }
    this.setStateToParentObject();
  }

  createPlan() {
    const modalRef = this.modalService.open(CreatePlanModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.result.then((res) => {
      this.updateList();
    }, () => {

    });
  }

  /**--------------- Begin Navigate -------------------*/

  navToHistory() {
    let filter = this.coreService.getHistoryTab();
    filter.type = 'SUBMISSION';
    filter.submission.selectedView = false;
    filter.task.filter.date = 'today';
    this.router.navigate(['/history']);
  }

  navToOrderHistory(orderId) {
    let filter = this.coreService.getHistoryTab();
    filter.type = 'ORDER';
    filter.order.selectedView = false;
    filter.order.filter.date = 'today';
    this.router.navigate(['/history']);
  }

  /**--------------- Navigate End-------------------*/

  deleteSubmission(): void {
    const modalRef = this.modalService.open(RemovePlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.timeZone = this.preferences.zone;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.componentInstance.submissionsDelete = true;
    modalRef.result.then((res) => {
      this.updateList();
    }, () => {

    });
  }

  /* ------------- Action ------------------- */

  modifySelectedOrder() {
    let order = this.object.mapOfCheckedId.values().next().value;
    if (order.requirements) {
      openModal(order.requirements);
    } else {
      this.coreService.post('workflow', {
        controllerId: this.schedulerIds.selected,
        workflowId: {path: order.workflowPath}
      }).subscribe((res: any) => {
        order.requirements = res.workflow.orderRequirements;
        openModal(order.requirements);
      });
    }
    const self = this;

    function openModal(requirements) {
      const modalRef = self.modalService.open(ChangeParameterModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerId = self.schedulerIds.selected;
      modalRef.componentInstance.preferences = self.preferences;
      modalRef.componentInstance.orders = self.object.mapOfCheckedId;
      modalRef.componentInstance.orderRequirements = requirements;
      modalRef.result.then((res) => {
        self.updateList();
      }, () => {

      });
    }
  }

  submitSelectedOrder() {
    const modalRef = this.modalService.open(SubmitOrderModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.orders = this.object.mapOfCheckedId;
    modalRef.result.then((res) => {
      this.updateList();
    }, (reason) => {

    });
  }

  submitOrder(order, plan, workflow) {
    const modalRef = this.modalService.open(SubmitOrderModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.order = order;
    modalRef.componentInstance.plan = workflow ? null : plan;
    modalRef.componentInstance.workflow = workflow;
    modalRef.result.then((res) => {
      this.updateList();
    }, () => {

    });
  }

  resumeSelectedOrder() {
    this.restCall(false, null, this.object.mapOfCheckedId, 'Resume');
  }

  cancelSelectedOrder() {
    this.restCall(false, null, this.object.mapOfCheckedId, 'Cancel');
  }

  suspendSelectedOrder() {
    this.restCall(false, null, this.object.mapOfCheckedId, 'Suspend');
  }

  cancelOrderWithKill(order, plan) {
    if (plan && plan.value) {
      this.restCall(true, null, plan.value, 'Cancel');
    } else {
      this.restCall(true, order, null, 'Cancel');
    }
  }

  cancelOrder(order, plan) {
    if (plan && plan.value) {
      this.restCall(false, null, plan.value, 'Cancel');
    } else {
      this.restCall(false, order, null, 'Cancel');
    }
  }

  suspendOrderWithKill(order, plan) {
    if (plan && plan.value) {
      this.restCall(true, null, plan.value, 'Suspend');
    } else {
      this.restCall(true, order, null, 'Suspend');
    }
  }

  suspendOrder(order, plan) {
    if (plan && plan.value) {
      this.restCall(false, null, plan.value, 'Suspend');
    } else {
      this.restCall(false, order, null, 'Suspend');
    }
  }

  resumeOrder(order, plan) {
    if (plan && plan.value) {
      this.restCall(false, null, plan.value, 'Resume');
    } else {
      const modalRef = this.modalService.open(ResumeOrderModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.preferences = this.preferences;
      modalRef.componentInstance.permission = this.permission;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.order = this.coreService.clone(order);
      modalRef.result.then((result) => {
        this.updateList();
      }, () => {

      });
    }
  }

  private restCall(isKill, order, multiple, type) {
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
        operation: type,
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
      modalRef.componentInstance.url = 'orders/' + type.toLowerCase();
      modalRef.result.then((result) => {
        this.updateList();
      }, () => {

      });
    } else {
      this.coreService.post('orders/' + type.toLowerCase(), obj).subscribe(() => {
        this.updateList();
      });
    }
  }

  removeSelectedOrder() {
    const modalRef = this.modalService.open(RemovePlanModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.orders = this.object.mapOfCheckedId;
    modalRef.componentInstance.timeZone = this.preferences.zone;
    modalRef.componentInstance.selectedDate = this.selectedDate;
    modalRef.result.then((res) => {
      this.updateList();
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
      this.updateList();
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
        this.convertObjectToArray(res, plan)
      }, err => {
      });
    }
  }

  expandCollapseTable(plan) {
    plan.show = plan.show === undefined || plan.show === false;
    if (plan.show) {
      this.expandedPaths.add(plan.key);
    } else {
      this.expandedPaths.delete(plan.key);
    }
  }

  expandCollapseOrder(plan) {
    plan.order = plan.order === undefined || plan.order === false;
    if (plan.order) {
      this.expandedPaths.add(plan.key);
    } else {
      this.expandedPaths.delete(plan.key);
    }
  }

  exportToExcel() {
    let workflow = '', workflowAndOrder = '', schedule = '', scheduleAndOrder = '', order = '', state = '', late = '', plannedStart = '',
      exceptedEnd = '', expectedDuration = '',
      startTime = '', endTime = '', duration = '', repeatInterval = '';
    this.translate.get('dailyPlan.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('dailyPlan.label.workflowAndOrder').subscribe(translatedValue => {
      workflowAndOrder = translatedValue;
    });
    this.translate.get('dailyPlan.label.scheduleAndOrder').subscribe(translatedValue => {
      scheduleAndOrder = translatedValue;
    });
    this.translate.get('dailyPlan.label.schedule').subscribe(translatedValue => {
      schedule = translatedValue;
    });
    this.translate.get('dailyPlan.label.order').subscribe(translatedValue => {
      order = translatedValue;
    });
    this.translate.get('dailyPlan.label.state').subscribe(translatedValue => {
      state = translatedValue;
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
    this.translate.get('common.label.duration').subscribe(translatedValue => {
      duration = translatedValue;
    });

    let data = [];
    for (let i = 0; i < this.planOrders.length; i++) {
      let obj: any = {};
      if (this.dailyPlanFilters.filter.groupBy === '') {
        obj[order] = this.planOrders[i].orderId;
        obj[schedule] = this.planOrders[i].schedulePath;
        obj[workflow] = this.planOrders[i].workflowPath;
      } else if (this.dailyPlanFilters.filter.groupBy === 'ORDER') {
        obj[scheduleAndOrder] = this.planOrders[i].value[0].schedulePath;
        obj[workflow] = this.planOrders[i].value[0].workflowPath;
      } else {
        obj[workflowAndOrder] = this.planOrders[i].value[0].workflowPath;
      }
      obj[state] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].status : '';
      obj[late] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].late ? 'late' : '' : '';
      obj[plannedStart] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].plannedStartTime : '';
      obj[exceptedEnd] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].expectedEndTime : '';
      obj[expectedDuration] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].expectedDuration : '';
      obj[startTime] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].startTime : '';
      obj[endTime] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].endTime : '';
      obj[duration] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].duration : '';
      obj[repeatInterval] = this.dailyPlanFilters.filter.groupBy === '' ? this.planOrders[i].period.repeat ? 'Repeat every ' + this.planOrders[i].period.repeat + 's' : '' : '';

      data.push(obj);
      if (this.dailyPlanFilters.filter.groupBy) {
        for (let j = 0; j < this.planOrders[i].value.length; j++) {
          obj = {};
          if (this.dailyPlanFilters.filter.groupBy === 'ORDER') {
            obj[scheduleAndOrder] = this.planOrders[i].value[j].orderId;
            obj[workflow] = this.planOrders[i].value[j].workflowPath;
          } else {
            obj[workflowAndOrder] = this.planOrders[i].value[0].orderId;
          }
          obj[state] = this.planOrders[i].value[j].status;
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
    }
    this.excelService.exportAsExcelFile(data, 'JS7-dailyplan');
  }

  /* ------------- Advance search ------------------- */
  advancedSearch() {
    this.showSearchPanel = true;
    this.searchFilter = {
      radio: 'current',
      from1: '0d',
      to1: '0d',
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

  getDatesByUrl(arr, cb) {
    this.coreService.post('utilities/convert_relative_dates', {relativDates: arr}).subscribe((res: any) => {
      cb(res.absoluteDates);
    }, () => {
      cb([]);
    });
  }

  search() {
    this.isSearchHit = true;
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      filter: {}
    };
    this.applySearchFilter(obj.filter, this.searchFilter);
    if (this.searchFilter.radio === 'current') {
      this.callApi(this.searchFilter.from, this.searchFilter.to, obj);
    } else {
      this.getDatesByUrl([this.searchFilter.from1, this.searchFilter.to1], (dates) => {
        this.callApi(new Date(dates[0]), new Date(dates[1]), obj);
      });
    }
  }

  private callApi(from, to, obj) {
    let apiArr = [];
    let dates = this.getDates(from, to);
    dates.forEach((date) => {
      obj.filter.dailyPlanDate = moment(date).format('YYYY-MM-DD');
      apiArr.push(this.coreService.post('daily_plan/orders', this.coreService.clone(obj)));
    });
    forkJoin(apiArr).subscribe((result) => {
      let plannedOrderItems = [];
      for (let i = 0; i < result.length; i++) {
        plannedOrderItems = plannedOrderItems.concat(result[i].plannedOrderItems);
      }
      this.filterData(plannedOrderItems);
      this.isLoaded = true;
    }, (err) => {
      this.isLoaded = true;
    });
  }

  private updateTable(filterData) {
    if (this.dailyPlanFilters.filter.groupBy) {
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
      this.setStateToParentObject();
    } else {
      this.planOrders = filterData;
    }
    if (this.planOrders && this.planOrders.length > 0 && this.dailyPlanFilters.filter.groupBy !== '') {
      for (let i = 0; i < this.planOrders.length; i++) {
        let lastDate = null;
        for (let j = 0; j < this.planOrders[i].value.length; j++) {
          this.planOrders[i].value[j].seperate = false;
          if (lastDate) {
            let d = new Date(this.planOrders[i].value[j].plannedDate).setHours(0, 0, 0, 0);
            if (d !== lastDate) {
              this.planOrders[i].value[j - 1].seperate = true;
            }
          }
          lastDate = new Date(this.planOrders[i].value[j].plannedDate).setHours(0, 0, 0, 0);
        }
      }
    }
    this.planOrders = [...this.planOrders];
  }

  private setStateToParentObject() {
    if (this.expandedPaths.size > 0 || this.isToggle) {
      for (let j = 0; j < this.planOrders.length; j++) {
        if (this.expandedPaths.has(this.planOrders[j].key) || this.isToggle) {
          this.planOrders[j].order = true;
          if (!this.dailyPlanFilters.filter.groupBy) {
            this.addDetailsOfOrder(this.planOrders[j]);
          } else {
            this.planOrders[j].show = true;
          }
        }
      }
    }
    if (this.planOrders.length > 0 && this.planOrders[0].value) {
      this.planOrders.forEach((plan) => {
        this.checkState(plan, plan.value);
      });
    } else {
      if (this.object.mapOfCheckedId.size > 0) {
        this.updateMainCheckbox();
      }
    }
  }

  private checkState(object, list) {
    object.isPlanned = true;
    object.isFinished = false;
    object.isRunning = false;
    object.isCancel = false;
    object.isModify = true;
    object.isSuspend = true;
    object.isResume = true;
    let count = 0;
    let workflow = null;
    list.forEach((order) => {
      if (this.object.mapOfCheckedId.size > 0 && this.object.mapOfCheckedId.has(order.orderId) && object.key) {
        ++count;
        object.checked = list.length === count;
        object.indeterminate = !object.checked;
      }
      if (order.state._text !== 'PLANNED') {
        object.isPlanned = false;
      }
      if (order.state._text !== 'SUSPENDED' && order.state._text !== 'FAILED') {
        object.isResume = false;
      }
      if (order.state._text === 'FINISHED') {
        object.isFinished = true;
      } else if (order.state._text === 'RUNNING') {
        object.isRunning = true;
      }
      if (order.state._text === 'FINISHED' || order.state._text === 'PLANNED') {
        object.isCancel = true;
      }
      if (order.state._text !== 'PLANNED' && order.state._text !== 'PENDING') {
        object.isModify = false;
      }
      if (order.state._text === 'PLANNED' || order.state._text === 'PENDING' || order.state._text === 'FAILED' || order.state._text === 'FINISHED') {
        object.isSuspend = false;
      }
     
      if (!workflow) {
        workflow = order.workflowPath;
      } else if (workflow !== order.workflowPath) {
        object.isModify = false;
      }
    });
  }

  checkAll() {
    if (this.planOrders.length > 0) {
      this.object.mapOfCheckedId.clear();
      let orders = this.planOrders.slice((this.preferences.entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (this.preferences.entryPerPage * this.dailyPlanFilters.currentPage));
      if (this.dailyPlanFilters.filter.groupBy) {
        if (this.object.checked) {
          for (let i = 0; i < orders.length; i++) {
            orders[i].indeterminate = false;
            orders[i].checked = true;
            orders[i].value.forEach(item => {
              this.object.mapOfCheckedId.set(item.orderId, item);
            });
          }
        } else {
          for (let i = 0; i < orders.length; i++) {
            orders[i].checked = false;
          }
        }
      } else {
        if (this.object.checked) {
          orders.forEach(item => {
            this.object.mapOfCheckedId.set(item.orderId, item);
          });
        }
      }
    } else {
      this.object.checked = false;
    }
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    this.checkState(this.object, this.object.mapOfCheckedId);
  }

  checkOrderTemplate(template) {
    template.indeterminate = false;
    if (template.checked) {
      for (let i = 0; i < template.value.length; i++) {
        if (!this.object.mapOfCheckedId.has(template.value[i].orderId)) {
          this.object.mapOfCheckedId.set(template.value[i].orderId, template.value[i]);
        }
      }
    } else {
      for (let i = 0; i < template.value.length; i++) {
        if (this.object.mapOfCheckedId.has(template.value[i].orderId)) {
          this.object.mapOfCheckedId.delete(template.value[i].orderId);
        }
      }
    }
    this.updateMainCheckbox();
  }

  onItemChecked(order: any, plan: any, checked: boolean): void {
    if (checked) {
      this.object.mapOfCheckedId.set(order.orderId, order);
    } else {
      this.object.mapOfCheckedId.delete(order.orderId);
    }
    this.checkPlan(plan);
  }

  private checkPlan(plan) {
    if (this.dailyPlanFilters.filter.groupBy) {
      let count = 0;
      this.object.mapOfCheckedId.forEach((item) => {
        if ((item.workflowPath === plan.key) || (item.schedulePath === plan.key)) {
          ++count;
        }
      });
      plan.checked = count === plan.value.length;
      plan.indeterminate = count > 0 && !plan.checked;
      this.updateMainCheckbox();
    } else {
      this.updateMainCheckbox();
    }
  }

  private updateMainCheckbox() {
    let data = this.planOrders.slice((this.preferences.entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (this.preferences.entryPerPage * this.dailyPlanFilters.currentPage));
    if (this.dailyPlanFilters.filter.groupBy) {
      this.object.checked = data.every(item => item.checked);
    } else {
      this.object.checked = data.every(item => this.object.mapOfCheckedId.has(item.orderId));
    }
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    this.checkState(this.object, this.object.mapOfCheckedId);
  }

  sortBy() {
    this.plans = this.orderPipe.transform(this.plans, this.dailyPlanFilters.filter.sortBy, this.dailyPlanFilters.reverse);
    this.updateTable(this.plans);
  }

  searchInResult() {
    this.updateTable(this.dailyPlanFilters.searchText ? this.searchPipe.transform(this.plans, this.dailyPlanFilters.searchText) : this.plans);
  }

  /* ---- Begin Action ------ */

  cancel() {
    this.showSearchPanel = false;
    this.searchFilter = {};
    if (this.isSearchHit) {
      this.isSearchHit = false;
      this.loadOrderPlan();
    }
  }

  modifyOrder(order) {
    const modalRef = this.modalService.open(ModifyStartTimeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.order = order;
    modalRef.result.then((res) => {
      this.loadOrderPlan();
    }, () => {

    });
  }

  private convertObjectToArray(res, order) {
    if (_.isEmpty(res)) {
      order.variables = [];
    } else {
      order.variables = Object.entries(res).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
  }

  changeParameter(plan, order, variable) {
    if (order) {
      this.coreService.post('orders/variables', {
        orderId: order.orderId,
        controllerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        this.convertObjectToArray(res, order);
        this.openModel(plan, order, variable);
      });
    } else {
      this.openModel(plan, order, variable);
    }
  }

  removeParameter(order, variable) {
    let canDelete = true;
    this.getRequirements(order, () => {
      if (order.requirements && order.requirements.parameters) {
        let x = order.requirements.parameters[variable.name];
        if (x && !x.default && x.default !== false && x.default !== 0) {
          canDelete = false;
        }
      }
      if (canDelete) {
        this.coreService.post('daily_plan/orders/modify', {
          controllerId: this.schedulerIds.selected,
          orderIds: [order.orderId],
          removeVariables: _.object([variable].map((val) => {
            return [val.name, val.value];
          }))
        }).subscribe((result) => {
          for (let i = 0; i < order.variables.length; i++) {
            if (_.isEqual(order.variables[i], variable)) {
              order.variables.splice(i, 1);
              break;
            }
          }
        }, () => {

        });
      } else {
        this.translate.get('common.message.requiredVariableCannotRemoved').subscribe(translatedValue => {
          this.toasterService.pop('warning', translatedValue);
        });
      }
    });
  }

  private getRequirements(order, cb) {
    if (order.requirements && order.requirements.parameters) {
      cb();
    } else {
      this.coreService.post('workflow', {
        controllerId: this.schedulerIds.selected,
        workflowId: {path: order.workflowPath}
      }).subscribe((res: any) => {
        order.requirements = res.workflow.orderRequirements;
        cb();
      });
    }
  }

  private openModel(plan, order, variable) {
    if (order) {
      if (!order.requirements) {
        this.coreService.post('workflow', {
          controllerId: this.schedulerIds.selected,
          workflowId: {path: order.workflowPath}
        }).subscribe((res: any) => {
          order.requirements = res.workflow.orderRequirements;
          this._openModel(plan, order, variable, order.requirements);
        });
      } else {
        this._openModel(plan, order, variable, order.requirements);
      }
    } else {
      if (plan && plan.value && plan.value.length > 0) {
        let requirements: any, workflowPath = '';
        plan.value.filter((value) => {
          if (requirements) {
            value.requirements = requirements;
          } else {
            if (value.requirements) {
              requirements = value.requirements;
            } else {
              workflowPath = value.workflowPath;
            }
          }
        });
        if (requirements) {
          this._openModel(plan, order, variable, requirements);
        } else {
          this.coreService.post('workflow', {
            controllerId: this.schedulerIds.selected,
            workflowId: {path: workflowPath}
          }).subscribe((res: any) => {
            this._openModel(plan, order, variable, res.workflow.orderRequirements);
          });
        }
      } else {
        this._openModel(plan, order, variable, []);
      }
    }
  }

  private _openModel(plan, order, variable, orderRequirements) {
    const modalRef = this.modalService.open(ChangeParameterModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.variable = variable;
    modalRef.componentInstance.order = order;
    modalRef.componentInstance.plan = plan;
    modalRef.componentInstance.orderRequirements = orderRequirements;
    modalRef.result.then((result) => {
      if (order && order.show) {
        this.coreService.post('orders/variables', {
          orderId: order.orderId,
          controllerId: this.schedulerIds.selected
        }).subscribe((res: any) => {
          this.convertObjectToArray(res, order);
        });
      } else {
        this.loadOrderPlan();
      }
    }, () => {
    });
  }

  /* ---- End Action ------ */

  /* ---- Begin Customization ------ */

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
    }, () => {

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

  /* ---- End Customization ------ */

  receiveMessage($event) {
    if ($event === 'grid') {
      this.isToggle = true;
    }
    this.pageView = $event;
    this.resetCheckBox();
  }

  sort(key) {
    this.dailyPlanFilters.reverse = !this.dailyPlanFilters.reverse;
    this.dailyPlanFilters.filter.sortBy = key;
    this.sortBy();
    this.resetCheckBox();
  }

  pageIndexChange($event) {
    this.dailyPlanFilters.currentPage = $event;
    this.resetCheckBox();
  }

  pageSizeChange($event) {
    this.dailyPlanFilters.entryPerPage = $event;
    if (this.object.checked) {
      this.checkAll();
    }
  }

  private resetCheckBox() {
    this.object = {
      mapOfCheckedId: new Map(),
      indeterminate: false,
      checked: false,
      isCancel: false,
      isSuspend: false,
      isResume: false,
      isModify: false,
      isRunning: false,
      isPlanned: false,
      isFinished: false
    };
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
        if (this.selectedFiltered) {
          this.changeFilter(null);
        } else {
          this.loadOrderPlan();
        }
      },
      renderEnd: (e) => {
        const year = e.currentYear || new Date().getFullYear(), month = e.currentMonth || new Date().getMonth();
        this.load(new Date(year, month, 1));
      }
    });
  }

  private refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/WorkflowStateChanged/)) {
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
        objectType: this.objectType,
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
          self.coreService.post('configuration', {
            controllerId: value.controllerId,
            id: value.id
          }).subscribe((conf: any) => {
            self.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
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
      objectType: this.objectType
    };
    this.coreService.post('configurations', obj).subscribe((res) => {
      this.filterCustomizationResponse(res);
    }, (err) => {
      this.savedFilter.selected = undefined;
      this.loadOrderPlan();
    });
  }

  private filterData(planItems): void {
    this.resetCheckBox();
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
        for (let j = 0; j < this.plans.length; j++) {
          if (this.plans[j].show && this.plans[j].orderId === planItems[i].orderId) {
            planItems[i].show = true;
            planItems[i].variables = this.plans[j].variables;
            break;
          }

        }
      }
      this.plans = planItems;
      this.sortBy();
    } else {
      this.plans = [];
      this.planOrders = [];
    }
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
