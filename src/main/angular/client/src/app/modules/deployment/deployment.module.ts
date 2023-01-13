import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import { DeploymentRoutingModule } from './deployment-routing.module';
import {DeploymentComponent, ShowJsonModalComponent} from './deployment.component';
import {NgJsonEditorModule} from "ang-jsoneditor";

@NgModule({
  declarations: [
    DeploymentComponent,
    ShowJsonModalComponent
  ],
  imports: [
    DeploymentRoutingModule,
    NgJsonEditorModule,
    SharedModule
  ]
})
export class DeploymentModule { }
