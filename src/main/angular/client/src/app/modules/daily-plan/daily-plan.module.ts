import {NgModule} from '@angular/core';
import {NzTabsModule} from "ng-zorro-antd/tabs";
import {
  DailyPlanComponent,
  FilterModalComponent,
  RemovePlanModalComponent,
  SearchComponent,
  CreatePlanModalComponent,
  GanttComponent
} from './daily-plan.component';
import {SharedModule} from '../shared/shared.module';
import {DailyPlanRoutingModule} from './daily-plan-routing.module';
import {DailyPlanRegexValidator} from '../../directives/core.directive';
import {ProjectionComponent, ShowProjectionModalComponent} from "./projection/projection.component";
import {GroupByPipe} from '../../pipes/core.pipe';

@NgModule({
  imports: [
    SharedModule,
    DailyPlanRoutingModule,
    NzTabsModule
  ],
  declarations: [DailyPlanComponent, GanttComponent, ProjectionComponent, RemovePlanModalComponent, FilterModalComponent,
    SearchComponent, DailyPlanRegexValidator, CreatePlanModalComponent, ShowProjectionModalComponent],
  providers: [GroupByPipe]
})
export class DailyPlanModule {
}
