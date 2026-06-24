import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {Shared3Module} from "../shared/shared3.module";
import {SignupCompleteComponent} from "./signup-complete.component";

@NgModule({
  declarations: [SignupCompleteComponent],
  imports: [
    Shared3Module,
    ReactiveFormsModule,
  ]
})
export class SignupCompleteModule {
}
