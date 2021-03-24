import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import * as moment from 'moment';
import * as _ from 'underscore';

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
  @Input() orderRequirements: any;
  removeVariables = [];
  variables: any = [];
  variableList = [];
  submitted = false;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  ngOnInit(): void {
    if (this.variable) {
      this.variables = Object.assign(this.variables, [this.coreService.clone(this.variable)]);
    } else if (this.order && (this.order.variables)) {
      if (!_.isArray(this.order.variables)) {
        this.order.variables = this.coreService.convertObjectToArray(this.order, 'variables');
      } else {
        this.variables = this.coreService.clone(this.order.variables);
      }
    } else if (this.order && (this.order.arguments)) {
      if (!_.isArray(this.order.arguments)) {
        this.order.arguments = this.coreService.convertObjectToArray(this.order, 'variables');
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
    if (this.orderRequirements && this.orderRequirements.parameters && !_.isEmpty(this.orderRequirements.parameters)) {
      this.variableList = Object.entries(this.orderRequirements.parameters).map(([k, v]) => {
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
          if (!val.default && val.default !== false && val.default !== 0) {
            this.variables.push({name: k, type: val.type, isRequired: true});
          } else {
            this.variables.push({name: k, value: val.default, type: val.type, isRequired: false});
          }
        }
        return {name: k, value: v};
      });
    }
    this.updateSelectItems();
  }

  checkVariableType(variable): void {
    let obj = this.orderRequirements.parameters[variable.name];
    if (obj) {
      variable.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        variable.isRequired = true;
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    if (this.variables.length > 0) {
      for (let i = 0; i < this.variableList.length; i++) {
        this.variableList[i].isSelected = false;
        for (let j = 0; j < this.variables.length; j++) {
          if (this.variableList[i].name === this.variables[j].name) {
            this.variableList[i].isSelected = true;
            this.variables[j].type = this.variableList[i].value.type;
            if (!this.variableList[i].default && this.variableList[i].default !== false && this.variableList[i].default !== 0) {
              this.variables[j].isRequired = true;
            }
            break;
          }
        }
      }
    }
  }

  removeVariable(argu): void {
    this.removeVariables.push({name: argu.name, value: argu.value});
    this.variables = this.variables.filter((item) => {
      return argu.name !== item.name;
    });
  }

  addVariable(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.variables) {
      if (!this.coreService.isLastEntryEmpty(this.variables, 'name', '')) {
        this.variables.push(param);
      }
    }
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
        obj.variables = _.object(argu.map((val) => {
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
    this.activeModal.dismiss('');
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
  submitted = false;
  dateFormat: any;

  constructor(public activeModal: NgbActiveModal, public  coreService: CoreService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return moment(current.setHours(0, 0, 0, 0)).diff(new Date().setHours(0, 0, 0, 0)) < 0;
  };

  onSubmit(): void {
    if (this.order.from && this.order.time) {
      this.order.from.setHours(moment(this.order.time).hours());
      this.order.from.setMinutes(moment(this.order.time).minutes());
      this.order.from.setSeconds(moment(this.order.time).seconds());
      this.order.from.setMilliseconds(0);
    }
    this.submitted = true;
    let obj = {
      controllerId: this.schedulerId,
      orderIds: [this.order.orderId],
      startTime: moment.utc(this.order.from)
    };
    this.coreService.post('daily_plan/orders/modify', obj).subscribe((result) => {
      this.submitted = false;
      this.activeModal.close('Done');
    }, () => {
      this.submitted = false;
    });
  }

  cancel(): void {
    this.activeModal.dismiss('');
  }
}
