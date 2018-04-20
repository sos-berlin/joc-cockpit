import { NgModule } from '@angular/core';
import {DailyPlanComponent, FilterModal, SearchComponent} from './daily-plan.component';
import { SharedModule } from '../shared/shared.module';
import {DailyPlanRegexValidator} from "../../directives/core.directive";

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [DailyPlanComponent, FilterModal, SearchComponent, DailyPlanRegexValidator],
    entryComponents: [
        FilterModal
    ]
})
export class DailyPlanModule {
}
