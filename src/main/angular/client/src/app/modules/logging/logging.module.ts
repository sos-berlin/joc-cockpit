import {NgModule} from '@angular/core';
import {Logging2Component, LoggingComponent} from './logging.component';
import {LoggingRoutingModule} from './logging-routing.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [LoggingComponent, Logging2Component],
  imports: [
    LoggingRoutingModule,
    SharedModule
  ]
})
export class LoggingModule {
}
