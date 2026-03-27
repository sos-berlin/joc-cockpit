import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  standalone: false,
  selector: 'app-order-history-template',
  templateUrl: './workflow-history-template.html'
})
export class WorkflowTemplateComponent {
  @Input() history: any;
  @Input() schedulerId: any;
  @Input() permission: any;

  constructor(public coreService: CoreService, public viewContainerRef: ViewContainerRef) {
  }

  showPanelFuc(data, count): void {
    data.loading = true;
    data.show = true;
    data.steps = [];
    let obj = {
      controllerId: data.controllerId || this.schedulerId,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe({
      next: (res: any) => {
        data.children = res.children;
        data.level = count + 1;
        data.states = res.states;
        data.loading = false;
        this.coreService.calRowWidth(null);
      }, error: () => {
        data.loading = false;
      }
    });
  }

  downloadLog(obj): void {
    this.coreService.downloadLog(obj, this.schedulerId);
  }
}

@Component({
  standalone: false,
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.component.html'
})
export class WorkflowHistoryComponent implements OnChanges, OnInit, OnDestroy {
  @Input() workflow: any;
  @Input() jobName: any;
  @Output() onClick: EventEmitter<any> = new EventEmitter();
  index = 0;
  loading = true;
  isCalled = false;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  auditLogs: any = [];
  orderHistory: any = [];
  taskHistory: any = [];
  jobHistory: any = [];
  workflowFilters: any = {};
  subscription: Subscription;
  private expandedOrderState: Map<string, any> = new Map();
  private expandedTaskState: Map<string, any> = new Map();
  private expandedJobState: Map<string, any> = new Map();

  constructor(public coreService: CoreService, private authService: AuthService, public message: NzMessageService,
              private router: Router, private dataService: DataService, public viewContainerRef: ViewContainerRef) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflow'] && this.schedulerIds.selected) {
      this.init();
    }
    if (changes['jobName'] && this.isCalled && this.jobName) {
      if (this.index == 2) {
        this.index = 3;
        setTimeout(() => {
          this.index = 2;
        }, 1);
      } else {
        this.index = 2;
      }
      this.loadJobHistory();
    }
  }

  ngOnInit(): void {
    this.workflowFilters = this.coreService.getWorkflowTab();
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.jobName) {
      this.index = 2;
    }
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.coreService.calRowWidth(null);
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        const event = args.eventSnapshots[j];
        const eventType = event.eventType;
        const eventWorkflow = event.workflow;
        
        // Check if event is related to current workflow
        const isRelevantWorkflow = !this.workflow || !this.workflow.path || 
          (eventWorkflow && eventWorkflow.path === this.workflow.path);

        // Order History Tab (index 0)
        if (this.index == 0) {
          // Handle order events
          if (eventType && (eventType.match('HistoryOrder') || eventType.match('HistoryChildOrder'))) {
            if (isRelevantWorkflow) {
              this.loadOrderHistory();
              break;
            }
          }
          // Handle workflow state changes (affects progress bar)
          else if (eventType === 'WorkflowStateChanged') {
            if (isRelevantWorkflow) {
              this.loadOrderHistory();
              break;
            }
          }
          // Handle task events to update progress bar when jobs complete/start
          else if (eventType === 'HistoryTaskTerminated' || eventType === 'HistoryTaskStarted' || eventType === 'HistoryTaskUpdated' || eventType === 'JobStateChanged') {
            if (isRelevantWorkflow) {
              this.loadOrderHistory();
              break;
            }
          }
        }
        
        // Task History Tab (index 1)
        else if (this.index == 1) {
          if (eventType === 'HistoryTaskTerminated' || eventType === 'HistoryTaskStarted' || eventType === 'HistoryTaskUpdated' || eventType === 'JobStateChanged') {
            if (isRelevantWorkflow) {
              this.loadTaskHistory();
              break;
            }
          }
        }
        
        // Job History Tab (index 2 with jobName)
        else if (this.jobName && this.index == 2) {
          if (eventType === 'HistoryTaskTerminated' || eventType === 'HistoryTaskStarted' || eventType === 'HistoryTaskUpdated' || eventType === 'JobStateChanged') {
            if (isRelevantWorkflow) {
              this.loadJobHistory();
              break;
            }
          }
        }
        
        // Audit Log Tab
        else if (eventType === 'WorkflowAuditLogChanged' && ((this.jobName && this.index == 3) || (!this.jobName && this.index == 2))) {
          if (isRelevantWorkflow) {
            this.loadAuditLogs();
            break;
          }
        }
      }
    }
  }

  sort(key, tab): void {
    if (tab === 'orderHistory') {
      this.workflowFilters.historyFilter.reverse = !this.workflowFilters.historyFilter.reverse;
      this.workflowFilters.historyFilter.sortBy = key;
    } else if (tab === 'taskHistory') {
      this.workflowFilters.taskHistoryFilter.reverse = !this.workflowFilters.taskHistoryFilter.reverse;
      this.workflowFilters.taskHistoryFilter.sortBy = key;
    } else if (tab === 'auditLog') {
      this.workflowFilters.auditLogFilter.reverse = !this.workflowFilters.auditLogFilter.reverse;
      this.workflowFilters.auditLogFilter.sortBy = key;
    } else if (tab === 'jobHistory') {
      this.workflowFilters.jobHistoryFilter.reverse = !this.workflowFilters.jobHistoryFilter.reverse;
      this.workflowFilters.jobHistoryFilter.sortBy = key;
    }
  }


  private init(): void {
    if (this.index === 0) {
      this.loadOrderHistory();
    } else if (this.index === 1) {
      this.loadTaskHistory();
    } else if (this.index === 2) {
      if (this.jobName) {
        this.loadJobHistory();
      } else {
        this.loadAuditLogs();
      }
    }
    this.isCalled = true;
  }

  private preserveExpandedState(data: any[], stateMap: Map<string, any>, idField: string): void {
    if (data && data.length > 0) {
      data.forEach(item => {
        const id = item[idField];
        if (id && (item.show || item.showAll)) {
          // Only preserve the expansion flags, not the actual children data
          stateMap.set(id, {
            show: item.show,
            showAll: item.showAll
          });
        }
      });
    }
  }

  private restoreExpandedState(data: any[], stateMap: Map<string, any>, idField: string): any[] {
    if (data && data.length > 0) {
      data.forEach(item => {
        const id = item[idField];
        if (id && stateMap.has(id)) {
          const state = stateMap.get(id);
          // Only restore expansion flags, let children/states be fresh
          item.show = state.show;
          item.showAll = state.showAll;
          // If row was expanded, reload its children with fresh data
          if (item.show && item.historyId) {
            this.reloadOrderChildren(item);
          }
        }
      });
    }
    return data;
  }

  private reloadOrderChildren(data: any): void {
    if (!data.historyId) return;
    
    data.loading = true;
    const obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe({
      next: (res: any) => {
        data.children = res.children;
        data.states = res.states;
        data.level = 1;
        data.loading = false;
        this.coreService.calRowWidth(null);
      }, error: () => {
        data.loading = false;
      }
    });
  }

  loadOrderHistory(): void {
    // Preserve expanded state before loading
    this.preserveExpandedState(this.orderHistory, this.expandedOrderState, 'historyId');
    
    const obj = {
      controllerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.workflow.name}],
      limit: this.preferences.maxHistoryPerOrder
    };
    this.coreService.post('orders/history', obj).subscribe({
      next: (res: any) => {
        // Restore expanded state after loading
        this.orderHistory = this.restoreExpandedState(res.history, this.expandedOrderState, 'historyId');
        this.loading = false;
      }, error: () => {
        this.loading = false;
      }
    });
  }

  showAllPanelFuc(data): void {
    data.showAll = true;
    data.show = true;
    this.recursiveExpand(data, 1);
  }

  private recursiveExpand(data, count): void {
    data.loading = true;
    let obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe({
      next: (res: any) => {
        for (let i = 0; i < res.children.length; i++) {
          if (res.children[i].order) {
            res.children[i].order.show = true;
            const childCount = count + 1;
            this.recursiveExpand(res.children[i].order, childCount);
          }
        }
        data.level = count;
        data.children = res.children;
        data.states = res.states;
        data.loading = false;
        this.coreService.calRowWidth(null);
      }, error: () => {
        data.loading = false;
      }
    });
  }

  hideAllPanelFuc(data): void {
    data.showAll = false;
    data.show = false;
  }

  showPanelFuc(data): void {
    data.loading = true;
    data.show = true;
    data.children = [];
    data.states = [];
    let obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      historyId: data.historyId
    };
    this.coreService.post('order/history', obj).subscribe({
      next: (res: any) => {
        data.level = 1;
        data.children = res.children;
        data.states = res.states;
        data.loading = false;
        this.coreService.calRowWidth(null);
      }, error: () => {
        data.loading = false;
      }
    });
  }

  hidePanelFuc(data): void {
    data.show = false;
    data.showAll = false;
  }

  downloadLog(obj): void {
    this.coreService.downloadLog(obj, this.schedulerIds.selected);
  }

  loadTaskHistory(): void {
    // Preserve expanded state before loading
    this.preserveExpandedState(this.taskHistory, this.expandedTaskState, 'taskId');
    
    let obj = {
      controllerId: this.schedulerIds.selected,
      jobs: [{workflowPath: this.workflow.name}],
      limit: this.preferences.maxHistoryPerTask
    };
    this.coreService.post('tasks/history', obj).subscribe((res: any) => {
      // Restore expanded state after loading
      this.taskHistory = this.restoreExpandedState(res.history, this.expandedTaskState, 'taskId');
    });
  }

  loadJobHistory(): void {
    // Preserve expanded state before loading
    this.preserveExpandedState(this.jobHistory, this.expandedJobState, 'taskId');
    
    let obj = {
      controllerId: this.schedulerIds.selected,
      jobs: [{workflowPath: this.workflow.name, job: this.jobName}],
      limit: this.preferences.maxHistoryPerTask
    };

    this.coreService.post('tasks/history', obj).subscribe({
      next: (res: any) => {
        // Restore expanded state after loading
        this.jobHistory = this.restoreExpandedState(res.history, this.expandedJobState, 'taskId');
      }, error: () => {
        this.jobHistory = [];
      }
    });
  }

  loadAuditLogs(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      objectTypes: ['WORKFLOW', 'ORDER'],
      objectName: this.workflow.name,
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }

  copyOrderId(orderId): void {
    this.coreService.copyToClipboard(orderId, this.message);
  }

  navToHistory(type: string): void {
    const filter = this.coreService.getHistoryTab();
    filter.type = type;
    if (type === 'ORDER') {
      filter.order.selectedView = false;
      filter.order.workflow = this.workflow.name;
      if (this.orderHistory[this.orderHistory.length - 1]) {
        const plannedTime = new Date(this.orderHistory[this.orderHistory.length - 1].plannedTime);
        if (plannedTime.getFullYear() === 10000) {
          filter.order.fromDate = ''
        } else {
          filter.order.fromDate = plannedTime;
        }
      }

    } else {
      filter.task.selectedView = false;
      filter.task.workflow = this.workflow.name;
      if (this.taskHistory[this.taskHistory.length - 1]) {
        filter.task.fromDate = new Date(this.taskHistory[this.taskHistory.length - 1].startTime);
      }
    }
    this.router.navigate(['/history']).then();
  }
}
