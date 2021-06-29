import {NgModule} from '@angular/core';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {SearchComponent, SingleWorkflowComponent, WorkflowComponent} from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';
import {WorkflowService} from '../../services/workflow.service';
import {AddOrderModalComponent, WorkflowActionComponent} from './workflow-action/workflow-action.component';
import {WorkflowDetailComponent} from './workflow-detail/workflow-detail.component';
import {WorkflowHistoryComponent, WorkflowTemplateComponent} from './workflow-history/workflow-history.component';
import {OrderListSidebarComponent} from './order-list-sidebar/order-list-sidebar.component';
import {TypeComponent} from './workflow-type/type.component';
import {ScriptModalComponent} from './script-modal/script-modal.component';

@NgModule({
  imports: [
    SharedModule,
    CodemirrorModule,
    NzTabsModule,
    NzDrawerModule,
    WorkflowRoutingModule
  ],
  providers: [WorkflowService],
  declarations: [
    WorkflowComponent,
    WorkflowDetailComponent,
    WorkflowHistoryComponent,
    WorkflowTemplateComponent,
    SingleWorkflowComponent,
    AddOrderModalComponent,
    SearchComponent,
    WorkflowActionComponent,
    OrderListSidebarComponent,
    ScriptModalComponent,
    TypeComponent
  ],
  exports: [
    OrderListSidebarComponent,
    TypeComponent
  ]
})
export class WorkflowModule {
}
