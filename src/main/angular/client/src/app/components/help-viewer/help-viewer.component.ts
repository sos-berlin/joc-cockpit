import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { finalize, takeUntil, catchError, timeout, retryWhen, delay, take } from 'rxjs/operators';
import { Subject, lastValueFrom, of } from 'rxjs';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { HelpService, HelpRenderResult } from '../../services/help.service';
import { CoreService } from '../../services/core.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

interface LinkValidationResult {
  url: string;
  isValid: boolean;
  type: 'internal' | 'external';
  status?: 'verified' | 'broken' | 'cors-blocked' | 'error';
}

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
  fallbackNotice: any;

  isValidatingLinks = false;
  linkValidationResults: LinkValidationResult[] = [];
  showValidationResults = false;
  isValidate = false;
  private readonly INTERNAL_LINK_TIMEOUT = 5000;
  private readonly EXTERNAL_LINK_TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 2;
  private readonly RETRY_DELAY = 2000;

  searchText = '';
  searchCaseSensitive = false;
  searchWholeWord = false;
  currentMatchIndex = -1;
  totalMatches = 0;
  private searchMatches: { element: HTMLElement; originalHtml: string }[] = [];
  showSearchBar = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly modalRef: NzModalRef,
    private readonly help: HelpService,
    private readonly host: ElementRef<HTMLElement>,
    public coreService: CoreService,
    private readonly http: HttpClient,
    private toasterService: ToastrService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.isValidate = sessionStorage['enableLinkChecker'] == 'true';
    this.helpKey = this.modalData.helpKey;
    this.title = this.modalData.title;
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};

    const userLanguage = this.preferences.locale || localStorage['$SOS$LANG'] || 'en';
    this.help.setLanguage(userLanguage);

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


  async validateLinks(): Promise<void> {
    this.isValidatingLinks = true;
    this.linkValidationResults = [];
    this.showValidationResults = false;

    const root = this.host.nativeElement.querySelector('.help-md') as HTMLElement | null;
    if (!root) {
      this.isValidatingLinks = false;
      this.toasterService.warning('Help content not loaded. Please wait and try again.');
      return;
    }

    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'));

    if (links.length === 0) {
      this.isValidatingLinks = false;
      this.toasterService.info('No links found to validate.');
      return;
    }

    this.toasterService.info(`Validating ${links.length} link(s)...`);

    const validationPromises = links.map((link) => this.validateSingleLink(link));

    try {
      this.linkValidationResults = await Promise.all(validationPromises);
      this.highlightBrokenLinks();
      this.showValidationResults = true;

      const brokenCount = this.linkValidationResults.filter(r => !r.isValid).length;
      const corsBlockedCount = this.linkValidationResults.filter(r => r.status === 'cors-blocked').length;
      const validCount = this.linkValidationResults.filter(r => r.isValid).length;

      const message = `Validation complete: ${validCount} valid, ${brokenCount} broken${corsBlockedCount > 0 ? `, ${corsBlockedCount} CORS-blocked` : ''} out of ${this.linkValidationResults.length} total.`;

      if (brokenCount > 0) {
        this.toasterService.error(message);
      } else if (corsBlockedCount > 0) {
        this.toasterService.warning(message);
      } else {
        this.toasterService.success(message);
      }
    } catch (error) {
      console.error('Error during link validation:', error);
      this.toasterService.error('Error validating links.');
    } finally {
      this.isValidatingLinks = false;
    }
  }


  private async validateSingleLink(link: HTMLAnchorElement): Promise<LinkValidationResult> {
    const href = link.getAttribute('href')?.trim() || '';

    try {
      if (href.startsWith('#')) {
        return this.validateAnchorLink(href);
      }

      const mdMatch = href.match(/([a-z0-9._-]+\.md)(#.*)?$/i);
      if (mdMatch) {
        return await this.validateMarkdownLink(mdMatch[1]);
      }

      if (href.startsWith('/') && !href.startsWith('//')) {
        return await this.validateInternalRoutePath(href);
      }

      if (/^https?:\/\//i.test(href)) {
        return await this.validateExternalLink(href);
      }

      return {
        url: href,
        isValid: true,
        type: 'internal',
        status: 'verified'
      };
    } catch (error) {
      console.error(`Unexpected error validating link ${href}:`, error);
      return {
        url: href,
        isValid: false,
        type: 'internal',
        status: 'error'
      };
    }
  }


  private validateAnchorLink(href: string): LinkValidationResult {
    const targetId = decodeURIComponent(href.slice(1));
    const target = document.getElementById(targetId) ||
      this.host.nativeElement.querySelector(`[id="${CSS.escape(targetId)}"]`);

    return {
      url: href,
      isValid: !!target,
      type: 'internal',
      status: target ? 'verified' : 'broken'
    };
  }


  private async validateMarkdownLink(fileName: string): Promise<LinkValidationResult> {
    try {
      const res = await lastValueFrom(
        this.help.getHelpHtml(fileName).pipe(
          timeout(this.INTERNAL_LINK_TIMEOUT),
          catchError(() => of(null)),
          takeUntil(this.destroy$)
        )
      );

      return {
        url: fileName,
        isValid: res !== null,
        type: 'internal',
        status: res !== null ? 'verified' : 'broken'
      };
    } catch (error) {
      console.warn(`Failed to validate markdown link ${fileName}:`, error);
      return {
        url: fileName,
        isValid: false,
        type: 'internal',
        status: 'error'
      };
    }
  }


  private async validateInternalRoutePath(href: string): Promise<LinkValidationResult> {
    try {
      const routePath = href.split('#')[0].replace(/^\//, '');

      const res = await lastValueFrom(
        this.help.getHelpHtml(routePath).pipe(
          timeout(this.INTERNAL_LINK_TIMEOUT),
          catchError(() => of(null)),
          takeUntil(this.destroy$)
        )
      );

      return {
        url: href,
        isValid: res !== null,
        type: 'internal',
        status: res !== null ? 'verified' : 'broken'
      };
    } catch (error) {
      console.warn(`Failed to validate route path ${href}:`, error);
      return {
        url: href,
        isValid: false,
        type: 'internal',
        status: 'error'
      };
    }
  }


  private async validateExternalLink(href: string): Promise<LinkValidationResult> {
    try {
      const res = await lastValueFrom(
        this.http.head(href, { observe: 'response' }).pipe(
          timeout(this.EXTERNAL_LINK_TIMEOUT),
          retryWhen(errors =>
            errors.pipe(
              delay(this.RETRY_DELAY),
              take(this.RETRY_ATTEMPTS)
            )
          ),
          catchError((error) => {
            const errorMessage = error?.message || error?.status || '';
            console.warn(`External link validation failed for ${href}: ${errorMessage}`);
            return of(null);
          }),
          takeUntil(this.destroy$)
        )
      );

      if (res !== null && res.status >= 200 && res.status < 400) {
        return {
          url: href,
          isValid: true,
          type: 'external',
          status: 'verified'
        };
      } else if (res !== null && res.status >= 400) {
        return {
          url: href,
          isValid: false,
          type: 'external',
          status: 'broken'
        };
      } else {
        return {
          url: href,
          isValid: true,
          type: 'external',
          status: 'cors-blocked'
        };
      }
    } catch (error: any) {
      const isCorsError = error?.status === 0 ||
        error?.message?.includes('CORS') ||
        error?.message?.includes('refused');

      if (isCorsError) {
        console.warn(`CORS blocked for external link ${href}`);
        return {
          url: href,
          isValid: true,
          type: 'external',
          status: 'cors-blocked'
        };
      }

      console.error(`Error validating external link ${href}:`, error);
      return {
        url: href,
        isValid: false,
        type: 'external',
        status: 'error'
      };
    }
  }


  private highlightBrokenLinks(): void {
    const root = this.host.nativeElement.querySelector('.help-md') as HTMLElement | null;
    if (!root) return;

    const links = root.querySelectorAll<HTMLAnchorElement>('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href')?.trim() || '';
      const result = this.linkValidationResults.find(r => r.url === href);

      link.classList.remove('link-valid', 'link-broken', 'link-cors-blocked');
      link.style.removeProperty('border-bottom');
      link.style.removeProperty('color');
      link.removeAttribute('title');

      if (result) {
        if (result.isValid && result.status === 'verified') {
          link.classList.add('link-valid');
          link.style.borderBottom = '2px solid green';
          link.title = 'Link verified as working';
        } else if (result.isValid && result.status === 'cors-blocked') {
          link.classList.add('link-cors-blocked');
          link.style.borderBottom = '2px solid orange';
          link.style.color = 'darkorange';
          link.title = 'External link - cannot verify due to CORS policy (likely working)';
        } else if (!result.isValid) {
          link.classList.add('link-broken');
          link.style.borderBottom = '2px solid red';
          link.style.color = 'red';
          link.title = `Link is broken (${result.status})`;
        }
      }
    });
  }


  getBrokenLinks(): LinkValidationResult[] {
    return this.linkValidationResults.filter(r => !r.isValid && r.status !== 'cors-blocked');
  }


  getValidLinks(): LinkValidationResult[] {
    return this.linkValidationResults.filter(r => r.isValid);
  }


  getCorsBlockedLinks(): LinkValidationResult[] {
    return this.linkValidationResults.filter(r => r.status === 'cors-blocked');
  }


  @HostListener('click', ['$event'])
onClick(e: MouseEvent): void {
  const el = e.target as HTMLElement;
  const a = (el.closest?.('a') as HTMLAnchorElement) || null;

  if (!a) return;

  const href = a.getAttribute('href')?.trim();
  if (!href) return;

  if (href.startsWith('#')) {
    e.preventDefault();
    e.stopPropagation();
    this.scrollToId(decodeURIComponent(href.slice(1)));
    return;
  }

  const mdMatch = href.match(/([a-z0-9._-]+\.md)(#.*)?$/i);
  if (mdMatch) {
    e.preventDefault();
    e.stopPropagation();
    const key = mdMatch[1];
    const anchor = mdMatch[2];
    this.openHelpFile(key);
    if (anchor) {
      setTimeout(() => {
        this.scrollToId(decodeURIComponent(anchor.slice(1)));
      }, 300);
    }
    return;
  }

  if (href.startsWith('/') && !href.startsWith('//')) {
    e.preventDefault();
    e.stopPropagation();

    const parts = href.split('#');
    const routePath = parts[0].replace(/^\//, '');
    const anchor = parts[1];

    this.openHelpFile(routePath);

    if (anchor) {
      setTimeout(() => {
        this.scrollToId(decodeURIComponent(anchor));
      }, 300);
    }
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


  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.clearSearch();
    } else {
      setTimeout(() => {
        const searchInput = document.getElementById('help-search-input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      if (!this.showSearchBar) {
        this.toggleSearchBar();
      }
    }
    if (event.key === 'Escape' && this.showSearchBar) {
      this.toggleSearchBar();
    }
    if (event.key === 'Enter' && this.showSearchBar && this.searchText) {
      event.preventDefault();
      if (event.shiftKey) {
        this.findPrevious();
      } else {
        this.findNext();
      }
    }
  }

  performSearch(): void {
    this.clearHighlights();

    if (!this.searchText || this.searchText.trim().length === 0) {
      this.totalMatches = 0;
      this.currentMatchIndex = -1;
      return;
    }

    const root = this.host.nativeElement.querySelector('.help-md') as HTMLElement | null;
    if (!root) return;

    const searchTerm = this.searchText.trim();
    this.searchMatches = [];

    this.highlightMatches(root, searchTerm);

    this.totalMatches = this.searchMatches.length;

    if (this.totalMatches > 0) {
      this.currentMatchIndex = 0;
      this.scrollToMatch(0);
    } else {
      this.currentMatchIndex = -1;
    }
  }

  handleSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey) {
        this.findPrevious();
      } else {
        this.findNext();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.toggleSearchBar();
    }
  }

  private highlightMatches(element: HTMLElement, searchTerm: string): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.textContent && node.textContent.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const textNodes: Text[] = [];
    let currentNode: Node | null;

    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode as Text);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      const matches = this.findMatchesInText(text, searchTerm);

      if (matches.length > 0) {
        const parent = textNode.parentElement;
        if (!parent) return;

        const span = document.createElement('span');
        span.className = 'help-search-container';

        let lastIndex = 0;
        matches.forEach((match, idx) => {
          if (match.start > lastIndex) {
            span.appendChild(document.createTextNode(text.substring(lastIndex, match.start)));
          }

          const mark = document.createElement('mark');
          mark.className = 'help-search-highlight';
          mark.textContent = text.substring(match.start, match.end);
          mark.setAttribute('data-match-index', String(this.searchMatches.length));
          span.appendChild(mark);

          this.searchMatches.push({
            element: mark,
            originalHtml: text.substring(match.start, match.end)
          });

          lastIndex = match.end;
        });

        if (lastIndex < text.length) {
          span.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        parent.replaceChild(span, textNode);
      }
    });
  }

  private findMatchesInText(text: string, searchTerm: string): { start: number; end: number }[] {
    const matches: { start: number; end: number }[] = [];

    let searchText = this.searchCaseSensitive ? text : text.toLowerCase();
    let searchPattern = this.searchCaseSensitive ? searchTerm : searchTerm.toLowerCase();

    if (this.searchWholeWord) {
      const regex = new RegExp(`\\b${this.escapeRegex(searchPattern)}\\b`, this.searchCaseSensitive ? 'g' : 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length });
      }
    } else {
      let index = searchText.indexOf(searchPattern);
      while (index !== -1) {
        matches.push({ start: index, end: index + searchPattern.length });
        index = searchText.indexOf(searchPattern, index + 1);
      }
    }

    return matches;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  findNext(): void {
    if (this.totalMatches === 0) return;

    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.totalMatches;
    this.scrollToMatch(this.currentMatchIndex);
  }

  findPrevious(): void {
    if (this.totalMatches === 0) return;

    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.totalMatches) % this.totalMatches;
    this.scrollToMatch(this.currentMatchIndex);
  }

  private scrollToMatch(index: number): void {
    this.searchMatches.forEach(match => {
      match.element.classList.remove('help-search-current');
    });

    if (index >= 0 && index < this.searchMatches.length) {
      const match = this.searchMatches[index];
      match.element.classList.add('help-search-current');

      match.element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.clearHighlights();
    this.totalMatches = 0;
    this.currentMatchIndex = -1;
  }

  private clearHighlights(): void {
    const containers = this.host.nativeElement.querySelectorAll('.help-search-container');
    containers.forEach(container => {
      const parent = container.parentElement;
      if (parent) {
        const textContent = container.textContent || '';
        parent.replaceChild(document.createTextNode(textContent), container);
      }
    });

    this.searchMatches = [];
  }

  getSearchStatus(): string {
    if (!this.searchText || this.totalMatches === 0) {
      return this.translate.instant('helpSearch.status.noResults');
    }
    return `${this.currentMatchIndex + 1} ${this.translate.instant('of')} ${this.totalMatches}`;
  }
}
