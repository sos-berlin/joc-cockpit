import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html'
})
export class LockComponent implements OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  lock: any = {};
  objectType = 'LOCK';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
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
      }
    }
  }

  private getObject() {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
      if(res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
      } else{
        res.configuration = {};
      }
      this.lock = res;
      this.lock.path1 = this.data.path;
      this.lock.name = this.data.name;
      this.lock.actual = JSON.stringify(res.configuration);
    });
  }

  rename(inValid) {
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
        });
      } else {
        this.lock.name = this.data.name;
      }
    }
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.lock});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.lock});
  }

  saveJSON() {
    if(this.isTrash) {
      return;
    }
    if (this.lock.actual !== JSON.stringify(this.lock.configuration)) {
      this.lock.configuration.id = this.lock.name;
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
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
