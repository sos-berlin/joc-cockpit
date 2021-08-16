import {NgModule} from '@angular/core';
import {ResourceSharedModule} from '../resource-shared.module';
import {BoardComponent, SingleBoardComponent} from './board.component';
import {BoardRoutingModule} from './board-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    BoardRoutingModule
  ],
  declarations: [BoardComponent, SingleBoardComponent]
})
export class BoardModule {
}
