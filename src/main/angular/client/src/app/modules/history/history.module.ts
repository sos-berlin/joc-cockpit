import {NgModule} from '@angular/core';
import {
  HistoryComponent,
  FilterModal,
  OrderSearchComponent,
  YadeSearchComponent,
  TaskSearchComponent
} from './history.component';
import {SharedModule} from '../shared/shared.module';
import {EditIgnoreListModal} from "../../components/ignore-list-modal/ignore-list.component";

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [HistoryComponent, FilterModal, EditIgnoreListModal, OrderSearchComponent, YadeSearchComponent, TaskSearchComponent],
  entryComponents: [
    FilterModal,
    EditIgnoreListModal
  ]
})
export class HistoryModule {
}


