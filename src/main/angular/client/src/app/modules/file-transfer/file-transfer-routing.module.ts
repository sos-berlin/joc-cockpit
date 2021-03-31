import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FileTransferComponent, SingleFileTransferComponent} from './file-transfer.component';

const routes: Routes = [
  {
    path: '', component: FileTransferComponent
  }, {
    path: 'file_transfer',
    component: SingleFileTransferComponent,
    data: {breadcrumb: 'breadcrumb.label.fileTransfer'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileTransferRoutingModule {
}
