import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DailyPlanComponent} from './daily-plan.component';

const routes: Routes = [
  {
    path: '',
    component: DailyPlanComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyPlanRoutingModule {
}
