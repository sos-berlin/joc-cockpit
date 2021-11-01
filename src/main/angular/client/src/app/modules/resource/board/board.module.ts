import {NgModule} from '@angular/core';
import {ResourceSharedModule} from '../resource-shared.module';
import {BoardComponent, PostModalComponent, SingleBoardComponent} from './board.component';
import {BoardRoutingModule} from './board-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {InventoryService} from '../../configuration/inventory/inventory.service';
import {WorkflowService} from '../../../services/workflow.service';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    BoardRoutingModule
  ],
  providers: [WorkflowService, InventoryService],
  declarations: [BoardComponent, SingleBoardComponent, PostModalComponent]
})
export class BoardModule {
}
