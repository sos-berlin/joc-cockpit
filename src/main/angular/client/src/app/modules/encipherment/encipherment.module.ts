import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import { AddEnciphermentModalComponent, EnciphermentComponent, EnciphermentUpdateKeyComponent, ImportEnciphermentModalComponent } from './encipherment.component';

const routes: Routes = [
  {
    path: '',
    component: EnciphermentComponent
  }
];

@NgModule({
  declarations: [
    EnciphermentComponent,
    AddEnciphermentModalComponent,
    ImportEnciphermentModalComponent,
    EnciphermentUpdateKeyComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
  ]
})

export class EnciphermentModule {
}
