import {ChangeDetectorRef, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {isArray, isEmpty} from 'underscore';
import {CoreService} from '../../../services/core.service';
import {ValueEditorComponent} from '../../../components/value-editor/value.component';
import {AuthService} from '../../../components/guard';
import {WorkflowService} from '../../../services/workflow.service';
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../../components/comfirm-modal/confirm.component";

@Component({
  selector: 'app-show-dependency',
  templateUrl: './show-dependency-dialog.html'
})
export class ShowDependencyComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  workflow: any;
  schedulerId: any;
  permission: any = {}
  loading = true;

  constructor(private coreService: CoreService, private activeModal: NzModalRef, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.workflow = this.modalData.workflow;
    this.schedulerId = this.modalData.schedulerId;
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getDependencies();
  }

  private getDependencies(): void {
    if (!this.workflow.expectedNoticeBoards && this.schedulerId) {
      this.coreService.post('workflow/dependencies', {
        controllerId: this.schedulerId,
        workflowId: {
          path: this.workflow.path,
          version: this.workflow.versionId
        }
      }).subscribe({
        next: (res) => {
          this.workflow.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
          this.workflow.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
          this.workflow.consumeNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'consumeNoticeBoards');
          this.workflow.addOrderFromWorkflows = res.workflow.addOrderFromWorkflows;
          this.workflow.addOrderToWorkflows = res.workflow.addOrderToWorkflows;
          this.loading = false;
        }, error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  close(): void {
    this.activeModal.destroy();
  }

  showWorkflow(workflow): void {
    this.coreService.showWorkflow(workflow);
    this.close();
  }

  showBoard(board): void {
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
export class AddOrderModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  permission: any;
  preferences: any;
  workflow: any;

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
  schedules: any;
  selectedSchedule: any;
  positions: any;
  newPositions: any;
  blockPositions: any;
  positionList: any;
  blockPositionList: any;
  object = {
    orderName: '',
    name: ''
  }

  constructor(public coreService: CoreService, private activeModal: NzModalRef,
              private modal: NzModalService, private ref: ChangeDetectorRef, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.permission = this.modalData.permission;
    this.preferences = this.modalData.preferences;
    this.workflow = this.modalData.workflow;

    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    this.order.timeZone = this.preferences.zone;
    this.order.at = 'now';
    if (!this.workflow.configuration) {
      this.workflow.configuration = this.coreService.clone(this.workflow);
      this.workflowService.convertTryToRetry(this.workflow.configuration, null, {}, {count: 0});

    }
    this.getPositions();
    this.updateVariableList();
  }

  private getPositions(): void {
    this.coreService.post('orders/add/positions', {
      controllerId: this.schedulerId,
      workflowId: {
        path: this.workflow.path,
        version: this.workflow.version
      }
    }).subscribe({
      next: (res) => {
        this.positions = new Map();
        this.positionList = new Map();
        res.positions.forEach((item) => {
          this.positions.set(item.positionString, JSON.stringify(item.position));
          this.positionList.set(JSON.stringify(item.position), item.positionString);
        });

        this.blockPositions = new Map();
        this.blockPositionList = new Map();
        res.blockPositions.forEach((item) => {
          this.blockPositions.set(item.positionString, JSON.stringify(item.position));
          this.blockPositionList.set(JSON.stringify(item.position), JSON.stringify(item));
        });
      }, error: () => this.submitted = false
    });
  }

  updateVariableList(): void {
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type !== 'List') {
          if (!val.final) {
            let list;
            if (val.list) {
              list = [];
              val.list.forEach((item) => {
                let obj = {name: item}
                this.coreService.removeSlashToString(obj, 'name');
                list.push(obj);
              });
            }
            if (!val.default && val.default !== false && val.default !== 0) {
              this.arguments.push({
                name: k,
                type: val.type,
                isRequired: true,
                facet: val.facet,
                message: val.message,
                list: list
              });
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

  checkVariableType(argument): void {
    const obj = this.workflow.orderPreparation.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      } else {
        if (obj.type === 'Boolean') {
          argument.value = (obj.default === true || obj.default === 'true');
        } else {
          argument.value = obj.default;
        }
      }
      if (obj.facet) {
        argument.facet = obj.facet;
        argument.message = obj.message;
      }
      if (obj.list) {
        argument.list = [];
        let isFound = false;
        obj.list.forEach((item) => {
          let obj = {name: item};
          if (argument.value === item) {
            isFound = true;
          }
          this.coreService.removeSlashToString(obj, 'name');
          argument.list.push(obj);
        });
        if (!isFound) {
          argument.list.push({name: argument.value, default: true});
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

  getNewPositions(positions): void {
    this.newPositions = undefined;
    if (positions) {
      this.newPositions = new Map();
      positions.positions.forEach(item => {
        this.newPositions.set(item.positionString, JSON.stringify(item.position));
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId,
      orders: []
    };

    const order: any = {
      workflowPath: this.workflow.path,
      orderName: this.order.orderId,
      forceJobAdmission: this.order.forceJobAdmission
    };
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
    if (this.order.blockPosition && this.blockPositions && this.blockPositions?.size) {
      if (this.blockPositions.has(this.order.blockPosition)) {
        order.blockPosition = JSON.parse(this.blockPositions.get(this.order.blockPosition));
      }
    }

    if (this.order.startPosition) {
      if(this.newPositions && this.newPositions?.size){
        if (this.newPositions.has(this.order.startPosition)) {
          order.startPosition = JSON.parse(this.newPositions.get(this.order.startPosition));
        }
      } else if (this.positions && this.positions?.size) {
        if (this.positions.has(this.order.startPosition)) {
          order.startPosition = JSON.parse(this.positions.get(this.order.startPosition));
        }
      }
    }

    if (this.order.endPositions && this.order.endPositions.length > 0) {
      order.endPositions = [];
      this.order.endPositions.forEach(pos => {
        if(this.newPositions && this.newPositions?.size){
          if (this.newPositions.has(pos)) {
            order.endPositions.push(JSON.parse(this.newPositions.get(pos)));
          }
        } else if(this.positions && this.positions?.size) {
          if (this.positions.has(pos)) {
            order.endPositions.push(JSON.parse(this.positions.get(pos)));
          }
        }
      });
    }
    obj.orders.push(order);
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
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

  addArguments(): void {
    this.variableList.forEach(variable => {
      if (!variable.isSelected) {
        const param: any = {
          name: variable.name,
          value: ''
        };
        this.arguments.push(param);
        this.checkVariableType(param)
      }
    });
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
      nzAutofocus: null,
      nzData: {
        data: data.value,
        object: data
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
        this.ref.detectChanges();
      }
    });
  }

  selectSchedule(name): void {
    this.object.orderName = '';
    for (let i in this.schedules) {
      if (this.schedules[i].name == name) {
        this.selectedSchedule = this.schedules[i];
        if (this.selectedSchedule.orderParameterisations && this.selectedSchedule.orderParameterisations.length == 1) {
          this.selectOrder(this.selectedSchedule.orderParameterisations[0].name || '-');
        }
        break;
      }
    }
  }

  selectOrder(name): void {
    this.order.reload = false;
    if (name && name !== '-') {
      this.order.orderId = name;
    }

    for (let i in this.selectedSchedule.orderParameterisations) {
      if (this.selectedSchedule.orderParameterisations[i].orderName == name ||
        (this.selectedSchedule.orderParameterisations[i].orderName == '' && name == '-') || this.selectedSchedule.orderParameterisations.length == 1) {
        this.updateVariablesFromSchedule(this.selectedSchedule.orderParameterisations[i]);
        if (this.selectedSchedule.orderParameterisations[i].positions) {
          if (this.selectedSchedule.orderParameterisations[i].positions.blockPosition) {
            this.order.blockPosition = this.blockPositionList.get(JSON.stringify(this.selectedSchedule.orderParameterisations[i].positions.blockPosition));
          }
          if (this.selectedSchedule.orderParameterisations[i].positions.startPosition) {
            this.order.startPosition = this.positionList.get(JSON.stringify(this.selectedSchedule.orderParameterisations[i].positions.startPosition));
          }
          if (this.selectedSchedule.orderParameterisations[i].positions.endPositions && this.selectedSchedule.orderParameterisations[i].positions.endPositions.length > 0) {
            this.order.endPositions = [];
            this.selectedSchedule.orderParameterisations[i].positions.endPositions.forEach(item => {
              this.order.endPositions.push(this.positionList.get(JSON.stringify(item)));
            })
          }
          this.order.reload = true;
        }
        break;
      }
    }
  }

  private updateVariablesFromSchedule(orderParameterisations): void {
    this.arguments = [];
    this.forkListVariables = [];
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type !== 'List') {
          if (!val.final) {
            let list;
            if (val.list) {
              list = [];
              val.list.forEach((item) => {
                let obj = {name: item}
                this.coreService.removeSlashToString(obj, 'name');
                list.push(obj);
              });
            }
            for (let x in orderParameterisations.variables) {
              if (k == x) {
                this.arguments.push({
                  name: k,
                  type: val.type,
                  isRequired: true,
                  facet: val.facet,
                  message: val.message,
                  value: orderParameterisations.variables[x],
                  list: list
                });
                break;
              }
            }
          }
        } else {
          const actualList = [];
          if (val.listParameters) {
            if (!isArray(val.listParameters)) {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                return {name: k1, value: val1};
              });
            }

            for (let x in orderParameterisations.variables) {
              if (k === x) {
                let flag = false;
                if (isArray(orderParameterisations.variables[x])) {
                  orderParameterisations.variables[x].forEach((key) => {
                    let arr = [];
                    for (let y in val.listParameters) {
                      if (key[val.listParameters[y].name]) {
                        arr.push({
                          name: val.listParameters[y].name,
                          type: val.listParameters[y].value.type,
                          value: key[val.listParameters[y].name]
                        });
                      }
                    }
                    if (arr.length > 0) {
                      actualList.push(arr);
                    }
                  });
                }
              }
            }
            if (actualList.length === 0) {
              let arr = [];
              val.listParameters.forEach((item) => {
                arr.push({name: item.name, type: item.value.type});
              });
              if (arr.length > 0) {
                actualList.push(arr);
              }
            }
            this.forkListVariables.push({name: k, list: val.listParameters, actualList: actualList});
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

  assignParameterizationFromSchedules(): void {
    if (!this.schedules) {
      this.coreService.post('workflow/order_templates', {
        controllerId: this.schedulerId,
        workflowPath: this.workflow.path
      }).subscribe({
        next: (res) => {
          this.schedules = res.schedules;
        }
      });
    }
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
  @Input() isDisabled: boolean;
  @Output() isChanged: EventEmitter<any> = new EventEmitter();

  constructor(public modal: NzModalService, public coreService: CoreService, private router: Router) {
  }

  navToDetailView(view): void {
    this.coreService.getWorkflowDetailTab().pageView = view;
    this.router.navigate(['/workflows/workflow_detail', this.workflow.path, this.workflow.versionId]).then();
  }

  transitionOrders(workflow): void {
    let obj: any = {
      controllerId: this.schedulerId,
      workflowId: {
        path: workflow.path,
        versionId: workflow.versionId
      }
    };
    if (this.preferences.auditLog) {
      let comments: any = {
        radio: 'predefined',
        type: 'Workflow',
        operation: 'Transition Orders',
        name: workflow.path
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = {
            comment: comments.comment,
            ticketLink: comments.ticketLink,
            timeSpent: comments.timeSpent,
          };
          this.isChanged.emit({flag: true});
          this.coreService.post('workflow/transition', obj).subscribe({
            next: () => {
              this.resetAction();
            }, error: () => this.isChanged.emit({flag: false})
          });
        }
      });
    } else {
      this.isChanged.emit({flag: true});
      this.coreService.post('workflow/transition', obj).subscribe({
        next: () => {
          this.resetAction();
        }, error: () => this.isChanged.emit({flag: false})
      });
    }
  }

  suspend(workflow, paths?, cb?): void {
    this.suspendResumeOperation('Suspend', workflow, paths, cb);
  }

  resume(workflow, paths?, cb?): void {
    this.suspendResumeOperation('Resume', workflow, paths, cb);
  }

  private suspendResumeOperation(type, workflow, paths?, cb?) {
    let obj: any = {
      controllerId: this.schedulerId,
    };
    if (workflow || typeof paths != 'boolean') {
      obj.workflowPaths = workflow ? [workflow.path] : paths;
    } else {
      obj.all = true;
    }
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Workflow',
        operation: type,
        name: workflow ? workflow.path : paths.join(',')
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj,
          url: 'workflows/' + (type === 'Resume' ? 'resume' : 'suspend')
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isChanged.emit({flag: true});
          this.resetAction();
          if (cb) {
            cb();
          }
        }
      });
    } else if (paths != true) {
      this.resetCall(type, cb, obj);
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title2: type === 'Resume' ? 'resumeAll' : 'suspendAll',
          message2: type === 'Resume' ? 'resumeAllWarning' : 'suspendAllWarning'
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((result) => {
        if (result) {
          this.resetCall(type, cb, obj);
        }
      });
    }
  }

  private resetCall(type, cb, obj): void {
    this.isChanged.emit({flag: true});
    this.coreService.post('workflows/' + (type === 'Resume' ? 'resume' : 'suspend'), obj).subscribe({
      next: () => {
        this.resetAction();
        if (cb) {
          cb();
        }
      }, error: () => this.isChanged.emit({flag: false})
    });
  }

  addOrder(workflow): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddOrderModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
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
        this.resetAction();
      }
    });
  }

  private resetAction(): void {
    setTimeout(() => {
      this.isChanged.emit({flag: false});
    }, 5000);
  }

  showDependency(workflow): void {
    this.openModal(workflow);
  }

  private openModal(workflow): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowDependencyComponent,
      nzClassName: 'lg',
      nzData: {
        workflow,
        schedulerId: this.schedulerId
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }
}
