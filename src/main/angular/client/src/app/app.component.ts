import {Component, OnInit} from '@angular/core';
import {ToasterConfig} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import {DataService} from './services/data.service';
import {CoreService} from './services/core.service';
import { en_US, fr_FR, ja_JP, de_DE, NzI18nService } from 'ng-zorro-antd/i18n';
declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  locales = [];
  public config: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-center',
    limit: 1
  });

  constructor(public translate: TranslateService, private i18n: NzI18nService,
              private dataService: DataService, private coreService: CoreService) {
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
    this.coreService.get('assets/i18n/locales.json').subscribe((data) => {
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
    localStorage.$SOS$LANG = lang;


    this.i18n.setLocale(lang === 'en' ? en_US : lang === 'fr' ? fr_FR : lang === 'de' ? de_DE : ja_JP);
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  gotoErrorLocation(): void {
    this.dataService.announceFunction('xmlEditor');
  }
}
