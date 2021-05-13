import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HistoryComponent, SingleHistoryComponent} from './history.component';

const routes: Routes = [
  {
    path: '', component: HistoryComponent
  },
  {
    path: 'order', component: SingleHistoryComponent,  data: {breadcrumb: 'breadcrumb.label.order'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryRoutingModule {
}
