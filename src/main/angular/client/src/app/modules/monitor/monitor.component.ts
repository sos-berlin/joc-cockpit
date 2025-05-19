import {Component, ChangeDetectorRef } from '@angular/core';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {CoreService} from '../../services/core.service';
import {ApprovalModalComponent} from "../../components/approval-modal/approval-modal.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {AddApproverModalComponent} from "./approvers/approvers.component";

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html'
})
export class MonitorComponent {
  monitor: Array<any> = [];
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  monitorFilters: any = {};
  loading = false;
  index: number;
  subscription: any;
  tabChangeListener: any;
  isApprover: any = false;
  isRequestor: any = false;

  constructor(private authService: AuthService, public coreService: CoreService,
              private dataService: DataService, private cdr: ChangeDetectorRef, private modal: NzModalService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.loading = false;
      this.init();
      setTimeout(() => {
        this.loading = true;
      }, 10);
    });
  }

  ngOnInit(): void {
    this.init();
    this.loading = true;
    this.tabChangeListener = (event: CustomEvent) => {
      this.index = event.detail;
      this.cdr.detectChanges();
    };
    window.addEventListener('change-tab', this.tabChangeListener);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    window.removeEventListener('change-tab', this.tabChangeListener);
  }

  private init(): void {
    this.isApprover = JSON.parse(sessionStorage.getItem('isApprover'))
    this.isRequestor = JSON.parse(sessionStorage.getItem('isApprovalRequestor'))
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.monitorFilters = this.coreService.getMonitorTab();
    if (!this.monitorFilters.orderNotification.mapOfCheckedId) {
      this.monitorFilters.orderNotification.mapOfCheckedId = new Set();
    }
    if (!this.monitorFilters.systemNotification.mapOfCheckedId) {
      this.monitorFilters.systemNotification.mapOfCheckedId = new Set();
    }
    if (!this.monitorFilters.approvalRequests.mapOfCheckedId) {
      this.monitorFilters.approvalRequests.mapOfCheckedId = new Set();
    }
    if (!this.monitorFilters.approvers.mapOfCheckedId) {
      this.monitorFilters.approvers.mapOfCheckedId = new Set();
    }
    if (!(this.monitorFilters.controller.current || this.monitorFilters.controller.current === false)) {
      this.monitorFilters.controller.current = this.preferences.currentController;
    }
    if (!(this.monitorFilters.agent.current || this.monitorFilters.agent.current === false)) {
      this.monitorFilters.agent.current = this.preferences.currentController;
    }
    if (!(this.monitorFilters.orderNotification.current || this.monitorFilters.orderNotification.current === false)) {
      this.monitorFilters.orderNotification.current = this.preferences.currentController;
    }
    this.index = this.monitorFilters.tabIndex;
  }

  tabChange($event): void {
    this.monitorFilters.tabIndex = $event.index;
  }

  changeDate(date): void {
    if (this.monitorFilters.tabIndex == 2) {
      this.monitorFilters.orderNotification.filter.date = date;
      this.dataService.announceFunction(this.monitorFilters.orderNotification);
    } else {
      this.monitorFilters.systemNotification.filter.date = date;
      this.dataService.announceFunction(this.monitorFilters.systemNotification);
    }
  }

  controllerChange(): void {
    this.dataService.announceFunction(this.monitorFilters[this.index === 0 ? 'controller' : this.index === 1 ? 'agent' : 'notification']);
  }

  changeTypes(type): void {
    const index = this.monitorFilters.orderNotification.filter.types.indexOf(type);
    if (index === -1) {
      this.monitorFilters.orderNotification.filter.types.push(type);
    } else {
      this.monitorFilters.orderNotification.filter.types.splice(index, 1);
    }
    this.dataService.announceFunction(this.monitorFilters.orderNotification);
  }

  changeCategories(category): void {
    this.monitorFilters.systemNotification.filter.categories = category;
    this.dataService.announceFunction(this.monitorFilters.systemNotification);
  }

  changeApprover(status): void {
    if (!Array.isArray(this.monitorFilters.approvalRequests.filter.approverStates)) {
      this.monitorFilters.approvalRequests.filter.approverStates = [];
    }
    const index = this.monitorFilters.approvalRequests.filter.approverStates.indexOf(status);
    if (index === -1) {
      this.monitorFilters.approvalRequests.filter.approverStates.push(status);
    } else {
      this.monitorFilters.approvalRequests.filter.approverStates.splice(index, 1);
    }
    this.dataService.announceFunction(this.monitorFilters.approvalRequests);
  }

  changeRequestors(status): void {
    if (!Array.isArray(this.monitorFilters.approvalRequests.filter.requestorStates)) {
      this.monitorFilters.approvalRequests.filter.requestorStates = [];
    }
    const index = this.monitorFilters.approvalRequests.filter.requestorStates.indexOf(status);
    if (index === -1) {
      this.monitorFilters.approvalRequests.filter.requestorStates.push(status);
    } else {
      this.monitorFilters.approvalRequests.filter.requestorStates.splice(index, 1);
    }
    this.dataService.announceFunction(this.monitorFilters.approvalRequests);
  }

  changeSystemType(type): void {
    const index = this.monitorFilters.systemNotification.filter.types.indexOf(type);
    if (index === -1) {
      this.monitorFilters.systemNotification.filter.types.push(type);
    } else {
      this.monitorFilters.systemNotification.filter.types.splice(index, 1);
    }
    this.dataService.announceFunction(this.monitorFilters.systemNotification);
  }

  acknowledge(): void {
    this.dataService.announceFunction('ACKNOWLEDGE');
  }

  exportToExcel() {
    this.dataService.announceFunction('EXPORT');
  }

  newApprover():void{
    const modal = this.modal.create({
      nzContent: AddApproverModalComponent,
      nzClassName: 'lg',
      nzData: {
        edit: false
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}
