import {  ChangeDetectorRef, Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

/**
 * GlossaryPopoverComponent
 *
 * Lightweight popover rendered by GlossaryHostDirective via CDK portal.
 * Content (definitionHtml) is set programmatically after creation.
 *
 * Supports language switching via the `activeLang` input and `onLangSwitch`
 * callback. The switcher shows all supported languages except the active one.
 */
@Component({
  standalone: false,
  selector: 'app-glossary-popover',
  template: `
    <div class="glossary-popover-bubble" role="tooltip">
      <div class="glossary-popover-header">
        <span class="glossary-popover-title">
          <i class="fa fa-book text-primary m-r-xs"></i>
          <!-- <span class="glossary-term-label">{{ termLabel }}</span> -->
        </span>
        <span class="glossary-lang-switcher" aria-label="Switch glossary language">
          @for (l of allLangs; track l; let last = $last) {
            @if (l === activeLang) {
              <span class="glossary-lang-btn glossary-lang-btn--active" aria-current="true">{{ l }}</span>
            } @else {
              <button class="glossary-lang-btn" type="button" (click)="switchLang(l)">{{ l }}</button>
            }
            @if (!last) { <span class="glossary-lang-sep" aria-hidden="true">|</span> }
          }
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
  constructor(private cdr: ChangeDetectorRef) {}

  @Input() termKey   = '';
  @Input() termLabel = '';
  @Input() definitionHtml: SafeHtml | null = null;
  @Input() notFound  = false;
  @Input() isLoading = true;
  @Input() activeLang = 'en';

  /** Called by GlossaryHostDirective when user clicks a language button. */
  onLangSwitch?: (lang: string) => void;

  /** Set by GlossaryHostDirective from coreService.locales — dynamic, not hardcoded. */
  @Input() allLangs: string[] = ['en'];

  switchLang(lang: string): void {
    this.onLangSwitch?.(lang);
  }
}
