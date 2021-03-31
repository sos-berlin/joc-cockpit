import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';

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
  agent: any = {};
  schedulerIds: any = {};
  messageList: any = [];
  error: any;
  controllerId = '';

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router,
              public translate: TranslateService, private toasterService: ToasterService, public modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.controller = {
      url: '',
      type: 'STANDALONE',
      title: 'STANDALONE',
      primaryTitle: 'PRIMARY',
      backupTitle: 'BACKUP',
    };

    if (this.agents && this.agents.length > 0) {
      for (let i = 0; i < this.agents.length; i++) {
        if (this.agents[i].isClusterWatcher) {
          this.agent = this.agents[i];
          break;
        }
      }
    }

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
      if (this.agent && this.agent.agentId) {
        obj.clusterWatcher = this.agent;
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

    this.coreService.post('controller/register', obj).subscribe(res => {
      this.submitted = false;
      if (this.modalRef) {
        this.modalRef.close();
      } else {
        this.afterSubmit.emit();
      }
    }, err => this.submitted = false);

  }

  testConnection(type, url): void {
    this.error = false;
    this.setFlag(type, true);
    this.coreService.post('controller/test', {url: url, controllerId: this.new ? '' : this.controllerId}).subscribe((res: any) => {
      this.setFlag(type, false);
      if (res && res.controller) {
        let title = '', msg = '';
        if (res.controller.connectionState && res.controller.connectionState._text === 'unreachable') {
          this.error = true;
          this.translate.get('error.message.oops').subscribe(translatedValue => {
            title = translatedValue;
          });
          this.translate.get('error.message.connectionError').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.pop('error', title, msg);
        } else {
          this.translate.get('error.message.connectionSuccess').subscribe(translatedValue => {
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

  close(): void {
    this.modalRef.dismiss();
  }

  cancel(): void {
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
  error: any;

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router,
              public translate: TranslateService, private dataService: DataService) {
  }

  ngOnInit(): void {
    const headerHt = $('.fixed-top').height() || 70;
    $('.app-body').css('margin-top', headerHt + 'px');
  }

  private redirect(): void {
    this.authService.save();
    this.dataService.isProfileReload.next(true);
    this.router.navigate(['/dashboard']);
  }

  getSchedulerIds(): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      this.authService.setIds(res);
      this.authService.save();
      this.redirect();
    }, err => this.redirect());
  }
}
