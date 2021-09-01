import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NzModalService} from 'ng-zorro-antd/modal';
import {isEmpty, sortBy} from 'underscore';
import {forkJoin, of, Subscription} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {WorkflowService} from '../../../services/workflow.service';
import {AddOrderModalComponent, ShowDependencyComponent} from '../workflow-action/workflow-action.component';
import {DataService} from '../../../services/data.service';
import {DependentWorkflowComponent} from '../workflow-graphical/workflow-graphical.component';

declare const $;

@Component({
  selector: 'app-workflow-detail',
  templateUrl: './workflow-detail.component.html',
  styles: [`.left-sidebar {
    height: calc(100vh - 260px);
    width: 180px;
    position: fixed;
    z-index: 10099;
    top: 130px;
    left: 0;
    right: auto !important;
    overflow-x: hidden;
    transition: 0.3s;
    background: var(--bg-box);
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.15);
  }`]
})
export class WorkflowDetailComponent implements OnInit, OnDestroy {
  path: string;
  versionId: string;
  workFlowJson: any = {};
  recursiveCals: any = [];
  orderPreparation: any = {};
  loading: boolean;
  isLoading: boolean;
  isAllLoaded: boolean;
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
  workflowObjects = new Map();

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
    this.modal.closeAll();
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

  @HostListener('window:scroll', ['$event'])
  scrollHandler(): void {
    this.showAndHideBtn();
  }

  private showAndHideBtn(): void {
    if (window.scrollY > 50) {
      $('.scrollBottom-btn').hide();
      $('.scrolltop-btn').show();
    } else {
      $('.scrollBottom-btn').show();
      $('.scrolltop-btn').hide();
    }
  }

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
    if ($event === 'graph') {
      this.isAllLoaded = false;
      if (!this.isLoading) {
        this.recursivelyUpdateWorkflow(this.workFlowJson);
      }
    }
  }

  openWorkflowDependency(obj): void {
    obj.modalInstance.destroy();
    this.modal.create({
      nzTitle: undefined,
      nzContent: DependentWorkflowComponent,
      nzClassName: 'x-lg',
      nzComponentParams: {
        workflow: obj.workflow,
        permission: this.permission,
        preferences: this.preferences,
        controllerId: this.schedulerIds.selected,
        recursiveCals: this.recursiveCals,
        workflowFilters: this.workflowFilters
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  private callAPI(APIs, cb): void {
    if (APIs.length) {
      forkJoin(APIs).subscribe((res: any) => {
        res.forEach((item: any) => {
          if (item && item.workflow && this.workflowObjects.has(item.workflow.path)) {
            item.workflow.compressData = [];
            this.workflowService.convertTryToRetry(item.workflow, null, item.workflow.jobs);
            item.workflow.expectedNoticeBoards = this.coreService.convertObjectToArray(item.workflow, 'expectedNoticeBoards');
            item.workflow.postNoticeBoards = this.coreService.convertObjectToArray(item.workflow, 'postNoticeBoards');
            this.workflowObjects.set(item.workflow.path, JSON.stringify(item.workflow));
            this.isAllLoaded = true;
            
            this.recursivelyUpdateWorkflow(item.workflow);
            if (cb) {
              cb();
            }
          }
        });
      });
    }
  }

  private recursivelyUpdateWorkflow(workflow): void {
    const self = this;
    const APIs = [];

    function addWorkflowInArrays(noticeBoards): void {
      noticeBoards.forEach((board) => {
        board.value.forEach((item) => {
          if (!self.workflowObjects.has(item.path)) {
            setTimeout(() => {
              self.isAllLoaded = false;
            }, 50);
            if (self.workflowObjects.size < 15) {
              APIs.push(self.coreService.post('workflow/dependencies', {
                controllerId: self.schedulerIds.selected,
                workflowId: {
                  path: item.path,
                  version: item.versionId
                }
              }).pipe(
                catchError(error => of(error))
              ));
              self.workflowObjects.set(item.path, '');
            }
          }
        });
      });
    }

    if (workflow.expectedNoticeBoards.length > 0) {
      addWorkflowInArrays(workflow.expectedNoticeBoards);
    }
    if (workflow.postNoticeBoards.length > 0) {
      addWorkflowInArrays(workflow.postNoticeBoards);
    }

    this.callAPI(APIs, () => {
      setTimeout(() => {
        if (this.isAllLoaded) {
          this.isLoading = true;
          
        }
      }, 1000);
    });
  }

  showDependency(workflow): void {
    this.coreService.post('workflow/dependencies', {
      controllerId: this.schedulerIds.selected,
      workflowId: {
        path: workflow.path,
        version: workflow.versionId
      }
    }).subscribe((res) => {
      if (!workflow.instructions) {
        workflow.instructions = res.workflow.instructions;
        workflow.jobs = res.workflow.jobs;
        this.workflowService.convertTryToRetry(workflow, null, res.workflow.jobs);
      }
      workflow.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
      workflow.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
      this.workflowObjects.set(workflow.path, JSON.stringify(workflow));
      this.getOrders(workflow);
    });
  }

  openModal(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowDependencyComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        workflow: this.workFlowJson
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
      this.showAndHideBtn();
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
