import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";
import {CoreService} from '../../../services/core.service';
import {ScriptModalComponent} from '../script-modal/script-modal.component';
import {DependentWorkflowComponent} from '../workflow-graphical/workflow-graphical.component';

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html'
})
export class TypeComponent implements OnChanges {
  @Input() configuration;
  @Input() jobs;
  @Input() expandAll;
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() timezone: string;
  @Input() path: string;
  @Input() orderPreparation: any;
  @Input() recursiveCals: any;
  @Input() workflowFilters: any;
  @Input() expectedNoticeBoards: any;
  @Input() postNoticeBoards: any;
  @Input() addOrderToWorkflows: any;
  @Input() orderReload: boolean;
  @Output() update: EventEmitter<any> = new EventEmitter();
  @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

  sideBar: any = {};
  isFirst = false;

  constructor(public coreService: CoreService, private modal: NzModalService,
              private toasterService: ToastrService, private translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expandAll) {
      if (this.expandAll) {
        this.recursiveUpdate(this.configuration, true);
      } else if (this.expandAll === false) {
        this.recursiveUpdate(this.configuration, false);
      }
    }
    if (changes.configuration) {
      if (this.configuration.TYPE === 'Workflow' && this.configuration.instructions) {
        this.isFirst = true;
        for (let i = 0; i < this.configuration.instructions.length; i++) {
          this.configuration.instructions[i].show = true;
          this.getDocumentationInfo(this.configuration.instructions[i]);
        }
      }
    }
    if (changes.orders || changes.orderReload) {
      this.updateOrder();
    }
  }

  changedHandler(flag: boolean): void {
    this.isChanged.emit(flag);
    setTimeout(() => {
      this.isChanged.emit(false);
    }, 5000);
  }

  collapse(node): void {
    node.show = !node.show;
    if (node.show && node.instructions) {
      for (const x in node.instructions) {
        if (node.instructions[x]) {
          this.getDocumentationInfo(node.instructions[x]);
        }
      }
    }
    this.update.emit();
  }

  recursiveUpdate(node, flag): void {
    const self = this;

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          json.instructions[x].show = flag;
          if (flag) {
            self.getDocumentationInfo(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                json.instructions[x].branches[i].show = flag;
                if (json.instructions[x].branches[i].instructions) {
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
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            json.instructions[x].else.show = flag;
            recursive(json.instructions[x].else);
          }
        }
      }
      if (json.branches) {
        for (let i = 0; i < json.branches.length; i++) {
          json.branches[i].show = flag;
          if (json.branches[i].instructions) {
            recursive(json.branches[i]);
          }
        }
      }
      if (json.catch) {
        json.catch.show = flag;
        if (json.catch.instructions && json.catch.instructions.length > 0) {
          recursive(json.catch);
        }
      }
      if (json.then && json.then.instructions) {
        json.then.show = flag;
        recursive(json.then);
      }
      if (json.else && json.else.instructions) {
        json.else.show = flag;
        recursive(json.else);
      }
    }

    recursive(node);
  }

  showOrders(data): void {
    const self = this;
    this.sideBar = {
      orders: [],
      data
    };
    if (data.orders) {
      this.sideBar.orders = data.orders || [];
    }

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].orders) {
            self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].orders);
          }
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  recursive(json.instructions[x].branches[i]);
                  if (json.instructions[x].branches[i].orders) {
                    self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].branches[i].orders);
                  }
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
              if (json.instructions[x].catch.orders) {
                self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].catch.orders);
              }
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
            if (json.instructions[x].then.orders) {
              self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].then.orders);
            }
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            recursive(json.instructions[x].else);
            if (json.instructions[x].else.orders) {
              self.sideBar.orders = self.sideBar.orders.concat(json.instructions[x].else.orders);
            }
          }
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              recursive(json.branches[i]);
              if (json.branches[i].orders) {
                self.sideBar.orders = self.sideBar.orders.concat(json.branches[i].orders);
              }
            }
          }
        }
      }
    }

    recursive(data);
    this.sideBar.isVisible = true;
  }

  expandNode(node): void {
    node.show = true;
    this.recursiveUpdate(node, true);
  }

  collapseNode(node): void {
    node.show = false;
    this.recursiveUpdate(node, false);
  }

  private updateOrder(): void {
    const self = this;
    const mapObj = new Map();

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          self.checkOrders(json.instructions[x], mapObj);
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  self.checkOrders(json.instructions[x].branches[i], mapObj);
                  recursive(json.instructions[x].branches[i]);
                  if (json.instructions[x].branches[i].orderCount) {
                    json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].branches[i].orderCount;
                  }
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              self.checkOrders(json.instructions[x].catch, mapObj);
              recursive(json.instructions[x].catch);
            }
            json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].catch.orderCount;
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            self.checkOrders(json.instructions[x].then, mapObj);
            recursive(json.instructions[x].then);
            json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].then.orderCount;
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            self.checkOrders(json.instructions[x].else, mapObj);
            recursive(json.instructions[x].else);
            json.instructions[x].orderCount = (json.instructions[x].orderCount || 0) + json.instructions[x].else.orderCount;
          }
          if (json.instructions[x].orderCount) {
            json.orderCount = (json.orderCount || 0) + json.instructions[x].orderCount;
          }
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              self.checkOrders(json.branches[i], mapObj);
              recursive(json.branches[i]);
              if (json.branches[i].orderCount) {
                json.orderCount = (json.orderCount || 0) + json.branches[i].orderCount;
              }
            }
          }
        }
      }
    }

    if (this.orders) {
      for (let j = 0; j < this.orders.length; j++) {
        let arr = [this.orders[j]];
        if (mapObj.has(JSON.stringify(this.orders[j].position))) {
          arr = arr.concat(mapObj.get(JSON.stringify(this.orders[j].position)));
        }
        mapObj.set(JSON.stringify(this.orders[j].position), arr);
      }
      recursive(this.configuration);
    }
    if (this.sideBar.isVisible) {
      this.showOrders(this.sideBar.data);
    }
  }

  private checkOrders(instruction, mapObj): void {
    if (instruction.join && instruction.join.positionStrings) {
      delete instruction.join.orders;
      instruction.join.positionStrings.forEach((pos) => {
        if (mapObj.has(JSON.stringify(pos))) {
          if (instruction.join.orders) {
            instruction.join.orders = instruction.join.orders.concat(mapObj.get(JSON.stringify(pos)));
          } else {
            instruction.join.orders = mapObj.get(JSON.stringify(pos));
          }
        }
      });
    }
    if (instruction.position) {
      delete instruction.orders;
      const order = mapObj.get(JSON.stringify(instruction.position));
      if (order) {
        instruction.orders = order;
        if (!instruction.orderCount) {
          instruction.orderCount = 0;
        }
        instruction.orderCount = order.length;
      } else {
        instruction.orderCount = 0;
      }
    } else {
      instruction.orderCount = 0;
    }
  }

  /* --------- Job action menu operations ----------------*/

  showConfiguration(instruction): void {
    let nzComponentParams;
    if (instruction.TYPE === 'Job') {
      const job = this.jobs[instruction.jobName];
      const data = job.executable.TYPE === 'ShellScriptExecutable' ? job.executable.script : job.executable.className;
      if (job && job.executable) {
        nzComponentParams = {
          data,
          agentName: job.agentName,
          workflowPath: this.path,
          admissionTime: job.admissionTimeScheme,
          timezone: this.timezone,
          jobName: instruction.jobName,
          isScript: job.executable.TYPE === 'ShellScriptExecutable',
          readonly: true
        };
      }
    } else if (instruction.TYPE === 'If') {
      nzComponentParams = {
        predicate: true,
        data: instruction.predicate,
        workflowPath: this.path,
        isScript: true,
        readonly: true
      };
    } else if (instruction.TYPE === 'Cycle') {
      nzComponentParams = {
        schedule: instruction.schedule,
        workflowPath: this.path,
        timezone: this.timezone
      };
    }
    if (nzComponentParams) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ScriptModalComponent,
        nzClassName: 'lg script-editor',
        nzComponentParams,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  getObstacles(order): void {
    if (order.state._text === 'INPROGRESS' && !order.obstacles) {
      order.obstacles = [];
      this.coreService.post('order/obstacles', {
        controllerId: this.schedulerId,
        orderId: order.orderId
      }).subscribe((res: any) => {
        order.obstacles = res.obstacles;
      });
    }
  }

  getDocumentationInfo(instruction): void {
    if (instruction.TYPE === 'Job' && !instruction.documentationName) {
      const job = this.jobs[instruction.jobName];
      instruction.documentationName = job ? job.documentationName : null;
    }
  }

  openWorkflowDependency(obj): void {
    if (obj.TYPE === 'ExpectNotice' || obj.TYPE === 'PostNotice' || obj.TYPE === 'AddOrder') {
      let workflow;
      const list = obj.TYPE === 'ExpectNotice' ? this.expectedNoticeBoards : obj.TYPE === 'PostNotice' ? this.postNoticeBoards : [];
      for (const prop in list) {
        if (list[prop]) {
          if (list[prop].name === obj.noticeBoardName) {
            list[prop].value.forEach((item) => {
              workflow = item;
            });
            break;
          }
        }
      }
      if (obj.TYPE === 'AddOrder') {
        for (const i in this.addOrderToWorkflows) {
          if (obj.workflowName === this.addOrderToWorkflows[i].path.substring(this.addOrderToWorkflows[i].path.lastIndexOf('/') + 1)) {
            workflow = this.addOrderToWorkflows[i];
          }
        }
      }

      if (workflow) {
        this.modal.create({
          nzTitle: undefined,
          nzContent: DependentWorkflowComponent,
          nzClassName: 'x-lg',
          nzComponentParams: {
            workflow,
            permission: this.permission,
            preferences: this.preferences,
            controllerId: this.schedulerId,
            recursiveCals: this.recursiveCals,
            view: 'list',
            workflowFilters: this.workflowFilters
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
      }
    }
  }

  showLog(order): void {
    if (order.state && (order.state._text !== 'SCHEDULED' && order.state._text !== 'PENDING')) {
      this.coreService.post('orders/history', {
        orderId: order.orderId
      }).subscribe((res) => {
        if (res.history && res.history.length > 0) {
          this.coreService.showLogWindow(res.history[0], null, null, res.history[0].controllerId, null);
        } else {
          let msg = '';
          this.translate.get('order.message.noLogHistoryFound').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.toasterService.info(msg)
        }
      })
    }
  }
}
