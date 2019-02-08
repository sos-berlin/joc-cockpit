import {NgModule} from '@angular/core';
import {XmlEditorComponent} from './xml-editor.component';
import {SharedModule} from '../../shared/shared.module';
import {XmlEditorRoutingModule} from './xml-editor-routing.module';
import {FileUploadModule} from 'ng2-file-upload';
import {CKEditorModule} from 'ng2-ckeditor';

@NgModule({
  declarations: [
    XmlEditorComponent
  ],
  imports: [
    SharedModule,
    XmlEditorRoutingModule,
    FileUploadModule,
    CKEditorModule
  ]
})
export class XmlEditorModule {
}
