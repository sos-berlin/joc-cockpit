import {Component, OnInit, Input} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import * as _ from 'underscore';
import * as moment from 'moment';
import {CoreService} from '../../../services/core.service';
import {CalendarModalComponent} from '../../../components/calendar-modal/calendar.component';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order-dialog.html',
})

export class AddOrderModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() permission: any;
  @Input() preferences: any;
  @Input() workflow: any;

  order: any = {};
  arguments: any = [];
  dateFormat: any;
  display: any;
  required = false;
  messageList: any;
  comments: any = {};
  submitted = false;
  zones = [];
  variableList = [];

  constructor(public coreService: CoreService, private activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    this.order.timeZone = this.preferences.zone;
    this.order.fromTime = new Date();

    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
    this.order.at = 'now';
    this.updateVariableList();
  }

  updateVariableList(): void {
    if (this.workflow.orderRequirements && this.workflow.orderRequirements.parameters && !_.isEmpty(this.workflow.orderRequirements.parameters)) {
      this.variableList = Object.entries(this.workflow.orderRequirements.parameters).map(([k, v]) => {
        const val: any = v;
        if (!val.default && val.default !== false && val.default !== 0) {
          this.arguments.push({name: k, type: val.type, isRequired: true});
        }
        return {name: k, value: v};
      });
    }
    this.updateSelectItems();
  }

  checkVariableType(argument): void {
    let obj = this.workflow.orderRequirements.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      } else{
        argument.value = obj.default;
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    if (this.arguments.length > 0) {
      for (let i = 0; i < this.variableList.length; i++) {
        this.variableList[i].isSelected = false;
        for (let j = 0; j < this.arguments.length; j++) {
          if (this.variableList[i].name === this.arguments[j].name) {
            this.variableList[i].isSelected = true;
            break;
          }
        }
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.arguments, event.previousIndex, event.currentIndex);
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId,
      orders: []
    };
    if (this.order.fromDate && this.order.fromTime) {
      this.order.fromDate.setHours(moment(this.order.fromTime).hours());
      this.order.fromDate.setMinutes(moment(this.order.fromTime).minutes());
      this.order.fromDate.setSeconds(moment(this.order.fromTime).seconds());
      this.order.fromDate.setMilliseconds(0);
    }
    const order: any = {workflowPath: this.workflow.path, orderName: this.order.orderId};
    if (this.order.at === 'now') {
      order.scheduledFor = 'now';
    } else if (this.order.at === 'later') {
      order.scheduledFor = 'now + ' + this.order.atTime;
    } else {
      if (this.order.fromDate) {
        order.scheduledFor = moment(this.order.fromDate).format('YYYY-MM-DD HH:mm:ss');
        order.timeZone = this.order.timeZone;
      }
    }
    if (this.arguments.length > 0) {
      let argu = [...this.arguments];
      if (this.coreService.isLastEntryEmpty(argu, 'name', '')) {
        argu.splice(argu.length - 1, 1);
      }
      if (argu.length > 0) {
        order.arguments = this.coreService.keyValuePair(argu);
      }
    }
    obj.orders.push(order);
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
    this.coreService.post('orders/add', obj).subscribe((res: any) => {
      this.submitted = false;
      this.activeModal.close('Done');
    }, err => {
      this.submitted = false;
    });
  }

  addArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.arguments, 'name', '')) {
        this.arguments.push(param);
      }
    }
  }

  removeArgument(index): void {
    this.arguments.splice(index, 1);
    this.updateSelectItems();
  }

  onKeyPress($event): void {
    $event.preventDefault();
    if ($event.which === '13' || $event.which === 13) {
      this.addArgument();
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}

@Component({
  selector: 'app-workflow-action',
  templateUrl: './workflow-action.component.html'
})
export class WorkflowActionComponent {

  @Input() workflow: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;

  constructor(public modal: NzModalService, public coreService: CoreService, private router: Router) {
  }

  navToDetailView(view): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', this.workflow.path, this.workflow.versionId]);
  }

  addOrder(workflow): void {
    this.modal.create({
      nzTitle: null,
      nzContent: AddOrderModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerId,
        workflow
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  showDailyPlan(workflow): void {
    this.modal.create({
      nzTitle: null,
      nzContent: CalendarModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        path: workflow.path
      },
      nzFooter: null,
      nzClosable: false
    });
  }
}
