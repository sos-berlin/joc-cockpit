import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {AgentRoutingModule} from './agent-routing.module';
import {AgentComponent} from './agent.component';

@NgModule({
  imports: [
    SharedModule,
    AgentRoutingModule
  ],
  declarations: [AgentComponent]
})
export class AgentModule {
}
