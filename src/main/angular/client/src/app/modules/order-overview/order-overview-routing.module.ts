import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {OrderOverviewComponent, SingleOrderComponent} from './order-overview.component';

const routes: Routes = [
  {
    path: '', component: OrderOverviewComponent
  }, {
    path: 'order',
    component: SingleOrderComponent,
    data: {breadcrumb: 'breadcrumb.label.order'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderOverviewRoutingModule {
}
