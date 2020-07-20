import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CoreService } from '../../services/core.service';
import { AuthService } from '../../components/guard';
import * as crypto from 'crypto-js';

declare const $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  providers: [CoreService]
})
export class LoginComponent implements OnInit {

  user: any = {};
  schedulerIds: any = {};
  submitted = false;
  rememberMe = false;
  errorMsg = false;
  returnUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit() {
    if (localStorage.$SOS$REMEMBER === 'true' || localStorage.$SOS$REMEMBER === true) {
      const urs = crypto.AES.decrypt(localStorage.$SOS$FOO.toString(), '$SOSJOBSCHEDULER2');
      const pwd = crypto.AES.decrypt(localStorage.$SOS$BOO.toString(), '$SOSJOBSCHEDULER2');
      this.user.userName = urs.toString(crypto.enc.Utf8);
      this.user.password = pwd.toString(crypto.enc.Utf8);
      this.rememberMe = true;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // this.getDefaultConfiguration();
  }

  getDefaultConfiguration() {
    this.coreService.get('configuration/login').subscribe((res: any) => {
      if (res.customLogo && res.customLogo.name) {
        const imgUrl = '../ext/images/' + res.customLogo.name;
        if (res.customLogo.position && res.customLogo.position !== 'BOTTOM') {
          $('#logo-top').append('<img style=\'height: ' + res.customLogo.height + '\' src=\'' + imgUrl + '\'>');
        } else {
          $('#logo-bottom').append('<img style=\'height: ' + res.customLogo.height + '\' src=\'' + imgUrl + '\'>');
        }
      }
    });
  }

  private getComments(): void {
    this.coreService.post('properties', {}).subscribe((result: any) => {
      sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
      sessionStorage.comments = JSON.stringify(result.comments);
      sessionStorage.showViews = JSON.stringify(result.showViews);
      sessionStorage.securityLevel = result.securityLevel;
      sessionStorage.defaultProfile = result.defaultProfileAccount;
    });
  }

  private getPermissions(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.coreService.post('security/joc_cockpit_permissions', {jobschedulerId: this.schedulerIds.selected}).subscribe((permission) => {
      this.authService.setPermissions(permission);
      this.authService.save();
      if (this.schedulerIds) {
        this.authService.savePermission(this.schedulerIds.selected);
      } else {
        this.authService.savePermission('');
      }
      this.submitted = false;
      this.router.navigateByUrl(this.returnUrl);
    }, () => {
      this.submitted = false;
    });
  }

  private getSchedulerIds(): void {
    this.coreService.post('jobscheduler/ids', {}).subscribe((res: any) => {

      if (res && res.jobschedulerIds && res.jobschedulerIds.length > 0) {
        this.authService.setIds(res);
        this.authService.save();
        this.getComments();
        this.getPermissions();
      } else {
        this.navigate();
      }
    }, () => {
      this.navigate();
    });
  }

  private navigate(){
    this.getComments();
    this.router.navigate(['/start-up']);
    this.submitted = false;
  }

  onSubmit(values): void {
    this.submitted = true;
    this.errorMsg = false;
    this.coreService.post('security/login', values).subscribe((data) => {
      this.authService.rememberMe = this.rememberMe;
      if (this.rememberMe) {
        const urs = crypto.AES.encrypt(values.userName, '$SOSJOBSCHEDULER2');
        const pwd = crypto.AES.encrypt(values.password, '$SOSJOBSCHEDULER2');
        localStorage.$SOS$FOO = urs;
        localStorage.$SOS$BOO = pwd;
        localStorage.$SOS$REMEMBER = this.rememberMe;
      } else {
        localStorage.removeItem('$SOS$FOO');
        localStorage.removeItem('$SOS$BOO');
        localStorage.removeItem('$SOS$REMEMBER');
      }
      this.authService.setUser(data);
      this.authService.save();
      this.getSchedulerIds();
    }, () => {
      this.submitted = false;
      this.errorMsg = true;
    });
  }
}
