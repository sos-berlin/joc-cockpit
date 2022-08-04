import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {clone, isArray, isEmpty, isEqual} from 'underscore';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService} from "ng-zorro-antd/message";
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {WorkflowService} from "../../../../services/workflow.service";
import {InventoryService} from '../inventory.service';
import {InventoryObject} from '../../../../models/enums';
import {FacetEditorComponent} from "../workflow/workflow.component";
import {ValueEditorComponent} from '../../../../components/value-editor/value.component';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';

@Component({
  selector: 'app-jobs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jobs.component.html'
})
export class JobsComponent implements OnChanges, OnDestroy {
  @Input() permission: any;
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  job: any = {};
  invalidMsg: string;
  objectType = InventoryObject.JOB;
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  isRuntimeVisible = false;
  jobResourcesTree = [];
  isLengthExceed = false;
  selectedNode: any = {};
  returnCodes: any = {on: 'success'};
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
    setOfCheckedParam: new Set<string>(),
  };
  cmOption: any = {
    lineNumbers: true,
    autoRefresh: true,
    scrollbarStyle: 'simple',
    mode: 'shell',
    extraKeys: {'Ctrl-Space': 'autocomplete'}
  };
  lastModified: any = '';
  copiedParamObjects: any = {};
  allowedDatatype = ['String', 'Number', 'Boolean'];

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private dataService: DataService, private router: Router, private translate: TranslateService,
              private modal: NzModalService, private ref: ChangeDetectorRef, private message: NzMessageService,
              public inventoryService: InventoryService, private workflowService: WorkflowService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.job.actual) {
          if (this.data.released !== this.job.released || this.data.valid !== this.job.valid) {
            this.reset();
          }
          this.ref.detectChanges();
        }
      }
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'REDO') {
        this.redo();
      } else if (res === 'UNDO') {
        this.undo();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.copyObj && !changes.data) {
      return;
    }
    if (changes.reload) {
      if (changes.reload.previousValue === true && changes.reload.currentValue === false) {
        return;
      }
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.job.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.job = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    if (this.job.name) {
      this.saveJSON();
    }
  }

  private getObject(): void {
    this.copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
    }).subscribe((res: any) => {
      this.lastModified = res.configurationDate;
      this.history = [];
      this.indexOfNextAdd = 0;
      this.returnCodes = {on: 'success'};
      this.getDocumentations();

      this.reset();
      if (res.configuration) {
        delete res.configuration.TYPE;
        delete res.configuration.path;
        delete res.configuration.version;
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }
      if (this.data.released !== res.released) {
        this.data.released = res.released;
      }
      if (this.data.valid !== res.valid) {
        this.data.valid = res.valid;
      }

      this.job = res;
      this.job.path1 = this.data.path;
      this.job.name = this.data.name;
      this.setJobProperties();
      if (this.jobResourcesTree.length === 0) {
        this.getJobResources();
      } else {
        this.jobResourcesTree = this.coreService.getNotExistJobResource({
          arr: this.jobResourcesTree,
          jobResources: this.job.configuration.jobResourceNames
        });
      }
      this.job.actual = JSON.stringify(res.configuration);
      this.history.push(this.job.actual);
      if (!res.valid) {
        this.validateJSON(res.configuration);
      } else {
        this.invalidMsg = '';
      }
      this.ref.detectChanges();
    });

  }

  private setJobProperties(): void {
    if (!this.job.configuration.parallelism) {
      this.job.configuration.parallelism = 1;
    }
    if (!this.job.configuration.executable || !this.job.configuration.executable.TYPE) {
      this.job.configuration.executable = {
        TYPE: 'ShellScriptExecutable',
        script: '',
        login: {},
        env: []
      };
    }
    if (this.job.configuration.executable.TYPE === 'ScriptExecutable') {
      this.job.configuration.executable.TYPE = 'ShellScriptExecutable';
    }

    if (!this.job.configuration.executable.returnCodeMeaning) {
      this.job.configuration.executable.returnCodeMeaning = {
        success: 0
      };
    } else {
      if (this.job.configuration.executable.returnCodeMeaning.success) {
        this.job.configuration.executable.returnCodeMeaning.success = this.job.configuration.executable.returnCodeMeaning.success.toString();
      } else if (this.job.configuration.executable.returnCodeMeaning.failure) {
        this.job.configuration.executable.returnCodeMeaning.failure = this.job.configuration.executable.returnCodeMeaning.failure.toString();
      }
    }
    if (this.job.configuration.executable.returnCodeMeaning.failure) {
      this.returnCodes.on = 'failure';
    } else {
      this.returnCodes.on = 'success';
    }

    if (!this.job.configuration.executable.arguments || isEmpty(this.job.configuration.executable.arguments)) {
      this.job.configuration.executable.arguments = [];
    } else {
      if (!isArray(this.job.configuration.executable.arguments)) {
        this.job.configuration.executable.arguments = this.coreService.convertObjectToArray(this.job.configuration.executable, 'arguments');
        this.job.configuration.executable.arguments.filter((env) => {
          this.coreService.removeSlashToString(env, 'value');
        });
      }
    }

    if (!this.job.configuration.executable.jobArguments || isEmpty(this.job.configuration.executable.jobArguments)) {
      this.job.configuration.executable.jobArguments = [];
    } else {
      if (!isArray(this.job.configuration.executable.jobArguments)) {
        this.job.configuration.executable.jobArguments = this.coreService.convertObjectToArray(this.job.configuration.executable, 'jobArguments');
        this.job.configuration.executable.jobArguments.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }

    if (!this.job.configuration.executable.env || isEmpty(this.job.configuration.executable.env)) {
      this.job.configuration.executable.env = [];
    } else {
      if (!isArray(this.job.configuration.executable.env)) {
        this.job.configuration.executable.env = this.coreService.convertObjectToArray(this.job.configuration.executable, 'env');
        this.job.configuration.executable.env.filter((env) => {
          this.coreService.removeSlashToString(env, 'value');
        });
      }
    }

    const temp = this.coreService.clone(this.job.configuration.parameters);
    this.job.configuration.parameters = Object.entries(temp).map(([k, v]) => {
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
      return {name: k, value: val};
    });

    if (!this.job.configuration.executable.login) {
      this.job.configuration.executable.login = {};
    }

    if (!this.job.configuration.notification) {
      this.job.configuration.notification = {
        mail: {}
      };
    } else if (!this.job.configuration.notification.mail) {
      this.job.configuration.notification.mail = {};
    }

    if (this.job.configuration.timeout) {
      this.job.configuration.timeout1 = this.workflowService.convertDurationToString(this.job.configuration.timeout);
    }
    if (this.job.configuration.graceTimeout) {
      this.job.configuration.graceTimeout1 = this.workflowService.convertDurationToString(this.job.configuration.graceTimeout);
    }
    if (this.job.configuration.executable.arguments && this.job.configuration.executable.arguments.length === 0) {
      this.addArgu();
    }
    if (this.job.configuration.executable.jobArguments && this.job.configuration.executable.jobArguments.length === 0) {
      this.addJobArgument();
    }
    if (this.job.configuration.executable.env && this.job.configuration.executable.env.length === 0) {
      this.addEnv();
    }
    if (!this.job.configuration.parameters) {
      this.job.configuration.parameters = [];
    }
    if (this.job.configuration.parameters.length === 0) {
      this.addParameter();
    }
  }

  rename(inValid): void {
    if ((this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name) === this.job.path && this.data.name !== this.job.name) {
      if (!inValid) {
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'JobTemplate',
            operation: 'Rename',
            name: this.data.name
          };
          const modal = this.modal.create({
            nzTitle: undefined,
            nzContent: CommentModalComponent,
            nzClassName: 'lg',
            nzComponentParams: {
              comments
            },
            nzFooter: null,
            nzClosable: false,
            nzMaskClosable: false
          });
          modal.afterClose.subscribe(result => {
            if (result) {
              this.renameJob(result);
            } else {
              this.job.name = this.data.name;
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameJob();
        }
      } else {
        this.job.name = this.data.name;
        this.ref.detectChanges();
      }
    }
  }

  private renameJob(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.job.name;
    const obj: any = {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
      newPath: name,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(comments, obj.auditLog);
    this.coreService.post('inventory/rename', obj).subscribe({
      next: () => {
        if ((data.path + (data.path === '/' ? '' : '/') + data.name) === (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name)) {
          this.data.name = name;
        }
        data.name1 = name;
        this.dataService.reloadTree.next({rename: data});
      }, error: () => {
        this.job.name = this.data.name;
        this.ref.detectChanges();
      }
    });
  }

  private getDocumentations(): void {
    if (this.documentationTree.length === 0 && this.permission.joc.documentations.view) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
  }

  private getJobResources(): void {
    this.coreService.getJobResource((arr) => {
      this.jobResourcesTree = arr;
      if (this.job.configuration && this.job.configuration.jobResourceNames && this.job.configuration.jobResourceNames.length > 0) {
        this.job.configuration.jobResourceNames = [...this.job.configuration.jobResourceNames];
        this.jobResourcesTree = this.coreService.getNotExistJobResource({
          arr: this.jobResourcesTree,
          jobResources: this.job.configuration.jobResourceNames
        });
        this.ref.detectChanges();
      }
    });
  }


  release(): void {
    this.dataService.reloadTree.next({release: this.job});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.job});
  }

  showRuntime(): void {
    this.selectedNode.periodList = [];
    this.isRuntimeVisible = true;
  }

  closeRuntime(): void {
    this.isRuntimeVisible = false;
  }

  drop(event: CdkDragDrop<string[]>, list: Array<any>): void {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.saveJSON();
    }
  }

  onAllChecked(obj: any, type: string, isChecked: boolean): void {
    obj[type].forEach(item => this.updateCheckedSet(obj[type], type, item.name, isChecked));
  }

  onItemChecked(obj: any, type: string, name: string, checked: boolean): void {
    this.updateCheckedSet(obj[type], type, name, checked);
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
    } else {
      if (name) {
        if (checked) {
          this.object.setOfCheckedParam.add(name);
        } else {
          this.object.setOfCheckedParam.delete(name);
        }
      }
      this.object.checked4 = list.every(item => {
        return this.object.setOfCheckedParam.has(item.name);
      });
      this.object.indeterminate4 = this.object.setOfCheckedParam.size > 0 && !this.object.checked4;
    }
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
          } else {
            return !this.object.setOfCheckedParam.has(item.name);
          }
        });
        if (this.copiedParamObjects.type === 'arguments') {
          this.job.configuration.executable.arguments = list;
        } else if (this.copiedParamObjects.type === 'jobArguments') {
          this.job.configuration.executable.jobArguments = list;
        } else if (this.copiedParamObjects.type === 'env') {
          this.job.configuration.executable.env = list;
        } else {
          this.job.configuration.parameters = list;
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
      setOfCheckedParam: new Set<string>()
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
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedParam.clear();
    } else if (type === 'jobArguments') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedParam.clear();
    } else if (type === 'env') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedParam.clear();
    } else {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedJobArgu.clear();
    }
    let list = this.getList(type);
    const arr = list.filter(item => {
      if (type === 'arguments') {
        return this.object.setOfCheckedArgu.has(item.name);
      } else if (type === 'jobArguments') {
        return this.object.setOfCheckedJobArgu.has(item.name);
      } else if (type === 'env') {
        return this.object.setOfCheckedEnv.has(item.name);
      } else {
        return this.object.setOfCheckedParam.has(item.name);
      }
    });
    this.copiedParamObjects = {operation, type, data: arr, name: this.job.name};
    this.coreService.tabs._configuration.copiedParamObjects = this.coreService.clone(this.copiedParamObjects);
    if (arr.length > 0) {
      this.coreService.showCopyMessage(this.message, operation === 'CUT' ? 'cut' : 'copied');
    }
  }

  private getList(type): Array<any> {
    if (type === 'arguments') {
      return this.job.configuration.executable.arguments;
    } else if (type === 'jobArguments') {
      return this.job.configuration.executable.jobArguments;
    } else if (type === 'env') {
      return this.job.configuration.executable.env;
    } else {
      return this.job.configuration.defaultArguments;
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
      } else {
        this.object.setOfCheckedParam = new Set<string>();
        this.object.checked4 = false;
        this.object.indeterminate4 = false;
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
      }
    });
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
      this.job.configuration = JSON.parse(obj);
      this.saveJSON(true);
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
      this.job.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  addJobArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.job.configuration.executable.jobArguments) {
      if (!this.coreService.isLastEntryEmpty(this.job.configuration.executable.jobArguments, 'name', '')) {
        this.job.configuration.executable.jobArguments.push(param);
      }
    }
  }

  removeJobArgument(index): void {
    this.job.configuration.executable.jobArguments.splice(index, 1);
    this.saveJSON();
  }


  addArgu(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.job.configuration.executable.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.job.configuration.executable.arguments, 'name', '')) {
        this.job.configuration.executable.arguments.push(param);
      }
    }
  }

  removeArgu(index): void {
    this.job.configuration.executable.arguments.splice(index, 1);
    this.saveJSON();
  }

  addParameter(): void {
    const param = {
      name: '',
      value: {
        type: 'String'
      }
    };
    if (this.job.configuration.parameters) {
      if (!this.coreService.isLastEntryEmpty(this.job.configuration.parameters, 'name', '')) {
        this.job.configuration.parameters.push(param);
      }
    }
  }

  removeParameter(index): void {
    this.job.configuration.parameters.splice(index, 1);
    this.ref.detectChanges();
    this.saveJSON();
  }

  addFacet(data: any, isList = false): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FacetEditorComponent,
      nzClassName: isList ? 'sm' : 'lg',
      nzComponentParams: {
        data,
        isList,
        preferences: this.preferences
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result.value;
        this.ref.detectChanges();
        this.saveJSON();
      }
    });
  }

  addList(data: any): void {
    this.addFacet(data, true);
  }

  addEnv(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.job.configuration.executable.env) {
      if (!this.coreService.isLastEntryEmpty(this.job.configuration.executable.env, 'name', 'isRequired')) {
        this.job.configuration.executable.env.push(param);
      }
    }
  }

  removeEnv(index): void {
    this.job.configuration.executable.env.splice(index, 1);
    this.saveJSON();
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
      if(count < 2) {
        this.saveJSON();
      }
    }
  }

  checkString(data, type): void {
    if (data[type] && typeof data[type] == 'string') {
      const startChar = data[type].substring(0, 1);
      const endChar = data[type].substring(data[type].length - 1);
      if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {
        data[type] = data[type].substring(1, data[type].length - 1);
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

  checkLength(): void {
    const len = JSON.stringify(this.job.configuration.notification).length;
    this.isLengthExceed = len > 1000;
    if (!this.isLengthExceed) {
      this.saveJSON();
    }
  }

  valueWith = (data: { name: string }) => data.name;

  checkValue(argu): void {
    if (argu && argu.value && /\s+$/.test(argu.value)) {
      argu.value = argu.value.trim();
    }
  }

  onKeyPress($event, type): void {
    if (type === 'jobArgument') {
      if ($event.key === '$') {
        $event.preventDefault();
      }
    }
    if ($event.which === '13' || $event.which === 13) {
      type === 'parameters' ? this.addParameter() :type === 'jobArgument' ? this.addJobArgument() : this.addArgu();
      this.saveJSON();
    }
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    const job = this.coreService.clone(this.job.configuration);
    if (job.parameters) {
      this.coreService.convertArrayToObject(job, 'parameters', true);
    }
    if (job.executable && job.executable.arguments) {
      this.coreService.convertArrayToObject(job.executable, 'arguments', true);
    }
    if (job.executable && job.executable.jobArguments) {
      this.coreService.convertArrayToObject(job.executable, 'jobArguments', true);
    }
    if (job.executable && job.executable.env) {
      this.coreService.convertArrayToObject(job.executable, 'env', true);
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
      if (job.executable.returnCodeMeaning.success == '0') {
        delete job.executable.returnCodeMeaning;
      }
    }
    if (job.executable && isEmpty(job.executable.login)) {
      delete job.executable.login;
    }
    if (!job.executable.v1Compatible) {
      if (job.executable.TYPE === 'ShellScriptExecutable') {
        job.executable.v1Compatible = false;
      } else {
        delete job.executable.v1Compatible;
      }
    }
    if (job.parameters) {
      if (job.parameters && isArray(job.parameters)) {
        job.parameters.filter((argu) => {
          this.coreService.addSlashToString(argu, 'value');
        });
        this.coreService.convertArrayToObject(job, 'parameters', true);
      }
    }
    if (job.notification && isEmpty(job.notification.mail)) {
      if (!job.notification.types || job.notification.types.length === 0) {
        delete job.notification;
      } else {
        delete job.notification.mail;
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

    if (job.parameters && job.parameters.length > 0) {
      let temp = this.coreService.clone(job.parameters);
      job.parameters = temp.filter((value) => {
        delete value.value.invalid;
        if (value.value.type !== 'String') {
          delete value.value.facet;
          delete value.value.message;
        }
        if (!value.value.default && value.value.default !== false && value.value.default !== 0) {
          delete value.value.default;
        }

        if (value.value.type === 'String') {
          this.coreService.addSlashToString(value.value, 'default');
        }

        if (value.value.list) {
          let list = [];
          value.value.list.forEach((obj) => {
            this.coreService.addSlashToString(obj, 'name');
            list.push(obj.name);
          });
          value.value.list = list;
        }
        return !!value.name;
      });
      job.parameters = this.coreService.keyValuePair(job.parameters);
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
    delete job.timeout1;
    delete job.graceTimeout1;
    if (!job.parameters || typeof job.parameters === 'string' || job.parameters.length === 0) {
      delete job.parameters;
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
    if (this.job.actual && !isEqual(this.job.actual, JSON.stringify(job))) {
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.job.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }

      const request: any = {
        configuration: job,
        path: this.job.path,
        objectType: this.objectType
      };

      if (sessionStorage.$SOS$FORCELOGING === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }
      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.job.path) {
            this.lastModified = res.configurationDate;
            this.job.actual = JSON.stringify(this.job.configuration);
            this.job.valid = res.valid;
            this.job.released = false;
            this.data.valid = res.valid;
            this.data.released = false;
            this.setErrorMessage(res);
          }
        }, error: () => {
          this.ref.detectChanges();
        }
      });
    }
  }

  private validateJSON(json): void {
    const obj = clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.job.valid = res.valid;
      if (this.job.path === this.data.path) {
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      if (res.invalidMsg.match('env: is missing')) {
        this.invalidMsg = 'inventory.message.envOrArgumentIsMissing';
      }
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
      if (this.job.configuration.executable.TYPE === 'ShellScriptExecutable' && !this.job.configuration.executable.script) {
        this.invalidMsg = 'workflow.message.scriptIsMissing';
      } else if (this.job.configuration.executable.TYPE === 'InternalExecutable' && !this.job.configuration.executable.className) {
        this.invalidMsg = 'workflow.message.classNameIsMissing';
      } else if (this.job.configuration.executable && this.job.configuration.executable.login &&
        this.job.configuration.executable.login.withUserProfile && !this.job.configuration.executable.login.credentialKey) {
        this.invalidMsg = 'inventory.message.credentialKeyIsMissing';
      }
    }
    this.ref.detectChanges();
  }
}
