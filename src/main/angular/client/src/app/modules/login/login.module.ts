import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {LoginRoutingModule} from './login-routing.module';
import {LoginComponent} from './login.component';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {Shared3Module} from '../shared/shared3.module';

@NgModule({
  imports: [
    Shared3Module,
    LoginRoutingModule,
    ReactiveFormsModule,
    NzCheckboxModule
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
