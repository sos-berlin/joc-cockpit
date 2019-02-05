import {NgModule} from '@angular/core';
import {LayoutRoutingModule} from './layout-routing.module';
import {LayoutComponent} from './layout.component';
import {HeaderComponent} from '../../components/header/header.component';
import {SharedModule} from '../shared/shared.module';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';
import {LogModule} from '../log/log.module';

@NgModule({
  imports: [
    SharedModule,
    LayoutRoutingModule,
    LogModule
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
