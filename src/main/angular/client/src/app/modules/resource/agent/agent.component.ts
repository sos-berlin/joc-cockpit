import {Component, inject} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {SearchPipe} from '../../../pipes/core.pipe';
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";

@Component({
  selector: 'app-confirm-node-modal',
  templateUrl: './confirm-node-dialog.html'
})
export class ConfirmNodeModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  agent: any;

  submitted = false;
  display: any;
  required = false;
  comments: any = {};

  lossNode = '';


  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.agent = this.modalData.agent;
    this.lossNode = this.agent.clusterState?.lossNode;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    } else {
      let preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
      this.display = preferences.auditLog;
    }
  }

  onSubmit(): void {
    const request: any = {
      auditLog: {},
      controllerId: this.agent.controllerId,
      agentId: this.agent.agentId
    };
    this.coreService.getAuditLogObj(this.comments, request.auditLog);
    this.coreService.post('agent/cluster/confirm_node_loss', request).subscribe({
      next: () => {
        this.activeModal.close('DONE');
      }, error: () => {
        this.submitted = false;
      }
    });
  }
}

// Main Component
@Component({
  selector: 'app-agent-cluster',
  templateUrl: 'agent.component.html'
})
export class AgentComponent {
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  pageView: any;
  agentClusters: any = [];
  data: any = [];
  selectedAgentId = '';
  searchableProperties = ['agentId', 'agentName', 'state', 'url', '_text'];
  agentsFilters: any = {};
  totalAgents = 0;
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private router: Router,
              private searchPipe: SearchPipe, private dataService: DataService, public modal: NzModalService) {
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
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).agent;
    }
    if (this.schedulerIds.selected) {
      this.loadAgents(null);
    }
  }

  searchInResult(): void {
    this.data = this.agentsFilters.searchText ? this.searchPipe.transform(this.agentClusters, this.agentsFilters.searchText, this.searchableProperties) : this.agentClusters;
    this.totalAgents = 0;
    this.data.forEach((item) => {
      if (item.subagents) {
        this.totalAgents = this.totalAgents + item.subagents.length;
      } else {
        ++this.totalAgents;
      }
    });
    this.data = [...this.data];
  }

  private getAgentClassList(obj): void {
    this.coreService.post('agents', obj).subscribe({
      next: (result: any) => {
        this.getVesrions(result.agents);

        const expandedSet = new Set(this.agentsFilters.expandedObjects || []);

        const updatedAgents = result.agents.map(agent => {
          const agentExpanded = expandedSet.has(agent.agentId);
          const agentRunning = agent.runningTasks > 0;

          // Always keep it open if running
          if (agentExpanded || agentRunning) {
            agent.show = true;
            if (agent.subagents) {
              agent.subagents.forEach(sub => {
                const subExpanded = expandedSet.has(sub.subagentId);
                const subRunning = sub.runningTasks > 0;

                // Keep subagent open if expanded or running
                if (subExpanded || subRunning) {
                  sub.show = true;
                } else {
                  sub.show = false;
                }
              });

              agent.showSubagent = agent.subagents.some(sub => sub.show);
            }
          } else {
            agent.show = false;
            agent.showSubagent = false;
          }

          return agent;
        });

        this.agentClusters = [...updatedAgents];
        this.searchInResult(); // updates `data`
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadAgents(status, flag = false): void {
    if (status) {
      this.agentsFilters.filter.state = status;
    }
    const obj = {
      states: this.agentsFilters.filter.state !== 'ALL' && this.agentsFilters.filter.state ? [this.agentsFilters.filter.state] : undefined,
      controllerId: this.schedulerIds.selected,
      compact: this.agentsFilters.expandedObjects.length === 0,
      onlyVisibleAgents: true
    };

    if (!flag) {
      this.agentClusters = [];
      this.loading = true;
    }
    this.getAgentClassList(obj);
  }

  private getVesrions(agents: any): void {
    this.coreService.post('joc/versions', {controllerIds: [this.schedulerIds.selected]}).subscribe({
      next: res => {

        agents.forEach((agent: any) => {

          for (let i = 0; i < res.agentVersions.length; i++) {
            if (agent.agentId === res.agentVersions[i].agentId && !res.agentVersions[i].subagentId) {
              agent.compatibility = res.agentVersions[i].compatibility;
              res.agentVersions.splice(i, 1);
              if (!agent.subagents) {
                break;
              }
            }
            if (agent.subagents) {
              for (let j = 0; j < agent.subagents.length; j++) {
                if (agent.subagents[j].subagentId === res.agentVersions[i].subagentId) {
                  agent.subagents[j].compatibility = res.agentVersions[i].compatibility;
                  break;
                }
              }
            }
          }
        })

      }
    });
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event): void {
    this.pageView = $event;
    if (this.selectedAgentId) {
      this.backToList();
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentAdded' || args.eventSnapshots[j].eventType === 'AgentUpdated' || args.eventSnapshots[j].eventType === 'AgentInventoryUpdated' ||
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

  pageIndexChange($event: number): void {
    this.agentsFilters.currentPage = $event;
  }

  pageSizeChange($event: number): void {
    this.agentsFilters.entryPerPage = $event;
  }

  sort(propertyName, isSubagent?): void {
    if (isSubagent) {
      isSubagent.reverse = !isSubagent.reverse;
      isSubagent.sortBy = propertyName;
    } else {
      this.agentsFilters.reverse = !this.agentsFilters.reverse;
      this.agentsFilters.filter.sortBy = propertyName;
    }
  }

  expandDetails(): void {
    const ids = [];
    this.data.forEach((value) => {
      if (value.subagents) {
        value.showSubagent = true;
      } else {
        value.show = true;
        ids.push(value.agentId);
      }
      value.loading = true;
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
      if (value.subagents) {
        value.showSubagent = false;
      } else {
        value.show = false;
      }
    });
  }

  showSubagentList(cluster): void {
    if (cluster.subagents) {
      this.selectedAgentId = cluster.agentId;
      this.data = cluster.subagents;
    }
  }

  backToList(): void {
    this.selectedAgentId = '';
    this.searchInResult();
  }

  switchOver(cluster): void {
    const obj = {
      controllerId: this.schedulerIds.selected,
      agentId: cluster.agentId,
      auditLog: {}
    };

    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        name: obj.agentId,
        operation: 'Switch Over'
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
          url: 'agent/cluster/switchover',
          obj,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });

    } else {
      this.coreService.post('agent/cluster/switchover', obj).subscribe();
    }
  }

  confirmNodeLoss(agent: any): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmNodeModalComponent,
      nzData: {
        agent,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  showAgents(cluster, isSubagent = false): void {
    cluster.show = true;
    this.agentsFilters.expandedObjects.push(isSubagent ? cluster.subagentId : cluster.agentId);
    cluster.loading = true;
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, agentIds: [cluster.agentId]}).subscribe({
      next: (result: any) => {
        if (isSubagent) {
          for (let i in result.agents[0].subagents) {
            if (cluster.subagentId == result.agents[0].subagents[i].subagentId) {
              cluster.orders = result.agents[0].subagents[i].orders;
              break
            }
          }
        } else {
          cluster.orders = result.agents[0].orders;
        }
        cluster.loading = false;
      }, error: () => cluster.loading = false
    });
  }

  hideAgents(cluster, isSubagent = false): void {
    this.agentsFilters.expandedObjects.splice(this.agentsFilters.expandedObjects.indexOf(isSubagent ? cluster.subagentId : cluster.agentId), 1);
    cluster.show = false;
  }

  showSubagents(cluster): void {
    cluster.showSubagent = true;
    if (!cluster.sortBy) {
      cluster.sortBy = 'subagentId';
      cluster.reverse = false;
    }
    this.agentsFilters.expandedObjects.push(cluster.agentId);
  }

  hideSubagents(cluster): void {
    this.agentsFilters.expandedObjects.splice(this.agentsFilters.expandedObjects.indexOf(cluster.agentId), 1);
    cluster.showSubagent = false;
  }

  navToController(agent, cluster): void {
    if (this.permission.joc && this.permission.joc.administration.controllers.view) {
      if (cluster) {
        this.coreService.preferences.controllers.clear();
        this.coreService.preferences.controllers.add(cluster.controllerId);
        this.coreService.preferences.controllers.add(cluster.controllerId + (cluster.subagents ? '$standalone$' : '$cluster$'));
        this.coreService.preferences.controllers.add(cluster.agentId);
        this.router.navigate(['/controllers']).then();
      } else {
        this.coreService.preferences.controllers.clear();
        this.coreService.preferences.controllers.add(agent.controllerId);
        this.coreService.preferences.controllers.add(agent.controllerId + (agent.subagents ? '$standalone$' : '$cluster$'));
        this.router.navigate(['/controllers']).then();
      }
    }
  }
}
