import {NgModule} from '@angular/core';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {BulkAddOrderComponent, FilterModalComponent, SearchComponent, SingleWorkflowComponent, WorkflowComponent} from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';
import {
  AddOrderModalComponent,
  AddSchedulesModalComponent,
  ShowDependencyComponent,
  WorkflowActionComponent
} from './workflow-action/workflow-action.component';
import {WorkflowDetailComponent} from './workflow-detail/workflow-detail.component';
import {
  DependentWorkflowComponent,
  WorkflowGraphicalComponent
} from './workflow-graphical/workflow-graphical.component';
import {WorkflowHistoryComponent, WorkflowTemplateComponent} from './workflow-history/workflow-history.component';
import {OrderListSidebarComponent} from './order-list-sidebar/order-list-sidebar.component';
import {TypeComponent} from './workflow-type/type.component';
import {ScriptModalComponent} from './script-modal/script-modal.component';
import {TooltipInfoComponent} from "./tooltip-info/tooltip-info.component";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzSpaceCompactComponent} from "ng-zorro-antd/space";
import {JobProgressBarComponent} from '../../components/job-progress-bar/job-progress-bar.component';
import { OrderProgressBarComponent } from 'src/app/components/order-progress-bar/order-progress-bar.component';

@NgModule({
    imports: [
        SharedModule,
        NzTabsModule,
        NzDrawerModule,
        WorkflowRoutingModule,
        NzTooltipDirective,
        NzSpaceCompactComponent
    ],
  declarations: [
    WorkflowComponent,
    WorkflowDetailComponent,
    WorkflowGraphicalComponent,
    DependentWorkflowComponent,
    WorkflowHistoryComponent,
    WorkflowTemplateComponent,
    SingleWorkflowComponent,
    AddOrderModalComponent,
    AddSchedulesModalComponent,
    WorkflowActionComponent,
    OrderListSidebarComponent,
    ShowDependencyComponent,
    ScriptModalComponent,
    FilterModalComponent,
    TooltipInfoComponent,
    SearchComponent,
    TypeComponent,
    BulkAddOrderComponent,
    JobProgressBarComponent,
    OrderProgressBarComponent
  ],
  exports: [
    OrderListSidebarComponent,
    TypeComponent,
    JobProgressBarComponent,
    OrderProgressBarComponent
  ]
})
export class WorkflowModule {
}
