import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {LogComponent} from './log.component';
import {LogRoutingModule} from './log-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    LogRoutingModule,
    NzToolTipModule,
    NzCheckboxModule
  ],
  declarations: [LogComponent]
})
export class LogModule {
}
