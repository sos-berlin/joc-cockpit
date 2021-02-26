import {NgModule} from '@angular/core';
import {XmlEditorRoutingModule} from './xml-editor-routing.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {FileUploadModule} from 'ng2-file-upload';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {SharedModule} from '../../shared/shared.module';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent,
  DiffPatchModalComponent
} from './xml-editor.component';

import { XMLAutofocusDirective } from 'src/app/directives/core.directive';

const COMPONENTS = [ImportModalComponent, DiffPatchModalComponent, ShowModalComponent,
  ShowChildModalComponent, ConfirmationModalComponent];

@NgModule({
  imports: [
    XmlEditorRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule,
    CodemirrorModule
  ],
  declarations: [
    XmlEditorComponent,
    XMLAutofocusDirective,
    ...COMPONENTS
  ],
  entryComponents: [...COMPONENTS]
})
export class XmlEditorModule {
}

