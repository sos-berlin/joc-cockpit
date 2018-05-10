import { NgModule } from '@angular/core';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from '../../components/header/header.component';
import { DashboardModule } from '../dashboard/dashboard.module';
import { DailyPlanModule } from '../daily-plan/daily-plan.module';
import { EditorModule } from '../editor/editor.module';
import { JobModule } from '../job/job.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { HistoryModule } from '../history/history.module';
import { FileTransferModule } from '../file-transfer/file-transfer.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ResourceModule } from '../resource/resource.module';
import { UserModule } from '../user/user.module';
import { AvatarModule } from 'ngx-avatar';
import { AdminModule } from '../admin/admin.module';
import { SharedModule } from '../shared/shared.module';
import { DataService } from '../../services/data.service';
import { SaveService } from '../../services/save.service';
import {ErrorModule} from "../error/error.module";

@NgModule({
    imports: [
        SharedModule,
        LayoutRoutingModule,
        DashboardModule,
        ErrorModule,
        DailyPlanModule,
        EditorModule,
        JobModule,
        WorkflowModule,
        HistoryModule,
        FileTransferModule,
        AuditLogModule,
        ResourceModule,
        UserModule,
        AdminModule,
        AvatarModule
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent
    ],
    providers:[
        DataService,
        SaveService
    ]
})
export class LayoutModule { }
