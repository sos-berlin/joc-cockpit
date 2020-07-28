import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.css']
})
export class LockComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;

  lock: any = {};
  searchKey: string;
  isUnique = true;
  objectType = 'LOCK';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.lock.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.lock = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.lock.name) {
      this.saveJSON();
    }
  }

  private getObject() {
    const _path  = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
    this.coreService.post('inventory/read/configuration', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      id: this.data.id,
    }).subscribe((res: any) => {
      this.lock = res;
      this.lock.path1 = this.data.path;
      this.lock.name = this.data.name;
      this.lock.actual = res.configuration;
      this.lock.configuration = JSON.parse(res.configuration);
    });
  }

  /** -------------- List View Begin --------------*/

  add() {
    const name = this.coreService.getName(this.data.children, 'lock1', 'name', 'lock');
    const _path  = this.data.path + (this.data.path === '/' ? '' : '/') + name;
    this.coreService.post('inventory/store', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      configuration: '{}'
    }).subscribe((res: any) => {
      this.data.children.push({
        type: this.data.object || this.data.type,
        path: this.data.path,
        name: name,
        id: res.id
      });
      this.data.children = [...this.data.children];
      this.dataService.reloadTree.next({add: true});
    });
  }

  /** -------------- List View End --------------*/
  private saveJSON() {
    if (this.lock.actual !== JSON.stringify(this.lock.configuration)) {
      const _path  = this.lock.path1 + (this.lock.path1 === '/' ? '' : '/') + this.lock.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.lock.configuration),
        path: _path,
        id: this.lock.id,
        objectType: this.objectType
      }).subscribe(res => {

      }, (err) => {
        console.log(err);
      });
    }
  }
}
