import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzModalService} from 'ng-zorro-antd/modal';
import {DataService} from '../data.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ConfirmationModalComponent} from '../accounts/accounts.component';
import {CoreService} from "../../../services/core.service";
import {OrderPipe, SearchPipe} from "../../../pipes/core.pipe";


@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html'
})
export class SessionManagementComponent implements OnInit, OnDestroy {
  @Input() permission: any = {};
  preferences: any;
  sessionFilter: any = {};
  isLoaded = false;
  data = [];
  sessions = [];
  searchableProperties = ['accountName', 'identityService']
  object = {
    mapOfCheckedId: new Set(),
    checked: false,
    indeterminate: false
  };

  subscription: Subscription;

  constructor(private coreService: CoreService, private orderPipe: OrderPipe,
              private searchPipe: SearchPipe, private dataService: DataService, private modal: NzModalService) {
    this.subscription = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'DELETE_BULK_ACTIVE_SESSION') {
        this.removeSessions(null);
      }
    });
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.sessionFilter = this.coreService.getAdminTab().sessionManagement;
    if (this.preferences.entryPerPage) {
      this.sessionFilter.entryPerPage = this.preferences.entryPerPage;
    }
    this.loadSession();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.sessionFilter.filter.searchText ? this.searchPipe.transform(this.sessions, this.sessionFilter.filter.searchText, this.searchableProperties) : this.sessions;
    this.data = this.orderPipe.transform(this.data, this.sessionFilter.filter.sortBy, this.sessionFilter.filter.reverse);
    this.data = [...this.data];
  }

  pageIndexChange($event): void {
    this.sessionFilter.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.sessions.length) {
      if (this.object.checked) {
        this.checkAll(true);
      } else {
        this.reset();
      }
    }
  }

  pageSizeChange($event): void {
    this.sessionFilter.entryPerPage = $event;
    if (this.object.checked) {
      this.checkAll(true);
    }
  }

  reset(): void {
    this.object = {
      mapOfCheckedId: new Set(),
      indeterminate: false,
      checked: false
    };
    this.dataService.announceFunction('IS_SESSION_MANAGEMENT_FALSE');
  }

  checkAll(value: boolean): void {
    if (value && this.sessions.length > 0) {
      this.data.forEach(item => {
        this.object.mapOfCheckedId.add(item.accountName);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.checkCheckBoxState();
  }

  sort(propertyName): void {
    this.sessionFilter.filter.reverse = !this.sessionFilter.filter.reverse;
    this.sessionFilter.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.sessionFilter.filter.sortBy, this.sessionFilter.filter.reverse);
    this.reset();
  }

  onItemChecked(account, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.sessionFilter.entryPerPage || this.preferences.entryPerPage)) {
      const users = this.getCurrentData(this.data, this.sessionFilter);
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
    const users = this.getCurrentData(this.data, this.sessionFilter);
    this.object.checked = this.object.mapOfCheckedId.size === users.length;
    this.checkCheckBoxState();
  }

  checkCheckBoxState(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
    if (this.object.mapOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_SESSION_MANAGEMENT_TRUE');
    } else {
      this.dataService.announceFunction('IS_SESSION_MANAGEMENT_FALSE');
    }
  }

  loadSession(): void {
    this.coreService.post('iam/sessions', {}).subscribe({
      next: (res: any) => {
        this.sessions = res.activeSessions;
        this.isLoaded = true;
        this.searchInResult();
      }, error: () => {
        this.isLoaded = true;
      }
    });
  }

  removeSessions(acc) {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Session',
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
          this.removeFromSession(acc, {
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
          activeSession: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.removeFromSession(acc);
        }
      });
    }
  }

  removeFromSession(account, object?): void {
    const obj = {accountNames: [], auditLog: object};
    if (account) {
      obj.accountNames.push(account.accountName);
    } else {
      this.object.mapOfCheckedId.forEach((value, key) => {
        obj.accountNames.push(key);
      });
    }
    this.coreService.post('iam/sessions/delete', obj).subscribe({
      next: () => {
        this.loadSession();
        this.reset();
      }, error: () => {
        this.reset();
      }
    });
  }
}
