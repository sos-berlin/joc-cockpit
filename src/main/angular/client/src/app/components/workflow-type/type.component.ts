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
    function recursive(json, count) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          self.checkOrders(json.instructions[x], mapObj, count);
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  self.checkOrders(json.instructions[x].branches[i], mapObj, count);
                  recursive(json.instructions[x].branches[i], json.instructions[x].branches[i]);
                }
              }
            }
          }


          if (json.instructions[x].instructions) {
            recursive(json.instructions[x], json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              self.checkOrders(json.instructions[x].catch, mapObj, count);
              recursive(json.instructions[x].catch, json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            self.checkOrders(json.instructions[x].then, mapObj, count);
            recursive(json.instructions[x].then, json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            self.checkOrders(json.instructions[x].else, mapObj, count);
            recursive(json.instructions[x].else, json.instructions[x].else);
          }
         // console.log(json.instructions[x].position, 'poistion', count);
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              self.checkOrders(json.branches[i], mapObj, count);
              recursive(json.branches[i], json.branches[i]);
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
      let count = {count : 0};
      for (let i = 0; i < this.configuration.instructions.length; i++) {
        this.checkOrders(this.configuration.instructions[i], mapObj, count);
        recursive(this.configuration.instructions[i], this.configuration.instructions[i]);
      }
    }
  }

  private checkOrders(instruction, mapObj, count) {
    if (instruction.position) {
      delete instruction['orders'];
      let _order = mapObj.get(JSON.stringify(instruction.position));
      if (_order) {
        instruction.orders = _order;
        count.count = count.count + _order.length;
      }
    }
    
    instruction.count = count.count;
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
