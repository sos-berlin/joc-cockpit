import {Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

declare const $;

@Component({
  selector: 'app-order-history-template',
  templateUrl: './workflow-history-template.html'
})
export class WorkflowTemplateComponent {
  @Input() history: any;
  @Input() schedulerId: any;

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  showPanelFuc(data, count) {
    data.loading = true;
    data.show = true;
    data.steps = [];
    let obj = {
      controllerId: data.controllerId || this.schedulerId,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      data.children = res.children;
      data.level = count + 1;
      data.states = res.states;
      data.loading = false;
      this.coreService.calRowWidth(null);
    }, () => {
      data.loading = false;
    });
  }

  downloadLog(obj) {
    $('#tmpFrame').attr('src', './api/order/log/download?historyId=' + obj.historyId + '&controllerId=' + this.schedulerId +
      '&accessToken=' + this.authService.accessTokenId);
  }
}

@Component({
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.component.html'
})
export class WorkflowHistoryComponent implements OnChanges, OnInit, OnDestroy {
  @Input() workflow: any;
  index = 0;
  loading = true;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  auditLogs: any = [];
  orderHistory: any = [];
  taskHistory: any = [];
  subscription: Subscription;

  constructor(public coreService: CoreService, private authService: AuthService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.workflow && this.schedulerIds.selected) {
      this.init();
    }
  }

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.init();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.coreService.calRowWidth(null);
  }

  private refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
       // console.log(args.eventSnapshots[j])
        if (args.eventSnapshots[j].eventType === 'HistoryOrderTerminated' && this.index === 0) {
          if (!this.workflow || !this.workflow.path) {
            this.loadOrderHistory();
            break;
          } else if (args.eventSnapshots[j].workflow && args.eventSnapshots[j].workflow.path === this.workflow.path) {
            this.loadOrderHistory();
            break;
          }
        } else if (args.eventSnapshots[j].eventType === 'HistoryTaskTerminated' && this.index === 1) {
          this.loadTaskHistory();
          break;
        } else if (args.eventSnapshots[j].eventType === 'AuditLogChanged' && this.index === 2) {
          this.loadAuditLogs();
          break;
        }
      }
    }
  }

  private init() {
    if (this.index === 0) {
      this.loadOrderHistory();
    } else if (this.index === 1) {
      this.loadTaskHistory();
    } else if (this.index === 2) {
      this.loadAuditLogs();
    }
  }

  loadOrderHistory() {
    let obj = {
      controllerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.workflow.path}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('orders/history', obj).subscribe((res: any) => {
      this.orderHistory = res.history;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  showAllPanelFuc(data) {
    data.showAll = true;
    data.show = true;
    this.recursiveExpand(data, 1);
  }

  private recursiveExpand(data, count) {
    data.loading = true;
    let obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      for (let i = 0; i < res.children.length; i++) {
        if (res.children[i].order) {
          res.children[i].order.show = true;
          this.recursiveExpand(res.children[i].order, ++count);
        }
      }
      data.level = count;
      data.children = res.children;
      data.states = res.states;
      data.loading = false;
      this.coreService.calRowWidth(null);
    }, () => {
      data.loading = false;
    });
  }

  hideAllPanelFuc(data) {
    data.showAll = false;
    data.show = false;
  }

  showPanelFuc(data) {
    data.loading = true;
    data.show = true;
    data.children = [];
    data.states = [];
    let obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe((res: any) => {
      data.level = 1;
      data.children = res.children;
      data.states = res.states;
      data.loading = false;
      this.coreService.calRowWidth(null);
    }, () => {
      data.loading = false;
    });
  }

  hidePanelFuc(data) {
    data.show = false;
    data.showAll = false;
  }

  downloadLog(obj) {
    $('#tmpFrame').attr('src', './api/order/log/download?historyId=' + obj.historyId + '&controllerId=' + this.schedulerIds.selected +
      '&accessToken=' + this.authService.accessTokenId);
  }

  loadTaskHistory() {
    let obj = {
      controllerId: this.schedulerIds.selected,
      jobs: [{workflowPath: this.workflow.path}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('tasks/history', obj).subscribe((res: any) => {
      this.taskHistory = res.history;
    });
  }

  loadAuditLogs() {
    let obj = {
      controllerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.workflow.path}],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }
}
