import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styles: ['.expand-collapse-btn{opacity: 0; padding-left:8px;}', '.hover:hover .expand-collapse-btn{opacity: 1}']
})
export class TypeComponent implements OnChanges {
  @Input() configuration;
  @Input() expandAll;
  @Input() orders;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Output() update: EventEmitter<any> = new EventEmitter();
  sideBar: any = {};

  constructor(public coreService: CoreService) {
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

  toggleFunc(json, flag) {
    for (let i = 0; i < json.instructions.length; i++) {
      json.instructions[i].show = flag;
    }
  }

  collapse(node) {
    node.show = !node.show;
    this.update.emit();
  }

  recursiveUpdate(node, flag) {
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
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            json.branches[i].show = flag;
            if (json.branches[i].instructions) {
              recursive(json.branches[i]);
            }
          }
        }
      }
    }

    recursive(node);
  }

  private updateOrder() {
    const self = this;
    let mapObj = new Map();

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
  }

  private checkOrders(instruction, mapObj) {
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

  showOrders(orders) {
    console.log(orders);
    this.sideBar = {
      isVisible: true,
      orders: orders
    };
  }

  expandNode(node) {
    node.show = true;
    this.recursiveUpdate(node, true);
  }

  collapseNode(node) {
    node.show = false;
    this.recursiveUpdate(node, false);
  }
}
