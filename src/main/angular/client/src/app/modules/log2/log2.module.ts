import {NgModule} from '@angular/core';
import {Log2Component} from './log2.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {Log2RoutingModule} from './log2-routing.module';
import {NzToolTipModule} from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    Log2RoutingModule,
    NzToolTipModule
  ],
  declarations: [Log2Component]
})
export class Log2Module {
}
