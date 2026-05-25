import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {SystemLogPageComponent} from './system-log-page.component';

const routes: Routes = [
  {path: '', component: SystemLogPageComponent}
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SystemLogPageComponent]
})
export class SystemLogModule {
}
