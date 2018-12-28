import {NgModule} from '@angular/core';
import {LayoutRoutingModule} from './layout-routing.module';
import {LayoutComponent} from './layout.component';
import {HeaderComponent} from '../../components/header/header.component';
import {SharedModule} from '../shared/shared.module';
import {DataService} from '../../services/data.service';
import {SaveService} from '../../services/save.service';

@NgModule({
  imports: [
    SharedModule,
    LayoutRoutingModule
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
