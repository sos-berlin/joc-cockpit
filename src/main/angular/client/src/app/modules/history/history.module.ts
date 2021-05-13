import {NgModule} from '@angular/core';
import {
  HistoryComponent,
  SingleHistoryComponent,
  FilterModalComponent,
  OrderSearchComponent,
  TaskSearchComponent,
  DeploymentSearchComponent, OrderTemplateComponent, SubmissionSearchComponent, YadeSearchComponent
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
    SingleHistoryComponent,
    FilterModalComponent,
    OrderTemplateComponent,
    EditIgnoreListComponent,
    OrderSearchComponent,
    YadeSearchComponent,
    TaskSearchComponent,
    DeploymentSearchComponent,
    SubmissionSearchComponent
  ]
})
export class HistoryModule {
}


