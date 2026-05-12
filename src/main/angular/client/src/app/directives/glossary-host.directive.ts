import {
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
    // Eagerly load the glossary for the current language so it is already
    // cached by the time the user hovers on a term. This eliminates the
    // network-wait delay that would otherwise appear as a spinner on first hover.
    this.glossary.loadGlossary(this.lang).subscribe();

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
    if (this.overlayRef) this.close(true);

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

    const cacheKey = `${this.lang}:${key}`;
    if (this.renderCache.has(cacheKey)) {
      // Content already pre-warmed — render instantly, no spinner.
      const cached = this.renderCache.get(cacheKey)!;
      popoverInstance.definitionHtml = cached;
      popoverInstance.notFound = cached === null;
      popoverInstance.isLoading = false;
      compRef.changeDetectorRef.markForCheck();
    } else {
      // Not cached yet — fetch & render now (shows spinner until ready).
      const lang = this.lang;
      this.glossary.getDefinition(key, lang).subscribe(rawDef => {
        if (!popoverInstance) return;
        const rendered = rawDef
          ? this.domSanitizer.bypassSecurityTrustHtml(
              this.md.parseMarkdown(rawDef, {
                gfm: true, tables: false, breaks: false,
                smartypants: true, headerIds: false, headerPrefix: '', sanitize: true,
              }) as string
            )
          : null;
        this.renderCache.set(cacheKey, rendered);
        popoverInstance.definitionHtml = rendered;
        popoverInstance.notFound = rendered === null;
        popoverInstance.isLoading = false;
        compRef.changeDetectorRef.markForCheck();
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
   * Pre-warms the render cache for a glossary key so that when the popover
   * opens (after hoverDelay) the content is already rendered and shown
   * instantly without any loading spinner.
   * Safe to call multiple times — skips if already cached.
   */
  private prewarm(key: string): void {
    const cacheKey = `${this.lang}:${key}`;
    if (this.renderCache.has(cacheKey)) return;
    const lang = this.lang;
    this.glossary.getDefinition(key, lang).subscribe(rawDef => {
      if (this.renderCache.has(cacheKey)) return; // may have been set by a concurrent open
      const rendered = rawDef
        ? this.domSanitizer.bypassSecurityTrustHtml(
            this.md.parseMarkdown(rawDef, {
              gfm: true, tables: false, breaks: false,
              smartypants: true, headerIds: false, headerPrefix: '', sanitize: true,
            }) as string
          )
        : null;
      this.renderCache.set(cacheKey, rendered);
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
  }

  ngOnDestroy(): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    if (this.closeTimer) clearTimeout(this.closeTimer);
    document.removeEventListener('click', this.outsideClick, true);
    document.removeEventListener('keydown', this.escapeHandler, true);
    this.positionSub?.unsubscribe();
    this.overlayRef?.dispose();
  }
}
