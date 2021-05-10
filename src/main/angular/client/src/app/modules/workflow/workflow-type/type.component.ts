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
  @Input() expandAll;
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() orderRequirements: any;
  @Output() update: EventEmitter<any> = new EventEmitter();
  sideBar: any = {};

  constructor(public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expandAll) {
      if (this.expandAll) {
        this.toggleFunc(this.configuration, true);
      } else if (this.expandAll === false) {
        this.toggleFunc(this.configuration, false);
      }
    }
    if (changes.configuration) {
      if (this.configuration.TYPE) {
        for (let i = 0; i < this.configuration.instructions.length; i++) {
          this.configuration.instructions[i].show = true;
        }
      }
    }
    if (changes.orders) {
      this.updateOrder();
    }
  }

  toggleFunc(json, flag): void {
    for (let i = 0; i < json.instructions.length; i++) {
      json.instructions[i].show = flag;
    }
  }

  collapse(node): void {
    node.show = !node.show;
    this.update.emit();
  }

  recursiveUpdate(node, flag): void {
    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          json.instructions[x].show = flag;
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
                  if (json.instructions[x].branches[i].count) {
                    json.instructions[x].count = (json.instructions[x].count || 0) + json.instructions[x].branches[i].count;
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
            json.instructions[x].count = (json.instructions[x].count || 0) + json.instructions[x].catch.count;
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            self.checkOrders(json.instructions[x].then, mapObj);
            recursive(json.instructions[x].then);
            json.instructions[x].count = (json.instructions[x].count || 0) + json.instructions[x].then.count;
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            self.checkOrders(json.instructions[x].else, mapObj);
            recursive(json.instructions[x].else);
            json.instructions[x].count = (json.instructions[x].count || 0) + json.instructions[x].else.count;
          }
          if (json.instructions[x].count) {
            json.count = (json.count || 0) + json.instructions[x].count;
          }
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              self.checkOrders(json.branches[i], mapObj);
              recursive(json.branches[i]);
              if (json.branches[i].count) {
                json.count = (json.count || 0) + json.branches[i].count;
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
        if (!instruction.count) {
          instruction.count = 0;
        }
        instruction.count = _order.length;
      } else {
        instruction.count = 0;
      }
    } else {
      instruction.count = 0;
    }
  }

  /* --------- Job action menu operations ----------------*/

  showConfiguration(instruction): void {
    if (instruction.TYPE === 'Job') {
      const job = this.configuration.jobs[instruction.jobName];
      const data = job.executable.TYPE === 'ScriptExecutable' ? job.executable.script : job.executable.className;
      if (job && job.executable) {
        this.modal.create({
          nzTitle: undefined,
          nzContent: ScriptModalComponent,
          nzClassName: 'lg',
          nzComponentParams: {
            data,
            jobName: instruction.jobName,
            isScript: job.executable.TYPE === 'ScriptExecutable'
          },
          nzFooter: null,
          nzClosable: false
        });
      }
    }
  }

  assignDocumentation(instruction): void{

  }

  unassignDocumentation(instruction): void{

  }

  viewDocumentation(instruction): void{

  }
}
