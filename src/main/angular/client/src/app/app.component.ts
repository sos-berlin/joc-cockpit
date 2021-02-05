import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ToasterConfig} from 'angular2-toaster';
import {Router} from '@angular/router';
import {DataService} from './services/data.service';

declare const $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  public config: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-center',
    limit: 1
  });

  constructor(public translate: TranslateService, private router: Router, private dataService: DataService) {
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

  static themeInit() {
    if (localStorage.$SOS$THEME != null && localStorage.$SOS$THEME != 'undefined') {
      $('#style-color').attr('href', './styles/' + window.localStorage.$SOS$THEME + '-style.css');
      if (localStorage.$SOS$MENUTHEME != null) {
        $('#headerColor').addClass(window.localStorage.$SOS$MENUTHEME);
        if (localStorage.$SOS$AVATARTHEME != null) {
          $('#avatarBg').addClass(window.localStorage.$SOS$AVATARTHEME);
        }
      }
    }
  }

  private getTranslate() {
    const locales = ['en', 'fr', 'de', 'ja'];
    let lang = localStorage.$SOS$LANG || navigator.language;
    if (locales.indexOf(lang) <= -1) {
      lang = 'en';
    }
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  gotoErrorLocation() {
    this.dataService.announceFunction('xmlEditor');
  }
}
