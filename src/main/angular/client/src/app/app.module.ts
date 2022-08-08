import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {en_US, NZ_I18N} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ToastrModule} from 'ngx-toastr';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {AppRoutingModule} from './app-routing.module';
import {LoginModule} from './modules/login/login.module';
import {AppComponent} from './app.component';
import {AuthInterceptor} from './components/guard';
import {LoggingService} from './services/logging.service';

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
    ToastrModule.forRoot({
      maxOpened: 3,
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
    {provide: ErrorHandler, useClass: MyErrorHandler},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: NZ_I18N, useValue: en_US
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
