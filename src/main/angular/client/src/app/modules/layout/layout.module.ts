import {NgModule} from '@angular/core';
import {LayoutRoutingModule} from './layout-routing.module';
import {LayoutComponent} from './layout.component';
import {HeaderComponent} from '../../components/header/header.component';
import {LogModule} from '../log/log.module';
import {LoggingModule} from '../logging/logging.module';
import {DashboardModule} from '../dashboard/dashboard.module';
import {UserModule} from '../user/user.module';
import {Shared2Module} from '../shared/shared2.module';
import {SaveService} from '../../services/save.service';
import {ExcelService} from '../../services/excel.service';
import {WorkflowService} from "../../services/workflow.service";
import {OrderPipe, SearchPipe} from '../../pipes/core.pipe';
import {ChangePasswordComponent} from "../../components/change-password/change-password.component";
import {LogViewComponent} from "../../components/log-view/log-view.component";

@NgModule({
  imports: [
    Shared2Module,
    LayoutRoutingModule,
    LogModule,
    LoggingModule,
    DashboardModule,
    UserModule
  ],
  declarations: [
    LayoutComponent,
    ChangePasswordComponent,
    LogViewComponent,
    HeaderComponent
  ],
  providers: [
    SaveService,
    WorkflowService,
    ExcelService,
    SearchPipe,
    OrderPipe
  ]
})
export class LayoutModule {
}
