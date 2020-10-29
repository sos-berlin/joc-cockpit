import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';

declare const $;

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styles: ['.expand-collapse-btn{opacity: 0; padding-left:8px;}', '.hover:hover .expand-collapse-btn{opacity: 1}']
})
export class TypeComponent implements OnChanges {
  @Input() configuration;
  @Input() expandAll;
  @Output() update: EventEmitter<any> = new EventEmitter();

  constructor() {
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

  expandNode(node) {
    node.show = true;
    this.recursiveUpdate(node, true);
  }

  collapseNode(node) {
    node.show = false;
    this.recursiveUpdate(node, false);
  }
}
