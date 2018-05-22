import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
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
import {AboutModal} from "./components/about-modal/about.component";

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    AboutModal
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
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
        }),
    NgbModule.forRoot()
  ],
  providers: [
    AuthGuard,
    AuthService,
    CoreService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent],
  entryComponents: [AboutModal]
})
export class AppModule {
}
