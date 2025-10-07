import {NgModule} from '@angular/core';
import {ResourceSharedModule} from '../resource-shared.module';
import {AgentRoutingModule} from './agent-routing.module';
import {AgentComponent, ConfirmNodeModalComponent} from './agent.component';
import {SharedModule} from '../../shared/shared.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
    imports: [
        SharedModule,
        ResourceSharedModule,
        AgentRoutingModule,
        NzTooltipDirective
    ],
  declarations: [AgentComponent, ConfirmNodeModalComponent]
})
export class AgentModule {
}
