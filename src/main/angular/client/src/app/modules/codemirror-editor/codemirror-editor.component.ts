import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeEditorService } from './../../services/code-editor.service';

interface ExtendedEditorConfiguration {
  lineNumbers?: boolean;
  theme?: string;
  mode?: string | object;
  readOnly?: boolean | 'nocursor';
  lineWrapping?: boolean;
  matchBrackets?: boolean;
  autoCloseBrackets?: boolean;
  foldGutter?: boolean;
  gutters?: string[];
  scrollbarStyle?: string;
  tabSize?: number;
  indentUnit?: number;
  indentWithTabs?: boolean;
  autoRefresh?: boolean;
  placeholder?: string;
  highlightSelectionMatches?: boolean | {
    showToken?: boolean | RegExp;
    annotateScrollbar?: boolean;
    delay?: number;
    onUpdate?: (annotations: any[]) => void;
    style?: string;
    trim?: boolean;
  };
  [key: string]: any;
}

@Component({
  standalone: false,
  selector: 'app-codemirror-editor',
  template: `<textarea #textArea></textarea>`,
  styleUrls: ['./codemirror-editor.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeEditorComponent),
      multi: true,
    },
  ],
})
export class CodeEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('textArea', { static: true }) textArea!: ElementRef<HTMLTextAreaElement>;

  @Input() options: ExtendedEditorConfiguration = {};
  @Input() placeholder = '';
  @Input() autoFocus = false;
  @Input() name = '';
  @Input() required = false;
  @Input() title = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() focusChange = new EventEmitter<boolean>();
  @Output() focusout = new EventEmitter<void>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();
  @Output() keyup = new EventEmitter<KeyboardEvent>();
  @Output() cursorActivity = new EventEmitter<void>();
  @Output() ngModelChange = new EventEmitter<string>();
  @Output() ready = new EventEmitter<void>();

  private editorInstance: any;
  private _value = '';
  private isDisabled = false;
  private resizeObserver?: ResizeObserver;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  public get codeEditor(): any {
    return this.editorInstance;
  }

  constructor(private cmService: CodeEditorService) {}

  ngOnInit(): void {
    if (!this.cmService.isLoaded()) {
      const interval = setInterval(() => {
        if (this.cmService.isLoaded()) {
          clearInterval(interval);
          this.initEditor();
        }
      }, 100);
    } else {
      this.initEditor();
    }
  }

  ngOnDestroy(): void {
    if (this.editorInstance) {
      this.editorInstance.off('change', this.onCodeMirrorChange);
      this.editorInstance.off('focus', this.onCodeMirrorFocus);
      this.editorInstance.off('blur', this.onCodeMirrorBlur);
      this.editorInstance.off('keydown', this.onCodeMirrorKeydown);
      this.editorInstance.off('keyup', this.onCodeMirrorKeyup);
      this.editorInstance.off('cursorActivity', this.onCodeMirrorCursorActivity);
      this.editorInstance.toTextArea();
      this.editorInstance = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initEditor(): void {
    const {
      autoRefresh,
      highlightSelectionMatches,
      placeholder: optionPlaceholder,
      ...otherOptions
    } = this.options;

    const config: any = {
      lineNumbers: true,
      theme: 'default',
      mode: 'javascript',
      readOnly: this.isDisabled ? 'nocursor' : false,
      lineWrapping: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      foldGutter: false,
      gutters: ['CodeEditor-linenumbers'],
      scrollbarStyle: 'native',
      tabSize: 2,
      indentUnit: 2,
      ...otherOptions,
    };

    const placeholderText = optionPlaceholder || this.placeholder;
    if (placeholderText) {
      config.placeholder = placeholderText;
    }

    if (highlightSelectionMatches) {
      if (typeof highlightSelectionMatches === 'boolean') {
        config.highlightSelectionMatches = {
          showToken: /\w/,
          annotateScrollbar: true,
        };
      } else {
        config.highlightSelectionMatches = {
          showToken: highlightSelectionMatches.showToken || /\w/,
          annotateScrollbar: highlightSelectionMatches.annotateScrollbar ?? true,
          delay: highlightSelectionMatches.delay || 100,
          style: highlightSelectionMatches.style || 'matchhighlight',
          trim: highlightSelectionMatches.trim ?? true,
        };
        if (highlightSelectionMatches.onUpdate) {
          config.highlightSelectionMatches.onUpdate = highlightSelectionMatches.onUpdate;
        }
      }
    }

    this.editorInstance = this.cmService.fromTextArea(this.textArea.nativeElement, config);
    this.editorInstance.setValue(this._value);

    if (this.autoFocus) {
      setTimeout(() => this.editorInstance.focus(), 0);
    }

    this.handleAutoRefresh(autoRefresh !== false);

    this.editorInstance.on('change', this.onCodeMirrorChange);
    this.editorInstance.on('focus', this.onCodeMirrorFocus);
    this.editorInstance.on('blur', this.onCodeMirrorBlur);
    this.editorInstance.on('keydown', this.onCodeMirrorKeydown);
    this.editorInstance.on('keyup', this.onCodeMirrorKeyup);
    this.editorInstance.on('cursorActivity', this.onCodeMirrorCursorActivity);

    this.ready.emit();
  }

  private handleAutoRefresh(enabled: boolean): void {
    if (!enabled) return;

    setTimeout(() => {
      if (this.editorInstance) {
        this.editorInstance.refresh();
      }
    }, 0);

    const resizeHandler = () => {
      if (this.editorInstance) {
        this.editorInstance.refresh();
      }
    };
    window.addEventListener('resize', resizeHandler);

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.editorInstance) {
          this.editorInstance.refresh();
        }
      });

      if (this.textArea?.nativeElement?.parentElement) {
        this.resizeObserver.observe(this.textArea.nativeElement.parentElement);
      }
    }

    if ('IntersectionObserver' in window) {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.editorInstance) {
            setTimeout(() => this.editorInstance.refresh(), 50);
          }
        });
      });

      if (this.textArea?.nativeElement) {
        intersectionObserver.observe(this.textArea.nativeElement);
      }
    }
  }

  private onCodeMirrorChange = (): void => {
    const value = this.editorInstance.getValue();
    this._value = value;
    this.onChange(value);
    this.valueChange.emit(value);
    this.ngModelChange.emit(value);
  };

  private onCodeMirrorFocus = (): void => {
    this.focusChange.emit(true);
  };

  private onCodeMirrorBlur = (): void => {
    this.onTouched();
    this.focusChange.emit(false);
    this.focusout.emit();
  };

  private onCodeMirrorKeydown = (_cm: any, event: KeyboardEvent): void => {
    this.keydown.emit(event);
  };

  private onCodeMirrorKeyup = (_cm: any, event: KeyboardEvent): void => {
    this.keyup.emit(event);
  };

  private onCodeMirrorCursorActivity = (): void => {
    this.cursorActivity.emit();
  };

  writeValue(value: string): void {
    this._value = value || '';
    if (this.editorInstance) {
      const currentValue = this.editorInstance.getValue();
      if (currentValue !== this._value) {
        const cursor = this.editorInstance.getCursor();
        this.editorInstance.setValue(this._value);
        if (this._value.length > 0 && cursor) {
          try {
            this.editorInstance.setCursor(cursor);
          } catch (e) {
          }
        }
      }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.editorInstance) {
      this.editorInstance.setOption('readOnly', isDisabled ? 'nocursor' : false);
    }
  }

  public focus(): void {
    if (this.editorInstance) {
      this.editorInstance.focus();
    }
  }

  public getCodeMirror(): any {
    return this.editorInstance;
  }

  public refresh(): void {
    if (this.editorInstance) {
      this.editorInstance.refresh();
    }
  }

  public setValue(value: string): void {
    this._value = value;
    if (this.editorInstance) {
      this.editorInstance.setValue(value);
    }
  }

  public getValue(): string {
    return this.editorInstance ? this.editorInstance.getValue() : this._value;
  }

  public setOption(option: string, value: any): void {
    if (this.editorInstance) {
      this.editorInstance.setOption(option, value);
    }
  }

  public getOption(option: string): any {
    return this.editorInstance ? this.editorInstance.getOption(option) : undefined;
  }

  public setCursor(line: number, ch?: number): void {
    if (this.editorInstance) {
      this.editorInstance.setCursor(line, ch);
    }
  }

  public getCursor(): any {
    return this.editorInstance ? this.editorInstance.getCursor() : undefined;
  }
}
