import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-graphical-view-modal',
  templateUrl: './graphical-view-modal.component.html'
})
export class GraphicalViewModalComponent implements OnInit {
  @Input() workflow: any;
  @Input() positions: any;
  @Input() operation: string;
  @Input() startNode: string;

  disabledDrag = false;
  position: string;
  data: any;

  constructor(public coreService: CoreService, private activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.data = {
      instructions: this.coreService.clone(this.workflow.instructions)
    };
    this.convertTryToRetry(this.data);
  }

  convertTryToRetry(mainJson: any): void {
    const self = this;
    let flag = false;
    const map = new Map();
    let isCheck = false;
    function recursive(json: any, parent = null) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (!self.startNode || json.instructions[x].positionString === self.startNode) {
            isCheck = true;
          }
          if (json.instructions[x].TYPE === 'ImplicitEnd' && (json.TYPE || parent)) {
            if (json.TYPE === 'ForkList') {
              json.instructions[x].TYPE = 'ForkListEnd';
            } else if (parent) {
              let arr = [];
              if (map.has(parent.positionString)) {
                arr = JSON.parse(map.get(parent.positionString));
              }
              arr.push(json.instructions[x].positionString);
              map.set(parent.positionString, JSON.stringify(arr));
              let positions = [];
              if (!parent.join) {
                parent.join = {};
              } else{
                positions = self.coreService.clone(parent.join.positionStrings);
              }
              if (self.position && self.position == json.instructions[x].positionString) {
                parent.join.node = self.position;
              }
              positions.push(json.instructions[x].position);
              parent.join.positionStrings = positions;
              parent.join.unique = arr.join('$');
              if (self.positions.has(json.instructions[x].positionString)) {
                parent.join.enabled = isCheck;
              }
              json.instructions[x].TYPE = 'Join';
            }
          }
          if (json.instructions[x].TYPE === 'Execute.Named') {
            json.instructions[x].TYPE = 'Job';
          }
          if (!flag) {
            json.instructions[x].show = true;
          }
          if (json.instructions[x].positionString) {
            if (self.positions.has(json.instructions[x].positionString)) {
              json.instructions[x].enabled = isCheck;
            }
            if (self.position && self.position == json.instructions[x].positionString) {
              flag = true;
              json.instructions[x].node = self.position;
            }
          }

          if (json.instructions[x].TYPE === 'Try') {
            let isRetry = false;
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length === 1
                && json.instructions[x].catch.instructions[0].TYPE === 'Retry') {
                json.instructions[x].TYPE = 'Retry';
                json.instructions[x].instructions = json.instructions[x].try.instructions;
                isRetry = true;
                delete json.instructions[x].try;
                delete json.instructions[x].catch;
              }
            }
            if (!isRetry) {
              if (json.instructions[x].try) {
                json.instructions[x].instructions = json.instructions[x].try.instructions || [];
                delete json.instructions[x].try;
              }
              if (json.instructions[x].catch) {
                if (!json.instructions[x].catch.instructions) {
                  json.instructions[x].catch.instructions = [];
                }
              } else {
                json.instructions[x].catch = {instructions: []};
              }
            }
          }
          if (json.instructions[x].TYPE === 'Lock') {
            if (json.instructions[x].lockedWorkflow) {
              json.instructions[x].instructions = json.instructions[x].lockedWorkflow.instructions;
              delete json.instructions[x].lockedWorkflow;
            }
          }
          if (json.instructions[x].TYPE === 'Cycle') {
            if (json.instructions[x].cycleWorkflow) {
              json.instructions[x].instructions = json.instructions[x].cycleWorkflow.instructions;
              delete json.instructions[x].cycleWorkflow;
            }
          }
          if (json.instructions[x].TYPE === 'ForkList') {
            if (json.instructions[x].workflow) {
              json.instructions[x].instructions = json.instructions[x].workflow.instructions;
              delete json.instructions[x].workflow;
            }
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              if (!flag) {
                json.instructions[x].catch.show = true;
              }
              recursive(json.instructions[x].catch);
              if (json.instructions[x].catch.positionString) {
                if (self.position && self.position == json.instructions[x].catch.positionString) {
                  flag = true;
                  json.instructions[x].catch.node = self.position;
                }
              }
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            if (!flag) {
              json.instructions[x].then.show = true;
            }
            recursive(json.instructions[x].then);
            if (json.instructions[x].then.positionString) {
              if (self.position && self.position == json.instructions[x].then.positionString) {
                flag = true;
                json.instructions[x].then.node = self.position;
              }
            }
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            if (!flag) {
              json.instructions[x].else.show = true;
            }
            recursive(json.instructions[x].else);
            if (json.instructions[x].else.positionString) {
              if (self.position && self.position == json.instructions[x].else.positionString) {
                flag = true;
                json.instructions[x].else.node = self.position;
              }
            }
          }
          if (json.instructions[x].branches) {
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
              branch.instructions = branch.workflow.instructions;
              delete branch.workflow;
              return (branch.instructions && branch.instructions.length > 0);
            });
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i]) {
                if (!flag) {
                  json.instructions[x].branches[i].show = true;
                }
                recursive(json.instructions[x].branches[i], json.instructions[x]);
                if (json.instructions[x].branches[i].positionString) {
                  if (self.position && self.position == json.instructions[x].branches[i].positionString) {
                    flag = true;
                    json.instructions[x].branches[i].node = self.position;
                  }
                }
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
  }

  onSubmit(): void {
    console.log(this.position)
    this.activeModal.close(this.position);
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  onDrop(position): void {
    let index;
    if (position && position.match('$')) {
      const positionArr = position.split('$');
      for (const i in this.positions) {
        let flag = false;
        for (const j in positionArr) {
          if (this.positions[i] === positionArr[j]) {
            index = j;
            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
      }
    }
    this.updateNode(position, index);
  }

  private updateNode(position, index = -1): void {
    const self = this;

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          delete json.instructions[x].node;
          if (position === json.instructions[x].positionString) {
            json.instructions[x].node = position;
            self.position = json.instructions[x].positionString;
          }
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  delete json.instructions[x].branches[i].node;
                  if (position === json.instructions[x].branches[i].positionString) {
                    json.instructions[x].branches[i].node = position;
                    self.position = json.instructions[x].branches[i].positionString;
                  }
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
            if (index > -1) {
              if (json.instructions[x].join && json.instructions[x].join.node) {
                delete json.instructions[x].join.node;
              }
              if (json.instructions[x].join && json.instructions[x].join.unique === position) {
                json.instructions[x].join.node = position;
                self.position = json.instructions[x].join.positionStrings[index];
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              delete json.instructions[x].catch.node;
              if (position === json.instructions[x].catch.positionString) {
                json.instructions[x].catch.node = position;
                self.position = json.instructions[x].catch.positionString;
              }
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            delete json.instructions[x].then.node;
            if (position === json.instructions[x].then.positionString) {
              json.instructions[x].then.node = position;
              self.position = json.instructions[x].then.positionString;
            }
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            delete json.instructions[x].else.node;
            if (position === json.instructions[x].else.positionString) {
              json.instructions[x].else.node = position;
              self.position = json.instructions[x].else.positionString;
            }
            recursive(json.instructions[x].else);
          }
        }
      } else {
        if (json.branches) {
          for (let i = 0; i < json.branches.length; i++) {
            if (json.branches[i].instructions) {
              delete json.branches[i].node;
              if (position === json.branches[i].positionString) {
                json.branches[i].node = position;
              }
              recursive(json.branches[i]);
            }
          }
        }
      }
    }

    recursive(this.data);
  }
}


