import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-script-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './script-modal.component.html'
})
export class ScriptModalComponent {
  @Input() jobName: string;
  @Input() isScript: boolean;
  @Input() data: any;

  cmOption: any = {
    lineNumbers: true,
    viewportMargin: Infinity,
    mode: 'shell'
  };

  constructor(public activeModal: NzModalRef) {
  }
}

