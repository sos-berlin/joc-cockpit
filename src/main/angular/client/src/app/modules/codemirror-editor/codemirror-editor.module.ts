import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CodeEditorComponent} from "./codemirror-editor.component";

@NgModule({
  declarations: [CodeEditorComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [CodeEditorComponent]
})
export class CodeMirrorModule {}
