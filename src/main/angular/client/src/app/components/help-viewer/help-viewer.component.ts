import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

import { HelpService } from '../../services/help.service';

@Component({
  selector: 'app-help-viewer',
  templateUrl: './help-viewer.component.html',
})
export class HelpViewerComponent implements OnInit, OnDestroy {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  isLoading = false;
  title!: string;
  language!: string;
  helpKey!: string;
  html = '';
  history: string[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly modalRef: NzModalRef,
    private readonly help: HelpService,
    private readonly host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.helpKey = this.modalData.helpKey;
    this.title = this.modalData.title;
    this.language = this.modalData.preferences?.language ?? 'en';

    this.loadHelp(this.helpKey, true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cancel(): void {
    this.modalRef.destroy();
  }

  goBack(): void {
    const prev = this.history.pop();
    if (!prev) return;
    this.loadHelp(prev);
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent): void {
    const el = e.target as HTMLElement;
    const a = el.closest?.('a') as HTMLAnchorElement | null;
    if (!a) return;

    const href = a.getAttribute('href')?.trim() || '';

    if (href.startsWith('#')) {
      e.preventDefault();
      e.stopPropagation();
      this.scrollToId(decodeURIComponent(href.slice(1)));
      return;
    }

    const mdMatch = href.match(/^\/([a-z0-9._-]+)(?:\.md)?$/i);
    if (mdMatch) {
      e.preventDefault();
      e.stopPropagation();
      const key = mdMatch[1];
      this.openHelpFile(key);
      return;
    }

  }

  private loadHelp(key: string, restoreAnchor = false): void {
    this.isLoading = true;

    this.help
      .getHelpHtml(key)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (html) => {
          this.helpKey = key;
          this.html = html || '<p>Help not available.</p>';

          setTimeout(() => {
            const root = this.host.nativeElement.querySelector('.help-md') as HTMLElement | null;
            if (root) this.applyHeadingIds(root);
            if (restoreAnchor) this.scrollToInPageAnchorFromUrl();
          }, 0);
        },
        error: () => (this.html = '<p>Help not available.</p>'),
      });
  }

  private openHelpFile(key: string): void {
    if (this.helpKey) {
      this.history.push(this.helpKey);
    }
    this.loadHelp(key);
  }

  private applyHeadingIds(container: HTMLElement): void {
    const headings = container.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6');
    headings.forEach((h) => {
      if (h.id && h.id.trim()) return;

      const raw = h.textContent || '';
      const custom = raw.match(/\s*\{#([A-Za-z0-9._:-]+)\}\s*$/);
      if (custom) {
        h.id = custom[1];
        h.textContent = raw.replace(/\s*\{#[A-Za-z0-9._:-]+\}\s*$/, '').trim();
        return;
      }

      h.id = this.slug(raw);
    });
  }

  private scrollToId(id: string): void {
    const target =
      this.host.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
      document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('help-md-target');
    setTimeout(() => target.classList.remove('help-md-target'), 800);
  }

  private scrollToInPageAnchorFromUrl(): void {
    const full = window.location.hash || '';
    const secondHash = full.indexOf('#', 1);
    if (secondHash <= 0) return;

    const id = decodeURIComponent(full.slice(secondHash + 1));
    const target =
      this.host.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
      document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private slug(s: string): string {
    return s
      .toLowerCase()
      .trim()
      .replace(/<[^>]+>/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
