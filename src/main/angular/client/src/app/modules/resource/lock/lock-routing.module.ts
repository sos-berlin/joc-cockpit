import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LockComponent, SingleLockComponent} from './lock.component';

const routes: Routes = [
  {
    path: '', component: LockComponent
  }, {
    path: 'lock',
    component: SingleLockComponent,
    data: {breadcrumb: 'breadcrumb.label.lock'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LockRoutingModule {
}
