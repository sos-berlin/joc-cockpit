import {NgModule} from '@angular/core';
import {XmlEditorRoutingModule} from './xml-editor-routing.module';
import {NgxEditorModule} from 'ngx-editor';
import {FileUploadModule} from 'ng2-file-upload';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {SharedModule} from '../../shared/shared.module';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent
} from './xml-editor.component';
import {XMLAutofocusDirective} from '../../../directives/core.directive';

const COMPONENTS = [ImportModalComponent, ShowModalComponent,
  ShowChildModalComponent, ConfirmationModalComponent];

@NgModule({
  imports: [
    XmlEditorRoutingModule,
    SharedModule,
    CodemirrorModule,
    NzTabsModule,
    FileUploadModule,
    NgxEditorModule
  ],
  declarations: [
    XmlEditorComponent,
    XMLAutofocusDirective,
    ...COMPONENTS
  ]
})
export class XmlEditorModule {
}

