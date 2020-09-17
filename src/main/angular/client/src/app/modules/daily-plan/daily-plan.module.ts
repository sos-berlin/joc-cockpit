import {NgModule} from '@angular/core';
import {
  DailyPlanComponent,
  FilterModalComponent,
  PlanModalComponent,
  SearchComponent,
  ChangeParameterModalComponent, CreatePlanModalComponent, OrderTemplateModalComponent, GanttComponent, SelectOrderTemplatesComponent
} from './daily-plan.component';
import {SharedModule} from '../shared/shared.module';
import {DailyPlanRoutingModule} from './daily-plan-routing.module';
import {DailyPlanRegexValidator} from '../../directives/core.directive';
import {GroupByPipe} from '../../filters/filter.pipe';

@NgModule({
  imports: [
    SharedModule,
    DailyPlanRoutingModule
  ],
  declarations: [DailyPlanComponent, GanttComponent, PlanModalComponent, FilterModalComponent, SearchComponent,
    DailyPlanRegexValidator, ChangeParameterModalComponent, CreatePlanModalComponent, OrderTemplateModalComponent, SelectOrderTemplatesComponent],
  entryComponents: [
    FilterModalComponent,
    PlanModalComponent,
    ChangeParameterModalComponent,
    OrderTemplateModalComponent,
    CreatePlanModalComponent
  ], providers: [GroupByPipe]
})
export class DailyPlanModule {
}
