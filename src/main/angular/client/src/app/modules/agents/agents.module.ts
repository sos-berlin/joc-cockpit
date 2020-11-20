import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {RouterModule, Routes} from '@angular/router';
import {AgentModalComponent, AgentsComponent} from './agents.component';

const routes: Routes = [{path: '', component: AgentsComponent}];

@NgModule({
  declarations: [AgentsComponent, AgentModalComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  entryComponents:[AgentModalComponent]
})
export class AgentsModule {
}
