import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  HostListener,
  inject,
  Injectable,
  Input,
  OnDestroy,
} from '@angular/core';
import { Overlay, OverlayRef, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { RichTooltipContentComponent } from '../components/rich-tooltip/rich-tooltip-content.component';

/** Singleton that tracks the currently open rich-tooltip and closes it when a new one opens. */
@Injectable({ providedIn: 'root' })
export class RichTooltipRegistry {
  private active: (() => void) | null = null;

  register(closeFn: () => void): void {
    if (this.active) {
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
 * Converts a markdown-like string to safe HTML.
 * Supported syntax (intentionally lightweight, no external library):
 *   **bold**  → <strong>
 *   *italic*  → <em>
 *   `code`    → <code>
 *   \n        → <br>
 *   [text](url) → <a>
 */
export function mdToHtml(src: string): string {
  if (!src) return '';
  return src
    // Escape raw HTML to avoid XSS (we only trust our own markdown syntax)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic (single asterisk, not matched by bold)
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`\n]+?)`/g, '<code>$1</code>')
    // Links  [label](url)
    .replace(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Newlines
    .replace(/\n/g, '<br>');
}

/**
 * [appRichTooltip] — drop-in replacement for [nz-tooltip] that supports:
 *   • Markdown-formatted tooltip strings (newlines, bold, italic, code, links)
 *   • Text selection and copy-paste
 *   • Themed background via CSS variable --tooltip-bg
 *
 * Usage:
 *   <label [appRichTooltip]="'inventory.tooltips.export.fileName' | translate">…</label>
 *
 * To disable: [appRichTooltip]="''" or bind to empty string / null.
 */
@Directive({
  standalone: false,
  selector: '[appRichTooltip]',
})
export class RichTooltipDirective implements OnDestroy {
  @Input('appRichTooltip') content: string | null = null;

  private overlayRef: OverlayRef | null = null;
  private compRef: ComponentRef<RichTooltipContentComponent> | null = null;
  /** True while pointer is inside the tooltip panel — keeps it open so user can select text */
  private insidePanel = false;
  private readonly closeBound = () => this.close();

  private readonly overlay = inject(Overlay);
  private readonly positionBuilder = inject(OverlayPositionBuilder);
  private readonly elementRef = inject(ElementRef);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly registry = inject(RichTooltipRegistry);

  @HostListener('mouseenter')
  onEnter(): void {
    if (!this.content) return;
    this.open();
  }

  @HostListener('mouseleave')
  onLeave(): void {
    // Small delay to allow pointer to enter the tooltip panel
    setTimeout(() => {
      if (!this.insidePanel) this.close();
    }, 80);
  }

  private open(): void {
    if (this.overlayRef) return;

    // Close any other open rich-tooltip immediately
    this.registry.register(this.closeBound);

    const positionStrategy = this.positionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(true)
      .withPush(true)
      .withViewportMargin(8)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
        { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
        { originX: 'end',   originY: 'bottom', overlayX: 'end',   overlayY: 'top', offsetY: 6 },
        { originX: 'end',   originY: 'top',    overlayX: 'end',   overlayY: 'bottom', offsetY: -6 },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: 'rich-tooltip-panel',
    });

    const portal = new ComponentPortal(RichTooltipContentComponent);
    this.compRef = this.overlayRef.attach(portal);
    this.compRef.instance.html = mdToHtml(this.content!);

    // Track when pointer is inside the tooltip so it stays open
    const el: HTMLElement = this.overlayRef.overlayElement;
    el.addEventListener('mouseenter', () => { this.insidePanel = true; });
    el.addEventListener('mouseleave', () => {
      this.insidePanel = false;
      this.close();
    });
  }

  private close(): void {
    this.registry.unregister(this.closeBound);
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.compRef = null;
    this.insidePanel = false;
  }

  ngOnDestroy(): void {
    this.close();
  }
}
