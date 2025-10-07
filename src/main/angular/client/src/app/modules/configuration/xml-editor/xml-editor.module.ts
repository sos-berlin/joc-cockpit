import {NgModule} from '@angular/core';
import {XmlEditorRoutingModule} from './xml-editor-routing.module';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {SharedModule} from '../../shared/shared.module';
import {
  ConfirmationModalComponent,
  ShowChildModalComponent,
  ShowModalComponent,
  XmlEditorComponent
} from './xml-editor.component';
import {XMLAutofocusDirective} from '../../../directives/core.directive';
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";

const COMPONENTS = [ShowModalComponent, ShowChildModalComponent,
  ConfirmationModalComponent];

@NgModule({
    imports: [
        XmlEditorRoutingModule,
        SharedModule,
        CodemirrorModule,
        NzTabsModule,
        NzTooltipDirective
    ],
  declarations: [
    XmlEditorComponent,
    XMLAutofocusDirective,
    ...COMPONENTS
  ]
})
export class XmlEditorModule {
}

