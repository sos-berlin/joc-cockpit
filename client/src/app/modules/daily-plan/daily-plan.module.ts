import { NgModule } from '@angular/core';
import { DailyPlanComponent, FilterModal } from './daily-plan.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [DailyPlanComponent, FilterModal],
    entryComponents: [
        FilterModal
    ]
})
export class DailyPlanModule {
}
