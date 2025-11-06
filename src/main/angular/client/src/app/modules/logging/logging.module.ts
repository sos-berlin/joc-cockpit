import {NgModule} from '@angular/core';
import {Logging2Component, LoggingComponent} from './logging.component';
import {LoggingRoutingModule} from './logging-routing.module';
import {SharedModule} from '../shared/shared.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
  declarations: [LoggingComponent, Logging2Component],
    imports: [
        LoggingRoutingModule,
        SharedModule,
        NzTooltipDirective
    ]
})
export class LoggingModule {
}
