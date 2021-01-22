import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-junction',
  templateUrl: './junction.component.html',
  styleUrls: ['./junction.component.css']
})
export class JunctionComponent implements OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;

  junction: any = {};
  objectType = 'JUNCTION';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.junction = {};
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
      this.junction = res;
      this.junction.path1 = this.data.path;
      this.junction.name = this.data.name;
      this.junction.actual = JSON.stringify(res.configuration);
    });
  }

  rename(inValid) {
    if (this.data.id === this.junction.id && this.data.name !== this.junction.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.junction.name;
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
          this.junction.name = this.data.name;
        });
      } else {
        this.junction.name = this.data.name;
      }
    }
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.junction});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.junction});
  }

  saveJSON() {
    if (this.junction.actual !== JSON.stringify(this.junction.configuration)) {
      this.coreService.post('inventory/store', {
        configuration: this.junction.configuration,
        valid: true,
        id: this.junction.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.junction.id === this.data.id) {
          this.junction.actual = JSON.stringify(this.junction.configuration);
          this.junction.deployed = false;
          this.data.deployed = false;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
