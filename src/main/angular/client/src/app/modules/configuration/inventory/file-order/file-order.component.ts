import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
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

  invalidMsg: string;
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
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;


  constructor(public coreService: CoreService, private dataService: DataService, private translate: TranslateService,
              public inventoryService: InventoryService, private ref: ChangeDetectorRef, private modal: NzModalService) {
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
        if (args.eventSnapshots[j].eventType.match(/InventoryTreeUpdated/)) {
          this.getWorkflows();
          break;
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
    this.dataService.reloadTree.next({deploy: this.fileOrder});
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

      const request: any = {
        configuration: obj,
        valid: isValid,
        path: this.fileOrder.path,
        objectType: this.objectType
      };

      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }
      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.fileOrder.path) {
            this.lastModified = res.configurationDate;
            this.fileOrder.actual = JSON.stringify(this.fileOrder.configuration);
            this.data.valid = res.valid;
            this.fileOrder.valid = res.valid;
            this.fileOrder.deployed = false;
            this.data.deployed = false;
            this.setErrorMessage(res);
          }
        }, error: () => this.ref.detectChanges()
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
}
