import { NgModule } from '@angular/core';
import { FileTransferComponent,FilterModal, SearchComponent } from './file-transfer.component';
import {SharedModule} from "../shared/shared.module";
import { SelectModule } from 'ng2-select';
@NgModule({
  imports: [
    SharedModule,
    SelectModule
  ],
  declarations: [FileTransferComponent, FilterModal, SearchComponent],
  entryComponents: [
    FilterModal
  ]
})
export class FileTransferModule { }
