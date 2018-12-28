import {NgModule} from '@angular/core';
import {JoeComponent} from './joe.component';
import {SharedModule} from '../shared/shared.module';
import {JoeRoutingModule} from './joe-routing.module';

@NgModule({
  declarations: [
    JoeComponent
  ],
  imports: [
    SharedModule,
    JoeRoutingModule
  ]
})
export class JoeModule {
}
