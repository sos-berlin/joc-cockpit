import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {en_US, NZ_DATE_LOCALE, NZ_I18N} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ToastrModule} from 'ngx-toastr';
import {PortalModule} from '@angular/cdk/portal';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {enUS} from 'date-fns/locale';
import {AppRoutingModule} from './app-routing.module';
import {LoginModule} from './modules/login/login.module';
import {SignupCompleteModule} from "./modules/signup-complete/signup-complete.module";
import {AppComponent} from './app.component';
import {AuthInterceptor} from './components/guard';
import {LoggingService} from './services/logging.service';
import {POPOUT_MODAL_DATA, PopupService} from "./services/popup.service";


export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  const lang = localStorage['$SOS$LANG'] || 'en';
  import(`../../node_modules/@angular/common/locales/${lang}.mjs`).then(locale => {
    registerLocaleData(locale.default);
  });
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?v=1659421544261');
}

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  constructor(private loggingService: LoggingService) {
  }

  handleError(error: any): void {
    console.error(error);
    this.loggingService.error(error.stack || error.message);
  }
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LoginModule,
    SignupCompleteModule,
    PortalModule,
    ToastrModule.forRoot({
      maxOpened: 1,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {
      provide: POPOUT_MODAL_DATA,  // That's the token we defined previously
      useClass: PopupService,  // That's the actual service itself
    },
    {provide: ErrorHandler, useClass: MyErrorHandler},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: NZ_I18N, useValue: en_US
    },
    {provide: NZ_DATE_LOCALE, useValue: enUS}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
