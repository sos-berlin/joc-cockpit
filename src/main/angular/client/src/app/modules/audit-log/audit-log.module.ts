import { NgModule } from '@angular/core';
import { AuditLogComponent, FilterModal, SearchComponent } from './audit-log.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [AuditLogComponent, FilterModal, SearchComponent],
    entryComponents: [
        FilterModal
    ]
})
export class AuditLogModule {
}
