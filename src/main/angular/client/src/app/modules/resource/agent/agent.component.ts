import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {SearchPipe} from '../../../pipes/core.pipe';

// Main Component
@Component({
  selector: 'app-agent-cluster',
  templateUrl: 'agent.component.html'
})
export class AgentComponent implements OnInit, OnDestroy {
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  pageView: any;
  agentClusters: any = [];
  data: any = [];
  searchableProperties = ['agentId', 'agentName', 'state', 'url', '_text'];
  agentsFilters: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private router: Router,
              private searchPipe: SearchPipe, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private init(): void {
    this.agentsFilters = this.coreService.getResourceTab().agents;
    if (!this.agentsFilters.expandedObjects) {
      this.agentsFilters.expandedObjects = [];
    }
    this.coreService.getResourceTab().state = 'agent';
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).agent;
    }
    if (this.schedulerIds.selected) {
      this.loadAgents(null);
    }
  }

  searchInResult(): void {
    this.data = this.agentsFilters.searchText ? this.searchPipe.transform(this.agentClusters, this.agentsFilters.searchText, this.searchableProperties) : this.agentClusters;
    this.data = [...this.data];
  }

  private getAgentClassList(obj): void {
    this.coreService.post('agents', obj).subscribe({
      next: (result: any) => {
        if (this.agentsFilters.expandedObjects && this.agentsFilters.expandedObjects.length > 0) {
          result.agents.forEach((value) => {
            const index = this.agentsFilters.expandedObjects.indexOf(value.agentId);
            if (index > -1) {
              value.show = true;
              this.agentsFilters.expandedObjects.slice(index, 1);
            }
          });
        }
        this.loading = false;
        this.agentClusters = result.agents;
        this.searchInResult();
      }, error: () => this.loading = false
    });
  }

  loadAgents(status, flag = false): void {
    if (status) {
      this.agentsFilters.filter.state = status;
    }
    const obj = {
      states: this.agentsFilters.filter.state !== 'ALL' ? [this.agentsFilters.filter.state] : undefined,
      controllerId: this.schedulerIds.selected,
      compact: this.agentsFilters.expandedObjects.length === 0,
      onlyEnabledAgents: true
    };

    if (!flag) {
      this.agentClusters = [];
      this.loading = true;
    }
    this.getAgentClassList(obj);
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event): void {
    this.pageView = $event;
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentAdded' || args.eventSnapshots[j].eventType === 'AgentUpdated' ||
          args.eventSnapshots[j].eventType === 'JobStateChanged' || args.eventSnapshots[j].eventType === 'AgentStateChanged' ||
          args.eventSnapshots[j].eventType === 'ProxyCoupled' ||
          args.eventSnapshots[j].eventType === 'ProxyDecoupled') {
          this.loadAgents(null, true);
          break;
        }
      }
    }
  }

  /* ---------------------------- Action ----------------------------------*/

  pageIndexChange($event): void {
    this.agentsFilters.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.agentsFilters.entryPerPage = $event;
  }

  sort(propertyName): void {
    this.agentsFilters.reverse = !this.agentsFilters.reverse;
    this.agentsFilters.filter.sortBy = propertyName;
  }

  expandDetails(): void {
    const ids = [];
    this.data.forEach((value) => {
      value.show = true;
      value.loading = true;
      ids.push(value.agentId);
      this.agentsFilters.expandedObjects = ids;
    });
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, agents: ids}).subscribe({
      next: (result: any) => {
        this.data.forEach((value) => {
          value.loading = false
          for (let i = 0; i < result.agents.length; i++) {
            if (value.agentId === result.agents[i].agentId) {
              value.orders = result.agents[i].orders;
              result.agents.splice(i, 1);
              break;
            }
          }
        });
      }, error: () => this.data.forEach((value) => value.loading = false)
    });
  }

  collapseDetails(): void {
    this.agentsFilters.expandedObjects = [];
    this.data.forEach((value) => {
      value.show = false;
    });
  }

  showAgents(cluster): void {
    cluster.show = true;
    this.agentsFilters.expandedObjects.push(cluster.agentId);
    cluster.loading = true;
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, agentIds: [cluster.agentId]}).subscribe({
      next: (result: any) => {
        cluster.orders = result.agents[0].orders;
        cluster.loading = false;
      }, error: () => cluster.loading = false
    });
  }

  hideAgents(cluster): void {
    this.agentsFilters.expandedObjects.splice(this.agentsFilters.expandedObjects.indexOf(cluster.agentId), 1);
    cluster.show = false;
  }

  navToController(agent): void {
    if (this.permission.joc && this.permission.joc.administration.controllers.view) {
      this.coreService.preferences.isFirst = false;
      this.coreService.preferences.controllers.clear();
      this.coreService.preferences.controllers.add(agent.controllerId);
      this.router.navigate(['/controllers']);
    }
  }
}
