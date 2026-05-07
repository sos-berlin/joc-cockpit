import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface GlossaryMap {
  [key: string]: string;
}

export interface GlossaryFile {
  glossary: GlossaryMap;
}

/**
 * GlossaryService
 *
 * Loads and caches per-language glossary JSON files from:
 *   ./assets/glossary/{lang}.json
 *
 * Falls back to English when the requested language is unavailable.
 * Exposes a reactive lookup for a single key.
 */
@Injectable({ providedIn: 'root' })
export class GlossaryService {
  private readonly basePath = './assets/glossary';
  private readonly cache = new Map<string, GlossaryMap>();

  constructor(private readonly http: HttpClient) {}

  /**
   * Converts a display term like "Daily Plan" to its canonical glossary key:
   *   "daily-plan"
   */
  static termToKey(term: string): string {
    return term.trim().toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Returns an Observable that resolves to the markdown definition string for
   * the given key in the given language, with fallback to English.
   * Resolves to null if no entry is found.
   */
  getDefinition(key: string, lang: string): Observable<string | null> {
    return this.loadGlossary(lang).pipe(
      map(glossary => glossary[key] ?? null)
    );
  }

  /**
   * Loads and caches the glossary for the given language.
   * Falls back to English if the requested language file is not found.
   */
  loadGlossary(lang: string): Observable<GlossaryMap> {
    const normalized = (lang || 'en').toLowerCase().split('-')[0];
    if (this.cache.has(normalized)) {
      return of(this.cache.get(normalized)!);
    }

    return this.fetchFile(normalized).pipe(
      catchError(() =>
        normalized === 'en' ? of({}) : this.fetchFile('en')
      )
    );
  }

  private fetchFile(lang: string): Observable<GlossaryMap> {
    if (this.cache.has(lang)) {
      return of(this.cache.get(lang)!);
    }
    return this.http.get<GlossaryFile>(`${this.basePath}/${lang}.json`).pipe(
      map(data => data?.glossary ?? {}),
      tap(glossary => this.cache.set(lang, glossary)),
      catchError(() => {
        this.cache.set(lang, {});
        return of({} as GlossaryMap);
      })
    );
  }
}
