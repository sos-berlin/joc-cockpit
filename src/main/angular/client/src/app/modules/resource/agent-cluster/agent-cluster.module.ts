import {NgModule} from '@angular/core';
import {AgentClusterComponent} from './agent-cluster.component';
import {SharedModule} from '../../shared/shared.module';
import {AgentClusterRoutingModule} from './agent-cluster-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AgentClusterRoutingModule
  ],
  declarations: [AgentClusterComponent]
})
export class AgentClusterModule {
}
