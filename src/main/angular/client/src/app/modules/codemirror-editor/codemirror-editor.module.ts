import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CodeMirrorEditorComponent} from "./codemirror-editor.component";

@NgModule({
  declarations: [CodeMirrorEditorComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [CodeMirrorEditorComponent]
})
export class CodeMirrorModule {}
