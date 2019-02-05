import {NgModule} from '@angular/core';
import {Log2Component} from './log2.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {Log2RoutingModule} from './log2-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    Log2RoutingModule
  ],
  declarations: [Log2Component]
})
export class Log2Module {
}
