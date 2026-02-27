import {Component, HostListener, inject, ViewEncapsulation } from '@angular/core';
import { MarkdownParserService } from '../../services/markdown-parser.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {CoreService} from "../../services/core.service";
import {AuthService} from "../guard";

interface Author {
  userName: string;
}

interface Post {
  postId: number;
  content: string;
  severity: string;
  author: Author;
  posted: string;
  color?: string;
}

interface Participant {
  postCount: number;
  modified: string;
  userName: string;
}

interface NoteMetadata {
  created: string;
  createdBy: Author;
  modified: string;
  modifiedBy: Author;
  postCount: number;
  participantCount: number;
  severity: string;
  displayPreferences?: {
    width: number;
    height: number;
  };
}

interface NoteResponse {
  deliveryDate: string;
  name: string;
  objectType: string;
  metadata: NoteMetadata;
  posts: Post[];
  participants: Participant[];
}

interface ColorPreset {
  value: string;
  severity: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | 'INFO';
  label: string;
}

@Component({
  standalone: false,
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  noteContent: string = '';
  noteColor: string = 'NORMAL';
  notePreview: SafeHtml = '';
  width = 800;
  height = 600;
  submitted = false;
  resizing = false;
  lastX = 0;
  lastY = 0;
  history: string[] = [];
  historyIndex = -1;
  isUndoRedo = false;
  isFullscreenEdit = false;
  permission: any = {};
  objectName: string = '';
  objectType: string = 'WORKFLOW';
  objectPath: string = '';

  colorPresets: ColorPreset[] = [
    {
      value: '#ff4d4f',
      severity: 'CRITICAL',
      label: 'inventory.notes.label.critical'
    },
    {
      value: '#ff9800',
      severity: 'HIGH',
      label: 'inventory.notes.label.high'
    },
    {
      value: '#fadb14',
      severity: 'NORMAL',
      label: 'inventory.notes.label.normal'
    },
    {
      value: '#52c41a',
      severity: 'LOW',
      label: 'inventory.notes.label.low'
    },
    {
      value: '#1890ff',
      severity: 'INFO',
      label: 'inventory.notes.label.info'
    }
  ];

  posts: Post[] = [];

  currentUser = {
    userName: ''
  };

  mentionUsers: string[] = [];
  filteredMentionUsers: string[] = [];


  constructor(
    private markdownParser: MarkdownParserService,
    private sanitizer: DomSanitizer,
    private activeModal: NzModalRef,
    public coreService: CoreService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if(this.modalData.width) this.width = this.modalData.width;
    if(this.modalData.height) this.height = this.modalData.height;
    if(this.modalData.objectName) this.objectName = this.modalData.objectName;
    if(this.modalData.objectType) this.objectType = this.modalData.objectType;
    if(this.modalData.objectPath) this.objectPath = this.modalData.objectPath;
    this.currentUser = {
      userName: this.authService.currentUserData || 'unknown'
    };

    this.noteColor = 'NORMAL';

    this.loadNote();
    this.loadUsers();
  }

  loadUsers(): void {
    const obj = {
      name: this.objectName,
      objectType: this.objectType
    };

    this.coreService.post('note/users', obj).subscribe({
      next: (res: any) => {
        if (res && res.users) {
          this.mentionUsers = res.users;
        } else {
          this.mentionUsers = [];
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.mentionUsers = [];
      }
    });

  }


  loadNote(): void {
    const obj = {
      name: this.objectName,
      objectType: this.objectType
    };

    this.coreService.post('note', obj).subscribe({
      next: (res: NoteResponse) => {
        if (res && res.posts) {
          this.posts = res.posts.map((post: Post) => ({
            ...post,
            color: this.getSeverityColor(post.severity || 'NORMAL')
          }));

        } else {
          this.posts = [];
        }
        if (res.metadata?.displayPreferences) {
          this.width = res.metadata.displayPreferences.width || this.width;
          this.height = res.metadata.displayPreferences.height || this.height;
          this.updateModalSize();
        }
      },
      error: (err) => {
        console.error('Error loading note:', err);
        this.posts = [];
      }
    });
  }

  addPost(): void {
    if (!this.noteContent.trim()) return;

    const contentForApi = this.convertMentionsForApi(this.noteContent);

    const obj = {
      name: this.objectName,
      objectType: this.objectType,
      content: contentForApi,
      severity: this.getCurrentSeverity()
    };

    this.coreService.post('note/post/add', obj).subscribe({
      next: (res: NoteResponse) => {
        if (res && res.posts) {
          this.posts = res.posts.map((post: Post) => ({
            ...post,
            color: this.getSeverityColor(post.severity || 'NORMAL')
          }));
        }

        this.noteContent = '';
        this.noteColor = 'NORMAL';
        this.submitted = false;

        setTimeout(() => {
          const chatThread = document.querySelector('.chat-thread');
          if (chatThread) {
            chatThread.scrollTop = chatThread.scrollHeight;
          }
        }, 100);
      },
      error: (err) => {
        console.error('Error adding post:', err);
        this.submitted = false;
      }
    });
  }

  delete(): void {
    this.submitted = true;
    const obj = {
      name: this.objectName,
      objectType: this.objectType,
    };

    this.coreService.post('note/delete', obj).subscribe({
      next: (res: NoteResponse) => {
        this.submitted = false;
        this.activeModal.destroy({ action: 'deleted', objectName: this.objectName, objectType: this.objectType });
      },
      error: (err) => {
        this.submitted = false;
        this.activeModal.destroy({ action: 'deleted', objectName: this.objectName, objectType: this.objectType });
      }
    });
  }

  isCurrentUser(post: Post): boolean {
    return post.author.userName === this.currentUser.userName;
  }


  selectColor(severity: string) {
    this.noteColor = severity;
  }

  getSeverityColor(severity: string): string {
    const preset = this.colorPresets.find(p => p.severity === severity);
    return preset ? preset.value : '#fadb14';
  }

  getCurrentSeverity(): string {
    return this.noteColor;
  }


  getMessageBackgroundColor(post: Post): string {
    const baseColor = post.color;

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

  renderMarkdown(content: string): SafeHtml {
    const contentWithMentions = this.highlightMentions(content);
    const rendered = this.markdownParser.render(contentWithMentions) as any;
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
  }

  convertMentionsForApi(content: string): string {
    const sortedUsers = [...this.mentionUsers].sort((a, b) => b.length - a.length);

    let result = content;
    sortedUsers.forEach(username => {
      const regex = new RegExp(`@(${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=\\s|$|[^a-zA-Z0-9_-])`, 'gi');
      result = result.replace(regex, (match, foundUsername) => {
        return `@[${foundUsername}]`;
      });
    });

    result = result.replace(
      /@([a-zA-Z0-9_-]+)(?![^\[]*\])/g,
      (match, username) => {
        return `@[${username}]`;
      }
    );

    return result;
  }

  highlightMentions(content: string): string {
    return content.replace(
      /@(?:\[([^\]]+)\]|([a-zA-Z0-9_-]+))/g,
      (match, bracketedUsername, plainUsername) => {
        const username = bracketedUsername || plainUsername;
        return `<span class="tag-oval">${username}</span>`;
      }
    );
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

    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;

    this.width = Math.max(400, Math.min(maxWidth, this.width + dx));
    this.height = Math.max(300, Math.min(maxHeight, this.height + dy));

    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.updateModalSize();
  }


  onResizeEnd = () => {
    this.resizing = false;
    window.removeEventListener('mousemove', this.onResizing);
    window.removeEventListener('mouseup', this.onResizeEnd);

    this.saveDisplayPreferences();
  }

  saveDisplayPreferences(): void {
    const obj = {
      name: this.objectName,
      objectType: this.objectType,
      displayPreferences: {
        width:  Math.round(this.width),
        height:  Math.round(this.height)
      }
    };

    this.coreService.post('note/preferences', obj).subscribe({
      next: (res) => {
      },
      error: (err) => {
      }
    });
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

  getActiveTextarea(): HTMLTextAreaElement | null {
    if (this.isFullscreenEdit) {
      return document.querySelector('.fullscreen-textarea') as HTMLTextAreaElement;
    } else {
      return document.querySelector('.new-post-section  textarea') as HTMLTextAreaElement;
    }
  }

  applyHeading(level: string) {
    const textarea = this.getActiveTextarea();
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
    const textarea = this.getActiveTextarea();
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
    const textarea = this.getActiveTextarea();
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
    this.activeModal.destroy({ action: 'viewed', objectName: this.objectName, objectType: this.objectType });
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

  toggleFullscreenEdit() {
    this.isFullscreenEdit = !this.isFullscreenEdit;
    if (this.isFullscreenEdit) {
      this.updatePreview();
    }
  }

  onTextareaInput(event: Event): void {
    this.updatePreview();
  }

  onMentionSearch(searchChange: any): void {
    const searchText = typeof searchChange === 'string' ? searchChange : searchChange.value || '';
    this.filterMentionUsers(searchText);
  }

  filterMentionUsers(filter: string = ''): void {
    if (!filter) {
      this.filteredMentionUsers = [...this.mentionUsers];
    } else {
      const filterLower = filter.toLowerCase();
      this.filteredMentionUsers = this.mentionUsers.filter(user =>
        user.toLowerCase().includes(filterLower)
      );
    }
  }

}
