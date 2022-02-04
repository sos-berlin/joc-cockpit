import {Component, Input, OnInit} from '@angular/core';
import {isEqual} from 'underscore';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password-dialog.html'
})
export class ChangePasswordComponent implements OnInit {
  @Input() username: string;
  @Input() identityServiceName: string;
  submitted = false;
  passwordObj: any = {
    account: '',
    oldPassword: '',
    password: '',
    repeatedPassword: ''
  };
  isPasswordMatch = true;
  passwordShouldNotSame = true;
  minimumPasswordLength = true;
  settings: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.getConfiguration();
    this.passwordObj.account = this.username;
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
      this.coreService.post('authentication/auth/changepassword', {
        identityServiceName: this.identityServiceName,
        accounts: [this.passwordObj]
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


