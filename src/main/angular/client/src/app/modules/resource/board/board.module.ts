import {NgModule} from '@angular/core';
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {ResourceSharedModule} from '../resource-shared.module';
import {BoardComponent, PostModalComponent, SingleBoardComponent} from './board.component';
import {BoardRoutingModule} from './board-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    BoardRoutingModule,
    NzDrawerModule
  ],
  declarations: [BoardComponent, SingleBoardComponent, PostModalComponent]
})
export class BoardModule {
}
