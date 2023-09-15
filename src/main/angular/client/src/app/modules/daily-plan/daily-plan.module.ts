import {NgModule} from '@angular/core';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzSwitchModule} from "ng-zorro-antd/switch";
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
import {ProjectionComponent} from "./projection/projection.component";
import {GroupByPipe} from '../../pipes/core.pipe';

@NgModule({
  imports: [
    SharedModule,
    DailyPlanRoutingModule,
    NzDrawerModule,
    NzSwitchModule
  ],
  declarations: [DailyPlanComponent, GanttComponent, ProjectionComponent, RemovePlanModalComponent, FilterModalComponent,
    SearchComponent, DailyPlanRegexValidator, CreatePlanModalComponent],
  providers: [GroupByPipe]
})
export class DailyPlanModule {
}
