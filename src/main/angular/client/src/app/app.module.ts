import {ErrorHandler, Injectable, NgModule, provideZoneChangeDetection} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {en_US, NZ_DATE_CONFIG, NZ_DATE_LOCALE, NZ_I18N} from 'ng-zorro-antd/i18n';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {ToastrModule} from 'ngx-toastr';
import {PortalModule} from '@angular/cdk/portal';
import {provideTranslateService} from '@ngx-translate/core';
import {enUS} from 'date-fns/locale';
import {AppRoutingModule} from './app-routing.module';
import {LoginModule} from './modules/login/login.module';
import {SignupCompleteModule} from "./modules/signup-complete/signup-complete.module";
import {AppComponent} from './app.component';
import {AuthInterceptor} from './components/guard';
import {LoggingService} from './services/logging.service';
import {POPOUT_MODAL_DATA, PopupService} from "./services/popup.service";


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
    })
  ],
  providers: [
    {
      provide: POPOUT_MODAL_DATA,
      useClass: PopupService,
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
    {provide: NZ_DATE_LOCALE, useValue: enUS},  { provide: NZ_DATE_CONFIG, useValue: { firstDayOfWeek: 1 } },
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json?v=1659421544261' })
    }),
    provideZoneChangeDetection({ eventCoalescing: true })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
