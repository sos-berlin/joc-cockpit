import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {TreeComponent} from '../../components/tree-navigation/tree.component';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.css']
})
export class JobComponent implements OnInit, OnDestroy {
  pageView: string;
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  jobs: any = [];
  preferences: any = {};
  permission: any = {};
  jobFilters: any = {};
  sideView: any = {};
  @ViewChild(TreeComponent, {static: false}) child;

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit() {
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.jobFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.jobFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
  }

  private init() {
    this.jobFilters = this.coreService.getJobTab();
    this.coreService.getResourceTab().state = 'calendars';
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).calendar;
    }
    this.initTree();
  }

  initTree() {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      compact: true,
      types: ['JOB']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  receiveAction($event) {
    if ($event.action === 'NODE') {

    }
  }
}
