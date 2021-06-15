import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {OrderActionComponent} from './order-action/order-action.component';
import {SaveService} from '../../services/save.service';
import {SearchPipe} from '../../pipes/core.pipe';
import {ExcelService} from '../../services/excel.service';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../components/guard';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {ChangeParameterModalComponent} from '../../components/modify-modal/modify.component';

declare const $;

@Component({
  selector: 'app-pie-chart',
  templateUrl: './chart-template.component.html',
})
export class OrderPieChartComponent implements OnInit, OnDestroy, OnChanges {
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
      if (changes.schedulerId) {
        this.init();
      } else if (changes.date) {
        this.init();
      } else if (changes.state) {
        this.init();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refresh(args): void {
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
    this.setFilter(data.name.toUpperCase());
  }

  private init(): void {
    const obj: any = {controllerId: this.schedulerId};
    if (this.date === 'NEVER') {
      obj.scheduledNever = true;
    } else {
      if (this.state === 'PENDING' && this.date !== 'ALL') {
        obj.dateTo = this.date;
        obj.timeZone = this.timeZone;
      }
    }
    this.coreService.post('orders/overview/snapshot', obj).subscribe((res: any) => {
      this.snapshot = res.orders;
      this.preparePieData(this.snapshot);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private preparePieData(res): void {
    const ordersData = [];
    this.colorScheme.domain = [];
    for (let prop in res) {
      if (res[prop] > 0) {
        let obj: any = {};
        obj.name = prop;
        try {
          this.translate.get(prop.toUpperCase()).subscribe(translatedValue => {
            obj.name = translatedValue;
          });
        } catch (e){}
        obj.value = res[prop];
        ordersData.push(obj);
        if (prop === 'pending') {
          this.colorScheme.domain.push('#ffc91a');
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
  templateUrl: './order-overview.component.html'
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
  loading: boolean;
  isLoaded: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  orderFilters: any = {};
  isSizeChange: boolean;
  resizerHeight: any = 200;
  sideView: any = {};
  selectedIndex = 0;
  showPanelObj: any;
  pageView: any;
  subscription1: Subscription;
  subscription2: Subscription;
  orders = [];
  history = [];
  auditLogs = [];
  data = [];
  currentData = [];
  searchableProperties = ['orderId', 'workflowId', 'path', 'state', '_text', 'scheduledFor', 'position'];
  object = {
    mapOfCheckedId: new Map(),
    checked: false,
    indeterminate: false,
    isModify: false,
    isTerminate: false,
    isCancel: false,
    isSuspend: false,
    isResume: false,
  };

  filterBtn: any = [
    {status: 'ALL', text: 'all'},
    {status: 'PENDING', text: 'pending'},
    {status: 'INPROGRESS', text: 'incomplete'},
    {status: 'RUNNING', text: 'running'},
    {status: 'SUSPENDED', text: 'suspended'},
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
    {date: '7d', text: 'nextWeak'},
    {date: 'NEVER', text: 'never'}
  ];

  @ViewChild(OrderActionComponent, {static: false}) actionChild;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private route: ActivatedRoute, private dataService: DataService, private searchPipe: SearchPipe,
              private translate: TranslateService, private excelService: ExcelService,
              public modal: NzModalService) {
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
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event): void {
    this.pageView = $event;
    this.resetCheckBox();
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
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
      this.showPanelObj.loading = false;
    }, () => {
      this.showPanelObj.loading = false;
    });
  }

  showPanelFuc(order): void {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
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
    for (let i in this.currentData) {
      if (this.currentData[i].arguments && !this.currentData[i].arguments[0]) {
        this.currentData[i].arguments = Object.entries(this.currentData[i].arguments).map(([k, v]) => {
          return {name: k, value: v};
        });
      }
      this.currentData[i].show = true;
    }
    this.updatePanelHeight();
  }

  collapseDetails(): void {
    this.currentData.forEach((order) => {
      order.show = false;
    });
    this.updatePanelHeight();
  }

  changeStatus(state): void {
    this.orderFilters.filter.state = state;
    this.getOrders({controllerId: this.schedulerIds.selected, states: this.getState()});
  }

  changeDate(date): void {
    this.orderFilters.filter.date = date;
    this.getOrders({controllerId: this.schedulerIds.selected, states: this.getState()});
  }

  /* ----------------------------Begin Action ----------------------------------*/

  sort(key): void {
    this.orderFilters.reverse = !this.orderFilters.reverse;
    this.orderFilters.filter.sortBy = key;
    this.resetCheckBox();
  }

  pageIndexChange($event): void {
    this.orderFilters.currentPage = $event;
    this.resetCheckBox();
  }

  pageSizeChange($event): void {
    this.orderFilters.entryPerPage = $event;
    if (this.object.checked) {
      this.checkAll(true);
    }
  }

  currentPageDataChange($event): void {
    this.currentData = $event;
  }

  searchInResult(): void {
    this.data = this.orderFilters.searchText ? this.searchPipe.transform(this.orders, this.orderFilters.searchText, this.searchableProperties) : this.orders;
    this.data = [...this.data];
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
      obj[position] = this.data[i].position && this.data[i].position.length > 0 ? this.data[i].position[0] : '';
      this.translate.get(this.data[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      obj[scheduledFor] = this.coreService.stringToDate(this.preferences, this.data[i].scheduledFor);
      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-orders');
  }

  hidePanel(): void {
    this.sideView.orderOverview.show = false;
    this.coreService.hidePanel();
  }

  resetPanel(): void {
    const rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.orderOverview) {
      delete rsHt.orderOverview;
      this.saveService.setResizerHeight(rsHt);
      this.saveService.save();
      this._updatePanelHeight();
    }
  }

  updatePanelHeight(): void {
    const rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.orderOverview) {
      $('#orderTableId').css('height', this.resizerHeight);
    } else {
      this._updatePanelHeight();
    }
  }

  showPanel(): void {
    this.sideView.orderOverview.show = true;
    this.coreService.showLeftPanel();
  }

  checkAll(value: boolean): void {
    if (value && this.orders.length > 0) {
      this.currentData.forEach(item => {
        this.object.mapOfCheckedId.set(item.orderId, item);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(order: any, checked: boolean): void {
    if (checked) {
      this.object.mapOfCheckedId.set(order.orderId, order);
    } else {
      this.object.mapOfCheckedId.delete(order.orderId);
    }
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.checked = this.object.mapOfCheckedId.size === this.currentData.length;
    this.object.isCancel = false;
    this.object.isModify = true;
    this.object.isSuspend = true;
    this.object.isTerminate = true;
    this.object.isResume = true;
    let workflow = null;
    this.object.mapOfCheckedId.forEach(order => {
      if (order.state) {
        if (order.state._text !== 'SUSPENDED' && order.state._text !== 'FAILED') {
          this.object.isResume = false;
        }
        if (order.state._text !== 'FINISHED' && order.state._text !== 'CANCELLED') {
          this.object.isTerminate = false;
        }
        if (order.state._text !== 'RUNNING' && order.state._text !== 'INPROGRESS' && order.state._text !== 'WAITING' && order.state._text !== 'PENDING') {
          this.object.isSuspend = false;
        }
        if (order.state._text === 'FINISHED' || order.state._text === 'CANCELLED') {
          this.object.isCancel = true;
        }
        if (order.state._text !== 'PLANNED' && order.state._text !== 'PENDING') {
          this.object.isModify = false;
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
    this.modal.create({
      nzTitle: null,
      nzContent: ChangeParameterModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        orders: this.object.mapOfCheckedId,
        orderRequirements: order.requirements
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  terminateAllOrder(): void {
    this._bulkOperation('Terminate', 'remove_when_terminated');
  }

  suspendAllOrder(): void {
    this._bulkOperation('Suspend', 'suspend');
  }

  resumeAllOrder(): void {
    this._bulkOperation('Resume', 'resume');
  }

  startAllOrder(): void {
    this._bulkOperation('Start', 'add');
  }

  cancelAllOrder(): void{
    this._bulkOperation('Cancel', 'cancel');
  }

  _bulkOperation(operation, url) : void{
    const obj: any = {
      controllerId: this.schedulerIds.selected
    };
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
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Order',
        operation: operation,
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {

      });
    } else {
      this.coreService.post('orders/' + url, obj).subscribe(() => {

      });
    }
  }

  resetCheckBox(): void {
    this.object = {
      mapOfCheckedId: new Map(),
      checked: false,
      indeterminate: false,
      isModify: false,
      isTerminate: false,
      isCancel: false,
      isSuspend: false,
      isResume: false,
    };
  }

  private init(): void {
    this.orderFilters = this.coreService.getOrderOverviewTab();
    this.orderFilters.filter.state = this.route.snapshot.paramMap.get('state');
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).orderOverview;
    }
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.sideView = this.coreService.getSideView();
    if (this.sideView.orderOverview && !this.sideView.orderOverview.show) {
      this.hidePanel();
    }

    this.getOrders({
      controllerId: this.schedulerIds.selected,
      states: this.getState()
    });
  }

  private getState(): string {
    let state;
    if (this.orderFilters.filter.state !== 'ALL' && this.orderFilters.filter.state !== 'NEVER') {
      if (this.orderFilters.filter.state === 'COMPLETED') {
        state = ['FINISHED', 'CANCELLED'];
      } else {
        state = [this.orderFilters.filter.state];
      }
    }

    return state;
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      let flag = false;
      let flag1 = false;
      let flag2 = false;
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged') {
          flag = true;
          if (!this.showPanelObj) {
            break;
          }
        }
        if (this.showPanelObj) {
          if ((args.eventSnapshots[j].eventType === 'HistoryOrderTerminated' || args.eventSnapshots[j].eventType === 'HistoryOrderStarted') && this.selectedIndex === 0) {
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
        this.refreshView({count:0});
      }
      if (flag1) {
        this.loadOrderHistory();
      } else if (flag2) {
        this.loadAuditLogs();
      }
    }
  }

  private refreshView(obj): void {
    if (!this.actionChild.isVisible || obj.count === 20) {
      this.getOrders({
        controllerId: this.schedulerIds.selected,
        states: this.getState()
      });
    } else {
      setTimeout(() => {
        obj.count = obj.count + 1;
        this.refreshView(obj);
      }, 500);
    }
  }

  private getOrders(obj): void {
    let tempOrder = this.orders.filter((order) => {
      return order.show;
    });
    if (this.orderFilters.filter.date === 'NEVER') {
      obj.scheduledNever = true;
    } else {
      if (this.orderFilters.filter.date !== 'ALL' && this.orderFilters.filter.state === 'PENDING') {
        obj.dateTo = this.orderFilters.filter.date;
        obj.timeZone = this.preferences.zone;
      }
    }
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.isLoaded = true;
      this.orders = res.orders;
      if (tempOrder.length > 0) {
        for (let i = 0; i < this.orders.length; i++) {
          for (let j = 0; j < tempOrder.length; j++) {
            if (this.orders[i].orderId === tempOrder[j].orderId) {
              this.orders[i].show = true;
              if (this.orders[i].arguments && !this.orders[i].arguments[0]) {
                this.orders[i].arguments = Object.entries(this.orders[i].arguments).map(([k, v]) => {
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
      this.loading = true;
      this.updatePanelHeight();
      if (this.object.mapOfCheckedId.size > 0) {
        const tempObject = new Map();
        this.data.forEach((order) => {
          if (this.object.mapOfCheckedId.has(order.orderId)) {
            tempObject.set(order.orderId, order);
          }
        });
        this.object.mapOfCheckedId = tempObject;
        this.object.mapOfCheckedId.size > 0 ? this.refreshCheckedStatus() : this.resetCheckBox();
      } else{
        this.resetCheckBox();
      }
    }, () => {
      this.isLoaded = true;
      this.loading = true;
      this.resetCheckBox();
    });
  }

  private _updatePanelHeight(): void {
    setTimeout(() => {
      let ht = (parseInt($('#orderTableId table').height(), 10) + 90);
      if (ht > 140 && ht < 150) {
        ht += 40;
      }
      const el = document.getElementById('orderTableId');
      if (el && el.scrollWidth > el.clientWidth) {
        ht = ht + 11;
      }
      if (ht > 450) {
        ht = 450;
      }
      if (ht < 140) {
        ht = 142;
      }
      this.resizerHeight = ht + 'px';
      $('#orderTableId').css('height', this.resizerHeight);
    }, 5);
  }

  /* ================================= End Action ============================*/
}
