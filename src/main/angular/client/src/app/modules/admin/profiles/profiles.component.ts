import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ConfirmModalComponent } from '../../../components/comfirm-modal/confirm.component';
import { CoreService } from '../../../services/core.service';
import { DataService } from '../data.service';
import { AuthService } from '../../../components/guard';
import { CommentModalComponent } from '../../../components/comment-modal/comment.component';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html'
})
export class ProfilesComponent implements OnInit, OnDestroy {
  preferences: any = {};
  permission: any = {};
  profiles: any = [];
  subscription1: Subscription;
  subscription2: Subscription;
  users: any;
  searchKey: string;
  prof: any = { currentPage: 1 };
  order = 'user';
  loading = true;
  reverse = false;
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();

  constructor(private dataService: DataService, private modal: NzModalService, private coreService: CoreService,
    private router: Router, private authService: AuthService) {
    this.subscription1 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res && res.accounts) {
        this.setUserData(res);
      }
    });

    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'RESET_PROFILES') {
        this.resetMainProfile();
      }
    });
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  setUserData(res): void {
    this.users = res;
    if (res) {
      this.profiles = res.profiles;
      setTimeout(() => {
        this.loading = false;
      }, 300);
    }
  }

  updateCheckedSet(account: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(account);
    } else {
      this.setOfCheckedId.delete(account);
    }
  }

  onItemChecked(account: string, checked: boolean): void {
    this.updateCheckedSet(account, checked);
    this.checkCheckBoxState();
  }

  onAllChecked(value: boolean): void {
    this.profiles.forEach(item => this.updateCheckedSet(item.account, value));
    this.checkCheckBoxState();
  }

  checkCheckBoxState(): void {
    this.checked = this.profiles.every(item => {
      return this.setOfCheckedId.has(item.account);
    });
    this.indeterminate = this.profiles.some(item => this.setOfCheckedId.has(item.account)) && !this.checked;
    if (this.setOfCheckedId.size > 0) {
      this.dataService.announceFunction('IS_RESET_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_RESET_PROFILES_FALSE');
    }
  }

  resetProfile(profile): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Profile',
        operation: 'Reset',
        name: profile.account
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
          const auditLog: any = {};
          if (result.comment) {
            auditLog.comment = result.comment;
          }
          if (result.timeSpent) {
            auditLog.timeSpent = result.timeSpent;
          }
          if (result.ticketLink) {
            auditLog.ticketLink = result.ticketLink;
          }

          if (result.isChecked) {
            this.dataService.comments = result;
          }
          this.deleteProfile(profile, auditLog);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'resetProfile',
          message: 'resetSingleProfile',
          type: 'Reset',
          objectName: profile.account
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteProfile(profile, this.dataService.comments);
        }
      });
    }
  }

  resetMainProfile(): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Profiles',
        operation: 'Reset',
        name: Array.from(this.setOfCheckedId)
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
          this.deleteProfile(null, result);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'resetAllProfile',
          message: 'resetDefaultProfile',
          type: 'Reset',
          resetProfiles: Array.from(this.setOfCheckedId)
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteProfile(null, this.dataService.comments);
        }
      });
    }
  }

  showMaster(account): void {
    if (sessionStorage.identityServiceType !== 'VAULT') {
      this.router.navigate(['/users/identity_service/role'], { queryParams: { account } });
    } else {
      this.router.navigate(['/users/identity_service/role']);
    }
  }

  sort(key): void {
    this.order = key;
    this.reverse = !this.reverse;
  }

  saveInfo(): void {
    const obj = {
      accounts: this.users.accounts,
      masters: this.users.masters,
      main: this.users.main,
      identityServiceName: this.users.identityServiceName,
      profiles: this.profiles
    };
    this.coreService.post('authentication/auth/store', obj).subscribe(() => {
      this.profiles = [...this.profiles];
    });
  }

  private deleteProfile(profile, comments): void {
    const obj: any = { accounts: [], auditLog: {} };
    if (profile) {
      obj.accounts.push(profile.account);
    } else {
      obj.accounts = Array.from(this.setOfCheckedId);
    }
    if (comments) {
      if (comments.comment) {
        obj.auditLog.comment = comments.comment;
      }
      if (comments.timeSpent) {
        obj.auditLog.timeSpent = comments.timeSpent;
      }
      if (comments.ticketLink) {
        obj.auditLog.ticketLink = comments.ticketLink;
      }
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
    }
    this.coreService.post('configurations/delete', obj).subscribe(() => {
      if (profile) {
        for (let i = 0; i < this.profiles.length; i++) {
          if (this.profiles[i].account === profile.account) {
            this.profiles.splice(i, 1);
            break;
          }
        }
      } else {
        if (this.setOfCheckedId.size > 0) {
          this.profiles = this.profiles.filter((item) => {
            return !this.setOfCheckedId.has(item.account);
          });
        }
      }
      this.checked = false;
      this.indeterminate = false;
      this.setOfCheckedId.clear();
      this.profiles = [...this.profiles];
    });
  }
}
