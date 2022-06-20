import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {WorkflowService} from "../../services/workflow.service";

@Component({
  selector: 'app-graphical-view-modal',
  templateUrl: './graphical-view-modal.component.html'
})
export class GraphicalViewModalComponent implements OnInit {
  @Input() workflow: any;
  @Input() positions: any;
  @Input() operation: string;
  disabledDrag = true;

  constructor(public coreService: CoreService, private activeModal: NzModalRef, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    console.log(this.workflow.configuration)
    this.workflowService.convertTryToRetry(this.workflow.configuration, () =>{

    });
    this.checkPositions()
  }

  private checkPositions(): void {
    console.log(this.positions)
  }

  onSubmit(): void {

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
  }
}


