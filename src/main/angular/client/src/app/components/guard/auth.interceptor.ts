import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService, private translate: TranslateService, private toasterService: ToasterService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method === 'POST' || req.url.match('jobscheduler/log?')) {
      req = req.clone({
        url: './api/' + req.url,
        headers: req.headers.set('Content-Type', 'application/json')
      });
      if (req.url.match('security/login')) {
        const user = req.body;
        req = req.clone({
          headers: req.headers.set('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(user.userName + ':' + user.password)))),
          body: {}
        });
      } else {
        req = req.clone({
          headers: req.headers.set('X-Access-Token', this.authService.accessTokenId)
        });
      }
      if(req.url.match('publish/export')) {
        req = req.clone({
          headers: req.headers.set('Accept', 'application/octet-stream')
        });
      }
      return next.handle(req).pipe(
        tap(event => {
        }, err => {
          if ((err.status === 401 || err.status === 440 || (err.status === 420 && err.error.error && err.error.error.message.match(/UnknownSessionException/))) && this.router.url !== '/login') {
            let title = '';
            let msg = '';
            this.translate.get('message.sessionTimeout').subscribe(translatedValue => {
              title = translatedValue;
            });
            this.translate.get('message.sessionExpired').subscribe(translatedValue => {
              msg = translatedValue;
            });
            this.toasterService.pop('error', title, msg);
            this.authService.clearUser();
            this.authService.clearStorage();
            return this.router.navigate(['login'], {queryParams: {returnUrl: this.router.url}});
          } else if (err.status && err.status !== 434) {
            if (err.error.error) {
              this.toasterService.pop('error', '', err.error.error.message);
            } else if (err.error.message) {
              this.toasterService.pop('error', '', err.error.message);
            }
          }
        }));
    } else {
      return next.handle(req);
    }
  }
}
