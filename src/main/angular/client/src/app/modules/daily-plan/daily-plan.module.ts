import {NgModule} from '@angular/core';
import {DailyPlanComponent, FilterModalComponent, SearchComponent} from './daily-plan.component';
import {SharedModule} from '../shared/shared.module';
import {DailyPlanRoutingModule} from './daily-plan-routing.module';
import {DailyPlanRegexValidator} from '../../directives/core.directive';

@NgModule({
  imports: [
    SharedModule,
    DailyPlanRoutingModule
  ],
  declarations: [DailyPlanComponent, FilterModalComponent, SearchComponent, DailyPlanRegexValidator],
  entryComponents: [
    FilterModalComponent
  ]
})
export class DailyPlanModule {
}
