import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-job-class',
  templateUrl: './job-class.component.html',
  styleUrls: ['./job-class.component.css']
})
export class JobClassComponent implements OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;

  jobClass: any = {};
  objectType = 'JOBCLASS';
  priorities = ['idle', 'below normal', 'normal', 'above normal', 'high'];

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.jobClass = {};
      }
    }
  }

  private getObject() {
    this.coreService.post('inventory/read/configuration', {
      id: this.data.id,
    }).subscribe((res: any) => {
      if(res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
      }
      this.jobClass = res;
      this.jobClass.path1 = this.data.path;
      this.jobClass.name = this.data.name;
      this.jobClass.actual = JSON.stringify(res.configuration);
    });
  }

  rename(inValid) {
    if (this.data.id === this.jobClass.id && this.data.name !== this.jobClass.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.jobClass.name;
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
          this.jobClass.name = this.data.name;
        });
      } else {
        this.jobClass.name = this.data.name;
      }
    }
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.jobClass});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.jobClass});
  }

  saveJSON() {
    if (this.jobClass.actual !== JSON.stringify(this.jobClass.configuration)) {
      const _path = this.jobClass.path1 + (this.jobClass.path1 === '/' ? '' : '/') + this.jobClass.name;
      this.coreService.post('inventory/store', {
        configuration: this.jobClass.configuration,
        path: _path,
        valid: !!this.jobClass.configuration.maxProcesses,
        id: this.jobClass.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.jobClass.id === this.data.id) {
          this.jobClass.actual = JSON.stringify(this.jobClass.configuration);
          this.jobClass.valid = res.valid;
          this.jobClass.deployed = false;
          this.data.valid = res.valid;
          this.data.deployed = false;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
