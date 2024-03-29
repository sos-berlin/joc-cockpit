import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges, ViewChild
} from '@angular/core';
import {isEmpty, isEqual, clone} from 'underscore';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';
import {InventoryObject} from '../../../../models/enums';
import {ScriptEditorComponent} from "../workflow/workflow.component";

@Component({
  selector: 'app-script',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './script.component.html',
})
export class ScriptComponent {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  script: any = {};
  isVisible: boolean;
  isUnique = true;
  objectType = InventoryObject.INCLUDESCRIPT;
  invalidMsg: string;
  isLocalChange = '';
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  cmOption: any = {
    lineNumbers: true,
    autoRefresh: true,
    lineWrapping: true,
    matchBrackets: true,
    foldGutter: true,
    tabSize: 4,
    scrollbarStyle: 'simple',
    highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
    mode: 'shell',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  };
  lastModified: any = '';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  @ViewChild('codeMirror', {static: false}) cm: any;

  constructor(public coreService: CoreService, private translate: TranslateService, private dataService: DataService,
              private ref: ChangeDetectorRef, private modal: NzModalService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.script.actual) {
          this.ref.detectChanges();
        }
      }
    });
    this.subscription2 = dataService.functionAnnounced$.subscribe(res => {
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

  ngOnInit(): void {
    this.cmOption.tabSize = parseInt(this.preferences.tabSize) || 4;
    this.cmOption.extraKeys = {
      'Shift-Ctrl-Space': 'autocomplete',
      "Tab": (cm) => {
        let spaces = '';
        for(let i =0; i < this.cmOption.tabSize; i++){
          spaces += ' ';
        }
        cm.replaceSelection(spaces);
      }
    }
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
    if (this.script.actual) {
      this.saveJSON();
    }
    if (changes['data']) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.script = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.script.name) {
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
              if (this.isLocalChange !== this.script.path) {
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

  rename(inValid): void {
    if (this.data.id === this.script.id && this.data.name !== this.script.name) {
      if (!inValid) {
        this.script.path = (this.script.path1 + (this.script.path1 === '/' ? '' : '/') + this.script.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'Script',
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
              this.renameScript(result);
            } else {
              this.script.name = this.data.name;
              this.script.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameScript();
        }
      } else {
        this.script.name = this.data.name;
        this.script.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameScript(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.script.name;
    const obj: any = {
      path: (data.path + (data.path === '/' ? '' : '/') + data.name),
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
        this.script.name = this.data.name;
        this.script.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    });
  }

  release(): void {
    this.dataService.reloadTree.next({release: this.script});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.script});
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
      this.script.configuration = JSON.parse(obj);
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
      this.script.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  showEditor(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ScriptEditorComponent,
      nzClassName: 'lg script-editor',
      nzAutofocus: null,
      nzData: {
        script: this.script.configuration.script,
        tabSize: this.preferences.tabSize,
        mode: 'shell',
        isSkip: true,
        scriptTree: []
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.script.configuration.script = result;
        this.ref.detectChanges();
      }
    });
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if (!isEqual(this.script.actual, JSON.stringify(this.script.configuration))) {
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.script.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }

      const request: any = {
        configuration: this.script.configuration,
        valid: !this.script.configuration.script,
        path: this.script.path,
        objectType: this.objectType
      };

      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }

      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.script.path) {
            this.isLocalChange = res.path;
            this.lastModified = res.configurationDate;
            this.script.actual = JSON.stringify(this.script.configuration);
            this.script.valid = res.valid;
            this.data.valid = res.valid;
            this.script.released = false;
            this.data.released = false;
            this.setErrorMessage(res);
          }
        }, error: () => {
          this.ref.detectChanges();
        }
      });
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
    }).subscribe((res: any) => {
      this.isLocalChange = '';
      this.lastModified = res.configurationDate;
      if (this.cm && this.cm.codeMirror) {
        this.cm.codeMirror.setValue('');
      }
      this.history = [];
      this.indexOfNextAdd = 0;
      this.getDocumentations();
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
      this.script = this.coreService.clone(res);
      if (this.script.configuration.script) {
        if (this.cm && this.cm.codeMirror) {
          this.cm.codeMirror.setValue(this.script.configuration.script);
        }
      }
      this.script.actual = JSON.stringify(this.script.configuration);
      this.script.path1 = this.data.path;
      this.script.name = this.data.name;

      this.history.push(JSON.stringify(this.script.configuration));
      if (!res.valid) {
        if (!this.script.configuration.script) {
          this.invalidMsg = 'inventory.message.scriptIsMissing';
        } else {
          this.validateJSON(res.configuration);
        }
      } else {
        this.invalidMsg = '';
      }
      this.ref.detectChanges();
    });
  }

  private validateJSON(json): void {
    const obj = clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.script.valid = res.valid;
      if (this.script.path === this.data.path) {
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      if (res.invalidMsg.match('script')) {
        this.invalidMsg = 'inventory.message.scriptIsMissing';
      }
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
    }
    this.ref.detectChanges();
  }
}
