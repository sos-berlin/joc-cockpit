import {Component, Input, OnInit, OnDestroy, inject} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelpService } from '../../services/help.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {MarkdownParserService} from "../../services/markdown-parser.service";

@Component({
  selector: 'app-help-viewer',
  templateUrl: './help-viewer.component.html'
})
export class HelpViewerComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  isLoading = false;
  helpKey: string;
  language: string;
  title: string;
  html = '';
  private destroy$ = new Subject<void>();

  constructor(
    private activeModal: NzModalRef,
    private help: HelpService
  ) {}

  ngOnInit(): void {
    this.helpKey = this.modalData.helpKey;
    this.title = this.modalData.title;

    this.language = this.modalData.preferences?.language || 'en';

    this.help.getHelpHtml(this.helpKey).subscribe(h => this.html = h);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}
