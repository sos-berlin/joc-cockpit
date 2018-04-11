import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import {ToasterService, ToasterConfig} from 'angular2-toaster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

    private toasterService:ToasterService;

    public config:ToasterConfig = new ToasterConfig({
        positionClass: 'toast-top-center'
    });

    constructor(public translate:TranslateService, toasterService:ToasterService) {
        this.getTranslate();
        this.toasterService = toasterService;
    }

    getTranslate() {
        let locales = ['en', 'fr', 'de', 'ja'];
        let lang = localStorage.$SOS$LANG || navigator.language;
        if (locales.indexOf(lang) <= -1) lang = 'en';

        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

}
