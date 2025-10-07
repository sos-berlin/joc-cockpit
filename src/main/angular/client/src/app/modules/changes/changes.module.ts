import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import { AddChangesModalComponent, ChangesComponent } from './changes.component';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

const routes: Routes = [
  {
    path: '',
    component: ChangesComponent
  }
];

@NgModule({
  declarations: [
    ChangesComponent,
    AddChangesModalComponent
  ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        NzTooltipDirective,
    ]
})

export class changesModule {
}
