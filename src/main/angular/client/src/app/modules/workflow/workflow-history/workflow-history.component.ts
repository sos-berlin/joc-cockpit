import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-order-history-template',
  templateUrl: './workflow-history-template.html'
})
export class WorkflowTemplateComponent {
  @Input() history: any;
  @Input() schedulerId: any;
  @Input() permission: any;

  constructor(public coreService: CoreService) {
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
  subscription: Subscription;

  constructor(public coreService: CoreService, private authService: AuthService,
              private router: Router, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.workflow && this.schedulerIds.selected) {
      this.init();
    }
    if (changes.jobName && this.isCalled) {
      this.index = 2;
    }
  }

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};

    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.coreService.calRowWidth(null);
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if ((args.eventSnapshots[j].eventType && (args.eventSnapshots[j].eventType.match('HistoryOrder') || args.eventSnapshots[j].eventType.match('HistoryChildOrder'))) && this.index == 0) {
          if (!this.workflow || !this.workflow.path) {
            this.loadOrderHistory();
            break;
          } else if (args.eventSnapshots[j].workflow && args.eventSnapshots[j].workflow.path === this.workflow.path) {
            this.loadOrderHistory();
            break;
          }
        } else if ((args.eventSnapshots[j].eventType === 'HistoryTaskTerminated' || args.eventSnapshots[j].eventType === 'HistoryTaskStarted' || args.eventSnapshots[j].eventType === 'HistoryTaskUpdated') && this.index == 1) {
          this.loadTaskHistory();
          break;
        } else if (args.eventSnapshots[j].eventType === 'WorkflowAuditLogChanged' && ((this.jobName && this.index == 3) || (!this.jobName && this.index == 2))) {
          if (args.eventSnapshots[j].workflow && args.eventSnapshots[j].workflow.path === this.workflow.path) {
            this.loadAuditLogs();
            break;
          }
        } else if ((args.eventSnapshots[j].eventType === 'HistoryTaskTerminated' || args.eventSnapshots[j].eventType === 'HistoryTaskStarted' || args.eventSnapshots[j].eventType === 'HistoryTaskUpdated') && ((this.jobName && this.index == 2))) {
          if (args.eventSnapshots[j].workflow && args.eventSnapshots[j].workflow.path === this.workflow.path) {
            this.loadJobHistory();
            break;
          }
        }
      }
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

  loadOrderHistory(): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      orders: [{workflowPath: this.workflow.name}],
      limit: this.preferences.maxHistoryPerOrder
    };
    this.coreService.post('orders/history', obj).subscribe({
      next: (res: any) => {
        this.orderHistory = res.history;
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
            this.recursiveExpand(res.children[i].order, ++count);
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
    let obj = {
      controllerId: this.schedulerIds.selected,
      jobs: [{workflowPath: this.workflow.name}],
      limit: this.preferences.maxHistoryPerTask
    };
    this.coreService.post('tasks/history', obj).subscribe((res: any) => {
      this.taskHistory = res.history;
    });
  }

  loadJobHistory(): void {
    let obj = {
      controllerId: this.schedulerIds.selected,
      jobs: [{workflowPath: this.workflow.name, job: this.workflow.jobName}],
      limit: this.preferences.maxHistoryPerTask
    };

    this.coreService.post('tasks/history', obj).subscribe((res: any) => {
      this.jobHistory = res.history;
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

  navToHistory(type: string): void {
    const filter = this.coreService.getHistoryTab();
    filter.type = type;
    if (type === 'ORDER') {
      filter.order.selectedView = false;
      filter.order.workflow = this.workflow.path;
      if (this.orderHistory[this.orderHistory.length - 1]) {
        filter.order.fromDate = new Date(this.orderHistory[this.orderHistory.length - 1].plannedTime);
      }
    } else {
      filter.task.selectedView = false;
      filter.task.workflow = this.workflow.path;
      if (this.taskHistory[this.taskHistory.length - 1]) {
        filter.task.fromDate = new Date(this.taskHistory[this.taskHistory.length - 1].startTime);
      }
    }
    this.router.navigate(['/history']).then();
  }
}
