import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CalendarComponent, SingleCalendarComponent} from './calendar.component';

const routes: Routes = [
  {
    path: '', component: CalendarComponent
  },
  {
    path: 'calendar',
    component: SingleCalendarComponent,
    data: {breadcrumb: 'breadcrumb.label.calendar'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule {
}
