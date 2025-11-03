import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { finalize, takeUntil } from 'rxjs/operators';
import {Subject, forkJoin, of, lastValueFrom} from 'rxjs';
import {NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { HelpService, HelpRenderResult } from '../../services/help.service';
import { CoreService } from '../../services/core.service';
import { HttpClient } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import {ToastrService} from "ngx-toastr";

@Component({
  standalone: false,
  selector: 'app-help-viewer',
  templateUrl: './help-viewer.component.html',
})
export class HelpViewerComponent implements OnInit, OnDestroy {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  isLoading = false;
  title!: string;
  helpKey!: string;
  html: any;
  history: string[] = [];
  hasError = false;
  preferences: any;
  helpFilters: any;
  fallbackNotice: any;

  isValidatingLinks = false;
  linkValidationResults: { url: string; isValid: boolean; type: 'internal' | 'external' }[] = [];
  showValidationResults = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly modalRef: NzModalRef,
    private readonly help: HelpService,
    private readonly host: ElementRef<HTMLElement>,
    public coreService: CoreService,
    private readonly http: HttpClient,
    private toasterService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.helpKey = this.modalData.helpKey;
    this.title = this.modalData.title;
    this.helpFilters = this.coreService.getHelpTab();
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
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

  setLocale(): void {
    this.fallbackNotice = '';
    this.help.setLanguage(this.helpFilters.language);
    this.loadHelp(this.helpKey, true);
  }

  async validateLinks(): Promise<void> {
    this.isValidatingLinks = true;
    this.linkValidationResults = [];
    this.showValidationResults = false;

    const root = this.host.nativeElement.querySelector('.help-md') as HTMLElement | null;
    if (!root) {
      this.isValidatingLinks = false;
      return;
    }

    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'));

    if (links.length === 0) {
      this.isValidatingLinks = false;
      this.toasterService.info('No links found to validate.');
      return;
    }

    const validationPromises = links.map(async (link) => {
      const href = link.getAttribute('href')?.trim() || '';

      try {
        if (href.startsWith('#')) {
          const targetId = decodeURIComponent(href.slice(1));
          const target = document.getElementById(targetId) ||
            this.host.nativeElement.querySelector(`[id="${CSS.escape(targetId)}"]`);
          return {
            url: href,
            isValid: !!target,
            type: 'internal' as const
          };
        }

        const mdMatch = href.match(/([a-z0-9._-]+\.md)(#.*)?$/i);
        if (mdMatch) {
          const key = mdMatch[1];
          try {
            const res = await lastValueFrom(
              this.help.getHelpHtml(key).pipe(
                timeout(5000),
                catchError(() => of(null)),
                takeUntil(this.destroy$)
              )
            );
            return {
              url: href,
              isValid: res !== null,
              type: 'internal' as const
            };
          } catch {
            return {
              url: href,
              isValid: false,
              type: 'internal' as const
            };
          }
        }

      if (href.startsWith('/') && !href.startsWith('//')) {
        const routePath = href.split('#')[0].replace(/^\//, '');
        const mdFileName = `${routePath}`;

        try {
          const res = await lastValueFrom(
            this.help.getHelpHtml(mdFileName).pipe(
              timeout(5000),
              catchError(() => of(null)),
              takeUntil(this.destroy$)
            )
          );
          return {
            url: href,
            isValid: res !== null,
            type: 'internal' as const
          };
        } catch {
          return {
            url: href,
            isValid: false,
            type: 'internal' as const
          };
        }
      }

      if (/^https?:\/\//i.test(href)) {
        try {
          const res = await lastValueFrom(
            this.http.head(href, { observe: 'response' }).pipe(
              timeout(10000),
              catchError(() => of(null)),
              takeUntil(this.destroy$)
            )
          );
          return {
            url: href,
            isValid: res !== null && res.status >= 200 && res.status < 400,
            type: 'external' as const
          };
        } catch {
          return {
            url: href,
            isValid: false,
            type: 'external' as const
          };
        }
      }

        return {
          url: href,
          isValid: true,
          type: 'internal' as const
        };
      } catch (error) {
        console.error(`Error validating link ${href}:`, error);
        return {
          url: href,
          isValid: false,
          type: 'internal' as const
        };
      }
    });

    try {
      this.linkValidationResults = await Promise.all(validationPromises);
      this.highlightBrokenLinks();
      this.showValidationResults = true;

      const brokenCount = this.linkValidationResults.filter(r => !r.isValid).length;
      const validCount = this.linkValidationResults.filter(r => r.isValid).length;

      if (brokenCount > 0) {
        this.toasterService.warning(
          `Validation complete: ${brokenCount} broken link(s) found out of ${this.linkValidationResults.length} total links.`
        );
      } else {
        this.toasterService.success(
          `All ${validCount} links are valid!`
        );
      }
    } catch (error) {
      console.error('Error during link validation:', error);
      this.toasterService.error('Error validating links.');
    } finally {
      this.isValidatingLinks = false;
    }
  }

  private highlightBrokenLinks(): void {
    const root = this.host.nativeElement.querySelector('.help-md') as HTMLElement | null;
    if (!root) return;

    const links = root.querySelectorAll<HTMLAnchorElement>('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href')?.trim() || '';
      const result = this.linkValidationResults.find(r => r.url === href);

      link.classList.remove('link-valid', 'link-broken');
      link.style.removeProperty('border-bottom');
      link.style.removeProperty('color');

      if (result) {
        if (result.isValid) {
          link.classList.add('link-valid');
          link.style.borderBottom = '2px solid green';
        } else {
          link.classList.add('link-broken');
          link.style.borderBottom = '2px solid red';
          link.style.color = 'red';
        }
      }
    });
  }

  getBrokenLinks(): typeof this.linkValidationResults {
    return this.linkValidationResults.filter(r => !r.isValid);
  }

  getValidLinks(): typeof this.linkValidationResults {
    return this.linkValidationResults.filter(r => r.isValid);
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent): void {
    const el = e.target as HTMLElement;
    const a = (el.closest?.('a') as HTMLAnchorElement) || null;

    if (!a) return;

    const href = a.getAttribute('href')?.trim();

    if (href?.startsWith('#')) {
      e.preventDefault();
      e.stopPropagation();
      this.scrollToId(decodeURIComponent(href.slice(1)));
      return;
    }

    const mdMatch = href?.match(/([a-z0-9._-]+\.md)(#.*)?$/i);
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
    this.help.getHelpHtml(key)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: HelpRenderResult | null) => {
          this.helpKey = key;
          this.hasError = res === null;
          this.html = res?.html ?? '';

          if (res?.fellBack) {
            this.fallbackNotice = `Showing ${res.usedLang.toUpperCase()} (no ${res.requestedLang.toUpperCase()} file).`;
          } else {
            this.fallbackNotice = '';
          }

          setTimeout(() => {
            const root = this.host.nativeElement.querySelector('.help-md') as HTMLElement | null;
            if (root) {
              this.applyHeadingIds(root);
              if (restoreAnchor) this.scrollToInPageAnchorFromUrl();
            }
          }, 0);
        },
        error: () => {
          this.hasError = true;
          this.html = '';
          this.fallbackNotice = '';
        }
      });
  }

  private openHelpFile(key: string): void {
    if (this.helpKey) this.history.push(this.helpKey);
    this.fallbackNotice = '';
    this.loadHelp(key);
  }

  private applyHeadingIds(container: HTMLElement): void {
    const headings = container.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6');
    headings.forEach((h) => {
      if (h.id && h.id.trim()) return;

      const raw = h.textContent || '';
      const custom = raw.match(/\{#([A-Za-z0-9._-]+)\}/);
      if (custom) {
        h.id = custom[1];
        h.textContent = raw.replace(/\s*\{#[A-Za-z0-9._-]+\}\s*/, '').trim();
        return;
      }
      h.id = this.slug(raw);
    });
  }

  private scrollToId(id: string): void {
    const target =
      this.host.nativeElement.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`) ||
      document.getElementById(id);

    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('help-md-target');
    setTimeout(() => target.classList.remove('help-md-target'), 800);
  }

  private scrollToInPageAnchorFromUrl(): void {
    const full = window.location.hash;
    const secondHash = full.indexOf('#', 1);
    if (secondHash < 0) return;

    const id = decodeURIComponent(full.slice(secondHash + 1));
    const target =
      this.host.nativeElement.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`) ||
      document.getElementById(id);

    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private slug(s: string): string {
    return s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
