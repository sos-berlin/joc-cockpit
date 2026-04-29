import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Lightweight tooltip content rendered inside a CDK Overlay panel.
 * Receives pre-processed HTML from RichTooltipDirective.
 * Text selection and copy is fully supported.
 */
@Component({
  standalone: false,
  selector: 'app-rich-tooltip-content',
  template: `
    <div class="rich-tooltip-box" [innerHTML]="html"></div>
  `,
})
export class RichTooltipContentComponent {
  @Input() html = '';
}
