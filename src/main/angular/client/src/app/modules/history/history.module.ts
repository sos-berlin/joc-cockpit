import {NgModule} from '@angular/core';
import {
  HistoryComponent,
  FilterModalComponent,
  OrderSearchComponent,
  TaskSearchComponent,
  DeploymentSearchComponent
} from './history.component';
import {HistoryRoutingModule} from './history-routing.module';
import {SharedModule} from '../shared/shared.module';
import {EditIgnoreListComponent} from './ignore-list-modal/ignore-list.component';

@NgModule({
  imports: [
    SharedModule,
    HistoryRoutingModule
  ],
  declarations: [
    HistoryComponent,
    FilterModalComponent,
    EditIgnoreListComponent,
    OrderSearchComponent,
    TaskSearchComponent,
    DeploymentSearchComponent
  ],
  entryComponents: [
    FilterModalComponent,
    EditIgnoreListComponent
  ]
})
export class HistoryModule {
}


