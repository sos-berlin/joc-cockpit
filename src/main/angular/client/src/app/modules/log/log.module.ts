import {NgModule} from '@angular/core';
import {LogComponent} from './log.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NzToolTipModule} from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NzToolTipModule
  ],
  declarations: [LogComponent]
})
export class LogModule {
}
