import {Component, inject, Input} from '@angular/core';
import {isEqual} from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password-dialog.html'
})
export class ChangePasswordComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  username = '';
  identityServiceName = '';
  submitted = false;
  passwordObj: any = {
    accountName: '',
    oldPassword: '',
    password: '',
    repeatedPassword: ''
  };
  isPasswordMatch = true;
  passwordShouldNotSame = true;
  minimumPasswordLength = true;
  settings: any = {};
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.username = this.modalData.username;
    this.identityServiceName = this.modalData.identityServiceName;
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        this.comments = {comment: translatedValue};
      });
    }
    this.getConfiguration();
    this.passwordObj.accountName = this.username;
  }

  private getConfiguration(): void {
    this.coreService.post('configuration', {
      id: 0,
      objectType: 'GENERAL',
      configurationType: 'IAM',
    }).subscribe((res) => {
      if (res.configuration.configurationItem) {
        this.settings = JSON.parse(res.configuration.configurationItem);
      }
    });
  }

  checkPassword(): void {
    this.isPasswordMatch = isEqual(this.passwordObj.password, this.passwordObj.repeatedPassword);
  }

  resetError(): void {
    this.passwordShouldNotSame = true;
    this.minimumPasswordLength = true;
  }

  checkPwdLength(): void {
    if (this.settings) {
      if (this.settings.minPasswordLength) {
        if (this.passwordObj.password && this.settings.minPasswordLength > this.passwordObj.password.length) {
          this.minimumPasswordLength = false;
        }
      }
    }
    if (this.minimumPasswordLength && this.passwordObj.password && this.passwordObj.oldPassword) {
      if (isEqual(this.passwordObj.password, this.passwordObj.oldPassword)) {
        this.passwordShouldNotSame = false;
      }
    }
  }

  onSubmit(): void {
    if (this.isPasswordMatch) {
      this.submitted = true;
      this.coreService.post('iam/account/changepassword', {
        identityServiceName: this.identityServiceName,
        accountName: this.passwordObj.accountName,
        oldPassword: this.passwordObj.oldPassword,
        password: this.passwordObj.password,
        repeatedPassword: this.passwordObj.repeatedPassword,
        auditLog: {comment: this.comments.comment}
      }).subscribe({
        next: () => {
          this.activeModal.close('DONE');
        }, error: () => {
          this.submitted = false;
        }
      });
    }
  }
}


