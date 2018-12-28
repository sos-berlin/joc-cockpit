import {NgModule} from '@angular/core';
import {
  HistoryComponent,
  FilterModalComponent,
  OrderSearchComponent,
  YadeSearchComponent,
  TaskSearchComponent
} from './history.component';
import {HistoryRoutingModule} from './history-routing.module';
import {SharedModule} from '../shared/shared.module';
import {EditIgnoreListModal} from '../../components/ignore-list-modal/ignore-list.component';

@NgModule({
  imports: [
    SharedModule,
    HistoryRoutingModule
  ],
  declarations: [
    HistoryComponent,
    FilterModalComponent,
    EditIgnoreListModal,
    OrderSearchComponent,
    YadeSearchComponent,
    TaskSearchComponent
  ],
  entryComponents: [
    FilterModalComponent,
    EditIgnoreListModal
  ]
})
export class HistoryModule {
}


