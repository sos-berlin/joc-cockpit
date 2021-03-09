import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {WorkflowService} from '../../../../services/workflow.service';

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
  @Input() reload: any;
  @Input() isTrash: any;

  junction: any = {};
  lifetime: string;
  objectType = 'JUNCTION';

  constructor(private coreService: CoreService, private workflowService: WorkflowService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.reload) {
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.junction = {};
      }
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
      if (res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
      } else {
        res.configuration = {};
      }
      this.junction = res;
      this.junction.path1 = this.data.path;
      this.junction.name = this.data.name;
      if (res.configuration.lifetime) {
        this.lifetime = this.workflowService.convertDurationToString(res.configuration.lifetime)
      }
      this.junction.actual = JSON.stringify(res.configuration);
    });
  }

  rename(inValid): void {
    if (this.data.id === this.junction.id && this.data.name !== this.junction.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.junction.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe(() => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, () => {
          this.junction.name = this.data.name;
        });
      } else {
        this.junction.name = this.data.name;
      }
    }
  }

  deploy(): void {
    this.dataService.reloadTree.next({deploy: this.junction});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.junction});
  }

  saveJSON(): void {
    if (this.isTrash) {
      return;
    }
    if (this.lifetime) {
      this.junction.configuration.lifetime = this.workflowService.convertStringToDuration(this.lifetime);
    }
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
      });
    }
  }
}
