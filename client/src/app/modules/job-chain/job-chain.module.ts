import { NgModule } from '@angular/core';
import { JobChainComponent } from './job-chain.component';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
      SharedModule
  ],
  declarations: [JobChainComponent]
})
export class JobChainModule { }
