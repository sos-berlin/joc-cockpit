import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {FileUploader} from 'ng2-file-upload';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {Subscription} from 'rxjs';
import * as _ from 'underscore';
import {saveAs} from 'file-saver';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {WorkflowService} from '../../../../services/workflow.service';
import {DataService} from '../../../../services/data.service';
import {CoreService} from '../../../../services/core.service';

// Mx-Graph Objects
declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxEdgeHandler;
declare const mxCodec;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxImage;
declare const mxOutline;
declare const mxDragSource;
declare const mxConstants;
declare const mxRectangle;
declare const mxPoint;
declare const mxUndoManager;
declare const mxEventObject;
declare const mxToolbar;
declare const mxCellHighlight;
declare const mxImageShape;
declare const mxKeyHandler;
declare const X2JS;
declare const $;

const x2js = new X2JS();

@Component({
  selector: 'app-edit-workflow-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-workflow-dialog.html'
})
export class UpdateWorkflowComponent implements OnInit {
  @Input() schedulerId: string;
  @Input() data: any;
  @Input() title: string;
  @Input() orderRequirements;
  @Input() isVariableOnly;

  allowedDatatype = ['String', 'Number', 'Boolean'];
  workflowName: string;
  variableDeclarations = {parameters: []};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, public toasterService: ToasterService) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.workflowName = this.data.name;
    }
    if (this.orderRequirements && this.orderRequirements.parameters && !_.isEmpty(this.orderRequirements.parameters)) {
      this.variableDeclarations.parameters = Object.entries(this.orderRequirements.parameters).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    if (this.variableDeclarations.parameters && this.variableDeclarations.parameters.length === 0) {
      this.addVariable();
    }
  }

  onSubmit(): void {
    if (this.data && this.workflowName !== this.data.name) {
      this.coreService.post('inventory/rename', {
        id: this.data.id,
        newPath: this.workflowName
      }).subscribe(() => {
        this.activeModal.close({name: this.workflowName, title: this.title});
      });
    } else {
      if (this.variableDeclarations.parameters && this.variableDeclarations.parameters.length > 0) {
        this.variableDeclarations.parameters.forEach((value) => {
          if (value.value && value.value.default === '') {
            delete value.value['default'];
          }
        });
      }
      this.activeModal.close({title: this.title, variableDeclarations: this.variableDeclarations});
    }
  }

  addVariable(): void {
    const param = {
      name: '',
      value: {
        type: 'String'
      }
    };
    if (this.variableDeclarations.parameters) {
      if (!this.coreService.isLastEntryEmpty(this.variableDeclarations.parameters, 'name', '')) {
        this.variableDeclarations.parameters.push(param);
      }
    }
  }

  checkDuplicateEntries(variable, index): void {
    if (variable.name) {
      for (let i = 0; i < this.variableDeclarations.parameters.length; i++) {
        if (this.variableDeclarations.parameters[i].name === variable.name && i !== index) {
          variable.name = '';
          this.toasterService.pop('warning', this.variableDeclarations.parameters[i].name + ' is already exist');
          break;
        }
      }
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.variableDeclarations.parameters, event.previousIndex, event.currentIndex);
  }

  removeVariable(index): void {
    this.variableDeclarations.parameters.splice(index, 1);
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      this.addVariable();
    }
  }
}

@Component({
  selector: 'app-job-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-text-editor.html'
})
export class JobComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;
  @ViewChild('treeSelectCtrl2', {static: false}) treeSelectCtrl2;
  @Input() schedulerId: any;
  @Input() selectedNode: any;
  @Input() jobs: any;
  @Input() jobClassTree = [];
  @Input() orderRequirements;
  @Input() agents = [];
  error: boolean;
  errorMsg: string;
  obj: any = {};
  isDisplay = false;
  index = 0;
  returnCodes: any = {on: 'success'};
  cmOption: any = {
    lineNumbers: true,
    autoRefresh: true,
    mode: 'shell'
  };
  variableList = [];
  filteredOptions = [];
  mentionValueList = [];

  subscription: Subscription;

  constructor(private coreService: CoreService, private modal: NzModalService, private ref: ChangeDetectorRef,
              private workflowService: WorkflowService, private dataService: DataService) {
    this.subscription = dataService.reloadWorkflowError.subscribe(res => {
      this.error = res.error;
      if (res.msg && res.msg.match('duplicateLabel')) {
        this.errorMsg = res.msg;
      } else {
        this.errorMsg = '';
      }
    });
  }

  ngOnInit(): void {
    this.index = 0;
    this.updateVariableList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedNode) {
      this.init();
    }
    if (changes.orderRequirements) {
      this.updateVariableList();
    }
  }

  changeType(type): void {
    if (type === 'ScriptExecutable') {
      this.reloadScript();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateSelectItems(): void {
    let arr = this.selectedNode.obj.defaultArguments.filter(option => option.name);
    this.mentionValueList = [...this.variableList, ...arr];
    this.filteredOptions = [...this.variableList, ...arr];
  }

  reloadScript(): void {
    this.isDisplay = false;
    setTimeout(() => {
      this.isDisplay = true;
      this.ref.detectChanges();
    }, 5);
  }

  updateVariableList(): void {
    if (this.orderRequirements && this.orderRequirements.parameters && !_.isEmpty(this.orderRequirements.parameters)) {
      this.variableList = Object.entries(this.orderRequirements.parameters).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    this.updateSelectItems();
  }

  tabChange($event): void {
    if ($event.index === 0) {
      this.reloadScript();
    }
    if ($event.index === 0) {
      this.updateSelectItems();
    }
  }

  focusChange(): void {
    this.obj.script = false;
  }

  fullScreen(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ScriptEditorComponent,
      nzClassName: 'lg script-editor',
      nzComponentParams: {
        script: this.selectedNode.job.executable.script
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.selectedNode.job.executable.script = result;
        this.ref.detectChanges();
      }
    });
  }

  onBlur(): void {
    if (this.error && this.selectedNode && this.selectedNode.obj) {
      this.obj.label = !this.selectedNode.obj.label;
      this.obj.agent = !this.selectedNode.job.agentId;
      this.obj.script = !this.selectedNode.job.executable.script && this.selectedNode.job.executable.TYPE === 'ScriptExecutable';
      this.obj.className = !this.selectedNode.job.executable.className && this.selectedNode.job.executable.TYPE === 'InternalExecutable';
    } else {
      this.obj = {};
    }
  }

  getJobInfo(): void {
    let flag = false;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === this.selectedNode.obj.jobName) {
        this.selectedNode.job = {...this.selectedNode.job, ..._.clone(this.jobs[i].value)};
        flag = true;
        break;
      }
    }
    if (!flag) {
      this.selectedNode.job = {jobName: this.selectedNode.obj.jobName};
    }
    this.setJobProperties();
  }

  checkJobInfo(): void {
    if (!this.selectedNode.obj.jobName) {
      this.selectedNode.obj.jobName = 'job';
    }
    if (this.selectedNode.job.jobName !== this.selectedNode.obj.jobName) {
      this.selectedNode.job.jobName = this.selectedNode.obj.jobName;
      for (let i = 0; i < this.jobs.length; i++) {
        if (this.jobs[i].name === this.selectedNode.obj.jobName) {
          this.selectedNode.job = {...this.selectedNode.job, ...this.jobs[i].value};
          break;
        }
      }
      this.setJobProperties();
    }
    if (!this.selectedNode.obj.label) {
      this.selectedNode.obj.label = this.selectedNode.obj.jobName;
    }
  }

  addArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.obj.defaultArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.obj.defaultArguments, 'name', '')) {
        this.selectedNode.obj.defaultArguments.push(param);
      }
    }
  }

  removeArgument(index): void {
    this.selectedNode.obj.defaultArguments.splice(index, 1);
  }

  addJobArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.executable.jobArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.executable.jobArguments, 'name', '')) {
        this.selectedNode.job.executable.jobArguments.push(param);
      }
    }
  }

  removeJobArgument(index): void {
    this.selectedNode.job.executable.jobArguments.splice(index, 1);
  }

  addVariable(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.defaultArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.defaultArguments, 'name', '')) {
        this.selectedNode.job.defaultArguments.push(param);
      }
    }
  }

  removeVariable(index): void {
    this.selectedNode.job.defaultArguments.splice(index, 1);
  }

  addArgu(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.executable.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.executable.arguments, 'name', '')) {
        this.selectedNode.job.executable.arguments.push(param);
      }
    }
  }

  removeArgu(index): void {
    this.selectedNode.job.executable.arguments.splice(index, 1);
  }

  addEnv(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.executable.env) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.executable.env, 'name', 'isRequired')) {
        this.selectedNode.job.executable.env.push(param);
      }
    }
  }

  removeEnv(index): void {
    this.selectedNode.job.executable.env.splice(index, 1);
  }

  upperCase(env): void {
    if (env.name) {
      env.name = env.name.toUpperCase();
      if (!env.value) {
        env.value = '$' + env.name.toLowerCase();
      }
    }
  }

  onChange(value: string): void {
    this.filteredOptions = [...this.variableList.filter(option => option.name.toLowerCase().indexOf(value.toLowerCase()) !== -1),
      ...this.selectedNode.obj.defaultArguments.filter(option => option.name.toLowerCase().indexOf(value.toLowerCase()) !== -1)];
  }

  valueWith = (data: { name: string }) => data.name;

  onKeyPress($event, type): void {
    if ($event.which === '13' || $event.which === 13) {
      type === 'default' ? this.addVariable() : this.addArgument();
    }
  }

  loadData(node, type, $event): void {
    setTimeout(() => {
      this.onBlur();
    }, 50);
    if (!node.origin.type) {

      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        this.coreService.post('inventory/read/folder', {
          path: node.key,
          objectTypes: ['JOBCLASS']
        }).subscribe((res: any) => {
          let data;
          if (type === 'JOBCLASS') {
            data = res.jobClasses;
          }
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = _path;
            data[i].path = _path;
            data[i].key = _path;
            data[i].type = type;
            data[i].isLeaf = true;
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;

          node.origin.children = data;
          this.jobClassTree = [...this.jobClassTree];
        });
      }
    }
  }

  onExpand(e, type) {
    this.loadData(e.node, type, null);
  }

  private init(): void {
    this.getJobInfo();
    this.selectedNode.obj.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.obj, 'defaultArguments');
    if (this.selectedNode.obj.defaultArguments && this.selectedNode.obj.defaultArguments.length == 0) {
      this.addArgument();
    }
    if (this.selectedNode.job.jobClass) {
      const path = this.selectedNode.job.jobClass.substring(0, this.selectedNode.job.jobClass.lastIndexOf('/')) || '/';
      setTimeout(() => {
        const node = this.treeSelectCtrl2.getTreeNodeByKey(path);
        if (node) {
          node.isExpanded = true;
          this.loadData(node, 'JOBCLASS', null);
        }
      }, 10);
    }
    this.onBlur();
    if (this.index === 0) {
      this.reloadScript();
    }
  }

  private setJobProperties(): void {
    if (!this.selectedNode.job.taskLimit) {
      this.selectedNode.job.taskLimit = 1;
    }
    if (!this.selectedNode.job.executable || !this.selectedNode.job.executable.TYPE) {
      this.selectedNode.job.executable = {
        TYPE: 'ScriptExecutable',
        script: '',
        v1Compatible: false,
        env: []
      };
    }

    if (!this.selectedNode.job.returnCodeMeaning) {
      this.selectedNode.job.returnCodeMeaning = {
        success: 0
      };
    } else {
      if (this.selectedNode.job.returnCodeMeaning.success) {
        this.selectedNode.job.returnCodeMeaning.success = this.selectedNode.job.returnCodeMeaning.success.toString();
      } else if (this.selectedNode.job.returnCodeMeaning.failure) {
        this.selectedNode.job.returnCodeMeaning.failure = this.selectedNode.job.returnCodeMeaning.failure.toString();
      }
    }
    if (this.selectedNode.job.returnCodeMeaning.failure) {
      this.returnCodes.on = 'failure';
    } else {
      this.returnCodes.on = 'success';
    }


    if (!this.selectedNode.job.defaultArguments || _.isEmpty(this.selectedNode.job.defaultArguments)) {
      this.selectedNode.job.defaultArguments = [];
    } else {
      if (!_.isArray(this.selectedNode.job.defaultArguments)) {
        this.selectedNode.job.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.job, 'defaultArguments');
      }
    }
    if (!this.selectedNode.job.executable.arguments || _.isEmpty(this.selectedNode.job.executable.arguments)) {
      this.selectedNode.job.executable.arguments = [];
    } else {
      if (!_.isArray(this.selectedNode.job.executable.arguments)) {
        this.selectedNode.job.executable.arguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'arguments');
      }
    }

    if (!this.selectedNode.job.executable.jobArguments || _.isEmpty(this.selectedNode.job.executable.jobArguments)) {
      this.selectedNode.job.executable.jobArguments = [];
    } else {
      if (!_.isArray(this.selectedNode.job.executable.jobArguments)) {
        this.selectedNode.job.executable.jobArguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'jobArguments');
      }
    }

    if (!this.selectedNode.job.executable.env || _.isEmpty(this.selectedNode.job.executable.env)) {
      this.selectedNode.job.executable.env = [];
    } else {
      if (!_.isArray(this.selectedNode.job.executable.env)) {
        this.selectedNode.job.executable.env = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'env');
        this.selectedNode.job.executable.env.filter((env) => {
          if (env.value) {
            if (!(/[$_+]/.test(env.value))) {
              let startChar = env.value.substring(0, 1),
                endChar = env.value.substring(env.value.length - 1);
              if ((startChar === '\'' && endChar === '\'')) {
                env.value = '"' + env.value.substring(1, env.value.length - 1) + '"';
              }
              try {
                env.value = JSON.parse(env.value);
              } catch (e) {
                console.error(e);
              }
            }
          }
        });
      }
    }

    if (this.selectedNode.job.timeout) {
      this.selectedNode.job.timeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.timeout);
    }
    if (this.selectedNode.job.graceTimeout) {
      this.selectedNode.job.graceTimeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.graceTimeout);
    }
    if (this.selectedNode.job.defaultArguments && this.selectedNode.job.defaultArguments.length === 0) {
      this.addVariable();
    }
    if (this.selectedNode.job.executable.arguments && this.selectedNode.job.executable.arguments.length === 0) {
      this.addArgu();
    }
    if (this.selectedNode.job.executable.jobArguments && this.selectedNode.job.executable.jobArguments.length === 0) {
      this.addJobArgument();
    }
    if (this.selectedNode.job.executable.env && this.selectedNode.job.executable.env.length === 0) {
      this.addEnv();
    }
  }
}

@Component({
  selector: 'app-script-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './script-editor.html'
})
export class ScriptEditorComponent {
  @Input() script: any;
  @ViewChild('codeMirror', {static: true}) cm;

  cmOption: any = {
    lineNumbers: true,
    viewportMargin: Infinity,
    autofocus: true,
    autoRefresh: true,
    mode: 'shell'
  };

  constructor(public activeModal: NzModalRef) {
  }

  onSubmit(): void {
    this.activeModal.close(this.script);
  }

  execCommand(type): void {
    this.cm.codeMirror.execCommand(type);
  }
}

@Component({
  selector: 'app-expression-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expression-editor.html'
})
export class ExpressionComponent implements OnInit {
  @Input() selectedNode: any;
  @Input() error: any;
  expression: any = {};
  operators = ['==', '!=', '<', '<=', '>', '>=', 'in', '&&', '||', '!'];
  functions = ['toNumber ', 'toBoolean'];
  variablesOperators = ['matches', 'startWith', 'endsWith', 'contains'];
  varExam = 'variable ("aString", default="") matches ".*"';
  lastSelectOperator = '';
  @ViewChild('codeMirror', {static: false}) cm;
  cmOption: any = {
    lineNumbers: false,
    autofocus: true,
    autoRefresh: true,
    mode: 'ruby'
  };

  constructor() {
  }

  ngOnInit() {
    this.expression.type = 'returnCode';
    this.change();
  }

  generateExpression(type, operator) {
    this.lastSelectOperator = operator;
    let setText;
    if (type == 'function') {
      setText = '.' + operator + ' ';
      if (operator === 'toNumber') {
        this.varExam = 'variable ("aNumber", default="0").' + operator;
      } else if (operator === 'toBoolean') {
        this.varExam = 'variable ("aBoolean", default="false").' + operator;
      } else {
        this.varExam = 'variable ("aString", default="").' + operator;
      }
    } else {
      if (operator) {
        setText = operator + ' ';
      } else {
        this.expression.type = type;
        setText = type;
        if (type === 'returnCode') {
          setText += ' ';
        } else {
          setText += '(\'NAME\')';
        }
      }
    }

    this.insertText(setText, this.cm.codeMirror.getDoc());
  }

  change() {
    this.error = !this.selectedNode.obj.predicate;
  }

  // Begin inputting of clicked text into editor
  private insertText(data, doc) {
    const cursor = doc.getCursor(); // gets the line number in the cursor position
    doc.replaceRange(data, cursor);
    cursor.ch = cursor.ch + data.length;
    this.cm.codeMirror.focus();
    doc.setCursor(cursor);
  }
}

@Component({
  selector: 'app-import-content',
  templateUrl: './import-dialog.html'
})
export class ImportComponent implements OnInit {
  workflow: any;
  submitted = false;
  uploader: FileUploader;

  constructor(public activeModal: NzModalRef, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit() {
    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.pop('error', res.error.code, res.error.message);
      }
    };
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    let item = event['0'];

    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      this.uploader.clearQueue();
    } else {
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event) {
      let data;
      try {
        data = JSON.parse(_event.target.result);
        self.workflow = data;
      } catch (e) {

      }
      if (!data || !data.instructions || data.instructions.length == 0) {
        let msg = '';
        self.translate.get('workflow.message.inValidWorkflow').subscribe(translatedValue => {
          msg = translatedValue;
        });
        self.toasterService.pop('error', '', msg);
        self.uploader.queue[0].remove();
        return;
      }
    }
  }

  onSubmit() {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.workflow);
    }, 100);
  }
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnDestroy, OnChanges {
  @Input() data: any;
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  agents = [];
  jobClassTree = [];
  lockTree = [];
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  editor: any;
  dummyXml: any;
  // Declare Map object to store fork and join Ids
  nodeMap = new Map();
  droppedCell: any;
  movedCell: any;
  isCellDragging = false;
  propertyPanelWidth: number;
  selectedNode: any;
  node: any;
  title = '';
  jobs: any = [];
  orderRequirements: any = {};
  workflow: any = {};
  indexOfNextAdd = 0;
  history = [];
  implicitSave = false;
  noSave = false;
  isLoading = true;
  isUpdate: boolean;
  isStore = false;
  error: boolean;
  cutCell: any;
  copyId: any;
  skipXMLToJSONConversion = false;
  objectType = 'WORKFLOW';
  invalidMsg: string;

  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(public coreService: CoreService, public translate: TranslateService, private modal: NzModalService,
              public toasterService: ToasterService, private workflowService: WorkflowService, private dataService: DataService,
              private nzContextMenuService: NzContextMenuService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.reload) {
      if (this.reload) {
        this.selectedNode = null;
        this.init();
        this.reload = false;
        return;
      }
    }
    if (this.workflow.actual) {
      this.saveJSON(false);
      this.selectedNode = null;
    }
    if (changes.data) {
      if (this.data.type) {
        this.init();
      } else {
        this.isLoading = false;
        this.workflow = {};
        this.jobs = [];
        this.title = '';
        this.orderRequirements = {};
        this.dummyXml = null;
      }
    }
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config) {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        const node = mxUtils.load(config).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;
        this.initEditorConf(editor, false, false);
        const outln = document.getElementById('outlineContainer');
        outln.innerHTML = '';
        outln.style['border'] = '1px solid lightgray';
        outln.style['background'] = '#FFFFFF';
        new mxOutline(this.editor.graph, outln);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      console.error(e);
      throw e; // for debugging
    }
  }

  ngOnDestroy() {
    if (this.data.type) {
      this.saveJSON(false);
      try {
        if (this.editor) {
          this.editor.destroy();
          mxOutline.prototype.destroy();
          this.editor = null;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  openDeclarationModal(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: UpdateWorkflowComponent,
      nzAutofocus: null,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerId,
        orderRequirements: this.coreService.clone(this.orderRequirements),
        isVariableOnly: true
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        let variableDeclarations = {parameters: []};
        variableDeclarations.parameters = result.variableDeclarations.parameters.filter((value) => {
          return !!value.name;
        });
        variableDeclarations.parameters = this.coreService.keyValuePair(variableDeclarations.parameters);
        if (variableDeclarations.parameters && _.isEmpty(variableDeclarations.parameters)) {
          delete variableDeclarations['parameters'];
        }
        if (JSON.stringify(this.orderRequirements) !== JSON.stringify(variableDeclarations)) {
          this.orderRequirements = variableDeclarations;
          this.updateOtherProperties();
        }
      }
    });
  }

  addWorkflow(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: UpdateWorkflowComponent,
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerId,
        data: this.workflow,
        title: this.title
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (result.name) {
          this.data.name = result.name;
          this.workflow.name = result.name;
          this.dataService.reloadTree.next({rename: this.data});
          this.workflow.deployed = false;
          this.data.deployed = false;
        }
        if (this.title !== result.title) {
          this.title = result.title;
          this.updateOtherProperties();
        }
      }
    });
  }

  zoomIn(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomIn();
    }
  }

  zoomOut(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomOut();
    }
  }

  actual(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomActual();
      this.center();
    }
  }

  fit(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.fit();
      this.center();
    }
  }

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    const n = this.history.length;
    if (this.indexOfNextAdd < n) {
      const obj = this.history[this.indexOfNextAdd++];
      this.reloadWorkflow(obj);
    }
  }

  /**
   * Function: undo
   *
   * Undoes the last change.
   */
  undo(): void {
    if (this.indexOfNextAdd > 0) {
      const obj = this.history[--this.indexOfNextAdd];
      this.reloadWorkflow(obj);
    }
  }

  expandAll(): void {
    if (this.editor.graph.isEnabled()) {
      const cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(false, true, cells, null, null);
    }
  }

  collapseAll(): void {
    if (this.editor.graph.isEnabled()) {
      const cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(true, true, cells, null, null);
    }
  }

  delete(): void {
    if (this.editor && this.editor.graph) {
      let cells = this.node ? [this.node.cell] : null;
      this.editor.graph.removeCells(cells, null);
    }
  }

  copy(node): void {
    if (this.editor && this.editor.graph) {
      let cell;
      if (node) {
        cell = node.cell;
      } else {
        cell = this.editor.graph.getSelectionCell();
      }
      if (cell) {
        if (this.cutCell) {
          this.changeCellStyle(this.editor.graph, this.cutCell, false);
          this.cutCell = null;
        }
        this.copyId = cell.getAttribute('uuid');
        if (this.copyId) {
          $('#toolbar').find('img').each(function(index) {
            if (index === 12) {
              $(this).removeClass('disable-link');
              $(this).attr('title', 'Copy of ' + cell.value.tagName);
            }
          });
        }
      }
    }
  }

  cut(node): void {
    if (this.editor && this.editor.graph) {
      const graph = this.editor.graph;
      let cell;
      if (node) {
        cell = node.cell;
      } else {
        cell = graph.getSelectionCell();
      }
      if (cell) {
        this.copyId = null;
        if (this.cutCell) {
          this.changeCellStyle(graph, this.cutCell, false);
        }
        this.changeCellStyle(graph, cell, true);
        this.cutCell = cell;
        $('#toolbar').find('img').each(function(index) {
          if (index === 12) {
            $(this).removeClass('disable-link');
            $(this).attr('title', cell.value.tagName);
          }
        });
      }
    }
  }

  closeMenu(): void {
    this.node = null;
  }

  validate(): void {
    if (this.invalidMsg && this.invalidMsg.match(/orderRequirements/)) {
      this.openDeclarationModal();
    } else {
      if (!this.workflow.valid) {
        let data = this.coreService.clone(this.workflow.configuration);
        this.modifyJSON(data, true, true);
      }
    }
  }

  exportJSON(): void {
    this.closeMenu();
    if (this.workflow.configuration && this.workflow.configuration.instructions && this.workflow.configuration.instructions.length > 0) {
      this.editor.graph.clearSelection();
      const name = (this.workflow.name || 'workflow') + '.json';
      const fileType = 'application/octet-stream';
      let data = this.coreService.clone(this.workflow.configuration);
      const flag = this.modifyJSON(data, true, true);
      if (!flag) {
        return;
      }
      if (typeof data === 'object') {
        let newData: any = {};
        if (this.orderRequirements && this.orderRequirements.parameters) {
          newData.orderRequirements = this.orderRequirements;
        }
        newData.instructions = data.instructions;
        if (this.title) {
          newData.title = this.title;
        }
        newData.jobs = data.jobs;
        data = JSON.stringify(newData, undefined, 2);
      }
      const blob = new Blob([data], {type: fileType});
      saveAs(blob, name);
    }
  }

  importJSON() {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ImportComponent,
      nzClassName: 'lg',
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.parseWorkflowJSON(result);
        if (result.orderRequirements) {
          this.orderRequirements = this.coreService.clone(result.orderRequirements);
        }
        if (result.title) {
          this.title = this.coreService.clone(result.title);
        }
        this.workflow.configuration = this.coreService.clone(result);
        if (result.jobs && !_.isEmpty(result.jobs)) {
          this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
            return {name: k, value: v};
          });
        }
        delete this.workflow.configuration['orderRequirements'];
        delete this.workflow.configuration['title'];
        this.history = [];
        this.indexOfNextAdd = 0;
        this.updateXMLJSON(false);
        this.storeData(result);
      }
    });
  }

  loadData(node, type, $event): void {
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        this.coreService.post('inventory/read/folder', {
          path: node.key,
          objectTypes: [type]
        }).subscribe((res: any) => {
          let data;
          if (type === 'LOCK') {
            data = res.locks;
            for (let i = 0; i < data.length; i++) {
              const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
              data[i].title = data[i].name;
              data[i].path = _path;
              data[i].key = data[i].name;
              data[i].type = type;
              data[i].isLeaf = true;
            }
            if (node.origin.children && node.origin.children.length > 0) {
              data = data.concat(node.origin.children);
            }
            if (node.origin.isLeaf) {
              node.origin.expanded = true;
            }
            node.origin.isLeaf = false;
            node.origin.children = data;
          }
          this.lockTree = [...this.lockTree];
        });
      }
    }

    if (this.selectedNode.obj.lockId1) {
      if (this.selectedNode.obj.lockId !== this.selectedNode.obj.lockId1) {
        this.selectedNode.obj.lockId = this.selectedNode.obj.lockId1;
        this.getLimit();
      }
    } else if (node.key && !node.key.match('/')) {
      if (this.selectedNode.obj.lockId !== node.key) {
        this.selectedNode.obj.lockId = node.key;
        this.getLimit();
      }
    }
  }

  onExpand(e, type) {
    this.loadData(e.node, type, null);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload() {
    if (this.data.type) {
      this.saveJSON(false);
      this.ngOnDestroy();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.centered();
    this.checkGraphHeight();
  }

  checkGraphHeight() {
    if (this.editor) {
      const dom = $('.graph-container');
      if (dom && dom.position()) {
        let top = (dom.position().top + $('#rightPanel').position().top);
        const ht = 'calc(100vh - ' + (top + 12) + 'px)';
        dom.css({'height': ht, 'scroll-top': '0'});
        $('#graph').slimscroll({height: ht, scrollTo: '0'});
      }
    }
  }

  validateJSON(skip) {
    if (!this.isUpdate) {
      this.isUpdate = true;
      if (this.workflow.configuration && this.workflow.configuration.instructions && this.workflow.configuration.instructions.length > 0) {
        let data = this.coreService.clone(this.workflow.configuration);
        this.workflow.valid = this.modifyJSON(data, true, false);
        this.saveJSON(this.workflow.valid ? data : skip ? false : 'false');
      }
      setTimeout(() => {
        this.isUpdate = false;
      }, 50);
    }
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.workflow});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.workflow});
  }

  navToLock(lockId) {
    this.dataService.reloadTree.next({navigate: {name: lockId, type: 'LOCK'}});
  }

  private init() {
    if (!this.dummyXml) {
      this.propertyPanelWidth = localStorage.propertyPanelWidth ? parseInt(localStorage.propertyPanelWidth, 10) : 310;
      this.loadConfig();
      this.coreService.get('workflow.json').subscribe((data) => {
        this.dummyXml = x2js.json2xml_str(data);
        this.createEditor(this.configXml);
        this.getObject();
      });

      this.handleWindowEvents();
    } else {
      const outln = document.getElementById('outlineContainer');
      outln.innerHTML = '';
      outln.style['border'] = '1px solid lightgray';
      new mxOutline(this.editor.graph, outln);
      this.getObject();
    }
    if (!this.isTrash) {
      if (this.jobClassTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: ['JOBCLASS']
        }).subscribe((res) => {
          this.jobClassTree = this.coreService.prepareTree(res, true);
        });
      }
      if (this.lockTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: ['LOCK']
        }).subscribe((res) => {
          this.lockTree = this.coreService.prepareTree(res, true);
        });
      }
      if (this.agents.length === 0) {
        this.coreService.post('agents/names', {controllerId: this.schedulerId}).subscribe((res: any) => {
          this.agents = res.agentNames ? res.agentNames.sort() : [];
        });
      }
    }
  }

  private getObject() {
    this.error = false;
    this.history = [];
    this.indexOfNextAdd = 0;
    this.isLoading = true;
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
      if (this.data.id === res.id) {
        this.jobs = [];
        this.orderRequirements = {};
        if (res.configuration) {
          delete res.configuration['TYPE'];
          delete res.configuration['path'];
          delete res.configuration['versionId'];
        } else {
          res.configuration = {};
        }

        if (res.configuration.orderRequirements) {
          this.orderRequirements = this.coreService.clone(res.configuration.orderRequirements);
        }
        this.title = res.configuration.title;
        delete res.configuration['orderRequirements'];
        delete res.configuration['title'];
        this.workflow = res;
        this.workflow.actual = JSON.stringify(res.configuration);

        this.workflow.name = this.data.name;
        if (this.workflow.configuration.jobs) {
          if (this.workflow.configuration.jobs && !_.isEmpty(this.workflow.configuration.jobs)) {
            this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
              return {name: k, value: v};
            });
          }
        }

        if (!res.configuration.instructions || res.configuration.instructions.length === 0) {
          this.invalidMsg = 'workflow.message.emptyWorkflow';
        } else if (!res.valid) {
          this.validateByURL(res.configuration);
        }
        this.updateXMLJSON(false);
        this.centered();
        this.checkGraphHeight();
        this.isLoading = false;
        this.history.push(this.workflow.actual);
        this.indexOfNextAdd = this.history.length;
        this.updateJobs(this.editor.graph, true);
      }
    }, () => {
      this.isLoading = false;
    });
  }

  private center(): void {
    let dom = document.getElementById('graph');
    let x = 0.5, y = 0.2;
    if (dom && this.editor) {
      if (dom.clientWidth !== dom.scrollWidth) {
        x = 0;
      }
      if (dom.clientHeight !== dom.scrollHeight) {
        y = 0;
      }
      this.editor.graph.center(true, true, x, y);
    }
  }

  private reloadWorkflow(obj): void {
    this.closeMenu();
    this.workflow.configuration = JSON.parse(obj);
    if (this.workflow.configuration.jobs) {
      if (this.workflow.configuration.jobs && !_.isEmpty(this.workflow.configuration.jobs)) {
        this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
          return {name: k, value: v};
        });
      }
    }
    this.updateXMLJSON(false);
  }

  private parseWorkflowJSON(result) {
    if (result.jobs && !_.isEmpty(result.jobs)) {
      for (let x in result.jobs) {
        let v: any = result.jobs[x];
        result.jobs[x] = {
          agentId: v.agentId,
          executable: v.executable,
          returnCodeMeaning: v.returnCodeMeaning,
          defaultArguments: v.defaultArguments,
          jobClass: v.jobClass,
          title: v.title,
          logLevel: v.logLevel,
          criticality: v.criticality,
          timeout: v.timeout,
          graceTimeout: v.graceTimeout,
          taskLimit: v.taskLimit
        };
      }
    }
  }

  private getLimit() {
    this.error = false;
    if (this.selectedNode.obj.lockId) {
      this.coreService.post('inventory/read/configuration', {
        path: this.selectedNode.obj.lockId,
        objectType: 'LOCK'
      }).subscribe((conf: any) => {
        if (this.selectedNode && this.selectedNode.obj) {
          this.selectedNode.obj.limit = conf.configuration.limit || 1;
        }
      });
    }
  }

  private changeCellStyle(graph, cell, isBlur) {
    let state = graph.view.getState(cell);
    if (state && state.shape) {
      state.style[mxConstants.STYLE_OPACITY] = isBlur ? 60 : 100;
      state.shape.apply(state);
      state.shape.redraw();
    }
  }

  private updateXMLJSON(noConversion) {
    this.closeMenu();
    if (!this.editor) {
      return;
    }
    let graph = this.editor.graph;
    if (!_.isEmpty(this.workflow.configuration)) {
      if (noConversion) {
        this.updateWorkflow(graph);
      } else {
        this.workflowService.convertTryToRetry(this.workflow.configuration, () => {
          this.updateWorkflow(graph);
        });
      }
    } else {
      this.reloadDummyXml(graph, this.dummyXml);
    }
  }

  private updateWorkflow(graph) {
    let scrollValue: any = {};
    let element = document.getElementById('graph');
    scrollValue.scrollTop = element.scrollTop;
    scrollValue.scrollLeft = element.scrollLeft;
    scrollValue.scale = graph.getView().getScale();
    graph.getModel().beginUpdate();
    try {
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
      let mapObj = {nodeMap: this.nodeMap};
      this.workflowService.createWorkflow(this.workflow.configuration, this.editor, mapObj);
      this.nodeMap = mapObj.nodeMap;
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
      WorkflowService.executeLayout(graph);
      this.skipXMLToJSONConversion = true;
    }
    const _element = document.getElementById('graph');
    _element.scrollTop = scrollValue.scrollTop + 20;
    _element.scrollLeft = scrollValue.scrollLeft;
    if (scrollValue.scale) {
      graph.getView().setScale(scrollValue.scale);
    }
  }

  /**
   * Reload dummy xml
   */
  private reloadDummyXml(graph, xml) {
    this.clearCopyObj();
    this.jobs = [];
    graph.getModel().beginUpdate();
    try {
      // Removes all cells
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
      const _doc = mxUtils.parseXml(xml);
      const dec = new mxCodec(_doc);
      const model = dec.decode(_doc.documentElement);
      // Merges the response model with the client model
      if (model) {
        graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
      }
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
      WorkflowService.executeLayout(graph);
    }
  }

  private handleWindowEvents() {
    const self = this;
    /**
     * Changes the zoom on mouseWheel events
     */
    const dom = $('#graph');
    dom.bind('mousewheel DOMMouseScroll', (event) => {
      if (this.editor) {
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            this.editor.execute('zoomIn');
          } else {
            this.editor.execute('zoomOut');
          }
        } else {
          const bounds = this.editor.graph.getGraphBounds();
          if (bounds.y < -0.05 && bounds.height > dom.height()) {
            this.center();
          }
        }
      }
    });
    $('#property-panel').on('resizestop', () => {
      self.checkGraphHeight();
    });

    const panel = $('.property-panel');
    $('.sidebar-open', panel).click(() => {
      self.propertyPanelWidth = localStorage.propertyPanelWidth ? parseInt(localStorage.propertyPanelWidth, 10) : 310;
      $('#outlineContainer').css({'right': self.propertyPanelWidth + 10 + 'px'});
      $('.graph-container').css({'margin-right': self.propertyPanelWidth + 'px'});
      $('.toolbar').css({'margin-right': (self.propertyPanelWidth - 12) + 'px'});
      $('.sidebar-close').css({right: self.propertyPanelWidth + 'px'});
      $('#property-panel').css({width: self.propertyPanelWidth + 'px'});
      $('.sidebar-open').css({right: '-20px'});
      self.centered();
    });

    $('.sidebar-close', panel).click(() => {
      self.propertyPanelWidth = 0;
      $('#outlineContainer').css({'right': '10px'});
      $('.graph-container').css({'margin-right': '0'});
      $('.toolbar').css({'margin-right': '-12px'});
      $('.sidebar-open').css({right: '0'});
      $('#property-panel').css({width: '0', left: window.innerWidth + 'px'});
      $('.sidebar-close').css({right: '-20px'});
      self.centered();
    });
    if (window.innerWidth > 1024) {
      setTimeout(() => {
        $('.sidebar-open').click();
      }, 100);
    }
    setTimeout(() => {
      self.checkGraphHeight();
    }, 10);
  }

  private centered() {
    if (this.editor && this.editor.graph) {
      setTimeout(() => {
        this.actual();
      }, 200);
    }
  }

  private loadConfig() {
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
      this.workflowService.init('dark');
    } else {
      this.workflowService.init('light');
    }
  }

  /**
   * Function: To convert Mxgraph xml to JSON (Web service response)
   * @param xml : option
   */
  private xmlToJsonParser(xml) {
    if (this.editor) {
      const _graph = _.clone(this.editor.graph);
      if (!xml) {
        const enc = new mxCodec();
        const node = enc.encode(_graph.getModel());
        xml = mxUtils.getXml(node);
      }
      let _json: any;
      try {
        _json = x2js.xml_str2json(xml);
      } catch (e) {
        console.error(e);
      }
      if (!_json.mxGraphModel) {
        return;
      }

      let objects = _json.mxGraphModel.root;
      let jsonObj = {
        instructions: []
      };
      let startNode: any = {};
      if (objects.Connection) {
        if (!_.isArray(objects.Connection)) {
          let _tempCon = _.clone(objects.Connection);
          objects.Connection = [];
          objects.Connection.push(_tempCon);
        }
        if (objects.Connection.length > 0) {
          let _temp;
          for (let i = 0; i < objects.Connection.length; i++) {
            if (objects.Connection[i]._type === 'then' && !_temp) {
              break;
            }
            if (objects.Connection[i]._type === 'else') {
              _temp = _.clone(objects.Connection[i]);
              objects.Connection.splice(i, 1);
              break;
            }
          }
          if (_temp) {
            objects.Connection.push(_temp);
          }
        }
        let connection = objects.Connection;
        let _jobs = _.clone(objects.Job);
        let _ifInstructions = _.clone(objects.If);
        let _forkInstructions = _.clone(objects.Fork);
        let _tryInstructions = _.clone(objects.Try);
        let _retryInstructions = _.clone(objects.Retry);
        let _lockInstructions = _.clone(objects.Lock);
        let _awaitInstructions = _.clone(objects.Await);
        let _publishInstructions = _.clone(objects.Publish);
        let _fileWatcherInstructions = _.clone(objects.FileWatcher);
        let _failInstructions = _.clone(objects.Fail);
        let _finishInstructions = _.clone(objects.Finish);
        let dummyNodesId = [];
        for (let i = 0; i < objects.Process.length; i++) {
          dummyNodesId.push(objects.Process[i]._id);
        }
        for (let i = 0; i < connection.length; i++) {
          if (dummyNodesId.indexOf(connection[i].mxCell._source) > -1) {

            continue;
          } else if (dummyNodesId.indexOf(connection[i].mxCell._target) > -1) {
            continue;
          }
          if (_jobs) {
            if (_.isArray(_jobs)) {
              for (let j = 0; j < _jobs.length; j++) {
                if (connection[i].mxCell._target === _jobs[j]._id) {
                  _jobs.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _jobs._id) {
                _jobs = [];
              }
            }
          }
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions)) {
              for (let j = 0; j < _forkInstructions.length; j++) {
                if (connection[i].mxCell._target === _forkInstructions[j]._id) {
                  _forkInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _forkInstructions._id) {
                _forkInstructions = [];
              }
            }
          }
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions)) {
              for (let j = 0; j < _retryInstructions.length; j++) {
                if (connection[i].mxCell._target === _retryInstructions[j]._id) {
                  _retryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _retryInstructions._id) {
                _retryInstructions = [];
              }
            }
          }
          if (_lockInstructions) {
            if (_.isArray(_lockInstructions)) {
              for (let j = 0; j < _lockInstructions.length; j++) {
                if (connection[i].mxCell._target === _lockInstructions[j]._id) {
                  _lockInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _lockInstructions._id) {
                _lockInstructions = [];
              }
            }
          }
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions)) {
              for (let j = 0; j < _tryInstructions.length; j++) {
                if (connection[i].mxCell._target === _tryInstructions[j]._id) {
                  _tryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _tryInstructions._id) {
                _tryInstructions = [];
              }
            }
          }
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions)) {
              for (let j = 0; j < _awaitInstructions.length; j++) {
                if (connection[i].mxCell._target === _awaitInstructions[j]._id) {
                  _awaitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _awaitInstructions._id) {
                _awaitInstructions = [];
              }
            }
          }
          if (_publishInstructions) {
            if (_.isArray(_publishInstructions)) {
              for (let j = 0; j < _publishInstructions.length; j++) {
                if (connection[i].mxCell._target === _publishInstructions[j]._id) {
                  _publishInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _publishInstructions._id) {
                _publishInstructions = [];
              }
            }
          }
          if (_fileWatcherInstructions) {
            if (_.isArray(_fileWatcherInstructions)) {
              for (let j = 0; j < _fileWatcherInstructions.length; j++) {
                if (connection[i].mxCell._target === _fileWatcherInstructions[j]._id) {
                  _fileWatcherInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _fileWatcherInstructions._id) {
                _fileWatcherInstructions = [];
              }
            }
          }
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions)) {
              for (let j = 0; j < _ifInstructions.length; j++) {
                if (connection[i].mxCell._target === _ifInstructions[j]._id) {
                  _ifInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _ifInstructions._id) {
                _ifInstructions = [];
              }
            }
          }
          if (_failInstructions) {
            if (_.isArray(_failInstructions)) {
              for (let j = 0; j < _failInstructions.length; j++) {
                if (connection[i].mxCell._target === _failInstructions[j]._id) {
                  _failInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _failInstructions._id) {
                _failInstructions = [];
              }
            }
          }
          if (_finishInstructions) {
            if (_.isArray(_finishInstructions)) {
              for (let j = 0; j < _finishInstructions.length; j++) {
                if (connection[i].mxCell._target === _finishInstructions[j]._id) {
                  _finishInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _finishInstructions._id) {
                _finishInstructions = [];
              }
            }
          }
        }

        if (_jobs) {
          if (_.isArray(_jobs) && _jobs.length > 0) {
            startNode = _jobs[0];
          } else {
            startNode = _jobs;
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Job', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions) && _forkInstructions.length > 0) {
              startNode = _forkInstructions[0];
            } else {
              startNode = _forkInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Fork', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_lockInstructions) {
            if (_.isArray(_lockInstructions) && _lockInstructions.length > 0) {
              startNode = _lockInstructions[0];
            } else {
              startNode = _lockInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Lock', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions) && _retryInstructions.length > 0) {
              startNode = _retryInstructions[0];
            } else {
              startNode = _retryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Retry', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions) && _tryInstructions.length > 0) {
              startNode = _tryInstructions[0];
            } else {
              startNode = _tryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Try', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_publishInstructions) {
            if (_.isArray(_publishInstructions) && _publishInstructions.length > 0) {
              startNode = _publishInstructions[0];
            } else {
              startNode = _publishInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Publish', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions) && _awaitInstructions.length > 0) {
              startNode = _awaitInstructions[0];
            } else {
              startNode = _awaitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Await', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions) && _ifInstructions.length > 0) {
              startNode = _ifInstructions[0];
            } else {
              startNode = _ifInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('If', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_failInstructions) {
            if (_.isArray(_failInstructions) && _failInstructions.length > 0) {
              startNode = _failInstructions[0];
            } else {
              startNode = _failInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Fail', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_finishInstructions) {
            if (_.isArray(_finishInstructions) && _finishInstructions.length > 0) {
              startNode = _finishInstructions[0];
            } else {
              startNode = _finishInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Finish', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        }
      } else {
        const job = objects.Job;
        const ifIns = objects.If;
        const fork = objects.Fork;
        const retry = objects.Retry;
        const lock = objects.Lock;
        const tryIns = objects.Try;
        const awaitIns = objects.Await;
        const publishIns = objects.Publish;
        const fileWatcherIns = objects.FileWatcher;
        const fail = objects.Fail;
        const finish = objects.Finish;
        if (job) {
          if (_.isArray(job)) {
            for (let i = 0; i < job.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Job', job[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Job', job));
          }
        }
        if (ifIns) {
          if (_.isArray(ifIns)) {
            for (let i = 0; i < ifIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('If', ifIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('If', ifIns));
          }
        }
        if (fork) {
          if (_.isArray(fork)) {
            for (let i = 0; i < fork.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Fork', fork[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Fork', fork));
          }
        }
        if (lock) {
          if (_.isArray(lock)) {
            for (let i = 0; i < lock.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Lock', lock[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Lock', lock));
          }
        }
        if (retry) {
          if (_.isArray(retry)) {
            for (let i = 0; i < retry.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Retry', retry[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Retry', retry));
          }
        }
        if (tryIns) {
          if (_.isArray(tryIns)) {
            for (let i = 0; i < tryIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Try', tryIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Try', tryIns));
          }
        }
        if (awaitIns) {
          if (_.isArray(awaitIns)) {
            for (let i = 0; i < awaitIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Await', awaitIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Await', awaitIns));
          }
        }
        if (publishIns) {
          if (_.isArray(publishIns)) {
            for (let i = 0; i < publishIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Publish', publishIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Publish', publishIns));
          }
        }
        if (fileWatcherIns) {
          if (_.isArray(fileWatcherIns)) {
            for (let i = 0; i < fileWatcherIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('FileWatcher', fileWatcherIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('FileWatcher', fileWatcherIns));
          }
        }
        if (fail) {
          if (_.isArray(fail)) {
            for (let i = 0; i < fail.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Fail', fail[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Fail', fail));
          }
        }
        if (finish) {
          if (_.isArray(finish)) {
            for (let i = 0; i < finish.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Finish', finish[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Finish', finish));
          }
        }
      }
      if (jsonObj.instructions.length > 0) {
        this.workflow.configuration = _.clone(jsonObj);
      } else {
        this.workflow.configuration = {};
      }

    }
    this.implicitSave = false;
  }

  private findNextNode(connection, node, objects, instructions: Array<any>, jsonObj) {
    if (!node) {
      return;
    }
    const id = node._id || node;
    if (_.isArray(connection)) {
      for (let i = 0; i < connection.length; i++) {
        if (!connection[i].skip && connection[i].mxCell._source && connection[i].mxCell._source === id) {
          const _id = _.clone(connection[i].mxCell._target);
          let instructionArr = instructions;
          if (connection[i]._type === 'then' || connection[i]._type === 'else') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'If' && instructions[j].id === id) {
                if (connection[i]._type === 'then') {
                  instructions[j].then = {
                    instructions: []
                  };
                  instructionArr = instructions[j].then.instructions;
                } else {
                  instructions[j].else = {
                    instructions: []
                  };
                  instructionArr = instructions[j].else.instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'branch') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Fork' && instructions[j].id === id) {
                if (!instructions[j].branches) {
                  instructions[j].branches = [];
                }
                instructions[j].branches.push({instructions: []});
                for (let x = 0; x < instructions[j].branches.length; x++) {
                  if (!instructions[j].branches[x].id) {
                    instructions[j].branches[x].id = connection[i]._label;
                    instructionArr = instructions[j].branches[x].instructions;
                    break;
                  }
                }
                break;
              }
            }
          } else if (connection[i]._type === 'retry') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Retry' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'lock') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Lock' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'try') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Try' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          }
          connection[i].skip = true;
          if (connection[i]._type === 'join') {
            const joinInstructions = objects.Join;
            let _node: any = {};
            if (joinInstructions) {
              if (_.isArray(joinInstructions)) {
                for (let x = 0; x < joinInstructions.length; x++) {
                  if (joinInstructions[x]._id === _id) {
                    _node = joinInstructions[x];
                    break;
                  }
                }
              } else {
                if (joinInstructions._id === _id) {
                  _node = joinInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endIf') {
            const endIfInstructions = objects.EndIf;
            let _node: any = {};
            if (endIfInstructions) {
              if (_.isArray(endIfInstructions)) {
                for (let x = 0; x < endIfInstructions.length; x++) {
                  if (endIfInstructions[x]._id === _id) {
                    _node = endIfInstructions[x];
                    break;
                  }
                }
              } else {
                if (endIfInstructions._id === _id) {
                  _node = endIfInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endLock') {
            const endLockInstructions = objects.EndLock;
            let _node: any = {};
            if (endLockInstructions) {
              if (_.isArray(endLockInstructions)) {
                for (let x = 0; x < endLockInstructions.length; x++) {
                  if (endLockInstructions[x]._id === _id) {
                    _node = endLockInstructions[x];
                    break;
                  }
                }
              } else {
                if (endLockInstructions._id === _id) {
                  _node = endLockInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endRetry') {
            const endRetryInstructions = objects.EndRetry;
            let _node: any = {};
            if (endRetryInstructions) {
              if (_.isArray(endRetryInstructions)) {
                for (let x = 0; x < endRetryInstructions.length; x++) {
                  if (endRetryInstructions[x]._id === _id) {
                    _node = endRetryInstructions[x];
                    break;
                  }
                }
              } else {
                if (endRetryInstructions._id === _id) {
                  _node = endRetryInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endTry') {
            const endTryInstructions = objects.EndTry;
            let _node: any = {};
            if (endTryInstructions) {
              if (_.isArray(endTryInstructions)) {
                for (let x = 0; x < endTryInstructions.length; x++) {
                  if (endTryInstructions[x]._id === _id) {
                    _node = endTryInstructions[x];
                    break;
                  }
                }
              } else {
                if (endTryInstructions._id === _id) {
                  _node = endTryInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          }
          this.getNextNode(_id, objects, instructionArr, jsonObj);
        }
      }
    } else {
      if (connection.mxCell._source && connection.mxCell._source === id) {
        const _id = _.clone(connection.mxCell._target);
        connection = null;
        this.getNextNode(_id, objects, instructions, jsonObj);
      }
    }
  }

  private recursiveFindParentCell(id, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_id, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _id) {
          arr = _instructionsArr;
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'Fork') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_id, _instructionsArr[i].branches[j].instructions);
              }
            }
          }
          if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_id, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_id, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              if (_instructionsArr[i].catch.id === _id) {
                arr = _instructionsArr[i].catch.instructions;
                break;
              } else {
                recursive(_id, _instructionsArr[i].catch.instructions);
              }
            }
            if (_instructionsArr[i].instructions && _instructionsArr[i].instructions.length > 0) {
              recursive(_id, _instructionsArr[i].instructions);
            }
          }
        }
      }
    }

    recursive(id, instructionsArr);
    return arr;
  }

  private recursiveFindCatchCell(node, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_node, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _node._targetId) {
          if (_instructionsArr[i].TYPE === 'Try') {
            if (!_instructionsArr[i].catch) {
              _instructionsArr[i].catch = {instructions: [], id: _node._id};
              arr = _instructionsArr[i].catch.instructions;
            }
          }
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'Fork') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_node, _instructionsArr[i].branches[j].instructions);
              }
            }
          } else if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_node, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_node, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              recursive(_node, _instructionsArr[i].catch.instructions);
            }
          } else if (_instructionsArr[i].instructions) {
            recursive(_node, _instructionsArr[i].instructions);
          }
        }
      }
    }

    recursive(node, instructionsArr);
    return arr;
  }

  private getNextNode(id, objects, instructionsArr: Array<any>, jsonObj) {
    const connection = objects.Connection;
    const jobs = objects.Job;
    const ifInstructions = objects.If;
    const endIfInstructions = objects.EndIf;
    const forkInstructions = objects.Fork;
    const joinInstructions = objects.Join;
    const retryInstructions = objects.Retry;
    const lockInstructions = objects.Lock;
    const endRetryInstructions = objects.EndRetry;
    const endLockInstructions = objects.EndLock;
    const tryInstructions = objects.Try;
    const catchInstructions = objects.Catch;
    const tryEndInstructions = objects.EndTry;
    const awaitInstructions = objects.Await;
    const publishInstructions = objects.Publish;
    const failInstructions = objects.Fail;
    const finishInstructions = objects.Finish;
    const fileWatcherInstructions = objects.FileWatcher;

    let nextNode: any = {};

    if (jobs) {
      if (_.isArray(jobs)) {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i]._id === id) {
            nextNode = jobs[i];
            break;
          }
        }
      } else {
        if (jobs._id === id) {
          nextNode = jobs;
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Job', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (forkInstructions) {
        if (_.isArray(forkInstructions)) {
          for (let i = 0; i < forkInstructions.length; i++) {
            if (forkInstructions[i]._id === id) {
              nextNode = forkInstructions[i];
              break;
            }
          }
        } else {
          if (forkInstructions._id === id) {
            nextNode = forkInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Fork', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (joinInstructions) {
        if (_.isArray(joinInstructions)) {
          for (let i = 0; i < joinInstructions.length; i++) {
            if (joinInstructions[i]._id === id) {
              nextNode = joinInstructions[i];
              break;
            }
          }
        } else {
          if (joinInstructions._id === id) {
            nextNode = joinInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (lockInstructions) {
        if (_.isArray(lockInstructions)) {
          for (let i = 0; i < lockInstructions.length; i++) {
            if (lockInstructions[i]._id === id) {
              nextNode = lockInstructions[i];
              break;
            }
          }
        } else {
          if (lockInstructions._id === id) {
            nextNode = lockInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Lock', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endLockInstructions) {
        if (_.isArray(endLockInstructions)) {
          for (let i = 0; i < endLockInstructions.length; i++) {
            if (endLockInstructions[i]._id === id) {
              nextNode = endLockInstructions[i];
              break;
            }
          }
        } else {
          if (endLockInstructions._id === id) {
            nextNode = endLockInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (retryInstructions) {
        if (_.isArray(retryInstructions)) {
          for (let i = 0; i < retryInstructions.length; i++) {
            if (retryInstructions[i]._id === id) {
              nextNode = retryInstructions[i];
              break;
            }
          }
        } else {
          if (retryInstructions._id === id) {
            nextNode = retryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Retry', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endRetryInstructions) {
        if (_.isArray(endRetryInstructions)) {
          for (let i = 0; i < endRetryInstructions.length; i++) {
            if (endRetryInstructions[i]._id === id) {
              nextNode = endRetryInstructions[i];
              break;
            }
          }
        } else {
          if (endRetryInstructions._id === id) {
            nextNode = endRetryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (awaitInstructions) {
        if (_.isArray(awaitInstructions)) {
          for (let i = 0; i < awaitInstructions.length; i++) {
            if (awaitInstructions[i]._id === id) {
              nextNode = awaitInstructions[i];
              break;
            }
          }
        } else {
          if (awaitInstructions._id === id) {
            nextNode = awaitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Await', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryInstructions) {
        if (_.isArray(tryInstructions)) {
          for (let i = 0; i < tryInstructions.length; i++) {
            if (tryInstructions[i]._id === id) {
              nextNode = tryInstructions[i];
              break;
            }
          }
        } else {
          if (tryInstructions._id === id) {
            nextNode = tryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Try', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryEndInstructions) {
        if (_.isArray(tryEndInstructions)) {
          for (let i = 0; i < tryEndInstructions.length; i++) {
            if (tryEndInstructions[i]._id === id) {
              nextNode = tryEndInstructions[i];
              break;
            }
          }
        } else {
          if (tryEndInstructions._id === id) {
            nextNode = tryEndInstructions;
          }
        }
      }
    }
    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (catchInstructions) {
        if (_.isArray(catchInstructions)) {
          for (let i = 0; i < catchInstructions.length; i++) {
            if (catchInstructions[i]._id === id) {
              nextNode = catchInstructions[i];
              break;
            }
          }
        } else {
          if (catchInstructions._id === id) {
            nextNode = catchInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      let arr = this.recursiveFindCatchCell(nextNode, jsonObj.instructions);
      this.findNextNode(connection, nextNode, objects, arr, jsonObj);
      nextNode = null;
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (ifInstructions) {
        if (_.isArray(ifInstructions)) {
          for (let i = 0; i < ifInstructions.length; i++) {
            if (ifInstructions[i]._id === id) {
              nextNode = ifInstructions[i];
              break;
            }
          }
        } else {
          if (ifInstructions._id === id) {
            nextNode = ifInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('If', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endIfInstructions) {
        if (_.isArray(endIfInstructions)) {
          for (let i = 0; i < endIfInstructions.length; i++) {
            if (endIfInstructions[i]._id === id) {
              nextNode = endIfInstructions[i];
              break;
            }
          }
        } else {
          if (endIfInstructions._id === id) {
            nextNode = endIfInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (failInstructions) {
        if (_.isArray(failInstructions)) {
          for (let i = 0; i < failInstructions.length; i++) {
            if (failInstructions[i]._id === id) {
              nextNode = failInstructions[i];
              break;
            }
          }
        } else {
          if (failInstructions._id === id) {
            nextNode = failInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Fail', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (finishInstructions) {
        if (_.isArray(finishInstructions)) {
          for (let i = 0; i < finishInstructions.length; i++) {
            if (finishInstructions[i]._id === id) {
              nextNode = finishInstructions[i];
              break;
            }
          }
        } else {
          if (finishInstructions._id === id) {
            nextNode = finishInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Finish', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (publishInstructions) {
        if (_.isArray(publishInstructions)) {
          for (let i = 0; i < publishInstructions.length; i++) {
            if (publishInstructions[i]._id === id) {
              nextNode = publishInstructions[i];
              break;
            }
          }
        } else {
          if (publishInstructions._id === id) {
            nextNode = publishInstructions;
          }
        }
      }
    }
    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Publish', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (fileWatcherInstructions) {
        if (_.isArray(fileWatcherInstructions)) {
          for (let i = 0; i < fileWatcherInstructions.length; i++) {
            if (fileWatcherInstructions[i]._id === id) {
              nextNode = fileWatcherInstructions[i];
              break;
            }
          }
        } else {
          if (fileWatcherInstructions._id === id) {
            nextNode = fileWatcherInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('FileWatcher', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      this.findNextNode(connection, id, objects, instructionsArr, jsonObj);
    }
  }

  private initEditorConf(editor, isXML, callFun) {
    if (!editor) {
      return;
    }
    const self = this;
    const graph = editor.graph;
    let result: string;
    let dropTarget;
    let movedTarget;
    let selectedCellsObj;
    let isVertexDrop = false;
    let dragStart = false;
    let _iterateId = 0;
    const doc = mxUtils.createXmlDocument();
    if (!callFun) {
      $('#toolbar').find('img').each(function(index) {
        if (index === 11) {
          $(this).addClass('disable-link');
        } else if (index === 12) {
          $(this).addClass('disable-link');
        }
      });
      if (!isXML) {
        /**
         * Variable: autoSaveThreshold
         *
         * Minimum amount of ignored changes before an autosave.
         */
        mxAutoSaveManager.prototype.autoSaveThreshold = 1;
        mxAutoSaveManager.prototype.autoSaveDelay = 5;
        mxGraph.prototype.cellsResizable = false;
        mxGraph.prototype.multigraph = false;
        mxGraph.prototype.allowDanglingEdges = false;
        mxGraph.prototype.cellsLocked = true;
        mxGraph.prototype.foldingEnabled = true;
        mxGraph.prototype.cellsCloneable = false;
        mxConstants.DROP_TARGET_COLOR = 'green';
        mxConstants.VERTEX_SELECTION_DASHED = false;
        mxConstants.VERTEX_SELECTION_COLOR = '#0099ff';
        mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
        mxUndoManager.prototype.size = 1;

        /**
         * Function: createPreviewShape
         *
         * Creates the shape used to draw the preview for the given bounds.
         */
        mxGraphHandler.prototype.createPreviewShape = function(bounds) {
          let shape, image = './assets/mxgraph/images/';
          if (self.preferences.theme !== 'light' && self.preferences.theme !== 'lighter' || !self.preferences.theme) {
            image = image + 'white-';
          }
          image = image + this.cell.value.tagName.toLowerCase() + '.png';
          shape = new mxImageShape(bounds, image);
          shape.isRounded = true;
          shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
            mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
          shape.init(this.graph.getView().getOverlayPane());
          shape.pointerEvents = false;
          // Workaround for artifacts on iOS
          if (mxClient.IS_IOS) {
            shape.getSvgScreenOffset = function() {
              return 0;
            };
          }
          return shape;
        };

        if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter' || !this.preferences.theme) {
          let style = graph.getStylesheet().getDefaultEdgeStyle();
          style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
          let style2 = graph.getStylesheet().getDefaultEdgeStyle();
          if (this.preferences.theme === 'blue-lt') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(70, 82, 95, 0.6)';
          } else if (this.preferences.theme === 'blue') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(50, 70, 90, 0.61)';
          } else if (this.preferences.theme === 'cyan') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(29, 29, 28, 0.5)';
          } else if (this.preferences.theme === 'grey') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(78, 84, 92, 0.62)';
          }
          mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed-white.png', 12, 12);
          mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded-white.png', 12, 12);
        } else {
          mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed.png', 12, 12);
          mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded.png', 12, 12);
        }

        // Enables snapping waypoints to terminals
        mxEdgeHandler.prototype.snapToTerminals = true;

        graph.setConnectable(false);
        graph.setHtmlLabels(true);
        graph.setEnabled(false);
        graph.setDisconnectOnMove(false);
        graph.collapseToPreferredSize = false;
        graph.constrainChildren = false;
        graph.extendParentsOnAdd = false;
        graph.extendParents = false;

        const keyHandler = new mxKeyHandler(graph);

        // Handle Delete: delete key
        keyHandler.bindKey(46, function() {
          self.delete();
        });

        // Handle Undo: Ctrl + z
        keyHandler.bindControlKey(90, function() {
          self.undo();
        });

        // Handle Redo: Ctrl + y
        keyHandler.bindControlKey(89, function() {
          self.redo();
        });

        // Handle Copy: Ctrl + c
        keyHandler.bindControlKey(67, function() {
          self.copy(null);
        });

        // Handle Cut: Ctrl + x
        keyHandler.bindControlKey(88, function() {
          self.cut(null);
        });


        function clearClipboard() {
          if (self.cutCell) {
            self.changeCellStyle(self.editor.graph, self.cutCell, false);
          }
          self.cutCell = null;
          $('#toolbar').find('img').each(function(index) {
            if (index === 12) {
              $(this).addClass('disable-link');
            }
          });
        }

        // Defines a new class for all icons
        function mxIconSet(state) {
          this.images = [];
          let img;
          if (state.cell && (state.cell.value.tagName === 'Job' || state.cell.value.tagName === 'Finish' || state.cell.value.tagName === 'Fail' ||
            state.cell.value.tagName === 'Await' || state.cell.value.tagName === 'Publish' || self.workflowService.isInstructionCollapsible(state.cell.value.tagName))) {
            img = mxUtils.createImage('./assets/images/menu.svg');
            let x = state.x - (20 * state.shape.scale), y = state.y - (8 * state.shape.scale);
            if (state.cell.value.tagName !== 'Job') {
              y = y + (state.cell.geometry.height / 2 * state.shape.scale) - 4;
              x = x + 2;
            }
            img.style.left = (x + 5) + 'px';
            img.style.top = y + 'px';
            mxEvent.addListener(img, 'click',
              mxUtils.bind(this, function(evt) {
                self.node = {cell: state.cell};
                if (self.menu) {
                  setTimeout(() => {
                    self.nzContextMenuService.create(evt, self.menu);
                  }, 0);
                }
                this.destroy();
              })
            );
          }
          if (img) {
            img.style.position = 'absolute';
            img.style.cursor = 'pointer';
            img.style.width = (18 * state.shape.scale) + 'px';
            img.style.height = (18 * state.shape.scale) + 'px';
            state.view.graph.container.appendChild(img);
            this.images.push(img);
          }
        }

        mxIconSet.prototype.destroy = function() {
          if (this.images != null) {
            for (let i = 0; i < this.images.length; i++) {
              let img = this.images[i];
              img.parentNode.removeChild(img);
            }
          }

          this.images = null;
        };

        /**
         * Function: isCellEditable
         *
         * Returns <isCellEditable>.
         */
        graph.isCellEditable = function() {
          return false;
        };

        /**
         * Function: isCellSelectable
         *
         * Returns <cellSelectable>.
         */
        graph.isCellSelectable = function(cell) {
          if (!cell || self.isTrash) {
            return false;
          }
          return !cell.edge;
        };

        // Changes fill color to red on mouseover
        graph.addMouseListener({
          currentState: null, previousStyle: null, currentHighlight: null, currentIconSet: null,
          mouseDown: function(sender, me) {
            if (self.isTrash) {
              return;
            }
            if (this.currentState != null) {
              this.dragLeave(me.getEvent(), this.currentState);
              this.currentState = null;
            }
          },
          mouseMove: function(sender, me) {
            if (self.isTrash) {
              return;
            }
            if (me.consumed && me.getCell()) {
              self.isCellDragging = true;
              setTimeout(function() {
                if (self.movedCell) {
                  $('#dropContainer2').show();
                  $('#toolbar-icons').hide();
                }
              }, 10);
            }
            if (this.currentState != null && me.getState() == this.currentState) {
              return;
            }
            let tmp = graph.view.getState(me.getCell());
            // Ignores everything but vertices
            if (graph.isMouseDown) {
              tmp = null;
            }
            if ($('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {

              if (tmp != this.currentState) {
                if (this.currentState != null) {
                  this.dragLeave(me.getEvent(), this.currentState);
                }
                this.currentState = tmp;
                if (this.currentState != null) {
                  this.dragEnter(me.getEvent(), this.currentState, me.getCell());
                }
              }
            } else {
              if (this.currentIconSet != null) {
                this.currentIconSet.destroy();
                this.currentIconSet = null;
              }
              if (tmp) {
                this.currentIconSet = new mxIconSet(tmp);
              }
              return;
            }
          },
          mouseUp: function(sender, me) {
            if (self.isTrash) {
              return;
            }
            if (self.isCellDragging) {
              self.isCellDragging = false;
              detachedInstruction(me.evt.target, self.movedCell);
              self.movedCell = null;
              if (self.droppedCell && me.getCell()) {
                rearrangeCell(self.droppedCell);
                self.droppedCell = null;
              } else {
                self.storeJSON();
              }
            }
          },
          dragEnter: function(evt, state, cell) {
            if (state != null) {
              this.previousStyle = state.style;
              state.style = mxUtils.clone(state.style);
              if (state.style && !dragStart && $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
                result = checkValidTarget(cell, $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child').attr('title'));
                if (result === 'valid' || result === 'select') {
                  this.currentHighlight = new mxCellHighlight(graph, 'green');
                  this.currentHighlight.highlight(state);
                } else if (result === 'inValid') {
                  this.currentHighlight = new mxCellHighlight(graph, '#ff0000');
                  this.currentHighlight.highlight(state);
                }
              }
              if (state.shape) {
                state.shape.apply(state);
                state.shape.redraw();
              }
              if (state.text != null) {
                state.text.apply(state);
                state.text.redraw();
              }
            }
          },
          dragLeave: function(evt, state) {
            if (state != null) {
              state.style = this.previousStyle;
              if (state.style && this.currentHighlight != null) {
                this.currentHighlight.destroy();
                this.currentHighlight = null;
              }
              if (state.shape) {
                state.shape.apply(state);
                state.shape.redraw();
              }

              if (state.text != null) {
                state.text.apply(state);
                state.text.redraw();
              }
            }
          }
        });

        function detachedInstruction(target, cell) {
          if (target && target.getAttribute('class') === 'dropContainer' && cell) {
            self.droppedCell = null;
            self.editor.graph.removeCells(cell, null);
          }
          $('#dropContainer2').hide();
          $('#toolbar-icons').show();
        }

        /**
         * Function: isCellMovable
         *
         * Returns true if the given cell is moveable.
         */
        graph.isCellMovable = function(cell) {
          if (cell.value && !self.isTrash) {
            return !cell.edge && cell.value.tagName !== 'Catch' && cell.value.tagName !== 'Process' && !checkClosingCell(cell);
          } else {
            return false;
          }
        };

        graph.moveCells = function(cells) {
          return cells;
        };

        /**
         * Function: handle a click event
         *
         */
        graph.click = function(me) {
          const evt = me.getEvent();
          let cell = me.getCell();
          const mxe = new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', cell);
          if (cell && !dragStart) {
            const dom = $('#toolbar');
            if (dom.find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
              const sourceCell = dom.find('img.mxToolbarModeSelected').not('img:first-child');
              if (result === 'valid' || evt.pointerType === 'touch') {
                const _result = checkValidTarget(cell, sourceCell.attr('src'));
                if (_result !== 'select') {
                  result = _result;
                }
              }
              createClickInstruction(sourceCell.attr('src'), cell);
              mxToolbar.prototype.resetMode(true);
            }
          } else {
            dragStart = false;
          }
          if (me.isConsumed()) {
            mxe.consume();
          }

          if (!cell || (cell && cell.value.tagName !== 'Connection')) {
            graph.clearSelection();
          }

          // Handles the event if it has not been consumed
          if (cell) {
            if (cell.value.tagName === 'Job' || cell.value.tagName === 'Finish' || cell.value.tagName === 'Fail' ||
              cell.value.tagName === 'Await' || cell.value.tagName === 'Publish') {
              graph.setSelectionCell(cell);
            } else {
              if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
                graph.setSelectionCells([cell]);
              }
            }
          }
          customizedChangeEvent();
          self.closeMenu();
        };

        /**
         * Function: resetMode
         *
         * Selects the default mode and resets the state of the previously selected
         * mode.
         */
        mxToolbar.prototype.resetMode = function(forced) {
          if (forced) {
            this.defaultMode = $('#toolbar').find('img:first-child')[0];
            this.selectedMode = $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0];
          }
          if ((forced || !this.noReset) && this.selectedMode != this.defaultMode) {
            this.selectMode(this.defaultMode, this.defaultFunction);
          }
        };

        /**
         * Overrides method to provide a cell collapse/expandable on double click
         */
        graph.dblClick = function(evt, cell) {
          if (cell != null && cell.vertex == 1) {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              const flag = cell.collapsed != true;
              graph.foldCells(flag, false, [cell], null, evt);
            }
          }
        };

        /**
         * Overrides method to provide a cell label in the display
         * @param cell
         */
        graph.convertValueToString = function(cell) {
          return self.workflowService.convertValueToString(cell, graph);
        };

        // Returns the type as the tooltip for column cells
        graph.getTooltipForCell = function(cell) {
          return self.workflowService.getTooltipForCell(cell);
        };

        /**
         * To check drop target is valid or not on hover
         *
         */
        mxDragSource.prototype.dragOver = function(_graph, evt) {
          dragStart = true;
          let offset = mxUtils.getOffset(_graph.container);
          let origin = mxUtils.getScrollOrigin(_graph.container);
          let x = mxEvent.getClientX(evt) - offset.x + origin.x - _graph.panDx;
          let y = mxEvent.getClientY(evt) - offset.y + origin.y - _graph.panDy;

          if (_graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
            _graph.scrollPointToVisible(x, y, _graph.autoExtend);
          }

          if ($('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
            mxToolbar.prototype.resetMode(true);
          }

          // Highlights the drop target under the mouse
          if (this.currentHighlight != null && _graph.isDropEnabled()) {
            this.currentDropTarget = this.getDropTarget(_graph, x, y, evt);
            let state = _graph.getView().getState(this.currentDropTarget);
            if (state && state.cell) {
              result = checkValidTarget(state.cell, this.dragElement.getAttribute('src'));
              this.currentHighlight.highlightColor = 'green';
              if (result === 'inValid') {
                this.currentHighlight.highlightColor = '#ff0000';
              }
              if (result === 'return') {
                return;
              }
            }
            this.currentHighlight.highlight(state);
          }

          // Updates the location of the preview
          if (this.previewElement != null) {
            if (this.previewElement.parentNode == null) {
              _graph.container.appendChild(this.previewElement);
              this.previewElement.style.zIndex = '3';
              this.previewElement.style.position = 'absolute';
            }

            let gridEnabled = this.isGridEnabled() && _graph.isGridEnabledEvent(evt);
            let hideGuide = true;

            // Grid and guides
            if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
              // LATER: HTML preview appears smaller than SVG preview
              let w = parseInt(this.previewElement.style.width, 10);
              let h = parseInt(this.previewElement.style.height, 10);
              let bounds = new mxRectangle(0, 0, w, h);
              let delta = new mxPoint(x, y);
              delta = this.currentGuide.move(bounds, delta, gridEnabled);
              hideGuide = false;
              x = delta.x;
              y = delta.y;
            } else if (gridEnabled) {
              let scale = _graph.view.scale;
              let tr = _graph.view.translate;
              let off = _graph.gridSize / 2;
              x = (_graph.snap(x / scale - tr.x - off) + tr.x) * scale;
              y = (_graph.snap(y / scale - tr.y - off) + tr.y) * scale;
            }

            if (this.currentGuide != null && hideGuide) {
              this.currentGuide.hide();
            }

            if (this.previewOffset != null) {
              x += this.previewOffset.x;
              y += this.previewOffset.y;
            }

            this.previewElement.style.left = Math.round(x) + 'px';
            this.previewElement.style.top = Math.round(y) + 'px';
            this.previewElement.style.visibility = 'visible';
          }
          this.currentPoint = new mxPoint(x, y);
        };

        /**
         * Check the drop target on drop event
         * @param _graph
         * @param evt
         * @param drpTargt
         * @param x
         * @param y
         */
        mxDragSource.prototype.drop = function(_graph, evt, drpTargt, x, y) {
          dropTarget = null;
          movedTarget = null;
          selectedCellsObj = null;
          let flag = false;
          let dragElement = null;
          if (drpTargt) {
            let check = false;
            let title = '', msg = '';
            self.translate.get('workflow.message.invalidTarget').subscribe(translatedValue => {
              title = translatedValue;
            });
            if (this.dragElement && this.dragElement.getAttribute('src')) {
              dragElement = this.dragElement.getAttribute('src');
              if (dragElement.match('fork') || dragElement.match('retry') || dragElement.match('lock') || dragElement.match('try') || dragElement.match('if')) {
                const selectedCell = graph.getSelectionCell();
                if (selectedCell) {
                  const cells = graph.getSelectionCells();
                  if (cells.length > 1) {
                    selectedCellsObj = isCellSelectedValid(cells);
                    if (selectedCellsObj.invalid) {
                      self.translate.get('workflow.message.invalidInstructionsSelected').subscribe(translatedValue => {
                        msg = translatedValue;
                      });
                      self.toasterService.pop('error', title + '!!', msg);
                      return;
                    }
                  }
                  if (selectedCell.id === drpTargt.id || (selectedCellsObj && selectedCellsObj.ids && selectedCellsObj.ids.length > 0 && selectedCellsObj.ids.indexOf(drpTargt.id) > -1)) {
                    check = true;
                  }
                }
              }
            }
            if (!check) {
              if (drpTargt.value.tagName !== 'Connection') {
                if (drpTargt.value.tagName === 'Job' || drpTargt.value.tagName === 'Finish' || drpTargt.value.tagName === 'Fail' || drpTargt.value.tagName === 'Await' || drpTargt.value.tagName === 'Publish') {
                  for (let i = 0; i < drpTargt.edges.length; i++) {
                    if (drpTargt.edges[i].target.id !== drpTargt.id) {
                      self.translate.get('workflow.message.validationError').subscribe(translatedValue => {
                        msg = translatedValue;
                      });
                      self.toasterService.pop('error', title + '!!', drpTargt.value.tagName + ' ' + msg);
                      return;
                    }
                  }
                } else if (drpTargt.value.tagName === 'If') {
                  if (drpTargt.edges.length > 2) {
                    self.translate.get('workflow.message.ifInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', title + '!!', msg);
                    return;
                  }
                } else if (checkClosingCell(drpTargt)) {
                  if (drpTargt.edges.length > 1) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].target.id !== drpTargt.id) {
                        self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                          msg = translatedValue;
                        });
                        self.toasterService.pop('error', title + '!!', msg);
                        return;
                      }
                    }
                  }
                } else if (drpTargt.value.tagName === 'Retry') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Retry' && drpTargt.edges[i].target.value.tagName === 'EndRetry') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', title + '!!', msg);
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Lock') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Lock' && drpTargt.edges[i].target.value.tagName === 'EndLock') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', title + '!!', msg);
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Try') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Try' && drpTargt.edges[i].target && (drpTargt.edges[i].target.value.tagName === 'Catch' || drpTargt.edges[i].target.value.tagName === 'EndTry')) {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', title + '!!', msg);
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Catch') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Catch' && drpTargt.edges[i].target.value.tagName === 'EndTry') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', title + '!!', msg);
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Process') {
                  if (drpTargt.getAttribute('start') || drpTargt.getAttribute('end')) {
                    return;
                  }
                  if (drpTargt.edges && drpTargt.edges.length === 1) {
                    if (drpTargt.edges[0].value.tagName === 'Connector') {
                      return;
                    }
                  }
                } else if (drpTargt.value.tagName === 'Connector') {
                  return;
                }
                dropTarget = drpTargt;
              } else {
                if (drpTargt.value.tagName === 'Connection') {
                  if ((drpTargt.source.value.tagName === 'Fork' && drpTargt.target.value.tagName === 'Join') ||
                    (drpTargt.source.value.tagName === 'If' && drpTargt.target.value.tagName === 'EndIf') ||
                    (drpTargt.source.value.tagName === 'Retry' && drpTargt.target.value.tagName === 'EndRetry') ||
                    (drpTargt.source.value.tagName === 'Lock' && drpTargt.target.value.tagName === 'EndLock') ||
                    (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'Catch') ||
                    (drpTargt.source.value.tagName === 'Catch' && drpTargt.target.value.tagName === 'EndTry') ||
                    (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'EndTry')) {
                    return;
                  }
                }
                flag = true;
              }
              setTimeout(() => {
                self.validateJSON(true);
              }, 50);
            } else {
              movedTarget = drpTargt;
            }

            if (dragElement) {
              if (dragElement.match('paste')) {
                if (self.copyId) {
                  pasteInstruction(drpTargt);
                } else if (self.cutCell) {
                  createClickInstruction(dragElement, drpTargt);
                }
                return;
              }
              if (drpTargt.value.tagName !== 'Connection') {
                createClickInstruction(dragElement, drpTargt);
                return;
              }
            }

          } else {
            return;
          }
          this.dropHandler(_graph, evt, drpTargt, x, y);
          if (_graph.container.style.visibility !== 'hidden') {
            _graph.container.focus();
          }
          if (flag) {
            WorkflowService.executeLayout(graph);
          }
        };

        /**
         * Function: removeCells
         *
         * Removes the given cells from the graph including all connected edges if
         * includeEdges is true. The change is carried out using <cellsRemoved>.
         * This method fires <mxEvent.REMOVE_CELLS> while the transaction is in
         * progress. The removed cells are returned as an array.
         *
         * Parameters:
         *
         * cells - Array of <mxCells> to remove. If null is specified then the
         * selection cells which are deletable are used.
         * flag - Optional boolean which specifies if all connected edges
         * should be removed as well. Default is true.
         */
        mxGraph.prototype.removeCells = function(cells, flag) {
          if (cells == null) {
            cells = this.getDeletableCells(this.getSelectionCells());
          }
          if (typeof flag != 'boolean') {
            if (cells && cells.length) {
              deleteInstructionFromJSON(cells);
            }
          } else {
            // in cells or descendant of cells
            cells = this.getDeletableCells(this.addAllEdges(cells));
            this.model.beginUpdate();
            try {
              this.cellsRemoved(cells);
              this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS,
                'cells', cells, 'includeEdges', true));
            } finally {
              this.model.endUpdate();
            }
          }
          return cells;
        };

        /**
         * Function: foldCells to collapse/expand
         *
         * collapsed - Boolean indicating the collapsed state to be assigned.
         * recurse - Optional boolean indicating if the collapsed state of all
         * descendants should be set. Default is true.
         * cells - Array of <mxCells> whose collapsed state should be set. If
         * null is specified then the foldable selection cells are used.
         * checkFoldable - Optional boolean indicating of isCellFoldable should be
         * checked. Default is false.
         * evt - Optional native event that triggered the invocation.
         */
        mxGraph.prototype.foldCells = function(collapse, recurse, cells, checkFoldable) {
          graph.clearSelection();
          recurse = (recurse != null) ? recurse : true;
          this.stopEditing(false);
          this.model.beginUpdate();
          try {
            this.cellsFolded(cells, collapse, recurse, checkFoldable);
            this.fireEvent(new mxEventObject(mxEvent.FOLD_CELLS,
              'collapse', collapse, 'recurse', recurse, 'cells', cells));
          } finally {
            this.model.endUpdate();
          }
          WorkflowService.executeLayout(graph);
          return cells;
        };


        /**
         * Function: addVertex
         *
         * Adds the given vertex as a child of parent at the specified
         * x and y coordinate and fires an <addVertex> event.
         */
        mxEditor.prototype.addVertex = function(parent, vertex, x, y) {
          let model = this.graph.getModel();
          while (parent != null && !this.graph.isValidDropTarget(parent)) {
            parent = model.getParent(parent);
          }
          if (!parent && !isVertexDrop) {
            return null;
          } else {
            isVertexDrop = false;
          }
          parent = (parent != null) ? parent : this.graph.getSwimlaneAt(x, y);
          let scale = this.graph.getView().scale;

          let geo = model.getGeometry(vertex);
          let pgeo = model.getGeometry(parent);

          if (this.graph.isSwimlane(vertex) &&
            !this.graph.swimlaneNesting) {
            parent = null;
          } else if (parent == null && this.swimlaneRequired) {
            return null;
          } else if (parent != null && pgeo != null) {
            // Keeps vertex inside parent
            let state = this.graph.getView().getState(parent);

            if (state != null) {
              x -= state.origin.x * scale;
              y -= state.origin.y * scale;

              if (this.graph.isConstrainedMoving) {
                let width = geo.width;
                let height = geo.height;
                let tmp = state.x + state.width;
                if (x + width > tmp) {
                  x -= x + width - tmp;
                }
                tmp = state.y + state.height;
                if (y + height > tmp) {
                  y -= y + height - tmp;
                }
              }
            } else if (pgeo != null) {
              x -= pgeo.x * scale;
              y -= pgeo.y * scale;
            }
          }

          geo = geo.clone();
          geo.x = this.graph.snap(x / scale -
            this.graph.getView().translate.x -
            this.graph.gridSize / 2);
          geo.y = this.graph.snap(y / scale -
            this.graph.getView().translate.y -
            this.graph.gridSize / 2);
          vertex.setGeometry(geo);

          if (parent == null) {
            parent = this.graph.getDefaultParent();
          }

          this.cycleAttribute(vertex);
          this.fireEvent(new mxEventObject(mxEvent.BEFORE_ADD_VERTEX,
            'vertex', vertex, 'parent', parent));

          model.beginUpdate();
          try {
            vertex = this.graph.addCell(vertex, parent);

            if (vertex != null) {
              this.graph.constrainChild(vertex);

              this.fireEvent(new mxEventObject(mxEvent.ADD_VERTEX, 'vertex', vertex));
            }
          } finally {
            model.endUpdate();
          }
          if (vertex != null) {
            this.graph.setSelectionCell(vertex);
            this.graph.scrollCellToVisible(vertex);
            this.fireEvent(new mxEventObject(mxEvent.AFTER_ADD_VERTEX, 'vertex', vertex));
            customizedChangeEvent();
          }
          return vertex;
        };

        /**
         * Event to check if connector is valid or not on drop of new instruction
         * @param cell
         * @param cells
         * @param evt
         */
        graph.isValidDropTarget = function(cell, cells, evt) {
          if (cell && cell.value) {
            self.droppedCell = null;
            if (self.isCellDragging && cells && cells.length > 0) {
              if (!cells[0]) {
                return;
              }
              self.movedCell = cells;
              const tagName = cell.value.tagName;
              if (tagName === 'Connection' || self.workflowService.isInstructionCollapsible(tagName) || tagName === 'Catch') {
                if (tagName === 'Connection') {
                  let sourceId = cell.source.id;
                  let targetId = cell.target.id;
                  if (checkClosingCell(cell.source)) {
                    sourceId = cell.source.value.getAttribute('targetId');
                  } else if (cell.source.value.tagName === 'Process' && cell.source.getAttribute('title') === 'start') {
                    sourceId = 'start';
                  }
                  if (checkClosingCell(cell.target)) {
                    targetId = cell.target.value.getAttribute('targetId');
                  } else if (cell.target.value.tagName === 'Process' && cell.target.getAttribute('title') === 'start') {
                    targetId = 'start';
                  }
                  self.droppedCell = {target: {source: sourceId, target: targetId}, cell: cells[0], type: cell.value.getAttribute('type')};
                  return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
                } else {
                  self.droppedCell = {target: cell.id, cell: cells[0]};
                  return true;
                }
              } else {
                return false;
              }
            } else {
              isVertexDrop = true;
              if (cell.value && cell.value.tagName === 'Connection') {
                graph.clearSelection();
                if (cells && cells.length > 0) {
                  if (cell.source) {
                    if (cell.source.getParent() && cell.source.getParent().id !== '1') {
                      const _type = cell.getAttribute('type');
                      if (!(_type === 'retry' || _type === 'lock' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                        cell.setParent(cell.source.getParent());
                      }
                    }
                  }
                  if (self.workflowService.isInstructionCollapsible(cells[0].value.tagName)) {
                    const parent = cell.getParent() || graph.getDefaultParent();
                    let v1, v2, label = '';
                    const attr = cell.value.attributes;
                    if (attr) {
                      for (let i = 0; i < attr.length; i++) {
                        if (attr[i].value && attr[i].name) {
                          label = attr[i].value;
                          break;
                        }
                      }
                    }
                    if (cells[0].value.tagName === 'Fork') {
                      v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, self.workflowService.merge);
                    } else if (cells[0].value.tagName === 'If') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
                    } else if (cells[0].value.tagName === 'Retry') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
                    } else if (cells[0].value.tagName === 'Lock') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', null), 0, 0, 68, 68, self.workflowService.closeLock);
                    } else {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
                      v2 = graph.insertVertex(cells[0], null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
                      graph.insertEdge(parent, null, getConnectionNode('try'), cells[0], v2);
                      graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
                    }
                    graph.insertEdge(parent, null, getConnectionNode(label), cell.source, cells[0]);
                    if (cells[0].value.tagName !== 'Try') {
                      graph.insertEdge(parent, null, getConnectionNode(''), cells[0], v1);
                    }
                    graph.insertEdge(parent, null, getConnectionNode(''), v1, cell.target);
                    for (let x = 0; x < cell.source.edges.length; x++) {
                      if (cell.source.edges[x].id === cell.id) {
                        const _sourCellName = cell.source.value.tagName;
                        const _tarCellName = cell.target.value.tagName;
                        if ((cell.target && ((_sourCellName === 'Job' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'Publish' || _sourCellName === 'Await') &&
                          (_tarCellName === 'Job' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'Publish' || _tarCellName === 'Await')))) {
                          graph.getModel().remove(cell.source.edges[x]);
                        } else {
                          cell.source.removeEdge(cell.source.edges[x], true);
                        }
                        break;
                      }
                    }

                    setTimeout(() => {
                      graph.getModel().beginUpdate();
                      try {
                        if (cells[0].id && v1.id) {
                          self.nodeMap.set(cells[0].id, v1.id);
                        }
                        const targetId = new mxCellAttributeChange(
                          v1, 'targetId',
                          cells[0].id);
                        graph.getModel().execute(targetId);
                        if (v2) {
                          const targetId2 = new mxCellAttributeChange(
                            v2, 'targetId', cells[0].id);
                          graph.getModel().execute(targetId2);
                        }
                      } finally {
                        graph.getModel().endUpdate();
                      }
                      checkConnectionLabel(cells[0], cell, false);
                    }, 0);
                    return false;
                  }
                }
                if (checkClosedCellWithSourceCell(cell.source, cell.target)) {
                  graph.removeCells(cells, true);
                  evt.preventDefault();
                  evt.stopPropagation();
                  return false;
                }
                graph.setSelectionCells(cells);
                customizedChangeEvent();
                setTimeout(() => {
                  checkConnectionLabel(cells[0], cell, true);
                  isVertexDrop = false;
                }, 0);
              } else {
                if (cell.value && cell.value.tagName === 'Connector') {
                  graph.removeCells(cells, true);
                  evt.preventDefault();
                  evt.stopPropagation();
                  return false;
                }
              }
            }
            if (this.isCellCollapsed(cell)) {
              return true;
            }
            return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
          }
        };

        /**
         * Implements a properties panel that uses
         * mxCellAttributeChange to change properties
         */
        graph.getSelectionModel().addListener(mxEvent.CHANGE, function() {
          let cell = graph.getSelectionCell();
          if (cell && (checkClosingCell(cell) ||
            cell.value.tagName === 'Connection' || cell.value.tagName === 'Process' || cell.value.tagName === 'Catch')) {
            graph.clearSelection();
            return;
          }
          if (cell && self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
            const targetId = self.nodeMap.get(cell.id);
            if (targetId) {
              const lastCell = graph.getModel().getCell(targetId);
              if (lastCell) {
                graph.addSelectionCell(graph.getModel().getCell(targetId));
              }
            }
          }
        });

        initGraph(this.dummyXml);
        self.centered();

        WorkflowService.executeLayout(graph);

        const mgr = new mxAutoSaveManager(graph);
        mgr.save = function() {
          if (self.cutCell) {
            clearClipboard();
          }
          if (!self.isLoading && !self.isTrash) {
            setTimeout(() => {
              if (self.workflow.actual) {
                self.implicitSave = true;
                if (self.noSave) {
                  self.noSave = false;
                } else {
                  if (!self.skipXMLToJSONConversion) {
                    self.xmlToJsonParser(null);
                  } else {
                    self.skipXMLToJSONConversion = false;
                  }
                  if (self.workflow.configuration && self.workflow.configuration.instructions && self.workflow.configuration.instructions.length > 0) {
                    graph.setEnabled(true);
                  } else {
                    self.reloadDummyXml(graph, self.dummyXml);
                  }
                  self.validateJSON(false);
                }
                setTimeout(() => {
                  self.implicitSave = false;
                }, 250);
              }
            }, 200);
          } else {
            if (self.workflow.configuration && self.workflow.configuration.instructions && self.workflow.configuration.instructions.length > 0) {
              graph.setEnabled(true);
            } else {
              self.reloadDummyXml(graph, self.dummyXml);
            }
          }
        };
      } else {
        this.updateXMLJSON(false);
      }
    }

    /**
     * Function: Remove selected cells from JSON
     * @param cells
     */
    function deleteInstructionFromJSON(cells) {
      deleteRecursively(self.workflow.configuration, cells[0], '', () => {
        setTimeout(() => {
          if (self.editor && self.editor.graph) {
            self.updateXMLJSON(true);
            self.updateJobs(graph, false);
          }
        }, 1);
      });
    }

    function deleteRecursively(_json, _cell, _type, cb) {
      function iterateJson(json, cell, type) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (json.instructions[x].id == cell.id) {
              json.instructions.splice(x, 1);
              if (json.instructions.length === 0 && type !== 'catch') {
                delete json['instructions'];
                delete json['id'];
              }
              break;
            }

            if (json.instructions[x].instructions) {
              iterateJson(json.instructions[x], cell, '');
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.id == cell.id) {
                delete json.instructions[x]['catch'];
                break;
              }
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                iterateJson(json.instructions[x].catch, cell, 'catch');
              }
            }
            if (json.instructions[x].then) {
              iterateJson(json.instructions[x].then, cell, '');
            }
            if (json.instructions[x].else) {
              iterateJson(json.instructions[x].else, cell, '');
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                iterateJson(json.instructions[x].branches[i], cell, '');
                if (!json.instructions[x].branches[i].instructions) {
                  json.instructions[x].branches.splice(i, 1);
                  if (json.instructions[x].branches.length === 0) {
                    delete json.instructions[x]['branches'];
                    break;
                  }
                }
              }
            }
          }
        }
      }

      iterateJson(_json, _cell, _type);
      cb();
    }

    /**
     * Function: Get first and last cell from the user selected cells
     * @param cells
     */
    function isCellSelectedValid(cells) {
      let obj = {firstCell: null, lastCell: null, ids: [], invalid: false};
      if (cells.length === 2) {
        if (!checkClosedCellWithSourceCell(cells[0], cells[1])) {
          let x = graph.getEdgesBetween(cells[0], cells[1]);
          if (x.length === 0) {
            obj.invalid = true;
            return obj;
          }
        }
      }
      for (let i = 0; i < cells.length; i++) {
        obj.invalid = !isSelectedCellConnected(cells, cells[i]);
        obj.ids.push(cells[i].id);
        if (!isParentAlsoSelected(cells, cells[i])) {
          if (!obj.firstCell) {
            obj.firstCell = cells[i];
          }
          if (!obj.lastCell) {
            obj.lastCell = cells[i];
          }
          if (obj.firstCell && obj.firstCell.geometry.y > cells[i].geometry.y) {
            obj.firstCell = cells[i];
          }
        }
        if (!obj.lastCell || (obj.lastCell.geometry.y < cells[i].geometry.y)) {
          obj.lastCell = cells[i];
        }
      }
      return obj;
    }

    /**
     * Function : To check is parent instruction also selected or not
     * @param cells
     * @param cell
     */
    function isParentAlsoSelected(cells, cell) {
      let flag = false;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].id === cell.getParent().id) {
          flag = true;
          break;
        }
      }

      return flag;
    }

    /**
     * Function: To check is selected instructions are interconnected or not
     * @param cells
     * @param cell
     */
    function isSelectedCellConnected(cells, cell) {
      let flag = false;
      for (let i = 0; i < cells.length; i++) {
        if (graph.getEdgesBetween(cells[i], cell).length > 0) {
          flag = true;
          break;
        } else {
          if (checkClosingCell(cell)) {
            flag = true;
            break;
          }
        }
      }
      return flag;
    }

    /**
     * Function: To check source is closed with its own closing cell or not
     * @param sour
     * @param targ
     */
    function checkClosedCellWithSourceCell(sour, targ) {
      const sourName = sour.value.tagName;
      const tarName = targ.value.tagName;
      return (sourName === 'Fork' && tarName === 'Join') || (sourName === 'If' && tarName === 'EndIf') ||
        ((sourName === 'Try' && tarName === 'EndTry') || (sourName === 'Try' && tarName === 'Catch') ||
          (sourName === 'Catch' && tarName === 'EndTry')) || (sourName === 'Retry' && tarName === 'EndRetry')
        || (sourName === 'Lock' && tarName === 'EndLock');
    }

    /**
     * Function: Check closing cell
     * @param cell
     */
    function checkClosingCell(cell) {
      return cell.value.tagName === 'Join' || cell.value.tagName === 'EndIf' ||
        cell.value.tagName === 'EndTry' || cell.value.tagName === 'EndRetry' || cell.value.tagName === 'EndLock';
    }

    /**
     * Function: Move selected cell into dropped cell
     * @param cell
     * @param parentCell
     * @param cells
     */
    function moveSelectedCellToDroppedCell(cell, parentCell, cells) {
      const cellName = parentCell.value.tagName;
      let parent;
      if (cell) {
        parent = cell.getParent();
      } else {
        parent = cells.firstCell.getParent();
      }
      let v2, v3, _sour, _tar, _middle;
      if (cellName === 'Fork') {
        v2 = graph.insertVertex(parent, null, getCellNode('Join', 'join', parentCell.id), 0, 0, 68, 68, self.workflowService.merge);
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }
          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (self.workflowService.isInstructionCollapsible(lastCellName)) {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];
                break;
              }
            }
            _middle = cells.lastCell;
          }
        }

        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('branch'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('join'), _middle, v2);


      } else if (cellName === 'If') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', parentCell.id), 0, 0, 75, 75, 'if');
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (self.workflowService.isInstructionCollapsible(lastCellName)) {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('then'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('endIf'), _middle, v2);
      } else if (cellName === 'Try') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', parentCell.id), 0, 0, 75, 75, 'try');
        v3 = graph.insertVertex(parent, null, getCellNode('Catch', 'catch', parentCell.id), 0, 0, 100, 40, 'dashRectangle');
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (self.workflowService.isInstructionCollapsible(lastCellName)) {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('try'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('try'), _middle, v3);
        graph.insertEdge(parent, null, getConnectionNode('endTry'), v3, v2);
      } else if (cellName === 'Retry') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', parentCell.id), 0, 0, 75, 75, 'retry');
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (self.workflowService.isInstructionCollapsible(lastCellName)) {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('retry'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('endRetry'), _middle, v2);
      } else if (cellName === 'Lock') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', parentCell.id), 0, 0, 68, 68, self.workflowService.lock);
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (self.workflowService.isInstructionCollapsible(lastCellName)) {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('lock'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('endLock'), _middle, v2);
      }
      if (_sour && _tar) {
        graph.getModel().remove(_sour);
        graph.getModel().remove(_tar);
      }
      self.xmlToJsonParser(null);
      self.updateXMLJSON(true);
    }

    /**
     * Function to connect new node with existing connections
     * @param v1
     * @param v2
     * @param parent
     * @param _sour
     * @param _tar
     */
    function connectExtraNodes(v1, v2, parent, _sour, _tar) {
      let l1 = '', l2 = '';
      if (_sour && _sour.value) {
        let attrs = _.clone(_sour.value.attributes);
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName === 'type') {
              l1 = attrs[i].nodeValue;
            }
          }
        }
      }

      if (_tar && _tar.value) {
        let attrs2 = _.clone(_tar.value.attributes);
        if (attrs2) {
          for (let i = 0; i < attrs2.length; i++) {
            if (attrs2[i].nodeName === 'type') {
              l2 = attrs2[i].nodeValue;
            }
          }
        }
      }
      if (_sour && _tar) {
        graph.insertEdge(parent, null, getConnectionNode(l1), _sour.source, v1);
        graph.insertEdge(parent, null, getConnectionNode(l2), v2, _tar.target);
      }
    }

    /**
     * Get end node of If/Fork/Try/Retry/Lock
     * @param cell
     */
    function getEndNode(cell) {
      let targetNode = {};

      function recursive(target) {
        const edges = target.edges;
        if (checkClosedCellWithSourceCell(cell, target)) {

          const attrs = target.value.attributes;
          if (attrs) {
            for (let i = 0; i < attrs.length; i++) {
              if (attrs[i].nodeName === 'targetId' && attrs[i].nodeValue === cell.id) {
                for (let x = 0; x < edges.length; x++) {
                  if (edges[x].target.id !== target.id) {
                    targetNode = edges[x];
                    break;
                  }
                }
                break;
              }
            }
          }
        }
        if (edges && edges.length > 0) {
          for (let j = 0; j < edges.length; j++) {
            if (edges[j].target) {
              if (edges[j].target.id !== target.id) {
                if (checkClosedCellWithSourceCell(cell, edges[j].target)) {
                  const attrs = edges[j].target.value.attributes;
                  if (attrs) {
                    for (let i = 0; i < attrs.length; i++) {
                      if (attrs[i].nodeName === 'targetId' && (attrs[i].nodeValue === cell.id || attrs[i].nodeValue === target.id)) {
                        const _edges = edges[j].target.edges;
                        for (let x = 0; x < _edges.length; x++) {
                          if (_edges[x].target.id !== edges[j].target.id) {
                            targetNode = _edges[x];
                            break;
                          }
                        }
                        break;
                      }
                    }
                  }
                } else {
                  if (edges[j].target) {
                    if (_iterateId !== edges[j].target.id) {
                      _iterateId = edges[j].target.id;
                      recursive(edges[j].target);
                    }
                  }
                }
              }
            }
          }
          if (!targetNode) {
            for (let i = 0; i < edges.length; i++) {
              if (edges[i] && edges[i].target) {
                if (_iterateId !== edges[i].target.id) {
                  _iterateId = edges[i].target.id;
                  recursive((edges[i].target));
                }
                break;
              }
            }
          }
        }
      }

      recursive(cell);
      return targetNode;
    }

    function initGraph(xml) {
      const _doc = mxUtils.parseXml(xml);
      const codec = new mxCodec(_doc);
      codec.decode(_doc.documentElement, graph.getModel());
      const vertices = graph.getChildVertices(graph.getDefaultParent());
      if (vertices.length > 3) {
        graph.setEnabled(true);

      }
    }

    /**
     * Create new connection object
     * @param label
     */
    function getConnectionNode(label: string): any {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      let str = label, type = label;
      if (label.substring(0, 6) === '$TYPE$') {
        type = 'branch';
        str = label.substring(6);
      }
      connNode.setAttribute('label', str);
      connNode.setAttribute('type', type);
      return connNode;
    }

    /**
     * Create new Node object
     * @param name
     * @param label
     * @param id
     */
    function getCellNode(name: string, label: string, id: any): any {
      // Create new node object
      const _node = doc.createElement(name);
      _node.setAttribute('label', label);
      if (id) {
        _node.setAttribute('targetId', id);
      }
      return _node;
    }

    /**
     * change label of EndIf and Join
     */
    function changeLabelOfConnection(cell, data) {
      graph.getModel().beginUpdate();
      try {
        const label = new mxCellAttributeChange(
          cell, 'label',
          data);
        const type = new mxCellAttributeChange(
          cell, 'type',
          data);
        graph.getModel().execute(label);
        graph.getModel().execute(type);
      } finally {
        graph.getModel().endUpdate();
        self.skipXMLToJSONConversion = false;
      }
    }

    function checkConnectionLabel(cell, _dropTarget, isChange) {
      graph.getModel().beginUpdate();
      try {
        const uuid = new mxCellAttributeChange(
          cell, 'uuid', self.workflowService.create_UUID()
        );
        graph.getModel().execute(uuid);
      } finally {
        graph.getModel().endUpdate();
      }
      if (!isChange) {
        const label = _dropTarget.getAttribute('type') || _dropTarget.getAttribute('label');
        if (label && (label === 'join' || label === 'branch' || label === 'endIf'
          || label === 'endRetry' || label === 'endTry' || label === 'endLock')) {
          let _label1, _label2;
          if (label === 'join') {
            _label1 = 'join';
            _label2 = 'branch';
          } else if (label === 'branch') {
            _label1 = 'branch';
            _label2 = 'branch';
          } else if (label === 'endIf') {
            _label1 = 'endIf';
            _label2 = 'endIf';
          } else if (label === 'endRetry') {
            _label1 = 'endRetry';
            _label2 = 'endRetry';
          } else if (label === 'endLock') {
            _label1 = 'endLock';
            _label2 = 'endLock';
          } else if (label === 'try') {
            _label1 = 'try';
            _label2 = 'try';
          } else if (label === 'endTry') {
            _label1 = 'endTry';
            _label2 = 'endTry';
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target !== cell.id) {
              if (checkClosingCell(cell.edges[i].target)) {
                if (cell.edges[i].target.edges) {
                  for (let j = 0; j < cell.edges[i].target.edges.length; j++) {
                    if (cell.edges[i].target.edges[j] && cell.edges[i].target.edges[j].target.id !== cell.edges[i].target.id) {
                      changeLabelOfConnection(cell.edges[i].target.edges[j], _label1);
                      break;
                    }
                  }
                }
              } else if (self.workflowService.isInstructionCollapsible(cell.edges[i].target.value.tagName)) {
                changeLabelOfConnection(cell.edges[i], _label2);
              } else if (cell.edges[i].target.value.tagName === 'Catch') {
                changeLabelOfConnection(cell.edges[i], 'try');
              }
            }
          }
        }
      } else {
        if (cell.edges) {
          let _tempCell: any;
          for (let i = 0; i < cell.edges.length; i++) {
            if (_tempCell) {
              if (cell.edges[i].target !== cell.id) {
                if (cell.edges[i].target.value.tagName === 'Join') {
                  changeLabelOfConnection(_tempCell, 'branch');
                  changeLabelOfConnection(cell.edges[i], 'join');
                } else if (cell.edges[i].target.value.tagName === 'EndIf') {
                  changeLabelOfConnection(cell.edges[i], 'endIf');
                } else if (cell.edges[i].target.value.tagName === 'EndRetry') {
                  changeLabelOfConnection(cell.edges[i], 'endRetry');
                } else if (cell.edges[i].target.value.tagName === 'EndLock') {
                  changeLabelOfConnection(cell.edges[i], 'endLock');
                } else if (cell.edges[i].target.value.tagName === 'EndTry') {
                  changeLabelOfConnection(cell.edges[i], 'endTry');
                }
              }
            }
            if (cell.edges[i].source !== cell.id) {
              if (checkClosingCell(cell.edges[i].source)) {
                _tempCell = cell.edges[i];
              }
            }

            if (_dropTarget.getAttribute('type')) {
              const typeAttr = _dropTarget.getAttribute('type');
              if (((typeAttr === 'join') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], 'branch');
              } else if (((typeAttr === 'endIf') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endRetry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endLock') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endTry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              }
            }
            if (cell.id !== cell.edges[i].target.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value && (attrs[0].value === 'then' || attrs[0].value === 'else')) {
                  graph.getModel().beginUpdate();
                  try {
                    const label = new mxCellAttributeChange(
                      cell.edges[i], 'label',
                      '');
                    const type = new mxCellAttributeChange(
                      cell.edges[i], 'type',
                      '');
                    graph.getModel().execute(label);
                    graph.getModel().execute(type);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
              }
            } else if (cell.id !== cell.edges[i].source.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs && attrs.length > 0) {
                if (attrs[0].value === 'If') {
                  if (cell.edges[i].target.value.tagName !== 'If' && cell.edges[i].source.value.tagName !== 'If' && cell.value.tagName !== 'If') {
                    graph.getModel().beginUpdate();
                    try {
                      const label = new mxCellAttributeChange(
                        cell.edges[i], 'label',
                        '');
                      const type = new mxCellAttributeChange(
                        cell.edges[i], 'type',
                        '');
                      graph.getModel().execute(label);
                      graph.getModel().execute(type);
                    } finally {
                      graph.getModel().endUpdate();
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    function updateProperties(obj) {
      if (self.selectedNode && self.selectedNode.cell) {
        graph.getModel().beginUpdate();
        let flag = true;
        try {

          if (self.selectedNode.type === 'Job') {
            flag = self.updateJobProperties(self.selectedNode);
            const edit = new mxCellAttributeChange(
              obj.cell, 'jobName', self.selectedNode.newObj.jobName || 'job');
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'label', self.selectedNode.newObj.label);
            graph.getModel().execute(edit2);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'defaultArguments', JSON.stringify(self.selectedNode.newObj.defaultArguments));
            graph.getModel().execute(edit3);
          } else if (self.selectedNode.type === 'If') {
            const predicate = self.selectedNode.newObj.predicate;
            self.validatePredicate(predicate, null, false);
            const edit = new mxCellAttributeChange(
              obj.cell, 'predicate', predicate);
            graph.getModel().execute(edit);
          } else if (self.selectedNode.type === 'Retry') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'maxTries', self.selectedNode.newObj.maxTries);
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'retryDelays', self.selectedNode.newObj.retryDelays);
            graph.getModel().execute(edit2);
          } else if (self.selectedNode.type === 'Lock') {
            let count = '';
            if (self.selectedNode.newObj.countProperty === 'shared') {
              count = self.selectedNode.newObj.count;
            }
            const edit = new mxCellAttributeChange(
              obj.cell, 'count', count);
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'lockId', self.selectedNode.newObj.lockId);
            graph.getModel().execute(edit2);
          } else if (self.selectedNode.type === 'Finish' || self.selectedNode.type === 'Fail') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'outcome', JSON.stringify(self.selectedNode.newObj.outcome));
            graph.getModel().execute(edit);
          } else if (self.selectedNode.type === 'Await') {
            const edit1 = new mxCellAttributeChange(
              obj.cell, 'junctionPath', self.selectedNode.newObj.junctionPath);
            graph.getModel().execute(edit1);
            let timeout;
            if (self.selectedNode.newObj.timeout1) {
              timeout = self.workflowService.convertStringToDuration(self.selectedNode.newObj.timeout1);
            }
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'timeout', timeout);
            graph.getModel().execute(edit2);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'joinVariables', self.selectedNode.newObj.joinVariables);
            graph.getModel().execute(edit3);
            const edit4 = new mxCellAttributeChange(
              obj.cell, 'predicate', self.selectedNode.newObj.predicate);
            graph.getModel().execute(edit4);
            const edit5 = new mxCellAttributeChange(
              obj.cell, 'match', self.selectedNode.newObj.match);
            graph.getModel().execute(edit5);
          } else if (self.selectedNode.type === 'Publish') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'junctionPath', self.selectedNode.newObj.junctionPath);
            graph.getModel().execute(edit);
          } else if (self.selectedNode.type === 'FileWatcher') {
            const edit1 = new mxCellAttributeChange(
              obj.cell, 'directory', self.selectedNode.newObj.directory);
            graph.getModel().execute(edit1);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'regex', self.selectedNode.newObj.regex);
            graph.getModel().execute(edit2);
          } else if (self.selectedNode.type === 'Fork') {
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'joinVariables', self.selectedNode.newObj.joinVariables);
            graph.getModel().execute(edit2);
            const edges = graph.getOutgoingEdges(obj.cell);
            for (let i = 0; i < edges.length; i++) {
              for (let j = 0; j < self.selectedNode.newObj.branches.length; j++) {
                if (self.selectedNode.newObj.branches[j].id && edges[i].id) {
                  const edit = new mxCellAttributeChange(
                    edges[i], 'label', self.selectedNode.newObj.branches[i].label || self.selectedNode.obj.branches[i].label);
                  graph.getModel().execute(edit);
                  break;
                }
              }
            }
          }
        } finally {
          graph.getModel().endUpdate();
          if (flag) {
            self.updateJobs(graph, false);
          }
        }
      }
    }

    /**
     * Updates the properties panel
     */
    function selectionChanged() {
      if (self.selectedNode) {
        self.error = false;
        self.dataService.reloadWorkflowError.next({error: self.error});
        self.selectedNode.newObj = self.coreService.clone(self.selectedNode.obj);
        if (self.selectedNode && self.selectedNode.type === 'Job') {
          self.coreService.convertArrayToObject(self.selectedNode.newObj, 'defaultArguments', false);
        }
        if (self.selectedNode.type === 'If') {
          self.selectedNode.newObj.predicate = self.selectedNode.newObj.predicate.replace(/<[^>]+>/gm, '').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<')
            .replace(/&nbsp;/g, ' ').replace(/&#39;/g, '\'').replace('\n', '').replace('\r', '');
        }

        let isChange = true;
        if (_.isEqual(self.selectedNode.newObj, self.selectedNode.actualValue)) {
          isChange = false;
          if (self.selectedNode.type === 'Job') {
            let _job;
            for (let i = 0; i < self.jobs.length; i++) {
              if (self.selectedNode.job.jobName === self.jobs[i].name) {
                _job = self.jobs[i].value;
                break;
              }
            }
            if (_job) {
              let job = self.coreService.clone(self.selectedNode.job);
              delete job['jobName'];
              if (job.defaultArguments) {
                self.coreService.convertArrayToObject(job, 'defaultArguments', true);
              }
              if (job.executable && job.executable.arguments) {
                self.coreService.convertArrayToObject(job.executable, 'arguments', true);
              }
              if (job.executable && job.executable.jobArguments) {
                self.coreService.convertArrayToObject(job.executable, 'jobArguments', true);
              }
              if (job.executable && job.executable.env) {
                self.coreService.convertArrayToObject(job.executable, 'env', true);
              }
              if (job.returnCodeMeaning && !_.isEmpty(job.returnCodeMeaning)) {
                if (job.returnCodeMeaning.success && typeof job.returnCodeMeaning.success == 'string') {
                  job.returnCodeMeaning.success = job.returnCodeMeaning.success.split(',').map(Number);
                  delete job.returnCodeMeaning['failure'];
                } else if (job.returnCodeMeaning.failure && typeof job.returnCodeMeaning.failure == 'string') {
                  job.returnCodeMeaning.failure = job.returnCodeMeaning.failure.split(',').map(Number);
                  delete job.returnCodeMeaning['success'];
                }
                if (job.returnCodeMeaning.failure === '') {
                  delete job.returnCodeMeaning['failure'];
                }
                if (job.returnCodeMeaning.success === '' && !job.returnCodeMeaning.failure) {
                  job.returnCodeMeaning = {};
                }
              }
              if (!_job.defaultArguments || typeof _job.defaultArguments === 'string' || _job.defaultArguments.length === 0) {
                delete _job['defaultArguments'];
              }
              if (_job.executable && (!_job.executable.arguments || typeof _job.executable.arguments === 'string' || _job.executable.arguments.length === 0)) {
                delete _job.executable['arguments'];
              }
              if (_job.executable && (!_job.executable.jobArguments || typeof _job.executable.jobArguments === 'string' || _job.executable.jobArguments.length === 0)) {
                delete _job.executable['jobArguments'];
              }
              if (_job.executable && (!_job.executable.env || typeof _job.executable.env === 'string' || _job.executable.env.length === 0)) {
                delete _job.executable['env'];
              }
              if (!_.isEqual(_job, job)) {
                isChange = true;
              }
            } else {
              isChange = true;
            }
          }
        }
        if (isChange) {
          updateProperties(self.selectedNode);
        }
      }

      // Gets the selection cell
      const cell = graph.getSelectionCell();
      if (cell == null) {
        self.selectedNode = null;
      } else {
        if (cell.value.tagName === 'Try' || cell.value.tagName === 'Catch') {
          self.selectedNode = null;
          return;
        }

        let obj: any = {}, job: any;
        if (cell.value.tagName === 'Job') {
          obj.jobName = cell.getAttribute('jobName');
          obj.label = cell.getAttribute('label');
          obj.defaultArguments = cell.getAttribute('defaultArguments');
          if (!obj.defaultArguments || _.isEmpty(obj.defaultArguments) || typeof obj.defaultArguments !== 'string') {
            obj.defaultArguments = {};
          } else {
            obj.defaultArguments = JSON.parse(obj.defaultArguments);
          }
          job = {
            jobName: obj.jobName
          };
        } else if (cell.value.tagName === 'If') {
          obj.predicate = cell.getAttribute('predicate');
        } else if (cell.value.tagName === 'Retry') {
          obj.maxTries = cell.getAttribute('maxTries');
          obj.retryDelays = cell.getAttribute('retryDelays');
        } else if (cell.value.tagName === 'Lock') {
          obj.count = cell.getAttribute('count');
          if (obj.count) {
            obj.count = parseInt(obj.count, 10);
          }
          obj.lockId = cell.getAttribute('lockId');
          obj.countProperty = obj.count ? 'shared' : 'exclusive';
        } else if (cell.value.tagName === 'Finish' || cell.value.tagName === 'Fail') {
          let outcome = cell.getAttribute('outcome');
          if (!outcome) {
            outcome = cell.value.tagName === 'Fail' ? {'TYPE': 'Failed', result: {message: ''}} : {
              'TYPE': 'Succeeded',
              result: {message: ''}
            };
          } else {
            outcome = JSON.parse(outcome);
          }
          obj.outcome = outcome;
        } else if (cell.value.tagName === 'FileWatcher') {
          obj.directory = cell.getAttribute('directory');
          obj.regex = cell.getAttribute('regex');
        } else if (cell.value.tagName === 'Await') {
          obj.junctionPath = cell.getAttribute('junctionPath');
          let timeout = cell.getAttribute('timeout');
          if (timeout && timeout != 'null' && timeout != 'undefined') {
            obj.timeout1 = self.workflowService.convertDurationToString(timeout);
          }
          obj.joinVariables = cell.getAttribute('joinVariables');
          obj.joinVariables = obj.joinVariables == 'true';
          obj.predicate = cell.getAttribute('predicate');
          obj.match = cell.getAttribute('match');
        } else if (cell.value.tagName === 'Publish') {
          obj.junctionPath = cell.getAttribute('junctionPath');
        } else if (cell.value.tagName === 'Fork') {
          obj.joinVariables = cell.getAttribute('joinVariables');
          obj.joinVariables = obj.joinVariables == 'true';
          const edges = graph.getOutgoingEdges(cell);
          obj.branches = [];
          for (let i = 0; i < edges.length; i++) {
            if (edges[i].target.value.tagName !== 'Join') {
              obj.branches.push({id: edges[i].id, label: edges[i].getAttribute('label')});
            }
          }
        }

        self.selectedNode = {
          type: cell.value.tagName,
          obj: obj, cell: cell,
          job: job,
          actualValue: self.coreService.clone(obj)
        };
        if (cell.value.tagName === 'Lock') {
          self.getLimit();
        }
      }
    }

    /**
     * Funtion: Copy/paste the instruction to given target
     * @param target
     */
    function pasteInstruction(target) {
      let source = target.id;
      if (target.value.tagName === 'Connection') {
        if (checkClosingCell(target.source)) {
          source = target.source.value.getAttribute('targetId');
        } else {
          source = target.source.id;
        }
      }
      let copyObject: any, targetObject: any, targetIndex = 0, isCatch = false;

      function getObject(json) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (copyObject && targetObject) {
              break;
            }
            if (json.instructions[x].uuid == self.copyId) {
              copyObject = self.coreService.clone(json.instructions[x]);
              delete copyObject['uuid'];
            }
            if (json.instructions[x].id == source) {
              targetObject = json;
              targetIndex = x;
            }
            if (json.instructions[x].instructions) {
              getObject(json.instructions[x]);
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.id == source) {
                targetObject = json;
                targetIndex = x;
                isCatch = true;
              }
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                getObject(json.instructions[x].catch);
              }
            }
            if (json.instructions[x].then) {
              getObject(json.instructions[x].then);
            }
            if (json.instructions[x].else) {
              getObject(json.instructions[x].else);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                getObject(json.instructions[x].branches[i]);
              }
            }
          }
        }
      }

      function _dropOnObject() {
        const targetObj = targetObject.instructions[targetIndex];
        if (target.value.tagName === 'If') {
          if (!targetObj.then) {
            targetObj.then = {instructions: [copyObject]};
          } else if (!targetObj.else) {
            targetObj.else = {instructions: [copyObject]};
          }
        } else if (target.value.tagName === 'Fork') {
          let branchId;
          if (!targetObj.branches) {
            targetObj.branches = [];
          }
          branchId = 'branch' + (targetObj.branches.length + 1);
          targetObj.branches.push({id: branchId, instructions: [copyObject]});
        } else if (target.value.tagName === 'Retry') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(copyObject);
        } else if (target.value.tagName === 'Lock') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(copyObject);
        } else if (target.value.tagName === 'Try' && !isCatch) {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(copyObject);
        } else if (isCatch) {
          if (!targetObj.catch.instructions) {
            targetObj.catch.instructions = [];
          }
          targetObj.catch.instructions.push(copyObject);
        }

      }

      getObject(self.workflow.configuration);
      if (!targetObject) {
        targetIndex = -1;
        targetObject = self.workflow.configuration;
      }
      if (copyObject) {
        generateCopyObject(copyObject);
        if (target.value.tagName !== 'Connection' && copyObject) {
          _dropOnObject();
        } else {
          if (targetObject && targetObject.instructions && copyObject) {
            targetObject.instructions.splice(targetIndex + 1, 0, copyObject);
          }
        }
        self.updateXMLJSON(true);
      }
    }

    function checkCopyName(jobName): string {
      let str = jobName;
      let jobs = JSON.parse((JSON.stringify(self.jobs)));

      function recursivelyCheck(name) {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i].name == name) {
            let tName;
            if (name.match(/_copy_[0-9]+/)) {
              const arr = name.split('copy_');
              let num = arr[arr.length - 1];
              num = parseInt(num, 10) || 0;
              tName = name.substring(0, name.lastIndexOf('_copy')) + '_copy' + '_' + (num + 1);
            }
            str = tName;
            jobs.splice(i, 1);
            recursivelyCheck(tName);
            break;
          }
        }
      }

      recursivelyCheck(str);
      return str;
    }

    function getJob(name): string {
      let job: any = {};
      let newName, flag = true, tName;
      tName = name + '_copy_1';
      newName = checkCopyName(tName);
      for (let i = 0; i < self.jobs.length; i++) {
        if (newName === self.jobs[i].name) {
          flag = false;
          break;
        }
        if (name === self.jobs[i].name) {
          job = {name: newName, value: self.jobs[i].value};
        }
      }
      if (flag) {
        self.jobs.push(job);
      }
      return newName;
    }

    function generateCopyObject(copyObject) {
      function recursion(json) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            json.instructions[x].uuid = undefined;
            if (json.instructions[x].TYPE === 'Job') {
              json.instructions[x].jobName = getJob(json.instructions[x].jobName);
            }
            if (json.instructions[x].instructions) {
              recursion(json.instructions[x]);
            }

            if (json.instructions[x].catch) {
              json.instructions[x].uuid = undefined;
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                recursion(json.instructions[x].catch);
              }
            }
            if (json.instructions[x].then && json.instructions[x].then.instructions) {
              recursion(json.instructions[x].then);
            }
            if (json.instructions[x].else && json.instructions[x].else.instructions) {
              recursion(json.instructions[x].else);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  recursion(json.instructions[x].branches[i]);
                }
              }
            }
          }
        }
      }

      if (copyObject.TYPE === 'Job') {
        copyObject.jobName = getJob(copyObject.jobName);
      } else if (copyObject.TYPE === 'Fork') {
        if (copyObject.branches) {
          for (let i = 0; i < copyObject.branches.length; i++) {
            if (copyObject.branches[i].instructions) {
              recursion(copyObject.branches[i]);
            }
          }
        }
      } else if (copyObject.TYPE === 'If') {
        if (copyObject.then && copyObject.then.instructions) {
          recursion(copyObject.then);
        }
        if (copyObject.else && copyObject.else.instructions) {
          recursion(copyObject.else);
        }
      } else if (copyObject.TYPE === 'Retry') {
        recursion(copyObject.instructions);
      } else if (copyObject.TYPE === 'Lock') {
        recursion(copyObject.instructions);
      } else if (copyObject.TYPE === 'Try') {
        recursion(copyObject.instructions);
      }
    }

    function customizedChangeEvent() {
      let cell = graph.getSelectionCell();
      let cells = graph.getSelectionCells();
      if (cells.length > 0) {
        let lastCell = cells[cells.length - 1];
        const targetId = self.nodeMap.get(lastCell.id);
        if (targetId) {
          graph.addSelectionCell(graph.getModel().getCell(targetId));
        } else if (lastCell) {
          let flag = false;
          if (cells.length > 1) {
            const secondLastCell = cells[cells.length - 2];
            const lName = secondLastCell.value.tagName;
            if (self.workflowService.isInstructionCollapsible(lName) || lName === 'Catch') {
              flag = true;
            }
          }
          if (!flag && (checkClosingCell(lastCell))) {
            graph.removeSelectionCell(lastCell);
          }
        }
      }

      if (cell && (checkClosingCell(cell) ||
        cell.value.tagName === 'Connection' || cell.value.tagName === 'Process' || cell.value.tagName === 'Catch')) {
        graph.clearSelection();
        return;
      }
      if (cell && cells.length === 1) {
        setTimeout(() => {
          if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
            const targetId = self.nodeMap.get(cell.id);
            if (targetId) {
              graph.addSelectionCell(graph.getModel().getCell(targetId));
            }

          }
        }, 0);
      }

      if (cells.length < 2) {
        selectionChanged();
      } else if (cells.length === 2) {
        if ((cells[0].value.tagName === 'Fork' && cells[1].value.tagName === 'Join') ||
          (cells[0].value.tagName === 'If' && cells[1].value.tagName === 'EndIf') ||
          (cells[0].value.tagName === 'Retry' && cells[1].value.tagName === 'EndRetry') ||
          (cells[0].value.tagName === 'Lock' && cells[1].value.tagName === 'EndLock') ||
          (cells[0].value.tagName === 'Try' && cells[1].value.tagName === 'EndTry')) {
          selectionChanged();
        }

      }
    }


    /**
     * Function: Check and create clicked instructions
     * @param title
     * @param targetCell
     */

    function createClickInstruction(title, targetCell) {
      if (title.match('paste')) {
        if (self.copyId) {
          pasteInstruction(targetCell);
        } else if (self.cutCell) {
          const tagName = targetCell.value.tagName;
          if (tagName === 'Connection' || self.workflowService.isInstructionCollapsible(tagName) || tagName === 'Catch') {
            if (tagName === 'Connection') {
              let sourceId = targetCell.source.id;
              let targetId = targetCell.target.id;
              if (checkClosingCell(targetCell.source)) {
                sourceId = targetCell.source.value.getAttribute('targetId');
              } else if (targetCell.source.value.tagName === 'Process' && targetCell.source.getAttribute('title') === 'start') {
                sourceId = 'start';
              }
              if (checkClosingCell(targetCell.target)) {
                targetId = targetCell.target.value.getAttribute('targetId');
              } else if (targetCell.target.value.tagName === 'Process' && targetCell.target.getAttribute('title') === 'start') {
                targetId = 'start';
              }
              self.droppedCell = {
                target: {source: sourceId, target: targetId},
                cell: self.cutCell,
                type: targetCell.value.getAttribute('type')
              };
            } else {
              self.droppedCell = {target: targetCell.id, cell: self.cutCell};
            }
          }
        }
        if (self.droppedCell) {
          rearrangeCell(self.droppedCell);
          self.droppedCell = null;
        }
        return;
      }

      if (!targetCell) {
        result = '';
        return;
      }

      self.skipXMLToJSONConversion = false;
      const flag = result === 'valid' || result === 'select';
      if (flag) {
        let defaultParent = targetCell;
        if (targetCell.value.tagName === 'Process' || targetCell.value.tagName === 'Connection' || targetCell.value.tagName === 'Catch') {
          defaultParent = targetCell.getParent();
        }
        let clickedCell: any, _node: any, v1, v2, label = '';
        if (title.match('job')) {
          _node = doc.createElement('Job');
          _node.setAttribute('jobName', 'job');
          _node.setAttribute('label', '');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 180, 40, 'job');
        } else if (title.match('finish')) {
          _node = doc.createElement('Finish');
          _node.setAttribute('label', 'finish');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.finish);
        } else if (title.match('fail')) {
          _node = doc.createElement('Fail');
          _node.setAttribute('label', 'fail');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.fail);
        } else if (title.match('fork')) {
          _node = doc.createElement('Fork');
          _node.setAttribute('label', 'fork');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.fork);
        } else if (title.match('if')) {
          _node = doc.createElement('If');
          _node.setAttribute('label', 'if');
          _node.setAttribute('predicate', '$returnCode > 0');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'if');
        } else if (title.match('retry')) {
          _node = doc.createElement('Retry');
          _node.setAttribute('label', 'retry');
          _node.setAttribute('maxTries', '10');
          _node.setAttribute('retryDelays', '0');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'retry');
        } else if (title.match('lock')) {
          _node = doc.createElement('Lock');
          _node.setAttribute('label', 'lock');
          _node.setAttribute('lockId', '');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.lock);
        } else if (title.match('try')) {
          _node = doc.createElement('Try');
          _node.setAttribute('label', 'try');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'try');
        } else if (title.match('await')) {
          _node = doc.createElement('Await');
          _node.setAttribute('label', 'await');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.await);
        } else if (title.match('publish')) {
          _node = doc.createElement('Publish');
          _node.setAttribute('label', 'publish');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.publish);
        } else if (title.match('fileWatcher')) {
          _node = doc.createElement('FileWatcher');
          _node.setAttribute('label', 'fileWatcher');
          _node.setAttribute('directory', '');
          _node.setAttribute('regex', '.*');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 110, 40, 'fileWatcher');
        }
        if (targetCell.value.tagName !== 'Connection') {
          if (result === 'select') {
            if (selectedCellsObj) {
              targetCell = null;
            }
            moveSelectedCellToDroppedCell(targetCell, clickedCell, selectedCellsObj);
            selectedCellsObj = null;
          } else {
            addInstructionToCell(clickedCell, targetCell);
          }
          targetCell = null;
          dropTarget = null;
          graph.clearSelection();
          setTimeout(() => {
            if (v1) {
              graph.setSelectionCells([clickedCell, v1]);
            } else {
              graph.setSelectionCells([clickedCell]);
            }
            customizedChangeEvent();
          }, 0);
        } else {
          graph.clearSelection();
          if (targetCell.source) {
            if (targetCell.source.getParent().id !== '1') {
              const _type = targetCell.getAttribute('type') || targetCell.getAttribute('label');
              if (!(_type === 'retry' || _type === 'lock' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                targetCell.setParent(targetCell.source.getParent());
              }
            }
          }
          label = targetCell.getAttribute('type') || targetCell.getAttribute('label') || '';
          if (self.workflowService.isInstructionCollapsible(clickedCell.value.tagName)) {
            const parent = targetCell.getParent() || graph.getDefaultParent();
            if (clickedCell.value.tagName === 'Fork') {
              v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, self.workflowService.merge);
            } else if (clickedCell.value.tagName === 'If') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
            } else if (clickedCell.value.tagName === 'Retry') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
            } else if (clickedCell.value.tagName === 'Lock') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', null), 0, 0, 68, 68, self.workflowService.closeLock);
            } else {
              v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
              v2 = graph.insertVertex(clickedCell, null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
              graph.insertEdge(parent, null, getConnectionNode('try'), clickedCell, v2);
              graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(label), targetCell.source, clickedCell);
            if (clickedCell.value.tagName !== 'Try') {
              graph.insertEdge(parent, null, getConnectionNode(''), clickedCell, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(''), v1, targetCell.target);
            for (let x = 0; x < targetCell.source.edges.length; x++) {
              if (targetCell.source.edges[x].id === targetCell.id) {
                const _sourCellName = targetCell.source.value.tagName;
                const _tarCellName = targetCell.target.value.tagName;
                if ((targetCell.target && ((_sourCellName === 'Job' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'Publish' || _sourCellName === 'Await') &&
                  (_tarCellName === 'Job' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'Publish' || _tarCellName === 'Await')))) {
                  graph.getModel().remove(targetCell.source.edges[x]);
                } else {
                  targetCell.source.removeEdge(targetCell.source.edges[x], true);
                }
                break;
              }
            }

            setTimeout(() => {
              graph.getModel().beginUpdate();
              try {
                if (clickedCell.id && v1.id) {
                  self.nodeMap.set(clickedCell.id, v1.id);
                }
                const targetId = new mxCellAttributeChange(
                  v1, 'targetId',
                  clickedCell.id);
                graph.getModel().execute(targetId);
                if (v2) {
                  const targetId2 = new mxCellAttributeChange(
                    v2, 'targetId', clickedCell.id);
                  graph.getModel().execute(targetId2);
                }
              } finally {
                graph.getModel().endUpdate();
              }
              checkConnectionLabel(clickedCell, targetCell, false);
            }, 0);
          } else {
            graph.insertEdge(defaultParent, null, getConnectionNode(label), targetCell.source, clickedCell);
            let e1 = graph.insertEdge(defaultParent, null, getConnectionNode(label), clickedCell, targetCell.target);
            for (let i = 0; i < targetCell.source.edges.length; i++) {
              if (targetCell.id === targetCell.source.edges[i].id) {
                targetCell.source.removeEdge(targetCell.source.edges[i], true);
                break;
              }
            }
            setTimeout(() => {
              checkConnectionLabel(clickedCell, e1, true);
            }, 0);
          }
          if (v1) {
            graph.setSelectionCells([clickedCell, v1]);
          } else {
            graph.setSelectionCells([clickedCell]);
          }
          customizedChangeEvent();
        }
        WorkflowService.executeLayout(graph);
      }
      result = '';
    }

    /**
     * Function: To validate instruction is valid for drop or not
     * @param targetCell
     * @param title
     */
    function checkValidTarget(targetCell, title): string {
      const tagName = targetCell.value.tagName;
      if (tagName === 'Process') {
        if (targetCell.getAttribute('title') === 'start' || targetCell.getAttribute('title') === 'end') {
          return 'return';
        }
      } else if (tagName === 'Connector' || title === 'Connect') {
        return 'return';
      }
      let flg = false;
      if (title) {
        title = title.toLowerCase();
        if (title.match('fork') || title.match('retry') || title.match('lock') || title.match('try') || title.match('if')) {
          const selectedCell = graph.getSelectionCell();
          if (selectedCell) {
            const cells = graph.getSelectionCells();
            if (cells.length > 1) {
              selectedCellsObj = isCellSelectedValid(cells);
              if (selectedCellsObj.invalid) {
                return 'inValid';
              }
            }
            if (selectedCell.id === targetCell.id || (selectedCellsObj && selectedCellsObj.ids && selectedCellsObj.ids.length > 0 && selectedCellsObj.ids.indexOf(targetCell.id) > -1)) {
              flg = true;
            }
          }
        }
      }
      if (!flg) {
        if (tagName !== 'Connection') {
          if (tagName === 'Job' || tagName === 'Finish' || tagName === 'Fail' || tagName === 'Await' || tagName === 'Publish') {
            for (let i = 0; i < targetCell.edges.length; i++) {
              if (targetCell.edges[i].target.id !== targetCell.id) {
                return 'inValid';
              }
            }
          } else if (tagName === 'If') {
            if (targetCell.edges.length > 2) {
              return 'inValid';
            }
          } else if (checkClosingCell(targetCell)) {
            if (targetCell.edges.length > 1) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].target.id !== targetCell.id) {
                  return 'inValid';
                }
              }
            }
          } else if (tagName === 'Retry') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Retry' && targetCell.edges[i].target.value.tagName === 'EndRetry') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Lock') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Lock' && targetCell.edges[i].target.value.tagName === 'EndLock') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Try') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source && targetCell.edges[i].target && targetCell.edges[i].source.value.tagName === 'Try' && (
                  targetCell.edges[i].target.value.tagName === 'Catch' || targetCell.edges[i].target.value.tagName === 'EndTry')) {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {

              return 'inValid';
            }
          } else if (tagName === 'Catch') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Catch' && targetCell.edges[i].target.value.tagName === 'EndTry') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Process') {
            if (targetCell.edges && targetCell.edges.length === 1) {
              if (targetCell.edges[0].value.tagName === 'Connector') {
                return 'inValid';
              }
            }
          }
        } else {
          if (tagName === 'Connection') {
            if ((targetCell.source.value.tagName === 'Fork' && targetCell.target.value.tagName === 'Join') ||
              (targetCell.source.value.tagName === 'If' && targetCell.target.value.tagName === 'EndIf') ||
              (targetCell.source.value.tagName === 'Retry' && targetCell.target.value.tagName === 'EndRetry') ||
              (targetCell.source.value.tagName === 'Lock' && targetCell.target.value.tagName === 'EndLock') ||
              (targetCell.source.value.tagName === 'Try' && targetCell.target.value.tagName === 'Catch') ||
              (targetCell.source.value.tagName === 'Catch' && targetCell.target.value.tagName === 'EndTry') ||
              (targetCell.source.value.tagName === 'Try' && targetCell.target.value.tagName === 'EndTry')) {
              return 'return';
            }
          }
        }
      } else {
        return 'select';
      }
      return 'valid';
    }

    function getBranchLabel(cell): number {
      const branchs = graph.getOutgoingEdges(cell);
      let num = branchs.length;
      if (num === 1 && branchs[0].target.value.tagName === 'Join') {
        num = 0;
      } else {
        for (let i = 0; i < branchs.length; i++) {
          let _label = branchs[i].getAttribute('label');
          if (_label) {
            let count = _label.match(/\d+/)[0];
            if (num < count) {
              num = count;
            }
          }
        }
      }

      return parseInt(num, 10);
    }

    function addInstructionToCell(cell, _dropTarget) {
      let label = '';
      const dropTargetName = _dropTarget.value.tagName;
      for (let i = 0; i < _dropTarget.edges.length; i++) {
        if (_dropTarget.edges[i].source.id === _dropTarget.id) {
          if (checkClosedCellWithSourceCell(_dropTarget, _dropTarget.edges[i].target)) {
            graph.foldCells(false, false, [_dropTarget], null, null);
          }
          break;
        }
      }
      if (dropTargetName === 'If') {
        let flag = false;
        label = 'then';
        for (let i = 0; i < _dropTarget.edges.length; i++) {
          if (_dropTarget.edges[i].target.id !== _dropTarget.id && _dropTarget.edges[i].target.value.tagName !== 'EndIf') {
            label = 'else';
          } else {
            if (_dropTarget.edges[i].target && _dropTarget.edges[i].target.edges) {
              for (let j = 0; j < _dropTarget.edges[i].target.edges.length; j++) {
                if (_dropTarget.edges[i].target.edges[j].edge && _dropTarget.edges[i].target.edges[j].value.attributes
                  && _dropTarget.edges[i].target.edges[j].value.attributes.length > 0 && (_dropTarget.edges[i].target.edges[j].value.attributes[0]
                    && _dropTarget.edges[i].target.edges[j].value.attributes[0].value === 'else')) {
                  flag = true;
                }
              }
            }
          }
        }
        if (flag) {
          label = 'then';
        }
      } else if (dropTargetName === 'Retry') {
        label = 'retry';
      } else if (dropTargetName === 'Lock') {
        label = 'lock';
      } else if (dropTargetName === 'Try') {
        label = 'try';
      } else if (dropTargetName === 'Catch') {
        label = 'catch';
        // cell.setParent(_dropTarget);
      } else if (dropTargetName === 'Fork') {
        label = '$TYPE$' + 'branch' + (getBranchLabel(_dropTarget) + 1);
      }

      let parent = cell.getParent() || graph.getDefaultParent();
      if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
        let v1, v2, _label;
        if (cell.value.tagName === 'Fork') {
          v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', cell.id), 0, 0, 68, 68, self.workflowService.merge);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'If') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', cell.id), 0, 0, 75, 75, 'if');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Retry') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', cell.id), 0, 0, 75, 75, 'retry');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Lock') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', cell.id), 0, 0, 68, 68, self.workflowService.closeLock);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Try') {
          v2 = graph.insertVertex(cell, null, getCellNode('Catch', 'catch', cell.id), 0, 0, 100, 40, 'dashRectangle');
          v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', cell.id), 0, 0, 75, 75, 'try');
          graph.insertEdge(parent, null, getConnectionNode('try'), cell, v2);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
          graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
        }
        if (self.workflowService.isInstructionCollapsible(dropTargetName) || dropTargetName === 'Catch') {
          _label = dropTargetName === 'Fork' ? 'join' : dropTargetName === 'Retry' ? 'endRetry' : dropTargetName === 'Lock' ? 'endLock' : dropTargetName === 'Catch' ? 'catch' : dropTargetName === 'If' ? 'endIf' : 'try';
          if (dropTargetName === 'Try') {
            for (let i = 0; i < _dropTarget.edges.length; i++) {
              if (_dropTarget.edges[i].source.id === _dropTarget.id) {
                if (_dropTarget.edges[i].target.value.tagName === 'EndTry') {
                  _label = 'endTry';
                }
                break;
              }
            }
          }
        }

        if (v1) {
          if (cell.id && v1.id) {
            self.nodeMap.set(cell.id, v1.id);
          }
          if (_label) {
            setTimeout(() => {
              for (let i = 0; i < v1.edges.length; i++) {
                if (v1.edges[i].target.id !== v1.id) {
                  changeLabelOfConnection(v1.edges[i], _label);
                  break;
                }
              }
            }, 0);
          }
        }
      }
      if (dropTargetName === 'Process') {
        parent = graph.getDefaultParent();
        let flag = false;
        for (let i = 0; i < _dropTarget.edges.length; i++) {
          if (_dropTarget.edges[i].source.id !== _dropTarget.id) {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              for (let j = 0; j < cell.edges.length; j++) {
                if (cell.edges[j].target.id !== cell.id) {
                  if (checkClosingCell(cell.edges[j].target)) {
                    if (flag) {
                      graph.insertEdge(parent, null, getConnectionNode(label), cell.edges[j].target, _dropTarget.edges[i].target);
                    } else {
                      graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget.edges[i].source, cell.edges[j].source);
                    }
                    flag = true;
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget.edges[i].source, cell);
            }
          } else {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              for (let j = 0; j < cell.edges.length; j++) {
                if (cell.edges[j].target.id !== cell.id) {
                  if (checkClosingCell(cell.edges[j].target)) {
                    graph.insertEdge(parent, null, getConnectionNode(label), cell.edges[j].target, _dropTarget.edges[i].target);
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(label), cell, _dropTarget.edges[i].target);
            }
          }
        }
        graph.getModel().remove(_dropTarget);
      } else {
        let checkLabel = '';
        if (dropTargetName === 'Fork') {
          label = '$TYPE$' + 'branch' + (getBranchLabel(_dropTarget) + 1);
          checkLabel = 'Join';
        } else if (dropTargetName === 'If') {
          checkLabel = 'EndIf';
        } else if (dropTargetName === 'Retry') {
          checkLabel = 'EndRetry';
        } else if (dropTargetName === 'Lock') {
          checkLabel = 'EndLock';
        } else if (dropTargetName === 'Try') {
          label = 'try';
          checkLabel = 'EndTry';
        } else if (dropTargetName === 'Catch') {
          label = 'catch';
          checkLabel = 'EndTry';
          graph.getModel().setStyle(_dropTarget, 'catch');
        }

        if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
          let target1, target2;
          for (let i = 0; i < _dropTarget.edges.length; i++) {
            if (_dropTarget.edges[i].target.id !== _dropTarget.id) {
              if (_dropTarget.edges[i].target.value.tagName === checkLabel || _dropTarget.edges[i].target.value.tagName === 'Catch') {
                if (_dropTarget.edges[i].target.value.tagName !== 'Catch') {
                  self.nodeMap.set(_dropTarget.id, _dropTarget.edges[i].target.id);
                }
                target1 = _dropTarget.edges[i];
              }
              break;
            }
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id !== cell.id) {
              if (checkClosingCell(cell.edges[i].target)) {
                self.nodeMap.set(cell.id, cell.edges[i].target.id);
                target2 = cell.edges[i].target;
                break;
              }
            }
          }
          if (target1 && target2) {
            graph.insertEdge(parent, null, getConnectionNode(label), target2, target1.target);
            graph.getModel().remove(target1);
          } else if (self.nodeMap.has(_dropTarget.id)) {
            const target = graph.getModel().getCell(self.nodeMap.get(_dropTarget.id));
            graph.insertEdge(parent, null, getConnectionNode(label), target2, target);
          }
        } else {
          if (dropTargetName === 'Try' && cell.value.tagName === 'Catch') {
            label = 'endTry';
            graph.getModel().setStyle(cell, 'dashRectangle');
          }
          let flag = false;
          if (_dropTarget.edges && _dropTarget.edges.length) {
            for (let i = 0; i < _dropTarget.edges.length; i++) {
              if (_dropTarget.edges[i].target.id !== _dropTarget.id) {
                if (_dropTarget.edges[i].target.value.tagName === checkLabel || _dropTarget.edges[i].target.value.tagName === 'Catch') {
                  flag = true;
                  if (!self.nodeMap.has(_dropTarget.id) && _dropTarget.value.tagName !== 'Catch') {
                    self.nodeMap.set(_dropTarget.id, _dropTarget.edges[i].target.id);
                  }

                  const attr = _dropTarget.edges[i].value.attributes;
                  if (attr && label !== 'catch' && !checkClosedCellWithSourceCell(_dropTarget, _dropTarget.edges[i].target)) {
                    for (let x = 0; x < attr.length; x++) {
                      if (attr[x].value && attr[x].name) {
                        label = attr[x].value;
                        break;
                      }
                    }
                  }

                  if (cell && _dropTarget.edges[i].target) {
                    graph.insertEdge(parent, null, getConnectionNode(label), cell, _dropTarget.edges[i].target);
                  }
                  graph.getModel().remove(_dropTarget.edges[i]);
                }
                break;
              }
            }
          }
          if (!flag && self.nodeMap.has(_dropTarget.id)) {
            const target = graph.getModel().getCell(self.nodeMap.get(_dropTarget.id));
            if (cell && target) {
              graph.insertEdge(parent, null, getConnectionNode(label), cell, target);
            }
          }
        }

        if (cell.edges) {
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.value.tagName === checkLabel) {
              const _label = checkLabel === 'Join' ? 'join' : checkLabel === 'EndIf' ? 'endIf' : checkLabel === 'EndRetry'
                ? 'endRetry' : checkLabel === 'EndLock' ? 'endLock' : 'endTry';
              if (cell.value.tagName !== 'Fork' && cell.value.tagName !== 'If' && cell.value.tagName !== 'Try' && cell.value.tagName !== 'Retry' && cell.value.tagName !== 'Lock' && cell.value.tagName !== 'Catch') {
                cell.edges[i].value.attributes[0].nodeValue = _label;
                cell.edges[i].value.attributes[1].nodeValue = _label;
              }
            }
          }
        }
        if (cell && _dropTarget) {
          if (dropTargetName === 'Try' && cell.value.tagName === 'Catch') {
            const childVertices = graph.getChildVertices(_dropTarget);
            if (childVertices.length > 0) {
              const lastChildVertex = childVertices.length === 1 ? _dropTarget : childVertices[childVertices.length - 2];
              for (let j = 0; j < lastChildVertex.edges.length; j++) {
                if (lastChildVertex.edges[j].source.id === lastChildVertex.id) {
                  graph.getModel().remove(lastChildVertex.edges[j]);
                  break;
                }
              }
              graph.insertEdge(parent, null, getConnectionNode('try'), lastChildVertex, cell);

            } else {
              graph.insertEdge(parent, null, getConnectionNode('try'), _dropTarget, cell);
            }

            const targetId = _dropTarget.id;
            setTimeout(() => {
              graph.getModel().beginUpdate();
              try {
                const targetId2 = new mxCellAttributeChange(
                  cell, 'targetId', targetId);
                graph.getModel().execute(targetId2);
              } finally {
                graph.getModel().endUpdate();
              }
            }, 0);
          } else {
            graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget, cell);
          }
        }
      }
      if (cell.value.tagName === 'Try') {
        for (let j = 0; j < cell.edges.length; j++) {
          if (cell.edges[j].target.id !== cell.id) {
            if (cell.edges[j].source.value.tagName === 'Try' && cell.edges[j].target.value.tagName === 'EndTry') {
              graph.getModel().remove(cell.edges[j]);
              break;
            }
          }
        }
      }
    }

    function dropOnObject(source, target, sourceIndex, targetIndex, isCatch, tempJson) {
      if (source && source.instructions.length > 0) {
        let sourceObj = source.instructions[sourceIndex];
        let targetObj = target.instructions[targetIndex];
        let isDone = false;
        if (targetObj.TYPE === 'If') {
          if (!targetObj.then) {
            targetObj.then = {instructions: [sourceObj]};
            isDone = true;
          } else if (!targetObj.else) {
            targetObj.else = {instructions: [sourceObj]};
            isDone = true;
          }
          if (!isDone) {
            let title = '', msg = '';
            self.translate.get('workflow.message.invalidTarget').subscribe(translatedValue => {
              title = translatedValue;
            });

            self.translate.get('workflow.message.ifInstructionValidationError').subscribe(translatedValue => {
              msg = translatedValue;
            });
            self.toasterService.pop('error', title + '!!', msg);
          }
        } else if (targetObj.TYPE === 'Fork') {
          let branchId;
          if (!targetObj.branches) {
            targetObj.branches = [];
          }
          branchId = 'branch' + (targetObj.branches.length + 1);
          targetObj.branches.push({id: branchId, instructions: [sourceObj]});
          isDone = true;
        } else if (targetObj.TYPE === 'Retry') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (targetObj.TYPE === 'Lock') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (targetObj.TYPE === 'Try' && !isCatch) {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (isCatch) {
          if (!targetObj.catch.instructions) {
            targetObj.catch.instructions = [];
          }
          targetObj.catch.instructions.push(sourceObj);
          isDone = true;
        }
        if (isDone) {
          source.instructions.splice(sourceIndex, 1);
          if (!_.isEqual(tempJson, JSON.stringify(self.workflow.configuration))) {
            self.updateXMLJSON(true);
          }
        }
      }
    }

    function dropAndAdd(instructions, dropId, targetId, object, obj) {
      for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].id == dropId) {
          instructions.splice(i, 1);
          break;
        }
      }
      for (let k = 0; k < instructions.length; k++) {
        if (instructions[k].id == targetId) {
          instructions.splice(k, 0, object);
          obj.isMatch = true;
          break;
        }
      }
    }

    function checkParent(object1, object2): boolean {
      let flag = true;

      function recurviseCheck(json) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (json.instructions[x].id == object2.id) {
              flag = false;
              break;
            }
            if (json.instructions[x].instructions) {
              recurviseCheck(json.instructions[x]);
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                recurviseCheck(json.instructions[x].catch);
              }
            }
            if (json.instructions[x].then) {
              recurviseCheck(json.instructions[x].then);
            }
            if (json.instructions[x].else) {
              recurviseCheck(json.instructions[x].else);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                recurviseCheck(json.instructions[x].branches[i]);
              }
            }
          }
        }
      }

      recurviseCheck(object1);
      return flag;
    }

    /**
     * Function: Rearrange a cell to a different position in the workflow
     * @param obj
     */
    function rearrangeCell(obj) {
      let connection = obj.target;
      let droppedCell = obj.cell;
      if (connection.source === droppedCell.id || connection.target === droppedCell.id ||
        connection === droppedCell.id) {
        self.updateXMLJSON(true);
        return;
      } else {
        let dropObject: any, targetObject: any, index = 0, targetIndex = 0, isCatch = false;
        let source = connection.source || connection;
        let tempJson = JSON.stringify(self.workflow.configuration);

        function getObject(json, cell) {
          if (json.instructions) {
            for (let x = 0; x < json.instructions.length; x++) {
              if (dropObject && targetObject) {
                break;
              }
              if (json.instructions[x].id == cell.id) {
                dropObject = json;
                index = x;
              }
              if (json.instructions[x].id == source) {
                targetObject = json;
                targetIndex = x;
              }
              if (json.instructions[x].instructions) {
                getObject(json.instructions[x], cell);
              }
              if (json.instructions[x].catch) {
                if (json.instructions[x].catch.id == source) {
                  targetObject = json;
                  targetIndex = x;
                  isCatch = true;
                }
                if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                  getObject(json.instructions[x].catch, cell);
                }
              }
              if (json.instructions[x].then) {
                getObject(json.instructions[x].then, cell);
              }
              if (json.instructions[x].else) {
                getObject(json.instructions[x].else, cell);
              }
              if (json.instructions[x].branches) {
                for (let i = 0; i < json.instructions[x].branches.length; i++) {
                  getObject(json.instructions[x].branches[i], cell);
                }
              }
            }
          }
        }

        getObject(self.workflow.configuration, droppedCell);
        if (!targetObject && connection.source === 'start') {
          targetObject = self.workflow.configuration;
        }
        let booleanObj = {
          isMatch: false
        };

        if (targetObject && dropObject) {
          if (targetObject.instructions) {
            let sourceObj = dropObject.instructions[index];
            let targetObj = targetObject.instructions[targetIndex];
            if (!checkParent(sourceObj, targetObj)) {
              return;
            }

            if (!connection.source && !connection.target) {
              dropOnObject(dropObject, targetObject, index, targetIndex, isCatch, tempJson);
              return;
            }

            if (dropObject && dropObject.instructions) {
              dropObject.instructions.splice(index, 1);
            }

            if ((connection.source === 'start')) {
              targetObject.instructions.splice(0, 0, sourceObj);
            } else {
              if (targetObject.instructions) {
                for (let x = 0; x < targetObject.instructions.length; x++) {
                  if (targetObject.instructions[x].uuid == targetObj.uuid) {
                    targetIndex = x;
                    break;
                  }
                }
              }
              const isSameObj = connection.source === connection.target;
              if (targetObj.TYPE === 'If') {
                if (obj.type || isSameObj) {
                  if (!obj.type.match('else')) {
                    if (!targetObj.then || targetObj.then.instructions.length === 0) {
                      targetObj.then = {instructions: [sourceObj]};
                      booleanObj.isMatch = true;
                    } else {
                      dropAndAdd(targetObj.then.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  } else {
                    if (!targetObj.else || targetObj.else.instructions.length === 0) {
                      targetObj.else = {instructions: [sourceObj]};
                      booleanObj.isMatch = true;
                    } else {
                      dropAndAdd(targetObj.else.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  }
                }
              } else if (targetObj.TYPE === 'Fork') {
                if (obj.type || isSameObj) {
                  if (!targetObj.branches || targetObj.branches.length === 0) {
                    targetObj.branches = [{id: 'branch1', instructions: [sourceObj]}];
                    booleanObj.isMatch = true;
                  } else if (targetObj.branches && targetObj.branches.length > 0) {
                    for (let j = 0; j < targetObj.branches.length; j++) {
                      dropAndAdd(targetObj.branches[j].instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                      if (booleanObj.isMatch) {
                        break;
                      }
                    }
                    for (let j = 0; j < targetObj.branches.length; j++) {
                      if (targetObj.branches[j].instructions.length === 0) {
                        targetObj.branches.splice(j, 1);
                        break;
                      }
                    }
                  }
                }
              } else if (targetObj.TYPE === 'Retry') {
                if (obj.type || isSameObj) {
                  if (!targetObj.instructions || targetObj.instructions.length === 0) {
                    targetObj.instructions = [sourceObj];
                    booleanObj.isMatch = true;
                  } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                    dropAndAdd(targetObj.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                  }
                }
              } else if (targetObj.TYPE === 'Lock') {
                if (obj.type || isSameObj) {
                  if (!targetObj.instructions || targetObj.instructions.length === 0) {
                    targetObj.instructions = [sourceObj];
                    booleanObj.isMatch = true;
                  } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                    dropAndAdd(targetObj.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                  }
                }
              } else if (targetObj.TYPE === 'Try') {
                if (obj.type || isSameObj) {
                  if (isCatch) {
                    if (!targetObj.catch.instructions || targetObj.catch.instructions.length === 0) {
                      targetObj.catch.instructions = [sourceObj];
                      booleanObj.isMatch = true;
                    } else if (targetObj.catch.instructions && targetObj.catch.instructions.length > 0) {
                      dropAndAdd(targetObj.catch.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  } else {
                    if (!targetObj.instructions || targetObj.instructions.length === 0) {
                      targetObj.instructions = [sourceObj];
                      booleanObj.isMatch = true;
                    } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                      dropAndAdd(targetObj.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  }
                }
              }
              if (!booleanObj.isMatch) {
                targetObject.instructions.splice(targetIndex + 1, 0, sourceObj);
              }
            }
          }

          if (dropObject && dropObject.instructions && dropObject.instructions.length === 0) {
            delete dropObject['instructions'];
          }

          self.updateXMLJSON(true);
        }
      }
    }

    if (callFun) {
      selectionChanged();
    }
  }

  private updateJobProperties(data): boolean {
    let job = this.coreService.clone(data.job);
    if (!job.executable) {
      return;
    }
    if (job.returnCodeMeaning) {
      if (job.returnCodeMeaning && job.returnCodeMeaning.success == '0') {
        delete job['returnCodeMeaning'];
      } else {
        if (typeof job.returnCodeMeaning.success == 'string') {
          job.returnCodeMeaning.success = job.returnCodeMeaning.success.split(',').map(Number);
        } else if (typeof job.returnCodeMeaning.failure == 'string') {
          job.returnCodeMeaning.failure = job.returnCodeMeaning.failure.split(',').map(Number);
        }
      }
    }

    if (job.defaultArguments) {
      if (job.executable.v1Compatible && job.executable.TYPE === 'ScriptExecutable') {
        this.coreService.convertArrayToObject(job, 'defaultArguments', true);
      } else {
        delete job['defaultArguments'];
      }
    }
    if (job.executable.arguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        if (job.executable.arguments && _.isArray(job.executable.arguments)) {
          this.coreService.convertArrayToObject(job.executable, 'arguments', true);
        }
      } else {
        delete job.executable['arguments'];
      }
    }
    if (job.executable.jobArguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        this.coreService.convertArrayToObject(job.executable, 'jobArguments', true);
      } else {
        delete job.executable['jobArguments'];
      }
    }
    if (job.executable.TYPE === 'InternalExecutable') {
      delete job.executable.script;
    } else if (job.executable.TYPE === 'ScriptExecutable') {
      delete job.executable.className;
    }

    if (job.executable.env) {
      if (job.executable.TYPE === 'ScriptExecutable') {
        if (job.executable.env && _.isArray(job.executable.env)) {
          job.executable.env.filter((env) => {
            if (env.value) {
              if (!(/[$_+]/.test(env.value))) {
                let startChar = env.value.substring(0, 1),
                  endChar = env.value.substring(env.value.length - 1);
                if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {

                } else {
                  env.value = JSON.stringify(env.value);
                  env.value = '\'' + env.value.substring(1, env.value.length - 1) + '\'';
                }
              }
            }
          });
          this.coreService.convertArrayToObject(job.executable, 'env', true);
        }
      } else {
        delete job.executable['env'];
      }
    }

    if (!job.taskLimit) {
      job.taskLimit = 0;
    }
    if (job.timeout1) {
      job.timeout = this.workflowService.convertStringToDuration(job.timeout1);
    }
    if (job.graceTimeout1) {
      job.graceTimeout = this.workflowService.convertStringToDuration(job.graceTimeout1);
    }
    let flag = true, isChange = true;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === job.jobName) {
        flag = false;
        delete job['jobName'];
        if (this.jobs[i].value.returnCodeMeaning) {
          if (typeof this.jobs[i].value.returnCodeMeaning.success == 'string') {
            this.jobs[i].value.returnCodeMeaning.success = this.jobs[i].value.returnCodeMeaning.success.split(',').map(Number);
          }
        }
        if (!_.isEqual(JSON.stringify(job), JSON.stringify(this.jobs[i].value))) {
          this.jobs[i].value = job;
        } else {
          if (_.isEqual(JSON.stringify(data.newObj), JSON.stringify(data.actualValue))) {
            isChange = false;
          }
        }
      }
    }
    if (flag) {
      delete job['jobName'];
      this.jobs.push({name: data.job.jobName, value: job});
    }
    return isChange;
  }

  private updateJobs(_graph, isFirst) {
    if (!_graph) {
      return;
    }
    const enc = new mxCodec();
    const node = enc.encode(_graph.getModel());
    const xml = mxUtils.getXml(node);
    let _json: any;
    try {
      _json = x2js.xml_str2json(xml);
    } catch (e) {
      console.error(e);
    }
    const objects = _json.mxGraphModel.root;
    const vertices = objects.Job;
    if (vertices) {
      let tempJobs = [];
      if (_.isArray(vertices)) {
        for (let i = 0; i < vertices.length; i++) {
          for (let j = 0; j < this.jobs.length; j++) {
            if (vertices[i]._jobName === this.jobs[j].name) {
              tempJobs.push(this.jobs[j]);
              this.jobs.splice(j, 1);
              break;
            }
          }
        }
      } else {
        for (let j = 0; j < this.jobs.length; j++) {
          if (vertices._jobName === this.jobs[j].name) {
            tempJobs.push(this.jobs[j]);
            break;
          }
        }
      }
      this.jobs = tempJobs;
    }
    if (isFirst) {
      const _temp = JSON.parse(this.workflow.actual);
      _temp.jobs = this.coreService.keyValuePair(this.jobs);
      this.workflow.actual = JSON.stringify(_temp);
    } else {
      this.storeJSON();
    }
  }

  private clearCopyObj(): void {
    this.copyId = null;
    $('#toolbar').find('img').each(function(index) {
      if (index === 12) {
        $(this).addClass('disable-link');
      }
    });
  }

  private storeJSON(): void {
    setTimeout(() => {
      if (this.editor && this.editor.graph && !this.implicitSave) {
        this.noSave = true;
        this.xmlToJsonParser(null);
        this.validateJSON(false);
        setTimeout(() => {
          this.noSave = false;
        }, 250);
      }
    }, 150);
  }

  private openSideBar(id): void {
    this.error = true;
    if (this.editor.graph && id) {
      this.dataService.reloadWorkflowError.next({error: this.error, msg: this.invalidMsg});
      this.editor.graph.setSelectionCells([this.editor.graph.getModel().getCell(id)]);
      this.initEditorConf(this.editor, false, true);
    }
  }

  private modifyJSON(_json, isValidate, isOpen): boolean {
    if (_.isEmpty(_json)) {
      return false;
    }
    let checkErr = false;
    let isJobExist = false;
    const self = this;
    let flag = true;
    let ids = new Map();
    let labels = new Map();

    function recursive(json) {
      if (json.instructions && (flag || !isValidate)) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Job') {
            isJobExist = true;
            json.instructions[x].TYPE = 'Execute.Named';
            flag = self.workflowService.validateFields(json.instructions[x], 'Node');
            if (!flag) {
              self.invalidMsg = !json.instructions[x].label ? 'workflow.message.labelIsMissing' : 'workflow.message.nameIsNotValid';
              checkErr = true;
            }
            if (flag) {
              if (labels.has(json.instructions[x].label)) {
                if (labels.get(json.instructions[x].label) !== json.instructions[x].id) {
                  flag = false;
                  self.invalidMsg = 'workflow.message.duplicateLabel';
                  checkErr = true;
                }
              }
              if (!labels.has(json.instructions[x].label)) {
                labels.set(json.instructions[x].label, json.instructions[x].id);
              }
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(json.instructions[x].id);
              }
              return;
            }

            if (flag && !ids.has(json.instructions[x].jobName)) {
              ids.set(json.instructions[x].jobName, json.instructions[x].id);
            }
          }
          if (json.instructions[x].TYPE === 'If') {
            if ((!json.instructions[x].predicate || !json.instructions[x].then) && isValidate) {
              flag = false;
              self.invalidMsg = !json.instructions[x].predicate ? 'workflow.message.predicateIsMissing' : 'workflow.message.invalidIfInstruction';
              checkErr = true;
              if (isOpen) {
                if (!json.instructions[x].predicate) {
                  self.openSideBar(json.instructions[x].id);
                } else {
                  let msg = '';
                  self.translate.get('workflow.message.invalidIfInstruction').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.pop('error', msg);
                }
              }
              return;
            } else {
              self.validatePredicate(json.instructions[x].predicate, json.instructions[x].id, isOpen);
            }
          }
          if (json.instructions[x].TYPE === 'Try') {
            if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0) && isValidate) {
              flag = false;
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidTryInstruction';
              return;
            }
          }
          if (json.instructions[x].TYPE === 'Retry') {
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].maxTries) {

            } else {
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = 'workflow.message.invalidRetryInstruction';
                if (isOpen) {
                  let msg = '';
                  self.translate.get('workflow.message.invalidRetryInstruction').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.pop('error', msg);
                }
                if (isValidate) {
                  return;
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'Lock') {
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].lockId) {

            } else {
              if (json.instructions[x].count === '' || json.instructions[x].count === 'undefined') {
                delete json.instructions[x]['count'];
              }
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = !json.instructions[x].lockId ? 'workflow.message.lockIdIsMissing' : 'workflow.message.invalidLockInstruction';
                if (isOpen) {
                  if (!json.instructions[x].lockId) {
                    self.openSideBar(json.instructions[x].id);
                  } else {
                    let msg = '';
                    self.translate.get('workflow.message.invalidLockInstruction').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', msg);
                  }
                }
                if (isValidate) {
                  return;
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'Await') {
            flag = self.workflowService.validateFields(json.instructions[x], 'Await');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidAwaitInstruction';
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(json.instructions[x].id);
              }
              return;
            }
          }
          if (json.instructions[x].TYPE === 'Fork') {
            flag = self.workflowService.validateFields(json.instructions[x], 'Fork');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = (!json.instructions[x].branches || json.instructions[x].branches.length < 2) ? 'workflow.message.invalidForkInstruction' : 'workflow.message.nameIsNotValid';
            }
            if (!flag && isValidate) {
              if (isOpen) {
                if (json.instructions[x].branches && json.instructions[x].branches.length > 0) {
                  self.openSideBar(json.instructions[x].id);
                } else {
                  let msg = '';
                  self.translate.get('workflow.message.invalidForkInstruction').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.pop('error', msg);
                }
              }
              return;
            }
            if (json.instructions[x].branches) {
              json.instructions[x].branches = json.instructions[x].branches.filter((branch) => {
                branch.workflow = {
                  instructions: branch.instructions
                };
                delete branch['instructions'];
                return (branch.workflow.instructions && branch.workflow.instructions.length > 0);
              });
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].workflow) {
                  recursive(json.instructions[x].branches[i].workflow);
                }
              }
            }
          }
          json.instructions[x].id = undefined;
          json.instructions[x].uuid = undefined;
          json.instructions[x].isCollapsed = undefined;
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Try' && json.instructions[x].instructions && !json.instructions[x].try) {
            self.workflowService.convertTryInstruction(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Retry' && (json.instructions[x].retryDelays || json.instructions[x].maxTries)) {
            json.instructions[x].TYPE = 'Try';
            self.workflowService.convertRetryToTryCatch(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Lock') {
            json.instructions[x].lockedWorkflow = {
              instructions: json.instructions[x].instructions
            };
            const countObj = _.clone(json.instructions[x].count);
            delete json.instructions[x]['instructions'];
            delete json.instructions[x]['count'];
            json.instructions[x]['count'] = countObj;
          }
          if (json.instructions[x].catch) {
            json.instructions[x].catch.id = undefined;
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else) {
            if (json.instructions[x].else.instructions) {
              recursive(json.instructions[x].else);
            } else {
              delete json.instructions[x]['else'];
            }
          }
        }
      }
    }

    recursive(_json);
    if (!this.error || !isValidate) {
      if (isJobExist) {
        if (this.jobs.length === 0) {
          checkErr = true;
        } else {
          for (let n = 0; n < this.jobs.length; n++) {
            flag = self.workflowService.validateFields(this.jobs[n].value, 'Job');
            if (!flag) {
              checkErr = true;
              if (this.jobs[n].value.executable.TYPE === 'ScriptExecutable' && !this.jobs[n].value.executable.script) {
                this.invalidMsg = 'workflow.message.scriptIsMissing';
              } else if (this.jobs[n].value.executable.TYPE === 'InternalExecutable' && !this.jobs[n].value.executable.className) {
                this.invalidMsg = 'workflow.message.classNameIsMissing';
              } else if (!this.jobs[n].value.agentId) {
                this.invalidMsg = 'workflow.message.agentIsMissing';
              }
            }

            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(ids.get(this.jobs[n].name));
              }
              break;
            }
          }
        }
      }
    }
    if (_json.instructions && (!this.error || !isValidate)) {
      delete _json['id'];
      _json.jobs = this.coreService.keyValuePair(this.jobs);
    }
    if (this.error || checkErr) {
      flag = false;
    }
    if (flag) {
      this.invalidMsg = '';
    }
    return flag;
  }

  private validateByURL(json) {
    const obj = _.clone(json);
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      if (!this.invalidMsg && res.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
      this.workflow.valid = res.valid;

    }, () => {
    });
  }

  private validatePredicate(predicate, id, isOpen) {
    this.coreService.post('inventory/validate/predicate', predicate).subscribe((res: any) => {
      if (res.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
        this.workflow.valid = false;
        if (isOpen) {
          this.openSideBar(id);
        }
      }
    }, () => {
    });
  }

  private checkJobInstruction(data): any {
    for (let prop in data.jobs) {
      if (data.jobs[prop] && data.jobs[prop].executable) {
        if (data.jobs[prop].executable.env && _.isArray(data.jobs[prop].executable.env)) {
          data.jobs[prop].executable.env = data.jobs[prop].executable.env.filter((env) => {
            if (env.value) {
              if (!(/[$_+]/.test(env.value))) {
                let startChar = env.value.substring(0, 1),
                  endChar = env.value.substring(env.value.length - 1);
                if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {

                } else {
                  env.value = JSON.stringify(env.value);
                  env.value = '\'' + env.value.substring(1, env.value.length - 1) + '\'';
                }
              }
              return true;
            }
            return false;
          });
          if (data.jobs[prop].executable.env && data.jobs[prop].executable.env.length > 0) {
            this.coreService.convertArrayToObject(data.jobs[prop].executable, 'env', true);
          } else {
            delete data.jobs[prop].executable['env'];
          }
        }
      }
    }
  }

  private saveJSON(noValidate) {
    if (this.selectedNode && noValidate) {
      return;
    }
    if (this.selectedNode) {
      this.initEditorConf(this.editor, false, true);
      this.xmlToJsonParser(null);
    } else if (this.selectedNode === undefined) {
      return;
    }
    let data;
    if (!noValidate || noValidate === 'false') {
      data = this.coreService.clone(this.workflow.configuration);
      this.workflow.valid = this.modifyJSON(data, false, false);
    } else {
      data = noValidate;
    }

    this.checkJobInstruction(data);

    if (this.workflow.actual && !_.isEqual(this.workflow.actual, JSON.stringify(data)) && !this.isStore) {
      this.isStore = true;
      if (this.history.length === 20) {
        this.history.shift();
      }
      this.history.push(JSON.stringify(data));
      this.indexOfNextAdd = this.history.length;
      this.storeData(data);
    }
  }

  private updateOtherProperties() {
    let data = JSON.parse(this.workflow.actual);
    this.storeData(data);
  }

  private storeData(data) {
    if (this.isTrash || !this.workflow || !this.workflow.id) {
      return;
    }
    let newObj: any = {};
    newObj = _.extend(newObj, data);
    if (this.orderRequirements && this.orderRequirements.parameters) {
      newObj.orderRequirements = this.orderRequirements;
    }
    if (this.title) {
      newObj.title = this.title;
    }

    this.coreService.post('inventory/store', {
      configuration: newObj,
      id: this.workflow.id,
      valid: this.workflow.valid,
      objectType: this.objectType
    }).subscribe((res: any) => {
      this.isStore = false;
      if (res.id === this.data.id && this.workflow.id === this.data.id) {
        this.workflow.actual = JSON.stringify(data);
        this.workflow.deployed = false;
        this.workflow.valid = res.valid;
        this.data.valid = res.valid;
        this.data.deployed = false;
        if (this.invalidMsg && this.invalidMsg.match(/inventory/)) {
          this.invalidMsg = '';
        }
        if (!this.invalidMsg && res.invalidMsg) {
          this.invalidMsg = res.invalidMsg;
        }
      }
    }, (err) => {
      this.isStore = false;
      console.error(err);
    });
  }
}
