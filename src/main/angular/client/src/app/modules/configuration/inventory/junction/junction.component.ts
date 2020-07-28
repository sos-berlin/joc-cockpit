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
  @Input() copyObj: any;

  junction: any = {};
  searchKey: string;
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
    const _path  = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
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

  add() {
    const name = this.coreService.getName(this.data.children, 'junction1', 'name', 'junction');
    const _path  = this.data.path + (this.data.path === '/' ? '' : '/') + name;
    this.coreService.post('inventory/store', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      configuration: JSON.stringify({lifetime:60})
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
    if (this.junction.actual !== JSON.stringify(this.junction.configuration)) {
      const _path  = this.junction.path1 + (this.junction.path1 === '/' ? '' : '/') + this.junction.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.junction.configuration),
        path: _path,
        id: this.junction.id,
        objectType: this.objectType
      }).subscribe(res => {

      }, (err) => {
        console.log(err);
      });
    }
  }
}
