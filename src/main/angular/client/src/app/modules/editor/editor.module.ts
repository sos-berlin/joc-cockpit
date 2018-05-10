import { NgModule } from '@angular/core';
import { EditorComponent } from './editor.component';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
      SharedModule
  ],
  declarations: [EditorComponent]
})
export class EditorModule { }
