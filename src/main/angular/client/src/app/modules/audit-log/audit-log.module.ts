import {NgModule} from '@angular/core';
import {AuditLogComponent, FilterModalComponent, SearchComponent} from './audit-log.component';
import {SharedModule} from '../shared/shared.module';
import {AuditLogRoutingModule} from './audit-log-routing.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
    imports: [
        SharedModule,
        AuditLogRoutingModule,
        NzTooltipDirective
    ],
  declarations: [AuditLogComponent, FilterModalComponent, SearchComponent]
})
export class AuditLogModule {
}
