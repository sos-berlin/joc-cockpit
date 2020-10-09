import {NgModule} from '@angular/core';
import {LayoutRoutingModule} from './layout-routing.module';
import {LayoutComponent} from './layout.component';
import {HeaderComponent} from '../../components/header/header.component';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';
import {LogModule} from '../log/log.module';
import {DashboardModule} from '../dashboard/dashboard.module';
import {UserModule} from '../user/user.module';
import {ErrorComponent} from '../error/error.component';
import {Shared2Module} from '../shared/shared2.module';
import {ExcelService} from '../../services/excel.service';
import {SearchPipe} from '../../filters/filter.pipe';

@NgModule({
  imports: [
    Shared2Module,
    LayoutRoutingModule,
    LogModule,
    DashboardModule,
    UserModule
  ],
  declarations: [
    LayoutComponent,
    HeaderComponent,
    ErrorComponent
  ],
  providers: [
    DataService,
    SaveService,
    SearchPipe,
    ExcelService
  ]
})
export class LayoutModule {
}
