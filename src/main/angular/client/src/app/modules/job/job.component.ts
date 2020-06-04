import {Component, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import * as _ from 'underscore';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.css']
})
export class JobComponent implements OnInit {
  pageView: string;
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  jobs: any = [];
  preferences: any = {};
  permission: any = {};
  jobFilters: any = {};
  job_expand_to: any = {};

  constructor(public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.jobFilters = this.coreService.getResourceTab().calendars;
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
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['JOB']
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res));
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private filteredTreeData(output) {
    if (!_.isEmpty(this.job_expand_to)) {
      this.tree = output;
      if (this.tree.length > 0) {
        this.navigateToPath();
      }
    } else {
      if (_.isEmpty(this.jobFilters.expand_to)) {
        this.tree = output;
        this.jobFilters.expand_to = this.tree;
        this.checkExpand();
      } else {
        this.jobFilters.expand_to = this.coreService.recursiveTreeUpdate(output, this.jobFilters.expand_to);
        this.tree = this.jobFilters.expand_to;
        //this.loadJob(null);
        if (this.tree.length > 0) {
          this.expandTree();
        }
      }
    }
  }

  private navigateToPath() {
    this.jobs = [];
    setTimeout(() => {
      for (let x = 0; x < this.tree.length; x++) {
        this.navigatePath(this.tree[x]);
      }
    }, 10);
  }

  private navigatePath(data) {

  }

  private expandTree() {

  }

  private checkExpand() {

  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  receiveAction($event) {
    if ($event.action === 'NODE') {

    }
  }
}
