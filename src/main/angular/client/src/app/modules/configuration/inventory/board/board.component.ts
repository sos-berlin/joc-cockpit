import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges} from '@angular/core';
import {clone, isEmpty, isEqual} from 'underscore';
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
  selector: 'app-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './board.component.html'
})
export class BoardComponent {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;
  @Input() securityLevel: any;

  board: any = {};
  boardObj: any = {
    endOfLifeMsg: '$js7EpochMilli + ',
    units: 'Milliseconds'
  };
  invalidMsg: string;
  isLocalChange: string;
  objectType = InventoryObject.NOTICEBOARD;
  documentationTree = [];
  indexOfNextAdd = 0;
  lastModified: any = '';
  history = [];
  globalPostOrderToNoticeId: string = '';
  plannablePostOrderToNoticeId: string = '';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  units = [
    {label: 'inventory.label.milliseconds', value: 'Milliseconds'},
    {label: 'inventory.label.seconds', value: 'Seconds'},
    {label: 'inventory.label.minutes', value: 'Minutes'},
    {label: 'inventory.label.hours', value: 'Hours'},
    {label: 'inventory.label.days', value: 'Days'},
    {label: 'HH:MM:SS', value: 'HH:MM:SS'}
  ];
  listOfNoticeMsg = [
    {
      label: 'inventory.label.matchingDailyPlanDate',
      value: 'replaceAll($js7OrderId, \'^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*$\', \'$1\')'
    },
    {
      label: 'inventory.label.matchingDailyPlanDateAndOrderName',
      value: 'replaceAll($js7OrderId, \'^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*-([^:]*)(?::[^|]*)?([|].*)?$\', \'$1$2$3\')'
    },
    {
      label: 'inventory.label.matchingOrderName',
      value: 'replaceAll($js7OrderId, \'^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]*)(?::[^|]*)?([|].*)?$\', \'$1$2\')'
    }];

  listOfNoticeMsgPlan = [
    {
      label: 'inventory.label.matchingOrderName',
      value: 'replaceAll($js7OrderId, \'^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]*)(?::[^|]*)?([|].*)?$\', \'$1$2\')'
    }];

  constructor(public coreService: CoreService, private translate: TranslateService, public inventoryService: InventoryService,
              private dataService: DataService, private ref: ChangeDetectorRef, private router: Router, private modal: NzModalService) {
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
        this.board = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.board.name) {
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
              if (this.isLocalChange !== this.board.path) {
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
      this.board = res;
      this.board.path1 = this.data.path;
      this.board.name = this.data.name;
      this.boardObj = {
        endOfLifeMsg: '$js7EpochMilli + ',
        units: 'Milliseconds'
      };
      if (res.configuration.endOfLife) {
        this.boardObj.endOfLife = this.convertIntoUnit(res.configuration.endOfLife.replace(this.boardObj.endOfLifeMsg, ''));
      } else {
        this.boardObj.endOfLife = '';
      }

      this.boardObj.toNoticeMsg = clone(this.board.configuration.postOrderToNoticeId);
      this.boardObj.toNoticeMsgPlan = clone(this.board.configuration.postOrderToNoticeId);
      this.boardObj.readingOrderToNoticeIdMsg = clone(this.board.configuration.expectOrderToNoticeId);
      this.globalPostOrderToNoticeId = this.board.configuration.boardType === 'GLOBAL' ? this.board.configuration.postOrderToNoticeId : '';
      this.plannablePostOrderToNoticeId = this.board.configuration.boardType === 'PLANNABLE' ? this.board.configuration.postOrderToNoticeId : '';

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
      if (this.board.path === this.data.path) {
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
        this.board.path = (this.board.path1 + (this.board.path1 === '/' ? '' : '/') + this.board.name);
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
            nzData: {
              comments
            },
            nzFooter: null,
            nzClosable: false,
            nzMaskClosable: false
          });
          modal.afterClose.subscribe(result => {
            if (result) {
              this.renameBoard(result);
            } else {
              this.board.name = this.data.name;
              this.board.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameBoard();
        }
      } else {
        this.board.name = this.data.name;
        this.board.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameBoard(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.board.name;
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
        this.board.name = this.data.name;
        this.board.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
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
      this.router.navigate(['/resources/boards']).then();
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
    if (type === 'toNoticeGlobal') {
      this.globalPostOrderToNoticeId = $event;
    } else if(type === 'toNoticePlannable') {
      this.plannablePostOrderToNoticeId = $event;
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

  onChange(): void {
    this.saveJSON()
  }

  saveJSON(flag = false, skip = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if (this.board.configuration.boardType === 'GLOBAL') {
      this.board.configuration.postOrderToNoticeId = this.globalPostOrderToNoticeId;
    } else if (this.board.configuration.boardType === 'PLANNABLE') {
      this.board.configuration.postOrderToNoticeId = this.plannablePostOrderToNoticeId;
    }

    if (!this.board.configuration.postOrderToNoticeId) {
      delete this.board.configuration.postOrderToNoticeId;
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
      if (this.board.configuration.boardType === 'PLANNABLE') {
        delete this.board.configuration.expectOrderToNoticeId
        delete this.board.configuration.endOfLife
        delete this.boardObj.endOfLife
      }
      const request: any = {
        configuration: this.board.configuration,
        valid: !!(this.board.configuration.postOrderToNoticeId && this.board.configuration.expectOrderToNoticeId && this.board.configuration.endOfLife),
        path: this.board.path,
        objectType: this.objectType
      };

      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }
      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.board.path) {
            this.isLocalChange = res.path;
            this.lastModified = res.configurationDate;
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
