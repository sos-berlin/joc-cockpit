import {NgModule} from '@angular/core';
import {XmlEditorRoutingModule} from './xml-editor-routing.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {FileUploadModule} from 'ng2-file-upload';
import {SharedModule} from '../../shared/shared.module';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent
} from './xml-editor.component';

import { XMLAutofocusDirective } from 'src/app/directives/core.directive';

const COMPONENTS = [ImportModalComponent, ShowModalComponent,
  ShowChildModalComponent, ConfirmationModalComponent];

@NgModule({
  imports: [
    XmlEditorRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule
  ],
  declarations: [
    XmlEditorComponent,
    XMLAutofocusDirective,
    ...COMPONENTS
  ]
})
export class XmlEditorModule {
}

