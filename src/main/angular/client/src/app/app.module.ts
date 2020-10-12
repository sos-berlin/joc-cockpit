import {BrowserModule} from '@angular/platform-browser';
import {CommonModule, registerLocaleData} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ToasterModule} from 'angular2-toaster';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ErrorHandler, Inject, NgModule} from '@angular/core';
import { NZ_I18N, en_US } from 'ng-zorro-antd';
import en from '@angular/common/locales/en';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthInterceptor} from './components/guard';
import {AboutModalComponent} from './components/about-modal/about.component';
import {LoginModule} from './modules/login/login.module';
import {ErrorModule} from './modules/error/error.module';
import {LoggingService} from './services/logging.service';

registerLocaleData(en);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export class MyErrorHandler implements ErrorHandler {
  constructor( @Inject(LoggingService) private loggingService: LoggingService) {
  }
  handleError(error) {
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
    CommonModule,
    FormsModule,
    NgbModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LoginModule,
    ErrorModule,
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
    { provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
  entryComponents: [AboutModalComponent]
})
export class AppModule {
}
