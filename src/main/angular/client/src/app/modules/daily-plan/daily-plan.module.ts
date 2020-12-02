import {NgModule} from '@angular/core';
import {
  DailyPlanComponent,
  FilterModalComponent,
  RemovePlanModalComponent,
  SearchComponent,
  CreatePlanModalComponent,
  ScheduleTemplateModalComponent,
  GanttComponent,
  SelectOrderTemplatesComponent,
  ChangeParameterModalComponent,
  SubmitOrderModalComponent
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
  declarations: [DailyPlanComponent, GanttComponent, RemovePlanModalComponent, SubmitOrderModalComponent, FilterModalComponent,
    SearchComponent, DailyPlanRegexValidator, CreatePlanModalComponent, ChangeParameterModalComponent,
    ScheduleTemplateModalComponent, SelectOrderTemplatesComponent],
  entryComponents: [
    FilterModalComponent,
    RemovePlanModalComponent,
    SubmitOrderModalComponent,
    ScheduleTemplateModalComponent,
    CreatePlanModalComponent,
    ChangeParameterModalComponent
  ], providers: [GroupByPipe]
})
export class DailyPlanModule {
}
