import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { AuthService } from '../guard/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import {ToasterService} from 'angular2-toaster';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(public router: Router, public route: ActivatedRoute, public authService: AuthService, public translate: TranslateService, public toasterService: ToasterService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method == 'POST' || req.url.match('jobscheduler/log?')) {
      req = req.clone({
        url: 'http://localhost:4446/joc/api/' + req.url,
        headers: req.headers.set('Content-Type', 'application/json')
      });
      if (req.url.match('security/login')) {
        let user = req.body;
        req = req.clone({
          headers: req.headers.set('Authorization', "Basic " + btoa(user.userName + ":" + user.password)),
          body: {}
        });

      } else {
        req = req.clone({
          headers: req.headers.set('X-Access-Token', this.authService.accessTokenId)
        });
      }
      return next.handle(req).pipe(
        tap(event => {

        }, err => {

          if ((err.status === 401 || err.status === 440) && this.router.url !== '/login') {
            let title = '';
            let msg = '';
            this.translate.get('message.sessionTimeout').subscribe(translatedValue => {
              title = translatedValue;
            });

            this.translate.get('message.sessionExpired').subscribe(translatedValue => {
              msg = translatedValue;
            });
            this.toasterService.pop('error', title, msg);

            localStorage.$SOS$URL = this.router.url;
            console.log('this.route.queryParams')
            console.log(this.route.queryParams)
            localStorage.$SOS$URLPARAMS = JSON.stringify(this.route.queryParams);
            this.authService.clearUser();
            this.authService.clearStorage();
            this.router.navigate(['/login']);
          } else if (err.status && err.status !== 434) {

            if (err.error.error)
              this.toasterService.pop('error', '', err.error.error.message);
          }

        }));
    } else {
      return next.handle(req);
    }
  }
}
