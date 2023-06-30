import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NzI18nService} from 'ng-zorro-antd/i18n';
import {Router} from '@angular/router';
import {registerLocaleData} from "@angular/common";
import {AuthService, OIDCAuthService} from './components/guard';
import {CoreService} from './services/core.service';

declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  locales: any = [];

  constructor(public translate: TranslateService, private i18n: NzI18nService, public coreService: CoreService,
              private authService: AuthService, private readonly oAuthService: OIDCAuthService, private router: Router) {
    AppComponent.themeInit();
    /*    Object.getOwnPropertyNames(console).filter((property) => {
          return typeof console[property] === 'function';
        }).forEach((verb) => {
          console[verb] = () => {
            return 'Sorry, for security reasons, the script console is deactivated';
          };
        });*/
    if (sessionStorage['authConfig']) {
      this.oAuthService.configure(JSON.parse(sessionStorage['authConfig']));
    }
    if (!this.authService.accessTokenId) {
      if (sessionStorage['authConfig']) {
        this.oAuthService.loadDiscoveryDocument('').then((res: any) => {
          this.oAuthService.tryLoginCodeFlow().then(() => {
            if (this.oAuthService.id_token) {
              this.login({
                token: this.oAuthService.access_token,
                idToken: this.oAuthService.id_token,
                refreshToken: this.oAuthService.refresh_token,
                document: res.discoveryDocument
              });
            }
          });
        });
      }
    }

  }

  static themeInit(): void {
    if (localStorage['$SOS$THEME'] != null && localStorage['$SOS$THEME'] != 'undefined') {
      $('#style-color').attr('href', './styles/' + window.localStorage['$SOS$THEME'] + '-style.css');
    }
  }

  ngOnInit(): void {
    const version = new Date().getTime();
    this.coreService.get('assets/i18n/locales.json?v=' + version).subscribe((data) => {
      const locales = [];
      for (const prop in data) {
        locales.push(data[prop]);
        this.locales.push(prop);
      }
      this.coreService.setLocales(locales);
      this.getTranslate();
    });
  }

  private getTranslate(): void {
    let lang = localStorage['$SOS$LANG'] || navigator.language;
    if (this.locales.indexOf(lang) <= -1) {
      lang = 'en';
    }
    if (!localStorage['$SOS$LANG'] && lang !== 'en') {
      import(`../../node_modules/@angular/common/locales/${lang}.mjs`).then(locale => {
        registerLocaleData(locale.default);
      });
    }

    localStorage['$SOS$LANG'] = lang;
    this.translate.setDefaultLang(lang);
    this.translate.use(lang).subscribe((res) => {
      const data = res.extra;
      data.locale = lang;
      data.DatePicker.lang.monthBeforeYear = true;
      data.Calendar.lang.monthBeforeYear = true;
      for (const i in this.coreService.locales) {
        if (lang === this.coreService.locales[i].lang) {
          this.coreService.locales[i] = {
            ...this.coreService.locales[i],
            ...res.calendar
          };
          break;
        }
      }
      this.i18n.setLocale(data);
    });
  }

  private login({
                  token,
                  idToken,
                  refreshToken,
                  document
                }: { token: string, idToken: string, refreshToken?: string, document: any }): void {
    if (token && document) {
      this.coreService.saveValueInLocker({
        content: {
          token,
          refreshToken,
          clientId: sessionStorage['clientId'],
          clientSecret: sessionStorage['clientSecret']
        }
      }, () => {

        this.coreService.post('authentication/login', {
          identityServiceName: sessionStorage['providerName'],
          idToken,
          oidcDocument: btoa(JSON.stringify(document))
        }).subscribe({
          next: (data) => {
            let returnUrl = sessionStorage.getItem('returnUrl');
            let logoutUrl: string = sessionStorage.getItem('logoutUrl');
            let providerName: string = sessionStorage.getItem('providerName');
            let key: string = sessionStorage.getItem('$SOS$KEY');
            let expireTime: string = sessionStorage.getItem('$SOS$TOKENEXPIRETIME');

            sessionStorage.clear();
            this.authService.setUser(data);
            this.authService.save();
            if (returnUrl) {
              if (returnUrl.indexOf('?') > -1) {
                this.router.navigateByUrl(returnUrl);
              } else {
                this.router.navigate([returnUrl]).then();
              }
            } else {
              this.router.navigate(['/']).then();
            }
            sessionStorage.setItem('logoutUrl', logoutUrl);
            sessionStorage.setItem('providerName', providerName);
            sessionStorage.setItem('$SOS$KEY', key);
            sessionStorage.setItem('$SOS$TOKENEXPIRETIME', expireTime)
            if (key) {
              sessionStorage['$SOS$RENEW'] = (new Date().getTime() + 1800000) - 30000;
              this.coreService.renewLocker(key);
            }
          }, error: () => {
            this.oAuthService.logOut(sessionStorage['$SOS$KEY']);
            delete sessionStorage['$SOS$KEY'];
          }
        });
      });

    }
  }

}
