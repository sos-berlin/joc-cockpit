import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {DataService} from '../data.service';
import {OrderPipe, SearchPipe} from 'src/app/pipes/core.pipe';
import {AuthService} from 'src/app/components/guard';
import {CoreService} from 'src/app/services/core.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ConfirmationModalComponent} from '../accounts/accounts.component';

@Component({
  selector: 'app-pending-requests',
  templateUrl: './pending-requests.component.html',
  styleUrls: ['./pending-requests.component.scss']
})
export class PendingRequestsComponent implements OnInit {
  requests: any = {};
  preferences: any = {};
  data: any = [];
  permission: any = {};
  loading = true;
  pendingRequests: any = [];
  identityServiceType = '';
  searchKey = '';
  identityServiceName = '';
  searchableProperties = ['accountName', 'email', 'origin'];
  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Map()
  };

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, private modal: NzModalService, private coreService: CoreService,
              private dataService: DataService, private searchPipe: SearchPipe, private orderPipe: OrderPipe) {
    this.subscription1 = this.dataService.searchKeyAnnounced$.subscribe(res => {
      this.searchKey = res;
      this.searchInResult();
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'APPROVE_REQUEST') {
        this.approveList();
      }
      if (res === 'REJECT_REQUEST') {
        this.rejectList();
      }
      if (res === 'DELETE_REQUEST') {
        this.deleteList();
      }
    });
  }

  ngOnInit(): void {
    this.requests = {currentPage: 1, sortBy: 'name', reverse: false};
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.identityServiceName = sessionStorage['identityServiceName'];
    this.identityServiceType = sessionStorage['identityServiceType'];
    this.getList();
  }

  private getList(): void {
    this.coreService.post('iam/fidoregistrations', {identityServiceName: this.identityServiceName}).subscribe((res: any) => {
      this.pendingRequests = res.fidoRegistrationItems;
      this.loading = false;
      this.searchInResult();
    })
  }

  private reset(): void {
    this.object = {
      mapOfCheckedId: new Map(),
      checked: false,
      indeterminate: false
    };
    this.dataService.announceFunction('IS_PENDING_REQUEST_FALSE');
  }

  searchInResult(): void {
    this.data = this.searchKey ? this.searchPipe.transform(this.pendingRequests, this.searchKey, this.searchableProperties) : this.pendingRequests;
    this.data = this.orderPipe.transform(this.data, this.requests.sortBy, this.requests.reverse);
    this.data = [...this.data];
  }

  pageIndexChange($event: number): void {
    this.requests.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      } else {
        this.reset();
      }
    }
  }

  pageSizeChange($event: any): void {
    this.requests.entryPerPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      }
    }
  }

  sort(key: string): void {
    this.requests.reverse = !this.requests.reverse;
    this.requests.sortBy = key;
    this.data = this.orderPipe.transform(this.data, this.requests.sortBy, this.requests.reverse);
    this.reset();
  }

  private getCurrentData(list: any[], filter: any): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  checkAll(value: boolean): void {
    if (value && this.pendingRequests.length > 0) {
      const users = this.getCurrentData(this.data, this.requests);
      users.forEach(item => {
        this.object.mapOfCheckedId.set(item.accountName, item);

      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.checkCheckBoxState();
  }

  checkCheckBoxState(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    if (this.object.mapOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_PENDING_REQUEST_TRUE');
    } else {
      this.dataService.announceFunction('IS_PENDING_REQUEST_FALSE');
    }
  }


  onItemChecked(account: any, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.requests.entryPerPage || this.preferences.entryPerPage)) {
      const users = this.getCurrentData(this.data, this.requests);
      if (users.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        users.forEach(item => {
          this.object.mapOfCheckedId.set(item.accountName, item);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.set(account.accountName, account);
    } else {
      this.object.mapOfCheckedId.delete(account.accountName);
    }
    const users = this.getCurrentData(this.data, this.requests);
    this.object.checked = this.object.mapOfCheckedId.size === users.length;
    this.checkCheckBoxState();
  }

  deleteList(account?: any): void {
    this.openConfirmation('DELETE', account);
  }

  rejectList(account?: any) {
    this.openConfirmation('REJECT', account);
  }

  approveList(account?: any) {
    this.openConfirmation('APPROVE', account);
  }

  private openConfirmation(type: string, account?: any): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzComponentParams: {
        approve: type === 'APPROVE',
        reject: type === 'REJECT',
        deleteRequest: type === 'DELETE',
        account,
        accounts: this.object.mapOfCheckedId,
        identityServiceName: this.identityServiceName
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.getList();
        this.reset();
      }
    });
  }
}
