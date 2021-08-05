import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NzModalService} from 'ng-zorro-antd/modal';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  user: any = {};
  schedulerIds: any = {};
  submitted = false;
  rememberMe = false;
  errorMsg = false;
  returnUrl = '';

  constructor(private route: ActivatedRoute, private router: Router, private modal: NzModalService,
              public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (localStorage.$SOS$REMEMBER === 'true' || localStorage.$SOS$REMEMBER === true) {
      if (localStorage.$SOS$FOO) {
        const urs = AES.decrypt(localStorage.$SOS$FOO.toString(), '$SOSJS7');
        this.user.userName = urs.toString(Utf8);
        if (localStorage.$SOS$BOO) {
          const pwd = AES.decrypt(localStorage.$SOS$BOO.toString(), '$SOSJS7');
          this.user.password = pwd.toString(Utf8);
        }
      }
      this.rememberMe = true;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.returnUrl.match(/login/)) {
      this.returnUrl = '/';
    }
    if (this.authService.accessTokenId) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(values: any): void {
    this.submitted = true;
    this.errorMsg = false;
    this.coreService.post('authentication/login', values).subscribe((data) => {
      this.authService.rememberMe = this.rememberMe;
      if (this.rememberMe) {
        if (values.userName) {
          localStorage.$SOS$FOO = AES.encrypt(values.userName, '$SOSJS7');
        } else {
          localStorage.removeItem('$SOS$FOO');
        }
        if (values.password) {
          localStorage.$SOS$BOO = AES.encrypt(values.password, '$SOSJS7');
        } else {
          localStorage.removeItem('$SOS$BOO');
        }
        localStorage.$SOS$REMEMBER = this.rememberMe;
      } else {
        localStorage.removeItem('$SOS$FOO');
        localStorage.removeItem('$SOS$BOO');
        localStorage.removeItem('$SOS$REMEMBER');
      }
      this.authService.setUser(data);
      this.authService.save();
      this.router.navigateByUrl(this.returnUrl);
    }, () => {
      this.submitted = false;
      this.errorMsg = true;
    });
  }
}
