import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

declare const $;

@Component({
  selector: 'app-start-up-modal',
  templateUrl: './start-up.dialog.html'
})
export class StartUpModalComponent implements OnInit {
  @Input() isModal: boolean;
  @Input() new: boolean;
  @Input() modalRef: any;
  @Input() masterInfo: any;
  @Output() afterSubmit: EventEmitter<any> = new EventEmitter();
  submitted = false;
  master: any = {};
  isPrimaryConnectionChecked = false;
  isBackupConnectionChecked = false;
  isConnectionChecked = false;
  required = false;
  comments: any = {};
  schedulerIds: any = {};
  messageList: any = [];
  error: any;

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router,
              public translate: TranslateService, private toasterService: ToasterService) {
  }

  ngOnInit() {
    this.master = {
      url: '',
      type: 'STANDALONE',
      title: 'STANDALONE',
      primaryTitle: 'PRIMARY',
      backupTitle: 'BACKUP',
    };
    if (this.masterInfo) {
      const len = this.masterInfo.length;
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          if (this.masterInfo[i].role !== 'STANDALONE') {
            this.master.type = 'CLUSTER';
            if (this.masterInfo[i].role === 'BACKUP') {
              this.master.backupTitle = this.masterInfo[i].title;
              this.master.backupUrl = this.masterInfo[i].url;
              this.master.backupClusterUrl = this.masterInfo[i].clusterUrl;
            } else {
              this.master.primaryTitle = this.masterInfo[i].title;
              this.master.primaryUrl = this.masterInfo[i].url;
              this.master.primaryClusterUrl = this.masterInfo[i].clusterUrl;
            }
          } else {
            this.master.title = this.masterInfo[i].title;
            this.master.url = this.masterInfo[i].url;
          }
        }
      }
    }
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    let obj: any = {
      masters: [],
    };

    if (this.master.type === 'STANDALONE') {
      let _obj: any = {};
      _obj.url = this.master.url;
      _obj.title = this.master.title;
      _obj.role = 'STANDALONE';
      if (this.masterInfo && this.masterInfo.length > 0) {
        _obj.id = this.masterInfo[0].id;
      }
      obj.masters.push(_obj);
    } else {
      if (this.master.primaryUrl) {
        let _obj: any = {};
        _obj.url = this.master.primaryUrl;
        _obj.title = this.master.primaryTitle;
        _obj.role = 'PRIMARY';
        _obj.clusterUrl = this.master.primaryClusterUrl;
        if (this.masterInfo && this.masterInfo.length > 0) {
          for (let i = 0; i < this.masterInfo.length; i++) {
            if (this.masterInfo[i].role === 'PRIMARY') {
              _obj.id = this.masterInfo[i].id;
              break;
            }
          }
          if (!_obj.id) {
            _obj.id = this.masterInfo[0].id;
          }
        }
        obj.masters.push(_obj);
      }

      if (this.master.backupUrl) {
        let _obj: any = {};
        _obj.url = this.master.backupUrl;
        _obj.role = 'BACKUP';
        _obj.clusterUrl = this.master.backupClusterUrl;
        _obj.title = this.master.backupTitle;
        if (this.masterInfo && this.masterInfo.length > 0) {
          for (let i = 0; i < this.masterInfo.length; i++) {
            if (this.masterInfo[i].role === 'BACKUP') {
              _obj.id = this.masterInfo[i].id;
              break;
            }
          }
          if (!_obj.id) {
            _obj.id = this.masterInfo[0].id;
          }
        }
        obj.masters.push(_obj);
      }
    }
    this.coreService.post('jobscheduler/register', obj).subscribe(res => {
      if (this.modalRef) {
        this.modalRef.close(res);
      } else {
        this.afterSubmit.emit(res);
      }
    }, err => this.submitted = false);

  }

  testConnection(type, url) {
    this.error = false;
    this.setFlag(type, true);
    this.coreService.post('jobscheduler/test', {url: url}).subscribe((res: any) => {
      this.setFlag(type, false);
      if (res && res.jobscheduler) {
        let title = '', msg = '';
        if (res.jobscheduler.connectionState && res.jobscheduler.connectionState._text === 'unreachable') {
          this.error = true;
          this.translate.get('message.oops').subscribe(translatedValue => {
            title = translatedValue;
          });
          this.translate.get('message.connectionError').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.pop('error', title, msg);
        } else {
          this.translate.get('message.connectionSuccess').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.pop('success', '', msg);
        }
      }
    }, err => {
      this.error = true;
      this.setFlag(type, false);
    });
  }

  setFlag(type, flag): void {
    if (type === 'ALL') {
      this.isConnectionChecked = flag;
    } else if (type === 'PRIMARY') {
      this.isPrimaryConnectionChecked = flag;
    } else if (type === 'BACKUP') {
      this.isBackupConnectionChecked = flag;
    }
  }

  close() {
    this.modalRef.dismiss();
  }
}

@Component({
  selector: 'app-start-up-component',
  templateUrl: './start-up.component.html'
})
export class StartUpComponent implements OnInit {
  master: any = {};
  schedulerIds: any = {};
  currentTime: any;
  remainingSessionTime: string;
  username: string;
  interval: any;
  error: any;
  count = 0;

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router,
              public translate: TranslateService, private toasterService: ToasterService) {
  }

  ngOnInit() {
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
        this.logout();
      }
    }, 1000);
  }

  logout() {
    this.coreService.post('security/logout', {}).subscribe(() => {
      this.authService.clearUser();
      this.authService.clearStorage();
      sessionStorage.clear();
      this.router.navigate(['/login']);
    });
  }

  private setPermissions(_permission): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    if (_permission && _permission.SOSPermissionJocCockpitMaster) {
      this.authService.setPermissions(_permission);
      this.authService.save();
      if (this.schedulerIds) {
        this.authService.savePermission(this.schedulerIds.selected);
      } else {
        this.authService.savePermission('');
      }

      this.router.navigateByUrl('/');
    }
  }

  getSchedulerIds(permission): void {
    this.coreService.post('jobscheduler/ids', {}).subscribe((res: any) => {
      this.authService.setIds(res);
      this.authService.save();

      this.setPermissions(permission);
    }, err => this.setPermissions(permission));
  }
}
