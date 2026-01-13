import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay, switchMap } from 'rxjs/operators';
import { AuthService } from '../components/guard';

@Injectable({ providedIn: 'root' })
export class ImageCacheService {
  private cache = new Map<string, Observable<string>>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


  loadImage(url: string): Observable<string> {
    if (!this.cache.has(url)) {
      const headers = new HttpHeaders({
        'X-Access-Token': this.authService.accessTokenId || ''
      });


      const request$ = this.http.get(url, {
        headers,
        responseType: 'blob'
      }).pipe(
        map(blob => {

          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }),

        switchMap(promise => promise),

        shareReplay(1),

        catchError(() => of(url))
      );

      this.cache.set(url, request$);
    }

    return this.cache.get(url)!;
  }


  clearCache(): void {
    this.cache.clear();
  }
}

