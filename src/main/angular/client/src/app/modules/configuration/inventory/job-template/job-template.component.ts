import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {clone, isArray, isEmpty, isEqual} from 'underscore';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService} from "ng-zorro-antd/message";
import {JobWizardComponent} from '../job-wizard/job-wizard.component';
import {FacetEditorComponent, ScriptEditorComponent} from '../workflow/workflow.component';
import {ValueEditorComponent} from '../../../../components/value-editor/value.component';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {WorkflowService} from "../../../../services/workflow.service";
import {InventoryObject} from '../../../../models/enums';

declare const $;

@Component({
  selector: 'app-update-modal',
  templateUrl: './update-dialog.html'
})
export class UpdateJobTemplatesComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  preferences: any = {};
  data: any;
  treeObj: any;
  job: any;
  submitted = false;
  listOfWorkflows = [];
  jobTemplates = [];
  allJobTemplates = [];
  nodes: any = [{path: '/', key: '/', name: '/', children: []}];
  isloaded = false;
  loading = true;
  required = false;
  display = false;
  folder: any;
  comments: any = {radio: 'predefined'};
  object = {
    overwriteNotification: false,
    overwriteAdmissionTime: false,
    overwriteValues: false,
    propagateOptionalArguments: false,
    setOfCheckedPath: new Set(),
    checked: false,
    indeterminate: false,
    isRecursive: true,
    recursive: true,
    draft: true,
    deploy: true,
  };

  isUpdated = false;
  updatedList = [];
  jobStatus: any;

  @ViewChild('treeCtrl', {static: false}) treeCtrl;

  constructor(private activeModal: NzModalRef, public coreService: CoreService) {
  }

  static createTempArray(arr): any {
    const tempArr = [];
    for (let i = 0; i < arr.length; i++) {
      const parentObj: any = {
        name: arr[i].name,
        path: arr[i].path,
        key: arr[i].key,
        title: arr[i].key,
        type: true,
        isLeaf: true
      };
      tempArr.push(parentObj);
    }
    return tempArr;
  }

  ngOnInit(): void {
    this.preferences = this.modalData.preferences;
    this.data = this.modalData.data;
    this.folder = this.modalData.object;
    const folders = [];
    if (this.modalData.object && !this.modalData.object.type) {
      folders.push({
        folder: this.modalData.object.path,
        recursive: !(this.modalData.object.dailyPlan || this.modalData.object.object)
      })
    }
    this.treeObj = this.modalData.treeObj;
    this.job = this.modalData.job;

    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data || folders.length > 0) {
      const obj: any = {};
      if (this.data) {
        obj.jobTemplatePaths = [this.data.path1 ? this.data.path : this.data.path + (this.data.path == '/' ? '' : '/') + this.data.name];
      } else {
        obj.folders = folders;
      }
      this.propagateJobs(obj);
    }
  }

  propagateJobs(obj): void {
    this.coreService.post('job_templates/used', obj).subscribe({
      next: (res) => {
        this.isloaded = true;
        if (res.jobTemplates.length > 0) {
          if (this.data && res.jobTemplates.length == 1) {
            this.listOfWorkflows = res.jobTemplates[0].workflows;
          } else {
            this.allJobTemplates = res.jobTemplates.map(job => {
              job.tempWorkflows = this.coreService.clone(job.workflows)
              job.setOfCheckedPath = new Set();
              return job;
            })
            this.nodes = [];
          }
        } else {
          this.nodes = [];
        }
        this.filterList();
      }, error: () => {
        this.isloaded = true;
      }
    })
  }

  filterList(): void {
    this.object.setOfCheckedPath = new Set();
    this.object.checked = false;
    this.object.indeterminate = false;

    if (this.allJobTemplates.length > 0) {
      this.jobTemplates = this.allJobTemplates.filter((item) => {
        item.checked = false;
        item.indeterminate = false;
        item.setOfCheckedPath.clear();
        item.workflows = item.tempWorkflows.filter((workflow) => {
          if (this.object.draft && !workflow.deployed) {
            return true;
          } else if (this.object.deploy && workflow.deployed) {
            return true;
          }
          return false;
        });
        return item.workflows.length > 0;
      });

    } else {
      if (this.object.draft && this.object.deploy) {
        this.nodes = this.coreService.clone(this.listOfWorkflows);
      } else {
        this.nodes = this.listOfWorkflows.filter((item) => {
          if (this.object.draft && !item.deployed) {
            return true;
          } else if (this.object.deploy && item.deployed) {
            return true;
          }
          return false;
        })
      }
    }
  }

  selectAll(value: boolean): void {
    if (this.jobTemplates.length > 0) {
      this.object.indeterminate = false;
      if (value) {
        this.jobTemplates.forEach(item => {
          item.checked = true;
          item.workflows.forEach(workflow => {
            item.setOfCheckedPath.add(workflow.path);
          });
        });
      } else {
        this.jobTemplates.forEach(item => {
          item.checked = false;
          item.setOfCheckedPath.clear();
        });
      }

    } else {
      if (value) {
        this.nodes.forEach(item => {
          this.object.setOfCheckedPath.add(item.path);
        });
      } else {
        this.object.setOfCheckedPath.clear();
      }
      this.object.indeterminate = this.object.setOfCheckedPath.size > 0 && !this.object.checked;
    }
  }

  onTemplateChecked(job: any, checked: boolean): void {
    job.setOfCheckedPath.clear();
    if (checked) {
      job.checked = true;
      job.workflows.forEach(workflow => {
        job.setOfCheckedPath.add(workflow.path);
      });
    } else {
      job.checked = false;
    }
    this.updateCheckAllCheckbox();
  }

  onWorkflowChecked(job, item: any, checked: boolean): void {
    if (checked) {
      job.setOfCheckedPath.add(item.path);
    } else {
      job.setOfCheckedPath.delete(item.path);
    }
    job.checked = job.setOfCheckedPath.size === job.workflows.length;
    job.indeterminate = job.setOfCheckedPath.size > 0 && !job.checked;
    this.updateCheckAllCheckbox();
  }

  private updateCheckAllCheckbox(): void{
    const count = this.jobTemplates.filter(value => value.checked === true).length;
    this.object.checked = count === this.jobTemplates.length;
    this.object.indeterminate = count > 0 && !this.object.checked;
  }

  onItemChecked(item: any, checked: boolean): void {
    if (checked) {
      this.object.setOfCheckedPath.add(item.path);
    } else {
      this.object.setOfCheckedPath.delete(item.path);
    }
    this.object.checked = this.object.setOfCheckedPath.size === this.nodes.length;
    this.object.indeterminate = this.object.setOfCheckedPath.size > 0 && !this.object.checked;
  }

  onSubmit(): void {
    this.isUpdated = false;
    this.submitted = true;
    let request: any = {
      overwriteNotification: this.object.overwriteNotification,
      overwriteAdmissionTime: this.object.overwriteAdmissionTime,
      overwriteValues: this.object.overwriteValues,
      propagateOptionalArguments: this.object.propagateOptionalArguments,
    };
    if (this.data || this.folder) {
      if(this.data?.path){
        request.jobTemplates = [{
          path: this.data.path + (this.data.path == '/' ? '' : '/') + this.data.name,
          workflows: Array.from(this.object.setOfCheckedPath)
        }];
      } else if(this.jobTemplates?.length){
        request.jobTemplates = [];
        this.jobTemplates?.forEach(job => {
          if(job.checked || job.indeterminate) {
            request.jobTemplates.push({
              path: job.path,
              workflows: Array.from(job.setOfCheckedPath)
            });
          }
        });
      }
    } else if (this.treeObj) {
      request.folder = this.treeObj.path;
      if (this.treeObj.type) {
        request.workflowPaths = [this.treeObj.path + (this.treeObj.path === '/' ? '' : '/') + this.treeObj.name]
      } else {
        request.recursive = this.object.recursive;
      }
    } else if (this.job) {
      request.workflowPath = this.job.workflowPath;
      request.jobName = this.job.jobName;
    }
    if (this.comments.comment) {
      request.auditLog = {
        comment: this.comments.comment,
        timeSpent: this.comments.timeSpent,
        ticketLink: this.comments.ticketLink
      }
    }
    const URL = (this.data || this.folder) ? 'job_templates/propagate' : this.job ? 'inventory/job/update' : 'inventory/workflows/update';
    this.coreService.post(URL, request).subscribe({
      next: (res) => {
        if (res.workflows && res.workflows.length > 0) {
          this.updatedList = res.workflows;
          this.isUpdated = true;
          this.updatedList.forEach((workflow, index) => {
            if (index === 0) {
              workflow.show = true;
            }
            workflow.jobs = Object.entries(workflow.jobs).map(([k, v]) => {
              return {name: k, value: v};
            });
          })
        } else {
          if (res.state) {
            this.isUpdated = true;
            this.jobStatus = {
              name: this.job.jobName,
              value: res
            };
          } else {
            this.activeModal.close(res);
          }
        }
        this.submitted = false;
      }, error: () => {
        this.submitted = false;
      }
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  close(): void {
    this.activeModal.close(this.jobStatus || this.updatedList);
  }
}

@Component({
  selector: 'app-job-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-template.component.html'
})
export class JobTemplateComponent {
  @Input() permission: any;
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  job: any = {};
  invalidMsg: string;
  isLocalChange: string;
  objectType = InventoryObject.JOBTEMPLATE;

  indexOfNextAdd = 0;
  selectedIndex = 0;
  history = [];
  isRuntimeVisible = false;
  isStore = false;
  jobResourcesTree = [];
  documentationTree = [];
  scriptTree: any = [];
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
    setOfCheckedEnv: new Set<string>()
  };
  showToken = /\w/;

  lastModified: any = '';
  copiedParamObjects: any = {};
  allowedDatatype = ['String', 'Number', 'Boolean'];

  isTreeShow = false;
  isDisplay = true;

  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  @ViewChild('codeMirror', {static: false}) cm: any;

  constructor(public coreService: CoreService, private dataService: DataService, private router: Router, private translate: TranslateService,
              private modal: NzModalService, private ref: ChangeDetectorRef, private message: NzMessageService,
              private workflowService: WorkflowService) {
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
    this.subscription3 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['copyObj'] && !changes['data']) {
      return;
    }
    if (changes['reload']) {
      if (changes['reload'].previousValue === true && changes['reload'].currentValue === false) {
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
    if (changes['data']) {
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
    this.subscription3.unsubscribe();
    if (this.job.name) {
      this.saveJSON();
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          const path = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
          if ((args.eventSnapshots[j].eventType.match(/InventoryObjectUpdated/) || args.eventSnapshots[j].eventType.match(/ItemChanged/)) && args.eventSnapshots[j].objectType === this.objectType) {
            if (args.eventSnapshots[j].path === path) {
              if (this.isLocalChange !== this.job.path) {
                this.getObject();
              } else {
                this.isLocalChange = '';
              }
            }
          }
        }
      }
    }
  }

  private getObject(): void {
    this.copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    this.isDisplay = false;
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
    }).subscribe((res: any) => {
      this.isLocalChange = '';
      this.isDisplay = true;
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
      this.job.actual = this.coreService.clone(JSON.stringify(res.configuration));
      this.setJobProperties();
      if (this.jobResourcesTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.JOBRESOURCE]
        }).subscribe((res) => {
          this.jobResourcesTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.scriptTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.INCLUDESCRIPT]
        }).subscribe((res) => {
          this.scriptTree = this.coreService.prepareTree(res, false);
        });
      }


      this.history.push(JSON.stringify(this.job.configuration));
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
    if (this.job.configuration.executable.TYPE === 'InternalExecutable') {
      if (this.job.configuration.executable.internalType === 'Java') {
        this.job.configuration.executable.TYPE = 'Java';
      } else if (this.job.configuration.executable.internalType === 'JavaScript_Graal') {
        this.job.configuration.executable.TYPE = 'JavaScript';
      }
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
      if (this.job.configuration.executable.returnCodeMeaning && this.job.configuration.executable.returnCodeMeaning.warning) {
        this.job.configuration.executable.returnCodeMeaning.warning = this.job.configuration.executable.returnCodeMeaning.warning.toString();
      }
    }
    this.returnCodes.on = this.job.configuration.executable.returnCodeMeaning.failure ? 'failure' : 'success';
    if(this.job.configuration.executable.returnCodeMeaning.failure === 'none'){
      this.returnCodes.on = 'ignore';
    }

    if (!this.job.configuration.executable.jobArguments || isEmpty(this.job.configuration.executable.jobArguments)) {
      this.job.configuration.executable.jobArguments = [];
    } else {
      if (!isArray(this.job.configuration.executable.jobArguments)) {
        this.job.configuration.executable.jobArguments = this.coreService.convertObjectToArray(this.job.configuration.executable, 'jobArguments');
        this.job.configuration.executable.jobArguments = this.job.configuration.executable.jobArguments.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
          delete argu.default1;
          return argu.name && (argu.value || argu.value == false || argu.value == 0)
        });
      }
    }

    if (!this.job.configuration.executable.env || isEmpty(this.job.configuration.executable.env)) {
      this.job.configuration.executable.env = [];
    } else {
      if (!isArray(this.job.configuration.executable.env)) {
        this.job.configuration.executable.env = this.coreService.convertObjectToArray(this.job.configuration.executable, 'env');
        this.job.configuration.executable.env = this.job.configuration.executable.env.filter((env) => {
          this.coreService.removeSlashToString(env, 'value');
          delete env.default1;
          return env.name && (env.value || env.value == false || env.value == 0)
        });
      }
    }

    const temp = this.coreService.clone(this.job.configuration.arguments);
    this.job.configuration.arguments = Object.entries(temp).map(([k, v]) => {
      const val: any = v;
      if (val.default) {
        if (val.type === 'String') {
          this.coreService.removeSlashToString(val, 'default');
          delete val.default1;
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

    if (this.job.configuration.executable.jobArguments && this.job.configuration.executable.jobArguments.length === 0) {
      this.addJobArgument();
    }
    if (this.job.configuration.executable.env && this.job.configuration.executable.env.length === 0) {
      this.addEnv();
    }
    if (!this.job.configuration.arguments) {
      this.job.configuration.arguments = [];
    }
    if (this.job.configuration.arguments.length === 0) {
      this.addParameter();
    }

    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        const self = this;
        this.cm.codeMirror.setOption("extraKeys", {
          "Shift-Ctrl-Space": "autocomplete",
          "Tab": (cm) => {
            let spaces = '';
            const tabSize = parseInt(self.preferences.tabSize) || 4;
            for(let i =0; i < tabSize; i++){
              spaces += ' ';
            }
            cm.replaceSelection(spaces);
          },
          "Ctrl-Space": function (editor) {
            const cursor = editor.getCursor();
            self.isTreeShow = true;
            self.ref.detectChanges();
            setTimeout(() => {
              const dom = $('#show-tree');
              dom?.css({
                'opacity': '1',
                'top': (cursor.line > 0 ? (cursor.line * 18.7) + 24 : 24) + 'px',
                'left': '36px',
                'width': 'calc(100% - 48px)'
              });
            }, 0)

          }
        })
      }
    }, 100);
  }

  rename(inValid): void {
    if (this.data.id === this.job.id && this.data.name !== this.job.name) {
      if (!inValid) {
        this.job.path = (this.job.path1 + (this.job.path1 === '/' ? '' : '/') + this.job.name);
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
            nzData: {
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
              this.job.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameJob();
        }
      } else {
        this.job.name = this.data.name;
        this.job.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
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
        this.job.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
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

  reloadScript(time = 5): void {
    this.isDisplay = false;
    setTimeout(() => {
      this.isDisplay = true;
      this.ref.detectChanges();
    }, time);
  }

  release(): void {
    this.checkRelease(50);
  }

  private checkRelease(time: number): void {
    setTimeout(() => {
      if (this.isStore) {
        this.checkRelease(100);
      } else {
        this.dataService.reloadTree.next({release: this.job});
      }
    }, time);
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.job});
  }

  showRuntime(): void {
    this.selectedNode.periodList = [];
    this.isRuntimeVisible = true;
  }

  updateJobs(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateJobTemplatesComponent,
      nzClassName: 'lg',
      nzData: {
        preferences: this.preferences,
        data: this.job
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  openJobWizard(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: JobWizardComponent,
      nzClassName: 'lg',
      nzData: {
        existingJob: this.job.configuration
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.job.configuration.executable.TYPE = 'InternalExecutable';
        this.job.configuration.executable.className = result.javaClass;
        this.job.configuration.title = result.title;
        this.job.configuration.documentationName = result.docName;
        result.arguments = Object.entries(result.arguments).map(([k, v]) => {
          const val: any = v;
          if (val.default) {
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
        this.job.configuration.arguments = result.arguments;
        this.ref.detectChanges();
        this.saveJSON();
      }
    });
  }

  showEditor(mode): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ScriptEditorComponent,
      nzClassName: 'lg script-editor',
      nzAutofocus: null,
      nzData: {
        script: this.job.configuration.executable.script,
        tabSize: this.preferences.tabSize,
        mode,
        scriptTree: this.scriptTree
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.job.configuration.executable.script = result;
        this.ref.detectChanges();
      }
    });
  }
  closeRuntime(): void {
    this.isRuntimeVisible = false;
    setTimeout(() => {
      this.saveJSON();
    }, 10);
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
          }
          return false;
        });
        if (this.copiedParamObjects.type === 'arguments') {
          this.job.configuration.arguments = list;
        } else if (this.copiedParamObjects.type === 'jobArguments') {
          this.job.configuration.executable.jobArguments = list;
        } else if (this.copiedParamObjects.type === 'env') {
          this.job.configuration.executable.env = list;
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
      setOfCheckedEnv: new Set<string>()
    };
  }

  private cutCopyOperation(type, operation): void {
    if (type === 'arguments') {
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
    } else if (type === 'jobArguments') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedEnv.clear();
    } else if (type === 'env') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.setOfCheckedArgu.clear();
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
      }
      return false;
    });
    this.copiedParamObjects = {operation, type, data: arr, name: this.job.name};
    this.coreService.tabs._configuration.copiedParamObjects = this.coreService.clone(this.copiedParamObjects);
    if (arr.length > 0) {
      this.coreService.showCopyMessage(this.message, operation === 'CUT' ? 'cut' : 'copied');
    }
  }

  private getList(type): Array<any> {
    if (type === 'arguments') {
      return this.job.configuration.arguments;
    } else if (type === 'jobArguments') {
      return this.job.configuration.executable.jobArguments;
    } else if (type === 'env') {
      return this.job.configuration.executable.env;
    } else {
      return [];
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
      }
      this.copiedParamObjects = {};
      this.coreService.tabs._configuration.copiedParamObjects = this.copiedParamObjects;
      this.saveJSON();
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

  openEditor(data: any, type: string): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzData: {
        data: data[type]
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data[type] = result;
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


  addParameter(): void {
    const param = {
      name: '',
      value: {
        type: 'String'
      }
    };
    if (this.job.configuration.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.job.configuration.arguments, 'name', '')) {
        this.job.configuration.arguments.push(param);
      }
    }
  }

  removeParameter(index): void {
    this.job.configuration.arguments.splice(index, 1);
    this.ref.detectChanges();
    this.saveJSON();
  }

  addFacet(data: any, isList = false): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FacetEditorComponent,
      nzClassName: isList ? 'sm' : 'lg',
      nzData: {
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
      // data.name = '';
      // data.value = '';
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
      if (count < 2) {
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
      this.saveJSON();
    }
  }

  upperCase(env): void {
    if (env.name) {
      // env.name = env.name.toUpperCase();
      if (!env.value) {
        env.value = '$' + env.name.toLowerCase();
        this.saveJSON();
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
      type === 'arguments' ? this.addParameter() : this.addJobArgument();
      this.saveJSON();
    }
  }


  validateReturnCode(value, form): void {
    if (form.control['status'] === 'INVALID') {
      value[form.name] = '0';
    }
  }

  onBlurTree(value: string): void {
    $('.ant-select-tree-dropdown').hide();
    this.checkExpectNoticeExp(value);
  }

  checkExpectNoticeExp(name): void {
    this.isTreeShow = false;
    this.ref.detectChanges();
    if (name) {
      const doc = this.cm.codeMirror.getDoc();
      const cursor = doc.getCursor(); // gets the line number in the cursor position
      const currentLine = this.cm.codeMirror.getLine(cursor.line);
      const isSpace = cursor.ch > 0 ? currentLine.substring(cursor.ch - 1, cursor.ch) == ' ' : true;

      let str = (!isSpace ? ' ' : '');
      let text = name;

      if (this.job.configuration.executable.TYPE == 'JavaScript') {
        if (!currentLine.substring(0, cursor.ch).match('//!include')) {
          text = '//!include ' + name;
        }
      } else {
        if (!currentLine.substring(0, cursor.ch).match(/##!include/)) {
          text = '##!include ' + name;
        }
      }
      str = str + text + ' ';
      doc.replaceRange(str, cursor);
      cursor.ch = cursor.ch + (text.length);

      this.cm.codeMirror.focus();
      doc.setCursor(cursor);
    }
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    const job = this.coreService.clone(this.job.configuration);
    if (job.executable.TYPE == 'InternalExecutable' && !job.executable.internalType) {
       job.executable.internalType = 'JITL';
    }
    this.workflowService.convertJobObject(job);

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

      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }
      this.isStore = true;
      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          this.isStore = false;
          if (res.path === this.job.path) {
            this.isLocalChange = res.path;
            this.lastModified = res.configurationDate;
            this.job.actual = JSON.stringify(job);
            this.job.valid = res.valid;
            this.job.released = false;
            this.data.valid = res.valid;
            this.data.released = false;
            this.setErrorMessage(res);
          }
        }, error: () => {
          this.isStore = false;
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
      if ((this.job.configuration.executable.TYPE === 'ShellScriptExecutable' || this.job.configuration.executable.internalType === 'JavaScript_Graal') && !this.job.configuration.executable.script) {
        this.invalidMsg = 'workflow.message.scriptIsMissing';
      } else if (this.job.configuration.executable.TYPE === 'InternalExecutable' && this.job.configuration.executable.internalType !== 'JavaScript_Graal' && !this.job.configuration.executable.className) {
        this.invalidMsg = 'workflow.message.classNameIsMissing';
      } else if (this.job.configuration.executable && this.job.configuration.executable.login &&
        this.job.configuration.executable.login.withUserProfile && !this.job.configuration.executable.login.credentialKey) {
        this.invalidMsg = 'inventory.message.credentialKeyIsMissing';
      }
    }
    this.ref.detectChanges();
  }
}
