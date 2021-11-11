import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges, ViewChild
} from '@angular/core';
import {isEmpty, isArray, isEqual, clone, sortBy} from 'underscore';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {CalendarService} from '../../../../services/calendar.service';
import {InventoryObject} from '../../../../models/enums';

@Component({
  selector: 'app-script',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './script.component.html',
})
export class ScriptComponent implements OnDestroy, OnChanges {
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
  objectType = InventoryObject.SCRIPT;
  invalidMsg: string;
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  cmOption: any = {
    lineNumbers: true,
    autoRefresh: true,
    mode: 'shell'
  };
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private coreService: CoreService,
              private calendarService: CalendarService, private dataService: DataService,
              private ref: ChangeDetectorRef) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.script.actual) {
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
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.script.actual) {
      this.saveJSON();
    }
    if (changes.data) {
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
    if (this.script.name) {
      this.saveJSON();
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

  loadData(node, type, $event): void {
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
        this.updateList(node, type);
      }
    } else {
      if (type === 'DOCUMENTATION') {
        if (this.script.configuration.documentationName1) {
          if (this.script.configuration.documentationName !== this.script.configuration.documentationName1) {
            this.script.configuration.documentationName = this.script.configuration.documentationName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.script.configuration.documentationName !== node.key) {
            this.script.configuration.documentationName = node.key;
          }
        }
        this.saveJSON();
      }
    }
  }

  updateList(node, type): void {
    let obj: any = {
      path: node.key,
      objectTypes: [type]
    };
    if (type === 'DOCUMENTATION') {
      obj = {
        folders: [{folder: node.key, recursive: false}],
        onlyWithAssignReference: true
      };
    }
    const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      let data;
      if (type === 'WORKFLOW') {
        data = res.workflows;
      } else if (type === 'DOCUMENTATION') {
        data = res.documentations;
      }
      data = sortBy(data, 'name');
      for (let i = 0; i < data.length; i++) {
        const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
        data[i].title = data[i].assignReference || data[i].name;
        data[i].path = path;
        data[i].key = data[i].assignReference || data[i].name;
        data[i].type = type;
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
      if (type === 'DOCUMENTATION') {
        this.documentationTree = [...this.documentationTree];
      }
      this.ref.detectChanges();
    });
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  rename(inValid): void {
    if (this.data.id === this.script.id && this.data.name !== this.script.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.script.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe((res) => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, (err) => {
          this.script.name = this.data.name;
          this.ref.detectChanges();
        });
      } else {
        this.script.name = this.data.name;
        this.ref.detectChanges();
      }
    }
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

      this.coreService.post('inventory/store', {
        configuration: this.script.configuration,
        valid: !this.script.configuration.script,
        id: this.script.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.script.id === this.data.id) {
          this.script.actual = JSON.stringify(this.script.configuration);
          this.script.valid = res.valid;
          this.data.valid = res.valid;
          this.script.released = false;
          this.data.released = false;
          this.setErrorMessage(res);
        }
      }, () => {
        this.ref.detectChanges();
      });
    }
  }


  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
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

      this.script.actual = JSON.stringify(this.script.configuration);
      this.script.path1 = this.data.path;
      this.script.name = this.data.name;

      this.history.push(this.script.actual);
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
      if (this.script.id === this.data.id) {
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    }, () => {
    });
  }

  private setErrorMessage(res): void {
    if (res.invalidMsg) {
      if (res.invalidMsg.match('script')) {
        this.invalidMsg = 'inventory.message.scriptIsMissing';
      }
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
    } else {
      this.invalidMsg = '';
    }
    this.ref.detectChanges();
  }
}
