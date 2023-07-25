import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import {GraphicalViewModalComponent} from "../graphical-view-modal/graphical-view-modal.component";
import {WorkflowService} from "../../services/workflow.service";
import {CoreService} from "../../services/core.service";

@Component({
  selector: 'app-node-position',
  templateUrl: './node-position.component.html'
})
export class NodePositionComponent {
  @Input() obj: any;
  @Input() position: any;
  @Input() positions: any;
  @Input() blockPositions: any;
  @Input() blockPositionList: any;
  @Input() newPositions: any;
  @Input() workflow: any;
  @Input() type: string;
  @Input() index = 0;
  @Input() reload: boolean;

  nodes: any = [];
  blockInstructions = ['Lock', 'Cycle', 'ConsumeNotices', 'Options', 'StickySubagent', 'ForkList'];

  @Output() onBlur = new EventEmitter<string>();

  constructor(public workflowService: WorkflowService, private modal: NzModalService, private coreService: CoreService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.workflow) {
      this.getNodes(this.position);
    }

    if ((changes['reload'] && changes['reload'].currentValue == true) || changes['newPositions']) {
      this.getNodes(this.position);
    }
  }

  private getNodes(position?): void {
    const self = this;
    let nodes: any = {
      children: []
    };
    let flag = false;

    function recursive(json, obj, parent = null) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          let isEnable = self.positions ? self.positions.has(json.instructions[x].positionString) : true;
          if (self.newPositions?.size > 0) {
            isEnable = self.newPositions ? self.newPositions.has(json.instructions[x].positionString) : true;
          }
          if (!position || json.instructions[x].positionString === position) {
            flag = true;
          }
          if (self.blockPositions) {
            if (self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE)) {
              if (self.blockInstructions.includes(json.instructions[x].TYPE)) {
                const pos = json.instructions[x].positionString + '/' + self.coreService.lowerFLetter(json.instructions[x].TYPE)
                isEnable = self.blockPositions.has(pos);
              } else {
                isEnable = false;
              }
            } else {
              isEnable = false;
            }
          }

          if (position && json.instructions[x].positionString === position) {
            isEnable = false;
          }

          if (!self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE)) {
            if (flag) {
              obj.children.push({
                title: json.instructions[x].jobName || (json.instructions[x].TYPE !== 'ImplicitEnd' ? json.instructions[x].TYPE : parent ? 'Join' : '--- end ---'),
                key: json.instructions[x].positionString,
                label: json.instructions[x].label,
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
                  label: json.instructions[x].label,
                  children: []
                };
                if (flag) {
                  obj.children.push(_obj);
                }
                for (let i = 0; i < json.instructions[x].branches.length; i++) {
                  let obj1 = {
                    title: json.instructions[x].branches[i].id,
                    disabled: true,
                    label: json.instructions[x].label,
                    key: json.instructions[x].positionString + json.instructions[x].branches[i].id,
                    children: []
                  };

                  if (self.blockPositions) {
                    const pos = json.instructions[x].positionString + '/fork+' + json.instructions[x].branches[i].id;
                    obj1.disabled = !self.blockPositions.has(pos);
                    if (!obj1.disabled) {
                      obj1.key = pos;
                    }
                  }
                  if (flag) {
                    _obj.children.push(obj1);
                  }
                  if (json.instructions[x].branches[i].workflow?.instructions) {
                    recursive(json.instructions[x].branches[i].workflow, obj1, json.instructions[x]);
                  } else {
                    recursive(json.instructions[x].branches[i], obj1, json.instructions[x]);
                  }
                }
              }
            } else if (json.instructions[x].TYPE === 'Try') {
              let isRetry = false;
              json.instructions[x].catch.instructions.forEach(element => {
                if (element.TYPE === 'Retry') {
                  isRetry = true;
                }
              })
              let _obj = {
                title: isRetry ? 'Retry' : json.instructions[x].TYPE,
                key: json.instructions[x].positionString,
                label: json.instructions[x].label,
                disabled: !isEnable,
                children: []
              };
              if (flag) {
                obj.children.push(_obj);
              }
              if (self.blockPositions) {
                const pos = json.instructions[x].positionString + '/try';
                _obj.disabled = !self.blockPositions.has(pos);
                if (!_obj.disabled) {
                  _obj.key = pos;
                }
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
                if (self.blockPositions) {
                  const pos = json.instructions[x].positionString + '/catch';
                  obj1.disabled = !self.blockPositions.has(pos);
                  if (!obj1.disabled) {
                    obj1.key = pos;
                  }
                } else {
                  if (self.newPositions?.size > 0) {
                    obj1.disabled = self.newPositions ? !self.newPositions.has(json.instructions[x].positionString) : true;
                  }
                }
                _obj.children.push(obj1);
                recursive(json.instructions[x].catch, obj1);
              }
            } else if (json.instructions[x].TYPE === 'If') {
              let _obj = {
                title: json.instructions[x].TYPE,
                disabled: !isEnable,
                label: json.instructions[x].label,
                key: json.instructions[x].positionString,
                children: []
              };
              if (self.blockPositions) {
                const pos = json.instructions[x].positionString + '/then';
                _obj.disabled = !self.blockPositions.has(pos);
                if (!_obj.disabled) {
                  _obj.key = pos;
                }
              }
              if (flag) {
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
                if (self.blockPositions) {
                  const pos = json.instructions[x].positionString + '/else';
                  obj1.disabled = !self.blockPositions.has(pos);
                  if (!obj1.disabled) {
                    obj1.key = pos;
                  }
                }
                if (flag) {
                  _obj.children.push(obj1);
                }
                recursive(json.instructions[x].else, obj1);
              }
            } else if (json.instructions[x].TYPE === 'Cycle' || json.instructions[x].TYPE === 'Lock' ||
              json.instructions[x].TYPE === 'Options' || json.instructions[x].TYPE === 'ForkList' || json.instructions[x].TYPE === 'ConsumeNotices') {

              let _obj = {
                title: json.instructions[x].TYPE,
                disabled: !isEnable,
                label: json.instructions[x].label,
                key: json.instructions[x].positionString,
                children: []
              };
              if (self.blockPositions) {
                _obj.key = json.instructions[x].positionString + '/' + self.coreService.lowerFLetter(json.instructions[x].TYPE)
              }
              if (flag) {
                obj.children.push(_obj);
              }
              if ((json.instructions[x].TYPE === 'Cycle' && json.instructions[x].cycleWorkflow)) {
                recursive(json.instructions[x].cycleWorkflow, _obj);
              } else if ((json.instructions[x].TYPE === 'Lock' && json.instructions[x].lockedWorkflow)) {
                recursive(json.instructions[x].lockedWorkflow, _obj);
              } else if ((json.instructions[x].TYPE === 'Options' && json.instructions[x].block)) {
                recursive(json.instructions[x].block, _obj);
              } else if (((json.instructions[x].TYPE === 'ConsumeNotices' || json.instructions[x].TYPE === 'StickySubagent') && json.instructions[x].subworkflow)) {
                recursive(json.instructions[x].subworkflow, _obj);
              } else if ((json.instructions[x].TYPE === 'ForkList' && json.instructions[x].workflow)) {
                recursive(json.instructions[x].workflow, _obj);
              } else {
                recursive(json.instructions[x], _obj);
              }
            } else {
              if (json.instructions[x].instructions) {
                recursive(json.instructions[x], obj);
              }
            }
          }

        }
      }
    }

    if (this.workflow) {
      recursive({
        instructions: this.workflow.actual || this.workflow.instructions
      }, nodes);
    }
    self.nodes = nodes.children;
  }

  selectStartNode(value) {
    if (value) {
      this.obj.endPositions = [];
    }
    this.onBlur.emit();
  }

  selectBlockPosition(value) {
    if (value) {
      this.obj.startPosition = '';
      this.obj.endPositions = [];
      if (this.blockPositions.has(value)) {
        let positions = this.blockPositionList.get(this.blockPositions.get(value));
        if (positions && typeof positions == 'string') {
          positions = JSON.parse(positions);
        }
        this.onBlur.emit(positions);
      }
    } else {
      this.onBlur.emit(null);
    }
  }

  showGraphicalView(operation) {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: GraphicalViewModalComponent,
      nzClassName: 'lg',
      nzData: {
        workflow: this.workflow,
        positions: this.newPositions || this.positions,
        data: this.obj,
        operation,
        startNode: operation === 'END' && this.obj.startPosition ? this.obj.startPosition : undefined
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (operation === 'START') {
          this.obj.startPosition = result;
          this.onBlur.emit();
        } else if (operation === 'END') {
          this.obj.endPositions = result;
          this.obj.endPositions = [...this.obj.endPositions];
          this.onBlur.emit();
        } else {
          this.obj.blockPosition = result;
          this.selectBlockPosition(result);
        }
      }
    });
  }
}
