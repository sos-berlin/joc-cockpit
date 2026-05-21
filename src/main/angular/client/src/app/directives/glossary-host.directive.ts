import {
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { Overlay, OverlayRef, OverlayPositionBuilder, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { GlossaryService } from '../services/glossary.service';
import { GlossaryPopoverComponent } from '../components/glossary-popover/glossary-popover.component';
import { MarkdownParserService } from '../services/markdown-parser.service';
import { CoreService } from '../services/core.service';

/**
 * [appGlossaryHost]
 *
 * Apply this directive to any container that has markdown-rendered HTML with
 * `.glossary-term` spans in it (from `^term^` syntax).
 *
 * On hover (or click on mobile), it opens a lightweight CDK-based popover that
 * shows the glossary definition (markdown-rendered, supports nested terms).
 *
 * Language is resolved automatically from preferences.locale (sessionStorage)
 * with fallback to 'en'.
 *
 * Example:
 *   <div [innerHTML]="html" appGlossaryHost></div>
 */

/** Module-level counter of currently open glossary popovers across all directive instances. */
let openGlossaryCount = 0;

@Directive({
  standalone: false,
  selector: '[appGlossaryHost]',
})
export class GlossaryHostDirective implements OnDestroy {
  private get lang(): string {
    try {
      const prefs = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
      return prefs.locale || 'en';
    } catch { return 'en'; }
  }

  /**
   * Returns the language to use when opening a glossary popover.
   * Prefers the last language the user explicitly selected this session
   * (stored in sessionStorage under 'glossary_lang').
   * Falls back to the preference locale on a fresh page load (sessionStorage cleared).
   */
  private get glossaryLang(): string {
    return sessionStorage.getItem('glossary_lang') || this.lang;
  }

  /** Dynamic list of supported language codes derived from coreService.locales. */
  private get supportedLangs(): string[] {
    return this.coreService.locales?.length
      ? this.coreService.locales.map((l: any) => l.lang)
      : ['en'];
  }

  private overlayRef: OverlayRef | null = null;
  private activeKey: string | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private insidePopover = false;
  private positionSub: Subscription | null = null;
  /** Per-directive render cache: lang:key → SafeHtml */
  private readonly renderCache = new Map<string, import('@angular/platform-browser').SafeHtml | null>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly positionBuilder = inject(OverlayPositionBuilder);
  private readonly glossary = inject(GlossaryService);
  private readonly md = inject(MarkdownParserService);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly vcr = inject(ViewContainerRef);
  private readonly coreService = inject(CoreService);

  constructor() {
    // Eagerly load all supported language files so that language switching
    // is instant (no HTTP fetch at click time). The service caches each file
    // after the first load, so across all directive instances this fires at
    // most one request per language for the lifetime of the page.
    this.supportedLangs.forEach(l => this.glossary.loadGlossary(l).subscribe());

    const host: HTMLElement = this.el.nativeElement;

    host.addEventListener('mouseover', (e: MouseEvent) => {
      const span = (e.target as HTMLElement).closest('.glossary-term[data-glossary-key]') as HTMLElement | null;
      if (!span) return;
      const key = span.getAttribute('data-glossary-key');
      if (!key) return;

      if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }

      // Already showing the same key – nothing to do.
      if (this.overlayRef && this.activeKey === key) return;

      // Pre-warm: start resolving the definition immediately so it is ready
      // before the hover delay expires and the popover is actually opened.
      this.prewarm(key);

      if (this.hoverTimer) clearTimeout(this.hoverTimer);
      this.hoverTimer = setTimeout(() => this.openFor(span, key), this.hoverDelay);
    });

    host.addEventListener('mouseout', (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      const leavingTerm = !(e.target as HTMLElement).closest('.glossary-term[data-glossary-key]');
      if (leavingTerm) return;

      // Allow moving mouse from term → popover without closing.
      if (this.hoverTimer) { clearTimeout(this.hoverTimer); this.hoverTimer = null; }
      this.closeTimer = setTimeout(() => {
        if (!this.insidePopover) this.close();
      }, 120);
    });

    // Mobile / keyboard fallback: click toggles the popover.
    host.addEventListener('click', (e: MouseEvent) => {
      const span = (e.target as HTMLElement).closest('.glossary-term[data-glossary-key]') as HTMLElement | null;
      if (!span) return;
      const key = span.getAttribute('data-glossary-key');
      if (!key) return;
      e.stopPropagation();

      if (this.overlayRef && this.activeKey === key) {
        this.close();
      } else {
        this.openFor(span, key);
      }
    });

    // Keyboard: Enter/Space on a focused glossary term.
    host.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const span = (e.target as HTMLElement).closest('.glossary-term[data-glossary-key]') as HTMLElement | null;
      if (!span) return;
      const key = span.getAttribute('data-glossary-key');
      if (!key) return;
      e.preventDefault();
      if (this.overlayRef && this.activeKey === key) {
        this.close();
      } else {
        this.openFor(span, key);
      }
    });
  }

  private get hoverDelay(): number {
    try {
      const prefs = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
      const d = parseFloat(prefs.tooltipDelay);
      return isNaN(d) || d < 0 ? 200 : d * 1000;
    } catch { return 200; }
  }

  private openFor(anchor: HTMLElement, key: string): void {
    const replacing = !!this.overlayRef;
    if (this.overlayRef) this.close(true);

    // Count new opens only — replacements (same directive, new key) keep count stable.
    if (!replacing) openGlossaryCount++;
    this.activeKey = key;

    const positionStrategy = (this.positionBuilder
      .flexibleConnectedTo(anchor)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(true)
      .withPush(true)
      .withViewportMargin(8)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 6 },
        { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
        { originX: 'end',   originY: 'bottom', overlayX: 'end',   overlayY: 'top',    offsetY: 6 },
        { originX: 'end',   originY: 'top',    overlayX: 'end',   overlayY: 'bottom', offsetY: -6 },
      ]) as FlexibleConnectedPositionStrategy);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: 'glossary-popover-panel',
    });

    this.positionSub = positionStrategy.positionChanges.subscribe(change => {
      const { overlayY } = change.connectionPair;
      const panelEl = this.overlayRef!.overlayElement;
      panelEl.classList.remove('glossary-pop-below', 'glossary-pop-above');
      panelEl.classList.add(overlayY === 'top' ? 'glossary-pop-below' : 'glossary-pop-above');
    });

    const portal = new ComponentPortal<GlossaryPopoverComponent>(GlossaryPopoverComponent, this.vcr);
    const compRef = this.overlayRef.attach(portal);
    const popoverInstance = compRef.instance as GlossaryPopoverComponent;

    popoverInstance.termKey   = key;
    popoverInstance.termLabel = anchor.getAttribute('data-glossary-label') || key;
    popoverInstance.activeLang = this.glossaryLang;
    popoverInstance.allLangs   = this.supportedLangs;
    popoverInstance.onLangSwitch = (newLang: string) => {
      this.switchPopoverLang(newLang, popoverInstance, compRef);
    };

    const lang = this.glossaryLang;
    const cacheKey = `${lang}:${key}`;
    if (this.renderCache.has(cacheKey)) {
      // Content already pre-warmed — render instantly, no spinner.
      const cached = this.renderCache.get(cacheKey)!;
      if (cached !== null) {
        popoverInstance.definitionHtml = cached;
        popoverInstance.notFound       = false;
        popoverInstance.isLoading      = false;
        compRef.changeDetectorRef.markForCheck();
      } else {
        // No data in user's language → fall back to English immediately.
        this.applyWithEnFallback(key, lang, popoverInstance, compRef);
      }
    } else {
      // Not cached yet — fetch & render now (shows spinner until ready).
      this.glossary.getDefinition(key, lang).subscribe(rawDef => {
        if (!popoverInstance) return;
        const rendered = rawDef ? this.renderMarkdown(rawDef) : null;
        this.renderCache.set(cacheKey, rendered);
        if (rendered !== null) {
          popoverInstance.definitionHtml = rendered;
          popoverInstance.notFound       = false;
          popoverInstance.isLoading      = false;
          compRef.changeDetectorRef.markForCheck();
        } else {
          this.applyWithEnFallback(key, lang, popoverInstance, compRef);
        }
      });
    }

    // Track mouse inside popover so moving from term → popover keeps it open.
    const panelEl: HTMLElement = this.overlayRef.overlayElement;
    // Depth: host's nearest ancestor glossary panel depth + 1, or 1 for top-level.
    // Stamping depth on the panel lets children detect ancestor panels by comparing depth.
    const hostAncestorPanel = (this.el.nativeElement as HTMLElement).closest('.glossary-popover-panel') as HTMLElement | null;
    const myDepth = hostAncestorPanel
      ? (parseInt(hostAncestorPanel.getAttribute('data-glossary-depth') || '0') || 0) + 1
      : 1;
    panelEl.setAttribute('data-glossary-depth', String(myDepth));

    // Handle rt-action-link clicks (context help / video links) inside the popover body.
    panelEl.addEventListener('click', (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('[data-rt-action-type]') as HTMLElement | null;
      if (!anchor) return;
      const type = anchor.getAttribute('data-rt-action-type');
      const param = anchor.getAttribute('data-rt-action-param') || '';
      e.stopPropagation();
      this.close();
      if (type === 'help' || type === 'context') {
        this.coreService.openHelpPage(param);
      } else if (type === 'video') {
        this.coreService.openVideoPage(param);
      }
    });

    panelEl.addEventListener('mouseenter', () => {
      this.insidePopover = true;
      if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
    });
    panelEl.addEventListener('mouseleave', (e: MouseEvent) => {
      this.insidePopover = false;
      const nestedPanel = (e.relatedTarget as HTMLElement | null)?.closest?.('.glossary-popover-panel') as HTMLElement | null;
      if (nestedPanel && nestedPanel !== panelEl) {
        const targetDepth = parseInt(nestedPanel.getAttribute('data-glossary-depth') || '0') || 0;
        if (targetDepth > myDepth) {
          // Mouse moved into a deeper (child) panel — stay open and track.
          this.trackNestedPanelChain(nestedPanel, panelEl, myDepth);
          return;
        }
        // Mouse moved to an ancestor or sibling panel — close this popover.
      }
      this.closeTimer = setTimeout(() => {
        if (!this.insidePopover) this.close();
      }, 120);
    });

    // Click outside closes.
    setTimeout(() => {
      document.addEventListener('click', this.outsideClick, true);
      document.addEventListener('keydown', this.escapeHandler, true);
    }, 0);
  }

  private readonly outsideClick = (e: MouseEvent) => {
    if (!this.overlayRef) return;
    const target = e.target as HTMLElement;
    if (
      !this.el.nativeElement.contains(target) &&
      !this.overlayRef.overlayElement.contains(target) &&
      !target.closest?.('.glossary-popover-panel')
    ) {
      this.close();
    }
  };

  /**
   * Switches the displayed language in an already-open popover.
   * Re-uses the render cache when available; otherwise fetches & renders.
   * Falls back to English if the selected language has no definition.
   */
  private switchPopoverLang(
    newLang: string,
    popoverInstance: GlossaryPopoverComponent,
    compRef: ComponentRef<GlossaryPopoverComponent>,
  ): void {
    const key = this.activeKey;
    if (!key) return;

    // Persist selection so all subsequent glossary popovers in this session
    // open in the same language. Cleared automatically when the tab/session ends.
    sessionStorage.setItem('glossary_lang', newLang);

    const cacheKey = `${newLang}:${key}`;

    if (this.renderCache.has(cacheKey)) {
      const cached = this.renderCache.get(cacheKey)!;
      if (cached !== null) {
        popoverInstance.activeLang     = newLang;
        popoverInstance.definitionHtml = cached;
        popoverInstance.notFound       = false;
        popoverInstance.isLoading      = false;
        compRef.changeDetectorRef.markForCheck();
      } else {
        // Cached as not-found — apply en fallback.
        popoverInstance.activeLang = newLang;
        this.applyWithEnFallback(key, newLang, popoverInstance, compRef);
      }
      return;
    }

    popoverInstance.activeLang     = newLang;
    popoverInstance.isLoading      = true;
    popoverInstance.definitionHtml = null;
    popoverInstance.notFound       = false;
    compRef.changeDetectorRef.markForCheck();

    this.glossary.getDefinition(key, newLang).subscribe(rawDef => {
      const rendered = rawDef ? this.renderMarkdown(rawDef) : null;
      this.renderCache.set(cacheKey, rendered);
      if (rendered !== null) {
        popoverInstance.definitionHtml = rendered;
        popoverInstance.notFound       = false;
        popoverInstance.isLoading      = false;
        compRef.changeDetectorRef.markForCheck();
      } else {
        this.applyWithEnFallback(key, newLang, popoverInstance, compRef);
      }
    });
  }

  /**
   * Applies content, falling back to English when the requested language
   * has no definition. activeLang stays at the requested language so the
   * selected button remains highlighted — only the displayed content changes to English.
   */
  private applyWithEnFallback(
    key: string,
    requestedLang: string,
    popoverInstance: GlossaryPopoverComponent,
    compRef: ComponentRef<GlossaryPopoverComponent>,
  ): void {
    if (requestedLang === 'en') {
      // Already English, nothing to fall back to.
      popoverInstance.definitionHtml = null;
      popoverInstance.notFound       = true;
      popoverInstance.isLoading      = false;
      compRef.changeDetectorRef.markForCheck();
      return;
    }

    const enCacheKey = `en:${key}`;
    const applyEn = (rendered: import('@angular/platform-browser').SafeHtml | null) => {
      // Show English content as fallback but keep activeLang as the language
      // the user selected — its button stays highlighted/active.
      popoverInstance.definitionHtml = rendered;
      popoverInstance.notFound       = rendered === null;
      popoverInstance.isLoading      = false;
      // activeLang intentionally NOT changed — the clicked language stays active.
      compRef.changeDetectorRef.markForCheck();
    };

    if (this.renderCache.has(enCacheKey)) {
      applyEn(this.renderCache.get(enCacheKey)!);
      return;
    }

    this.glossary.getDefinition(key, 'en').subscribe(enDef => {
      const rendered = enDef ? this.renderMarkdown(enDef) : null;
      this.renderCache.set(enCacheKey, rendered);
      applyEn(rendered);
    });
  }

  /** Renders a raw markdown definition string to SafeHtml. */
  private renderMarkdown(rawDef: string): import('@angular/platform-browser').SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(
      this.md.parseMarkdown(rawDef, {
        gfm: true, tables: false, breaks: false,
        smartypants: true, headerIds: false, headerPrefix: '', sanitize: true,
      }) as string
    );
  }

  /**
   * Pre-warms the render cache for a glossary key so that when the popover
   * opens (after hoverDelay) the content is already rendered and shown
   * instantly without any loading spinner.
   * Safe to call multiple times — skips if already cached.
   */
  private prewarm(key: string): void {
    // Pre-warm all supported languages for this key in parallel so that
    // switching language in the popover is instant with no spinner.
    this.supportedLangs.forEach(lang => {
      const cacheKey = `${lang}:${key}`;
      if (this.renderCache.has(cacheKey)) return;
      this.glossary.getDefinition(key, lang).subscribe(rawDef => {
        if (this.renderCache.has(cacheKey)) return;
        const rendered = rawDef ? this.renderMarkdown(rawDef) : null;
        this.renderCache.set(cacheKey, rendered);
      });
    });
  }

  /**
   * Tracks the mouse through a chain of nested glossary panels.
   * returnDepth is the depth of this directive's own panel (the panel that should stay open).
   * – mouse returns to returnPanel             → insidePopover = true, stop tracking
   * – mouse goes to a panel deeper than returnDepth → keep tracking (it's a grandchild)
   * – mouse goes to a panel at or shallower depth   → close (it's an ancestor/sibling)
   * – mouse leaves all panels                  → close
   */
  private trackNestedPanelChain(currentPanel: HTMLElement, returnPanel: HTMLElement, returnDepth: number): void {
    currentPanel.addEventListener('mouseleave', (e: MouseEvent) => {
      const gr = e.relatedTarget as HTMLElement | null;

      // Mouse returned directly to our own panel.
      if (gr && returnPanel.contains(gr)) {
        this.insidePopover = true;
        if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
        return;
      }

      // Mouse moved to another glossary panel — decide by depth.
      const nextPanel = gr?.closest?.('.glossary-popover-panel') as HTMLElement | null;
      if (nextPanel && nextPanel !== currentPanel) {
        const nextDepth = parseInt(nextPanel.getAttribute('data-glossary-depth') || '0') || 0;
        if (nextDepth > returnDepth) {
          // Moved deeper — keep tracking.
          this.trackNestedPanelChain(nextPanel, returnPanel, returnDepth);
          return;
        }
        // Moved to ancestor or sibling — close.
      }

      // Left all relevant panels — close.
      if (!this.insidePopover) {
        this.closeTimer = setTimeout(() => this.close(), 120);
      }
    }, { once: true });
  }

  private readonly escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
  };

  close(immediate = false): void {
    if (!this.overlayRef) return;
    document.removeEventListener('click', this.outsideClick, true);
    document.removeEventListener('keydown', this.escapeHandler, true);
    this.positionSub?.unsubscribe();
    this.positionSub = null;
    this.insidePopover = false;
    this.activeKey = null;

    const bubbleEl = this.overlayRef.overlayElement.querySelector('.glossary-popover-bubble') as HTMLElement | null;
    const ref = this.overlayRef;
    this.overlayRef = null;

    if (!immediate && bubbleEl) {
      bubbleEl.classList.add('glossary-pop-fade-out');
      setTimeout(() => ref.dispose(), 150);
    } else {
      ref.dispose();
    }

    if (!immediate) {
      // Actual close (not a replace-with-new-key). Decrement the global counter
      // and reset the session language once all popovers are gone so the next
      // open goes back to the preference locale.
      openGlossaryCount = Math.max(0, openGlossaryCount - 1);
      if (openGlossaryCount === 0) sessionStorage.removeItem('glossary_lang');
    }
  }

  ngOnDestroy(): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    if (this.closeTimer) clearTimeout(this.closeTimer);
    document.removeEventListener('click', this.outsideClick, true);
    document.removeEventListener('keydown', this.escapeHandler, true);
    this.positionSub?.unsubscribe();
    if (this.overlayRef) {
      // Directive torn down while popover is still open — treat as a close.
      openGlossaryCount = Math.max(0, openGlossaryCount - 1);
      if (openGlossaryCount === 0) sessionStorage.removeItem('glossary_lang');
      this.overlayRef.dispose();
    }
  }
}
