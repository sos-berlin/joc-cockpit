import {
  Component,
  Directive,
  EventEmitter, forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isArray} from 'underscore';
import {takeUntil} from 'rxjs/operators';
import {SaveService} from '../../services/save.service';
import {SearchPipe, OrderPipe} from '../../pipes/core.pipe';
import {ExcelService} from '../../services/excel.service';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../components/guard';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {
  ChangeParameterModalComponent,
  ModifyStartTimeModalComponent
} from '../../components/modify-modal/modify.component';
import {ResumeOrderModalComponent} from '../../components/resume-modal/resume.component';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {AbstractControl, NG_VALIDATORS, Validator} from "@angular/forms";

declare const $;

@Directive({
  selector: '[appValidateRelativeDate]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => RelativeDateValidator), multi: true}
  ]
})
export class RelativeDateValidator implements Validator {
  @Input('appValidateRelativeDate') appValidateRelativeDate: string;

  constructor(private coreService: CoreService) {
  }

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      let momentObj = this.coreService.getDate(v, this.appValidateRelativeDate);
      if (/^([+-]?0|([+-]?[0-9]+[smhdwMy])+|\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}([,.]\\d{1,3})?)(Z|[+-]\\d{2}(:?\\d{2})?)?$/.test(v)
        || (momentObj._isValid && momentObj._pf.unusedInput.length == 0 && momentObj._pf.unusedTokens < 2)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidDuration: true
    };
  }
}


@Component({
  selector: 'app-pie-chart',
  templateUrl: './chart-template.component.html',
})
export class OrderPieChartComponent {
  @Input() schedulerId: any;
  @Input() state: any;
  @Input() date: any;
  @Input() timeZone: any;
  @Output() setState: EventEmitter<any> = new EventEmitter();
  ordersData: any = [];
  loading = true;
  snapshot: any = {};
  view: any[] = [240, 240];
  // options
  gradient = true;
  isDoughnut = false;
  colorScheme = {
    domain: []
  };
  setObj = new Map();

  subscription: Subscription;

  constructor(public coreService: CoreService, private dataService: DataService, private translate: TranslateService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.loading) {
      if (changes['schedulerId'] || changes['date'] || changes['state']) {
        this.init();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged') {
          this.init();
          break;
        }
      }
    }
  }

  setFilter(state): void {
    this.state = state;
    this.setState.emit(this.state);
  }

  onSelect(data): void {
    this.setFilter(this.setObj.get(data.name).toUpperCase());
  }

  private init(): void {
    const obj: any = {controllerId: this.schedulerId};
    if (this.date !== 'ALL') {
      obj.dateTo = this.date;
      if (this.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.timeZone;
    }
    this.coreService.post('orders/overview/snapshot', obj).subscribe({
      next: (res: any) => {
        this.snapshot = res.orders;
        this.loading = false;
        this.preparePieData(this.snapshot);
      }, error: () => this.loading = false
    });
  }

  private preparePieData(res): void {
    const ordersData = [];
    this.colorScheme.domain = [];
    this.setObj = new Map();
    for (let prop in res) {
      if (res[prop] > 0) {
        let obj: any = {};
        obj.name = prop;
        try {
          const txt = prop === 'terminated' ? 'completed' : prop;
          this.translate.get(txt.toUpperCase()).subscribe(translatedValue => {
            obj.name = translatedValue;
          });
        } catch (e) {
        }
        this.setObj.set(obj.name, prop);
        obj.value = res[prop];
        ordersData.push(obj);
        if (prop === 'pending') {
          this.colorScheme.domain.push('#fdee00');
        } else if (prop === 'scheduled') {
          this.colorScheme.domain.push('#efcc00');
        } else if (prop === 'prompting') {
          this.colorScheme.domain.push('#90EE90');
        } else if (prop === 'inProgress') {
          this.colorScheme.domain.push('#a3c6ea');
        } else if (prop === 'running') {
          this.colorScheme.domain.push('#7ab97a');
        } else if (prop === 'suspended') {
          this.colorScheme.domain.push('#FF8d1a');
        } else if (prop === 'waiting') {
          this.colorScheme.domain.push('#cccc00');
        } else if (prop === 'blocked') {
          this.colorScheme.domain.push('#b966b9');
        } else if (prop === 'failed') {
          this.colorScheme.domain.push('#ed365b');
        } else if (prop === 'terminated') {
          this.colorScheme.domain.push('#1591d4');
        }
      }
    }
    this.ordersData = ordersData;
  }
}

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html',
  styleUrls: ['./order-overview.component.css']
})
export class OrderOverviewComponent {
  loading: boolean;
  isLoaded: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  orderFilters: any = {};
  resizerHeight: any = 200;
  sideView: any = {};
  selectedIndex = 0;
  showPanelObj: any;
  pageView: any;
  tree = [];
  orders = [];
  history = [];
  auditLogs = [];
  data = [];
  orderOverview: any = {};
  orderOverviewAction: any = {};
  reloadState = 'no';
  isProcessing = false;
  isDropdownOpen = false;
  searchableProperties = ['orderId', 'workflowId', 'path', 'state', '_text', 'scheduledFor', 'position'];
  object = {
    mapOfCheckedId: new Map(),
    checked: false,
    indeterminate: false,
    isModify: false,
    isModifyStartTime: false,
    isTerminate: false,
    isCancel: false,
    isCancelWithKill: false,
    isSuspend: false,
    isSuspendWithKill: false,
    isResume: false,
  };

  filterBtn: any = [
    {status: 'ALL', text: 'all'},
    {status: 'PENDING', text: 'pending'},
    {status: 'SCHEDULED', text: 'scheduled'},
    {status: 'INPROGRESS', text: 'incomplete'},
    {status: 'RUNNING', text: 'running'},
    {status: 'SUSPENDED', text: 'suspended'},
    {status: 'PROMPTING', text: 'prompting'},
    {status: 'WAITING', text: 'waiting'},
    {status: 'BLOCKED', text: 'blocked'},
    {status: 'FAILED', text: 'failed'},
    {status: 'COMPLETED', text: 'completed'}
  ];

  dateFilterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'},
    {date: '2d', text: 'nextDay'},
    {date: '7d', text: 'nextWeak'}
  ];

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private route: ActivatedRoute, private dataService: DataService, private searchPipe: SearchPipe,
              private translate: TranslateService, private excelService: ExcelService,
              public modal: NzModalService, private orderPipe: OrderPipe) {
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
    if (this.child) {
      this.orderFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.orderFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  changedHandler(flag: boolean): void {
    this.isProcessing = flag;
  }

  dropdownChangedHandler(isOpen: boolean): void {
    this.isDropdownOpen = isOpen;
  }

  private init(): void {
    this.orderFilters = this.coreService.getOrderOverviewTab();
    this.orderFilters.filter.state = this.route.snapshot.paramMap.get('state');
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }

    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.sideView = this.coreService.getSideView();
    if (this.sideView.orderOverview && !this.sideView.orderOverview.show) {
      this.hidePanel();
    }
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).order || this.preferences.orderOverviewPageView;
    } else {
      this.pageView = this.preferences.orderOverviewPageView;
    }
    if (this.pageView !== 'bulk') {
      this.getOrders({
        controllerId: this.schedulerIds.selected,
        states: this.getState()
      });
    } else {
      this.initTree();
    }
  }

  private initTree(): void {
    this.loading = false;
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        forInventory: true,
        types: ['WORKFLOW']
      }).subscribe({
        next: res => {
          this.tree = this.coreService.prepareTree(res, true);
          this.loading = true;
          if (this.tree.length) {
            this.loadOrder();
          }
        }, error: () => this.loading = true
      });
    } else {
      this.loading = true;
    }
  }

  receiveAction($event): void {
    this.loading = true;
    const obj: any = {
      folders: [{folder: $event.path, recursive: $event.action !== 'NODE'}],
      controllerId: this.schedulerIds.selected
    };
    this.getOrderState(obj);
  }

  loadOrder(): void {
    this.reloadState = 'no';
    const obj: any = {
      folders: [],
      controllerId: this.schedulerIds.selected
    };
    let paths = [];
    if (this.child) {
      if (this.child.defaultSelectedKeys.length === 0) {
        this.child.defaultSelectedKeys = ['/'];
      }
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.orderFilters.selectedkeys;
    }
    for (let x in paths) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getOrderState(obj);
  }

  getOrderState(obj): void {
    if (this.orderFilters.filter.date !== 'ALL') {
      obj.dateTo = this.orderFilters.filter.date;
      if (this.orderFilters.filter.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.preferences.zone;
    }
    this.coreService.post('orders/overview/snapshot', obj).subscribe({
      next: (res: any) => {
        this.orderOverview = res.orders;
        this.loading = true;
        this.isLoaded = true;
      }, error: () => {
        this.orderOverview = {};
        this.loading = true;
        this.isLoaded = true;
      }
    });
  }

  getObstacles(order): void {
    if (order.state._text === 'INPROGRESS' && !order.obstacles) {
      order.obstacles = [];
      this.coreService.post('order/obstacles', {
        controllerId: this.schedulerIds.selected,
        orderId: order.orderId
      }).subscribe((res: any) => {
        order.obstacles = res.obstacles;
      });
    }
  }

  private getState(): string {
    let state;
    if (this.orderFilters.filter.state !== 'ALL') {
      if (this.orderFilters.filter.state === 'COMPLETED') {
        state = ['FINISHED', 'CANCELLED'];
      } else {
        state = [this.orderFilters.filter.state];
      }
    }

    return state;
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      let flag = false;
      let flag1 = false;
      let flag2 = false;
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if ((args.eventSnapshots[j].eventType === 'ProblemEvent' || args.eventSnapshots[j].eventType === 'ProblemAsHintEvent') && args.eventSnapshots[j].message) {
          this.resetAction();
        }
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged') {
          flag = true;
          if (!this.showPanelObj) {
            break;
          }
        }
        if (this.showPanelObj) {
          if ((args.eventSnapshots[j].eventType && (args.eventSnapshots[j].eventType.match('HistoryOrder') || args.eventSnapshots[j].eventType.match('HistoryChildOrder'))) && this.selectedIndex === 0) {
            if (args.eventSnapshots[j].workflow && args.eventSnapshots[j].workflow.path === this.showPanelObj.workflowId.path) {
              flag1 = true;
            }
          } else if (args.eventSnapshots[j].eventType === 'AuditLogChanged' && this.selectedIndex === 2) {
            flag2 = true;
          }
        }
      }
      if (flag && this.isLoaded) {
        this.isLoaded = false;
        if (this.pageView === 'bulk') {
          this.loadOrder();
        } else {
          this.refreshView();
        }
      }
      if (flag1) {
        this.loadOrderHistory();
      } else if (flag2) {
        this.loadAuditLogs();
      }
    }
  }

  private refreshView(): void {
    if (!this.isDropdownOpen && this.object.mapOfCheckedId.size === 0) {
      this.getOrders({
        controllerId: this.schedulerIds.selected,
        states: this.getState()
      });
    } else {
      setTimeout(() => {
        this.refreshView();
      }, 750);
    }
  }

  private getOrders(obj): void {
    this.reloadState = 'no';
    const tempOrder = this.orders.filter((order) => {
      return order.show;
    });
    if (this.orderFilters.filter.date !== 'ALL') {
      obj.dateTo = this.orderFilters.filter.date;
      if (this.orderFilters.filter.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.preferences.zone;
    }
    obj.limit = this.preferences.maxOrderRecords;
    obj.compact = true;
    if (this.orderFilters.filter.state === 'INPROGRESS' || this.orderFilters.filter.state === 'FAILED'
      || this.orderFilters.filter.state === 'RUNNING' || this.orderFilters.filter.state === 'COMPLETED') {
      if (this.orderFilters.filter.stateDateFrom) {
        if (/^([+-]?0|([+-]?[0-9]+[smhdwMy])+|\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}([,.]\\d{1,3})?)(Z|[+-]\\d{2}(:?\\d{2})?)?$/.test(this.orderFilters.filter.stateDateFrom)) {
          obj.stateDateFrom = this.orderFilters.filter.stateDateFrom;
        } else {
          obj.stateDateFrom = this.coreService.getDate(this.orderFilters.filter.stateDateFrom, this.preferences.dateFormat)._d;
        }
      }
      if (this.orderFilters.filter.stateDateTo) {
        if (/^([+-]?0|([+-]?[0-9]+[smhdwMy])+|\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}([,.]\\d{1,3})?)(Z|[+-]\\d{2}(:?\\d{2})?)?$/.test(this.orderFilters.filter.stateDateTo)) {
          obj.stateDateTo = this.orderFilters.filter.stateDateTo;
        } else {
          obj.stateDateTo = this.coreService.getDate(this.orderFilters.filter.stateDateTo, this.preferences.dateFormat)._d;
        }
      }
    }

    this.coreService.post('orders', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        res.orders = this.orderPipe.transform(res.orders, this.orderFilters.filter.sortBy, this.orderFilters.reverse);
        this.orders = res.orders;
        if (this.orders.length === 0) {
          this.orderFilters.currentPage = 1;
        }
        if (tempOrder.length > 0) {
          for (let i = 0; i < this.orders.length; i++) {
            for (let j = 0; j < tempOrder.length; j++) {
              if (this.orders[i].orderId === tempOrder[j].orderId) {
                this.orders[i].show = true;
                if (this.orders[i].arguments && !this.orders[i].arguments[0]) {
                  this.orders[i].arguments = Object.entries(this.orders[i].arguments).map(([k, v]) => {
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
                tempOrder.slice(j, 1);
                break;
              }
            }
            if (tempOrder.length === 0) {
              break;
            }
          }
        }
        if (this.showPanelObj && this.showPanelObj.orderId) {
          let flag = true;
          if (this.orders.length > 0) {
            for (let i = 0; i < this.orders.length; i++) {
              if (this.orders[i].orderId === this.showPanelObj.orderId) {
                flag = false;
                break;
              }
            }
          }
          if (flag) {
            this.hideAuditPanel();
          }
        }
        this.searchInResult();
        if (this.object.mapOfCheckedId.size > 0) {
          const tempObject = new Map();
          this.data.forEach((order) => {
            if (this.object.mapOfCheckedId.has(order.orderId)) {
              tempObject.set(order.orderId, order);
            }
          });
          this.object.mapOfCheckedId = tempObject;
          this.object.mapOfCheckedId.size > 0 ? this.refreshCheckedStatus() : this.resetCheckBox();
        } else {
          this.resetCheckBox();
        }
        this.updatePanelHeight();
        this.isLoaded = true;
        this.loading = true;
        this.resetAction();
      }, error: () => {
        this.resetCheckBox();
        this.isLoaded = true;
        this.loading = true;
        this.resetAction();
      }
    });
  }

  private _updatePanelHeight(): void {
    setTimeout(() => {
      let ht = (parseInt($('#orderTableId table').height(), 10) + 60);
      if (ht > 140 && ht < 150) {
        ht += 40;
      }
      const el = document.getElementById('orderTableId');
      if (el && el.scrollWidth > el.clientWidth) {
        ht = ht + 11;
      }
      if (ht > 650) {
        ht = 650;
      }
      if (ht < 140) {
        ht = 142;
      }
      this.resizerHeight = ht + 'px';
      $('#orderTableId').css('height', this.resizerHeight);
    }, 10);
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event): void {
    if ($event === 'bulk') {
      if (this.tree.length === 0) {
        this.initTree();
      } else {
        this.loadOrder();
      }
    } else {
      if (this.pageView === 'bulk' && $event !== this.pageView) {
        this.getOrders({
          controllerId: this.schedulerIds.selected,
          states: this.getState()
        });
      }
      this.resetCheckBox();
    }
    this.pageView = $event;
    if (this.pageView === 'list') {
      this.updatePanelHeight();
    }
  }

  showPanelFunc(value: any): void {
    this.showPanelObj = value;
    if (this.selectedIndex === 0) {
      this.loadOrderHistory();
    } else {
      this.loadAuditLogs();
    }
  }

  hideAuditPanel(): void {
    this.showPanelObj = undefined;
  }

  tabChange($event): void {
    if ($event.index === 0) {
      this.loadOrderHistory();
    } else {
      this.loadAuditLogs();
    }
  }

  loadOrderHistory(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.showPanelObj.workflowId.path, orderId: this.showPanelObj.orderId}],
      limit: this.preferences.maxHistoryPerOrder
    };
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.history = res.history;
    });
  }

  loadAuditLogs(): void {
    this.showPanelObj.loading = true;
    let obj = {
      controllerId: this.schedulerIds.selected,
      objectTypes: ['ORDER'],
      objectName: this.showPanelObj.orderId,
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe({
      next: (res: any) => {
        this.auditLogs = res.auditLog;
        this.showPanelObj.loading = false;
      }, error: () => this.showPanelObj.loading = false
    });
  }

  showPanelFuc(order): void {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
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
    order.show = true;
    this.updatePanelHeight();
  }

  hidePanelFuc(order): void {
    order.show = false;
    this.updatePanelHeight();
  }

  expandDetails(): void {
    const orders = this.getCurrentData(this.data, this.orderFilters);
    for (let i in orders) {
      if (orders[i].arguments && !orders[i].arguments[0]) {
        orders[i].arguments = Object.entries(orders[i].arguments).map(([k, v]) => {
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
      orders[i].show = true;
    }
    this.updatePanelHeight();
  }

  collapseDetails(): void {
    const orders = this.getCurrentData(this.data, this.orderFilters);
    orders.forEach((order) => {
      order.show = false;
    });
    this.updatePanelHeight();
  }

  changeStatus(state): void {
    this.orderFilters.filter.state = state;
    if (this.pageView === 'bulk') {
      return;
    }
    this.loading = false;
    this.getOrders({controllerId: this.schedulerIds.selected, states: this.getState()});
  }

  changeDate(date): void {
    this.orderFilters.filter.date = date;
    this.loading = false;
    if (this.pageView === 'bulk') {
      this.loadOrder();
    } else {
      this.getOrders({controllerId: this.schedulerIds.selected, states: this.getState()});
    }
  }

  changeDateFilter(isValid, type: string, date): void {
    if (date) {
      if (type == 'FROM') {
        this.orderFilters.filter.stateDateFrom = this.coreService.getDateByFormat(date, this.preferences.zone, this.preferences.dateFormat);
      } else {
        this.orderFilters.filter.stateDateTo = this.coreService.getDateByFormat(date, this.preferences.zone, this.preferences.dateFormat);
      }
    } else {
      if (type == 'FROM') {
        this.orderFilters.filter.stateDateFrom1 = null;
      } else {
        this.orderFilters.filter.stateDateTo1 = null;
      }
    }

    if (isValid) {
      if (this.pageView === 'bulk') {
        this.loadOrder();
      } else {
        this.loading = false;
        this.getOrders({controllerId: this.schedulerIds.selected, states: this.getState()});
      }
    } else {
      if (type == 'FROM') {
        this.orderFilters.filter.stateDateFrom = null;
        this.orderFilters.filter.stateDateFrom1 = null;
      } else {
        this.orderFilters.filter.stateDateTo = null;
        this.orderFilters.filter.stateDateTo1 = null;
      }
    }
  }

  /* ----------------------------Begin Action ----------------------------------*/

  sort(key): void {
    this.orderFilters.reverse = !this.orderFilters.reverse;
    this.orderFilters.filter.sortBy = key;
    this.data = this.orderPipe.transform(this.data, this.orderFilters.filter.sortBy, this.orderFilters.reverse);
    this.resetCheckBox();
  }

  pageIndexChange($event: number): void {
    this.orderFilters.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      this.resetCheckBox();
    }
  }

  pageSizeChange($event: number): void {
    this.orderFilters.entryPerPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      }
    }
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.orderFilters.searchText ? this.searchPipe.transform(this.orders, this.orderFilters.searchText, this.searchableProperties) : this.orders;
    this.data = [...this.data];
  }

  showPanel(): void {
    this.sideView.orderOverview.show = true;
    const dom = $('#rightPanel1');
    dom.removeClass('fade-in m-l-xs');
    dom.find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
    $('#leftPanel1').removeClass('sidebar-hover-effect');
  }

  hidePanel(): void {
    this.sideView.orderOverview.show = false;
    const dom = $('#rightPanel1');
    dom.addClass('m-l-xs fade-in');
    dom.find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
    $('#leftPanel1').addClass('sidebar-hover-effect');
  }

  resetPanel(): void {
    const rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.orderOverview) {
      delete rsHt.orderOverview;
      this.saveService.setResizerHeight(rsHt);
      this.saveService.save();
    }
    this._updatePanelHeight();
  }

  updatePanelHeight(): void {
    const rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.orderOverview) {
      $('#orderTableId').css('height', rsHt.orderOverview);
    } else {
      this._updatePanelHeight();
    }
  }

  submitTransaction(type, state): void {
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      folders: [],
      states: state === 'COMPLETED' ? ['FINISHED', 'CANCELLED'] : [state]
    };
    let paths;
    if (this.child) {
      if (this.child.defaultSelectedKeys.length === 0) {
        this.child.defaultSelectedKeys = ['/'];
      }
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.orderFilters.selectedkeys;
    }
    for (let x in paths) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    let operation = this.orderOverviewAction[type];
    let url = this.orderOverviewAction[type].toLowerCase();
    if (operation && operation.match(/WithKill/)) {
      obj.kill = true;
      operation = operation.match(/Cancel/) ? 'Cancel' : 'Suspend';
      url = operation === 'Cancel' ? 'cancel' : 'suspend';
    }
    if (operation.match(/Terminate/)) {
      url = 'remove_when_terminated';
    }
    if (this.orderFilters.filter.date !== 'ALL') {
      obj.dateTo = this.orderFilters.filter.date;
      if (this.orderFilters.filter.date === '2d') {
        obj.dateFrom = '1d';
      }
      obj.timeZone = this.preferences.zone;
    }
    this.preformAction(operation, url, obj, () => {
      delete this.orderOverviewAction[type];
    });
  }

  selectAll(): void {
    this.data.forEach(item => {
      this.object.mapOfCheckedId.set(item.orderId, item);
    });
    this.refreshCheckedStatus(true);
  }

  checkAll(value: boolean): void {
    if (value && this.data.length > 0) {
      const orders = this.getCurrentData(this.data, this.orderFilters);
      orders.forEach(item => {
        this.object.mapOfCheckedId.set(item.orderId, item);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(order: any, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.orderFilters.entryPerPage || this.preferences.entryPerPage)) {
      const orders = this.getCurrentData(this.data, this.orderFilters);
      if (orders.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        orders.forEach(item => {
          this.object.mapOfCheckedId.set(item.orderId, item);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.set(order.orderId, order);
    } else {
      this.object.mapOfCheckedId.delete(order.orderId);
    }
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(allOrder = false): void {
    const orders = allOrder ? this.data : this.getCurrentData(this.data, this.orderFilters);
    this.object.checked = this.object.mapOfCheckedId.size === orders.length;
    this.object.isCancel = false;
    this.object.isCancelWithKill = false;
    this.object.isModify = true;
    this.object.isModifyStartTime = true;
    this.object.isSuspend = true;
    this.object.isSuspendWithKill = false;
    this.object.isTerminate = true;
    this.object.isResume = true;
    let workflow = null;
    this.object.mapOfCheckedId.forEach(order => {
      if (order.state) {
        if (order.state._text !== 'SUSPENDED' && order.state._text !== 'FAILED') {
          this.object.isResume = false;
        }
        if ((order.state._text !== 'FINISHED' && order.state._text !== 'CANCELLED') || (order.positionString && order.positionString.match('/fork'))) {
          this.object.isTerminate = false;
        }
        if (order.state._text !== 'RUNNING' && order.state._text !== 'INPROGRESS' && order.state._text !== 'WAITING'
          && order.state._text !== 'PENDING' && order.state._text !== 'SCHEDULED' && order.state._text !== 'PROMPTING') {
          this.object.isSuspend = false;
        }
        if (order.state._text === 'FINISHED' || order.state._text === 'CANCELLED') {
          this.object.isCancel = true;
        }
        if (order.state._text === 'RUNNING') {
          this.object.isCancelWithKill = true;
          this.object.isSuspendWithKill = true;
        }
        if (order.state._text !== 'SCHEDULED' && order.state._text !== 'PENDING' && order.state._text !== 'BLOCKED') {
          this.object.isModify = false;
          this.object.isModifyStartTime = false;
        }
        if (!workflow) {
          workflow = order.workflowId.path;
        } else if (workflow !== order.workflowId.path) {
          this.object.isModify = false;
        }
      }
    });
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  modifyAllOrder(): void {
    const order = this.object.mapOfCheckedId.values().next().value;
    this.coreService.post('workflow', {
      controllerId: this.schedulerIds.selected,
      workflowId: order.workflowId
    }).subscribe((res: any) => {
      order.requirements = res.workflow.orderPreparation;
      this.modal.create({
        nzTitle: undefined,
        nzContent: ChangeParameterModalComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerId: this.schedulerIds.selected,
          orders: this.object.mapOfCheckedId,
          orderPreparation: order.requirements,
          workflow: res.workflow
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    });
  }

  modifyAllStartTime(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ModifyStartTimeModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerIds.selected,
        preferences: this.preferences,
        orders: this.object.mapOfCheckedId,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.isProcessing = true;
        this.resetAction(5000);
        this.resetCheckBox();
      }
    });
  }

  terminateAllOrder(): void {
    this._bulkOperation('Terminate', 'remove_when_terminated');
  }

  suspendAllOrder(isKill = false): void {
    this._bulkOperation('Suspend', 'suspend', isKill);
  }

  resumeAllOrder(): void {
    let workflow;
    for (let [key, value] of this.object.mapOfCheckedId) {
      if (!workflow) {
        workflow = value.workflowId.path;
      } else if (workflow !== value.workflowId.path) {
        workflow = null;
        break;
      }
    }

    if (workflow) {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ResumeOrderModalComponent,
        nzClassName: 'x-lg',
        nzData: {
          preferences: this.preferences,
          schedulerId: this.schedulerIds.selected,
          orders: this.object.mapOfCheckedId
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isProcessing = true;
          this.resetAction(5000);
          this.resetCheckBox();
        }
      });
    } else {
      const obj: any = {
        controllerId: this.schedulerIds.selected,
        orderIds: []
      };
      this.object.mapOfCheckedId.forEach((order) => {
        obj.orderIds.push(order.orderId);
      });
      if (this.preferences.auditLog) {
        let comments = {
          radio: 'predefined',
          type: 'Order',
          operation: 'Resume',
          name: ''
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzData: {
            comments,
            obj,
            url: 'orders/resume'
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            this.isProcessing = true;
            this.resetAction(5000);
            this.resetCheckBox();
          }
        });
      } else {
        this.isProcessing = true;
        this.coreService.post('orders/resume', obj).subscribe({
          next: () => {
            this.resetCheckBox();
            this.resetAction(5000);
          }, error: () => this.resetAction()
        });
      }
    }
  }

  cancelAllOrder(isKill = false): void {
    this._bulkOperation('Cancel', 'cancel', isKill);
  }

  _bulkOperation(operation, url, isKill = false): void {
    const obj: any = {
      controllerId: this.schedulerIds.selected
    };
    if (isKill) {
      obj.kill = true;
    }
    if (operation === 'add') {
      obj.orders = [];
    } else {
      obj.orderIds = [];
    }
    this.object.mapOfCheckedId.forEach((order) => {
      if (obj.orderIds) {
        obj.orderIds.push(order.orderId);
      } else {
        obj.orders.push({workflowPath: order.workflowId.path, orderId: order.orderId, scheduledFor: 'now'});
      }
    });
    this.preformAction(operation, url, obj);
  }

  private preformAction(operation, url, obj, cb = null): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Order',
        operation,
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (cb) {
            cb();
          }
          this.isProcessing = true;
          this.resetAction(5000);
          this.resetCheckBox();
        }
      });
    } else {
      this.isProcessing = true;
      this.coreService.post('orders/' + url, obj).subscribe({
        next: () => {
          if (cb) {
            cb();
          }
          this.resetCheckBox();
          this.resetAction(5000);
        }, error: () => this.resetAction()
      });
    }
  }

  resetCheckBox(): void {
    this.object = {
      mapOfCheckedId: new Map(),
      checked: false,
      indeterminate: false,
      isModify: false,
      isModifyStartTime: false,
      isTerminate: false,
      isCancel: false,
      isCancelWithKill: false,
      isSuspend: false,
      isSuspendWithKill: false,
      isResume: false,
    };
  }

  exportToExcel(): void {
    let workflow = '', order = '', status = '', position = '', scheduledFor = '';
    this.translate.get('order.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('order.label.orderId').subscribe(translatedValue => {
      order = translatedValue;
    });
    this.translate.get('order.label.state').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('order.label.position').subscribe(translatedValue => {
      position = translatedValue;
    });
    this.translate.get('order.label.scheduledFor').subscribe(translatedValue => {
      scheduledFor = translatedValue;
    });

    let data = [];
    for (let i = 0; i < this.data.length; i++) {
      let obj: any = {};
      obj[order] = this.data[i].orderId;
      obj[workflow] = this.data[i].workflowId.path;
      obj[position] = this.data[i].positionString;
      this.translate.get(this.data[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      if (!this.data[i].scheduledNever) {
        obj[scheduledFor] = this.coreService.stringToDate(this.preferences, this.data[i].scheduledFor);
      } else {
        this.translate.get('common.label.never').subscribe(translatedValue => {
          obj[scheduledFor] = translatedValue;
        });
      }
      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-orders');
  }

  /* ================================= End Action ============================*/

  private resetAction(time = 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.orders = [];
      this.data = [];
      this.reloadState = 'yes';
      this.loading = true;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.loading = false;
      this.getOrders({controllerId: this.schedulerIds.selected, states: this.getState()});
    }
  }
}
