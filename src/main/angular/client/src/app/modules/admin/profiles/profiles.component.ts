import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../data.service';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html'
})
export class ProfilesComponent implements OnInit, OnDestroy {
  preferences: any = {};
  permission: any = {};
  schedulerIds: any = {};
  profiles: any = [];
  users: any;
  searchKey: string;
  prof: any = {currentPage: 1};
  order = 'user';
  loading = true;
  reverse = false;
  checked = false;
  indeterminate = false;
  identityServiceName: string;
  identityServiceType: string;
  setOfCheckedId = new Set<string>();

  subscription1: Subscription;

  constructor(private dataService: DataService, private modal: NzModalService, private coreService: CoreService,
              private router: Router, private authService: AuthService) {

    this.subscription1 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'RESET_PROFILES') {
        this.resetMainProfile();
      } else if (res === 'DELETE_PROFILES') {
        this.deleteMainProfile();
      }
    });
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.identityServiceName = sessionStorage.identityServiceName;
    this.identityServiceType = sessionStorage.identityServiceType;
    this.getList();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  private getList(): void {
    this.coreService.post('profiles', {
      controllerId: this.schedulerIds.selected,
      identityServiceName: this.identityServiceName
    }).subscribe({
      next: (res: any) => {
        this.profiles = res.profiles;
        this.loading = false;
      }, error: () => {
        this.loading = false;
      }
    })
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

  resetOrDeleteProfile(profile, type): void {
    if (this.preferences.auditLog && !this.dataService.comments.comment) {
      let comments = {
        radio: 'predefined',
        type: 'Profile',
        operation: type,
        name: profile ? profile.account : Array.from(this.setOfCheckedId)
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
          this.coreService.getAuditLogObj(result.comments, auditLog);
          if (result.isChecked) {
            this.dataService.comments = result;
          }
          this.resetDeleteProfile(profile, auditLog, type);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: profile ? (type === 'Reset' ? 'resetProfile' : 'deleteProfile') : (type === 'Reset' ? 'resetAllProfile' : 'deleteAllProfile'),
          message: profile ? (type === 'Reset' ? 'resetSingleProfile' : 'deleteSingleProfile') : (type === 'Reset' ? 'resetDefaultProfile' : 'deleteDefaultProfile'),
          type: type,
          objectName: profile ? profile.account : undefined,
          resetProfiles: profile ? undefined : Array.from(this.setOfCheckedId)
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.resetDeleteProfile(profile, this.dataService.comments, type);
        }
      });
    }
  }

  resetMainProfile(): void {
    this.resetOrDeleteProfile(null, 'Reset');
  }

  deleteMainProfile(): void {
    this.resetOrDeleteProfile(null, 'Delete');
  }

  showMaster(account): void {
    if (sessionStorage.identityServiceType !== 'VAULT') {
      this.router.navigate(['/users/identity_service/role'], {queryParams: {account}}).then();
    } else {
      this.router.navigate(['/users/identity_service/role']).then();
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

  private resetDeleteProfile(profile, comments, type): void {
    const obj: any = {accounts: [], auditLog: {}};
    if (profile) {
      obj.accounts.push(profile.account);
    } else {
      obj.accounts = Array.from(this.setOfCheckedId);
    }
    if (comments) {
      this.coreService.getAuditLogObj(comments, obj.auditLog);
      if (comments.isChecked) {
        this.dataService.comments = comments;
      }
    }
    if (type === 'Delete') {
      obj.configurationType = 'PROFILE';
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
