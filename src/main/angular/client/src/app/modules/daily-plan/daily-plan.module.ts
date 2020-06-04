import {NgModule} from '@angular/core';
import {
  DailyPlanComponent,
  FilterModalComponent,
  PlanModalComponent,
  SearchComponent,
  ChangeParameterModalComponent
} from './daily-plan.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import {SharedModule} from '../shared/shared.module';
import {DailyPlanRoutingModule} from './daily-plan-routing.module';
import {DailyPlanRegexValidator} from '../../directives/core.directive';
import {GroupByPipe} from '../../filters/filter.pipe';

@NgModule({
  imports: [
    SharedModule,
    FullCalendarModule,
    DailyPlanRoutingModule
  ],
  declarations: [DailyPlanComponent, PlanModalComponent, FilterModalComponent, SearchComponent, DailyPlanRegexValidator, ChangeParameterModalComponent],
  entryComponents: [
    FilterModalComponent,
    PlanModalComponent,
    ChangeParameterModalComponent
  ], providers: [GroupByPipe]
})
export class DailyPlanModule {
}
