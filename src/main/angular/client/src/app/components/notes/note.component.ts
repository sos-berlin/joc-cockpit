import {Component, HostListener, inject} from '@angular/core';
import { MarkdownParserService } from '../../services/markdown-parser.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";

interface Post {
  postId: string;
  content: string;
  author: {
    userId: string;
    displayName: string;
  };
  postedAt: Date;
  isEdited: boolean;
  color: string;
}

interface ColorPreset {
  value: string;
  label: string;
  importance: 'critical' | 'high' | 'normal' | 'low' | 'info';
}

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
  width = 800;
  height = 600;
  editorVisible = false;
  submitted = false;
  resizing = false;
  lastX = 0;
  lastY = 0;
  history: string[] = [];
  historyIndex = -1;
  isUndoRedo = false;
  isPreviewMode = false;

  colorPresets: ColorPreset[] = [
    {
      value: '#ff4d4f',
      label: 'inventory.notes.color.critical',
      importance: 'critical'
    },
    {
      value: '#ff9800',
      label: 'inventory.notes.color.high',
      importance: 'high'
    },
    {
      value: '#fadb14',
      label: 'inventory.notes.color.normal',
      importance: 'normal'
    },
    {
      value: '#52c41a',
      label: 'inventory.notes.color.low',
      importance: 'low'
    },
    {
      value: '#1890ff',
      label: 'inventory.notes.color.info',
      importance: 'info'
    }
  ];

  posts: Post[] = [
    {
      postId: 'post_001',
      content: '**Important**: This workflow requires manual approval on holidays.\n\n- Check holiday calendar\n- Verify dependencies',
      author: {
        userId: 'user_001',
        displayName: 'John Doe'
      },
      postedAt: new Date('2025-10-24T10:30:00'),
      isEdited: false,
      color: '#ff4d4f'
    },
    {
      postId: 'post_002',
      content: '@john.doe Confirmed. I\'ve added the holiday calendar integration.',
      author: {
        userId: 'user_002',
        displayName: 'Jane Smith'
      },
      postedAt: new Date('2025-10-24T12:15:00'),
      isEdited: false,
      color: '#52c41a'
    },
    {
      postId: 'post_003',
      content: 'Question: Should we also document this in the workflow description?',
      author: {
        userId: 'user_003',
        displayName: 'Mike Johnson'
      },
      postedAt: new Date('2025-10-24T14:20:00'),
      isEdited: false,
      color: '#1890ff'
    },
    {
      postId: 'post_004',
      content: 'Good idea @mike.johnson - I\'ve updated the description with a link to our holiday policy.',
      author: {
        userId: 'user_004',
        displayName: 'Current User'
      },
      postedAt: new Date('2025-10-24T16:45:00'),
      isEdited: true,
      color: '#fadb14'
    }
  ];

  currentUser = {
    userId: 'user_004',
    displayName: 'Current User'
  };

  constructor(
    private markdownParser: MarkdownParserService,
    private sanitizer: DomSanitizer,
    private activeModal: NzModalRef
  ) {}

  ngOnInit() {
    if(this.modalData.width) this.width = this.modalData.width;
    if(this.modalData.height) this.height = this.modalData.height;

    this.noteColor = this.colorPresets[2].value;
  }

  selectColor(color: string) {
    this.noteColor = color;
  }

  isCurrentUser(post: Post): boolean {
    return post.author.userId === this.currentUser.userId;
  }

  getMessageBackgroundColor(post: Post): string {
    const baseColor = post.color || this.noteColor;

    if (this.isCurrentUser(post)) {
      return this.lightenColor(baseColor, 0.85);
    } else {
      return this.lightenColor(baseColor, 0.80);
    }
  }

  lightenColor(color: string, amount: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));

    return this.rgbToHex(r, g, b);
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  addPost() {
    if (!this.noteContent.trim()) return;

    this.submitted = true;

    setTimeout(() => {
      const newPost: Post = {
        postId: `post_${Date.now()}`,
        content: this.noteContent,
        author: {
          userId: this.currentUser.userId,
          displayName: this.currentUser.displayName
        },
        postedAt: new Date(),
        isEdited: false,
        color: this.noteColor
      };

      this.posts.push(newPost);
      this.noteContent = '';
      this.submitted = false;
      this.updatePreview();

      setTimeout(() => {
        const chatThread = document.querySelector('.chat-thread');
        if (chatThread) {
          chatThread.scrollTop = chatThread.scrollHeight;
        }
      }, 100);
    }, 500);
  }

  renderMarkdown(content: string): SafeHtml {
    const rendered = this.markdownParser.render(content) as any;
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
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
    this.width = Math.max(400, this.width + dx);
    this.height = Math.max(300, this.height + dy);
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
    const textarea = document.querySelector('.new-post-section textarea') as HTMLTextAreaElement;
    if (!textarea) return;

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
      textarea.setSelectionRange(pos, pos);
      textarea.focus();
    }, 0);
  }

  toggleBulletList() {
    const textarea = document.querySelector('.new-post-section textarea') as HTMLTextAreaElement;
    if (!textarea) return;

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
      textarea.setSelectionRange(pos, pos);
      textarea.focus();
    }, 0);
  }

  toggleBold() {
    this.wrapSelection('**');
  }

  toggleItalic() {
    this.wrapSelection('*');
  }

  wrapSelection(wrapper: string) {
    const textarea = document.querySelector('.new-post-section textarea') as HTMLTextAreaElement;
    if (!textarea) return;

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
      textarea.setSelectionRange(pos, pos);
      textarea.focus();
    }, 0);
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

    if (ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.toggleBold();
      return;
    }

    if (ctrlKey && event.key === 'i') {
      event.preventDefault();
      this.toggleItalic();
      return;
    }

    if (ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
      return;
    }

    if ((ctrlKey && event.shiftKey && event.key === 'z') || (ctrlKey && event.key === 'y')) {
      event.preventDefault();
      this.redo();
      return;
    }

    if ((ctrlKey && event.shiftKey && event.key === '8') || (ctrlKey && event.key === 'l')) {
      event.preventDefault();
      this.toggleBulletList();
      return;
    }

    if (ctrlKey && event.altKey && ['1', '2', '3', '4', '5', '6'].includes(event.key)) {
      event.preventDefault();
      this.applyHeading(`h${event.key}`);
      return;
    }
  }
}
