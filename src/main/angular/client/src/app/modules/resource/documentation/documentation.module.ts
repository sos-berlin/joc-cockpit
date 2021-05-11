import {NgModule} from '@angular/core';
import {FileUploadModule} from 'ng2-file-upload';
import {ResourceSharedModule} from '../resource-shared.module';
import {DocumentationComponent, ImportModalComponent, ShowModalComponent, SingleDocumentationComponent} from './documentation.component';
import {DocumentationRoutingModule} from './documentation-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ResourceSharedModule,
    DocumentationRoutingModule,
    FileUploadModule
  ],
  declarations: [DocumentationComponent, SingleDocumentationComponent, ImportModalComponent, ShowModalComponent]
})
export class DocumentationModule {
}
