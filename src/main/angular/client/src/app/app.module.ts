import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {en_US, NZ_I18N} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ToasterModule} from 'angular2-toaster';
import {NzMessageService} from 'ng-zorro-antd/message';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {AppRoutingModule} from './app-routing.module';
import {LoginModule} from './modules/login/login.module';
import {AppComponent} from './app.component';
import {AboutModalComponent} from './components/about-modal/about.component';
import {AuthInterceptor} from './components/guard';
import {LoggingService} from './services/logging.service';


registerLocaleData(en);

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader  {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  constructor(private loggingService: LoggingService) {
  }

  handleError(error: any): void {
    console.log(error);
    this.loggingService.error(error.stack || error.message);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    AboutModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LoginModule,
    ToasterModule.forRoot(),
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
    },
    NzMessageService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
