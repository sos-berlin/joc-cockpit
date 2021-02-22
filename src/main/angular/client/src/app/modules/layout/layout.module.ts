import {NgModule} from '@angular/core';
import {LayoutRoutingModule} from './layout-routing.module';
import {LayoutComponent} from './layout.component';
import {HeaderComponent} from '../../components/header/header.component';
import {SaveService} from '../../services/save.service';
import {LogModule} from '../log/log.module';
import {DashboardModule} from '../dashboard/dashboard.module';
import {UserModule} from '../user/user.module';
import {Shared2Module} from '../shared/shared2.module';
import {ExcelService} from '../../services/excel.service';
import {SearchPipe} from '../../pipes/core.pipe';
import {LoggingModule} from '../logging/logging.module';

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
    HeaderComponent
  ],
  providers: [
    SaveService,
    SearchPipe,
    ExcelService
  ]
})
export class LayoutModule {
}
