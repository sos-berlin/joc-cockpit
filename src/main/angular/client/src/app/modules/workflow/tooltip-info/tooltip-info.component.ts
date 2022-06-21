import {Component, Input} from '@angular/core';
import {CoreService} from "../../../services/core.service";

@Component({
  selector: 'app-tooltip-info',
  templateUrl: './tooltip-info.component.html'
})
export class TooltipInfoComponent {
  @Input() workflow;
  @Input() controllerId;

  constructor(public coreService: CoreService) {
  }

  getTooltipInfo(workflow): void {
    this.coreService.post('workflow/state', {
      controllerId: this.controllerId,
      workflowId: {
        path: workflow.path,
        version: workflow.version
      }
    }).subscribe({
      next: (res: any) => {
        workflow.info = res;
      }
    });
  }

}
