import {Component, Input, OnInit, OnDestroy, inject} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelpService } from '../../services/help.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-help-viewer',
  templateUrl: './help-viewer.component.html',
})
export class HelpViewerComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  helpContent: SafeHtml = '';
  isLoading = false;
  helpKey: string;
  language: string;
  title: string;
  private destroy$ = new Subject<void>();

  constructor(
    private helpService: HelpService,
    private sanitizer: DomSanitizer,
    private activeModal: NzModalRef
  ) {}

  ngOnInit(): void {
    // Extract data from modalData
    this.helpKey = this.modalData.helpKey;
    this.title = this.modalData.title || 'Help';

    // Get language from preferences or default to 'en'
    this.language = this.modalData.preferences?.language || 'en';

    // Load help content immediately
    this.loadHelpContent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHelpContent(): void {
    if (!this.helpKey) {
      console.warn('Help key is required');
      this.helpContent = this.sanitizer.bypassSecurityTrustHtml('<p>Help key not provided.</p>');
      return;
    }

    this.isLoading = true;
    this.helpService.getHelpContent(this.helpKey, this.language)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (content) => {
          this.helpContent = this.sanitizer.bypassSecurityTrustHtml(content);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading help content:', error);
          this.helpContent = this.sanitizer.bypassSecurityTrustHtml(
            '<p>Help content could not be loaded. Please try again later.</p>'
          );
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}
