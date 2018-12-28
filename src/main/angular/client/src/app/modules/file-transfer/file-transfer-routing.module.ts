import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FileTransferComponent} from './file-transfer.component';

const routes: Routes = [
  {
    path: '', component: FileTransferComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileTransferRoutingModule {
}
