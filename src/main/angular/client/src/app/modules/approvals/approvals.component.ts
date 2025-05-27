import {Component, ViewChild} from '@angular/core';
import {AuthService} from "../../components/guard";
import {CoreService} from "../../services/core.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {DataService} from "../../services/data.service";
import {AddApproverModalComponent, ApproversComponent} from "./approvers/approvers.component";

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html'
})
export class ApprovalsComponent {
  permission: any = {};
  preferences: any = {};
  data: any = [];
  isLoading = false;
  approvalsFilters: any;
  isApprover: any = false;
  isRequestor: any = false;
  @ViewChild('approvers') approversComponent: ApproversComponent;

  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService,private dataService: DataService,) {
    this.permission = JSON.parse(this.authService.permission,) || {};
  }

  ngOnInit() {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.approvalsFilters = this.coreService.getApprovalsTab();
    if (!this.approvalsFilters.approvalRequests.mapOfCheckedId) {
      this.approvalsFilters.approvalRequests.mapOfCheckedId = new Set();
    }
    if (!this.approvalsFilters.approvers.mapOfCheckedId) {
      this.approvalsFilters.approvers.mapOfCheckedId = new Set();
    }
    this.isApprover = JSON.parse(sessionStorage.getItem('isApprover'))
    this.isRequestor = JSON.parse(sessionStorage.getItem('isApprovalRequestor'))
  }

  onTabChange(index: number): void {
    if (this.approvalsFilters.tabIndex !== index) {
      this.approvalsFilters.tabIndex = index;
    }
  }

  requestChange(): void {
    this.dataService.announceFunction(this.approvalsFilters['approvalRequests']);
  }

  changeRequestors(status): void {
    if (!Array.isArray(this.approvalsFilters.approvalRequests.filter.requestorStates)) {
      this.approvalsFilters.approvalRequests.filter.requestorStates = [];
    }
    const index = this.approvalsFilters.approvalRequests.filter.requestorStates.indexOf(status);
    if (index === -1) {
      this.approvalsFilters.approvalRequests.filter.requestorStates.push(status);
    } else {
      this.approvalsFilters.approvalRequests.filter.requestorStates.splice(index, 1);
    }
    this.dataService.announceFunction(this.approvalsFilters.approvalRequests);
  }

  changeApprover(status): void {
    if (!Array.isArray(this.approvalsFilters.approvalRequests.filter.approverStates)) {
      this.approvalsFilters.approvalRequests.filter.approverStates = [];
    }
    const index = this.approvalsFilters.approvalRequests.filter.approverStates.indexOf(status);
    if (index === -1) {
      this.approvalsFilters.approvalRequests.filter.approverStates.push(status);
    } else {
      this.approvalsFilters.approvalRequests.filter.approverStates.splice(index, 1);
    }
    this.dataService.announceFunction(this.approvalsFilters.approvalRequests);
  }

  updateRequest(action):void{
    this.dataService.announceFunction(action);
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
    modal.afterClose.subscribe(result => {
      if (result && this.approversComponent) {
        this.approversComponent.fetchApprovers();
      }
    });
  }
}
