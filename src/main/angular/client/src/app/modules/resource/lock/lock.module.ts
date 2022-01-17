import {NgModule} from '@angular/core';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {ResourceSharedModule} from '../resource-shared.module';
import {LockComponent, SingleLockComponent} from './lock.component';
import {LockRoutingModule} from './lock-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    LockRoutingModule,
    NzDrawerModule
  ],
  declarations: [LockComponent, SingleLockComponent]
})
export class LockModule {
}
