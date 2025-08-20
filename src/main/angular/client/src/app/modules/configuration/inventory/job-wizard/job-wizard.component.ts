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
import {firstValueFrom} from 'rxjs';
import {ToastrService} from "ngx-toastr";

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
    private toasterService: ToastrService,
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
    this.status = null;
    this.errorLogs = '';
    this.requestUrl = ''
    this.errorText = '';
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
        let title = '';
        let msg = '';
        this.translate.get('workflow.apiRequest.message.invalidAuth').subscribe(translatedValue => {
          title = translatedValue;
        });
        this.toasterService.warning(title, msg);
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
      nzClassName: 'lg',
      nzData: {docs: true, request: this.model.body},
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.model.body = JSON.stringify(result.data, null, 2)
        this.model.endPoint = result.endpoint
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
  @Input() request: any;
  @Input() control: AbstractControl | null = null;
  @Input() parent: any;

  ngOnInit(): void {
    if (this.isArrayField() && this.getArrayControls().length === 0) {
      this.addArrayItem();
    }

    if (this.isMapField() && this.getMapEntries().length === 0) {
      this.addMapEntry();
    }
  }

  get fieldName(): string {
    return this.propertyPath[this.propertyPath.length - 1] || 'field';
  }

  get uniqueFieldName(): string {
    return this.propertyPath.join('_') || 'field';
  }

  get currentSchema(): any {
    return this.parent?.getSchemaForProperty(this.propertyPath) || {};
  }

  get hasValidFormControl(): boolean {
    return this.control !== null && this.control !== undefined;
  }

  isFieldRequired(): boolean {
    if (this.propertyPath.length === 1) {
      const parentSchema = this.schema;
      return parentSchema?.required?.includes(this.fieldName) || false;
    }

    const parentPath = this.propertyPath.slice(0, -1);
    const parentSchema = this.parent?.getSchemaForProperty(parentPath);

    return parentSchema?.required?.includes(this.fieldName) || false;
  }

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

  updateValue(event: any): void {
    if (this.hasValidFormControl) {
      this.control!.setValue(event.target.value);
      this.control!.markAsTouched();
    }
  }

  updateBooleanValue(event: any): void {
    if (this.hasValidFormControl) {
      this.control!.setValue(event.target.checked);
      this.control!.markAsTouched();
    }
  }

  getObjectProperties(): string[] {
    return Object.keys(this.currentSchema?.properties || {});
  }

  getChildPath(childKey: string): string[] {
    return [...this.propertyPath, childKey];
  }

  getChildControl(childKey: string): AbstractControl | null {
    if (!this.hasValidFormControl) return null;
    const formGroup = this.control as FormGroup;
    return formGroup?.get(childKey) || null;
  }

  getMapEntries(): FormGroup[] {
    if (!this.hasValidFormControl) return [];
    const formArray = this.control as FormArray;
    return (formArray?.controls || []) as FormGroup[];
  }

  addMapEntry(): void {
    if (this.parent?.addMapEntry) {
      this.parent.addMapEntry(this.propertyPath);
    }
  }

  removeMapEntry(index: number): void {
    if (this.parent?.removeMapEntry) {
      this.parent.removeMapEntry(this.propertyPath, index);
    }
  }

  updateMapKey(index: number, event: any): void {
    if (!this.hasValidFormControl) return;
    const mapArray = this.control as FormArray;
    const entryGroup = mapArray?.at(index) as FormGroup;
    entryGroup?.get('key')?.setValue(event.target.value);
  }

  updateMapValue(index: number, event: any): void {
    if (!this.hasValidFormControl) return;
    const mapArray = this.control as FormArray;
    const entryGroup = mapArray?.at(index) as FormGroup;
    entryGroup?.get('value')?.setValue(event.target.value);
  }

  getArrayControls(): AbstractControl[] {
    if (!this.hasValidFormControl) return [];
    const formArray = this.control as FormArray;
    return formArray?.controls || [];
  }

  addArrayItem(): void {
    if (this.parent?.addArrayItem) {
      this.parent.addArrayItem(this.propertyPath);
    }
  }

  removeArrayItem(index: number): void {
    if (this.parent?.removeArrayItem) {
      this.parent.removeArrayItem(this.propertyPath, index);
    }
  }

  isArrayOfPrimitives(): boolean {
    const itemSchema = this.parent?.resolveAnyOf?.(this.currentSchema?.items);
    return itemSchema?.type !== 'object';
  }

  getArrayItemType(): string {
    const itemSchema = this.parent?.resolveAnyOf?.(this.currentSchema?.items);
    return itemSchema?.type || 'string';
  }

  getArrayItemObjectProperties(): string[] {
    const itemSchema = this.parent?.resolveAnyOf?.(this.currentSchema?.items);
    return Object.keys(itemSchema?.properties || {});
  }

  getArrayItemChildPath(itemIndex: number, childKey: string): string[] {
    return [...this.propertyPath, itemIndex.toString(), childKey];
  }

  getArrayItemChildControl(itemIndex: number, childKey: string): AbstractControl | null {
    if (!this.hasValidFormControl) return null;
    const arrayControl = this.control as FormArray;
    const itemControl = arrayControl?.at(itemIndex) as FormGroup;
    return itemControl?.get(childKey) || null;
  }

  updateArrayItemValue(index: number, event: any): void {
    if (!this.hasValidFormControl) return;
    const arrayControl = this.control as FormArray;
    const control = arrayControl?.at(index);
    if (control) {
      control.setValue(event.target.value);
      control.markAsTouched();
    }
  }

  updateArrayItemBooleanValue(index: number, event: any): void {
    if (!this.hasValidFormControl) return;
    const arrayControl = this.control as FormArray;
    const control = arrayControl?.at(index);
    if (control) {
      control.setValue(event.target.checked);
      control.markAsTouched();
    }
  }

  getFormControlValue(): any {
    return this.hasValidFormControl ? this.control!.value : '';
  }

  isFormControlChecked(): boolean {
    return this.hasValidFormControl ? !!this.control!.value : false;
  }

  generateItemName(type: string, index: number, subType?: string): string {
    const base = this.uniqueFieldName;
    if (subType) {
      return `${base}_${type}_${index}_${subType}`;
    }
    return `${base}_${type}_${index}`;
  }
}

@Component({
  selector: 'app-api-text-editor',
  templateUrl: './api-text-editor.html'
})

export class ApiFormDialogComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  @ViewChild('editor', {static: false}) editor!: JsonEditorComponent;

  JsonSchema: any;
  jsonData: any;
  showSchema: boolean = false;
  title: any;
  raml: any;
  request: any;
  form: FormGroup;
  loading = false;
  preferences: any = {};
  options: any = new JsonEditorOptions();
  isError = false;
  emptyBody = false;
  private schemaCache = new Map<string, any>();
  private formControlCache = new Map<string, AbstractControl>();
  private _rootPropertyKeys: string[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NzModalRef,
    private coreService: CoreService,
    private cdr: ChangeDetectorRef,
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private toasterService: ToastrService,
  ) {
    this.options.mode = 'code';
    this.options.onEditable = () => {
      return false;
    };
    this.options.onChange = () => {
      try {
        this.isError = false;
        this.editor.get();
      } catch (err) {
        this.isError = true;
      }
      this.ref.detectChanges();
    };
  }

  ngOnInit(): void {
    this.title = this.modalData.title;
    this.raml = this.modalData.raml;
    this.emptyBody = this.modalData.emptyBody;
    try {
      if (this.modalData.request && this.modalData.request.trim() !== '') {
        this.request = JSON.parse(this.modalData.request);
      } else {
        this.request = null;
      }
    } catch (e) {
      this.request = null;
      let title = '';
      let msg = '';
      this.translate.get('workflow.apiRequest.message.invalidBody').subscribe(translatedValue => {
        title = translatedValue;
      });
      this.toasterService.warning(title, msg);
    }

    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.loadSchema(this.modalData.endPoint);
    this.loadEditorLanguage();
    this.options.modes = ['code', 'tree'];
  }

  getFormControlCached(key: string): AbstractControl | null {
    if (!this.formControlCache.has(key)) {
      const control = this.form?.get(key) || null;
      if (control) {
        this.formControlCache.set(key, control);
      }
    }
    return this.formControlCache.get(key) || null;
  }


  trackByPropertyKey(index: number, key: string): string {
    return key;
  }

  get rootPropertyKeys(): string[] {
    if (this._rootPropertyKeys.length === 0 && this.JsonSchema?.properties) {
      this._rootPropertyKeys = Object.keys(this.JsonSchema.properties);
    }
    return this._rootPropertyKeys;
  }


  private loadEditorLanguage(): void {
    const localeFile = `assets/i18n/json-editor-text_${this.preferences.locale}.json`;
    this.coreService.get(localeFile).subscribe((data) => {
      this.options.languages = {};
      this.options.languages[this.preferences.locale] = data;
      this.options.language = this.preferences.locale;
      if (this.editor) {
        this.editor.setOptions(this.options);
      }
    });
  }

  private async loadSchema(ep: string): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const origin = window.location.origin;
    try {
      const schemaUrl = `${origin}/joc/schemas/api/schemas${ep}-schema.json`;
      const rawSchema: any = await firstValueFrom(this.coreService.post(schemaUrl, {}));
      this.JsonSchema = await this.resolveAllRefs(rawSchema, ep);

      this.clearCaches();

      this.form = this.createForm(this.JsonSchema);
      setTimeout(() => {
        if (this.request && typeof this.request === 'object') {
          try {
            this.prepareFormStructure(this.request, this.JsonSchema, this.form);

            if (this.shouldUseSetValue(this.request)) {
              this.form.setValue(this.request);
            } else {
              this.form.patchValue(this.request);
            }
          } catch (e) {
            try {
              this.form.patchValue(this.request);
            } catch {}          }
        }
      }, 500)
    } catch (e) {
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private prepareFormStructure(data: any, schema: any, formGroup: FormGroup, propertyPath: string[] = []): void {
    if (!data || !schema?.properties) {
      return;
    }

    for (const [key, value] of Object.entries(data)) {
      const fieldSchema = schema.properties[key];
      if (!fieldSchema) continue;

      const resolvedSchema = this.resolveAnyOf(fieldSchema);
      const control = formGroup.get(key);
      const currentPath = [...propertyPath, key];

      if (resolvedSchema.type === 'array' && Array.isArray(value) && control instanceof FormArray) {
        while (control.length > 0) {
          control.removeAt(0);
        }

        const itemSchema = this.resolveAnyOf(resolvedSchema.items);
        for (let i = 0; i < value.length; i++) {
          const newControl = this.createControlForType(itemSchema);
          control.push(newControl);

          if (itemSchema.type === 'object' && typeof value[i] === 'object') {
            this.prepareFormStructure(value[i], itemSchema, newControl as FormGroup, [...currentPath, i.toString()]);
          }
        }
      } else if (resolvedSchema.type === 'object' && resolvedSchema.additionalProperties === true && Array.isArray(value)) {
        const mapArray = control as FormArray;

        while (mapArray.length > 0) {
          mapArray.removeAt(0);
        }

        for (const entry of value) {
          if (entry && typeof entry === 'object' && entry.key !== undefined) {
            const entryGroup = this.fb.group({
              key: [entry.key || '', Validators.required],
              value: [entry.value || '']
            });
            mapArray.push(entryGroup);
          }
        }
      } else if (resolvedSchema.type === 'object' && typeof value === 'object' && control instanceof FormGroup) {
        this.prepareFormStructure(value, resolvedSchema, control, currentPath);
      }
    }
  }

  private clearCaches(): void {
    this.formControlCache.clear();
    this._rootPropertyKeys = [];
  }

  private async resolveAllRefs(schema: any, basePath: string = ''): Promise<any> {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    if (Array.isArray(schema)) {
      return Promise.all(schema.map(item => this.resolveAllRefs(item, basePath)));
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
        return {type: 'string', description: `Failed to load reference: ${schema.$ref}`};
      }
    }

    const resolved: any = {};
    const promises = Object.entries(schema).map(async ([key, value]) => {
      resolved[key] = await this.resolveAllRefs(value, basePath);
    });

    await Promise.all(promises);
    return resolved;
  }

  private resolveRefUrl(ref: string, basePath: string): string {
    const origin = window.location.origin;
    const schemasRoot = `${origin}/joc/schemas`;

    if (ref.startsWith('http')) {
      return ref;
    }

    if (ref.includes('../') || ref.includes('./')) {
      return this.resolveRelativePath(schemasRoot, basePath, ref);
    }

    const baseDir = this.getDirectoryFromPath(basePath);
    let fullPath: string;

    if (baseDir) {
      fullPath = baseDir.startsWith('api/schemas/')
        ? `${schemasRoot}/${baseDir}/${ref}`
        : `${schemasRoot}/api/schemas/${baseDir}/${ref}`;
    } else {
      fullPath = `${schemasRoot}/api/schemas/${ref}`;
    }

    return this.cleanUrl(fullPath);
  }

  private resolveRelativePath(schemasRoot: string, currentPath: string, relativePath: string): string {
    const currentDir = this.getDirectoryFromPath(currentPath);
    let pathParts: string[] = [];

    if (currentDir) {
      pathParts = currentDir.startsWith('api/schemas/')
        ? ['api', 'schemas', ...currentDir.substring('api/schemas/'.length).split('/').filter(part => part)]
        : ['api', 'schemas', ...currentDir.split('/').filter(part => part)];
    } else {
      pathParts = ['api', 'schemas'];
    }

    const relativeParts = relativePath.split('/').filter(part => part);

    for (const part of relativeParts) {
      if (part === '..') {
        if (pathParts.length > 0) {
          pathParts.pop();
          if (pathParts.length === 1 && pathParts[0] === 'api') {
            pathParts.pop();
          }
        }
      } else if (part !== '.') {
        pathParts.push(part);
      }
    }

    const resolvedPath = pathParts.join('/');
    const finalUrl = resolvedPath ? `${schemasRoot}/${resolvedPath}` : schemasRoot;

    return this.cleanUrl(finalUrl);
  }

  private cleanUrl(url: string): string {
    let cleanedUrl = url.replace(/\/api\/schemas\/api\/schemas/g, '/api/schemas');
    cleanedUrl = cleanedUrl.replace(/([^:]\/)\/+/g, '$1');

    while (cleanedUrl.includes('/api/schemas/api/schemas')) {
      cleanedUrl = cleanedUrl.replace('/api/schemas/api/schemas', '/api/schemas');
    }

    return cleanedUrl;
  }

  private getBasePath(url: string): string {
    const origin = window.location.origin;
    const schemasRoot = `${origin}/joc/schemas/`;

    return url.startsWith(schemasRoot) ? url.substring(schemasRoot.length) : '';
  }

  private getDirectoryFromPath(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : '';
  }

  private createForm(schema: any): FormGroup {
    const form = this.fb.group(this.createControlsRecursive(schema));
    this.clearCaches();
    return form;
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
          return this.fb.array([]);
        } else {
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


  private cleanFormData(data: any, schema?: any, propertyPath: string[] = []): any {
    if (data === null || data === undefined) {
      return undefined;
    }

    if (Array.isArray(data)) {
      const itemSchema = schema?.items ? this.resolveAnyOf(schema.items) : null;
      const cleanedArray = data
        .map((item, index) => {
          const itemPath = [...propertyPath, index.toString()];
          return this.cleanFormData(item, itemSchema, itemPath);
        })
        .filter(item => item !== undefined);

      const isTopLevelRequired = this.isTopLevelRequired(propertyPath);
      if (isTopLevelRequired && cleanedArray.length === 0) {
        return [];
      }

      return cleanedArray.length > 0 ? cleanedArray : undefined;
    }

    if (typeof data === 'object') {
      const currentSchema = schema || this.getSchemaForProperty(propertyPath);
      const required = currentSchema?.required || [];

      const isTopLevel = propertyPath.length <= 1;
      if (!isTopLevel && required.length > 0) {
        const hasAllRequiredFields = required.every(fieldName => {
          const value = data[fieldName];
          return !this.isEmpty(value);
        });

        if (!hasAllRequiredFields) {
          return undefined;
        }
      }

      const cleanedObject: any = {};
      let hasAnyValue = false;

      for (const [key, value] of Object.entries(data)) {
        const childPath = [...propertyPath, key];
        const childSchema = currentSchema?.properties?.[key] ?
          this.resolveAnyOf(currentSchema.properties[key]) : null;

        const isFieldRequired = required.includes(key);
        const isBoolean = childSchema?.type === 'boolean';

        if (isBoolean) {
          if (value === true) {
            cleanedObject[key] = true;
            hasAnyValue = true;
          } else if (value === false) {
            if (isFieldRequired) {
              cleanedObject[key] = false;
              hasAnyValue = true;
            }
          }
        } else {
          const cleanedValue = this.cleanFormData(value, childSchema, childPath);

          const isChildRequired = isTopLevel && isFieldRequired;
          if (cleanedValue !== undefined || isChildRequired) {
            cleanedObject[key] = cleanedValue !== undefined ? cleanedValue : this.getDefaultForType(childSchema);
            hasAnyValue = true;
          }
        }
      }

      return hasAnyValue ? cleanedObject : undefined;
    }

    if (this.isEmpty(data)) {
      return undefined;
    }

    return data;
  }


  private isTopLevelRequired(propertyPath: string[]): boolean {
    if (propertyPath.length !== 1) return false;

    const fieldName = propertyPath[0];
    const required = this.JsonSchema?.required || [];
    return required.includes(fieldName);
  }


  private getDefaultForType(schema: any): any {
    if (!schema) return null;

    const resolvedSchema = this.resolveAnyOf(schema);

    switch (resolvedSchema.type) {
      case 'array':
        return [];
      case 'object':
        return {};
      case 'boolean':
        return false;
      case 'number':
      case 'integer':
        return 0;
      case 'string':
      default:
        return '';
    }
  }


  onSubmit(): void {
    if (this.isFormSubmittable()) {
      let endpoint = '';
      if (this.raml) {
        const match = this.raml.match(/\/resource(\/[^.]+)\.html/);
        if (match && match[1]) {
          endpoint = match[1];
        }
      }

      const cleanedData = this.cleanFormData(this.form.value, this.JsonSchema, []);

      const obj = {
        data: cleanedData,
        endpoint: endpoint
      };

      this.activeModal.close(obj);
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({onlySelf: true});

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  openRamlDocs(ramlUrl: string): void {
    if (ramlUrl) {
      window.open(ramlUrl, '_blank');
    }
  }

  editJson(): void {
    if (this.form && this.form.value) {
      this.options.onEditable = () => {
        return true;
      };

      this.jsonData = JSON.parse(JSON.stringify(this.form.value));
      this.toggleSchemaView();


      setTimeout(() => {
        if (this.editor && this.editor.set) {
          this.editor.set(this.jsonData);
        }
      }, 100);
    }
  }

  showJsonSchema(): void {
    this.options.onEditable = () => {
      return false;
    };
    if (this.JsonSchema) {
      this.jsonData = JSON.parse(JSON.stringify(this.JsonSchema));
      this.toggleSchemaView();

      setTimeout(() => {
        if (this.editor && this.editor.set) {
          this.editor.set(this.jsonData);
        }
      }, 100);
    }
  }

  resetJsonEditor(): void {
    if (this.form && this.form.value) {
      this.jsonData = JSON.parse(JSON.stringify(this.form.value));
      setTimeout(() => {
        if (this.editor && this.editor.set) {
          this.editor.set(this.jsonData);
        }
      }, 100);
    }
  }

  syncEditorData(): void {
    if (this.editor) {
      try {
        if (this.editor.get) {
          const currentData = this.editor.get();
          if (currentData && !currentData.hasOwnProperty('isTrusted')) {
            this.jsonData = currentData;
          }
        }
      } catch (error) {
        this.resetJsonEditor();
      }
    }
  }


  updateJson(): void {
    try {
      let editorData = this.jsonData;

      if (this.editor) {
        try {
          if (this.editor.get) {
            editorData = this.editor.get();
          } else if (this.editor.getText) {
            const textData = this.editor.getText();
            editorData = textData ? JSON.parse(textData) : this.jsonData;
          }
        } catch (editorError) {
          editorData = this.jsonData;
        }
      }

      if (editorData && typeof editorData === 'object' && editorData.hasOwnProperty('isTrusted')) {
        editorData = this.jsonData;
      }

      let parsedData = editorData;
      if (typeof editorData === 'string') {
        parsedData = JSON.parse(editorData);
      }

      if (!this.isValidFormData(parsedData)) {
        console.warn('JSON data structure may not match form schema');
      }


      try {
        if (this.shouldUseSetValue(parsedData)) {
          this.form.setValue(parsedData);
        } else {
          this.form.patchValue(parsedData);
        }
      } catch {
        try {
          this.form.patchValue(parsedData);
        } catch {}
      }


      this.markFormGroupTouched(this.form);

      this.formControlCache.clear();

      this.toggleSchemaView();

    } catch (error) {
    }
  }



  private shouldUseSetValue(data: any): boolean {
    if (!data || !this.form) return false;

    const formControls = (this.form as FormGroup).controls;
    const formKeys = Object.keys(formControls);
    const dataKeys = Object.keys(data);


    const noExtraKeys = dataKeys.every(k => formKeys.includes(k));


    const requiredTopLevel: string[] = Array.isArray(this.JsonSchema?.required) ? this.JsonSchema.required : [];
    const coversAllRequired = requiredTopLevel.every(k => dataKeys.includes(k));

     return noExtraKeys && coversAllRequired;
  }


  private isValidFormData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const formKeys = this.rootPropertyKeys;
    const dataKeys = Object.keys(data);

    const unknownKeys = dataKeys.filter(key => !formKeys.includes(key));
    if (unknownKeys.length > 0) {
      console.warn('Unknown keys in JSON data:', unknownKeys);
    }

    return true;
  }

  toggleSchemaView(): void {
    this.showSchema = !this.showSchema;
    this.cdr.detectChanges();
  }


  isFormSubmittable(): boolean {
    if (!this.form || !this.JsonSchema) {
      return false;
    }

    const required = this.JsonSchema.required || [];

    for (const fieldName of required) {
      const control = this.form.get(fieldName);
      if (!control) {
        return false;
      }

      const value = control.value;

      if (typeof value === 'string' || typeof value === 'number') {
        if (!value && value !== 0) {
          return false;
        }
      } else if (typeof value === 'boolean') {
        continue;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          return false;
        }
      } else if (value && typeof value === 'object') {
        const hasValue = Object.values(value).some(val =>
          val !== null && val !== undefined && val !== ''
        );
        if (!hasValue) {
          return false;
        }
      } else if (!value) {
        return false;
      }
    }

    if (!this.validateConditionalDependencies()) {
      return false;
    }

    return true;
  }


  private validateConditionalDependencies(): boolean {
    return this.validateObjectConditionalDependencies(this.form, this.JsonSchema, []);
  }


  private validateObjectConditionalDependencies(formGroup: FormGroup, schema: any, currentPath: string[]): boolean {
    if (!schema?.properties) {
      return true;
    }

    const properties = schema.properties;

    for (const [key, propSchema] of Object.entries(properties)) {
      const control = formGroup.get(key);
      const fieldPath = [...currentPath, key];
      const resolvedSchema = this.resolveAnyOf(propSchema);

      if (!control) continue;

      if (resolvedSchema.type === 'object' && !this.isMapType(fieldPath)) {
        const nestedFormGroup = control as FormGroup;

        if (!this.validateConditionalRequiredFields(nestedFormGroup, resolvedSchema)) {
          return false;
        }

        if (!this.validateObjectConditionalDependencies(nestedFormGroup, resolvedSchema, fieldPath)) {
          return false;
        }
      } else if (resolvedSchema.type === 'array') {
        const arrayControl = control as FormArray;
        const itemSchema = this.resolveAnyOf(resolvedSchema.items);

        if (itemSchema?.type === 'object') {
          for (let i = 0; i < arrayControl.length; i++) {
            const itemControl = arrayControl.at(i) as FormGroup;
            const itemPath = [...fieldPath, i.toString()];

            if (!this.validateConditionalRequiredFields(itemControl, itemSchema)) {
              return false;
            }

            if (!this.validateObjectConditionalDependencies(itemControl, itemSchema, itemPath)) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }


  private validateConditionalRequiredFields(formGroup: FormGroup, schema: any): boolean {
    const required = schema.required || [];

    if (required.length === 0) {
      return true;
    }

    const hasAnyRequiredValue = required.some(fieldName => {
      const control = formGroup.get(fieldName);
      const value = control?.value;
      return !this.isEmpty(value);
    });

    if (!hasAnyRequiredValue) {
      return true;
    }

    return required.every(fieldName => {
      const control = formGroup.get(fieldName);
      const value = control?.value;
      return !this.isEmpty(value);
    });
  }


  private isEmpty(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    return false;
  }


  private isEmptyObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return true;
    if (Array.isArray(obj)) return obj.length === 0;

    return Object.values(obj).every(value =>
      value === null || value === undefined || value === '' ||
      (typeof value === 'object' && this.isEmptyObject(value))
    );
  }


  private getFormValidationErrors(formGroup: FormGroup): any[] {
    let formErrors: any[] = [];

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && !control.valid) {
        if (control instanceof FormGroup) {
          formErrors = formErrors.concat(this.getFormValidationErrors(control));
        } else if (control instanceof FormArray) {
          control.controls.forEach((arrayControl, index) => {
            if (arrayControl instanceof FormGroup) {
              formErrors = formErrors.concat(this.getFormValidationErrors(arrayControl));
            } else if (!arrayControl.valid) {
              formErrors.push({
                path: `${key}[${index}]`,
                errors: arrayControl.errors
              });
            }
          });
        } else {
          formErrors.push({
            path: key,
            errors: control.errors
          });
        }
      }
    });

    return formErrors;
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
  raml?: string;
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
  version: any;
  private emptyBodyEndpoints = [
    '/daily_plan/projections/recreate',
    '/joc/license',
    '/joc/version'
  ];
  endpoints: endPoint[] = [
    {title: '/agents', path: '/agent/readAgents_v', des: 'Gets Agents'},
    {title: '/agents/cluster', path: '/agent/readSubagentClusters', des: 'Gets Subagent Clusters'},
    {title: '/agents/report', path: '/agent/agentReportFilter', des: 'Gets report of Agent tasks'},
    {title: '/controller', path: '/controller/urlParam', des: 'Gets Controller status information'},
    {title: '/controllers', path: '/controller/controllerId-optional', des: 'Gets Controllers'},
    {
      title: '/daily_plan/orders',
      path: '/orderManagement/dailyplan/dailyPlanOrdersFilter',
      des: 'Gets orders from a daily plan interval'
    },
    {
      title: '/daily_plan/orders/cancel',
      path: '/orderManagement/modify/dailyPlanCancelOrders',
      des: 'Cancels submitted orders for a daily plan interval'
    },
    {
      title: '/daily_plan/orders/generate',
      path: '/dailyplan/generate/generate-request',
      des: 'Generates orders for a given daily plan'
    },
    {
      title: '/daily_plan/orders/submit',
      path: '/orderManagement/modify/dailyPlanSubmitOrders',
      des: 'Submits planned orders for a daily plan interval'
    },
    {
      title: '/daily_plan/orders/delete',
      path: '/orderManagement/modify/dailyPlanDeleteOrders',
      des: 'Deletes planned orders for a daily plan interval'
    },
    {
      title: '/daily_plan/orders/summary',
      path: '/orderManagement/dailyplan/dailyPlanOrderSummary',
      des: 'Gets summary order counts from a daily plan interval'
    },
    {
      title: '/daily_plan/projections/calendar',
      path: '/dailyplan/projections/projections-request',
      des: 'Gets the days of the daily plan projections that have start times'
    },
    {
      title: '/daily_plan/projections/dates',
      path: '/dailyplan/projections/projections-request',
      des: 'Gets the start times of date range of the daily plan projections'
    },
    {title: '/daily_plan/projections/recreate', path: '/common/ok', des: '(Re)creates daily plan projections'},
    {
      title: '/joc/license',
      path: '/joc/js7LicenseInfo',
      des: 'shows information about the currently used SOS JS7 License '
    },
    {title: '/joc/version', path: '/joc/version', des: 'Get JOC\'s version'},
    {title: '/joc/versions', path: '/joc/versionsFilter', des: 'Reads the versions of the specified JS7 components.'},
    {title: '/jocs', path: '/controller/jocFilter', des: 'Gets JOC Cockpit instances'},
    {
      title: '/orders',
      path: '/order/ordersFilterV',
      des: 'Returns a collection of orders filtered by workflow or order state'
    },
    {title: '/orders/add', path: '/order/addOrders', des: 'Add orders'},
    {title: '/orders/cancel', path: '/order/modify/cancelOrders', des: 'Cancels orders'},
    {title: '/orders/confirm', path: '/order/modifyOrdersBase', des: 'Confirms prompting orders'},
    {title: '/orders/continue', path: '/order/modifyOrdersBase', des: 'Continues orders'},
    {title: '/orders/history', path: '/order/ordersFilter', des: 'Order history'},
    {title: '/orders/overview/snapshot', path: '/order/ordersFilterVBase', des: 'Summary with number of orders'},
    {title: '/orders/resume', path: '/order/modify/resumeOrders', des: 'Resumes orders when suspended or failed'},
    {title: '/orders/suspend', path: '/order/modify/suspendOrders', des: 'Suspends orders'},
    {title: '/notices/delete', path: '/board/deleteNotices', des: 'Deletes notices'},
    {title: '/notices/post', path: '/board/postNotices', des: 'Posts notice for several boards'}
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
    if (this.docs) {
      this.coreService.get('version.json').subscribe((data) => {
        this.version = data?.version;
        this.updateRamlLinks(data?.version);
      });
    }
  }

  private updateRamlLinks(versionString: string): void {
    if (!versionString) return;

    const cleanVersion = versionString.replace('-SNAPSHOT', '');

    this.endpoints = this.endpoints.map(endpoint => ({
      ...endpoint,
      raml: `https://www.sos-berlin.com/JOC/${cleanVersion}/raml-doc/JOC-API/resource${endpoint.title}.html`
    }));
  }


  openRamlDocs(ramlUrl: string): void {
    if (ramlUrl) {
      window.open(ramlUrl, '_blank');
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

  dynamicForm(ep: endPoint): void {
    if (this.emptyBodyEndpoints.includes(ep.title)) {
      const modal1 = this.modal.create({
        nzContent: ApiFormDialogComponent,
        nzClassName: 'lg',
        nzData: {
          endPoint: ep.path,
          title: ep.des,
          raml: ep.raml,
          request: this.modalData.request,
          emptyBody: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal1.afterClose.subscribe(result => {
        if (result) {
          this.activeModal.close(result);
        }
      });
      return;
    }
    const modal2 = this.modal.create({
      nzContent: ApiFormDialogComponent,
      nzClassName: 'lg',
      nzData: {
        endPoint: ep.path,
        title: ep.des,
        raml: ep.raml,
        request: this.modalData.request
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal2.afterClose.subscribe(result => {
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
