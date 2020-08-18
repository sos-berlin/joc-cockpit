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

  rename () {
    this.coreService.post('inventory/rename', {
      id: this.data.id,
      name: this.jobClass.name
    }).subscribe((res) => {
      this.data.name = this.jobClass.name;
      this.dataService.reloadTree.next({rename: true});
    }, (err) => {
      this.jobClass.name = this.data.name;
    });
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.jobClass});
  }

  saveJSON() {
    if (this.jobClass.actual !== JSON.stringify(this.jobClass.configuration)) {
      const _path = this.jobClass.path1 + (this.jobClass.path1 === '/' ? '' : '/') + this.jobClass.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.jobClass.configuration),
        path: _path,
        valide: !!this.jobClass.configuration.maxProcess,
        id: this.jobClass.id,
        objectType: this.objectType
      }).subscribe(res => {
        this.jobClass.actual = JSON.stringify(this.jobClass.configuration);
        this.jobClass.valide = !!this.jobClass.configuration.maxProcess;
        if (this.jobClass.id === this.data.id) {
          this.data.valide = this.jobClass.valide;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
