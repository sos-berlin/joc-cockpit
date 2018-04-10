import { NgModule } from '@angular/core';
import { AuditLogComponent } from './audit-log.component';
import { SharedModule } from '../shared/shared.module';
import { TimeValidator } from '../../directives/core.directive';
import {ValidatorOneDirective} from "../../directives/validator.directive";


@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [AuditLogComponent, TimeValidator,ValidatorOneDirective]
})
export class AuditLogModule {
}
