import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {isArray, isEmpty, isEqual} from 'underscore';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {ValueEditorComponent} from '../../../../components/value-editor/value.component';
import {InventoryObject} from '../../../../models/enums';
import {InventoryService} from '../inventory.service';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';
import {NotificationComponent} from "../inventory.component";

@Component({
  selector: 'app-test-mail',
  templateUrl: './test-mail-dialog.html'
})
export class TestMailComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  object = {
    jobResourceName: '',
    recipient: '',
    subject: ''
  };
  submitted = false;

  constructor(private activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    this.object.jobResourceName = this.data.name;
  }

  onSubmit(): void {
    this.submitted = true;
    this.coreService.post('utilities/send_email', this.object).subscribe({
      next: (res) => {
        this.activeModal.close(res);
      }, error: () => {
        this.submitted = false;
      }
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-job-resource',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-resource.component.html'
})
export class JobResourceComponent {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  jobResource: any = {};
  invalidMsg: string;
  isLocalChange: string;
  isStore = false;
  objectType = InventoryObject.JOBRESOURCE;
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];

  object = {
    checked1: false,
    indeterminate1: false,
    setOfCheckedArgu: new Set<string>(),
    checked2: false,
    indeterminate2: false,
    setOfCheckedEnv: new Set<string>()
  };
  lastModified: any = '';
  copiedParamObjects: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(public coreService: CoreService, private dataService: DataService, private router: Router, private translate: TranslateService,
              private modal: NzModalService, private ref: ChangeDetectorRef, public inventoryService: InventoryService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.jobResource.actual) {
          if (this.data.deployed !== this.jobResource.deployed || this.data.valid !== this.jobResource.valid) {
            this.object = {
              checked1: false,
              indeterminate1: false,
              setOfCheckedArgu: new Set<string>(),
              checked2: false,
              indeterminate2: false,
              setOfCheckedEnv: new Set<string>()
            };
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
    if (this.jobResource.actual) {
      this.cutOperation();
      this.saveJSON();
    }
    if (changes['data']) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.jobResource = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.cutOperation();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.jobResource.name) {
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
              if (this.isLocalChange !== this.jobResource.path) {
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

  rename(inValid): void {
    if (this.data.id === this.jobResource.id && this.data.name !== this.jobResource.name) {
      if (!inValid) {
        this.jobResource.path = (this.jobResource.path1 + (this.jobResource.path1 === '/' ? '' : '/') + this.jobResource.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'JobResource',
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
              this.renameJobResource(result);
            } else {
              this.jobResource.name = this.data.name;
              this.jobResource.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameJobResource();
        }
      } else {
        this.jobResource.name = this.data.name;
        this.jobResource.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameJobResource(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.jobResource.name;
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
        this.jobResource.name = this.data.name;
        this.jobResource.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
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

  deploy(): void {
    this.checkForDeploy(50);
  }

  testMail(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: TestMailComponent,
      nzClassName: 'lg',
      nzData: {
        data: this.jobResource,
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  private checkForDeploy(time: number): void {
    setTimeout(() => {
      if (this.isStore) {
        this.checkForDeploy(100);
      } else {
        this.dataService.reloadTree.next({deploy: this.jobResource});
      }
    }, time);
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.jobResource});
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
      this.jobResource.configuration = JSON.parse(obj);
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
      this.jobResource.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  addEnv(flag = false): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.jobResource.configuration.env) {
      if (!this.coreService.isLastEntryEmpty(this.jobResource.configuration.env, 'name', '')) {
        this.jobResource.configuration.env.push(param);
        if (!flag) {
          this.ref.detectChanges();
        }
      }
    }
  }

  removeEnv(index): void {
    this.jobResource.configuration.env.splice(index, 1);
    this.ref.detectChanges();
    this.saveJSON();
  }

  addArgu(flag = false): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.jobResource.configuration.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.jobResource.configuration.arguments, 'name', '')) {
        this.jobResource.configuration.arguments.push(param);
        if (!flag) {
          this.ref.detectChanges();
        }
      }
    }
  }

  removeArgu(index): void {
    this.jobResource.configuration.arguments.splice(index, 1);
    this.ref.detectChanges();
    this.saveJSON();
  }

  onKeyPress($event, type): void {
    if ($event.which === '13' || $event.which === 13) {
      if (type === 'ENV') {
        this.addEnv();
      } else {
        this.addArgu();
      }
    }
  }

  get hasMailProperty(): boolean {
    return this.jobResource.configuration.arguments.some(obj => obj.name && obj.name.match(/mail\.[a-zA-Z]/) !== null);
  }

  isStringValid(data, notValid): void {
    if (notValid) {
      // data.name = '';
      // data.value = '';
    } else {
      setTimeout(() => {
        this.saveJSON();
      }, 0);
    }
  }

  upperCase(env): void {
    if (env.name) {
      // env.name = env.name.toUpperCase();
      if (!env.value) {
        env.value = '$' + env.name.toLowerCase();
      }
    }
  }


  drop(event: CdkDragDrop<string[]>, list: Array<any>): void {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.saveJSON();
    }
  }

  onAllChecked(type: string, isChecked: boolean): void {
    this.jobResource.configuration[type].forEach(item => this.updateCheckedSet(type, item.name, isChecked));
  }

  onItemChecked(type: string, name: string, checked: boolean): void {
    this.updateCheckedSet(type, name, checked);
  }

  updateCheckedSet(type: string, name: string, checked: boolean): void {
    if (type === 'arguments') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedArgu.add(name);
        } else {
          this.object.setOfCheckedArgu.delete(name);
        }
      }
      this.object.checked1 = this.jobResource.configuration.arguments.every(item => {
        return this.object.setOfCheckedArgu.has(item.name);
      });
      this.object.indeterminate1 = this.object.setOfCheckedArgu.size > 0 && !this.object.checked1;
    } else {
      if (name) {
        if (checked) {
          this.object.setOfCheckedEnv.add(name);
        } else {
          this.object.setOfCheckedEnv.delete(name);
        }
      }
      this.object.checked2 = this.jobResource.configuration.env.every(item => {
        return this.object.setOfCheckedEnv.has(item.name);
      });
      this.object.indeterminate2 = this.object.setOfCheckedEnv.size > 0 && !this.object.checked2;
    }
  }

  cutParam(type): void {
    this.cutCopyOperation(type, 'CUT');
  }

  copyParam(type): void {
    this.cutCopyOperation(type, 'COPY');
  }

  private cutOperation(): void {
    if (this.copiedParamObjects.operation === 'CUT' && this.jobResource.configuration[this.copiedParamObjects.type]) {
      this.jobResource.configuration[this.copiedParamObjects.type] = this.jobResource.configuration[this.copiedParamObjects.type].filter(item => {
        if (this.copiedParamObjects.type === 'arguments') {
          return !this.object.setOfCheckedArgu.has(item.name);
        } else {
          return !this.object.setOfCheckedEnv.has(item.name);
        }
      });
    }
  }

  private cutCopyOperation(type, operation): void {
    if (type === 'arguments') {
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.setOfCheckedEnv.clear();
    } else {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.setOfCheckedArgu.clear();
    }
    const arr = this.jobResource.configuration[type].filter(item => {
      if (type === 'arguments') {
        return this.object.setOfCheckedArgu.has(item.name);
      } else {
        return this.object.setOfCheckedEnv.has(item.name);
      }
    });
    this.copiedParamObjects = {operation, type, data: arr, name: this.data.name};
    this.coreService.tabs._configuration.copiedParamObjects = this.copiedParamObjects;
  }

  pasteParam(type: string): void {
    if (!this.copiedParamObjects.data) {
      return;
    }
    const arr = this.getPasteParam(this.jobResource.configuration[type], this.copiedParamObjects.data);
    if (arr.length > 0) {
      this.jobResource.configuration[type] = this.jobResource.configuration[type].filter((item) => {
        return !!item.name;
      });
      this.jobResource.configuration[type] = this.jobResource.configuration[type].concat(arr);
    }
    if (this.copiedParamObjects.operation === 'CUT' && this.jobResource.configuration[this.copiedParamObjects.type]) {
      this.cutOperation();
      if (this.copiedParamObjects.type === 'arguments') {
        this.object.setOfCheckedArgu = new Set<string>();
        this.object.checked1 = false;
        this.object.indeterminate1 = false;
      } else {
        this.object.setOfCheckedEnv = new Set<string>();
        this.object.checked2 = false;
        this.object.indeterminate2 = false;
      }
      this.copiedParamObjects = {};
      this.coreService.tabs._configuration.copiedParamObjects = this.copiedParamObjects;
    }
    this.saveJSON();
  }

  /**
   * Function: To paste param fom one job param to another param list
   */
  private getPasteParam(sour, target): any {
    const temp = this.coreService.clone(target);
    for (let i = 0; i < sour.length; i++) {
      for (let j = 0; j < temp.length; j++) {
        if (sour[i].name === temp[j].name) {
          temp.splice(j, 1);
          break;
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
      nzData: {
        data: data.value
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
        this.saveJSON();
      }
    });
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    const obj = this.coreService.clone(this.jobResource.configuration);
    if (this.jobResource.actual && !isEqual(this.jobResource.actual, JSON.stringify(obj))) {
      if (obj.env && isArray(obj.env)) {
        obj.env.filter((env) => {
          this.coreService.addSlashToString(env, 'value');
        });
        this.coreService.convertArrayToObject(obj, 'env', true);
      }
      if (obj.arguments && isArray(obj.arguments)) {
        obj.arguments.filter((argu) => {
          this.coreService.addSlashToString(argu, 'value');
        });
        this.coreService.convertArrayToObject(obj, 'arguments', true);
      }

      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.jobResource.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }

      const request: any = {
        configuration: obj,
        valid: (obj.env && obj.env.length > 0 || obj.arguments && obj.arguments.length > 0),
        path: this.jobResource.path,
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
          if (res.path === this.jobResource.path) {
            this.isLocalChange = res.path;
            this.lastModified = res.configurationDate;
            this.jobResource.actual = JSON.stringify(this.jobResource.configuration);
            this.jobResource.valid = res.valid;
            this.jobResource.deployed = false;
            this.data.valid = res.valid;
            this.data.deployed = false;
            this.setErrorMessage(res);
            this.ref.detectChanges();
          }
        }, error: () => {
          this.isStore = false;
          this.ref.detectChanges();
        }
      });
    }
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
    } else if (res.configuration) {
      if (!res.configuration.arguments && !res.configuration.env) {
        this.invalidMsg = 'inventory.message.envOrArgumentIsMissing';
      }
    }
  }

  private getObject(): void {
    this.copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    const obj: any = {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked && !this.isTrash) {
      obj.controllerId = this.schedulerId;
    }
    this.coreService.post(URL, obj).subscribe((res: any) => {
      this.isLocalChange = '';
      this.lastModified = res.configurationDate;
      this.history = [];
      this.indexOfNextAdd = 0;
      this.getDocumentations();
      this.object = {
        checked1: false,
        indeterminate1: false,
        setOfCheckedArgu: new Set<string>(),
        checked2: false,
        indeterminate2: false,
        setOfCheckedEnv: new Set<string>()
      };
      if (res.configuration) {
        delete res.configuration.TYPE;
        delete res.configuration.path;
        delete res.configuration.version;
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }
      if (this.data.deployed !== res.deployed) {
        this.data.deployed = res.deployed;
      }
      if (this.data.valid !== res.valid) {
        this.data.valid = res.valid;
      }
      this.data.syncState = res.syncState;
      this.jobResource = res;
      this.jobResource.path1 = this.data.path;
      this.jobResource.name = this.data.name;
      this.setErrorMessage(res);
      if (this.jobResource.configuration.env) {
        this.jobResource.configuration.env = this.coreService.convertObjectToArray(this.jobResource.configuration, 'env');
        this.jobResource.configuration.env = this.jobResource.configuration.env.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
          return argu.name && (argu.value || argu.value == false || argu.value == 0)
        });
      } else {
        this.jobResource.configuration.env = [];
        this.addEnv(true);
      }
      if (this.jobResource.configuration.arguments) {
        this.jobResource.configuration.arguments = this.coreService.convertObjectToArray(this.jobResource.configuration, 'arguments');
        this.jobResource.configuration.arguments = this.jobResource.configuration.arguments.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
          return argu.name && (argu.value || argu.value == false || argu.value == 0)
        });
      } else {
        this.jobResource.configuration.arguments = [];
        this.addArgu(true);
      }
      this.jobResource.actual = JSON.stringify(res.configuration);
      this.history.push(JSON.stringify(this.jobResource.configuration));
      this.ref.detectChanges();
    });
  }

  navToYade(title): void {
    sessionStorage['tabName'] = title.split(':')[1];
    this.router.navigate(['/configuration/file_transfer']).then();
  }
}
