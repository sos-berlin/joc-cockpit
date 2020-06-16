import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {RouterModule, Routes} from '@angular/router';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ControllersComponent} from './controllers.component';

const routes: Routes = [{ path: '', component: ControllersComponent}];

@NgModule({
  declarations: [ControllersComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ], entryComponents :[StartUpModalComponent]
})
export class ControllersModule { }
