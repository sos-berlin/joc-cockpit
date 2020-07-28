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
  @Input() copyObj: any;

  searchKey: string;
  jobClass: any = {};
  isUnique = true;
  objectType = 'JOBCLASS';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.jobClass.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.jobClass = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.jobClass.name) {
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
      this.jobClass = res;
      this.jobClass.path1 = this.data.path;
      this.jobClass.name = this.data.name;
      this.jobClass.actual = res.configuration;
      this.jobClass.configuration = JSON.parse(res.configuration);
    });
  }

  /** -------------- List View Begin --------------*/

  add() {
    const name = this.coreService.getName(this.data.children, 'job-class1', 'name', 'job-class');
    const _path  = this.data.path + (this.data.path === '/' ? '' : '/') + name;
    this.coreService.post('inventory/store', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      configuration: JSON.stringify({maxProcess: 1})
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
    if (this.jobClass.actual !== JSON.stringify(this.jobClass.configuration)) {
      const _path  = this.jobClass.path1 + (this.jobClass.path1 === '/' ? '' : '/') + this.jobClass.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.jobClass.configuration),
        path: _path,
        id: this.jobClass.id,
        objectType: this.objectType
      }).subscribe(res => {

      }, (err) => {
        console.log(err);
      });
    }
  }
}
