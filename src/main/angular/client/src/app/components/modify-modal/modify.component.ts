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
  variables: any = [];
  variableList = [];
  submitted = false;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  ngOnInit() {
    console.log(this.orderRequirements);
    console.log(this.order);
    console.log(this.orders);
    console.log(this.variable);
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
    if (this.variables.length === 0) {
      this.addVariable();
    }
    this.updateVariableList();
  }

  updateVariableList() {
    if (this.orderRequirements && this.orderRequirements.parameters && !_.isEmpty(this.orderRequirements.parameters)) {
      this.variableList = Object.entries(this.orderRequirements.parameters).map(([k, v]) => {
        const val: any = v;
        return {name: k, value: v};
      });
    }
    this.updateSelectItems();
  }

  checkVariableType(variable) {
    let obj = this.orderRequirements.parameters[variable.name];
    if (obj) {
      variable.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        variable.isRequired = true;
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems() {
    if (this.variables.length > 0) {
      for (let i = 0; i < this.variableList.length; i++) {
        this.variableList[i].isSelected = false;
        for (let j = 0; j < this.variables.length; j++) {
          if (this.variableList[i].name === this.variables[j].name) {
            this.variableList[i].isSelected = true;
            break;
          }
        }
      }
    }
  }

  removeVariable(index): void {
    this.variables.splice(index, 1);
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

  onKeyPress($event) {
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
          return [val.name, val.value];
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
    if (obj.variables) {
      this.coreService.post('daily_plan/orders/modify', obj).subscribe((result) => {
        this.submitted = false;
        this.activeModal.close('Done');
      }, () => {
        this.submitted = false;
      });
    } else{
      this.submitted = false;
    }
  }

  cancel() {
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

  ngOnInit() {
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

  cancel() {
    this.activeModal.dismiss('');
  }
}
