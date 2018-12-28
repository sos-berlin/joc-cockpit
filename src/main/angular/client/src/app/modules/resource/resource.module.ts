import {NgModule} from '@angular/core';
import {ResourceRoutingModule} from './resource-routing.module';
import {ResourceComponent} from './resource.component';
import {FileUploadModule} from 'ng2-file-upload';
import {SharedModule} from '../shared/shared.module';
import {CalendarComponent, CalendarModalComponent, FrequencyModalComponent, ShowModalComponent, ImportModalComponent} from './calendar/calendar.component';
import {AgentClusterComponent} from './agent-cluster/agent-cluster.component';
import {AgentJobExecutionComponent} from './agent-job-execution/agent-job-execution.component';
import {LockComponent} from './lock/lock.component';
import {ProcessClassComponent} from './process-class/process-class.component';
import {DatePipe} from '@angular/common';
import {CalendarService} from './calendar/calendar.service';

@NgModule({
  imports: [
    ResourceRoutingModule,
    SharedModule,
    FileUploadModule
  ],
  providers: [DatePipe, CalendarService],
  declarations: [
    ResourceComponent,
    CalendarComponent,
    AgentClusterComponent,
    AgentJobExecutionComponent,
    LockComponent,
    ProcessClassComponent,
    CalendarModalComponent,
    FrequencyModalComponent,
    ShowModalComponent,
    ImportModalComponent],
  entryComponents: [CalendarModalComponent, FrequencyModalComponent, ShowModalComponent, ImportModalComponent]
})
export class ResourceModule {
}
