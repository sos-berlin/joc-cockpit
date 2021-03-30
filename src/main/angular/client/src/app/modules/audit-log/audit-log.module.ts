import {NgModule} from '@angular/core';
import {AuditLogComponent, FilterModalComponent, SearchComponent} from './audit-log.component';
import {SharedModule} from '../shared/shared.module';
import {AuditLogRoutingModule} from './audit-log-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AuditLogRoutingModule
  ],
  declarations: [AuditLogComponent, FilterModalComponent, SearchComponent]
})
export class AuditLogModule {
}
