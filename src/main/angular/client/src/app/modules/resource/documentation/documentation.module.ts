import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {DocumentationComponent} from './documentation.component';
import {DocumentationRoutingModule} from './documentation-routing.module';
import {SubLinkComponent} from '../sub-link/sub-link.component';

@NgModule({
  imports: [
    SharedModule,
    DocumentationRoutingModule
  ],
  declarations: [DocumentationComponent]
})
export class DocumentationModule {
}
