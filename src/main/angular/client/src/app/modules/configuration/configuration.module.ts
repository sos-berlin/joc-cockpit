import {NgModule} from '@angular/core';
import {ConfigurationComponent} from './configuration.component';
import {ConfigurationRoutingModule} from './configuration-routing.module';
import {
  ConfirmationModalComponent,
  ImportModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent
} from './xml-editor/xml-editor.component';
import {SharedModule} from '../shared/shared.module';
import {FileUploadModule} from 'ng2-file-upload';
import {CKEditorModule} from 'ng2-ckeditor';
import {
  JoeComponent,
  LockTemplateComponent,
  OrderTemplateComponent,
  ProcessClassTemplateComponent,
  WorkFlowTemplateComponent
} from './joe/joe.component';

@NgModule({
  imports: [
    ConfigurationRoutingModule,
    SharedModule,
    FileUploadModule,
    CKEditorModule
  ],
  declarations: [
    ConfigurationComponent,
    XmlEditorComponent,
    JoeComponent,
    ImportModalComponent,
    ShowModalComponent,
    ShowChildModalComponent,
    ConfirmationModalComponent,
    WorkFlowTemplateComponent,
    OrderTemplateComponent,
    ProcessClassTemplateComponent,
    LockTemplateComponent
  ],
  entryComponents: [ImportModalComponent, ShowModalComponent, ShowChildModalComponent, ConfirmationModalComponent]
})
export class ConfigurationModule {
}

