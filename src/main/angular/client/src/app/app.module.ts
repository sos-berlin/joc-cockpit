import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {CoreService} from './services/core.service';
import {FormsModule} from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ToasterModule} from 'angular2-toaster';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthGuard, AuthService, AuthInterceptor} from './components/guard';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AboutModalComponent} from './components/about-modal/about.component';
import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@Injectable()
export class ErrorLogService {
  logError(error: any) {
    if (error instanceof HttpErrorResponse) {
      console.error('There was an HTTP error.', error.message, 'Status code:', (<HttpErrorResponse>error).status);
    } else if (error instanceof TypeError) {
      console.error('There was a Type error.', error.message);
    } else if (error instanceof Error) {
      console.error('There was a general error.', error.message);
    } else {
      console.error('Nobody threw an error but something happened!', error);
    }
  }
}

// global error handler that utilizes the above created service (ideally in its own file)
@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
  constructor(private errorLogService: ErrorLogService) {
    super();
  }

  handleError(error) {
    this.errorLogService.logError(error);
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
    AuthGuard,
    AuthService,
    CoreService,
    // register global error handler
    GlobalErrorHandler,
    // register global error log service
    ErrorLogService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent],
  entryComponents: [AboutModalComponent]
})
export class AppModule {
}
