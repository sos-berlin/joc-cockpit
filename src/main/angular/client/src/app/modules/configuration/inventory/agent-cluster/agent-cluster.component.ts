import {Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
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

  agentCluster: any = {};
  object: any = {hosts: []};
  searchKey: string;
  filter: any = {sortBy: 'name', reverse: false};
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

  /** -------------- List View Begin --------------*/
  sort(sort: { key: string; value: string }): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = sort.key;
  }

  add() {
    let _path, name = this.coreService.getName(this.data.children, 'agent-cluster1', 'name', 'agent-cluster');
    if (this.data.path === '/') {
      _path = this.data.path + name;
    } else {
      _path = this.data.path + '/' + name;
    }
    let obj: any = {
      type: this.objectType,
      parent: this.data.path,
      path: this.data.path
    };
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
      this.data.children = [...this.data.children];
      this.dataService.reloadTree.next({add: true});
    });
  }

  editObject(data) {
    this.dataService.reloadTree.next({set: data});
  }

  /** -------------- List View End --------------*/

  addCriteria(): void {
    let param = {
      url: ''
    };
    if (this.object.hosts) {
      if (!this.coreService.isLastEntryEmpty(this.object.hosts, 'url', '')) {
        this.object.hosts.push(param);
      }
    }
  }

  removeCriteria(index): void {
    this.object.hosts.splice(index, 1);
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
      this.agentCluster = res;
      this.agentCluster.path1 = this.data.path;
      this.agentCluster.name = this.data.name;
      this.agentCluster.actual = res.configuration;
      this.agentCluster.configuration = JSON.parse(res.configuration);
      this.addCriteria();
    });
  }

  private saveJSON() {
    if (this.agentCluster.actual !== JSON.stringify(this.agentCluster.configuration)) {
      let _path;
      if (this.agentCluster.path1 === '/') {
        _path = this.agentCluster.path1 + this.agentCluster.name;
      } else {
        _path = this.agentCluster.path1 + '/' + this.agentCluster.name;
      }
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.agentCluster.configuration),
        path: _path,
        id: this.agentCluster.id,
        objectType: this.objectType
      }).subscribe(res => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    }
  }
}

