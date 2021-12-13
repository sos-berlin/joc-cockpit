import {NgModule} from '@angular/core';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {ClipboardModule} from 'ngx-clipboard';
import {SharedModule} from '../shared/shared.module';
import {RouterModule, Routes} from '@angular/router';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {
  ControllersComponent,
  AgentModalComponent,
  CreateTokenModalComponent,
  SubagentModalComponent,
  DeployModalComponent
} from './controllers.component';

const routes: Routes = [{path: '', component: ControllersComponent}];

@NgModule({
  declarations: [ControllersComponent, DeployModalComponent, SubagentModalComponent, AgentModalComponent, CreateTokenModalComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    ClipboardModule,
    NzPopoverModule
  ], entryComponents: [StartUpModalComponent]
})
export class ControllersModule {
}
