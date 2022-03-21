import {NgModule} from '@angular/core';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {ClipboardModule} from 'ngx-clipboard';
import {RouterModule, Routes} from '@angular/router';
import {
  ControllersComponent,
  CreateTokenModalComponent,
  DeployModalComponent
} from './controllers.component';
import {
  AddClusterModalComponent,
  AgentComponent,
  AgentModalComponent,
  SubagentModalComponent
} from './agent/agent.component';
import {SharedModule} from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: ControllersComponent
  },
  {
    path: 'cluster_agent/:controllerId/:agentId',
    component: AgentComponent,
    data: {breadcrumb: 'breadcrumb.label.clusterAgents'}
  }
];

@NgModule({
    declarations: [ControllersComponent, DeployModalComponent, SubagentModalComponent, AddClusterModalComponent, AgentModalComponent, CreateTokenModalComponent, AgentComponent],
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        ClipboardModule,
        NzPopoverModule
    ]
})
export class ControllersModule {
}
