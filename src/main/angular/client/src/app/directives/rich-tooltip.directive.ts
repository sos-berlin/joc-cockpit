import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Injectable,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {CoreService} from '../services/core.service';
import {DomSanitizer} from '@angular/platform-browser';
import {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayContainer,
  OverlayRef,
  OverlayPositionBuilder,
  ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { RichTooltipContentComponent } from '../components/rich-tooltip/rich-tooltip-content.component';

/**
 * The log-viewer "detach" feature (PopupService) opens a real native popup
 * window and physically re-parents a component's DOM into that window's own
 * document, while the component itself keeps living in the MAIN window's
 * Angular injector. Two consequences for any tooltip triggered from inside
 * that popup:
 *
 *  1. Angular CDK's `Overlay`/`OverlayContainer` are singletons bound to
 *     whichever `document` they were created against (the main window's), so
 *     the tooltip overlay would render into the *main* window's overlay
 *     layer — a different document entirely — rather than anywhere in the
 *     popup. No CSS change can fix this; it isn't a stacking-order problem,
 *     it's rendering in the wrong window.
 *  2. Angular injects its own base overlay CSS, and this directive's own
 *     bubble CSS lives in the global stylesheet — both loaded into the main
 *     document only. The popup window's separate document never receives
 *     them, so even a correctly-targeted overlay pane would show as
 *     unstyled, unpositioned inline content.
 *
 * This entire block (cache + CSS strings + helpers) exists solely to make
 * THIS directive self-sufficient in that scenario, without requiring any
 * change to the popup's own HTML/CSS or to PopupService. For the normal
 * case — the element is in the same document the app booted in — none of
 * this runs; behavior is identical to before.
 */
const crossDocumentOverlayCache = new WeakMap<Document, { overlay: Overlay; positionBuilder: OverlayPositionBuilder }>();

/** Angular CDK's own base overlay positioning CSS (verbatim, from
 *  `@angular/cdk` `_CdkOverlayStyleLoader`) — normally injected via JS once
 *  per running app instance, so a second, separate document never gets it. */
const CDK_OVERLAY_BASE_CSS = `
.cdk-overlay-container, .cdk-global-overlay-wrapper {
  pointer-events: none;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}
.cdk-overlay-container { position: fixed; z-index: 1000; }
.cdk-overlay-container:empty { display: none; }
.cdk-global-overlay-wrapper { display: flex; position: absolute; z-index: 1000; }
.cdk-overlay-pane {
  position: absolute;
  pointer-events: auto;
  box-sizing: border-box;
  display: flex;
  max-width: 100%;
  max-height: 100%;
  z-index: 1000;
}
.cdk-overlay-backdrop {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  opacity: 0;
  touch-action: manipulation;
  z-index: 1000;
  transition: opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.cdk-overlay-backdrop-showing { opacity: 1; }
.cdk-overlay-transparent-backdrop {
  transition: visibility 1ms linear, opacity 1ms linear;
  visibility: hidden;
  opacity: 1;
}
.cdk-overlay-transparent-backdrop.cdk-overlay-backdrop-showing { opacity: 0; visibility: visible; }
.cdk-overlay-connected-position-bounding-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 1px;
  min-height: 1px;
  z-index: 1000;
}
.cdk-overlay-popover {
  background: none;
  border: none;
  padding: 0;
  outline: 0;
  overflow: visible;
  position: fixed;
  pointer-events: none;
  white-space: normal;
  color: inherit;
  text-decoration: none;
  width: 100%;
  height: 100%;
  inset: auto;
  top: 0;
  left: 0;
}
.cdk-overlay-popover::backdrop { display: none; }
.cdk-overlay-popover .cdk-overlay-backdrop { position: fixed; z-index: auto; }
`;

/**
 * This directive's own visual CSS, normally provided by the app's global
 * stylesheet (style.scss). Duplicated here — scoped strictly to the
 * `.rich-tooltip-*` class names that exist nowhere else in the app — so the
 * tooltip looks right in a foreign document regardless of which stylesheets
 * that document happens to load. Colors use hard-coded light-theme defaults
 * (matching style.scss's `--rich-tooltip-*`/`--primary` variables) as a
 * fallback since a popup document is not guaranteed to define those
 * CSS custom properties.
 */
const RICH_TOOLTIP_VISUAL_CSS = `
.rich-tooltip-panel { pointer-events: auto !important; z-index: 999999; }
.rich-tooltip-panel.tooltip-below-start .rich-tooltip-bubble::before,
.rich-tooltip-panel.tooltip-below-end   .rich-tooltip-bubble::before {
  content: ''; position: absolute; top: -8px;
  border: 8px solid transparent; border-top: 0;
  border-bottom-color: var(--rich-tooltip-border, rgba(0,0,0,.1));
}
.rich-tooltip-panel.tooltip-below-start .rich-tooltip-bubble::after,
.rich-tooltip-panel.tooltip-below-end   .rich-tooltip-bubble::after {
  content: ''; position: absolute; top: -6px;
  border: 7px solid transparent; border-top: 0;
  border-bottom-color: var(--rich-tooltip-bg, #fff);
}
.rich-tooltip-panel.tooltip-below-start .rich-tooltip-bubble::before,
.rich-tooltip-panel.tooltip-below-start .rich-tooltip-bubble::after { left: 16px; }
.rich-tooltip-panel.tooltip-below-end   .rich-tooltip-bubble::before,
.rich-tooltip-panel.tooltip-below-end   .rich-tooltip-bubble::after { right: 16px; }
.rich-tooltip-panel.tooltip-above-start .rich-tooltip-bubble::before,
.rich-tooltip-panel.tooltip-above-end   .rich-tooltip-bubble::before {
  content: ''; position: absolute; bottom: -8px;
  border: 8px solid transparent; border-bottom: 0;
  border-top-color: var(--rich-tooltip-border, rgba(0,0,0,.1));
}
.rich-tooltip-panel.tooltip-above-start .rich-tooltip-bubble::after,
.rich-tooltip-panel.tooltip-above-end   .rich-tooltip-bubble::after {
  content: ''; position: absolute; bottom: -6px;
  border: 7px solid transparent; border-bottom: 0;
  border-top-color: var(--rich-tooltip-bg, #fff);
}
.rich-tooltip-panel.tooltip-above-start .rich-tooltip-bubble::before,
.rich-tooltip-panel.tooltip-above-start .rich-tooltip-bubble::after { left: 16px; }
.rich-tooltip-panel.tooltip-above-end   .rich-tooltip-bubble::before,
.rich-tooltip-panel.tooltip-above-end   .rich-tooltip-bubble::after { right: 16px; }
@keyframes rich-tooltip-in  { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rich-tooltip-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(4px); } }
.rich-tooltip-bubble {
  position: relative;
  background: var(--rich-tooltip-bg, #fff);
  border: 1px solid var(--rich-tooltip-border, rgba(0,0,0,.1));
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.08);
  width: max-content;
  max-width: min(320px, 90vw);
  min-width: 120px;
  overflow: visible;
  animation: rich-tooltip-in 0.15s ease forwards;
}
.rich-tooltip-bubble.rich-tooltip-fade-out { animation: rich-tooltip-out 0.15s ease forwards; }
.rich-tooltip-box {
  color: var(--rich-tooltip-text, #374151);
  font-size: 13px;
  line-height: 1.65;
  padding: 10px 14px;
  max-height: min(400px, 80vh);
  overflow-y: auto;
  overflow-x: hidden;
  word-break: break-word;
  user-select: text;
  cursor: text;
  border-radius: inherit;
}
.rich-tooltip-box strong { font-weight: 600; color: var(--rich-tooltip-strong, #111827); }
.rich-tooltip-box em { font-style: italic; opacity: 0.85; }
.rich-tooltip-box code {
  background: var(--rich-tooltip-code-bg, #f3f4f6);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: monospace;
  font-size: 11px;
  color: var(--rich-tooltip-text, #374151);
}
.rich-tooltip-box a { color: var(--primary, rgb(14, 138, 139)); text-decoration: underline; }
.rich-tooltip-box a:hover { opacity: 0.85; }
.rich-tooltip-box .rt-action-link { cursor: pointer; }
.rich-tooltip-box .rt-action-link:focus { outline: 2px solid var(--primary, rgb(14, 138, 139)); outline-offset: 1px; border-radius: 2px; }
.rich-tooltip-box del { text-decoration: line-through; opacity: 0.75; }
.rich-tooltip-box br { display: block; content: ''; margin-top: 4px; }
.rich-tooltip-box ul, .rich-tooltip-box ol { margin: 4px 0 2px; padding-left: 18px; }
`;

const CROSS_DOCUMENT_STYLE_ID = 'rich-tooltip-cross-document-style';

function ensureCrossDocumentStyles(doc: Document): void {
  if (doc.getElementById(CROSS_DOCUMENT_STYLE_ID)) return;
  const styleEl = doc.createElement('style');
  styleEl.id = CROSS_DOCUMENT_STYLE_ID;
  styleEl.textContent = CDK_OVERLAY_BASE_CSS + RICH_TOOLTIP_VISUAL_CSS;
  doc.head.appendChild(styleEl);
}

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
 *
 * Processing order (critical for correctness):
 *  1. Extract inline code spans into STX/ETX-delimited placeholders so their
 *     content is never interpreted as Markdown (fixes `*` / `_` / `[` etc.
 *     inside backticks being treated as formatting syntax).
 *  2. HTML-escape the remaining text.
 *  3. Apply Markdown formatting rules (bold, italic, links, glossary terms…).
 *  4. Process bullet lists and join with <br>.
 *  5. Restore code span placeholders → <code>…</code>.
 */
export function mdToHtml(src: string): string {
  if (!src) return '';

  // Step 1 — Extract inline code spans BEFORE any other processing.
  // Their content is HTML-escaped individually and stored; a U+0002/U+0003
  // (STX/ETX) placeholder is left in the stream. These control characters
  // never appear in i18n strings and survive the subsequent HTML-escape step
  // unmodified (they are not &, <, > or ").
  const codeTokens: string[] = [];
  let out = src.replace(/`([^`\n]+?)`/g, (_match: string, inner: string) => {
    const safe = inner
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    codeTokens.push(`<code>${safe}</code>`);
    return `\x02${codeTokens.length - 1}\x03`;
  });

  // Step 2 — HTML-escape the non-code remainder.
  // Must include " to prevent attribute injection.
  out = out
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Step 3 — Inline Markdown (operates only on non-code text now).
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
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

  // Step 4 — Bullet list: group consecutive lines starting with '- '.
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
  out = result.join('<br>');

  // Step 5 — Restore code spans: placeholders → <code>…</code>.
  if (codeTokens.length > 0) {
    out = out.replace(/\x02(\d+)\x03/g, (_m: string, idx: string) => codeTokens[+idx]);
  }

  return out;
}

let _tooltipIdSeq = 0;

/**
 * Focus-visible pattern: tooltip on focus only fires for keyboard navigation (Tab),
 * not for programmatic focus (e.g. dialog open) or mouse-click focus.
 */
let _keyboardFocusMode = false;
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { _keyboardFocusMode = true; }
  }, { capture: true, passive: true });
  document.addEventListener('mousedown', () => {
    _keyboardFocusMode = false;
  }, { capture: true, passive: true });
}

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
  /** The document the currently-open overlay's listeners are bound to. */
  private activeDocument: Document | null = null;
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
  private readonly injector = inject(Injector);
  private readonly rootDocument = inject(DOCUMENT);

  /** The document the trigger element actually lives in right now — differs
   *  from `rootDocument` when this element has been re-parented into a
   *  detached popup window (see PopupService). */
  private get hostDocument(): Document {
    return this.elementRef.nativeElement.ownerDocument || this.rootDocument;
  }

  /**
   * Returns the CDK overlay services to use for the CURRENT host document.
   * For the common case (element still in the main window) this is just the
   * normally-injected singletons — zero behavior change. When the element has
   * been moved into a foreign popup window, builds (once per window, then
   * caches) a private set of overlay services bound to THAT window's own
   * document, and makes sure the CSS that overlay pane needs actually exists
   * there.
   */
  private resolveOverlayServices(): { overlay: Overlay; positionBuilder: OverlayPositionBuilder } {
    const doc = this.hostDocument;
    if (doc === this.rootDocument) {
      return { overlay: this.overlay, positionBuilder: this.positionBuilder };
    }
    let entry = crossDocumentOverlayCache.get(doc);
    if (!entry) {
      ensureCrossDocumentStyles(doc);
      const childInjector = Injector.create({
        parent: this.injector,
        providers: [
          { provide: DOCUMENT, useValue: doc },
          ViewportRuler,
          OverlayContainer,
          ScrollStrategyOptions,
          OverlayPositionBuilder,
          Overlay,
        ],
      });
      entry = {
        overlay: childInjector.get(Overlay),
        positionBuilder: childInjector.get(OverlayPositionBuilder),
      };
      crossDocumentOverlayCache.set(doc, entry);
    }
    return entry;
  }

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

  // ── Click (toggle) — always works regardless of tooltipDisabled ────────────
  @HostListener('click')
  onClick(): void {
    if (!this.content) return;
    if (this.hoverTimer) { clearTimeout(this.hoverTimer); this.hoverTimer = null; }
    this.overlayRef ? this.closeWithAnimation() : this.open();
  }

  // ── Keyboard: focus opens, blur closes ─────────────────
  @HostListener('focus')
  onFocus(): void {
    // Only open on keyboard-triggered focus (Tab navigation), not on
    // programmatic focus (dialog init) or mouse-click focus.
    if (!this.content || this.tooltipDisabled || !_keyboardFocusMode) return;
    this.open();
  }

  @HostListener('blur')
  onBlur(): void {
    setTimeout(() => { if (!this.insidePanel) this.closeWithAnimation(); }, 100);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeyActivate(e: KeyboardEvent): void {
    if (!this.content || this.tooltipDisabled) return;
    e.preventDefault();
    this.overlayRef ? this.closeWithAnimation() : this.open();
  }

  // ── Escape closes globally ─────────────────────────────
  // NOT an @HostListener('document:...') — that always binds to the main
  // window's document, which never sees keydown events from inside a
  // detached popup window. Bound/unbound manually in open()/
  // closeWithAnimation() against whichever document is actually active.
  private readonly escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.overlayRef) this.closeWithAnimation();
  };

  // ── Open ───────────────────────────────────────────────
  private open(): void {
    if (this.overlayRef) return;
    this.registry.register(this.closeBound);

    const { overlay, positionBuilder } = this.resolveOverlayServices();
    const activeDoc = this.hostDocument;
    this.activeDocument = activeDoc;

    const positionStrategy = positionBuilder
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

    this.overlayRef = overlay.create({
      positionStrategy,
      scrollStrategy: overlay.scrollStrategies.reposition(),
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
    activeDoc.addEventListener('mouseup', this.panelMouseUpHandler, true);
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
        activeDoc.removeEventListener('mousedown', reset, true);
      };
      activeDoc.addEventListener('mousedown', reset, true);
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

    // Click-outside/Escape: defer so the opening click doesn't immediately close
    setTimeout(() => {
      activeDoc.addEventListener('click', this.outsideClickHandler, true);
      activeDoc.addEventListener('keydown', this.escapeHandler, true);
    }, 0);
  }

  // ── Close with fade-out animation ──────────────────────
  private closeWithAnimation(): void {
    if (!this.overlayRef) return;
    this.registry.unregister(this.closeBound);
    this.positionSub?.unsubscribe();
    this.positionSub = null;
    const activeDoc = this.activeDocument || this.rootDocument;
    activeDoc.removeEventListener('click', this.outsideClickHandler, true);
    activeDoc.removeEventListener('mouseup', this.panelMouseUpHandler, true);
    activeDoc.removeEventListener('keydown', this.escapeHandler, true);
    this.activeDocument = null;
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
    const activeDoc = this.activeDocument || this.rootDocument;
    activeDoc.removeEventListener('click', this.outsideClickHandler, true);
    activeDoc.removeEventListener('mouseup', this.panelMouseUpHandler, true);
    activeDoc.removeEventListener('keydown', this.escapeHandler, true);
    this.activeDocument = null;
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
