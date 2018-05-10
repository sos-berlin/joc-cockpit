import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { ToasterConfig} from 'angular2-toaster';

declare var $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  public config: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-center'
  });

  constructor(public translate: TranslateService) {
    this.getTranslate();
    AppComponent.themeInit();

  }

  private getTranslate() {
    const locales = ['en', 'fr', 'de', 'ja'];
    let lang = localStorage.$SOS$LANG || navigator.language;
    if (locales.indexOf(lang) <= -1) lang = 'en';

    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  static themeInit() {
    if (localStorage.$SOS$THEME != null) {
      $('#style-color').attr('href', './styles/' + window.localStorage.$SOS$THEME + '-style.css');
    }
  }

}
