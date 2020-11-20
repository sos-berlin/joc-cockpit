import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

declare const $;

@Component({
  selector: 'app-agent-modal',
  templateUrl: './agent.dialog.html'
})
export class AgentModalComponent implements OnInit {
  @Input() agents: any;
  @Input() type: any;
  @Input() new: any;

  constructor(public coreService: CoreService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (this.agents.length === 0) {
      this.addAgent();
    }
  }

  addAgent() {
    const param = {
      agentId: '',
      agentName: '',
      url: ''
    };
    if (!this.coreService.isLastEntryEmpty(this.agents, 'agentName', 'url')) {
      this.agents.push(param);
    }
  }

  removeAgent(index): void {
    this.agents.splice(index, 1);
  }

  close(): void {
    if (this.coreService.isLastEntryEmpty(this.agents, 'agentName', 'url')) {
      this.agents.splice(this.agents.length - 1, 1);
    }
    this.activeModal.close(this.agents);
  }

  checkDisable(agent): void {
    if (agent.disabled) {
      let flag = this.agents.filter((value) => {
        return value.disabled;
      }).length > this.agents.length - 1;
      if (flag) {
        setTimeout(() => {
          agent.disabled = false;
        }, 0);
      }
    }
  }
}

@Component({
  selector: 'app-start-up-modal',
  templateUrl: './start-up.dialog.html'
})
export class StartUpModalComponent implements OnInit {
  @Input() isModal: boolean;
  @Input() new: boolean;
  @Input() modalRef: any;
  @Input() controllerInfo: any;
  @Input() agents: any;
  @Output() afterSubmit: EventEmitter<any> = new EventEmitter();
  submitted = false;
  controller: any = {};
  isPrimaryConnectionChecked = false;
  isBackupConnectionChecked = false;
  isConnectionChecked = false;
  required = false;
  display: any;
  comments: any = {};
  schedulerIds: any = {};
  messageList: any = [];
  error: any;
  controllerId = '';

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router,
              public translate: TranslateService, private toasterService: ToasterService, public modalService: NgbModal) {
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
          this.controllerId = this.controllerInfo[i].controllerId;
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
    let preferences: any = {};
    if (sessionStorage.preferences) {
      preferences = JSON.parse(sessionStorage.preferences);
    }
    this.display = preferences.auditLog;
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
      controllerId: this.controllerId
    };

    if (this.controller.type === 'STANDALONE') {
      let _obj: any = {};
      _obj.url = this.controller.url;
      _obj.title = this.controller.title;
      _obj.role = 'STANDALONE';
      obj.controllers.push(_obj);
    } else {
      if (this.controller.primaryUrl) {
        let _obj: any = {};
        _obj.url = this.controller.primaryUrl;
        _obj.title = this.controller.primaryTitle;
        _obj.role = 'PRIMARY';
        _obj.clusterUrl = this.controller.primaryClusterUrl;
        obj.controllers.push(_obj);
      }

      if (this.controller.backupUrl) {
        let _obj: any = {};
        _obj.url = this.controller.backupUrl;
        _obj.role = 'BACKUP';
        _obj.clusterUrl = this.controller.backupClusterUrl;
        _obj.title = this.controller.backupTitle;
        obj.controllers.push(_obj);
      }
    }
    if (this.display) {
      obj.auditLog = {};
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
    }
    obj.agents = this.agents;
    this.coreService.post('controller/register', obj).subscribe(res => {
      this.submitted = false;
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
    this.coreService.post('controller/test', {url: url, controllerId: this.new ? '' : this.controllerId}).subscribe((res: any) => {
      this.setFlag(type, false);
      if (res && res.controller) {
        let title = '', msg = '';
        if (res.controller.connectionState && res.controller.connectionState._text === 'unreachable') {
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

  showAgent() {
    const modalRef = this.modalService.open(AgentModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.agents = this.coreService.clone(this.agents) || [];
    modalRef.componentInstance.type = this.controller.type;
    modalRef.componentInstance.new = this.new;
    modalRef.result.then((result) => {
      this.agents = result;
    }, () => {

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

  cancel() {
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
              public translate: TranslateService) {
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
    this.authService.setPermissions(_permission);
    this.authService.save();
    if (this.schedulerIds) {
      this.authService.savePermission(this.schedulerIds.selected);
    } else {
      this.authService.savePermission('');
    }
    this.router.navigate(['/dashboard']);
  }

  getSchedulerIds(permission): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      this.authService.setIds(res);
      this.authService.save();
      this.setPermissions(permission);
    }, err => this.setPermissions(permission));
  }
}
