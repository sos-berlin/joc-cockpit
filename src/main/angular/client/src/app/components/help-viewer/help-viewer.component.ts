import { Component } from '@angular/core';
import {Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HelpService } from '../../services/help.service';
@Component({
  selector: 'app-help-viewer',
  templateUrl: './help-viewer.component.html',
})
export class HelpViewerComponent {
  @Input() slug!: string;
  @Input() lang?: string;
  markdown$!: Observable<string>;

  private help = inject(HelpService);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.slug) {
      this.markdown$ = this.help.getHelp(this.slug, this.lang);
    }
  }
}
