import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MarkdownParserService } from './markdown-parser.service';
import { ImageCacheService } from './image-cache.service';
import { AuthService } from '../components/guard';

export interface HelpRenderResult {
  html: string;
  requestedLang: string;
  usedLang: string;
  fellBack: boolean;
}

@Injectable({ providedIn: 'root' })
export class HelpService {
  private readonly defaultLanguage = (localStorage['$SOS$LANG'] || 'en');
  private readonly helpBasePath = './api/help-files';
  private currentLanguage = this.defaultLanguage;

  constructor(
    private http: HttpClient,
    private i18n: TranslateService,
    private md: MarkdownParserService,
    private authService: AuthService,
    private imageCache: ImageCacheService,
  ) {}

  setLanguage(lang: string): void {
    this.currentLanguage = lang || this.defaultLanguage;
  }

  getHelpHtml(key: string): Observable<HelpRenderResult | null> {
    const requestedLang = this.currentLanguage || this.i18n.currentLang || this.defaultLanguage;
    const urlPrimary  = `${this.helpBasePath}/${requestedLang}/${key}.md`;
    const urlFallback = `${this.helpBasePath}/en/${key}.md`;

    const headers = new HttpHeaders({
      'X-Access-Token': this.authService.accessTokenId || ''
    });

    const imageUrlMap = new Map<string, string>();

    const render = (markdown: string, usedLang: string, fellBack: boolean): Observable<HelpRenderResult> => {

      const imageUrls = this.extractImageUrls(markdown);

      if (imageUrls.length === 0) {
        return of({
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
      }

      const imageLoads = imageUrls.map(url =>
        this.imageCache.loadImage(url).pipe(
          map(dataUrl => ({ url, dataUrl }))
        )
      );

      return forkJoin(imageLoads).pipe(
        map(results => {

          results.forEach(({ url, dataUrl }) => {
            imageUrlMap.set(url, dataUrl);
          });

          const html = this.md.parseMarkdown(markdown, {
            gfm: true,
            tables: true,
            breaks: false,
            smartypants: true,
            headerIds: true,
            headerPrefix: '',
            rawHtml: true,
            sanitize: true,
            imageLoader: (src: string) => imageUrlMap.get(src) || src
          });

          return {
            html,
            requestedLang,
            usedLang,
            fellBack,
          };
        })
      );
    };

    return this.http.get(urlPrimary, {
      responseType: 'text',
      headers: headers
    }).pipe(
      switchMap(md => render(md, requestedLang, false)),
      catchError(() =>
        this.http.get(urlFallback, {
          responseType: 'text',
          headers: headers
        }).pipe(
          switchMap(md => render(md, 'en', requestedLang !== 'en')),
          catchError(() => of(null))
        )
      )
    );
  }

  private extractImageUrls(markdown: string): string[] {
    const imageUrls: string[] = [];
    const seenUrls = new Set<string>();

    const markdownImageRegex = /!\[([^]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g;
    let match;

    while ((match = markdownImageRegex.exec(markdown)) !== null) {
      let src = this.normalizeImageUrl(match[2]);
      if (src && this.isApiImage(src) && !seenUrls.has(src)) {
        imageUrls.push(src);
        seenUrls.add(src);
      }
    }

    const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const htmlImageMatches = markdown.matchAll(htmlImageRegex);

    for (const match of htmlImageMatches) {
      let src = this.normalizeImageUrl(match[1]);
      if (src && this.isApiImage(src) && !seenUrls.has(src)) {
        imageUrls.push(src);
        seenUrls.add(src);
      }
    }

    return imageUrls;
  }

  private normalizeImageUrl(src: string): string | null {
    if (!src || src.startsWith('http') || src.startsWith('#') || src.startsWith('data:')) {
      return null;
    }

    src = src.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');

    if (!src.startsWith('/api/help-files/images/') && !src.startsWith('./api/help-files/images/')) {
      const filename = src.split('/').pop() || src;
      src = './api/help-files/images/' + filename;
    }

    return src;
  }

  private isApiImage(src: string): boolean {
    return src.startsWith('/api/') || src.startsWith('./api/');
  }
}

