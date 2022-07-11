import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { OrderPipe, SearchPipe } from 'src/app/pipes/core.pipe';
import { DataService } from '../data.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommentModalComponent } from 'src/app/components/comment-modal/comment.component';
import { Subscription } from 'rxjs';
import { ConfirmationModalComponent } from '../accounts/accounts.component';

@Component({
  selector: 'app-blocklist',
  templateUrl: './blocklist.component.html'
})
export class BlocklistComponent implements OnInit {
  isLoaded = false;
  blocklist = [];
  data = [];
  searchableProperties = ['accountName', 'since']
  preferences: any;
  identityServiceName: string;
  filter: any = {
    sortBy: 'accountName',
    reverse: false,
    searchText: '',
    entryPerPage: 25,
    currentPage: 1
  };
  object = {
    mapOfCheckedId: new Set(),
    checked: false,
    indeterminate: false
  };
  subscription: Subscription;

  constructor(private coreService: CoreService, private orderPipe: OrderPipe,
              private searchPipe: SearchPipe, private dataService: DataService, private modal: NzModalService) {

    this.subscription = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'DELETE_BULK_BLOCKS') {
        this.removeBlocks(null);
      }
    });
  }

  ngOnInit(): void {
    this.identityServiceName = sessionStorage.identityServiceName;
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    if (this.preferences.entryPerPage) {
      this.filter.entryPerPage = this.preferences.entryPerPage;
    }
    this.loadBlocklist();
  }

  loadBlocklist(): void {
    this.coreService.post('iam/blockedAccounts', {
      identityServiceName: this.identityServiceName
    }).subscribe({
      next: (res: any) => {
        this.blocklist = res.blockedAccounts;
        this.isLoaded = true;
        this.searchInResult();
      }, error: () => {
        this.data = [];
        this.isLoaded = true
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  pageIndexChange($event): void {
    this.filter.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.blocklist.length) {
      if (this.object.checked) {
        this.checkAll(true);
      } else {
        this.reset();
      }
    }
  }

  pageSizeChange($event): void {
    this.filter.entryPerPage = $event;
    if (this.object.checked) {
      this.checkAll(true);
    }
  }

  searchInResult(): void {
    this.data = this.filter.searchText ? this.searchPipe.transform(this.blocklist, this.filter.searchText, this.searchableProperties) : this.blocklist;
    this.data = this.orderPipe.transform(this.data, this.filter.sortBy, this.filter.reverse);
    this.data = [...this.data];
  }

  sort(propertyName): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.filter.sortBy, this.filter.reverse);
    this.reset();
  }

  private getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  reset(): void {
    this.object = {
      mapOfCheckedId: new Set(),
      indeterminate: false,
      checked: false
    };
  }

  checkAll(value: boolean): void {
    if (value && this.blocklist.length > 0) {
      //const users = this.getCurrentData(this.data, this.filter);
      this.data.forEach(item => {
        this.object.mapOfCheckedId.add(item.accountName);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.checkCheckBoxState();
  }

  onItemChecked(account, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.filter.entryPerPage || this.preferences.entryPerPage)) {
      const users = this.getCurrentData(this.data, this.filter);
      if (users.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        users.forEach(item => {
          this.object.mapOfCheckedId.add(item.accountName);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.add(account.accountName);
    } else {
      this.object.mapOfCheckedId.delete(account.accountName);
    }
    const users = this.getCurrentData(this.data, this.filter);
    this.object.checked = this.object.mapOfCheckedId.size === users.length;
    this.checkCheckBoxState();
  }

  checkCheckBoxState(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    if (this.object.mapOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_ACCOUNT_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_ACCOUNT_PROFILES_FALSE');
    }
  }

  removeBlocks(acc) {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Blocklist',
        operation: 'Delete',
        name: ''
      };
      this.object.mapOfCheckedId.forEach((value, key) => {
        comments.name = comments.name + key + ', ';
      });
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.removeFromBlocklist(acc, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          });
        }
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmationModalComponent,
        nzComponentParams: {
          delete: true,
          identityServiceName: this.identityServiceName
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.removeFromBlocklist(acc);
        }
      });
    }
  }

  removeFromBlocklist(account, object?): void {
    const obj = {accountNames: [], auditLog: object};
    if (account) {
      obj.accountNames.push(account.accountName);
    } else {
      this.object.mapOfCheckedId.forEach((value, key) => {
        obj.accountNames.push(key);
      });
    }
    this.coreService.post('iam/blockedAccounts/delete', obj).subscribe({
      next: () => {
        this.loadBlocklist();
        this.reset();
      }, error: () => {
        this.reset();
      }
    });
  }
}
