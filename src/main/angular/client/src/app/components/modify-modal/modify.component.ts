import {Component, inject} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {isArray, isEmpty, object} from 'underscore';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {AuthService} from "../guard";

@Component({
  selector: 'app-change-parameter',
  templateUrl: './change-parameter-dialog.html'
})
export class ChangeParameterModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  variable: any;
  order: any;
  plan: any;
  orders: any;
  orderIds: any;
  orderPreparation: any;
  workflow: any;

  permission: any = {};
  removeVariables = [];
  variables: any = [];
  variableList = [];
  forkListVariables = [];
  submitted = false;
  required = false;
  comments: any = {};
  schedule: any = {};
  display: any;
  newPositions: any;
  positions: any;
  blockPositions: any;
  blockPositionList: any;
  selectValue = [{value: 'True', name: true},
    {value: 'False', name: false}]

  positionObj = {
    blockPosition: '',
    startPosition: '',
    endPositions: []
  }

  constructor(private activeModal: NzModalRef, public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.variable = this.modalData.variable;
    this.order = this.modalData.order;
    this.plan = this.modalData.plan;
    this.orders = this.modalData.orders;
    this.orderIds = this.modalData.orderIds;
    this.orderPreparation = this.modalData.orderPreparation;
    this.workflow = this.modalData.workflow;
    const preferences = JSON.parse(sessionStorage['preferences']) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.display = preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.variable) {
      this.variables = Object.assign(this.variables, [this.coreService.clone(this.variable)]);
    } else if (this.order && (this.order.variables)) {
      if (!isArray(this.order.variables)) {
        this.order.variables = this.coreService.convertObjectToArray(this.order, 'variables');
      } else {
        this.variables = this.coreService.clone(this.order.variables);
      }
    } else if (this.order && (this.order.arguments)) {
      if (!isArray(this.order.arguments)) {
        this.order.arguments = this.coreService.convertObjectToArray(this.order, 'arguments');
      } else {
        this.variables = this.coreService.clone(this.order.arguments);
      }
    }
    this.updateVariableList();
    this.getPositions();
    if (this.variables.length === 0 && !this.variable) {
      this.addVariable();
    }
  }

  private getPositions(): void {
    if (this.workflow) {
      this.coreService.post('orders/add/positions', {
        controllerId: this.schedulerId,
        workflowId: {
          path: this.workflow.path,
          version: this.workflow.version
        }
      }).subscribe((res) => {
        this.positions = new Map()
        res.positions.forEach((item) => {
          this.positions.set(item.positionString, item.position);
        });

        this.blockPositions = new Map()
        this.blockPositionList = new Map();
        res.blockPositions.forEach((item) => {
          this.blockPositions.set(item.positionString, item.position);
          this.blockPositionList.set(item.positionString, item.positions);
        });
      });
    }
  }

  updateVariableList(): void {
    if (this.orderPreparation && this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type !== 'List') {
          let isExist = false;
          for (let i = 0; i < this.variables.length; i++) {
            if (this.variables[i].name === k) {
              this.variables[i].type = val.type;
              if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
                this.variables[i].isRequired = true;
              }
              if (val.final) {
                this.variables.splice(i, 1);
              }
              isExist = true;
              break;
            }
          }
          if (!isExist && !this.variable) {
            if (!val.final) {
              if (!val.default && val.default !== false && val.default !== 0) {
                this.variables.push({
                  name: k,
                  type: val.type,
                  isRequired: true,
                  facet: val.facet,
                  message: val.message
                });
              } else {
                if (val.type === 'String') {
                  this.coreService.removeSlashToString(val, 'default');
                } else if (val.type === 'Boolean') {
                  val.default = (val.default === 'true' || val.default === true);
                }
                this.variables.push({
                  name: k,
                  value: val.default,
                  default: val.default,
                  facet: val.facet,
                  message: val.message
                });
              }
            }
          }
        } else if (!this.variable || (this.variable && isArray(this.variable.value))) {
          const actualList = [];
          if (val.listParameters) {
            if (isArray(val.listParameters)) {
              val.listParameters.forEach((item) => {
                actualList.push({name: item.name, type: item.value.type});
              });
            } else {
              if (!isArray(val.listParameters)) {
                val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                  const val1: any = v1;
                  actualList.push({name: k1, type: val1.type});
                  return {name: k1, value: val1};
                });
              }
            }
            this.forkListVariables.push({name: k, list: val.listParameters, actualList: [actualList]});
          }
        }
        return {name: k, value: v};
      });
      this.variableList = this.variableList.filter((item) => {
        if (item.value.type === 'List') {
          return false;
        }
        return !item.value.final;
      });

      this.variables = this.variables.filter(item => {
        if (isArray(item.value)) {
          this.setForkListVariables(item, this.forkListVariables);
          return false;
        } else {
          return true;
        }
      });
    }
    this.updateSelectItems();
  }

  private setForkListVariables(sour, target): void {
    for (let x in target) {
      if (target[x].name === sour.name) {

        if (sour.value) {
          for (const i in sour.value) {
            if (!isArray(sour.value[i])) {
              sour.value[i] = Object.entries(sour.value[i]).map(([k1, v1]) => {
                let type;
                for (const prop in target[x].list) {
                  if (target[x].list[prop].name === k1) {
                    type = target[x].list[prop].value.type;
                    break;
                  }
                }
                return {name: k1, value: v1, type};
              });
            } else {
              for (const j in sour.value[i]) {
                for (const prop in target[x].list) {
                  if (target[x].list[prop].name === sour.value[i].name) {
                    sour.value[i].type = target[x].list[prop].value.type;
                    break;
                  }
                }
              }
            }
          }
        }
        target[x].actualList = sour.value;
        break;
      }
    }
  }

  selectStartNode(value, positions): void {
    if (value) {
      positions.endPositions = [];
    }
  }

  getNewPositions(positions): void {
    this.newPositions = undefined;
    if (positions) {
      this.newPositions = new Map();
      positions.forEach(item => {
        this.newPositions.set(item.positionString, (item.position));
      })
    }
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

  removeVariableFromList(index, list): void {
    list.splice(index, 1);
  }

  checkVariableType(variable): void {
    let obj = this.orderPreparation.parameters[variable.name];
    if (obj) {
      variable.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        variable.isRequired = true;
      } else {
        if (obj.type === 'Boolean') {
          variable.value = (obj.default === true || obj.default === 'true');
        } else {
          variable.value = obj.default;
        }
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    for (let i = 0; i < this.variableList.length; i++) {
      this.variableList[i].isSelected = false;
      for (let j = 0; j < this.variables.length; j++) {
        if (this.variableList[i].name === this.variables[j].name) {
          this.variableList[i].isSelected = true;
          this.variables[j].type = this.variableList[i].value.type;
          if (!this.variableList[i].value.default && this.variableList[i].value.default !== false && this.variableList[i].value.default !== 0) {
            this.variables[j].isRequired = true;
          }
          break;
        }
      }
    }
  }

  removeVariable(argu): void {
    this.removeVariables.push(argu.name)
    this.variables = this.variables.filter((item) => {
      return argu.name !== item.name;
    });
    this.updateSelectItems();
  }

  addVariable(isNew = false): void {
    const param: any = {
      name: '',
      value: ''
    };
    if (this.variables) {
      if (!this.coreService.isLastEntryEmpty(this.variables, 'name', '')) {
        if (isNew) {
          param.isTextField = true;
        }
        this.variables.push(param);
      }
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.variables, event.previousIndex, event.currentIndex);
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      $event.preventDefault();
      this.addVariable();
    }
  }

  onSubmit(): void {
    this.submitted = true;
    let obj: any = {
      controllerId: this.schedulerId,
      orderIds: []
    };
    if (this.variables.length > 0) {
      let argu = [...this.variables];
      if (this.coreService.isLastEntryEmpty(argu, 'name', '')) {
        argu.splice(argu.length - 1, 1);
      }
      if (argu.length > 0) {
        obj.variables = object(argu.map((val) => {
          if (!val.value && val.value !== false && val.value !== 0) {
            this.removeVariables.push(val.name);
          }
          return val.name ? [val.name, val.value] : null;
        }));
      }
    }
    if (this.order) {
      obj.orderIds.push(this.order.orderId);
    } else if (this.orders) {
      this.orders.forEach((order) => {
        obj.orderIds.push(order.orderId);
      });
    } else if (this.plan) {
      this.plan.value.forEach((order) => {
        obj.orderIds.push(order.orderId);
      });
    } else if (this.orderIds) {
      obj.orderIds = this.orderIds;
    }
    if (this.removeVariables.length > 0) {
      obj.removeVariables = this.removeVariables;
    }
    if (this.forkListVariables && this.forkListVariables.length > 0) {
      if (!obj.variables) {
        obj.variables = {};
      }
      this.forkListVariables.forEach((item) => {
        obj.variables[item.name] = [];
        if (item.actualList) {
          for (const i in item.actualList) {
            const listObj = {};
            item.actualList[i].forEach((data) => {
              listObj[data.name] = data.value;
            });
            obj.variables[item.name].push(listObj);
          }
        }
      });
    }
    if (this.positionObj.blockPosition && this.blockPositions && this.blockPositions?.size) {
      if (this.blockPositions.has(this.positionObj.blockPosition)) {
        obj.blockPosition = (this.blockPositions.get(this.positionObj.blockPosition));
      }
    }

    if (this.positionObj.startPosition) {
      if(this.newPositions && this.newPositions?.size > -1){
        if (this.newPositions.has(this.positionObj.startPosition)) {
          obj.startPosition = (this.newPositions.get(this.positionObj.startPosition));
        }
      } else if (this.positions && this.positions?.size) {
        if (this.positions.has(this.positionObj.startPosition)) {
          obj.startPosition = (this.positions.get(this.positionObj.startPosition));
        }
      }
    }
    if (this.positionObj.endPositions && this.positionObj.endPositions.length > 0) {
      obj.endPositions = [];
      this.positionObj.endPositions.forEach(pos => {
        if(this.newPositions && this.newPositions?.size > -1){
          if (this.newPositions.has(pos)) {
            obj.endPositions.push((this.newPositions.get(pos)));
          }
        } else if(this.positions && this.positions?.size) {
          if (this.positions.has(pos)) {
            obj.endPositions.push((this.positions.get(pos)));
          }
        }
      });
    }

    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    if (obj.variables || obj.removeVariables) {
      this.coreService.post('daily_plan/orders/modify', obj).subscribe({
        next: () => {
          this.activeModal.close(obj.variables);
        }, error: () => this.submitted = false
      });
    } else {
      this.submitted = false;
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-start-time',
  templateUrl: './start-time-dialog.html'
})
export class ModifyStartTimeModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId = '';
  order: any;
  orders: any;
  plan: any;
  preferences: any;
  isDailyPlan = false;
  submitted = false;
  dateFormat: any;
  errorMsg = false;
  dateType: any = {at: 'date', forceJobAdmission: false};
  zones = [];
  period: any = {};
  n1 = 0;
  n2 = 0;
  display: any;
  required = false;
  comments: any = {};

  constructor(private activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.order = this.modalData.order;
    this.orders = this.modalData.orders;
    this.plan = this.modalData.plan;
    this.preferences = this.modalData.preferences;
    this.isDailyPlan = this.modalData.isDailyPlan;
    if (this.orders) {
      this.n1 = this.orders.size;
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (!this.order) {
      this.order = {};
    }
    let isCyclic = false;
    let isStandalone = false;
    if (this.plan && this.plan.value) {
      this.plan.value.forEach((order) => {
        this.n1 = this.n1 + 1;
        if (order.cyclicOrder) {
          this.n2 = this.n2 + order.cyclicOrder.count;
        }
        if (order.cyclicOrder && !isCyclic) {
          isCyclic = true;
        }
        if (!order.cyclicOrder && !isStandalone) {
          isStandalone = true;
        }
      });
    } else if (this.orders && this.orders.size > 0) {
      this.n1 = 0;
      this.orders.forEach((order) => {
        if (order.cyclicOrder) {
          this.n2 = this.n2 + order.cyclicOrder.count;
        } else {
          this.n1 = this.n1 + 1;
        }
        if (order.cyclicOrder && !isCyclic) {
          isCyclic = true;
        }
        if (!order.cyclicOrder && !isStandalone) {
          isStandalone = true;
        }
      });
      if (this.n1 == 0 && this.n2 > 0) {
        this.n1 = this.orders.size;
      }
    }
    if (isCyclic && isStandalone) {
      this.order = null;
      this.errorMsg = true;
    } else if (isCyclic) {
      this.order.cyclicOrder = {};
    }
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.dateType.timeZone = this.preferences.zone;
  }

  static checkTime(time): string {
    if (/^\d{1,2}:\d{2}?$/i.test(time)) {
      time = time + ':00';
    } else if (/^\d{1,2}:\d{2}(:)?$/i.test(time)) {
      time = time + '00';
    } else if (/^\d{1,2}?$/i.test(time)) {
      time = time + ':00:00';
    }
    if (time === '00:00') {
      time = '00:00:00';
    } else if (time.length === 3) {
      time = time + '00:00';
    } else if (time.length === 4) {
      time = time + '0:00';
    } else if (time.length === 6) {
      time = time + '00';
    } else if (time.length === 7) {
      time = time + '0';
    }
    return time;
  }

  selectTime(time, isEditor = false): void {
    this.coreService.selectTime(time, isEditor, this.order);
  }

  onSubmit(): void {
    let obj: any = {
      controllerId: this.schedulerId,
      forceJobAdmission: this.dateType.forceJobAdmission,
      orderIds: []
    };
    if (this.plan) {
      this.plan.value.forEach((order) => {
        obj.orderIds.push(order.orderId);
      });
    } else if (this.order.orderId) {
      obj.orderIds.push(this.order.orderId);
    } else if (this.orders) {
      this.orders.forEach((order, k) => {
        obj.orderIds.push(k);
      });
    }
    if (isEmpty(this.period)) {
      if (this.dateType.at === 'now') {
        obj.scheduledFor = 'now';
      } else if (this.dateType.at === 'never') {
        obj.scheduledFor = 'never';
      } else if (this.dateType.at === 'later') {
        obj.scheduledFor = 'now + ' + this.order.atTime;
      } else {
        this.coreService.getDateAndTime(this.order);
        obj.scheduledFor = this.coreService.getDateByFormat(this.order.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
        obj.timeZone = this.dateType.timeZone;
      }
    } else {
      obj.cycle = {
        repeat: ModifyStartTimeModalComponent.checkTime(this.period.repeat),
        begin: ModifyStartTimeModalComponent.checkTime(this.period.begin),
        end: ModifyStartTimeModalComponent.checkTime(this.period.end),
      };
      obj.timeZone = this.dateType.timeZone;
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
    this.submitted = true;
    this.coreService.post('daily_plan/orders/modify', obj).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => this.submitted = false
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}
