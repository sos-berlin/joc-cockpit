import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import * as _ from 'underscore';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {WorkflowService} from '../../../../services/workflow.service';

@Component({
  selector: 'app-junction',
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

  indexOfNextAdd = 0;
  history = [];
  subscription: Subscription;

  constructor(private coreService: CoreService, private workflowService: WorkflowService, private dataService: DataService) {
    this.subscription = this.dataService.functionAnnounced$.subscribe(res => {
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
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
      if (res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
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
        this.lifetime = this.workflowService.convertDurationToString(res.configuration.lifetime)
      }
      this.junction.actual = JSON.stringify(res.configuration);
      this.history.push(this.junction.actual);
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
        });
      } else {
        this.junction.name = this.data.name;
      }
    }
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
    }
  }

  saveJSON(): void {
    if (this.isTrash) {
      return;
    }
    if (this.lifetime) {
      this.junction.configuration.lifetime = this.workflowService.convertStringToDuration(this.lifetime);
    }
    if (!_.isEqual(this.junction.actual, JSON.stringify(this.junction.configuration))) {
      if (this.history.length === 20) {
        this.history.shift();
      }
      this.history.push(JSON.stringify(this.junction.configuration));
      this.indexOfNextAdd = this.history.length - 1;
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
        }
      });
    }
  }
}
