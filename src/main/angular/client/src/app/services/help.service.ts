import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HelpService {
  private http = inject(HttpClient);
  private cache = new Map<string, string>(); // key: lang/slug
  private basePath = 'assets/help-files';

  private path(lang: string, slug: string) {
    return `${this.basePath}/${lang}/${slug}.md`;
  }

  private normalizeLang(lang?: string): string {
    if (!lang) return 'en';
    return lang.split('-')[0].toLowerCase();
  }

  getHelp(slug: string, lang?: string): Observable<string> {
    const primary = this.normalizeLang(lang);
    const tryLang = (l: string): Observable<string> => {
      const key = `${l}/${slug}`;
      if (this.cache.has(key)) return of(this.cache.get(key)!);

      return this.http.get(this.path(l, slug), { responseType: 'text' }).pipe(
        map(text => {
          this.cache.set(key, text);
          return text;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404 && l !== 'en') {
            return tryLang('en');
          }
          const msg = `# Help not found\n\nThe help topic \`${slug}\` is not available.`;
          return of(msg);
        })
      );
    };

    return tryLang(primary);
  }
}
