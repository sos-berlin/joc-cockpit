import {NgModule} from '@angular/core';
import {ConfigurationComponent} from './configuration.component';
import {ConfigurationRoutingModule} from './configuration-routing.module';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent,
  DiffPatchModalComponent
} from './xml-editor/xml-editor.component';
import {FileUploadModule} from 'ng2-file-upload';
import {DatePipe} from '@angular/common';
import {
  InventoryComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent,
  ExportComponent, CreateFolderModalComponent, ImportWorkflowModalComponent, SingleDeployComponent
} from './inventory/inventory.component';
import {CalendarService} from '../../services/calendar.service';
import {SharedModule} from '../shared/shared.module';
import {WorkflowService} from '../../services/workflow.service';
import {CalendarComponent, FrequencyModalComponent} from './inventory/calendar/calendar.component';
import {OrderComponent, PeriodEditorComponent, RunTimeEditorComponent, AddRestrictionModalComponent} from './inventory/order/order.component';
import { LockComponent } from './inventory/lock/lock.component';
import {
  UpdateWorkflowComponent,
  ExpressionComponent,
  ImportComponent,
  JobComponent,
  WorkflowComponent
} from './inventory/workflow/workflow.component';
import { AgentClusterComponent } from './inventory/agent-cluster/agent-cluster.component';
import { JunctionComponent } from './inventory/junction/junction.component';
import { JobClassComponent } from './inventory/job-class/job-class.component';
import { XMLAutofocusDirective } from 'src/app/directives/core.directive';
import {TableComponent} from './inventory/table-data/table.component';

const COMPONENTS = [ImportModalComponent, DiffPatchModalComponent, FrequencyModalComponent, ShowModalComponent,
  ImportComponent, UpdateWorkflowComponent, ShowChildModalComponent, ConfirmationModalComponent, PeriodEditorComponent, SingleDeployComponent,
  RunTimeEditorComponent, AddRestrictionModalComponent, PreviewCalendarComponent, DeployComponent, SetVersionComponent, ExportComponent,
  CreateFolderModalComponent, ImportWorkflowModalComponent];

@NgModule({
  imports: [
    ConfigurationRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule,
    CodemirrorModule
  ],
  providers: [DatePipe, CalendarService, WorkflowService],
  declarations: [
    ConfigurationComponent,
    XmlEditorComponent,
    InventoryComponent,
    JobComponent,
    ExpressionComponent,
    CalendarComponent,
    OrderComponent,
    LockComponent,
    WorkflowComponent,
    AgentClusterComponent,
    JunctionComponent,
    JobClassComponent,
    XMLAutofocusDirective,
    TableComponent,
    ...COMPONENTS
  ],
  entryComponents: [...COMPONENTS]
})
export class ConfigurationModule {
}

