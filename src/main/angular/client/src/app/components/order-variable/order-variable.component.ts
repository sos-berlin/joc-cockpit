import {Component, Input} from '@angular/core';
import {isArray, isEqual} from 'underscore';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ChangeParameterModalComponent} from '../modify-modal/modify.component';
import {CoreService} from '../../services/core.service';

@Component({
  standalone: false,
  selector: 'app-order-variable',
  templateUrl: './order-variable.component.html'
})
export class OrderVariableComponent {
  @Input() order;
  @Input() type;
  @Input() history: boolean;
  @Input() permission: any;
  @Input() schedulerId: any;

  constructor(public coreService: CoreService, public modal: NzModalService,
              public toasterService: ToastrService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    if (this.order && this.type) {
      if (this.order[this.type] && !this.order[this.type][0]) {
        this.order[this.type] = Object.entries(this.order[this.type]).map(([k, v]) => {
          if (v && isArray(v)) {
            v.forEach((list, index) => {
              if (!isArray(list)) {
                v[index] = Object.entries(list).map(([k1, v1]) => {
                  return {name: k1, value: v1};
                });
              }
            });
          } else if (this.history) {
            if (typeof v == 'object') {
              v = Object.entries(v).map(([k1, v1]) => {
                return {name: k1, value: v1};
              });
              v = [v];
            }
          }
          return {name: k, value: v};
        });
      } else if (isArray(this.order[this.type])) {
        this.order[this.type].forEach((item) => {
          if (isArray(item.value)) {
            item.value.forEach((list, index) => {
              if (!isArray(list)) {
                item.value[index] = Object.entries(list).map(([k1, v1]) => {
                  return {name: k1, value: v1};
                });
              }
            });
          }
        });
      }
    }
  }

  changeParameter(order, variable): void {
    this.getRequirements(order, () => {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ChangeParameterModalComponent,
        nzClassName: 'lg',
        nzData: {
          schedulerId: this.schedulerId,
          variable,
          order,
          orderPreparation: order.requirements
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this.coreService.post('daily_plan/order/variables', {
            orderId: order.orderId,
            controllerId: this.schedulerId
          }).subscribe((res: any) => {
            if (!res.variables) {
              res.variables = result;
            }
            order.variables = Object.entries(res.variables).map(([k, v]) => {
              if (v && isArray(v)) {
                v.forEach((list, index) => {
                  v[index] = Object.entries(list).map(([k1, v1]) => {
                    return {name: k1, value: v1};
                  });
                });
              }
              return {name: k, value: v};
            });
          });
        }
      });
    });
  }

  removeParameter(order, variable): void {
    let canDelete = true;
    this.getRequirements(order, () => {
      if (order.requirements && order.requirements.parameters) {
        let x = order.requirements.parameters[variable.name];
        if (x && !x.default && x.default !== false && x.default !== 0) {
          canDelete = false;
        }
      }
      let removeVariables = [];
      for (let i in variable) {
        removeVariables.push(variable[i]);
      }
      if (canDelete) {
        this.coreService.post('daily_plan/orders/modify', {
          controllerId: this.schedulerId,
          orderIds: [order.orderId],
          removeVariables: removeVariables
        }).subscribe(() => {
          for (let i = 0; i < order.variables.length; i++) {
            if (isEqual(order.variables[i], variable)) {
              order.variables.splice(i, 1);
              break;
            }
          }
        });
      } else {
        this.translate.get('common.message.requiredVariableCannotRemoved').subscribe(translatedValue => {
          this.toasterService.warning(translatedValue);
        });
      }
    });
  }

  private getRequirements(order, cb): void {
    if (order.requirements && order.requirements.parameters) {
      cb();
    } else {
      this.coreService.post('workflow', {
        controllerId: this.schedulerId,
        workflowId: {path: order.workflowId ? order.workflowId.path : order.workflowPath}
      }).subscribe({
        next: (res: any) => {
          order.requirements = res.workflow.orderPreparation;
          cb();
        }, error: () => cb()
      });
    }
  }
  isMap(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  isList(value: any): boolean {
    return Array.isArray(value)
      && value[0] && Array.isArray(value[0])
      && value[0][0] && typeof value[0][0] === 'object'
      && 'name' in value[0][0];
  }

  toKeyValueArray(obj: any): { name: string, value: any }[] {
    return Object.entries(obj || {}).map(([k, v]) => ({ name: k, value: v }));
  }

  isPrimitive(value: any): boolean {
    return (
      value !== null
      && (typeof value !== 'object' || value instanceof Date)
      && !Array.isArray(value)
    );
  }
}
