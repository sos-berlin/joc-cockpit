import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {isEmpty, isEqual} from 'underscore';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {InventoryObject} from '../../../../models/enums';
import {InventoryService} from '../inventory.service';

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
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private dataService: DataService,
              private ref: ChangeDetectorRef, private router: Router, public inventoryService: InventoryService) {
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
    if (changes.data) {
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
      id: this.data.id
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked && !this.isTrash) {
      obj.controllerId = this.schedulerId;
    }
    this.coreService.post(URL, obj).subscribe((res: any) => {
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
      this.history.push(this.lock.actual);
      this.ref.detectChanges();
    });
  }

  rename(inValid): void {
    if (this.data.id === this.lock.id && this.data.name !== this.lock.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.lock.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe({
          next: () => {
            if (data.id === this.data.id) {
              this.data.name = name;
            }
            data.name = name;
            this.dataService.reloadTree.next({rename: data});
          }, error: () => {
            this.lock.name = this.data.name;
            this.ref.detectChanges();
          }
        });
      } else {
        this.lock.name = this.data.name;
        this.ref.detectChanges();
      }
    }
  }

  private getDocumentations(): void {
    if (this.documentationTree.length === 0) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
  }

  updateList(node): void {
    const obj = {
      folders: [{folder: node.key, recursive: false}],
      onlyWithAssignReference: true
    };
    this.coreService.post('documentations', obj).subscribe((res: any) => {
      let data = res.documentations;
      for (let i = 0; i < data.length; i++) {
        const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
        data[i].title = data[i].assignReference || data[i].name;
        data[i].path = path;
        data[i].key = data[i].assignReference || data[i].name;
        data[i].type = 'DOCUMENTATION';
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
      this.documentationTree = [...this.documentationTree];
      this.ref.detectChanges();
    });
  }

  loadData(node, $event): void {
    if (!node || !node.origin) {
      return;
    }
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
        this.updateList(node);
      }
    } else {
      if (this.lock.configuration.documentationName1) {
        if (this.lock.configuration.documentationName !== this.lock.configuration.documentationName1) {
          this.lock.configuration.documentationName = this.lock.configuration.documentationName1;
        }
      } else if (node.key && !node.key.match('/')) {
        if (this.lock.configuration.documentationName !== node.key) {
          this.lock.configuration.documentationName = node.key;
        }
      }
      setTimeout(() => {
        this.saveJSON();
      }, 10);
    }
  }

  onExpand(e): void {
    this.loadData(e.node, null);
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
      this.router.navigate(['/resources/locks']);
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
      this.coreService.post('inventory/store', {
        configuration: this.lock.configuration,
        valid: true,
        id: this.lock.id,
        objectType: this.objectType
      }).subscribe({
        next: (res: any) => {
          if (res.id === this.data.id && this.lock.id === this.data.id) {
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
