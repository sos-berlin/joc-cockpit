import {Component, Input} from '@angular/core';
import {CoreService} from "../../../services/core.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {AuthService} from "../../../components/guard";
import {OrderPipe, SearchPipe} from "../../../pipes/core.pipe";
import {Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {ApprovalModalComponent} from "../../../components/approval-modal/approval-modal.component";

@Component({
  selector: 'app-approval-request',
  templateUrl: './approval-request.component.html',
  styleUrl: './approval-request.component.scss'
})
export class ApprovalRequestComponent {
  @Input() preferences: any = {};
  @Input() filters: any = {};
  @Input() schedulerIds: any = {};
  @Input() permission: any = {};
  data: any;
  approvalData: any
  isLoaded = false;
  totalApprovalRequests = 0;
  isApprover: any = false
  isRequestor: any = false
  searchableProperties = ['modified', 'title', 'approver', 'approverState', 'requestor', 'requestorState', 'requestUrl', 'reason'];
  object = {
    checked: false,
    indeterminate: false
  };
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService,
              private modal: NzModalService, private dataService: DataService, public authService: AuthService, private orderPipe: OrderPipe, private searchPipe: SearchPipe,) {
    this.subscription1 = dataService.functionAnnounced$.subscribe((res: any) => {

      if (res) {
        if (res?.filter?.requestorStates) {
          this.fetchRequests(res?.filter)
        } else if (res?.filter?.approverStates) {
          this.fetchRequests(res?.filter)
        }
      }
    });
    this.subscription2 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit(): void {
    if (this.filters.mapOfCheckedId) {
      if (this.filters.mapOfCheckedId instanceof Set) {
        this.filters.mapOfCheckedId.clear();
      } else {
        this.filters.mapOfCheckedId = new Set();
      }
    }
    this.isApprover = JSON.parse(sessionStorage.getItem('isApprover'))
    this.isRequestor = JSON.parse(sessionStorage.getItem('isApprovalRequestor'))
    this.fetchRequests()
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  fetchRequests(category?): void {
    this.isLoaded = false;
    const obj: any = {};

    if (category) {
      if (category.approverStates) obj.approverStates = category.approverStates;
      if (category.requestorStates) obj.requestorStates = category.requestorStates;
    }

    if (!this.filters.current && this.isApprover) {
      obj.approvers = [this.authService.currentUserData];
    }

    this.coreService.post('approval/requests', obj).subscribe({
      next: (res) => {
        this.isLoaded = true;
        res.requests = this.orderPipe.transform(res.requests, this.filters.filter.sortBy, this.filters.filter.reverse);
        this.approvalData = res.requests;
        this.searchInResult();
      },
      error: () => {
        this.isLoaded = true;
      }
    });

  }

  pageIndexChange($event: number): void {
    this.filters.filter.currentPage = $event;
    if (this.filters.mapOfCheckedId.size !== this.totalApprovalRequests) {
      this.resetCheckBox();
    }
  }

  pageSizeChange($event: number): void {
    this.filters.filter.entryPerPage = $event;
    if (this.filters.mapOfCheckedId.size !== this.totalApprovalRequests) {
      if (this.object.checked) {
        this.checkAll(true);
      }
    }
  }

  resetCheckBox(): void {
    this.filters.mapOfCheckedId.clear();
    this.object = {
      checked: false,
      indeterminate: false
    };
  }

  checkAll(value: boolean): void {
    if (value && this.approvalData.length > 0) {
      const approvals = this.getCurrentData(this.data, this.filters);
      approvals.forEach(item => {
        this.filters.mapOfCheckedId.add(item.id);
      });
    } else {
      this.filters.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.filter.currentPage - 1)), (entryPerPage * filter.filter.currentPage));
  }

  refreshCheckedStatus(): void {
    this.object.indeterminate = this.filters.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.filter.reverse);
    this.resetCheckBox();
  }

  selectAll(): void {
    this.data.forEach(item => {
      this.filters.mapOfCheckedId.add(item.id);
    });
  }

  onItemChecked(item: any, checked: boolean): void {
    let approvals;
    if (!checked && this.filters.mapOfCheckedId.size > (this.filters.filter.entryPerPage || this.preferences.entryPerPage)) {
      approvals = this.getCurrentData(this.data, this.filters);
      if (approvals.length < this.data.length) {
        this.filters.mapOfCheckedId.clear();
        approvals.forEach(approve => {
          this.filters.mapOfCheckedId.add(approve.id);
        });
      }
    }
    if (checked) {
      this.filters.mapOfCheckedId.add(item.id);
    } else {
      this.filters.mapOfCheckedId.delete(item.id);
    }
    if (!approvals) {
      approvals = this.getCurrentData(this.data, this.filters);
    }
    this.object.checked = this.filters.mapOfCheckedId.size === approvals.length;
    this.refreshCheckedStatus();
  }

  expandDetails(): void {
    const approvals = this.getCurrentData(this.data, this.filters);
    approvals.forEach((value) => {
      value.show = true;
    });
  }

  collapseDetails(): void {
    const approvals = this.getCurrentData(this.data, this.filters);
    approvals.forEach((value) => {
      value.show = false;
    });
  }

  searchInResult(): void {
    this.data = this.filters.filter.searchText ? this.searchPipe.transform(this.approvalData, this.filters.filter.searchText, this.searchableProperties) : this.approvalData;
    this.data = [...this.data];
    if (this.approvalData.length === 0) {
      this.filters.filter.currentPage = 1;
    }
    this.totalApprovalRequests = 0;
    this.data.forEach((item) => {
      ++this.totalApprovalRequests;
    });
  }

  approve(id: number): void {
    this.updateApproval(id, 'approve');
  }

  reject(id: number): void {
    this.updateApproval(id, 'reject');
  }

  withdraw(id: number): void {
    this.updateApproval(id, 'withdraw');
  }

  edit(data: any): void {
    const obj = {
      id: data.id,
      title: data.title,
      approver: data.approver,
      reason: data.reason
    }
    const modal = this.modal.create({
      nzContent: ApprovalModalComponent,
      nzClassName: 'lg',
      nzData: {
        approvalData: obj,
        edit: true
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  private updateApproval(id: number, action: 'approve' | 'reject' | 'withdraw'): void {
    this.isLoaded = false;
    const payload = {id};
    this.coreService.post(`approval/${action}`, payload).subscribe({
      next: () => {
        this.isLoaded = true;
      },
      error: () => {
        this.isLoaded = true;
      }
    });
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].objectType === 'APPROVAL') {
          this.fetchRequests();
          break;
        }
      }
    }
  }
}
