import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AgentComponent} from './agent.component';

const routes: Routes = [
  {
    path: '', component: AgentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule {
}
