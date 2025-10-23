import {Component, HostListener, inject} from '@angular/core';
import { MarkdownParserService } from '../../services/markdown-parser.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {NZ_MODAL_DATA, NzModalComponent, NzModalRef} from "ng-zorro-antd/modal";

@Component({
  standalone: false,
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  noteContent: string = '';
  noteColor: string = '#ffff99';
  notePreview: SafeHtml = '';
  width = 300;
  height = 180;
  editorVisible = false;
  submitted = false;
  resizing = false;
  lastX = 0;
  lastY = 0;
  history: string[] = [];
  historyIndex = -1;
  isUndoRedo = false;
  isPreviewMode = false;

  constructor(private markdownParser: MarkdownParserService, private sanitizer: DomSanitizer, private activeModal: NzModalRef) {}

  ngOnInit() {
    if(this.modalData.width) this.width = this.modalData.width;
    if(this.modalData.height) this.height = this.modalData.height;
  }

  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    this.resizing = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    window.addEventListener('mousemove', this.onResizing);
    window.addEventListener('mouseup', this.onResizeEnd);
  }

  onResizing = (event: MouseEvent) => {
    if (!this.resizing) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.width = Math.max(300, this.width + dx);
    this.height = Math.max(200, this.height + dy);
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.updateModalSize();
  }

  onResizeEnd = () => {
    this.resizing = false;
    window.removeEventListener('mousemove', this.onResizing);
    window.removeEventListener('mouseup', this.onResizeEnd);
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
  }

  updateModalSize() {
    this.activeModal.updateConfig({
      nzStyle: {
        width: this.width + 'px',
        maxWidth: 'unset',
        height: this.height + 'px'
      }
    });

  }
  updatePreview() {
    if (!this.isUndoRedo) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(this.noteContent);
      this.historyIndex++;
    } else {
      this.isUndoRedo = false;
    }
    const rendered = this.markdownParser.render(this.noteContent) as any | SafeHtml;
    this.notePreview = this.sanitizer.bypassSecurityTrustHtml(rendered);
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.isUndoRedo = true;
      this.noteContent = this.history[this.historyIndex];
      this.updatePreview();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.isUndoRedo = true;
      this.noteContent = this.history[this.historyIndex];
      this.updatePreview();
    }
  }

  applyHeading(level: string) {
    const textarea = document.querySelector('textarea')!;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = this.noteContent.substring(start, end) || 'Heading Text';

    const lines = selected.split('\n').map(line => line.replace(/^#{1,6}\s*/, ''));
    const headingPrefix = `${'#'.repeat(parseInt(level[1]))} `;

    const newText = lines.map(line => headingPrefix + line).join('\n');

    const before = this.noteContent.substring(0, start);
    const after = this.noteContent.substring(end);

    this.noteContent = before + newText + after;
    this.updatePreview();

    setTimeout(() => {
      const pos = start + newText.length;
      (textarea as HTMLTextAreaElement).setSelectionRange(pos, pos);
      (textarea as HTMLTextAreaElement).focus();
    }, 0);
  }

  toggleBulletList() {
    const textarea = document.querySelector('textarea')!;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = this.noteContent.substring(start, end) || 'List item';

    const lines = selected.split('\n');
    const allBulleted = lines.every(line => /^\s*[-*+]\s/.test(line));

    let newText: string;
    if (allBulleted) {
      newText = lines.map(line => line.replace(/^\s*[-*+]\s/, '')).join('\n');
    } else {
      newText = lines.map(line => `- ${line}`).join('\n');
    }

    const before = this.noteContent.substring(0, start);
    const after = this.noteContent.substring(end);

    this.noteContent = before + newText + after;
    this.updatePreview();

    setTimeout(() => {
      const pos = start + newText.length;
      (textarea as HTMLTextAreaElement).setSelectionRange(pos, pos);
      (textarea as HTMLTextAreaElement).focus();
    }, 0);
  }

  toggleBold() {
    this.wrapSelection('**');
  }

  toggleItalic() {
    this.wrapSelection('*');
  }

  wrapSelection(wrapper: string) {
    const textarea = document.querySelector('textarea')!;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const before = this.noteContent.substring(0, start);
    const selected = this.noteContent.substring(start, end);
    const after = this.noteContent.substring(end);

    const wrapped = wrapper + selected + wrapper;
    this.noteContent = before + wrapped + after;
    this.updatePreview();

    setTimeout(() => {
      const pos = start + wrapper.length + selected.length + wrapper.length;
      (textarea as HTMLTextAreaElement).setSelectionRange(pos, pos);
      (textarea as HTMLTextAreaElement).focus();
    }, 0);
  }

  onResize(event: { width: number; height: number }) {
    this.width = event.width;
    this.height = event.height;
  }

  removeNote() {
    this.noteContent = '';
    this.updatePreview();
  }

  openEditor() {
    this.editorVisible = true;
    setTimeout(() => {
      const modalTextarea = document.querySelector('nz-modal textarea');
      if (modalTextarea) (modalTextarea as HTMLElement).focus();
    });
  }

  closeEditor() {
    this.editorVisible = false;
  }

  saveNote() {
    this.editorVisible = false;
    this.updatePreview();
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

    // Bold: Ctrl/Cmd + B
    if (ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.toggleBold();
      return;
    }

    // Italic: Ctrl/Cmd + I
    if (ctrlKey && event.key === 'i') {
      event.preventDefault();
      this.toggleItalic();
      return;
    }

    // Undo: Ctrl/Cmd + Z (without Shift)
    if (ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
      return;
    }

    // Redo: Ctrl/Cmd + Shift + Z or Ctrl + Y
    if ((ctrlKey && event.shiftKey && event.key === 'z') || (ctrlKey && event.key === 'y')) {
      event.preventDefault();
      this.redo();
      return;
    }

    // Bullet List: Ctrl/Cmd + Shift + 8 or Ctrl/Cmd + L
    if ((ctrlKey && event.shiftKey && event.key === '8') || (ctrlKey && event.key === 'l')) {
      event.preventDefault();
      this.toggleBulletList();
      return;
    }

    // Headings: Ctrl/Cmd + Alt + 1-6
    if (ctrlKey && event.altKey && ['1', '2', '3', '4', '5', '6'].includes(event.key)) {
      event.preventDefault();
      this.applyHeading(`h${event.key}`);
      return;
    }
  }
}
