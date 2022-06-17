import {Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {isEmpty, isArray} from 'underscore';
import {differenceInCalendarDays} from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {ValueEditorComponent} from '../../../components/value-editor/value.component';
import {AuthService} from '../../../components/guard';
import {WorkflowService} from '../../../services/workflow.service';
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";

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
  startNodes = [];
  endnodes = [];
  positions = new Map();

  constructor(public coreService: CoreService, private activeModal: NzModalRef,
              private modal: NzModalService, private ref: ChangeDetectorRef, private workflowService: WorkflowService) {
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
        res.positions.forEach((item) => {
          this.positions.set(item.positionString, JSON.stringify(item.position));
        });
        let instructions = this.workflow.actual || this.workflow.instructions;
        instructions.forEach(element => {
          let flag = true;
          if (element.TYPE === 'Try') {
            element.catch.instructions.forEach(ele => {
              if (ele.TYPE === 'Retry') {
                flag = false;
                this.startNodes.push({name: element.jobName || ele.TYPE, position: element.positionString});
              }
            });
          }
          if (flag) {
            this.startNodes.push({
              name: element.jobName || (element.TYPE !== 'ImplicitEnd' ? element.TYPE : '--- end ---'),
              position: element.positionString
            });
          }
        })
        this.recursiveUpdate(null);
      }, error: () => this.submitted = false
    });
  }

  recursiveUpdate(position): void {
    const self = this;
    let nodes: any = {
      children: []
    };
    let flag = false;
    function recursive(json, obj) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          let skip = false;
          let isEnable = self.positions.has(json.instructions[x].positionString);
          if (!position || json.instructions[x].positionString === position) {
            flag = true;
          }
          if(json.instructions[x].positionString === position && isEnable){
            skip = true;
          }
          if (!self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE)) {
            if (flag && !skip) {
              obj.children.push({
                title: json.instructions[x].jobName || (json.instructions[x].TYPE !== 'ImplicitEnd' ? json.instructions[x].TYPE : '--- end ---'),
                key: json.instructions[x].positionString,
                disabled: !isEnable,
                isLeaf: true
              });
            }
          } else {
            if (json.instructions[x].TYPE === 'Fork') {
              if (json.instructions[x].branches) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                for (let i = 0; i < json.instructions[x].branches.length; i++) {
                  if (json.instructions[x].branches[i].workflow.instructions) {
                    let obj1 = {
                      title: json.instructions[x].branches[i].id,
                      disabled: true,
                      key: json.instructions[x].positionString + json.instructions[x].branches[i].id,
                      children: []
                    };
                    if (flag && !skip) {
                      _obj.children.push(obj1);
                    }
                    recursive(json.instructions[x].branches[i].workflow, obj1);
                  }
                }
              }
            }

            if (json.instructions[x].instructions) {
              recursive(json.instructions[x], obj);
            }
            if (json.instructions[x].TYPE === 'Try') {
              let isRetry = false;
              json.instructions[x].catch.instructions.forEach(element => {
                if (element.TYPE === 'Retry') {
                  isRetry = true;
                }
              })
              let _obj = {
                title: isRetry ? 'Retry' : json.instructions[x].TYPE,
                key: json.instructions[x].positionString,
                disabled: !isEnable,
                children: []
              };
              if (flag && !skip) {
                obj.children.push(_obj);
              }
              if (json.instructions[x].try) {
                if (json.instructions[x].try.instructions && json.instructions[x].try.instructions.length > 0) {
                  recursive(json.instructions[x].try, _obj);
                }
              }
              if (!isRetry) {
                let obj1 = {
                  title: "catch",
                  disabled: !isEnable,
                  key: json.instructions[x].positionString + "catch",
                  children: []
                };
                _obj.children.push(obj1);
                recursive(json.instructions[x].catch, obj1);
              }
            }
            if (json.instructions[x].TYPE === 'If') {
              let _obj = {
                title: json.instructions[x].TYPE,
                disabled: !isEnable,
                key: json.instructions[x].positionString,
                children: []
              };
              if (flag && !skip) {
                obj.children.push(_obj);
              }
              if (json.instructions[x].then && json.instructions[x].then.instructions) {
                recursive(json.instructions[x].then, _obj);
              }
              if (json.instructions[x].else && json.instructions[x].else.instructions) {
                let obj1 = {
                  title: "Else",
                  disabled: true,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  _obj.children.push(obj1);
                }
                recursive(json.instructions[x].else, obj1);
              }
            }
            if (json.instructions[x].TYPE === 'Cycle') {
              if (json.instructions[x].cycleWorkflow) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                recursive(json.instructions[x].cycleWorkflow, _obj);
              }
            }
            if (json.instructions[x].TYPE === 'Lock') {
              if (json.instructions[x].lockedWorkflow) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                recursive(json.instructions[x].lockedWorkflow, _obj);
              }
            }
            if (json.instructions[x].TYPE === 'ForkList') {
              if (json.instructions[x].workflow) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                recursive(json.instructions[x].workflow, _obj);
              }
            }
          }

        }
      }
    }

    recursive({
      instructions: this.workflow.actual || this.workflow.instructions
    }, nodes);
    self.endnodes = nodes.children;
  }

  selectStartNode(value) {
    this.recursiveUpdate(value);
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
    if (this.order.startPosition) {
      order.startPosition = JSON.parse(this.positions.get(this.order.startPosition))
    }
    if (this.order.endPosition) {
      order.endPosition = JSON.parse(this.positions.get(this.order.endPosition));
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
      nzComponentParams: {
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

  suspend(workflow, paths?, cb?): void {
    this.suspendResumeOperation('Suspend', workflow, paths, cb);
  }

  resume(workflow, paths?, cb?): void {
    this.suspendResumeOperation('Resume', workflow, paths, cb);
  }

  private suspendResumeOperation(type, workflow, paths?, cb?) {
    let obj = {
      controllerId: this.schedulerId,
      workflowPaths: workflow ? [workflow.path] : paths
    };
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
        nzComponentParams: {
          comments,
          obj,
          url: 'workflows/' + (type === 'Resume' ? 'resume' : 'suspend')
        },
        nzFooter: null,
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
    } else {
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
