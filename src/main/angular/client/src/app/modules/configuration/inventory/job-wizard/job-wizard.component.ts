import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
  ViewChild
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
import { Editor as AceEditor } from 'ace-builds/src-noconflict/ace';
import {FindAndReplaceComponent} from "../workflow/workflow.component";

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
  responseHeaders: Record<string, string> = {};
  options: any = new JsonEditorOptions();
  isError = false;
  data: any;
  errorMsg = '';
  errorText = '';
  edit = false;
  preferences: any = {};

  @Output() configSaved = new EventEmitter<any>();
  @ViewChild('editor', {static: false}) editor!: JsonEditorComponent;
  private lastSelection = '';
  constructor(
    private coreService: CoreService,
    private msg: NzMessageService,
    private ref: ChangeDetectorRef,
    private clipboardService: ClipboardService,
    private activeModal: NzModalRef,
    private modal: NzModalService,
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
  }
  ngAfterViewInit() {
  }

  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    if (!this.editor.jsonEditorContainer.nativeElement.contains(event.target as Node)) {
      return;
    }

    const sel = window.getSelection();
    if (!sel) {
      return;
    }
    const raw = sel.toString().trim();
    if (!raw) {
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw.replace(/^['"]|['"]$/g, '');
    }

    const paths = this.findPaths(this.response, parsed);

    const modal = this.modal.create({
      nzContent: ApiRequestDialogComponent,
      nzData: { selectedText: raw, paths },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });

    modal.afterClose.subscribe(/* handle result */);

    sel.removeAllRanges();
  }

  private findPaths(obj: any, target: any): string[] {
    const results: string[] = [];
    const helper = (curr: any, path: string) => {
      if (curr === target) results.push(path);

      if (Array.isArray(curr)) {
        curr.forEach((item, i) => helper(item, `${path}[${i}]`));
      } else if (curr && typeof curr === 'object') {
        Object.keys(curr).forEach(k =>
          helper(curr[k], `${path}.${k}`)
        );
      }
    };
    helper(obj, '$');
    return results;
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

    const {url, method, params, body} = this.model;
    const paramMap = this.arrayToMap(params);

    this.coreService
      .requestTest(method, url, hdrs, paramMap, body)
      .subscribe({
        next: res => {
          this.status = res.status;
          this.response = res.body;
          this.responseHeaders = {};
          this.data = this.response;
          this.errorText = res.statusText

          res.headers.keys().forEach(key => {
            this.responseHeaders[key] = res.headers.get(key)!;
          });
        },
        error: err => {
          const code = err.status ?? 'Unknown';
          const text = err.statusText || err.message || 'Request failed';
          this.status = code
          this.errorText = text
          this.msg.error(`Error ${code}: ${text}`);
        },
        complete: () => {
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

  storeConfig(): void {
    let bodyText
    try {
      bodyText = JSON.parse(this.model.body);
    } catch {
      bodyText = this.model.body;
    }
    const config = {
      url: this.model.url,
      method: this.model.method,
      headers: this.model.headers,
      params: this.model.params,
      auth: this.auth,
      body: bodyText
    };
    const json = JSON.stringify(config, null, 2);

    this.clipboardService.copyFromContent(json);
    this.coreService.showCopyMessage(this.msg);
    this.configSaved.emit(json);
  }

  close(): void{
    this.activeModal.close();
  }


}

interface Mapping { name: string; path: string; }

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

  constructor(private coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.variableValue = this.modalData.selectedText
  }
  addMapping(): void {
    this.mappings.push({
      name: this.currentName,
      path: this.selectedPath
    });
    this.currentName = '';
  }

  removeMapping(index: number): void {
    this.mappings.splice(index, 1);
  }

  onSubmit(): void {
    this.activeModal.close(this.mappings);
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
  private searchTerm = new Subject<string>();

  constructor(private coreService: CoreService, private activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.sideBar.isVisible = false
    this.existingJob = this.modalData.existingJob;
    this.allowEmptyArguments = sessionStorage['allowEmptyArguments'] == 'true';
    this.node = this.modalData.node;
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
    let flag = false;
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
        flag = true;
        break;
      }
    }
    if (index > -1) {
      this.node.defaultArguments.splice(index, 1);
    }
    return flag;
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

  openSideBar(): void {
    this.sideBar.isVisible = true;
  }

  onApiConfigSaved(config: any) {
    this.apiRequest = true;
    this.savedRequestConfig = config;
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
      obj.executable.arguments.push({name: 'request', value: config});
    }
    this.activeModal.close(obj);
  }


}
