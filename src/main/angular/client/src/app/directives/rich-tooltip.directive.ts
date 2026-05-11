import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {CoreService} from '../services/core.service';
import {DomSanitizer} from '@angular/platform-browser';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { RichTooltipContentComponent } from '../components/rich-tooltip/rich-tooltip-content.component';

/** Singleton — closes any open tooltip before a new one opens. */
@Injectable({ providedIn: 'root' })
export class RichTooltipRegistry {
  private active: (() => void) | null = null;

  register(closeFn: () => void): void {
    if (this.active && this.active !== closeFn) {
      this.active();
    }
    this.active = closeFn;
  }

  unregister(closeFn: () => void): void {
    if (this.active === closeFn) {
      this.active = null;
    }
  }
}

/**
 * Converts lightweight markdown to safe HTML.
 * Supported: **bold**, *italic*, `code`, [text](url), \n → <br>, - item → <ul><li>
 */
export function mdToHtml(src: string): string {
  if (!src) return '';

  // HTML escape — must include " to prevent attribute injection when
  // content is later interpolated into HTML attribute strings.
  let out = src
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Inline formatting
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)]\(context:([^:)]+):([^)]*)\)/g,
      '<a data-rt-action-type="$2" data-rt-action-param="$3" class="rt-action-link" tabindex="0" role="button">$1</a>')
    .replace(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\^([^^]+?)\^([a-zA-Z]*)/g, (_match: string, inner: string, suffix: string) => {
      const pipeIdx = inner.indexOf('|');
      const label   = (pipeIdx !== -1 ? inner.slice(0, pipeIdx) : inner).trim();
      const key     = pipeIdx !== -1 ? inner.slice(pipeIdx + 1).trim() : label.toLowerCase().replace(/\s+/g, '-');
      const display = suffix ? label + suffix : label;
      return `<span class="glossary-term" data-glossary-key="${key}" data-glossary-label="${label}" tabindex="0" role="button" aria-label="${label} \u2014 glossary term">${display}</span>`;
    });

  // Bullet list: group consecutive lines starting with '- '
  const lines = out.split('\n');
  const result: string[] = [];
  let listItems: string[] = [];
  const flushList = () => {
    if (listItems.length > 0) {
      result.push('<ul>' + listItems.map(i => `<li>${i}</li>`).join('') + '</ul>');
      listItems = [];
    }
  };
  for (const line of lines) {
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
    } else {
      flushList();
      result.push(line);
    }
  }
  flushList();
  return result.join('<br>');
}

let _tooltipIdSeq = 0;

/**
 * [appRichTooltip] — unified tooltip directive.
 * Triggers on hover, click, and keyboard (Enter/Space).
 * Closes on mouseleave, click-outside, and Escape.
 * Positions automatically with speech-bubble arrow.
 * Fully keyboard and screen-reader accessible.
 */
@Directive({
  standalone: false,
  selector: '[appRichTooltip]',
})
export class RichTooltipDirective implements OnInit, OnDestroy {
  @Input('appRichTooltip') content: string | TemplateRef<any> | null = null;

  private overlayRef: OverlayRef | null = null;
  private activePanelEl: HTMLElement | null = null;
  private insidePanel = false;
  private isDragging = false;
  private contextMenuOpen = false;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private positionSub: Subscription | null = null;
  private readonly tooltipId = `rt-${++_tooltipIdSeq}`;
  private readonly closeBound = () => this.closeWithAnimation();
  private readonly panelMouseUpHandler = () => { this.isDragging = false; };

  private get hoverDelay(): number {
    try {
      const prefs = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
      const d = parseFloat(prefs.tooltipDelay);
      return isNaN(d) ? 200 : d * 1000;
    } catch { return 200; }
  }

  private get tooltipDisabled(): boolean {
    try {
      const prefs = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
      return parseFloat(prefs.tooltipDelay) === -1;
    } catch { return false; }
  }

  private readonly overlay = inject(Overlay);
  private readonly positionBuilder = inject(OverlayPositionBuilder);
  private readonly elementRef = inject(ElementRef);
  private readonly registry = inject(RichTooltipRegistry);
  private readonly coreService = inject(CoreService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Click-outside handler — attached only while tooltip is open. */
  private readonly outsideClickHandler = (e: MouseEvent) => {
    if (!this.overlayRef) return;
    const target = e.target as HTMLElement;
    if (
      !this.elementRef.nativeElement.contains(target) &&
      !this.overlayRef.overlayElement.contains(target) &&
      !target.closest?.('.glossary-popover-panel')
    ) {
      this.closeWithAnimation();
    }
  };

  ngOnInit(): void {
    const el: HTMLElement = this.elementRef.nativeElement;
    // Make non-interactive elements keyboard-focusable
    if (!el.hasAttribute('tabindex')) {
      const tag = el.tagName.toLowerCase();
      if (!['a', 'button', 'input', 'select', 'textarea'].includes(tag)) {
        el.setAttribute('tabindex', '0');
      }
    }
    el.setAttribute('aria-describedby', this.tooltipId);
  }

  // ── Hover ──────────────────────────────────────────────
  @HostListener('mouseenter')
  onEnter(): void {
    if (!this.content || this.tooltipDisabled) return;
    const delay = this.hoverDelay;
    if (delay <= 0) {
      this.open();
    } else {
      this.hoverTimer = setTimeout(() => this.open(), delay);
    }
  }

  @HostListener('mouseleave')
  onLeave(): void {
    if (this.hoverTimer) { clearTimeout(this.hoverTimer); this.hoverTimer = null; }
    setTimeout(() => { if (!this.insidePanel) this.closeWithAnimation(); }, 80);
  }

  // ── Click (toggle) ─────────────────────────────────────
  @HostListener('click')
  onClick(): void {
    if (!this.content || this.tooltipDisabled) return;
    if (this.hoverTimer) { clearTimeout(this.hoverTimer); this.hoverTimer = null; }
    this.overlayRef ? this.closeWithAnimation() : this.open();
  }

  // ── Keyboard: focus opens, blur closes ─────────────────
  @HostListener('focus')
  onFocus(): void {
    // Keyboard focus: always immediate, never suppressed
    if (!this.content) return;
    this.open();
  }

  @HostListener('blur')
  onBlur(): void {
    setTimeout(() => { if (!this.insidePanel) this.closeWithAnimation(); }, 100);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeyActivate(e: KeyboardEvent): void {
    if (!this.content) return;
    e.preventDefault();
    this.overlayRef ? this.closeWithAnimation() : this.open();
  }

  // ── Escape closes globally ─────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.overlayRef) this.closeWithAnimation();
  }

  // ── Open ───────────────────────────────────────────────
  private open(): void {
    if (this.overlayRef) return;
    this.registry.register(this.closeBound);

    const positionStrategy = this.positionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(true)
      .withPush(true)
      .withViewportMargin(8)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 8 },
        { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
        { originX: 'end',   originY: 'bottom', overlayX: 'end',   overlayY: 'top',    offsetY: 8 },
        { originX: 'end',   originY: 'top',    overlayX: 'end',   overlayY: 'bottom', offsetY: -8 },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: 'rich-tooltip-panel',
    });

    // Detect which position was applied and set arrow class accordingly
    this.positionSub = (positionStrategy as FlexibleConnectedPositionStrategy)
      .positionChanges
      .subscribe(change => {
        const { overlayX, overlayY } = change.connectionPair;
        const panelEl = this.overlayRef!.overlayElement;
        panelEl.classList.remove(
          'tooltip-below-start', 'tooltip-below-end',
          'tooltip-above-start', 'tooltip-above-end',
        );
        const vert  = overlayY === 'top'   ? 'below' : 'above';
        const horiz = overlayX === 'start' ? 'start' : 'end';
        panelEl.classList.add(`tooltip-${vert}-${horiz}`);
      });

    if (this.content instanceof TemplateRef) {
      const portal = new ComponentPortal(RichTooltipContentComponent);
      const compRef = this.overlayRef.attach(portal);
      compRef.instance.tpl       = this.content;
      compRef.instance.tooltipId = this.tooltipId;
    } else {
      const portal = new ComponentPortal(RichTooltipContentComponent);
      const compRef = this.overlayRef.attach(portal);
      compRef.instance.html       = this.sanitizer.bypassSecurityTrustHtml(mdToHtml(this.content!));
      compRef.instance.tooltipId  = this.tooltipId;
    }

    // Keep open while pointer is inside the tooltip panel
    const panelEl: HTMLElement = this.overlayRef.overlayElement;
    this.activePanelEl = panelEl;
    panelEl.addEventListener('mouseenter', () => { this.insidePanel = true; });
    // Track drag-to-select so tooltip doesn't close while user selects text across the boundary
    panelEl.addEventListener('mousedown', () => { this.isDragging = true; });
    document.addEventListener('mouseup', this.panelMouseUpHandler, true);
    panelEl.addEventListener('mouseleave', (e: MouseEvent) => {
      this.insidePanel = false;
      if (this.isDragging || this.contextMenuOpen) return;
      // If mouse moved into an open glossary popover, track the chain instead of closing.
      const gpPanel = (e.relatedTarget as HTMLElement | null)?.closest?.('.glossary-popover-panel') as HTMLElement | null;
      if (gpPanel) {
        this.watchGlossaryPanelLeave(gpPanel, panelEl);
        return;
      }
      this.closeWithAnimation();
    });
 
    // Keep tooltip open while the native browser context menu is visible so
    // the user can click "Copy" without the tooltip disappearing on mouseleave.
    panelEl.addEventListener('contextmenu', () => {
      this.contextMenuOpen = true;
      const reset = () => {
        this.contextMenuOpen = false;
        document.removeEventListener('mousedown', reset, true);
      };
      document.addEventListener('mousedown', reset, true);
    });

    // Handle action links: [text](action:type:param) — handled entirely inside the directive
    panelEl.addEventListener('click', (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('[data-rt-action-type]') as HTMLElement | null;
      if (anchor) {
        const type = anchor.getAttribute('data-rt-action-type');
        const param = anchor.getAttribute('data-rt-action-param') || '';
        if (type === 'help' || type === 'context') {
          e.stopPropagation();
          this.closeWithAnimation();
          this.coreService.openHelpPage(param);
        } else if (type === 'video') {
          e.stopPropagation();
          this.closeWithAnimation();
          this.coreService.openVideoPage(param);
        }
      }
    });

    // Click-outside: defer so the opening click doesn't immediately close
    setTimeout(() => document.addEventListener('click', this.outsideClickHandler, true), 0);
  }

  // ── Close with fade-out animation ──────────────────────
  private closeWithAnimation(): void {
    if (!this.overlayRef) return;
    this.registry.unregister(this.closeBound);
    this.positionSub?.unsubscribe();
    this.positionSub = null;
    document.removeEventListener('click', this.outsideClickHandler, true);
    document.removeEventListener('mouseup', this.panelMouseUpHandler, true);
    this.isDragging = false;
    this.contextMenuOpen = false;
    const bubbleEl = this.overlayRef.overlayElement.querySelector('.rich-tooltip-bubble') as HTMLElement | null;
    const ref = this.overlayRef;
    this.overlayRef = null;
    this.activePanelEl = null;
    this.insidePanel = false;

    if (bubbleEl) {
      bubbleEl.classList.add('rich-tooltip-fade-out');
      setTimeout(() => ref.dispose(), 150);
    } else {
      ref.dispose();
    }
  }

  /**
   * Recursively tracks mouse through an arbitrarily deep chain of nested glossary
   * popover panels so the rich tooltip doesn't close while the user browses nested terms.
   * – if mouse returns to richPanel → insidePanel stays true → tooltip lives
   * – if mouse moves to another panel (deeper/sideways) → keep tracking
   * – if mouse leaves all panels → close the rich tooltip
   */
  private watchGlossaryPanelLeave(currentPanel: HTMLElement, richPanel: HTMLElement): void {
    currentPanel.addEventListener('mouseleave', (e: MouseEvent) => {
      const gr = e.relatedTarget as HTMLElement | null;

      // Returned to the rich tooltip panel.
      if (gr && richPanel.contains(gr)) return; // richPanel.mouseenter sets insidePanel = true

      // Moved to another glossary panel — keep tracking.
      const nextPanel = gr?.closest?.('.glossary-popover-panel') as HTMLElement | null;
      if (nextPanel && nextPanel !== currentPanel) {
        this.watchGlossaryPanelLeave(nextPanel, richPanel);
        return;
      }

      // Left all panels — close if not back inside the rich tooltip.
      if (!this.insidePanel && !this.isDragging && !this.contextMenuOpen) {
        this.closeWithAnimation();
      }
    }, { once: true });
  }

  ngOnDestroy(): void {
    if (this.hoverTimer) { clearTimeout(this.hoverTimer); this.hoverTimer = null; }
    this.positionSub?.unsubscribe();
    document.removeEventListener('click', this.outsideClickHandler, true);
    document.removeEventListener('mouseup', this.panelMouseUpHandler, true);
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
