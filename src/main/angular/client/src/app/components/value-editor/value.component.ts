import {
  
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild
} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../services/core.service';

declare const $;

@Component({
  standalone: false,
  selector: 'app-value-content',
  templateUrl: './value-editor.html'
})
export class ValueEditorComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  private readonly translate = inject(TranslateService);
  data: any;
  object: any = {};
  height = 10;

  isJson = false;
  isJsonError = false;
  jsonData: any = {};
  options: any = new JsonEditorOptions();
  private jsonText = '';

  @ViewChild('myinput') myInputField: ElementRef;
  @ViewChild('editor', {static: false}) editor: JsonEditorComponent;

  readonly textareaRef = Object.defineProperty({}, 'nativeElement', {
    get: () => this.myInputField?.nativeElement
  });

  static isJsonValue(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return value.trim().startsWith('{');
  }

  constructor(public activeModal: NzModalRef, private cdr: ChangeDetectorRef, private coreService: CoreService) {
    this.options.mode = 'code';
    this.options.modes = ['code', 'tree'];
    this.options.onChange = () => {
      this.validateJson();
    };
    this.options.onModeChange = () => {
      this.addMenuActions();
    };
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    this.object = this.modalData.object || {};
    if (ValueEditorComponent.isJsonValue(this.data)) {
      this.setJsonData(this.data);
    }
  }

  ngAfterViewInit(): void {
    this.height = Math.ceil(($('body').height() - 212) / 20);
    setTimeout(() => {
      if (this.isJson) {
        this.initJsonEditor();
      } else if (this.myInputField && this.myInputField.nativeElement) {
        this.myInputField.nativeElement.focus();
        this.do_resize();
      }
    }, 10);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.height = Math.ceil(($('body').height() - 212) / 20);
    this.do_resize();
  }

  do_resize() {
    if (!this.myInputField || !this.myInputField.nativeElement) {
      return;
    }
    const maxrows = 10;
    const arraytxt = this.data ? this.data.split('\n') : [];
    let rows = arraytxt.length;
    for (let i = 0; i < arraytxt.length; i++) {
      if (arraytxt[i].length > 110) {
        rows += 1;
      }
    }
    if (rows < maxrows) {
      this.myInputField.nativeElement.rows = maxrows;
    } else {
      this.myInputField.nativeElement.rows = rows < this.height ? Math.floor(rows) : this.height;
    }
  }

  toggleJsonEditor(): void {
    if (this.isJson) {
      this.data = this.getJsonText();
      this.isJson = false;
      this.isJsonError = false;
      setTimeout(() => {
        if (this.myInputField && this.myInputField.nativeElement) {
          this.myInputField.nativeElement.focus();
          this.do_resize();
        }
      }, 10);
    } else {
      const text = (typeof this.data === 'string' && this.data.trim()) ? this.data : '{}';
      this.setJsonData(text);
      setTimeout(() => {
        this.initJsonEditor();
      }, 10);
    }
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.isJson) {
      if (!this.validateJson()) {
        return;
      }
      this.activeModal.close(JSON.stringify(this.editor.get(), null, 2));
    } else {
      this.activeModal.close(this.data);
    }
  }

  private setJsonData(text: string): void {
    this.isJson = true;
    if (text.trim() === '{') {
      text = '{}';
    }
    try {
      this.jsonData = JSON.parse(text);
      this.jsonText = '';
      this.isJsonError = false;
    } catch (e) {
      this.jsonData = {};
      this.jsonText = text;
      this.isJsonError = true;
    }
  }

  private initJsonEditor(): void {
    if (!this.editor) {
      return;
    }
    if (this.jsonText) {
      this.editor.getEditor()?.setText(this.jsonText);
    }
    this.validateJson();
    this.addMenuActions();
    this.editor.focus();
    const preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    if (preferences.locale) {
      this.coreService.get('assets/i18n/json-editor-text_' + preferences.locale + '.json').subscribe((data) => {
        if (!this.isJson || !this.editor) {
          return;
        }
        this.options.languages = {};
        this.options.languages[preferences.locale] = data;
        this.options.language = preferences.locale;
        const text = this.editor.getText();
        this.editor.setOptions(this.options);
        this.editor.getEditor()?.setText(text);
        this.validateJson();
        this.addMenuActions();
      });
    }
  }

  private addMenuActions(): void {
    const jsonEditor = this.editor?.getEditor();
    if (!jsonEditor || jsonEditor.getMode() !== 'code' || !jsonEditor.container) {
      return;
    }
    const menu = jsonEditor.container.querySelector('.jsoneditor-menu');
    if (!menu || menu.querySelector('.jsoneditor-extra-actions')) {
      return;
    }
    const actions = document.createElement('div');
    actions.className = 'jsoneditor-extra-actions';
    actions.appendChild(this.createMenuButton('fa-align-left', 'inventory.label.formatJson', '', () => this.formatJson()));
    actions.appendChild(this.createMenuButton('fa-search', 'inventory.label.searchJson', ' (Ctrl+F)', () => this.openSearch(false)));
    actions.appendChild(this.createMenuButton('fa-exchange', 'inventory.label.replaceJson', ' (Ctrl+H)', () => this.openSearch(true)));
    menu.appendChild(actions);
  }

  private createMenuButton(icon: string, labelKey: string, shortcut: string, action: () => void): HTMLButtonElement {
    const label = this.translate.instant(labelKey);
    const button = document.createElement('button');
    button.type = 'button';
    button.title = label + shortcut;
    const iconEl = document.createElement('i');
    iconEl.className = 'fa ' + icon;
    button.appendChild(iconEl);
    button.appendChild(document.createTextNode(' ' + label));
    button.addEventListener('click', action);
    return button;
  }

  private formatJson(): void {
    const jsonEditor = this.editor?.getEditor();
    if (!jsonEditor || typeof jsonEditor.format !== 'function') {
      return;
    }
    try {
      jsonEditor.format();
    } catch (e) {
      this.validateJson();
    }
  }

  private openSearch(isReplace: boolean): void {
    const aceEditor = this.editor?.getEditor()?.aceEditor;
    if (!aceEditor) {
      return;
    }
    const searchBox = aceEditor.searchBox;
    if (searchBox?.active && searchBox.searchInput?.value) {
      if (isReplace && searchBox.replaceOption?.checked) {
        if (searchBox.replaceInput?.value) {
          searchBox.replaceAndFindNext();
        } else {
          searchBox.replaceInput?.focus();
        }
        return;
      } else if (!isReplace) {
        searchBox.findNext();
        return;
      }
    }
    aceEditor.focus();
    aceEditor.execCommand(isReplace ? 'replace' : 'find');
  }

  private getJsonText(): string {
    if (!this.editor) {
      return this.data;
    }
    try {
      return JSON.stringify(this.editor.get(), null, 2);
    } catch (e) {
      return this.editor.getText();
    }
  }

  private validateJson(): boolean {
    let isValid = false;
    if (this.editor) {
      try {
        this.editor.get();
        isValid = true;
      } catch (e) {
        isValid = false;
      }
    }
    this.isJsonError = !isValid;
    this.cdr.markForCheck();
    return isValid;
  }
}
