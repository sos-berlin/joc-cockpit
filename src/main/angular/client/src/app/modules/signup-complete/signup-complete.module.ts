import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {Shared3Module} from "../shared/shared3.module";
import {SignupCompleteComponent} from "./signup-complete.component";
import {SignupCompleteRoutingModule} from "./signup-complete-routing.module";

@NgModule({
  declarations: [SignupCompleteComponent],
  imports: [
    Shared3Module,
    SignupCompleteRoutingModule,
    ReactiveFormsModule,
  ]
})
export class SignupCompleteModule {
}
