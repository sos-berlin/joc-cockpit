import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SignupCompleteComponent} from "./signup-complete.component";

const routes: Routes = [
  {path: '', component: SignupCompleteComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupCompleteRoutingModule {
}
