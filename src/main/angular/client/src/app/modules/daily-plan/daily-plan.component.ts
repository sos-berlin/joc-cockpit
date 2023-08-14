import {Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {forkJoin, of, Subject, Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {clone, isArray, isEmpty} from 'underscore';
import {Router} from '@angular/router';
import {catchError, takeUntil} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {EditFilterModalComponent} from '../../components/filter-modal/filter.component';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {
  ChangeParameterModalComponent,
  ModifyStartTimeModalComponent
} from '../../components/modify-modal/modify.component';
import {AuthService} from '../../components/guard';
import {GroupByPipe, OrderPipe, SearchPipe} from '../../pipes/core.pipe';
import {CoreService} from '../../services/core.service';
import {SaveService} from '../../services/save.service';
import {DataService} from '../../services/data.service';
import {ExcelService} from '../../services/excel.service';

declare const JSGantt: any;
declare let jsgantt: any;
declare const $: any;

@Component({
  selector: 'app-create-plan-modal-content',
  templateUrl: './create-plan-dialog.html'
})
export class CreatePlanModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId = ''
  selectedDate: Date | string | undefined;
  dateRanges: any = [];
  preferences: any;
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];
  objects: any = [];
  object: any = {at: 'all', overwrite: false, submitWith: false, workflowPaths: [], paths: []};
  plan: any;
  submitted = false;
  dateFormat: any;
  display: any;
  required = false;
  comments: any = {};
  scheduleTree: any = [];
  workflowsTree: any = [];
  selectedTemplates: any = {schedules: [], paths: []};

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.selectedDate = this.modalData.selectedDate;
    this.dateRanges = this.modalData.dateRanges || [];
    this.preferences = this.modalData.preferences;
    this.display = this.preferences.auditLog;
    this.getWorkflowTree();
    this.getScheduleTree();
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
  }

  private getWorkflowTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerId,
      forInventory: false,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.workflowsTree = this.coreService.prepareTree(res, true);
    });
  }

  private getScheduleTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerId,
      forInventory: false,
      types: ['SCHEDULE']
    }).subscribe((res) => {
      this.scheduleTree = this.coreService.prepareTree(res, true);
    });
  }

  remove(path, flag = false): void {
    if (flag) {
      this.selectedTemplates.paths.splice(this.selectedTemplates.paths.indexOf(path), 1);
    } else {
      this.object.paths.splice(this.object.paths.indexOf(path), 1);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      overwrite: this.object.overwrite,
      withSubmit: this.object.submitWith,
      controllerId: this.schedulerId
    };
    if (this.object.at === 'template' && (this.selectedTemplates.schedules.length > 0 || this.selectedTemplates.paths.length > 0)) {
      obj.schedulePaths = {};
      if (this.selectedTemplates.schedules.length > 0) {
        obj.schedulePaths.singles = this.selectedTemplates.schedules;
      }
      if (this.selectedTemplates.paths.length > 0) {
        this.selectedTemplates.paths.forEach((path) => {
          if (!obj.schedulePaths.folders) {
            obj.schedulePaths.folders = [];
          }
          obj.schedulePaths.folders.push({folder: path, recursive: true});
        });
      }
    }
    if ((this.object.workflowPaths && this.object.workflowPaths.length > 0) ||
      (this.object.paths && this.object.paths.length > 0)) {
      obj.workflowPaths = {};
      if (this.object.workflowPaths.length > 0) {
        obj.workflowPaths.singles = this.object.workflowPaths;
      }
      if (this.object.paths.length > 0) {
        this.object.paths.forEach((path) => {
          if (!obj.workflowPaths.folders) {
            obj.workflowPaths.folders = [];
          }
          obj.workflowPaths.folders.push({folder: path, recursive: true});
        });
      }
    }
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    if (this.dateRanges && this.dateRanges.length > 0) {
      this.recursivelyCreate(obj);
    } else {
      obj.dailyPlanDate = this.coreService.getStringDate(this.selectedDate);
      this.coreService.post('daily_plan/orders/generate', obj).subscribe({
        next: () => {
          this.activeModal.close('Done');
        }, error: () => this.submitted = false
      });
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private recursivelyCreate(obj): void {
    let apiArr = [];
    const dates = this.coreService.getDates(this.dateRanges[0], this.dateRanges[1]);
    dates.forEach((date) => {
      obj.dailyPlanDate = this.coreService.getStringDate(date);
      apiArr.push(this.coreService.post('daily_plan/orders/generate', this.coreService.clone(obj)).pipe(
        catchError(error => of(error))
      ));
    });
    forkJoin(apiArr).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-remove-plan-modal',
  templateUrl: './remove-plan-dialog.html',
})
export class RemovePlanModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: string;
  orders;
  order;
  workflow;
  timeZone;
  selectedDate;
  submissionsDelete: boolean;
  isSubmit: boolean;
  dateRange: any = [];

  submitted = false;
  count = 0;

  preferences: any;
  display: any;
  required = false;
  comments: any = {};

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.orders = this.modalData.orders;
    this.order = this.modalData.order;
    this.workflow = this.modalData.workflow;
    this.timeZone = this.modalData.timeZone;
    this.selectedDate = this.modalData.selectedDate;
    this.submissionsDelete = this.modalData.submissionsDelete;
    this.isSubmit = this.modalData.isSubmit;
    this.dateRange = this.modalData.dateRange || [];

    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.workflow && !this.order.key) {
      this.order.key = this.order.workflow;
    }
    if (this.order) {
      if (this.order.value) {
        if (this.order.value.length > 1) {
          this.order.value.forEach((value) => {
            this.count = this.count + (value.cyclicOrder ? value.cyclicOrder.count : 1);
          });
        } else {
          this.count = (this.order.value[0].cyclicOrder ? this.order.value[0].cyclicOrder.count : 1);
        }
      }
    } else if (this.orders) {
      this.orders.forEach((order) => {
        this.count = this.count + (order.cyclicOrder ? order.cyclicOrder.count : 1);
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerIds: [this.schedulerId],
    };

    if (this.order) {
      if (this.order.key) {
        obj.orderIds = [];
        this.order.value.forEach((order) => {
          obj.orderIds.push(order.orderId);
        });
      } else {
        obj.orderIds = [this.order.orderId];
      }
    } else if (this.orders) {
      obj.orderIds = [];
      this.orders.forEach((order) => {
        obj.orderIds.push(order.orderId);
      });
    }
    obj.dailyPlanDateFrom = this.coreService.getStringDate(this.selectedDate);
    obj.dailyPlanDateTo = this.coreService.getStringDate(this.selectedDate);
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    this.coreService.post('daily_plan/orders/submit', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }

  onRemove(): void {
    const obj: any = {};
    if (this.workflow) {
      obj.workflowPaths = [this.order.key];
    } else {
      if (this.order) {
        if (this.order.key) {
          obj.schedulePaths = [this.order.schedulePath || this.order.key];
        } else {
          obj.orderIds = [this.order.orderId];
        }
      }
    }

    if (this.orders) {
      obj.orderIds = [];
      this.orders.forEach((order) => {
        obj.orderIds.push(order.orderId);
      });
    }
    if (this.selectedDate && !this.submissionsDelete) {
      obj.dailyPlanDateFrom = this.coreService.getStringDate(this.selectedDate);
      obj.dailyPlanDateTo = this.coreService.getStringDate(this.selectedDate);
    } else if (this.dateRange && this.dateRange.length > 0) {
      obj.controllerId = this.schedulerId;
      obj.filter = {
        dateFrom: this.coreService.getStringDate(this.dateRange[0]),
        dateTo: this.coreService.getStringDate(this.dateRange[1])
      }
    } else if (this.submissionsDelete) {
      obj.controllerId = this.schedulerId;
      obj.filter = {
        dateFor: this.coreService.getStringDate(this.selectedDate)
      }
    }
    this.remove(obj);
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private remove(obj): void {
    this.submitted = true;
    if (!this.submissionsDelete) {
      obj.auditLog = {};
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    }
    if (this.dateRange && this.dateRange.length > 0 && !this.submissionsDelete) {
      this.removeRecursively(obj);
      return;
    }
    this.coreService.post(this.submissionsDelete ? 'daily_plan/submissions/delete' : 'daily_plan/orders/delete', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }

  private removeRecursively(obj): void {
    obj.dailyPlanDateFrom = this.coreService.getStringDate(this.dateRange[0]);
    obj.dailyPlanDateTo = this.coreService.getStringDate(this.dateRange[1]);
    this.coreService.post('daily_plan/orders/delete', this.coreService.clone(obj)).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-gantt',
  template: `
    <div #jsgantt class='jsgantt-chart'></div>`,
})
export class GanttComponent {
  @ViewChild('jsgantt', {static: true}) editor: ElementRef;

  @Input() data: any;
  @Input() groupBy: any;
  @Input() preferences: any;
  @Input() toggle: boolean;
  tasks = [];

  constructor(public coreService: CoreService, public translate: TranslateService) {
  }

  ngOnInit(): void {
    this.toggle = true;
    this.initConfig();
  }

  ngOnChanges(): void {
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
    let workflow = '';
    let scheduleAndOrder = '';
    let orders = '';
    let orderId = '';
    let cyclicOrder = '';
    let begin = '';
    let endText = '';
    let repeatEvery = '';
    this.translate.get('dailyPlan.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('dailyPlan.label.scheduleAndOrder').subscribe(translatedValue => {
      scheduleAndOrder = translatedValue;
    });
    this.translate.get('order.label.orders').subscribe(translatedValue => {
      orders = translatedValue;
    });
    this.translate.get('dailyPlan.label.order').subscribe(translatedValue => {
      orderId = translatedValue;
    });
    this.translate.get('dailyPlan.label.cyclicOrder').subscribe(translatedValue => {
      cyclicOrder = translatedValue;
    });
    this.translate.get('dailyPlan.label.begin').subscribe(translatedValue => {
      begin = translatedValue;
    });
    this.translate.get('dailyPlan.label.end').subscribe(translatedValue => {
      endText = translatedValue;
    });
    this.translate.get('dailyPlan.label.repeatEvery').subscribe(translatedValue => {
      repeatEvery = translatedValue;
    });
    jsgantt.config.columns = [{name: 'col2', tree: !0, label: workflow, align: 'left'}, {
      name: 'col1', label: scheduleAndOrder, width: '*', align: 'left'
    }];
    jsgantt.config.orders = orders;
    jsgantt.config.orderId = orderId;
    jsgantt.config.repeatEvery = repeatEvery;
    jsgantt.config.cyclicOrder = cyclicOrder;
    jsgantt.config.begin = begin;
    jsgantt.config.end = endText;
    jsgantt.locale.date = this.coreService.getLocale();
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
              plannedDate: this.coreService.getDateByFormat(plans[i].value[j].plannedDate, this.preferences.zone, 'YYYY-MM-DD HH:mm:ss'),
              begin: (plans[i].value[j].cyclicOrder && plans[i].value[j].cyclicOrder.firstStart) ? this.coreService.getDateByFormat(plans[i].value[j].cyclicOrder.firstStart, this.preferences.zone, 'YYYY-MM-DD HH:mm:ss') : '',
              end: (plans[i].value[j].cyclicOrder && plans[i].value[j].cyclicOrder.lastStart) ? this.coreService.getDateByFormat(plans[i].value[j].cyclicOrder.lastStart, this.preferences.zone, 'YYYY-MM-DD HH:mm:ss') : '',
              repeat: plans[i].value[j].period.repeat,
              class: this.coreService.getColor(plans[i].value[j].state.severity, 'bg'),
              duration: dur > 60 ? (dur / (60 * 60)) : 1,
              progress: dur > 60 ? (dur / (60 * 60)) : 0.1,
              state: plans[i].value[j].state,
              cyclicOrder: plans[i].value[j].cyclicOrder,
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
          plannedDate: this.coreService.getDateByFormat(this.data[j].plannedDate, this.preferences.zone, 'YYYY-MM-DD HH:mm:ss'),
          begin: (this.data[j].cyclicOrder && this.data[j].cyclicOrder.firstStart) ? this.coreService.getDateByFormat(this.data[j].cyclicOrder.firstStart, null, 'YYYY-MM-DD HH:mm:ss') : '',
          end: (this.data[j].cyclicOrder && this.data[j].cyclicOrder.lastStart) ? this.coreService.getDateByFormat(this.data[j].cyclicOrder.lastStart, null, 'YYYY-MM-DD HH:mm:ss') : '',
          repeat: this.data[j].period.repeat,
          class: this.coreService.getColor(this.data[j].state.severity, 'bg'),
          duration: dur > 60 ? (dur / (60 * 60)) : 1,
          progress: dur > 60 ? (dur / (60 * 60)) : 0.1,
          state: this.data[j].state,
          cyclicOrder: this.data[j].cyclicOrder,
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
export class FilterModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};

  allFilter: any
  new = false;
  edit = false;
  filter: any;

  name: string;

  constructor(private authService: AuthService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.allFilter = this.modalData.allFilter;
    this.new = this.modalData.new;
    this.edit = this.modalData.edit;
    this.filter = this.modalData.filter;

    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
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
      if (this.filter.to && !this.filter.to1) {
        this.filter.to1 = this.filter.to;
      }
      if (this.filter.from && !this.filter.from1) {
        this.filter.from1 = this.filter.from;
      }
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
  scheduleTree = [];
  workflowTree = [];
  checkOptions = [
    {status: 'PLANNED', text: 'planned'},
    {status: 'SUBMITTED', text: 'submitted'},
    {status: 'FINISHED', text: 'finished'}
  ];

  constructor(private authService: AuthService, public coreService: CoreService) {
  }

  ngOnInit(): void {
    if (!this.filter.scheduleFolders) {
      this.filter.scheduleFolders = [];
    }
    if (!this.filter.workflowFolders) {
      this.filter.workflowFolders = [];
    }
    if (this.filter.name) {
      this.existingName = this.coreService.clone(this.filter.name);
    }
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getFolderTree();
  }

  getFolderTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      forInventory: false,
      types: ['SCHEDULE']
    }).subscribe(res => {
      this.scheduleTree = this.coreService.prepareTree(res, false);
    });
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      forInventory: false,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.workflowTree = this.coreService.prepareTree(res, false);
    });
  }

  remove(path, flag = false): void {
    if (flag) {
      this.filter.workflowFolders.splice(this.filter.workflowFolders.indexOf(path), 1);
    } else {
      this.filter.scheduleFolders.splice(this.filter.scheduleFolders.indexOf(path), 1);
    }
  }

  checkFilterName(): void {
    this.isUnique = true;
    for (let i = 0; i < this.allFilter.length; i++) {
      if (this.filter.name === this.allFilter[i].name &&
        this.authService.currentUserData === this.allFilter[i].account && this.filter.name !== this.existingName) {
        this.isUnique = false;
      }
    }
  }

  onSubmit(result): void {
    this.submitted = true;
    const configObj = {
      controllerId: this.schedulerIds.selected,
      account: this.authService.currentUserData,
      configurationType: 'CUSTOMIZATION',
      objectType: 'DAILYPLAN',
      name: result.name,
      shared: result.shared,
      id: result.id || 0,
      configurationItem: {}
    };

    const obj: any = {};
    obj.workflowPaths = result.workflowPaths;
    obj.workflowFolders = result.workflowFolders;
    obj.schedules = result.schedules;
    obj.scheduleFolders = result.scheduleFolders;
    obj.state = result.state;
    obj.late = result.late;
    obj.name = result.name;
    obj.from = result.from1;
    obj.to = result.to1;
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
  selector: 'app-daily-plan',
  templateUrl: './daily-plan.component.html',
  styleUrls: ['./daily-plan.component.css']
})
export class DailyPlanComponent {
  objectType = 'DAILYPLAN';
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  plans: any = [];
  submissionHistoryItems: any = [];
  planOrders: any = [];
  isLoaded = false;
  isRefreshed = false;
  dailyPlanFilters: any = {filter: {}};
  pageView = '';
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
  isCalendarClick = false;
  selectedDate: Date;
  submissionHistory: any = [];
  reloadState = 'no';
  searchableProperties = ['orderId', 'schedulePath', 'workflowPath', 'status', 'plannedStartTime', 'expectedEndTime'];
  expandedPaths = new Set();
  dateRanges = [];
  isProcessing = false;
  isVisible = false;
  isAllSelected = false;
  totalOrders: number;
  totalFinishedOrders: number;

  selectedYear: any;
  selectedMonth: any;

  object = {
    mapOfCheckedId: new Map(),
    checked: false,
    indeterminate: false,
    isCancel: false,
    isModifyStartTime: false,
    isModify: false,
    isPlanned: false,
    isFinished: false
  };

  filterBtn: any = [
    {status: 'ALL', text: 'all'},
    {status: 'PLANNED', text: 'planned'},
    {status: 'SUBMITTED', text: 'submitted'},
    {status: 'FINISHED', text: 'finished'}
  ];

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private dataService: DataService, private groupByPipe: GroupByPipe, private toasterService: ToastrService,
              private modal: NzModalService, private translate: TranslateService, private searchPipe: SearchPipe,
              private orderPipe: OrderPipe, private excelService: ExcelService, private router: Router) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });

    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf();
    });
  }

  ngOnInit(): void {
    this.initConf();
    if (this.pageView === 'grid') {
      this.isToggle = true;
    }
  }

  ngOnDestroy(): void {
    this.dailyPlanFilters.selectedDate = this.selectedDate;
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    $('.scroll-y').remove();
  }

  loadOrderPlan(): void {
    this.reloadState = 'no';
    if (this.searchFilter && !isEmpty(this.searchFilter)) {
      this.search();
      return;
    }
    const obj: any = {
      controllerIds: [this.schedulerIds.selected]
    };
    if (this.selectedFiltered && this.selectedFiltered.name) {
      this.selectedDate = new Date();
      const dom = $('#full-calendar');
      if (dom && dom.data('calendar')) {
        dom.data('calendar').setSelectedDate(this.selectedDate);
      }
      this.applySearchFilter(obj, this.selectedFiltered);
      if (this.selectedFiltered.from && this.selectedFiltered.to) {
        this.getDatesByUrl([this.selectedFiltered.from, this.selectedFiltered.to], (dates) => {
          this.callApi(new Date(dates[0]), new Date(dates[1]), obj);
        });
      }
    } else {
      obj.dailyPlanDateFrom = this.coreService.getStringDate(this.selectedDate);
      obj.dailyPlanDateTo = this.coreService.getStringDate(this.selectedDate);
      if (this.selectedSubmissionId) {
        obj.submissionHistoryIds = [this.selectedSubmissionId];
      }
      if (this.dailyPlanFilters.filter.status && this.dailyPlanFilters.filter.status !== 'ALL') {
        obj.states = [this.dailyPlanFilters.filter.status];
      }
      if (this.dailyPlanFilters.filter.late) {
        obj.late = true;
      }
      obj.limit = this.preferences.maxDailyPlanRecords;
      this.coreService.post('daily_plan/orders', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
        next: (res: any) => {
          this.filterData(res.plannedOrderItems);
          this.isLoaded = true;
          this.isRefreshed = false;
        }, error: () => {
          this.isLoaded = true;
          this.isRefreshed = false;
          this.plans = [];
          this.planOrders = [];
          this.resetCheckBox();
        }
      });
    }
  }

  private getOrder(order, cb): void {
    let ids: any;
    if (order.value) {
      ids = order.value.map((val) => val.orderId);
    } else if (order.state && order.state._text === 'SUBMITTED') {
      ids = [order.orderId];
    } else {
      ids = order;
    }
    if (ids.length > 0) {
      this.coreService.post('orders', {
        controllerId: this.schedulerIds.selected,
        compact: true,
        orderIds: ids
      }).subscribe((res: any) => {
        cb(res.orders);
      });
    } else {
      cb();
    }
  }

  selectSubmissionHistory(id): void {
    this.selectedSubmissionId = id;
    this.isLoaded = false;
    this.loadOrderPlan();
  }

  getPlans(status): void {
    this.resetCheckBox();
    if (status === 'ALL') {
      this.dailyPlanFilters.filter.late = false;
    }
    if (status) {
      this.dailyPlanFilters.filter.status = status;
    }
    this.isLoaded = false;
    this.loadOrderPlan();
  }

  changeLate(): void {
    this.dailyPlanFilters.filter.late = !this.dailyPlanFilters.filter.late;
    if (this.dailyPlanFilters.filter.late) {
      if (this.dailyPlanFilters.filter.status === 'ALL') {
        this.dailyPlanFilters.filter.status = '';
      }
    }
    this.isLoaded = false;
    this.loadOrderPlan();
  }

  expandCollapseDetails(flag): void {
    this.isToggle = flag;
    if (this.pageView !== 'grid') {
      if (!this.dailyPlanFilters.filter.groupBy) {
        this.planOrders.forEach((order) => {
          if (!order.show && flag) {
            this.addDetailsOfOrder(order);
          } else {
            order.show = flag;
          }
        });
      } else {
        this.planOrders.forEach((order) => {
          order.show = flag;
          order.order = flag;
        });
      }
    }
  }

  groupByWorkflow(type): void {
    if (this.dailyPlanFilters.filter.groupBy !== type) {
      this.dailyPlanFilters.filter.groupBy = type;
      this.searchInResult();
    }
  }

  selectDateRange(flag): void {
    this.isCalendarClick = flag;
    $('#full-calendar').data('calendar').setRange(this.isCalendarClick);
    this.dateRanges = [];
  }

  createPlan(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreatePlanModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        selectedDate: this.selectedDate,
        preferences: this.preferences,
        dateRanges: this.dateRanges
      },
      nzFooter: null,
      nzAutofocus: undefined,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetAction(5000);
        this.isCalendarClick = false;
        $('#full-calendar').data('calendar').clearRange();
      }
    });
  }

  /*--------------- Begin Navigate -------------------*/

  navToHistory(): void {
    let filter = this.coreService.getHistoryTab();
    filter.type = 'SUBMISSION';
    filter.submission.selectedView = false;
    filter.task.filter.date = 'today';
    this.router.navigate(['/history']).then();
  }

  navToOrderHistory(data): void {
    this.router.navigate(['/history/order'], {
      queryParams: {
        orderId: data.orderId,
        workflow: data.workflowPath,
        controllerId: JSON.parse(this.authService.scheduleIds).selected
      }
    }).then();
  }

  /* --------------- Navigate End-------------------*/


  /* ------------- Action Begin------------------- */

  change(value: boolean): void {
    this.isVisible = value;
  }

  deleteSubmission(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RemovePlanModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        timeZone: this.preferences.zone,
        selectedDate: this.selectedDate,
        submissionsDelete: true,
        dateRange: this.dateRanges
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetAction(5000);
        this.isCalendarClick = false;
        $('#full-calendar').data('calendar').clearRange();
      }
    });
  }

  modifyOrderStartTime(): void {
    const self = this;
    const orderIds = [];
    this.object.mapOfCheckedId.forEach((value) => {
      orderIds.push(value.orderId);
    });
    this.getOrder(orderIds, (orders) => {
      let state;
      if (orders && orders.length > 0) {
        for (let i in orders) {
          if (orders[i].state._text !== 'SCHEDULED' && orders[i].state._text !== 'PENDING' && orders[i].state._text !== 'BLOCKED') {
            state = orders[i].state._text;
            break;
          }
        }
      }
      if (!state) {
        openModal();
      } else {
        this.showInfoMsg(state);
      }
    });

    function openModal() {
      self.modal.create({
        nzTitle: undefined,
        nzContent: ModifyStartTimeModalComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerId: self.schedulerIds.selected,
          orders: self.object.mapOfCheckedId,
          isDailyPlan: true,
          preferences: self.preferences
        },
        nzFooter: null,
        nzAutofocus: undefined,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          self.resetCheckBox();
          self.isProcessing = true;
          self.resetAction(5000);
        }
      });
    }
  }

  modifySelectedOrder(): void {
    const self = this;
    let order = this.object.mapOfCheckedId.values().next().value;
    const orderIds = [];
    this.object.mapOfCheckedId.forEach((value) => {
      orderIds.push(value.orderId);
    });
    this.getOrder(orderIds, (orders) => {
      let state;
      if (orders && orders.length > 0) {
        for (let i in orders) {
          if (orders[i].state._text !== 'SCHEDULED' && orders[i].state._text !== 'PENDING' && orders[i].state._text !== 'BLOCKED') {
            state = orders[i].state._text;
            break;
          }
        }
      }
      if (!state) {

          this.coreService.post('workflow', {
            controllerId: this.schedulerIds.selected,
            workflowId: {path: order.workflowPath}
          }).subscribe((res: any) => {
            order.requirements = res.workflow.orderPreparation;
            openModal(order.requirements, res.workflow);
          });

      } else {
        this.showInfoMsg(state);
      }
    });

    function openModal(requirements, workflow?) {
      self.modal.create({
        nzTitle: undefined,
        nzContent: ChangeParameterModalComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerId: self.schedulerIds.selected,
          orders: self.object.mapOfCheckedId,
          orderPreparation: requirements,
          workflow
        },
        nzFooter: null,
        nzAutofocus: undefined,
        nzClosable: false,
        nzMaskClosable: false
      });

    }
  }

  submitSelectedOrder(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RemovePlanModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        orders: this.object.mapOfCheckedId,
        selectedDate: this.selectedDate,
        isSubmit: true
      },
      nzFooter: null,
      nzAutofocus: undefined,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.resetCheckBox();
        this.isProcessing = true;
        this.resetAction(5000);
      }
    });
  }

  submitOrder(order, workflow): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RemovePlanModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        selectedDate: this.selectedDate,
        order,
        workflow,
        isSubmit: true
      },
      nzFooter: null,
      nzAutofocus: undefined,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetAction(5000);
      }
    });
  }

  cancelSelectedOrder(): void {
    if (this.dateRanges && this.dateRanges.length > 0) {
      if (this.preferences.auditLog) {
        const comments = {
          radio: 'predefined',
          type: 'Order',
          operation: 'Cancel',
          name: ''
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzData: {
            comments,
          },
          nzFooter: null,
          nzAutofocus: undefined,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            this.cancelByDateRange(result);
          }
        });
      } else {
        this.cancelByDateRange({});
      }
    } else {
      const orderIds = [];
      this.object.mapOfCheckedId.forEach((value) => {
        orderIds.push(value.orderId);
      });
      this.cancelCyclicOrder(orderIds, true);
    }
  }

  private cancelByDateRange(auditLog): void {
    this.isProcessing = true;
    let obj = {
      controllerId: this.schedulerIds.selected,
      dailyPlanDateFrom: this.coreService.getStringDate(this.dateRanges[0]),
      dailyPlanDateTo: this.coreService.getStringDate(this.dateRanges[1]),
      auditLog
    };
    this.coreService.post('daily_plan/orders/cancel', obj).subscribe({
      next: () => {
        this.resetAction(5000);
      }, error: () => this.resetAction()
    });
    this.resetCheckBox();
  }

  cancelOrder(order, plan): void {
    if (plan && plan.value) {
      this.cancelCyclicOrder(plan.value, false);
    } else {
      this.cancelCyclicOrder(order, false);
    }
  }

  cancelCyclicOrder(orders, isMultiple): void {
    let orderIds = isMultiple ? orders : orders.orderId ? [orders.orderId] : orders.map((order) => order.orderId);
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      orderIds,
      dailyPlanDateFrom: this.coreService.getStringDate(this.selectedDate),
      dailyPlanDateTo: this.coreService.getStringDate(this.selectedDate)
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Order',
        operation: 'Cancel',
        name: ''
      };
      orderIds.forEach((id, index) => {
        if (index === orderIds.length - 1) {
          comments.name = comments.name + ' ' + id;
        } else {
          comments.name = id + ', ' + comments.name;
        }
      });
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj,
          url: 'daily_plan/orders/cancel'
        },
        nzFooter: null,
        nzAutofocus: undefined,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isProcessing = true;
          this.resetAction(5000);
          if (isMultiple) {
            this.resetCheckBox();
          }
        }
      });
    } else {
      this.isProcessing = true;
      this.coreService.post('daily_plan/orders/cancel', obj).subscribe({
        next: () => {
          this.resetAction(5000);
          if (isMultiple) {
            this.resetCheckBox();
          }
        }, error: () => this.resetAction()
      });
    }
  }

  removeSelectedOrder(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RemovePlanModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        orders: this.object.mapOfCheckedId,
        timeZone: this.preferences.zone,
        selectedDate: this.selectedDate,
        dateRange: this.dateRanges
      },
      nzFooter: null,
      nzAutofocus: undefined,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetCheckBox();
        this.resetAction(5000);
      }
    });
  }

  removeOrder(order, workflow): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RemovePlanModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        order,
        workflow,
        timeZone: this.preferences.zone,
        selectedDate: this.selectedDate
      },
      nzFooter: null,
      nzAutofocus: undefined,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetAction(5000);
      }
    });
  }

  addDetailsOfOrder(plan): void {
    plan.show = plan.show === undefined || plan.show === false;
    if (plan.show) {
      this.coreService.post('daily_plan/order/variables', {
        orderId: plan.orderId,
        controllerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        this.convertObjectToArray(res.variables, plan);
      });
    }
  }

  expandCollapseOrder(plan): void {
    plan.order = plan.order === undefined || plan.order === false;
    if (plan.order) {
      this.expandedPaths.add(plan.key);
    } else {
      this.expandedPaths.delete(plan.key);
    }
  }

  exportToExcel(): void {
    let workflow = '', workflowAndOrder = '', schedule = '', scheduleAndOrder = '', order = '', state = '', late = '',
      plannedStart = '',
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

  /* ---- End Action ------ */

  getDatesByUrl(arr, cb): void {
    this.coreService.post('utilities/convert_relative_dates', {relativDates: arr}).subscribe({
      next: (res: any) => {
        cb(res.absoluteDates);
      }, error: () => {
        cb([]);
      }
    });
  }

  /* ------------- Advance search Begin------------------- */
  advancedSearch(): void {
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

  applySearchFilter(obj, filter): void {
    if (filter.workflowPaths) {
      obj.workflowPaths = filter.workflowPaths;
    }
    if (filter.workflowFolders && filter.workflowFolders.length > 0) {
      obj.workflowFolders = [];
      for (const i in filter.workflowFolders) {
        obj.workflowFolders.push({
          folder: filter.workflowFolders[i],
          recursive: true
        });
      }
    }
    if (filter.schedules && filter.schedules.length > 0) {
      obj.schedulePaths = filter.schedules;
    }
    if (filter.scheduleFolders && filter.scheduleFolders.length > 0) {
      obj.scheduleFolders = [];
      for (const i in filter.scheduleFolders) {
        obj.scheduleFolders.push({
          folder: filter.scheduleFolders[i],
          recursive: true
        });
      }
    }
    if (filter.late) {
      obj.late = true;
    }
    if (filter.state && filter.state !== 'ALL') {
      obj.states = [filter.state];
    }
    return obj;
  }

  search(): void {
    this.isSearchHit = true;
    const obj: any = {
      controllerIds: [this.schedulerIds.selected],
      limit: this.preferences.maxDailyPlanRecords
    };
    if (this.dailyPlanFilters.filter.status) {
      this.dailyPlanFilters.filter.status = '';
    }
    this.applySearchFilter(obj, this.searchFilter);
    this.resetCheckBox();
    if (this.searchFilter.radio === 'current') {
      this.callApi(this.searchFilter.from, this.searchFilter.to, obj);
    } else {
      this.getDatesByUrl([this.searchFilter.from1, this.searchFilter.to1], (dates) => {
        this.callApi(new Date(dates[0]), new Date(dates[1]), obj);
      });
    }
  }

  selectAll(): void {
    this.isAllSelected = true;
    if (this.dailyPlanFilters.filter.groupBy) {
      for (let i = 0; i < this.planOrders.length; i++) {
        if (!this.planOrders[i].isFinished) {
          this.planOrders[i].value.forEach(item => {
            if (item.state._text !== 'FINISHED') {
              this.object.mapOfCheckedId.set(item.orderId, item);
            }
          });
        }
      }
    } else {
      this.planOrders.forEach(item => {
        if (item.state._text !== 'FINISHED') {
          this.object.mapOfCheckedId.set(item.orderId, item);
        }
      });
    }
    this.checkState(this.object, this.object.mapOfCheckedId);
  }

  checkAll(): void {
    this.isAllSelected = false;
    let flag = false;
    if (this.planOrders.length > 0) {
      this.object.mapOfCheckedId.clear();
      const entryPerPage = this.dailyPlanFilters.entryPerPage || this.preferences.entryPerPage;
      const orders = this.planOrders.slice((entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (entryPerPage * this.dailyPlanFilters.currentPage));
      if (this.dailyPlanFilters.filter.groupBy) {
        if (this.object.checked) {
          for (let i = 0; i < orders.length; i++) {
            if (!orders[i].isFinished) {
              let count = 0;
              orders[i].value.forEach(item => {
                if (item.state._text !== 'FINISHED') {
                  this.object.mapOfCheckedId.set(item.orderId, item);
                  ++count;
                }
              });
              orders[i].checked = count === orders[i].value.length;
              orders[i].indeterminate = count > 0 && !orders[i].checked;
            } else {
              flag = true;
            }
          }
        } else {
          for (let i = 0; i < orders.length; i++) {
            orders[i].checked = false;
            orders[i].indeterminate = false;
          }
          this.object.mapOfCheckedId.clear();
        }
      } else {
        if (this.object.checked) {
          orders.forEach(item => {
            if (item.state._text !== 'FINISHED') {
              this.object.mapOfCheckedId.set(item.orderId, item);
            }
          });
        } else {
          this.object.mapOfCheckedId.clear();
        }
      }
    } else {
      this.object.checked = false;
    }
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    this.checkState(this.object, this.object.mapOfCheckedId);
  }

  checkOrderTemplate(template): void {
    const isChecked = template.checked;
    if (this.isAllSelected) {
      this.checkSelected();
      template.checked = isChecked;
      if (!isChecked) {
        this.object.checked = false;
      }
    }
    this.isAllSelected = false;
    template.indeterminate = false;
    if (isChecked) {
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

  private checkSelected(): void {
    const entryPerPage = this.dailyPlanFilters.entryPerPage || this.preferences.entryPerPage;
    const orders = this.planOrders.slice((entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (entryPerPage * this.dailyPlanFilters.currentPage));
    this.object.mapOfCheckedId.clear();
    if (this.dailyPlanFilters.filter.groupBy) {
      for (let i = 0; i < orders.length; i++) {
        if (!orders[i].isFinished) {
          let count = 0;
          orders[i].value.forEach(item => {
            if (item.state._text !== 'FINISHED') {
              this.object.mapOfCheckedId.set(item.orderId, item);
              ++count;
            }
          });
          orders[i].checked = count === orders[i].value.length;
          orders[i].indeterminate = count > 0 && !orders[i].checked;
        }
      }
    } else {
      orders.forEach(item => {
        if (item.state._text !== 'FINISHED') {
          this.object.mapOfCheckedId.set(item.orderId, item);
        }
      });
    }
  }

  onItemChecked(order: any, plan: any, checked: boolean): void {
    if (this.isAllSelected) {
      this.checkSelected();
      if (!checked) {
        this.object.checked = false;
      }
    }
    this.isAllSelected = false;
    if (checked) {
      this.object.mapOfCheckedId.set(order.orderId, order);
    } else {
      this.object.mapOfCheckedId.delete(order.orderId);
    }
    this.checkPlan(plan);
  }

  sortBy(): void {
    this.plans = this.orderPipe.transform(this.plans, this.dailyPlanFilters.filter.sortBy, this.dailyPlanFilters.reverse);
    this.searchInResult();
  }

  searchInResult(): void {
    this.updateTable(this.dailyPlanFilters.searchText ? this.searchPipe.transform(this.plans, this.dailyPlanFilters.searchText, this.searchableProperties) : this.plans);
  }

  cancel(): void {
    this.showSearchPanel = false;
    this.searchFilter = {};
    if (this.isSearchHit) {
      this.isSearchHit = false;
      this.isLoaded = false;
      this.loadOrderPlan();
    }
    if (!this.dailyPlanFilters.filter.status) {
      this.dailyPlanFilters.filter.status = 'ALL';
    }
  }

  modifyOrder(order, plan): void {
    this.getOrder(order || plan, (orders) => {
      let state;
      if (orders && orders.length > 0) {
        for (let i in orders) {
          if (orders[i].state._text !== 'SCHEDULED' && orders[i].state._text !== 'PENDING' && orders[i].state._text !== 'BLOCKED') {
            state = orders[i].state._text;
            break;
          }
        }
      }
      if (!state) {
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: ModifyStartTimeModalComponent,
          nzClassName: 'lg',
          nzData: {
            schedulerId: this.schedulerIds.selected,
            order,
            plan,
            isDailyPlan: true,
            preferences: this.preferences
          },
          nzFooter: null,
          nzAutofocus: undefined,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            this.isLoaded = false;
            this.loadOrderPlan();
          }
        });
      } else if (state) {
        this.showInfoMsg(state);
      }
    });
  }

  changeParameter(plan, order): void {
    this.getOrder(plan || order, (orders) => {
      let state;
      if (orders && orders.length > 0) {
        for (let i in orders) {
          if (orders[i].state._text !== 'SCHEDULED' && orders[i].state._text !== 'PENDING' && orders[i].state._text !== 'BLOCKED') {
            state = orders[i].state._text;
            break;
          }
        }
      }
      if (!state) {
        if (order) {
          this.coreService.post('daily_plan/order/variables', {
            orderId: order.orderId,
            controllerId: this.schedulerIds.selected
          }).subscribe((res: any) => {
            this.convertObjectToArray(res.variables, order);
            this.openModel(plan, order);
          });
        } else {
          this.openModel(plan, order);
        }
      } else {
        this.showInfoMsg(state);
      }
    });
  }

  private showInfoMsg(state): void {
    this.translate.get(state).subscribe(stateTranslated => {
      this.translate.get('order.message.orderModificationNotAllowed', {state: stateTranslated}).subscribe(translatedValue => {
        this.toasterService.info(translatedValue);
      });
    });
  }

  receiveMessage($event): void {
    if ($event === 'grid') {
      this.isToggle = true;
    }
    this.pageView = $event;
    this.resetCheckBox();
  }

  sort(key): void {
    this.dailyPlanFilters.reverse = !this.dailyPlanFilters.reverse;
    this.dailyPlanFilters.filter.sortBy = key;
    this.sortBy();
    this.resetCheckBox();
  }

  pageIndexChange($event: number): void {
    this.dailyPlanFilters.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.planOrders.length) {
      this.resetCheckBox();
    }
  }

  pageSizeChange($event: number): void {
    this.dailyPlanFilters.entryPerPage = $event;
    if (this.object.mapOfCheckedId.size !== this.planOrders.length) {
      if (this.object.checked) {
        this.checkAll();
      }
    }
  }

  private load(date): void {
    if (!date) {
      this.isLoaded = false;
    }
    let d;
    if (date) {
      d = date;
    } else if (this.selectedYear && this.selectedMonth) {
      d = new Date(this.selectedYear, this.selectedMonth, 1);
    } else {
      d = new Date();
    }
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 0);
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      timeZone: this.preferences.zone,
      filter: {
        dateFrom: this.coreService.getStringDate(firstDay),
        dateTo: this.coreService.getStringDate(lastDay)
      }
    };
    this.coreService.post('daily_plan/submissions', obj).subscribe({
      next: (result: any) => {
        this.submissionHistoryItems = [];
        this.submissionHistory = [];
        this.isLoaded = true;
        if (result.submissionHistoryItems.length > 0) {
          for (let i = 0; i < result.submissionHistoryItems.length; i++) {
            result.submissionHistoryItems[i].startDate = this.convertStringToDate(result.submissionHistoryItems[i].dailyPlanDate);
            result.submissionHistoryItems[i].endDate = result.submissionHistoryItems[i].startDate;
            this.submissionHistoryItems.push(result.submissionHistoryItems[i]);
            if (this.selectedDate && this.selectedDate.getTime() === result.submissionHistoryItems[i].startDate) {
              this.submissionHistory.push(result.submissionHistoryItems[i]);
            }
          }
        }
        const calendar = $('#full-calendar').data('calendar');
        if (calendar) {
          calendar.setDataSource(this.submissionHistoryItems);
        }
      }, error: () => {
        this.isLoaded = false;
      }
    });
  }

  private convertStringToDate(date): any {
    if (typeof date === 'string') {
      return this.coreService.getDate(date);
    } else {
      return date;
    }
  }

  private resetAction(time = 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }

  private callApi(from, to, obj): void {
    obj.dailyPlanDateFrom = this.coreService.getStringDate(from);
    obj.dailyPlanDateTo = this.coreService.getStringDate(to);
    this.coreService.post('daily_plan/orders', this.coreService.clone(obj)).subscribe({
      next: (result: any) => {
        this.filterData(result.plannedOrderItems);
        this.isLoaded = true;
      }, error: () => {
        this.resetCheckBox();
        this.isLoaded = true;
      }
    });
  }

  private updateTable(filterData): void {
    if (this.dailyPlanFilters.filter.groupBy) {
      let tempArr = [];
      if (this.planOrders && this.planOrders.length > 0) {
        tempArr = this.coreService.clone(this.planOrders);
      }
      this.planOrders = this.groupByPipe.transform(filterData, this.dailyPlanFilters.filter.groupBy === 'WORKFLOW' ? 'workflowPath' : 'schedulePath');
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
    this.totalOrders = 0;
    this.totalFinishedOrders = 0;
    if (this.planOrders && this.planOrders.length > 0) {
      for (let i = 0; i < this.planOrders.length; i++) {
        if (this.dailyPlanFilters.filter.groupBy !== '') {
          let lastDate = null;
          for (let j = 0; j < this.planOrders[i].value.length; j++) {
            ++this.totalOrders;
            if (this.planOrders[i].value[j].state._text === 'FINISHED') {
              ++this.totalFinishedOrders;
            }
            this.planOrders[i].value[j].seperate = false;
            if (lastDate) {
              let d = new Date(this.planOrders[i].value[j].plannedDate).setHours(0, 0, 0, 0);
              if (d !== lastDate) {
                this.planOrders[i].value[j - 1].seperate = true;
              }
            }
            lastDate = new Date(this.planOrders[i].value[j].plannedDate).setHours(0, 0, 0, 0);
          }
        } else {
          ++this.totalOrders;
          if (this.planOrders[i].state._text === 'FINISHED') {
            ++this.totalFinishedOrders;
          }
        }
      }
    }
    if (this.planOrders) {
      this.planOrders = [...this.planOrders];
    }
  }

  private setStateToParentObject(): void {
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

  private checkState(object, list): void {
    object.isPlanned = true;
    object.isFinished = false;
    object.isCancel = false;
    object.isModify = true;
    object.isModifyStartTime = true;
    let finishedCount = 0;
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
      if (order.state._text === 'PLANNED') {
        object.isCancel = true;
      }
      if (order.state._text === 'FINISHED') {
        ++finishedCount;
        object.isModify = false;
        object.isModifyStartTime = false;
      }

      if (!workflow) {
        workflow = order.workflowPath;
      } else if (workflow !== order.workflowPath) {
        object.isModify = false;
      }
    });
    if (finishedCount === list.length || finishedCount === list.size) {
      object.isFinished = true;
    }
  }

  private checkPlan(plan): void {
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

  private updateMainCheckbox(): void {
    const entryPerPage = this.dailyPlanFilters.entryPerPage || this.preferences.entryPerPage;
    let data = this.planOrders.slice((entryPerPage * (this.dailyPlanFilters.currentPage - 1)), (entryPerPage * this.dailyPlanFilters.currentPage));
    if (this.dailyPlanFilters.filter.groupBy) {
      this.object.checked = data.every(item => item.checked);
    } else {
      this.object.checked = data.every(item => this.object.mapOfCheckedId.has(item.orderId));
    }
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    this.checkState(this.object, this.object.mapOfCheckedId);
    if (this.dateRanges.length > 0) {
      $('#full-calendar').data('calendar').clearRange();
    }
  }

  private convertObjectToArray(res, order): void {
    if (isEmpty(res)) {
      order.variables = [];
    } else {
      order.variables = Object.entries(res).map(([k, v]) => {
        if (v && isArray(v)) {
          v.forEach((list, index) => {
            v[index] = Object.entries(list).map(([k1, v1]) => {
              return {name: k1, value: v1};
            });
          });
        }
        return {name: k, value: v};
      });
    }
  }

  private openModel(plan, order): void {
    if (order) {
      this.coreService.post('workflow', {
        controllerId: this.schedulerIds.selected,
        workflowId: {path: order.workflowPath}
      }).subscribe((res: any) => {
        order.requirements = res.workflow.orderPreparation;
        this._openModel(plan, order, order.requirements, res.workflow);
      });
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
        this.coreService.post('workflow', {
          controllerId: this.schedulerIds.selected,
          workflowId: {path: workflowPath}
        }).subscribe((res: any) => {
          this._openModel(plan, order, res.workflow.orderPreparation, res.workflow);
        });
      } else {
        this._openModel(plan, order, []);
      }
    }
  }

  private _openModel(plan, order, orderPreparation, workflow?): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ChangeParameterModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        order,
        plan,
        orderPreparation,
        workflow
      },
      nzFooter: null,
      nzAutofocus: undefined,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        if (order && order.show) {
          this.coreService.post('daily_plan/order/variables', {
            orderId: order.orderId,
            controllerId: this.schedulerIds.selected
          }).subscribe((res: any) => {
            if (!res.variables) {
              res.variables = result;
            }
            this.convertObjectToArray(res.variables, order);
          });
        } else {
          this.loadOrderPlan();
        }
      }
    });
  }

  resetCheckBox(flag = false): void {
    if (this.object.mapOfCheckedId.size > 0) {
      this.planOrders.forEach((item) => {
        item.checked = false;
        item.indeterminate = false;
      });
    }
    this.object = {
      mapOfCheckedId: new Map(),
      indeterminate: false,
      checked: false,
      isCancel: false,
      isModify: false,
      isModifyStartTime: false,
      isPlanned: false,
      isFinished: false
    };
    if (!flag) {
      this.isCalendarClick = false;
      if (this.dateRanges.length > 0) {
        $('#full-calendar').data('calendar').clearRange();
      }
    }
  }

  private initConf(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
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
    this.selectedYear = this.selectedDate.getFullYear();
    this.selectedMonth = this.selectedDate.getMonth();

    if (this.dailyPlanFilters.selectedView) {
      this.savedFilter.selected = this.savedFilter.selected || this.savedFilter.favorite;
    } else {
      this.savedFilter.selected = undefined;
    }
    if (!this.dailyPlanFilters.filter.status) {
      this.dailyPlanFilters.filter.status = 'ALL';
    }
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).dailyPlan;
    }
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    if (this.schedulerIds.selected && this.permission.joc && this.permission.joc.administration.customization.view) {
      this.checkSharedFilters();
    } else {
      this.isLoaded = false;
      this.loadOrderPlan();
    }
    $('#full-calendar').calendar({
      view: 'month',
      rangeSelection: true,
      language: this.coreService.getLocale(),
      selectedDate: this.selectedDate,
      clickDay: (e) => {
        this.selectedDate = e.date;
        this.isPastDate = this.selectedDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        this.submissionHistory = e.events;
        this.selectedSubmissionId = null;
        this.showSearchPanel = false;
        this.isCalendarClick = false;
        this.searchFilter = {};
        this.isSearchHit = false;

        if (this.selectedFiltered && this.selectedFiltered.name) {
          this.changeFilter(null);
        } else {
          this.isLoaded = false;
          this.loadOrderPlan();
        }
      },
      renderEnd: (e) => {
        const year = e.currentYear || new Date().getFullYear();
        const month = (e.currentMonth || e.currentMonth === 0) ? e.currentMonth : new Date().getMonth();
        this.selectedYear = year;
        this.selectedMonth = month;
        this.load(new Date(year, month, 1));
        if (this.dateRanges && this.dateRanges.length > 1) {
          $('#full-calendar').data('calendar').checkRange({from: this.dateRanges[0], to: this.dateRanges[1]});
        }
      },
      rangeEnd: (e) => {
        this.dateRanges = e.dateRanges;
        this.isCalendarClick = false;
        if (this.dateRanges && this.dateRanges.length > 0) {
          this.resetCheckBox(true);
          this.isPastDate = new Date(this.dateRanges[0]).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        } else {
          this.isPastDate = this.selectedDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        }
      }
    });
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/DailyPlanUpdated/)) {
          if (args.eventSnapshots[j].message) {
            const d = new Date(args.eventSnapshots[j].message);
            if (d.getFullYear() == this.selectedYear && d.getMonth() == this.selectedMonth) {
              this.load(null);
            }
          }
          if (!args.eventSnapshots[j].message || (args.eventSnapshots[j].message === this.coreService.getStringDate(this.selectedDate))) {
            this.refreshView();
          }
          break;
        }
      }
    }
  }

  private refreshView(): void {
    if (!this.isVisible && this.object.mapOfCheckedId.size === 0) {
      this.resetAction();
      this.loadOrderPlan();
    } else {
      setTimeout(() => {
        this.refreshView();
      }, 750);
    }
  }

  private isCustomizationSelected(flag): void {
    if (flag) {
      this.temp_filter.status = clone(this.dailyPlanFilters.filter.status);
      this.dailyPlanFilters.filter.status = '';
    } else {
      if (this.temp_filter.status) {
        this.dailyPlanFilters.filter.status = clone(this.temp_filter.status);
      } else {
        this.dailyPlanFilters.filter.status = 'ALL';
      }
    }
  }

  private filterResponse(res): void {
    if (res.configurations && res.configurations.length > 0) {
      this.filterList = res.configurations;
    }
    this.getCustomizations();
  }

  private checkSharedFilters(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      configurationType: 'CUSTOMIZATION',
      objectType: this.objectType,
      shared: true
    };
    this.coreService.post('configurations', obj).subscribe({
      next: (res) => {
        this.filterResponse(res);
      }, error: () => this.getCustomizations()
    });
  }

  private filterCustomizationResponse(res): void {
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
      this.filterList.forEach((value) => {
        if (value.id === this.savedFilter.selected) {
          flag = false;
          this.coreService.post('configuration', {
            controllerId: value.controllerId,
            id: value.id
          }).subscribe((conf: any) => {
            this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
            this.selectedFiltered.account = value.account;
            this.loadOrderPlan();
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

  private getCustomizations(): void {
    if (this.schedulerIds.selected) {
      const obj = {
        controllerId: this.schedulerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'CUSTOMIZATION',
        objectType: this.objectType
      };
      this.coreService.post('configurations', obj).subscribe({
        next: (res) => {
          this.filterCustomizationResponse(res);
        }, error: () => {
          this.savedFilter.selected = undefined;
          this.loadOrderPlan();
        }
      });
    }
  }

  private filterData(planItems): void {
    if (!planItems || planItems.length === 0) {
      this.dailyPlanFilters.currentPage = 1;
    }
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
      this.updateTable(this.dailyPlanFilters.searchText ? this.searchPipe.transform(this.plans, this.dailyPlanFilters.searchText, this.searchableProperties) : this.plans);
    } else {
      this.plans = [];
      this.planOrders = [];
      this.resetCheckBox();
    }
    if (this.object.mapOfCheckedId.size > 0) {
      const tempObject = new Map();
      this.plans.forEach((order) => {
        if (this.object.mapOfCheckedId.has(order.orderId)) {
          tempObject.set(order.orderId, order);
        }
      });
      this.object.mapOfCheckedId = tempObject;
      this.object.mapOfCheckedId.size > 0 ? this.updateMainCheckbox() : this.resetCheckBox();
    } else {
      this.resetCheckBox();
    }
  }

  /* ---- Begin Customization ------ */

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
        nzAutofocus: undefined,
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
      nzClosable: false,
      nzAutofocus: undefined,
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
        self.dailyPlanFilters.selectedView = false;
        self.selectedFiltered = {};
        self.loadOrderPlan();
      } else {
        if (self.filterList.length === 0) {
          self.isCustomizationSelected(false);
          self.savedFilter.selected = undefined;
          self.dailyPlanFilters.selectedView = false;
          self.selectedFiltered = {};
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

  changeFilter(filter): void {
    if (filter) {
      this.savedFilter.selected = filter.id;
      this.dailyPlanFilters.selectedView = true;
      this.coreService.post('configuration', {
        controllerId: filter.controllerId,
        id: filter.id
      }).subscribe((conf: any) => {
        this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
        this.selectedFiltered.account = filter.account;
        this.isLoaded = false;
        this.loadOrderPlan();
      });
    } else {
      this.isCustomizationSelected(false);
      this.savedFilter.selected = filter;
      this.dailyPlanFilters.selectedView = false;
      this.selectedFiltered = {};
      this.isLoaded = false;
      this.loadOrderPlan();
    }

    this.saveService.setDailyPlan(this.savedFilter);
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
          nzAutofocus: undefined,
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
  }

  /* ---- End Customization ------ */

  reload(): void {
    if (this.reloadState === 'no') {
      this.planOrders = [];
      this.plans = [];
      this.reloadState = 'yes';
      this.isLoaded = true;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.isLoaded = false;
      this.loadOrderPlan();
    }
  }
}
