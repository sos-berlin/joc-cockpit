import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {StartUpRoutingModule} from './start-up-routing.module';
import {StartUpComponent} from './start-up.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    StartUpRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    StartUpComponent
  ]
})
export class StartUpModule {
}
