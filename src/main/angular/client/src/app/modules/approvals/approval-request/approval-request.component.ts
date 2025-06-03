import {Component, Input} from '@angular/core';
import {CoreService} from "../../../services/core.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {AuthService} from "../../../components/guard";
import {OrderPipe, SearchPipe} from "../../../pipes/core.pipe";
import {Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {ApprovalModalComponent} from "../../../components/approval-modal/approval-modal.component";
import {HttpHeaders} from "@angular/common/http";
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";

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
  approversList: any
  isLoaded = false;
  totalApprovalRequests = 0;
  isApprover: any = false
  isRequestor: any = false
  searchableProperties = ['requestorStateDate','approverStateDate', 'title', 'approver', 'approverState', 'requestor', 'requestorState', 'requestUrl', 'reason'];
  object = {
    checked: false,
    indeterminate: false
  };
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService,
              private modal: NzModalService, private dataService: DataService, public authService: AuthService, private orderPipe: OrderPipe, private searchPipe: SearchPipe,) {
    this.subscription1 = dataService.functionAnnounced$.subscribe((res: any) => {
      setTimeout(() =>{
        if (res) {
          if (res?.filter?.requestorStates) {
            this.fetchRequests(res?.filter)
          } else if (res?.filter?.approverStates) {
            this.fetchRequests(res?.filter)
          }

          const arrayOfCheckedId = Array.from(this.filters.mapOfCheckedId);
          if (res === 'approve' || res === 'reject' || res === 'withdraw') {
            const filteredIds = this.getBulkActionableIds(res);
            this.BulkUpdateApproval(filteredIds, res);
          }
        }
      },100)
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
    this.filters.filter = this.filters.filter || {};
    this.filters.filter.sortBy  = 'requestorStateDate';
    this.filters.filter.reverse = true;
    this.fetchRequests()
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  fetchRequests(category?): void {
    this.isLoaded = false;
    const obj: any = {};

    if (category || this.filters?.filter) {
      if (category?.approverStates || this.filters?.filter.approverStates) obj.approverStates = category?.approverStates || this.filters?.filter.approverStates;
      if (category?.requestorStates || this.filters?.filter.requestorStates) obj.requestorStates = category?.requestorStates || this.filters?.filter.requestorStates;
    }

    if (!this.filters.current && this.isApprover) {
      obj.approvers = [this.authService.currentUserData];
    }

    this.coreService.post('approval/requests', obj).subscribe({
      next: (res) => {
        this.isLoaded = true;
        const requests = res.requests;
        const approvers = res.approvers;

        requests.forEach(r => {
          const user = approvers.find(a => a.accountName === r.approver);
          r.approverFullName = user
            ? `${user.firstName} ${user.lastName}`
            : r.approver;
        });

        // then sort & assign
        this.approvalData = this.orderPipe.transform(
          requests,
          this.filters.filter.sortBy,
          this.filters.filter.reverse
        );
        this.approversList = approvers;
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

  execute(data): void {
    this.isLoaded = false
    const url = data.requestUrl.replace(/^\.\//, '');
    const formData = {};
    const headers = new HttpHeaders({
      'X-Approval-Request-Id': data.id,
      'Content-Type': 'application/json'
    });
    this.coreService.log(url, formData, {headers}).subscribe({
      next: () => {
       this.fetchRequests()
        this.isLoaded = true;
      },
      error: () => {
        this.isLoaded = true;
      }
    });
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
        approvers: this.approversList,
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
    let payload: any;
    if (this.preferences.auditLog) {
     let comments: any = {
        radio: 'predefined',
        type: 'Request',
        operation: action,
        name: action
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        payload = {
          id: id,
          auditLog: {}
        }
        if (result) {
          payload.auditLog = {
            comment: comments.comment,
            ticketLink: comments.ticketLink,
            timeSpent: comments.timeSpent,
          };
          this.coreService.post(`approval/${action}`, payload).subscribe({
            next: () => {
              this.isLoaded = true;
            },
            error: () => {
              this.isLoaded = true;
            }
          });
        }
      });
    }else{
      payload = {id}
      this.coreService.post(`approval/${action}`, payload).subscribe({
        next: () => {
          this.isLoaded = true;
        },
        error: () => {
          this.isLoaded = true;
        }
      });
    }
  }


  private BulkUpdateApproval(ids: any, action: 'approve' | 'reject' | 'withdraw'): void {
    this.isLoaded = false;
    let payload: any;
    if(ids.length > 0){
      if (this.preferences.auditLog) {
        let comments: any = {
          radio: 'predefined',
          type: 'Request',
          operation: action,
          name: action
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzAutofocus: null,
          nzData: {
            comments,
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          payload = {
            ids: ids,
            auditLog: {}
          }
          if (result) {
            payload.auditLog = {
              comment: comments.comment,
              ticketLink: comments.ticketLink,
              timeSpent: comments.timeSpent,
            };
            this.coreService.post(`approvals/${action}`, payload).subscribe({
              next: () => {
                this.isLoaded = true;
                this.filters.mapOfCheckedId.clear();
                this.refreshCheckedStatus()
              },
              error: () => {
                this.isLoaded = true;
              }
            });
          }
        });
      }else{
        payload = {ids:ids};
        this.coreService.post(`approvals/${action}`, payload).subscribe({
          next: () => {
            this.isLoaded = true;
            this.filters.mapOfCheckedId.clear();
            this.refreshCheckedStatus()
          },
          error: () => {
            this.isLoaded = true;
          }
        });
      }
    }else{
      this.isLoaded = true;
      this.filters.mapOfCheckedId.clear();
      this.refreshCheckedStatus()
    }

  }

  private getBulkActionableIds(action: 'approve' | 'reject' | 'withdraw'): any[] {

    const checkedIds = Array.from(this.filters.mapOfCheckedId);

    return checkedIds.filter(id => {
      const req = this.data.find(item => item.id === id);
      if (!req) return false;
      if (action === 'approve' || action === 'reject') {
        return req.approverState === 'PENDING';
      }
      if (action === 'withdraw') {
        return req.requestorState === 'REQUESTED';
      }
      return false;
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
