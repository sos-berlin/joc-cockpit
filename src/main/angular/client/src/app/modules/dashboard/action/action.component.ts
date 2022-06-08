import {Component, OnInit, Input} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-comment-modal',
  templateUrl: './dialog.html',
})
export class CommentModalComponent implements OnInit {
  @Input() action;
  @Input() comments: any;
  @Input() obj: any;
  @Input() performAction;
  @Input() controllerID;
  submitted = false;
  required = false;
  show = false;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
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

  constructor(public modal: NzModalService, private coreService: CoreService, private authService: AuthService) {
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
      withSwitchover: isFailOver,
      auditLog: {}
    };
    if (this.preferences.auditLog && (action !== 'downloadLog')) {
      const comments = {
        radio: 'predefined',
        name: obj.controllerId + ' (' + obj.url + ')',
        operation: (action === 'terminate' && !isFailOver) ? 'Terminate without fail-over' : action === 'terminateAndRestart' ? 'Terminate and Restart' : action === 'abortAndRestart' ? 'Abort and Restart' : action === 'terminate' ? 'Terminate' : 'Abort'
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzComponentParams: {
          comments,
          action,
          show : true,
          obj,
          performAction : this.performAction
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
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
      this.coreService.download('controller/log', {
        url: obj.url,
        controllerId: obj.controllerId
      }, 'controller.log.gz', () => {

      });
    }
  }

  private postCall(url, obj): void {
    this.coreService.post(url, obj).subscribe();
  }
}
