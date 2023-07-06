import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {isEmpty} from 'underscore';
import {AuthService} from './auth.service';
import {LoggingService} from '../../services/logging.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService,
              private logService: LoggingService, private translate: TranslateService, private toasterService: ToastrService) {
  }

  intercept(req: any, next: HttpHandler): Observable<HttpEvent<any>> {
    const re = new RegExp("^(http|https)://", "i");
    if (req.method === 'POST') {
      if (!re.test(req.url)) {
        if (!(req.body instanceof FormData && req.body.has('file'))) { // Exclude condition for FormData with file
          req = req.clone({
            url: 'api/' + req.url,
            headers: req.headers.set('Content-Type', req.url.match('validate/predicate') ? 'text/plain' : 'application/json')
          });
          if (req.url.match('authentication/login')) {
            const user = req.body;
            if (user.idToken) {
              const headerOptions: any = {
                'X-ID-TOKEN': user.idToken,
                'X-IDENTITY-SERVICE': user.identityServiceName,
                'X-OPENID-CONFIGURATION': user.oidcDocument
              };
              const headers = new HttpHeaders(headerOptions);
              req = req.clone({headers});
            } else if (!user.fido) {
              req = req.clone({
                headers: req.headers.set('Authorization', 'Basic ' + window.btoa(decodeURIComponent(encodeURIComponent((user.userName || '') + ':' + (user.password || ''))))),
                body: {}
              });
            } else {
              delete user.fido;
            }
          } else if (this.authService.accessTokenId) {
            req = req.clone({
              headers: req.headers.set('X-Access-Token', this.authService.accessTokenId)
            });
          }
          if (!req.url.match('touch')) {
            req.requestTimeStamp = new Date().getTime();
            this.logService.debug('START LOADING ' + req.url);
          }
        }
      }
      return next.handle(req).pipe(
        tap({
          next: (event: any) => {
            if (!req.url.match('touch') && event.url) {
              const message = 'ELAPSED TIME FOR ' + req.url + ' RESPONSE : ' + ((new Date().getTime() - req.requestTimeStamp) / 1000) + 's';
              this.logService.debug(message);
            }
          }, error: (err: any) => {
            if (req.url.match('iam/fido') && this.router.url.match('/login')) {
              return;
            }
            if (err.status === 200) {

            } else {
              if (re.test(req.url) && err.error && !isEmpty(err.error)) {
                this.toasterService.error(err.error.error, err.error.error_description);
              }
              if ((err.status === 401 || err.status === 440 || (err.status === 420 && err.error.error && (err.error.error.message.match(/UnknownSessionException/)
                || err.error.error.message.match(/user is null/))))) {
                if (!this.router.url.match('/login') && !req.url.match('authentication/login')) {
                  let title = '';
                  let msg = '';
                  this.translate.get('error.message.sessionTimeout').subscribe(translatedValue => {
                    title = translatedValue;
                  });
                  this.translate.get('error.message.sessionExpired').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  this.toasterService.error(title, msg);
                  this.authService.clearUser();
                  this.authService.clearStorage();
                  let url = this.router.url;
                  if (url && url.match(/returnUrl/)) {
                    url = url.substring(0, url.indexOf('returnUrl'));
                  }
                  this.router.navigate(['login'], {queryParams: {returnUrl: url}}).then();
                  return;
                }
              } else if (err.status && err.status !== 434 && err.status !== 502) {

                if (req.url.match('inventory/path') && err.status === 420) {
                  return;
                }
                if (req.url.match('controller/ids') && err.status === 403) {
                  return;
                }
                let flag = false;
                if (typeof err.error === 'string') {
                  try {
                    let _err = JSON.parse(err.error);
                    if (!isEmpty(_err.error)) {
                      this.toasterService.error(_err.error.code, _err.error.message);
                    }
                    flag = true;
                  } catch (e) {
                  }
                }
                if (!flag) {
                  if (err.error.error) {
                    if (err.error.error.message && err.error.error.message.match('JocObjectAlreadyExistException')) {
                      this.toasterService.error('', err.error.error.message.replace(/JocObjectAlreadyExistException:/, ''));
                    } else if (err.error.error.message) {
                      this.toasterService.error('', err.error.error.message);
                    }
                  } else if (err.error.message) {
                    this.toasterService.error(err.error.message);
                  } else {
                    if (err.error.errors) {
                      for (let i = 0; i < err.error.errors.length; i++) {
                        this.toasterService.error(err.error.errors[i].message);
                      }
                    } else if (err.message) {
                      this.toasterService.error(err.message);
                    }
                  }
                }
              }
              let errorMessage: string;
              if (err.error instanceof ErrorEvent) {
                // client-side error
                errorMessage = `${err.error.message}`;
              } else {
                // server-side error
                if (err.error && err.error.error) {
                  errorMessage = JSON.stringify(err.error.error);
                } else {
                  errorMessage = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
                }
              }
              this.logService.error(errorMessage);
            }
          }
        }));
    } else {
      return next.handle(req);
    }
  }
}
