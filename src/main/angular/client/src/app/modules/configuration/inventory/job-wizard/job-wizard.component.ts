import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject, Input, input,
  Output, SimpleChanges,
  ViewChild,
} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {isArray, isEqual, sortBy} from "underscore";
import {debounceTime} from "rxjs/operators";
import {Subject} from "rxjs";
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from "../../../../models/enums";
import {JsonEditorComponent, JsonEditorOptions} from "ang-jsoneditor";
import {NzMessageService} from "ng-zorro-antd/message";
import {ClipboardService} from "ngx-clipboard";
import {Editor as AceEditor} from 'ace-builds/src-noconflict/ace';
import {FindAndReplaceComponent} from "../workflow/workflow.component";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from '@angular/forms';
import {properties} from "ng-zorro-antd/core/util";
interface KeyValue {
  key: string;
  value: string;
}

@Component({
  selector: 'app-api-request',
  templateUrl: './api-request.component.html'
})


export class ApiRequestComponent {
  model = {
    url: '',
    endPoint: '',
    method: 'GET',
    headers: [] as KeyValue[],
    params: [] as KeyValue[],
    body: ''
  };
  auth = {
    type: 'None' as 'None' | 'API Key' | 'Bearer Token' | 'Basic Auth' | 'OAuth 2.0',
    apiKey: {name: '', value: '', in: 'header' as 'header' | 'query'},
    token: '',
    basic: {username: '', password: ''},
    oauth2: {clientId: '', clientSecret: '', tokenUrl: ''}
  };

  authTypes = [
    'None',
    'API Key',
    'Bearer Token',
    'Basic Auth',
    'OAuth 2.0'
  ];
  methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  commonHeaders = [
    'Accept',
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'User-Agent',
    'Cookie',
    'X-Requested-With',
    'Origin',
    'Referer',
    'Accept-Language',
    'x-access-token'
  ];
  commonHeaderValues: Record<string, string[]> = {
    'Accept': ['application/json', 'text/html', '*/*'],
    'Content-Type': ['application/json', 'application/xml', 'text/plain'],
    'Authorization': ['Bearer ', 'Basic '],
    'Cache-Control': ['no-cache', 'no-store', 'max-age=0'],
  };

  filteredKeys: string[] = [];
  filteredValues: string[] = [];

  response: any = null;
  status: number | null = null;
  requestUrl: '';
  responseHeaders: Record<string, string> = {};
  options: any = new JsonEditorOptions();
  isError = false;
  data: any;
  errorMsg = '';
  errorText = '';
  edit = false;
  preferences: any = {};
  mappings: Mapping[] = [];
  @Input() arguments: any;
  @Input() parameters: any;
  @Input() isClose: any;
  @Output() configSaved = new EventEmitter<any>();
  @Output() isStepBack = new EventEmitter<any>();
  @Output() isVisible = new EventEmitter<any>();
  @ViewChild('editor', {static: false}) editor!: JsonEditorComponent;
  private lastSelection = '';

  constructor(
    private coreService: CoreService,
    private msg: NzMessageService,
    private ref: ChangeDetectorRef,
    private clipboardService: ClipboardService,
    private modal: NzModalService,
    private cd: ChangeDetectorRef,
  ) {
    this.options.mode = 'code';
    this.options.onEditable = () => {
      return this.edit;
    };
    this.options.onChange = () => {
      try {
        this.isError = false;
        this.editor.get();
      } catch (err) {
        this.isError = true;
        this.errorMsg = '';
      }
      this.ref.detectChanges();
    };
  }

  ngOnInit(): void {
    this.model.params = [{key: '', value: ''}];
    this.model.headers = [{key: '', value: ''}];
    this.filteredKeys = this.commonHeaders.slice();

    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};

    this.coreService.get('assets/i18n/json-editor-text_' + this.preferences.locale + '.json').subscribe((data) => {
      this.options.languages = {};
      this.options.languages[this.preferences.locale] = data;
      this.options.language = this.preferences.locale;
      this.editor.setOptions(this.options);
    });
    this.options.modes = ['code', 'tree'];
    this.populateFromArgs();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['arguments'] && !changes['arguments'].isFirstChange()) {
      this.populateFromArgs();
    }
  }

  private populateFromArgs() {
    const execArgs = this.arguments?.executable?.arguments as { name: string; value: string }[] | undefined;
    if (!Array.isArray(execArgs)) {
      return;
    }

    const requestArg = execArgs.find(a => a.name === 'request');
    if (!requestArg) {
      return;
    }

    let req: any;
    try {
      req = JSON.parse(requestArg.value);
    } catch (e) {
      console.warn('Could not parse request JSON:', e);
      return;
    }

    this.model.url      = req.editorUrl  || this.model.url;
    this.model.endPoint = req.endpoint   || this.model.endPoint;
    this.model.method = req.method || this.model.method;
    this.model.headers = Array.isArray(req.headers) ? req.headers : [];
    this.model.params = Array.isArray(req.params) ? req.params : [];

    let bodyValue = req.body;

    if (typeof bodyValue === 'string') {
      try {
        bodyValue = JSON.parse(bodyValue);
      } catch {
      }
    }

    this.model.body = bodyValue != null
      ? JSON.stringify(bodyValue, null, 2)
      : '';

    if (req.auth && typeof req.auth === 'object') {
      const a = req.auth as any;
      this.auth.type = a.type ?? 'None';
      if (this.auth.type === 'API Key' && a.apiKey) {
        this.auth.apiKey.name = a.apiKey.name || '';
        this.auth.apiKey.value = a.apiKey.value || '';
        this.auth.apiKey.in = a.apiKey.in || 'header';
      }
      if (this.auth.type === 'Bearer Token' && a.token) {
        this.auth.token = a.token;
      }
      if (this.auth.type === 'Basic Auth' && a.basic) {
        this.auth.basic.username = a.basic.username || '';
        this.auth.basic.password = a.basic.password || '';
      }
      if (this.auth.type === 'OAuth 2.0' && a.oauth2) {
        this.auth.oauth2.clientId = a.oauth2.clientId || '';
        this.auth.oauth2.clientSecret = a.oauth2.clientSecret || '';
        this.auth.oauth2.tokenUrl = a.oauth2.tokenUrl || '';
        (this.auth as any).oauth2.accessToken = a.oauth2.accessToken;
      }
    }

    const returnVarArg = execArgs.find(a => a.name === 'return_variables' || a.name === 'return_variable');
    if (returnVarArg) {
      try {
        const arr = JSON.parse(returnVarArg.value);
        if (Array.isArray(arr)) {
          this.mappings = arr;
        }
      } catch {
        console.warn('Could not parse return_variables JSON');
      }
    }
  }


  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    const pathEls = (event as any).composedPath?.() as HTMLElement[] || [];
    if (!pathEls.some(el =>
      el.classList?.contains('ace_scroller') ||
      el.classList?.contains('ace_content'))
    ) return;

    const aceEditor = (this.editor as any).editor.aceEditor as AceEditor;
    const raw = aceEditor.getSelectedText();
    if (!raw?.trim()) return;

    let parsedValue: any;
    try {
      parsedValue = JSON.parse(raw);
    } catch {
      parsedValue = raw.replace(/^['"]|['"]$/g, '');
    }

    const allPaths = this.findPaths(this.response, parsedValue);
    if (!allPaths.length) return;

    const cursor = aceEditor.getCursorPosition();
    const line  = aceEditor.getSession().getLine(cursor.row);
    const m     = line.match(/^\s*"([^"]+)"\s*:/);
    let candidates = m
      ? allPaths.filter(p => p.endsWith(`.${m[1]}`))
      : allPaths;
    if (!candidates.length) candidates = allPaths;

    const snippet = raw;
    const offsets: number[] = [];
    let pos = JSON.stringify(this.response).indexOf(snippet);
    while (pos !== -1) {
      offsets.push(pos);
      pos = JSON.stringify(this.response).indexOf(snippet, pos + snippet.length);
    }
    if (!offsets.length) {
      this.openModal(candidates[0], raw);
      return;
    }
    const doc     = aceEditor.getSession().getDocument();
    const cursorIdx = (doc as any).positionToIndex(cursor);
    let occurrence = 0;
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] <= cursorIdx) occurrence = i;
      else break;
    }

    const chosenPath = candidates[ occurrence ] || candidates[0];
    this.openModal(chosenPath, raw);
  }

  private openModal(path: string, raw: any) {
    const jq = this.toJqPath(path);
    const modal = this.modal.create({
      nzContent: ApiRequestDialogComponent,
      nzData: { selectedText: raw, paths: [ jq ], list: false },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((result: Mapping) => {
      if (result) {
        this.mappings.push(result);
      }
    });
  }


  /** in your ApiRequestComponent **/

  /**
   * Convert a raw findPaths path (e.g. "orders[2].orderId" or "[0].foo-bar")
   * into a jq filter string (e.g. ".orders[2].orderId" or ".[0][\"foo-bar\"]").
   */
   toJqPath(path: string | Array<string|number>): string {
    const segments: Array<string|number> =
      Array.isArray(path)
        ? path
        :
        Array.from(path.matchAll(/([A-Za-z_][A-Za-z0-9_]*)|\[(\d+)\]|"((?:\\.|[^"\\])*)"/g))
          .map(m => m[1] ?? (m[2] !== undefined ? Number(m[2]) : m[3]));

    let filter = segments.map(seg => {
      if (typeof seg === 'number') {
        return `[${seg}]`;
      } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(seg)) {
        return `.${seg}`;
      } else {
        return `[${JSON.stringify(seg)}]`;
      }
    }).join('');

    return filter.startsWith('.') ? filter : `.${filter}`;
  }

  private findPaths(obj: any, target: any): string[] {
    const results: string[] = [];

    function helper(curr: any, path: string) {
      if (curr === target) {
        results.push(path);
      }

      if (curr && typeof curr === 'object' && !Array.isArray(curr)) {
        Object.keys(curr).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;

          if (key === target) {
            results.push(newPath);
          }

          helper(curr[key], newPath);
        });
      } else if (Array.isArray(curr)) {
        curr.forEach((item, i) => {
          const newPath = path ? `${path}[${i}]` : `[${i}]`;
          helper(item, newPath);
        });
      }
    }

    helper(obj, "");

    return results;
  }

  variableList(): void {
    const modal = this.modal.create({
      nzContent: ApiRequestDialogComponent,
      nzData: {mapping: [...this.mappings], list: true},
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });

    modal.afterClose.subscribe((result: Mapping[]) => {
      if (Array.isArray(result)) {
        this.mappings = [...result];
      }
    });
  }

  addHeader(): void {
    this.model.headers.push({key: '', value: ''});
  }

  removeHeader(i: number): void {
    this.model.headers.splice(i, 1);
  }

  addParam(): void {
    this.model.params = [...this.model.params, {key: '', value: ''}];
  }

  removeParam(i: number): void {
    this.model.params = this.model.params.filter((_, index) => index !== i);
  }

  filterHeaderKey(value: string): void {
    const v = value.toLowerCase();
    this.filteredKeys = this.commonHeaders
      .filter(h => h.toLowerCase().includes(v));
  }

  filterHeaderValue(key: string, value: string): void {
    const list = this.commonHeaderValues[key] || [];
    const v = value.toLowerCase();
    this.filteredValues = list
      .filter(val => val.toLowerCase().includes(v));
  }

  send(): void {
    const hdrs = this.arrayToMap(this.model.headers);

    switch (this.auth.type) {
      case 'API Key':
        if (this.auth.apiKey.name) {
          if (this.auth.apiKey.in === 'header') {
            hdrs[this.auth.apiKey.name] = this.auth.apiKey.value;
          } else {
            this.model.params.push({
              key: this.auth.apiKey.name,
              value: this.auth.apiKey.value
            });
          }
        }
        break;
      case 'Bearer Token':
        if (this.auth.token) {
          hdrs['Authorization'] = `Bearer ${this.auth.token}`;
        }
        break;
      case 'Basic Auth':
        const {username, password} = this.auth.basic;
        if (username || password) {
          const creds = btoa(`${username}:${password}`);
          hdrs['Authorization'] = `Basic ${creds}`;
        }
        break;
      case 'OAuth 2.0':
        const token = (this.auth as any).oauth2?.accessToken;
        if (token) {
          hdrs['Authorization'] = `Bearer ${token}`;
        }
        break;
    }

    const { url, endPoint, method, params, body } = this.model;
  const paramMap = this.arrayToMap(params);

  const placeholderRegex = /\{(\w+)\}/g;
  const replacePlaceholders = (input: string) =>
    input.replace(placeholderRegex, (_m, name) => {
      const def = this.parameters?.[name]?.default;
      if (def != null) {
        try { return JSON.parse(def); }
        catch { return def; }
      }
      return `{${name}}`;
    });

  const resolvedBase     = replacePlaceholders(url).replace(/\/$/, '');
  const resolvedEndpoint = replacePlaceholders(endPoint);
  const safeEndpoint     = resolvedEndpoint.startsWith('/')
    ? resolvedEndpoint
    : `/${resolvedEndpoint}`;

  const fullUrl = `${resolvedBase}${safeEndpoint}`;

  const resolvedHdrs: Record<string,string> = {};
  Object.entries(hdrs).forEach(([k,v]) => {
    resolvedHdrs[replacePlaceholders(k)] = replacePlaceholders(v);
  });
  Object.keys(paramMap).forEach(k => {
    paramMap[k] = replacePlaceholders(paramMap[k]);
  });

  let resolvedBody: any = body;
  if (typeof resolvedBody === 'string') {
    resolvedBody = replacePlaceholders(resolvedBody);
  }

  this.coreService
    .requestTest(method, fullUrl, resolvedHdrs, paramMap, resolvedBody)
    .subscribe({
      next: res => {
        this.status = res.status;
        this.response = res.body;
        this.responseHeaders = {};
        this.requestUrl = '';
        this.data = res.body;
        this.errorText = res.statusText;
        res.headers.keys().forEach(h => {
          this.responseHeaders[h] = res.headers.get(h)!;
        });
        this.cd.detectChanges();
      },
      error: err => {
        const code = err.status ?? 'Unknown';
        const text = err.statusText || err.message || 'Request failed';
        this.status = code;
        this.requestUrl = err?.url
        this.errorText = text;
        this.msg.error(`Error ${code}: ${text}`);
        this.cd.detectChanges();
      }
    });
  }


  private arrayToMap(arr: KeyValue[]): Record<string, string> {
    return arr
      .filter(e => e.key.trim() !== '')
      .reduce((m, e) => {
        m[e.key] = e.value;
        return m;
      }, {} as Record<string, string>);
  }

  copyToClipboard(): void {
    this.coreService.showCopyMessage(this.msg);
    this.clipboardService.copyFromContent(this.editor.getText());
  }

  private flattenParameters(defs: any): Record<string, any> {
    const flat: Record<string, any> = {};

    function walk(obj: any) {
      for (const name of Object.keys(obj)) {
        flat[name] = obj[name];
        if (obj[name].listParameters) {
          walk(obj[name].listParameters);
        }
      }
    }

    walk(defs);
    return flat;
  }

  private resolvePlaceholders(obj: any, flat: Record<string, any>): any {
    if (typeof obj === 'string') {
      return obj.replace(/\{(\w+)\}/g, (_, varName) => {
        const def = flat[varName];
        if (!def) return `{${varName}}`;
        switch (def.type) {
          case 'String':
            return JSON.parse(def.default);
          case 'Map':
          case 'Map':
          case 'List':
            const defaultsObj: Record<string, any> = {};
            for (const key of Object.keys(def.listParameters || {})) {
              const paramDef = (def.listParameters as Record<string, any>)[key];
              defaultsObj[key] = paramDef.default;
            }
            return JSON.stringify(defaultsObj);
          default:
            return def.default;
        }
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolvePlaceholders(item, flat));
    }
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .map(([k, v]) => [k, this.resolvePlaceholders(v, flat)])
      );
    }
    return obj;
  }

storeConfig(): void {
  let bodyText: any;
  try {
    bodyText = JSON.parse(this.model.body);
  } catch {
    bodyText = this.model.body;
  }

  const flatDefs = this.flattenParameters(this.parameters || {});

  const editorUrl = this.resolvePlaceholders(this.model.url, flatDefs);
  const endpoint  = this.resolvePlaceholders(this.model.endPoint, flatDefs);

  const headers = this.model.headers
    .filter(h => h.key.trim())
    .map(h => ({
      key: h.key,
      value: this.resolvePlaceholders(h.value, flatDefs)
    }));
  const params  = this.model.params
    .filter(p => p.key.trim())
    .map(p => ({
      key: p.key,
      value: this.resolvePlaceholders(p.value, flatDefs)
    }));
  const body    = bodyText !== '' ? this.resolvePlaceholders(bodyText, flatDefs) : undefined;

  const cfg: any = {
    editorUrl,
    endpoint,
    method: this.model.method
  };
  if (headers.length) cfg.headers = headers;
  if (params.length)  cfg.params  = params;
  if (this.auth.type !== 'None') {
    const auth: any = { type: this.auth.type };
    if (this.auth.type === 'API Key' && this.auth.apiKey.name && this.auth.apiKey.value) {
      auth.apiKey = this.auth.apiKey;
    }
    if (this.auth.type === 'Bearer Token' && this.auth.token) {
      auth.token = this.auth.token;
    }
    if (
      this.auth.type === 'Basic Auth' &&
      (this.auth.basic.username || this.auth.basic.password)
    ) {
      auth.basic = this.auth.basic;
    }
    if (
      this.auth.type === 'OAuth 2.0' &&
      (this.auth.oauth2.clientId ||
        this.auth.oauth2.clientSecret ||
        this.auth.oauth2.tokenUrl)
    ) {
      auth.oauth2 = this.auth.oauth2;
    }
    cfg.auth = auth;
  }
  if (body !== undefined) cfg.body = body;
  if (this.mappings.length) cfg.return_variables = this.mappings;
  delete cfg.auth;
  delete cfg.method;
  delete cfg.params;
  const json = JSON.stringify(cfg, null, 2);
  this.clipboardService.copyFromContent(json);
  this.coreService.showCopyMessage(this.msg);
  this.configSaved.emit({ request: json });
  this.isVisible.emit(false);
}


  close(): void {
    if (this.isClose) {
      this.isStepBack.emit(2);
    } else {
      this.isVisible.emit(false);
    }
  }


  docs(): void {
    const modal = this.modal.create({
      nzContent: ApiRequestDialogComponent,
      nzData: {docs: true},
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
      }
    });
  }
}


@Component({
  selector: 'app-api-text-editor',
  templateUrl: './api-text-editor.html'
})

export class ApiFormDialogComponent {
  JsonSchema: any;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NzModalRef
  ) {}

  ngOnInit(): void {
    this.JsonSchema = {
  }

    this.form = this.createForm(this.JsonSchema);
  }

  createForm(schema: any): FormGroup {
    return this.fb.group(this.createControls(schema));
  }

  private createControls(schema: any): { [key: string]: any } {
    const controls: any = {};
    const required = schema.required || [];

    for (const [key, rawProp] of Object.entries(schema.properties || {})) {
      const propSchema: any = (rawProp as any).anyOf
        ? (rawProp as any).anyOf[0]
        : (rawProp as any);

      const validators = [];
      if (required.includes(key)) {
        validators.push(Validators.required);
      }
      if (propSchema.maxLength != null) {
        validators.push(Validators.maxLength(propSchema.maxLength));
      }
      if (propSchema.minLength != null) {
        validators.push(Validators.minLength(propSchema.minLength));
      }
      if (propSchema.pattern) {
        validators.push(Validators.pattern(propSchema.pattern));
      }

      switch (propSchema.type) {
        case 'object':
          controls[key] = this.fb.group(this.createControls(propSchema));
          break;

        case 'array':
          controls[key] = this.fb.array([]);
          break;

        case 'boolean':
          controls[key] = new FormControl(propSchema.default ?? false);
          break;

        case 'integer':
        case 'number':
          controls[key] = new FormControl('', validators);
          break;

        default:
          controls[key] = new FormControl('', validators);
      }
    }

    return controls;
  }


  get propertyKeys(): string[] {
    return Object.keys(this.JsonSchema.properties || {});
  }

  getFieldType(key: string): string {
    const raw = (this.JsonSchema.properties as any)[key];
    const first = raw.anyOf ? raw.anyOf[0] : raw;
    return first.type;
  }

  isArrayOfObjects(key: string): boolean {
    const raw = (this.JsonSchema.properties as any)[key];
    const first = raw.anyOf ? raw.anyOf[0] : raw;
    if (first.type === 'array' && (first.items as any).type === 'object') {
      return true;
    }
    return false;
  }

  childKeys(parentKey: string): string[] {
    const raw = (this.JsonSchema.properties as any)[parentKey];
    const first = raw.anyOf ? raw.anyOf[0] : raw;
    if (first.type === 'object' && first.properties) {
      return Object.keys(first.properties);
    }
    return [];
  }

  getChildFieldType(parentKey: string, childKey: string): string {
    const raw = (this.JsonSchema.properties as any)[parentKey];
    const first = raw.anyOf ? raw.anyOf[0] : raw;
    const childSchema = (first.properties as any)[childKey];
    const childFirst = childSchema.anyOf ? childSchema.anyOf[0] : childSchema;
    return childFirst.type;
  }

  getFormArray(key: string): FormArray {
    return this.form.get(key) as FormArray;
  }

  getNestedFormGroup(parentKey: string): FormGroup {
    return this.form.get(parentKey) as FormGroup;
  }

  getNestedFormArray(parentKey: string, childKey: string): FormArray {
    return this.getNestedFormGroup(parentKey).get(childKey) as FormArray;
  }

  getArrayElementFormGroup(arrayKey: string, i: number): FormGroup {
    return this.getFormArray(arrayKey).at(i) as FormGroup;
  }


  getNestedFormArrayForIndex(
    parentArrayKey: string,
    childKey: string,
    index: number
  ): FormArray {
    return this.getArrayElementFormGroup(parentArrayKey, index).get(
      childKey
    ) as FormArray;
  }


  addItem(arrayKey: string): void {
    const rawField = (this.JsonSchema.properties as any)[arrayKey];
    const first = rawField.anyOf ? rawField.anyOf[0] : rawField;
    if (first.type === 'array' && (first.items as any).type === 'object') {
      const itemSchema = (first.items as any) as any;
      const newGroupControls = this.createControls(itemSchema);
      const newGroup = this.fb.group(newGroupControls);
      this.getFormArray(arrayKey).push(newGroup);
      return;
    }

    this.getFormArray(arrayKey).push(new FormControl(''));
  }

  removeItem(arrayKey: string, index: number): void {
    this.getFormArray(arrayKey).removeAt(index);
  }

  addNestedItem(parentKey: string, childKey: string, indexOfParent?: number): void {
    if (indexOfParent == null) {
      this.getNestedFormArray(parentKey, childKey).push(new FormControl(''));
    } else {
      this.getNestedFormArrayForIndex(parentKey, childKey, indexOfParent).push(
        new FormControl('')
      );
    }
  }

  removeNestedItem(
    parentKey: string,
    childKey: string,
    indexOfChild: number,
    indexOfParent?: number
  ): void {
    if (indexOfParent == null) {
      this.getNestedFormArray(parentKey, childKey).removeAt(indexOfChild);
    } else {
      this.getNestedFormArrayForIndex(parentKey, childKey, indexOfParent).removeAt(
        indexOfChild
      );
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}

interface Mapping {
  name: string;
  path: string;
}

@Component({
  selector: 'app-api-request-dialog',
  templateUrl: './api-request-dialog.html'
})
export class ApiRequestDialogComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  selectedPath: string;
  variableValue: string;
  currentName = '';
  mappings: Mapping[] = [];
  list = false;
  docs = false;

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private modal: NzModalService,) {
  }

  ngOnInit(): void {
    this.variableValue = this.modalData.selectedText
    this.selectedPath = this.modalData.paths
    this.list = this.modalData.list
    this.docs = this.modalData.docs
    if (this.modalData.mapping) {
      this.mappings = this.modalData.mapping
    }
  }


  removeMapping(index: number): void {
    if (index >= 0 && index < this.mappings.length) {
      this.mappings.splice(index, 1);
      this.mappings = [...this.mappings];
    }
  }


  onSubmit(): void {
    const obj = {
      name: this.currentName,
      path: this.selectedPath
    };
    this.activeModal.close(obj);
  }

  closeWithMappings(): void {
    this.activeModal.close(this.mappings);
  }

  dynamicForm(): void {
    const modal = this.modal.create({
      nzContent: ApiFormDialogComponent,
      nzClassName: 'lg',
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
      }
    });
  }
}

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html'
})
export class JobWizardComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  existingJob: any;
  node: any;
  index = 0;
  preferences: any;
  wizard = {
    step: 1,
    checked: false,
    loading: false,
    indeterminate: false,
    token: '',
    searchText: '',
    searchText2: '',
    setOfCheckedValue: new Set<string>()
  };
  filter = {
    sortBy: 'name',
    reverse: false
  };
  jobTemplates: any = [];
  jobTree: any = [];
  jobList: any;
  job: any;
  loading = true;
  isTreeLoad = false;
  selectValue = [
    {label: 'True', value: 'true'},
    {label: 'False', value: 'false'}
  ];

  allowEmptyArguments = false;
  apiRequest = false;
  sideBar = {
    isVisible: false
  }
  savedRequestConfig: any;
  parameters: any;
  private searchTerm = new Subject<string>();

  constructor(private coreService: CoreService, private activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.sideBar.isVisible = false
    this.existingJob = this.modalData.existingJob;
    this.allowEmptyArguments = sessionStorage['allowEmptyArguments'] == 'true';
    this.node = this.modalData.node;
    this.parameters = this.modalData.parameters;
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.getJitlJobs();
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  isAnyRequiredVariable() {
    this.job.params.forEach(param => {
      if (!this.job.hasRequiredArguments) {
        this.job.hasRequiredArguments = param.required;
      }
      if (param.required) {
        this.wizard.setOfCheckedValue.add(param.name);
      }
    });
  }

  tabChange($event): void {
    this.job = {};
    this.index = $event.index;
    if ($event.index === 1) {
      if (!this.isTreeLoad) {
        this.getJobTemplates();
      }
    }
  }

  private getJitlJobs(): void {
    this.jobList = [];
    this.job = {};
    this.coreService.post('inventory/wizard/jobs', {}).subscribe({
      next: (res: any) => {
        this.jobList = res.jobs;
        this.loading = false;
      }, error: () => this.loading = false
    });
  }

  private getJobTemplates(): void {
    this.coreService.post('tree', {
      folders: [
        {folder: '/', recursive: true}
      ],
      types: [InventoryObject.JOBTEMPLATE]
    }).subscribe({
      next: (res) => {
        this.isTreeLoad = true;
        this.jobTree = this.coreService.prepareTree(res, false);
      }, error: () => {
        this.isTreeLoad = true;
      }
    });
  }

  selectNode(e): void {
    e.isExpanded = !e.isExpanded;
    if (e.isExpanded) {
      this.loadData(e);
    }
  }

  onExpand(e): void {
    this.loadData(e.node);
  }

  private loadData(e): void {
    const data = e.origin || e;
    if (!data) {
      return;
    }
    if (!data.jobTemplates) {
      e.origin.loading = true;
      const obj: any = {
        folders: [{
          folder: e.key,
          recursive: false
        }],
        compact: true
      };
      this.coreService.post('job_templates', obj).subscribe({
        next: (res: any) => {
          e.origin.loading = false;
          data.jobTemplates = res.jobTemplates;
          data.jobTemplates = sortBy(data.jobTemplates, 'name');
        }, error: () => {
          data.jobTemplates = [];
          e.origin.loading = false;
        }
      });
    }
  }

  clearSearchInput(): void {
    this.jobTemplates = [];
    this.wizard.searchText2 = '';
  }

  onSearchInput(searchValue: string) {
    this.searchTerm.next(searchValue);
  }

  private searchObjects(value: string) {
    if (value !== '') {
      const searchValueWithoutSpecialChars = value.replace(/[^\w\s]/gi, '');
      if (searchValueWithoutSpecialChars.length >= 2) {
        this.wizard.loading = true;
        const request: any = {
          search: value,
          returnTypes: ["JOBTEMPLATE"]
        };
        if (this.wizard.token) {
          request.token = this.wizard.token;
        }
        this.coreService.post('inventory/quick/search', request).subscribe({
          next: (res: any) => {
            this.wizard.token = res.token;
            this.jobTemplates = res.results;
            this.wizard.loading = false;
          }, error: () => this.wizard.loading = false
        });
      }
    } else {
      this.jobTemplates = [];
    }
  }

  selectJob(job): void {
    this.coreService.post('inventory/wizard/job', {
      assignReference: job.assignReference
    }).subscribe((res) => {
      this.job = res;
      this.job.paramList = [];
      this.wizard.setOfCheckedValue = new Set<string>();
      this.wizard.checked = false;
      this.wizard.indeterminate = false;
      this.checkRequiredParam();
      this.isAnyRequiredVariable();
    });
  }

  selectJobTemp(job): void {
    if (job.loading == undefined) {
      job.loading = true;
      this.coreService.post('job_template', {
        jobTemplatePath: job.path
      }).subscribe({
        next: (res) => {
          job.loading = false;
          this.job = res.jobTemplate;
          if (this.job.arguments) {
            const temp = this.coreService.clone(this.job.arguments);
            this.job.arguments = Object.entries(temp).map(([k, v]) => {
              const val: any = v;
              if (val.default) {
                delete val.listParameters;
                if (val.type === 'String') {
                  this.coreService.removeSlashToString(val, 'default');
                } else if (val.type === 'Boolean') {
                  val.default = (val.default === true || val.default === 'true');
                }
              }
              if (val.list) {
                let list = [];
                val.list.forEach((val) => {
                  let obj = {name: val};
                  this.coreService.removeSlashToString(obj, 'name');
                  list.push(obj);
                });
                val.list = list;
              }
              return {
                name: k,
                type: val.type,
                description: val.description,
                required: val.required,
                defaultValue: val.default,
                list: val.list,
                facet: val.facet,
                message: val.message
              };
            });
          }
          this.job.jobTemplate = true;
          this.job.paramList = [];
          this.wizard.setOfCheckedValue = new Set<string>();
          this.wizard.checked = false;
          this.wizard.indeterminate = false;
          this.checkRequiredParam(true);
          this.isAnyRequiredVariable();
        }, error: () => {
          job.loading = false;
        }
      });
    }
  }

  addParameter(): void {
    const param = {
      name: '',
      newValue: ''
    };
    if (!this.coreService.isLastEntryEmpty(this.job.paramList, 'name', '')) {
      this.job.paramList.push(param);
    }
  }

  removeParams(index): void {
    this.job.paramList.splice(index, 1);
  }

  next(): void {
    this.wizard.step = this.wizard.step + 1;
    if (!this.jobList) {
      this.getJitlJobs();
    }
    if (this.wizard.step === 3) {
      this.sideBar.isVisible = true
    }
  }

  back(): void {
    this.wizard.step = this.wizard.step - 1;
  }

  onKeyPress($event): void {
    const key = $event.keyCode || $event.which;
    if (key == '13') {
      this.addParameter();
    }
  }

  checkCheckbox(param): void {
    if (param.newValue && param.newValue !== param.defaultValue) {
      this.wizard.setOfCheckedValue.add(param.name);
    }
  }

  showDoc(docName): void {
    this.coreService.showDocumentation(docName, this.preferences);
  }

  ok(): void {
    let obj: any = {};
    if (!this.job.jobTemplate) {
      obj = {
        executable: {
          TYPE: 'InternalExecutable',
          className: this.job.javaClass,
          arguments: []
        },
        documentationName: this.job.assignReference,
      };
      this.updateParam(obj);
    } else {
      obj = this.coreService.clone(this.job);
      obj.jobTemplateName = this.job.name;
      delete obj.jobTemplate;
      delete obj.paramList;
      delete obj.params;
      delete obj.version;
      if (obj.executable.TYPE !== 'InternalExecutable') {
        delete obj.arguments;
      }
      this.updateParam(obj);
    }
    obj.title = this.job.title;

    if (this.node) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.close(this.job);
    }
  }

  private updateParam(obj): void {
    this.job.params.forEach(item => {
      if (this.wizard.setOfCheckedValue.has(item.name)) {
        if (obj.executable.TYPE === 'InternalExecutable') {
          if (!obj.executable.arguments) {
            obj.executable.arguments = [];
          }
          obj.executable.arguments.push({name: item.name, value: item.newValue});
        } else if (this.node) {
          if (!this.node.defaultArguments) {
            this.node.defaultArguments = []
          }
          if (!this.checkAlreadyExistArgu(item)) {
            this.node.defaultArguments.push({name: item.name, value: item.newValue + ''});
          }
        }
      }
    });
    if (this.job.paramList && this.job.paramList.length > 0) {
      for (const i in this.job.paramList) {
        if (this.job.paramList[i].name) {
          if (obj.executable.TYPE === 'InternalExecutable') {
            obj.executable.arguments.push({name: this.job.paramList[i].name, value: this.job.paramList[i].newValue});
          } else if (this.node) {
            if (!this.checkAlreadyExistArgu(this.job.paramList[i])) {
              if (this.job.paramList[i].newValue) {
                this.node.defaultArguments.push({
                  name: this.job.paramList[i].name,
                  value: this.job.paramList[i].newValue + ''
                });
              }
            }
          }
        }
      }
    }
  }

  private checkAlreadyExistArgu(item): boolean {
    let list = false;
    let index = -1;
    for (let i = 0; i < this.node.defaultArguments.length; i++) {
      if (!this.node.defaultArguments[i].name) {
        index = i;
      }
      if (this.node.defaultArguments[i].name === item.name) {
        if (item.newValue || item.newValue === false || item.newValue === 0) {
          this.node.defaultArguments[i].value = item.newValue + '';
        } else if (this.node.defaultArguments[i].value == '') {
          this.node.defaultArguments[i].value = item.defaultValue + '';
        }
        list = true;
        break;
      }
    }
    if (index > -1) {
      this.node.defaultArguments.splice(index, 1);
    }
    return list;
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  /*--------------- Checkbox functions -------------*/

  onAllChecked(isChecked: boolean): void {
    this.job.params.forEach(item => this.updateCheckedSet(item, isChecked));
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item, checked);
  }

  updateCheckedSet(data: any, checked: boolean): void {
    if (data.name && (data.newValue || data.newValue == 0 || data.newValue == false)) {
      if (checked) {
        this.wizard.setOfCheckedValue.add(data.name);
      } else {
        this.wizard.setOfCheckedValue.delete(data.name);
      }
    }
    this.wizard.checked = this.job.params.every(item => {
      return this.wizard.setOfCheckedValue.has(item.name);
    });
    this.wizard.indeterminate = this.wizard.setOfCheckedValue.size > 0 && !this.wizard.checked;
  }

  sort(key): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = key;
  }

  checkRequiredParam(checkType?): void {
    let existingArguments = [];
    if (!this.job.params) {
      this.job.params = [];
    }
    if (checkType) {
      if (this.job.arguments && this.job.arguments.length > 0) {
        this.job.params = this.coreService.clone(this.job.arguments);
      }
    } else {
      if (this.job.arguments) {
        if (!isArray(this.job.arguments)) {
          this.job.params = Object.entries(this.job.arguments).map(([k, v]) => {
            const val: any = v;
            return {
              name: k,
              required: val.required,
              description: val.description,
              type: val.type,
              defaultValue: val.default
            };
          });
        }
      }
      if (this.existingJob.executable.arguments && this.existingJob.executable.arguments.length > 0) {
        existingArguments = this.coreService.clone(this.existingJob.executable.arguments);
      }
    }
    const arr2 = [];
    if (this.job.params.length > 0) {
      let arr = [];
      for (let i = 0; i < this.job.params.length; i++) {
        for (let j = 0; j < existingArguments.length; j++) {
          if (existingArguments[j].name === this.job.params[i].name) {
            this.job.params[i].newValue = existingArguments[j].value;
            this.wizard.setOfCheckedValue.add(existingArguments[j].name);
            existingArguments.splice(j, 1);
            break;
          }
        }
        if ((this.job.params[i].defaultValue || this.job.params[i].defaultValue === false || this.job.params[i].defaultValue === 0)
          && (!this.job.params[i].newValue && this.job.params[i].newValue != 0 && this.job.params[i].newValue != false)) {
          this.job.params[i].newValue = this.job.params[i].defaultValue;
        }
        if (this.job.params[i].required) {
          arr2.push(this.job.params[i]);
        } else {
          arr.push(this.job.params[i]);
        }
      }
      this.job.params = arr2.concat(arr);
    }
    if (existingArguments.length > 0) {
      for (const j in existingArguments) {
        this.job.paramList.push({
          name: existingArguments[j].name,
          newValue: existingArguments[j].value
        });
      }
    }
  }


  onApiConfigSaved(config: any) {
    this.apiRequest = true;
    this.savedRequestConfig = config.request;
    const obj = {
      executable: {
        TYPE: 'InternalExecutable',
        className: this.job.javaClass,
        arguments: []
      },
      documentationName: this.job.assignReference,
    };
    if (obj.executable.TYPE === 'InternalExecutable') {
      if (!obj.executable.arguments) {
        obj.executable.arguments = [];
      }
      if (config.baseUrl) {
        obj.executable.arguments.push({
          name: 'js7.api-server.url',
          value: config.baseUrl
        });
      }
      obj.executable.arguments.push({name: 'request', value: config.request});
      if (config.return_variables && config.return_variables.length > 0) {
        const flattened = config.return_variables.map(m => ({
          name: m.name,
          path: Array.isArray(m.path) ? m.path[0] : m.path
        }));
        const returnVariablesJson = JSON.stringify(flattened, null, 2);

        obj.executable.arguments.push({name: 'return_variable', value: returnVariablesJson});
      }
    }
    this.activeModal.close(obj);
  }


}
