import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {isEmpty, isEqual} from 'underscore';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

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
  objectType = 'LOCK';

  indexOfNextAdd = 0;
  history = [];
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private coreService: CoreService, private dataService: DataService,
              private ref: ChangeDetectorRef) {
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
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
      this.history = [];
      this.indexOfNextAdd = 0;
      if (res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
      } else {
        res.configuration = {};
      }
      if (this.data.deployed !== res.deployed) {
        this.data.deployed = res.deployed;
      }
      if (this.data.valid !== res.valid) {
        this.data.valid = res.valid;
      }
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
        }).subscribe((res) => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, (err) => {
          this.lock.name = this.data.name;
          this.ref.detectChanges();
        });
      } else {
        this.lock.name = this.data.name;
        this.ref.detectChanges();
      }
    }
  }

  deploy(): void {
    this.dataService.reloadTree.next({deploy: this.lock});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.lock});
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
      this.ref.detectChanges();
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
      this.ref.detectChanges();
    }
  }

  saveJSON(): void {
    if (this.isTrash) {
      return;
    }
    if (!isEqual(this.lock.actual, JSON.stringify(this.lock.configuration))) {
      if (this.history.length === 20) {
        this.history.shift();
      }
      this.history.push(JSON.stringify(this.lock.configuration));
      this.indexOfNextAdd = this.history.length - 1;
      this.coreService.post('inventory/store', {
        configuration: this.lock.configuration,
        valid: this.lock.configuration.limit > -1,
        id: this.lock.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.lock.id === this.data.id) {
          this.lock.actual = JSON.stringify(this.lock.configuration);
          this.data.valid = this.lock.configuration.limit > -1;
          this.lock.valid = this.lock.configuration.limit > -1;
          this.lock.deployed = false;
          this.data.deployed = false;
          this.ref.detectChanges();
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
