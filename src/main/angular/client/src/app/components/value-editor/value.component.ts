import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-value-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './value-editor.html'
})
export class ValueEditorComponent {
  @Input() data: any;

  constructor(public activeModal: NzModalRef) {
  }

  onSubmit(): void {
    this.activeModal.close(this.data);
  }
}
