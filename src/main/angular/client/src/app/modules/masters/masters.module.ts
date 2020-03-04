import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {MastersComponent} from './masters.component';
import {RouterModule, Routes} from '@angular/router';
import {StartUpModalComponent} from '../start-up/start-up.component';

const routes: Routes = [{ path: '', component: MastersComponent}];

@NgModule({
  declarations: [MastersComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ], entryComponents :[StartUpModalComponent]
})
export class MastersModule { }
