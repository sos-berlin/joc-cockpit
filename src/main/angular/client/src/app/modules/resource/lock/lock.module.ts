import {NgModule} from '@angular/core';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {ResourceSharedModule} from '../resource-shared.module';
import {LockComponent, SingleLockComponent} from './lock.component';
import {LockRoutingModule} from './lock-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
    imports: [
        SharedModule,
        ResourceSharedModule,
        LockRoutingModule,
        NzDrawerModule,
        NzTooltipDirective
    ],
  declarations: [LockComponent, SingleLockComponent]
})
export class LockModule {
}
