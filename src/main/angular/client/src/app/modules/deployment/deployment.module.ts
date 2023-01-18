import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {NgJsonEditorModule} from "ang-jsoneditor";
import {FileUploadModule} from "ng2-file-upload";
import {DeploymentRoutingModule} from './deployment-routing.module';
import {
  BulkUpdateModalComponent,
  DeploymentComponent,
  ShowJsonModalComponent,
  UploadModalComponent
} from './deployment.component';

@NgModule({
  declarations: [
    DeploymentComponent,
    ShowJsonModalComponent,
    BulkUpdateModalComponent,
    UploadModalComponent
  ],
  imports: [
    DeploymentRoutingModule,
    NgJsonEditorModule,
    FileUploadModule,
    SharedModule
  ]
})
export class DeploymentModule {
}
