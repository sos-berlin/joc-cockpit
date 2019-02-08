import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConfigurationComponent} from './configuration.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {path: 'joe', loadChildren: './joe/joe.module#JoeModule'},
      {path: 'xml', loadChildren: './xml-editor/xml-editor.module#XmlEditorModule'},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule {
}
