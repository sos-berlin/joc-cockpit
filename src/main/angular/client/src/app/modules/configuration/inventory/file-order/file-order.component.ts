import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges, ViewChild
} from '@angular/core';
import {Subscription} from 'rxjs';
import {isEmpty, isEqual} from 'underscore';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {InventoryObject} from '../../../../models/enums';
import {InventoryService} from '../inventory.service';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';
import {WorkflowService} from "../../../../services/workflow.service";

@Component({
  selector: 'app-file-order',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-order.component.html'
})
export class FileOrderComponent implements OnChanges, OnInit, OnDestroy {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;
  @Input() securityLevel: any;

  invalidMsg: string;
  isLocalChange: string;
  favList = [];
  zones = [];
  agentList = [];
  workflowTree = [];
  fileOrder: any = {};
  objectType = InventoryObject.FILEORDERSOURCE;
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  lastModified: any = '';
  isTreeShow = false;
  isStore = false;
  tag: any;
  tags = [];
  allTags = [];
  filteredOptions: string[] = [];
  inputVisible = false;
  inputValue = '';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  @ViewChild('inputElement', {static: false}) inputElement?: ElementRef;

  constructor(public coreService: CoreService, private dataService: DataService, private translate: TranslateService,
              public inventoryService: InventoryService, private ref: ChangeDetectorRef, private modal: NzModalService, private workflowService: WorkflowService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.fileOrder.actual) {
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
    if (changes['data']) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.fileOrder = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnInit(): void {
    this.zones = this.coreService.getTimeZoneList();
    this.fetchTags();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.fileOrder.name) {
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
              if (this.isLocalChange !== this.fileOrder.path) {
                this.getObject();
              } else {
                this.isLocalChange = '';
              }
            }
          }
        }
        if (args.eventSnapshots[j].eventType.match(/InventoryTreeUpdated/)) {
          this.getWorkflows();
        }
      }
    }
  }

  private getWorkflows(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerId,
      forInventory: true,
      types: [InventoryObject.WORKFLOW]
    }).subscribe((res) => {
      this.workflowTree = this.coreService.prepareTree(res, true);
    });
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    const obj: any = {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType
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
      if (res.configuration.directoryExpr) {
        this.coreService.removeSlashToString(res.configuration, 'directoryExpr');
      }
      this.fileOrder = res;
      this.fileOrder.path1 = this.data.path;
      this.fileOrder.name = this.data.name;
      this.fileOrder.actual = JSON.stringify(res.configuration);
      this.tags = res.configuration.tags || [];
      if (!this.fileOrder.configuration.timeZone) {
        // Daily plan time zone
        let timeZone = sessionStorage.getItem('$SOS$DAILYPLANTIMEZONE');
        if (!timeZone || timeZone == 'undefined' || timeZone == 'null') {
          this.getDailyPlanTimeZone();
        } else {
          this.fileOrder.configuration.timeZone = timeZone;
        }
      }
      this.agentList = this.coreService.clone(this.inventoryService.agentList);
      if (this.workflowTree.length === 0) {
        this.getWorkflows();
      }
      this.getFavList();
      if (!res.valid) {
        if (!this.fileOrder.configuration.workflowName) {
          this.invalidMsg = 'inventory.message.workflowIsMissing';
        } else if (!this.fileOrder.configuration.agentName) {
          this.invalidMsg = 'workflow.message.agentIsMissing';
        } else if (!this.fileOrder.configuration.directoryExpr) {
          this.invalidMsg = 'inventory.message.directoryIsMissing';
        } else {
          this.validateJSON(res.configuration);
        }
      } else {
        this.invalidMsg = '';
      }
      this.history.push(JSON.stringify(this.fileOrder.configuration));
      this.ref.detectChanges();
    });
  }

  private getDailyPlanTimeZone(): void {
    this.coreService.post('configurations', {configurationType: 'GLOBALS'}).subscribe({
      next: (res) => {
        let timeZone = '';
        if (res.configurations[0] && res.configurations[0].configurationItem) {
          const configuration = JSON.parse(res.configurations[0].configurationItem);
          timeZone = configuration?.dailyplan.time_zone?.value;
        }
        if (!timeZone) {
          timeZone = res.defaultGlobals?.dailyplan?.time_zone?.default;
        }
        sessionStorage.setItem('$SOS$DAILYPLANTIMEZONE', timeZone);
        this.fileOrder.configuration.timeZone = timeZone;
      }
    });
  }

  private getFavList(): void {
    this.coreService.post('inventory/favorites', {
      types: ['FACET'],
      limit: this.preferences.maxFavoriteEntries || 10
    }).subscribe({
      next: (res: any) => {
        this.favList = res.favorites;
      }
    });
  }

  private validateJSON(json): void {
    const obj = this.coreService.clone(json);
    obj.path = this.data.path;
    if (obj.directoryExpr) {
      this.coreService.addSlashToString(obj, 'directoryExpr');
    }
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.fileOrder.valid = res.valid;
      if (this.fileOrder.path === this.data.path) {
        if (this.data.valid !== res.valid) {
          this.saveJSON(true, true);
        }
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      this.invalidMsg = res.invalidMsg;
      if (res.invalidMsg.match('workflowName') && !res.invalidMsg.match('file')) {
        this.invalidMsg = 'inventory.message.workflowIsMissing';
      } else if (res.invalidMsg.match('agentName')) {
        this.invalidMsg = 'workflow.message.agentIsMissing';
      } else if (res.invalidMsg.match('directoryExpr: is missing but it is required')) {
        this.invalidMsg = 'inventory.message.directoryIsMissing';
      }
    }
    this.ref.detectChanges();
  }

  rename(inValid): void {
    if (this.data.id === this.fileOrder.id && this.data.name !== this.fileOrder.name) {
      if (!inValid) {
        this.fileOrder.path = (this.fileOrder.path1 + (this.fileOrder.path1 === '/' ? '' : '/') + this.fileOrder.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'FileOrderSource',
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
              this.renameFileOrder(result);
            } else {
              this.fileOrder.name = this.data.name;
              this.fileOrder.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameFileOrder();
        }
      } else {
        this.fileOrder.name = this.data.name;
        this.fileOrder.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameFileOrder(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.fileOrder.name;
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
        this.fileOrder.name = this.data.name;
        this.fileOrder.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
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

  detectChanges(): void {
    this.ref.detectChanges();
  }

  deploy(): void {
    this.checkForDeploy(50);
  }

  private checkForDeploy(time: number): void {
    setTimeout(() => {
      if (this.isStore) {
        this.checkForDeploy(100);
      } else {
        this.dataService.reloadTree.next({deploy: this.fileOrder});
      }
    }, time);
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.fileOrder});
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
      this.fileOrder.configuration = JSON.parse(obj);
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
      this.fileOrder.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  navToWorkflow(): void {
    this.dataService.reloadTree.next({
      navigate: {
        name: this.fileOrder.configuration.workflowName,
        type: InventoryObject.WORKFLOW
      }
    });
  }

  changeValue($event, type): void {
    this.fileOrder.configuration[type] = $event;
    this.saveJSON();
  }

  saveJSON(flag = false, skip = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if (skip || (this.fileOrder.actual && !isEqual(this.fileOrder.actual, JSON.stringify(this.fileOrder.configuration)))) {
      let isValid = false;
      if (this.fileOrder.configuration.workflowName && this.fileOrder.configuration.agentName) {
        isValid = true;
      }
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.fileOrder.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }
      const obj = this.coreService.clone(this.fileOrder.configuration);
      if (obj.directoryExpr) {
        this.coreService.addSlashToString(obj, 'directoryExpr');
      }
      if(this.tags){
        obj.tags = this.tags
      }
      const request: any = {
        configuration: obj,
        valid: isValid,
        path: this.fileOrder.path,
        objectType: this.objectType,
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
          if (res.path === this.fileOrder.path) {
            this.isLocalChange = res.path;
            this.lastModified = res.configurationDate;
            this.fileOrder.actual = JSON.stringify(this.fileOrder.configuration);
            this.data.valid = res.valid;
            this.fileOrder.valid = res.valid;
            this.fileOrder.deployed = false;
            this.data.deployed = false;
            this.setErrorMessage(res);
          }
        }, error: () => {
          this.isStore = false;
          this.ref.detectChanges()
        }
      });
    }
  }

  onSelect(name) {
    this.isTreeShow = false;
    this.fileOrder.configuration.workflowName = name;
    this.saveJSON();
    this.ref.detectChanges();
  }

  onBlur(): void {
    this.isTreeShow = false;
  }

  private fetchTags(): void {
    this.coreService.post('tags', {}).subscribe((res) => {
      this.allTags = res.tags;
    });
    this.coreService.post('orders/tag/search', {
      search: '',
      controllerId: this.schedulerId
    }).subscribe({
      next: (res: any) => {
        this.allTags = res.results;
        this.allTags = this.allTags.map((item) => {
          return item.name;
        })
      }
    });
  }


  onChange(value: string): void {
    this.filteredOptions = this.allTags.filter(option => option.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    this.filteredOptions = this.filteredOptions.filter((tag) => {
      return this.tags.indexOf(tag) == -1;
    })
  }
  handleClose(removedTag: {}): void {
    this.tags = this.tags.filter(tag => tag !== removedTag);
  }

  sliceTagName(tag: string): string {
    const isLongTag = tag.length > 20;
    return isLongTag ? `${tag.slice(0, 20)}...` : tag;
  }

  showInput(): void {
    this.inputVisible = true;
    this.filteredOptions = this.allTags;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }

  handleInputConfirm(): void {
    if (this.inputValue && this.tags.indexOf(this.inputValue) === -1 && this.workflowService.isValidObject(this.inputValue)) {
      this.tags = [...this.tags, this.inputValue];
    }
    this.inputValue = '';
    this.inputVisible = false;
    this.saveJSON(true, true);
  }
}
