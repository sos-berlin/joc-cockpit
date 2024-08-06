import {NgModule} from '@angular/core';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {ClipboardModule} from 'ngx-clipboard';
import {RouterModule, Routes} from '@angular/router';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {
  ControllersComponent,
  CreateTokenModalComponent,
  ExportComponent,
  ExportBulkComponent
} from './controllers.component';
import {
  AddClusterModalComponent,
  AgentComponent,
  AgentModalComponent,
  SubagentModalComponent,
  AddCertificateModalComponent,
  ShowCertificateListModalComponent
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
  declarations: [
    ControllersComponent,
    SubagentModalComponent,
    AddClusterModalComponent,
    AgentModalComponent,
    CreateTokenModalComponent,
    AgentComponent,
    ExportComponent,
    AddCertificateModalComponent,
    ShowCertificateListModalComponent,
    ExportBulkComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    ClipboardModule,
    NzDrawerModule,
    NzPopoverModule
  ]
})
export class ControllersModule {
}
