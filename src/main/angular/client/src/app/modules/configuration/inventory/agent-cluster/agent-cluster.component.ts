import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-agent-cluster',
  templateUrl: './agent-cluster.component.html',
})
export class AgentClusterComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;

  agentCluster: any = {};
  isUnique = true;
  objectType = 'AGENTCLUSTER';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.agentCluster.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.agentCluster = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.agentCluster.name) {
      this.saveJSON();
    }
  }

  addCriteria(): void {
    let param = {
      url: ''
    };
    if (this.agentCluster.configuration.hosts) {
      if (!this.coreService.isLastEntryEmpty(this.agentCluster.configuration.hosts, 'url', '')) {
        this.agentCluster.configuration.hosts.push(param);
      }
    }
  }

  removeCriteria(index): void {
    this.agentCluster.configuration.hosts.splice(index, 1);
    this.saveJSON();
  }

  private getObject() {
    this.coreService.post('inventory/read/configuration', {
      id: this.data.id,
    }).subscribe((res: any) => {
      if (!res.configuration) {
        res.configuration = {};
      }
      this.agentCluster = res;
      this.agentCluster.path1 = this.data.path;
      this.agentCluster.name = this.data.name;
      this.agentCluster.actual = JSON.stringify(res.configuration);
    });
  }

  rename() {
    this.coreService.post('inventory/rename', {
      id: this.data.id,
      name: this.agentCluster.name
    }).subscribe((res) => {
      this.data.name = this.agentCluster.name;
      this.dataService.reloadTree.next({rename: true});
    }, (err) => {
      this.agentCluster.name = this.data.name;
    });
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.agentCluster});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.agentCluster});
  }

  saveJSON() {
    if (this.agentCluster.actual !== JSON.stringify(this.agentCluster.configuration)) {
      let isValid = false;
      if (this.agentCluster.configuration.uri) {
        isValid = true;
      }
      const _path = this.agentCluster.path1 + (this.agentCluster.path1 === '/' ? '' : '/') + this.agentCluster.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: this.agentCluster.configuration,
        path: _path,
        valid: isValid,
        id: this.agentCluster.id,
        objectType: this.objectType
      }).subscribe(res => {
        if (this.agentCluster.id === this.data.id) {
          this.agentCluster.actual = JSON.stringify(this.agentCluster.configuration);
          this.agentCluster.valid = isValid;
          this.data.valid = isValid;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}

