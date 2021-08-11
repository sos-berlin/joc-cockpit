import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-value-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './value-editor.html'
})
export class ValueEditorComponent implements AfterViewInit {
  @ViewChild('myinput') myInputField: ElementRef;
  @Input() data: any;

  constructor(public activeModal: NzModalRef) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.myInputField && this.myInputField.nativeElement) {
        this.myInputField.nativeElement.focus();
      }
    }, 10);
  }

  onSubmit(): void {
    this.activeModal.close(this.data);
  }
}
