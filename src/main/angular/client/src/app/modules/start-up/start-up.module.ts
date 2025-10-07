import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {StartUpRoutingModule} from './start-up-routing.module';
import {StartUpComponent} from './start-up.component';
import {SharedModule} from '../shared/shared.module';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

@NgModule({
    imports: [
        StartUpRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        NzTooltipDirective
    ],
  declarations: [
    StartUpComponent
  ]
})
export class StartUpModule {
}
