import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzTreeModule} from 'ng-zorro-antd/tree';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {LogComponent} from './log.component';
import {LogRoutingModule} from './log-routing.module';
import {ResizableDirective} from "../../directives/core.directive";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    SharedModule,
    LogRoutingModule
  ],
  declarations: [LogComponent]
})
export class LogModule {
}
