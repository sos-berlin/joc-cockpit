import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {RouterModule, Routes} from '@angular/router';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ControllersComponent, UpdateAgentModalComponent} from './controllers.component';

const routes: Routes = [{ path: '', component: ControllersComponent}];

@NgModule({
  declarations: [ControllersComponent, UpdateAgentModalComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ], entryComponents :[StartUpModalComponent, UpdateAgentModalComponent]
})
export class ControllersModule { }
