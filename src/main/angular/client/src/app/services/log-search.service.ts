import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * LogSearchService
 *
 * Root-level singleton that maintains the global search state shared across
 * ALL open log console windows (Controller, Agent, JOC, etc.).
 *
 * When a user types a search term in any log window it is broadcast to every
 * other window via the `searchTerm$` observable, so matches are highlighted /
 * filtered everywhere simultaneously.
 */
@Injectable({ providedIn: 'root' })
export class LogSearchService {
  private readonly _searchTerm$ = new BehaviorSubject<string>('');

  /** Emits whenever any log window updates the shared search term. */
  readonly searchTerm$ = this._searchTerm$.asObservable();

  /** Current snapshot (sync read for template-binding initialisation). */
  get currentTerm(): string { return this._searchTerm$.value; }

  /** Call from any log window when the user changes the search input. */
  setTerm(term: string): void {
    if (this._searchTerm$.value !== term) {
      this._searchTerm$.next(term);
    }
  }

  clearTerm(): void { this.setTerm(''); }
}
