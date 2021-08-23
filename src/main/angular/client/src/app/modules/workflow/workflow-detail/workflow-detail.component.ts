import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isEmpty, sortBy} from 'underscore';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {WorkflowService} from '../../../services/workflow.service';
import {AddOrderModalComponent, ShowDependencyComponent} from '../workflow-action/workflow-action.component';
import {DataService} from '../../../services/data.service';

declare const $;

@Component({
  selector: 'app-workflow-detail',
  templateUrl: './workflow-detail.component.html'
})
export class WorkflowDetailComponent implements OnInit, OnDestroy {
  path: string;
  versionId: string;
  workFlowJson: any = {};
  orderPreparation: any = {};
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  workflow: any = {};
  isExpandAll: boolean;
  pageView: any;
  selectedPath: string;
  workflowFilters: any = {};
  sideBar: any = {};
  isProcessing = false;
  subscription: Subscription;

  filterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'}
  ];


  constructor(private authService: AuthService, public coreService: CoreService, private route: ActivatedRoute,
              public workflowService: WorkflowService, public modal: NzModalService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.path = this.route.snapshot.paramMap.get('path');
    this.versionId = this.route.snapshot.paramMap.get('versionId');
    this.workflowFilters = this.coreService.getWorkflowDetailTab();
    this.pageView = this.workflowFilters.pageView;
    this.init();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow
          && this.path === args.eventSnapshots[j].workflow.path && this.versionId === args.eventSnapshots[j].workflow.versionId) {
          this.getOrders(this.coreService.clone(this.workflow));
          break;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  changedHandler(flag: boolean): void {
    this.isProcessing = flag;
  }

  private resetAction(time = 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }

  backClicked(): void {
    window.history.back();
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/

  expandAll(): void {
    if (this.pageView === 'list') {
      this.isExpandAll = true;
    }
  }

  collapseAll(): void {
    if (this.pageView === 'list') {
      this.isExpandAll = false;
    }
  }

  scrollTop(): void {
    $(window).scrollTop(0);
  }

  scrollBottom(): void {
    $(window).scrollTop($('body').height());
  }

  setView($event): void {
    this.pageView = $event;
  }

  showDependency(workflow = null): void {
    if (!this.workFlowJson.expectedNoticeBoards) {
      this.coreService.post('workflow/dependencies', {
        controllerId: this.schedulerIds.selected,
        workflowId: {
          path: workflow ? workflow.path : this.workFlowJson.path,
          version: workflow ? workflow.versionId : this.workFlowJson.versionId
        }
      }).subscribe((res) => {
        if (isEmpty(this.workFlowJson)) {
          workflow.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
          workflow.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
        } else {
          this.workFlowJson.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
          this.workFlowJson.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
        }
        if (!workflow) {
          this.openModal(this.workFlowJson);
        } else {
          this.getOrders(workflow);
        }
      });
    } else {
      if (!workflow) {
        this.openModal(this.workFlowJson);
      }
    }
  }

  private openModal(workflow): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowDependencyComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        workflow
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  addOrder(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddOrderModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerIds.selected,
        workflow: this.workFlowJson
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        this.isProcessing = true;
        this.resetAction(5000);
      }
    });
  }

  loadOrders(date): void {
    this.workflowFilters.date = date;
    this.getOrders(this.coreService.clone(this.workflow));
  }

  showPanelFuc(order: any): void {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    order.show = true;
  }

  private init(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.coreService.post('workflow', {
      controllerId: this.schedulerIds.selected,
      workflowId: {path: this.path, versionId: this.versionId}
    }).subscribe((res: any) => {
      this.workflow = this.coreService.clone(res.workflow);
      this.orderPreparation = res.workflow.orderPreparation;
      this.workFlowJson = res.workflow;
      this.workflowService.convertTryToRetry(this.workFlowJson, null, res.workflow.jobs);
      this.workFlowJson.name = this.workflow.path.substring(this.workflow.path.lastIndexOf('/') + 1);
      if (res.workflow.hasExpectedNoticeBoards || res.workflow.hasPostNoticeBoards) {
        this.showDependency(res.workflow);
      } else {
        this.getOrders(res.workflow);
      }
    }, () => {
      this.loading = true;
    });
  }

  private getOrders(workflow): void {
    if (this.permission && this.permission.currentController && !this.permission.currentController.orders.view) {
      this.loading = true;
      return;
    }
    const obj = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: [{path: workflow.path, versionId: workflow.versionId}],
      dateTo: this.workflowFilters.date !== 'ALL' ? this.workflowFilters.date : undefined,
      timeZone: this.preferences.zone
    };
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.workflow.orders = res.orders;
      this.workflow.numOfOrders = res.orders.length;
      this.workflow.ordersSummary = {};
      if (res.orders) {
        res.orders = sortBy(res.orders, 'scheduledFor');
        for (let j = 0; j < res.orders.length; j++) {
          const state = res.orders[j].state._text.toLowerCase();
          if (this.workflow.ordersSummary[state]) {
            this.workflow.ordersSummary[state] = this.workflow.ordersSummary[state] + 1;
          } else {
            this.workflow.ordersSummary[state] = 1;
          }
        }
      }
      if (this.sideBar.isVisible) {
        this.sideBar.orders = this.workflow.orders;
      }
      this.loading = true;
    }, () => {
      this.loading = true;
    });
  }

  viewOrders(workflow): void {
    this.sideBar = {
      isVisible: true,
      orders: workflow.orders
    };
  }

}
