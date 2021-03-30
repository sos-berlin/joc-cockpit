import {NgModule} from '@angular/core';
import {FileTransferComponent, FilterModalComponent, SearchComponent} from './file-transfer.component';
import {SharedModule} from '../shared/shared.module';
import {FileTransferRoutingModule} from './file-transfer-routing.module';

@NgModule({
  imports: [
    SharedModule,
    FileTransferRoutingModule
  ],
  declarations: [FileTransferComponent, FilterModalComponent, SearchComponent]
})
export class FileTransferModule {
}
