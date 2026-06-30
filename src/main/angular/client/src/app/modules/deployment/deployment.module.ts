import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {JsonEditorComponent} from "ang-jsoneditor";
import {DeploymentRoutingModule} from './deployment-routing.module';
import {
  BulkUpdateModalComponent,
  DeploymentComponent,
  ShowJsonModalComponent
} from './deployment.component';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
  declarations: [
    DeploymentComponent,
    ShowJsonModalComponent,
    BulkUpdateModalComponent
  ],
    imports: [
        DeploymentRoutingModule,
        JsonEditorComponent,
        SharedModule,
        NzTooltipDirective
    ]
})
export class DeploymentModule {
}
