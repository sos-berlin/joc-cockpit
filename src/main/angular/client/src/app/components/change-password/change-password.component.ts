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

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.passwordObj.account = this.username;
  }

  checkPassword(): void {
    this.isPasswordMatch = isEqual(this.passwordObj.password, this.passwordObj.repeatedPassword);
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


