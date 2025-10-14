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
  HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';

// Import modes and addons
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/match-highlighter';

// ✅ Flexible interface that allows any property
interface ExtendedEditorConfiguration {
  // Core CodeMirror options
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

  // Extended options (from ngx-codemirror)
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

  // Allow any other properties
  [key: string]: any;
}

@Component({
  standalone: false,
  selector: 'app-codemirror-editor',
  styleUrl: './codemirror-editor.component.css',
  template: `<div #textareaRef class="codemirror-container"></div>`,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeMirrorEditorComponent),
      multi: true,
    },
  ],
})
export class CodeMirrorEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('textareaRef', { static: true }) textareaRef!: ElementRef;

  // ✅ Use flexible interface
  @Input() options: ExtendedEditorConfiguration = {};
  @Input() placeholder: string = '';
  @Input() autoFocus: boolean = false;
  @Input() name: string = '';
  @Input() required: boolean = false;
  @Input() title: string = '';

  // Output events - matching ngx-codemirror API
  @Output() valueChange = new EventEmitter<string>();
  @Output() focusChange = new EventEmitter<boolean>();
  @Output() focusout = new EventEmitter<void>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();
  @Output() ngModelChange = new EventEmitter<string>();

  private codeMirror!: CodeMirror.Editor;
  private _value: string = '';
  private isDisabled: boolean = false;
  private resizeObserver?: ResizeObserver;

  // ControlValueAccessor callbacks
  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.initializeCodeMirror();
  }

  ngOnDestroy(): void {
    if (this.codeMirror) {
      this.codeMirror.off('change', this.onCodeMirrorChange);
      this.codeMirror.off('focus', this.onCodeMirrorFocus);
      this.codeMirror.off('blur', this.onCodeMirrorBlur);
      this.codeMirror.off('keydown', this.onCodeMirrorKeydown);
      this.codeMirror.getWrapperElement().remove();
    }

    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initializeCodeMirror(): void {
    // ✅ Extract custom options that are not part of CodeMirror
    const {
      autoRefresh,
      highlightSelectionMatches,
      placeholder: optionPlaceholder,
      ...otherOptions
    } = this.options;

    // ✅ Build configuration object with type assertion
    const config: any = {
      lineNumbers: true,
      theme: 'default',
      mode: 'javascript',
      readOnly: this.isDisabled ? 'nocursor' : false,
      lineWrapping: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      foldGutter: false,
      gutters: ['CodeMirror-linenumbers'],
      scrollbarStyle: 'native',
      tabSize: 2,
      ...otherOptions
    };

    // ✅ Handle placeholder (CodeMirror 5 support)
    const placeholderText = optionPlaceholder || this.placeholder;
    if (placeholderText) {
      config.placeholder = placeholderText;
    }

    // ✅ Handle highlightSelectionMatches properly
    if (highlightSelectionMatches) {
      if (typeof highlightSelectionMatches === 'boolean') {
        config.highlightSelectionMatches = {
          showToken: /\w/,
          annotateScrollbar: true
        };
      } else {
        // Use type assertion to bypass TypeScript checking
        config.highlightSelectionMatches = {
          showToken: highlightSelectionMatches.showToken || /\w/,
          annotateScrollbar: highlightSelectionMatches.annotateScrollbar ?? true,
          delay: highlightSelectionMatches.delay || 100,
          style: highlightSelectionMatches.style || 'matchhighlight',
          trim: highlightSelectionMatches.trim ?? true
        } as any;

        // Add onUpdate if provided
        if (highlightSelectionMatches.onUpdate) {
          config.highlightSelectionMatches.onUpdate = highlightSelectionMatches.onUpdate;
        }
      }
    }

    // ✅ Create editor with type assertion
    this.codeMirror = CodeMirror(this.textareaRef.nativeElement, config as CodeMirror.EditorConfiguration);

    // Set initial value
    this.codeMirror.setValue(this._value);

    // Auto focus if needed
    if (this.autoFocus) {
      setTimeout(() => this.codeMirror.focus(), 0);
    }

    // ✅ Handle autoRefresh functionality
    this.handleAutoRefresh(autoRefresh !== false); // Default to true

    // Bind events
    this.codeMirror.on('change', this.onCodeMirrorChange);
    this.codeMirror.on('focus', this.onCodeMirrorFocus);
    this.codeMirror.on('blur', this.onCodeMirrorBlur);
    this.codeMirror.on('keydown', this.onCodeMirrorKeydown);
  }

  // ✅ Handle autoRefresh functionality
  private handleAutoRefresh(enabled: boolean): void {
    if (!enabled) return;

    // Initial refresh
    setTimeout(() => {
      if (this.codeMirror) {
        this.codeMirror.refresh();
      }
    }, 0);

    // Refresh on window resize
    const resizeHandler = () => {
      if (this.codeMirror) {
        this.codeMirror.refresh();
      }
    };
    window.addEventListener('resize', resizeHandler);

    // Refresh when container size changes
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.codeMirror) {
          this.codeMirror.refresh();
        }
      });

      if (this.textareaRef?.nativeElement?.parentElement) {
        this.resizeObserver.observe(this.textareaRef.nativeElement.parentElement);
      }
    }

    // Refresh when element becomes visible (for modals/tabs)
    if ('IntersectionObserver' in window) {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.codeMirror) {
            setTimeout(() => this.codeMirror.refresh(), 50);
          }
        });
      });

      if (this.textareaRef?.nativeElement) {
        intersectionObserver.observe(this.textareaRef.nativeElement);
      }
    }
  }

  private onCodeMirrorChange = (): void => {
    const value = this.codeMirror.getValue();
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

  private onCodeMirrorKeydown = (cm: CodeMirror.Editor, event: KeyboardEvent): void => {
    this.keydown.emit(event);
  };

  // ControlValueAccessor Implementation
  writeValue(value: string): void {
    this._value = value || '';
    if (this.codeMirror) {
      const currentValue = this.codeMirror.getValue();
      if (currentValue !== this._value) {
        // Preserve cursor position when updating value
        const cursor = this.codeMirror.getCursor();
        this.codeMirror.setValue(this._value);
        // Only restore cursor if the new content is long enough
        if (this._value.length > 0 && cursor) {
          try {
            this.codeMirror.setCursor(cursor);
          } catch (e) {
            // Ignore cursor position errors
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
    if (this.codeMirror) {
      this.codeMirror.setOption('readOnly', isDisabled ? 'nocursor' : false);
    }
  }

  // ✅ Public API methods - matching ngx-codemirror
  public focus(): void {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  public getCodeMirror(): CodeMirror.Editor {
    return this.codeMirror;
  }

  public refresh(): void {
    if (this.codeMirror) {
      this.codeMirror.refresh();
    }
  }

  public setValue(value: string): void {
    this._value = value;
    if (this.codeMirror) {
      this.codeMirror.setValue(value);
    }
  }

  public getValue(): string {
    return this.codeMirror ? this.codeMirror.getValue() : this._value;
  }

  // ✅ Additional utility methods
  public setOption(option: string, value: any): void {
    if (this.codeMirror) {
      (this.codeMirror as any).setOption(option, value);
    }
  }

  public getOption(option: string): any {
    return this.codeMirror ? (this.codeMirror as any).getOption(option) : undefined;
  }

  public setCursor(line: number, ch?: number): void {
    if (this.codeMirror) {
      this.codeMirror.setCursor(line, ch);
    }
  }

  public getCursor(): CodeMirror.Position | undefined {
    return this.codeMirror ? this.codeMirror.getCursor() : undefined;
  }
}
