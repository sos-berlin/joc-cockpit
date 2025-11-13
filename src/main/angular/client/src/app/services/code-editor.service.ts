import { Injectable } from '@angular/core';

declare const CodeEditor: any;

@Injectable({ providedIn: 'root' })
export class CodeEditorService {
  isLoaded(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).CodeEditor !== 'undefined';
  }

  createEditor(element: HTMLElement, options: any): any {
    if (!this.isLoaded()) throw new Error('CodeEditor not loaded');
    return (window as any).CodeEditor(element, options);
  }

  fromTextArea(textarea: HTMLTextAreaElement, options: any): any {
    if (!this.isLoaded()) throw new Error('CodeEditor not loaded');
    return (window as any).CodeEditor.fromTextArea(textarea, options);
  }
}
