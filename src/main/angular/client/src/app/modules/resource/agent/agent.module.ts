import {NgModule} from '@angular/core';
import {ResourceSharedModule} from '../resource-shared.module';
import {AgentRoutingModule} from './agent-routing.module';
import {AgentComponent, ConfirmNodeModalComponent} from './agent.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    AgentRoutingModule
  ],
  declarations: [AgentComponent, ConfirmNodeModalComponent]
})
export class AgentModule {
}
