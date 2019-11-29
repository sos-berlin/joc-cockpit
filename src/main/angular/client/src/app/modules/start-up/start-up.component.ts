import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {Router} from '@angular/router';
import {AuthService} from '../../components/guard';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';

declare const $;

@Component({
  selector: 'app-start-up-modal',
  templateUrl: './start-up.component.html'
})
export class StartUpComponent implements OnInit {
  submitted = false;
  master: any = {};
  isConnectionChecked = false;
  required = false;
  comments: any = {};
  schedulerIds: any = {};
  messageList: any = [];
  currentTime: any;
  remainingSessionTime: string;
  username: string;
  interval: any;
  error: any;
  count = 0;

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, public translate: TranslateService, private toasterService: ToasterService) {
  }

  ngOnInit() {
    this.master = {
      jobschedulerId: '',
      url: '',
      role: ''
    };
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
    this.username = this.authService.currentUserData;
    this.count = parseInt(this.authService.sessionTimeout, 10) / 1000;
    this.calculateTime();
    const headerHt = $('.fixed-top').height() || 70;
    $('.app-body').css('margin-top', headerHt + 'px');
  }

  private calculateTime() {
    this.interval = setInterval(() => {
      --this.count;
      this.currentTime = new Date();
      const s = Math.floor((this.count) % 60),
        m = Math.floor((this.count / (60)) % 60),
        h = Math.floor((this.count / (60 * 60)) % 24),
        d = Math.floor(this.count / (60 * 60 * 24));

      const x = m > 9 ? m : '0' + m;
      const y = s > 9 ? s : '0' + s;
      if (d === 0 && h !== 0) {
        this.remainingSessionTime = h + 'h ' + x + 'm ' + y + 's';
      } else if (d === 0 && h === 0 && m !== 0) {
        this.remainingSessionTime = x + 'm ' + y + 's';
      } else if (d === 0 && h === 0 && m === 0) {
        this.remainingSessionTime = s + 's';
      } else {
        this.remainingSessionTime = d + 'd ' + h + 'h';
      }
      if (this.count < 0) {
        clearInterval(this.interval);
        this.logout('timeout');
      }
    }, 1000);
  }

  logout(timeout) {
    this.coreService.post('security/logout', {}).subscribe(() => {
      this.authService.clearUser();
      this.authService.clearStorage();
      sessionStorage.clear();
      this.router.navigate(['/login']);
    });
  }

  private getPermissions(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.coreService.post('security/joc_cockpit_permissions', {jobschedulerId: this.schedulerIds.selected}).subscribe((permission) => {
      this.authService.setPermissions(permission);
      this.authService.savePermission(this.schedulerIds.selected);
      this.authService.save();
      if (this.schedulerIds) {
        this.authService.savePermission(this.schedulerIds.selected);
      } else {
        this.authService.savePermission('');
      }
      this.submitted = false;
      this.router.navigateByUrl('/');
    }, () => {
      this.submitted = false;
    });
  }

  private getSchedulerIds(): void {
    this.coreService.post('jobscheduler/ids', {}).subscribe((res: any) => {
      this.authService.setIds(res);
      this.authService.save();
      this.getPermissions();
    }, () => {
      this.getPermissions();
    });
  }

  onSubmit(): void {
    this.submitted = true;
    console.log(this.master);
    this.coreService.post('jobscheduler/register', this.master).subscribe(res => {
      this.getSchedulerIds();
    }, err => {

    });
  }

  testConnection() {
    this.error = false;
    this.isConnectionChecked = true;
    this.coreService.post('jobscheduler/test', {jobschedulerId: this.master.jobschedulerId, url: this.master.url}).subscribe((res: any) => {
      this.isConnectionChecked = false;
      if (res && res.jobscheduler) {
        if (res.jobscheduler.state && res.jobscheduler.state._text === 'UNREACHABLE') {
          this.error = true;
          let title = '', msg = '';
          this.translate.get('message.oops').subscribe(translatedValue => {
            title = translatedValue;
          });
          this.translate.get('message.connectionError').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.pop('error', title, msg);
        }
      }
    }, err => {
      this.isConnectionChecked = false;
    });
  }
}
