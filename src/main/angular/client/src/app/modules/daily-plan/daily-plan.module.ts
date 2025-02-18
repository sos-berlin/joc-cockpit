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
import {ExportComponent, ProjectionComponent, ShowProjectionModalComponent} from "./projection/projection.component";
import {GroupByPipe} from '../../pipes/core.pipe';
import {DependenciesComponent, ShowDailyPlanDependenciesComponent} from "./dependencies/dependencies.component";
import {NzDrawerComponent} from "ng-zorro-antd/drawer";
import {NzDrawerModule} from "ng-zorro-antd/drawer";

@NgModule({
  imports: [
    SharedModule,
    DailyPlanRoutingModule,
    NzTabsModule,
    NzDrawerComponent,
    NzDrawerModule
  ],
  declarations: [DailyPlanComponent, GanttComponent, ProjectionComponent, DependenciesComponent, RemovePlanModalComponent, FilterModalComponent,
    SearchComponent, DailyPlanRegexValidator, CreatePlanModalComponent, ShowProjectionModalComponent, ExportComponent, ShowDailyPlanDependenciesComponent],
  providers: [GroupByPipe]
})
export class DailyPlanModule {
}
