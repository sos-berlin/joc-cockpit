import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AgentClusterComponent} from './agent-cluster.component';

const routes: Routes = [
  {
    path: '', component: AgentClusterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentClusterRoutingModule {
}
