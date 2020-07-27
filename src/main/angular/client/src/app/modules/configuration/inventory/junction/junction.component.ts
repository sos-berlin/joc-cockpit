import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-junction',
  templateUrl: './junction.component.html',
  styleUrls: ['./junction.component.css']
})
export class JunctionComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;

  junction: any = {};
  searchKey: string;
  filter: any = {sortBy: 'name', reverse: false};
  isUnique = true;

  objectType = 'JUNCTION';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.junction.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.junction = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.junction.name) {
      this.saveJSON();
    }
  }

  private getObject() {
    let _path;
    if (this.data.path === '/') {
      _path = this.data.path + this.data.name;
    } else {
      _path = this.data.path + '/' + this.data.name;
    }
    this.coreService.post('inventory/read/configuration', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      id: this.data.id,
    }).subscribe((res: any) => {
      this.junction = res;
      this.junction.path1 = this.data.path;
      this.junction.name = this.data.name;
      this.junction.actual = res.configuration;
      this.junction.configuration = JSON.parse(res.configuration);
    });
  }
  /** -------------- List View Begin --------------*/
  sort(sort: { key: string; value: string }): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = sort.key;
  }

  add() {
    let _path, name = this.coreService.getName(this.data.children, 'junction1', 'name', 'junction');
    if (this.data.path === '/') {
      _path = this.data.path + name;
    } else {
      _path = this.data.path + '/' + name;
    }
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

  editObject(data) {
    this.dataService.reloadTree.next({set: data});
  }

  /** -------------- List View End --------------*/
  private saveJSON() {
    if (this.junction.actual !== JSON.stringify(this.junction.configuration)) {
      let _path;
      if (this.junction.path1 === '/') {
        _path = this.junction.path1 + this.junction.name;
      } else {
        _path = this.junction.path1 + '/' + this.junction.name;
      }
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.junction.configuration),
        path: _path,
        id: this.junction.id,
        objectType: this.objectType
      }).subscribe(res => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    }
  }
}
