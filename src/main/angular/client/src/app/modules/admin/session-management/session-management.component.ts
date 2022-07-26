import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzModalService} from 'ng-zorro-antd/modal';
import {DataService} from '../data.service';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ConfirmationModalComponent} from '../accounts/accounts.component';
import {CoreService} from "../../../services/core.service";
import {OrderPipe, SearchPipe} from "../../../pipes/core.pipe";
import {AddBlocklistModalComponent} from '../blocklist/blocklist.component';


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
    this.data.forEach((item) => {
      item.remainingSessionTimeout = this.convertMsToTime(item.timeout);
     
    })
  }

  private convertMsToTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    const s = Math.floor((seconds) % 60);
    const m = Math.floor((seconds / (60)) % 60);
    const h = Math.floor((seconds / (60 * 60)) % 24);
    const d = Math.floor(seconds / (60 * 60 * 24));

    const x = m > 9 ? m : '0' + m;
    const y = s > 9 ? s : '0' + s;

    if (d === 0 && h !== 0) {
      return h + 'h ' + x + 'm ' + y + 's';
    } else if (d === 0 && h === 0 && m !== 0) {
      return x + 'm ' + y + 's';
    } else if (d === 0 && h === 0 && m === 0) {
      return s + 's';
    } else {
      return d + 'd ' + h + 'h';
    }
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
        this.object.mapOfCheckedId.add(item.id);
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
          this.object.mapOfCheckedId.add(item.id);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.add(account.id);
    } else {
      this.object.mapOfCheckedId.delete(account.id);
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

  removeSessions(acc, flag?) {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Session',
        operation: 'Delete',
        name: acc ? acc.accountName : ''
      };
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
          this.removeFromSession(acc, flag, {
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
          this.removeFromSession(acc, flag);
        }
      });
    }
  }

  removeFromSession(account, flag?, object?): void {
    const obj: any = { auditLog: object };
    if (flag) {
      obj.accountNames = [account.accountName];
    } else {
      obj.ids = [];
      if (account) {
        obj.ids.push(account.id);
      } else {
        this.object.mapOfCheckedId.forEach((id) => {
          obj.ids.push(id);
        });
      }
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

  removeSessionByAccount(acc): void {
    this.removeSessions(acc, true);
  }
  
  addToBlocklist(obj): void {
    this.modal.create({
      nzTitle: undefined,
      nzAutofocus: null,
      nzContent: AddBlocklistModalComponent,
      nzComponentParams: {
        existingComments: this.dataService.comments,
        obj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.loadSession();
      }
    });
  }
}
