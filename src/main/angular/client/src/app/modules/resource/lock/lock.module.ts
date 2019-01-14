import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {LockComponent} from './lock.component';
import {LockRoutingModule} from './lock-routing.module';

@NgModule({
  imports: [
    SharedModule,
    LockRoutingModule
  ],
  declarations: [LockComponent]
})
export class LockModule {
}
