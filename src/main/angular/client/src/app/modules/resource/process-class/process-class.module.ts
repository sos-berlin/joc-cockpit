import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {ProcessClassComponent} from './process-class.component';
import {ProcessClassRoutingModule} from './process-class-routing.module';

@NgModule({
  imports: [
    SharedModule,
    ProcessClassRoutingModule
  ],
  declarations: [ProcessClassComponent]
})
export class ProcessClassModule {
}
