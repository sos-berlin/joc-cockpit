import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {isEmpty} from 'underscore';

@Component({
  selector: 'app-resume-order',
  templateUrl: './resume-order-dialog.html',
})
export class ResumeOrderModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() order: any;
  @Input() orders: any;
  @Input() isParametrized: any;
  workflow: any;
  display: any;
  submitted = false;
  comments: any = {};
  position: any;
  arguments: any = [];
  variableList = [];
  orderPreparation: any;

  constructor(public coreService: CoreService, private modal: NzModalRef) {
  }

  ngOnInit(): void {
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (!this.order && this.orders && this.orders.size > 0) {
      this.order = this.orders.values().next().value;
    }
    this.order.timeZone = this.preferences.zone;
    this.order.fromTime = new Date();
    if (!this.order.positionString) {
      this.order.positionString = '0';
    }
    this.getWorkflow();
  }

  private getWorkflow(): void {
    this.coreService.post('workflow', {
      controllerId: this.schedulerId,
      workflowId: this.order.workflowId ? this.order.workflowId : {path: this.order.workflowPath}
    }).subscribe((res: any) => {
      this.workflow = {};
      this.workflow.jobs = res.workflow.jobs;
      this.orderPreparation = res.workflow.orderPreparation;
      this.workflow.configuration = {instructions: res.workflow.instructions};
      this.convertTryToRetry(this.workflow.configuration);
      if (this.isParametrized) {
        this.updateVariableList();
      }
    });
  }

  convertTryToRetry(mainJson: any): void {
    const self = this;
    let flag = false;

    function recursive(json: any) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Execute.Named') {
            json.instructions[x].TYPE = 'Job';
          }
          if (!flag) {
            json.instructions[x].show = true;
          }
          if (json.instructions[x].positionString) {
            if (self.order.positionString && self.order.positionString == json.instructions[x].positionString) {
              flag = true;
              json.instructions[x].order = self.order;
            }
          }

          if (json.instructions[x].TYPE === 'Try') {
            let isRetry = false;
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length === 1
                && json.instructions[x].catch.instructions[0].TYPE === 'Retry') {
                json.instructions[x].TYPE = 'Retry';
                json.instructions[x].instructions = json.instructions[x].try.instructions;
                isRetry = true;
                delete json.instructions[x].try;
                delete json.instructions[x].catch;
              }
            }
            if (!isRetry) {
              if (json.instructions[x].try) {
                json.instructions[x].instructions = json.instructions[x].try.instructions || [];
                delete json.instructions[x].try;
              }
              if (json.instructions[x].catch) {
                if (!json.instructions[x].catch.instructions) {
                  json.instructions[x].catch.instructions = [];
                }
              } else {
                json.instructions[x].catch = {instructions: []};
              }
            }
          }
          if (json.instructions[x].TYPE === 'Lock') {
            if (json.instructions[x].lockedWorkflow) {
              json.instructions[x].instructions = json.instructions[x].lockedWorkflow.instructions;
              delete json.instructions[x].lockedWorkflow;
            }
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              if (!flag) {
                json.instructions[x].catch.show = true;
              }
              recursive(json.instructions[x].catch);
              if (json.instructions[x].catch.positionString) {
                if (self.order.positionString && self.order.positionString == json.instructions[x].catch.positionString) {
                  flag = true;
                  json.instructions[x].catch.order = self.order;
                }
              }
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            if (!flag) {
              json.instructions[x].then.show = true;
            }
            recursive(json.instructions[x].then);
            if (json.instructions[x].then.positionString) {
              if (self.order.positionString && self.order.positionString == json.instructions[x].then.positionString) {
                flag = true;
                json.instructions[x].then.order = self.order;
              }
            }
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            if (!flag) {
              json.instructions[x].else.show = true;
            }
            recursive(json.instructions[x].else);
            if (json.instructions[x].else.positionString) {
              if (self.order.positionString && self.order.positionString == json.instructions[x].else.positionString) {
                flag = true;
                json.instructions[x].else.order = self.order;
              }
            }
          }
          if (json.instructions[x].branches) {
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
              branch.instructions = branch.workflow.instructions;
              delete branch.workflow;
              return (branch.instructions && branch.instructions.length > 0);
            });
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i]) {
                if (!flag) {
                  json.instructions[x].branches[i].show = true;
                }
                recursive(json.instructions[x].branches[i]);
                if (json.instructions[x].branches[i].positionString) {
                  if (self.order.positionString && self.order.positionString == json.instructions[x].branches[i].positionString) {
                    flag = true;
                    json.instructions[x].branches[i].order = self.order;
                  }
                }
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
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
    if (this.isParametrized && this.arguments.length > 0) {
      let argu = [...this.arguments];
      if (this.coreService.isLastEntryEmpty(argu, 'name', '')) {
        argu.splice(argu.length - 1, 1);
      }
      if (argu.length > 0) {
        obj.arguments = this.coreService.keyValuePair(argu);
      }
    }
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
    this.coreService.post('orders/resume', obj).subscribe((res: any) => {
      this.submitted = false;
      this.modal.close('Done');
    }, () => {
      this.submitted = false;
    });
  }

  cancel(): void {
    this.modal.destroy();
  }

  onDrop(postion): void {
    this.updateOrder(postion);
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.arguments, event.previousIndex, event.currentIndex);
  }

  updateVariableList(): void {
    if (this.orderPreparation && this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (!val.final) {
          if (!val.default && val.default !== false && val.default !== 0) {
            this.arguments.push({name: k, type: val.type, isRequired: true});
          } else{
            this.coreService.removeSlashToString(val, 'default');
          }
        }
        return {name: k, value: val};
      });
      this.variableList = this.variableList.filter((item) => {
        return !item.value.final;
      });
    }
    this.updateSelectItems();
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

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      $event.preventDefault();
      this.addArgument();
    }
  }

  checkVariableType(argument): void {
    let obj = this.orderPreparation.parameters[argument.name];
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

  private updateOrder(position): void {
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
