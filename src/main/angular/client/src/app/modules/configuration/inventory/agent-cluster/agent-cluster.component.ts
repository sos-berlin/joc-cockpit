import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-agent-cluster',
  templateUrl: './agent-cluster.component.html',
})
export class AgentClusterComponent implements OnChanges {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;

  agentCluster: any = {};
  objectType = 'AGENTCLUSTER';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.agentCluster = {};
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
        this.agentCluster = res;
        this.agentCluster.path1 = this.data.path;
        this.agentCluster.name = this.data.name;
        this.agentCluster.actual = JSON.stringify(res.configuration);
      }
    });
  }

  rename(inValid) {
    if (!inValid) {
      const data = this.coreService.clone(this.data);
      const name = this.agentCluster.name;
      this.coreService.post('inventory/rename', {
        id: data.id,
        name: name
      }).subscribe((res) => {
        if (data.id === this.data.id) {
          this.data.name = name;
        }
        data.name = name;
        this.dataService.reloadTree.next({rename: data});
      }, (err) => {
        this.agentCluster.name = this.data.name;
      });
    } else {
      this.agentCluster.name = this.data.name;
    }
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.agentCluster});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.agentCluster});
  }

  saveJSON() {
    if (this.agentCluster.actual !== JSON.stringify(this.agentCluster.configuration)) {
      const _path = this.agentCluster.path1 + (this.agentCluster.path1 === '/' ? '' : '/') + this.agentCluster.name;
      this.coreService.post('inventory/store', {
        configuration: this.agentCluster.configuration,
        path: _path,
        valid: !!this.agentCluster.configuration.uri,
        id: this.agentCluster.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.agentCluster.id === this.data.id) {
          this.agentCluster.actual = JSON.stringify(this.agentCluster.configuration);
          this.agentCluster.deployed = false;
          this.agentCluster.valid = res.valid;
          this.data.deployed = false;
          this.data.valid = res.valid;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}

