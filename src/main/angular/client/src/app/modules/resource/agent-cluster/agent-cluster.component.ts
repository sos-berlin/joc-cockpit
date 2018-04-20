import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {DataService} from '../../../services/data.service';
import {TreeComponent} from "../../../components/tree-navigation/tree.component";

import * as _ from 'underscore';

declare var $;

//Main Component
@Component({
  selector: 'app-agent-cluster',
  templateUrl: 'agent-cluster.component.html',
  styleUrls: ['./agent-cluster.component.css'],

})
export class AgentClusterComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  loading: boolean;
  schedulerIds: any;
  tree: any = [];
  preferences: any;
  permission: any;
  pageView: any;
  agentClusters: any = [];
  agentsFilters: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent) child;

  constructor(private authService: AuthService, public coreService: CoreService, public modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if ((args[i].eventSnapshots[j].eventType == "FileBasedActivated" || args[i].eventSnapshots[j].eventType == "FileBasedRemoved") && args[i].eventSnapshots[j].objectType === "PROCESSCLASS") {
              this.init();
              break;
            }
          }
        }
        break
      }
    }
  }

  ngOnInit() {
    let dom = $('#leftPanel');
    if (dom)
      dom.stickySidebar({
        sidebarTopMargin: 192
      });

    this.init();
    if (dom)
      dom.resizable({
        handles: 'e',
        maxWidth: 450,
        minWidth: 180,
        resize: function () {
          $('#rightPanel').css('margin-left', $('#leftPanel').width() + 20 + 'px')
        }
      });
  }

  private init() {
    this.agentsFilters = this.coreService.getResourceTab().agents;
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    if (this.authService.scheduleIds)
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    if (this.authService.permission)
      this.permission = JSON.parse(this.authService.permission);
    if (localStorage.views)
      this.pageView = JSON.parse(localStorage.views).agent;

    this.initTree(null);
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private initTree(type) {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ["AGENTCLUSTER"]
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res), type);
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private filteredTreeData(output, type) {
    if (type) {
      this.tree = output;
      this.navigateToPath();
    } else {
      if (_.isEmpty(this.agentsFilters.expand_to)) {
        this.tree = output;
        this.agentsFilters.expand_to = this.tree;
        this.checkExpand();
      } else {
        this.agentsFilters.expand_to = this.coreService.recursiveTreeUpdate(output, this.agentsFilters.expand_to);
        this.tree = this.agentsFilters.expand_to;
        this.loadAgents(null);
        this.expandTree();
      }
    }
  }

  private navigateToPath() {
    let self = this;
    this.agentClusters = [];
    setTimeout(function () {
      self.tree.forEach(function (value) {
        self.navigatePath(value);
      });
    }, 10);
  }

  private navigatePath(data) {

  }

  private expandTree() {
    let self = this;
    setTimeout(function () {
      self.tree.forEach(function (data) {
        recursive(data);
      });
    }, 10);

    function recursive(data) {
      if (data.isExpanded) {
        let node = self.child.getNodeById(data.id);
        node.expand();
        if (data.children && data.children.length > 0) {
          data.children.forEach(function (child) {
            recursive(child);
          });
        }
      }
    }
  }

  private checkExpand() {
    let self = this;
    setTimeout(function () {
      const node = self.child.getNodeById(1);
      node.expand();
      node.setActiveAndVisible(true);

      console.log(self.tree)
    }, 10)
  }

  private getExpandTreeForUpdates(data, obj) {
    let self = this;
    if (data.isSelected) {
      obj.folders.push({folder: data.path, recursive: false});
    }
    data.children.forEach(function (value) {
      if (value.isExpanded || value.isSelected)
        self.getExpandTreeForUpdates(value, obj);
    });
  }

  loadAgents(status) {
    if (status) {
      this.agentsFilters.filter.state = status;
    }
    let self = this;
    let obj = {
      folders: [],
      state: this.agentsFilters.filter.state != 'all' ? this.agentsFilters.filter.state : undefined,
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };

    this.agentClusters = [];
    this.loading = true;
    this.tree.forEach(function (value) {
      if (value.isExpanded || value.isSelected)
        self.getExpandTreeForUpdates(value, obj);
    });
    this.getAgentClassList(obj, null);
  }

  loadAgentsV(data, type) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      folders: [{folder: data.path, recursive: type}],
      state: this.agentsFilters.filter.state != 'all' ? this.agentsFilters.filter.state : undefined,
    };
    let result: any;
    this.coreService.post('jobscheduler/agent_clusters', obj).subscribe((res) => {
      result = res;
      data.agentClusters = result.agentClusters;
      data.agentClusters.forEach(function (value) {
        value.path1 = data.path;
        this.agentClusters.push(value);
      });
      this.loading = false;

    }, () => {
      this.loading = false;

    });
  }

  private startTraverseNode(data) {
    let self = this;
    data.isSelected = true;
    data.children.forEach(function (a) {
      self.startTraverseNode(a);
    });
  }

  private getAgentClassList(obj, node) {
    let result: any;
    this.coreService.post('jobscheduler/agent_clusters', obj).subscribe(res => {
      this.loading = false;
      result = res;
      result.agentClusters.forEach(function (value) {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.agentClusters = result.agentClusters;
      if (node) {
        this.startTraverseNode(node.data);
      }
    }, () => {
      this.loading = false;
    });
  }


  expandNode(node): void {
    this.agentClusters = [];
    this.loading = true;

    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      folders: [{folder: node.data.path, recursive: true}],
      type: this.agentsFilters.filter.type != 'ALL' ? this.agentsFilters.filter.type : undefined,
      compact: true
    };
    this.getAgentClassList(obj, node);
  }

  getAgents(data) {
    data.isSelected = true;
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: false}],
      type: this.agentsFilters.filter.type != 'ALL' ? this.agentsFilters.filter.type : undefined,
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };

    this.getAgentClassList(obj, null);
  }

  /** ---------------------------- Action ----------------------------------*/

  sortBy(propertyName) {
    this.agentsFilters.reverse = !this.agentsFilters.reverse;
    this.agentsFilters.filter.sortBy = propertyName;
  }

  expandDetails() {
    this.agentClusters.forEach(function (value) {
      value.show = true;
    });
  }

  collapseDetails() {
    this.agentClusters.forEach(function (value) {
      value.show = false;
    });
  }


  showAgents(cluster) {
    cluster.show = true;
  }

  hideAgents(cluster) {
    cluster.show = false;
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  receiveAction($event) {
    if ($event.action === 'NODE')
      this.getAgents($event.data);
    else
      this.expandNode($event)
  }

}
