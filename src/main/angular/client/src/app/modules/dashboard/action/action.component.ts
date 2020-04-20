import {Component, OnInit, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './dialog.html',
})

export class CommentModalComponent implements OnInit {
  @Input() action;
  @Input() comments: any;
  @Input() obj: any;
  @Input() performAction;
  @Input() jobScheduleID;
  submitted = false;
  messageList: any;
  required = false;
  show = false;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  ngOnInit() {
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
  }

  onSubmit(result, obj): void {
    this.submitted = true;
    obj.auditLog = {
      comment: result.comment,
      timeSpent: result.timeSpent,
      ticketLink: result.ticketLink
    };
    this.performAction(this.action, obj);
  }

  postCall(url, obj) {
    this.coreService.post(url, obj).subscribe(() => {
      this.submitted = false;
      this.activeModal.close();
    }, () => {
      this.submitted = false;
    });
  }
}


@Component({
  selector: 'app-action',
  templateUrl: './action.component.html'
})
export class ActionComponent implements OnInit {

  @Input() master: any;
  preferences: any = {};
  schedulerIds: any;

  constructor(public modalService: NgbModal, private coreService: CoreService, private authService: AuthService) {
  }

  static saveToFileSystem(res, obj) {
    let name = 'jobscheduler.' + obj.jobschedulerId + '.main.log';
    let fileType = 'application/octet-stream';

    if (res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
      name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
    }
    if (res.headers('Content-Type')) {
      fileType = res.headers('Content-Type');
    }
    const data = new Blob([res.data], {type: fileType});
    saveAs(data, name);
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    if (this.authService.scheduleIds) {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    } else {
      this.schedulerIds = {};
    }
  }

  clusterAction(action, data, isFailOver) {
    let obj = {
      jobschedulerId: data.jobschedulerId || this.schedulerIds.selected,
      url: data.url,
      withFailover: isFailOver,
      auditLog: {}
    };
    if (this.preferences.auditLog && (action !== 'downloadLog')) {
      let comments = {
        radio: 'predefined',
        name: obj.jobschedulerId + ' (' + obj.url + ')',
        operation: (action === 'terminate' && !isFailOver) ? 'Terminate without fail-over' : action === 'terminateAndRestart' ? 'Terminate and Restart' : action === 'abortAndRestart' ? 'Abort and Restart' : action === 'terminate' ? 'Terminate' : 'Abort'
      };

      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.action = action;
      modalRef.componentInstance.show = true;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.performAction = this.performAction;

      modalRef.result.then((result) => {
        console.log('Close...', result);
      }, (reason) => {
        console.log('close...', reason);
      });

    } else {
      this.performAction(action, obj);
    }
  }

  performAction(action, obj): void {
    if (action === 'terminate') {
      this.postCall('jobscheduler/terminate', obj);
    } else if (action === 'abort') {
      this.postCall('jobscheduler/abort', obj);
    } else if (action === 'abortAndRestart') {
      this.postCall('jobscheduler/abort_and_restart', obj);
    } else if (action === 'terminateAndRestart') {
      this.postCall('jobscheduler/restart', obj);
    } else if (action === 'downloadLog') {
      this.coreService.get('jobscheduler/log?url=' + obj.url + '&jobschedulerId=' + obj.jobschedulerId).subscribe((res) => {
        ActionComponent.saveToFileSystem(res, obj);
      }, () => {
        console.log('err in download');
      });
    }
  }

  private postCall(url, obj) {
    this.coreService.post(url, obj).subscribe(() => {
    });
  }
}
