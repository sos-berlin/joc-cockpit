import {NgModule} from '@angular/core';
import {ResourceSharedModule} from '../resource-shared.module';
import {LockComponent, SingleLockComponent} from './lock.component';
import {LockRoutingModule} from './lock-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    LockRoutingModule
  ],
  declarations: [LockComponent, SingleLockComponent]
})
export class LockModule {
}
