import { NgModule } from '@angular/core';
import { ErrorComponent } from './error.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [ErrorComponent]
})
export class ErrorModule {
}
