import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {isEmpty, isEqual} from 'underscore';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {WorkflowService} from '../../../../services/workflow.service';

@Component({
  selector: 'app-junction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './junction.component.html'
})
export class JunctionComponent implements OnChanges, OnDestroy {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  junction: any = {};
  lifetime: string;
  invalidMsg: string;
  objectType = 'JUNCTION';
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private coreService: CoreService, private workflowService: WorkflowService,
              private dataService: DataService, private ref: ChangeDetectorRef) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.junction.actual) {
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
    if (changes.copyObj && !changes.data){
      return;
    }
    if (changes.reload) {
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
        this.junction = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    if (this.junction.name) {
      this.saveJSON();
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
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }
      if (this.data.deployed !== res.deployed){
        this.data.deployed = res.deployed;
      }
      if (this.data.valid !== res.valid){
        this.data.valid = res.valid;
      }
      this.junction = res;
      this.junction.path1 = this.data.path;
      this.junction.name = this.data.name;
      if (res.configuration.lifetime) {
        this.lifetime = this.workflowService.convertDurationToString(res.configuration.lifetime);
      }
      this.junction.actual = JSON.stringify(res.configuration);
      this.history.push(this.junction.actual);
      this.ref.detectChanges();
    });
  }

  rename(inValid): void {
    if (this.data.id === this.junction.id && this.data.name !== this.junction.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.junction.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe(() => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, () => {
          this.junction.name = this.data.name;
          this.ref.detectChanges();
        });
      } else {
        this.junction.name = this.data.name;
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
      if (this.junction.configuration.documentationName1) {
        if (this.junction.configuration.documentationName !== this.junction.configuration.documentationName1) {
          this.junction.configuration.documentationName = this.junction.configuration.documentationName1;
        }
      } else if (node.key && !node.key.match('/')) {
        if (this.junction.configuration.documentationName !== node.key) {
          this.junction.configuration.documentationName = node.key;
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
    this.dataService.reloadTree.next({deploy: this.junction});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.junction});
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
      this.junction.configuration = JSON.parse(obj);
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
      this.junction.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    if (this.lifetime) {
      this.junction.configuration.lifetime = this.workflowService.convertStringToDuration(this.lifetime);
    }
    if (!isEqual(this.junction.actual, JSON.stringify(this.junction.configuration))) {
      if (flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.junction.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }
      this.coreService.post('inventory/store', {
        configuration: this.junction.configuration,
        valid: true,
        id: this.junction.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.junction.id === this.data.id) {
          this.junction.actual = JSON.stringify(this.junction.configuration);
          this.junction.deployed = false;
          this.data.deployed = false;
          this.ref.detectChanges();
        }
      }, (err) => {
        this.ref.detectChanges();
      });
    }
  }
}
