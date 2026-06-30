import {NgModule} from '@angular/core';
import {NzTooltipDirective} from 'ng-zorro-antd/tooltip';
import {LogComponent} from './log.component';
import {LogRoutingModule} from './log-routing.module';
import {SharedModule} from "../shared/shared.module";

@NgModule({
    imports: [
        SharedModule,
        LogRoutingModule,
        NzTooltipDirective
    ],
  declarations: [LogComponent]
})
export class LogModule {
}
