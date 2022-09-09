import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from "@angular/common";
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { CoreService } from './services/core.service';
import { Router } from '@angular/router';
import { AuthService } from './components/guard';

declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  locales: any = [];

  constructor(public translate: TranslateService, private i18n: NzI18nService, private router: Router, public coreService: CoreService,
    private authService: AuthService, private oidcSecurityService: OidcSecurityService) {
    AppComponent.themeInit();
    /*    Object.getOwnPropertyNames(console).filter((property) => {
          return typeof console[property] === 'function';
        }).forEach((verb) => {
          console[verb] = () => {
            return 'Sorry, for security reasons, the script console is deactivated';
          };
        });*/
  }

  static themeInit(): void {
    if (localStorage.$SOS$THEME != null && localStorage.$SOS$THEME != 'undefined') {
      $('#style-color').attr('href', './styles/' + window.localStorage.$SOS$THEME + '-style.css');
    }
  }

  ngOnInit(): void {
    let configure = this.oidcSecurityService.getConfigurations();
   // console.log(configure);
    this.oidcSecurityService.checkAuthMultiple().subscribe(([{ isAuthenticated, userData, accessToken, idToken }]) => {
      console.log(idToken);
      if (idToken) {
        this.login(idToken);
      }
    });

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

  private login(token: string): void {
    this.coreService.post('authentication/login', { token, identityServiceName: 'Google' }).subscribe({
      next: (data) => {
        this.authService.setUser(data);
        this.authService.save();
        this.router.navigate(['/']).then();
        // if (this.returnUrl.indexOf('?') > -1) {
        //   this.router.navigateByUrl(this.returnUrl);
        // } else {
        //   this.router.navigate([this.returnUrl]).then();
        // }
      }
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

}
