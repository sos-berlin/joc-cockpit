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
  Validators, AbstractControl,
} from '@angular/forms';
import {properties} from "ng-zorro-antd/core/util";
import {TranslateService} from "@ngx-translate/core";
import { firstValueFrom } from 'rxjs';

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
  errorLogs: any;
  showLogs = false;
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
    private translate: TranslateService,
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

    const raw = requestArg.value;

    try {
      const req = JSON.parse(raw);

      this.model.endPoint = req.endpoint || this.model.endPoint;
      this.model.method = req.method || this.model.method;
      this.model.headers = Array.isArray(req.headers) ? req.headers : [];
      this.model.params = Array.isArray(req.params) ? req.params : [];

      if (req.body != null) {
        if (typeof req.body === 'string') {
          try {
            const parsed = JSON.parse(req.body);
            this.model.body = JSON.stringify(parsed, null, 2);
          } catch {
            this.model.body = req.body;
          }
        } else {
          this.model.body = JSON.stringify(req.body, null, 2);
        }
      } else {
        this.model.body = '';
      }

      // — auth
      if (req.auth && typeof req.auth === 'object') {
        const a = req.auth as any;
        this.auth.type = a.type ?? 'None';
        if (this.auth.type === 'API Key' && a.apiKey) {
          this.auth.apiKey = {
            name: a.apiKey.name || '',
            value: a.apiKey.value || '',
            in: a.apiKey.in || 'header'
          };
        }
        if (this.auth.type === 'Bearer Token' && a.token) {
          this.auth.token = a.token;
        }
        if (this.auth.type === 'Basic Auth' && a.basic) {
          this.auth.basic = {
            username: a.basic.username || '',
            password: a.basic.password || ''
          };
        }
        if (this.auth.type === 'OAuth 2.0' && a.oauth2) {
          this.auth.oauth2 = {
            clientId: a.oauth2.clientId || '',
            clientSecret: a.oauth2.clientSecret || '',
            tokenUrl: a.oauth2.tokenUrl || ''
          };
          (this.auth as any).oauth2.accessToken = a.oauth2.accessToken;
        }
      }

      // — return variables
      const ret = execArgs.find(a => a.name === 'return_variables' || a.name === 'return_variable');
      if (ret) {
        try {
          const arr = JSON.parse(ret.value);
          if (Array.isArray(arr)) {
            this.mappings = arr;
          }
        } catch { /* ignore */
        }
      }

      return;
    } catch {

      // endpoint
      const ep = raw.match(/"endpoint"\s*:\s*"([^"]*)"/);
      if (ep) this.model.endPoint = ep[1];

      // method
      const m = raw.match(/"method"\s*:\s*"([^"]*)"/);
      if (m) this.model.method = m[1];

      // headers
      const hdrBlock = raw.match(/"headers"\s*:\s*\[([\s\S]*?)\]/);
      if (hdrBlock) {
        const items: KeyValue[] = [];
        for (const h of hdrBlock[1].matchAll(
          /\{\s*"key"\s*:\s*"([^"]*)"\s*,\s*"value"\s*:\s*"([^"]*)"\s*\}/g
        )) {
          items.push({key: h[1], value: h[2]});
        }
        this.model.headers = items;
      }

      const bodyKey = '"body"';
      const keyIdx = raw.indexOf(bodyKey);
      if (keyIdx !== -1) {
        const braceStart = raw.indexOf('{', keyIdx + bodyKey.length);
        if (braceStart !== -1) {
          let depth = 0;
          let endIdx = -1;
          for (let i = braceStart; i < raw.length; i++) {
            if (raw[i] === '{') depth++;
            else if (raw[i] === '}') {
              depth--;
              if (depth === 0) {
                endIdx = i;
                break;
              }
            }
          }
          if (endIdx > braceStart) {
            this.model.body = raw.substring(braceStart, endIdx + 1).trim();
          }
        }
      }

      return;
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
    const line = aceEditor.getSession().getLine(cursor.row);
    const m = line.match(/^\s*"([^"]+)"\s*:/);
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
      this.openModal(candidates[0]);
      return;
    }
    const doc = aceEditor.getSession().getDocument();
    const cursorIdx = (doc as any).positionToIndex(cursor);
    let occurrence = 0;
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] <= cursorIdx) occurrence = i;
      else break;
    }

    const chosenPath = candidates[occurrence] || candidates[0];
    this.openModal(chosenPath);
  }

  private openModal(path: string) {
    const jq = this.toJqPath(path);
    const modal = this.modal.create({
      nzContent: ApiRequestDialogComponent,
      nzData: {selectedText: jq, paths: [jq], list: false},
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
  toJqPath(path: string | Array<string | number>): string {
    const segments: Array<string | number> =
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

  updateBasicAuthHeader(): void {
    if (this.auth.type !== 'Basic Auth') return;

    const {username, password} = this.auth.basic;

    this.model.headers = this.model.headers.filter(
      h => h.key.toLowerCase() !== 'authorization'
    );

    if (username && password) {
      const token = btoa(`${username}:${password}`);
      this.model.headers.push({
        key: 'Authorization',
        value: `Basic ${token}`
      });
    }
  }


  sendRequest(accessToken?): void {
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

    if (accessToken) {
      hdrs['x-access-token'] = accessToken;
    }
    const {endPoint, method, params, body} = this.model;
    const simplePlaceholder = /\$\{(\w+)\}/g;
    const replacePlaceholders = (input: string) =>
      input.replace(simplePlaceholder, (_m, name) => {
        const def = this.parameters?.[name]?.default;
        if (def != null) {
          try {
            return JSON.parse(def) + '';
          } catch {
            return def;
          }
        }
        return `{${name}}`;
      });

    const bodyPlaceholder = /\$\{(\w+)\}|\$(\w+)/g;
    const replaceBodyPlaceholders = (input: string) =>
      input.replace(bodyPlaceholder, (match, p1, p2, offset) => {
        const name = p1 || p2!;
        const def = this.parameters?.[name]?.default;
        if (def == null) return match;
        const before = input[offset - 1], after = input[offset + match.length];
        const inQuotes = before === '"' && after === '"';
        try {
          const parsed = JSON.parse(def);
          if (typeof parsed === 'string') {
            return inQuotes ? parsed : JSON.stringify(parsed);
          } else {
            return String(parsed);
          }
        } catch {
          return inQuotes ? def : JSON.stringify(def);
        }
      });


    const base = this.getBaseUrl();
    const resolvedEp = replacePlaceholders(this.model.endPoint || '');
    const safeEp = resolvedEp.startsWith('/') ? resolvedEp : `/${resolvedEp}`;
    const fullUrl = `${base}${safeEp}`;

    const resolvedHdrs: Record<string, string> = {};
    Object.entries(hdrs).forEach(([rawKey, rawValue]) => {
      const key = replacePlaceholders(rawKey);
      const value = replacePlaceholders(rawValue);
      resolvedHdrs[key] = value;
    });

    const paramMap = this.arrayToMap(params);
    Object.keys(paramMap).forEach(k => {
      paramMap[k] = replacePlaceholders(paramMap[k]);
    });

    let resolvedBody: any = body;
    if (typeof resolvedBody === 'string') {
      resolvedBody = replaceBodyPlaceholders(resolvedBody);
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
          if (accessToken) {
            const logoutHeaders: Record<string, string> = {
              'x-access-token': accessToken
            };

            this.coreService.requestTest(
              'POST',
              `${base}/authentication/logout`,
              logoutHeaders,
              {},
              null
            ).subscribe({
              next: () => {
              },
              error: (err) => {
                const code = err.status ?? 'Unknown';
                const text = err.statusText || err.message || 'Request failed';
                this.status = code;
                this.errorLogs = err;
                this.requestUrl = err?.url
                this.errorText = text;
                this.msg.error(`Error ${code}: ${text}`);
                this.cd.detectChanges();
              }
            });
          }
        },
        error: err => {
          const code = err.status ?? 'Unknown';
          const text = err.statusText || err.message || 'Request failed';
          this.status = code;
          this.requestUrl = err?.url
          this.errorLogs = err;
          this.errorText = text;
          this.msg.error(`Error ${code}: ${text}`);
          this.cd.detectChanges();
        }
      });
  }

  send(): any {
    this.status = null;
    this.response = '';
    this.requestUrl = '';
    this.data = '';
    this.errorText = '';
    const existing = this.model.headers
      .find(h => h.key.trim().toLowerCase() === 'authorization' && h.value.trim());

    let authHeaderValue: string;

    if (existing) {
      authHeaderValue = existing.value.trim();
    } else {
      const {username, password} = this.auth.basic;
      if (!username || !password) {
        this.msg.error('Username and password are required for Basic Auth login.');
        return;
      }
      const creds = btoa(`${username}:${password}`);
      authHeaderValue = `Basic ${creds}`;
    }

    const base = this.getBaseUrl();

    this.coreService.requestTest(
      'POST',
      `${base}/authentication/login`,
      {Authorization: authHeaderValue},
      {},
      null
    ).subscribe({
      next: data => this.sendRequest(data.body.accessToken),
      error: () => this.msg.error('Login failed.')
    });
  }


  private getBaseUrl(): string {
    const {origin, port, pathname} = window.location;
    let base = (origin + pathname).replace(/\/$/, '');
    const lc = base.toLowerCase();

    if (port === '4200') {
      return base + '/api';
    }
    if (lc.includes('/joc/api')) {
      return base;
    }
    if (lc.includes('/joc')) {
      return base + '/api';
    }
    return base + '/joc/api';
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

  storeConfig(): void {
    let bodyText: any;
    try {
      bodyText = JSON.parse(this.model.body);
    } catch {
      bodyText = this.model.body;
    }


    const endpoint = this.model.endPoint

    const headers = this.model.headers
      .filter(h => h.key.trim())
      .map(h => ({
        key: h.key,
        value: h.value
      }));
    const params = this.model.params
      .filter(p => p.key.trim())
      .map(p => ({
        key: p.key,
        value: p.value
      }));
    const body = bodyText !== '' ? bodyText : undefined;

    const cfg: any = {
      endpoint,
      method: this.model.method
    };
    if (headers.length) cfg.headers = headers;
    if (params.length) cfg.params = params;
    if (this.auth.type !== 'None') {
      const auth: any = {type: this.auth.type};
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
    delete cfg.auth;
    delete cfg.params;

    const rawBody = this.model.body?.trim();
    let json: string;

    if (rawBody) {
      let parsedBody;
      let isJson = false;

      try {
        parsedBody = JSON.parse(rawBody);
        isJson = true;
      } catch {
        isJson = false;
      }

      if (isJson) {
        cfg.body = parsedBody;
        json = JSON.stringify(cfg, null, 2);
      } else if (/\$\w+/.test(rawBody)) {
        delete cfg.body;
        const prefix = JSON.stringify(cfg, null, 2).replace(/\}$/, '');
        const bodyPart = rawBody.endsWith('}') ? rawBody : `${rawBody}\n`;
        json = `${prefix},\n  "body": ${bodyPart}\n}`;
      } else {
        cfg.body = rawBody;
        json = JSON.stringify(cfg, null, 2);
      }
    } else {
      json = JSON.stringify(cfg, null, 2);
    }

    const out: any = {request: json};
    if (this.mappings.length) out.return_variables = this.mappings;
    this.clipboardService.copyFromContent(json);
    this.coreService.showCopyMessage(this.msg);
    this.configSaved.emit(out);
    this.isVisible.emit(false);
  }

  close(): void {
    if (this.isClose) {
      this.isStepBack.emit(2);
    } else {
      this.isVisible.emit(false);
    }
  }

  toggleLogs() {
    this.showLogs = !this.showLogs;
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
        this.model.body = JSON.stringify(result, null, 2)
        this.ref.detectChanges();
      }
    });
  }
}

@Component({
  selector: 'json-schema-field',
  templateUrl: './json-schema-field.component.html'
})
export class JsonSchemaFieldComponent {
  @Input() propertyPath: string[] = [];
  @Input() schema: any;
  @Input() formControl: AbstractControl | null;
  @Input() parent: any; // Reference to parent component

  get fieldName(): string {
    return this.propertyPath[this.propertyPath.length - 1];
  }

  get currentSchema(): any {
    return this.parent.getSchemaForProperty(this.propertyPath);
  }

  // TYPE CHECKING METHODS
  isStringField(): boolean {
    const type = this.currentSchema?.type;
    return type === 'string';
  }

  isNumberField(): boolean {
    const type = this.currentSchema?.type;
    return type === 'number' || type === 'integer';
  }

  isBooleanField(): boolean {
    return this.currentSchema?.type === 'boolean';
  }

  isObjectField(): boolean {
    return this.currentSchema?.type === 'object';
  }

  isArrayField(): boolean {
    return this.currentSchema?.type === 'array';
  }

  isMapField(): boolean {
    return this.isObjectField() && this.currentSchema?.additionalProperties === true;
  }

  // VALUE UPDATE METHODS
  updateValue(event: any): void {
    if (this.formControl) {
      this.formControl.setValue(event.target.value);
      this.formControl.markAsTouched();
    }
  }

  updateBooleanValue(event: any): void {
    if (this.formControl) {
      this.formControl.setValue(event.target.checked);
      this.formControl.markAsTouched();
    }
  }

  // OBJECT FIELD METHODS
  getObjectProperties(): string[] {
    return Object.keys(this.currentSchema?.properties || {});
  }

  getChildPath(childKey: string): string[] {
    return [...this.propertyPath, childKey];
  }

  getChildControl(childKey: string): AbstractControl | null {
    return (this.formControl as FormGroup)?.get(childKey) || null;
  }

  // MAP FIELD METHODS
  getMapEntries(): FormGroup[] {
    if (!this.formControl) return [];
    return (this.formControl as FormArray).controls as FormGroup[];
  }

  addMapEntry(): void {
    this.parent.addMapEntry(this.propertyPath);
  }

  removeMapEntry(index: number): void {
    this.parent.removeMapEntry(this.propertyPath, index);
  }

  updateMapKey(index: number, event: any): void {
    if (!this.formControl) return;
    const mapArray = this.formControl as FormArray;
    const entryGroup = mapArray.at(index) as FormGroup;
    entryGroup.get('key')?.setValue(event.target.value);
  }

  updateMapValue(index: number, event: any): void {
    if (!this.formControl) return;
    const mapArray = this.formControl as FormArray;
    const entryGroup = mapArray.at(index) as FormGroup;
    entryGroup.get('value')?.setValue(event.target.value);
  }

  // ARRAY FIELD METHODS
  getArrayControls(): AbstractControl[] {
    if (!this.formControl) return [];
    return (this.formControl as FormArray).controls;
  }

  addArrayItem(): void {
    this.parent.addArrayItem(this.propertyPath);
  }

  removeArrayItem(index: number): void {
    this.parent.removeArrayItem(this.propertyPath, index);
  }

  isArrayOfPrimitives(): boolean {
    const itemSchema = this.parent.resolveAnyOf(this.currentSchema?.items);
    return itemSchema?.type !== 'object';
  }

  getArrayItemType(): string {
    const itemSchema = this.parent.resolveAnyOf(this.currentSchema?.items);
    return itemSchema?.type || 'string';
  }

  getArrayItemObjectProperties(): string[] {
    const itemSchema = this.parent.resolveAnyOf(this.currentSchema?.items);
    return Object.keys(itemSchema?.properties || {});
  }

  getArrayItemChildPath(itemIndex: number, childKey: string): string[] {
    return [...this.propertyPath, itemIndex.toString(), childKey];
  }

  getArrayItemChildControl(itemIndex: number, childKey: string): AbstractControl | null {
    const arrayControl = this.formControl as FormArray;
    const itemControl = arrayControl?.at(itemIndex) as FormGroup;
    return itemControl?.get(childKey) || null;
  }

  updateArrayItemValue(index: number, event: any): void {
    if (!this.formControl) return;
    const arrayControl = this.formControl as FormArray;
    arrayControl.at(index)?.setValue(event.target.value);
  }

  updateArrayItemBooleanValue(index: number, event: any): void {
    if (!this.formControl) return;
    const arrayControl = this.formControl as FormArray;
    arrayControl.at(index)?.setValue(event.target.checked);
  }
}
@Component({
  selector: 'app-api-text-editor',
  templateUrl: './api-text-editor.html'
})

export class ApiFormDialogComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  JsonSchema: any;
  title: any;
  form: FormGroup;
  loading = false;
  private schemaCache = new Map<string, any>();

  constructor(
    private fb: FormBuilder,
    public activeModal: NzModalRef,
    private coreService: CoreService,
  ) {}

  ngOnInit(): void {
    this.title = this.modalData.title;
    this.loadSchema(this.modalData.endPoint);
  }

  private async loadSchema(ep: string) {
    this.loading = true;
    const origin = window.location.origin
    try {
      const schemaUrl = `${origin}/joc/schemas/api/schemas${ep}-schema.json`;
      const rawSchema: any = await firstValueFrom(this.coreService.post(schemaUrl, {}));
      this.JsonSchema = await this.resolveAllRefs(rawSchema, ep);
      this.form = this.createForm(this.JsonSchema);
    } catch (e) {
      console.error('Schema load error:', e);
    } finally {
      this.loading = false;
    }
  }

  private async resolveAllRefs(schema: any, basePath: string = ''): Promise<any> {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    if (Array.isArray(schema)) {
      const resolved = [];
      for (const item of schema) {
        resolved.push(await this.resolveAllRefs(item, basePath));
      }
      return resolved;
    }

    if (schema.$ref) {
      const refUrl = this.resolveRefUrl(schema.$ref, basePath);

      if (this.schemaCache.has(refUrl)) {
        return this.schemaCache.get(refUrl);
      }

      try {
        const referencedSchema = await firstValueFrom(this.coreService.post(refUrl, {}));
        const resolvedRef = await this.resolveAllRefs(referencedSchema, this.getBasePath(refUrl));
        this.schemaCache.set(refUrl, resolvedRef);
        return resolvedRef;
      } catch (error) {
        console.error(`Failed to fetch referenced schema: ${refUrl}`, error);
        return { type: 'string', description: `Failed to load reference: ${schema.$ref}` };
      }
    }

    const resolved: any = {};
    for (const [key, value] of Object.entries(schema)) {
      resolved[key] = await this.resolveAllRefs(value, basePath);
    }

    return resolved;
  }

  private resolveRefUrl(ref: string, basePath: string): string {
    const origin = window.location.origin
    const baseUrl = `${origin}/joc/schemas/api/schemas`;

    if (ref.startsWith('../')) {
      const cleanRef = ref.replace(/^\.\.\//, '');
      return `${baseUrl}/${cleanRef}`;
    } else if (ref.startsWith('./')) {
      const cleanRef = ref.replace(/^\.\//, '');
      const baseDir = this.getDirectoryFromPath(basePath);
      return `${baseUrl}/${baseDir}/${cleanRef}`;
    } else if (!ref.startsWith('http')) {
      const baseDir = this.getDirectoryFromPath(basePath);
      if (baseDir) {
        return `${baseUrl}/${baseDir}/${ref}`;
      } else {
        return `${baseUrl}/${ref}`;
      }
    }

    return ref;
  }

  private getBasePath(url: string): string {
    const origin = window.location.origin
    const baseUrl = `${origin}/joc/schemas/api/schemas/`;
    if (url.startsWith(baseUrl)) {
      return url.substring(baseUrl.length);
    }
    return '';
  }

  private getDirectoryFromPath(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    if (lastSlash > 0) {
      return path.substring(0, lastSlash);
    }
    return '';
  }

  // RECURSIVE FORM CREATION
  private createForm(schema: any): FormGroup {
    return this.fb.group(this.createControlsRecursive(schema));
  }

  private createControlsRecursive(schema: any): { [key: string]: any } {
    const controls: any = {};
    const properties = schema.properties || {};
    const required = schema.required || [];

    for (const [key, rawProp] of Object.entries(properties)) {
      const propSchema = this.resolveAnyOf(rawProp);
      const validators = this.createValidators(propSchema, required.includes(key));

      controls[key] = this.createControlForType(propSchema, validators);
    }

    return controls;
  }

  private createControlForType(schema: any, validators: any[] = []): AbstractControl {
    const resolvedSchema = this.resolveAnyOf(schema);

    switch (resolvedSchema.type) {
      case 'object':
        if (resolvedSchema.additionalProperties === true) {
          // Map/Dictionary type
          return this.fb.array([]);
        } else {
          // Regular object with defined properties
          return this.fb.group(this.createControlsRecursive(resolvedSchema));
        }

      case 'array':
        return this.fb.array([]);

      case 'boolean':
        return new FormControl(resolvedSchema.default ?? false, validators);

      case 'integer':
      case 'number':
        return new FormControl('', validators);

      default:
        // String or unknown type
        return new FormControl('', validators);
    }
  }

  private resolveAnyOf(schema: any): any {
    if (schema?.anyOf && Array.isArray(schema.anyOf)) {
      return schema.anyOf[0];
    }
    return schema;
  }

  private createValidators(schema: any, isRequired: boolean): any[] {
    const validators = [];

    if (isRequired) validators.push(Validators.required);
    if (schema.maxLength != null) validators.push(Validators.maxLength(schema.maxLength));
    if (schema.minLength != null) validators.push(Validators.minLength(schema.minLength));
    if (schema.pattern) validators.push(Validators.pattern(schema.pattern));
    if (schema.minimum != null) validators.push(Validators.min(schema.minimum));
    if (schema.maximum != null) validators.push(Validators.max(schema.maximum));

    return validators;
  }

  // HELPER METHODS FOR TEMPLATE
  get rootPropertyKeys(): string[] {
    return Object.keys(this.JsonSchema?.properties || {});
  }

  getSchemaForProperty(propertyPath: string[]): any {
    let schema = this.JsonSchema;

    for (const key of propertyPath) {
      if (schema.properties && schema.properties[key]) {
        schema = this.resolveAnyOf(schema.properties[key]);
      } else if (schema.items) {
        schema = this.resolveAnyOf(schema.items);
      } else {
        return null;
      }
    }

    return schema;
  }

  getFieldType(propertyPath: string[]): string {
    const schema = this.getSchemaForProperty(propertyPath);
    return schema?.type || 'string';
  }

  getFormControl(propertyPath: string[]): AbstractControl | null {
    let control: AbstractControl | null = this.form;

    for (const key of propertyPath) {
      if (control instanceof FormGroup) {
        control = control.get(key);
      } else if (control instanceof FormArray) {
        const index = parseInt(key, 10);
        control = control.at(index);
      } else {
        control = null;
      }

      if (!control) break;
    }

    return control;
  }

  // DYNAMIC ARRAY OPERATIONS
  addArrayItem(propertyPath: string[]): void {
    const arrayControl = this.getFormControl(propertyPath) as FormArray;
    const schema = this.getSchemaForProperty(propertyPath);
    const itemSchema = this.resolveAnyOf(schema.items);

    const newControl = this.createControlForType(itemSchema);
    arrayControl.push(newControl);
  }

  removeArrayItem(propertyPath: string[], index: number): void {
    const arrayControl = this.getFormControl(propertyPath) as FormArray;
    arrayControl.removeAt(index);
  }

  // MAP/DICTIONARY OPERATIONS
  addMapEntry(propertyPath: string[]): void {
    const mapArray = this.getFormControl(propertyPath) as FormArray;
    const entryGroup = this.fb.group({
      key: ['', Validators.required],
      value: ['']
    });
    mapArray.push(entryGroup);
  }

  removeMapEntry(propertyPath: string[], index: number): void {
    const mapArray = this.getFormControl(propertyPath) as FormArray;
    mapArray.removeAt(index);
  }

  // UTILITY METHODS
  isObjectType(propertyPath: string[]): boolean {
    return this.getFieldType(propertyPath) === 'object';
  }

  isArrayType(propertyPath: string[]): boolean {
    return this.getFieldType(propertyPath) === 'array';
  }

  isMapType(propertyPath: string[]): boolean {
    const schema = this.getSchemaForProperty(propertyPath);
    return schema?.type === 'object' && schema?.additionalProperties === true;
  }

  isBooleanType(propertyPath: string[]): boolean {
    return this.getFieldType(propertyPath) === 'boolean';
  }

  isNumberType(propertyPath: string[]): boolean {
    const type = this.getFieldType(propertyPath);
    return type === 'number' || type === 'integer';
  }

  getObjectProperties(propertyPath: string[]): string[] {
    const schema = this.getSchemaForProperty(propertyPath);
    return Object.keys(schema?.properties || {});
  }

  getArrayLength(propertyPath: string[]): number {
    const arrayControl = this.getFormControl(propertyPath) as FormArray;
    return arrayControl ? arrayControl.length : 0;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.activeModal.close(this.form.value);
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
interface Mapping {
  name: string;
  path: string;
}
export interface endPoint {
  title: string;
  path: string;
  des: string;
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
  newMapping: { name: string; path: string } = {name: '', path: ''};
  isAdding = false;
  selectedRows = new Set<number>();
  editingIndex: number | null = null;
  endpoints: endPoint[] = [
    { title: '/agents',                         path: '/agent/readAgents',                                     des: 'Gets Agents' },
    { title: '/agents/cluster',                 path: '/agent/readSubagentClusters',                           des: 'Gets Subagent Clusters' },
    { title: '/agents/report',                  path: '/agent/agentReportFilter',                              des: 'Gets report of Agent tasks' },
    { title: '/controller',                     path: '/controller/urlParam',                                   des: 'Gets Controller status information' },
    { title: '/controllers',                    path: '/controller/controllerId-optional',                     des: 'Gets Controllers' },
    { title: '/daily_plan/orders',              path: '/orderManagement/dailyplan/dailyPlanOrdersFilterDefRequired', des: 'Gets orders from a daily plan interval' },
    { title: '/daily_plan/orders/cancel',       path: '/orderManagement/dailyplan/dailyPlanOrdersFilterDef',  des: 'Cancels submitted orders for a daily plan interval' },
    { title: '/daily_plan/orders/generate',     path: '/dailyplan/generate/generate-request',                 des: 'Generates orders for a given daily plan' },
    { title: '/daily_plan/orders/submit',       path: '/orderManagement/dailyplan/dailyPlanOrdersFilterDef',  des: 'Submits planned orders for a daily plan interval' },
    { title: '/daily_plan/orders/delete',       path: '/orderManagement/dailyplan/dailyPlanOrdersFilterDef',  des: 'Deletes planned orders for a daily plan interval' },
    { title: '/daily_plan/orders/summary',      path: '/orderManagement/dailyplan/dailyPlanOrdersFilterDef',  des: 'Gets summary order counts from a daily plan interval' },
    { title: '/daily_plan/projections/calendar',path: '/dailyplan/projections/projections-request',            des: 'Gets the days of the daily plan projections that have start times' },
    { title: '/daily_plan/projections/dates',   path: '/dailyplan/projections/projections-request',           des: 'Gets the start times of date range of the daily plan projections' },
    { title: '/daily_plan/projections/recreate',path: '/common/ok',                                            des: '(Re)creates daily plan projections' },
    { title: '/joc/license',                    path: '/joc/js7LicenseInfo',                                   des: 'shows information about the currently used SOS JS7 License ' },
    { title: '/joc/version',                    path: '/joc/version',                                          des: 'Get JOC\'s version' },
    { title: '/joc/versions',                   path: '/joc/versionsFilter',                                   des: 'Reads the versions of the specified JS7 components.' },
    { title: '/jocs',                           path: '/controller/jocFilter',                                 des: 'Gets JOC Cockpit instances' },
    { title: '/orders',                         path: '/order/ordersFilterV',                                  des: 'Returns a collection of orders filtered by workflow or order state' },
    { title: '/orders/add',                     path: '/order/addOrders',                                      des: 'Add orders' },
    { title: '/orders/cancel',                  path: '/order/modifyOrders',                                   des: 'Cancels orders' },
    { title: '/orders/confirm',                 path: '/order/modifyOrders',                                   des: 'Confirms prompting orders' },
    { title: '/orders/continue',                path: '/order/modifyOrders',                                   des: 'Continues orders' },
    { title: '/orders/history',                 path: '/order/ordersFilter',                                   des: 'Order history' },
    { title: '/orders/overview/snapshot',       path: '/order/ordersFilterV',                                  des: 'Summary with number of orders' },
    { title: '/orders/resume',                  path: '/order/modifyOrders',                                   des: 'Resumes orders when suspended or failed' },
    { title: '/orders/suspend',                 path: '/order/modifyOrders',                                   des: 'Suspends orders' },
    { title: '/notices/delete',                 path: '/board/deleteNotices',                                  des: 'Deletes notices' },
    { title: '/notices/post',                   path: '/board/noticeIdsPerBoard',                              des: 'Posts notice for several boards' }
  ];
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


  removeMapping(i: number): void {
    this.mappings.splice(i, 1);
    this.mappings = [...this.mappings];
    if (this.editingIndex === i) {
      this.cancelAdd();
    }
  }


  onSubmit(): void {
    const obj = {
      name: this.currentName,
      path: this.selectedPath
    };
    this.activeModal.close(obj);
  }

  addVariable(): void {
    this.isAdding = true;
    this.editingIndex = null;
    this.newMapping = {name: '', path: ''};
  }

  edit(i: number): void {
    this.isAdding = true;
    this.editingIndex = i;
    this.newMapping = {...this.mappings[i]};
  }

  saveMapping(): void {
    const trimmed = {
      name: this.newMapping.name.trim(),
      path: this.newMapping.path.trim()
    };
    if (this.editingIndex !== null) {
      this.mappings[this.editingIndex] = trimmed;
    } else {
      this.mappings.push(trimmed);
    }
    this.cancelAdd();
  }

  /** hide the form and clear state */
  cancelAdd(): void {
    this.isAdding = false;
    this.editingIndex = null;
    this.newMapping = {name: '', path: ''};
  }

  closeWithMappings(): void {
    this.activeModal.close(this.mappings);
  }

  isAllChecked(): boolean {
    return this.mappings.length > 0 && this.selectedRows.size === this.mappings.length;
  }

  isIndeterminate(): boolean {
    return this.selectedRows.size > 0 && this.selectedRows.size < this.mappings.length;
  }

  onAllChecked(checked: boolean): void {
    if (checked) {
      this.mappings.forEach((_, i) => this.selectedRows.add(i));
    } else {
      this.selectedRows.clear();
    }
  }


  onItemChecked(checked: boolean, index: number): void {
    if (checked) {
      this.selectedRows.add(index);
    } else {
      this.selectedRows.delete(index);
    }
  }

  bulkDelete(): void {
    const toRemove = Array.from(this.selectedRows).sort((a, b) => b - a);
    toRemove.forEach(i => this.removeMapping(i));
    this.selectedRows.clear();
  }

  dynamicForm(ep): void {
    const modal = this.modal.create({
      nzContent: ApiFormDialogComponent,
      nzClassName: 'lg',
      nzData: {endPoint: ep.path, title: ep.des},
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.activeModal.close(result);
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

  ok(clientObj?): void {
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
      if (clientObj?.executable?.arguments?.length) {
        const merged = [...obj.executable.arguments];
        clientObj.executable.arguments.forEach((incoming: { name: string; value: any }) => {
          const idx = merged.findIndex(a => a.name === incoming.name);
          if (idx >= 0) {
            merged[idx] = incoming;
          } else {
            merged.push(incoming);
          }
        });
        obj.executable.arguments = merged;
      }
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
    this.ok(obj)
  }

}
