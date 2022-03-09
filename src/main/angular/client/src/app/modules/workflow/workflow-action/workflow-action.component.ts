import {Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {isEmpty, isArray} from 'underscore';
import {differenceInCalendarDays} from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {ValueEditorComponent} from '../../../components/value-editor/value.component';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-show-dependency',
  templateUrl: './show-dependency-dialog.html'
})
export class ShowDependencyComponent implements OnInit {
  @Input() workflow: any;
  permission: any = {}

  constructor(private coreService: CoreService, private activeModal: NzModalRef, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.permission = JSON.parse(this.authService.permission) || {};
  }

  close(): void {
    this.activeModal.destroy();
  }

  showWorkflow(workflow): void {
    this.coreService.showWorkflow(workflow);
    this.close();
  }

  showBoard(board): void{
    this.coreService.showBoard(board);
    this.close();
  }

  navToInventoryTab(data, type): void {
    this.coreService.navToInventoryTab(data, type);
    this.close();
  }
}

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order-dialog.html',
})
export class AddOrderModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() permission: any;
  @Input() preferences: any;
  @Input() workflow: any;

  viewDate = new Date();
  order: any = {};
  arguments: any = [];
  forkListVariables: any = [];
  dateFormat: any;
  display: any;
  required = false;
  comments: any = {};
  submitted = false;
  zones = [];
  variableList = [];

  constructor(public coreService: CoreService, private activeModal: NzModalRef,
              private modal: NzModalService, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.order.timeZone = this.preferences.zone;
    this.order.at = 'now';
    this.updateVariableList();
  }

  updateVariableList(): void {
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type !== 'List') {
          if (!val.final) {
            if (!val.default && val.default !== false && val.default !== 0) {
              this.arguments.push({name: k, type: val.type, isRequired: true});
            } else if (val.default) {
              if (val.type === 'String') {
                this.coreService.removeSlashToString(val, 'default');
              } else if (val.type === 'Boolean') {
                val.default = (val.default === 'true' || val.default === true);
              }
            }
          }
        } else {
          const actualList = [];
          if (val.listParameters) {
            if (isArray(val.listParameters)) {
              val.listParameters.forEach((item) => {
                actualList.push({name: item.name, type: item.value.type});
              });
            } else {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                actualList.push({name: k1, type: val1.type});
                return {name: k1, value: val1};
              });
            }
            this.forkListVariables.push({name: k, list: val.listParameters, actualList: [actualList]});
          }
        }
        return {name: k, value: val};
      });
      this.variableList = this.variableList.filter((item) => {
        if (item.value.type === 'List') {
          return false;
        }
        return !item.value.final;
      });
    }
    this.updateSelectItems();
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) < 0;
  }

  checkVariableType(argument): void {
    const obj = this.workflow.orderPreparation.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      } else{
        if (obj.type === 'Boolean') {
          argument.value = (obj.default === true || obj.default === 'true');
        } else {
          argument.value = obj.default;
        }
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
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

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.arguments, event.previousIndex, event.currentIndex);
  }

  selectTime(time, isEditor = false): void {
    this.coreService.selectTime(time, isEditor, this.order);
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId,
      orders: []
    };

    const order: any = {workflowPath: this.workflow.path, orderName: this.order.orderId};
    if (this.order.at === 'now') {
      order.scheduledFor = 'now';
    } else if (this.order.at === 'never') {
      order.scheduledFor = 'never';
    } else if (this.order.at === 'later') {
      order.scheduledFor = 'now + ' + this.order.atTime;
    } else {
      if (this.order.fromDate) {
        this.coreService.getDateAndTime(this.order);
        order.scheduledFor = this.coreService.getDateByFormat(this.order.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
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
    if (this.forkListVariables && this.forkListVariables.length > 0) {
      if (!order.arguments) {
        order.arguments = {};
      }
      this.forkListVariables.forEach((item) => {
        order.arguments[item.name] = [];
        if (item.actualList) {
          for (const i in item.actualList) {
            const listObj = {};
            item.actualList[i].forEach((data) => {
              listObj[data.name] = data.value;
            });
            order.arguments[item.name].push(listObj);
          }
        }
      });
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
    this.coreService.post('orders/add', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }

  addVariableToList(data): void {
    const arr = [];
    data.list.forEach(item => {
      arr.push({name: item.name, type: item.value.type});
    });
    let flag = false;
    for (const i in data.actualList) {
      for (const j in data.actualList[i]) {
        if (!data.actualList[i][j].value) {
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }
    if (!flag) {
      data.actualList.push(arr);
    }
  }

  addArgument(isNew = false): void {
    const param: any = {
      name: '',
      value: ''
    };
    if (this.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.arguments, 'name', '')) {
        if (isNew) {
          param.isTextField = true;
        }
        this.arguments.push(param);
      }
    }
  }

  removeArgument(index): void {
    this.arguments.splice(index, 1);
    this.updateSelectItems();
  }

  removeVariableFromList(index, list): void {
    list.splice(index, 1);
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      $event.preventDefault();
      this.addArgument();
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  openEditor(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        data: data.value
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value =  result;
        this.ref.detectChanges();
      }
    });
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
  @Output() isChanged: EventEmitter<any> = new EventEmitter();

  constructor(public modal: NzModalService, public coreService: CoreService, private router: Router) {
  }

  navToDetailView(view): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', this.workflow.path, this.workflow.versionId]);
  }

  addOrder(workflow): void {
    const modal = this.modal.create({
      nzTitle: undefined,
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
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.isChanged.emit({flag: true, isOrderAdded: workflow});
        setTimeout(() => {
          this.isChanged.emit({flag: false});
        }, 5000);
      }
    });
  }

  showDependency(workflow): void {
    if (!workflow.expectedNoticeBoards) {
      this.coreService.post('workflow/dependencies', {
        controllerId: this.schedulerId,
        workflowId: {
          path: workflow.path,
          version: workflow.versionId
        }
      }).subscribe((res) => {
        workflow.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
        workflow.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
        workflow.addOrderFromWorkflows = res.workflow.addOrderFromWorkflows;
        workflow.addOrderToWorkflows = res.workflow.addOrderToWorkflows;
        this.openModal(workflow);
      });
    } else {
      this.openModal(workflow);
    }
  }

  private openModal(workflow): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowDependencyComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        workflow
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}
