import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';

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
  junctionList = [];

  constructor(private coreService: CoreService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (this.data.type) {
        if (this.junction.actual) {
          this.saveJSON();
        }
        this.getObject();
      } else {
        this.junction = {};
        this.junctionList = changes.data.currentValue.children;
        this.junctionList = [...this.junctionList];
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
    }).subscribe((res) => {
      this.data.children.push(res);
    });
  }

  copyObject(data) {

  }

  editObject(data) {
    this.data = data;
    this.getObject();
  }


  deleteObject(data){

  }

  undeleteObject(data){

  }

  deleteDraft(data){

  }

  deployObject(data){

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
