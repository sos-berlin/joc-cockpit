import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import { AddChangesModalComponent, ChangesComponent } from './changes.component';

const routes: Routes = [
  {
    path: '',
    component: ChangesComponent
  }
];

@NgModule({
  declarations: [
    ChangesComponent,
    AddChangesModalComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
  ]
})

export class changesModule {
}
