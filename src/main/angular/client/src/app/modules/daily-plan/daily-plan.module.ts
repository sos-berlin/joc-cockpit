import {NgModule} from '@angular/core';
import {
  DailyPlanComponent,
  FilterModalComponent,
  RemovePlanModalComponent,
  SearchComponent,
  CreatePlanModalComponent,
  OrderTemplateModalComponent,
  GanttComponent,
  SelectOrderTemplatesComponent,
  ChangeParameterModalComponent,
  SubmitOrderModalComponent
} from './daily-plan.component';
import {SharedModule} from '../shared/shared.module';
import {DailyPlanRoutingModule} from './daily-plan-routing.module';
import {DailyPlanRegexValidator} from '../../directives/core.directive';
import {GroupByPipe, SearchPipe} from '../../filters/filter.pipe';

@NgModule({
  imports: [
    SharedModule,
    DailyPlanRoutingModule
  ],
  declarations: [DailyPlanComponent, GanttComponent, RemovePlanModalComponent, SubmitOrderModalComponent, FilterModalComponent,
    SearchComponent, DailyPlanRegexValidator, CreatePlanModalComponent, ChangeParameterModalComponent,
    OrderTemplateModalComponent, SelectOrderTemplatesComponent],
  entryComponents: [
    FilterModalComponent,
    RemovePlanModalComponent,
    SubmitOrderModalComponent,
    OrderTemplateModalComponent,
    CreatePlanModalComponent,
    ChangeParameterModalComponent
  ], providers: [GroupByPipe, SearchPipe]
})
export class DailyPlanModule {
}
