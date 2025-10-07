import {NgModule} from '@angular/core';
import {FileTransferComponent, FilterModalComponent, SingleFileTransferComponent} from './file-transfer.component';
import {SharedModule} from '../shared/shared.module';
import {FileTransferRoutingModule} from './file-transfer-routing.module';
import {FileTransferService} from '../../services/file-transfer.service';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
    imports: [
        SharedModule,
        FileTransferRoutingModule,
        NzTooltipDirective
    ],
  providers: [FileTransferService],
  declarations: [FileTransferComponent, SingleFileTransferComponent, FilterModalComponent]
})
export class FileTransferModule {
}
