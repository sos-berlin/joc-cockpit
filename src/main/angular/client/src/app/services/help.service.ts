import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MarkdownParserService } from './markdown-parser.service';  // ← add

@Injectable({ providedIn: 'root' })
export class HelpService {
    private readonly defaultLanguage = 'en';
    private readonly helpBasePath = 'assets/help-files';

    constructor(
        private http: HttpClient,
        private i18n: TranslateService,
        private md: MarkdownParserService,
    ) {}

    getHelpHtml(key: string): Observable<string> {
        const lang = this.i18n.currentLang || this.defaultLanguage;
        const urlPrimary = `${this.helpBasePath}/${lang}/${key}.md`;
        const urlFallback = `${this.helpBasePath}/${this.defaultLanguage}/${key}.md`;

        return this.http.get(urlPrimary, { responseType: 'text' }).pipe(
            catchError(() => this.http.get(urlFallback, { responseType: 'text' })),
            map(markdown =>
                this.md.parseMarkdown(markdown, {
                    gfm: true,
                    tables: true,
                    breaks: false,
                    smartypants: true,
                    headerIds: true,
                    headerPrefix: '',
                  rawHtml: true,
                  sanitize: true,
                })
            ),
            catchError(() => of('<p>Help not available.</p>'))
        );
    }
}
