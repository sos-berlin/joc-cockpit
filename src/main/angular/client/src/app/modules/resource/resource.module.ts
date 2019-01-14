import {NgModule} from '@angular/core';
import {ResourceRoutingModule} from './resource-routing.module';
import {ResourceComponent} from './resource.component';

@NgModule({
  imports: [
    ResourceRoutingModule
  ],
  declarations: [
    ResourceComponent
   ]
})
export class ResourceModule {
}
