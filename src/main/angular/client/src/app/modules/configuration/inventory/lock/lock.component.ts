import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {isEmpty, isEqual} from 'underscore';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {InventoryObject} from '../../../../models/enums';
import {InventoryService} from '../inventory.service';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';

@Component({
  selector: 'app-lock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lock.component.html'
})
export class LockComponent implements OnChanges, OnDestroy {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  lock: any = {};
  objectType = InventoryObject.LOCK;
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  lastModified: any = '';
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private dataService: DataService, private translate: TranslateService,
              private ref: ChangeDetectorRef, private router: Router, public inventoryService: InventoryService, private modal: NzModalService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.lock.actual) {
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
        this.lock = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    if (this.lock.name) {
      this.saveJSON();
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    const obj: any = {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
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
      this.lock = res;
      this.lock.path1 = this.data.path;
      this.lock.name = this.data.name;
      this.lock.actual = JSON.stringify(res.configuration);
      this.history.push(JSON.stringify(this.lock.configuration));
      this.ref.detectChanges();
    });
  }

  rename(inValid): void {
    if (this.data.id === this.lock.id && this.data.name !== this.lock.name) {
      if (!inValid) {
        this.lock.path = (this.lock.path1 + (this.lock.path1 === '/' ? '' : '/') + this.lock.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'NoticeBoard',
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
              this.renameLock(result);
            } else {
              this.lock.name = this.data.name;
              this.lock.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameLock();
        }
      } else {
        this.lock.name = this.data.name;
        this.lock.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameLock(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.lock.name;
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
        this.dataService.reloadTree.next({ rename: data });
      }, error: () => {
        this.lock.name = this.data.name;
        this.lock.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
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
    this.dataService.reloadTree.next({deploy: this.lock});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.lock});
  }

  navToLockTab(): void {
    if (this.lock.hasDeployments || this.data.deployed) {
      const PATH = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
      const pathArr = [];
      const arr = PATH.split('/');
      const resourceFilters = this.coreService.getResourceTab().locks;
      resourceFilters.selectedkeys = [];
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

      resourceFilters.expandedKeys = pathArr;
      resourceFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
      resourceFilters.expandedObjects = [this.data.name];
      this.router.navigate(['/resources/locks']).then();
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
      this.lock.configuration = JSON.parse(obj);
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
      this.lock.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if(this.lock.configuration.limit === ''){
      this.lock.configuration.limit = 1;
    }
    if (!isEqual(this.lock.actual, JSON.stringify(this.lock.configuration))) {
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.lock.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }

      const request: any = {
        configuration: this.lock.configuration,
        valid: true,
        path: this.lock.path,
        objectType: this.objectType
      };

      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }
      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.lock.path) {
            this.lastModified = res.configurationDate;
            this.lock.actual = JSON.stringify(this.lock.configuration);
            this.data.valid = res.valid;
            this.lock.valid = res.valid;
            this.lock.deployed = false;
            this.data.deployed = false;
            this.ref.detectChanges();
          }
        }, error: () => this.ref.detectChanges()
      });
    }
  }
}
