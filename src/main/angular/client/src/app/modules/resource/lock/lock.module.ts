import {NgModule} from '@angular/core';
import {ResourceSharedModule} from '../resource-shared.module';
import {LockComponent, SingleLockComponent} from './lock.component';
import {LockRoutingModule} from './lock-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {WorkflowService} from '../../../services/workflow.service';
import {InventoryService} from '../../configuration/inventory/inventory.service';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    LockRoutingModule
  ],
  providers: [WorkflowService, InventoryService],
  declarations: [LockComponent, SingleLockComponent]
})
export class LockModule {
}
