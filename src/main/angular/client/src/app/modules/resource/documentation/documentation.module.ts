import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {DocumentationComponent, ImportModalComponent} from './documentation.component';
import {DocumentationRoutingModule} from './documentation-routing.module';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  imports: [
    SharedModule,
    DocumentationRoutingModule,
    FileUploadModule
  ],
  declarations: [DocumentationComponent, ImportModalComponent],
  entryComponents: [ImportModalComponent]
})
export class DocumentationModule {
}
