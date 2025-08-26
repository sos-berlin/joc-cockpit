import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MarkdownParserService } from './markdown-parser.service';

export interface HelpRenderResult {
  html: string;
  requestedLang: string;
  usedLang: string;
  fellBack: boolean;
}

@Injectable({ providedIn: 'root' })
export class HelpService {
  private readonly defaultLanguage = (localStorage['$SOS$LANG'] || 'en');
  private readonly helpBasePath = 'assets/help-files';
  private currentLanguage = this.defaultLanguage;

  constructor(
    private http: HttpClient,
    private i18n: TranslateService,
    private md: MarkdownParserService,
  ) {}

  setLanguage(lang: string): void {
    this.currentLanguage = lang || this.defaultLanguage;
  }

  getHelpHtml(key: string): Observable<HelpRenderResult | null> {
    const requestedLang = this.currentLanguage || this.i18n.currentLang || this.defaultLanguage;
    const urlPrimary  = `${this.helpBasePath}/${requestedLang}/${key}.md`;
    const urlFallback = `${this.helpBasePath}/${this.defaultLanguage}/${key}.md`;

    const render = (markdown: string, usedLang: string, fellBack: boolean): HelpRenderResult => ({
      html: this.md.parseMarkdown(markdown, {
        gfm: true,
        tables: true,
        breaks: false,
        smartypants: true,
        headerIds: true,
        headerPrefix: '',
        rawHtml: true,
        sanitize: true,
      }),
      requestedLang,
      usedLang,
      fellBack,
    });

    return this.http.get(urlPrimary, { responseType: 'text' }).pipe(
      map(md => render(md, requestedLang, false)),
      catchError(() =>
        this.http.get(urlFallback, { responseType: 'text' }).pipe(
          map(md => render(md, this.defaultLanguage, requestedLang !== this.defaultLanguage)),
          catchError(() => of(null))
        )
      )
    );
  }
}
