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

  // HTML escape
  let out = src
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline formatting
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

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
  private insidePanel = false;
  private isDragging = false;
  private positionSub: Subscription | null = null;
  private readonly tooltipId = `rt-${++_tooltipIdSeq}`;
  private readonly closeBound = () => this.closeWithAnimation();
  private readonly panelMouseUpHandler = () => { this.isDragging = false; };

  private readonly overlay = inject(Overlay);
  private readonly positionBuilder = inject(OverlayPositionBuilder);
  private readonly elementRef = inject(ElementRef);
  private readonly registry = inject(RichTooltipRegistry);

  /** Click-outside handler — attached only while tooltip is open. */
  private readonly outsideClickHandler = (e: MouseEvent) => {
    if (!this.overlayRef) return;
    const target = e.target as Node;
    if (
      !this.elementRef.nativeElement.contains(target) &&
      !this.overlayRef.overlayElement.contains(target)
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
    if (!this.content) return;
    this.open();
  }

  @HostListener('mouseleave')
  onLeave(): void {
    setTimeout(() => { if (!this.insidePanel) this.closeWithAnimation(); }, 80);
  }

  // ── Click (toggle) ─────────────────────────────────────
  @HostListener('click')
  onClick(): void {
    if (!this.content) return;
    this.overlayRef ? this.closeWithAnimation() : this.open();
  }

  // ── Keyboard: focus opens, blur closes ─────────────────
  @HostListener('focus')
  onFocus(): void {
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
      compRef.instance.html       = mdToHtml(this.content!);
      compRef.instance.tooltipId  = this.tooltipId;
    }

    // Keep open while pointer is inside the tooltip panel
    const panelEl: HTMLElement = this.overlayRef.overlayElement;
    panelEl.addEventListener('mouseenter', () => { this.insidePanel = true; });
    // Track drag-to-select so tooltip doesn't close while user selects text across the boundary
    panelEl.addEventListener('mousedown', () => { this.isDragging = true; });
    document.addEventListener('mouseup', this.panelMouseUpHandler, true);
    panelEl.addEventListener('mouseleave', () => {
      this.insidePanel = false;
      if (!this.isDragging) this.closeWithAnimation();
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

    const bubbleEl = this.overlayRef.overlayElement.querySelector('.rich-tooltip-bubble') as HTMLElement | null;
    const ref = this.overlayRef;
    this.overlayRef = null;
    this.insidePanel = false;

    if (bubbleEl) {
      bubbleEl.classList.add('rich-tooltip-fade-out');
      setTimeout(() => ref.dispose(), 150);
    } else {
      ref.dispose();
    }
  }

  ngOnDestroy(): void {
    this.positionSub?.unsubscribe();
    document.removeEventListener('click', this.outsideClickHandler, true);
    document.removeEventListener('mouseup', this.panelMouseUpHandler, true);
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
