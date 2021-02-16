import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {OrderOverviewComponent} from './order-overview.component';

const routes: Routes = [
  {
    path: '', component: OrderOverviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderOverviewRoutingModule {
}
