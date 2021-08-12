import {
  AfterViewInit,
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
import {isEmpty, isArray, isEqual, clone, extend, sortBy} from 'underscore';
import {saveAs} from 'file-saver';
import {Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray, DragDrop} from '@angular/cdk/drag-drop';
import {WorkflowService} from '../../../../services/workflow.service';
import {DataService} from '../../../../services/data.service';
import {CoreService} from '../../../../services/core.service';
import {ValueEditorComponent} from '../../../../components/value-editor/value.component';
import {InventoryObject} from '../../../../models/enums';

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
declare const mxRhombus;
declare const mxLabel;
declare const mxKeyHandler;
declare const X2JS;
declare const $;

const x2js = new X2JS();

@Component({
  selector: 'app-job-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-text-editor.html'
})
export class JobComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;
  @Input() schedulerId: any;
  @Input() selectedNode: any;
  @Input() jobs: any;
  @Input() jobResourcesTree = [];
  @Input() documentationTree = [];
  @Input() orderPreparation;
  @Input() agents = [];
  @Input() isTooltipVisible: boolean;
  history = [];
  indexOfNextAdd = 0;
  error: boolean;
  errorMsg: string;
  obj: any = {};
  isDisplay = false;
  fullScreen = false;
  index = 0;
  presentObj: any = {};
  returnCodes: any = {on: 'success'};
  cmOption: any = {
    lineNumbers: true,
    autoRefresh: true,
    mode: 'shell'
  };
  object = {
    checked1: false,
    indeterminate1: false,
    setOfCheckedArgu: new Set<string>(),
    checked2: false,
    indeterminate2: false,
    setOfCheckedJobArgu: new Set<string>(),
    checked3: false,
    indeterminate3: false,
    setOfCheckedEnv: new Set<string>(),
    checked4: false,
    indeterminate4: false,
    setOfCheckedNodeArgu: new Set<string>(),
    checked5: false,
    indeterminate5: false,
    setOfCheckedDefaultArgu: new Set<string>()
  };
  variableList = [];
  filteredOptions = [];
  mentionValueList = [];
  copiedParamObjects: any = {};
  subscription: Subscription;

  constructor(private coreService: CoreService, private modal: NzModalService, private ref: ChangeDetectorRef,
              private workflowService: WorkflowService, private dataService: DataService) {
    this.subscription = dataService.reloadWorkflowError.subscribe(res => {
      if (res.error) {
        this.error = res.error;
        if (res.msg && res.msg.match('duplicateLabel')) {
          this.errorMsg = res.msg;
        } else {
          this.errorMsg = '';
        }
      } else {
        if (res.change && res.change.current && this.selectedNode && this.selectedNode.job) {
          this.jobs = res.change.jobs;
          this.selectedNode.job = {...this.selectedNode.job, ...this.coreService.clone(res.change.current.value)};
          this.setJobProperties();
          this.ref.detectChanges();
          this.fullScreen = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.index = 0;
    this.updateVariableList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedNode) {
      this.history = [];
      this.indexOfNextAdd = 0;
      this.reset();
      this.init();
      this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
      this.presentObj.job = JSON.stringify(this.selectedNode.job);
    }
    if (changes.orderPreparation) {
      this.updateVariableList();
    }
  }

  changeType(type): void {
    if (type === 'ShellScriptExecutable') {
      this.reloadScript();
    }
    this.saveToHistory();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateSelectItems(): void {
    const arr = this.selectedNode.obj.defaultArguments.filter(option => option.name);
    this.mentionValueList = [...this.variableList, ...arr];
    this.filteredOptions = [...this.variableList, ...arr];
    this.ref.detectChanges();
  }

  reloadScript(): void {
    this.isDisplay = false;
    setTimeout(() => {
      this.isDisplay = true;
      this.ref.detectChanges();
    }, 5);
  }

  updateVariableList(): void {
    if (this.orderPreparation && this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.orderPreparation.parameters).map(([k, v]) => {
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

  showEditor(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ScriptEditorComponent,
      nzClassName: 'lg script-editor',
      nzComponentParams: {
        script: this.selectedNode.job.executable.script
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.selectedNode.job.executable.script = result;
        this.ref.detectChanges();
        this.saveToHistory();
      }
    });
  }

  drop(event: CdkDragDrop<string[]>, list: Array<any>): void {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.saveToHistory();
    }
  }

  onAllChecked(obj: any, type: string, isChecked: boolean): void {
    obj[type === 'nodeArguments' ? 'defaultArguments' : type].forEach(item => this.updateCheckedSet(obj[type === 'nodeArguments' ? 'defaultArguments' : type], type, item.name, isChecked));
  }

  onItemChecked(obj: any, type: string, name: string, checked: boolean): void {
    this.updateCheckedSet(obj[type === 'nodeArguments' ? 'defaultArguments' : type], type, name, checked);
  }

  updateCheckedSet(list: Array<any>, type: string, name: string, checked: boolean): void {
    if (type === 'arguments') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedArgu.add(name);
        } else {
          this.object.setOfCheckedArgu.delete(name);
        }
      }
      this.object.checked1 = list.every(item => {
        return this.object.setOfCheckedArgu.has(item.name);
      });
      this.object.indeterminate1 = this.object.setOfCheckedArgu.size > 0 && !this.object.checked1;
    } else if (type === 'jobArguments') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedJobArgu.add(name);
        } else {
          this.object.setOfCheckedJobArgu.delete(name);
        }
      }
      this.object.checked2 = list.every(item => {
        return this.object.setOfCheckedJobArgu.has(item.name);
      });
      this.object.indeterminate2 = this.object.setOfCheckedJobArgu.size > 0 && !this.object.checked2;
    } else if (type === 'env') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedEnv.add(name);
        } else {
          this.object.setOfCheckedEnv.delete(name);
        }
      }
      this.object.checked3 = list.every(item => {
        return this.object.setOfCheckedEnv.has(item.name);
      });
      this.object.indeterminate3 = this.object.setOfCheckedEnv.size > 0 && !this.object.checked3;
    } else if (type === 'nodeArguments') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedNodeArgu.add(name);
        } else {
          this.object.setOfCheckedNodeArgu.delete(name);
        }
      }
      this.object.checked4 = list.every(item => {
        return this.object.setOfCheckedNodeArgu.has(item.name);
      });
      this.object.indeterminate4 = this.object.setOfCheckedNodeArgu.size > 0 && !this.object.checked4;
    } else {
      if (name) {
        if (checked) {
          this.object.setOfCheckedDefaultArgu.add(name);
        } else {
          this.object.setOfCheckedDefaultArgu.delete(name);
        }
      }
      this.object.checked5 = list.every(item => {
        return this.object.setOfCheckedDefaultArgu.has(item.name);
      });
      this.object.indeterminate5 = this.object.setOfCheckedDefaultArgu.size > 0 && !this.object.checked5;
    }
  }

  fitToScreen(): void {
    this.fullScreen = !this.fullScreen;
  }

  cutParam(type): void {
    this.cutCopyOperation(type, 'CUT');
  }

  copyParam(type): void {
    this.cutCopyOperation(type, 'COPY');
  }

  private cutOperation(): void {
    if (this.copiedParamObjects.type) {
      let list = this.getList(this.copiedParamObjects.type);
      if (this.copiedParamObjects.operation === 'CUT' && list && list.length > 0) {
        list = list.filter(item => {
          if (this.copiedParamObjects.type === 'arguments') {
            return !this.object.setOfCheckedArgu.has(item.name);
          } else if (this.copiedParamObjects.type === 'jobArguments') {
            return !this.object.setOfCheckedJobArgu.has(item.name);
          } else if (this.copiedParamObjects.type === 'env') {
            return !this.object.setOfCheckedEnv.has(item.name);
          } else if (this.copiedParamObjects.type === 'nodeArguments') {
            return !this.object.setOfCheckedNodeArgu.has(item.name);
          } else {
            return !this.object.setOfCheckedDefaultArgu.has(item.name);
          }
        });
        if (this.copiedParamObjects.type === 'arguments') {
          this.selectedNode.job.executable.arguments = list;
        } else if (this.copiedParamObjects.type === 'jobArguments') {
          this.selectedNode.job.executable.jobArguments = list;
        } else if (this.copiedParamObjects.type === 'env') {
          this.selectedNode.job.executable.env = list;
        } else if (this.copiedParamObjects.type === 'nodeArguments') {
          this.selectedNode.obj.defaultArguments = list;
        } else {
          this.selectedNode.job.defaultArguments = list;
        }
      }
    }
  }

  private reset(): void {
    this.object = {
      checked1: false,
      indeterminate1: false,
      setOfCheckedArgu: new Set<string>(),
      checked2: false,
      indeterminate2: false,
      setOfCheckedJobArgu: new Set<string>(),
      checked3: false,
      indeterminate3: false,
      setOfCheckedEnv: new Set<string>(),
      checked4: false,
      indeterminate4: false,
      setOfCheckedNodeArgu: new Set<string>(),
      checked5: false,
      indeterminate5: false,
      setOfCheckedDefaultArgu: new Set<string>()
    };
  }

  private cutCopyOperation(type, operation): void {
    if (type === 'arguments') {
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedNodeArgu.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else if (type === 'jobArguments') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedNodeArgu.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else if (type === 'env') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedNodeArgu.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else if (type === 'nodeArguments') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedNodeArgu.clear();
    }
    let list = this.getList(type);
    const arr = list.filter(item => {
      if (type === 'arguments') {
        return this.object.setOfCheckedArgu.has(item.name);
      } else if (type === 'jobArguments') {
        return this.object.setOfCheckedJobArgu.has(item.name);
      } else if (type === 'env') {
        return this.object.setOfCheckedEnv.has(item.name);
      } else if (type === 'nodeArguments') {
        return this.object.setOfCheckedNodeArgu.has(item.name);
      } else {
        return this.object.setOfCheckedDefaultArgu.has(item.name);
      }
    });
    this.copiedParamObjects = {operation, type, data: arr, name: this.selectedNode.obj.jobName};
    this.coreService.tabs._configuration.copiedParamObjects = this.coreService.clone(this.copiedParamObjects);
  }

  private getList(type): Array<any> {
    if (type === 'arguments') {
      return this.selectedNode.job.executable.arguments;
    } else if (type === 'jobArguments') {
      return this.selectedNode.job.executable.jobArguments;
    } else if (type === 'env') {
      return this.selectedNode.job.executable.env;
    } else if (type === 'nodeArguments') {
      return this.selectedNode.obj.defaultArguments;
    } else {
      return this.selectedNode.job.defaultArguments;
    }
  }

  pasteParam(obj: any, type: string): void {
    if (!this.copiedParamObjects.data) {
      return;
    }
    const arr = this.getPasteParam(obj[type], this.copiedParamObjects.data);
    if (arr.length > 0) {
      obj[type] = obj[type].filter((item) => {
        return !!item.name;
      });
      obj[type] = obj[type].concat(arr);
    }
    const arrList = this.getList(this.copiedParamObjects.type);
    if (this.copiedParamObjects.operation === 'CUT' && arrList && arrList.length > 0) {
      this.cutOperation();
      if (this.copiedParamObjects.type === 'arguments') {
        this.object.setOfCheckedArgu = new Set<string>();
        this.object.checked1 = false;
        this.object.indeterminate1 = false;
      } else if (this.copiedParamObjects.type === 'jobArguments') {
        this.object.setOfCheckedJobArgu = new Set<string>();
        this.object.checked2 = false;
        this.object.indeterminate2 = false;
      } else if (this.copiedParamObjects.type === 'env') {
        this.object.setOfCheckedEnv = new Set<string>();
        this.object.checked3 = false;
        this.object.indeterminate3 = false;
      } else if (this.copiedParamObjects.type === 'nodeArguments') {
        this.object.setOfCheckedNodeArgu = new Set<string>();
        this.object.checked4 = false;
        this.object.indeterminate4 = false;
      } else {
        this.object.setOfCheckedDefaultArgu = new Set<string>();
        this.object.checked5 = false;
        this.object.indeterminate5 = false;
      }
      this.copiedParamObjects = {};
      this.coreService.tabs._configuration.copiedParamObjects = this.copiedParamObjects;
      this.ref.detectChanges();
    }
  }

  /**
   * Function: To paste param fom one job param to another param list
   */
  private getPasteParam(sour, target): any {
    const temp = this.coreService.clone(target);
    if (sour) {
      for (let i = 0; i < sour.length; i++) {
        if (temp) {
          for (let j = 0; j < temp.length; j++) {
            if (sour[i].name === temp[j].name) {
              temp.splice(j, 1);
              break;
            }
          }
        }
      }
    }
    return temp;
  }

  openEditor(data: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        data: data.value
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
        this.ref.detectChanges();
        this.saveToHistory();
      }
    });
  }

  onBlur(): void {
    if (this.error && this.selectedNode && this.selectedNode.obj) {
      this.obj.label = !this.selectedNode.obj.label;
      this.obj.agent = !this.selectedNode.job.agentName;
      this.obj.script = !this.selectedNode.job.executable.script && this.selectedNode.job.executable.TYPE === 'ShellScriptExecutable';
      this.obj.className = !this.selectedNode.job.executable.className && this.selectedNode.job.executable.TYPE === 'InternalExecutable';
    } else {
      this.obj = {};
    }
    this.saveToHistory();
  }

  onChangeJobResource(value): void {
    if (!isEqual(JSON.stringify(this.selectedNode.job.jobResourceNames), JSON.stringify(value))) {
      this.selectedNode.job.jobResourceNames = value;
    }
  }

  saveToHistory(): void {
    let flag1 = false;
    let flag2 = false;
    if (!isEqual(this.presentObj.obj, JSON.stringify(this.selectedNode.obj))) {
      flag1 = true;
    }
    if (!isEqual(this.presentObj.job, JSON.stringify(this.selectedNode.job))) {
      flag2 = true;
    }
    if (flag1 || flag2) {
      if (this.presentObj && !isEmpty(this.presentObj)) {
        this.history.push(clone(JSON.stringify(this.presentObj)));
        this.indexOfNextAdd = this.history.length - 1;
      }
      if (flag1) {
        this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
      }
      if (flag2) {
        this.presentObj.job = JSON.stringify(this.selectedNode.job);
      }
    }
  }

  checkString(data, type): void {
    if (data[type]) {
      const startChar = data[type].substring(0, 1);
      const endChar = data[type].substring(data[type].length - 1);
      if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {
        data[type] = data[type].substring(1, data[type].length - 1);
      }
    }
  }

  getJobInfo(): void {
    let flag = false;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === this.selectedNode.obj.jobName) {
        this.selectedNode.job = {...this.selectedNode.job, ...this.coreService.clone(this.jobs[i].value)};
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
      for (const i in this.jobs) {
        if (this.jobs[i] && this.jobs[i].name === this.selectedNode.obj.jobName) {
          this.selectedNode.job = {...this.selectedNode.job, ...this.coreService.clone(this.jobs[i].value)};
          break;
        }
      }
      this.setJobProperties();
    }
    if (!this.selectedNode.obj.label) {
      this.selectedNode.obj.label = this.selectedNode.obj.jobName;
    }
    this.saveToHistory();
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
    this.saveToHistory();
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
    this.saveToHistory();
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
    this.saveToHistory();
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
    this.saveToHistory();
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
    this.saveToHistory();
  }

  isStringValid(data, form, list): void {
    if (form.invalid) {
      data.name = '';
      data.value = '';
    } else {
      let count = 0;
      if (list.length > 1) {
        for (let i in list) {
          if (list[i].name === data.name) {
            ++count;
          }
          if (count > 1) {
            form.control.setErrors({incorrect: true});
            break;
          }
        }
      }
    }
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
    if (type === 'jobArgument') {
      if ($event.key === '$') {
        $event.preventDefault();
      }
    }
    if ($event.which === '13' || $event.which === 13) {
      type === 'default' ? this.addVariable() : type === 'jobArgument' ? this.addJobArgument() : type === 'node' ? this.addArgument() : this.addArgu();
      this.saveToHistory();
    }
  }

  loadData(node, type, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      if (type === InventoryObject.JOBRESOURCE) {
        return;
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        let request: any = {
          path: node.key,
          objectTypes: [type]
        };
        if (type === 'DOCUMENTATION') {
          request = {
            folders: [{folder: node.key, recursive: false}],
            onlyWithAssignReference: true
          };
        }
        const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
        this.coreService.post(URL, request).subscribe((res: any) => {
          let data = res.documentations || res.jobResources;
          for (let i = 0; i < data.length; i++) {
            const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = data[i].assignReference || data[i].name;
            data[i].path = path;
            data[i].key = data[i].assignReference || data[i].name;
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
          if (type === 'DOCUMENTATION') {
            this.documentationTree = [...this.documentationTree];
          }
          this.ref.detectChanges();
        });
      }
    } else {
      if (type === 'DOCUMENTATION') {
        if (this.selectedNode.job.documentationName1) {
          if (this.selectedNode.job.documentationName !== this.selectedNode.job.documentationName1) {
            this.selectedNode.job.documentationName = this.selectedNode.job.documentationName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.selectedNode.job.documentationName !== node.key) {
            this.selectedNode.job.documentationName = node.key;
          }
        }
      }
      setTimeout(() => {
        this.saveToHistory();
      }, 10);
    }
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  private init(): void {
    this.copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    this.getJobInfo();
    this.selectedNode.obj.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.obj, 'defaultArguments');
    if (this.selectedNode.obj.defaultArguments && this.selectedNode.obj.defaultArguments.length === 0) {
      this.addArgument();
    }
    if (this.selectedNode.job.jobResourceNames && this.selectedNode.job.jobResourceNames.length > 0) {
      this.selectedNode.job.jobResourceNames = [...this.selectedNode.job.jobResourceNames];
    }
    this.onBlur();
    if (this.index === 0) {
      this.reloadScript();
    }
    this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
    this.presentObj.job = JSON.stringify(this.selectedNode.job);
  }

  private setJobProperties(): void {
    if (!this.selectedNode.job.parallelism) {
      this.selectedNode.job.parallelism = 1;
    }
    if (!this.selectedNode.job.executable || !this.selectedNode.job.executable.TYPE) {
      this.selectedNode.job.executable = {
        TYPE: 'ShellScriptExecutable',
        script: '',
        login: {},
        env: []
      };
    }
    if (this.selectedNode.job.executable.TYPE === 'ScriptExecutable') {
      this.selectedNode.job.executable.TYPE = 'ShellScriptExecutable';
    }

    if (!this.selectedNode.job.executable.returnCodeMeaning) {
      this.selectedNode.job.executable.returnCodeMeaning = {
        success: 0
      };
    } else {
      if (this.selectedNode.job.executable.returnCodeMeaning.success) {
        this.selectedNode.job.executable.returnCodeMeaning.success = this.selectedNode.job.executable.returnCodeMeaning.success.toString();
      } else if (this.selectedNode.job.executable.returnCodeMeaning.failure) {
        this.selectedNode.job.executable.returnCodeMeaning.failure = this.selectedNode.job.executable.returnCodeMeaning.failure.toString();
      }
    }
    if (this.selectedNode.job.executable.returnCodeMeaning.failure) {
      this.returnCodes.on = 'failure';
    } else {
      this.returnCodes.on = 'success';
    }

    if (!this.selectedNode.job.defaultArguments || isEmpty(this.selectedNode.job.defaultArguments)) {
      this.selectedNode.job.defaultArguments = [];
    } else {
      if (!isArray(this.selectedNode.job.defaultArguments)) {
        this.selectedNode.job.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.job, 'defaultArguments');
        this.selectedNode.job.defaultArguments.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }
    if (!this.selectedNode.job.executable.arguments || isEmpty(this.selectedNode.job.executable.arguments)) {
      this.selectedNode.job.executable.arguments = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.arguments)) {
        this.selectedNode.job.executable.arguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'arguments');
        this.selectedNode.job.executable.arguments.filter((env) => {
          this.coreService.removeSlashToString(env, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.jobArguments || isEmpty(this.selectedNode.job.executable.jobArguments)) {
      this.selectedNode.job.executable.jobArguments = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.jobArguments)) {
        this.selectedNode.job.executable.jobArguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'jobArguments');
        this.selectedNode.job.executable.jobArguments.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.env || isEmpty(this.selectedNode.job.executable.env)) {
      this.selectedNode.job.executable.env = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.env)) {
        this.selectedNode.job.executable.env = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'env');
        this.selectedNode.job.executable.env.filter((env) => {
          this.coreService.removeSlashToString(env, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.login) {
      this.selectedNode.job.executable.login = {};
    }

    if (this.selectedNode.job.timeout) {
      this.selectedNode.job.timeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.timeout);
    }
    if (this.selectedNode.job.graceTimeout) {
      this.selectedNode.job.graceTimeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.graceTimeout);
    }
    if (this.selectedNode.job.warnIfShorter) {
      this.selectedNode.job.warnIfShorter1 = this.workflowService.convertDurationToString(this.selectedNode.job.warnIfShorter);
    }
    if (this.selectedNode.job.warnIfLonger) {
      this.selectedNode.job.warnIfLonger1 = this.workflowService.convertDurationToString(this.selectedNode.job.warnIfLonger);
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

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    const n = this.history.length;
    if (this.indexOfNextAdd < n) {
      const obj = this.history[this.indexOfNextAdd++];
      this.restoreData(obj);
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
      this.restoreData(obj);
    }
  }

  private restoreData(obj: any): void {
    obj = JSON.parse(obj);
    this.selectedNode.obj = JSON.parse(obj.obj);
    const x = JSON.parse(obj.job);
    if (this.selectedNode.job.executable.TYPE !== x.executable.TYPE && x.executable.TYPE === 'ShellScriptExecutable') {
      this.reloadScript();
    }
    this.selectedNode.job = x;
    this.ref.detectChanges();
  }
}

@Component({
  selector: 'app-script-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './script-editor.html'
})
export class ScriptEditorComponent implements AfterViewInit {
  @Input() script: any;
  @ViewChild('codeMirror', {static: true}) cm;
  dragEle: any;
  cmOption: any = {
    lineNumbers: true,
    viewportMargin: Infinity,
    autofocus: true,
    autoRefresh: true,
    mode: 'shell'
  };

  constructor(public activeModal: NzModalRef, private dragDrop: DragDrop) {
  }

  ngAfterViewInit(): void {
    if (localStorage.$SOS$SCRIPTWINDOWWIDTH) {
      const wt = parseInt(localStorage.$SOS$SCRIPTWINDOWWIDTH, 10);
      this.cm.codeMirror.setSize(wt - 2, (parseInt(localStorage.$SOS$SCRIPTWINDOWHIGHT, 10) - 2));
      $('.ant-modal').css('cssText', 'width : ' + (wt + 32) + 'px !important');
    }
    this.dragEle = this.dragDrop.createDrag(this.activeModal.containerInstance.modalElementRef.nativeElement);
    $('#resizable').resizable({
      resize: (e, x) => {
        const dom: any = document.getElementsByClassName('script-editor')[0];
        this.cm.codeMirror.setSize((x.size.width - 2), (x.size.height - 2));
        dom.style.setProperty('width', (x.size.width + 32) + 'px', 'important');
      }, stop: (e, x) => {
        localStorage.$SOS$SCRIPTWINDOWWIDTH = x.size.width;
        localStorage.$SOS$SCRIPTWINDOWHIGHT = x.size.height;
      }
    });
    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        this.cm.codeMirror.focus();
      }
    }, 500);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e): void {
    this.dragEle.disabled = !(e.target && (e.target.getAttribute('class') === 'modal-header' || e.target.getAttribute('class') === 'drag-text'));
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
  @Input() isTooltipVisible: boolean;
  expression: any = {};
  operators = ['==', '!=', '<', '<=', '>', '>=', 'in', '&&', '||', '!'];
  functions = ['toNumber', 'toBoolean'];
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

  ngOnInit(): void {
    this.expression.type = 'returnCode';
    this.change();
  }

  generateExpression(type, operator): void {
    this.lastSelectOperator = operator;
    let setText;
    if (type == 'function') {
      setText = operator + '(EXPR)';
      if (operator === 'toNumber') {
        this.varExam = operator + '(variable ("NAME"))';
      } else if (operator === 'toBoolean') {
        this.varExam = operator + '(variable ("NAME"))';
      } else {
        this.varExam = 'variable("aString", default="").' + operator;
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

  change(): void {
    this.error = !this.selectedNode.obj.predicate;
  }

  // Begin inputting of clicked text into editor
  private insertText(data, doc): void {
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
  hasBaseDropZoneOver: any;
  uploader: FileUploader;

  constructor(public activeModal: NzModalRef, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit(): void {
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

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    const item = event['0'];

    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      this.uploader.clearQueue();
    } else {
      const reader = new FileReader();
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

  onSubmit(): void {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.workflow);
    }, 100);
  }
}

@Component({
  selector: 'app-workflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  jobResourcesTree = [];
  documentationTree = [];
  lockTree = [];
  boardTree = [];
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  editor: any;
  dummyXml: any;
  // Declare Map object to store fork and join Ids
  nodeMap = new Map();
  droppedCell: any;
  movedCell: any;
  isCellDragging = false;
  display = false;
  propertyPanelWidth: number;
  selectedNode: any;
  node: any;
  title = '';
  documentationName = '';
  extraConfiguration: any = {};
  jobs: any = [];
  jobResourceNames: any = [];
  forkListVariables: any = [];
  listOfParams: any = [];
  forkListVariableObj: any = {};
  orderPreparation: any = {};
  workflow: any = {};
  history = {past: [], present: {}, future: [], type: 'new'};
  implicitSave = false;
  noSave = false;
  isLoading = true;
  isUpdate: boolean;
  isStore = false;
  error: boolean;
  cutCell: any;
  copyId: any;
  skipXMLToJSONConversion = false;
  objectType = InventoryObject.WORKFLOW;
  invalidMsg: string;
  inventoryConf: any;
  allowedDatatype = ['String', 'Number', 'Boolean', 'Final', 'List'];
  variableDeclarations = {parameters: []};
  document = {name: ''};
  fullScreen = false;
  subscription: Subscription;

  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;
  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(public coreService: CoreService, public translate: TranslateService, private modal: NzModalService,
              public toasterService: ToasterService, public workflowService: WorkflowService, private dataService: DataService,
              private nzContextMenuService: NzContextMenuService, private router: Router, private ref: ChangeDetectorRef) {
    this.subscription = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.workflow.actual) {
          this.ref.detectChanges();
        }
      }
    });
  }

  private static parseWorkflowJSON(result): void {
    if (result.jobs && !isEmpty(result.jobs)) {
      for (const x in result.jobs) {
        const v: any = result.jobs[x];
        if (v.executable.TYPE === 'ScriptExecutable') {
          result.jobs[x].executable.TYPE = 'ShellScriptExecutable';
        }
        result.jobs[x] = {
          agentName: v.agentName,
          executable: v.executable,
          defaultArguments: v.defaultArguments,
          jobResourceNames: v.jobResourceNames,
          title: v.title,
          logLevel: v.logLevel,
          criticality: v.criticality,
          timeout: v.timeout,
          graceTimeout: v.graceTimeout,
          warnIfShorter: v.warnIfShorter,
          warnIfLonger: v.warnIfLonger,
          parallelism: v.parallelism || v.taskLimit
        };
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.copyObj && !changes.data) {
      return;
    }
    if (changes.reload) {
      if (this.reload) {
        this.selectedNode = null;
        this.init();
        this.reload = false;
        return;
      }
    }
    if (this.workflow.actual) {
      this.saveCopyInstruction();
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
        this.documentationName = '';
        this.jobResourceNames = [];
        this.orderPreparation = {};
        this.dummyXml = null;
        this.ref.detectChanges();
      }
    }
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config): void {
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
        new mxOutline(this.editor.graph, outln);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      console.error(e);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.data.type) {
      this.saveCopyInstruction();
      this.saveJSON(false);
    }
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

  private saveCopyInstruction(): void {
    if (this.copyId) {
      let obj = this.getObject(this.workflow.configuration);
      if (obj.TYPE) {
        if (obj.TYPE === 'Job') {
          for (let i in this.jobs) {
            if (this.jobs[i] && this.jobs[i].name === obj.jobName) {
              obj.jobObject = this.jobs[i].value;
              break;
            }
          }
        }
        delete obj.id;
        delete obj.uuid;
        this.copyId = null;
        this.inventoryConf.copiedInstuctionObject = obj;
      }
    }
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

  fitToScreen(): void {
    this.fullScreen = !this.fullScreen;
  }

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    // use first future state as next present ...
    if (this.history.future.length > 0) {
      let next = this.history.future[0];
      // ... and remove from future
      const newFuture = this.history.future.slice(1);
      this.history = {
        // push present into past for undo
        past: [this.history.present, ...this.history.past],
        present: next,
        future: newFuture,
        type: 'redo'
      };
      next = JSON.parse(next);
      this.updateWorkflowJSONObj(next);
      this.reloadWorkflow(next);
    }
  }

  /**
   * Function: undo
   *
   * Undoes the last change.
   */
  undo(): void {
    // use first past state as next present ...
    if (this.history.past.length > 0) {
      let previous = this.history.past[0];
      // ... and remove from past
      const newPast = this.history.past.slice(1);
      this.history = {
        past: newPast,
        present: previous,
        // push present into future for redo
        future: [this.history.present, ...this.history.future],
        type: 'undo'
      };
      previous = JSON.parse(previous);
      this.updateWorkflowJSONObj(previous);
      this.reloadWorkflow(previous);
    }
  }

  private updateWorkflowJSONObj(data): void {
    if (data.orderPreparation) {
      this.orderPreparation = data.orderPreparation;
    }
    this.extraConfiguration = {
      title: data.title,
      documentationName: data.documentationName,
      jobResourceNames: data.jobResourceNames,
    };
    delete data.title;
    delete data.orderPreparation;
    delete data.documentationName;
    delete data.jobResourceNames;
    this.ref.detectChanges();
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
      const cells = this.node ? [this.node.cell] : null;
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
          this.updateToolbar('copy', cell);
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
        this.updateToolbar('cut', cell);
      }
    }
  }

  private updateToolbar(operation, cell, name = ''): void {
    $('#toolbar').find('img').each(function(index) {
      if (index === 13) {
        if (!cell && !name) {
          $(this).addClass('disable-link');
          $(this).attr('title', '');
        } else {
          $(this).removeClass('disable-link');
          $(this).attr('title', (operation === 'copy' ? 'Copy of ' : '') + (cell ? cell.value.tagName : name));
        }
      }
    });
  }

  navToWorkflowTab(): void {
    if (this.workflow.hasDeployments || this.data.deployed) {
      const PATH = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
      const pathArr = [];
      const arr = PATH.split('/');
      const workflowFilters = this.coreService.getWorkflowTab();
      workflowFilters.selectedkeys = [];
      const len = arr.length - 1;
      if (len > 1) {
        for (let i = 0; i < len; i++) {
          if (arr[i]) {
            if (i > 0 && pathArr[i - 1]) {
              pathArr.push(pathArr[i - 1] + (pathArr[i - 1] === '/' ? '' : '/') + arr[i]);
            } else {
              pathArr.push('/' + arr[i]);
            }
          } else {
            pathArr.push('/');
          }
        }
      }
      if (pathArr.length === 0) {
        pathArr.push('/');
      }
      workflowFilters.expandedKeys = pathArr;
      workflowFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
      workflowFilters.expandedObjects = [PATH];
      this.router.navigate(['/workflows']);
    }
  }

  closeMenu(): void {
    this.node = null;
  }

  validate(): void {
    if (this.invalidMsg && this.invalidMsg.match(/orderPreparation/)) {
      this.selectedNode = null;
    } else {
      if (!this.workflow.valid) {
        const data = this.coreService.clone(this.workflow.configuration);
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
        const newData: any = {};
        if (this.orderPreparation) {
          newData.orderPreparation = this.orderPreparation;
        }
        newData.instructions = data.instructions;
        if (this.title) {
          newData.title = this.title;
        }
        if (this.documentationName) {
          newData.documentationName = this.documentationName;
        }
        if (this.jobResourceNames.length > 0) {
          newData.jobResourceNames = this.jobResourceNames;
        }
        newData.jobs = data.jobs;
        data = JSON.stringify(newData, undefined, 2);
      }
      const blob = new Blob([data], {type: fileType});
      saveAs(blob, name);
    }
  }

  importJSON(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportComponent,
      nzClassName: 'lg',
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        WorkflowComponent.parseWorkflowJSON(result);
        if (result.orderPreparation) {
          this.orderPreparation = this.coreService.clone(result.orderPreparation);
        }
        if (result.title) {
          this.title = this.coreService.clone(result.title);
        }
        if (result.documentationName) {
          this.documentationName = this.coreService.clone(result.documentationName);
        }
        if (result.jobResourceNames) {
          this.jobResourceNames = this.coreService.clone(result.jobResourceNames);
        }
        this.workflow.configuration = this.coreService.clone(result);
        if (result.jobs && !isEmpty(result.jobs)) {
          this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
            return {name: k, value: v};
          });
        }
        delete this.workflow.configuration.orderPreparation;
        delete this.workflow.configuration.jobResourceNames;
        delete this.workflow.configuration.title;
        delete this.workflow.configuration.documentationName;
        this.history = {past: [], present: {}, future: [], type: 'new'};
        this.updateXMLJSON(false);
        this.storeData(result);
      }
    });
  }

  loadData(node, type, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      if (type === InventoryObject.JOBRESOURCE) {
        return;
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        let obj: any = {
          path: node.key,
          objectTypes: [type]
        };
        if (type === 'DOCUMENTATION') {
          obj = {
            folders: [{folder: node.key, recursive: false}],
            onlyWithAssignReference: true
          };
        }
        const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
        this.coreService.post(URL, obj).subscribe((res: any) => {
          let data = type === InventoryObject.LOCK ? res.locks : res.boards || res.documentations;
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = data[i].assignReference || data[i].name;
            data[i].path = _path;
            data[i].key = data[i].assignReference || data[i].name;
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
          if (type === InventoryObject.LOCK) {
            this.lockTree = [...this.lockTree];
          } else if (type === 'DOCUMENTATION') {
            this.documentationTree = [...this.documentationTree];
          } else if (type === InventoryObject.BOARD) {
            this.boardTree = [...this.boardTree];
          }
          this.ref.detectChanges();
        });
      }
    } else {
      if (type === InventoryObject.LOCK) {
        if (this.selectedNode.obj.lockName1) {
          if (this.selectedNode.obj.lockName !== this.selectedNode.obj.lockName1) {
            this.selectedNode.obj.lockName = this.selectedNode.obj.lockName1;
            this.getLimit();
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.selectedNode.obj.lockName !== node.key) {
            this.selectedNode.obj.lockName = node.key;
            this.getLimit();
          }
        }
      } else if (type === InventoryObject.BOARD) {
        if (this.selectedNode.obj.boardName1) {
          if (this.selectedNode.obj.boardName !== this.selectedNode.obj.boardName1) {
            this.selectedNode.obj.boardName = this.selectedNode.obj.boardName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.selectedNode.obj.boardName !== node.key) {
            this.selectedNode.obj.boardName = node.key;
          }
        }
      } else if (type === 'DOCUMENTATION') {
        if (this.document.name) {
          if (this.extraConfiguration.documentationName !== this.document.name) {
            this.extraConfiguration.documentationName = this.document.name;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.extraConfiguration.documentationName !== node.key) {
            this.extraConfiguration.documentationName = node.key;
          }
        }
        this.updateOtherProperties('documentation');
      }
    }
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload(): void {
    if (this.data.type) {
      this.ngOnDestroy();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.centered();
    this.checkGraphHeight();
  }

  checkGraphHeight(): void {
    if (this.editor) {
      const dom = $('.graph-container');
      if (dom && dom.position()) {
        const top = (dom.position().top + $('#rightPanel').position().top);
        const ht = 'calc(100vh - ' + (top + 16) + 'px)';
        dom.css({height: ht, 'scroll-top': '0'});
        $('#graph').slimscroll({height: ht, scrollTo: '0'});
      }
    }
  }

  validateJSON(skip): void {
    if (!this.isUpdate) {
      this.isUpdate = true;
      if (this.workflow.configuration && this.workflow.configuration.instructions && this.workflow.configuration.instructions.length > 0) {
        const data = this.coreService.clone(this.workflow.configuration);
        this.workflow.valid = this.modifyJSON(data, true, false);
        this.saveJSON(this.workflow.valid ? data : skip ? false : 'false');
      }
      setTimeout(() => {
        this.isUpdate = false;
      }, 50);
    }
  }

  deploy(): void {
    if (this.selectedNode) {
      this.initEditorConf(this.editor, false, true);
      setTimeout(() => {
        this.dataService.reloadTree.next({deploy: this.workflow});
      }, 10);
    } else {
      this.dataService.reloadTree.next({deploy: this.workflow});
    }
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.workflow});
  }

  navToObj(name, type): void {
    this.dataService.reloadTree.next({navigate: {name, type}});
  }

  changeDataType(type, variable): void {
    if (type === 'List') {
      delete variable.value.default;
      delete variable.value.final;
      variable.value.listParameters = [];
      this.addVariableToList(variable.value);
    } else{
      variable.value.default = '';
      variable.value.final = '';
    }
  }

  private init(): void {
    this.fullScreen = false;
    this.inventoryConf = this.coreService.getConfigurationTab();
    if (!this.dummyXml) {
      this.propertyPanelWidth = localStorage.propertyPanelWidth ? parseInt(localStorage.propertyPanelWidth, 10) : 460;
      this.loadConfig();
      this.coreService.get('workflow.json').subscribe((data) => {
        this.dummyXml = x2js.json2xml_str(data);
        this.createEditor(this.configXml);
        this.getWorkflowObject();
      });

      this.handleWindowEvents();
    } else {
      const outln = document.getElementById('outlineContainer');
      outln.innerHTML = '';
      outln.style.border = '1px solid lightgray';
      new mxOutline(this.editor.graph, outln);
      this.getWorkflowObject();
    }
    if (!this.isTrash) {
      if (this.jobResourcesTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.JOBRESOURCE]
        }).subscribe((res) => {
          this.jobResourcesTree = this.coreService.prepareTree(res, false);
          this.getJobResources();
        });
      }
      if (this.lockTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.LOCK]
        }).subscribe((res) => {
          this.lockTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.boardTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.BOARD]
        }).subscribe((res) => {
          this.boardTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.documentationTree.length === 0) {
        this.coreService.post('tree', {
          onlyWithAssignReference: true,
          types: ['DOCUMENTATION']
        }).subscribe((res) => {
          this.documentationTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.agents.length === 0) {
        this.coreService.post('agents/names', {controllerId: this.schedulerId}).subscribe((res: any) => {
          this.agents = res.agentNames ? res.agentNames.sort() : [];
        });
      }
    }
  }

  private getJobResources(): void {
    this.coreService.post('inventory/read/folder', {
      path: '/',
      recursive: true,
      objectTypes: [InventoryObject.JOBRESOURCE]
    }).subscribe((res: any) => {
      let map = new Map();
      res.jobResources = sortBy(res.jobResources, 'name');
      res.jobResources.forEach((item) => {
        const path = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        const obj = {
          title: item.name,
          path: item.path,
          key: item.name,
          type: item.objectType,
          isLeaf: true
        };
        if (map.has(path)) {
          const arr = map.get(path);
          arr.push(obj);
          map.set(path, arr);
        } else {
          map.set(path, [obj]);
        }
      });
      this.jobResourcesTree[0].expanded = true;
      this.updateTreeRecursive(this.jobResourcesTree, map);
      this.jobResourcesTree = [...this.jobResourcesTree];
      if (this.extraConfiguration.jobResourceNames && this.extraConfiguration.jobResourceNames.length > 0) {
        this.extraConfiguration.jobResourceNames = [...this.extraConfiguration.jobResourceNames];
        this.ref.detectChanges();
      }
    });
  }

  private updateTreeRecursive(nodes, map): void {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].path && map.has(nodes[i].path)) {
        nodes[i].children = map.get(nodes[i].path).concat(nodes[i].children || []);
      }
      if (nodes[i].children) {
        this.updateTreeRecursive(nodes[i].children, map);
      }
    }
  }

  private getWorkflowObject(): void {
    if (!this.inventoryConf.copiedInstuctionObject || !this.inventoryConf.copiedInstuctionObject.TYPE) {
      this.updateToolbar('copy', null);
    } else {
      this.updateToolbar('copy', null, this.inventoryConf.copiedInstuctionObject.TYPE);
    }
    this.error = false;
    this.history = {past: [], present: {}, future: [], type: 'new'};
    this.isLoading = true;
    this.invalidMsg = '';
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
      if (this.data.id === res.id) {
        if (this.data.deployed !== res.deployed) {
          this.data.deployed = res.deployed;
        }
        if (this.data.valid !== res.valid) {
          this.data.valid = res.valid;
        }
        this.jobs = [];
        this.variableDeclarations = {parameters: []};
        //this.variableDeclarations.allowUndeclared = false;
        this.orderPreparation = {};
        this.jobResourceNames = [];
        if (res.configuration) {
          delete res.configuration.TYPE;
          delete res.configuration.path;
          delete res.configuration.version;
          delete res.configuration.versionId;
        } else {
          res.configuration = {};
        }

        this.initObjects(res);
        this.workflow = res;
        this.workflow.actual = JSON.stringify(res.configuration);

        this.workflow.name = this.data.name;
        if (this.workflow.configuration.jobs) {
          if (this.workflow.configuration.jobs && !isEmpty(this.workflow.configuration.jobs)) {
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
        this.history.present = JSON.stringify(this.extendJsonObj(JSON.parse(this.workflow.actual)));
        if (this.editor) {
          this.updateJobs(this.editor.graph, true);
          this.ref.detectChanges();
        }
      }
    }, () => {
      this.isLoading = false;
    });
  }

  private initObjects(res): void {
    if (res.configuration.orderPreparation) {
      this.orderPreparation = this.coreService.clone(res.configuration.orderPreparation);
    }
    if (res.configuration.jobResourceNames) {
      this.jobResourceNames = this.coreService.clone(res.configuration.jobResourceNames);
    }
    this.documentationName = res.configuration.documentationName;
    this.title = res.configuration.title;
    delete res.configuration.orderPreparation;
    delete res.configuration.jobResourceNames;
    delete res.configuration.documentationName;
    delete res.configuration.title;

    this.extraConfiguration = {
      title: this.title,
      documentationName: this.documentationName,
      jobResourceNames: this.jobResourceNames,
    };

    if (this.extraConfiguration.jobResourceNames && this.extraConfiguration.jobResourceNames.length > 0) {
      this.extraConfiguration.jobResourceNames = [...this.extraConfiguration.jobResourceNames];
      this.ref.detectChanges();
    }
    if (!this.orderPreparation && this.variableDeclarations.parameters && this.variableDeclarations.parameters.length === 0) {
      this.addVariable();
    }
    if (this.orderPreparation && !isEmpty(this.orderPreparation)) {
      // this.variableDeclarations.allowUndeclared = this.orderPreparation.allowUndeclared;
      if (this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
        const temp = this.coreService.clone(this.orderPreparation.parameters);
        this.variableDeclarations.parameters = Object.entries(temp).map(([k, v]) => {
          const val: any = v;
          if (val.type === 'List') {
            delete val.default;
            delete val.final;
            if (val.listParameters) {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                return {name: k1, value: v1};
              });
            } else {
              this.addVariableToList(val);
            }
          } else if (val.final) {
            val.type = 'Final';
            this.coreService.removeSlashToString(val, 'final');
          } else if (val.default) {
            this.coreService.removeSlashToString(val, 'default');
            if (val.type === 'Boolean') {
              val.default = (val.default === true || val.default === 'true');
            }
          }
          return {name: k, value: val};
        });
      }
    }
  }

  addVariableToList(variable): void {
    const param = {
      name: '',
      value: {
        type: 'String'
      }
    };
    if (!variable.listParameters) {
      variable.listParameters = [];
    }
    if (!this.coreService.isLastEntryEmpty(variable.listParameters, 'name', '')) {
      variable.listParameters.push(param);
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

  checkDuplicateEntries(variable, index, list): void {
    if (variable.name) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].name === variable.name && i !== index) {
          variable.name = '';
          this.toasterService.pop('warning', list[i].name + ' is already exist');
          break;
        }
      }
    }
    if (variable.name) {
      this.updateOtherProperties('variable');
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.variableDeclarations.parameters, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.updateOtherProperties('variable');
    }
  }

  removeVariable(index): void {
    this.variableDeclarations.parameters.splice(index, 1);
    this.updateOtherProperties('variable');
  }

  removeVariableFromList(list, index, flag = true): void {
    list.splice(index, 1);
    if (flag) {
      this.updateOtherProperties('variable');
    }
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      $event.preventDefault();
      this.addVariable();
    }
  }

  openEditor(data: any, type = 'default'): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        data: data[type]
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (data[type] !== result) {
          data[type] = result;
          this.ref.detectChanges();
          this.updateOtherProperties('variable');
        }
      }
    });
  }

  private loadResources(path): void {
    if (this.treeSelectCtrl) {
      const node = this.treeSelectCtrl.getTreeNodeByKey(path);
      if (node) {
        node.isExpanded = true;
        this.loadData(node, InventoryObject.JOBRESOURCE, null);
      }
    }
  }

  rename(inValid): void {
    if (this.data.id === this.workflow.id && this.data.name !== this.workflow.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.workflow.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe((res) => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, (err) => {
          this.workflow.name = this.data.name;
          this.ref.detectChanges();
        });
      } else {
        this.workflow.name = this.data.name;
        this.ref.detectChanges();
      }
    }
  }

  private center(): void {
    const dom = document.getElementById('graph');
    let x = 0.5;
    let y = 0.2;
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
    const data = this.coreService.clone(this.workflow.configuration);
    this.modifyJSON(data, false, false);
    this.workflow.configuration = obj;
    let flag = false;
    if (this.workflow.configuration.jobs) {
      if (this.workflow.configuration.jobs && !isEmpty(this.workflow.configuration.jobs)) {
        const jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
          return {name: k, value: v};
        });
        if (!isEqual(JSON.stringify(this.jobs), JSON.stringify(jobs))) {
          this.jobs = jobs;
          flag = true;
        }
      }
    }
    if (!isEqual(JSON.stringify(obj.instructions), JSON.stringify(data.instructions))) {
      this.updateXMLJSON(false);
    }
    if (this.selectedNode && this.selectedNode.job && flag) {
      let isCheck = true;
      for (const i in this.jobs) {
        if (this.jobs[i].name === this.selectedNode.job.jobName) {
          isCheck = false;
          this.dataService.reloadWorkflowError.next({change: {jobs: this.jobs, current: this.jobs[i]}});
          break;
        }
      }
      if (isCheck) {
        this.selectedNode = null;
      }
    }
  }

  private getLimit(): void {
    this.error = false;
    if (this.selectedNode.obj.lockName) {
      this.coreService.post('inventory/read/configuration', {
        path: this.selectedNode.obj.lockName,
        objectType: InventoryObject.LOCK
      }).subscribe((conf: any) => {
        if (this.selectedNode && this.selectedNode.obj) {
          this.selectedNode.obj.limit = conf.configuration.limit || 1;
        }
      });
    }
  }

  createForkListVariables(): void{
    this.forkListVariableObj = {
      create: true,
      name: '',
      value: {
        type: 'List',
        listParameters: [
          {
            name: '',
            value: {
              type: 'String'
            }
          }
        ]
      }
    };
  }

  deleteForkListVariables(data): void {
    this.forkListVariables = this.forkListVariables.filter((item) => {
      return item.name !== data.name;
    });
    if (this.selectedNode.obj.children === data.name) {
      this.selectedNode.obj.children = '';
    }
    this.updateOtherProperties('variable');
  }

  editForkListVariables(data): void{
    this.forkListVariableObj = this.coreService.clone(data);
    this.forkListVariableObj.oldName = this.coreService.clone(data.name);
  }

  onSubmit(): void {
    let flag = true;
    for (const i in this.forkListVariables) {
      if (this.forkListVariableObj.create) {
        if (this.forkListVariables[i].name === this.forkListVariableObj.name) {
          this.forkListVariableObj.name = '';
          flag = false;
          break;
        }
      } else {
        if (this.forkListVariableObj.oldName === this.forkListVariables[i].name) {
          delete this.forkListVariableObj.oldName;
          this.forkListVariables[i] = this.coreService.clone(this.forkListVariableObj);
          this.forkListVariableObj = {};
          this.updateOtherProperties('variable');
          break;
        }
      }
    }
    if (flag && this.forkListVariableObj.create) {
      delete this.forkListVariableObj.create;
      this.forkListVariables.push(this.coreService.clone(this.forkListVariableObj));
      this.selectedNode.obj.children = this.forkListVariableObj.name;
      this.selectedNode.obj.childToId = '';
      this.forkListVariableObj = {};
      this.updateOtherProperties('variable');
    }
  }

  cancel(): void{
    this.forkListVariableObj = {};
  }

  selectListForForkList(value): void {
    this.listOfParams = [];
    for (const i in this.forkListVariables) {
      if (this.forkListVariables[i].name === value) {
        if (this.forkListVariables[i].value && this.forkListVariables[i].value.listParameters) {
          this.listOfParams = this.forkListVariables[i].value.listParameters;
        }
        break;
      }
    }
  }

  private getListOfVariables(obj): void {
    this.forkListVariables = [];
    if (this.variableDeclarations.parameters && this.variableDeclarations.parameters.length > 0) {
      this.variableDeclarations.parameters.forEach((param) => {
        if (param.value && param.value.type === 'List') {
          this.forkListVariables.push(param);
        }
      });
    }
    if (obj.children) {
      this.selectListForForkList(obj.children);
    }
  }

  private changeCellStyle(graph, cell, isBlur): void {
    const state = graph.view.getState(cell);
    if (state && state.shape) {
      state.style[mxConstants.STYLE_OPACITY] = isBlur ? 60 : 100;
      state.shape.apply(state);
      state.shape.redraw();
    }
  }

  private updateXMLJSON(noConversion): void {
    this.closeMenu();
    if (!this.editor) {
      return;
    }
    const graph = this.editor.graph;
    if (!isEmpty(this.workflow.configuration)) {
      if (noConversion) {
        this.workflowService.checkEmptyObjects(this.workflow.configuration, () => {
          this.updateWorkflow(graph);
        });
      } else {
        this.workflowService.convertTryToRetry(this.workflow.configuration, () => {
          this.updateWorkflow(graph);
        });
      }
    } else {
      this.reloadDummyXml(graph, this.dummyXml);
    }
  }

  private updateWorkflow(graph): void {
    const scrollValue: any = {};
    const element = document.getElementById('graph');
    scrollValue.scrollTop = element.scrollTop;
    scrollValue.scrollLeft = element.scrollLeft;
    scrollValue.scale = graph.getView().getScale();
    graph.getModel().beginUpdate();
    try {
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
      const mapObj = {nodeMap: this.nodeMap};
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
  private reloadDummyXml(graph, xml): void {
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

  private handleWindowEvents(): void {
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
      self.propertyPanelWidth = localStorage.propertyPanelWidth ? parseInt(localStorage.propertyPanelWidth, 10) : 460;
      $('#outlineContainer').css({right: self.propertyPanelWidth + 10 + 'px'});
      $('.graph-container').css({'margin-right': self.propertyPanelWidth + 'px'});
      $('.toolbar').css({'margin-right': (self.propertyPanelWidth - 12) + 'px'});
      $('.sidebar-close').css({right: self.propertyPanelWidth + 'px'});
      $('#property-panel').css({width: self.propertyPanelWidth + 'px'});
      $('.sidebar-open').css({right: '-20px'});
      self.centered();
    });

    $('.sidebar-close', panel).click(() => {
      self.propertyPanelWidth = 0;
      $('#outlineContainer').css({right: '10px'});
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

  private centered(): void {
    if (this.editor && this.editor.graph) {
      setTimeout(() => {
        this.actual();
      }, 200);
    }
  }

  private loadConfig(): void {
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
  private xmlToJsonParser(xml): void {
    if (this.editor) {
      const _graph = this.editor.graph;
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

      const objects = _json.mxGraphModel.root;
      const jsonObj = {
        instructions: []
      };
      let startNode: any = {};
      if (objects.Connection) {
        if (!isArray(objects.Connection)) {
          const _tempCon = clone(objects.Connection);
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
              _temp = clone(objects.Connection[i]);
              objects.Connection.splice(i, 1);
              break;
            }
          }
          if (_temp) {
            objects.Connection.push(_temp);
          }
        }
        const connection = objects.Connection;
        let _jobs = clone(objects.Job);
        let _ifInstructions = clone(objects.If);
        let _forkInstructions = clone(objects.Fork);
        let _forkListInstructions = clone(objects.ForkList);
        let _tryInstructions = clone(objects.Try);
        let _retryInstructions = clone(objects.Retry);
        let _lockInstructions = clone(objects.Lock);
        let _expectNoticeInstructions = clone(objects.ExpectNotice);
        let _postNoticeInstructions = clone(objects.PostNotice);
        let _promptInstructions = clone(objects.Prompt);
        let _fileWatcherInstructions = clone(objects.FileWatcher);
        let _failInstructions = clone(objects.Fail);
        let _finishInstructions = clone(objects.Finish);
        const dummyNodesId = [];
        for (let i in objects.Process) {
          dummyNodesId.push(objects.Process[i]._id);
        }
        for (let i in connection) {
          if (dummyNodesId.indexOf(connection[i].mxCell._source) > -1) {

            continue;
          } else if (dummyNodesId.indexOf(connection[i].mxCell._target) > -1) {
            continue;
          }
          if (_jobs) {
            if (isArray(_jobs)) {
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
            if (isArray(_forkInstructions)) {
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
          if (_forkListInstructions) {
            if (isArray(_forkListInstructions)) {
              for (let j = 0; j < _forkListInstructions.length; j++) {
                if (connection[i].mxCell._target === _forkListInstructions[j]._id) {
                  _forkListInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _forkListInstructions._id) {
                _forkListInstructions = [];
              }
            }
          }
          if (_retryInstructions) {
            if (isArray(_retryInstructions)) {
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
            if (isArray(_lockInstructions)) {
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
            if (isArray(_tryInstructions)) {
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
          if (_expectNoticeInstructions) {
            if (isArray(_expectNoticeInstructions)) {
              for (let j = 0; j < _expectNoticeInstructions.length; j++) {
                if (connection[i].mxCell._target === _expectNoticeInstructions[j]._id) {
                  _expectNoticeInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _expectNoticeInstructions._id) {
                _expectNoticeInstructions = [];
              }
            }
          }
          if (_postNoticeInstructions) {
            if (isArray(_postNoticeInstructions)) {
              for (let j = 0; j < _postNoticeInstructions.length; j++) {
                if (connection[i].mxCell._target === _postNoticeInstructions[j]._id) {
                  _postNoticeInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _postNoticeInstructions._id) {
                _postNoticeInstructions = [];
              }
            }
          }
          if (_promptInstructions) {
            if (isArray(_promptInstructions)) {
              for (let j = 0; j < _promptInstructions.length; j++) {
                if (connection[i].mxCell._target === _promptInstructions[j]._id) {
                  _promptInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _promptInstructions._id) {
                _promptInstructions = [];
              }
            }
          }
          if (_fileWatcherInstructions) {
            if (isArray(_fileWatcherInstructions)) {
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
            if (isArray(_ifInstructions)) {
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
            if (isArray(_failInstructions)) {
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
            if (isArray(_finishInstructions)) {
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
          if (isArray(_jobs) && _jobs.length > 0) {
            startNode = _jobs[0];
          } else {
            startNode = _jobs;
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Job', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_forkInstructions) {
            if (isArray(_forkInstructions) && _forkInstructions.length > 0) {
              startNode = _forkInstructions[0];
            } else {
              startNode = _forkInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Fork', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_forkListInstructions) {
            if (isArray(_forkListInstructions) && _forkListInstructions.length > 0) {
              startNode = _forkListInstructions[0];
            } else {
              startNode = _forkListInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('ForkList', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_lockInstructions) {
            if (isArray(_lockInstructions) && _lockInstructions.length > 0) {
              startNode = _lockInstructions[0];
            } else {
              startNode = _lockInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Lock', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_retryInstructions) {
            if (isArray(_retryInstructions) && _retryInstructions.length > 0) {
              startNode = _retryInstructions[0];
            } else {
              startNode = _retryInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Retry', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_tryInstructions) {
            if (isArray(_tryInstructions) && _tryInstructions.length > 0) {
              startNode = _tryInstructions[0];
            } else {
              startNode = _tryInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Try', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_postNoticeInstructions) {
            if (isArray(_postNoticeInstructions) && _postNoticeInstructions.length > 0) {
              startNode = _postNoticeInstructions[0];
            } else {
              startNode = _postNoticeInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('PostNotice', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_promptInstructions) {
            if (isArray(_promptInstructions) && _promptInstructions.length > 0) {
              startNode = _promptInstructions[0];
            } else {
              startNode = _promptInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Prompt', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_expectNoticeInstructions) {
            if (isArray(_expectNoticeInstructions) && _expectNoticeInstructions.length > 0) {
              startNode = _expectNoticeInstructions[0];
            } else {
              startNode = _expectNoticeInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('ExpectNotice', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_ifInstructions) {
            if (isArray(_ifInstructions) && _ifInstructions.length > 0) {
              startNode = _ifInstructions[0];
            } else {
              startNode = _ifInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('If', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_failInstructions) {
            if (isArray(_failInstructions) && _failInstructions.length > 0) {
              startNode = _failInstructions[0];
            } else {
              startNode = _failInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Fail', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_finishInstructions) {
            if (isArray(_finishInstructions) && _finishInstructions.length > 0) {
              startNode = _finishInstructions[0];
            } else {
              startNode = _finishInstructions;
            }
          }
        }

        if (!isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Finish', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        }
      } else {
        const job = objects.Job;
        const ifIns = objects.If;
        const fork = objects.Fork;
        const forkList = objects.Fork;
        const retry = objects.Retry;
        const lock = objects.Lock;
        const tryIns = objects.Try;
        const expectNoticeIns = objects.ExpectNotice;
        const postNoticeIns = objects.PostNotice;
        const promptIns = objects.Prompt;
        const fileWatcherIns = objects.FileWatcher;
        const fail = objects.Fail;
        const finish = objects.Finish;
        if (job) {
          if (isArray(job)) {
            for (let i = 0; i < job.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Job', job[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Job', job));
          }
        }
        if (ifIns) {
          if (isArray(ifIns)) {
            for (let i = 0; i < ifIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('If', ifIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('If', ifIns));
          }
        }
        if (forkList) {
          if (isArray(forkList)) {
            for (let i = 0; i < forkList.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('ForkList', forkList[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('ForkList', forkList));
          }
        }
        if (fork) {
          if (isArray(fork)) {
            for (let i = 0; i < fork.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Fork', fork[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Fork', fork));
          }
        }
        if (lock) {
          if (isArray(lock)) {
            for (let i = 0; i < lock.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Lock', lock[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Lock', lock));
          }
        }
        if (retry) {
          if (isArray(retry)) {
            for (let i = 0; i < retry.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Retry', retry[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Retry', retry));
          }
        }
        if (tryIns) {
          if (isArray(tryIns)) {
            for (let i = 0; i < tryIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Try', tryIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Try', tryIns));
          }
        }
        if (expectNoticeIns) {
          if (isArray(expectNoticeIns)) {
            for (let i = 0; i < expectNoticeIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('ExpectNotice', expectNoticeIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('ExpectNotice', expectNoticeIns));
          }
        }
        if (postNoticeIns) {
          if (isArray(postNoticeIns)) {
            for (let i = 0; i < postNoticeIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('PostNotice', postNoticeIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('PostNotice', postNoticeIns));
          }
        }
        if (promptIns) {
          if (isArray(promptIns)) {
            for (let i = 0; i < promptIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Prompt', promptIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Prompt', promptIns));
          }
        }
        if (fileWatcherIns) {
          if (isArray(fileWatcherIns)) {
            for (let i = 0; i < fileWatcherIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('FileWatcher', fileWatcherIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('FileWatcher', fileWatcherIns));
          }
        }
        if (fail) {
          if (isArray(fail)) {
            for (let i = 0; i < fail.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Fail', fail[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Fail', fail));
          }
        }
        if (finish) {
          if (isArray(finish)) {
            for (let i = 0; i < finish.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Finish', finish[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Finish', finish));
          }
        }
      }
      if (jsonObj.instructions.length > 0) {
        this.workflow.configuration = this.coreService.clone(jsonObj);
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
    if (isArray(connection)) {
      for (let i = 0; i < connection.length; i++) {
        if (!connection[i].skip && connection[i].mxCell._source && connection[i].mxCell._source === id) {
          const _id = clone(connection[i].mxCell._target);
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
          } else if (connection[i]._type === 'forkList') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'ForkList' && instructions[j].id === id) {
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
              if (isArray(joinInstructions)) {
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
              const arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } if (connection[i]._type === 'endForkList') {
            const endForkListInstructions = objects.EndForkList;
            let _node: any = {};
            if (endForkListInstructions) {
              if (isArray(endForkListInstructions)) {
                for (let x = 0; x < endForkListInstructions.length; x++) {
                  if (endForkListInstructions[x]._id === _id) {
                    _node = endForkListInstructions[x];
                    break;
                  }
                }
              } else {
                if (endForkListInstructions._id === _id) {
                  _node = endForkListInstructions;
                }
              }
            }
            if (_node._targetId) {
              const arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endIf') {
            const endIfInstructions = objects.EndIf;
            let _node: any = {};
            if (endIfInstructions) {
              if (isArray(endIfInstructions)) {
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
              const arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endLock') {
            const endLockInstructions = objects.EndLock;
            let _node: any = {};
            if (endLockInstructions) {
              if (isArray(endLockInstructions)) {
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
              const arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endRetry') {
            const endRetryInstructions = objects.EndRetry;
            let _node: any = {};
            if (endRetryInstructions) {
              if (isArray(endRetryInstructions)) {
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
              const arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endTry') {
            const endTryInstructions = objects.EndTry;
            let _node: any = {};
            if (endTryInstructions) {
              if (isArray(endTryInstructions)) {
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
              const arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
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
        const _id = clone(connection.mxCell._target);
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

  private getNextNode(id, objects, instructionsArr: Array<any>, jsonObj): void {
    const connection = objects.Connection;
    const jobs = objects.Job;
    const ifInstructions = objects.If;
    const endIfInstructions = objects.EndIf;
    const forkInstructions = objects.Fork;
    const joinInstructions = objects.Join;
    const forkListInstructions = objects.ForkList;
    const endForkListInstructions = objects.EndForkList;
    const retryInstructions = objects.Retry;
    const lockInstructions = objects.Lock;
    const endRetryInstructions = objects.EndRetry;
    const endLockInstructions = objects.EndLock;
    const tryInstructions = objects.Try;
    const catchInstructions = objects.Catch;
    const tryEndInstructions = objects.EndTry;
    const expectNoticeInstructions = objects.ExpectNotice;
    const postNoticeInstructions = objects.PostNotice;
    const promptInstructions = objects.Prompt;
    const failInstructions = objects.Fail;
    const finishInstructions = objects.Finish;
    const fileWatcherInstructions = objects.FileWatcher;

    let nextNode: any = {};

    if (jobs) {
      if (isArray(jobs)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Job', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (forkListInstructions) {
        if (isArray(forkListInstructions)) {
          for (let i = 0; i < forkListInstructions.length; i++) {
            if (forkListInstructions[i]._id === id) {
              nextNode = forkListInstructions[i];
              break;
            }
          }
        } else {
          if (forkListInstructions._id === id) {
            nextNode = forkListInstructions;
          }
        }
      }
    }

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('ForkList', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endForkListInstructions) {
        if (isArray(endForkListInstructions)) {
          for (let i = 0; i < endForkListInstructions.length; i++) {
            if (endForkListInstructions[i]._id === id) {
              nextNode = endForkListInstructions[i];
              break;
            }
          }
        } else {
          if (endForkListInstructions._id === id) {
            nextNode = endForkListInstructions;
          }
        }
      }
    }

    if (nextNode && !isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (forkInstructions) {
        if (isArray(forkInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Fork', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (joinInstructions) {
        if (isArray(joinInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (lockInstructions) {
        if (isArray(lockInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Lock', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endLockInstructions) {
        if (isArray(endLockInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (retryInstructions) {
        if (isArray(retryInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Retry', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endRetryInstructions) {
        if (isArray(endRetryInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (expectNoticeInstructions) {
        if (isArray(expectNoticeInstructions)) {
          for (let i = 0; i < expectNoticeInstructions.length; i++) {
            if (expectNoticeInstructions[i]._id === id) {
              nextNode = expectNoticeInstructions[i];
              break;
            }
          }
        } else {
          if (expectNoticeInstructions._id === id) {
            nextNode = expectNoticeInstructions;
          }
        }
      }
    }

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('ExpectNotice', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryInstructions) {
        if (isArray(tryInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Try', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryEndInstructions) {
        if (isArray(tryEndInstructions)) {
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
    if (nextNode && !isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (catchInstructions) {
        if (isArray(catchInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      const arr = this.recursiveFindCatchCell(nextNode, jsonObj.instructions);
      this.findNextNode(connection, nextNode, objects, arr, jsonObj);
      nextNode = null;
    }

    if (nextNode && !isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (ifInstructions) {
        if (isArray(ifInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('If', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endIfInstructions) {
        if (isArray(endIfInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (failInstructions) {
        if (isArray(failInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Fail', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (finishInstructions) {
        if (isArray(finishInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Finish', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (postNoticeInstructions) {
        if (isArray(postNoticeInstructions)) {
          for (let i = 0; i < postNoticeInstructions.length; i++) {
            if (postNoticeInstructions[i]._id === id) {
              nextNode = postNoticeInstructions[i];
              break;
            }
          }
        } else {
          if (postNoticeInstructions._id === id) {
            nextNode = postNoticeInstructions;
          }
        }
      }
    }

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('PostNotice', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (promptInstructions) {
        if (isArray(promptInstructions)) {
          for (let i = 0; i < promptInstructions.length; i++) {
            if (promptInstructions[i]._id === id) {
              nextNode = promptInstructions[i];
              break;
            }
          }
        } else {
          if (promptInstructions._id === id) {
            nextNode = promptInstructions;
          }
        }
      }
    }

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Prompt', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (fileWatcherInstructions) {
        if (isArray(fileWatcherInstructions)) {
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

    if (nextNode && !isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('FileWatcher', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      this.findNextNode(connection, id, objects, instructionsArr, jsonObj);
    }
  }

  private initEditorConf(editor, isXML, callFun): void {
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
        if (index === 13) {
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
         * Function: mouseMove
         *
         * Handles the event by highlighting possible drop targets and updating the
         * preview.
         */
        mxGraphHandler.prototype.mouseMove = function(sender, me) {
          if (!me.isConsumed() && graph.isMouseDown && this.cell != null &&
            this.first != null && this.bounds != null && !this.suspended) {
            // Stops moving if a multi touch event is received
            if (mxEvent.isMultiTouchEvent(me.getEvent())) {
              this.reset();
              return;
            }
            let delta = this.getDelta(me);
            let tol = graph.tolerance;
            if (this.shape != null || this.livePreviewActive || Math.abs(delta.x) > tol || Math.abs(delta.y) > tol) {
              // Highlight is used for highlighting drop targets
              if (this.highlight == null) {
                this.highlight = new mxCellHighlight(this.graph,
                  mxConstants.DROP_TARGET_COLOR, 3);
              }

              let clone = graph.isCloneEvent(me.getEvent()) && graph.isCellsCloneable() && this.isCloneEnabled();
              let gridEnabled = graph.isGridEnabledEvent(me.getEvent());
              let cell = me.getCell();
              let hideGuide = true;
              let target = null;
              this.cloning = clone;

              if (graph.isDropEnabled() && this.highlightEnabled) {
                // Contains a call to getCellAt to find the cell under the mouse
                target = graph.getDropTarget(this.cells, me.getEvent(), cell, clone);
              }

              let state = graph.getView().getState(target);
              var highlight = false;
              if (state != null && (clone || this.isValidDropTarget(target, me))) {
                if (this.target != target) {
                  this.target = target;
                  this.setHighlightColor(mxConstants.DROP_TARGET_COLOR);
                }
                highlight = true;
              } else {
                this.target = null;
              }
              if (self.droppedCell && self.droppedCell.target) {
                if (!target && !cell) {
                  self.droppedCell = null;
                } else if (!self.droppedCell.type) {
                  if (target && cell && target.id !== cell.id) {
                    self.droppedCell.target = cell.id;
                  }
                }
                if (this.cells.length > 0 && cell && this.cells[0].id != cell.id) {
                  if (target && target.id != cell.id) {
                    state = graph.getView().getState(cell);
                  }
                }
              }

              if (state != null && highlight) {
                if (state.cell.value.tagName === 'Connection' || self.workflowService.isInstructionCollapsible(state.cell.value.tagName) || state.cell.value.tagName === 'Catch') {
                  if (state.cell.value.tagName !== 'Connection') {
                    if (state.cell.value.tagName !== 'Fork') {
                      const edges = graph.getOutgoingEdges(state.cell);
                      if ((state.cell.value.tagName !== 'If' && edges.length === 1 && !checkClosingCell(edges[0].target))
                        || (state.cell.value.tagName === 'If' && edges.length === 2)) {
                        this.setHighlightColor('#ff0000');
                      }
                    }
                  }
                } else {
                  this.setHighlightColor('#ff0000');
                }
                this.highlight.highlight(state);
              } else {
                this.highlight.hide();
              }

              if (this.guide != null && this.useGuidesForEvent(me)) {
                delta = this.guide.move(this.bounds, delta, gridEnabled, clone);
                hideGuide = false;
              } else {
                delta = this.graph.snapDelta(delta, this.bounds, !gridEnabled, false, false);
              }

              if (this.guide != null && hideGuide) {
                this.guide.hide();
              }

              // Constrained movement if shift key is pressed
              if (graph.isConstrainedEvent(me.getEvent())) {
                if (Math.abs(delta.x) > Math.abs(delta.y)) {
                  delta.y = 0;
                } else {
                  delta.x = 0;
                }
              }
              this.checkPreview();
              if (this.currentDx != delta.x || this.currentDy != delta.y) {
                this.currentDx = delta.x;
                this.currentDy = delta.y;
                this.updatePreview();
              }
            }
            this.updateHint(me);
            this.consumeMouseEvent(mxEvent.MOUSE_MOVE, me);
            // Cancels the bubbling of events to the container so
            // that the droptarget is not reset due to an mouseMove
            // fired on the container with no associated state.
            mxEvent.consume(me.getEvent());
          } else if ((this.isMoveEnabled() || this.isCloneEnabled()) && this.updateCursor && !me.isConsumed() &&
            (me.getState() != null || me.sourceState != null) && !graph.isMouseDown) {
            let cursor = graph.getCursorForMouseEvent(me);
            if (cursor == null && graph.isEnabled() && graph.isCellMovable(me.getCell())) {
              if (graph.getModel().isEdge(me.getCell())) {
                cursor = mxConstants.CURSOR_MOVABLE_EDGE;
              } else {
                cursor = mxConstants.CURSOR_MOVABLE_VERTEX;
              }
            }
            // Sets the cursor on the original source state under the mouse
            // instead of the event source state which can be the parent
            if (cursor != null && me.sourceState != null) {
              me.sourceState.setCursor(cursor);
            }
          }
        };

        /**
         * Function: createPreviewShape
         *
         * Creates the shape used to draw the preview for the given bounds.
         */
        mxGraphHandler.prototype.createPreviewShape = function(bounds) {
          let shape;
          const selectionCell = graph.getSelectionCell();
          if (selectionCell && selectionCell.id !== this.cell.id) {
            this.cell = selectionCell;
            this.cells = [this.cell];
          }
          self.movedCell = this.cell;
          const originalShape = graph.getView().getState(this.cell).shape;
          this.pBounds = originalShape.bounds;
          if (this.cell.value.tagName === 'Job') {
            shape = new mxLabel(originalShape.bounds, originalShape.fill, originalShape.stroke, originalShape.strokewidth);
            shape.image = originalShape.image;
          } else if (this.cell.value.tagName === 'If' || this.cell.value.tagName.match(/try/)) {
            shape = new mxRhombus(originalShape.bounds, originalShape.fill, originalShape.stroke, originalShape.strokewidth);
          } else {
            shape = new mxImageShape(originalShape.bounds, originalShape.image, originalShape.fill, originalShape.stroke);
          }
          shape.isRounded = originalShape.isRounded;
          shape.gradient = originalShape.gradient;
          shape.boundingBox = originalShape.boundingBox;
          shape.style = originalShape.style;
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
          const style = graph.getStylesheet().getDefaultEdgeStyle();
          style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
          const style2 = graph.getStylesheet().getDefaultEdgeStyle();
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
            if (index === 13) {
              $(this).addClass('disable-link');
            }
          });
        }

        // Defines a new class for all icons
        function mxIconSet(state) {
          this.images = [];
          let img;
          if (state.cell && (state.cell.value.tagName === 'Job' || state.cell.value.tagName === 'Finish' || state.cell.value.tagName === 'Fail' ||
            state.cell.value.tagName === 'ExpectNotice' || state.cell.value.tagName === 'PostNotice' || state.cell.value.tagName === 'Prompt' || self.workflowService.isInstructionCollapsible(state.cell.value.tagName))) {
            img = mxUtils.createImage('./assets/images/menu.svg');
            let x = state.x - (20 * state.shape.scale);
            let y = state.y - (8 * state.shape.scale);
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
              const img = this.images[i];
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
              if (!self.display) {
                if (!self.isCellDragging && !dragStart) {
                  const cell = me.getCell();
                  const selectedCell = graph.getSelectionCell();
                  if (selectedCell && selectedCell.id !== cell.id) {
                    graph.setSelectionCell(cell);
                  }
                }
                self.isCellDragging = true;
                if (self.movedCell) {
                  self.display = true;
                  $('#dropContainer2').show();
                  $('#toolbar-icons').hide();
                }
              }
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

        function detachedInstruction(target, cell): void {
          if (target && target.getAttribute('class') === 'dropContainer' && cell) {
            self.droppedCell = null;
            self.editor.graph.removeCells([cell], null);
          }
          self.display = false;
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
          const cell = me.getCell();
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
              cell.value.tagName === 'ExpectNotice' || cell.value.tagName === 'PostNotice' || cell.value.tagName === 'Prompt') {
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
          const offset = mxUtils.getOffset(_graph.container);
          const origin = mxUtils.getScrollOrigin(_graph.container);
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
            const state = _graph.getView().getState(this.currentDropTarget);
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

            const gridEnabled = this.isGridEnabled() && _graph.isGridEnabledEvent(evt);
            let hideGuide = true;

            // Grid and guides
            if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
              // LATER: HTML preview appears smaller than SVG preview
              const w = parseInt(this.previewElement.style.width, 10);
              const h = parseInt(this.previewElement.style.height, 10);
              const bounds = new mxRectangle(0, 0, w, h);
              let delta = new mxPoint(x, y);
              delta = this.currentGuide.move(bounds, delta, gridEnabled);
              hideGuide = false;
              x = delta.x;
              y = delta.y;
            } else if (gridEnabled) {
              const scale = _graph.view.scale;
              const tr = _graph.view.translate;
              const off = _graph.gridSize / 2;
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
            let title = '';
            let msg = '';
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
                if (drpTargt.value.tagName === 'Job' || drpTargt.value.tagName === 'Finish' || drpTargt.value.tagName === 'Fail'
                  || drpTargt.value.tagName === 'ExpectNotice' || drpTargt.value.tagName === 'PostNotice' || drpTargt.value.tagName === 'Prompt') {
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
                } else if (drpTargt.value.tagName === 'ForkList') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'ForkList' && drpTargt.edges[i].target.value.tagName === 'EndForkList') {
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
                    (drpTargt.source.value.tagName === 'ForkList' && drpTargt.target.value.tagName === 'EndForkList') ||
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
                self.storeJSON();
              }, 10);
            } else {
              movedTarget = drpTargt;
            }

            if (dragElement) {
              if (dragElement.match('paste')) {
                if (self.copyId || (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.TYPE)) {
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
          const model = this.graph.getModel();
          while (parent != null && !this.graph.isValidDropTarget(parent)) {
            parent = model.getParent(parent);
          }
          if (!parent && !isVertexDrop) {
            return null;
          } else {
            isVertexDrop = false;
          }
          parent = (parent != null) ? parent : this.graph.getSwimlaneAt(x, y);
          const scale = this.graph.getView().scale;

          let geo = model.getGeometry(vertex);
          const pgeo = model.getGeometry(parent);

          if (this.graph.isSwimlane(vertex) &&
            !this.graph.swimlaneNesting) {
            parent = null;
          } else if (parent == null && this.swimlaneRequired) {
            return null;
          } else if (parent != null && pgeo != null) {
            // Keeps vertex inside parent
            const state = this.graph.getView().getState(parent);

            if (state != null) {
              x -= state.origin.x * scale;
              y -= state.origin.y * scale;

              if (this.graph.isConstrainedMoving) {
                const width = geo.width;
                const height = geo.height;
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
              if (!self.movedCell) {
                return;
              }
              const tagName = cell.value.tagName;
              if (tagName === 'Connection' || self.workflowService.isInstructionCollapsible(tagName) || tagName === 'Catch') {
                if (tagName === 'Connection') {
                  if (cell.source && cell.target) {
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
                    self.droppedCell = {
                      target: {source: sourceId, target: targetId},
                      cell: self.movedCell,
                      type: cell.value.getAttribute('type')
                    };
                    return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
                  }
                } else {
                  self.droppedCell = {target: cell.id, cell: self.movedCell};
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
                    } else if (cells[0].value.tagName === 'ForkList') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', null), 0, 0, 68, 68, self.workflowService.endForkList);
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
                        if ((cell.target && ((_sourCellName === 'Job' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'PostNotice' || _sourCellName === 'Prompt' || _sourCellName === 'ExpectNotice') &&
                          (_tarCellName === 'Job' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'PostNotice' || _tarCellName === 'Prompt' || _tarCellName === 'ExpectNotice')))) {
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
        graph.getSelectionModel().addListener(mxEvent.CHANGE, function(evt) {
          let cell;
          if (evt.cells && evt.cells.length > 0) {
            cell = evt.cells[0];
          }
          if (cell && (checkClosingCell(cell) ||
            cell.value.tagName === 'Connection' || cell.value.tagName === 'Finish' || cell.value.tagName === 'Process' || cell.value.tagName === 'Catch')) {
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
                delete json.instructions;
                delete json.id;
              }
              break;
            }

            if (json.instructions[x].instructions) {
              iterateJson(json.instructions[x], cell, '');
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.id == cell.id) {
                delete json.instructions[x].catch;
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
                  /*                  if (json.instructions[x].branches.length === 0) {
                                      delete json.instructions[x].branches;
                                      break;
                                    }*/
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
      const obj = {firstCell: null, lastCell: null, ids: [], invalid: false};
      if (cells.length === 2) {
        if (!checkClosedCellWithSourceCell(cells[0], cells[1])) {
          const x = graph.getEdgesBetween(cells[0], cells[1]);
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
          (sourName === 'Catch' && tarName === 'EndTry')) || (sourName === 'Retry' && tarName === 'EndRetry') ||
        (sourName === 'ForkList' && tarName === 'EndForkList') || (sourName === 'Lock' && tarName === 'EndLock');
    }

    /**
     * Function: Check closing cell
     * @param cell
     */
    function checkClosingCell(cell) {
      return cell.value.tagName === 'Join' || cell.value.tagName === 'EndIf' || cell.value.tagName === 'EndForkList' ||
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
              if (cell.edges[i].target && cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source && cell.edges[i].source.id === cell.id) {
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
              if (cells.lastCell.edges[i].source && cells.lastCell.edges[i].source.id === cells.lastCell.id) {
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
      } else if (cellName === 'ForkList') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', parentCell.id), 0, 0, 68, 68, self.workflowService.endForkList);
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target && cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source && cell.edges[i].source.id === cell.id) {
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
              if (cells.lastCell.edges[i].source && cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('forkList'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('endForkList'), _middle, v2);
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
     */
    function connectExtraNodes(v1, v2, parent, _sour, _tar): void {
      let l1 = '', l2 = '';
      if (_sour && _sour.value) {
        const attrs = clone(_sour.value.attributes);
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName === 'type') {
              l1 = attrs[i].nodeValue;
            }
          }
        }
      }

      if (_tar && _tar.value) {
        const attrs2 = clone(_tar.value.attributes);
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
     * Get end node of If/Fork/Try/Retry/Lock/ForkList
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
          } else if (self.selectedNode.type === 'ForkList') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'children', self.selectedNode.newObj.children);
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'childToId', self.selectedNode.newObj.childToId);
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
              obj.cell, 'lockName', self.selectedNode.newObj.lockName);
            graph.getModel().execute(edit2);
          } else if (self.selectedNode.type === 'Fail') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'outcome', JSON.stringify(self.selectedNode.newObj.outcome));
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'message', self.selectedNode.newObj.message);
            graph.getModel().execute(edit2);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'uncatchable', self.selectedNode.newObj.uncatchable);
            graph.getModel().execute(edit3);
          } else if (self.selectedNode.type === 'ExpectNotice' || self.selectedNode.type === 'PostNotice') {
            const edit1 = new mxCellAttributeChange(
              obj.cell, 'boardName', self.selectedNode.newObj.boardName);
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
          } else if (self.selectedNode.type === 'Prompt') {
            self.coreService.addSlashToString(self.selectedNode.newObj, 'question');
            const edit = new mxCellAttributeChange(
              obj.cell, 'question', self.selectedNode.newObj.question);
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
    function selectionChanged(): void {
      if (self.selectedNode && self.permission.joc.inventory.manage) {
        self.cutOperation();
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
        if (isEqual(JSON.stringify(self.selectedNode.newObj), JSON.stringify(self.selectedNode.actualValue))) {
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
              const job = self.coreService.clone(self.selectedNode.job);
              delete job.jobName;
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
              if (job.executable.returnCodeMeaning && !isEmpty(job.executable.returnCodeMeaning)) {
                if (job.executable.returnCodeMeaning.success && typeof job.executable.returnCodeMeaning.success == 'string') {
                  job.executable.returnCodeMeaning.success = job.executable.returnCodeMeaning.success.split(',').map(Number);
                  delete job.executable.returnCodeMeaning.failure;
                } else if (job.executable.returnCodeMeaning.failure && typeof job.executable.returnCodeMeaning.failure == 'string') {
                  job.executable.returnCodeMeaning.failure = job.executable.returnCodeMeaning.failure.split(',').map(Number);
                  delete job.executable.returnCodeMeaning.success;
                }
                if (job.executable.returnCodeMeaning.failure === '') {
                  delete job.executable.returnCodeMeaning.failure;
                }
                if (job.executable.returnCodeMeaning.success === '' && !job.executable.returnCodeMeaning.failure) {
                  job.executable.returnCodeMeaning = {};
                }
              }
              if (job.executable && isEmpty(job.executable.login)) {
                delete job.executable.login;
              }
              if (!job.defaultArguments || typeof job.defaultArguments === 'string' || job.defaultArguments.length === 0) {
                delete job.defaultArguments;
              }
              if (job.executable && (!job.executable.arguments || typeof job.executable.arguments === 'string' || job.executable.arguments.length === 0)) {
                delete job.executable.arguments;
              }
              if (job.executable && (!job.executable.jobArguments || typeof job.executable.jobArguments === 'string' || job.executable.jobArguments.length === 0)) {
                delete job.executable.jobArguments;
              }
              if (job.executable && (!job.executable.env || typeof job.executable.env === 'string' || job.executable.env.length === 0)) {
                delete job.executable.env;
              }
              if (job.executable.returnCodeMeaning) {
                if (job.executable.returnCodeMeaning && job.executable.returnCodeMeaning.success == '0') {
                  delete job.executable.returnCodeMeaning;
                }
              }
              if (!isEqual(JSON.stringify(_job), JSON.stringify(job))) {
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
          if (!obj.defaultArguments || isEmpty(obj.defaultArguments) || typeof obj.defaultArguments !== 'string') {
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
        } else if (cell.value.tagName === 'ForkList') {
          obj.children = cell.getAttribute('children');
          obj.childToId = cell.getAttribute('childToId');
        } else if (cell.value.tagName === 'Lock') {
          obj.count = cell.getAttribute('count');
          if (obj.count) {
            obj.count = parseInt(obj.count, 10);
          }
          obj.lockName = cell.getAttribute('lockName');
          obj.countProperty = obj.count ? 'shared' : 'exclusive';
        } else if (cell.value.tagName === 'Fail') {
          let outcome = cell.getAttribute('outcome');
          if (!outcome) {
            outcome = {
              returnCode: 0
            };
          } else {
            outcome = JSON.parse(outcome);
          }
          obj.outcome = outcome;
          obj.message = cell.getAttribute('message');
          obj.uncatchable = cell.getAttribute('uncatchable');
          obj.uncatchable = obj.uncatchable == 'true';
        } else if (cell.value.tagName === 'FileWatcher') {
          obj.directory = cell.getAttribute('directory');
          obj.regex = cell.getAttribute('regex');
        } else if (cell.value.tagName === 'ExpectNotice' || cell.value.tagName === 'PostNotice') {
          obj.boardName = cell.getAttribute('boardName');
          const timeout = cell.getAttribute('timeout');
          if (timeout && timeout != 'null' && timeout != 'undefined') {
            obj.timeout1 = self.workflowService.convertDurationToString(timeout);
          }
          obj.joinVariables = cell.getAttribute('joinVariables');
          obj.joinVariables = obj.joinVariables == 'true';
          obj.predicate = cell.getAttribute('predicate');
          obj.match = cell.getAttribute('match');
        } else if (cell.value.tagName === 'Prompt') {
          obj.question = cell.getAttribute('question');
          self.coreService.removeSlashToString(obj, 'question');
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
          obj, cell,
          job,
          actualValue: self.coreService.clone(obj)
        };
        if (cell.value.tagName === 'Lock') {
          self.getLimit();
        } else if (cell.value.tagName === 'ForkList') {
          self.getListOfVariables(obj);
        }
      }
      self.ref.detectChanges();
    }

    /**
     * Funtion: paste the instruction to given target
     */
    function pasteInstruction(target): void {
      let source = target.id;
      if (target.value.tagName === 'Connection') {
        if (checkClosingCell(target.source)) {
          source = target.source.value.getAttribute('targetId');
        } else {
          source = target.source.id;
        }
      }

      let copyObject: any, targetObject: any, targetIndex = 0, isCatch = false;
      if (!self.copyId) {
        copyObject = self.coreService.clone(self.inventoryConf.copiedInstuctionObject);
        delete copyObject.jobObject;
      }

      function getObject(json) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (copyObject && targetObject) {
              break;
            }
            if (json.instructions[x].uuid == self.copyId) {
              copyObject = self.coreService.clone(json.instructions[x]);
              delete copyObject.uuid;
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
        } else if (target.value.tagName === 'ForkList') {
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
        if (copyObject.id) {
          setTimeout(() => {
            graph.setSelectionCell(graph.getModel().getCell(copyObject.id));
            customizedChangeEvent();
          }, 0);
        }
      }
    }

    function checkCopyName(jobName): string {
      let str = jobName;
      const jobs = JSON.parse((JSON.stringify(self.jobs)));

      function recursivelyCheck(name) {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i].name == name) {
            let tName;
            if (name.match(/_copy_[0-9]+/)) {
              const arr = name.split('copy_');
              let num = arr[arr.length - 1];
              num = parseInt(num, 10) || 0;
              tName = name.substring(0, name.lastIndexOf('_copy')) + '_copy' + '_' + (num + 1);
            } else {
              tName = name + '_copy_1';
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
      let newName;
      let flag = true;
      newName = checkCopyName(name);
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
        if (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.jobName === name) {
          job = {name: newName, value: self.inventoryConf.copiedInstuctionObject.jobObject};
        }
        if (!job.name) {
          job = {name: newName, value: {}};
        }
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
              json.instructions[x].label = json.instructions[x].jobName;
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
        copyObject.label = copyObject.jobName;
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
      } else if (copyObject.TYPE === 'Retry' || copyObject.TYPE === 'Try' || copyObject.TYPE === 'Lock' || copyObject.TYPE === 'ForkList') {
        recursion(copyObject);
      }
    }

    function customizedChangeEvent() {
      const cell = graph.getSelectionCell();
      const cells = graph.getSelectionCells();
      if (cells.length > 0) {
        const lastCell = cells[cells.length - 1];
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
          (cells[0].value.tagName === 'ForkList' && cells[1].value.tagName === 'EndForkList') ||
          (cells[0].value.tagName === 'Try' && cells[1].value.tagName === 'EndTry')) {
          selectionChanged();
        }

      }
    }

    /**
     * Function: Check and create clicked instructions
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
        } else if (title.match('fork-list')) {
          _node = doc.createElement('ForkList');
          _node.setAttribute('label', 'forkList');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.forkList);
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
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.lock);
        } else if (title.match('try')) {
          _node = doc.createElement('Try');
          _node.setAttribute('label', 'try');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'try');
        } else if (title.match('await')) {
          _node = doc.createElement('ExpectNotice');
          _node.setAttribute('label', 'expectNotice');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.expectNotice);
        } else if (title.match('publish')) {
          _node = doc.createElement('PostNotice');
          _node.setAttribute('label', 'postNotice');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.postNotice);
        } else if (title.match('prompt')) {
          _node = doc.createElement('Prompt');
          _node.setAttribute('label', 'prompt');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.prompt);
        } else if (title.match('fileWatcher')) {
          _node = doc.createElement('FileWatcher');
          _node.setAttribute('label', 'fileWatcher');
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
            } else if (clickedCell.value.tagName === 'ForkList') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', null), 0, 0, 68, 68, self.workflowService.endForkList);
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
                if ((targetCell.target && ((_sourCellName === 'Job' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'PostNotice' || _sourCellName === 'Prompt' || _sourCellName === 'ExpectNotice') &&
                  (_tarCellName === 'Job' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'PostNotice' || _tarCellName === 'Prompt' || _tarCellName === 'ExpectNotice')))) {
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
            const e1 = graph.insertEdge(defaultParent, null, getConnectionNode(label), clickedCell, targetCell.target);
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
          if (tagName === 'Job' || tagName === 'Finish' || tagName === 'Fail' || tagName === 'ExpectNotice' || tagName === 'PostNotice' || tagName === 'Prompt') {
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
          } else if (tagName === 'ForkList') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'ForkList' && targetCell.edges[i].target.value.tagName === 'EndForkList') {
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
              (targetCell.source.value.tagName === 'ForkList' && targetCell.target.value.tagName === 'EndForkList') ||
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
          const label = branchs[i].getAttribute('label');
          if (label) {
            const arr = label.match(/\d+/);
            const count = (arr && arr.length > 0) ? arr[0] : 0;
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
        if (_dropTarget.edges[i].source && _dropTarget.edges[i].source.id === _dropTarget.id) {
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
          if (_dropTarget.edges[i].target && _dropTarget.edges[i].target.id !== _dropTarget.id && _dropTarget.edges[i].target.value.tagName !== 'EndIf') {
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
      } else if (dropTargetName === 'ForkList') {
        label = 'forkList';
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
        } else if (cell.value.tagName === 'ForkList') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', cell.id), 0, 0, 68, 68, self.workflowService.endForkList);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Try') {
          v2 = graph.insertVertex(cell, null, getCellNode('Catch', 'catch', cell.id), 0, 0, 100, 40, 'dashRectangle');
          v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', cell.id), 0, 0, 75, 75, 'try');
          graph.insertEdge(parent, null, getConnectionNode('try'), cell, v2);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
          graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
        }
        if (self.workflowService.isInstructionCollapsible(dropTargetName) || dropTargetName === 'Catch') {
          _label = dropTargetName === 'Fork' ? 'join' : dropTargetName === 'Retry' ? 'endRetry' : dropTargetName === 'Lock' ? 'endLock' : dropTargetName === 'ForkList' ? 'endForkList' : dropTargetName === 'Catch' ? 'catch' : dropTargetName === 'If' ? 'endIf' : 'try';
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
        } else if (dropTargetName === 'ForkList') {
          checkLabel = 'EndForkList';
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
              const _label = checkLabel === 'Join' ? 'join' :  checkLabel === 'EndForkList' ? 'endForkList' : checkLabel === 'EndIf' ? 'endIf' : checkLabel === 'EndRetry'
                ? 'endRetry' : checkLabel === 'EndLock' ? 'endLock' : 'endTry';
              if (cell.value.tagName !== 'Fork' && cell.value.tagName !== 'If' && cell.value.tagName !== 'Try' && cell.value.tagName !== 'Retry' && cell.value.tagName !== 'Lock' && cell.value.tagName !== 'ForkList' && cell.value.tagName !== 'Catch') {
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
        const sourceObj = source.instructions[sourceIndex];
        const targetObj = target.instructions[targetIndex];
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
            let title = '';
            let msg = '';
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
        } else if (targetObj.TYPE === 'ForkList') {
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
          if (!isEqual(tempJson, JSON.stringify(self.workflow.configuration))) {
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
     */
    function rearrangeCell(obj) {
      const connection = obj.target;
      const droppedCell = obj.cell;
      if (connection.source === droppedCell.id || connection.target === droppedCell.id ||
        connection === droppedCell.id) {
        self.updateXMLJSON(true);
        return;
      } else {
        let dropObject: any, targetObject: any, index = 0, targetIndex = 0, isCatch = false;
        const source = connection.source || connection;
        const tempJson = JSON.stringify(self.workflow.configuration);

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
        const booleanObj = {
          isMatch: false
        };
        if (targetObject && dropObject) {
          if (targetObject.instructions) {
            const sourceObj = dropObject.instructions[index];
            const targetObj = targetObject.instructions[targetIndex];
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
              } else if (targetObj.TYPE === 'ForkList') {
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
            delete dropObject.instructions;
          }

          self.updateXMLJSON(true);
        }
      }
    }

    if (callFun) {
      selectionChanged();
    }
  }

  private getObject(mainJson): any {
    const self = this;
    let obj: any = {};

    function recursion(json): void {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].uuid == self.copyId) {
            obj = self.coreService.clone(json.instructions[x]);
          }
          if (json.instructions[x].instructions) {
            recursion(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursion(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then) {
            recursion(json.instructions[x].then);
          }
          if (json.instructions[x].else) {
            recursion(json.instructions[x].else);
          }
          if (json.instructions[x].branches) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              recursion(json.instructions[x].branches[i]);
            }
          }
        }
      }
    }

    recursion(mainJson);
    return obj;
  }

  private cutOperation(): void {
    const copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    if (copiedParamObjects.operation === 'CUT' && this.selectedNode.job.jobName === copiedParamObjects.name && copiedParamObjects.data && copiedParamObjects.data.length > 0) {
      let obj;
      if (copiedParamObjects.type === 'arguments') {
        obj = this.selectedNode.job.executable;
      } else if (copiedParamObjects.type === 'jobArguments') {
        obj = this.selectedNode.job.executable;
      } else if (copiedParamObjects.type === 'env') {
        obj = this.selectedNode.job.executable;
      } else if (copiedParamObjects.type === 'nodeArguments') {
        obj = this.selectedNode.obj;
      } else {
        obj = this.selectedNode.job;
      }
      if (obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] && obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type].length > 0) {
        obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] = obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] = obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] = obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type].filter(item => {
          let flag = true;
          for (const i in copiedParamObjects.data) {
            if (copiedParamObjects.data[i]) {
              if (copiedParamObjects.data[i].name === item.name && copiedParamObjects.data[i].value === item.value) {
                flag = false;
                break;
              }
            }
          }
          return flag;
        });
      }
    }
  }

  private updateJobProperties(data): boolean {
    const job = this.coreService.clone(data.job);
    if (!job.executable) {
      return false;
    }
    if (isEmpty(job.executable.login)) {
      delete job.executable.login;
    }
    if (job.executable.returnCodeMeaning) {
      if (job.executable.returnCodeMeaning && job.executable.returnCodeMeaning.success == '0') {
        delete job.executable.returnCodeMeaning;
      } else {
        if (job.executable.returnCodeMeaning.succes && typeof job.executable.returnCodeMeaning.success == 'string') {
          job.executable.returnCodeMeaning.success = job.executable.returnCodeMeaning.success.split(',').map(Number);
          delete job.executable.returnCodeMeaning.failure;
        } else if (job.executable.returnCodeMeaning.failure && typeof job.executable.returnCodeMeaning.failure == 'string') {
          job.executable.returnCodeMeaning.failure = job.executable.returnCodeMeaning.failure.split(',').map(Number);
          delete job.executable.returnCodeMeaning.success;
        } else if (job.executable.returnCodeMeaning.failure == 0) {
          job.executable.returnCodeMeaning.failure = [0];
          delete job.executable.returnCodeMeaning.success;
        }
      }
    }

    if (!job.executable.v1Compatible) {
      if (job.executable.TYPE === 'ShellScriptExecutable') {
        job.executable.v1Compatible = false;
      } else {
        delete job.executable.v1Compatible;
      }
    }
    if (job.defaultArguments) {
      if (job.executable.v1Compatible && job.executable.TYPE === 'ShellScriptExecutable') {
        job.defaultArguments.filter((argu) => {
          this.coreService.addSlashToString(argu, 'value');
        });
        this.coreService.convertArrayToObject(job, 'defaultArguments', true);
      } else {
        delete job.defaultArguments;
      }
    }
    if (job.executable.arguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        if (job.executable.arguments && isArray(job.executable.arguments)) {
          job.executable.arguments.filter((argu) => {
            this.coreService.addSlashToString(argu, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'arguments', true);
        }
      } else {
        delete job.executable.arguments;
      }
    }
    if (job.executable.jobArguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        if (job.executable.jobArguments && isArray(job.executable.jobArguments)) {
          job.executable.jobArguments.filter((argu) => {
            this.coreService.addSlashToString(argu, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'jobArguments', true);
        }
      } else {
        delete job.executable.jobArguments;
      }
    }
    if (job.executable.TYPE === 'InternalExecutable') {
      delete job.executable.script;
      delete job.executable.login;
    } else if (job.executable.TYPE === 'ShellScriptExecutable') {
      delete job.executable.className;
    }

    if (job.executable.env) {
      if (job.executable.TYPE === 'ShellScriptExecutable') {
        if (job.executable.env && isArray(job.executable.env)) {
          job.executable.env.filter((env) => {
            this.coreService.addSlashToString(env, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'env', true);
        }
      } else {
        delete job.executable.env;
      }
    }

    if (!job.parallelism) {
      job.parallelism = 0;
    }
    if (job.timeout1) {
      job.timeout = this.workflowService.convertStringToDuration(job.timeout1);
    } else {
      delete job.timeout;
    }
    if (job.graceTimeout1) {
      job.graceTimeout = this.workflowService.convertStringToDuration(job.graceTimeout1);
    } else {
      delete job.graceTimeout;
    }
    if (job.warnIfShorter1) {
      job.warnIfShorter = this.workflowService.convertStringToDuration(job.warnIfShorter1);
    } else {
      delete job.warnIfShorter;
    }
    if (job.warnIfLonger1) {
      job.warnIfLonger = this.workflowService.convertStringToDuration(job.warnIfLonger1);
    } else {
      delete job.warnIfLonger;
    }
    delete job.timeout1;
    delete job.graceTimeout1;
    delete job.warnIfShorter1;
    delete job.warnIfLonger1;
    let flag = true;
    let isChange = true;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === job.jobName) {
        flag = false;
        delete job.jobName;
        if (this.jobs[i].value.executable.returnCodeMeaning) {
          if (this.jobs[i].value.executable.TYPE === 'ShellScriptExecutable') {
            if (typeof this.jobs[i].value.executable.returnCodeMeaning.success == 'string') {
              this.jobs[i].value.executable.returnCodeMeaning.success = this.jobs[i].value.executable.returnCodeMeaning.success.split(',').map(Number);
            }
          } else {
            delete this.jobs[i].value.executable.returnCodeMeaning;
          }
        }
        if (!isEqual(JSON.stringify(job), JSON.stringify(this.jobs[i].value))) {
          this.jobs[i].value = job;
        } else {
          if (isEqual(JSON.stringify(data.newObj), JSON.stringify(data.actualValue))) {
            isChange = false;
          }
        }
      }
    }
    if (flag) {
      delete job.jobName;
      this.jobs.push({name: data.job.jobName, value: job});
    }
    return isChange;
  }

  private updateJobs(graph, isFirst): void {
    if (!graph) {
      return;
    }
    const enc = new mxCodec();
    const node = enc.encode(graph.getModel());
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
      const tempJobs = [];
      if (isArray(vertices)) {
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
      if (index === 13) {
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

  private modifyJSON(mainJson, isValidate, isOpen): boolean {
    if (isEmpty(mainJson)) {
      return false;
    }
    let checkErr = false;
    let isJobExist = false;
    const self = this;
    let flag = true;
    const ids = new Map();
    const labels = new Map();

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
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].lockName) {

            } else {
              if (json.instructions[x].count === '' || json.instructions[x].count === 'undefined') {
                delete json.instructions[x].count;
              }
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = !json.instructions[x].lockName ? 'workflow.message.lockNameIsMissing' : 'workflow.message.invalidLockInstruction';
                if (isOpen) {
                  if (!json.instructions[x].lockName) {
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

          if (json.instructions[x].TYPE === 'ForkList') {
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].children) {

            } else {
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = !json.instructions[x].children ? 'workflow.message.childrenIsMissing' : 'workflow.message.invalidForkListInstruction';
                if (isOpen) {
                  if (!json.instructions[x].children) {
                    self.openSideBar(json.instructions[x].id);
                  } else {
                    let msg = '';
                    self.translate.get('workflow.message.invalidForkListInstruction').subscribe(translatedValue => {
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

          if (json.instructions[x].TYPE === 'ExpectNotice') {
            flag = self.workflowService.validateFields(json.instructions[x], 'ExpectNotice');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidExpectNoticeInstruction';
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(json.instructions[x].id);
              }
              return;
            }
          }

          if (json.instructions[x].TYPE === 'PostNotice') {
            flag = self.workflowService.validateFields(json.instructions[x], 'PostNotice');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidPostNoticeInstruction';
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
                delete branch.instructions;
                return (branch.workflow.instructions && branch.workflow.instructions.length > 0);
              });
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].workflow) {
                  recursive(json.instructions[x].branches[i].workflow);
                }
              }
            } else {
              json.instructions[x].branches = [];
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
            const countObj = clone(json.instructions[x].count);
            delete json.instructions[x].instructions;
            delete json.instructions[x].count;
            json.instructions[x].count = countObj;
          }
          if (json.instructions[x].TYPE === 'ForkList') {
            const childrenObj = clone(json.instructions[x].children);
            const childToIdObj = clone(json.instructions[x].childToId);
            delete json.instructions[x].children;
            delete json.instructions[x].childToId;
            json.instructions[x].children = childrenObj;
            json.instructions[x].childToId = childToIdObj;
            json.instructions[x].workflow = {
              instructions: json.instructions[x].instructions
            };
            delete json.instructions[x].instructions;
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
              delete json.instructions[x].else;
            }
          }
        }
      }
    }

    recursive(mainJson);
    if (!this.error || !isValidate) {
      if (isJobExist) {
        if (this.jobs.length === 0) {
          checkErr = true;
        } else {
          for (let n = 0; n < this.jobs.length; n++) {
            flag = self.workflowService.validateFields(this.jobs[n].value, 'Job');
            if (!flag) {
              checkErr = true;
              if (this.jobs[n].value.executable.TYPE === 'ShellScriptExecutable' && !this.jobs[n].value.executable.script) {
                this.invalidMsg = 'workflow.message.scriptIsMissing';
              } else if (this.jobs[n].value.executable.TYPE === 'InternalExecutable' && !this.jobs[n].value.executable.className) {
                this.invalidMsg = 'workflow.message.classNameIsMissing';
              } else if (!this.jobs[n].value.agentName) {
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
    if (mainJson.instructions && (!this.error || !isValidate)) {
      delete mainJson.id;
      mainJson.jobs = this.coreService.keyValuePair(this.jobs);
    }
    if (this.error || checkErr) {
      flag = false;
    }
    if (flag) {
      this.invalidMsg = '';
    }
    return flag;
  }

  private validateByURL(json): void {
    const obj = clone(json);
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      if (!this.invalidMsg && res.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
      this.workflow.valid = res.valid;
      this.ref.detectChanges();
    }, () => {
    });
  }

  private validatePredicate(predicate, id, isOpen): void {
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
    for (const prop in data.jobs) {
      if (data.jobs[prop] && data.jobs[prop].executable) {
        if (data.jobs[prop].executable.env && isArray(data.jobs[prop].executable.env)) {
          data.jobs[prop].executable.env = data.jobs[prop].executable.env.filter((env) => {
            if (env.value) {
              if (!(/[$_+]/.test(env.value))) {
                const startChar = env.value.substring(0, 1),
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
            delete data.jobs[prop].executable.env;
          }
        }
      }
    }
  }

  private saveJSON(noValidate): void {
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

    if (this.workflow.actual && !isEqual(this.workflow.actual, JSON.stringify(data)) && !this.isStore) {
      this.isStore = true;
      this.storeData(data);
    }
  }

  onChangeJobResource(value): void {
    if (!isEqual(JSON.stringify(this.jobResourceNames), JSON.stringify(value))) {
      this.jobResourceNames = value;
      const data = JSON.parse(this.workflow.actual);
      this.storeData(data);
    }
  }

  updateOtherProperties(type): void {
    let flag = false;
    if (type === 'title') {
      if (!this.title) {
        this.title = '';
      }
      if (!this.extraConfiguration.title) {
        this.extraConfiguration.title = '';
      }
      if (this.title !== this.extraConfiguration.title) {
        this.title = this.extraConfiguration.title;
        flag = true;
      }
    } else if (type === 'documentation') {
      if (this.documentationName !== this.extraConfiguration.documentationName) {
        this.documentationName = this.extraConfiguration.documentationName;
        flag = true;
      }
    } else if (type === 'variable') {
      const variableDeclarations = {parameters: []};
      let temp = this.coreService.clone(this.variableDeclarations.parameters);
      variableDeclarations.parameters = temp.filter((value) => {
        if (value.value.type === 'List' || value.value.type === 'Final' || value.value.default === '' || !value.value.default) {
          delete value.value.default;
        }
        if (value.value.type === 'List') {
          delete value.value.final;
          value.value.listParameters = this.coreService.keyValuePair(value.value.listParameters);
        } else if (value.value.type === 'Final') {
          delete value.value.type;
        } else {
          delete value.value.final;
          if (value.value.type === 'String') {
            this.coreService.addSlashToString(value.value, 'default');
          }
        }
        return !!value.name;
      });
      variableDeclarations.parameters = this.coreService.keyValuePair(variableDeclarations.parameters);
      if (variableDeclarations.parameters && isEmpty(variableDeclarations.parameters)) {
        delete variableDeclarations.parameters;
      }
      this.orderPreparation = variableDeclarations;
      //this.orderPreparation.allowUndeclared = this.variableDeclarations.allowUndeclared;
      flag = true;
    }
    if (flag) {
      const data = JSON.parse(this.workflow.actual);
      this.storeData(data);
    }
  }

  private extendJsonObj(data): any {
    let newObj: any = {};
    newObj = extend(newObj, data);
    if (this.orderPreparation) {
      newObj.orderPreparation = this.orderPreparation;
    }
    if (this.jobResourceNames) {
      newObj.jobResourceNames = this.jobResourceNames;
    }
    if (this.title) {
      newObj.title = this.title;
    }
    if (this.documentationName) {
      newObj.documentationName = this.documentationName;
    }
    return newObj;
  }

  private storeData(data): void {
    if (this.isTrash || !this.workflow || !this.workflow.id || !this.permission.joc.inventory.manage) {
      return;
    }
    const newObj = this.extendJsonObj(data);
    if (this.history.past.length === 20) {
      this.history.past.shift();
    }
    if (this.history.type === 'new') {
      this.history = {
        // push previous present into past for undo
        past: [this.history.present, ...this.history.past],
        present: JSON.stringify(newObj),
        future: [], // clear future
        type: 'new'
      };
    } else {
      this.history.type = 'new';
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
        this.ref.detectChanges();
      }
    }, (err) => {
      this.isStore = false;
      console.error(err);
    });
  }
}
