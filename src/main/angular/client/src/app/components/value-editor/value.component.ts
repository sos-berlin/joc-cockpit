import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

declare const $;

@Component({
  selector: 'app-value-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './value-editor.html'
})
export class ValueEditorComponent implements AfterViewInit {
  @ViewChild('myinput') myInputField: ElementRef;
  @Input() data: any;
  height = 10;

  constructor(public activeModal: NzModalRef) {
  }

  ngAfterViewInit(): void {
    this.height = Math.ceil(($('body').height() - 212) / 20);
    setTimeout(() => {
      if (this.myInputField && this.myInputField.nativeElement) {
        this.myInputField.nativeElement.focus();
        this.do_resize();
      }
    }, 10);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.height = Math.ceil(($('body').height() - 212) / 20);
    this.do_resize();
  }

  do_resize() {
    const maxrows = 10;
    const arraytxt = this.data.split('\n');
    let rows = arraytxt.length;
    for (let i = 0; i < arraytxt.length; i++) {
      if (arraytxt[i].length > 110) {
        rows += 1;
      }
    }
    if (rows < maxrows) {
      this.myInputField.nativeElement.rows = maxrows;
    } else {
      this.myInputField.nativeElement.rows = rows < this.height ? Math.floor(rows) : this.height;
    }
  }

  onSubmit(): void {
    this.activeModal.close(this.data);
  }
}
