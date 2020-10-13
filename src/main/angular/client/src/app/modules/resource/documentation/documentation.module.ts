import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {DocumentationComponent, ImportModalComponent, ShowModalComponent, SingleDocumentationComponent} from './documentation.component';
import {DocumentationRoutingModule} from './documentation-routing.module';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  imports: [
    SharedModule,
    DocumentationRoutingModule,
    FileUploadModule
  ],
  declarations: [DocumentationComponent, SingleDocumentationComponent, ImportModalComponent, ShowModalComponent],
  entryComponents: [ImportModalComponent, ShowModalComponent]
})
export class DocumentationModule {
}
