import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {NgJsonEditorModule} from "ang-jsoneditor";
import {DeploymentRoutingModule} from './deployment-routing.module';
import {
  BulkUpdateModalComponent,
  DeploymentComponent,
  ShowJsonModalComponent
} from './deployment.component';

@NgModule({
  declarations: [
    DeploymentComponent,
    ShowJsonModalComponent,
    BulkUpdateModalComponent
  ],
  imports: [
    DeploymentRoutingModule,
    NgJsonEditorModule,
    SharedModule
  ]
})
export class DeploymentModule {
}
