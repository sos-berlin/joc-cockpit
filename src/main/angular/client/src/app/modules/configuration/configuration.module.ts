import {NgModule} from '@angular/core';
import {ConfigurationComponent} from './configuration.component';
import {ConfigurationRoutingModule} from './configuration-routing.module';

@NgModule({
  imports: [
    ConfigurationRoutingModule
  ],
  declarations: [
    ConfigurationComponent
   ]
})
export class ConfigurationModule {
}
