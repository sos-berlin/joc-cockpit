import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from "@angular/common";
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { CoreService } from './services/core.service';
import { AuthService } from './components/guard';

declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  locales: any = [];

  constructor(public translate: TranslateService, private i18n: NzI18nService, private router: Router, public coreService: CoreService,
    private authService: AuthService, private readonly oAuthService: OAuthService) {
    AppComponent.themeInit();
    /*    Object.getOwnPropertyNames(console).filter((property) => {
          return typeof console[property] === 'function';
        }).forEach((verb) => {
          console[verb] = () => {
            return 'Sorry, for security reasons, the script console is deactivated';
          };
        });*/
    if (!this.authService.accessTokenId) {
      if (sessionStorage.authConfig) {
        this.oAuthService.configure(JSON.parse(sessionStorage.authConfig));
        this.oAuthService.loadDiscoveryDocumentAndTryLogin().then((_) => {
          delete sessionStorage.authConfig;
          if (_) {
            this.login(this.oAuthService.getAccessToken());
          }
        });
      } else if (this.oAuthService.getAccessToken()) {
        this.login(this.oAuthService.getAccessToken());
      }
    }

  }

  static themeInit(): void {
    if (localStorage.$SOS$THEME != null && localStorage.$SOS$THEME != 'undefined') {
      $('#style-color').attr('href', './styles/' + window.localStorage.$SOS$THEME + '-style.css');
    }
  }

  ngOnInit(): void {
    this.coreService.get('assets/i18n/locales.json?v=1659421544261').subscribe((data) => {
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
    let lang = localStorage.$SOS$LANG || navigator.language;
    if (this.locales.indexOf(lang) <= -1) {
      lang = 'en';
    }
    if (!localStorage.$SOS$LANG && lang !== 'en') {
      import(`../../node_modules/@angular/common/locales/${lang}.mjs`).then(locale => {
        registerLocaleData(locale.default);
      });
    }

    localStorage.$SOS$LANG = lang;
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

  private login(token: string): void {
    if (token) {
   
      this.coreService.post('authentication/login', { token, identityServiceName: sessionStorage.providerName, refreshToken: this.oAuthService.getRefreshToken(), idToken: this.oAuthService.getIdToken() }).subscribe({
        next: (data) => {
          this.authService.setUser(data);
          this.authService.save();

          if (sessionStorage.returnUrl) {
            if (sessionStorage.returnUrl.indexOf('?') > -1) {
              this.router.navigateByUrl(sessionStorage.returnUrl);
            } else {
              this.router.navigate([sessionStorage.returnUrl]).then();
            }
          } else {
            this.router.navigate(['/']).then();
          }
          delete sessionStorage.returnUrl;
        }, error: () => {
          sessionStorage.clear();
        }
      });

    }
  }

}
