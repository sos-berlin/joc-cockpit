import {NgModule} from '@angular/core';
import {
  HistoryComponent,
  SingleHistoryComponent,
  FilterModalComponent,
  OrderSearchComponent,
  TaskSearchComponent,
  DeploymentSearchComponent, OrderTemplateComponent, SubmissionSearchComponent
} from './history.component';
import {HistoryRoutingModule} from './history-routing.module';
import {SharedModule} from '../shared/shared.module';
import {EditIgnoreListComponent} from './ignore-list-modal/ignore-list.component';
import {FileTransferService} from '../../services/file-transfer.service';
import {NzTabsModule} from "ng-zorro-antd/tabs";

@NgModule({
    imports: [
        SharedModule,
        HistoryRoutingModule,
        NzTabsModule
    ],
  providers: [FileTransferService],
  declarations: [
    HistoryComponent,
    SingleHistoryComponent,
    FilterModalComponent,
    OrderTemplateComponent,
    EditIgnoreListComponent,
    OrderSearchComponent,
    TaskSearchComponent,
    DeploymentSearchComponent,
    SubmissionSearchComponent
  ]
})
export class HistoryModule {
}


