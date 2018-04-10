import { NgModule } from '@angular/core';
import { JobComponent } from './job.component';
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [JobComponent]
})
export class JobModule { }
