import {NgModule} from '@angular/core';
import {ResourceSharedModule} from '../resource-shared.module';
import {
  DocumentationComponent,
  EditModalComponent,
  ShowModalComponent,
  SingleDocumentationComponent
} from './documentation.component';
import {DocumentationRoutingModule} from './documentation-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    DocumentationRoutingModule
  ],
  declarations: [DocumentationComponent, SingleDocumentationComponent, EditModalComponent, ShowModalComponent]
})
export class DocumentationModule {
}
