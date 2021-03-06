import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {ScriptModalComponent} from '../script-modal/script-modal.component';

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
  @Input() orderPreparation: any;
  @Output() update: EventEmitter<any> = new EventEmitter();
  @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

  sideBar: any = {};
  isFirst = false;

  constructor(public coreService: CoreService, private modal: NzModalService) {
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
      if (this.configuration.TYPE === 'Workflow') {
        this.isFirst = true;
        for (let i = 0; i < this.configuration.instructions.length; i++) {
          this.configuration.instructions[i].show = true;
          this.getDocumentationInfo(this.configuration.instructions[i]);
        }
      }
    }
    if (changes.orders) {
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
    if (instruction.position) {
      delete instruction['orders'];
      let _order = mapObj.get(JSON.stringify(instruction.position));
      if (_order) {
        instruction.orders = _order;
        if (!instruction.orderCount) {
          instruction.orderCount = 0;
        }
        instruction.orderCount = _order.length;
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
          jobName: instruction.jobName,
          isScript: job.executable.TYPE === 'ShellScriptExecutable',
          readonly: true
        };
      }
    } else if (instruction.TYPE === 'If') {
      nzComponentParams = {
        predicate: true,
        data: instruction.predicate,
        isScript: true,
        readonly: true
      };
    }
    if (nzComponentParams) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ScriptModalComponent,
        nzClassName: 'lg',
        nzComponentParams,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  getDocumentationInfo(instruction): void {
    if (instruction.TYPE === 'Job' && !instruction.documentationName) {
      const job = this.jobs[instruction.jobName];
      instruction.documentationName =  job ? job.documentationName : null;
    }
  }
}
