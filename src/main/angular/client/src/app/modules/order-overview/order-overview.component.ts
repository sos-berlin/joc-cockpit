import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {DataService} from '../../services/data.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../components/guard';
import {ActivatedRoute} from '@angular/router';
import {OrderActionComponent} from './order-action/order-action.component';

declare const $;

@Component({
  selector: 'app-pie-chart',
  templateUrl: './chart-template.component.html',
})
export class OrderPieChartComponent implements OnInit {
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

  constructor(public coreService: CoreService) {
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.coreService.post('orders/overview/snapshot', {jobschedulerId: this.schedulerId}).subscribe((res: any) => {
      this.snapshot = res.orders;
      this.preparePieData(this.snapshot);
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
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
  searchKey: string;
  resizerHeight: any = 200;
  sideView: any = {};
  showPanelObj: any;
  pageView: any;
  subscription1: Subscription;
  orders = [];
  history: [];
  auditLogs: [];

  @ViewChild(OrderActionComponent, {static: false}) actionChild;

  constructor(private authService: AuthService, public coreService: CoreService,
              private route: ActivatedRoute, private dataService: DataService) {
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
    this.getOrders({jobschedulerId: this.schedulerIds.selected, states: [this.orderFilters.filter.state]});
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    this.subscription1.unsubscribe();
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  sort(sort: { key: string }): void {
    this.orderFilters.reverse = !this.orderFilters.reverse;
    this.orderFilters.filter.sortBy = sort.key;
  }

  pageIndexChange($event) {
    this.orderFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.orderFilters.entryPerPage = $event;
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
      jobschedulerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.showPanelObj.workflowId.path, orderId: this.showPanelObj.orderId}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.history = res.history;
    });
  }

  loadAuditLogs() {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.showPanelObj.workflowId.path, orderId: this.showPanelObj.orderId}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }

  showPanelFuc(order) {
    order.show = true;
    //this.updatePanelHeight();
  }

  hidePanelFuc(order) {
    order.show = false;
    // this.updatePanelHeight();
  }

  expandDetails() {

  }

  collapseDetails() {

  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].path) {
              console.log(args[i].eventSnapshots[j]);
            }
          }
        }
        break;
      }
    }
  }

  private getOrders(obj) {
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.orders = res.orders;
/*      this.orders.forEach((order) => {
        console.log(order);
        order.path1 = order.path.substring(0, order.path.lastIndexOf('/')) || order.path.substring(0, order.path.lastIndexOf('/') + 1);
      });*/
    });
  }

  changeStatus(state) {
    this.orderFilters.filter.state = state;
    this.getOrders({jobschedulerId: this.schedulerIds.selected, states: [state]});
  }

  /** ----------------------------Begin Action ----------------------------------*/
  exportToExcel() {
    $('#orderTableId table').table2excel({
      exclude: '.tableexport-ignore',
      filename: 'JS7-order',
      fileext: '.xls',
      exclude_img: false,
      exclude_links: false,
      exclude_inputs: false
    });
  }

  hidePanel() {
    this.sideView.orderOverview.show = false;
    this.coreService.hidePanel();
  }

  resetPanel() {

  }

  showPanel() {
    this.sideView.orderOverview.show = true;
    this.coreService.showLeftPanel();
  }

  suspendAllOrder() {

  }

  resumeAllOrder() {

  }

  startAllOrder() {

  }

  /** ================================= End Action ============================*/
}
