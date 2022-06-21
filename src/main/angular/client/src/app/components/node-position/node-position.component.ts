import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {WorkflowService} from "../../services/workflow.service";
import {GraphicalViewModalComponent} from "../graphical-view-modal/graphical-view-modal.component";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-node-position',
  templateUrl: './node-position.component.html'
})
export class NodePositionComponent implements OnChanges {

  @Input() obj: any;
  @Input() position: any;
  @Input() positions: any;
  @Input() workflow: any;
  @Input() type: string;

  startNodes = [];
  endNodes = [];

  constructor(public workflowService: WorkflowService, private modal: NzModalService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getEndNodes(this.position);
    if (changes.positions) {
      this.getStartNode();
    }
  }

  private getStartNode(): void {
    this.startNodes = [];
    let instructions = this.workflow.actual || this.workflow.instructions;
    instructions.forEach(element => {
      let flag = true;
      if (element.TYPE === 'Try') {
        element.catch.instructions.forEach(ele => {
          if (ele.TYPE === 'Retry') {
            flag = false;
            this.startNodes.push({name: element.jobName || ele.TYPE, position: element.positionString});
          }
        });
      }
      if (flag) {
        this.startNodes.push({
          name: element.jobName || (element.TYPE !== 'ImplicitEnd' ? element.TYPE : '--- end ---'),
          position: element.positionString
        });
      }
    })
  }

  private getEndNodes(position?): void {
    const self = this;
    let nodes: any = {
      children: []
    };
    let flag = false;

    function recursive(json, obj, parent = null) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          let skip = false;
          let isEnable = self.positions ? self.positions.has(json.instructions[x].positionString) : true;
          if (!position || json.instructions[x].positionString === position) {
            flag = true;
          }
          if (json.instructions[x].positionString && json.instructions[x].positionString === position && isEnable) {
            skip = true;
          }
          if (!self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE)) {
            if (flag && !skip) {
              obj.children.push({
                title: json.instructions[x].jobName || (json.instructions[x].TYPE !== 'ImplicitEnd' ? json.instructions[x].TYPE : parent ? 'Join' : '--- end ---'),
                key: json.instructions[x].positionString,
                disabled: !isEnable,
                isLeaf: true
              });
            }
          } else {
            if (json.instructions[x].TYPE === 'Fork') {
              if (json.instructions[x].branches) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                for (let i = 0; i < json.instructions[x].branches.length; i++) {
                  if (json.instructions[x].branches[i].workflow.instructions) {
                    let obj1 = {
                      title: json.instructions[x].branches[i].id,
                      disabled: true,
                      key: json.instructions[x].positionString + json.instructions[x].branches[i].id,
                      children: []
                    };
                    if (flag && !skip) {
                      _obj.children.push(obj1);
                    }
                    recursive(json.instructions[x].branches[i].workflow, obj1, json.instructions[x]);
                  }
                }
              }
            }

            if (json.instructions[x].instructions) {
              recursive(json.instructions[x], obj);
            }
            if (json.instructions[x].TYPE === 'Try') {
              let isRetry = false;
              json.instructions[x].catch.instructions.forEach(element => {
                if (element.TYPE === 'Retry') {
                  isRetry = true;
                }
              })
              let _obj = {
                title: isRetry ? 'Retry' : json.instructions[x].TYPE,
                key: json.instructions[x].positionString,
                disabled: !isEnable,
                children: []
              };
              if (flag && !skip) {
                obj.children.push(_obj);
              }
              if (json.instructions[x].try) {
                if (json.instructions[x].try.instructions && json.instructions[x].try.instructions.length > 0) {
                  recursive(json.instructions[x].try, _obj);
                }
              }
              if (!isRetry) {
                let obj1 = {
                  title: "catch",
                  disabled: !isEnable,
                  key: json.instructions[x].positionString + "catch",
                  children: []
                };
                _obj.children.push(obj1);
                recursive(json.instructions[x].catch, obj1);
              }
            }
            if (json.instructions[x].TYPE === 'If') {
              let _obj = {
                title: json.instructions[x].TYPE,
                disabled: !isEnable,
                key: json.instructions[x].positionString,
                children: []
              };
              if (flag && !skip) {
                obj.children.push(_obj);
              }
              if (json.instructions[x].then && json.instructions[x].then.instructions) {
                recursive(json.instructions[x].then, _obj);
              }
              if (json.instructions[x].else && json.instructions[x].else.instructions) {
                let obj1 = {
                  title: "Else",
                  disabled: true,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  _obj.children.push(obj1);
                }
                recursive(json.instructions[x].else, obj1);
              }
            }
            if (json.instructions[x].TYPE === 'Cycle') {
              if (json.instructions[x].cycleWorkflow) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                recursive(json.instructions[x].cycleWorkflow, _obj);
              }
            }
            if (json.instructions[x].TYPE === 'Lock') {
              if (json.instructions[x].lockedWorkflow) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                recursive(json.instructions[x].lockedWorkflow, _obj);
              }
            }
            if (json.instructions[x].TYPE === 'ForkList') {
              if (json.instructions[x].workflow) {
                let _obj = {
                  title: json.instructions[x].TYPE,
                  disabled: !isEnable,
                  key: json.instructions[x].positionString,
                  children: []
                };
                if (flag && !skip) {
                  obj.children.push(_obj);
                }
                recursive(json.instructions[x].workflow, _obj);
              }
            }
          }

        }
      }
    }

    recursive({
      instructions: this.workflow.actual || this.workflow.instructions
    }, nodes);
    self.endNodes = nodes.children;
  }

  selectStartNode(value) {
    if (value) {
      this.obj.endPositions = [];
    }
  }

  showGraphicalView(operation) {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: GraphicalViewModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        workflow: this.workflow,
        positions: this.positions,
        operation,
        startNode: operation === 'END' && this.obj.startPosition ? this.obj.startPosition : undefined
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        console.log(typeof result, result);
        console.log(typeof this.obj.startPosition, this.obj.startPosition);
        if(operation === 'START'){
          this.obj.startPosition = result;
        } else {
          if(!this.obj.endPositions){
            this.obj.endPositions = [];
          }
          this.obj.endPositions.push(result);
        }
      }
    });
  }
}
