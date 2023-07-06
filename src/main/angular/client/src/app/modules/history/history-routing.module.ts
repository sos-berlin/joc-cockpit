import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HistoryComponent, SingleHistoryComponent} from './history.component';

const routes: Routes = [
  {
    path: '', component: HistoryComponent
  },
  {
    path: 'order', component: SingleHistoryComponent, data: {breadcrumb: 'breadcrumb.label.order'}
  },
  {
    path: 'task', component: SingleHistoryComponent, data: {breadcrumb: 'breadcrumb.label.task'}
  },
  {
    path: 'deployment', component: SingleHistoryComponent, data: {breadcrumb: 'breadcrumb.label.deployment'}
  },
  {
    path: 'daily_plan', component: SingleHistoryComponent, data: {breadcrumb: 'breadcrumb.label.dailyPlan'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryRoutingModule {
}
