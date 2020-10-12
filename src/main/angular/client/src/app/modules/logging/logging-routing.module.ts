import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {Logging2Component, LoggingComponent} from './logging.component';

const routes: Routes = [
  {
    path: '',
    component: LoggingComponent
  },
  {
    path: 'client-logs',
    component: Logging2Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoggingRoutingModule {
}
