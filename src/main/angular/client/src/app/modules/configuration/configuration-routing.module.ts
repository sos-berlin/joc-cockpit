import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConfigurationComponent} from './configuration.component';
import {XmlEditorComponent} from './xml-editor/xml-editor.component';
import {InventoryComponent} from './inventory/inventory.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {path: 'inventory', component: InventoryComponent,  data: {breadcrumb: 'configuration.tab.inventory'}},
      {path: 'yade', component: XmlEditorComponent,  data: {breadcrumb: 'configuration.tab.yade'}},
      {path: 'notification', component: XmlEditorComponent,  data: {breadcrumb: 'configuration.tab.notification'}},
      {path: 'other', component: XmlEditorComponent,  data: {breadcrumb: 'configuration.tab.others'}}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule {
}
