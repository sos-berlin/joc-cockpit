import { NgModule } from '@angular/core';
import { FileTransferComponent } from './file-transfer.component';
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [FileTransferComponent]
})
export class FileTransferModule { }
