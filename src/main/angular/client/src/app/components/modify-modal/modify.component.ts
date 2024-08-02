import {Component, inject} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {isArray, isEmpty, object} from 'underscore';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {AuthService} from "../guard";
import {ValueEditorComponent} from "../value-editor/value.component";
import { ConfirmModalComponent } from '../comfirm-modal/confirm.component';
import {NgModel} from "@angular/forms";

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
  allowUndeclaredVariables: boolean;
  selectValue = [{name: 'True', value: true},
    {name: 'False', value: false}];
  positionObj = {
    blockPosition: '',
    startPosition: '',
    endPositions: []
  };

  constructor(private activeModal: NzModalRef, public coreService: CoreService, private authService: AuthService,
              private modal: NzModalService) {
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
    this.allowUndeclaredVariables = sessionStorage['allowUndeclaredVariables'] == 'true';
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
                const obj: any = {
                  name: item.name,
                  type: item.value.type,
                  isRequired: true
                };
                if (item.default || item.default == 0 || item.default == false) {
                  obj.isRequired = false;
                }
                item.isRequired = obj.isRequired;
                actualList.push(obj);
              });
            } else {
              if (!isArray(val.listParameters)) {
                val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                  const val1: any = v1;
                  const obj = {
                    name: k1,
                    type: val1.type,
                    isRequired: true
                  };
                  if (val1.default || val1.default == 0 || val1.default == false) {
                    obj.isRequired = false;
                  }
                  val1.isRequired = obj.isRequired;
                  actualList.push(obj);
                  return {name: k1, value: val1};
                });
              }
            }

            if (this.variable && this.variable.name) {
              if (this.variable.name == k) {
                this.forkListVariables.push({name: k, list: val.listParameters, actualList: [actualList]});
              }
            } else {
              this.forkListVariables.push({name: k, list: val.listParameters, actualList: [actualList]});
            }
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
          if (!item.type) {
            item.isTextField = true;
          }
          return true;
        }
      });
    } else {
      this.variables?.forEach((item) => {
        item.isTextField = true;
      });
    }
    this.updateSelectItems();
  }

  private setForkListVariables(sour, target): void {

    for (let x in target) {
      if (target[x].name === sour.name) {
        if (sour.value) {
          if (sour.value.length > 0) {
            let notExistArr = [];
            for (const i in sour.value) {
              if (!isArray(sour.value[i])) {
                sour.value[i] = Object.entries(sour.value[i]).map(([k1, v1]) => {
                  let type, isRequired = true;
                  for (const prop in target[x].list) {
                    if (target[x].list[prop].name === k1) {
                      type = target[x].list[prop].value.type;
                      isRequired = target[x].list[prop].value.isRequired;
                      break;
                    }
                  }
                  return {name: k1, value: v1, type, isRequired};
                });
              } else {
                for (const j in sour.value[i]) {
                  for (const prop in target[x].list) {
                    if (target[x].list[prop].name === sour.value[i][j].name) {
                      sour.value[i][j].type = target[x].list[prop].value.type;
                      sour.value[i][j].isRequired = target[x].list[prop].value.isRequired;
                      break;
                    }
                  }
                }
              }
              for (const prop in target[x].list) {
                let flag = false;
                for (const j in sour.value[i]) {
                  if (target[x].list[prop].name === sour.value[i][j].name) {
                    flag = true;
                    break;
                  }
                }
                if (!flag) {
                  let isDuplicate = false;
                  for (let y in notExistArr) {
                    if (notExistArr[y].name == target[x].list[prop].name) {
                      isDuplicate = true;
                      break;
                    }
                  }
                  if (!isDuplicate) {
                    notExistArr.push(target[x].list[prop]);
                  }
                }
              }

              if (notExistArr.length > 0) {
                notExistArr.forEach(item => {
                  sour.value[i].push({
                    name: item.name,
                    type: item.value.type,
                    value: (item.value.value || item.value.default),
                    isRequired: (item.isRequired || item.value.isRequired)
                  })
                })
              }
            }
          } else {
            const tempArr = [];
            for (const prop in target[x].list) {
              tempArr.push({
                name: target[x].list[prop].name,
                value: (target[x].list[prop].value.value || target[x].list[prop].value.default),
                type: target[x].list[prop].value.type,
                isRequired: (target[x].list[prop].isRequired || target[x].list[prop].value.isRequired)
              });
            }
            sour.value.push(tempArr);
          }
        }
        for (let x in this.forkListVariables) {
          if (this.forkListVariables[x].name == sour.name) {
            for (let i in sour.value) {
              let arr = [];
              for (let j in this.forkListVariables[x].list) {
                for (let k in sour.value[i]) {
                  if (this.forkListVariables[x].list[j].name == sour.value[i][k].name) {
                    arr.push(sour.value[i][k]);
                    break;
                  }
                }
              }
              sour.value[i] = arr;
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
      arr.push({
        name: item.name,
        type: item.value.type,
        value: (item.value.value || item.value.default),
        isRequired: (item.isRequired || item.value.isRequired)
      });
    });
    let flag = false;
    for (const i in data.actualList) {
      for (const j in data.actualList[i]) {
        if (!data.actualList[i][j].value && data.actualList[i][j].value !== 0 && data.actualList[i][j].value !== false) {
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
      }
    });
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
      if (this.newPositions && this.newPositions?.size > -1) {
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
        if (this.newPositions && this.newPositions?.size > -1) {
          if (this.newPositions.has(pos)) {
            obj.endPositions.push((this.newPositions.get(pos)));
          }
        } else if (this.positions && this.positions?.size) {
          if (this.positions.has(pos)) {
            obj.endPositions.push((this.positions.get(pos)));
          }
        }
      });
    }

    obj.auditLog = {};
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    if (obj.variables || obj.removeVariables || obj.endPositions || obj.startPosition || obj.blockPosition) {
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
  isCopy = false;
  submitted = false;
  dateFormat: any;
  dateType: any = {at: 'date', forceJobAdmission: false};
  stickToDailyPlanDate = false;
  zones = [];
  period: any = {};
  s1 = 0;
  n1 = 0;
  n2 = 0;
  display: any;
  required = false;
  comments: any = {};

  constructor(private activeModal: NzModalRef, public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.order = this.modalData.order;
    this.orders = this.modalData.orders;
    this.plan = this.modalData.plan;
    this.preferences = this.modalData.preferences;
    this.isDailyPlan = this.modalData.isDailyPlan;
    this.isCopy = this.modalData.isCopy;
    if (this.orders) {
      this.n1 = this.orders.size;
    }
    if (this.isCopy) {
      if (this.order?.plannedDate) {
        this.order.fromTime1 = this.order.plannedDate;
        this.order.fromTime = this.coreService.getDateByFormat(this.order.plannedDate, null, 'HH:mm:ss');
        this.order.fromDate = this.order.plannedDate;
      }
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
      this.n1 = 0;
      this.plan.value.forEach((order) => {
        if (order.cyclicOrder) {
          this.n2 = this.n2 + order.cyclicOrder.count;
          this.n1 = this.n1 + 1;
        }
        if (order.cyclicOrder && !isCyclic) {
          isCyclic = true;
        }
        if (!order.cyclicOrder) {
          isStandalone = true;
          this.s1 = this.s1 + 1;
        }
      });
    } else if (this.orders && this.orders.size > 0) {
      this.n1 = 0;
      this.orders.forEach((order) => {
        if (order.cyclicOrder) {
          this.n2 = this.n2 + order.cyclicOrder.count;
          this.n1 = this.n1 + 1;
        }
        if (order.cyclicOrder && !isCyclic) {
          isCyclic = true;
        }
        if (!order.cyclicOrder) {
          isStandalone = true;
          this.s1 = this.s1 + 1;
        }
      });
      if (this.n1 == 0 && this.n2 > 0 && this.s1 == 0) {
        this.n1 = this.orders.size;
      }
    }
    if (this.n1 == 0 && this.n2 === 0 && this.s1 > 0) {
      this.n1 = this.s1;
    }
    if (isCyclic && isStandalone) {
      this.order.cyclicOrder = null;
    } else if (isCyclic) {
      if (this.n1 > 1 || this.plan?.value?.length || this.orders?.size) {
        this.order.cyclicOrder = null;
      } else {
        this.order.cyclicOrder = {};
      }
    }
    if (!isEmpty(this.order.cyclicOrder)) {
      if (this.order.cyclicOrder && this.order.orderId) {
        let period = this.order.period || {};
        period.date = this.order.plannedDate || new Date(this.order.scheduledFor);
        let orderId = this.order.orderId;
        if (period && period.begin) {
          this.updatePeriod(period);
        } else {
          period.date = this.coreService.getDateByFormat(period.date, this.preferences.zone, 'YYYY-MM-DD');
          if(period.date == '10000-01-01'){
            period.date = '9999-12-31';
          }
          this.fetchOrderInfo(orderId, period);
        }
      }
    }

    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.dateType.timeZone = this.preferences.zone;
  }

  private fetchOrderInfo(orderID, period): void {
    if (orderID) {
      this.coreService.post('daily_plan/orders', {
        dailyPlanDateFrom: period.date,
        orderIds: [orderID]
      }).subscribe({
        next: (res) => {
          if (res.plannedOrderItems?.length === 1 && res.plannedOrderItems[0].period) {
            period = {...period, ...res.plannedOrderItems[0].period};
            this.updatePeriod(period);
          }
        }
      });
    }
  }

  private updatePeriod(period): void {
    if (typeof period.begin == 'string' && period.begin.match('2000-01-01')) {
      if (typeof period.date == 'string') {
        period.begin = period.begin.replace('2000-01-01', period.date.split('T')[0]);
      } else {
        const dateStr = period.date.getFullYear() + '-' + (period.date.getMonth() + 1 < 9 ? '0' : '') + (period.date.getMonth() + 1) + '-' + (period.date.getDate() < 9 ? '0' : '') + period.date.getDate();
        period.begin = period.begin.replace('2000-01-01', dateStr);
      }
    }
    this.period.begin = this.coreService.getTimeFromDate(this.coreService.convertTimeToLocalTZ(this.preferences, period.begin), this.preferences.dateFormat);
    this.period.end = this.coreService.getTimeFromDate(this.coreService.convertTimeToLocalTZ(this.preferences, period.end), this.preferences.dateFormat);
    this.period.repeat = this.secondsToHMS(period.repeat);
    this.order.scheduleDate = this.coreService.getDateByFormat(period.begin, this.preferences.zone, 'YYYY-MM-DD');
  }

  private secondsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
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
    if (this.stickToDailyPlanDate) {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'stickToDailyPlanDate',
          message: 'stickToDailyPlanDate',
          type: 'confirm',
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.submitForm();
        }
      });
    } else {
      this.submitForm();
    }
  }


  submitForm(): void {
    let obj: any = {
      controllerId: this.schedulerId,
      forceJobAdmission: this.dateType.forceJobAdmission,
      stickDailyPlanDate: this.stickToDailyPlanDate,
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
      } else if (this.dateType.at === 'cur') {
        if (!/^[+-]/.test(this.order.atTimeFromCur)) {
          this.order.atTimeFromCur = "+" + this.order.atTimeFromCur;
        }
        if (/s$/.test(this.order.atTimeFromCur)) {
          obj.scheduledFor = 'cur ' + this.order.atTimeFromCur.slice(0, -1);
        } else {
          obj.scheduledFor = 'cur ' + this.order.atTimeFromCur;
        }
      } else {
        this.coreService.getDateAndTime(this.order);
        if (this.order.fromTime) {
          obj.scheduledFor = this.coreService.getDateByFormat(this.order.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
        } else {
          obj.scheduledFor = this.coreService.getDateByFormat(this.order.fromDate, null, 'YYYY-MM-DD');
        }
        obj.timeZone = this.dateType.timeZone;
      }
    } else if(this.period.begin){
      obj.cycle = {
        repeat: ModifyStartTimeModalComponent.checkTime(this.period.repeat),
        begin: ModifyStartTimeModalComponent.checkTime(this.period.begin),
        end: ModifyStartTimeModalComponent.checkTime(this.period.end),
      };
      if (this.order.scheduleDate) {
        obj.scheduledFor = this.coreService.getDateByFormat(this.order.scheduleDate, null, 'YYYY-MM-DD');
      }
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
    this.coreService.post(this.isCopy? 'daily_plan/orders/copy' : 'daily_plan/orders/modify', obj).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => this.submitted = false
    });
  }

  cancel(): void {
    delete this.order.atTime;
    delete this.order.atTimeFromCur;
    delete this.order.fromDate;
    delete this.order.fromTime1;
    delete this.order.fromTime;
    this.activeModal.destroy();
  }

  onBlur(repeat: NgModel, propertyName: string) {
    this.order[propertyName] = this.coreService.padTime(this.order[propertyName]);
    repeat.control.setErrors({incorrect: false});
    repeat.control.updateValueAndValidity();
  }
}
