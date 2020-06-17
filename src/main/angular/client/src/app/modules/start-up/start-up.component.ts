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
  @Input() controllerInfo: any;
  @Output() afterSubmit: EventEmitter<any> = new EventEmitter();
  submitted = false;
  controller: any = {};
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
    this.controller = {
      url: '',
      type: 'STANDALONE',
      title: 'STANDALONE',
      primaryTitle: 'PRIMARY',
      backupTitle: 'BACKUP',
    };
    if (this.controllerInfo) {
      const len = this.controllerInfo.length;
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          if (this.controllerInfo[i].role !== 'STANDALONE') {
            this.controller.type = 'CLUSTER';
            if (this.controllerInfo[i].role === 'BACKUP') {
              this.controller.backupTitle = this.controllerInfo[i].title;
              this.controller.backupUrl = this.controllerInfo[i].url;
              this.controller.backupClusterUrl = this.controllerInfo[i].clusterUrl;
            } else {
              this.controller.primaryTitle = this.controllerInfo[i].title;
              this.controller.primaryUrl = this.controllerInfo[i].url;
              this.controller.primaryClusterUrl = this.controllerInfo[i].clusterUrl;
            }
          } else {
            this.controller.title = this.controllerInfo[i].title;
            this.controller.url = this.controllerInfo[i].url;
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
      controllers: [],
    };

    if (this.controller.type === 'STANDALONE') {
      let _obj: any = {};
      _obj.url = this.controller.url;
      _obj.title = this.controller.title;
      _obj.role = 'STANDALONE';
      if (this.controllerInfo && this.controllerInfo.length > 0) {
        _obj.id = this.controllerInfo[0].id;
      }
      obj.controllers.push(_obj);
    } else {
      if (this.controller.primaryUrl) {
        let _obj: any = {};
        _obj.url = this.controller.primaryUrl;
        _obj.title = this.controller.primaryTitle;
        _obj.role = 'PRIMARY';
        _obj.clusterUrl = this.controller.primaryClusterUrl;
        if (this.controllerInfo && this.controllerInfo.length > 0) {
          for (let i = 0; i < this.controllerInfo.length; i++) {
            if (this.controllerInfo[i].role === 'PRIMARY') {
              _obj.id = this.controllerInfo[i].id;
              break;
            }
          }
          if (!_obj.id) {
            _obj.id = this.controllerInfo[0].id;
          }
        }
        obj.controllers.push(_obj);
      }

      if (this.controller.backupUrl) {
        let _obj: any = {};
        _obj.url = this.controller.backupUrl;
        _obj.role = 'BACKUP';
        _obj.clusterUrl = this.controller.backupClusterUrl;
        _obj.title = this.controller.backupTitle;
        if (this.controllerInfo && this.controllerInfo.length > 0) {
          for (let i = 0; i < this.controllerInfo.length; i++) {
            if (this.controllerInfo[i].role === 'BACKUP') {
              _obj.id = this.controllerInfo[i].id;
              break;
            }
          }
          if (!_obj.id) {
            _obj.id = this.controllerInfo[0].id;
          }
        }
        obj.controllers.push(_obj);
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

  cancel(){
    this.router.navigate(['/dashboard']);
  }
}

@Component({
  selector: 'app-start-up-component',
  templateUrl: './start-up.component.html'
})
export class StartUpComponent implements OnInit {
  controller: any = {};
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
