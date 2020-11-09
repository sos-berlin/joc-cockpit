import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {LoggingService} from '../../services/logging.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService,
              private logService: LoggingService, private translate: TranslateService, private toasterService: ToasterService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method === 'POST' || req.url.match('jobscheduler/log?')) {
      req = req.clone({
        url: './api/' + req.url,
        headers: req.headers.set('Content-Type', req.url.match('validate/predicate') ? 'text/plain' : 'application/json')
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
      if (req.url.match('publish/export')) {
        req = req.clone({
          headers: req.headers.set('Accept', 'application/octet-stream')
        });
      }
      if (!req.url.match('touch')) {
        req['requestTimeStamp'] = new Date().getTime();
        this.logService.debug('START LOADING ' + req.url);
      }
      return next.handle(req).pipe(
        tap((event: any) => {
          if (!req.url.match('touch') && event.url) {
            const message = 'ELAPSED TIME FOR ' + req.url + ' RESPONSE : ' + ((new Date().getTime() - req['requestTimeStamp']) / 1000) + 's';
            this.logService.debug(message);
          }
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
            } else {
              if (err.error.errors) {
                for (let i = 0; i < err.error.errors.length; i++) {
                  this.toasterService.pop('error', '', err.error.errors[i].message);
                }
              } else if (err.message) {
                this.toasterService.pop('error', '', err.message);
              }
            }
          }
          let errorMessage = '';
          if (err.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `${err.error.message}`;
          } else {
            // server-side error
            if (err.error && err.error.error) {
              errorMessage = `Status Code: ${err.status}\nMessage: ${err.message}\nError: ${err.error.error}`;
            } else {
              errorMessage = `Status Code: ${err.status}\nMessage: ${err.message}`;
            }
          }
          this.logService.error(errorMessage);
        }));
    } else {
      return next.handle(req);
    }
  }
}
