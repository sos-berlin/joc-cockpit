import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-job-class',
  templateUrl: './job-class.component.html',
  styleUrls: ['./job-class.component.css']
})
export class JobClassComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;

  searchKey: string;
  filter: any = {sortBy: 'name', reverse: false};
  jobClass: any = {};
  isUnique = true;
  objectType = 'JOBCLASS';
  jobClassList = [];

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (this.data.type) {
        if (this.jobClass.actual) {
          this.saveJSON();
        }
        this.getObject();
      } else {
        this.jobClass = {};
        this.jobClassList = this.data.children;
      }
    }
  }

  ngOnDestroy() {
    if (this.jobClass.name) {
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
      this.jobClass = res;
      this.jobClass.path1 = this.data.path;
      this.jobClass.name = this.data.name;
      this.jobClass.actual = res.configuration;
      this.jobClass.configuration = JSON.parse(res.configuration);
    });
  }

  /** -------------- List View Begin --------------*/
  sort(sort: { key: string; value: string }): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = sort.key;
  }

  add() {
    let _path, name = this.coreService.getName(this.data.children, 'job-class1', 'name', 'job-class');
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
      this.jobClassList = [...this.jobClassList];
      this.dataService.reloadTree.next({add: true});
    });
  }

  copyObject(data) {

  }

  editObject(data) {
    this.data = data;
    this.getObject();
  }
  deleteObject(data) {

  }

  undeleteObject(data) {

  }

  deleteDraft(data) {

  }

  deployObject(data) {

  }

  /** -------------- List View End --------------*/

  private saveJSON() {
    if (this.jobClass.actual !== JSON.stringify(this.jobClass.configuration)) {
      let _path;
      if (this.jobClass.path1 === '/') {
        _path = this.jobClass.path1 + this.jobClass.name;
      } else {
        _path = this.jobClass.path1 + '/' + this.jobClass.name;
      }
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.jobClass.configuration),
        path: _path,
        id: this.jobClass.id,
        objectType: this.objectType
      }).subscribe(res => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    }
  }
}
