import {NgModule} from '@angular/core';
import {LayoutRoutingModule} from './layout-routing.module';
import {LayoutComponent} from './layout.component';
import {HeaderComponent} from '../../components/header/header.component';
import {SharedModule} from '../shared/shared.module';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';
import {LogModule} from '../log/log.module';
import {DashboardModule} from '../dashboard/dashboard.module';
import {UserModule} from '../user/user.module';
import {ErrorModule} from '../error/error.module';

@NgModule({
  imports: [
    SharedModule,
    LayoutRoutingModule,
    LogModule,
    DashboardModule,
    UserModule,
    ErrorModule
  ],
  declarations: [
    LayoutComponent,
    HeaderComponent
  ],
  providers: [
    DataService,
    SaveService
  ]
})
export class LayoutModule {
}
