import { Component, Input, TemplateRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-rich-tooltip-content',
  template: `
    <div class="rich-tooltip-bubble">
      <div class="rich-tooltip-box"
           role="tooltip"
           appGlossaryHost
           [id]="tooltipId">
        @if (tpl) {
          <ng-container *ngTemplateOutlet="tpl"></ng-container>
        } @else {
          <span [innerHTML]="html"></span>
        }
      </div>
    </div>
  `,
})
export class RichTooltipContentComponent {
  @Input() html: SafeHtml = '';
  @Input() tooltipId = '';
  @Input() tpl: TemplateRef<any> | null = null;
}
