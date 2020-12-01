import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../components/guard';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderActionComponent} from './order-action/order-action.component';
import {SaveService} from '../../services/save.service';
import {SearchPipe} from '../../filters/filter.pipe';
import {ExcelService} from '../../services/excel.service';
import {TranslateService} from '@ngx-translate/core';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

declare const $;

@Component({
  selector: 'app-pie-chart',
  templateUrl: './chart-template.component.html',
})
export class OrderPieChartComponent implements OnInit, OnDestroy {
  @Input() schedulerId: any;
  @Input() state: any;
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

  constructor(public coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit() {
    this.init();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private init() {
    this.coreService.post('orders/overview/snapshot', {controllerId: this.schedulerId}).subscribe((res: any) => {
      this.snapshot = res.orders;
      this.preparePieData(this.snapshot);
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].controllerId == this.schedulerId) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType.match(/Order/)) {
              this.init();
              break;
            }
          }
        }
        break;
      }
    }
  }

  private preparePieData(res) {
    let ordersData = [];
    for (let prop in res) {
      if (res[prop] > 0) {
        let obj: any = {};
        obj.name = prop;
        obj.value = res[prop];
        ordersData.push(obj);
        if (prop === 'running') {
          this.colorScheme.domain.push('#7ab97a');
        } else if (prop === 'suspended') {
          this.colorScheme.domain.push('#e86680');
        } else if (prop === 'failed') {
          this.colorScheme.domain.push('#99b2df');
        } else if (prop === 'waiting') {
          this.colorScheme.domain.push('#ffa366');
        } else if (prop === 'blocked') {
          this.colorScheme.domain.push('#b966b9');
        } else if (prop === 'pending') {
          this.colorScheme.domain.push('rgba(255,195,0,0.9)');
        }
      }
    }
    this.ordersData = ordersData;
  }

  setFilter(state) {
    this.state = state;
    this.setState.emit(this.state);
    console.log('state', state);
  }

  onSelect(data): void {
    this.setFilter(data.name.toUpperCase());
  }
}

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html'
})
export class SingleOrderComponent implements OnInit {
  loading: boolean;
  schedulerId: string;
  orderId: string;
  permission: any = {};
  preferences: any = {};
  order: any = {};
  resizerHeight: any = 200;
  orders = [];
  history = [];
  auditLogs = [];

  constructor(private authService: AuthService, public coreService: CoreService,
              private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.schedulerId = this.route.snapshot.queryParamMap.get('scheduler_id');
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.getOrder();
  }

  getOrder() {
    const obj = {
      controllerId: this.schedulerId,
      workflowIds: []
    };
    this.coreService.post('orders', obj).subscribe((res: any) => {
      console.log(res.orders);
    });
  }

  loadOrderHistory() {
    let obj = {
      controllerId: this.schedulerId,
      orders: [{workflowPath: this.order.workflowId.path, orderId: this.order.orderId}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.history = res.history;
    });
  }

  loadAuditLogs() {
    let obj = {
      controllerId: this.schedulerId,
      orders: [{workflowPath: this.order.workflowId.path, orderId: this.order.orderId}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }

  showPanelFuc(order) {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    order.show = true;
  }

  hidePanelFuc(order) {
    order.show = false;
  }
}

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html',
  styleUrls: ['./order-overview.component.css']
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  object: any = {orders: []};
  orderFilters: any = {};
  isSizeChange: boolean;
  resizerHeight: any = 200;
  sideView: any = {};
  showPanelObj: any;
  pageView: any;
  subscription1: Subscription;
  orders = [];
  history = [];
  auditLogs = [];
  data = [];
  currentData = [];

  @ViewChild(OrderActionComponent, {static: false}) actionChild;

  constructor(private authService: AuthService, public coreService: CoreService, private saveService: SaveService,
              private route: ActivatedRoute, private dataService: DataService, private searchPipe: SearchPipe,
              private translate: TranslateService, private excelService: ExcelService, public modalService: NgbModal) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit() {
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
    this.getOrders({controllerId: this.schedulerIds.selected, states: [this.orderFilters.filter.state]});
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  showPanelFunc(value) {
    this.showPanelObj = value;
    this.loadOrderHistory();
  }

  hideAuditPanel() {
    this.showPanelObj = '';
  }

  loadOrderHistory() {
    let obj = {
      controllerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.showPanelObj.workflowId.path, orderId: this.showPanelObj.orderId}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.history = res.history;
    });
  }

  loadAuditLogs() {
    let obj = {
      controllerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.showPanelObj.workflowId.path, orderId: this.showPanelObj.orderId}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }

  showPanelFuc(order) {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    order.show = true;
    this.updatePanelHeight();
  }

  hidePanelFuc(order) {
    order.show = false;
    this.updatePanelHeight();
  }

  expandDetails() {
    for (let i = 0; i < this.currentData.length; i++) {
      if (this.currentData[i].arguments && !this.currentData[i].arguments[0]) {
        this.currentData[i].arguments = Object.entries(this.currentData[i].arguments).map(([k, v]) => {
          return {name: k, value: v};
        });
      }
      this.currentData[i].show = true;
    }
    this.updatePanelHeight();
  }

  collapseDetails() {
    this.currentData.forEach((order) => {
      order.show = false;
    });
    this.updatePanelHeight();
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].controllerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType.match(/Order/)) {
              this.getOrders({controllerId: this.schedulerIds.selected, states: [this.orderFilters.filter.state]});
              break;
            }
          }
        }
        break;
      }
    }
  }

  private getOrders(obj) {
    this.reset();
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.orders = res.orders;
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
      /* this.orders.forEach((order) => {
           console.log(order);
           order.path1 = order.path.substring(0, order.path.lastIndexOf('/')) || order.path.substring(0, order.path.lastIndexOf('/') + 1);
      });*/
    }, (err) => {
      this.loading = true;
    });
  }

  changeStatus(state) {
    this.orderFilters.filter.state = state;
    if (state !== 'ALL') {
      this.getOrders({controllerId: this.schedulerIds.selected, states: [state]});
    } else {
      this.getOrders({controllerId: this.schedulerIds.selected});
    }
  }

  /** ----------------------------Begin Action ----------------------------------*/

  sort(key): void {
    this.orderFilters.reverse = !this.orderFilters.reverse;
    this.orderFilters.filter.sortBy = key;
  }

  pageIndexChange($event) {
    this.orderFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.orderFilters.entryPerPage = $event;
  }

  currentPageDataChange($event) {
    this.currentData = $event;
  }

  searchInResult() {
    this.data = this.orderFilters.searchText ? this.searchPipe.transform(this.orders, this.orderFilters.searchText) : this.orders;
    this.data = [...this.data];
  }

  exportToExcel() {
    let workflow = '', order = '', status = '', position = '', scheduledFor = '';
    this.translate.get('label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('label.orderId').subscribe(translatedValue => {
      order = translatedValue;
    });
    this.translate.get('label.state').subscribe(translatedValue => {
      status = translatedValue;
    });
    this.translate.get('label.position').subscribe(translatedValue => {
      position = translatedValue;
    });
    this.translate.get('label.scheduledFor').subscribe(translatedValue => {
      scheduledFor = translatedValue;
    });

    let data = [];
    for (let i = 0; i < this.currentData.length; i++) {
      let obj: any = {};
      obj[order] = this.currentData[i].orderId;
      obj[workflow] = this.currentData[i].workflowId.path;
      obj[position] = this.currentData[i].position && this.currentData[i].position.length > 0 ? this.currentData[i].position[0] : '';
      this.translate.get(this.currentData[i].state._text).subscribe(translatedValue => {
        obj[status] = translatedValue;
      });
      obj[scheduledFor] = this.coreService.stringToDate(this.preferences, this.currentData[i].scheduledFor);
      data.push(obj);
    }
    this.excelService.exportAsExcelFile(data, 'JS7-orders');
  }

  hidePanel() {
    this.sideView.orderOverview.show = false;
    this.coreService.hidePanel();
  }

  resetPanel() {
    const rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.orderOverview) {
      delete rsHt.orderOverview;
      this.saveService.setResizerHeight(rsHt);
      this.saveService.save();
      this._updatePanelHeight();
    }
  }

  updatePanelHeight() {
    let rsHt = this.saveService.resizerHeight ? JSON.parse(this.saveService.resizerHeight) || {} : {};
    if (rsHt.orderOverview) {
      $('#orderTableId').css('height', this.resizerHeight);
    } else {
      this._updatePanelHeight();
    }
  }

  private _updatePanelHeight() {
    setTimeout(() => {
      let ht = (parseInt($('#orderTableId table').height(), 10) + 90);
      if (ht > 140 && ht < 150) {
        ht += 40;
      }
      let el = document.getElementById('orderTableId');
      if (el && el.scrollWidth > el.clientWidth) {
        ht = ht + 11;
      }
      if (ht > 450) {
        ht = 450;
      }
      this.resizerHeight = ht + 'px';
      $('#orderTableId').css('height', this.resizerHeight);
    }, 5);
  }

  showPanel() {
    this.sideView.orderOverview.show = true;
    this.coreService.showLeftPanel();
  }

  checkAll() {
    if (this.object.checkbox && this.orders.length > 0) {
      this.object.orders = this.currentData;
    } else {
      this.object.orders = [];
    }
  }

  checkMainCheckbox() {
    if (this.object.orders && this.object.orders.length > 0) {
      this.object.checkbox = this.object.orders.length === this.currentData.length;
    } else {
      this.object.checkbox = false;
    }
  }

  suspendAllOrder() {
    this._bulkOperation('suspend');
  }

  resumeAllOrder() {
    this._bulkOperation('resume');
  }

  startAllOrder() {
    this._bulkOperation('add');
  }

  cancelAllOrder() {
    this._bulkOperation('cancel');
  }

  _bulkOperation(operation) {
    const obj: any = {
      controllerId: this.schedulerIds.selected
    };
    if (operation === 'add') {
      obj.orders = [];
    } else {
      obj.orderIds = [];
    }
    this.object.orders.forEach((order) => {
      if(obj.orderIds) {
        obj.orderIds.push(order.orderId);
      }else{
        obj.orders.push({workflowPath: order.workflowId.path, orderId: order.orderId, scheduledFor : 'now'});
      }
    });
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Order',
        operation: operation,
        name: ''
      };
      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'orders/' + operation;
      modalRef.result.then((result) => {
        this.reset();
      }, (reason) => {
        this.reset();
      });
    } else {
      this.coreService.post('orders/' + operation, obj).subscribe(() => {
      });
    }
  }

  reset(){
    this.object.orders = [];
    this.object.checkbox = false;
  }

  /** ================================= End Action ============================*/
}
