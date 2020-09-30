import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';

// Main Component
@Component({
  selector: 'app-agent-cluster',
  templateUrl: 'agent-cluster.component.html',
  styleUrls: ['./agent-cluster.component.css'],

})
export class AgentClusterComponent implements OnInit, OnDestroy {
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView: any;
  agentClusters: any = [];
  agentsFilters: any = {};
  sideView: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService, public modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.agentsFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.agentsFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private init() {
    this.agentsFilters = this.coreService.getResourceTab().agents;
    this.coreService.getResourceTab().state = 'agent';
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).agent;
    }
    this.initTree(null);
  }

  private initTree(type) {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      types: ['AGENTCLUSTER']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
      if (this.tree.length > 0) {
        this.loadAgents(null);
      }
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private getAgentClassList(obj) {
    let result: any;
    this.coreService.post('jobscheduler/agent_clusters', obj).subscribe(res => {
      this.loading = false;
      result = res;
      result.agentClusters.forEach((value) => {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.agentClusters = result.agentClusters;
    }, () => {
      this.loading = false;
    });
  }

  loadAgents(status) {
    if (status) {
      this.agentsFilters.filter.state = status;
    }
    let obj = {
      folders: [],
      state: this.agentsFilters.filter.state !== 'ALL' ? this.agentsFilters.filter.state : undefined,
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };

    this.agentClusters = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.agentsFilters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getAgentClassList(obj);
  }

  loadAgentsV(data, type) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      folders: [{folder: data.path, recursive: type}],
      state: this.agentsFilters.filter.state !== 'ALL' ? this.agentsFilters.filter.state : undefined,
    };
    this.coreService.post('jobscheduler/agent_clusters', obj).subscribe((res: any) => {
      data.agentClusters = res.agentClusters;
      data.agentClusters.forEach((value) => {
        value.path1 = data.path;
        this.agentClusters.push(value);
      });
      this.loading = false;

    }, () => {
      this.loading = false;

    });
  }

  getAgents(data, recursive) {
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: recursive}],
      type: this.agentsFilters.filter.type !== 'ALL' ? this.agentsFilters.filter.type : undefined,
      jobschedulerId: this.schedulerIds.selected
    };
    this.getAgentClassList(obj);
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  receiveAction($event) {
    this.getAgents($event, $event.action !== 'NODE');
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if ((args[i].eventSnapshots[j].eventType == 'FileBasedActivated' || args[i].eventSnapshots[j].eventType == 'FileBasedRemoved') && args[i].eventSnapshots[j].objectType === 'PROCESSCLASS') {
              this.init();
              break;
            }
          }
        }
        break;
      }
    }
  }

  /** ---------------------------- Action ----------------------------------*/

  sortBy(propertyName) {
    this.agentsFilters.reverse = !this.agentsFilters.reverse;
    this.agentsFilters.filter.sortBy = propertyName.key;
  }

  expandDetails() {
    this.agentClusters.forEach((value) => {
      value.show = true;
    });
  }

  collapseDetails() {
    this.agentClusters.forEach((value) => {
      value.show = false;
    });
  }

  showAgents(cluster) {
    cluster.show = true;
  }

  hideAgents(cluster) {
    cluster.show = false;
  }
}
