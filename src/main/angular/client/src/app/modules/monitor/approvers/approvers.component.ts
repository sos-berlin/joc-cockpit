import {Component, inject, Input} from '@angular/core';
import {CoreService} from "../../../services/core.service";
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {DataService} from "../../../services/data.service";
import {AuthService} from "../../../components/guard";
import {OrderPipe, SearchPipe} from "../../../pipes/core.pipe";
import {ApprovalModalComponent} from "../../../components/approval-modal/approval-modal.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-add-approver-dialog',
  templateUrl: './add-approver-dialog.html',
})
export class AddApproverModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  submitted = false;
  edit: false;
  approversData = {
    accountName: '',
    firstName: '',
    lastName: '',
    email: ''
  };
  constructor(public activeModal: NzModalRef, public coreService: CoreService, public authService: AuthService) {
  }


  ngOnInit(): void {
    this.edit = this.modalData.edit
    if(this.edit){
      this.approversData = this.modalData.approversData
    }
  }
  onSubmit(): void {
      this.submitted = true
      const obj = {
          accountName: this.approversData.accountName,
          firstName: this.approversData.firstName,
          lastName: this.approversData.lastName,
          email: this.approversData.email,
      }
      this.coreService.post('approval/approver/store', obj).subscribe({
        next: () => {
          this.submitted = false
          this.activeModal.close(true)
        }, error: () => this.submitted = false
      });
  }
}
@Component({
  selector: 'app-approvers',
  templateUrl: './approvers.component.html',
  styleUrl: './approvers.component.scss'
})
export class ApproversComponent {
  @Input() preferences: any = {};
  @Input() filters: any = {};
  @Input() schedulerIds: any = {};
  @Input() permission: any = {};
  isLoaded = false;
  approversData :any;
  data: any;
  totalApprovers = 0;
  searchableProperties = ['accountName', 'firstName', 'LastName', 'email'];
  object = {
    checked: false,
    indeterminate: false
  };
  constructor(public coreService: CoreService,
              private modal: NzModalService,private dataService: DataService,  public authService: AuthService, private orderPipe: OrderPipe, private searchPipe: SearchPipe,) {

  }

  ngOnInit(): void {
    if (this.filters.mapOfCheckedId) {
      if (this.filters.mapOfCheckedId instanceof Set) {
        this.filters.mapOfCheckedId.clear();
      } else {
        this.filters.mapOfCheckedId = new Set();
      }
    }
    this.fetchApprovers()
  }

  fetchApprovers(): void{
    this.isLoaded = false;
    const obj: any = {};

    this.coreService.post('approval/approvers', obj).subscribe({
      next: (res) => {
        this.isLoaded = true;
        res.approvers = this.orderPipe.transform(res.approvers, this.filters.filter.sortBy, this.filters.filter.reverse);
        this.approversData = res.approvers
        this.searchInResult();
      }, error: () => {
        this.isLoaded = true;
      }
    });
  }

  pageIndexChange($event: number): void {
    this.filters.filter.currentPage = $event;
    if (this.filters.mapOfCheckedId.size !== this.totalApprovers) {
      this.resetCheckBox();
    }
  }

  pageSizeChange($event: number): void {
    this.filters.filter.entryPerPage = $event;
    if (this.filters.mapOfCheckedId.size !== this.totalApprovers) {
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
    if (value && this.approversData.length > 0) {
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


  searchInResult(): void {
    this.data = this.filters.filter.searchText ? this.searchPipe.transform(this.approversData, this.filters.filter.searchText, this.searchableProperties) : this.approversData;
    this.data = [...this.data];
    if (this.approversData.length === 0) {
      this.filters.filter.currentPage = 1;
    }
    this.totalApprovers = 0;
    this.data.forEach((item) => {
      ++this.totalApprovers;
    });
  }

  edit(data: any): void {
    const obj = {
      accountName: data.accountName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    }
    const modal = this.modal.create({
      nzContent: AddApproverModalComponent,
      nzClassName: 'lg',
      nzData: {
        approversData: obj,
        edit: true
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.fetchApprovers()
      }
    });
  }

  delete(account):void {
    const obj: any = {
      accountName: account
    };

    this.coreService.post('approval/approver/delete', obj).subscribe({
      next: (res) => {
        this.isLoaded = true;
      this.fetchApprovers()
      }, error: () => {
        this.isLoaded = true;
      }
    });
  }

  sortByDrop(event: CdkDragDrop<string[]>, subagents: any[]): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(subagents, event.previousIndex, event.currentIndex);

      for (let i = 0; i < subagents.length; i++) {
        subagents[i].ordering = i + 1;
      }

      const orderedAccountNames = subagents.map(agent => agent.accountName);

      this.coreService.post('approval/approvers/ordering', {
        accountNames: orderedAccountNames
      }).subscribe();
    }
  }

}
