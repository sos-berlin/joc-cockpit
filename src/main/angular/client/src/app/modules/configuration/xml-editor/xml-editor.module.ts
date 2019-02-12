import {NgModule} from '@angular/core';
import {FileUploadModule} from 'ng2-file-upload';
import {CKEditorModule} from 'ng2-ckeditor';
import {ImportModalComponent, ShowModalComponent,
  XmlEditorComponent, ShowChildModalComponent, ConfirmationModalComponent} from './xml-editor.component';
import {SharedModule} from '../../shared/shared.module';
import {XmlEditorRoutingModule} from './xml-editor-routing.module';

@NgModule({
  declarations: [
    XmlEditorComponent,
    ImportModalComponent,
    ShowModalComponent,
    ShowChildModalComponent,
    ConfirmationModalComponent
  ],
  imports: [
    SharedModule,
    XmlEditorRoutingModule,
    FileUploadModule,
    CKEditorModule
  ],
  entryComponents: [ImportModalComponent, ShowModalComponent, ShowChildModalComponent, ConfirmationModalComponent]
})
export class XmlEditorModule {
}
