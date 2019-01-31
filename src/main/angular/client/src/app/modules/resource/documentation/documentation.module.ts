import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {DocumentationComponent, ImportModalComponent, ShowModalComponent} from './documentation.component';
import {DocumentationRoutingModule} from './documentation-routing.module';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  imports: [
    SharedModule,
    DocumentationRoutingModule,
    FileUploadModule
  ],
  declarations: [DocumentationComponent, ImportModalComponent, ShowModalComponent],
  entryComponents: [ImportModalComponent, ShowModalComponent]
})
export class DocumentationModule {
}
