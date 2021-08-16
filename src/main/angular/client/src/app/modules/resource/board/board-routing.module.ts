import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {BoardComponent, SingleBoardComponent} from './board.component';

const routes: Routes = [
  {
    path: '', component: BoardComponent
  }, {
    path: 'board',
    component: SingleBoardComponent,
    data: {breadcrumb: 'breadcrumb.label.board'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule {
}
