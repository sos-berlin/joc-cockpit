import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.css']
})
export class LockComponent implements OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;

  lock: any = {};
  objectType = 'LOCK';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.lock = {};
      }
    }
  }

  private getObject() {
    this.coreService.post('inventory/read/configuration', {
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
          name: name
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
    if (this.lock.actual !== JSON.stringify(this.lock.configuration)) {
      const _path = this.lock.path1 + (this.lock.path1 === '/' ? '' : '/') + this.lock.name;
      this.coreService.post('inventory/store', {
        configuration: this.lock.configuration,
        path: _path,
        valid: true,
        id: this.lock.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.lock.id === this.data.id) {
          this.lock.actual = JSON.stringify(this.lock.configuration);
          this.lock.deployed = false;
          this.data.deployed = false;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
