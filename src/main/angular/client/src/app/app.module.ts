import {BrowserModule} from '@angular/platform-browser';
import {registerLocaleData} from '@angular/common';

import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ToasterModule} from 'angular2-toaster';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {NZ_I18N, en_US} from 'ng-zorro-antd/i18n';
import en from '@angular/common/locales/en';
import {NzMessageService} from 'ng-zorro-antd/message';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthInterceptor} from './components/guard';
import {AboutModalComponent} from './components/about-modal/about.component';
import {LoginModule} from './modules/login/login.module';
import {LoggingService} from './services/logging.service';

registerLocaleData(en);

export function createTranslateLoader(http: HttpClient): any {
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
    NgbModule,
    LoginModule,
    ToasterModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
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
