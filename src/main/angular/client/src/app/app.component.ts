import { Component } from '@angular/core';
import {ToasterConfig} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import {DataService} from './services/data.service';
import { en_US, fr_FR, ja_JP, de_DE, NzI18nService } from 'ng-zorro-antd/i18n';
declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public config: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-center',
    limit: 1
  });

  constructor(public translate: TranslateService, private i18n: NzI18nService,
              private dataService: DataService) {
    this.getTranslate();
    AppComponent.themeInit();
    /*    Object.getOwnPropertyNames(console).filter(function (property) {
          return typeof console[property] == 'function';
        }).forEach(function (verb) {
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

  private getTranslate(): void {
    const locales = ['en', 'fr', 'de', 'ja'];
    let lang = localStorage.$SOS$LANG || navigator.language;
    if (locales.indexOf(lang) <= -1) {
      lang = 'en';
    }
    this.i18n.setLocale(lang === 'en' ? en_US : lang === 'fr' ? fr_FR : lang === 'de' ? de_DE : ja_JP);
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  gotoErrorLocation(): void {
    this.dataService.announceFunction('xmlEditor');
  }
}
