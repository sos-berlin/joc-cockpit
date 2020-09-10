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
    this.coreService.post('inventory/read/configuration', {
      id: this.data.id
    }).subscribe((res: any) => {
      this.junction = res;
      this.junction.path1 = this.data.path;
      this.junction.name = this.data.name;
      this.junction.actual = JSON.stringify(res.configuration);
    });
  }

  rename() {
    this.coreService.post('inventory/rename', {
      id: this.data.id,
      name: this.junction.name
    }).subscribe((res) => {
      this.data.name = this.junction.name;
      this.dataService.reloadTree.next({rename: true});
    }, (err) => {
      this.junction.name = this.data.name;
    });
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.junction});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.junction});
  }

  saveJSON() {
    if (this.junction.actual !== JSON.stringify(this.junction.configuration)) {
      const _path = this.junction.path1 + (this.junction.path1 === '/' ? '' : '/') + this.junction.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: this.junction.configuration,
        path: _path,
        valid: true,
        id: this.junction.id,
        objectType: this.objectType
      }).subscribe(res => {
        if (this.junction.id === this.data.id) {
          this.junction.actual = JSON.stringify(this.junction.configuration);
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
