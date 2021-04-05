import {Component, OnInit, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './dialog.html',
})

export class CommentModalComponent implements OnInit {
  @Input() action;
  @Input() comments: any;
  @Input() obj: any;
  @Input() performAction;
  @Input() controllerID;
  submitted = false;
  messageList: any;
  required = false;
  show = false;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  ngOnInit(): void {
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

  postCall(url, obj): void {
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
  @Input() controller: any;
  @Input() permission: any;
  preferences: any = {};
  schedulerIds: any;
  controllerPermission: any = {};

  constructor(public modalService: NgbModal, private coreService: CoreService, private authService: AuthService) {
  }

  static setControllerPermission(permissions, controllerId): any {
    if (permissions.controllers && controllerId && permissions.controllers[controllerId]) {
      return permissions.controllers[controllerId];
    } else {
      return permissions.controllerDefaults;
    }
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.controllerPermission = ActionComponent.setControllerPermission(this.permission, this.controller.controllerId);
  }

  clusterAction(action, data, isFailOver): void {
    const obj = {
      controllerId: data.controllerId || this.schedulerIds.selected,
      url: data.url,
      withFailover: isFailOver,
      auditLog: {}
    };
    if (this.preferences.auditLog && (action !== 'downloadLog')) {
      let comments = {
        radio: 'predefined',
        name: obj.controllerId + ' (' + obj.url + ')',
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
      this.postCall('controller/terminate', obj);
    } else if (action === 'abort') {
      this.postCall('controller/abort', obj);
    } else if (action === 'abortAndRestart') {
      this.postCall('controller/abort_and_restart', obj);
    } else if (action === 'terminateAndRestart') {
      this.postCall('controller/restart', obj);
    } else if (action === 'downloadLog') {
      $('#tmpFrame').attr('src', './api/controller/log?url=' + obj.url + '&controllerId=' + obj.controllerId + '&accessToken=' + this.authService.accessTokenId);
    }
  }

  private postCall(url, obj): void {
    this.coreService.post(url, obj).subscribe(() => {
    });
  }
}
