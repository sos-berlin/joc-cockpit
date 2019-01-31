import { NgModule } from '@angular/core';
import {LogComponent} from './log.component';
import {LogRoutingModule} from './log-routing.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [LogComponent],
  imports: [
    SharedModule,
    LogRoutingModule
  ]
})
export class LogModule { }
