import {NgModule} from '@angular/core';
import {HistoryComponent} from './history.component';
import {SharedModule} from '../shared/shared.module';


@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [HistoryComponent]
})
export class HistoryModule {
}


