import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConfigurationComponent} from './configuration.component';
import {XmlEditorComponent} from './xml-editor/xml-editor.component';
import {JoeComponent} from './joe/joe.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {path: 'designer', component: JoeComponent,  data: {breadcrumb: 'configuration.tab.designer'}},
      {path: 'yade', component: XmlEditorComponent,  data: {breadcrumb: 'configuration.tab.yade'}},
      {path: 'notification', component: XmlEditorComponent,  data: {breadcrumb: 'configuration.tab.notification'}},
      {path: 'others', component: XmlEditorComponent,  data: {breadcrumb: 'configuration.tab.others'}}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule {
}
