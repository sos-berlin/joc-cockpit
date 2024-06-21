import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {isArray} from "underscore";
import {CoreService} from '../../services/core.service';
import {ValueEditorComponent} from '../value-editor/value.component';
import {WorkflowService} from "../../services/workflow.service";

@Component({
  selector: 'app-resume-order',
  templateUrl: './resume-order-dialog.html',
})
export class ResumeOrderModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  preferences: any;
  order: any;
  orders: any;
  workflow: any;
  display: any;
  submitted = false;
  required = false;
  disabledDrag = false;
  comments: any = {};
  position: any;
  positions: any;
  variables: any = [];
  constants = [];
  allowVariable = true;
  withCyclePosition = false;
  object = {
    setOfCheckedValue: new Set(),
    checked: false,
    indeterminate: false
  }

  constructor(public coreService: CoreService, private activeModal: NzModalRef,
              private modal: NzModalService, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.preferences = this.modalData.preferences;
    this.order = this.modalData.order;
    this.orders = this.modalData.orders;
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (!this.order && this.orders && this.orders.size > 0) {
      this.order = this.orders.values().next().value;
    }
    this.order.timeZone = this.preferences.zone;
    this.order.fromTime = new Date();
    if (!this.order.positionString) {
      this.order.positionString = '0';
    }
    let pos;
    if (this.orders && this.orders.size > 1) {
      this.orders.forEach((item) => {
        if (!pos) {
          pos = item.positionString;
        } else if (pos !== item.positionString) {
          this.disabledDrag = true;
          return;
        }
      });
    }
    this.getPositions();
    this.getWorkflow();
  }

  private getPositions(): void {
    this.coreService.post('orders/resume/positions', {
      controllerId: this.schedulerId,
      orderIds: this.orders ? [...this.orders.keys()] : [this.order.orderId]
    }).subscribe({
      next: (res: any) => {
        if (res) {
          this.withCyclePosition = res.withCyclePosition;
          if (res.variablesNotSettable) {
            this.allowVariable = false;
          } else {
            this.variables = this.coreService.convertObjectToArray(res, 'variables');
            this.variables.forEach((val) => {
              if (val.value && isArray(val.value)) {
                val.isArray = true;
                val.value = val.value.map(item => {
                  return {value: item}
                })
              }
            });
          }
          this.constants = this.coreService.convertObjectToArray(res, 'constants');
          this.constants.forEach((item) => {
            if(item.value) {
              if (!(typeof item.value === 'object')) {
                this.coreService.removeSlashToString(item, 'value');
                if(typeof item.value == 'string') {
                  const startChar = item.value.substring(0, 1);
                  const endChar = item.value.substring(item.value.length - 1);
                  if ((startChar === '"' && endChar === '"') || (startChar === "'" && endChar === "'")) {
                    item.value = item.value.substring(1, item.value.length - 1);
                  }
                }
              } else {
                if(!Array.isArray(item.value)) {
                  let v: any = [];
                  Object.entries(item.value).map(([k1, v1]) => {
                    v.push({k1: v1})
                  });
                  item.type = 'map';
                  item.value = v;
                  item.value.forEach((val, index) => {
                    item.value[index] = Object.entries(item.value[index]).map(([k1, v1]) => {
                      return {name: k1, value: v1};
                    });
                  });
                  item.value.forEach((val) => {
                    this.coreService.removeSlashToString(val, 'value');
                  });
                } else {
                  item.type = 'list';
                  item.value.forEach((val, index) => {
                    item.value[index] = Object.entries(item.value[index]).map(([k1, v1]) => {
                      return {name: k1, value: v1};
                    });
                  });
                  item.value.forEach((val) => {
                    this.coreService.removeSlashToString(val, 'value');
                  });
                }
              }
            }
          });
          this.positions = res.positions.map((pos) => pos.positionString);
        }
      }, error: () => this.positions = []
    });
  }

  private getWorkflow(): void {
    this.coreService.post('workflow', {
      controllerId: this.schedulerId,
      workflowId: this.order.workflowId ? this.order.workflowId : {path: this.order.workflowPath}
    }).subscribe((res: any) => {
      this.workflow = {};
      this.workflow.jobs = res.workflow.jobs;
      this.workflow.configuration = {instructions: res.workflow.instructions};
      this.checkPositions();
    });
  }


  private checkPositions(): void {
    if (this.positions) {
      this.coreService.convertTryToRetry(this.workflow.configuration, this.positions, '', true, this.order);
    } else {
      setTimeout(() => {
        this.checkPositions();
      }, 50);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerId: this.schedulerId, orderIds: []
    };
    if (this.orders) {
      obj.orderIds = [...this.orders.keys()];
    } else {
      obj.orderIds.push(this.order.orderId);
    }
    if (this.position) {
      obj.position = this.position;
    } else if (this.order.position) {
      obj.position = this.order.position;
    }
    if (this.allowVariable && this.variables.length > 0) {
      let argu = this.variables.filter((item) => {
        return item.name && this.object.setOfCheckedValue.has(item.name);
      });
      if (argu.length > 0) {
        obj.variables = this.coreService.keyValuePair(argu);
        for (let i in obj.variables) {
          if (isArray(obj.variables[i])) {
            obj.variables[i] = obj.variables[i].map(val => val.value)
          }
        }
      }
    }
    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    if (this.withCyclePosition && this.order.cycleEndTime) {
      obj.cycleEndTime = this.workflowService.convertStringToDuration(this.order.cycleEndTime, true);
    }
    this.coreService.post('orders/resume', obj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  /*--------------- Checkbox functions -------------*/

  onAllChecked(isChecked: boolean): void {
    if (!isChecked) {
      this.object.indeterminate = false;
      this.object.setOfCheckedValue.clear();
    } else {
      this.variables.forEach(item => this.updateCheckedSet(item, isChecked));
    }
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item, checked);
  }

  updateCheckedSet(data: any, checked: boolean): void {
    if (data.name && (data.value || data.value == 0 || data.value == false)) {
      if (checked) {
        this.object.setOfCheckedValue.add(data.name);
      } else {
        this.object.setOfCheckedValue.delete(data.name);
      }
    }
    this.object.checked = this.variables.every(item => {
      return this.object.setOfCheckedValue.has(item.name);
    });
    this.object.indeterminate = this.object.setOfCheckedValue.size > 0 && !this.object.checked;
  }

  onDrop(position): void {
    let index;
    if (position && position.match('$')) {
      const positionArr = position.split('$');
      for (const i in this.positions) {
        let flag = false;
        for (const j in positionArr) {
          if (this.positions[i] === positionArr[j]) {
            index = j;
            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
      }
    }
    this.updateOrder(position, index);
  }

  openEditor(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzData: {
        data: data.value
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
      }
    });
  }

  addArgument(): void {
    const param: any = {
      name: '',
      value: ''
    };
    if (this.variables) {
      if (!this.coreService.isLastEntryEmpty(this.variables, 'name', '')) {
        this.variables.push(param);
      }
    }
  }

  removeArgument(index): void {
    this.variables.splice(index, 1);
  }

  addArgumentVal(list): void {
    list.push({value: ''});
  }

  removeArgumentVal(list, index): void {
    list.splice(index, 1);
  }

  onKeyPress($event, argument): void {
    if (argument.name && argument.value) {
      this.onItemChecked(argument, true);
    }
    if ($event.which === '13' || $event.which === 13) {
      $event.preventDefault();
      this.addArgument();
    }
  }

  private updateOrder(position, index = -1): void {
    const self = this;

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          delete json.instructions[x].order;
          if (position === json.instructions[x].positionString) {
            json.instructions[x].order = self.order;
            self.position = json.instructions[x].position;
          }
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  delete json.instructions[x].branches[i].order;
                  if (position === json.instructions[x].branches[i].positionString) {
                    json.instructions[x].branches[i].order = self.order;
                    self.position = json.instructions[x].branches[i].position;
                  }
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
            if (index > -1) {
              if (json.instructions[x].join && json.instructions[x].join.order) {
                delete json.instructions[x].join.order;
              }
              if (json.instructions[x].join && json.instructions[x].join.unique === position) {
                json.instructions[x].join.order = self.order;
                self.position = json.instructions[x].join.positionStrings[index];
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              delete json.instructions[x].catch.order;
              if (position === json.instructions[x].catch.positionString) {
                json.instructions[x].catch.order = self.order;
                self.position = json.instructions[x].catch.position;
              }
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            delete json.instructions[x].then.order;
            if (position === json.instructions[x].then.positionString) {
              json.instructions[x].then.order = self.order;
              self.position = json.instructions[x].then.position;
            }
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            delete json.instructions[x].else.order;
            if (position === json.instructions[x].else.positionString) {
              json.instructions[x].else.order = self.order;
              self.position = json.instructions[x].else.position;
            }
            recursive(json.instructions[x].else);
          }
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              delete json.branches[i].order;
              if (position === json.branches[i].positionString) {
                json.branches[i].order = self.order;
              }
              recursive(json.branches[i]);
            }
          }
        }
      }
    }

    recursive(this.workflow.configuration);
  }

}
