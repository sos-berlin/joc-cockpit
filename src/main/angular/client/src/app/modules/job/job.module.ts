import {NgModule} from '@angular/core';
import {JobComponent} from './job.component';
import {JobRoutingModule} from './job-routing.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    JobRoutingModule
  ],
  declarations: [JobComponent]
})
export class JobModule {
}
