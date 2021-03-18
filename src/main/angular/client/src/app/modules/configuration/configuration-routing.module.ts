import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConfigurationComponent} from './configuration.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {
        path: 'inventory',
        loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule),
        data: {breadcrumb: 'configuration.tab.inventory'}
      },
      {
        path: 'file_transfer',
        loadChildren: () => import('./xml-editor/xml-editor.module').then(m => m.XmlEditorModule),
        data: {breadcrumb: 'configuration.tab.fileTransfer'}
      },
      {
        path: 'notification',
        loadChildren: () => import('./xml-editor/xml-editor.module').then(m => m.XmlEditorModule),
        data: {breadcrumb: 'configuration.tab.notification'}
      },
      {
        path: 'other',
        loadChildren: () => import('./xml-editor/xml-editor.module').then(m => m.XmlEditorModule),
        data: {breadcrumb: 'configuration.tab.other'}
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule {
}
