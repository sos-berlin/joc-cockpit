import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './error.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [PageNotFoundComponent]
})
export class ErrorModule {
}
