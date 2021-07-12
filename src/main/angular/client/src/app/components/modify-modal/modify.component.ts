import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import * as moment from 'moment';
import {isEmpty, isArray, object} from 'underscore';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-change-parameter',
  templateUrl: './change-parameter-dialog.html'
})
export class ChangeParameterModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() variable: any;
  @Input() order: any;
  @Input() plan: any;
  @Input() orders: any;
  @Input() orderIds: any;
  @Input() orderPreparation: any;
  removeVariables = [];
  variables: any = [];
  variableList = [];
  submitted = false;

  constructor(private activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
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
    if (this.variables.length === 0) {
      this.addVariable();
    }
  }

  updateVariableList(): void {
    if (this.orderPreparation && this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        let isExist = false;
        for (let i = 0; i < this.variables.length; i++) {
          if (this.variables[i].name === k) {
            this.variables[i].type = val.type;
            if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
              this.variables[i].isRequired = true;
            }
            isExist = true;
            break;
          }
        }
        if (!isExist && !this.variable) {
          if (!val.final) {
            if (!val.default && val.default !== false && val.default !== 0) {
              this.variables.push({name: k, type: val.type, isRequired: true});
            } else {
              this.coreService.removeSlashToString(val, 'default');
              this.variables.push({name: k, value: val.default, default: val.default});
            }
          }
        }
        return {name: k, value: v};
      });
      this.variableList = this.variableList.filter((item) => {
        return !item.value.final;
      });
    }
    this.updateSelectItems();
  }

  checkVariableType(variable): void {
    let obj = this.orderPreparation.parameters[variable.name];
    if (obj) {
      variable.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        variable.isRequired = true;
      } else{
        variable.value = obj.default;
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
    this.removeVariables.push({name: argu.name, value: argu.value});
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
            this.removeVariables.push({name: val.name, value: val.value});
          }
          return val.name ? [val.name, val.value] :  null;
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
      obj.removeVariables = this.coreService.keyValuePair(this.removeVariables);
    }
    if (obj.variables || obj.removeVariables) {
      this.coreService.post('daily_plan/orders/modify', obj).subscribe((result) => {
        this.submitted = false;
        this.activeModal.close('Done');
      }, () => {
        this.submitted = false;
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
export class ModifyStartTimeModalComponent implements OnInit {
  @Input() schedulerId;
  @Input() order: any;
  @Input() preferences: any;
  @Input() isDailyPlan: boolean;
  submitted = false;
  dateFormat: any;
  dateType: any = {at: 'date'};
  zones = [];
  period: any = {};

  constructor(private activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.dateType.timeZone = this.preferences.zone;
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return moment(current.setHours(0, 0, 0, 0)).diff(new Date().setHours(0, 0, 0, 0)) < 0;
  }

  private checkTime(time): string {
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

  onSubmit(): void {
    let obj: any = {
      controllerId: this.schedulerId,
      orderIds: [this.order.orderId]
    };
    if (isEmpty(this.period)) {
      if (this.dateType.at === 'now') {
        obj.scheduledFor = 'now';
      } else if (this.order.at === 'never') {
        obj.scheduledFor = 'never';
      } else if (this.dateType.at === 'later') {
        obj.scheduledFor = 'now + ' + this.order.atTime;
      } else {
        if (this.order.from && this.order.time) {
          this.order.from.setHours(moment(this.order.time).hours());
          this.order.from.setMinutes(moment(this.order.time).minutes());
          this.order.from.setSeconds(moment(this.order.time).seconds());
          this.order.from.setMilliseconds(0);
        }
        obj.scheduledFor = moment(this.order.from).format('YYYY-MM-DD HH:mm:ss');
        obj.timeZone = this.dateType.timeZone;
      }
    } else {
      obj.cycle = {
        repeat : this.checkTime(this.period.repeat),
        begin : this.checkTime(this.period.begin),
        end : this.checkTime(this.period.end),
      };
      obj.timeZone = this.dateType.timeZone;
    }
    this.submitted = true;
    this.coreService.post('daily_plan/orders/modify', obj).subscribe((result) => {
      this.submitted = false;
      this.activeModal.close('Done');
    }, () => {
      this.submitted = false;
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}
