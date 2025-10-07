import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {NgJsonEditorModule} from "ang-jsoneditor";
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
        NgJsonEditorModule,
        SharedModule,
        NzTooltipDirective
    ]
})
export class DeploymentModule {
}
