import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {clone, isEmpty, isEqual} from 'underscore';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {WorkflowService} from '../../../../services/workflow.service';
import {InventoryObject} from '../../../../models/enums';
import {InventoryService} from '../inventory.service';

@Component({
  selector: 'app-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './board.component.html'
})
export class BoardComponent implements OnChanges, OnDestroy {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  board: any = {};
  boardObj: any = {
    endOfLifeMsg: '$js7EpochMilli + ',
    units: 'Milliseconds'
  };
  invalidMsg: string;
  objectType = InventoryObject.NOTICEBOARD;
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private workflowService: WorkflowService, public inventoryService: InventoryService,
              private dataService: DataService, private ref: ChangeDetectorRef, private router: Router) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.board.actual) {
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
        this.board = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    if (this.board.name) {
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
      this.board = res;
      this.board.path1 = this.data.path;
      this.board.name = this.data.name;
      this.boardObj = {
        endOfLifeMsg: '$js7EpochMilli + '
      };
      if (res.configuration.endOfLife) {
        this.boardObj.endOfLife = this.convertIntoUnit(res.configuration.endOfLife.replace(this.boardObj.endOfLifeMsg, ''));
      } else {
        this.boardObj.endOfLife = '';
      }

      this.boardObj.toNoticeMsg = clone(this.board.configuration.postOrderToNoticeId);
      this.boardObj.readingOrderToNoticeIdMsg = clone(this.board.configuration.expectOrderToNoticeId);

      this.board.actual = JSON.stringify(res.configuration);
      this.history.push(this.board.actual);
      if (!res.valid) {
        if (!this.board.configuration.expectOrderToNoticeId) {
          this.invalidMsg = 'inventory.message.readingOrderToNoticeIdIsMissing';
        } else if (!this.board.configuration.postOrderToNoticeId) {
          this.invalidMsg = 'inventory.message.toNoticeIsMissing';
        } else if (!this.boardObj.endOfLife) {
          this.invalidMsg = 'inventory.message.endOfLifeIsMissing';
        } else {
          this.validateJSON(res.configuration);
        }
      } else {
        this.invalidMsg = '';
      }
      this.ref.detectChanges();
    });
  }

  private convertIntoUnit(val): string {
    val = this.convertDurationToString(val);
    if (/\s*\d+\s*:\s*\d+\s*:\s*\d+\s*/i.test(val)) {
      this.boardObj.units = 'HH:MM:SS';
    } else {
      const arr = val.split('*');
      if (arr && arr.length === 5) {
        this.boardObj.units = 'Days';
        val = arr[0];
      } else if (arr && arr.length === 4) {
        this.boardObj.units = 'Hours';
        val = arr[0];
      } else if (arr && arr.length === 3) {
        this.boardObj.units = 'Minutes';
        val = arr[0];
      } else if (arr && arr.length === 2) {
        this.boardObj.units = 'Seconds';
        val = arr[0];
      } else {
        this.boardObj.units = 'Milliseconds';
      }
      if (val && typeof val === 'string') {
        val = val.trim();
      }
    }
    return val;
  }

  private validateJSON(json): void {
    const obj = clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.board.valid = res.valid;
      if (this.board.id === this.data.id) {
        if (this.data.valid !== res.valid) {
          this.saveJSON(false, true);
        }
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
      this.ref.detectChanges();
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      if (res.invalidMsg.match('expectOrderToNoticeId')) {
        this.invalidMsg = 'inventory.message.readingOrderToNoticeIdIsMissing';
      } else if (res.invalidMsg.match('toNoticeIsMissing')) {
        this.invalidMsg = 'inventory.message.toNoticeIsMissing';
      } else if (res.invalidMsg.match('endOfLife')) {
        this.invalidMsg = 'inventory.message.endOfLifeIsMissing';
      }
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
    }
  }

  rename(inValid): void {
    if (this.data.id === this.board.id && this.data.name !== this.board.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.board.name;
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
            this.board.name = this.data.name;
            this.ref.detectChanges();
          }
        });
      } else {
        this.board.name = this.data.name;
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
      if (this.board.configuration.documentationName1) {
        if (this.board.configuration.documentationName !== this.board.configuration.documentationName1) {
          this.board.configuration.documentationName = this.board.configuration.documentationName1;
        }
      } else if (node.key && !node.key.match('/')) {
        if (this.board.configuration.documentationName !== node.key) {
          this.board.configuration.documentationName = node.key;
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
    this.dataService.reloadTree.next({deploy: this.board});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.board});
  }

  navToBoardTab(): void {
    if (this.board.hasDeployments || this.data.deployed) {
      const PATH = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
      const pathArr = [];
      const arr = PATH.split('/');
      const resourceFilters = this.coreService.getResourceTab().boards;
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
      resourceFilters.expandedObjects = [PATH];
      this.router.navigate(['/resources/boards']);
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
      this.board.configuration = JSON.parse(obj);
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
      this.board.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  changeExp($event, type: string): void {
    if (type === 'toNotice') {
      this.board.configuration.postOrderToNoticeId = $event;
    } else {
      this.board.configuration.expectOrderToNoticeId = $event;
    }
    this.saveJSON();
  }

  changeUnit($event): void {
    if ($event === 'HH:MM:SS') {
      if (!isNaN(this.boardObj.endOfLife)) {
        this.boardObj.endOfLife = '';
      }
    } else {
      if (isNaN(this.boardObj.endOfLife)) {
        this.boardObj.endOfLife = '';
      }
    }
    this.saveJSON();
  }

  private getConvertedValue(value): any {
    let str = value;
    if (this.boardObj.units === 'Seconds') {
      str = str + ' * 1000';
    } else if (this.boardObj.units === 'Minutes') {
      str = str + ' * 60 * 1000';
    } else if (this.boardObj.units === 'Hours') {
      str = str + ' * 60 * 60 * 1000';
    } else if (this.boardObj.units === 'Days') {
      str = str + ' * 24 * 60 * 60 * 1000';
    } else if (this.boardObj.units === 'HH:MM:SS') {
      const arr = value.split(':');
      let ms = 0;
      for (const i in arr) {
        if (i === '0') {
          ms += (arr[i] * 60 * 60 * 1000);
        } else if (i === '1') {
          ms += (arr[i] * 60 * 1000);
        } else {
          ms += (arr[i] * 1000);
        }
      }
      str = ms;
    }
    return str;
  }

  convertDurationToString(miliSeconds: any): any {
    let seconds;
    if (!isNaN(miliSeconds)) {
      if (miliSeconds < 1000) {
        return miliSeconds;
      } else {
        seconds = miliSeconds / 1000;
        if (seconds % 1 !== 0) {
          return seconds;
        }
      }
      const d = Math.floor((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) / (3600 * 24));
      const h = Math.floor(((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
      const M = Math.floor((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
      const s = Math.floor(((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
      if (d == 0) {
        if (h == 0 && M == 0) {

        } else {
          return (h < 10 ? '0' + h : h) + ':' + (M < 10 ? '0' + M : M) + ':' + (s < 10 ? '0' + s : s);
        }
      }
    }
    return miliSeconds;
  }

  private chectTime(): void {
    if (this.boardObj.units === 'HH:MM:SS') {
      if (/^\d{1,2}:\d{2}?$/i.test(this.boardObj.endOfLife)) {
        this.boardObj.endOfLife = this.boardObj.endOfLife + ':00';
      } else if (/^\d{1,2}:\d{2}(:)?$/i.test(this.boardObj.endOfLife)) {
        this.boardObj.endOfLife = this.boardObj.endOfLife + '00';
      } else if (/^\d{1,2}?$/i.test(this.boardObj.endOfLife)) {
        this.boardObj.endOfLife = this.boardObj.endOfLife + ':00:00';
      }
      if (this.boardObj.endOfLife === '00:00') {
        this.boardObj.endOfLife = '00:00:00';
      } else if (this.boardObj.endOfLife.length === 3) {
        this.boardObj.endOfLife = this.boardObj.endOfLife + '00:00';
      } else if (this.boardObj.endOfLife.length === 4) {
        this.boardObj.endOfLife = this.boardObj.endOfLife + '0:00';
      } else if (this.boardObj.endOfLife.length === 6) {
        this.boardObj.endOfLife = this.boardObj.endOfLife + '00';
      } else if (this.boardObj.endOfLife.length === 7) {
        this.boardObj.endOfLife = this.boardObj.endOfLife + '0';
      }
    }
  }

  saveJSON(flag = false, skip = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if (this.boardObj.endOfLife) {
      this.chectTime();
      this.board.configuration.endOfLife = this.boardObj.endOfLifeMsg + this.getConvertedValue(this.boardObj.endOfLife);
    } else {
      delete this.board.configuration.endOfLife;
    }
    if (skip || !isEqual(this.board.actual, JSON.stringify(this.board.configuration))) {
      if (flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.board.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }
      this.coreService.post('inventory/store', {
        configuration: this.board.configuration,
        valid: !!(this.board.configuration.postOrderToNoticeId && this.board.configuration.expectOrderToNoticeId && this.board.configuration.endOfLife),
        id: this.board.id,
        objectType: this.objectType
      }).subscribe({
        next: (res: any) => {
          if (res.id === this.data.id && this.board.id === this.data.id) {
            this.board.actual = JSON.stringify(this.board.configuration);
            this.board.deployed = false;
            this.data.deployed = false;
            this.board.valid = res.valid;
            this.data.valid = res.valid;
            this.setErrorMessage(res);
            this.ref.detectChanges();
          }
        }, error: () => this.ref.detectChanges()
      });
    }
  }
}
