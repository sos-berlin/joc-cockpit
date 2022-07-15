import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Subscription} from 'rxjs';

import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ConfirmationModalComponent} from '../accounts/accounts.component';
import {CoreService} from '../../../services/core.service';
import {OrderPipe, SearchPipe} from '../../../pipes/core.pipe';
import {DataService} from '../data.service';

@Component({
  selector: 'app-add-to-blocklist',
  templateUrl: './add-to-blocklist-dialog.html'
})
export class AddBlocklistModalComponent implements OnInit {
  @Input() bulkBlock: boolean;
  @Input() obj: any;
  @Input() auditlog: any;
  submitted = false;
  accountName = '';
  display: any;
  required = false;
  comments: any = {};
  comment = '';

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    } else {
      let preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
      this.display = preferences.auditLog;
    }
    if (this.obj && this.obj.accountName) {
      this.accountName = this.obj.accountName;
    }
    // if (this.dataService.comments && this.dataService.comments.comment) {
    //   this.comments = this.dataService.comments;
    //   this.display = false;
    // }
  }

  onSubmit(): void {
    this.submitted = true;
    const request: any = {
      accountName: this.accountName,
      comment: this.comment,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    // if (this.comments.isChecked) {
    //   this.dataService.comments = this.comments;
    // }
    this.coreService.post('iam/blockedAccount/store', request).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => {
        this.submitted = false;
      }
    });
  }
}

@Component({
  selector: 'app-blocklist',
  templateUrl: './blocklist.component.html'
})
export class BlocklistComponent implements OnInit {
  isLoaded = false;
  blocklist = [];
  data = [];
  searchableProperties = ['accountName', 'since', 'comment']
  preferences: any;
  blocklistFilter: any = {};
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
      } else if (res === 'ADD_TO_BLOCKLIST') {
        this.addToBlocklist();
      } else if (res != 'IS_BLOCKLIST_PROFILES_TRUE' && res != 'IS_BLOCKLIST_PROFILES_FALSE') {
        this.loadBlocklist(res);
      }
    });
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.blocklistFilter = this.coreService.getAdminTab().blocklist;
    if (this.preferences.entryPerPage) {
      this.blocklistFilter.entryPerPage = this.preferences.entryPerPage;
    }
    this.loadBlocklist();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadBlocklist(date?): void {
    if (date) {
      this.blocklistFilter.filter.date = date;
      this.isLoaded = false;
    }
    let obj: any = {};
    if (this.blocklistFilter.filter.date == 'all') {

    } else if (this.blocklistFilter.filter.date == 'today') {
      obj.dateFrom = '0d';
      obj.dateTo = '0d';
    } else {
      obj.dateFrom = this.blocklistFilter.filter.date;
    }
    this.coreService.post('iam/blockedAccounts', obj).subscribe({
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

  pageIndexChange($event): void {
    this.blocklistFilter.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.blocklist.length) {
      if (this.object.checked) {
        this.checkAll(true);
      } else {
        this.reset();
      }
    }
  }

  pageSizeChange($event): void {
    this.blocklistFilter.entryPerPage = $event;
    if (this.object.checked) {
      this.checkAll(true);
    }
  }

  searchInResult(): void {
    this.data = this.blocklistFilter.filter.searchText ? this.searchPipe.transform(this.blocklist, this.blocklistFilter.filter.searchText, this.searchableProperties) : this.blocklist;
    this.data = this.orderPipe.transform(this.data, this.blocklistFilter.filter.sortBy, this.blocklistFilter.filter.reverse);
    this.data = [...this.data];
  }

  sort(propertyName): void {
    this.blocklistFilter.filter.reverse = !this.blocklistFilter.filter.reverse;
    this.blocklistFilter.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.blocklistFilter.filter.sortBy, this.blocklistFilter.filter.reverse);
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
    if (!checked && this.object.mapOfCheckedId.size > (this.blocklistFilter.entryPerPage || this.preferences.entryPerPage)) {
      const users = this.getCurrentData(this.data, this.blocklistFilter);
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
    const users = this.getCurrentData(this.data, this.blocklistFilter);
    this.object.checked = this.object.mapOfCheckedId.size === users.length;
    this.checkCheckBoxState();
  }

  checkCheckBoxState(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    if (this.object.mapOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_BLOCKLIST_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_BLOCKLIST_PROFILES_FALSE');
    }
  }

  addToBlocklist(): void {
    this.modal.create({
      nzTitle: undefined,
      nzAutofocus: null,
      nzContent: AddBlocklistModalComponent,
      nzComponentParams: {
        bulkBlock: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.loadBlocklist();
      }
    });
  }

  removeBlocks(acc) {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Blocklist',
        operation: 'Delete',
        name: acc ? acc.accountName : ''
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
          account: acc,
          blocklist: true
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
