import {Component, Input, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {ToasterService} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import {ChangeParameterModalComponent} from '../modify-modal/modify.component';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-order-variable',
  templateUrl: './order-variable.component.html'
})
export class OrderVariableComponent implements OnInit {
  @Input() order;
  @Input() type;
  @Input() permission: any;
  @Input() schedulerId: any;

  constructor(public coreService: CoreService, public modalService: NgbModal,
              public toasterService: ToasterService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    if (this.order && this.type) {
      if (this.order[this.type] && !this.order[this.type][0]) {
        this.order[this.type] = Object.entries(this.order[this.type]).map(([k, v]) => {
          return {name: k, value: v};
        });
      }
    }
  }

  changeParameter(order, variable): void {
    this.getRequirements(order, () => {
      const modalRef = this.modalService.open(ChangeParameterModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.schedulerId = this.schedulerId;
      modalRef.componentInstance.variable = variable;
      modalRef.componentInstance.order = order;
      modalRef.componentInstance.orderRequirements = order.requirements;
      modalRef.result.then(() => {

        this.coreService.post('orders/variables', {
          orderId: order.orderId,
          controllerId: this.schedulerId
        }).subscribe((res: any) => {
          order.variables = Object.entries(res).map(([k, v]) => {
            return {name: k, value: v};
          });
        });
      }, () => {
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
      if (canDelete) {
        this.coreService.post('daily_plan/orders/modify', {
          controllerId: this.schedulerId,
          orderIds: [order.orderId],
          removeVariables: _.object([variable].map((val) => {
            return [val.name, val.value];
          }))
        }).subscribe((result) => {
          for (let i = 0; i < order.variables.length; i++) {
            if (_.isEqual(order.variables[i], variable)) {
              order.variables.splice(i, 1);
              break;
            }
          }
        }, () => {

        });
      } else {
        this.translate.get('common.message.requiredVariableCannotRemoved').subscribe(translatedValue => {
          this.toasterService.pop('warning', translatedValue);
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
        workflowId: {path: order.workflowPath}
      }).subscribe((res: any) => {
        order.requirements = res.workflow.orderRequirements;
        cb();
      });
    }
  }
}
