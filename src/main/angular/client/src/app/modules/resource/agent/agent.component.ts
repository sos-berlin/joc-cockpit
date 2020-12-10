import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../../services/data.service';

// Main Component
@Component({
  selector: 'app-agent-cluster',
  templateUrl: 'agent.component.html',
  styleUrls: ['./agent.component.css'],

})
export class AgentComponent implements OnInit, OnDestroy {
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  pageView: any;
  agentClusters: any = [];
  agentsFilters: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, public modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
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
    this.loadAgents(null);
  }


  private getAgentClassList(obj) {
    this.loading = false;
    this.coreService.post('agents', obj).subscribe((result: any) => {
      this.loading = false;
      this.agentClusters = result.agents;
    }, () => {
      this.loading = false;
    });
  }

  loadAgents(status) {
    if (status) {
      this.agentsFilters.filter.state = status;
    }
    const obj = {
      states: this.agentsFilters.filter.state !== 'ALL' ? [this.agentsFilters.filter.state] : undefined,
      controllerId: this.schedulerIds.selected,
      compact: true,
      onlyEnabledAgents: true
    };

    this.agentClusters = [];
    this.loading = true;
    this.getAgentClassList(obj);
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args.eventSnapshots[j].eventType === 'AgentAdded' || args.eventSnapshots[j].eventType === 'AgentUpdated' ||
              args[i].eventSnapshots[j].eventType == 'JobStateChanged') {
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

  pageIndexChange($event) {
    this.agentsFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.agentsFilters.entryPerPage = $event;
  }

  sort(propertyName) {
    this.agentsFilters.reverse = !this.agentsFilters.reverse;
    this.agentsFilters.filter.sortBy = propertyName;
  }

  expandDetails() {
    const ids = [];
    this.agentClusters.forEach((value) => {
      value.show = true;
      value.loading = true;
      ids.push(value.agentId);
    });
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, agents: ids}).subscribe((result: any) => {
      this.agentClusters.forEach((value) => {
        for (let i = 0; i < result.agents.length; i++) {
          if (value.agentId === result.agents[i].agentId) {
            value.orders = result.agents[i].orders;
            result.agents.splice(i, 1);
            break;
          }
        }
        value.loading = false;
      });
    }, () => {
      this.loading = false;
    });
  }

  collapseDetails() {
    this.agentClusters.forEach((value) => {
      value.show = false;
    });
  }

  showAgents(cluster) {
    cluster.show = true;
    cluster.loading = true;
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, agents:[cluster.agentId]}).subscribe((result: any) => {
      cluster.orders = result.agents[0].orders;
      cluster.loading = false;
    }, () => {
      cluster.loading = false;
    });
  }

  hideAgents(cluster) {
    cluster.show = false;
  }
}
