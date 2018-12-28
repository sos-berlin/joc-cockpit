import {NgModule} from '@angular/core';
import {FileTransferComponent, FilterModalComponent, SearchComponent} from './file-transfer.component';
import {SharedModule} from '../shared/shared.module';
import {FileTransferRoutingModule} from './file-transfer-routing.module';
import {SelectModule} from 'ng2-select';

@NgModule({
  imports: [
    SharedModule,
    FileTransferRoutingModule,
    SelectModule
  ],
  declarations: [FileTransferComponent, FilterModalComponent, SearchComponent],
  entryComponents: [
    FilterModalComponent
  ]
})
export class FileTransferModule {
}
