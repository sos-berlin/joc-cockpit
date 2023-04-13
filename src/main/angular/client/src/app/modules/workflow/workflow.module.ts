import {NgModule} from '@angular/core';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {FilterModalComponent, SearchComponent, SingleWorkflowComponent, WorkflowComponent} from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';
import {AddOrderModalComponent, ShowDependencyComponent, WorkflowActionComponent} from './workflow-action/workflow-action.component';
import {WorkflowDetailComponent} from './workflow-detail/workflow-detail.component';
import {DependentWorkflowComponent, WorkflowGraphicalComponent} from './workflow-graphical/workflow-graphical.component';
import {WorkflowHistoryComponent, WorkflowTemplateComponent} from './workflow-history/workflow-history.component';
import {OrderListSidebarComponent} from './order-list-sidebar/order-list-sidebar.component';
import {TypeComponent} from './workflow-type/type.component';
import {ScriptModalComponent} from './script-modal/script-modal.component';
import {TooltipInfoComponent} from "./tooltip-info/tooltip-info.component";
import {NoticeBoardEditorComponent} from "../configuration/inventory/workflow/workflow.component";

@NgModule({
  imports: [
    SharedModule,
    CodemirrorModule,
    NzTabsModule,
    NzDrawerModule,
    WorkflowRoutingModule
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
    WorkflowActionComponent,
    OrderListSidebarComponent,
    ShowDependencyComponent,
    ScriptModalComponent,
    NoticeBoardEditorComponent,
    FilterModalComponent,
    TooltipInfoComponent,
    SearchComponent,
    TypeComponent
  ],
  exports: [
    OrderListSidebarComponent,
    TypeComponent
  ]
})
export class WorkflowModule {
}
