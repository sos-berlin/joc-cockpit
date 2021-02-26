import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {XmlEditorComponent} from './xml-editor.component';

const routes: Routes = [
  {
    path: '',
    component: XmlEditorComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class XmlEditorRoutingModule {
}
