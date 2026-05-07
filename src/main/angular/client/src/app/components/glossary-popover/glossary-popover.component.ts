import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

/**
 * GlossaryPopoverComponent
 *
 * Lightweight popover rendered by GlossaryHostDirective via CDK portal.
 * Content (definitionHtml) is set programmatically after creation.
 */
@Component({
  standalone: false,
  selector: 'app-glossary-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glossary-popover-bubble" role="tooltip">
      <div class="glossary-popover-header">
        <span class="glossary-popover-title">
          <i class="fa fa-book text-primary m-r-xs"></i>{{ termLabel || termKey }}
        </span>
      </div>
      <div class="glossary-popover-body">
        @if (isLoading) {
          <span class="glossary-pop-loading"><i class="fa fa-spinner fa-spin"></i></span>
        } @else if (notFound) {
          <span class="text-muted glossary-pop-not-found" translate>common.message.noGlossaryData</span>
        } @else {
          <div class="glossary-pop-content" appGlossaryHost [innerHTML]="definitionHtml"></div>
        }
      </div>
    </div>
  `,
})
export class GlossaryPopoverComponent {
  @Input() termKey  = '';
  @Input() termLabel = '';
  @Input() definitionHtml: SafeHtml | null = null;
  @Input() notFound = false;
  @Input() isLoading = true;
}
