import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DocumentationComponent, SingleDocumentationComponent} from './documentation.component';

const routes: Routes = [
  {
    path: '', component: DocumentationComponent
  }, {
    path: 'document',
    component: SingleDocumentationComponent,
    data: {breadcrumb: 'breadcrumb.label.documentation'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentationRoutingModule {
}
